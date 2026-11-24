export type Role = "voluntario" | "organizador";

export type Weekday = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export type TimeWindow = {
  day: Weekday;
  start: string;
  end: string;
};

export type Person = {
  id: string;
  name: string;
  role: Role;
  headline: string;
  organization?: string;
  skills: string[];
  interests: string[];
  availability: TimeWindow[];
  fictional: true;
};

export type ChallengeStatus =
  | "abierto"
  | "en_curso"
  | "en_cierre"
  | "cerrado"
  | "cancelado";

export type Challenge = {
  id: string;
  title: string;
  summary: string;
  neighborhood: string;
  organizerId: string;
  skills: string[];
  interests: string[];
  schedule: TimeWindow;
  spots: number;
  closingCriteria: string;
  status: ChallengeStatus;
};

export type ApplicationStatus =
  | "postulada"
  | "confirmada"
  | "rechazada"
  | "liberada";

export type Application = {
  id: string;
  challengeId: string;
  volunteerId: string;
  status: ApplicationStatus;
  scheduleWarning: string | null;
  createdAt: string;
};

export type Evidence = {
  id: string;
  challengeId: string;
  volunteerId: string;
  note: string;
  submittedAt: string;
};

export type ScheduleFit = "cubre" | "parcial" | "incompatible";

export type Recommendation = {
  challengeId: string;
  volunteerId: string;
  score: number;
  reasons: string[];
  scheduleFit: ScheduleFit;
  enrolled: false;
};

export type Notice = {
  id: string;
  volunteerId: string;
  cancelledChallengeId: string;
  cancelledTitle: string;
  alternatives: Recommendation[];
};

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: string };
export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(error: string): Err {
  return { ok: false, error };
}
