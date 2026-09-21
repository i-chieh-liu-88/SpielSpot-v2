export const themes = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'system', label: 'System' },
] as const

export type ThemeName = (typeof themes)[number]['name']
