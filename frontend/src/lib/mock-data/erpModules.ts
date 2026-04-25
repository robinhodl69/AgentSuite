export type ErpModule = {
  slug: 'finanzas' | 'compras' | 'operaciones' | 'rrhh'
  title: string
  description: string
  status: string
  processes?: string[]
  href: string
  cta: string
  featured?: boolean
}

export const erpModules: ErpModule[] = [
  {
    slug: 'finanzas',
    title: 'Finanzas',
    description:
      'Tesoreria, pagos y control presupuestal operados desde una consola financiera con agentes.',
    href: '/erp/finanzas',
    cta: 'Entrar',
    status: 'Activo',
    featured: true,
    processes: [
      'Conciliacion bancaria asistida',
      'Revision de pagos a proveedores',
      'Control presupuestal por area',
    ],
  },
  {
    slug: 'compras',
    title: 'Compras',
    description:
      'Solicitudes, abastecimiento y aprobaciones para controlar el ciclo completo de compra.',
    status: 'Preview',
    href: '/erp/compras',
    cta: 'Ver modulo',
    processes: [
      'Solicitud de compra con aprobacion por monto',
      'Comparativo automatico de proveedores',
      'Seguimiento de ordenes y recepcion',
    ],
  },
  {
    slug: 'operaciones',
    title: 'Operaciones',
    description:
      'Seguimiento diario de ejecucion, incidencias y cumplimiento operativo por equipo.',
    status: 'Preview',
    href: '/erp/operaciones',
    cta: 'Ver modulo',
    processes: [
      'Asignacion de tareas por turno y prioridad',
      'Control de incidencias y escalamiento',
      'Monitoreo diario de cumplimiento operativo',
    ],
  },
  {
    slug: 'rrhh',
    title: 'RR. HH.',
    description:
      'Procesos de personas, ausencias e incidencias internas en un solo espacio operativo.',
    status: 'Preview',
    href: '/erp/rrhh',
    cta: 'Ver modulo',
    processes: [
      'Alta de colaborador con checklist de onboarding',
      'Solicitud de vacaciones y ausencias',
      'Revision y aprobacion de incidencias',
    ],
  },
]

export function getErpModule(slug: ErpModule['slug']) {
  return erpModules.find((module) => module.slug === slug)
}
