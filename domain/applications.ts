import { confirmedCount, remainingSpots } from "./capacity";
import { scheduleWarning } from "./schedule";
import {
  err,
  ok,
  type Application,
  type Challenge,
  type Person,
  type Result,
} from "./types";

export function applyToChallenge(input: {
  id: string;
  challenge: Challenge;
  volunteer: Person;
  applications: Application[];
  now: string;
  scheduleAcknowledged?: boolean;
}): Result<Application> {
  const { id, challenge, volunteer, applications, now } = input;
  if (volunteer.role !== "voluntario") {
    return err("Solo un voluntario puede postularse.");
  }
  if (challenge.status !== "abierto" && challenge.status !== "en_curso") {
    return err("Este reto no admite postulaciones.");
  }
  if (remainingSpots(challenge, applications) <= 0) {
    return err("No quedan cupos libres. No se abre otra postulación.");
  }
  const active = applications.find(
    (application) =>
      application.challengeId === challenge.id &&
      application.volunteerId === volunteer.id &&
      (application.status === "postulada" || application.status === "confirmada"),
  );
  if (active) {
    return err("Ya tienes una postulación activa en este reto.");
  }

  const warning = scheduleWarning(volunteer.availability, challenge.schedule);
  if (warning && input.scheduleAcknowledged !== true) {
    return err(
      "Lee la advertencia de horario y confírmala. El aviso no impide postular, pero la postulación no se envía sola.",
    );
  }

  return ok({
    id,
    challengeId: challenge.id,
    volunteerId: volunteer.id,
    status: "postulada",
    scheduleWarning: warning,
    createdAt: now,
  });
}

export function confirmApplication(input: {
  actor: Person;
  challenge: Challenge;
  application: Application;
  applications: Application[];
}): Result<Application> {
  const { actor, challenge, application, applications } = input;
  if (actor.role !== "organizador" || actor.id !== challenge.organizerId) {
    return err("Solo el organizador de este reto puede confirmar una postulación.");
  }
  if (application.challengeId !== challenge.id) {
    return err("La postulación no pertenece a este reto.");
  }
  if (challenge.status !== "abierto" && challenge.status !== "en_curso") {
    return err("Este reto ya no admite confirmaciones.");
  }
  if (application.status !== "postulada") {
    return err("Solo se confirma una postulación que sigue pendiente.");
  }
  if (confirmedCount(applications, challenge.id) >= challenge.spots) {
    return err(
      `No quedan cupos. Hay ${confirmedCount(applications, challenge.id)} confirmadas y el reto admite ${challenge.spots}.`,
    );
  }
  return ok({ ...application, status: "confirmada" });
}

export function rejectApplication(input: {
  actor: Person;
  challenge: Challenge;
  application: Application;
}): Result<Application> {
  const { actor, challenge, application } = input;
  if (actor.role !== "organizador" || actor.id !== challenge.organizerId) {
    return err("Solo el organizador de este reto puede rechazar una postulación.");
  }
  if (application.status !== "postulada") {
    return err("Solo se rechaza una postulación pendiente.");
  }
  return ok({ ...application, status: "rechazada" });
}
