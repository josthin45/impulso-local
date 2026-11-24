import { remainingSpots } from "./capacity";
import { scheduleFit } from "./schedule";
import type { Application, Challenge, Person, Recommendation } from "./types";
import { formatWindow, norm } from "./time";

export const RECOMMENDATION_RULES = [
  {
    id: "habilidad",
    title: "Habilidad en común",
    text: "Hace falta al menos una habilidad que el reto pide y el perfil declara. Sin eso no hay recomendación.",
  },
  {
    id: "abierto",
    title: "Reto abierto con cupo",
    text: "El reto está abierto y todavía tiene cupos libres. Un reto lleno, cerrado o cancelado no se recomienda.",
  },
  {
    id: "puntaje",
    title: "Puntaje visible",
    text: "El puntaje suma habilidades compartidas (hasta 40), intereses (hasta 20), horario (25 si lo cubre, 10 si solo se cruza, 0 si no coincide) y cupos libres (hasta 15).",
  },
  {
    id: "no-inscribe",
    title: "No inscribe",
    text: "La recomendación explica la coincidencia. No crea una postulación ni una confirmación.",
  },
] as const;

function shared(left: string[], right: string[]): string[] {
  const wanted = new Set(right.map(norm));
  return left.filter((item) => wanted.has(norm(item)));
}

export function recommend(
  volunteer: Person,
  challenges: Challenge[],
  applications: Application[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const challenge of challenges) {
    if (challenge.status !== "abierto") continue;
    const remaining = remainingSpots(challenge, applications);
    if (remaining <= 0) continue;

    const skills = shared(volunteer.skills, challenge.skills);
    if (skills.length === 0) continue;

    const interests = shared(volunteer.interests, challenge.interests);
    const fit = scheduleFit(volunteer.availability, challenge.schedule);
    const skillScore = Math.round((skills.length / challenge.skills.length) * 40);
    const interestScore =
      challenge.interests.length === 0
        ? 0
        : Math.round((interests.length / challenge.interests.length) * 20);
    const scheduleScore = fit === "cubre" ? 25 : fit === "parcial" ? 10 : 0;
    const spotScore = Math.round((remaining / challenge.spots) * 15);
    const when = formatWindow(challenge.schedule);

    const reasons = [
      `Habilidades en común: ${skills.join(", ")} (${skills.length} de ${challenge.skills.length}). Suman ${skillScore} de 40.`,
      interests.length > 0
        ? `Intereses en común: ${interests.join(", ")}. Suman ${interestScore} de 20.`
        : "No hay intereses en común. Ese tramo suma 0 de 20.",
      fit === "cubre"
        ? `Tu horario cubre el ${when}. Suman 25.`
        : fit === "parcial"
          ? `Tu horario solo cruza parte del ${when}. Suman 10.`
          : `Tu horario no cubre el ${when}. Ese tramo suma 0 y, si postulas, verás una advertencia.`,
      `Quedan ${remaining} de ${challenge.spots} cupos. Suman ${spotScore} de 15.`,
      "Esta coincidencia no crea una postulación ni ocupa un cupo.",
    ];

    recommendations.push({
      challengeId: challenge.id,
      volunteerId: volunteer.id,
      score: skillScore + interestScore + scheduleScore + spotScore,
      reasons,
      scheduleFit: fit,
      enrolled: false,
    });
  }

  return recommendations.sort((a, b) => b.score - a.score || a.challengeId.localeCompare(b.challengeId));
}
