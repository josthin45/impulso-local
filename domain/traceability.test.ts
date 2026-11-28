import { describe, expect, it } from "vitest";
import { applyToChallenge, confirmApplication } from "./applications";
import { validateClosure } from "./closure";
import { CARDS } from "./kanban";
import { seedChallenges, seedPeople } from "./seed";
import type { Application, Challenge, Person } from "./types";

const person = (id: string) => seedPeople.find((item) => item.id === id) as Person;
const challenge = (id: string) =>
  seedChallenges.find((item) => item.id === id) as Challenge;
const story = (id: string) => CARDS.find((card) => card.id === id);

const NOW = "2026-11-23T20:00:00-05:00";

describe("trazabilidad historia → criterio de aceptación → prueba (ImpulsoLocal)", () => {
  it("IL-05: confirmar a mano sin pasar el cupo (solo el organizador confirma y respeta límite de cupos)", () => {
    const card = story("IL-05");
    expect(card).toBeDefined();
    expect(card?.acceptance).toMatch(/Solo el organizador del reto confirma/i);
    expect(card?.acceptance).toMatch(/siguiente confirmación se rechaza/i);

    const lectura = challenge("rt-lectura");
    const firstApplication = applyToChallenge({
      id: "app-il05-camila",
      challenge: lectura,
      volunteer: person("vol-camila"),
      applications: [],
      now: NOW,
    });
    expect(firstApplication.ok).toBe(true);
    if (!firstApplication.ok) return;

    const firstConfirm = confirmApplication({
      actor: person("org-mariana"),
      challenge: lectura,
      application: firstApplication.value,
      applications: [firstApplication.value],
    });
    expect(firstConfirm.ok).toBe(true);
    if (!firstConfirm.ok) return;
    expect(firstConfirm.value.status).toBe("confirmada");

    const secondApplication: Application = {
      id: "app-il05-luis",
      challengeId: lectura.id,
      volunteerId: "vol-luis",
      status: "postulada",
      scheduleWarning: "Horario parcial",
      createdAt: NOW,
    };

    const rejectedOverCapacity = confirmApplication({
      actor: person("org-mariana"),
      challenge: lectura,
      application: secondApplication,
      applications: [firstConfirm.value, secondApplication],
    });
    expect(rejectedOverCapacity.ok).toBe(false);
    if (rejectedOverCapacity.ok) return;
    expect(rejectedOverCapacity.error).toMatch(/No quedan cupos/i);
  });

  it("IL-07: reservar la validación del cierre exclusivamente al organizador del reto", () => {
    const card = story("IL-07");
    expect(card).toBeDefined();
    expect(card?.acceptance).toMatch(/Un voluntario no valida el cierre/i);
    expect(card?.acceptance).toMatch(/Otro organizador tampoco/i);

    const inClosure: Challenge = { ...challenge("rt-lectura"), status: "en_cierre" };
    const confirmed: Application = {
      id: "app-il07-camila",
      challengeId: inClosure.id,
      volunteerId: "vol-camila",
      status: "confirmada",
      scheduleWarning: null,
      createdAt: NOW,
    };
    const evidences = [
      {
        id: "ev-il07-1",
        challengeId: inClosure.id,
        volunteerId: "vol-camila",
        note: "Lectura completada con asistencia de 8 niños.",
        submittedAt: NOW,
      },
    ];

    const byVolunteer = validateClosure({
      actor: person("vol-camila"),
      challenge: inClosure,
      applications: [confirmed],
      evidences,
      people: seedPeople,
    });
    expect(byVolunteer.ok).toBe(false);

    const byOtherOrganizer = validateClosure({
      actor: person("org-rosa"),
      challenge: inClosure,
      applications: [confirmed],
      evidences,
      people: seedPeople,
    });
    expect(byOtherOrganizer.ok).toBe(false);

    const byOwner = validateClosure({
      actor: person("org-mariana"),
      challenge: inClosure,
      applications: [confirmed],
      evidences,
      people: seedPeople,
    });
    expect(byOwner.ok).toBe(true);
    if (!byOwner.ok) return;
    expect(byOwner.value.status).toBe("cerrado");
  });

  it("IL-11: el backlog de tarjetas documenta criterios de aceptación y evidencia verificable", () => {
    const card = story("IL-11");
    expect(card).toBeDefined();
    expect(card?.acceptance).toMatch(/coincidencia sin inscripción/i);
    expect(card?.evidence).toMatch(/npm test/i);

    for (const item of CARDS) {
      expect(item.id).toMatch(/^IL-\d{2}$/);
      expect(item.acceptance.trim().length).toBeGreaterThan(10);
      expect(item.evidence.trim().length).toBeGreaterThan(5);
    }
  });
});
