import React, { useRef, useEffect, useCallback, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCw } from "@/icons/lucide-compat";
import { DesignElement, CanvasDimensions } from "./types";
import { FloatingActionBar } from "./FloatingActionBar";

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
  canvasBg: string;
  dimensions: CanvasDimensions;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
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
  canvasBg,
  dimensions,
  zoomLevel,
  onZoomChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Interaction dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number; elemW: number; elemH: number; rot: number }>({
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

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort elements by zIndex or array order
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sorted.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      // Translate to element center for rotation/transforms
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.translate(centerX, centerY);

      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      ctx.scale(el.flipX ? -1 : 1, el.flipV ? -1 : 1);

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
        } else {
          ctx.fillRect(-halfW, -halfH, el.width, el.height);
        }

        if (el.borderWidth && el.borderColor) {
          ctx.lineWidth = el.borderWidth;
          ctx.strokeStyle = el.borderColor;
          ctx.stroke();
        }
      }
      // Render Text
      else if (el.type === "text") {
        ctx.font = `${el.fontWeight || "normal"} ${el.fontSize || 32}px ${el.fontFamily || "Inter"}, sans-serif`;
        ctx.fillStyle = el.fill || "#ffffff";
        ctx.textAlign = el.textAlign || "left";

        const lines = (el.text || "").split("\n");
        const lineHeight = (el.fontSize || 32) * (el.lineHeight || 1.25);
        let textX = -el.width / 2;
        if (el.textAlign === "center") textX = 0;
        if (el.textAlign === "right") textX = el.width / 2;

        const totalTextHeight = lines.length * lineHeight;
        const startY = -totalTextHeight / 2 + (el.fontSize || 32) * 0.85;

        lines.forEach((line, index) => {
          ctx.fillText(line, textX, startY + index * lineHeight);
        });
      }
      // Render Image with Photoshop filters
      else if (el.type === "image" && el.src) {
        const img = imageCacheRef.current.get(el.src);
        if (img && img.complete) {
          const adj = el.adjustments;
          if (adj) {
            const b = 1 + (adj.brightness || 0) / 100;
            const c = 1 + (adj.contrast || 0) / 100;
            const s = 1 + (adj.saturation || 0) / 100;
            const bl = adj.blur || 0;
            ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s}) blur(${bl}px)`;
          }

          ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
          ctx.filter = "none";

          // Warmth/Tint overlay
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
  }, [canvasBg, elements, dimensions]);

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

    // Search top-to-bottom
    const sorted = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const hit = sorted.find((el) => {
      return (
        clickX >= el.x &&
        clickX <= el.x + el.width &&
        clickY >= el.y &&
        clickY <= el.y + el.height
      );
    });

    onSelectId(hit ? hit.id : null);
  };

  // Drag element
  const handleMouseDownElement = (e: React.MouseEvent) => {
    if (!selectedElement || selectedElement.locked) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: selectedElement.x,
      elemY: selectedElement.y,
      elemW: selectedElement.width,
      elemH: selectedElement.height,
      rot: selectedElement.rotation || 0,
    };
  };

  // Handle Resize Node
  const handleMouseDownHandle = (handle: HandleType, e: React.MouseEvent) => {
    if (!selectedElement || selectedElement.locked) return;
    e.stopPropagation();
    setActiveHandle(handle);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: selectedElement.x,
      elemY: selectedElement.y,
      elemW: selectedElement.width,
      elemH: selectedElement.height,
      rot: selectedElement.rotation || 0,
    };
  };

  // Mouse Move listener on window
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElement || selectedElement.locked) return;
      const scale = zoomLevel / 100;
      const dx = (e.clientX - dragStartRef.current.mouseX) / scale;
      const dy = (e.clientY - dragStartRef.current.mouseY) / scale;

      if (isDragging) {
        onUpdateElement(selectedElement.id, {
          x: Math.round(dragStartRef.current.elemX + dx),
          y: Math.round(dragStartRef.current.elemY + dy),
        });
      } else if (activeHandle) {
        let newW = dragStartRef.current.elemW;
        let newH = dragStartRef.current.elemH;
        let newX = dragStartRef.current.elemX;
        let newY = dragStartRef.current.elemY;

        if (activeHandle === "se") {
          newW = Math.max(20, dragStartRef.current.elemW + dx);
          newH = Math.max(20, dragStartRef.current.elemH + dy);
        } else if (activeHandle === "e") {
          newW = Math.max(20, dragStartRef.current.elemW + dx);
        } else if (activeHandle === "s") {
          newH = Math.max(20, dragStartRef.current.elemH + dy);
        } else if (activeHandle === "nw") {
          newW = Math.max(20, dragStartRef.current.elemW - dx);
          newH = Math.max(20, dragStartRef.current.elemH - dy);
          newX = dragStartRef.current.elemX + dx;
          newY = dragStartRef.current.elemY + dy;
        } else if (activeHandle === "sw") {
          newW = Math.max(20, dragStartRef.current.elemW - dx);
          newH = Math.max(20, dragStartRef.current.elemH + dy);
          newX = dragStartRef.current.elemX + dx;
        } else if (activeHandle === "ne") {
          newW = Math.max(20, dragStartRef.current.elemW + dx);
          newH = Math.max(20, dragStartRef.current.elemH - dy);
          newY = dragStartRef.current.elemY + dy;
        } else if (activeHandle === "rot") {
          const canvasCenterY = (dragStartRef.current.elemY + dragStartRef.current.elemH / 2) * scale;
          const canvasCenterX = (dragStartRef.current.elemX + dragStartRef.current.elemW / 2) * scale;
          const angleRad = Math.atan2(e.clientY - canvasCenterY, e.clientX - canvasCenterX);
          const angleDeg = Math.round((angleRad * 180) / Math.PI);
          onUpdateElement(selectedElement.id, { rotation: angleDeg });
          return;
        }

        onUpdateElement(selectedElement.id, {
          width: Math.round(newW),
          height: Math.round(newH),
          x: Math.round(newX),
          y: Math.round(newY),
        });
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

  const scaleRatio = zoomLevel / 100;

  return (
    <div className="flex-1 flex flex-col bg-bg-2/50 relative overflow-hidden select-none">
      {/* Canvas Sub-toolbar */}
      <div className="flex h-10 items-center justify-between border-b border-border bg-bg-1/90 px-4 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fg">
            {dimensions.width} × {dimensions.height} px
          </span>
          <span className="text-[11px] text-fg-muted font-mono">
            ({dimensions.label})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(zoomLevel - 10, 20))}
            className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-mono font-medium text-fg-2 w-12 text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(zoomLevel + 10, 200))}
            className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(45)}
            className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2 transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div
        ref={containerRef}
        onClick={() => onSelectId(null)}
        className="flex-1 flex items-center justify-center p-8 overflow-auto custom-scrollbar"
      >
        <div
          className="relative shadow-2xl rounded-lg overflow-visible border border-border/70"
          style={{
            width: `${dimensions.width * scaleRatio}px`,
            height: `${dimensions.height * scaleRatio}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="block h-full w-full cursor-pointer rounded-lg"
          />

          {/* Interactive Bounding Box for Selected Object */}
          {selectedElement && (
            <div
              onMouseDown={handleMouseDownElement}
              className={`absolute border-2 pointer-events-auto transition-colors ${
                selectedElement.locked
                  ? "border-amber-400 cursor-not-allowed"
                  : "border-purple-500 cursor-move"
              }`}
              style={{
                left: `${selectedElement.x * scaleRatio}px`,
                top: `${selectedElement.y * scaleRatio}px`,
                width: `${selectedElement.width * scaleRatio}px`,
                height: `${selectedElement.height * scaleRatio}px`,
                transform: `rotate(${selectedElement.rotation || 0}deg)`,
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
                onFlipH={() => onUpdateElement(selectedElement.id, { flipX: !selectedElement.flipX })}
                onFlipV={() => onUpdateElement(selectedElement.id, { flipV: !selectedElement.flipY })}
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
          )}
        </div>
      </div>
    </div>
  );
};
