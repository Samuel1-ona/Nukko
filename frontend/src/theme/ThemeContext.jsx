import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { THEMES, THEME_IDS, DEFAULT_THEME } from './themes.js';

const STORAGE_KEY = 'nk_theme';
const ThemeCtx = createContext(null);

function readStored() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return THEME_IDS.includes(stored) ? stored : DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(readStored);
  const theme = THEMES[themeId];

  // Publish the active theme as CSS custom properties so plain CSS
  // (index.css) can theme itself without every rule going through React.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--nk-primary', theme.primary);
    root.setProperty('--nk-secondary', theme.secondary);
    root.setProperty('--nk-primary-rgb', theme.primaryRGB);
    root.setProperty('--nk-secondary-rgb', theme.secondaryRGB);
    root.setProperty('--nk-gradient', theme.gradient);
  }, [theme]);

  const setTheme = useCallback((id) => {
    if (!THEME_IDS.includes(id)) return;
    localStorage.setItem(STORAGE_KEY, id);
    setThemeId(id);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, themeId, setTheme, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
