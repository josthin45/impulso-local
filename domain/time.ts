import type { TimeWindow, Weekday } from "./types";

export const DAY_LABEL: Record<Weekday, string> = {
  lun: "lunes",
  mar: "martes",
  mie: "miércoles",
  jue: "jueves",
  vie: "viernes",
  sab: "sábado",
  dom: "domingo",
};

export const DAY_ORDER: Weekday[] = [
  "lun",
  "mar",
  "mie",
  "jue",
  "vie",
  "sab",
  "dom",
];

export function norm(value: string): string {
  return value.trim().toLowerCase();
}

export function toMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatWindow(window: TimeWindow): string {
  return `${DAY_LABEL[window.day]} ${window.start}–${window.end}`;
}

export function overlapMinutes(a: TimeWindow, b: TimeWindow): number {
  if (a.day !== b.day) return 0;
  const start = Math.max(toMinutes(a.start), toMinutes(b.start));
  const end = Math.min(toMinutes(a.end), toMinutes(b.end));
  return Math.max(0, end - start);
}

export function windowDuration(window: TimeWindow): number {
  return Math.max(0, toMinutes(window.end) - toMinutes(window.start));
}

export function covers(availability: TimeWindow[], required: TimeWindow): boolean {
  return availability.some(
    (window) =>
      window.day === required.day &&
      toMinutes(window.start) <= toMinutes(required.start) &&
      toMinutes(window.end) >= toMinutes(required.end),
  );
}

export function bestOverlap(availability: TimeWindow[], required: TimeWindow): number {
  return availability.reduce(
    (best, window) => Math.max(best, overlapMinutes(window, required)),
    0,
  );
}

export function hoursBetween(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 36e5;
}

export function formatStamp(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatDuration(hours: number): string {
  const total = Math.round(hours * 10) / 10;
  const days = Math.floor(total / 24);
  const rest = Math.round((total - days * 24) * 10) / 10;
  if (days <= 0) return `${total} h`;
  return `${days} d ${rest} h`;
}
