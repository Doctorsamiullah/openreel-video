import React from "react";
import {
  Sliders,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Palette,
  Sparkles,
} from "@/icons/lucide-compat";
import { PhotoAdjustments, DEFAULT_PHOTO_ADJUSTMENTS } from "./types";

interface PhotoFiltersProps {
  adjustments: PhotoAdjustments;
  onChange: (adjustments: PhotoAdjustments) => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onRotate?: () => void;
  flipH?: boolean;
  flipV?: boolean;
  onApplyToAll?: () => void;
}

export interface FilterPreset {
  id: string;
  name: string;
  adjustments: Partial<PhotoAdjustments>;
}

export const PHOTO_FILTER_PRESETS: FilterPreset[] = [
  { id: "original", name: "Original", adjustments: {} },
  { id: "vivid", name: "Vivid Pop", adjustments: { contrast: 20, saturation: 35, sharpness: 15 } },
  { id: "clinical", name: "Clinical Clear", adjustments: { brightness: 10, contrast: 15, saturation: -5, sharpness: 25 } },
  { id: "warm-gold", name: "Warm Gold", adjustments: { warmth: 35, brightness: 8, saturation: 15, hueRotate: 15 } },
  { id: "cool-teal", name: "Cool Teal", adjustments: { warmth: -30, contrast: 18, saturation: 10, hueRotate: -25 } },
  { id: "vintage", name: "Vintage 90s", adjustments: { contrast: -10, warmth: 25, vignette: 30, saturation: -15 } },
  { id: "bw", name: "Dramatic B&W", adjustments: { saturation: -100, contrast: 45, brightness: 5, sharpness: 25 } },
  { id: "cyber", name: "Cyber Neon", adjustments: { hueRotate: 130, saturation: 60, contrast: 25 } },
  { id: "soft", name: "Soft Glow", adjustments: { blur: 2, brightness: 12, contrast: -10, saturation: 10 } },
];

const QUICK_COLOR_TINTS = [
  { name: "None", color: "" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Purple", color: "#a855f7" },
  { name: "Indigo", color: "#3b82f6" },
];

export const PhotoFilters: React.FC<PhotoFiltersProps> = ({
  adjustments,
  onChange,
  onFlipH,
  onFlipV,
  onRotate,
  flipH,
  flipV,
  onApplyToAll,
}) => {
  const current = adjustments || DEFAULT_PHOTO_ADJUSTMENTS;

  const update = (key: keyof PhotoAdjustments, val: any) => {
    onChange({
      ...current,
      [key]: val,
    });
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    onChange({
      ...DEFAULT_PHOTO_ADJUSTMENTS,
      ...preset.adjustments,
    });
  };

  const handleReset = () => {
    onChange(DEFAULT_PHOTO_ADJUSTMENTS);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header with Reset & Apply to All */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fg-3 flex items-center gap-1.5">
          <Sliders size={13} className="text-purple-400" />
          Photo Color & Adjustments
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium hover:underline"
        >
          <RefreshCw size={10} /> Reset
        </button>
      </div>

      {/* Quick Transforms */}
      <div className="grid grid-cols-3 gap-1.5">
        {onFlipH && (
          <button
            type="button"
            onClick={onFlipH}
            className={`flex items-center justify-center gap-1 rounded-lg border p-1.5 text-xs font-medium transition-all ${
              flipH ? "border-purple-500 bg-purple-500/15 text-purple-400" : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
            }`}
          >
            <FlipHorizontal size={13} /> Flip H
          </button>
        )}
        {onFlipV && (
          <button
            type="button"
            onClick={onFlipV}
            className={`flex items-center justify-center gap-1 rounded-lg border p-1.5 text-xs font-medium transition-all ${
              flipV ? "border-purple-500 bg-purple-500/15 text-purple-400" : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
            }`}
          >
            <FlipVertical size={13} /> Flip V
          </button>
        )}
        {onRotate && (
          <button
            type="button"
            onClick={onRotate}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-bg-2 p-1.5 text-xs font-medium text-fg-2 hover:bg-bg-3 transition-all"
          >
            <RotateCw size={13} /> +90°
          </button>
        )}
      </div>

      {/* ── Photo Color Change (Hue Rotate & Color Wash) ── */}
      <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <Palette size={13} className="text-purple-400" />
            Photo Color Shift (Hue & Tint)
          </span>
          <span className="font-mono text-xs text-purple-400 font-bold">
            {current.hueRotate || 0}°
          </span>
        </div>

        {/* Hue Rotate Slider (-180° to +180°) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-fg-muted font-medium">
            <span>Color Hue Spectrum</span>
            <span>{current.hueRotate || 0}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={current.hueRotate || 0}
            onChange={(e) => update("hueRotate", Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
          />
        </div>

        {/* Quick Color Tint Wash */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-fg-muted font-medium">
            <span>Color Wash Overlay</span>
            {current.colorTint ? (
              <span className="font-mono text-[10px] text-purple-400 font-semibold">{current.colorTint}</span>
            ) : (
              <span className="text-[10px] text-fg-muted">Original Colors</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUICK_COLOR_TINTS.map((tint) => (
              <button
                key={tint.name}
                type="button"
                onClick={() => {
                  update("colorTint", tint.color);
                  if (tint.color && !current.colorTintIntensity) {
                    update("colorTintIntensity", 35);
                  }
                }}
                className={`h-6 px-2 rounded-md text-[10px] font-bold border transition-all ${
                  current.colorTint === tint.color
                    ? "border-purple-500 bg-purple-600 text-white shadow-sm ring-1 ring-purple-400"
                    : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                }`}
              >
                {tint.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tint Intensity Slider if tint active */}
        {current.colorTint && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-fg-muted font-medium">
              <span>Wash Intensity</span>
              <span className="font-mono">{current.colorTintIntensity || 35}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="95"
              value={current.colorTintIntensity || 35}
              onChange={(e) => update("colorTintIntensity", Number(e.target.value))}
              className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        )}

        {/* Apply to All Photos Button */}
        {onApplyToAll && (
          <button
            type="button"
            onClick={onApplyToAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-bg-2 hover:bg-bg-3 border border-purple-500/40 p-1.5 text-[11px] font-bold text-purple-400 transition-all shadow-xs"
          >
            <Sparkles size={12} />
            <span>Apply Color Changes to All Photos</span>
          </button>
        )}
      </div>

      {/* 1-Click LUT Filter Presets */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-fg">1-Click Filter Presets</span>
        <div className="grid grid-cols-3 gap-1.5">
          {PHOTO_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="rounded-lg border border-border bg-bg-2 p-1.5 text-center text-xs font-medium text-fg-2 hover:border-purple-500 hover:bg-bg-3 hover:text-fg transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Photoshop Raster Sliders */}
      <div className="space-y-3 pt-2 border-t border-border">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Brightness</span>
            <span className="text-fg-muted font-mono">{current.brightness}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.brightness}
            onChange={(e) => update("brightness", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Contrast</span>
            <span className="text-fg-muted font-mono">{current.contrast}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.contrast}
            onChange={(e) => update("contrast", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Saturation</span>
            <span className="text-fg-muted font-mono">{current.saturation}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.saturation}
            onChange={(e) => update("saturation", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Sharpness */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Sharpness / Detail</span>
            <span className="text-fg-muted font-mono">{current.sharpness}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.sharpness}
            onChange={(e) => update("sharpness", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Warmth */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Warmth / Temp</span>
            <span className="text-fg-muted font-mono">{current.warmth}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.warmth}
            onChange={(e) => update("warmth", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Tint */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Tint (Green/Magenta)</span>
            <span className="text-fg-muted font-mono">{current.tint}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.tint}
            onChange={(e) => update("tint", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Gaussian Blur</span>
            <span className="text-fg-muted font-mono">{current.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={current.blur}
            onChange={(e) => update("blur", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Vignette */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Vignette</span>
            <span className="text-fg-muted font-mono">{current.vignette}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.vignette}
            onChange={(e) => update("vignette", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
