import { COURSE, TEAM, memberName } from "@/domain/course";
import {
  CARDS,
  COLUMN_LABEL,
  DEFINITION_OF_DONE,
  IMPROVEMENT,
  MOMENTS,
  PERIOD,
  PERIOD_BEFORE,
  POLICIES,
  average,
  finishedIn,
  metricsFor,
} from "@/domain/kanban";
import { formatDuration, formatStamp } from "@/domain/time";

const SHOTS = [
  { src: "/capturas/momento-1.png", moment: "m1" as const },
  { src: "/capturas/momento-2.png", moment: "m2" as const },
  { src: "/capturas/momento-3.png", moment: "m3" as const },
];

export function InformeDocument() {
  const done = finishedIn(CARDS, PERIOD.from, PERIOD.to);
  const metrics = metricsFor(done);
  const byId = new Map(metrics.map((item) => [item.id, item]));
  const lead = average(metrics.map((item) => item.leadHours));
  const cycle = average(metrics.map((item) => item.cycleHours));
  const early = finishedIn(CARDS, PERIOD_BEFORE.from, PERIOD_BEFORE.to);
  const table = done.slice(0, 5);

  return (
    <article className="informe mx-auto max-w-4xl bg-white px-2 py-6 text-[13px] leading-relaxed text-ink">
      <header>
        <p className="text-xs tracking-[0.16em] text-clay uppercase">
          {COURSE.code} · {COURSE.subject}
        </p>
        <h1 className="font-heading text-4xl">ImpulsoLocal</h1>
        <p className="text-lg">Microvoluntariado y retos de comunidad · tablero Kanban</p>
        <p className="mt-2">
          {COURSE.project}. {COURSE.unit}. Docente: {COURSE.teacher}. {COURSE.teamName}.
        </p>
        <p>Informe del 23 de noviembre de 2026. Horas en America/Guayaquil (UTC−5).</p>
      </header>

      <section className="mt-5">
        <h2 className="font-heading text-2xl">Contexto</h2>
        <p className="mt-1">
          ImpulsoLocal conecta estudiantes con apoyos breves de barrio según habilidades y
          disponibilidad. Hay dos usuarios: voluntario y organizador. El voluntario ve una
          recomendación explicada, se postula y espera confirmación. El organizador publica el
          reto, confirma cupos, recibe evidencias y valida el cierre. Cancelar un reto ofrece otras
          opciones y no inscribe a nadie.
        </p>
        <p className="mt-2">
          El tablero no gestiona los retos del barrio. Gestiona el flujo con el que el equipo
          construye ese prototipo: doce historias, de IL-01 a IL-12, con responsable, criterio de
          aceptación y enlace a la evidencia. El tablero vive en la ruta <strong>/tablero</strong>{" "}
          del prototipo. Este informe está en <strong>/informe</strong>.
        </p>
        <p className="mt-2">
          Equipo: {TEAM.map((member) => member.name).join("; ")}.
        </p>
        <p className="mt-2 rounded-2xl bg-[#f8efd2] px-3 py-2">
          <strong>Simulación identificada.</strong> Las fechas de solicitud, inicio y fin van del 3
          al 21 de noviembre de 2026 y sirven para calcular tiempo de entrega, tiempo de ciclo y
          cantidad terminada. No son un diario de horas trabajadas en esas fechas.{" "}
          <strong>Dato real:</strong> el prototipo, las pruebas automáticas y las tres capturas se
          hicieron el 23 de noviembre de 2026. Las capturas son fotos reales de la aplicación
          mostrando los tres momentos de esa simulación.
        </p>
      </section>

      <section className="break mt-2">
        <h2 className="font-heading text-2xl">Políticas y definición de terminado</h2>
        <p className="mt-1">
          El sistema es pull. Una persona jala la siguiente tarjeta solo si la columna de destino
          tiene cupo. En desarrollo el máximo es dos. En pruebas el máximo es dos. Nadie empuja
          trabajo a una columna llena.
        </p>
        <ul className="mt-2 space-y-1">
          {POLICIES.map((policy) => (
            <li key={policy.id}>
              <strong>{COLUMN_LABEL[policy.id]}.</strong> {policy.enters} {policy.leaves}
            </li>
          ))}
        </ul>
        <p className="mt-2">
          <strong>Definición de terminado.</strong> {DEFINITION_OF_DONE.join(" ")}
        </p>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Capturas del tablero</h2>
        <p className="mt-1">
          Tres momentos distintos de la simulación, fotografiados el 23 de noviembre de 2026.
        </p>
        <div className="mt-2 space-y-3">
          {SHOTS.map((shot) => (
            <figure key={shot.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot.src}
                alt={MOMENTS[shot.moment].caption}
                className="w-full rounded-xl border border-border"
              />
              <figcaption className="mt-1 text-xs text-muted-foreground">
                Simulación. {MOMENTS[shot.moment].caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Cinco tarjetas terminadas</h2>
        <p className="mt-1">
          La rúbrica pide cinco. En el período se terminaron seis; la tabla detalla las cinco
          primeras y la sexta entra en el conteo. Período: {PERIOD.label}. Tiempo de entrega = fin
          − solicitud. Tiempo de ciclo = fin − inicio.
        </p>
        <table className="mt-2 w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-ink">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Responsable</th>
              <th className="py-1 pr-2">Pedida</th>
              <th className="py-1 pr-2">Inicio</th>
              <th className="py-1 pr-2">Fin</th>
              <th className="py-1 pr-2">Entrega</th>
              <th className="py-1">Ciclo</th>
            </tr>
          </thead>
          <tbody>
            {table.map((card) => {
              const metric = byId.get(card.id);
              return (
                <tr key={card.id} className="border-b border-border align-top">
                  <td className="py-1 pr-2">{card.id}</td>
                  <td className="py-1 pr-2">{memberName(card.ownerId)}</td>
                  <td className="py-1 pr-2">{formatStamp(card.requestedAt)}</td>
                  <td className="py-1 pr-2">{formatStamp(card.startedAt)}</td>
                  <td className="py-1 pr-2">{formatStamp(card.finishedAt)}</td>
                  <td className="py-1 pr-2">{metric ? formatDuration(metric.leadHours) : "—"}</td>
                  <td className="py-1">{metric ? formatDuration(metric.cycleHours) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ul className="mt-2 space-y-1 text-[12px]">
          {table.map((card) => (
            <li key={card.id}>
              <strong>{card.id}.</strong> {card.acceptance} Bloqueo: {card.blocker} Resolución:{" "}
              {card.resolution} Evidencia: {card.evidence}.
            </li>
          ))}
        </ul>
        <p className="mt-2">
          IL-06, de {memberName("mateo")}, también está hecha: la evidencia no cierra el reto. Con
          ella, el período termina en {done.length} tarjetas. Tiempo de entrega medio:{" "}
          {formatDuration(lead)}. Tiempo de ciclo medio: {formatDuration(cycle)}. Del 3 al 12 de
          noviembre, antes del acuerdo, se habían terminado {early.length}.
        </p>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Mejora y aportes</h2>
        <p className="mt-1">{IMPROVEMENT.bottleneck}</p>
        <p className="mt-2">{IMPROVEMENT.agreement}</p>
        <p className="mt-2">Antes: {IMPROVEMENT.before}</p>
        <p>Después: {IMPROVEMENT.after}</p>
        <p className="mt-2">
          El 20 de noviembre la simulación deja IL-12 en Por hacer. Jalarla a En desarrollo se
          rechaza porque esa columna ya tiene dos tarjetas. No se inicia más trabajo con el límite
          lleno.
        </p>
        <h3 className="font-heading mt-3 text-xl">Aporte de cada integrante</h3>
        {TEAM.map((member) => (
          <p key={member.id} className="mt-2">
            <strong>{member.name}.</strong> {member.aporte}
          </p>
        ))}
        <h3 className="font-heading mt-3 text-xl">Texto en línea para Moodle</h3>
        <p className="mt-1">
          Repositorio público:{" "}
          <a href="https://github.com/josthin45/impulso-local">
            https://github.com/josthin45/impulso-local
          </a>
          . El tablero interactivo está en la ruta /tablero y este informe en /informe. Las tres
          capturas completas se abren sin clonar el proyecto:{" "}
          <a href="https://github.com/josthin45/impulso-local/raw/main/public/capturas/momento-1.png">
            momento 1
          </a>
          ,{" "}
          <a href="https://github.com/josthin45/impulso-local/raw/main/public/capturas/momento-2.png">
            momento 2
          </a>{" "}
          y{" "}
          <a href="https://github.com/josthin45/impulso-local/raw/main/public/capturas/momento-3.png">
            momento 3
          </a>
          . PDF:{" "}
          <a href="https://github.com/josthin45/impulso-local/raw/main/public/ImpulsoLocal-Kanban-Unidad3.pdf">
            ImpulsoLocal-Kanban-Unidad3.pdf
          </a>
          . Cada integrante pega este párrafo y el suyo de arriba. El docente abre el repositorio y
          las capturas sin pedir permiso.
        </p>
      </section>

      <style>{`
        .break { break-before: page; }
        figure { break-inside: avoid; margin: 0 0 6px; }
        .informe a { color: #1e4636; overflow-wrap: anywhere; }
        .informe img {
          display: block;
          width: 100%;
          height: auto;
          background: #f3eee4;
        }
        @page { size: A4; margin: 11mm 12mm; }
      `}</style>
    </article>
  );
}
