import type { ReactNode } from "react";

function Svg({
  label,
  children,
  height,
}: {
  label: string;
  children: ReactNode;
  height: number;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 720 ${height}`}
      width="100%"
      className="rounded-md border border-[#d9d0c2] bg-[#fbf8f2]"
    >
      {children}
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  lines,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="#fff" stroke="#1e4636" strokeWidth="1.4" />
      <rect x={x} y={y} width={w} height="22" rx="6" fill="#1e4636" />
      <rect x={x} y={y + 12} width={w} height="10" fill="#1e4636" />
      <text x={x + 8} y={y + 15} fill="#fff" fontSize="11" fontFamily="Georgia, serif">
        {title}
      </text>
      {lines.map((line, index) => (
        <text
          key={line}
          x={x + 8}
          y={y + 40 + index * 15}
          fill="#1c1915"
          fontSize="11"
          fontFamily="Calibri, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function ClassFigure() {
  return (
    <Svg label="Diagrama de clases del recorrido de postulación" height={430}>
      <Box x={16} y={16} w={210} h={118} title="Persona" lines={["id, nombre, rol", "habilidades, intereses", "ficticia = verdadero"]} />
      <Box x={250} y={16} w={180} h={88} title="Franja" lines={["día, inicio, fin"]} />
      <Box x={456} y={16} w={248} h={132} title="Reto" lines={["título, barrio, horario", "cupos, criterio de cierre", "estado"]} />
      <Box x={16} y={250} w={320} h={132} title="Recomendación" lines={["puntaje, razones", "ajuste de horario", "inscrita = falso"]} />
      <Box x={370} y={250} w={334} h={148} title="Postulación" lines={["estado: postulada, confirmada,", "rechazada o liberada", "aviso de horario", "confirmó el aviso  (v2)"]} />
      <line x1={226} y1={70} x2={250} y2={70} stroke="#1e4636" strokeWidth="1.2" />
      <text x={248} y={150} fill="#1e4636" fontSize="11" fontFamily="Calibri, sans-serif">1 disponibilidad *</text>
      <text x={300} y={168} fill="#1e4636" fontSize="11" fontFamily="Calibri, sans-serif">1 publica *</text>
      <line x1={436} y1={90} x2={456} y2={90} stroke="#1e4636" strokeWidth="1.2" />
      <text x={120} y={230} fill="#1e4636" fontSize="11" fontFamily="Calibri, sans-serif">1 consulta *</text>
      <line x1={110} y1={134} x2={110} y2={250} stroke="#1e4636" strokeWidth="1.2" />
      <text x={250} y={210} fill="#1e4636" fontSize="11" fontFamily="Calibri, sans-serif">Reto 1 explica *</text>
      <line x1={520} y1={148} x2={180} y2={250} stroke="#1e4636" strokeWidth="1.2" />
      <text x={200} y={418} fill="#1e4636" fontSize="11" fontFamily="Calibri, sans-serif">Persona 1 se postula *    ·    Reto 1 recibe *</text>
      <line x1={336} y1={320} x2={370} y2={320} stroke="#1e4636" strokeWidth="1.2" />
    </Svg>
  );
}

export function SequenceFigure() {
  return (
    <Svg label="Secuencia de postulación con la excepción de horario" height={390}>
      {["Voluntario", "Interfaz", "Dominio", "Organizador"].map((name, index) => (
        <g key={name}>
          <text x={70 + index * 180} y={28} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Georgia, serif">
            {name}
          </text>
          <line x1={70 + index * 180} y1={36} x2={70 + index * 180} y2={370} stroke="#c4b8a4" strokeWidth="1" />
        </g>
      ))}
      <path d="M70 58 H250" stroke="#1e4636" markerEnd="url(#arrow)" />
      <text x={90} y={52} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">1 ver coincidencia</text>
      <path d="M250 84 H430" stroke="#1e4636" />
      <text x={270} y={78} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">2 recommend()</text>
      <path d="M430 108 H250" stroke="#1e4636" strokeDasharray="4 3" />
      <text x={258} y={102} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">3 explicación, inscrita = falso</text>
      <rect x={28} y={128} width={520} height={200} fill="#f8efd2" stroke="#8a6a20" />
      <text x={36} y={146} fill="#6a4b10" fontSize="11" fontFamily="Georgia, serif">alt  horario</text>
      <text x={36} y={168} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">[cubre] 4 apply()  →  postulada, sin aviso</text>
      <text x={36} y={196} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">[no cubre] 5 diálogo de advertencia</text>
      <text x={48} y={220} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">[cancela] no se crea postulación</text>
      <text x={48} y={244} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">[confirma] 6 apply(confirmó aviso) → postulada con aviso</text>
      <text x={36} y={276} fill="#5c564c" fontSize="11" fontFamily="Calibri, sans-serif">La v1 saltaba este cuadro: un clic llamaba a apply().</text>
      <text x={36} y={308} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">7 mensaje - - -&gt; Organizador: postulación pendiente</text>
      <path d="M250 348 H610" stroke="#1e4636" strokeDasharray="5 4" />
      <text x={300} y={342} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">flujo de mensaje, no de secuencia</text>
    </Svg>
  );
}

export function StateFigure() {
  return (
    <Svg label="Estados del reto" height={250}>
      {[
        ["abierto", 40],
        ["en curso", 190],
        ["en cierre", 340],
        ["cerrado", 500],
      ].map(([name, x]) => (
        <g key={name}>
          <rect x={Number(x)} y={70} width={120} height={36} rx="18" fill="#fff" stroke="#1e4636" />
          <text x={Number(x) + 60} y={92} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Calibri, sans-serif">
            {name}
          </text>
        </g>
      ))}
      <rect x={190} y={160} width={120} height={36} rx="18" fill="#f8e4d8" stroke="#6d2410" />
      <text x={250} y={182} textAnchor="middle" fill="#6d2410" fontSize="12" fontFamily="Calibri, sans-serif">cancelado</text>
      <path d="M160 88 H190" stroke="#1e4636" />
      <path d="M310 88 H340" stroke="#1e4636" />
      <path d="M460 88 H500" stroke="#1e4636" />
      <path d="M100 106 V178 H190" stroke="#6d2410" fill="none" />
      <path d="M250 106 V160" stroke="#6d2410" />
      <path d="M400 106 V178 H310" stroke="#6d2410" fill="none" />
      <text x={168} y={64} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">iniciar</text>
      <text x={312} y={64} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">pedir cierre</text>
      <text x={468} y={64} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">validar</text>
      <text x={40} y={230} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">
        Solo el organizador del reto transita. Postular no cambia el estado. Cerrado y cancelado no salen.
      </text>
    </Svg>
  );
}

export function BpmnFigure() {
  return (
    <Svg label="Proceso BPMN de postulación y confirmación" height={360}>
      <rect x={12} y={12} width={696} height={200} fill="#f3f7f4" stroke="#1e4636" />
      <text x={24} y={32} fill="#1e4636" fontSize="12" fontFamily="Georgia, serif">Participante: Voluntario</text>
      <circle cx={48} cy={80} r={12} fill="#1e4636" />
      <text x={70} y={84} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">inicio</text>
      <rect x={140} y={62} width={130} height={36} rx="4" fill="#fff" stroke="#1e4636" />
      <text x={152} y={84} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">Leer coincidencia</text>
      <polygon points="300,80 324,58 348,80 324,102" fill="#fff" stroke="#1e4636" />
      <text x={360} y={76} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">¿cubre el horario?</text>
      <rect x={140} y={130} width={150} height={36} rx="4" fill="#fff8ea" stroke="#8a6a20" />
      <text x={150} y={152} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">Leer advertencia</text>
      <polygon points="330,148 354,126 378,148 354,170" fill="#fff" stroke="#8a6a20" />
      <text x={388} y={144} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">¿confirma?</text>
      <circle cx={560} cy={148} r={12} fill="#fff" stroke="#6d2410" strokeWidth="3" />
      <text x={578} y={152} fill="#6d2410" fontSize="11" fontFamily="Calibri, sans-serif">fin sin envío</text>
      <rect x={520} y={62} width={150} height={36} rx="4" fill="#fff" stroke="#1e4636" />
      <text x={548} y={84} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">Postularme</text>
      <text x={24} y={196} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">Flechas continuas: flujo de secuencia. La excepción es el camino del aviso.</text>
      <rect x={12} y={224} width={696} height={120} fill="#f7f1ea" stroke="#6d2410" />
      <text x={24} y={246} fill="#6d2410" fontSize="12" fontFamily="Georgia, serif">Participante: Organizador  ·  el sistema le envía un mensaje</text>
      <rect x={24} y={264} width={170} height={36} rx="4" fill="#fff" stroke="#6d2410" />
      <text x={36} y={286} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">Revisar postulación</text>
      <polygon points="240,282 264,260 288,282 264,304" fill="#fff" stroke="#6d2410" />
      <text x={300} y={278} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">¿queda cupo?</text>
      <circle cx={460} cy={282} r={12} fill="#fff" stroke="#1e4636" strokeWidth="3" />
      <text x={478} y={286} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">fin confirmada</text>
      <circle cx={460} cy={318} r={12} fill="#fff" stroke="#6d2410" strokeWidth="3" />
      <text x={478} y={322} fill="#6d2410" fontSize="11" fontFamily="Calibri, sans-serif">fin rechazada</text>
      <path d="M595 80 C 650 80, 650 250, 194 264" fill="none" stroke="#1e4636" strokeDasharray="5 4" />
    </Svg>
  );
}

export function ContextFigure() {
  return (
    <Svg label="C4 contexto" height={180}>
      <rect x={250} y={50} width={220} height={70} rx="8" fill="#1e4636" />
      <text x={360} y={80} textAnchor="middle" fill="#fff" fontSize="14" fontFamily="Georgia, serif">ImpulsoLocal</text>
      <text x={360} y={100} textAnchor="middle" fill="#e7f0ea" fontSize="11" fontFamily="Calibri, sans-serif">prototipo local</text>
      <rect x={24} y={60} width={140} height={50} rx="25" fill="#fff" stroke="#1e4636" />
      <text x={94} y={90} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Calibri, sans-serif">Voluntario</text>
      <rect x={556} y={60} width={140} height={50} rx="25" fill="#fff" stroke="#1e4636" />
      <text x={626} y={90} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Calibri, sans-serif">Organizador</text>
      <path d="M164 78 H250" stroke="#1e4636" />
      <path d="M470 92 H556" stroke="#1e4636" />
      <text x={168} y={72} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">consulta y se postula</text>
      <text x={478} y={86} fill="#5c564c" fontSize="10" fontFamily="Calibri, sans-serif">publica y confirma</text>
    </Svg>
  );
}

export function ContainerFigure() {
  return (
    <Svg label="C4 contenedores" height={210}>
      <rect x={16} y={16} width={688} height={178} rx="8" fill="none" stroke="#8a6a20" strokeDasharray="5 3" />
      <text x={28} y={36} fill="#8a6a20" fontSize="12" fontFamily="Georgia, serif">Navegador de la persona</text>
      <rect x={36} y={56} width={300} height={110} rx="6" fill="#1e4636" />
      <text x={186} y={100} textAnchor="middle" fill="#fff" fontSize="13" fontFamily="Georgia, serif">Aplicación web</text>
      <text x={186} y={122} textAnchor="middle" fill="#e7f0ea" fontSize="11" fontFamily="Calibri, sans-serif">Next.js · pantallas y diálogos</text>
      <rect x={380} y={56} width={290} height={50} rx="6" fill="#fff" stroke="#1e4636" />
      <text x={525} y={86} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Calibri, sans-serif">Módulo de dominio</text>
      <rect x={380} y={120} width={290} height={46} rx="6" fill="#fff" stroke="#1e4636" />
      <text x={525} y={148} textAnchor="middle" fill="#1c1915" fontSize="12" fontFamily="Calibri, sans-serif">localStorage de la demo</text>
    </Svg>
  );
}

export function ComponentFigure() {
  const items = [
    ["Shell", "elige la identidad ficticia"],
    ["Inicio", "lista coincidencias"],
    ["Ficha", "postula, confirma, evidencia"],
    ["Diálogo v2", "pide confirmar el aviso"],
    ["Publicar", "valida el formulario"],
    ["Dominio", "recommend, apply, confirm"],
  ];
  return (
    <Svg label="Componentes del contenedor web" height={220}>
      {items.map(([title, line], index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = 20 + col * 234;
        const y = 20 + row * 96;
        return (
          <g key={title}>
            <rect x={x} y={y} width={214} height={76} rx="6" fill="#fff" stroke="#1e4636" />
            <text x={x + 12} y={y + 30} fill="#1e4636" fontSize="13" fontFamily="Georgia, serif">{title}</text>
            <text x={x + 12} y={y + 52} fill="#1c1915" fontSize="11" fontFamily="Calibri, sans-serif">{line}</text>
          </g>
        );
      })}
    </Svg>
  );
}
