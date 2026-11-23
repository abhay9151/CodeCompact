import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'codecompact-theme'

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false
  let savedTheme: string | null = null
  try {
    savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  if (savedTheme) return savedTheme === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const getSavedTheme = () => {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(getInitialDarkMode)
  const [hasSavedTheme, setHasSavedTheme] = useState(getSavedTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    if (hasSavedTheme) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
      } catch {
        // The selected theme still applies for this page view.
      }
    }
  }, [hasSavedTheme, isDark])

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      onClick={() => {
        setHasSavedTheme(true)
        setIsDark((current) => !current)
      }}
      className="inline-flex size-11 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors duration-200 hover:border-accent hover:text-ink"
    >
      {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  )
}
