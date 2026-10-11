export type ThemeMode = 'light' | 'dark'

export function useTheme() {
  const theme = useState<ThemeMode>('theme', () => 'light')

  function apply(mode: ThemeMode) {
    theme.value = mode
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = mode
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('theme', mode)
      } catch {
        // ignore storage errors (private mode, blocked storage)
      }
    }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  function init() {
    if (typeof document === 'undefined') return
    const current = document.documentElement.dataset.theme
    theme.value = current === 'dark' ? 'dark' : 'light'
  }

  return { theme, apply, toggle, init }
}
