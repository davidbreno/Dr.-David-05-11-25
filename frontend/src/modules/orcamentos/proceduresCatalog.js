// Catálogo de procedimentos odontológicos (ordem alfabética)
// Valores são sugestivos; podem ser editados no item ao adicionar.

export const proceduresCatalog = [
  { id: 'clareamento-a-laser', name: 'Clareamento a laser', defaultValue: 0 },
  { id: 'clareamento-caseiro', name: 'Clareamento caseiro', defaultValue: 0 },
  { id: 'cunha-distal', name: 'Cunha distal', defaultValue: 0 },
  { id: 'curativo', name: 'Curativo', defaultValue: 0 },
  { id: 'exodontia', name: 'Exodontia', defaultValue: 0 },
  { id: 'exodontia-resto-radicular', name: 'Exodontia de resto radicular', defaultValue: 0 },
  { id: 'exodontia-siso-erupcionado', name: 'Exodontia de siso erupcionado', defaultValue: 0 },
  { id: 'exodontia-siso-incluso', name: 'Exodontia de siso incluso', defaultValue: 0 },
  { id: 'exodontia-siso-semi-erupcionado', name: 'Exodontia de siso semi-erupcionado', defaultValue: 0 },
  { id: 'gengivoplastia', name: 'Gengivoplastia', defaultValue: 0 },
  { id: 'implante-unitario-parte-cirurgica', name: 'Implante unitário - parte cirúrgica', defaultValue: 0 },
  { id: 'implante-unitario-parte-protetica', name: 'Implante unitário - parte protética', defaultValue: 0 },
  { id: 'pino-fibra-vidro', name: 'Pino de fibra de vidro', defaultValue: 0 },
  { id: 'profilaxia-raspagem-fluor', name: 'Profilaxia + raspagem + flúor', defaultValue: 0 },
  { id: 'provisorio', name: 'Provisório', defaultValue: 0 },
  { id: 'raspagem', name: 'Raspagem', defaultValue: 0 },
  { id: 'raspagem-subgengival', name: 'Raspagem subgengival', defaultValue: 0 },
  { id: 'restauracao', name: 'Restauração', defaultValue: 0 },
  { id: 'restauracao-cervical', name: 'Restauração cervical', defaultValue: 0 },
  { id: 'ulectomia', name: 'Ulectomia', defaultValue: 0 },
]

export function filterProcedures(q) {
  const term = (q || '').toLowerCase()
  if (!term) return proceduresCatalog
  return proceduresCatalog.filter(p => p.name.toLowerCase().includes(term))
}
