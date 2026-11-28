# ImpulsoLocal

Prototipo del Proyecto 6 de **IS-505 Modelado ágil de software**. Conecta estudiantes con retos breves de comunidad según habilidades y disponibilidad. Hay dos papeles: voluntario y organizador.

Docente: Gómez Calderón Israel Julio.

Equipo Kanban–XP:

- Josthin Stalin Garcia Choez
- Andres Gabriel Calucho Quijano
- Mateo Issac Gonzales Reina

Las personas del barrio (Camila, Luis, Ana, Diego, Mariana, Héctor y Rosa) son identidades ficticias de la demostración.

## Qué se puede hacer

- Publicar un reto con habilidades, horario, cupos y criterio de cierre.
- Ver un perfil mínimo y editar habilidades, intereses y disponibilidad.
- Recibir una recomendación explicada. La coincidencia no inscribe.
- Postularse. Si el horario no coincide, el sistema advierte y deja la decisión al organizador.
- Confirmar a mano sin pasar el cupo.
- Entregar evidencia, pedir el cierre y validarlo. Solo el organizador del reto valida.
- Cancelar un reto y ofrecer alternativas sin inscripción automática.
- Revisar el panel de participación.
- Abrir el tablero Kanban de la Unidad 3, el informe y el portafolio de la Unidad 4.
- Verificar el estado operativo y la versión desplegada en `/api/health`.

## Recorrido

1. Entra como Camila Ortiz y lee la recomendación del club de lectura.
2. Postúlate. La postulación queda pendiente.
3. Cambia a Luis Mora y abre el registro de raciones. Su horario no cubre: el aviso pide confirmación y cancelar no crea la postulación.
4. Entra como Mariana Vélez, confirma a Camila y comprueba el cupo.
5. Inicia la actividad, entrega la evidencia como Camila y valida el cierre como Mariana. Como Luis, la validación se rechaza.
6. Entra como Héctor Cedeño y cancela el mapeo de reciclaje. Ana ve alternativas y no queda inscrita.

El tablero está en `/tablero`. El informe de la unidad 3 está en `/informe`. El portafolio de la unidad 4 está en `/portafolio`. Los PDF quedan en `public/ImpulsoLocal-Kanban-Unidad3.pdf` y `public/ImpulsoLocal-Portafolio-Unidad4.pdf`. Los diagramas editables están en `docs/diagramas/`.

Las fechas de las tarjetas del tablero son una simulación identificada del 3 al 21 de noviembre de 2026 (hora de Guayaquil). Sirven para el tiempo de entrega, el tiempo de ciclo y la cantidad terminada. El prototipo y las pruebas son del 23 de noviembre de 2026.

## Requisitos y entorno local reproducible

### Requisitos previos

- **Node.js 20 LTS** (alineado con GitHub Actions y el contenedor de producción) o **Bun 1.3+** para ejecución local rápida.
- **Docker** (opcional, para validar el despliegue reproducible en contenedor).

### Configuración de variables de entorno

Copia la plantilla sin secretos [`.env.example`](.env.example) a `.env.local` (ignorado por Git):

```bash
cp .env.example .env.local
```

Variables operativas soportadas:

- `PORT`: puerto HTTP (por defecto `3847`).
- `NEXT_PUBLIC_APP_ENV`: entorno reportado por `/api/health` (`local`, `ci`, `staging`, `production`).
- `APP_VERSION`: versión desplegada reportada por `/api/health` (por defecto `0.1.0`).
- `HEALTHCHECK_TOKEN`: token opcional para validar `/api/health?check=strict` mediante la cabecera `x-healthcheck-token` (nunca se versiona ni se registra en logs).

### Ejecución local

Con **Bun** (entorno local del equipo):

```bash
bun install
bun run lint
bun run test
bun run build
bun run dev
```

Con **npm** (reproducible con `package-lock.json`, igual que en CI):

```bash
npm ci
npm run lint
npm test
npm run build
npm run dev
```

La aplicación escucha en `http://localhost:3847`.

### Ejecución reproducible con Docker

```bash
docker build --build-arg APP_VERSION=0.1.0 --build-arg NEXT_PUBLIC_APP_ENV=local -t impulso-local:0.1.0 .
docker run --rm -p 3847:3847 --env-file .env.example impulso-local:0.1.0
```

Verificación rápida del endpoint operativo:

```bash
# Recorrido principal (200 OK)
curl -i http://localhost:3847/api/health

# Caso de error controlado (400 Bad Request)
curl -i "http://localhost:3847/api/health?check=invalido"

# Caso de error controlado (405 Method Not Allowed)
curl -i -X POST http://localhost:3847/api/health
```

## Estrategia de ramas y Pull Requests

El equipo trabaja con integración continua sobre ramas cortas:

- `main`: rama protegida y siempre desplegable. Solo recibe cambios mediante Pull Request con checks de CI en verde.
- `feature/<id-o-descripcion>`: nuevas capacidades o historias (por ejemplo, `feature/il-05-confirmacion-cupos` o `feature/practica-devops`).
- `fix/<id-o-descripcion>`: correcciones de defectos o regresiones (por ejemplo, `fix/healthcheck-status`).

Reglas de cada Pull Request:

1. Referenciar la **historia de usuario** (`IL-XX`), el **criterio de aceptación** y la **prueba automatizada** que lo verifica.
2. Pasar el pipeline de GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): instalación reproducible (`npm ci`), ESLint, verificación de tipos (`tsc --noEmit`), pruebas (`Vitest`) y `next build`.
3. Contar con **revisión entre pares** (al menos un integrante distinto al autor) antes de hacer merge a `main`.

## Guía operativa y documentación DevOps

Toda la documentación técnica para despliegue, pipeline CI, prueba fallida controlada, logs, secretos, rollback y trazabilidad está disponible en [`docs/devops.md`](docs/devops.md).
