'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'dark'

type ThemeCtx = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const Ctx = createContext<ThemeCtx | null>(null)

const STORAGE_KEY = 'pijulinho-theme'

/**
 * Inline script string injected into <head> via the root layout.
 * Runs synchronously before paint and applies the saved/system-preferred
 * theme to the <html> element, preventing a flash of the wrong theme (FOUC).
 *
 * The string is intentionally minified and self-contained so it can be
 * safely inlined with dangerouslySetInnerHTML.
 */
export const themeInitScript = `(function(){try{var k='${STORAGE_KEY}';var s=localStorage.getItem(k);var m=window.matchMedia('(prefers-color-scheme: dark)');var t=(s==='light'||s==='dark')?s:(m&&m.matches?'dark':'light');var d=document.documentElement;if(t==='dark'){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'light' on both server and first client render to keep
  // hydration in sync. The inline script in <head> has already applied the
  // correct `dark` class to <html> before paint, so the visible background
  // is correct from the first frame. After mount we read the real theme
  // from the DOM and sync our state.
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Sync state with whatever the inline script applied to <html>.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    const id = requestAnimationFrame(() => {
      setThemeState(isDark ? 'dark' : 'light')
      setMounted(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  // Persist + apply theme whenever it changes (after mount).
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore localStorage failures (private mode, quota, etc).
    }
  }, [theme, mounted])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return (
    <Ctx.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
