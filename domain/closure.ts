import { confirmedApplications } from "./capacity";
import { transition } from "./transitions";
import {
  err,
  ok,
  type Application,
  type Challenge,
  type Evidence,
  type Person,
  type Result,
} from "./types";

export function submitEvidence(input: {
  id: string;
  actor: Person;
  challenge: Challenge;
  applications: Application[];
  evidences: Evidence[];
  note: string;
  now: string;
}): Result<Evidence> {
  const { id, actor, challenge, applications, evidences, note, now } = input;
  const text = note.trim();
  if (text.length < 8) {
    return err("La evidencia necesita una nota de al menos una frase.");
  }
  if (challenge.status !== "en_curso" && challenge.status !== "en_cierre") {
    return err("La evidencia se entrega cuando el reto está en curso o en cierre.");
  }
  const confirmed = applications.find(
    (application) =>
      application.challengeId === challenge.id &&
      application.volunteerId === actor.id &&
      application.status === "confirmada",
  );
  if (!confirmed || actor.role !== "voluntario") {
    return err("Solo una persona confirmada puede entregar evidencia.");
  }
  if (
    evidences.some(
      (evidence) =>
        evidence.challengeId === challenge.id && evidence.volunteerId === actor.id,
    )
  ) {
    return err("Ya entregaste la evidencia de este reto.");
  }
  return ok({
    id,
    challengeId: challenge.id,
    volunteerId: actor.id,
    note: text,
    submittedAt: now,
  });
}

function missingNames(
  challenge: Challenge,
  applications: Application[],
  evidences: Evidence[],
  people: Person[],
): string[] {
  return confirmedApplications(applications, challenge.id)
    .filter(
      (application) =>
        !evidences.some(
          (evidence) =>
            evidence.challengeId === challenge.id &&
            evidence.volunteerId === application.volunteerId,
        ),
    )
    .map(
      (application) =>
        people.find((person) => person.id === application.volunteerId)?.name ??
        application.volunteerId,
    );
}

export function requestClosure(input: {
  actor: Person;
  challenge: Challenge;
  applications: Application[];
  evidences: Evidence[];
  people: Person[];
}): Result<Challenge> {
  const { actor, challenge, applications, evidences, people } = input;
  if (confirmedApplications(applications, challenge.id).length === 0) {
    return err("Hace falta al menos una participación confirmada para pedir el cierre.");
  }
  const missing = missingNames(challenge, applications, evidences, people);
  if (missing.length > 0) {
    return err(`Falta la evidencia de ${missing.join(", ")}.`);
  }
  return transition(challenge, "en_cierre", actor);
}

export function validateClosure(input: {
  actor: Person;
  challenge: Challenge;
  applications: Application[];
  evidences: Evidence[];
  people: Person[];
}): Result<Challenge> {
  const { actor, challenge, applications, evidences, people } = input;
  if (actor.role !== "organizador") {
    return err("Solo el organizador del reto puede validar el cierre.");
  }
  if (actor.id !== challenge.organizerId) {
    return err("Solo el organizador de este reto puede validar el cierre.");
  }
  if (challenge.status !== "en_cierre") {
    return err("El cierre se valida cuando el reto ya está en cierre.");
  }
  const missing = missingNames(challenge, applications, evidences, people);
  if (missing.length > 0) {
    return err(`Falta la evidencia de ${missing.join(", ")}.`);
  }
  return transition(challenge, "cerrado", actor);
}

export function startChallenge(input: {
  actor: Person;
  challenge: Challenge;
  applications: Application[];
}): Result<Challenge> {
  if (confirmedApplications(input.applications, input.challenge.id).length === 0) {
    return err("Confirma al menos a una persona antes de iniciar el reto.");
  }
  return transition(input.challenge, "en_curso", input.actor);
}
