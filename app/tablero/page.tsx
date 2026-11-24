import { Suspense } from "react";
import { TableroView } from "@/components/tablero-view";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando el tablero…</p>}>
      <TableroView />
    </Suspense>
  );
}
