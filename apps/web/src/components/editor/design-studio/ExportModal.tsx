import React, { useState } from "react";
import {
  Download,
  X,
  FileImage,
  FileText,
  Film,
} from "@/icons/lucide-compat";
import { ExportOptions, CanvasDimensions } from "./types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  dimensions: CanvasDimensions;
  onExport: (options: ExportOptions) => Promise<void>;
  onSaveToTimeline: () => Promise<void>;
  isProcessing: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  dimensions,
  onExport,
  onSaveToTimeline,
  isProcessing,
}) => {
  const [format, setFormat] = useState<"png" | "jpg" | "pdf">("png");
  const [quality, setQuality] = useState<number>(0.92);
  const [scale, setScale] = useState<number>(1);

  if (!isOpen) return null;

  const currentW = dimensions.width * scale;
  const currentH = dimensions.height * scale;

  const handleStartExport = () => {
    onExport({
      format,
      quality,
      scale,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-bg-1 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-sm">
              <Download size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg">Export & Download Design</h3>
              <p className="text-[11px] text-fg-muted truncate max-w-xs">{documentTitle} • PNG, JPG or PDF</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-fg-muted hover:text-fg hover:bg-bg-2 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Format Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-fg block">File Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat("png")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                format === "png"
                  ? "border-purple-500 bg-purple-500/15 text-purple-400 font-bold shadow-sm"
                  : "border-border bg-bg-2 text-fg-muted hover:text-fg hover:bg-bg-3"
              }`}
            >
              <FileImage size={20} />
              <span className="text-xs">PNG</span>
              <span className="text-[9px] text-fg-muted">Best for web & text</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("jpg")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                format === "jpg"
                  ? "border-purple-500 bg-purple-500/15 text-purple-400 font-bold shadow-sm"
                  : "border-border bg-bg-2 text-fg-muted hover:text-fg hover:bg-bg-3"
              }`}
            >
              <FileImage size={20} />
              <span className="text-xs">JPG</span>
              <span className="text-[9px] text-fg-muted">Smaller file size</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("pdf")}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                format === "pdf"
                  ? "border-purple-500 bg-purple-500/15 text-purple-400 font-bold shadow-sm"
                  : "border-border bg-bg-2 text-fg-muted hover:text-fg hover:bg-bg-3"
              }`}
            >
              <FileText size={20} />
              <span className="text-xs">PDF</span>
              <span className="text-[9px] text-fg-muted">Print Document</span>
            </button>
          </div>
        </div>

        {/* Resolution Scale Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-fg">Resolution Scale</span>
            <span className="font-mono text-purple-400 font-semibold">
              {currentW} × {currentH} px
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1, label: "1x (Standard)", desc: "Web / Mobile" },
              { val: 2, label: "2x (HD Crisp)", desc: "Social Media" },
              { val: 3, label: "3x (Ultra 300DPI)", desc: "High-Res Print" },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setScale(s.val)}
                className={`flex flex-col items-center rounded-xl border p-2 text-center transition-all ${
                  scale === s.val
                    ? "border-purple-500 bg-purple-500/15 text-purple-400 font-bold"
                    : "border-border bg-bg-2 text-fg-muted hover:text-fg"
                }`}
              >
                <span className="text-xs font-semibold">{s.label}</span>
                <span className="text-[9px] text-fg-muted">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (JPG only) */}
        {format === "jpg" && (
          <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-fg">JPEG Compression Quality</span>
              <span className="font-mono text-purple-400 font-bold">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fg-muted">
              <span>Low (Smaller file)</span>
              <span>Maximum (Best detail)</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleStartExport}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
          >
            <Download size={15} />
            <span>{isProcessing ? "Rendering High-Res Export..." : `Download ${format.toUpperCase()} (${scale}x)`}</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={async () => {
              await onSaveToTimeline();
              onClose();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-all disabled:opacity-50"
          >
            <Film size={15} />
            <span>Save & Add to Video Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
