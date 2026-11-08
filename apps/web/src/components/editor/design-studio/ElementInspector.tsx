import React from "react";
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Lock,
  Unlock,
} from "@/icons/lucide-compat";
import { DesignElement } from "./types";
import { PhotoFilters } from "./PhotoFilters";

interface ElementInspectorProps {
  element: DesignElement | null;
  onUpdateElement: (updates: Partial<DesignElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onMoveLayer: (dir: "up" | "down" | "top" | "bottom") => void;
  canvasBg: string;
  onUpdateCanvasBg: (color: string) => void;
  totalElementsCount: number;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({
  element,
  onUpdateElement,
  onDuplicate,
  onDelete,
  onToggleLock,
  onMoveLayer,
  canvasBg,
  onUpdateCanvasBg,
  totalElementsCount,
}) => {
  if (!element) {
    return (
      <div className="flex w-72 flex-col border-l border-border bg-bg-1 p-4 space-y-5 overflow-y-auto custom-scrollbar select-none">
        <div className="border-b border-border pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-3">
            Canvas Settings
          </span>
        </div>

        <div className="rounded-xl border border-border bg-bg-2 p-3 text-xs text-fg-muted">
          Click any text, shape, or photo on the canvas to inspect and edit typography, geometry, colors, and Photoshop raster filters.
        </div>

        <div>
          <label className="text-xs font-semibold text-fg-2 block mb-1.5">
            Canvas Background Color
          </label>
          <input
            type="color"
            value={canvasBg}
            onChange={(e) => onUpdateCanvasBg(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-1"
          />
        </div>

        <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-1">
          <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
            <Layers size={13} className="text-purple-400" />
            Layer Stack
          </span>
          <span className="text-[11px] text-fg-muted block">
            Total Active Elements: <strong>{totalElementsCount}</strong>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-80 flex-col border-l border-border bg-bg-1 p-4 space-y-5 overflow-y-auto custom-scrollbar select-none">
      {/* Header & Quick Action Row */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fg-3 truncate max-w-[130px]">
          {element.type === "text" ? "Text Layer" : element.type === "image" ? "Photo Layer" : "Vector Shape"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleLock}
            className={`p-1 rounded transition-colors ${
              element.locked ? "bg-amber-500/20 text-amber-400" : "text-fg-2 hover:bg-bg-2 hover:text-fg"
            }`}
            title={element.locked ? "Unlock element" : "Lock element"}
          >
            {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Duplicate Layer"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveLayer("up")}
            className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Bring Forward"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveLayer("down")}
            className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Send Backward"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete Layer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Text Specific Controls (Two-Way Binding) ── */}
      {element.type === "text" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Text Content (Live Two-Way Binding)
            </label>
            <textarea
              value={element.text || ""}
              onChange={(e) => onUpdateElement({ text: e.target.value })}
              rows={3}
              placeholder="Type your text here..."
              className="w-full rounded-lg border border-border bg-bg-2 p-2.5 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Google Fonts & Typography
            </label>
            <select
              value={element.fontFamily || "Inter"}
              onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-2 p-2 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Montserrat">Montserrat (Bold Header)</option>
              <option value="Noto Sans Devanagari">Noto Sans Devanagari (हिंदी)</option>
              <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (اردو)</option>
              <option value="Arial">Arial (Standard Sans)</option>
              <option value="Times New Roman">Times New Roman (Serif)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Font Size ({element.fontSize || 32}px)
              </label>
              <input
                type="number"
                min="8"
                max="240"
                value={element.fontSize || 32}
                onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Font Weight
              </label>
              <select
                value={element.fontWeight || "normal"}
                onChange={(e) => onUpdateElement({ fontWeight: e.target.value })}
                className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
              >
                <option value="normal">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">SemiBold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="800">ExtraBold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={element.fill || "#ffffff"}
                onChange={(e) => onUpdateElement({ fill: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-0.5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Text Align
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdateElement({ textAlign: align })}
                    className={`rounded border p-1 text-xs capitalize ${
                      element.textAlign === align
                        ? "border-purple-500 bg-purple-500/15 text-purple-400 font-bold"
                        : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shape Specific Controls ── */}
      {element.type === "shape" && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Fill Color
            </label>
            <input
              type="color"
              value={element.backgroundColor || "#3b82f6"}
              onChange={(e) => onUpdateElement({ backgroundColor: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Border Color
              </label>
              <input
                type="color"
                value={element.borderColor || "#ffffff"}
                onChange={(e) => onUpdateElement({ borderColor: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-0.5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Border Width ({element.borderWidth || 0}px)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={element.borderWidth || 0}
                onChange={(e) => onUpdateElement({ borderWidth: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Corner Radius ({element.borderRadius || 0}px)
            </label>
            <input
              type="range"
              min="0"
              max="150"
              value={element.borderRadius || 0}
              onChange={(e) => onUpdateElement({ borderRadius: Number(e.target.value) })}
              className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      )}

      {/* ── Image Specific Controls (Photoshop Adjustments) ── */}
      {element.type === "image" && (
        <div className="space-y-4">
          <PhotoFilters
            adjustments={element.adjustments || { brightness: 0, contrast: 0, saturation: 0, warmth: 0, tint: 0, blur: 0, sharpness: 0, vignette: 0 }}
            onChange={(adj) => onUpdateElement({ adjustments: adj })}
            onFlipH={() => onUpdateElement({ flipX: !element.flipX })}
            onFlipV={() => onUpdateElement({ flipV: !element.flipY })}
            onRotate={() => onUpdateElement({ rotation: ((element.rotation || 0) + 90) % 360 })}
            flipH={element.flipX}
            flipV={element.flipY}
          />
        </div>
      )}

      {/* ── Precise Spatial Coordinates & Dimensions (Photoshop Style) ── */}
      <div className="pt-3 border-t border-border space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-fg-3 block">
          Spatial Placement & Size
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-fg-muted">X Position (px)</span>
            <input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
          <div>
            <span className="text-[10px] text-fg-muted">Y Position (px)</span>
            <input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
          <div>
            <span className="text-[10px] text-fg-muted">Width (px)</span>
            <input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdateElement({ width: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
          <div>
            <span className="text-[10px] text-fg-muted">Height (px)</span>
            <input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdateElement({ height: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[10px] text-fg-muted">Rotation (deg)</span>
            <input
              type="number"
              value={element.rotation || 0}
              onChange={(e) => onUpdateElement({ rotation: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
          <div>
            <span className="text-[10px] text-fg-muted">Opacity</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={element.opacity ?? 1}
              onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
