import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
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
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { useProjectStore } from "../stores/project-store";
import { toast } from "../stores/notification-store";
import { useRouter } from "../hooks/use-router";

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
        id: "badge-text-1",
        type: "text",
        x: 340,
        y: 135,
        width: 400,
        height: 50,
        rotation: 0,
        opacity: 1,
        text: "SPECIAL WEEKEND SALE",
        fontSize: 24,
        fontWeight: "bold",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "headline-1",
        type: "text",
        x: 90,
        y: 280,
        width: 900,
        height: 220,
        rotation: 0,
        opacity: 1,
        text: "FLAT 50% OFF\nEVERYTHING",
        fontSize: 88,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#facc15",
        textAlign: "center",
      },
      {
        id: "sub-1",
        type: "text",
        x: 140,
        y: 560,
        width: 800,
        height: 80,
        rotation: 0,
        opacity: 1,
        text: "Upgrade your style with premium collections.\nFree delivery across India.",
        fontSize: 30,
        fontWeight: "500",
        fontFamily: "Inter",
        fill: "#e2e8f0",
        textAlign: "center",
      },
      {
        id: "cta-btn",
        type: "shape",
        shapeType: "rect",
        x: 365,
        y: 720,
        width: 350,
        height: 80,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#10b981",
        borderRadius: 14,
      },
      {
        id: "cta-txt",
        type: "text",
        x: 365,
        y: 742,
        width: 350,
        height: 50,
        rotation: 0,
        opacity: 1,
        text: "SHOP NOW ➔",
        fontSize: 28,
        fontWeight: "bold",
        fontFamily: "Montserrat",
        fill: "#0f172a",
        textAlign: "center",
      },
    ],
  },
  {
    id: "doctor-consult-1",
    name: "Doctor Consultation & Free Camp",
    category: "Healthcare",
    size: "instagram-post",
    backgroundColor: "#f0fdf4",
    elements: [
      {
        id: "badge-health",
        type: "shape",
        shapeType: "pill",
        x: 360,
        y: 100,
        width: 360,
        height: 60,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#059669",
        borderRadius: 30,
      },
      {
        id: "badge-health-txt",
        type: "text",
        x: 360,
        y: 118,
        width: 360,
        height: 40,
        rotation: 0,
        opacity: 1,
        text: "DOCTOR VERIFIED CLINIC",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "center",
      },
      {
        id: "doc-head",
        type: "text",
        x: 100,
        y: 240,
        width: 880,
        height: 160,
        rotation: 0,
        opacity: 1,
        text: "Complete Health\nCheckup & Care",
        fontSize: 76,
        fontWeight: "800",
        fontFamily: "Montserrat",
        fill: "#064e3b",
        textAlign: "center",
      },
      {
        id: "doc-sub",
        type: "text",
        x: 140,
        y: 480,
        width: 800,
        height: 100,
        rotation: 0,
        opacity: 1,
        text: "Book your appointment today with top cardiologists.\nAvailable 24/7 in New Delhi & Mumbai.",
        fontSize: 28,
        fontWeight: "normal",
        fontFamily: "Inter",
        fill: "#047857",
        textAlign: "center",
      },
      {
        id: "doc-btn",
        type: "shape",
        shapeType: "pill",
        x: 365,
        y: 680,
        width: 350,
        height: 75,
        rotation: 0,
        opacity: 1,
        backgroundColor: "#047857",
        borderRadius: 37,
      },
      {
        id: "doc-btn-txt",
        type: "text",
        x: 365,
        y: 702,
        width: 350,
        height: 50,
        rotation: 0,
        opacity: 1,
        text: "BOOK VISIT 📞",
        fontSize: 26,
        fontWeight: "bold",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "center",
      },
    ],
  },
  {
    id: "youtube-tech-thumb",
    name: "Epic YouTube Gaming / Tech Thumbnail",
    category: "Creator",
    size: "youtube-thumbnail",
    backgroundColor: "#09090b",
    elements: [
      {
        id: "accent-box",
        type: "shape",
        shapeType: "rect",
        x: 60,
        y: 120,
        width: 580,
        height: 480,
        rotation: -2,
        opacity: 0.95,
        backgroundColor: "#7c3aed",
        borderRadius: 24,
      },
      {
        id: "yt-head-1",
        type: "text",
        x: 90,
        y: 160,
        width: 520,
        height: 160,
        rotation: -2,
        opacity: 1,
        text: "I TESTED\nEVERY AI TOOL",
        fontSize: 68,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "left",
      },
      {
        id: "yt-sub-1",
        type: "text",
        x: 90,
        y: 360,
        width: 520,
        height: 120,
        rotation: -2,
        opacity: 1,
        text: "(Shocking Results)",
        fontSize: 48,
        fontWeight: "800",
        fontFamily: "Montserrat",
        fill: "#facc15",
        textAlign: "left",
      },
    ],
  },
  {
    id: "diwali-fest-1",
    name: "Diwali Festival of Lights Greeting",
    category: "Festival",
    size: "instagram-post",
    backgroundColor: "#311004",
    elements: [
      {
        id: "fest-head-hindi",
        type: "text",
        x: 90,
        y: 200,
        width: 900,
        height: 120,
        rotation: 0,
        opacity: 1,
        text: "शुभ दीपावली",
        fontSize: 92,
        fontWeight: "bold",
        fontFamily: "Noto Sans Devanagari",
        fill: "#facc15",
        textAlign: "center",
      },
      {
        id: "fest-sub",
        type: "text",
        x: 100,
        y: 360,
        width: 880,
        height: 140,
        rotation: 0,
        opacity: 1,
        text: "Happy Diwali to You & Your Family!\nMay this festival bring prosperity and boundless joy.",
        fontSize: 32,
        fontWeight: "500",
        fontFamily: "Inter",
        fill: "#fed7aa",
        textAlign: "center",
      },
      {
        id: "fest-star",
        type: "shape",
        shapeType: "circle",
        x: 440,
        y: 560,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 0.9,
        backgroundColor: "#f97316",
        borderRadius: 100,
      },
    ],
  },
];

export const BRAND_PALETTES = [
  { name: "Emerald Pro", bg: "#0f172a", primary: "#10b981", accent: "#facc15" },
  { name: "Royal Indigo", bg: "#1e1b4b", primary: "#6366f1", accent: "#38bdf8" },
  { name: "Sunset Amber", bg: "#431407", primary: "#ea580c", accent: "#fde047" },
  { name: "Rose Blush", bg: "#500724", primary: "#db2777", accent: "#fbcfe8" },
  { name: "Clean Minimal", bg: "#ffffff", primary: "#0f172a", accent: "#3b82f6" },
];

export const DesignStudioPage: React.FC = () => {
  const { navigate } = useRouter();
  const importMedia = useProjectStore((s) => s.importMedia);
  const hasOpenProject = useProjectStore((s) => s.hasOpenProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);

  const [documentTitle, setDocumentTitle] = useState("Social Graphic Design");
  const [sizePreset, setSizePreset] = useState<DesignSizePreset>("instagram-post");
  const [canvasBg, setCanvasBg] = useState<string>("#0f172a");
  const [elements, setElements] = useState<DesignElement[]>(CANVA_TEMPLATES[0].elements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"templates" | "text" | "elements" | "brand" | "layers">("templates");
  const [zoomLevel, setZoomLevel] = useState<number>(55);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = useMemo(() => SIZE_PRESETS[sizePreset], [sizePreset]);

  // Selected element
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId),
    [elements, selectedId]
  );

  // Render canvas
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

    // Elements in order
    elements.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      if (el.type === "shape") {
        ctx.fillStyle = el.backgroundColor || "#3b82f6";
        if (el.shapeType === "circle") {
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (el.shapeType === "pill" || (el.borderRadius && el.borderRadius > 0)) {
          const r = el.borderRadius || 12;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(el.x, el.y, el.width, el.height, r);
          } else {
            ctx.rect(el.x, el.y, el.width, el.height);
          }
          ctx.fill();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }

        if (el.borderWidth && el.borderColor) {
          ctx.lineWidth = el.borderWidth;
          ctx.strokeStyle = el.borderColor;
          ctx.stroke();
        }
      } else if (el.type === "text") {
        ctx.font = `${el.fontWeight || "normal"} ${el.fontSize || 32}px ${el.fontFamily || "Inter"}, sans-serif`;
        ctx.fillStyle = el.fill || "#ffffff";
        ctx.textAlign = el.textAlign || "left";

        const lines = (el.text || "").split("\n");
        const lineHeight = (el.fontSize || 32) * 1.25;
        let textX = el.x;
        if (el.textAlign === "center") textX = el.x + el.width / 2;
        if (el.textAlign === "right") textX = el.x + el.width;

        lines.forEach((line, index) => {
          ctx.fillText(line, textX, el.y + (index + 1) * lineHeight);
        });
      }

      ctx.restore();
    });
  }, [canvasBg, elements, dimensions]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Load Template
  const handleApplyTemplate = (tmpl: DesignTemplate) => {
    setSizePreset(tmpl.size);
    setCanvasBg(tmpl.backgroundColor);
    setElements(JSON.parse(JSON.stringify(tmpl.elements)));
    setSelectedId(null);
    toast.success(`Applied "${tmpl.name}" Template`);
  };

  // Add text element
  const handleAddText = (type: "heading" | "subheading" | "body" | "hindi" | "urdu") => {
    const id = `text-${Date.now()}`;
    let newEl: DesignElement;

    if (type === "heading") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.3,
        width: dimensions.width * 0.8,
        height: 100,
        rotation: 0,
        opacity: 1,
        text: "Add a Heading",
        fontSize: 72,
        fontWeight: "bold",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "center",
      };
    } else if (type === "subheading") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.15,
        y: dimensions.height * 0.45,
        width: dimensions.width * 0.7,
        height: 70,
        rotation: 0,
        opacity: 1,
        text: "Add a sub-heading or description",
        fontSize: 36,
        fontWeight: "500",
        fontFamily: "Inter",
        fill: "#cbd5e1",
        textAlign: "center",
      };
    } else if (type === "hindi") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.35,
        width: dimensions.width * 0.8,
        height: 100,
        rotation: 0,
        opacity: 1,
        text: "नमस्ते! अपना हिंदी शीर्षक लिखें",
        fontSize: 64,
        fontWeight: "bold",
        fontFamily: "Noto Sans Devanagari",
        fill: "#facc15",
        textAlign: "center",
      };
    } else if (type === "urdu") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.35,
        width: dimensions.width * 0.8,
        height: 100,
        rotation: 0,
        opacity: 1,
        text: "خوش آمدید! اردو عنوان تحریر کریں",
        fontSize: 64,
        fontWeight: "bold",
        fontFamily: "Noto Nastaliq Urdu",
        fill: "#38bdf8",
        textAlign: "center",
      };
    } else {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.2,
        y: dimensions.height * 0.55,
        width: dimensions.width * 0.6,
        height: 50,
        rotation: 0,
        opacity: 1,
        text: "Body paragraph text goes here with rich details.",
        fontSize: 24,
        fontWeight: "normal",
        fontFamily: "Inter",
        fill: "#94a3b8",
        textAlign: "center",
      };
    }

    setElements((prev) => [...prev, newEl]);
    setSelectedId(id);
    toast.info("Added new text block");
  };

  // Add shape
  const handleAddShape = (shapeType: "rect" | "circle" | "pill") => {
    const id = `shape-${Date.now()}`;
    const newEl: DesignElement = {
      id,
      type: "shape",
      shapeType,
      x: dimensions.width * 0.35,
      y: dimensions.height * 0.4,
      width: 300,
      height: shapeType === "circle" ? 300 : shapeType === "pill" ? 80 : 200,
      rotation: 0,
      opacity: 1,
      backgroundColor: "#3b82f6",
      borderRadius: shapeType === "pill" ? 40 : shapeType === "circle" ? 150 : 16,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(id);
    toast.info(`Added ${shapeType} element`);
  };

  // Update selected element property
  const updateSelected = (updates: Partial<DesignElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el))
    );
  };

  // Delete selected
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
    toast.info("Deleted element");
  };

  // Duplicate selected
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const duplicated: DesignElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      x: selectedElement.x + 30,
      y: selectedElement.y + 30,
    };
    setElements((prev) => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    toast.info("Duplicated element");
  };

  // Reorder layer
  const handleMoveLayer = (direction: "up" | "down") => {
    if (!selectedId) return;
    const index = elements.findIndex((el) => el.id === selectedId);
    if (index === -1) return;

    const newElements = [...elements];
    if (direction === "up" && index < newElements.length - 1) {
      const temp = newElements[index];
      newElements[index] = newElements[index + 1];
      newElements[index + 1] = temp;
      setElements(newElements);
    } else if (direction === "down" && index > 0) {
      const temp = newElements[index];
      newElements[index] = newElements[index - 1];
      newElements[index - 1] = temp;
      setElements(newElements);
    }
  };

  // Export PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${documentTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Saved high-res PNG");
  };

  // Add to video timeline
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
        toast.error("Failed to render graphic export");
        return;
      }

      const filename = `${documentTitle.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      await importMedia(file);

      toast.success("Added graphic design to video timeline media pool!");
      navigate("editor");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add graphic to timeline");
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold">
              <LayoutTemplate size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="bg-transparent text-sm font-bold tracking-tight text-fg border-b border-transparent hover:border-border focus:border-purple-500 focus:outline-none px-1"
                />
                <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400">
                  Canva Suite
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
            onClick={() => navigate("photo-editor")}
            className="flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium text-fg-2 hover:text-fg hover:bg-bg-1 transition-all"
          >
            <ImageIcon size={13} className="text-pink-400" />
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
          {/* Format dropdown */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-xs text-fg-muted">Format:</span>
            <select
              value={sizePreset}
              onChange={(e) => setSizePreset(e.target.value as DesignSizePreset)}
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
            onClick={handleDownload}
          />

          <Button
            label={isProcessing ? "Adding..." : "Add to Video Timeline"}
            variant="primary"
            size="sm"
            icon={<Film size={14} />}
            disabled={isProcessing}
            onClick={handleSaveToTimeline}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          />
        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canva Left Icon Rail */}
        <div className="flex w-16 flex-col items-center border-r border-border bg-bg-2 py-3 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
              activeTab === "templates"
                ? "bg-purple-500/20 text-purple-400 font-bold"
                : "text-fg-muted hover:text-fg hover:bg-bg-3"
            }`}
          >
            <LayoutTemplate size={18} />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
              activeTab === "text"
                ? "bg-purple-500/20 text-purple-400 font-bold"
                : "text-fg-muted hover:text-fg hover:bg-bg-3"
            }`}
          >
            <Type size={18} />
            <span>Text</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("elements")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
              activeTab === "elements"
                ? "bg-purple-500/20 text-purple-400 font-bold"
                : "text-fg-muted hover:text-fg hover:bg-bg-3"
            }`}
          >
            <Shapes size={18} />
            <span>Elements</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("brand")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
              activeTab === "brand"
                ? "bg-purple-500/20 text-purple-400 font-bold"
                : "text-fg-muted hover:text-fg hover:bg-bg-3"
            }`}
          >
            <Palette size={18} />
            <span>Brand</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layers")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
              activeTab === "layers"
                ? "bg-purple-500/20 text-purple-400 font-bold"
                : "text-fg-muted hover:text-fg hover:bg-bg-3"
            }`}
          >
            <Sparkles size={18} />
            <span>Layers</span>
          </button>
        </div>

        {/* Canva Left Tab Drawer */}
        <div className="flex w-72 flex-col border-r border-border bg-bg-1 shrink-0 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "templates" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Canva Starter Templates
              </span>
              <div className="space-y-2.5">
                {CANVA_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="group cursor-pointer rounded-xl border border-border bg-bg-2 p-3 hover:border-purple-500/60 hover:bg-bg-3 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-fg group-hover:text-purple-400 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-purple-400">
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
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Add Typography
              </span>

              <button
                type="button"
                onClick={() => handleAddText("heading")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
              >
                <span className="block text-xl font-black text-fg">Add a heading</span>
                <span className="text-[11px] text-fg-muted">Montserrat Black, 72px</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddText("subheading")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
              >
                <span className="block text-base font-semibold text-fg">Add a subheading</span>
                <span className="text-[11px] text-fg-muted">Inter Medium, 36px</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddText("body")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
              >
                <span className="block text-xs font-normal text-fg">Add body text</span>
                <span className="text-[11px] text-fg-muted">Inter Regular, 24px</span>
              </button>

              <div className="pt-2 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block mb-2">
                  Multilingual Fonts
                </span>

                <button
                  type="button"
                  onClick={() => handleAddText("hindi")}
                  className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-amber-500/60 hover:bg-bg-3 transition-all mb-2"
                >
                  <span className="block text-lg font-bold text-amber-400">हिंदी शीर्षक जोड़ें</span>
                  <span className="text-[11px] text-fg-muted">Noto Sans Devanagari</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddText("urdu")}
                  className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-sky-500/60 hover:bg-bg-3 transition-all"
                >
                  <span className="block text-lg font-bold text-sky-400">اردو عنوان شامل کریں</span>
                  <span className="text-[11px] text-fg-muted">Noto Nastaliq Urdu (RTL)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "elements" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Basic Shapes & Cards
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddShape("rect")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
                >
                  <Square size={24} className="text-blue-400" />
                  <span className="text-xs font-medium">Rectangle</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddShape("circle")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
                >
                  <Circle size={24} className="text-emerald-400" />
                  <span className="text-xs font-medium">Circle</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddShape("pill")}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
                >
                  <div className="h-5 w-16 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium">Pill / Badge Shape</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "brand" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Curated Brand Palettes
              </span>
              <div className="space-y-2">
                {BRAND_PALETTES.map((pal) => (
                  <div
                    key={pal.name}
                    onClick={() => {
                      setCanvasBg(pal.bg);
                      toast.success(`Applied ${pal.name} Palette`);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-bg-2 p-2.5 hover:border-purple-500/60 hover:bg-bg-3 transition-all"
                  >
                    <span className="text-xs font-bold text-fg">{pal.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: pal.bg }} />
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: pal.primary }} />
                      <div className="h-5 w-5 rounded-full" style={{ backgroundColor: pal.accent }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-border">
                <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block mb-2">
                  Custom Canvas Color
                </span>
                <input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-border bg-bg-2 p-1"
                />
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Elements ({elements.length})
              </span>
              <div className="space-y-1.5">
                {elements.map((el, i) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                      selectedId === el.id
                        ? "border-purple-500 bg-purple-500/15 text-purple-400 font-semibold"
                        : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                    }`}
                  >
                    <span className="truncate">
                      {el.type === "text" ? el.text || "Text Block" : `${el.shapeType || "Shape"} Layer`}
                    </span>
                    <span className="text-[10px] text-fg-muted">#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Canvas Viewport */}
        <div className="flex-1 flex flex-col bg-bg-2/50 relative overflow-hidden">
          {/* Canvas Sub-toolbar */}
          <div className="flex h-10 items-center justify-between border-b border-border bg-bg-1/80 px-4 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-fg-2">
                {dimensions.width} × {dimensions.height} px
              </span>
              <span className="text-[11px] text-fg-muted font-mono">
                ({dimensions.label})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 20))}
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
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(55)}
                className="p-1 rounded text-fg-2 hover:text-fg hover:bg-bg-2"
                title="Fit Canvas"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-border/80 transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "center center",
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={(e) => {
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;
                  const clickX = (e.clientX - rect.left) * scaleX;
                  const clickY = (e.clientY - rect.top) * scaleY;

                  // Find clicked element in reverse order (top to bottom)
                  const hit = [...elements].reverse().find((el) => {
                    return (
                      clickX >= el.x &&
                      clickX <= el.x + el.width &&
                      clickY >= el.y &&
                      clickY <= el.y + el.height
                    );
                  });
                  if (hit) {
                    setSelectedId(hit.id);
                  } else {
                    setSelectedId(null);
                  }
                }}
                className="block cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Property Inspector */}
        <div className="flex w-72 flex-col border-l border-border bg-bg-1 shrink-0 p-4 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-3">
              {selectedElement ? "Element Inspector" : "Canvas Properties"}
            </span>
            {selectedElement && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDuplicateSelected}
                  className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg"
                  title="Duplicate"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveLayer("up")}
                  className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg"
                  title="Bring Forward"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveLayer("down")}
                  className="p-1 rounded hover:bg-bg-2 text-fg-2 hover:text-fg"
                  title="Send Backward"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="p-1 rounded hover:bg-bg-2 text-rose-400 hover:text-rose-300"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {selectedElement ? (
            <div className="space-y-4">
              {/* Type specific */}
              {selectedElement.type === "text" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-fg-2 block mb-1">
                      Text Content
                    </label>
                    <textarea
                      value={selectedElement.text || ""}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border border-border bg-bg-2 p-2 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-fg-2 block mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedElement.fontFamily || "Inter"}
                      onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="w-full rounded-md border border-border bg-bg-2 p-2 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Inter">Inter (Clean Sans)</option>
                      <option value="Montserrat">Montserrat (Modern Heading)</option>
                      <option value="Noto Sans Devanagari">Noto Sans Devanagari (हिंदी)</option>
                      <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (اردو)</option>
                      <option value="serif">Classic Serif</option>
                      <option value="monospace">Monospace Code</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-fg-2 block mb-1">
                        Font Size ({selectedElement.fontSize || 32}px)
                      </label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 32}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="w-full rounded-md border border-border bg-bg-2 p-1.5 text-xs text-fg"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-fg-2 block mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={selectedElement.fill || "#ffffff"}
                        onChange={(e) => updateSelected({ fill: e.target.value })}
                        className="h-8 w-full cursor-pointer rounded-md border border-border bg-bg-2 p-0.5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-fg-2 block mb-1">
                      Text Align
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateSelected({ textAlign: align })}
                          className={`rounded border p-1 text-xs capitalize ${
                            selectedElement.textAlign === align
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
              )}

              {selectedElement.type === "shape" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-fg-2 block mb-1">
                      Shape Fill Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.backgroundColor || "#3b82f6"}
                      onChange={(e) => updateSelected({ backgroundColor: e.target.value })}
                      className="h-9 w-full cursor-pointer rounded-md border border-border bg-bg-2 p-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-fg-2 block mb-1">
                      Border Radius ({selectedElement.borderRadius || 0}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedElement.borderRadius || 0}
                      onChange={(e) => updateSelected({ borderRadius: Number(e.target.value) })}
                      className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* Geometry (Position & Dimensions) */}
              <div className="pt-3 border-t border-border space-y-2">
                <span className="text-[11px] font-bold uppercase text-fg-3 block">
                  Position & Size
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-fg-muted">X (px)</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateSelected({ x: Number(e.target.value) })}
                      className="w-full rounded border border-border bg-bg-2 p-1 text-xs text-fg"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-muted">Y (px)</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateSelected({ y: Number(e.target.value) })}
                      className="w-full rounded border border-border bg-bg-2 p-1 text-xs text-fg"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-muted">Width</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateSelected({ width: Number(e.target.value) })}
                      className="w-full rounded border border-border bg-bg-2 p-1 text-xs text-fg"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-fg-muted">Height</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateSelected({ height: Number(e.target.value) })}
                      className="w-full rounded border border-border bg-bg-2 p-1 text-xs text-fg"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs text-fg-muted block">
                Click any element on canvas to inspect and edit typography, colors, position, and alignment.
              </span>

              <div>
                <label className="text-xs font-medium text-fg-2 block mb-1">
                  Canvas Background Color
                </label>
                <input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-md border border-border bg-bg-2 p-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-fg-2 block mb-1">
                  Active Preset
                </label>
                <div className="rounded-lg border border-border bg-bg-2 p-3 text-xs">
                  <div className="font-bold text-fg mb-0.5">{dimensions.label}</div>
                  <div className="text-fg-muted">{dimensions.width} × {dimensions.height} px</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
