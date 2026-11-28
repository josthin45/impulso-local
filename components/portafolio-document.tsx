import { COURSE, TEAM } from "@/domain/course";
import {
  BpmnFigure,
  ClassFigure,
  ComponentFigure,
  ContainerFigure,
  ContextFigure,
  SequenceFigure,
  StateFigure,
} from "@/components/portfolio-figures";

const REPO = "https://github.com/josthin45/impulso-local";

const STORIES = [
  ["IL-01", "Andres Gabriel Calucho Quijano", "Publicar un reto con habilidades, horario, cupos y criterio de cierre.", "Un organizador publica solo si indica habilidades, horario válido, cupos y un criterio de cierre."],
  ["IL-02", "Mateo Issac Gonzales Reina", "Perfil mínimo con habilidades, intereses e identidad ficticia.", "Cada persona de la demo tiene habilidades, intereses y disponibilidad, y se presenta como identidad ficticia."],
  ["IL-03", "Josthin Stalin Garcia Choez", "Recomendar con reglas visibles y sin inscribir.", "La recomendación explica habilidades, intereses, horario y cupos. No crea una postulación."],
  ["IL-04", "Andres Gabriel Calucho Quijano", "Postular y advertir si el horario no coincide.", "La postulación queda pendiente. Si el horario no cubre, se muestra una advertencia. Desde el 27 de noviembre hay que confirmarla; confirmar no bloquea el envío."],
  ["IL-05", "Josthin Stalin Garcia Choez", "Confirmar a mano sin pasar el cupo.", "Solo el organizador del reto confirma. Si las confirmadas ya igualan los cupos, la siguiente confirmación se rechaza."],
];

const TRACE = [
  ["IL-01 / publicar completo", "Clase Reto; tarea Publicar; contenedor web", "domain/publish.ts · /retos", "Publicar vacío muestra el error y no crea el reto", "Observado: el diálogo sigue abierto"],
  ["IL-02 / identidad ficticia", "Clase Persona, ficticia = verdadero", "domain/seed.ts · /perfil", "El perfil dice que no es una cuenta real", "Observado en la pantalla de perfil"],
  ["IL-03 / no inscribe", "Clase Recomendación, inscrita = falso", "domain/recommendations.ts · Inicio", "Prueba «una recomendación no crea ni confirma una postulación»", "La lista de postulaciones no cambia al calcular"],
  ["IL-04 / aviso confirmado", "Secuencia v2; BPMN v2; guardia de Postulación", "domain/applications.ts · diálogo", "Prueba «exige confirmar el aviso y, al confirmar, no bloquea»", "Cancelar no crea postulación; confirmar la deja pendiente"],
  ["IL-05 / cupo", "Decisión de cupo en el BPMN; transición confirmada", "domain/applications.ts · ficha del reto", "Prueba «no confirma si los cupos ya están llenos»", "La segunda confirmación del club se rechaza"],
];

export function PortafolioDocument() {
  return (
    <article className="informe mx-auto max-w-4xl bg-white px-2 py-6 text-[12.5px] leading-relaxed text-ink">
      <header>
        <p className="text-xs tracking-[0.16em] text-clay uppercase">
          {COURSE.code} · {COURSE.subject}
        </p>
        <h1 className="font-heading text-4xl">ImpulsoLocal</h1>
        <p className="text-lg">Portafolio de modelado y validación del prototipo</p>
        <p className="mt-2">
          {COURSE.project}. Unidad 4, apartados 4.1 a 4.4. Docente: {COURSE.teacher}. {COURSE.teamName}:{" "}
          {TEAM.map((member) => member.name).join("; ")}.
        </p>
        <p>Documento del 27 de noviembre de 2026. El prototipo de reglas es del 23 de noviembre; el cambio de esta unidad es del 27.</p>
      </header>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Alcance</h2>
        <p className="mt-1">
          El recorrido de valor es el paso de una coincidencia explicada a un cupo confirmado. Un
          voluntario lee por qué un reto le queda cerca, se postula y espera. El organizador de ese
          reto confirma sin pasar el número de cupos. Publicar y recomendar no inscriben a nadie.
        </p>
        <p className="mt-2">
          Entran cinco historias ya construidas en el prototipo. Quedan fuera de los diagramas el
          cierre por evidencia y la cancelación con alternativas: existen en el código y en el
          tablero de la unidad 3, y aquí solo se nombran cuando una transición los toca.
        </p>
        <table className="mt-3 w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th>ID</th>
              <th>Responsable</th>
              <th>Criterio de aceptación</th>
            </tr>
          </thead>
          <tbody>
            {STORIES.map(([id, owner, title, acceptance]) => (
              <tr key={id}>
                <td><strong>{id}</strong> {title}</td>
                <td>{owner}</td>
                <td>{acceptance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Glosario y reglas</h2>
        <p className="mt-1">
          <strong>Persona.</strong> Identidad ficticia con rol de voluntario u organizador. No es una cuenta real.
          <strong> Franja.</strong> Día y horas en que esa persona puede participar.
          <strong> Reto.</strong> Actividad breve con habilidades, horario, cupos, criterio de cierre y estado.
          <strong> Recomendación.</strong> Explicación de la coincidencia. El campo inscrita queda en falso.
          <strong> Postulación.</strong> Intención pendiente. No ocupa cupo.
          <strong> Aviso de horario.</strong> Texto cuando la disponibilidad no cubre el reto o solo lo cruza.
          <strong> Confirmó el aviso.</strong> Dato de la versión 2: el voluntario aceptó leer ese texto antes de que exista la postulación.
          <strong> Cupo.</strong> Máximo de postulaciones confirmadas.
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Solo un organizador publica, y el formulario rechaza título, resumen, barrio, habilidad, cupos o criterio de cierre incompletos.</li>
          <li>Una recomendación exige reto abierto, cupo libre y al menos una habilidad en común. No crea una postulación.</li>
          <li>La postulación nace en estado postulada. Si hay aviso y nadie confirmó su lectura, el dominio no la crea.</li>
          <li>Confirmar el aviso no cambia el estado a confirmada. El cupo lo decide el organizador del reto.</li>
          <li>Si las confirmadas ya igualan los cupos, otra confirmación se rechaza.</li>
        </ol>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Clases</h2>
        <p className="mt-1">
          Persona concentra identidad y disponibilidad. Reto concentra lo que el organizador publica
          y el estado del ciclo. Recomendación es un resultado de consulta: explica y no guarda una
          inscripción. Postulación guarda la intención, el aviso y, desde esta unidad, si ese aviso
          fue confirmado. La multiplicidad de Franja es de cero a muchas porque un organizador puede
          no declarar disponibilidad. Un reto recibe muchas postulaciones y una persona puede tener
          varias, nunca dos activas en el mismo reto.
        </p>
        <figure className="mt-2">
          <ClassFigure />
          <figcaption>Clases del recorrido. La versión editable está en docs/diagramas/01-clases.mmd.</figcaption>
        </figure>
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Secuencia</h2>
        <p className="mt-1">
          El camino principal es el de Camila Ortiz en el club de lectura: el horario cubre, Postularme
          llama a apply y la respuesta es postulada, sin aviso. La excepción es Luis Mora en el registro
          de raciones: el horario no cubre, la interfaz abre el diálogo y el dominio solo crea la
          postulación si llega la confirmación. Cancelar corta la secuencia. El mensaje al organizador
          sale después, con línea discontinua: es otro participante, no el siguiente paso interno.
        </p>
        <figure className="mt-2">
          <SequenceFigure />
          <figcaption>Secuencia vigente, versión 2. La versión 1 está en 02-secuencia-v1.mmd.</figcaption>
        </figure>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Estados del reto</h2>
        <p className="mt-1">
          La entidad con ciclo de vida es el reto, no la recomendación. Publicar lo deja abierto.
          Iniciar lo pasa a en curso. Pedir el cierre lo deja en cierre, y solo el organizador de ese
          reto puede validar y cerrarlo. Desde abierto, en curso o en cierre puede cancelarse. Cerrado
          y cancelado no tienen salida: un defecto nuevo no reabre la misma ficha. Postular, recomendar
          o entregar una nota no son transiciones de este diagrama. El cambio de esta unidad agrega una
          guardia en el nacimiento de la postulación, no un estado nuevo del reto.
        </p>
        <figure className="mt-2">
          <StateFigure />
          <figcaption>Estados en domain/transitions.ts. Editable: docs/diagramas/03-estados-reto.mmd.</figcaption>
        </figure>
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Proceso</h2>
        <p className="mt-1">
          Hay dos participantes: voluntario y organizador. El inicio es un reto abierto. Las tareas
          del voluntario se encadenan con flujo de secuencia: leer la coincidencia, decidir el horario
          y, si hace falta, leer el aviso. La excepción es el horario que no cubre. Si no confirma,
          el proceso termina sin postulación. Si confirma, o si el horario ya cubría, la secuencia
          sigue a Postularme. De ahí sale un flujo de mensaje, dibujado en discontinuo, hacia el
          organizador. Él revisa y decide el cupo. Sin cupo, el fin es la excepción de rechazo. Con
          cupo, el fin es la confirmación. La versión 1 no tenía la decisión del aviso: Postularme
          seguía siempre.
        </p>
        <figure className="mt-2">
          <BpmnFigure />
          <figcaption>BPMN versión 2. La versión 1 está en docs/diagramas/04-bpmn-v1.mmd.</figcaption>
        </figure>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Arquitectura</h2>
        <p className="mt-1">
          En contexto hay dos personas y un solo sistema. No hay correo, pago ni red social: el
          prototipo no depende de otro software. En contenedores, todo ocurre en el navegador. La
          aplicación web pinta las pantallas. El módulo de dominio calcula reglas y no tiene servidor
          propio. localStorage guarda la demostración en esa máquina. No es una base compartida entre
          compañeros.
        </p>
        <figure className="mt-2">
          <ContextFigure />
          <figcaption>Contexto. Editable: docs/diagramas/05-c4-contexto.mmd.</figcaption>
        </figure>
        <figure className="mt-2">
          <ContainerFigure />
          <figcaption>Contenedores. Editable: docs/diagramas/06-c4-contenedores.mmd.</figcaption>
        </figure>
        <p className="mt-3">
          Dentro de la aplicación web, Shell elige la identidad ficticia. Inicio lista coincidencias.
          La ficha postula, confirma y muestra el cupo. Publicar valida el formulario. El diálogo de
          advertencia es el componente nuevo de la versión 2 y solo llama al dominio si la persona
          confirma. El dominio sigue siendo quien acepta o rechaza.
        </p>
        <figure className="mt-2">
          <ComponentFigure />
          <figcaption>Componentes del contenedor web. Editable: docs/diagramas/07-c4-componentes.mmd.</figcaption>
        </figure>
        <h3 className="font-heading mt-3 text-xl">Vista de código</h3>
        <p className="mt-1">
          <code>applyToChallenge</code> en <code>domain/applications.ts</code> crea la postulación.
          Antes de crearla calcula el aviso. Si hay aviso y <code>scheduleAcknowledged</code> no es
          verdadero, devuelve error y no agrega la postulación. Si el horario cubre, el aviso es nulo
          y no pide esa bandera. Si la bandera llega, guarda el aviso y deja el estado en postulada.
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md bg-[#f6f1e8] p-3 text-[11px] leading-snug">{`const warning = scheduleWarning(volunteer.availability, challenge.schedule);
if (warning && input.scheduleAcknowledged !== true) {
  return err("Lee la advertencia de horario y confírmala. El aviso no impide postular, pero la postulación no se envía sola.");
}`}</pre>
        <h3 className="font-heading mt-3 text-xl">Decisión</h3>
        <p className="mt-1">
          <strong>Problema.</strong> En la versión del 23 de noviembre, Postularme creaba la postulación
          en el mismo clic. El aviso quedaba como una frase dentro de la explicación y era fácil
          enviarla sin haberla leído.
        </p>
        <p className="mt-2">
          <strong>Alternativas.</strong> Impedir toda postulación cuando el horario no cubre. Dejar el
          clic único y confiar en el texto. Pedir una confirmación explícita y, si llega, permitir la
          postulación pendiente.
        </p>
        <p className="mt-2">
          <strong>Elección.</strong> La tercera. IL-04 ya había decidido que el aviso no bloquea: quien
          confirma el cupo es el organizador. La versión 2 obliga a leer el aviso y mantiene esa decisión.
        </p>
        <p className="mt-2">
          <strong>Consecuencias.</strong> Camila, con horario compatible, sigue en un clic. Luis ve un
          diálogo, y cancelar no deja rastro. El dominio rechaza la llamada sin confirmación, así que
          la regla no depende solo del botón. Hay un paso más cuando el horario no cubre. El ciclo del
          reto no cambia.
        </p>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Trazabilidad</h2>
        <p className="mt-1">
          Cada fila ata un criterio con un elemento del modelo, un punto del prototipo, una prueba y
          el resultado visto el 27 de noviembre. Las pruebas automáticas están en domain/rules.test.ts.
        </p>
        <table className="mt-3 w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th>Historia y criterio</th>
              <th>Modelo</th>
              <th>Prototipo</th>
              <th>Prueba</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {TRACE.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Cambio de requisito</h2>
        <p className="mt-1">
          El requisito nuevo dice: si el horario no cubre, la postulación no se crea hasta que el
          voluntario confirme que leyó el aviso. Confirmar no la pasa a confirmada.
        </p>
        <p className="mt-2">
          Se actualizó la clase Postulación con «confirmó el aviso». La secuencia pasó de v1 a v2 y
          ganó el cuadro alt. El BPMN ganó la decisión del aviso y el fin sin envío. El diagrama de
          estados del reto se mantuvo y se anotó que la guardia pertenece a la postulación. En C4 se
          agregó el componente Diálogo v2. En código se agregó la guardia de <code>applyToChallenge</code> y
          la prueba que cubre el rechazo y el envío. En el prototipo, Inicio y la ficha abren el diálogo
          antes de llamar al dominio. La recomendación sigue sin inscribir, y la confirmación de cupo
          no se tocó.
        </p>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Prototipo</h2>
        <p className="mt-1">
          El recorrido se navega en la raíz del prototipo, con las identidades ficticias de la barra.
          El camino principal es Camila en el club de lectura. El alternativo es Luis en el registro de
          raciones: puede cancelar el aviso o confirmarlo. También están el estado vacío, la carga, el
          error y la confirmación.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Vacío.</strong> Si un voluntario queda sin habilidades en común, Inicio dice «Ningún reto abierto coincide».</li>
          <li><strong>Carga.</strong> Al abrir, mientras se restaura la demostración, se lee «Cargando la demostración…». Al publicar o postular, el botón pasa a «Publicando…» o «Enviando…» y queda inactivo.</li>
          <li><strong>Error.</strong> Publicar sin título deja el diálogo abierto y muestra el texto del dominio, con el rol de alerta, no solo un cambio de color.</li>
          <li><strong>Confirmación.</strong> El diálogo se titula «Advertencia de horario». Los botones se llaman Cancelar y Postularme de todos modos. El aviso de éxito queda en la franja superior y dice que la postulación sigue pendiente.</li>
        </ul>
        <p className="mt-2">
          Las etiquetas de los controles son texto, no solo color. El aviso usa marrón sobre crema y el
          error usa granate sobre un fondo claro. La navegación del recorrido está en Inicio, Retos,
          Perfil y la ficha. Reiniciar demostración vuelve a los datos semilla.
        </p>
        <figure className="mt-3">
          <img src="/capturas/u4-aviso.png" alt="Diálogo de advertencia de horario antes de postular" />
          <figcaption>Luis Mora, registro de raciones. Postularme abre el aviso y todavía no hay postulación.</figcaption>
        </figure>
        <figure className="mt-3">
          <img src="/capturas/u4-error.png" alt="Error al publicar un reto sin título" />
          <figcaption>Mariana Vélez publica sin título. El diálogo permanece y muestra el error.</figcaption>
        </figure>
        <figure className="mt-3">
          <img src="/capturas/u4-vacio.png" alt="Estado vacío cuando no hay coincidencias" />
          <figcaption>Sin habilidades en común, Inicio muestra el estado vacío.</figcaption>
        </figure>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Validación</h2>
        <p className="mt-1">
          El 27 de noviembre de 2026 se recorrió el prototipo en ejecución, en el puerto 3847. Una
          persona cambió de papel con las identidades ficticias: Camila Ortiz como voluntaria con
          horario compatible, Luis Mora como voluntario con horario incompatible y Mariana Vélez como
          organizadora. Los nombres del barrio son datos ficticios. No hubo participantes externos al
          equipo y no se atribuyen citas a Andres ni a Mateo. Lo que sigue es lo que hizo la pantalla
          en esa pasada, no una simulación de resultados. Las fechas del tablero Kanban de la unidad 3
          siguen siendo la simulación identificada del 3 al 21 de noviembre y no se usan aquí.
        </p>
        <h3 className="font-heading mt-3 text-xl">Guion</h3>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Entra como Camila. En Inicio, abre la coincidencia del club de lectura y pulsa Postularme. Anota si aparece un diálogo y en qué estado queda la postulación.</li>
          <li>Reinicia. Entra como Luis. En el registro de raciones pulsa Postularme. Primero cancela. Comprueba que no existe postulación. Vuelve a pulsar y confirma el aviso. Anota el estado y si el texto del aviso quedó guardado.</li>
          <li>Entra como Mariana. Abre Publicar y pulsa Publicar con el título vacío. Anota si se creó un reto y qué texto aparece.</li>
        </ol>
        <p className="mt-2">
          La tarea afectada por el problema mayor es la 2. Antes del cambio, el mismo botón creaba la
          postulación en el primer clic. Después, cancelar no crea nada y confirmar la deja pendiente.
        </p>
        <table className="mt-3 w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Resultado observado</th>
              <th>Problema</th>
              <th>Mejora</th>
              <th>Nueva comprobación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Camila postula al club</td>
              <td>Postularme no abre diálogo. La franja dice que la postulación sigue pendiente. La coincidencia deja de ofrecerse como si ya estuviera inscrita.</td>
              <td>Ninguno en este camino. El horario cubre.</td>
              <td>Se mantiene el clic único cuando no hay aviso.</td>
              <td>Sigue igual después del cambio de la tarea 2.</td>
            </tr>
            <tr>
              <td>2. Luis y el horario del comedor</td>
              <td>Antes: un clic creaba la postulación y el aviso llegaba después, dentro del mensaje. Después de cancelar, la lista de postulaciones de Luis sigue vacía. Al confirmar, queda pendiente y el mensaje repite el aviso.</td>
              <td>El primer clic enviaba la postulación sin un paso para leer el aviso.</td>
              <td>Diálogo de confirmación y guardia en applyToChallenge.</td>
              <td>Cancelar no crea postulación. Confirmar la deja en postulada, con aviso, sin ocuparle el cupo.</td>
            </tr>
            <tr>
              <td>3. Mariana publica sin título</td>
              <td>El botón pasa a Publicando… y luego el diálogo muestra «El reto necesita un título.» No aparece un reto nuevo.</td>
              <td>El error existía en la franja de la página y el diálogo podía taparlo.</td>
              <td>El mismo texto queda dentro del diálogo, con rol de alerta.</td>
              <td>El diálogo sigue abierto y el texto se lee sin cerrarlo.</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2">
          El problema mayor era el de la tarea 2, porque una postulación podía nacer sin que la persona
          hubiera aceptado el aviso. La tarea 1 y la tarea 3 se usaron para ver que el camino compatible
          y el error de publicación seguían en pie. La comparación de la tarea 2 es la de esta tabla:
          antes salía la postulación en el primer clic; después hace falta el segundo botón, y cancelar
          es un fin distinto.
        </p>
      </section>

      <section className="break">
        <h2 className="font-heading text-2xl">Uso de asistencia</h2>
        <p className="mt-1">
          Un asistente de programación propuso el diálogo, la guardia de <code>scheduleAcknowledged</code> y
          el primer borrador de los diagramas a partir del código de <code>domain/</code>. La comprobación
          fue la suite de pruebas y el recorrido del 27 de noviembre en el navegador. La decisión humana
          del equipo, ya escrita en IL-04, se mantiene: el aviso no bloquea la postulación. Por eso se
          descartó impedir el envío y se eligió la confirmación.
        </p>
        <p className="mt-2">
          No se usó asistencia para inventar resultados de la validación ni para reescribir las fechas
          del tablero de la unidad 3. Esas fechas siguen marcadas allí como simulación. Los diagramas
          editables son los archivos <code>.mmd</code> del repositorio; lo impreso es la versión 2.
        </p>
        <h3 className="font-heading mt-3 text-xl">Aporte de cada integrante</h3>
        <p className="mt-1">
          <strong>Josthin Stalin Garcia Choez.</strong> Reglas de la recomendación y del cupo, clases de
          Recomendación y Postulación, y la decisión de pedir confirmación sin convertir el aviso en un bloqueo.
        </p>
        <p className="mt-2">
          <strong>Andres Gabriel Calucho Quijano.</strong> Publicación del reto, perfil ficticio, postulación
          con aviso y el diálogo de la versión 2 en Inicio y en la ficha.
        </p>
        <p className="mt-2">
          <strong>Mateo Issac Gonzales Reina.</strong> Ciclo de vida del reto, separación entre este
          recorrido y la evidencia de cierre, y el guion de las tres tareas.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="font-heading text-2xl">Enlaces y demostración</h2>
        <p className="mt-1">
          Repositorio: {REPO}. Prototipo: la raíz del proyecto, ruta <strong>/</strong>. Este portafolio: <strong>/portafolio</strong>.
          PDF: <code>public/ImpulsoLocal-Portafolio-Unidad4.pdf</code>. Diagramas editables, con la versión 1
          y la versión 2 de la secuencia y del proceso: <code>docs/diagramas/</code>.
        </p>
        <p className="mt-2">
          Guion de seis minutos. Minuto 0: Camila lee la coincidencia del club y se postula; queda pendiente.
          Minuto 2: Luis abre el registro de raciones, cancela el aviso y comprueba que no hay postulación;
          luego confirma y queda pendiente. Minuto 4: Mariana intenta publicar sin título y lee el error.
          Minuto 5: se quitan las habilidades de un voluntario y aparece el estado vacío. Minuto 6: Reiniciar
          demostración. El video no se grabó; la demostración es ese recorrido sobre el prototipo.
        </p>
      </section>

      <style>{`
        .break { break-before: page; }
        figure { break-inside: avoid; margin: 8px 0 12px; }
        figcaption { margin-top: 4px; font-size: 11px; color: #5c564c; }
        table { border: 1px solid #d9d0c2; }
        th, td { border: 1px solid #d9d0c2; padding: 4px 6px; vertical-align: top; text-align: left; }
        th { background: #f3eee4; font-weight: 600; }
        pre { break-inside: avoid; white-space: pre-wrap; }
        .informe img { display: block; width: 100%; height: auto; background: #f3eee4; }
        @page { size: A4; margin: 11mm 12mm; }
      `}</style>
    </article>
  );
}
