"use client";

import Link from "next/link";
import { ApplyButton } from "@/components/apply-button";
import { recommend } from "@/domain/recommendations";
import { scheduleWarning } from "@/domain/schedule";
import { STATUS_LABEL } from "@/domain/labels";
import { formatWindow } from "@/domain/time";
import { useApp } from "@/components/providers";

const STEPS = [
  "Entra como Camila Ortiz. El club de lectura explica habilidades, horario y cupos. Todavía no hay postulación suya.",
  "Pulsa Postularme en el club. El horario cubre, así que no pide confirmación extra. El estado queda en postulada, no en confirmada.",
  "Cambia a Luis Mora y abre el registro de raciones. Su horario no cubre: Postularme abre un aviso y no envía nada hasta que lo confirme.",
  "Entra como Mariana Vélez, confirma a Camila e intenta confirmar a alguien más: el club tiene un solo cupo.",
  "Vuelve a Camila, inicia el reto como Mariana, entrega la evidencia y pide el cierre. Luis no puede validarlo. Mariana sí.",
  "Entra como Héctor Cedeño y cancela el mapeo de reciclaje. Ana ve alternativas y no queda inscrita en ellas.",
];

export function HomeView() {
  const app = useApp();
  const person = app.active;
  const activeApps = app.applications.filter(
    (item) =>
      item.volunteerId === person.id &&
      (item.status === "postulada" || item.status === "confirmada"),
  );
  const recommendations =
    person.role === "voluntario"
      ? recommend(person, app.challenges, app.applications).filter(
          (item) => !activeApps.some((application) => application.challengeId === item.challengeId),
        )
      : [];
  const notices = app.notices.filter((notice) => notice.volunteerId === person.id);
  const mine = app.challenges.filter((challenge) => challenge.organizerId === person.id);
  const pending = app.applications.filter(
    (application) =>
      application.status === "postulada" &&
      mine.some((challenge) => challenge.id === application.challengeId),
  );

  if (!app.ready) {
    return (
      <p role="status" data-testid="loading-demo" className="text-sm text-muted-foreground">
        Cargando la demostración…
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section>
          <p className="text-sm text-clay">Datos de demostración</p>
          <h1 className="font-heading text-4xl text-ink md:text-5xl">
            {person.role === "voluntario"
              ? "Retos que coinciden contigo"
              : "Retos a tu cargo"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {person.headline}. Una coincidencia no ocupa un cupo: hace falta postularse y que el
            organizador confirme.
          </p>
        </section>

        {notices.map((notice) => (
          <section
            key={notice.id}
            data-testid={`notice-${notice.volunteerId}`}
            className="rounded-3xl border border-clay/40 bg-[#fff4ea] p-4"
          >
            <h2 className="font-heading text-2xl">
              Se canceló «{notice.cancelledTitle}»
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu postulación quedó liberada. Estas alternativas no te inscriben.
            </p>
            <ul className="mt-3 space-y-2">
              {notice.alternatives.length === 0 && (
                <li className="text-sm">No hay otro reto abierto con tus habilidades.</li>
              )}
              {notice.alternatives.map((alternative) => {
                const challenge = app.challenges.find(
                  (item) => item.id === alternative.challengeId,
                );
                if (!challenge) return null;
                return (
                  <li key={alternative.challengeId}>
                    <Link href={`/retos/${challenge.id}`} className="font-medium text-moss">
                      {challenge.title}
                    </Link>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {alternative.reasons[0]} Sin postulación automática.
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {person.role === "voluntario" && recommendations.length === 0 && (
          <section
            data-testid="empty-recommendations"
            className="rounded-3xl border border-dashed border-border bg-card p-6"
          >
            <h2 className="font-heading text-2xl">Ningún reto abierto coincide</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hace falta al menos una habilidad en común y un cupo libre. Revisa tu perfil o espera
              una publicación nueva.
            </p>
          </section>
        )}

        {person.role === "voluntario" &&
          recommendations.map((recommendation) => {
            const challenge = app.challenges.find(
              (item) => item.id === recommendation.challengeId,
            );
            if (!challenge) return null;
            return (
              <article
                key={recommendation.challengeId}
                data-testid={`recommendation-${challenge.id}`}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wide text-clay uppercase">
                      Coincidencia {recommendation.score} puntos · no inscrita
                    </p>
                    <h2 className="font-heading text-3xl">{challenge.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {challenge.neighborhood} · {formatWindow(challenge.schedule)} ·{" "}
                      {challenge.spots} {challenge.spots === 1 ? "cupo" : "cupos"}
                    </p>
                  </div>
                  <ApplyButton
                    challengeId={challenge.id}
                    warning={scheduleWarning(person.availability, challenge.schedule)}
                    testId={`apply-${challenge.id}`}
                  />
                </div>
                <p className="mt-3 text-sm">{challenge.summary}</p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {recommendation.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </article>
            );
          })}

        {person.role === "organizador" && (
          <div className="space-y-3">
            {mine.map((challenge) => {
              const waiting = app.applications.filter(
                (application) =>
                  application.challengeId === challenge.id && application.status === "postulada",
              );
              return (
                <Link
                  key={challenge.id}
                  href={`/retos/${challenge.id}`}
                  className="block rounded-3xl border border-border bg-card p-4"
                >
                  <p className="text-xs text-clay">{STATUS_LABEL[challenge.status]}</p>
                  <h2 className="font-heading text-2xl">{challenge.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {waiting.length} {waiting.length === 1 ? "postulación pendiente" : "postulaciones pendientes"}
                  </p>
                </Link>
              );
            })}
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tienes postulaciones pendientes. Publica un reto o espera a que alguien se postule.
              </p>
            )}
          </div>
        )}

        {person.role === "voluntario" && activeApps.length > 0 && (
          <section>
            <h2 className="font-heading text-2xl">Tus postulaciones</h2>
            <ul className="mt-2 space-y-2">
              {activeApps.map((application) => {
                const challenge = app.challenges.find((item) => item.id === application.challengeId);
                if (!challenge) return null;
                return (
                  <li key={application.id}>
                    <Link href={`/retos/${challenge.id}`} className="text-moss">
                      {challenge.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      · {application.status === "confirmada" ? "confirmada" : "pendiente de confirmación"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <aside className="h-fit rounded-3xl bg-moss p-5 text-primary-foreground">
        <p className="text-xs tracking-[0.14em] uppercase text-gold">Recorrido de demostración</p>
        <h2 className="font-heading mt-1 text-2xl">Seis pasos, sin atajos</h2>
        <ol className="mt-4 space-y-3 text-sm leading-relaxed">
          {STEPS.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="font-heading text-gold">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
