import type { Application, Challenge } from "./types";

export function confirmedApplications(
  applications: Application[],
  challengeId: string,
): Application[] {
  return applications.filter(
    (application) =>
      application.challengeId === challengeId && application.status === "confirmada",
  );
}

export function confirmedCount(applications: Application[], challengeId: string): number {
  return confirmedApplications(applications, challengeId).length;
}

export function remainingSpots(challenge: Challenge, applications: Application[]): number {
  return challenge.spots - confirmedCount(applications, challenge.id);
}
