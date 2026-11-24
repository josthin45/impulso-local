import type { ScheduleFit, TimeWindow } from "./types";
import { bestOverlap, covers, formatWindow } from "./time";

export function scheduleFit(
  availability: TimeWindow[],
  required: TimeWindow,
): ScheduleFit {
  if (covers(availability, required)) return "cubre";
  if (bestOverlap(availability, required) >= 60) return "parcial";
  return "incompatible";
}

export function scheduleWarning(
  availability: TimeWindow[],
  required: TimeWindow,
): string | null {
  const fit = scheduleFit(availability, required);
  const when = formatWindow(required);
  if (fit === "cubre") return null;
  if (fit === "parcial") {
    return `Tu disponibilidad solo cubre parte del horario del reto (${when}). Puedes postularte; el organizador verá esta advertencia.`;
  }
  return `Tu disponibilidad no cubre el horario del reto (${when}). Puedes postularte; el organizador verá esta advertencia.`;
}
