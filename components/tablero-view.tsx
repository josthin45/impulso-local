"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { memberShort } from "@/domain/course";
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  DEFINITION_OF_DONE,
  IMPROVEMENT,
  IMPROVED_WIP,
  MOMENTS,
  PERIOD,
  PERIOD_BEFORE,
  POLICIES,
  average,
  countIn,
  finishedIn,
  metricsFor,
  moveCard,
  snapshot,
  type ColumnId,
  type MomentId,
} from "@/domain/kanban";
import { CARDS } from "@/domain/kanban";
import { formatDuration, formatStamp } from "@/domain/time";

const MOMENT_IDS: MomentId[] = ["m1", "m2", "m3"];

export function TableroView() {
  const params = useSearchParams();
  const requested = params.get("momento");
  const moment: MomentId = requested === "1" || requested === "m1" ? "m1" : requested === "2" || requested === "m2" ? "m2" : "m3";
  const captura = params.get("captura") === "1";
  const [attempt, setAttempt] = useState<string | null>(null);
  const board = snapshot(moment);
  const limits = moment === "m3" ? IMPROVED_WIP : { en_desarrollo: 2, pruebas: 2 };
  const done = finishedIn(CARDS, PERIOD.from, PERIOD.to);
  const metrics = metricsFor(done);
  const lead = average(metrics.map((item) => item.leadHours));
  const cycle = average(metrics.map((item) => item.cycleHours));
  const early = finishedIn(CARDS, PERIOD_BEFORE.from, PERIOD_BEFORE.to);

  function tryPull() {
    const result = moveCard(snapshot("m3"), "IL-12", "en_desarrollo", IMPROVED_WIP);
    setAttempt(result.ok ? "La tarjeta se movió." : result.error);
  }

  return (
    <div className="space-y-6" data-momento={moment}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-clay uppercase">Flujo del proyecto 6</p>
          <h1 className="font-heading text-4xl">Tablero Kanban</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Sistema pull. En desarrollo y en pruebas el máximo es dos. Después de la mejora, En
            revisión también tiene máximo dos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOMENT_IDS.map((id) => (
            <Link
              key={id}
              href={captura ? `/tablero?momento=${id}&captura=1` : `/tablero?momento=${id}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                moment === id ? "bg-ink text-paper" : "bg-card text-ink"
              }`}
            >
              {MOMENTS[id].title}
            </Link>
          ))}
        </div>
      </div>

      <p className="rounded-2xl bg-[#f8efd2] px-3 py-2 text-sm text-[#6a4b10]">
        Simulación identificada. {MOMENTS[moment].caption} Las fechas de las tarjetas no son un
        registro de horas reales. El prototipo se construyó el 23 de noviembre de 2026.
      </p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMN_ORDER.map((column) => {
          const cards = board.filter((card) => card.column === column);
          const limit = limits[column as ColumnId];
          const full = limit !== undefined && cards.length >= limit;
          return (
            <section
              key={column}
              className="w-64 shrink-0 rounded-3xl bg-[#132e24] p-3 text-[#f6f1e7]"
            >
              <header className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-medium">{COLUMN_LABEL[column]}</h2>
                <span className={`text-xs ${full ? "text-gold" : "text-[#f6f1e7]/70"}`}>
                  {cards.length}
                  {limit !== undefined ? ` / ${limit}` : ""}
                </span>
              </header>
              <div className="space-y-2">
                {cards.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-white/20 px-2 py-3 text-xs text-white/60">
                    Sin tarjetas. El trabajo se jala, no se empuja.
                  </p>
                )}
                {cards.map((card) => {
                  const started = visible(card.startedAt, MOMENTS[moment].at);
                  const finished = visible(card.finishedAt, MOMENTS[moment].at);
                  return (
                    <article key={card.id} className="rounded-2xl bg-[#fffaf3] p-2 text-ink">
                      <p className="text-[11px] text-clay">
                        {card.id} · {memberShort(card.ownerId)}
                      </p>
                      <h3 className="text-sm leading-snug font-medium">{card.title}</h3>
                      <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                        {card.acceptance}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Pedida {formatStamp(card.requestedAt)}
                        {started ? ` · Inicio ${formatStamp(started)}` : ""}
                        {finished ? ` · Fin ${formatStamp(finished)}` : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {moment === "m3" && !captura && (
        <div className="rounded-3xl border border-border bg-card p-4">
          <h2 className="font-heading text-2xl">Probar el límite</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            IL-12 está en Por hacer. En desarrollo ya tiene {countIn(board, "en_desarrollo")}{" "}
            tarjetas.
          </p>
          <Button className="mt-3" variant="outline" onClick={tryPull}>
            Intentar jalar IL-12 a En desarrollo
          </Button>
          {attempt && <p className="mt-3 text-sm">{attempt}</p>}
        </div>
      )}

      {!captura && (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <Metric
              label="Tiempo de entrega medio"
              value={formatDuration(lead)}
              note="Fin menos solicitud, en las seis tarjetas hechas."
            />
            <Metric
              label="Tiempo de ciclo medio"
              value={formatDuration(cycle)}
              note="Fin menos inicio de desarrollo."
            />
            <Metric
              label="Cantidad terminada"
              value={`${done.length}`}
              note={`${early.length} ya estaban hechas el 12 de noviembre. Período ${PERIOD.label}.`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl">Políticas de entrada y salida</h2>
              <ul className="mt-3 space-y-3">
                {POLICIES.map((policy) => (
                  <li key={policy.id} className="rounded-3xl bg-card p-3 text-sm">
                    <p className="font-medium">{COLUMN_LABEL[policy.id]}</p>
                    <p className="text-muted-foreground">Entra: {policy.enters}</p>
                    <p className="text-muted-foreground">Sale: {policy.leaves}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-moss p-4 text-primary-foreground">
                <h2 className="font-heading text-2xl">Definición de terminado</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {DEFINITION_OF_DONE.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-border bg-card p-4 text-sm">
                <h2 className="font-heading text-2xl">Mejora acordada</h2>
                <p className="mt-2">{IMPROVEMENT.bottleneck}</p>
                <p className="mt-2">{IMPROVEMENT.agreement}</p>
                <p className="mt-2 text-muted-foreground">Antes: {IMPROVEMENT.before}</p>
                <p className="text-muted-foreground">Después: {IMPROVEMENT.after}</p>
                <Link href="/informe" className="mt-3 inline-block text-moss">
                  Ver el informe de la unidad
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function visible(iso: string | null, momentAt: string) {
  if (!iso) return null;
  return new Date(iso).getTime() <= new Date(momentAt).getTime() ? iso : null;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
