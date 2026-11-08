import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Palette,
  Download,
  Film,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Check,
  LayoutTemplate,
  Sparkles,
  Upload,
  ArrowLeft,
  Undo2,
  Redo2,
  Trash2,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { useProjectStore } from "../stores/project-store";
import { toast } from "../stores/notification-store";
import { useRouter } from "../hooks/use-router";

export interface PhotoAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  exposure: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  tint: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  vignette: number; // 0 to 100
  sharpness: number; // 0 to 100
  hueRotate?: number; // -180 to 180 degrees
  colorTint?: string; // hex color wash
  colorTintIntensity?: number; // 0 to 100%
  invert?: number; // 0 to 100%
  grayscale?: number; // 0 to 100%
  blur?: number; // 0 to 40 px
}

export const DEFAULT_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  exposure: 0,
  saturation: 0,
  warmth: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  sharpness: 0,
  hueRotate: 0,
  colorTint: "",
  colorTintIntensity: 0,
  invert: 0,
  grayscale: 0,
  blur: 0,
};

export const COLOR_WASH_PRESETS = [
  { name: "Cyan", color: "#06b6d4" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Purple", color: "#a855f7" },
  { name: "Indigo", color: "#6366f1" },
];

export type AspectRatioPreset = "free" | "1:1" | "4:5" | "16:9" | "9:16" | "3:2";

export interface PhotoFilterPreset {
  id: string;
  name: string;
  adjustments: Partial<PhotoAdjustments>;
}

export const PHOTO_FILTERS: PhotoFilterPreset[] = [
  { id: "original", name: "Original", adjustments: {} },
  { id: "vivid", name: "Vivid Pop", adjustments: { contrast: 20, saturation: 35, sharpness: 15 } },
  { id: "warm-gold", name: "Warm Gold", adjustments: { warmth: 40, brightness: 10, saturation: 15 } },
  { id: "cool-teal", name: "Cool Teal", adjustments: { warmth: -35, contrast: 15, highlights: -10 } },
  { id: "vintage-film", name: "Vintage 90s", adjustments: { contrast: -10, warmth: 25, vignette: 30, saturation: -15 } },
  { id: "dramatic-bw", name: "Dramatic B&W", adjustments: { saturation: -100, contrast: 45, exposure: 10, sharpness: 25 } },
  { id: "cyber-neon", name: "Cyber Neon", adjustments: { contrast: 30, saturation: 50, tint: 30, warmth: -20 } },
  { id: "muted-pastel", name: "Muted Pastel", adjustments: { contrast: -20, saturation: -25, brightness: 15, highlights: 20 } },
];

const SAMPLE_IMAGES = [
  { label: "Studio Portrait", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80" },
  { label: "Urban Cityscape", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80" },
  { label: "Mountain Nature", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80" },
  { label: "Vibrant Art", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80" },
];

export const PhotoEditorPage: React.FC = () => {
  const { navigate } = useRouter();
  const importMedia = useProjectStore((s) => s.importMedia);
  const hasOpenProject = useProjectStore((s) => s.hasOpenProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);

  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_IMAGES[3].url);
  const [imageName, setImageName] = useState<string>("Sample Photo");
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });
  const [activeTab, setActiveTab] = useState<"adjust" | "crop" | "filters">("adjust");
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeFilterId, setActiveFilterId] = useState<string>("original");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("free");
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Undo / Redo History Stack
  interface HistoryStep {
    adjustments: PhotoAdjustments;
    rotation: number;
    flipH: boolean;
    flipV: boolean;
    aspectRatio: AspectRatioPreset;
    activeFilterId: string;
  }

  const [history, setHistory] = useState<HistoryStep[]>([
    {
      adjustments: DEFAULT_ADJUSTMENTS,
      rotation: 0,
      flipH: false,
      flipV: false,
      aspectRatio: "free",
      activeFilterId: "original",
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushHistory = useCallback(
    (step: Partial<HistoryStep>) => {
      setHistory((prev) => {
        const current = prev[historyIndex] || {
          adjustments,
          rotation,
          flipH,
          flipV,
          aspectRatio,
          activeFilterId,
        };
        const next: HistoryStep = {
          adjustments: step.adjustments ?? current.adjustments,
          rotation: step.rotation ?? current.rotation,
          flipH: step.flipH ?? current.flipH,
          flipV: step.flipV ?? current.flipV,
          aspectRatio: step.aspectRatio ?? current.aspectRatio,
          activeFilterId: step.activeFilterId ?? current.activeFilterId,
        };
        const updated = [...prev.slice(0, historyIndex + 1), next];
        return updated.slice(-30);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex, adjustments, rotation, flipH, flipV, aspectRatio, activeFilterId]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setAdjustments(prev.adjustments);
      setRotation(prev.rotation);
      setFlipH(prev.flipH);
      setFlipV(prev.flipV);
      setAspectRatio(prev.aspectRatio);
      setActiveFilterId(prev.activeFilterId);
      setHistoryIndex(historyIndex - 1);
      toast.info("Undid last change");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setAdjustments(next.adjustments);
      setRotation(next.rotation);
      setFlipH(next.flipH);
      setFlipV(next.flipV);
      setAspectRatio(next.aspectRatio);
      setActiveFilterId(next.activeFilterId);
      setHistoryIndex(historyIndex + 1);
      toast.info("Redid change");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Load image element
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      setImageDimensions({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      renderCanvas();
    };
    img.onerror = () => {
      toast.error("Failed to load image. Please select a local photo.");
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Re-render when adjustments or transforms change
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!img) {
      // Empty canvas if photo deleted
      canvas.width = 800;
      canvas.height = 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No Photo Active. Click 'Open Image' or 'Replace Photo' to begin.", 400, 300);
      return;
    }

    let targetW = img.naturalWidth || img.width || 800;
    let targetH = img.naturalHeight || img.height || 600;

    if (aspectRatio !== "free") {
      const parts = aspectRatio.split(":").map(Number);
      const ratio = parts[0] / parts[1];
      const curRatio = targetW / targetH;
      if (curRatio > ratio) {
        targetW = Math.round(targetH * ratio);
      } else {
        targetH = Math.round(targetW / ratio);
      }
    }

    const isRotated90 = (Math.abs(rotation) / 90) % 2 === 1;
    canvas.width = isRotated90 ? targetH : targetW;
    canvas.height = isRotated90 ? targetW : targetH;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    if (showOriginal) {
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
      return;
    }

    const b = 1 + adjustments.brightness / 100;
    const c = 1 + adjustments.contrast / 100;
    const s = 1 + adjustments.saturation / 100;
    const exp = 1 + adjustments.exposure / 100;

    let filterStr = `brightness(${b * exp}) contrast(${c}) saturate(${s}) `;
    if (adjustments.hueRotate) {
      filterStr += `hue-rotate(${adjustments.hueRotate}deg) `;
    }
    if (adjustments.blur) {
      filterStr += `blur(${adjustments.blur}px) `;
    }
    if (adjustments.invert) {
      filterStr += `invert(${adjustments.invert}%) `;
    }
    if (adjustments.grayscale) {
      filterStr += `grayscale(${adjustments.grayscale}%) `;
    }

    ctx.filter = filterStr.trim();
    ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
    ctx.filter = "none";

    // Color Wash / Tint Overlay
    if (adjustments.colorTint && adjustments.colorTintIntensity) {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = adjustments.colorTint;
      ctx.globalAlpha = (adjustments.colorTintIntensity / 100) * 0.75;
      ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    }

    // Warmth & Tint Color Balance Overlay
    if (adjustments.warmth !== 0 || adjustments.tint !== 0) {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      if (adjustments.warmth > 0) {
        ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(adjustments.warmth / 250, 0.4)})`;
      } else if (adjustments.warmth < 0) {
        ctx.fillStyle = `rgba(0, 150, 255, ${Math.min(Math.abs(adjustments.warmth) / 250, 0.4)})`;
      }
      ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);

      if (adjustments.tint !== 0) {
        ctx.fillStyle =
          adjustments.tint > 0
            ? `rgba(255, 0, 128, ${Math.min(adjustments.tint / 280, 0.35)})`
            : `rgba(0, 255, 100, ${Math.min(Math.abs(adjustments.tint) / 280, 0.35)})`;
        ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
      }
      ctx.restore();
    }

    // Vignette Effect
    if (adjustments.vignette > 0) {
      ctx.save();
      const radius = Math.max(targetW, targetH) / 2;
      const gradient = ctx.createRadialGradient(0, 0, radius * 0.45, 0, 0, radius);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min(adjustments.vignette / 100, 0.85)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(-targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();
    }

    ctx.restore();
  }, [adjustments, aspectRatio, rotation, flipH, flipV, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId("original");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    pushHistory({
      adjustments: DEFAULT_ADJUSTMENTS,
      rotation: 0,
      flipH: false,
      flipV: false,
      aspectRatio: "free",
      activeFilterId: "original",
    });
    toast.success(`Opened "${file.name}" in Photo Editor`);
  };

  const handleReplacePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = () => {
    imageElementRef.current = null;
    setImageUrl("");
    setImageName("Blank Canvas");
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId("original");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    toast.info("Photo cleared from canvas. Open or replace anytime!");
  };

  const handleFilterSelect = (filter: PhotoFilterPreset) => {
    setActiveFilterId(filter.id);
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      ...filter.adjustments,
    });
  };

  const handleResetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId("original");
    toast.info("Photo adjustments reset to original");
  };

  const handleAutoEnhance = () => {
    setAdjustments({
      brightness: 8,
      contrast: 18,
      exposure: 5,
      saturation: 22,
      warmth: 10,
      tint: 0,
      highlights: 5,
      shadows: 10,
      vignette: 15,
      sharpness: 20,
    });
    setActiveFilterId("vivid");
    toast.success("Applied Auto AI Enhancement");
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${imageName}-edited.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Saved high-res edited PNG");
  };

  const handleSaveToTimeline = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      if (!hasOpenProject) {
        createNewProject("Video Project");
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 1.0)
      );

      if (!blob) {
        toast.error("Failed to render photo export");
        return;
      }

      const filename = `${imageName}-edited-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      await importMedia(file);

      toast.success("Added photo to video timeline media pool!");
      navigate("editor");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add photo to video timeline");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg text-fg select-none">
      {/* ── Top Header & Global Mode Switcher ── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-bg-1 px-4 z-20">
        {/* Left: Branding & Back Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("editor")}
            className="flex items-center gap-1 text-xs font-medium text-fg-2 hover:text-fg transition-colors rounded-md p-1.5 hover:bg-bg-2"
            title="Return to Video Editor"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 font-bold">
              <ImageIcon size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-fg">SAMI Photo Studio</span>
                <span className="rounded bg-pink-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-pink-400">
                  Non-Destructive
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Studio Workspace Switcher */}
        <div className="flex items-center gap-1 rounded-lg bg-bg-2 p-1 border border-border shadow-inner">
          <button
            type="button"
            onClick={() => navigate("editor")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-fg-2 hover:text-fg hover:bg-bg-1 transition-all"
          >
            <Film size={13} className="text-emerald-400" />
            <span>Video Editor</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-pink-500 text-white px-3 py-1 text-xs font-semibold shadow-sm transition-all"
          >
            <ImageIcon size={13} />
            <span>Photo Editor</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("design-studio")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-fg-2 hover:text-fg hover:bg-bg-1 transition-all"
          >
            <LayoutTemplate size={13} className="text-purple-400" />
            <span>Design Studio (Canva)</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Undo / Redo */}
          <div className="flex items-center rounded-lg border border-border bg-bg-2 p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg hover:bg-bg-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo Change"
            >
              <Undo2 size={13} />
              <span className="hidden md:inline">Undo</span>
            </button>
            <div className="h-3 w-px bg-border my-auto" />
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-fg hover:bg-bg-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Redo Change"
            >
              <Redo2 size={13} />
              <span className="hidden md:inline">Redo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReplacePhoto}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold border border-border bg-bg-2 text-fg hover:bg-bg-3 transition-all"
            title="Replace Photo Asset"
          >
            <RefreshCw size={13} className="text-cyan-400" />
            <span>Replace</span>
          </button>

          <button
            type="button"
            onClick={handleDeletePhoto}
            className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
            title="Clear Photo Canvas"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>

          <Button
            label="Open Image"
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          />

          <Button
            label="Auto Enhance"
            variant="secondary"
            size="sm"
            icon={<Sparkles size={14} className="text-amber-400" />}
            onClick={handleAutoEnhance}
          />

          <Button
            label="Download PNG"
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleDownload}
          />

          <Button
            label={isProcessing ? "Adding..." : "Add to Video Timeline"}
            variant="primary"
            size="sm"
            icon={<Film size={14} />}
            disabled={isProcessing}
            onClick={handleSaveToTimeline}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          />
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar / Categories */}
        <div className="flex w-64 flex-col border-r border-border bg-bg-1 shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-border bg-bg-2 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("adjust")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "adjust"
                  ? "bg-bg-1 text-fg shadow-sm font-semibold"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <Sliders size={13} />
              <span>Adjust</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("crop")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "crop"
                  ? "bg-bg-1 text-fg shadow-sm font-semibold"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <RotateCw size={13} />
              <span>Transform</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("filters")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "filters"
                  ? "bg-bg-1 text-fg shadow-sm font-semibold"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              <Palette size={13} />
              <span>Presets</span>
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            {activeTab === "adjust" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-3">
                    Quick Adjustments
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Reset
                  </button>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Brightness</span>
                    <span className="text-fg-muted font-mono">{adjustments.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.brightness}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Contrast</span>
                    <span className="text-fg-muted font-mono">{adjustments.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.contrast}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Exposure */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Exposure</span>
                    <span className="text-fg-muted font-mono">{adjustments.exposure}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.exposure}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, exposure: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Saturation</span>
                    <span className="text-fg-muted font-mono">{adjustments.saturation}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.saturation}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, saturation: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Warmth */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Warmth / Color Temp</span>
                    <span className="text-fg-muted font-mono">{adjustments.warmth}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.warmth}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, warmth: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Tint */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Tint (Green / Magenta)</span>
                    <span className="text-fg-muted font-mono">{adjustments.tint}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={adjustments.tint}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, tint: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Vignette */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Vignette</span>
                    <span className="text-fg-muted font-mono">{adjustments.vignette}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adjustments.vignette}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, vignette: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                {/* Hue Rotate Color Shift */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-fg-2">Hue Rotate (Color Shift)</span>
                    <span className="text-fg-muted font-mono">{adjustments.hueRotate || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={adjustments.hueRotate || 0}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, hueRotate: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {/* Quick Color Wash Overlays */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                    Quick Color Wash Tint
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_WASH_PRESETS.map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            colorTint: swatch.color,
                            colorTintIntensity: prev.colorTintIntensity || 45,
                          }))
                        }
                        className={`h-6 w-6 rounded-full border transition-all ${
                          adjustments.colorTint === swatch.color
                            ? "ring-2 ring-purple-500 scale-110 border-white"
                            : "border-border hover:scale-105"
                        }`}
                        style={{ backgroundColor: swatch.color }}
                        title={swatch.name}
                      />
                    ))}
                    {adjustments.colorTint && (
                      <button
                        type="button"
                        onClick={() =>
                          setAdjustments((prev) => ({
                            ...prev,
                            colorTint: "",
                            colorTintIntensity: 0,
                          }))
                        }
                        className="text-[10px] text-fg-muted hover:text-fg underline ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {adjustments.colorTint && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-fg-2">Tint Wash Intensity</span>
                        <span className="text-fg-muted font-mono">{adjustments.colorTintIntensity || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={adjustments.colorTintIntensity || 0}
                        onChange={(e) =>
                          setAdjustments((prev) => ({ ...prev, colorTintIntensity: Number(e.target.value) }))
                        }
                        className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Invert, Grayscale, Blur */}
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* Blur */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-fg-2">Gaussian Blur</span>
                      <span className="text-fg-muted font-mono">{adjustments.blur || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={adjustments.blur || 0}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, blur: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-fg-2">Grayscale</span>
                      <span className="text-fg-muted font-mono">{adjustments.grayscale || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.grayscale || 0}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, grayscale: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                    />
                  </div>

                  {/* Invert */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-fg-2">Negative / Invert</span>
                      <span className="text-fg-muted font-mono">{adjustments.invert || 0}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adjustments.invert || 0}
                      onChange={(e) =>
                        setAdjustments((prev) => ({ ...prev, invert: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "crop" && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block mb-2">
                    Rotate & Flip
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-2 p-2.5 text-xs font-medium hover:bg-bg-3 transition-colors"
                    >
                      <RotateCw size={14} /> +90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-2 p-2.5 text-xs font-medium hover:bg-bg-3 transition-colors"
                    >
                      <RotateCcw size={14} /> -90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipH((f) => !f)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                        flipH ? "border-pink-500 bg-pink-500/15 text-pink-400" : "border-border bg-bg-2 hover:bg-bg-3"
                      }`}
                    >
                      <FlipHorizontal size={14} /> Flip H
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV((f) => !f)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2.5 text-xs font-medium transition-colors ${
                        flipV ? "border-pink-500 bg-pink-500/15 text-pink-400" : "border-border bg-bg-2 hover:bg-bg-3"
                      }`}
                    >
                      <FlipVertical size={14} /> Flip V
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block mb-2">
                    Aspect Ratio Crop
                  </span>
                  <div className="space-y-1.5">
                    {[
                      { id: "free", label: "Freeform (Original)" },
                      { id: "1:1", label: "Square (1:1 Instagram)" },
                      { id: "4:5", label: "Portrait (4:5 Social)" },
                      { id: "9:16", label: "Reels / TikTok (9:16)" },
                      { id: "16:9", label: "YouTube / Widescreen (16:9)" },
                      { id: "3:2", label: "Classic Photo (3:2)" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAspectRatio(item.id as AspectRatioPreset)}
                        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          aspectRatio === item.id
                            ? "border-pink-500 bg-pink-500/15 text-pink-400 font-semibold"
                            : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                        }`}
                      >
                        <span>{item.label}</span>
                        {aspectRatio === item.id && <Check size={14} className="text-pink-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "filters" && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                  One-Click Filter Presets
                </span>
                <div className="space-y-1.5">
                  {PHOTO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFilterSelect(f)}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                        activeFilterId === f.id
                          ? "border-pink-500 bg-pink-500/15 text-pink-400 font-semibold"
                          : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                      }`}
                    >
                      <span>{f.name}</span>
                      {activeFilterId === f.id && <Check size={14} className="text-pink-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Image selector */}
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block mb-2">
                Sample Stock Photos
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setImageUrl(sample.url);
                      setImageName(sample.label);
                      setAdjustments(DEFAULT_ADJUSTMENTS);
                      setActiveFilterId("original");
                    }}
                    className="rounded-md border border-border bg-bg-2 hover:bg-bg-3 p-1.5 text-[11px] text-left truncate text-fg-2 hover:text-fg transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Canvas Viewport */}
        <div className="flex-1 flex flex-col bg-bg-2/50 relative overflow-hidden">
          {/* Canvas Sub-toolbar */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-bg-1/80 px-4 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                onTouchStart={() => setShowOriginal(true)}
                onTouchEnd={() => setShowOriginal(false)}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors border ${
                  showOriginal
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-border bg-bg-2 text-fg-2 hover:text-fg"
                }`}
              >
                <span>Hold for Original</span>
              </button>
              <span className="text-[11px] text-fg-muted font-mono">
                {showOriginal ? "(Showing Raw Source)" : "(Viewing Edited)"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 30))}
                className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-mono font-medium text-fg-2 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 250))}
                className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2"
                title="Fit 100%"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Display Area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-border/60 transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "center center",
              }}
            >
              <canvas ref={canvasRef} className="block max-h-[75vh] max-w-[70vw] object-contain" />
            </div>
          </div>

          {/* Canvas Footer Status */}
          <div className="flex h-7 items-center justify-between border-t border-border bg-bg-1 px-4 text-[11px] text-fg-muted">
            <div className="flex items-center gap-3">
              <span>Photo: <strong className="text-fg-2">{imageName}</strong></span>
              <span>•</span>
              <span>Dimensions: <strong className="text-fg-2">{imageDimensions.width} × {imageDimensions.height} px</strong></span>
              <span>•</span>
              <span>Aspect: <strong className="text-fg-2">{aspectRatio}</strong></span>
            </div>
            <div>
              <span>Non-destructive WebGL canvas renderer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
