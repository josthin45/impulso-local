"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAY_LABEL, DAY_ORDER, formatWindow, toMinutes } from "@/domain/time";
import type { TimeWindow, Weekday } from "@/domain/types";
import { useApp } from "@/components/providers";

export function PerfilView() {
  const app = useApp();
  const person = app.active;
  const [headline, setHeadline] = useState(person.headline);
  const [skills, setSkills] = useState(person.skills.join(", "));
  const [interests, setInterests] = useState(person.interests.join(", "));
  const [availability, setAvailability] = useState<TimeWindow[]>(person.availability);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeadline(person.headline);
    setSkills(person.skills.join(", "));
    setInterests(person.interests.join(", "));
    setAvailability(person.availability);
    setError(null);
  }, [person]);

  function save() {
    if (person.role === "voluntario") {
      for (const window of availability) {
        if (toMinutes(window.end) <= toMinutes(window.start)) {
          setError("En cada franja, la hora de fin va después de la de inicio.");
          return;
        }
      }
    }
    setError(null);
    app.updateProfile({
      headline: headline.trim() || person.headline,
      skills: skills.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
      interests: interests.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
      availability,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-xs tracking-wide text-clay uppercase">Identidad ficticia</p>
        <h1 className="font-heading text-4xl">{person.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {person.role === "organizador" ? "Organizador" : "Voluntario"}
          {person.organization ? ` · ${person.organization}` : ""}. Este perfil no es una cuenta real.
        </p>
      </div>

      <div className="grid gap-1">
        <Label>Presentación</Label>
        <Input value={headline} onChange={(event) => setHeadline(event.target.value)} />
      </div>
      <div className="grid gap-1">
        <Label>Habilidades</Label>
        <Input value={skills} onChange={(event) => setSkills(event.target.value)} />
      </div>
      <div className="grid gap-1">
        <Label>Intereses</Label>
        <Input value={interests} onChange={(event) => setInterests(event.target.value)} />
      </div>

      {person.role === "voluntario" && (
        <section className="space-y-2">
          <h2 className="font-heading text-2xl">Disponibilidad</h2>
          {availability.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin franjas. Los retos van a advertir que el horario no coincide.
            </p>
          )}
          {availability.map((window, index) => (
            <div key={`${window.day}-${index}`} className="grid grid-cols-[1fr_auto_auto_auto] gap-2">
              <Select
                value={window.day}
                onValueChange={(value) => {
                  if (!value) return;
                  setAvailability((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, day: value as Weekday } : item,
                    ),
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_ORDER.map((day) => (
                    <SelectItem key={day} value={day}>
                      {DAY_LABEL[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="time"
                value={window.start}
                onChange={(event) =>
                  setAvailability((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, start: event.target.value } : item,
                    ),
                  )
                }
              />
              <Input
                type="time"
                value={window.end}
                onChange={(event) =>
                  setAvailability((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, end: event.target.value } : item,
                    ),
                  )
                }
              />
              <Button
                variant="outline"
                onClick={() =>
                  setAvailability((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
              >
                Quitar
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              setAvailability((current) => [
                ...current,
                { day: "sab", start: "09:00", end: "12:00" },
              ])
            }
          >
            Agregar franja
          </Button>
          {availability.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Ahora: {availability.map(formatWindow).join("; ")}
            </p>
          )}
        </section>
      )}

      {error && <p className="text-sm text-[#6d2410]">{error}</p>}
      <Button onClick={save}>Guardar perfil</Button>
    </div>
  );
}
