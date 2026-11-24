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
- Abrir el tablero Kanban de la Unidad 3 y el informe para Moodle.

## Recorrido

1. Entra como Camila Ortiz y lee la recomendación del club de lectura.
2. Postúlate. La postulación queda pendiente.
3. Cambia a Luis Mora, abre el club y mira el aviso de horario.
4. Entra como Mariana Vélez, confirma a Camila y comprueba el cupo.
5. Inicia la actividad, entrega la evidencia como Camila y valida el cierre como Mariana. Como Luis, la validación se rechaza.
6. Entra como Héctor Cedeño y cancela el mapeo de reciclaje. Ana ve alternativas y no queda inscrita.

El tablero está en `/tablero`. El informe está en `/informe`. El PDF de la entrega, cuando se genera, queda en `public/ImpulsoLocal-Kanban-Unidad3.pdf`.

Las fechas de las tarjetas del tablero son una simulación identificada del 3 al 21 de noviembre de 2026 (hora de Guayaquil). Sirven para el tiempo de entrega, el tiempo de ciclo y la cantidad terminada. El prototipo y las pruebas son del 23 de noviembre de 2026.

## Cómo correrlo

```bash
npm install
npm test
npm run dev
```

La aplicación de desarrollo escucha en el puerto 3847. `npm test` ejecuta las reglas, los permisos, las transiciones y el límite WIP.
