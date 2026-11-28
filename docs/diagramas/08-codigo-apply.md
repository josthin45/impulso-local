# Vista de código — applyToChallenge

Archivo: `domain/applications.ts`. Versión 2, 27 de noviembre de 2026.

Responsabilidad: crear una postulación en estado `postulada`. No confirma y no ocupa cupo.

Guardia nueva: si `scheduleWarning` devuelve un texto, la función exige `scheduleAcknowledged === true`. Si no llega esa confirmación, devuelve error y no crea la postulación. Cuando la confirmación llega, guarda el aviso y deja la decisión del cupo al organizador.

La versión 1, vigente en la entrega del 23 de noviembre, creaba la postulación en cuanto el voluntario pulsaba Postularme.
