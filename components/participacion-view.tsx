"use client";

import Link from "next/link";
import { APPLICATION_LABEL, STATUS_LABEL } from "@/domain/labels";
import { toMinutes } from "@/domain/time";
import type { Application, Challenge } from "@/domain/types";
import { useApp } from "@/components/providers";

function committedHours(personId: string, applications: Application[], challenges: Challenge[]) {
  const confirmed = new Set(
    applications
      .filter((application) => application.volunteerId === personId && application.status === "confirmada")
      .map((application) => application.challengeId),
  );
  const minutes = challenges.reduce((total, challenge) => {
    if (!confirmed.has(challenge.id) || challenge.status === "cancelado") return total;
    return total + (toMinutes(challenge.schedule.end) - toMinutes(challenge.schedule.start));
  }, 0);
  return minutes / 60;
}

export function ParticipacionView() {
  const app = useApp();
  const person = app.active;

  if (person.role === "organizador") {
    const mine = app.challenges.filter((challenge) => challenge.organizerId === person.id);
    const closed = mine.filter((challenge) => challenge.status === "cerrado").length;
    return (
      <div className="space-y-5">
        <Header name={person.name} text="Panel de los retos que organizas en la demostración." />
        <Stats
          items={[
            ["Publicados", mine.length],
            ["Cerrados", closed],
            ["Cancelados", mine.filter((challenge) => challenge.status === "cancelado").length],
          ]}
        />
        {mine.length === 0 ? (
          <Empty text="Todavía no publicas un reto. En Retos puedes abrir uno con cupos y criterio de cierre." />
        ) : (
          <List>
            {mine.map((challenge) => (
              <li key={challenge.id}>
                <Link href={`/retos/${challenge.id}`} className="font-medium text-moss">
                  {challenge.title}
                </Link>
                <span className="text-sm text-muted-foreground"> · {STATUS_LABEL[challenge.status]}</span>
              </li>
            ))}
          </List>
        )}
      </div>
    );
  }

  const mine = app.applications.filter((application) => application.volunteerId === person.id);
  const confirmed = mine.filter((application) => application.status === "confirmada");
  const evidences = app.evidences.filter((evidence) => evidence.volunteerId === person.id);
  const closed = confirmed.filter((application) => {
    const challenge = app.challenges.find((item) => item.id === application.challengeId);
    return challenge?.status === "cerrado";
  }).length;
  const hours = committedHours(person.id, app.applications, app.challenges);

  return (
    <div className="space-y-5">
      <Header
        name={person.name}
        text="Postulaciones, cupos confirmados, evidencias y horas. Nada de esto se llena solo por una coincidencia."
      />
      <Stats
        items={[
          ["Postulaciones", mine.length],
          ["Confirmadas", confirmed.length],
          ["Evidencias", evidences.length],
          ["Cierres", closed],
          ["Horas comprometidas", hours],
        ]}
      />
      {mine.length === 0 ? (
        <Empty text="Todavía no te postulas. En Inicio verás recomendaciones explicadas; postularte es un paso aparte." />
      ) : (
        <List>
          {mine.map((application) => {
            const challenge = app.challenges.find((item) => item.id === application.challengeId);
            if (!challenge) return null;
            return (
              <li key={application.id}>
                <Link href={`/retos/${challenge.id}`} className="font-medium text-moss">
                  {challenge.title}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {" "}
                  · {APPLICATION_LABEL[application.status]} · {STATUS_LABEL[challenge.status]}
                </span>
              </li>
            );
          })}
        </List>
      )}
    </div>
  );
}

function Header({ name, text }: { name: string; text: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-clay uppercase">Panel de participación</p>
      <h1 className="font-heading text-4xl">{name}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Stats({ items }: { items: [string, number][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-3xl bg-card px-3 py-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="font-heading text-3xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 rounded-3xl border border-border bg-card p-4">{children}</ul>;
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-3xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
