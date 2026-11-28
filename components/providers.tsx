"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { applyToChallenge, confirmApplication, rejectApplication } from "@/domain/applications";
import { cancelChallenge } from "@/domain/cancellation";
import {
  requestClosure,
  startChallenge,
  submitEvidence,
  validateClosure,
} from "@/domain/closure";
import { publishChallenge } from "@/domain/publish";
import { seedApplications, seedChallenges, seedPeople } from "@/domain/seed";
import type {
  Application,
  Challenge,
  Evidence,
  Notice,
  Person,
  TimeWindow,
} from "@/domain/types";

const KEY = "impulsos-local-v1";

export type Tone = "ok" | "warn" | "err";

export type AppState = {
  people: Person[];
  challenges: Challenge[];
  applications: Application[];
  evidences: Evidence[];
  notices: Notice[];
  activePersonId: string;
  message: { tone: Tone; text: string } | null;
};

type PublishInput = {
  title: string;
  summary: string;
  neighborhood: string;
  skills: string[];
  interests: string[];
  schedule: TimeWindow;
  spots: number;
  closingCriteria: string;
};

type AppApi = AppState & {
  ready: boolean;
  active: Person;
  setActive: (id: string) => void;
  reset: () => void;
  updateProfile: (patch: {
    headline: string;
    skills: string[];
    interests: string[];
    availability: TimeWindow[];
  }) => void;
  publish: (input: PublishInput) => true | string;
  apply: (challengeId: string, scheduleAcknowledged?: boolean) => void;
  confirm: (applicationId: string) => void;
  reject: (applicationId: string) => void;
  start: (challengeId: string) => void;
  deliverEvidence: (challengeId: string, note: string) => void;
  askClosure: (challengeId: string) => void;
  closeChallenge: (challengeId: string) => void;
  cancel: (challengeId: string) => void;
};

const AppContext = createContext<AppApi | null>(null);

function initialState(): AppState {
  return {
    people: structuredClone(seedPeople),
    challenges: structuredClone(seedChallenges),
    applications: structuredClone(seedApplications),
    evidences: [],
    notices: [],
    activePersonId: "vol-camila",
    message: null,
  };
}

function nid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function Providers({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        if (parsed.people && parsed.challenges && parsed.applications) {
          setState({ ...initialState(), ...parsed, message: null });
        }
      }
    } catch {
      setState(initialState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify({ ...state, message: null }));
  }, [ready, state]);

  const active =
    state.people.find((person) => person.id === state.activePersonId) ?? state.people[0];

  const api: AppApi = {
    ...state,
    ready,
    active,
    setActive: (id) => setState((current) => ({ ...current, activePersonId: id, message: null })),
    reset: () => {
      localStorage.removeItem(KEY);
      setState(initialState());
    },
    updateProfile: (patch) => {
      setState((current) => ({
        ...current,
        people: current.people.map((person) =>
          person.id === current.activePersonId ? { ...person, ...patch } : person,
        ),
        message: { tone: "ok", text: "Perfil actualizado en esta demostración." },
      }));
    },
    publish: (input) => {
      const actor = state.people.find((person) => person.id === state.activePersonId);
      if (!actor) return false;
      const result = publishChallenge({ ...input, id: nid("rt"), actor });
      if (!result.ok) {
        setState((current) => ({ ...current, message: { tone: "err", text: result.error } }));
        return result.error;
      }
      const challenge = result.value;
      setState((current) => ({
        ...current,
        challenges: [challenge, ...current.challenges.filter((item) => item.id !== challenge.id)],
        message: {
          tone: "ok",
          text: `Publicaste «${challenge.title}». Sigue abierto: nadie quedó inscrito al crearlo.`,
        },
      }));
      return true;
    },
    apply: (challengeId, scheduleAcknowledged = false) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = applyToChallenge({
          id: nid("app"),
          challenge: reto,
          volunteer: actor,
          applications: current.applications,
          now: new Date().toISOString(),
          scheduleAcknowledged,
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        const warning = result.value.scheduleWarning;
        return {
          ...current,
          applications: [...current.applications, result.value],
          message: {
            tone: warning ? "warn" : "ok",
            text: warning
              ? `Postulación enviada. Sigue pendiente, sin confirmar. ${warning}`
              : "Postulación enviada. Sigue pendiente: el organizador tiene que confirmarla. La coincidencia no te inscribió.",
          },
        };
      });
    },
    confirm: (applicationId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const application = current.applications.find((item) => item.id === applicationId);
        const reto = current.challenges.find((item) => item.id === application?.challengeId);
        if (!actor || !application || !reto) return current;
        const result = confirmApplication({
          actor,
          challenge: reto,
          application,
          applications: current.applications,
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        const volunteer = current.people.find((person) => person.id === application.volunteerId);
        return {
          ...current,
          applications: current.applications.map((item) =>
            item.id === applicationId ? result.value : item,
          ),
          message: {
            tone: result.value.scheduleWarning ? "warn" : "ok",
            text: result.value.scheduleWarning
              ? `Confirmaste a ${volunteer?.name ?? "la persona"} pese al aviso de horario. ${result.value.scheduleWarning}`
              : `Confirmaste a ${volunteer?.name ?? "la persona"}. El cupo queda ocupado solo con esta confirmación.`,
          },
        };
      });
    },
    reject: (applicationId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const application = current.applications.find((item) => item.id === applicationId);
        const reto = current.challenges.find((item) => item.id === application?.challengeId);
        if (!actor || !application || !reto) return current;
        const result = rejectApplication({ actor, challenge: reto, application });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        return {
          ...current,
          applications: current.applications.map((item) =>
            item.id === applicationId ? result.value : item,
          ),
          message: { tone: "ok", text: "Postulación rechazada. No ocupa cupo." },
        };
      });
    },
    start: (challengeId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = startChallenge({
          actor,
          challenge: reto,
          applications: current.applications,
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        return {
          ...current,
          challenges: current.challenges.map((item) =>
            item.id === challengeId ? result.value : item,
          ),
          message: {
            tone: "ok",
            text: "El reto está en curso. Las personas confirmadas ya pueden entregar evidencia.",
          },
        };
      });
    },
    deliverEvidence: (challengeId, note) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = submitEvidence({
          id: nid("ev"),
          actor,
          challenge: reto,
          applications: current.applications,
          evidences: current.evidences,
          note,
          now: new Date().toISOString(),
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        return {
          ...current,
          evidences: [...current.evidences, result.value],
          message: {
            tone: "ok",
            text: "Evidencia entregada. El reto no se cerró: falta la validación del organizador.",
          },
        };
      });
    },
    askClosure: (challengeId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = requestClosure({
          actor,
          challenge: reto,
          applications: current.applications,
          evidences: current.evidences,
          people: current.people,
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        return {
          ...current,
          challenges: current.challenges.map((item) =>
            item.id === challengeId ? result.value : item,
          ),
          message: {
            tone: "ok",
            text: "El reto pasó a cierre. Validarlo es otro paso y solo lo puede hacer su organizador.",
          },
        };
      });
    },
    closeChallenge: (challengeId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = validateClosure({
          actor,
          challenge: reto,
          applications: current.applications,
          evidences: current.evidences,
          people: current.people,
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        return {
          ...current,
          challenges: current.challenges.map((item) =>
            item.id === challengeId ? result.value : item,
          ),
          message: { tone: "ok", text: "Cierre validado por el organizador del reto." },
        };
      });
    },
    cancel: (challengeId) => {
      setState((current) => {
        const actor = current.people.find((person) => person.id === current.activePersonId);
        const reto = current.challenges.find((item) => item.id === challengeId);
        if (!actor || !reto) return current;
        const result = cancelChallenge({
          actor,
          challenge: reto,
          challenges: current.challenges,
          applications: current.applications,
          people: current.people,
          noticeId: (volunteerId) => nid(`notice-${volunteerId}`),
        });
        if (!result.ok) return { ...current, message: { tone: "err", text: result.error } };
        const offered = result.value.notices.reduce(
          (sum, notice) => sum + notice.alternatives.length,
          0,
        );
        return {
          ...current,
          challenges: result.value.challenges,
          applications: result.value.applications,
          notices: [...result.value.notices, ...current.notices],
          message: {
            tone: "ok",
            text:
              offered > 0
                ? "Reto cancelado. Se ofrecieron alternativas y no se inscribió a nadie."
                : "Reto cancelado. No se creó ninguna postulación nueva.",
          },
        };
      });
    },
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp se usa dentro de Providers");
  return context;
}
