"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { COURSE } from "@/domain/course";
import { useApp } from "@/components/providers";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/retos", label: "Retos" },
  { href: "/perfil", label: "Perfil" },
  { href: "/participacion", label: "Participación" },
  { href: "/reglas", label: "Reglas" },
  { href: "/tablero", label: "Tablero" },
  { href: "/informe", label: "Informe" },
  { href: "/portafolio", label: "Portafolio" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const captura = useSearchParams().get("captura") === "1";
  const app = useApp();

  if (path === "/informe" || path === "/portafolio") {
    const portfolio = path === "/portafolio";
    return (
      <div>
        <div className="no-print border-b border-border bg-paper/90">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
            <Link href={portfolio ? "/" : "/tablero"} className="text-sm font-medium text-moss">
              {portfolio ? "Volver al prototipo" : "Volver al tablero"}
            </Link>
            <a
              href={
                portfolio
                  ? "/ImpulsoLocal-Portafolio-Unidad4.pdf"
                  : "/ImpulsoLocal-Kanban-Unidad3.pdf"
              }
              className="text-sm font-medium text-moss"
            >
              Descargar PDF
            </a>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/80 bg-[#fffaf3]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-clay uppercase">
                {COURSE.code} · {COURSE.subject}
              </p>
              <Link href="/" className="font-heading text-3xl text-ink">
                ImpulsoLocal
              </Link>
              <p className="max-w-xl text-sm text-muted-foreground">
                Retos breves en Guayaquil. La coincidencia se explica. La plaza se confirma a mano.
              </p>
            </div>
            {!captura && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={app.reset}>
                  Reiniciar demostración
                </Button>
              </div>
            )}
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1">
            {LINKS.map((link) => {
              const active = path === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
                    active ? "bg-moss text-primary-foreground" : "text-ink hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {!captura && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Identidades ficticias. Elige con quién recorres la demo.
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {app.people.map((person) => {
                const selected = person.id === app.activePersonId;
                return (
                  <button
                    key={person.id}
                    type="button"
                    data-testid={`person-${person.id}`}
                    onClick={() => app.setActive(person.id)}
                    className={`min-w-40 rounded-2xl border px-3 py-2 text-left ${
                      selected
                        ? "border-moss bg-moss text-primary-foreground"
                        : "border-border bg-card text-ink"
                    }`}
                  >
                    <span className="block text-sm font-medium">{person.name}</span>
                    <span className={`block text-xs ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {person.role === "organizador" ? "Organizador" : "Voluntario"}
                      {person.organization ? ` · ${person.organization}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </header>
      {app.message && (
        <div
          role="status"
          className={`border-b px-4 py-3 text-sm ${
            app.message.tone === "err"
              ? "bg-[#f8e4d8] text-[#6d2410]"
              : app.message.tone === "warn"
                ? "bg-[#f8efd2] text-[#6a4b10]"
                : "bg-[#e5f0e8] text-[#1e4636]"
          }`}
        >
          <p className="mx-auto max-w-6xl">{app.message.text}</p>
        </div>
      )}
      <main
        className={
          path === "/tablero"
            ? "px-4 py-6 md:px-6"
            : "mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
