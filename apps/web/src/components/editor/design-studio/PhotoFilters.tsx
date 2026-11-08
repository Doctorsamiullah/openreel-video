import React, { useState } from "react";
import {
  Sliders,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Palette,
  Sparkles,
  Eye,
  Layers,
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
  onApplyToAll?: (adjustments: PhotoAdjustments) => void;
  onPreviewOriginal?: (showOriginal: boolean) => void;
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
  { id: "vintage", name: "Vintage 90s", adjustments: { contrast: -10, warmth: 25, vignette: 30, saturation: -15, sepia: 30 } },
  { id: "bw", name: "Dramatic B&W", adjustments: { grayscale: 100, contrast: 45, brightness: 5, sharpness: 25 } },
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
  onPreviewOriginal,
}) => {
  const [scope, setScope] = useState<"selected" | "all">("selected");
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const current = adjustments || DEFAULT_PHOTO_ADJUSTMENTS;

  const update = (key: keyof PhotoAdjustments, val: any) => {
    const updated = {
      ...current,
      [key]: val,
    };
    onChange(updated);
    if (scope === "all" && onApplyToAll) {
      onApplyToAll(updated);
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    const updated = {
      ...DEFAULT_PHOTO_ADJUSTMENTS,
      ...preset.adjustments,
    };
    onChange(updated);
    if (scope === "all" && onApplyToAll) {
      onApplyToAll(updated);
    }
  };

  const handleReset = () => {
    onChange(DEFAULT_PHOTO_ADJUSTMENTS);
    if (scope === "all" && onApplyToAll) {
      onApplyToAll(DEFAULT_PHOTO_ADJUSTMENTS);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Header with Reset & Hold Comparison */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fg-3 flex items-center gap-1.5">
          <Sliders size={13} className="text-purple-400" />
          Photo Color & Adjustments
        </span>
        <div className="flex items-center gap-2">
          {onPreviewOriginal && (
            <button
              type="button"
              onMouseDown={() => {
                setIsHoldingOriginal(true);
                onPreviewOriginal(true);
              }}
              onMouseUp={() => {
                setIsHoldingOriginal(false);
                onPreviewOriginal(false);
              }}
              onMouseLeave={() => {
                if (isHoldingOriginal) {
                  setIsHoldingOriginal(false);
                  onPreviewOriginal(false);
                }
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold border border-amber-500/30 rounded px-1.5 py-0.5 bg-amber-500/10 active:bg-amber-500/30"
              title="Click and hold to compare with unedited original"
            >
              <Eye size={10} /> {isHoldingOriginal ? "Original" : "Hold Before/After"}
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium hover:underline"
          >
            <RefreshCw size={10} /> Reset
          </button>
        </div>
      </div>

      {/* Scope Toggle: [Selected Photo] vs [All Photos] */}
      <div className="rounded-xl border border-border bg-bg-2 p-1 flex items-center">
        <button
          type="button"
          onClick={() => setScope("selected")}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            scope === "selected"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          <span>Selected Photo</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setScope("all");
            if (onApplyToAll) onApplyToAll(current);
          }}
          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            scope === "all"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          <Layers size={12} />
          <span>All Photos ({onApplyToAll ? "Sync" : "All"})</span>
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
            {/* Custom Color Input */}
            <input
              type="color"
              value={current.colorTint || "#3b82f6"}
              onChange={(e) => {
                update("colorTint", e.target.value);
                if (!current.colorTintIntensity) update("colorTintIntensity", 35);
              }}
              className="h-6 w-7 rounded border border-border cursor-pointer bg-transparent"
              title="Custom Color Picker"
            />
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
        {onApplyToAll && scope === "selected" && (
          <button
            type="button"
            onClick={() => onApplyToAll(current)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-bg-2 hover:bg-bg-3 border border-purple-500/40 p-1.5 text-[11px] font-bold text-purple-400 transition-all shadow-xs"
          >
            <Sparkles size={12} />
            <span>Apply Current Colors to All Photos</span>
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
        {/* Exposure */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Exposure</span>
            <span className="text-fg-muted font-mono">{current.exposure || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.exposure || 0}
            onChange={(e) => update("exposure", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

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

        {/* Temperature / Warmth */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Temperature (Warmth)</span>
            <span className="text-fg-muted font-mono">{current.warmth || current.temperature || 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={current.warmth || current.temperature || 0}
            onChange={(e) => {
              const v = Number(e.target.value);
              update("warmth", v);
              update("temperature", v);
            }}
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

        {/* Grayscale */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Grayscale</span>
            <span className="text-fg-muted font-mono">{current.grayscale || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.grayscale || 0}
            onChange={(e) => update("grayscale", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-zinc-500"
          />
        </div>

        {/* Sepia */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Sepia (Vintage)</span>
            <span className="text-fg-muted font-mono">{current.sepia || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.sepia || 0}
            onChange={(e) => update("sepia", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-amber-700"
          />
        </div>

        {/* Invert */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Invert / Negative</span>
            <span className="text-fg-muted font-mono">{current.invert || 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={current.invert || 0}
            onChange={(e) => update("invert", Number(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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

