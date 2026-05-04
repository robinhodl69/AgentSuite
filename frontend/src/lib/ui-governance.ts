/**
 * Frontend UI governance for the ERP console.
 *
 * Keep this file intentionally small and stable: it documents the rules that
 * shape the component system after the Ant Design migration.
 */

export const UI_LAYER_ORDER = ['pages', 'templates', 'organisms', 'molecules', 'atoms'] as const

export const UI_GOVERNANCE_RULES = [
  'Pages orchestrate data loading, routing, and composition only.',
  'Templates define page-level structure and may compose organisms.',
  'Organisms own complex ERP surfaces such as shells, workbenches, tables, and process selectors.',
  'Molecules combine atoms into compact reusable interaction patterns.',
  'Atoms wrap Ant Design primitives so product code does not depend on raw vendor components everywhere.',
  'Prefer imports from components/ui or atoms wrappers over direct antd imports in pages.',
  'Tailwind is reserved for layout, spacing, and small visual adjustments, not for rebuilding the design system.',
  'Theme tokens live in src/lib/ui-theme.tsx and visual primitives should align with those tokens before adding new colors or spacing.',
  'New ERP modules should reuse existing templates and organisms before creating page-specific UI.',
] as const

export const UI_SYSTEM_PATHS = {
  theme: 'frontend/src/lib/ui-theme.tsx',
  governance: 'frontend/src/lib/ui-governance.ts',
  atoms: 'frontend/src/components/atoms',
  organisms: 'frontend/src/components/organisms',
  wrappers: 'frontend/src/components/ui',
} as const
