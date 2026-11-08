import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  FlipHorizontal,
  FlipVertical,
  Video,
  Layers,
  Upload,
  FilePlus,
  Eye,
  Trash2,
  AlignCenter,
} from "@/icons/lucide-compat";
import { DesignElement, CanvasDimensions, PageAnimationConfig } from "./types";
import { FloatingActionBar } from "./FloatingActionBar";
import { computeElementAnimation } from "./animation/animation-engine";
import { toast } from "../../../stores/notification-store";

interface MainWorkspaceProps {
  elements: DesignElement[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onDuplicateElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onToggleLock: (id: string) => void;
  onMoveLayer: (id: string, dir: "up" | "down" | "top" | "bottom") => void;
  onOpenPhotoAdjustments?: () => void;
  onOpenAnimate?: () => void;
  onOpenEditImage?: () => void;
  onDeconstructCurrentPoster?: () => void;
  onAddSceneToVideoTimeline?: () => void;
  canvasBg: string;
  dimensions: CanvasDimensions;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onUploadPhoto?: (file: File) => void;
  onStartBlank?: () => void;
  onFitInView?: () => void;

  // Animation playback
  currentTime?: number;
  pageAnimation?: PageAnimationConfig;
  isPlayingAnimation?: boolean;
  onTogglePlayAnimation?: () => void;
  onResetAnimation?: () => void;
  onTimeScrub?: (t: number) => void;
}

type HandleType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "rot";

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  elements,
  selectedId,
  onSelectId,
  onUpdateElement,
  onDuplicateElement,
  onDeleteElement,
  onToggleLock,
  onMoveLayer,
  onOpenPhotoAdjustments,
  onOpenAnimate,
  onOpenEditImage,
  onDeconstructCurrentPoster,
  onAddSceneToVideoTimeline,
  canvasBg,
  dimensions,
  zoomLevel,
  onZoomChange,
  onUploadPhoto,
  onStartBlank,
  onFitInView,
  currentTime = 0,
  pageAnimation = { preset: "none", duration: 5.0 },
  isPlayingAnimation = false,
  onTogglePlayAnimation,
  onResetAnimation,
  onTimeScrub,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Interaction dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
    rot: number;
  }>({
    mouseX: 0,
    mouseY: 0,
    elemX: 0,
    elemY: 0,
    elemW: 0,
    elemH: 0,
    rot: 0,
  });

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Preload and cache images
  useEffect(() => {
    elements.forEach((el) => {
      if (el.type === "image" && el.src && !imageCacheRef.current.has(el.src)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          imageCacheRef.current.set(el.src!, img);
          renderCanvas();
        };
        img.src = el.src;
      }
    });
  }, [elements]);

  // Canvas Renderer (With Real-Time Motion, Style Matches, Color Tint & Photoshop Filters)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort elements by zIndex
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sorted.forEach((el) => {
      // Calculate animated motion transform at current time t
      const animTransform = computeElementAnimation(el, currentTime, pageAnimation);

      ctx.save();
      ctx.globalAlpha = (el.opacity ?? 1) * animTransform.opacity;

      const centerX = el.x + el.width / 2 + animTransform.offsetX;
      const centerY = el.y + el.height / 2 + animTransform.offsetY;
      ctx.translate(centerX, centerY);

      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }

      ctx.scale(
        (el.flipX ? -1 : 1) * animTransform.scaleX,
        (el.flipV || el.flipY ? -1 : 1) * animTransform.scaleY
      );

      // Render Shape
      if (el.type === "shape") {
        ctx.fillStyle = el.backgroundColor || "#3b82f6";
        const halfW = el.width / 2;
        const halfH = el.height / 2;

        if (el.shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(halfW, halfH), 0, Math.PI * 2);
          ctx.fill();
        } else if (el.shapeType === "pill" || (el.borderRadius && el.borderRadius > 0)) {
          const r = el.borderRadius || 12;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(-halfW, -halfH, el.width, el.height, r);
          } else {
            ctx.rect(-halfW, -halfH, el.width, el.height);
          }
          ctx.fill();
        } else if (el.shapeType === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -halfH);
          ctx.lineTo(halfW, halfH);
          ctx.lineTo(-halfW, halfH);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-halfW, -halfH, el.width, el.height);
        }

        if (el.borderWidth && el.borderColor) {
          ctx.lineWidth = el.borderWidth;
          ctx.strokeStyle = el.borderColor;
          ctx.stroke();
        }
      }
      // Render Text (with Justification, Typewriter animation & styling)
      else if (el.type === "text") {
        ctx.font = `${el.fontStyle || "normal"} ${el.fontWeight || "normal"} ${
          el.fontSize || 32
        }px ${el.fontFamily || "Inter"}, sans-serif`;

        const textToRender =
          animTransform.visibleText !== undefined ? animTransform.visibleText : el.text || "";
        const lines = textToRender.split("\n");
        const lineHeight = (el.fontSize || 32) * (el.lineHeight || 1.25);
        let textX = -el.width / 2;

        if (el.textAlign === "center") {
          textX = 0;
          ctx.textAlign = "center";
        } else if (el.textAlign === "right") {
          textX = el.width / 2;
          ctx.textAlign = "right";
        } else if (el.textAlign === "justify") {
          textX = -el.width / 2;
          ctx.textAlign = "left";
        } else {
          textX = -el.width / 2;
          ctx.textAlign = "left";
        }

        const totalTextHeight = lines.length * lineHeight;
        const startY = -totalTextHeight / 2 + (el.fontSize || 32) * 0.85;

        // Text Background Highlight
        if (el.textBackground) {
          ctx.save();
          ctx.fillStyle = el.textBackground;
          ctx.fillRect(-el.width / 2 - 8, -totalTextHeight / 2 - 4, el.width + 16, totalTextHeight + 8);
          ctx.restore();
        }

        // Text Shadow
        if (el.textShadowColor) {
          ctx.shadowColor = el.textShadowColor;
          ctx.shadowBlur = el.textShadowBlur || 8;
        }

        // Text Stroke / Outline
        if (el.strokeColor && el.strokeWidth) {
          ctx.strokeStyle = el.strokeColor;
          ctx.lineWidth = el.strokeWidth;
          lines.forEach((line, index) => {
            ctx.strokeText(line, textX, startY + index * lineHeight);
          });
        }

        ctx.fillStyle = el.fill || "#ffffff";
        lines.forEach((line, index) => {
          ctx.fillText(line, textX, startY + index * lineHeight);
        });
      }
      // Render Image with Photoshop filters, Hue Shift & Color Wash
      else if (el.type === "image" && el.src) {
        const img = imageCacheRef.current.get(el.src);
        if (img && img.complete) {
          const adj = el.adjustments;
          let filterStr = "";

          if (adj) {
            const b = 1 + (adj.brightness || 0) / 100;
            const c = 1 + (adj.contrast || 0) / 100;
            const s = 1 + (adj.saturation || 0) / 100;
            const bl = adj.blur || 0;
            filterStr += `brightness(${b}) contrast(${c}) saturate(${s}) blur(${bl}px) `;

            // Hue Rotate Color Shift (User Request)
            if (adj.hueRotate) {
              filterStr += `hue-rotate(${adj.hueRotate}deg) `;
            }
            if (adj.invert) {
              filterStr += `invert(${adj.invert}%) `;
            }
            if (adj.grayscale) {
              filterStr += `grayscale(${adj.grayscale}%) `;
            }
          }

          // Apply Style Match
          if (el.styleMatch === "etching") {
            filterStr += "grayscale(100%) contrast(160%) ";
          } else if (el.styleMatch === "scrapbook") {
            filterStr += "sepia(45%) contrast(120%) ";
          } else if (el.styleMatch === "cyberpunk") {
            filterStr += "hue-rotate(180deg) saturate(220%) ";
          } else if (el.styleMatch === "duotone") {
            filterStr += "sepia(80%) hue-rotate(280deg) saturate(180%) ";
          }

          if (filterStr) {
            ctx.filter = filterStr.trim();
          }

          ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
          ctx.filter = "none";

          // Color Wash / Tint Overlay (User Request)
          if (adj && adj.colorTint && adj.colorTintIntensity) {
            ctx.save();
            ctx.globalCompositeOperation = "color";
            ctx.fillStyle = adj.colorTint;
            ctx.globalAlpha = (adj.colorTintIntensity / 100) * 0.75;
            ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
            ctx.restore();
          }

          // Warmth / Tint overlay
          if (adj && (adj.warmth || adj.tint)) {
            ctx.save();
            ctx.globalCompositeOperation = "color";
            if (adj.warmth && adj.warmth > 0) {
              ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(adj.warmth / 250, 0.4)})`;
              ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
            } else if (adj.warmth && adj.warmth < 0) {
              ctx.fillStyle = `rgba(0, 150, 255, ${Math.min(Math.abs(adj.warmth) / 250, 0.4)})`;
              ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
            }
            ctx.restore();
          }

          // Vignette
          if (adj && adj.vignette && adj.vignette > 0) {
            ctx.save();
            const radius = Math.max(el.width, el.height) / 2;
            const grad = ctx.createRadialGradient(0, 0, radius * 0.45, 0, 0, radius);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, `rgba(0,0,0,${Math.min(adj.vignette / 100, 0.85)})`);
            ctx.fillStyle = grad;
            ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
            ctx.restore();
          }
        }
      }

      ctx.restore();
    });
  }, [canvasBg, elements, dimensions, currentTime, pageAnimation]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Click canvas to select
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDragging || activeHandle) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check hit in reverse order (topmost layer first)
    const sorted = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const hit = sorted.find(
      (el) =>
        clickX >= el.x &&
        clickX <= el.x + el.width &&
        clickY >= el.y &&
        clickY <= el.y + el.height
    );

    if (hit) {
      onSelectId(hit.id);
    } else {
      onSelectId(null);
    }
  };

  // Dragging element
  const handleMouseDownElement = (e: React.MouseEvent) => {
    if (!selectedElement || selectedElement.locked) return;
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: selectedElement.x,
      elemY: selectedElement.y,
      elemW: selectedElement.width,
      elemH: selectedElement.height,
      rot: selectedElement.rotation,
    };
  };

  // Resize / Rotate Handles
  const handleMouseDownHandle = (handle: HandleType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;
    setActiveHandle(handle);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: selectedElement.x,
      elemY: selectedElement.y,
      elemW: selectedElement.width,
      elemH: selectedElement.height,
      rot: selectedElement.rotation,
    };
  };

  // Global mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElement || selectedElement.locked) return;
      const zoom = zoomLevel / 100;
      const dx = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const dy = (e.clientY - dragStartRef.current.mouseY) / zoom;

      if (isDragging) {
        onUpdateElement(selectedElement.id, {
          x: Math.round(dragStartRef.current.elemX + dx),
          y: Math.round(dragStartRef.current.elemY + dy),
        });
      } else if (activeHandle) {
        const { elemX, elemY, elemW, elemH } = dragStartRef.current;

        if (activeHandle === "rot") {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const centerX = rect.left + (elemX + elemW / 2) * zoom;
          const centerY = rect.top + (elemY + elemH / 2) * zoom;
          const rad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          let deg = Math.round((rad * 180) / Math.PI) - 90;
          if (deg < 0) deg += 360;
          onUpdateElement(selectedElement.id, { rotation: deg });
        } else {
          let newW = elemW;
          let newH = elemH;
          let newX = elemX;
          let newY = elemY;

          if (activeHandle.includes("e")) newW = Math.max(30, elemW + dx);
          if (activeHandle.includes("s")) newH = Math.max(20, elemH + dy);
          if (activeHandle.includes("w")) {
            const proposedW = elemW - dx;
            if (proposedW > 30) {
              newW = proposedW;
              newX = elemX + dx;
            }
          }
          if (activeHandle.includes("n")) {
            const proposedH = elemH - dy;
            if (proposedH > 20) {
              newH = proposedH;
              newY = elemY + dy;
            }
          }

          onUpdateElement(selectedElement.id, {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveHandle(null);
    };

    if (isDragging || activeHandle) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, activeHandle, selectedElement, zoomLevel, onUpdateElement]);

  const zoomFactor = zoomLevel / 100;

  // Autofit / Center Helper
  const handleFitSelected = () => {
    if (!selectedElement) return;
    const padding = 60;
    const targetW = dimensions.width - padding * 2;
    const targetH = dimensions.height - padding * 2;
    const ratio = (selectedElement.width || 400) / (selectedElement.height || 400);

    let newW = targetW;
    let newH = targetW / ratio;
    if (newH > targetH) {
      newH = targetH;
      newW = targetH * ratio;
    }

    onUpdateElement(selectedElement.id, {
      x: Math.round((dimensions.width - newW) / 2),
      y: Math.round((dimensions.height - newH) / 2),
      width: Math.round(newW),
      height: Math.round(newH),
    });
    toast.info("Fitted element within canvas");
  };

  const handleFillSelected = () => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      x: 0,
      y: 0,
      width: dimensions.width,
      height: dimensions.height,
    });
    toast.info("Filled entire canvas");
  };

  const handleCenterSelected = () => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      x: Math.round((dimensions.width - selectedElement.width) / 2),
      y: Math.round((dimensions.height - selectedElement.height) / 2),
    });
    toast.info("Centered element");
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-bg-3 select-none">
      {/* Hidden File Input for Direct Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUploadPhoto) onUploadPhoto(file);
        }}
        accept="image/*"
        className="hidden"
      />

      {/* ── Contextual Top Action Bar ── */}
      <div className="flex h-12 items-center justify-between border-b border-border bg-bg-2 px-4 shrink-0 shadow-xs">
        {selectedElement ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Edit Image Button */}
            {selectedElement.type === "image" && (
              <button
                type="button"
                onClick={onOpenEditImage || onOpenPhotoAdjustments}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all"
              >
                <Sliders size={13} />
                <span>Edit image</span>
              </button>
            )}

            {/* Magic Layers Deconstruct */}
            {selectedElement.type === "image" && onDeconstructCurrentPoster && (
              <button
                type="button"
                onClick={onDeconstructCurrentPoster}
                className="flex items-center gap-1.5 rounded-lg border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 text-xs font-bold text-pink-400 hover:bg-pink-500/20 transition-all"
                title="Deconstruct image into editable layers"
              >
                <Layers size={13} />
                <span>Magic Layers</span>
              </button>
            )}

            {/* Autofit & Alignment Buttons (User Request) */}
            <button
              type="button"
              onClick={handleFitSelected}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs font-semibold text-fg-2 hover:text-fg hover:bg-bg-4 transition-all"
              title="Fit to Canvas"
            >
              <Maximize2 size={12} />
              <span>Fit</span>
            </button>

            <button
              type="button"
              onClick={handleFillSelected}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs font-semibold text-fg-2 hover:text-fg hover:bg-bg-4 transition-all"
              title="Fill Canvas"
            >
              <Layers size={12} />
              <span>Fill</span>
            </button>

            <button
              type="button"
              onClick={handleCenterSelected}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs font-semibold text-fg-2 hover:text-fg hover:bg-bg-4 transition-all"
              title="Center on Canvas"
            >
              <AlignCenter size={12} />
              <span>Center</span>
            </button>

            {/* Flip Horizontal */}
            <button
              type="button"
              onClick={() =>
                onUpdateElement(selectedElement.id, { flipX: !selectedElement.flipX })
              }
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs text-fg-muted hover:text-fg hover:bg-bg-4 transition-all"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={13} />
            </button>

            {/* Flip Vertical */}
            <button
              type="button"
              onClick={() =>
                onUpdateElement(selectedElement.id, { flipV: !selectedElement.flipV })
              }
              className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2 py-1 text-xs text-fg-muted hover:text-fg hover:bg-bg-4 transition-all"
              title="Flip Vertical"
            >
              <FlipVertical size={13} />
            </button>

            {/* Animate Button */}
            <button
              type="button"
              onClick={onOpenAnimate}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles size={13} />
              <span>Animate</span>
            </button>

            {/* Delete Element */}
            <button
              type="button"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
              title="Delete element"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          /* When Nothing is Selected: Canvas Quick Tools */
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:from-purple-500 hover:to-pink-500 transition-all"
              title="Upload photo onto canvas"
            >
              <Upload size={13} />
              <span>Upload Photo</span>
            </button>

            {onStartBlank && (
              <button
                type="button"
                onClick={onStartBlank}
                className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2.5 py-1 text-xs font-semibold text-fg-2 hover:text-fg hover:bg-bg-4 transition-all"
                title="Start blank canvas without template"
              >
                <FilePlus size={12} className="text-purple-400" />
                <span>Blank Canvas</span>
              </button>
            )}

            {onFitInView && (
              <button
                type="button"
                onClick={onFitInView}
                className="flex items-center gap-1 rounded-lg border border-border bg-bg-3 px-2.5 py-1 text-xs font-semibold text-fg-2 hover:text-fg hover:bg-bg-4 transition-all"
                title="Fit entire poster in view"
              >
                <Eye size={12} />
                <span>Fit in View</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAnimate}
              className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all"
            >
              <Sparkles size={12} />
              <span>Animate Design</span>
            </button>
          </div>
        )}

        {/* Viewport Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(15, zoomLevel - 10))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-3 text-fg-muted hover:text-fg"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <span className="w-12 text-center font-mono text-xs text-fg font-semibold">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(200, zoomLevel + 10))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-3 text-fg-muted hover:text-fg"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={onFitInView || (() => onZoomChange(38))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-3 text-fg-muted hover:text-fg"
            title="Fit Poster in View"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Central Scrollable Workspace (Fixed Top Scroll Clipping via m-auto) ── */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative flex flex-1 overflow-auto p-8 bg-bg-3/50"
      >
        <div
          className="relative m-auto shadow-2xl transition-all duration-75 ease-out select-none"
          style={{
            width: dimensions.width * zoomFactor,
            height: dimensions.height * zoomFactor,
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="h-full w-full rounded shadow-xl"
            style={{ display: "block" }}
          />

          {/* Interactive Bounding Box & Handles for Selected Element */}
          {selectedElement && (() => {
            const selectedAnim = computeElementAnimation(selectedElement, currentTime, pageAnimation);
            return (
              <div
                onMouseDown={handleMouseDownElement}
                className={`absolute cursor-move border-2 ${
                  selectedElement.locked ? "border-rose-500" : "border-purple-600"
                }`}
                style={{
                  left: (selectedElement.x + selectedAnim.offsetX) * zoomFactor,
                  top: (selectedElement.y + selectedAnim.offsetY) * zoomFactor,
                  width: Math.max(20, selectedElement.width * selectedAnim.scaleX * zoomFactor),
                  height: Math.max(15, selectedElement.height * selectedAnim.scaleY * zoomFactor),
                  opacity: selectedAnim.opacity,
                  transform: `rotate(${selectedElement.rotation}deg)`,
                  transformOrigin: "center center",
                }}
              >
              {/* Contextual Floating Quick Action Bar */}
              <FloatingActionBar
                element={selectedElement}
                onDuplicate={() => onDuplicateElement(selectedElement.id)}
                onDelete={() => onDeleteElement(selectedElement.id)}
                onToggleLock={() => onToggleLock(selectedElement.id)}
                onMoveLayer={(dir) => onMoveLayer(selectedElement.id, dir)}
                onFlipH={() =>
                  onUpdateElement(selectedElement.id, { flipX: !selectedElement.flipX })
                }
                onFlipV={() =>
                  onUpdateElement(selectedElement.id, { flipV: !selectedElement.flipV })
                }
                onOpenPhotoAdjustments={onOpenPhotoAdjustments}
                zoomLevel={zoomLevel}
              />

              {/* 8 Resize Corner & Edge Nodes (Canva style) */}
              {!selectedElement.locked && (
                <>
                  {/* Rotation Node Top Center */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("rot", e)}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-5 w-5 cursor-grab items-center justify-center rounded-full border border-purple-500 bg-white text-purple-600 shadow-md hover:scale-125 transition-transform"
                    title="Rotate element"
                  >
                    <RotateCw size={11} />
                  </div>
                  <div className="absolute -top-3 left-1/2 h-3 w-px bg-purple-500 -translate-x-1/2" />

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("nw", e)}
                    className="absolute -top-2 -left-2 h-3.5 w-3.5 rounded-full border-2 border-purple-600 bg-white shadow cursor-nwse-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("ne", e)}
                    className="absolute -top-2 -right-2 h-3.5 w-3.5 rounded-full border-2 border-purple-600 bg-white shadow cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("sw", e)}
                    className="absolute -bottom-2 -left-2 h-3.5 w-3.5 rounded-full border-2 border-purple-600 bg-white shadow cursor-nesw-resize hover:scale-125 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("se", e)}
                    className="absolute -bottom-2 -right-2 h-3.5 w-3.5 rounded-full border-2 border-purple-600 bg-white shadow cursor-nwse-resize hover:scale-125 transition-transform"
                  />

                  {/* Edge Midpoint Pills */}
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("n", e)}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-2.5 w-6 rounded-full border border-purple-600 bg-white shadow cursor-ns-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("s", e)}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-2.5 w-6 rounded-full border border-purple-600 bg-white shadow cursor-ns-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("w", e)}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 h-6 w-2.5 rounded-full border border-purple-600 bg-white shadow cursor-ew-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDownHandle("e", e)}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 h-6 w-2.5 rounded-full border border-purple-600 bg-white shadow cursor-ew-resize"
                  />
                </>
              )}
            </div>
          );
        })()}
        </div>
      </div>

      {/* ── Canva Bottom Animation Scrubber & Timeline Bar ── */}
      <div className="flex h-12 items-center justify-between border-t border-border bg-bg-2 px-5 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onTogglePlayAnimation}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm ${
              isPlayingAnimation
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            <Play size={13} className={isPlayingAnimation ? "rotate-90" : ""} />
            <span>{isPlayingAnimation ? "Pause Motion" : "Preview Animate"}</span>
          </button>

          <button
            type="button"
            onClick={onResetAnimation}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-3 text-fg-muted hover:text-fg hover:bg-bg-4 transition-all"
            title="Reset Scrubber"
          >
            <RotateCcw size={12} />
          </button>

          {/* Time Scrubber */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-purple-400 font-bold">
              {currentTime.toFixed(2)}s
            </span>
            <input
              type="range"
              min="0"
              max={pageAnimation.duration || 5.0}
              step="0.05"
              value={currentTime}
              onChange={(e) => onTimeScrub && onTimeScrub(parseFloat(e.target.value))}
              className="w-48 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-xs text-fg-muted">
              / {(pageAnimation.duration || 5.0).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* 1-Click Video Timeline Sync */}
        <div className="flex items-center gap-2">
          {onAddSceneToVideoTimeline && (
            <button
              type="button"
              onClick={onAddSceneToVideoTimeline}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
            >
              <Video size={13} />
              <span>Add Animated Scene to Video Timeline</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
