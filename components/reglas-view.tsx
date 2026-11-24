import { RECOMMENDATION_RULES } from "@/domain/recommendations";

const CHECKS = [
  "Una coincidencia no crea ni confirma una postulación.",
  "No se confirma a nadie si los cupos ya están llenos.",
  "Un horario incompatible se advierte y la postulación puede enviarse igual.",
  "Solo el organizador de ese reto valida el cierre.",
  "Cancelar libera a quien estaba postulada y ofrece alternativas sin inscribirlas.",
  "El reto no salta de abierto a cerrado.",
];

export function ReglasView() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs tracking-wide text-clay uppercase">Reglas transparentes</p>
        <h1 className="font-heading text-4xl">Cómo se explica una coincidencia</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          El puntaje no es una caja negra. Cada razón que ves en Inicio sale de estas reglas, y
          ninguna de ellas ocupa un cupo.
        </p>
      </div>
      <ol className="space-y-3">
        {RECOMMENDATION_RULES.map((rule, index) => (
          <li key={rule.id} className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs text-clay">Regla {index + 1}</p>
            <h2 className="font-heading text-2xl">{rule.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{rule.text}</p>
          </li>
        ))}
      </ol>
      <section>
        <h2 className="font-heading text-2xl">Lo que cubren las pruebas</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {CHECKS.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Se ejecutan con <code>npm test</code> en domain/rules.test.ts y domain/kanban.test.ts.
        </p>
      </section>
    </div>
  );
}
