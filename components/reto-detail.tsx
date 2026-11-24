"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { confirmedCount, remainingSpots } from "@/domain/capacity";
import { APPLICATION_LABEL, STATUS_LABEL } from "@/domain/labels";
import { scheduleWarning } from "@/domain/schedule";
import { formatWindow } from "@/domain/time";
import { useApp } from "@/components/providers";

export function RetoDetail() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const [note, setNote] = useState("");
  const challenge = app.challenges.find((item) => item.id === id);

  if (!challenge) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-6">
        <h1 className="font-heading text-3xl">Ese reto no está en la demostración</h1>
        <Link href="/retos" className="mt-3 inline-block text-sm text-moss">
          Volver a los retos
        </Link>
      </div>
    );
  }

  const organizer = app.people.find((person) => person.id === challenge.organizerId);
  const taken = confirmedCount(app.applications, challenge.id);
  const remaining = remainingSpots(challenge, app.applications);
  const isOrganizer = app.active.id === challenge.organizerId;
  const mine = app.applications.find(
    (application) =>
      application.challengeId === challenge.id &&
      application.volunteerId === app.active.id &&
      application.status !== "rechazada",
  );
  const warning =
    app.active.role === "voluntario"
      ? scheduleWarning(app.active.availability, challenge.schedule)
      : null;
  const evidence = app.evidences.find(
    (item) => item.challengeId === challenge.id && item.volunteerId === app.active.id,
  );
  const relatedNotices = app.notices.filter(
    (notice) => notice.cancelledChallengeId === challenge.id,
  );
  const applications = app.applications.filter(
    (application) => application.challengeId === challenge.id,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="space-y-5">
        <div>
          <p className="text-xs tracking-wide text-clay uppercase">
            {STATUS_LABEL[challenge.status]} · {challenge.neighborhood}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl">{challenge.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{challenge.summary}</p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Info label="Horario" value={formatWindow(challenge.schedule)} />
          <Info label="Cupos" value={`${taken} confirmados de ${challenge.spots}`} />
          <Info label="Habilidades" value={challenge.skills.join(", ")} />
          <Info label="Intereses" value={challenge.interests.join(", ") || "Sin intereses"} />
          <Info label="Organiza" value={organizer?.name ?? "Organización"} />
          <Info label="Criterio de cierre" value={challenge.closingCriteria} />
        </dl>

        {app.active.role === "voluntario" && (
          <section className="rounded-3xl border border-border bg-card p-4">
            <h2 className="font-heading text-2xl">Tu lugar en este reto</h2>
            {!mine && (challenge.status === "abierto" || challenge.status === "en_curso") && (
              <div className="mt-3 space-y-3">
                {warning && (
                  <p
                    data-testid={`warning-${challenge.id}`}
                    className="rounded-2xl bg-[#f8efd2] px-3 py-2 text-sm text-[#6a4b10]"
                  >
                    {warning}
                  </p>
                )}
                {remaining <= 0 ? (
                  <p className="text-sm">No quedan cupos libres. No se abre otra postulación.</p>
                ) : (
                  <Button
                    data-testid={`apply-${challenge.id}`}
                    onClick={() => app.apply(challenge.id)}
                  >
                    Postularme
                  </Button>
                )}
                <p className="text-sm text-muted-foreground">
                  Postularte no te confirma. El organizador decide.
                </p>
              </div>
            )}
            {mine?.status === "postulada" && (
              <p className="mt-3 text-sm">
                Postulación pendiente. Nadie te confirmó todavía
                {mine.scheduleWarning ? ` Advertencia registrada: ${mine.scheduleWarning}` : "."}
              </p>
            )}
            {mine?.status === "confirmada" && (
              <div className="mt-3 space-y-3">
                <p className="text-sm">Tu cupo quedó confirmado.</p>
                {(challenge.status === "en_curso" || challenge.status === "en_cierre") &&
                  !evidence && (
                    <form
                      className="space-y-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        app.deliverEvidence(challenge.id, note);
                        setNote("");
                      }}
                    >
                      <Textarea
                        data-testid={`evidence-${challenge.id}`}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Qué hiciste, con una frase concreta."
                      />
                      <Button type="submit">Entregar evidencia</Button>
                    </form>
                  )}
                {evidence && (
                  <p className="text-sm text-muted-foreground">Evidencia: {evidence.note}</p>
                )}
              </div>
            )}
            {mine?.status === "liberada" && (
              <p className="mt-3 text-sm">
                Tu postulación quedó liberada. No se te inscribió en otro reto.
              </p>
            )}
            {challenge.status === "en_cierre" && (
              <Button
                className="mt-3"
                variant="outline"
                data-testid={`validate-${challenge.id}`}
                onClick={() => app.closeChallenge(challenge.id)}
              >
                Intentar validar el cierre
              </Button>
            )}
          </section>
        )}

        {isOrganizer && (
          <section className="space-y-3">
            <h2 className="font-heading text-2xl">Postulaciones</h2>
            {applications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nadie se ha postulado. Publicar el reto no inscribió a nadie.
              </p>
            )}
            {applications.map((application) => {
              const volunteer = app.people.find((person) => person.id === application.volunteerId);
              return (
                <div key={application.id} className="rounded-3xl border border-border bg-card p-4">
                  <p className="font-medium">{volunteer?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {APPLICATION_LABEL[application.status]}
                    {application.scheduleWarning
                      ? ` · Horario incompatible: ${application.scheduleWarning}`
                      : ""}
                  </p>
                  {application.status === "postulada" &&
                    (challenge.status === "abierto" || challenge.status === "en_curso") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        data-testid={`confirm-${application.id}`}
                        onClick={() => app.confirm(application.id)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        variant="outline"
                        data-testid={`reject-${application.id}`}
                        onClick={() => app.reject(application.id)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {remaining <= 0 && challenge.status !== "cancelado" && challenge.status !== "cerrado" && (
              <p className="text-sm text-[#6d2410]">
                Cupos completos: {taken} de {challenge.spots}. Otra confirmación será rechazada.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {challenge.status === "abierto" && (
                <Button data-testid={`start-${challenge.id}`} onClick={() => app.start(challenge.id)}>
                  Iniciar actividad
                </Button>
              )}
              {challenge.status === "en_curso" && (
                <Button
                  data-testid={`request-${challenge.id}`}
                  onClick={() => app.askClosure(challenge.id)}
                >
                  Pedir cierre
                </Button>
              )}
              {challenge.status === "en_cierre" && (
                <Button
                  data-testid={`validate-${challenge.id}`}
                  onClick={() => app.closeChallenge(challenge.id)}
                >
                  Validar cierre
                </Button>
              )}
              {challenge.status !== "cerrado" && challenge.status !== "cancelado" && (
                <Button
                  variant="outline"
                  data-testid={`cancel-${challenge.id}`}
                  onClick={() => app.cancel(challenge.id)}
                >
                  Cancelar reto
                </Button>
              )}
            </div>
          </section>
        )}

        {!isOrganizer && app.active.role === "organizador" && (
          <p className="text-sm text-muted-foreground">
            Este reto lo organiza {organizer?.name}. No puedes confirmar cupos ni validar el cierre.
          </p>
        )}

        {relatedNotices.length > 0 && (
          <section data-testid="alternatives" className="rounded-3xl bg-[#fff4ea] p-4">
            <h2 className="font-heading text-2xl">Alternativas ofrecidas, sin inscripción</h2>
            {relatedNotices.map((notice) => {
              const volunteer = app.people.find((person) => person.id === notice.volunteerId);
              return (
                <div key={notice.id} className="mt-2 text-sm">
                  <p>{volunteer?.name} quedó libre.</p>
                  <ul className="mt-1 list-disc pl-5">
                    {notice.alternatives.map((alternative) => {
                      const option = app.challenges.find(
                        (item) => item.id === alternative.challengeId,
                      );
                      return (
                        <li key={alternative.challengeId}>
                          {option?.title ?? alternative.challengeId}. No se creó postulación.
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
        )}
      </article>
      <aside className="h-fit rounded-3xl border border-border bg-card p-4 text-sm">
        <h2 className="font-heading text-xl">Qué no hace este reto</h2>
        <ul className="mt-2 space-y-2 text-muted-foreground">
          <li>Aparecer como recomendación no crea una postulación.</li>
          <li>Un horario incompatible se advierte y no se esconde.</li>
          <li>El cupo solo baja cuando el organizador confirma.</li>
          <li>La evidencia no cierra el reto.</li>
          <li>Cancelar ofrece otras opciones y no inscribe solas.</li>
        </ul>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
