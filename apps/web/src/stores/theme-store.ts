import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode =
  | "light"
  | "dark"
  | "auto"
  | "midnight-blue"
  | "sunset-orange"
  | "hacker-green"
  | "purple-haze"
  | "high-contrast"
  | "rose-gold";

export interface ThemeDefinition {
  id: ThemeMode;
  label: string;
  /** Preview accent hex (shown in the swatch picker) */
  accent: string;
  /** True for dark-background themes */
  dark: boolean;
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  { id: "dark",          label: "Cinematic Dark",  accent: "#10b981", dark: true  },
  { id: "light",         label: "Light Studio",    accent: "#10b981", dark: false },
  { id: "midnight-blue", label: "Ocean Blue",      accent: "#2563eb", dark: false },
  { id: "sunset-orange", label: "Sunset Peach",    accent: "#ea580c", dark: false },
  { id: "hacker-green",  label: "Botanical Mint",  accent: "#059669", dark: false },
  { id: "purple-haze",   label: "Lavender Lilac",  accent: "#7c3aed", dark: false },
  { id: "rose-gold",     label: "Rose Quartz",     accent: "#db2777", dark: false },
  { id: "high-contrast", label: "Solar Gold",      accent: "#d97706", dark: false },
];

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/** Apply data-theme attribute and optionally add/remove .dark class */
function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const def = THEME_DEFINITIONS.find((t) => t.id === mode);
  const resolvedMode: string = mode === "auto" ? getSystemTheme() : mode;
  const resolvedDef = THEME_DEFINITIONS.find((t) => t.id === resolvedMode);
  const isDarkTheme = def?.dark ?? resolvedDef?.dark ?? false;
  document.documentElement.dataset.theme = resolvedMode;
  if (isDarkTheme) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

const calculateIsDark = (mode: ThemeMode): boolean => {
  if (mode === "auto") return getSystemTheme() === "dark";
  const def = THEME_DEFINITIONS.find((t) => t.id === mode);
  return def?.dark ?? false;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      isDark: false,

      setMode: (mode: ThemeMode) => {
        const isDark = calculateIsDark(mode);
        set({ mode, isDark });
        applyThemeToDOM(mode);
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        const themeIds = THEME_DEFINITIONS.map((t) => t.id);
        const idx = themeIds.indexOf(currentMode);
        const nextMode = themeIds[(idx + 1) % themeIds.length];
        get().setMode(nextMode);
      },
    }),
    {
      name: "openreel-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isDark = calculateIsDark(state.mode);
          state.isDark = isDark;
          applyThemeToDOM(state.mode);
        }
      },
    },
  ),
);

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQuery.addEventListener("change", (e) => {
    const state = useThemeStore.getState();
    if (state.mode === "auto") {
      const isDark = e.matches;
      useThemeStore.setState({ isDark });

      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.dataset.theme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.dataset.theme = "light";
      }
    }
  });
}
