export const COURSE = {
  code: "IS-505",
  subject: "Modelado ágil de software",
  teacher: "Gómez Calderón Israel Julio",
  unit: "Unidad 3",
  project: "Proyecto 6 · ImpulsoLocal",
  teamName: "Equipo Kanban–XP",
};

export type TeamId = "josthin" | "andres" | "mateo";

export const TEAM: {
  id: TeamId;
  name: string;
  short: string;
  aporte: string;
}[] = [
  {
    id: "josthin",
    name: "Josthin Stalin Garcia Choez",
    short: "Josthin Garcia",
    aporte:
      "Definí las reglas de coincidencia y la explicación de cada recomendación, el control de cupos en la confirmación humana y las pruebas de permisos y transiciones. Una coincidencia no crea una postulación: eso queda en la prueba de dominio y en el recorrido del prototipo, donde la persona postulada sigue pendiente hasta que el organizador confirma.",
  },
  {
    id: "andres",
    name: "Andres Gabriel Calucho Quijano",
    short: "Andres Calucho",
    aporte:
      "Publiqué el modelo de reto con habilidades, horario, cupos y criterio de cierre, el perfil mínimo con identidades ficticias y la postulación con aviso cuando el horario no coincide. El aviso no bloquea la postulación: deja la decisión en la confirmación humana. También preparé la estructura del informe de flujo y las capturas del tablero.",
  },
  {
    id: "mateo",
    name: "Mateo Issac Gonzales Reina",
    short: "Mateo Gonzales",
    aporte:
      "Trabajé la entrega de evidencias, la validación de cierre reservada al organizador del reto y la cancelación con alternativas que no inscriben solas. Registré los bloqueos de esas tarjetas y cómo se resolvieron, y separé la evidencia del cierre para que entregar una nota no cierre el reto.",
  },
];

export function memberName(id: TeamId): string {
  return TEAM.find((member) => member.id === id)?.name ?? id;
}

export function memberShort(id: TeamId): string {
  return TEAM.find((member) => member.id === id)?.short ?? id;
}
