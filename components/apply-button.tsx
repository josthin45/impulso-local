"use client";

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
import { useApp } from "@/components/providers";

const SEND_MS = 500;

export function ApplyButton({
  challengeId,
  warning,
  testId,
}: {
  challengeId: string;
  warning: string | null;
  testId: string;
}) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function send(scheduleAcknowledged: boolean) {
    if (pending) return;
    setPending(true);
    window.setTimeout(() => {
      app.apply(challengeId, scheduleAcknowledged);
      setPending(false);
      setOpen(false);
    }, SEND_MS);
  }

  return (
    <>
      <Button data-testid={testId} disabled={pending} onClick={() => (warning ? setOpen(true) : send(false))}>
        {pending && !open ? "Enviando…" : "Postularme"}
      </Button>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Advertencia de horario</DialogTitle>
            <DialogDescription>
              La postulación no se envía hasta que confirmes. Si confirmas, queda pendiente: el
              organizador decide el cupo.
            </DialogDescription>
          </DialogHeader>
          <p
            role="alert"
            data-testid={`ack-warning-${challengeId}`}
            className="rounded-2xl bg-[#f8efd2] px-3 py-2 text-sm text-[#6a4b10]"
          >
            {warning}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-testid={`ack-cancel-${challengeId}`}
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              data-testid={`ack-confirm-${challengeId}`}
              disabled={pending}
              onClick={() => send(true)}
            >
              {pending ? "Enviando…" : "Postularme de todos modos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
