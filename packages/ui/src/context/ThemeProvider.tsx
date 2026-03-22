"use client";

/**
 * @ccatto/ui ThemeProvider
 * =======================
 *
 * React context for runtime theme switching.
 * Manages theme state, localStorage persistence, and DOM updates.
 *
 * Usage:
 *   import { ThemeProvider, useTheme } from '@ccatto/ui';
 *
 *   // Wrap your app
 *   <ThemeProvider defaultTheme="rleaguez">
 *     <App />
 *   </ThemeProvider>
 *
 *   // Use in components
 *   const { theme, setTheme, availableThemes } = useTheme();
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isValidTheme,
  THEMES,
  type ThemeName,
  type ThemeSpacing,
} from "../themes";

/** Valid spacing values for runtime validation */
const VALID_SPACINGS: ThemeSpacing[] = ["compact", "default", "comfortable"];

interface ThemeContextValue {
  /** Current active theme name */
  theme: ThemeName;
  /** Change the active theme */
  setTheme: (theme: ThemeName) => void;
  /** List of all available theme names */
  availableThemes: readonly ThemeName[];
  /** Whether the theme has been loaded from storage */
  isLoaded: boolean;
  /** Current spacing density */
  spacing: ThemeSpacing;
  /** Change the spacing density */
  setSpacing: (spacing: ThemeSpacing) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme to use if none is saved */
  defaultTheme?: ThemeName;
  /** Default spacing density (default: 'default') */
  defaultSpacing?: ThemeSpacing;
  /** LocalStorage key for persisting theme choice */
  storageKey?: string;
  /** Disable localStorage persistence */
  disablePersistence?: boolean;
}

/**
 * ThemeProvider - Provides theme context to the app
 *
 * Features:
 * - Persists theme choice to localStorage
 * - Sets `data-theme` attribute on document root
 * - Prevents flash of wrong theme with isLoaded state
 */
export function ThemeProvider({
  children,
  defaultTheme = "rleaguez",
  defaultSpacing = "default",
  storageKey = "catto-theme",
  disablePersistence = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [spacing, setSpacingState] = useState<ThemeSpacing>(defaultSpacing);
  const [isLoaded, setIsLoaded] = useState(false);

  const spacingStorageKey = `${storageKey}-spacing`;

  // Load theme and spacing from storage on mount
  useEffect(() => {
    if (disablePersistence) {
      setIsLoaded(true);
      return;
    }

    try {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme && isValidTheme(storedTheme)) {
        setThemeState(storedTheme);
      }

      const storedSpacing = localStorage.getItem(spacingStorageKey);
      if (
        storedSpacing &&
        VALID_SPACINGS.includes(storedSpacing as ThemeSpacing)
      ) {
        setSpacingState(storedSpacing as ThemeSpacing);
      }
    } catch (e) {
      // localStorage may not be available (SSR, privacy mode)
      console.warn("Failed to load theme from localStorage:", e);
    }
    setIsLoaded(true);
  }, [storageKey, spacingStorageKey, disablePersistence]);

  // Apply theme and spacing to document when they change
  useEffect(() => {
    if (!isLoaded) return;

    // Set data-theme and data-spacing attributes on document root
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-spacing", spacing);

    // Persist to localStorage
    if (!disablePersistence) {
      try {
        localStorage.setItem(storageKey, theme);
        localStorage.setItem(spacingStorageKey, spacing);
      } catch (e) {
        console.warn("Failed to save theme to localStorage:", e);
      }
    }
  }, [
    theme,
    spacing,
    isLoaded,
    storageKey,
    spacingStorageKey,
    disablePersistence,
  ]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    if (isValidTheme(newTheme)) {
      setThemeState(newTheme);
    } else {
      console.warn(`Invalid theme name: ${newTheme}`);
    }
  }, []);

  const setSpacing = useCallback((newSpacing: ThemeSpacing) => {
    if (VALID_SPACINGS.includes(newSpacing)) {
      setSpacingState(newSpacing);
    } else {
      console.warn(`Invalid spacing: ${newSpacing}`);
    }
  }, []);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    availableThemes: THEMES,
    isLoaded,
    spacing,
    setSpacing,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme - Hook to access theme context
 *
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * useThemeSafe - Hook that returns null if outside provider
 *
 * Useful for components that may or may not be inside a ThemeProvider
 */
export function useThemeSafe(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
