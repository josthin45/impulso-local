import { err, ok, type Challenge, type ChallengeStatus, type Person, type Result } from "./types";

const ALLOWED: Record<ChallengeStatus, ChallengeStatus[]> = {
  abierto: ["en_curso", "cancelado"],
  en_curso: ["en_cierre", "cancelado"],
  en_cierre: ["cerrado", "cancelado"],
  cerrado: [],
  cancelado: [],
};

export function canTransition(from: ChallengeStatus, to: ChallengeStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function transition(
  challenge: Challenge,
  to: ChallengeStatus,
  actor: Person,
): Result<Challenge> {
  if (actor.role !== "organizador" || actor.id !== challenge.organizerId) {
    return err("Solo el organizador de este reto puede cambiar su estado.");
  }
  if (!canTransition(challenge.status, to)) {
    return err(`No se puede pasar de «${challenge.status}» a «${to}».`);
  }
  return ok({ ...challenge, status: to });
}
