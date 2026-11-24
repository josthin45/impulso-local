import { err, ok, type Challenge, type Person, type Result, type TimeWindow } from "./types";
import { norm, toMinutes } from "./time";

export function publishChallenge(input: {
  id: string;
  actor: Person;
  title: string;
  summary: string;
  neighborhood: string;
  skills: string[];
  interests: string[];
  schedule: TimeWindow;
  spots: number;
  closingCriteria: string;
}): Result<Challenge> {
  if (input.actor.role !== "organizador") {
    return err("Solo un organizador puede publicar un reto.");
  }
  const title = input.title.trim();
  const summary = input.summary.trim();
  const neighborhood = input.neighborhood.trim();
  const closingCriteria = input.closingCriteria.trim();
  const skills = [...new Set(input.skills.map(norm).filter(Boolean))];
  const interests = [...new Set(input.interests.map(norm).filter(Boolean))];

  if (title.length < 4) return err("El reto necesita un título.");
  if (summary.length < 12) return err("Cuenta en una frase qué se va a hacer.");
  if (neighborhood.length < 3) return err("Indica el barrio o el lugar.");
  if (skills.length === 0) return err("Indica al menos una habilidad.");
  if (!Number.isInteger(input.spots) || input.spots < 1 || input.spots > 30) {
    return err("Los cupos son un entero entre 1 y 30.");
  }
  if (closingCriteria.length < 12) {
    return err("Escribe el criterio de cierre: qué evidencia vas a revisar.");
  }
  if (toMinutes(input.schedule.end) <= toMinutes(input.schedule.start)) {
    return err("La hora de fin tiene que ser posterior a la de inicio.");
  }

  return ok({
    id: input.id,
    title,
    summary,
    neighborhood,
    organizerId: input.actor.id,
    skills,
    interests,
    schedule: input.schedule,
    spots: input.spots,
    closingCriteria,
    status: "abierto",
  });
}
