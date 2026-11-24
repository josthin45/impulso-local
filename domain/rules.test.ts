import { describe, expect, it } from "vitest";
import { applyToChallenge, confirmApplication } from "./applications";
import { cancelChallenge } from "./cancellation";
import { requestClosure, startChallenge, submitEvidence, validateClosure } from "./closure";
import { publishChallenge } from "./publish";
import { recommend } from "./recommendations";
import { scheduleWarning } from "./schedule";
import { seedApplications, seedChallenges, seedPeople } from "./seed";
import { canTransition } from "./transitions";
import type { Application, Challenge, Evidence, Person } from "./types";

const person = (id: string) => seedPeople.find((item) => item.id === id) as Person;
const challenge = (id: string) =>
  seedChallenges.find((item) => item.id === id) as Challenge;

const NOW = "2026-11-23T20:00:00-05:00";

describe("recomendación", () => {
  it("una recomendación no crea ni confirma una postulación", () => {
    const before = seedApplications.map((item) => ({ ...item }));
    const camila = person("vol-camila");
    const recommendations = recommend(camila, seedChallenges, seedApplications);

    expect(seedApplications).toEqual(before);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((item) => item.enrolled === false)).toBe(true);
    expect(seedApplications.some((item) => item.volunteerId === "vol-camila")).toBe(false);

    const club = recommendations.find((item) => item.challengeId === "rt-lectura");
    expect(club).toBeTruthy();
    expect(club?.reasons.join(" ")).toMatch(/no crea una postulación/i);
    expect(club?.reasons.join(" ")).toMatch(/educación/);
    expect(club?.score).toBeGreaterThan(
      recommendations.find((item) => item.challengeId === "rt-biblioteca")?.score ?? 100,
    );
  });

  it("explica un horario que no coincide y no recomienda sin habilidad", () => {
    const luis = person("vol-luis");
    const recommendations = recommend(luis, seedChallenges, seedApplications);
    const comedor = recommendations.find((item) => item.challengeId === "rt-comedor");
    const club = recommendations.find((item) => item.challengeId === "rt-lectura");

    expect(comedor?.scheduleFit).toBe("incompatible");
    expect(comedor?.reasons.join(" ")).toMatch(/no cubre/i);
    expect(club).toBeUndefined();
  });
});

describe("postulación, cupos y horario", () => {
  it("la postulación queda pendiente aunque el horario sea compatible", () => {
    const result = applyToChallenge({
      id: "app-camila-lectura",
      challenge: challenge("rt-lectura"),
      volunteer: person("vol-camila"),
      applications: seedApplications,
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("postulada");
    expect(result.value.scheduleWarning).toBeNull();
  });

  it("un horario incompatible advierte y no bloquea la postulación", () => {
    const luis = person("vol-luis");
    const lectura = challenge("rt-lectura");
    const warning = scheduleWarning(luis.availability, lectura.schedule);
    expect(warning).toMatch(/no cubre/i);

    const result = applyToChallenge({
      id: "app-luis-lectura",
      challenge: lectura,
      volunteer: luis,
      applications: [],
      now: NOW,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe("postulada");
    expect(result.value.scheduleWarning).toMatch(/no cubre/i);
  });

  it("no confirma si los cupos ya están llenos", () => {
    const lectura = challenge("rt-lectura");
    const camilaApp: Application = {
      id: "app-camila",
      challengeId: lectura.id,
      volunteerId: "vol-camila",
      status: "confirmada",
      scheduleWarning: null,
      createdAt: NOW,
    };
    const luisApp: Application = {
      id: "app-luis",
      challengeId: lectura.id,
      volunteerId: "vol-luis",
      status: "postulada",
      scheduleWarning: "aviso",
      createdAt: NOW,
    };
    const result = confirmApplication({
      actor: person("org-mariana"),
      challenge: lectura,
      application: luisApp,
      applications: [camilaApp, luisApp],
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/No quedan cupos/);
    expect(luisApp.status).toBe("postulada");
  });

  it("un reto cerrado ya no admite confirmaciones", () => {
    const application: Application = {
      id: "app-luis",
      challengeId: "rt-lectura",
      volunteerId: "vol-luis",
      status: "postulada",
      scheduleWarning: "aviso",
      createdAt: NOW,
    };
    const result = confirmApplication({
      actor: person("org-mariana"),
      challenge: { ...challenge("rt-lectura"), status: "cerrado", spots: 2 },
      application,
      applications: [application],
    });
    expect(result.ok).toBe(false);
    expect(application.status).toBe("postulada");
  });

  it("otro organizador no confirma la postulación", () => {
    const application: Application = {
      id: "app-camila",
      challengeId: "rt-lectura",
      volunteerId: "vol-camila",
      status: "postulada",
      scheduleWarning: null,
      createdAt: NOW,
    };
    const result = confirmApplication({
      actor: person("org-rosa"),
      challenge: challenge("rt-lectura"),
      application,
      applications: [application],
    });
    expect(result.ok).toBe(false);
    expect(application.status).toBe("postulada");
  });
});

describe("cierre y permisos", () => {
  const lectura = (): Challenge => ({ ...challenge("rt-lectura"), status: "en_curso" });
  const confirmed: Application = {
    id: "app-camila",
    challengeId: "rt-lectura",
    volunteerId: "vol-camila",
    status: "confirmada",
    scheduleWarning: null,
    createdAt: NOW,
  };

  it("entregar evidencia no cierra el reto", () => {
    const current = lectura();
    const result = submitEvidence({
      id: "ev-1",
      actor: person("vol-camila"),
      challenge: current,
      applications: [confirmed],
      evidences: [],
      note: "Leímos El sauce de la esquina con ocho niños.",
      now: NOW,
    });
    expect(result.ok).toBe(true);
    expect(current.status).toBe("en_curso");
  });

  it("un voluntario no puede validar el cierre", () => {
    const result = validateClosure({
      actor: person("vol-camila"),
      challenge: { ...lectura(), status: "en_cierre" },
      applications: [confirmed],
      evidences: [
        {
          id: "ev-1",
          challengeId: "rt-lectura",
          volunteerId: "vol-camila",
          note: "Nota del cuento.",
          submittedAt: NOW,
        },
      ],
      people: seedPeople,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Solo el organizador del reto puede validar el cierre/);
  });

  it("otro organizador no puede validar el cierre", () => {
    const result = validateClosure({
      actor: person("org-rosa"),
      challenge: { ...lectura(), status: "en_cierre" },
      applications: [confirmed],
      evidences: [],
      people: seedPeople,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Solo el organizador de este reto/);
  });

  it("el organizador del reto valida el cierre cuando hay evidencia", () => {
    const evidence: Evidence = {
      id: "ev-1",
      challengeId: "rt-lectura",
      volunteerId: "vol-camila",
      note: "Nota del cuento y de los niños.",
      submittedAt: NOW,
    };
    const ready = requestClosure({
      actor: person("org-mariana"),
      challenge: lectura(),
      applications: [confirmed],
      evidences: [evidence],
      people: seedPeople,
    });
    expect(ready.ok).toBe(true);
    if (!ready.ok) return;
    expect(ready.value.status).toBe("en_cierre");

    const closed = validateClosure({
      actor: person("org-mariana"),
      challenge: ready.value,
      applications: [confirmed],
      evidences: [evidence],
      people: seedPeople,
    });
    expect(closed.ok).toBe(true);
    if (!closed.ok) return;
    expect(closed.value.status).toBe("cerrado");
  });
});

describe("cancelación", () => {
  it("cancelar ofrece alternativas y no inscribe a nadie", () => {
    const beforeIds = seedApplications.map((item) => item.id);
    const result = cancelChallenge({
      actor: person("org-hector"),
      challenge: challenge("rt-mapa"),
      challenges: seedChallenges,
      applications: seedApplications,
      people: seedPeople,
      noticeId: (volunteerId) => `notice-${volunteerId}`,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.challenge.status).toBe("cancelado");
    expect(result.value.applications).toHaveLength(beforeIds.length);
    expect(result.value.applications.map((item) => item.id)).toEqual(beforeIds);
    expect(result.value.applications[0]?.status).toBe("liberada");
    expect(
      result.value.applications.some(
        (item) => item.challengeId === "rt-mural" || item.status === "confirmada",
      ),
    ).toBe(false);

    const notice = result.value.notices.find((item) => item.volunteerId === "vol-ana");
    expect(notice?.alternatives.some((item) => item.challengeId === "rt-mural")).toBe(true);
    expect(notice?.alternatives.every((item) => item.enrolled === false)).toBe(true);
  });
});

describe("transiciones y publicación", () => {
  it("no se puede pasar de abierto a cerrado sin las transiciones intermedias", () => {
    expect(canTransition("abierto", "cerrado")).toBe(false);
    expect(canTransition("abierto", "en_curso")).toBe(true);
    expect(canTransition("en_curso", "en_cierre")).toBe(true);
    expect(canTransition("en_cierre", "cerrado")).toBe(true);
    expect(canTransition("cerrado", "abierto")).toBe(false);

    const started = startChallenge({
      actor: person("vol-camila"),
      challenge: challenge("rt-lectura"),
      applications: [
        {
          id: "app-camila",
          challengeId: "rt-lectura",
          volunteerId: "vol-camila",
          status: "confirmada",
          scheduleWarning: null,
          createdAt: NOW,
        },
      ],
    });
    expect(started.ok).toBe(false);
  });

  it("un voluntario no publica y un organizador sí, con criterio de cierre", () => {
    const denied = publishChallenge({
      id: "rt-nuevo",
      actor: person("vol-camila"),
      title: "Mingas de lectura",
      summary: "Acompañar la hora del cuento en el barrio.",
      neighborhood: "El Sauce",
      skills: ["lectura"],
      interests: ["infancia"],
      schedule: { day: "sab", start: "09:00", end: "11:00" },
      spots: 2,
      closingCriteria: "Nota de los cuentos leídos y de la asistencia.",
    });
    expect(denied.ok).toBe(false);

    const published = publishChallenge({
      id: "rt-nuevo",
      actor: person("org-mariana"),
      title: "Mingas de lectura",
      summary: "Acompañar la hora del cuento en el barrio.",
      neighborhood: "El Sauce",
      skills: ["lectura"],
      interests: ["infancia"],
      schedule: { day: "sab", start: "09:00", end: "11:00" },
      spots: 2,
      closingCriteria: "Nota de los cuentos leídos y de la asistencia.",
    });
    expect(published.ok).toBe(true);
    if (!published.ok) return;
    expect(published.value.status).toBe("abierto");
  });
});
