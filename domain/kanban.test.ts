import { describe, expect, it } from "vitest";
import {
  average,
  CARDS,
  countIn,
  finishedIn,
  IMPROVED_WIP,
  metricsFor,
  moveCard,
  PERIOD,
  PERIOD_BEFORE,
  snapshot,
} from "./kanban";

describe("tablero kanban", () => {
  it("rechaza jalar una tarjeta a desarrollo cuando el límite está lleno", () => {
    const board = snapshot("m3");
    expect(countIn(board, "en_desarrollo")).toBe(2);
    expect(countIn(board, "pruebas")).toBe(2);

    const moved = moveCard(board, "IL-12", "en_desarrollo", IMPROVED_WIP);
    expect(moved.ok).toBe(false);
    if (moved.ok) return;
    expect(moved.error).toMatch(/No se inicia más trabajo/);
    expect(board.find((card) => card.id === "IL-12")?.column).toBe("por_hacer");
  });

  it("rechaza una tercera tarjeta en pruebas", () => {
    const board = snapshot("m3");
    const moved = moveCard(board, "IL-12", "pruebas", IMPROVED_WIP);
    expect(moved.ok).toBe(false);
  });

  it("calcula tiempo de entrega, tiempo de ciclo y cantidad terminada", () => {
    const done = finishedIn(CARDS, PERIOD.from, PERIOD.to);
    const early = finishedIn(CARDS, PERIOD_BEFORE.from, PERIOD_BEFORE.to);
    expect(done.map((card) => card.id)).toEqual([
      "IL-01",
      "IL-02",
      "IL-03",
      "IL-04",
      "IL-05",
      "IL-06",
    ]);
    expect(early).toHaveLength(3);

    const metrics = metricsFor(done);
    expect(metrics).toHaveLength(6);
    expect(metrics.every((item) => item.leadHours > item.cycleHours)).toBe(true);
    expect(average(metrics.map((item) => item.leadHours))).toBeGreaterThan(0);

    const reviewBefore = countIn(snapshot("m2"), "en_revision");
    const reviewAfter = countIn(snapshot("m3"), "en_revision");
    expect(reviewBefore).toBe(4);
    expect(reviewAfter).toBe(1);
  });
});
