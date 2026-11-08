import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
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
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { ToolcraftText as Text } from "@openreel/ui";
import { useProjectStore } from "../../../stores/project-store";
import { toast } from "../../../stores/notification-store";

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
};

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

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  onSaveToTimeline?: (editedImageBlob: Blob, filename: string) => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  onSaveToTimeline,
}) => {
  const importMedia = useProjectStore((s) => s.importMedia);

  const [imageUrl, setImageUrl] = useState<string>(
    initialImageUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80"
  );
  const [activeTab, setActiveTab] = useState<"adjust" | "crop" | "filters">("adjust");
  const [adjustments, setAdjustments] = useState<PhotoAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeFilterId, setActiveFilterId] = useState<string>("original");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("free");
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Update image when prop changes
  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Load image element
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      renderCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Re-render when adjustments or transforms change
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageElementRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle rotation dimensions
    const isSideways = Math.abs(rotation % 180) === 90;
    canvas.width = isSideways ? img.height : img.width;
    canvas.height = isSideways ? img.width : img.height;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Position center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    if (showOriginal) {
      ctx.filter = "none";
    } else {
      // Build CSS filter string
      const bright = 100 + adjustments.brightness + adjustments.exposure * 0.5;
      const cont = 100 + adjustments.contrast;
      const sat = 100 + adjustments.saturation;
      const sepia = Math.max(0, adjustments.warmth * 0.4);
      const hue = adjustments.tint * 0.8;

      ctx.filter = `brightness(${bright}%) contrast(${cont}%) saturate(${sat}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
    }

    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Draw vignette overlay if active and not showing original
    if (!showOriginal && adjustments.vignette > 0) {
      ctx.save();
      const radius = Math.max(canvas.width, canvas.height) / 2;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * 0.4,
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      const alpha = (adjustments.vignette / 100) * 0.85;
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, [adjustments, rotation, flipH, flipV, showOriginal]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle Adjustment slider changes
  const handleAdjustmentChange = (key: keyof PhotoAdjustments, value: number) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  // Apply Filter
  const applyFilter = (filter: PhotoFilterPreset) => {
    setActiveFilterId(filter.id);
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      ...filter.adjustments,
    });
  };

  // Reset all adjustments
  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId("original");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectRatio("free");
    toast.info("Photo reset", "All adjustments and transformations returned to original.");
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      handleReset();
    }
  };

  // Export current edited image to file
  const handleExportDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = `photo-edit-${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      toast.success("Photo downloaded", "High-resolution edited photo saved successfully.");
    }, "image/png");
  };

  // Save and insert directly into the active video timeline
  const handleSaveToTimeline = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `photo_edit_${Date.now()}.png`, { type: "image/png" });
      const result = await importMedia(file);

      if (result.success) {
        toast.success("Added to Video Studio", "Edited photo has been added to your media assets.");
        if (onSaveToTimeline) {
          onSaveToTimeline(blob, file.name);
        }
        onClose();
      } else {
        toast.error("Import error", result.error?.message || "Failed to add photo to video project.");
      }
    }, "image/png");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="flex flex-col w-[94vw] h-[92vh] max-w-7xl bg-bg-1 border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-border bg-bg-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
              <ImageIcon size={20} />
            </div>
            <div>
              <Text type="label" weight="bold" className="text-sm">
                Photo Editor (Non-Destructive)
              </Text>
              <Text type="supporting" color="secondary" className="text-[11px]">
                Full Photoshop / Canva-grade retouching, color grading, and timeline sync
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              label="Open Image"
              icon={<ImageIcon size={14} />}
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className="text-xs"
            />
            <Button
              label="Reset"
              icon={<RefreshCw size={13} />}
              onClick={handleReset}
              variant="ghost"
              className="text-xs"
            />
            <Button
              label="Download PNG"
              icon={<Download size={14} />}
              onClick={handleExportDownload}
              variant="secondary"
              className="text-xs"
            />
            <Button
              label="Save & Add to Video Timeline"
              icon={<Film size={14} />}
              onClick={handleSaveToTimeline}
              variant="primary"
              className="text-xs bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-3 transition-colors ml-2"
              title="Close Photo Editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left / Center Viewport */}
          <div className="flex-1 flex flex-col min-w-0 bg-bg-3 relative overflow-hidden">
            {/* Viewport Toolbar */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-border/50 bg-bg-2/50 backdrop-blur-sm z-10 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    showOriginal
                      ? "bg-primary text-white border-primary"
                      : "bg-bg-1 text-fg-2 border-border hover:bg-bg-2"
                  }`}
                  title="Hold to see original unedited photo"
                >
                  Hold for Original
                </button>
                <span className="text-[11px] text-fg-muted">
                  {showOriginal ? "(Viewing Original)" : "(Viewing Edited)"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(25, z - 25))}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-fg-2 font-mono w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(300, z + 25))}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2 ml-1"
                  title="Fit to Screen"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div
                className="relative transition-transform duration-100 shadow-2xl rounded-sm overflow-hidden"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <canvas ref={canvasRef} className="max-w-[70vw] max-h-[70vh] object-contain block" />
              </div>
            </div>
          </div>

          {/* Right Inspector & Controls */}
          <div className="w-80 flex flex-col border-l border-border bg-bg-2 shrink-0 overflow-y-auto">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 border-b border-border bg-bg-1 shrink-0">
              <button
                onClick={() => setActiveTab("adjust")}
                className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "adjust"
                    ? "border-pink-500 text-pink-400 bg-pink-500/5"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                <Sliders size={13} />
                Adjust
              </button>
              <button
                onClick={() => setActiveTab("crop")}
                className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "crop"
                    ? "border-pink-500 text-pink-400 bg-pink-500/5"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                <Crop size={13} />
                Transform
              </button>
              <button
                onClick={() => setActiveTab("filters")}
                className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "filters"
                    ? "border-pink-500 text-pink-400 bg-pink-500/5"
                    : "border-transparent text-fg-muted hover:text-fg"
                }`}
              >
                <Palette size={13} />
                Presets
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 space-y-5 flex-1">
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  {/* Light Section */}
                  <div className="space-y-3">
                    <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                      Light & Tone
                    </Text>
                    <AdjustmentSlider
                      label="Brightness"
                      value={adjustments.brightness}
                      onChange={(v) => handleAdjustmentChange("brightness", v)}
                    />
                    <AdjustmentSlider
                      label="Contrast"
                      value={adjustments.contrast}
                      onChange={(v) => handleAdjustmentChange("contrast", v)}
                    />
                    <AdjustmentSlider
                      label="Exposure"
                      value={adjustments.exposure}
                      onChange={(v) => handleAdjustmentChange("exposure", v)}
                    />
                    <AdjustmentSlider
                      label="Highlights"
                      value={adjustments.highlights}
                      onChange={(v) => handleAdjustmentChange("highlights", v)}
                    />
                    <AdjustmentSlider
                      label="Shadows"
                      value={adjustments.shadows}
                      onChange={(v) => handleAdjustmentChange("shadows", v)}
                    />
                  </div>

                  {/* Color Section */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                      Color Balance
                    </Text>
                    <AdjustmentSlider
                      label="Saturation"
                      value={adjustments.saturation}
                      onChange={(v) => handleAdjustmentChange("saturation", v)}
                    />
                    <AdjustmentSlider
                      label="Warmth / Temp"
                      value={adjustments.warmth}
                      onChange={(v) => handleAdjustmentChange("warmth", v)}
                    />
                    <AdjustmentSlider
                      label="Tint"
                      value={adjustments.tint}
                      onChange={(v) => handleAdjustmentChange("tint", v)}
                    />
                  </div>

                  {/* Effects Section */}
                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                      Finish & Effects
                    </Text>
                    <AdjustmentSlider
                      label="Vignette"
                      min={0}
                      max={100}
                      value={adjustments.vignette}
                      onChange={(v) => handleAdjustmentChange("vignette", v)}
                    />
                    <AdjustmentSlider
                      label="Sharpness"
                      min={0}
                      max={100}
                      value={adjustments.sharpness}
                      onChange={(v) => handleAdjustmentChange("sharpness", v)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "crop" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                      Rotate & Flip
                    </Text>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        label="Rotate -90°"
                        icon={<RotateCcw size={14} />}
                        onClick={() => setRotation((r) => r - 90)}
                        variant="secondary"
                        className="text-xs"
                      />
                      <Button
                        label="Rotate +90°"
                        icon={<RotateCw size={14} />}
                        onClick={() => setRotation((r) => r + 90)}
                        variant="secondary"
                        className="text-xs"
                      />
                      <Button
                        label="Flip Horiz"
                        icon={<FlipHorizontal size={14} />}
                        onClick={() => setFlipH((h) => !h)}
                        variant="secondary"
                        className="text-xs"
                      />
                      <Button
                        label="Flip Vert"
                        icon={<FlipVertical size={14} />}
                        onClick={() => setFlipV((v) => !v)}
                        variant="secondary"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-border/50">
                    <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                      Aspect Ratio Presets
                    </Text>
                    <div className="grid grid-cols-3 gap-2">
                      {(["free", "1:1", "4:5", "16:9", "9:16", "3:2"] as AspectRatioPreset[]).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`py-2 px-1 text-xs rounded border transition-colors ${
                            aspectRatio === ratio
                              ? "border-pink-500 bg-pink-500/10 text-pink-400 font-semibold"
                              : "border-border bg-bg-1 text-fg-2 hover:bg-bg-3"
                          }`}
                        >
                          {ratio === "free" ? "Original" : ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "filters" && (
                <div className="space-y-3">
                  <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase tracking-wider">
                    One-Click Filter Presets
                  </Text>
                  <div className="grid grid-cols-2 gap-2">
                    {PHOTO_FILTERS.map((f) => {
                      const isSelected = activeFilterId === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => applyFilter(f)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500/30"
                              : "border-border bg-bg-1 hover:bg-bg-3"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-fg">
                              {f.name}
                            </span>
                            {isSelected && <Check size={12} className="text-pink-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdjustmentSlider: React.FC<{
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}> = ({ label, value, min = -100, max = 100, onChange }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-fg-2 font-medium">{label}</span>
      <span className="text-fg-muted font-mono text-[11px]">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-pink-500"
    />
  </div>
);
