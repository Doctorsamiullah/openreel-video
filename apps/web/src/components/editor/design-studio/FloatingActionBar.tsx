import React from "react";
import {
  Copy,
  Trash2,
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  ArrowDown,
  Sliders,
} from "@/icons/lucide-compat";
import { DesignElement } from "./types";

interface FloatingActionBarProps {
  element: DesignElement;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
  onMoveLayer: (dir: "up" | "down" | "top" | "bottom") => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onOpenPhotoAdjustments?: () => void;
  zoomLevel: number;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  element,
  onDuplicate,
  onDelete,
  onToggleLock,
  onMoveLayer,
  onFlipH,
  onFlipV,
  onOpenPhotoAdjustments,
  zoomLevel,
}) => {
  return (
    <div
      className="absolute z-30 flex items-center gap-1 rounded-xl border border-border bg-bg-1/95 p-1 shadow-2xl backdrop-blur-md transition-all select-none"
      style={{
        left: `${(element.x + element.width / 2) * (zoomLevel / 100)}px`,
        top: `${(element.y - 48) * (zoomLevel / 100)}px`,
        transform: "translateX(-50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Duplicate */}
      <button
        type="button"
        onClick={onDuplicate}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-fg-2 hover:bg-bg-2 hover:text-fg transition-colors"
        title="Duplicate Layer (Ctrl+D)"
      >
        <Copy size={13} />
        <span className="hidden sm:inline">Duplicate</span>
      </button>

      {/* Lock / Unlock */}
      <button
        type="button"
        onClick={onToggleLock}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
          element.locked
            ? "bg-amber-500/20 text-amber-400 font-semibold"
            : "text-fg-2 hover:bg-bg-2 hover:text-fg"
        }`}
        title={element.locked ? "Unlock element" : "Lock element"}
      >
        {element.locked ? <Lock size={13} /> : <Unlock size={13} />}
      </button>

      {/* Image Photo Filters shortcut */}
      {element.type === "image" && onOpenPhotoAdjustments && (
        <button
          type="button"
          onClick={onOpenPhotoAdjustments}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
          title="Open Photo Adjustments (Photoshop)"
        >
          <Sliders size={13} />
          <span className="hidden sm:inline">Adjust</span>
        </button>
      )}

      {/* Flips (for images or shapes) */}
      {onFlipH && (
        <button
          type="button"
          onClick={onFlipH}
          className={`rounded-lg p-1 text-xs transition-colors ${
            element.flipX ? "bg-purple-500/20 text-purple-400" : "text-fg-2 hover:bg-bg-2 hover:text-fg"
          }`}
          title="Flip Horizontal"
        >
          <FlipHorizontal size={13} />
        </button>
      )}

      {onFlipV && (
        <button
          type="button"
          onClick={onFlipV}
          className={`rounded-lg p-1 text-xs transition-colors ${
            element.flipV ? "bg-purple-500/20 text-purple-400" : "text-fg-2 hover:bg-bg-2 hover:text-fg"
          }`}
          title="Flip Vertical"
        >
          <FlipVertical size={13} />
        </button>
      )}

      <div className="h-3 w-px bg-border my-auto" />

      {/* Layer Position */}
      <button
        type="button"
        onClick={() => onMoveLayer("up")}
        className="rounded-lg p-1 text-xs text-fg-2 hover:bg-bg-2 hover:text-fg transition-colors"
        title="Bring Forward"
      >
        <ArrowUp size={13} />
      </button>

      <button
        type="button"
        onClick={() => onMoveLayer("down")}
        className="rounded-lg p-1 text-xs text-fg-2 hover:bg-bg-2 hover:text-fg transition-colors"
        title="Send Backward"
      >
        <ArrowDown size={13} />
      </button>

      <div className="h-3 w-px bg-border my-auto" />

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-1 text-xs text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
        title="Delete Layer"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};
