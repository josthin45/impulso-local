import { recommend } from "./recommendations";
import { transition } from "./transitions";
import {
  ok,
  type Application,
  type Challenge,
  type Notice,
  type Person,
  type Result,
} from "./types";

export function cancelChallenge(input: {
  actor: Person;
  challenge: Challenge;
  challenges: Challenge[];
  applications: Application[];
  people: Person[];
  noticeId: (volunteerId: string) => string;
}): Result<{
  challenge: Challenge;
  challenges: Challenge[];
  applications: Application[];
  notices: Notice[];
}> {
  const moved = transition(input.challenge, "cancelado", input.actor);
  if (!moved.ok) return moved;

  const affectedIds = new Set(
    input.applications
      .filter(
        (application) =>
          application.challengeId === input.challenge.id &&
          (application.status === "postulada" || application.status === "confirmada"),
      )
      .map((application) => application.volunteerId),
  );

  const applications = input.applications.map((application) =>
    application.challengeId === input.challenge.id &&
    (application.status === "postulada" || application.status === "confirmada")
      ? { ...application, status: "liberada" as const }
      : application,
  );

  const challenges = input.challenges.map((challenge) =>
    challenge.id === moved.value.id ? moved.value : challenge,
  );

  const notices: Notice[] = [];
  for (const volunteerId of affectedIds) {
    const volunteer = input.people.find((person) => person.id === volunteerId);
    if (!volunteer) continue;
    const alternatives = recommend(volunteer, challenges, applications).filter(
      (recommendation) => recommendation.enrolled === false,
    );
    notices.push({
      id: input.noticeId(volunteerId),
      volunteerId,
      cancelledChallengeId: input.challenge.id,
      cancelledTitle: input.challenge.title,
      alternatives,
    });
  }

  return ok({
    challenge: moved.value,
    challenges,
    applications,
    notices,
  });
}
