import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "../../../hooks/use-router";
import {
  X,
  LayoutTemplate,
  Type,
  Shapes,
  Palette,
  Download,
  Film,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Square,
  Circle,
  ExternalLink,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { ToolcraftText as Text } from "@openreel/ui";
import { useProjectStore } from "../../../stores/project-store";
import { toast } from "../../../stores/notification-store";

export type DesignSizePreset =
  | "instagram-post"
  | "instagram-story"
  | "youtube-thumbnail"
  | "a4-flyer"
  | "presentation-16-9";

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
}

export const SIZE_PRESETS: Record<DesignSizePreset, CanvasDimensions> = {
  "instagram-post": { width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  "instagram-story": { width: 1080, height: 1920, label: "Story / Reel / TikTok (9:16)" },
  "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail (16:9)" },
  "a4-flyer": { width: 1240, height: 1754, label: "A4 Flyer (Print)" },
  "presentation-16-9": { width: 1920, height: 1080, label: "Presentation (16:9)" },
};

export interface DesignElement {
  id: string;
  type: "text" | "shape" | "badge" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fill?: string;
  textAlign?: "left" | "center" | "right";
  // Shape specific
  shapeType?: "rect" | "circle" | "pill" | "star";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  // Badge / Sticker specific
  badgeLabel?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: "Retail" | "Healthcare" | "Education" | "Festival" | "Creator";
  size: DesignSizePreset;
  backgroundColor: string;
  elements: DesignElement[];
}

export const CANVA_TEMPLATES: DesignTemplate[] = [
  {
    id: "sale-mega-1",
    name: "Mega Discount Sale (50% OFF)",
    category: "Retail",
    size: "instagram-post",
    backgroundColor: "#0f172a",
    elements: [
      {
        id: "badge-1",
        type: "shape",
        shapeType: "pill",
        x: 340,
        y: 120,
        width: 400,
        height: 70,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#f43f5e",
        borderRadius: 35,
      },
      {
        id: "text-badge-1",
        type: "text",
        text: "LIMITED TIME OFFER",
        x: 360,
        y: 135,
        width: 360,
        height: 50,
        rotation: 0,
        opacity: 1,
        fontSize: 26,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "text-head-1",
        type: "text",
        text: "MEGA SALE",
        x: 140,
        y: 280,
        width: 800,
        height: 140,
        rotation: 0,
        opacity: 1,
        fontSize: 96,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#fbbf24",
        textAlign: "center",
      },
      {
        id: "text-hindi-1",
        type: "text",
        text: "महा धमाका सेल — सभी उत्पादों पर भारी छूट",
        x: 100,
        y: 450,
        width: 880,
        height: 70,
        rotation: 0,
        opacity: 1,
        fontSize: 32,
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontWeight: "700",
        fill: "#e2e8f0",
        textAlign: "center",
      },
      {
        id: "card-discount-1",
        type: "shape",
        shapeType: "rect",
        x: 290,
        y: 580,
        width: 500,
        height: 180,
        rotation: -2,
        opacity: 1,
        backgroundColor: "#e11d48",
        borderRadius: 20,
      },
      {
        id: "text-discount-1",
        type: "text",
        text: "50% FLAT OFF",
        x: 300,
        y: 620,
        width: 480,
        height: 100,
        rotation: -2,
        opacity: 1,
        fontSize: 64,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "text-call-1",
        type: "text",
        text: "Order Now: +91 98765 43210 • Free Delivery",
        x: 100,
        y: 890,
        width: 880,
        height: 50,
        rotation: 0,
        opacity: 1,
        fontSize: 28,
        fontFamily: "'Inter', sans-serif",
        fontWeight: "600",
        fill: "#94a3b8",
        textAlign: "center",
      },
    ],
  },
  {
    id: "clinic-health-1",
    name: "Doctor Consultation & Free Camp",
    category: "Healthcare",
    size: "instagram-post",
    backgroundColor: "#f8fafc",
    elements: [
      {
        id: "top-bar-1",
        type: "shape",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: 1080,
        height: 150,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#0284c7",
      },
      {
        id: "clinic-title-1",
        type: "text",
        text: "SANJEEVANI HEALTHCARE CLINIC",
        x: 60,
        y: 50,
        width: 960,
        height: 60,
        rotation: 0,
        opacity: 1,
        fontSize: 40,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "800",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "camp-head-1",
        type: "text",
        text: "FREE MEDICAL CHECKUP CAMP",
        x: 60,
        y: 240,
        width: 960,
        height: 90,
        rotation: 0,
        opacity: 1,
        fontSize: 52,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#0369a1",
        textAlign: "center",
      },
      {
        id: "hindi-camp-1",
        type: "text",
        text: "निःशुल्क स्वास्थ्य जांच शिविर — हर रविवार सुबह 9 बजे",
        x: 80,
        y: 350,
        width: 920,
        height: 60,
        rotation: 0,
        opacity: 1,
        fontSize: 30,
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontWeight: "700",
        fill: "#334155",
        textAlign: "center",
      },
      {
        id: "urdu-camp-1",
        type: "text",
        text: "مفت طبی معائنہ کیمپ — ماہر ڈاکٹروں کی زیر نگرانی",
        x: 80,
        y: 430,
        width: 920,
        height: 60,
        rotation: 0,
        opacity: 1,
        fontSize: 32,
        fontFamily: "'Noto Nastaliq Urdu', serif",
        fontWeight: "700",
        fill: "#047857",
        textAlign: "center",
      },
      {
        id: "card-timing-1",
        type: "shape",
        shapeType: "rect",
        x: 140,
        y: 560,
        width: 800,
        height: 240,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#e0f2fe",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 16,
      },
      {
        id: "services-list-1",
        type: "text",
        text: "✔ Blood Pressure & Sugar  ✔ ECG Checkup  ✔ Free Medicines",
        x: 160,
        y: 650,
        width: 760,
        height: 50,
        rotation: 0,
        opacity: 1,
        fontSize: 26,
        fontFamily: "'Inter', sans-serif",
        fontWeight: "700",
        fill: "#0c4a6e",
        textAlign: "center",
      },
    ],
  },
  {
    id: "creator-youtube-1",
    name: "Epic YouTube Gaming / Tech Thumbnail",
    category: "Creator",
    size: "youtube-thumbnail",
    backgroundColor: "#09090b",
    elements: [
      {
        id: "badge-yt-1",
        type: "shape",
        shapeType: "rect",
        x: 80,
        y: 80,
        width: 320,
        height: 70,
        rotation: -3,
        opacity: 1,
        backgroundColor: "#ef4444",
        borderRadius: 12,
      },
      {
        id: "badge-yt-txt-1",
        type: "text",
        text: "DONT MISS THIS!",
        x: 100,
        y: 95,
        width: 280,
        height: 50,
        rotation: -3,
        opacity: 1,
        fontSize: 28,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "head-yt-1",
        type: "text",
        text: "TOP 10 SECRETS",
        x: 80,
        y: 200,
        width: 750,
        height: 120,
        rotation: 0,
        opacity: 1,
        fontSize: 84,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#facc15",
        textAlign: "left",
      },
      {
        id: "sub-yt-1",
        type: "text",
        text: "THAT CHANGED EVERYTHING",
        x: 80,
        y: 340,
        width: 900,
        height: 90,
        rotation: 0,
        opacity: 1,
        fontSize: 54,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#ffffff",
        textAlign: "left",
      },
    ],
  },
  {
    id: "festival-diwali-1",
    name: "Diwali Festival of Lights Greeting",
    category: "Festival",
    size: "instagram-post",
    backgroundColor: "#311042",
    elements: [
      {
        id: "fest-head-1",
        type: "text",
        text: "शुभ दीपावली",
        x: 140,
        y: 240,
        width: 800,
        height: 130,
        rotation: 0,
        opacity: 1,
        fontSize: 90,
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontWeight: "900",
        fill: "#f59e0b",
        textAlign: "center",
      },
      {
        id: "fest-sub-1",
        type: "text",
        text: "HAPPY DIWALI",
        x: 140,
        y: 400,
        width: 800,
        height: 80,
        rotation: 0,
        opacity: 1,
        fontSize: 56,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "800",
        fill: "#fde047",
        textAlign: "center",
      },
      {
        id: "fest-desc-1",
        type: "text",
        text: "May this divine festival bring peace, prosperity, and radiant joy to your home.",
        x: 120,
        y: 560,
        width: 840,
        height: 100,
        rotation: 0,
        opacity: 1,
        fontSize: 32,
        fontFamily: "'Inter', sans-serif",
        fontWeight: "500",
        fill: "#e9d5ff",
        textAlign: "center",
      },
    ],
  },
];

interface DesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToTimeline?: (designBlob: Blob, name: string) => void;
}

export const DesignStudioModal: React.FC<DesignStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToTimeline,
}) => {
  const importMedia = useProjectStore((s) => s.importMedia);

  const [docName, setDocName] = useState("Social Graphic Design");
  const [sizePreset, setSizePreset] = useState<DesignSizePreset>("instagram-post");
  const [activeTab, setActiveTab] = useState<"templates" | "text" | "elements" | "brand">("templates");
  const [canvasBg, setCanvasBg] = useState("#0f172a");
  const [elements, setElements] = useState<DesignElement[]>(CANVA_TEMPLATES[0].elements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(50);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentDimensions = SIZE_PRESETS[sizePreset];

  // Render elements to 2D canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = currentDimensions.width;
    canvas.height = currentDimensions.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    for (const el of elements) {
      ctx.save();
      ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
      ctx.rotate((el.rotation * Math.PI) / 180);
      ctx.globalAlpha = el.opacity;

      if (el.type === "shape") {
        ctx.fillStyle = el.backgroundColor || "#3b82f6";
        if (el.shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rounded rect / pill
          const r = el.borderRadius || 0;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(-el.width / 2, -el.height / 2, el.width, el.height, r);
          } else {
            ctx.rect(-el.width / 2, -el.height / 2, el.width, el.height);
          }
          ctx.fill();
          if (el.borderColor && el.borderWidth) {
            ctx.strokeStyle = el.borderColor;
            ctx.lineWidth = el.borderWidth;
            ctx.stroke();
          }
        }
      } else if (el.type === "text" && el.text) {
        ctx.fillStyle = el.fill || "#ffffff";
        ctx.font = `${el.fontStyle || "normal"} ${el.fontWeight || "normal"} ${el.fontSize || 32}px ${el.fontFamily || "sans-serif"}`;
        ctx.textAlign = el.textAlign || "center";
        ctx.textBaseline = "middle";

        const textX = el.textAlign === "left" ? -el.width / 2 : el.textAlign === "right" ? el.width / 2 : 0;
        ctx.fillText(el.text, textX, 0);
      }

      ctx.restore();
    }
  }, [canvasBg, elements, currentDimensions]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedElementId) || null,
    [elements, selectedElementId]
  );

  // Apply a Canva template
  const handleApplyTemplate = (tmpl: DesignTemplate) => {
    setSizePreset(tmpl.size);
    setCanvasBg(tmpl.backgroundColor);
    setElements(tmpl.elements);
    setSelectedElementId(null);
    toast.success("Template applied", `Loaded "${tmpl.name}" with editable layers.`);
  };

  // Add new text element
  const handleAddText = (type: "heading" | "subheading" | "body" | "hindi" | "urdu") => {
    const id = `text_${Date.now()}`;
    let newEl: DesignElement;

    if (type === "heading") {
      newEl = {
        id,
        type: "text",
        text: "Add Catchy Heading",
        x: currentDimensions.width / 2 - 350,
        y: currentDimensions.height / 2 - 50,
        width: 700,
        height: 100,
        rotation: 0,
        opacity: 1,
        fontSize: 64,
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: "900",
        fill: "#ffffff",
        textAlign: "center",
      };
    } else if (type === "hindi") {
      newEl = {
        id,
        type: "text",
        text: "यहाँ मुख्य शीर्षक लिखें",
        x: currentDimensions.width / 2 - 350,
        y: currentDimensions.height / 2 - 40,
        width: 700,
        height: 80,
        rotation: 0,
        opacity: 1,
        fontSize: 52,
        fontFamily: "'Noto Sans Devanagari', sans-serif",
        fontWeight: "800",
        fill: "#fbbf24",
        textAlign: "center",
      };
    } else if (type === "urdu") {
      newEl = {
        id,
        type: "text",
        text: "یہاں دلکش عنوان شامل کریں",
        x: currentDimensions.width / 2 - 350,
        y: currentDimensions.height / 2 - 40,
        width: 700,
        height: 80,
        rotation: 0,
        opacity: 1,
        fontSize: 48,
        fontFamily: "'Noto Nastaliq Urdu', serif",
        fontWeight: "700",
        fill: "#34d399",
        textAlign: "center",
      };
    } else {
      newEl = {
        id,
        type: "text",
        text: "Add clear descriptive paragraph text for your viewers.",
        x: currentDimensions.width / 2 - 300,
        y: currentDimensions.height / 2,
        width: 600,
        height: 60,
        rotation: 0,
        opacity: 1,
        fontSize: 28,
        fontFamily: "'Inter', sans-serif",
        fontWeight: "500",
        fill: "#cbd5e1",
        textAlign: "center",
      };
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
  };

  // Add new shape element
  const handleAddShape = (shapeType: "rect" | "circle" | "pill") => {
    const id = `shape_${Date.now()}`;
    const newEl: DesignElement = {
      id,
      type: "shape",
      shapeType,
      x: currentDimensions.width / 2 - 150,
      y: currentDimensions.height / 2 - 150,
      width: shapeType === "pill" ? 400 : 300,
      height: shapeType === "pill" ? 80 : 300,
      rotation: 0,
      opacity: 1,
      backgroundColor: "#ec4899",
      borderRadius: shapeType === "pill" ? 40 : 16,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedElementId(id);
  };

  // Update selected element property
  const updateSelectedProperty = (patch: Partial<DesignElement>) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedElementId ? { ...el, ...patch } : el))
    );
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  // Download export
  const handleDownloadImage = (format: "png" | "jpeg" = "png") => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = `${docName.replace(/\s+/g, "_")}.${format}`;
      link.href = URL.createObjectURL(blob);
      link.click();
      toast.success("Graphic exported", `Downloaded as high-resolution ${format.toUpperCase()}.`);
    }, `image/${format}`);
  };

  // Send design directly to Video Timeline
  const handleSendToVideoTimeline = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${docName.replace(/\s+/g, "_")}.png`, { type: "image/png" });
      const result = await importMedia(file);

      if (result.success) {
        toast.success(
          "Design added to Video Timeline!",
          "High-res design card imported directly into your video project assets."
        );
        if (onInsertToTimeline) {
          onInsertToTimeline(blob, file.name);
        }
        onClose();
      } else {
        toast.error("Import failed", result.error?.message || "Could not add design to video timeline.");
      }
    }, "image/png");
  };

  const { navigate } = useRouter();

  if (!isOpen) return null;

  const handleOpenFullPage = () => {
    onClose();
    navigate("design-studio");
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/90 backdrop-blur-md isolation-auto">
      <div className="flex flex-col w-[96vw] h-[94vh] max-w-7xl bg-bg-1 border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Navigation Bar */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-border bg-bg-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <LayoutTemplate size={20} />
            </div>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="bg-transparent border-0 font-bold text-sm text-fg focus:bg-bg-3 px-2 py-1 rounded max-w-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="flex items-center gap-1 rounded bg-purple-500/20 hover:bg-purple-500/30 px-2 py-1 text-[10px] font-bold text-purple-400 transition-colors"
              title="Open dedicated full page studio without timeline overlay"
            >
              <ExternalLink size={10} />
              <span>Open Full Page</span>
            </button>
          </div>

          {/* Size Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted font-medium">Format:</span>
            <select
              value={sizePreset}
              onChange={(e) => setSizePreset(e.target.value as DesignSizePreset)}
              className="bg-bg-3 border border-border text-fg text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {(Object.keys(SIZE_PRESETS) as DesignSizePreset[]).map((key) => (
                <option key={key} value={key}>
                  {SIZE_PRESETS[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              label="Download PNG"
              icon={<Download size={14} />}
              onClick={() => handleDownloadImage("png")}
              variant="secondary"
              className="text-xs"
            />
            <Button
              label="Add to Video Timeline"
              icon={<Film size={14} />}
              onClick={handleSendToVideoTimeline}
              variant="primary"
              className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-bg-3 transition-colors ml-2"
              title="Close Design Studio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Tool Rail (Canva Tabs) */}
          <div className="w-16 border-r border-border bg-bg-2 flex flex-col items-center py-3 gap-3 shrink-0">
            <RailTabButton
              icon={<LayoutTemplate size={18} />}
              label="Templates"
              isActive={activeTab === "templates"}
              onClick={() => setActiveTab("templates")}
            />
            <RailTabButton
              icon={<Type size={18} />}
              label="Text"
              isActive={activeTab === "text"}
              onClick={() => setActiveTab("text")}
            />
            <RailTabButton
              icon={<Shapes size={18} />}
              label="Elements"
              isActive={activeTab === "elements"}
              onClick={() => setActiveTab("elements")}
            />
            <RailTabButton
              icon={<Palette size={18} />}
              label="Brand"
              isActive={activeTab === "brand"}
              onClick={() => setActiveTab("brand")}
            />
          </div>

          {/* Tab Sub-Panel (Drawer) */}
          <div className="w-72 border-r border-border bg-bg-1 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
            {activeTab === "templates" && (
              <div className="space-y-3">
                <Text type="label" weight="bold" className="text-xs">
                  Starter Templates (Canva-grade)
                </Text>
                <div className="space-y-2">
                  {CANVA_TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="p-3 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 cursor-pointer transition-all hover:border-purple-500/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-fg">
                          {tmpl.name}
                        </span>
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
                          {tmpl.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-fg-muted block">
                        {SIZE_PRESETS[tmpl.size].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-4">
                <Text type="label" weight="bold" className="text-xs">
                  Typography & Multilingual Text
                </Text>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddText("heading")}
                    className="w-full p-3 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 text-left font-black text-lg text-fg"
                  >
                    Add Heading
                  </button>
                  <button
                    onClick={() => handleAddText("subheading")}
                    className="w-full p-2.5 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 text-left font-semibold text-sm text-fg-2"
                  >
                    Add Subheading
                  </button>
                  <button
                    onClick={() => handleAddText("body")}
                    className="w-full p-2 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 text-left text-xs text-fg-muted"
                  >
                    Add Body Text
                  </button>
                  <button
                    onClick={() => handleAddText("hindi")}
                    className="w-full p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-left font-bold text-sm text-amber-400"
                  >
                    + हिंदी शीर्षक (Devanagari)
                  </button>
                  <button
                    onClick={() => handleAddText("urdu")}
                    className="w-full p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-right font-bold text-sm text-emerald-400"
                  >
                    + اردو عنوان شامل کریں (RTL)
                  </button>
                </div>
              </div>
            )}

            {activeTab === "elements" && (
              <div className="space-y-4">
                <Text type="label" weight="bold" className="text-xs">
                  Shapes & Badges
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddShape("rect")}
                    className="p-3 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 flex flex-col items-center gap-1.5"
                  >
                    <Square size={20} className="text-pink-400" />
                    <span className="text-[11px] font-medium text-fg">Card / Box</span>
                  </button>
                  <button
                    onClick={() => handleAddShape("circle")}
                    className="p-3 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 flex flex-col items-center gap-1.5"
                  >
                    <Circle size={20} className="text-purple-400" />
                    <span className="text-[11px] font-medium text-fg">Circle</span>
                  </button>
                  <button
                    onClick={() => handleAddShape("pill")}
                    className="col-span-2 p-2.5 rounded-lg border border-border bg-bg-2 hover:bg-bg-3 flex items-center justify-center gap-2"
                  >
                    <div className="w-12 h-5 rounded-full bg-pink-500" />
                    <span className="text-xs font-semibold text-fg">Pill Badge</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-border/50 space-y-2">
                  <Text type="supporting" color="secondary" weight="bold" className="text-[10px] uppercase">
                    Background Color
                  </Text>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={canvasBg}
                      onChange={(e) => setCanvasBg(e.target.value)}
                      className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <span className="text-xs text-fg font-mono uppercase">{canvasBg}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "brand" && (
              <div className="space-y-4">
                <Text type="label" weight="bold" className="text-xs">
                  Brand Kit
                </Text>
                <div className="space-y-2">
                  <span className="text-[11px] text-fg-muted">Quick Brand Colors:</span>
                  <div className="flex gap-2">
                    {["#0f172a", "#3b82f6", "#ec4899", "#10b981", "#f59e0b"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCanvasBg(c)}
                        className="w-7 h-7 rounded-full border border-border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Interactive Canvas Viewport */}
          <div className="flex-1 flex flex-col min-w-0 bg-bg-3 relative overflow-hidden">
            {/* Viewport Zoom & Info Bar */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-border/50 bg-bg-2/50 backdrop-blur-sm z-10 shrink-0">
              <span className="text-[11px] text-fg-muted font-mono">
                {currentDimensions.width} × {currentDimensions.height} px
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(20, z - 10))}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-fg-2 font-mono w-12 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoomLevel(50)}
                  className="p-1 text-fg-muted hover:text-fg rounded hover:bg-bg-2 ml-1"
                  title="Fit to Screen"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* Canvas Stage Area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
              <div
                className="relative shadow-2xl transition-transform duration-75"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
              >
                <canvas ref={canvasRef} className="block shadow-xl rounded-sm" />

                {/* Overlaid Click Targets for Element Selection */}
                {elements.map((el) => {
                  const isSelected = selectedElementId === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                      }}
                      className={`absolute cursor-pointer transition-all ${
                        isSelected
                          ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent"
                          : "hover:ring-1 hover:ring-purple-400/50"
                      }`}
                      style={{
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height,
                        transform: `rotate(${el.rotation}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="w-72 border-l border-border bg-bg-2 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
            <Text type="label" weight="bold" className="text-xs border-b border-border pb-2">
              Layer Inspector
            </Text>

            {selectedElement ? (
              <div className="space-y-4">
                {/* Text Editing if Text Element */}
                {selectedElement.type === "text" && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-fg-muted font-medium">Text Content:</span>
                    <textarea
                      value={selectedElement.text || ""}
                      onChange={(e) => updateSelectedProperty({ text: e.target.value })}
                      className="w-full h-20 p-2 text-xs bg-bg-1 border border-border rounded-lg text-fg focus:outline-none"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-fg-muted">Font Size:</span>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 32}
                        onChange={(e) => updateSelectedProperty({ fontSize: Number(e.target.value) })}
                        className="w-16 p-1 text-xs bg-bg-1 border border-border rounded text-center text-fg"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-fg-muted">Text Color:</span>
                      <input
                        type="color"
                        value={selectedElement.fill || "#ffffff"}
                        onChange={(e) => updateSelectedProperty({ fill: e.target.value })}
                        className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Shape Editing if Shape Element */}
                {selectedElement.type === "shape" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-fg-muted">Fill Color:</span>
                      <input
                        type="color"
                        value={selectedElement.backgroundColor || "#ec4899"}
                        onChange={(e) => updateSelectedProperty({ backgroundColor: e.target.value })}
                        className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-fg-muted">Corner Radius:</span>
                      <input
                        type="number"
                        value={selectedElement.borderRadius || 0}
                        onChange={(e) => updateSelectedProperty({ borderRadius: Number(e.target.value) })}
                        className="w-16 p-1 text-xs bg-bg-1 border border-border rounded text-center text-fg"
                      />
                    </div>
                  </div>
                )}

                {/* Transform & Opacity */}
                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-fg-muted">Opacity:</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={selectedElement.opacity}
                      onChange={(e) => updateSelectedProperty({ opacity: Number(e.target.value) })}
                      className="w-28 accent-purple-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-fg-muted">Rotation:</span>
                    <input
                      type="number"
                      value={selectedElement.rotation}
                      onChange={(e) => updateSelectedProperty({ rotation: Number(e.target.value) })}
                      className="w-16 p-1 text-xs bg-bg-1 border border-border rounded text-center text-fg"
                    />
                  </div>
                </div>

                {/* Actions: Duplicate / Delete */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  <Button
                    label="Delete"
                    icon={<Trash2 size={13} />}
                    onClick={() => handleDeleteElement(selectedElement.id)}
                    variant="danger"
                    className="flex-1 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-fg-muted">
                Click any element on canvas to inspect and edit properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const RailTabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
      isActive
        ? "bg-purple-500/10 text-purple-400 font-semibold"
        : "text-fg-muted hover:text-fg hover:bg-bg-3"
    }`}
    title={label}
  >
    {icon}
    <span className="text-[9px] mt-0.5">{label}</span>
  </button>
);
