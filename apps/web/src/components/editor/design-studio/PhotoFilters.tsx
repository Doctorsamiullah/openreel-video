import React from "react";
import { Sliders, RefreshCw, FlipHorizontal, FlipVertical, RotateCw } from "@/icons/lucide-compat";
import { PhotoAdjustments, DEFAULT_PHOTO_ADJUSTMENTS } from "./types";

interface PhotoFiltersProps {
  adjustments: PhotoAdjustments;
  onChange: (adjustments: PhotoAdjustments) => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onRotate?: () => void;
  flipH?: boolean;
  flipV?: boolean;
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
  { id: "warm-gold", name: "Warm Gold", adjustments: { warmth: 35, brightness: 8, saturation: 15 } },
  { id: "cool-teal", name: "Cool Teal", adjustments: { warmth: -30, contrast: 18, saturation: 10 } },
  { id: "vintage", name: "Vintage 90s", adjustments: { contrast: -10, warmth: 25, vignette: 30, saturation: -15 } },
  { id: "bw", name: "Dramatic B&W", adjustments: { saturation: -100, contrast: 45, brightness: 5, sharpness: 25 } },
  { id: "soft", name: "Soft Glow", adjustments: { blur: 2, brightness: 12, contrast: -10, saturation: 10 } },
];

export const PhotoFilters: React.FC<PhotoFiltersProps> = ({
  adjustments,
  onChange,
  onFlipH,
  onFlipV,
  onRotate,
  flipH,
  flipV,
}) => {
  const current = adjustments || DEFAULT_PHOTO_ADJUSTMENTS;

  const update = (key: keyof PhotoAdjustments, val: number) => {
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
    <div className="space-y-4">
      {/* Header with Reset */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fg-3 flex items-center gap-1.5">
          <Sliders size={13} className="text-purple-400" />
          Photo Adjustments (Photoshop)
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

      {/* 1-Click Color Grading LUT Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-fg-2 block">
          Color Grading Presets
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {PHOTO_FILTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="rounded-lg border border-border bg-bg-2 hover:border-purple-500/60 hover:bg-bg-3 p-1.5 text-[11px] font-medium text-left text-fg truncate transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
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
