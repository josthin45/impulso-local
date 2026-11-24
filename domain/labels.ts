import type { ApplicationStatus, ChallengeStatus } from "./types";

export const STATUS_LABEL: Record<ChallengeStatus, string> = {
  abierto: "Abierto",
  en_curso: "En curso",
  en_cierre: "En cierre",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const APPLICATION_LABEL: Record<ApplicationStatus, string> = {
  postulada: "Postulada",
  confirmada: "Confirmada",
  rechazada: "Rechazada",
  liberada: "Liberada",
};
