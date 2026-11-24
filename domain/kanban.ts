import type { TeamId } from "./course";
import { err, ok, type Result } from "./types";
import { hoursBetween } from "./time";

export type ColumnId =
  | "backlog"
  | "por_hacer"
  | "en_desarrollo"
  | "en_revision"
  | "pruebas"
  | "hecho";

export type MomentId = "m1" | "m2" | "m3";

export const COLUMN_ORDER: ColumnId[] = [
  "backlog",
  "por_hacer",
  "en_desarrollo",
  "en_revision",
  "pruebas",
  "hecho",
];

export const COLUMN_LABEL: Record<ColumnId, string> = {
  backlog: "Backlog",
  por_hacer: "Por hacer",
  en_desarrollo: "En desarrollo",
  en_revision: "En revisión",
  pruebas: "Pruebas",
  hecho: "Hecho",
};

export const BASE_WIP: Partial<Record<ColumnId, number>> = {
  en_desarrollo: 2,
  pruebas: 2,
};

export const IMPROVED_WIP: Partial<Record<ColumnId, number>> = {
  en_desarrollo: 2,
  en_revision: 2,
  pruebas: 2,
};

export const POLICIES: {
  id: ColumnId;
  enters: string;
  leaves: string;
}[] = [
  {
    id: "backlog",
    enters:
      "Entra una historia de ImpulsoLocal con ID, responsable, criterio de aceptación y valor para el recorrido voluntario u organizador.",
    leaves:
      "Sale cuando el equipo la jala a Por hacer. Nadie empuja trabajo: se elige porque ya se puede empezar.",
  },
  {
    id: "por_hacer",
    enters:
      "Entra con el criterio de aceptación escrito y sin depender de una tarjeta que siga bloqueada.",
    leaves:
      "Sale cuando alguien con capacidad la jala a En desarrollo y esa columna tiene menos de dos tarjetas.",
  },
  {
    id: "en_desarrollo",
    enters: "Entra con responsable asignado y solo si hay menos de dos tarjetas en la columna.",
    leaves:
      "Sale cuando la parte está en el prototipo y el enlace a la prueba o a la pantalla ya está en la tarjeta.",
  },
  {
    id: "en_revision",
    enters: "Entra cuando el criterio de aceptación se puede comprobar en el prototipo.",
    leaves:
      "Sale cuando alguien distinto del responsable revisó reglas, permisos o transiciones. Desde la mejora, el máximo es dos tarjetas.",
  },
  {
    id: "pruebas",
    enters:
      "Entra si la revisión no dejó un bloqueo abierto y hay menos de dos tarjetas en la columna.",
    leaves:
      "Sale cuando pasan las pruebas de reglas, permisos y transiciones, o queda registrada la evidencia manual.",
  },
  {
    id: "hecho",
    enters:
      "Entra solo con la definición de terminado completa. No se salta el límite de la columna de la que viene.",
    leaves: "No vuelve al flujo. Un defecto nuevo abre otra tarjeta.",
  },
];

export const DEFINITION_OF_DONE = [
  "El criterio de aceptación se cumple en el prototipo.",
  "Hay un enlace a la evidencia: prueba automática o pantalla.",
  "Quedaron anotadas la solicitud, el inicio y el fin.",
  "No queda un bloqueo abierto.",
  "La tarjeta no entró saltándose un límite WIP.",
];

export const MOMENTS: Record<
  MomentId,
  { at: string; title: string; caption: string }
> = {
  m1: {
    at: "2026-11-04T08:00:00-05:00",
    title: "Inicio",
    caption:
      "4 de noviembre de 2026, 08:00. El trabajo está en Backlog y en Por hacer. Desarrollo y Pruebas siguen vacíos.",
  },
  m2: {
    at: "2026-11-12T18:00:00-05:00",
    title: "Cuello de botella",
    caption:
      "12 de noviembre de 2026, 18:00. Cuatro tarjetas esperan en En revisión. Desarrollo está en su límite de dos y Pruebas no recibe nada.",
  },
  m3: {
    at: "2026-11-20T18:00:00-05:00",
    title: "Después de la mejora",
    caption:
      "20 de noviembre de 2026, 18:00. Con la política de salida y el límite de dos en revisión, hay seis tarjetas hechas y ninguna columna de trabajo pasa su tope.",
  },
};

export const PERIOD = {
  from: "2026-11-03T09:00:00-05:00",
  to: "2026-11-21T18:00:00-05:00",
  label:
    "del 3 de noviembre de 2026 a las 09:00 al 21 de noviembre de 2026 a las 18:00, hora de Guayaquil (UTC−5)",
};

export const PERIOD_BEFORE = {
  from: "2026-11-03T09:00:00-05:00",
  to: "2026-11-12T18:00:00-05:00",
  label:
    "del 3 de noviembre de 2026 a las 09:00 al 12 de noviembre de 2026 a las 18:00, hora de Guayaquil (UTC−5)",
};

export const IMPROVEMENT = {
  bottleneck:
    "En revisión. El 12 de noviembre (simulación) había cuatro tarjetas detenidas y Pruebas estaba vacía: el trabajo no avanzaba porque no había límite ni una salida corta.",
  agreement:
    "El equipo acordó una lista de salida —reglas, permisos, transiciones y evidencia— y un WIP máximo de dos tarjetas en En revisión, además de los dos en desarrollo y los dos en pruebas. No se jala trabajo nuevo si uno de esos límites está lleno.",
  before: "4 tarjetas en revisión, 0 en pruebas, 3 terminadas en la ventana del 3 al 12 de noviembre.",
  after: "1 tarjeta en revisión, 2 en pruebas, 6 terminadas en la ventana del 3 al 21 de noviembre.",
};

export type KanbanCard = {
  id: string;
  title: string;
  ownerId: TeamId;
  acceptance: string;
  evidence: string;
  evidenceHref: string;
  requestedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  blocker: string;
  resolution: string;
  columns: Record<MomentId, ColumnId>;
};

export const CARDS: KanbanCard[] = [
  {
    id: "IL-01",
    title: "Publicar un reto con habilidades, horario, cupos y criterio de cierre",
    ownerId: "andres",
    acceptance:
      "Un organizador publica un reto solo si indica habilidades, horario válido, cupos y un criterio de cierre.",
    evidence: "Prueba en domain/rules.test.ts · pantalla /retos",
    evidenceHref: "/retos",
    requestedAt: "2026-11-03T09:00:00-05:00",
    startedAt: "2026-11-04T09:30:00-05:00",
    finishedAt: "2026-11-06T16:00:00-05:00",
    blocker:
      "3 nov, 11:00. El formulario no pedía el criterio de cierre y un reto podía publicarse sin decir cómo se valida.",
    resolution:
      "5 nov, 15:00. El criterio de cierre quedó obligatorio antes de publicar.",
    columns: { m1: "por_hacer", m2: "hecho", m3: "hecho" },
  },
  {
    id: "IL-02",
    title: "Perfil mínimo con habilidades, intereses e identidad ficticia",
    ownerId: "mateo",
    acceptance:
      "Cada persona de la demo tiene habilidades, intereses y disponibilidad, y se presenta como identidad ficticia.",
    evidence: "Pantalla /perfil · datos en domain/seed.ts",
    evidenceHref: "/perfil",
    requestedAt: "2026-11-03T09:15:00-05:00",
    startedAt: "2026-11-05T10:00:00-05:00",
    finishedAt: "2026-11-07T13:00:00-05:00",
    blocker:
      "4 nov, 16:00. Se discutió usar cuentas reales de estudiantes para el perfil.",
    resolution:
      "5 nov, 12:00. Se acordaron identidades ficticias, sin registro ni datos personales de terceros.",
    columns: { m1: "por_hacer", m2: "hecho", m3: "hecho" },
  },
  {
    id: "IL-03",
    title: "Recomendar con reglas visibles y sin inscribir",
    ownerId: "josthin",
    acceptance:
      "La recomendación explica habilidades, intereses, horario y cupos. No crea una postulación.",
    evidence: "Prueba «una recomendación no crea ni confirma una postulación»",
    evidenceHref: "/reglas",
    requestedAt: "2026-11-04T11:00:00-05:00",
    startedAt: "2026-11-07T09:00:00-05:00",
    finishedAt: "2026-11-10T15:00:00-05:00",
    blocker:
      "7 nov, 11:30. La primera versión inscribía a la persona al calcular la coincidencia.",
    resolution:
      "8 nov, 17:00. La función de recomendación solo devuelve la explicación. La postulación es otro paso.",
    columns: { m1: "backlog", m2: "hecho", m3: "hecho" },
  },
  {
    id: "IL-04",
    title: "Postular y advertir si el horario no coincide",
    ownerId: "andres",
    acceptance:
      "La postulación queda pendiente. Si el horario no cubre el reto, se muestra una advertencia y no se bloquea el envío.",
    evidence: "Prueba de horario incompatible · pantalla del reto",
    evidenceHref: "/retos/rt-lectura",
    requestedAt: "2026-11-06T09:00:00-05:00",
    startedAt: "2026-11-10T09:00:00-05:00",
    finishedAt: "2026-11-13T17:00:00-05:00",
    blocker:
      "10 nov, 12:00. No había acuerdo sobre si un horario incompatible debía impedir la postulación.",
    resolution:
      "11 nov, 09:30. Se advierte y la confirmación humana decide. La postulación no pasa a confirmada.",
    columns: { m1: "backlog", m2: "en_revision", m3: "hecho" },
  },
  {
    id: "IL-05",
    title: "Confirmar a mano sin pasar el cupo",
    ownerId: "josthin",
    acceptance:
      "Solo el organizador del reto confirma. Si las confirmadas ya igualan los cupos, la siguiente confirmación se rechaza.",
    evidence: "Prueba «no confirma si los cupos ya están llenos»",
    evidenceHref: "/retos/rt-lectura",
    requestedAt: "2026-11-06T09:30:00-05:00",
    startedAt: "2026-11-11T09:00:00-05:00",
    finishedAt: "2026-11-14T12:00:00-05:00",
    blocker:
      "11 nov, 16:00. Dos confirmaciones seguidas podían dejar más personas confirmadas que cupos.",
    resolution:
      "12 nov, 10:00. El conteo se revisa en la transición y la prueba rechaza el cupo extra.",
    columns: { m1: "backlog", m2: "en_revision", m3: "hecho" },
  },
  {
    id: "IL-06",
    title: "Entregar evidencia sin cerrar el reto",
    ownerId: "mateo",
    acceptance:
      "Una persona confirmada entrega una nota cuando el reto está en curso. Esa entrega no cambia el estado a cerrado.",
    evidence: "Prueba de evidencia · pantalla del reto en curso",
    evidenceHref: "/participacion",
    requestedAt: "2026-11-08T10:00:00-05:00",
    startedAt: "2026-11-11T14:00:00-05:00",
    finishedAt: "2026-11-17T16:00:00-05:00",
    blocker:
      "12 nov, 09:00. Entregar la nota cerraba el reto y se saltaba la validación del organizador.",
    resolution:
      "13 nov, 11:00. La evidencia queda registrada y el reto sigue en curso hasta que el organizador pide el cierre.",
    columns: { m1: "backlog", m2: "en_revision", m3: "hecho" },
  },
  {
    id: "IL-07",
    title: "Reservar la validación del cierre al organizador",
    ownerId: "mateo",
    acceptance:
      "Un voluntario no valida el cierre. Otro organizador tampoco. Solo el organizador de ese reto, con el reto en cierre y las evidencias completas.",
    evidence: "Pruebas de permiso de cierre",
    evidenceHref: "/retos/rt-lectura",
    requestedAt: "2026-11-10T09:00:00-05:00",
    startedAt: "2026-11-12T09:00:00-05:00",
    finishedAt: null,
    blocker:
      "12 nov, 15:00. Un voluntario podía llamar a la validación. Quedó rechazado en la regla; la tarjeta espera la salida de revisión.",
    resolution:
      "12 nov, 16:30. La regla distingue al organizador del reto. La revisión de esa salida sigue abierta al 20 de noviembre.",
    columns: { m1: "backlog", m2: "en_revision", m3: "en_revision" },
  },
  {
    id: "IL-08",
    title: "Cancelar un reto y ofrecer alternativas sin inscribir",
    ownerId: "andres",
    acceptance:
      "Al cancelar, las postulaciones activas quedan liberadas y se ofrecen otros retos abiertos. No se crea ni se confirma ninguna postulación nueva.",
    evidence: "Prueba de cancelación · recorrido del mapeo",
    evidenceHref: "/retos/rt-mapa",
    requestedAt: "2026-11-10T11:00:00-05:00",
    startedAt: "2026-11-12T09:30:00-05:00",
    finishedAt: null,
    blocker:
      "18 nov, 11:00. La primera alternativa creaba una postulación confirmada. Se detuvo en pruebas hasta separar las dos acciones.",
    resolution:
      "18 nov, 16:00. Las alternativas salen de la misma regla de recomendación, con inscripción en falso. Sigue en Pruebas al 20 de noviembre.",
    columns: { m1: "backlog", m2: "en_desarrollo", m3: "pruebas" },
  },
  {
    id: "IL-09",
    title: "Panel de participación",
    ownerId: "josthin",
    acceptance:
      "La persona ve postulaciones, confirmaciones, evidencias, retos cerrados y horas comprometidas. El organizador ve sus retos.",
    evidence: "Pantalla /participacion",
    evidenceHref: "/participacion",
    requestedAt: "2026-11-12T09:00:00-05:00",
    startedAt: "2026-11-12T11:00:00-05:00",
    finishedAt: null,
    blocker:
      "12 nov, 18:00. No pudo salir de desarrollo: En revisión ya tenía cuatro tarjetas y no había política de salida.",
    resolution:
      "Sigue en desarrollo al 20 de noviembre, dentro del límite de dos. No se jaló otra tarjeta encima.",
    columns: { m1: "backlog", m2: "en_desarrollo", m3: "en_desarrollo" },
  },
  {
    id: "IL-10",
    title: "Transiciones de estado del reto",
    ownerId: "mateo",
    acceptance:
      "El reto solo avanza por abierto, en curso, en cierre y cerrado, o se cancela. No pasa de abierto a cerrado de un salto.",
    evidence: "Prueba de transiciones",
    evidenceHref: "/reglas",
    requestedAt: "2026-11-12T09:20:00-05:00",
    startedAt: "2026-11-18T09:00:00-05:00",
    finishedAt: null,
    blocker:
      "12 nov, 18:10. No se pudo iniciar antes: En desarrollo ya tenía dos tarjetas.",
    resolution:
      "18 nov, 09:00. Entró cuando IL-08 salió de desarrollo. Sigue en desarrollo al 20 de noviembre.",
    columns: { m1: "backlog", m2: "por_hacer", m3: "en_desarrollo" },
  },
  {
    id: "IL-11",
    title: "Probar reglas, permisos y transiciones",
    ownerId: "josthin",
    acceptance:
      "La suite cubre coincidencia sin inscripción, cupos, horario, cierre y cancelación, y el tablero rechaza un WIP lleno.",
    evidence: "npm test · domain/rules.test.ts y domain/kanban.test.ts",
    evidenceHref: "/reglas",
    requestedAt: "2026-11-10T15:00:00-05:00",
    startedAt: "2026-11-18T10:00:00-05:00",
    finishedAt: null,
    blocker:
      "12 nov, 18:10. Intento rechazado de jalarla a En desarrollo: la columna ya tenía IL-08 e IL-09.",
    resolution:
      "18 nov, 10:00. Se inició al liberarse un cupo de desarrollo y el 20 de noviembre está en Pruebas.",
    columns: { m1: "backlog", m2: "por_hacer", m3: "pruebas" },
  },
  {
    id: "IL-12",
    title: "Informe del flujo, capturas y texto de entrega",
    ownerId: "andres",
    acceptance:
      "El informe reúne contexto, políticas, tres capturas, cinco tarjetas con fechas, métricas, la mejora y los aportes.",
    evidence: "Pantalla /informe y PDF de la entrega",
    evidenceHref: "/informe",
    requestedAt: "2026-11-17T09:00:00-05:00",
    startedAt: null,
    finishedAt: null,
    blocker:
      "20 nov, 18:00. No se jala a En desarrollo: esa columna ya tiene dos tarjetas.",
    resolution: "Sigue en Por hacer. El límite se respeta.",
    columns: { m1: "backlog", m2: "backlog", m3: "por_hacer" },
  },
];

export type LiveCard = KanbanCard & { column: ColumnId };

export function wipFor(moment: MomentId): Partial<Record<ColumnId, number>> {
  return moment === "m3" ? IMPROVED_WIP : BASE_WIP;
}

export function snapshot(moment: MomentId): LiveCard[] {
  const at = new Date(MOMENTS[moment].at).getTime();
  return CARDS.filter((card) => new Date(card.requestedAt).getTime() <= at).map((card) => ({
    ...card,
    column: card.columns[moment],
  }));
}

export function countIn(cards: { column: ColumnId }[], column: ColumnId): number {
  return cards.filter((card) => card.column === column).length;
}

export function moveCard(
  cards: LiveCard[],
  id: string,
  to: ColumnId,
  limits: Partial<Record<ColumnId, number>>,
): Result<LiveCard[]> {
  const card = cards.find((item) => item.id === id);
  if (!card) return err("No existe esa tarjeta.");
  if (card.column === to) return ok(cards);
  const limit = limits[to];
  const count = countIn(cards, to);
  if (limit !== undefined && count >= limit) {
    return err(
      `${COLUMN_LABEL[to]} ya tiene ${count} tarjetas. El límite es ${limit}. No se inicia más trabajo.`,
    );
  }
  return ok(cards.map((item) => (item.id === id ? { ...item, column: to } : item)));
}

export type CardMetric = {
  id: string;
  leadHours: number;
  cycleHours: number;
};

export function finishedIn(cards: KanbanCard[], from: string, to: string): KanbanCard[] {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return cards.filter((card) => {
    if (!card.finishedAt) return false;
    const finished = new Date(card.finishedAt).getTime();
    return finished >= start && finished <= end;
  });
}

export function metricsFor(cards: KanbanCard[]): CardMetric[] {
  return cards
    .filter((card) => card.finishedAt && card.startedAt)
    .map((card) => ({
      id: card.id,
      leadHours: hoursBetween(card.requestedAt, card.finishedAt as string),
      cycleHours: hoursBetween(card.startedAt as string, card.finishedAt as string),
    }));
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
