import React from "react";
import {
  ArrowLeft,
  LayoutTemplate,
  Film,
  Image as ImageIcon,
  Download,
  Undo2,
  Redo2,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { DesignSizePreset, SIZE_PRESETS } from "./types";
import { AppRoute } from "../../../hooks/use-router";

interface DesignNavbarProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  sizePreset: DesignSizePreset;
  onSizePresetChange: (preset: DesignSizePreset) => void;
  onNavigate: (route: AppRoute) => void;
  onDownload: () => void;
  onSaveToTimeline: () => void;
  isProcessing: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const DesignNavbar: React.FC<DesignNavbarProps> = ({
  documentTitle,
  onTitleChange,
  sizePreset,
  onSizePresetChange,
  onNavigate,
  onDownload,
  onSaveToTimeline,
  isProcessing,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-bg-1 px-4 z-20 select-none">
      {/* Left: Branding & Back Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate("editor")}
          className="flex items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg transition-colors rounded-md p-1.5 hover:bg-bg-2"
          title="Return to Video Editor"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold">
            <LayoutTemplate size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-transparent text-sm font-bold tracking-tight text-fg border-b border-transparent hover:border-border focus:border-purple-500 focus:outline-none px-1"
                placeholder="Untitled Graphic Design"
              />
              <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">
                Canva + Photoshop Hybrid
              </span>
            </div>
          </div>
        </div>

        {/* Undo / Redo Controls */}
        {(onUndo || onRedo) && (
          <div className="flex items-center rounded-lg border border-border bg-bg-2 p-0.5 ml-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg hover:bg-bg-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={13} />
              <span className="hidden lg:inline">Undo</span>
            </button>
            <div className="h-3 w-px bg-border my-auto" />
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg hover:bg-bg-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={13} />
              <span className="hidden lg:inline">Redo</span>
            </button>
          </div>
        )}
      </div>

      {/* Center: Global Studio Workspace Switcher */}
      <div className="flex items-center gap-1 rounded-lg bg-bg-2 p-1 border border-border shadow-inner">
        <button
          type="button"
          onClick={() => onNavigate("editor")}
          className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-fg-2 hover:text-fg hover:bg-bg-1 transition-all"
        >
          <Film size={13} className="text-emerald-400" />
          <span>Video Editor</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("photo-editor")}
          className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-pink-400 hover:text-pink-300 hover:bg-bg-1 transition-all"
        >
          <ImageIcon size={13} />
          <span>Photo Editor</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-purple-600 text-white px-3 py-1 text-xs font-semibold shadow-sm transition-all"
        >
          <LayoutTemplate size={13} />
          <span>Design Studio (Canva)</span>
        </button>
      </div>

      {/* Right: Format & Actions */}
      <div className="flex items-center gap-2">
        {/* Format Preset Selector */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="text-xs text-fg-muted">Format:</span>
          <select
            value={sizePreset}
            onChange={(e) => onSizePresetChange(e.target.value as DesignSizePreset)}
            className="rounded-md border border-border bg-bg-2 px-2.5 py-1 text-xs font-medium text-fg focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {Object.entries(SIZE_PRESETS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          label="Download PNG"
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={onDownload}
        />

        <Button
          label={isProcessing ? "Adding..." : "Add to Video Timeline"}
          variant="primary"
          size="sm"
          icon={<Film size={14} />}
          disabled={isProcessing}
          onClick={onSaveToTimeline}
          className="bg-purple-600 hover:bg-purple-500 text-white"
        />
      </div>
    </header>
  );
};
