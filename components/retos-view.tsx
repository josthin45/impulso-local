"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_LABEL } from "@/domain/labels";
import { confirmedCount } from "@/domain/capacity";
import { DAY_LABEL, DAY_ORDER, formatWindow } from "@/domain/time";
import type { Weekday } from "@/domain/types";
import { useApp } from "@/components/providers";

export function RetosView() {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [neighborhood, setNeighborhood] = useState("Guayaquil");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [day, setDay] = useState<Weekday>("sab");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("12:00");
  const [spots, setSpots] = useState("2");
  const [closingCriteria, setClosingCriteria] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function publish() {
    if (pending) return;
    setPending(true);
    setFormError(null);
    window.setTimeout(() => {
      const created = app.publish({
        title,
        summary,
        neighborhood,
        skills: skills.split(","),
        interests: interests.split(","),
        schedule: { day, start, end },
        spots: Number(spots),
        closingCriteria,
      });
      setPending(false);
      if (created === true) {
        setOpen(false);
        setTitle("");
        setSummary("");
        setClosingCriteria("");
        return;
      }
      setFormError(created);
    }, 500);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl">Retos del barrio</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cada reto declara habilidades, horario, cupos y el criterio con el que se cierra.
          </p>
        </div>
        {app.active.role === "organizador" && (
          <Button onClick={() => setOpen(true)}>Publicar reto</Button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {app.challenges.map((challenge) => {
          const organizer = app.people.find((person) => person.id === challenge.organizerId);
          const taken = confirmedCount(app.applications, challenge.id);
          return (
            <Link
              key={challenge.id}
              href={`/retos/${challenge.id}`}
              className="rounded-3xl border border-border bg-card p-4"
            >
              <p className="text-xs text-clay">{STATUS_LABEL[challenge.status]}</p>
              <h2 className="font-heading text-2xl">{challenge.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{challenge.summary}</p>
              <p className="mt-3 text-sm">
                {formatWindow(challenge.schedule)} · {taken} de {challenge.spots} cupos ·{" "}
                {challenge.neighborhood}
              </p>
              <p className="text-sm text-muted-foreground">
                {organizer?.name} · {challenge.skills.join(", ")}
              </p>
            </Link>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Publicar un reto</DialogTitle>
            <DialogDescription>
              Publicar no inscribe a nadie. Los cupos se ocupan solo con una confirmación humana.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            <Field label="Título">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </Field>
            <Field label="Qué se va a hacer">
              <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
            </Field>
            <Field label="Barrio">
              <Input
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
              />
            </Field>
            <Field label="Habilidades, separadas por coma">
              <Input value={skills} onChange={(event) => setSkills(event.target.value)} />
            </Field>
            <Field label="Intereses, separados por coma">
              <Input value={interests} onChange={(event) => setInterests(event.target.value)} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Día">
                <Select
                  value={day}
                  onValueChange={(value) => {
                    if (value) setDay(value as Weekday);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_ORDER.map((item) => (
                      <SelectItem key={item} value={item}>
                        {DAY_LABEL[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Inicio">
                <Input type="time" value={start} onChange={(event) => setStart(event.target.value)} />
              </Field>
              <Field label="Fin">
                <Input type="time" value={end} onChange={(event) => setEnd(event.target.value)} />
              </Field>
            </div>
            <Field label="Cupos">
              <Input
                type="number"
                min={1}
                max={30}
                value={spots}
                onChange={(event) => setSpots(event.target.value)}
              />
            </Field>
            <Field label="Criterio de cierre">
              <Textarea
                value={closingCriteria}
                onChange={(event) => setClosingCriteria(event.target.value)}
                placeholder="Qué evidencia vas a revisar antes de cerrar."
              />
            </Field>
          </div>
          {formError && (
            <p
              role="alert"
              data-testid="publish-error"
              className="rounded-2xl bg-[#f8e4d8] px-3 py-2 text-sm text-[#6d2410]"
            >
              {formError}
            </p>
          )}
          <DialogFooter>
            <Button data-testid="publish-submit" disabled={pending} onClick={publish}>
              {pending ? "Publicando…" : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
