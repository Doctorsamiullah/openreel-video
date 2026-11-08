import React, { useRef } from "react";
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Lock,
  Unlock,
  Upload,
  Maximize2,
  AlignCenter,
  RotateCcw,
  FilePlus,
  Palette,
  Eye,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Link,
  Unlink,
  AlertTriangle,
  LayoutGrid,
  CheckCheck,
} from "@/icons/lucide-compat";
import { DesignElement, PhotoAdjustments } from "./types";
import { PhotoFilters } from "./PhotoFilters";
import { toast } from "../../../stores/notification-store";
import { calculateFitFontSize } from "./utils/layout-engine";

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
  canvasWidth: number;
  canvasHeight: number;
  onUploadPhoto?: (file: File) => void;
  onStartBlank?: () => void;
  onFitInView?: () => void;
  onAutoLayout?: () => void;
  onFitAllContent?: () => void;
  onApplyToAllPhotos?: (adjustments: PhotoAdjustments) => void;
}

const CANVAS_PRESET_COLORS = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#ffedd5",
  "#fefce8",
  "#f0fdf4",
  "#eff6ff",
  "#faf5ff",
  "#fdf2f8",
  "#0f172a",
];

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
  canvasWidth,
  canvasHeight,
  onUploadPhoto,
  onStartBlank,
  onFitInView,
  onAutoLayout,
  onFitAllContent,
  onApplyToAllPhotos,
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isReplace: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isReplace) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        onUpdateElement({ src: url });
        toast.success("Photo replaced successfully");
      };
      reader.readAsDataURL(file);
    } else if (onUploadPhoto) {
      onUploadPhoto(file);
    }
  };

  // ── Autofit / Resize Actions ──
  const handleFitToCanvas = () => {
    if (!element) return;
    const padding = 60;
    const targetW = canvasWidth - padding * 2;
    const targetH = canvasHeight - padding * 2;
    const currentRatio = (element.width || 400) / (element.height || 400);

    let newW = targetW;
    let newH = targetW / currentRatio;
    if (newH > targetH) {
      newH = targetH;
      newW = targetH * currentRatio;
    }

    onUpdateElement({
      x: Math.round((canvasWidth - newW) / 2),
      y: Math.round((canvasHeight - newH) / 2),
      width: Math.round(newW),
      height: Math.round(newH),
    });
    toast.info("Fitted element within canvas bounds");
  };

  const handleFillCanvas = () => {
    if (!element) return;
    onUpdateElement({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
    });
    toast.info("Filled entire canvas");
  };

  const handleCenterCanvas = () => {
    if (!element) return;
    onUpdateElement({
      x: Math.round((canvasWidth - (element.width || 300)) / 2),
      y: Math.round((canvasHeight - (element.height || 200)) / 2),
    });
    toast.info("Centered element on canvas");
  };

  const handleResetOriginalSize = () => {
    if (!element) return;
    if (element.originalWidth && element.originalHeight) {
      onUpdateElement({
        width: element.originalWidth,
        height: element.originalHeight,
      });
      toast.info("Restored original dimensions");
    } else {
      toast.info("Original dimensions already active");
    }
  };

  // ── No Element Selected View (Canvas Tools) ──
  if (!element) {
    return (
      <div className="flex w-80 flex-col border-l border-border bg-bg-1 p-4 space-y-5 overflow-y-auto custom-scrollbar select-none">
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-3">
            Canvas Settings & Tools
          </span>
          {onFitInView && (
            <button
              type="button"
              onClick={onFitInView}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              title="Autofit entire poster on screen"
            >
              <Eye size={12} />
              <span>Fit in View</span>
            </button>
          )}
        </div>

        {/* 1-Click Quick Actions (Upload & Blank Canvas) */}
        <div className="space-y-2">
          <input
            type="file"
            ref={photoInputRef}
            onChange={(e) => handleFileChange(e, false)}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2.5 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] transition-all"
          >
            <Upload size={14} />
            <span>Upload Photo to Canvas</span>
          </button>

          {onStartBlank && (
            <button
              type="button"
              onClick={onStartBlank}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 px-3 py-2 text-xs font-semibold text-fg hover:bg-bg-3 transition-all shadow-xs"
            >
              <FilePlus size={14} className="text-purple-400" />
              <span>Start Blank Canvas (No Template)</span>
            </button>
          )}

          {/* Auto Layout & Fit All Content */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {onAutoLayout && (
              <button
                type="button"
                onClick={onAutoLayout}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-2 text-xs font-semibold text-indigo-400 transition-all"
                title="Arrange all photos and text in clean grid/collage"
              >
                <LayoutGrid size={13} />
                <span>Auto Layout</span>
              </button>
            )}
            {onFitAllContent && (
              <button
                type="button"
                onClick={onFitAllContent}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-2 text-xs font-semibold text-emerald-400 transition-all"
                title="Ensure all text & photos are visible without clipping"
              >
                <CheckCheck size={13} />
                <span>Fit Content</span>
              </button>
            )}
          </div>
        </div>

        {/* Canvas Background Color */}
        <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-2.5">
          <label className="text-xs font-bold text-fg flex items-center gap-1.5">
            <Palette size={13} className="text-purple-400" />
            Canvas Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={canvasBg}
              onChange={(e) => onUpdateCanvasBg(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            />
            <input
              type="text"
              value={canvasBg}
              onChange={(e) => onUpdateCanvasBg(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs font-mono text-fg uppercase focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CANVAS_PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onUpdateCanvasBg(color)}
                className={`h-5 w-5 rounded-full border border-border shadow-xs hover:scale-110 transition-transform ${
                  canvasBg === color ? "ring-2 ring-purple-500 scale-110" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Layer Stack Info */}
        <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-1">
          <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
            <Layers size={13} className="text-purple-400" />
            Active Layer Stack
          </span>
          <span className="text-[11px] text-fg-muted block">
            Total Elements on Canvas: <strong>{totalElementsCount}</strong>
          </span>
          <p className="text-[10px] text-fg-muted mt-1 leading-relaxed">
            Click any text, photo, or vector ribbon on the canvas to open full typography or photo editing tools.
          </p>
        </div>
      </div>
    );
  }

  // ── Selected Element Inspector ──
  return (
    <div className="flex w-80 flex-col border-l border-border bg-bg-1 p-4 space-y-5 overflow-y-auto custom-scrollbar select-none">
      {/* Header & Quick Actions */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-fg truncate max-w-[140px]">
          {element.type === "text"
            ? "Text Layer"
            : element.type === "image"
            ? "Photo Layer"
            : "Vector Shape"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleLock}
            className={`p-1.5 rounded-lg transition-colors ${
              element.locked
                ? "bg-amber-500/20 text-amber-400"
                : "text-fg-2 hover:bg-bg-2 hover:text-fg"
            }`}
            title={element.locked ? "Unlock element" : "Lock element"}
          >
            {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Duplicate Layer"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveLayer("up")}
            className="p-1.5 rounded-lg hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Bring Forward"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveLayer("down")}
            className="p-1.5 rounded-lg hover:bg-bg-2 text-fg-2 hover:text-fg transition-colors"
            title="Send Backward"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Delete Layer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Autofit & Quick Resize Controls (User Request) ── */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <Maximize2 size={13} className="text-purple-400" />
            Autofit & Align
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleFitToCanvas}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 p-1.5 text-[11px] font-semibold text-fg transition-all"
            title="Fit inside canvas bounds"
          >
            <Maximize2 size={12} />
            <span>Fit to Canvas</span>
          </button>
          <button
            type="button"
            onClick={handleFillCanvas}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 p-1.5 text-[11px] font-semibold text-fg transition-all"
            title="Fill entire canvas width and height"
          >
            <Layers size={12} />
            <span>Fill Canvas</span>
          </button>
          <button
            type="button"
            onClick={handleCenterCanvas}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 p-1.5 text-[11px] font-semibold text-fg transition-all"
            title="Center horizontally and vertically"
          >
            <AlignCenter size={12} />
            <span>Center</span>
          </button>
          <button
            type="button"
            onClick={handleResetOriginalSize}
            className="flex items-center justify-center gap-1 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 p-1.5 text-[11px] font-semibold text-fg transition-all"
            title="Reset to natural size"
          >
            <RotateCcw size={12} />
            <span>Reset Size</span>
          </button>
        </div>
      </div>

      {/* ── Text Specific Controls (Full Typography Suite) ── */}
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

          {/* Live Text Overflow Warning & Auto-Fix */}
          {(() => {
            const lines = (element.text || "").split("\n");
            const lineHeight = (element.fontSize || 32) * (element.lineHeight || 1.25);
            const calculatedHeight = Math.ceil(lines.length * lineHeight);
            const isTextOverflowing = calculatedHeight > (element.height || 40);

            if (!isTextOverflowing) return null;

            return (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Text overflowing box by {calculatedHeight - element.height}px</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateElement({ height: calculatedHeight + 8 })}
                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 p-1.5 text-[11px] font-bold text-amber-300 transition-all"
                  >
                    <Maximize2 size={11} />
                    <span>Expand Box Height</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const optimalFont = calculateFitFontSize(
                        element.text || "",
                        element.width,
                        element.height,
                        element.fontSize
                      );
                      onUpdateElement({ fontSize: optimalFont });
                      toast.info(`Adjusted font to ${optimalFont}px to fit box`);
                    }}
                    className="flex items-center justify-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 p-1.5 text-[11px] font-bold text-amber-300 transition-all"
                  >
                    <CheckCheck size={11} />
                    <span>Shrink Font to Fit</span>
                  </button>
                </div>
              </div>
            );
          })()}

          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Google Fonts Typography
            </label>
            <select
              value={element.fontFamily || "Inter"}
              onChange={(e) => onUpdateElement({ fontFamily: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg-2 p-2 text-xs text-fg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Inter">Inter (Clean Modern)</option>
              <option value="Montserrat">Montserrat (Bold Header)</option>
              <option value="Noto Sans Devanagari">Noto Sans Devanagari (हिंदी)</option>
              <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (اردو)</option>
              <option value="Roboto">Roboto (Google Standard)</option>
              <option value="Arial">Arial (Universal Sans)</option>
              <option value="Times New Roman">Times New Roman (Serif)</option>
            </select>
          </div>

          {/* Font Size & Weight */}
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
                className="w-full rounded-lg border border-border bg-bg-2 p-1.5 text-xs text-fg font-mono"
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

          {/* Style Toggles: Bold, Italic, Underline */}
          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Text Styling
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateElement({
                    fontWeight: element.fontWeight === "bold" ? "normal" : "bold",
                  })
                }
                className={`flex items-center justify-center rounded-lg border p-1.5 text-xs font-bold transition-all ${
                  element.fontWeight === "bold" || element.fontWeight === "800" || element.fontWeight === "900"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                }`}
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateElement({
                    fontStyle: element.fontStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={`flex items-center justify-center rounded-lg border p-1.5 text-xs font-bold transition-all ${
                  element.fontStyle === "italic"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                }`}
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateElement({
                    textDecoration:
                      element.textDecoration === "underline" ? "none" : "underline",
                  })
                }
                className={`flex items-center justify-center rounded-lg border p-1.5 text-xs font-bold transition-all ${
                  element.textDecoration === "underline"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                }`}
              >
                <Underline size={13} />
              </button>
            </div>
          </div>

          {/* Text Alignment: Left, Center, Right, Justify (User Request) */}
          <div>
            <label className="text-xs font-semibold text-fg-2 block mb-1">
              Text Alignment & Justification
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: "left", label: "Left", icon: AlignLeft },
                { id: "center", label: "Center", icon: AlignCenter },
                { id: "right", label: "Right", icon: AlignRight },
                { id: "justify", label: "Justify", icon: AlignJustify },
              ].map((al) => {
                const Icon = al.icon;
                const isActive = (element.textAlign || "left") === al.id;
                return (
                  <button
                    key={al.id}
                    type="button"
                    onClick={() => onUpdateElement({ textAlign: al.id as any })}
                    className={`flex items-center justify-center gap-1 rounded-lg border p-1.5 text-xs capitalize transition-all ${
                      isActive
                        ? "border-purple-500 bg-purple-500/20 text-purple-400 font-bold"
                        : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                    }`}
                    title={`Align ${al.label}`}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Color & Highlight Background */}
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
                Highlight Color
              </label>
              <input
                type="color"
                value={element.textBackground || "#000000"}
                onChange={(e) => onUpdateElement({ textBackground: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-0.5"
              />
            </div>
          </div>

          {/* Line Height & Letter Spacing */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-fg-muted font-medium">Line Height</span>
                <span className="font-mono">{element.lineHeight || 1.25}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={element.lineHeight || 1.25}
                onChange={(e) => onUpdateElement({ lineHeight: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-fg-muted font-medium">Letter Spacing</span>
                <span className="font-mono">{element.letterSpacing || 0}px</span>
              </div>
              <input
                type="range"
                min="-2"
                max="16"
                step="1"
                value={element.letterSpacing || 0}
                onChange={(e) => onUpdateElement({ letterSpacing: parseInt(e.target.value, 10) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
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
                className="h-9 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-fg-2 block mb-1">
                Border Width ({element.borderWidth || 0}px)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={element.borderWidth || 0}
                onChange={(e) => onUpdateElement({ borderWidth: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-bg-2 p-2 text-xs text-fg font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Specific Controls (Replace & Full Adjustments) ── */}
      {element.type === "image" && (
        <div className="space-y-4">
          <input
            type="file"
            ref={replaceInputRef}
            onChange={(e) => handleFileChange(e, true)}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => replaceInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 p-2 text-xs font-bold text-purple-400 transition-all shadow-xs"
          >
            <Upload size={14} />
            <span>Upload & Replace Photo</span>
          </button>

          {/* Photoshop Adjustments & Color Shifts */}
          <PhotoFilters
            adjustments={element.adjustments || ({} as any)}
            onChange={(adj) => onUpdateElement({ adjustments: adj })}
            onFlipH={() => onUpdateElement({ flipX: !element.flipX })}
            onFlipV={() => onUpdateElement({ flipV: !element.flipV })}
            onRotate={() => onUpdateElement({ rotation: ((element.rotation || 0) + 90) % 360 })}
            flipH={element.flipX}
            flipV={element.flipV}
            onApplyToAll={() =>
              element.adjustments && onApplyToAllPhotos && onApplyToAllPhotos(element.adjustments)
            }
          />

          {/* Slot Alignment Mode (Autofit in Slot) */}
          <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-2">
            <span className="text-xs font-bold text-fg block">Autofit Slot Mode</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onUpdateElement({ fitMode: "fill" });
                  toast.info("Slot mode: Fill (cover entire frame)");
                }}
                className={`flex items-center justify-center gap-1 rounded-lg border p-1.5 text-xs font-semibold transition-all ${
                  element.fitMode === "fill" || !element.fitMode
                    ? "border-purple-500 bg-purple-500/20 text-purple-400 font-bold"
                    : "border-border bg-bg-3 text-fg-2 hover:bg-bg-4"
                }`}
              >
                <Maximize2 size={12} />
                <span>Fill Slot (Cover)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateElement({ fitMode: "fit" });
                  toast.info("Slot mode: Fit (contained inside frame)");
                }}
                className={`flex items-center justify-center gap-1 rounded-lg border p-1.5 text-xs font-semibold transition-all ${
                  element.fitMode === "fit"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400 font-bold"
                    : "border-border bg-bg-3 text-fg-2 hover:bg-bg-4"
                }`}
              >
                <AlignCenter size={12} />
                <span>Fit Slot (Contain)</span>
              </button>
            </div>
          </div>

          {/* Photo Rounded Corners */}
          <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-fg-2">Rounded Corners</span>
              <span className="text-fg-muted font-mono">{element.borderRadius || 0}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="160"
              value={element.borderRadius || 0}
              onChange={(e) => onUpdateElement({ borderRadius: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      )}

      {/* ── Precise Spatial Coordinates & Dimensions (Photoshop Style) ── */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
            Spatial Transform
          </span>
          <button
            type="button"
            onClick={() => {
              const nextLocked = !element.lockAspectRatio;
              const ratio = element.width / Math.max(element.height, 1);
              onUpdateElement({
                lockAspectRatio: nextLocked,
                aspectRatio: ratio,
              });
              toast.info(nextLocked ? "Aspect ratio locked" : "Aspect ratio unlocked");
            }}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors ${
              element.lockAspectRatio
                ? "bg-purple-500/20 text-purple-400"
                : "text-fg-muted hover:text-fg hover:bg-bg-2"
            }`}
            title={element.lockAspectRatio ? "Aspect ratio is locked" : "Lock aspect ratio"}
          >
            {element.lockAspectRatio ? <Link size={12} /> : <Unlink size={12} />}
            <span>{element.lockAspectRatio ? "Ratio Locked" : "Ratio Free"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-fg-muted font-mono block mb-1">X Position</label>
            <input
              type="number"
              value={element.x}
              onChange={(e) => onUpdateElement({ x: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 font-mono text-fg"
            />
          </div>
          <div>
            <label className="text-fg-muted font-mono block mb-1">Y Position</label>
            <input
              type="number"
              value={element.y}
              onChange={(e) => onUpdateElement({ y: Number(e.target.value) })}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 font-mono text-fg"
            />
          </div>
          <div>
            <label className="text-fg-muted font-mono block mb-1">Width</label>
            <input
              type="number"
              min="10"
              value={element.width}
              onChange={(e) => {
                const w = Math.max(10, Number(e.target.value));
                if (element.lockAspectRatio) {
                  const ratio = element.aspectRatio || element.width / Math.max(element.height, 1);
                  onUpdateElement({ width: w, height: Math.max(10, Math.round(w / ratio)) });
                } else {
                  onUpdateElement({ width: w });
                }
              }}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 font-mono text-fg"
            />
          </div>
          <div>
            <label className="text-fg-muted font-mono block mb-1">Height</label>
            <input
              type="number"
              min="10"
              value={element.height}
              onChange={(e) => {
                const h = Math.max(10, Number(e.target.value));
                if (element.lockAspectRatio) {
                  const ratio = element.aspectRatio || element.width / Math.max(element.height, 1);
                  onUpdateElement({ height: h, width: Math.max(10, Math.round(h * ratio)) });
                } else {
                  onUpdateElement({ height: h });
                }
              }}
              className="w-full rounded-lg border border-border bg-bg-2 p-1.5 font-mono text-fg"
            />
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-fg-2">Layer Opacity</span>
            <span className="text-fg-muted font-mono">
              {Math.round((element.opacity ?? 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={element.opacity ?? 1}
            onChange={(e) => onUpdateElement({ opacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
};
