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
  /** 4-Quadrant circular swatch colors matching Chrome Appearance */
  headerColor: string;
  accentColor: string;
  surfaceColor: string;
  bgTint: string;
}

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: "dark",
    label: "Cinematic Dark",
    accent: "#10b981",
    dark: true,
    headerColor: "#0f172a",
    accentColor: "#10b981",
    surfaceColor: "#1e293b",
    bgTint: "#0b0f19",
  },
  {
    id: "light",
    label: "Light Studio",
    accent: "#10b981",
    dark: false,
    headerColor: "#f1f5f9",
    accentColor: "#10b981",
    surfaceColor: "#e2e8f0",
    bgTint: "#ffffff",
  },
  {
    id: "midnight-blue",
    label: "Ocean Blue",
    accent: "#2563eb",
    dark: false,
    headerColor: "#bfdbfe",
    accentColor: "#1d4ed8",
    surfaceColor: "#93c5fd",
    bgTint: "#eff6ff",
  },
  {
    id: "sunset-orange",
    label: "Sunset Peach",
    accent: "#ea580c",
    dark: false,
    headerColor: "#ffedd5",
    accentColor: "#7c2d12",
    surfaceColor: "#fb923c",
    bgTint: "#fff7ed",
  },
  {
    id: "hacker-green",
    label: "Botanical Mint",
    accent: "#059669",
    dark: false,
    headerColor: "#bbf7d0",
    accentColor: "#15803d",
    surfaceColor: "#86efac",
    bgTint: "#f0fdf4",
  },
  {
    id: "purple-haze",
    label: "Lavender Lilac",
    accent: "#7c3aed",
    dark: false,
    headerColor: "#f3e8ff",
    accentColor: "#581c87",
    surfaceColor: "#c084fc",
    bgTint: "#faf5ff",
  },
  {
    id: "rose-gold",
    label: "Rose Quartz",
    accent: "#db2777",
    dark: false,
    headerColor: "#fce7f3",
    accentColor: "#831843",
    surfaceColor: "#f472b6",
    bgTint: "#fdf2f8",
  },
  {
    id: "high-contrast",
    label: "Solar Gold",
    accent: "#d97706",
    dark: false,
    headerColor: "#fef08a",
    accentColor: "#854d0e",
    surfaceColor: "#fde047",
    bgTint: "#fefce8",
  },
];

export type GradientStyle = "linear" | "radial" | "ambient";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  gradientAngle: number; // 0 to 360 degrees
  colorIntensity: number; // 30% to 160%
  gradientStyle: GradientStyle;
  setMode: (mode: ThemeMode) => void;
  setGradientAngle: (angle: number) => void;
  setColorIntensity: (intensity: number) => void;
  setGradientStyle: (style: GradientStyle) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/** Apply data-theme attribute and dynamic gradient CSS variables */
function applyThemeToDOM(
  mode: ThemeMode,
  gradientAngle: number = 135,
  colorIntensity: number = 100,
  gradientStyle: GradientStyle = "linear"
) {
  if (typeof document === "undefined") return;
  const def = THEME_DEFINITIONS.find((t) => t.id === mode);
  const resolvedMode: string = mode === "auto" ? getSystemTheme() : mode;
  const resolvedDef = THEME_DEFINITIONS.find((t) => t.id === resolvedMode) || THEME_DEFINITIONS[1];
  const isDarkTheme = def?.dark ?? resolvedDef?.dark ?? false;

  document.documentElement.dataset.theme = resolvedMode;
  if (isDarkTheme) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Apply gradient and color intensity options live to CSS custom properties
  const doc = document.documentElement;
  doc.style.setProperty("--gradient-angle", `${gradientAngle}deg`);
  doc.style.setProperty("--color-intensity", `${colorIntensity}%`);

  const intensityFactor = colorIntensity / 100;
  doc.style.setProperty("--theme-intensity-factor", `${intensityFactor}`);

  if (gradientStyle === "radial") {
    doc.style.setProperty(
      "--gradient-bg",
      `radial-gradient(circle at 50% 20%, ${resolvedDef.headerColor} 0%, ${resolvedDef.bgTint} 70%)`
    );
    doc.style.setProperty(
      "--gradient-card",
      `radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.95) 0%, ${resolvedDef.headerColor}80 100%)`
    );
  } else if (gradientStyle === "ambient") {
    doc.style.setProperty(
      "--gradient-bg",
      `linear-gradient(${gradientAngle}deg, ${resolvedDef.bgTint} 0%, ${resolvedDef.headerColor}50 50%, ${resolvedDef.bgTint} 100%)`
    );
    doc.style.setProperty(
      "--gradient-card",
      `linear-gradient(${gradientAngle}deg, rgba(255, 255, 255, 0.95) 0%, ${resolvedDef.surfaceColor}30 100%)`
    );
  } else {
    // Linear
    doc.style.setProperty(
      "--gradient-bg",
      `linear-gradient(${gradientAngle}deg, ${resolvedDef.bgTint} 0%, ${resolvedDef.headerColor}60 100%)`
    );
    doc.style.setProperty(
      "--gradient-card",
      `linear-gradient(${gradientAngle}deg, rgba(255, 255, 255, 0.95) 0%, ${resolvedDef.surfaceColor}40 100%)`
    );
  }

  doc.style.setProperty(
    "--gradient-accent",
    `linear-gradient(${gradientAngle}deg, ${resolvedDef.accent} 0%, ${resolvedDef.accentColor} 100%)`
  );
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
      gradientAngle: 135,
      colorIntensity: 100,
      gradientStyle: "linear",

      setMode: (mode: ThemeMode) => {
        const isDark = calculateIsDark(mode);
        const { gradientAngle, colorIntensity, gradientStyle } = get();
        set({ mode, isDark });
        applyThemeToDOM(mode, gradientAngle, colorIntensity, gradientStyle);
      },

      setGradientAngle: (gradientAngle: number) => {
        const { mode, colorIntensity, gradientStyle } = get();
        set({ gradientAngle });
        applyThemeToDOM(mode, gradientAngle, colorIntensity, gradientStyle);
      },

      setColorIntensity: (colorIntensity: number) => {
        const { mode, gradientAngle, gradientStyle } = get();
        set({ colorIntensity });
        applyThemeToDOM(mode, gradientAngle, colorIntensity, gradientStyle);
      },

      setGradientStyle: (gradientStyle: GradientStyle) => {
        const { mode, gradientAngle, colorIntensity } = get();
        set({ gradientStyle });
        applyThemeToDOM(mode, gradientAngle, colorIntensity, gradientStyle);
      },

      toggleTheme: () => {
        const currentMode = get().mode;
        if (currentMode === "light") {
          get().setMode("dark");
        } else if (currentMode === "dark") {
          get().setMode("auto");
        } else {
          get().setMode("light");
        }
      },
    }),
    {
      name: "openreel-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isDark = calculateIsDark(state.mode);
          state.isDark = isDark;
          applyThemeToDOM(
            state.mode,
            state.gradientAngle ?? 135,
            state.colorIntensity ?? 100,
            state.gradientStyle ?? "linear"
          );
        }
      },
    }
  )
);

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  mediaQuery.addEventListener("change", (e) => {
    const state = useThemeStore.getState();
    if (state.mode === "auto") {
      const isDark = e.matches;
      useThemeStore.setState({ isDark });
      applyThemeToDOM("auto", state.gradientAngle, state.colorIntensity, state.gradientStyle);
    }
  });
}
