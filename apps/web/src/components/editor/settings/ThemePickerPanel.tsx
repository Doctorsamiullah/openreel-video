import React from "react";
import {
  Check,
  RotateCw,
  Sun,
  Moon,
  Laptop,
  Sliders,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Globe,
  ChevronDown,
} from "@/icons/lucide-compat";
import {
  useThemeStore,
  THEME_DEFINITIONS,
  GradientStyle,
} from "../../../stores/theme-store";

export const ThemePickerPanel: React.FC = () => {
  const {
    mode,
    setMode,
    gradientAngle,
    setGradientAngle,
    colorIntensity,
    setColorIntensity,
    gradientStyle,
    setGradientStyle,
  } = useThemeStore();

  const currentTheme =
    THEME_DEFINITIONS.find((t) => t.id === mode) || THEME_DEFINITIONS[3]; // Sunset Peach default fallback

  const isLightActive = mode !== "dark" && mode !== "auto";
  const isDarkActive = mode === "dark";
  const isDeviceActive = mode === "auto";

  // Cycle / random theme
  const handleRandomTheme = () => {
    const lightThemes = THEME_DEFINITIONS.filter((t) => !t.dark);
    const currentIndex = lightThemes.findIndex((t) => t.id === mode);
    const nextTheme = lightThemes[(currentIndex + 1) % lightThemes.length];
    setMode(nextTheme.id);
  };

  return (
    <div className="space-y-5 select-none text-fg">
      {/* ── 1. Top Live Window Preview Card (Matching Pic 2) ── */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border/80 p-4 transition-all duration-300 shadow-lg"
        style={{
          background: `linear-gradient(${gradientAngle}deg, ${currentTheme.bgTint} 0%, ${currentTheme.headerColor}80 100%)`,
        }}
      >
        {/* Mockup Browser Window Frame */}
        <div className="rounded-xl border border-border/80 bg-bg-1/95 p-3 shadow-md backdrop-blur-sm">
          {/* Top Bar with Tab */}
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="flex items-center gap-1.5 rounded-t-lg px-3 py-1 text-xs font-semibold shadow-xs"
              style={{
                backgroundColor: currentTheme.headerColor,
                color: currentTheme.accentColor,
              }}
            >
              <ChevronDown size={13} />
              <Globe size={13} />
            </div>
            <div className="h-2 w-16 rounded-full bg-border/40" />
          </div>

          {/* Navigation Controls & Address Bar */}
          <div className="flex items-center gap-2">
            <ArrowLeft size={14} className="text-fg-muted" />
            <ArrowRight size={14} className="text-fg-muted/60" />
            <RotateCw size={13} className="text-fg-muted" />
            <div
              className="h-6 flex-1 rounded-full px-3 text-[11px] flex items-center font-mono opacity-80"
              style={{
                backgroundColor: currentTheme.surfaceColor + "35",
                color: currentTheme.accentColor,
              }}
            >
              https://sami.video/editor
            </div>
          </div>

          {/* Window Canvas Area with Theme Gradient Glow */}
          <div
            className="mt-3 h-14 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner"
            style={{
              background: `linear-gradient(${gradientAngle}deg, ${currentTheme.surfaceColor}30 0%, ${currentTheme.accentColor}25 100%)`,
              color: currentTheme.accentColor,
            }}
          >
            <span>{currentTheme.label}</span>
          </div>
        </div>

        {/* Subtitle & Change Theme Button */}
        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-fg">{currentTheme.label}</span>
            <span className="text-[10px] text-fg-muted">
              {currentTheme.dark ? "Dark Theme" : "Light & Vibrant Palette"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRandomTheme}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-bg-1/80 px-3 py-1.5 text-xs font-bold text-fg hover:bg-bg-1 transition-all shadow-xs"
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>Change theme</span>
          </button>
        </div>
      </div>

      {/* ── 2. Segmented Mode Selector (Light, Dark, Device) ── */}
      <div className="grid grid-cols-3 rounded-2xl border border-border bg-bg-2 p-1 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            if (mode === "dark" || mode === "auto") setMode("sunset-orange");
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
            isLightActive
              ? "bg-[#7c2d12] text-white shadow-md font-bold"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
        >
          {isLightActive && <Check size={13} className="stroke-[3]" />}
          <Sun size={14} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("dark")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
            isDarkActive
              ? "bg-zinc-800 text-white shadow-md font-bold"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
        >
          {isDarkActive && <Check size={13} className="stroke-[3]" />}
          <Moon size={14} />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
            isDeviceActive
              ? "bg-[#7c2d12] text-white shadow-md font-bold"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
        >
          {isDeviceActive && <Check size={13} className="stroke-[3]" />}
          <Laptop size={14} />
          <span>Device</span>
        </button>
      </div>

      {/* ── 3. Chrome 4-Quadrant Circular Swatches Grid (Matching Pic 2) ── */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-fg-muted block mb-2.5">
          Color Themes ({THEME_DEFINITIONS.length})
        </label>
        <div className="grid grid-cols-4 gap-3">
          {THEME_DEFINITIONS.map((theme) => {
            const isSelected = mode === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setMode(theme.id)}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                  isSelected
                    ? "border-[#ea580c] bg-orange-500/10 ring-2 ring-[#ea580c]/40 shadow-sm"
                    : "border-border bg-bg-2 hover:border-[#ea580c]/50 hover:bg-bg-3"
                }`}
                title={theme.label}
              >
                {/* 4-Quadrant Circular Swatch */}
                <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border shadow-md group-hover:scale-105 transition-transform">
                  {/* Top Half */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1/2"
                    style={{ backgroundColor: theme.headerColor }}
                  />
                  {/* Bottom Left Quadrant */}
                  <div
                    className="absolute bottom-0 left-0 w-1/2 h-1/2"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  {/* Bottom Right Quadrant */}
                  <div
                    className="absolute bottom-0 right-0 w-1/2 h-1/2"
                    style={{ backgroundColor: theme.surfaceColor }}
                  />

                  {/* Selected Checkmark Badge (Pic 2 style) */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[0.5px]">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7c2d12] text-white shadow-sm">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                <span className="mt-2 text-[11px] font-bold text-fg truncate max-w-full text-center">
                  {theme.label.split(" ")[0]}
                </span>
                <span className="text-[9px] text-fg-muted">
                  {theme.dark ? "Dark" : "Light"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Gradient Adjustment Options (Angle & Style) ── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <Sliders size={14} className="text-[#ea580c]" />
            Gradient Adjustment
          </span>
          <span className="font-mono text-xs text-[#ea580c] font-bold">{gradientAngle}°</span>
        </div>

        {/* Gradient Style Selector */}
        <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
          {(["linear", "radial", "ambient"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setGradientStyle(style as GradientStyle)}
              className={`rounded-lg py-1.5 capitalize transition-all ${
                gradientStyle === style
                  ? "bg-[#ea580c] text-white shadow-sm font-bold"
                  : "bg-bg-3 text-fg-muted hover:text-fg"
              }`}
            >
              {style === "linear" ? "Linear Angle" : style === "radial" ? "Radial Glow" : "Ambient"}
            </button>
          ))}
        </div>

        {/* Gradient Angle Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-fg-muted">
            <span>Rotation Angle</span>
            <span>{gradientAngle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={gradientAngle}
            onChange={(e) => setGradientAngle(parseInt(e.target.value, 10))}
            className="w-full accent-[#ea580c] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-fg-muted font-mono">
            <span>0° (Top)</span>
            <span>90° (Right)</span>
            <span>180° (Bottom)</span>
            <span>270° (Left)</span>
          </div>
        </div>
      </div>

      {/* ── 5. Color Intensity & Vibrancy (Pic 2 User Request) ── */}
      <div className="rounded-2xl border border-border bg-bg-2 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#ea580c]" />
            Color Intensity & Vibrancy
          </span>
          <span className="font-mono text-xs text-[#ea580c] font-bold">{colorIntensity}%</span>
        </div>

        {/* Intensity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-fg-muted">
            <span>Palette Saturation</span>
            <span>{colorIntensity}%</span>
          </div>
          <input
            type="range"
            min="30"
            max="160"
            step="5"
            value={colorIntensity}
            onChange={(e) => setColorIntensity(parseInt(e.target.value, 10))}
            className="w-full accent-[#ea580c] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-fg-muted">
            <span>30% (Subtle Pastel)</span>
            <span>100% (Balanced)</span>
            <span>160% (Ultra Vibrant)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
