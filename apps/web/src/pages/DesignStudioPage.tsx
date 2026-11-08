import React, { useState, useMemo, useEffect } from "react";
import { useProjectStore } from "../stores/project-store";
import { toast } from "../stores/notification-store";
import { useRouter } from "../hooks/use-router";

import {
  DesignElement,
  DesignTemplate,
  DesignSizePreset,
  SIZE_PRESETS,
  BRAND_PALETTES,
  PageAnimationConfig,
  ElementAnimationConfig,
  PhotoAdjustments,
} from "../components/editor/design-studio/types";
import { MEDICAL_POSTER_TEMPLATE } from "../components/editor/design-studio/templates/medical-poster-template";
import { deconstructPosterImage } from "../components/editor/design-studio/deconstruction/poster-deconstructor";
import { LeftSidebar, LeftTabId } from "../components/editor/design-studio/LeftSidebar";
import { MainWorkspace } from "../components/editor/design-studio/MainWorkspace";
import { ElementInspector } from "../components/editor/design-studio/ElementInspector";
import { DesignNavbar } from "../components/editor/design-studio/DesignNavbar";

export const DesignStudioPage: React.FC = () => {
  const { navigate } = useRouter();
  const importMedia = useProjectStore((s) => s.importMedia);
  const hasOpenProject = useProjectStore((s) => s.hasOpenProject);
  const createNewProject = useProjectStore((s) => s.createNewProject);

  // Studio State
  const [documentTitle, setDocumentTitle] = useState("Multicare Hospital Poster");
  const [sizePreset, setSizePreset] = useState<DesignSizePreset>(MEDICAL_POSTER_TEMPLATE.size);
  const [canvasBg, setCanvasBg] = useState<string>(MEDICAL_POSTER_TEMPLATE.backgroundColor);
  const [elements, setElements] = useState<DesignElement[]>(
    JSON.parse(JSON.stringify(MEDICAL_POSTER_TEMPLATE.elements))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LeftTabId>("templates");
  const [zoomLevel, setZoomLevel] = useState<number>(36);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canva Animation State
  const [pageAnimation, setPageAnimation] = useState<PageAnimationConfig>({
    preset: "breathe",
    duration: 5.0,
    direction: "left",
  });
  const [isPlayingAnimation, setIsPlayingAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const dimensions = useMemo(() => SIZE_PRESETS[sizePreset], [sizePreset]);
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) || null,
    [elements, selectedId]
  );

  // Real-Time Animation Loop (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    if (isPlayingAnimation) {
      const loop = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        setCurrentTime((prev) => {
          const totalDuration = pageAnimation.duration || 5.0;
          const next = prev + delta;
          return next >= totalDuration ? 0 : next;
        });
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlayingAnimation, pageAnimation.duration]);

  // Template Loader
  const handleApplyTemplate = (tmpl: DesignTemplate) => {
    setSizePreset(tmpl.size);
    setCanvasBg(tmpl.backgroundColor);
    setElements(JSON.parse(JSON.stringify(tmpl.elements)));
    setSelectedId(null);
    setDocumentTitle(tmpl.name);
    toast.success(`Applied "${tmpl.name}" Template`);
  };

  // Add text block
  const handleAddText = (type: "heading" | "subheading" | "body" | "hindi" | "urdu") => {
    const id = `text-${Date.now()}`;
    let newEl: DesignElement;

    if (type === "heading") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.25,
        width: dimensions.width * 0.8,
        height: 100,
        rotation: 0,
        opacity: 1,
        zIndex: Date.now(),
        text: "Add a Heading",
        fontSize: 64,
        fontWeight: "900",
        fontFamily: "Montserrat",
        fill: "#ffffff",
        textAlign: "center",
      };
    } else if (type === "subheading") {
      newEl = {
        id,
        type: "text",
        x: dimensions.width * 0.15,
        y: dimensions.height * 0.38,
        width: dimensions.width * 0.7,
        height: 70,
        rotation: 0,
        opacity: 1,
        zIndex: Date.now(),
        text: "Add a sub-heading or description",
        fontSize: 32,
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
        y: dimensions.height * 0.3,
        width: dimensions.width * 0.8,
        height: 90,
        rotation: 0,
        opacity: 1,
        zIndex: Date.now(),
        text: "नमस्ते! अपना हिंदी शीर्षक लिखें",
        fontSize: 54,
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
        y: dimensions.height * 0.3,
        width: dimensions.width * 0.8,
        height: 90,
        rotation: 0,
        opacity: 1,
        zIndex: Date.now(),
        text: "خوش آمدید! اردو عنوان تحریر کریں",
        fontSize: 54,
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
        y: dimensions.height * 0.5,
        width: dimensions.width * 0.6,
        height: 50,
        rotation: 0,
        opacity: 1,
        zIndex: Date.now(),
        text: "Body paragraph text goes here with rich details.",
        fontSize: 22,
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

  // Add vector shape
  const handleAddShape = (shapeType: "rect" | "circle" | "pill" | "triangle") => {
    const id = `shape-${Date.now()}`;
    const newEl: DesignElement = {
      id,
      type: "shape",
      shapeType,
      x: dimensions.width * 0.35,
      y: dimensions.height * 0.4,
      width: 320,
      height: shapeType === "circle" ? 320 : shapeType === "pill" ? 80 : 220,
      rotation: 0,
      opacity: 1,
      zIndex: Date.now(),
      backgroundColor: "#3b82f6",
      borderRadius: shapeType === "pill" ? 40 : shapeType === "circle" ? 160 : 16,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(id);
    toast.info(`Added ${shapeType} element`);
  };

  // Insert image asset
  const handleInsertImage = (imgElement: DesignElement) => {
    setElements((prev) => [...prev, imgElement]);
    setSelectedId(imgElement.id);
  };

  // Update element
  const handleUpdateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  // Duplicate element
  const handleDuplicateElement = (id: string) => {
    const target = elements.find((el) => el.id === id);
    if (!target) return;
    const duplicated: DesignElement = {
      ...target,
      id: `${target.type}-${Date.now()}`,
      x: target.x + 30,
      y: target.y + 30,
      zIndex: Date.now(),
    };
    setElements((prev) => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    toast.info("Duplicated layer");
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.info("Deleted layer");
  };

  // Toggle Lock
  const handleToggleLock = (id: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, locked: !el.locked } : el))
    );
  };

  // Reorder layers
  const handleMoveLayer = (id: string, dir: "up" | "down" | "top" | "bottom") => {
    const index = elements.findIndex((el) => el.id === id);
    if (index === -1) return;

    const copy = [...elements];
    const target = copy[index];

    if (dir === "up" && index < copy.length - 1) {
      copy[index] = copy[index + 1];
      copy[index + 1] = target;
    } else if (dir === "down" && index > 0) {
      copy[index] = copy[index - 1];
      copy[index - 1] = target;
    } else if (dir === "top") {
      copy.splice(index, 1);
      copy.push(target);
    } else if (dir === "bottom") {
      copy.splice(index, 1);
      copy.unshift(target);
    }

    // Re-index zIndex
    copy.forEach((el, idx) => {
      el.zIndex = idx + 1;
    });

    setElements(copy);
  };

  // Apply Brand Kit
  const handleApplyBrandPalette = (pal: typeof BRAND_PALETTES[0]) => {
    setCanvasBg(pal.bg);
    toast.success(`Applied ${pal.name} Palette`);
  };

  // Poster Deconstruction (Magic Layers)
  const handleDeconstructPoster = async (imageSrc: string, fileName: string = "uploaded-poster") => {
    setIsProcessing(true);
    try {
      toast.info("Deconstructing with Magic Layers...", "Separating text blocks, colors & photos");
      const result = await deconstructPosterImage(
        imageSrc,
        fileName,
        dimensions.width,
        dimensions.height
      );
      setElements(result.elements);
      setCanvasBg(result.backgroundColor);
      setDocumentTitle(result.suggestedTitle);
      setSelectedId(result.elements[2]?.id || null);
      toast.success(
        `Magic Layers Active! Created ${result.elements.length} editable layers.`,
        "Click any text to rewrite, shapes to recolor, or photos to edit."
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to deconstruct poster");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update element-level animation
  const handleUpdateElementAnimation = (config: ElementAnimationConfig) => {
    if (!selectedId) return;
    handleUpdateElement(selectedId, { animation: config });
    toast.success(`Applied ${config.preset} animation to element`);
  };

  // Upload photo directly onto canvas
  const handleUploadDirectPhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = dimensions.width * 0.6;
        const maxH = dimensions.height * 0.6;
        let w = img.width || 400;
        let h = img.height || 400;
        const scale = Math.min(maxW / w, maxH / h, 1);
        w = Math.round(w * scale);
        h = Math.round(h * scale);

        const newEl: DesignElement = {
          id: `image-${Date.now()}`,
          type: "image",
          src,
          fileName: file.name,
          x: Math.round((dimensions.width - w) / 2),
          y: Math.round((dimensions.height - h) / 2),
          width: w,
          height: h,
          rotation: 0,
          opacity: 1,
          zIndex: Date.now(),
        };

        setElements((prev) => [...prev, newEl]);
        setSelectedId(newEl.id);
        toast.success(`Photo "${file.name}" placed on canvas!`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Start blank canvas (without template)
  const handleStartBlankCanvas = () => {
    setElements([]);
    setCanvasBg("#ffffff");
    setSelectedId(null);
    setDocumentTitle("Blank Custom Design");
    toast.info("Created blank canvas. Add text, shapes, or upload photos!");
  };

  // Fit in view
  const handleFitInView = () => {
    const targetZoom = Math.min(Math.round((560 / dimensions.height) * 100), 100);
    setZoomLevel(Math.max(25, targetZoom));
    toast.info(`Adjusted zoom to ${targetZoom}% to fit canvas in view`);
  };

  // Apply color changes / adjustments to all photos on canvas
  const handleApplyToAllPhotos = (adjustments: PhotoAdjustments) => {
    let count = 0;
    setElements((prev) =>
      prev.map((el) => {
        if (el.type === "image") {
          count++;
          return {
            ...el,
            adjustments: {
              ...(el.adjustments || {}),
              ...adjustments,
            },
          };
        }
        return el;
      })
    );
    if (count > 0) {
      toast.success(`Color adjustments applied across all ${count} photos on canvas`);
    } else {
      toast.info("No photos on canvas to adjust");
    }
  };

  // High Resolution Canvas Renderer (strips all selection guides/handles)
  const renderFullCanvasAsync = async (offscreen: HTMLCanvasElement) => {
    offscreen.width = dimensions.width;
    offscreen.height = dimensions.height;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    // Preload image assets
    const imageElements = elements.filter((el) => el.type === "image" && el.src);
    const loadedImages = new Map<string, HTMLImageElement>();
    await Promise.all(
      imageElements.map(
        (el) =>
          new Promise<void>((resolve) => {
            if (!el.src) return resolve();
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              loadedImages.set(el.src!, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = el.src;
          })
      )
    );

    // Elements sorted by zIndex
    const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    sorted.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;
      ctx.translate(centerX, centerY);

      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }
      ctx.scale(el.flipX ? -1 : 1, el.flipV ? -1 : 1);

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
      } else if (el.type === "text") {
        ctx.font = `${el.fontStyle || "normal"} ${el.fontWeight || "normal"} ${
          el.fontSize || 32
        }px ${el.fontFamily || "Inter"}, sans-serif`;

        const lines = (el.text || "").split("\n");
        const lineHeight = (el.fontSize || 32) * (el.lineHeight || 1.25);
        let textX = -el.width / 2;
        if (el.textAlign === "center") {
          textX = 0;
          ctx.textAlign = "center";
        } else if (el.textAlign === "right") {
          textX = el.width / 2;
          ctx.textAlign = "right";
        } else {
          textX = -el.width / 2;
          ctx.textAlign = "left";
        }

        const totalTextHeight = lines.length * lineHeight;
        const startY = -totalTextHeight / 2 + (el.fontSize || 32) * 0.85;

        // Background highlight
        if (el.textBackground) {
          ctx.save();
          ctx.fillStyle = el.textBackground;
          ctx.fillRect(-el.width / 2 - 8, -totalTextHeight / 2 - 4, el.width + 16, totalTextHeight + 8);
          ctx.restore();
        }

        // Shadow
        if (el.textShadowColor) {
          ctx.shadowColor = el.textShadowColor;
          ctx.shadowBlur = el.textShadowBlur || 8;
        }

        // Stroke
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
      } else if (el.type === "image" && el.src) {
        const img = loadedImages.get(el.src);
        if (img) {
          const adj = el.adjustments;
          let filterStr = "";
          if (adj) {
            const b = 1 + (adj.brightness || 0) / 100;
            const c = 1 + (adj.contrast || 0) / 100;
            const s = 1 + (adj.saturation || 0) / 100;
            const bl = adj.blur || 0;
            filterStr += `brightness(${b}) contrast(${c}) saturate(${s}) blur(${bl}px) `;
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

          if (adj && adj.colorTint && adj.colorTintIntensity) {
            ctx.save();
            ctx.globalCompositeOperation = "color";
            ctx.fillStyle = adj.colorTint;
            ctx.globalAlpha = (adj.colorTintIntensity / 100) * 0.75;
            ctx.fillRect(-el.width / 2, -el.height / 2, el.width, el.height);
            ctx.restore();
          }
        }
      }

      ctx.restore();
    });
  };

  // High Resolution Export Pipeline (strips all selection guides/handles)
  const handleDownloadPNG = async () => {
    setIsProcessing(true);
    try {
      const offscreen = document.createElement("canvas");
      await renderFullCanvasAsync(offscreen);

      const link = document.createElement("a");
      link.download = `${documentTitle.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = offscreen.toDataURL("image/png");
      link.click();
      toast.success("Downloaded high-resolution PNG");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PNG");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add to Video Timeline Pipeline (Supports both static snapshot and animated motion scene)
  const handleSaveToTimeline = async () => {
    setIsProcessing(true);
    try {
      if (!hasOpenProject) {
        createNewProject("Video Project");
      }

      const offscreen = document.createElement("canvas");
      await renderFullCanvasAsync(offscreen);

      const blob = await new Promise<Blob | null>((resolve) =>
        offscreen.toBlob((b) => resolve(b), "image/png", 1.0)
      );

      if (!blob) {
        toast.error("Failed to render export blob");
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
      {/* ── Top Navigation Bar ── */}
      <DesignNavbar
        documentTitle={documentTitle}
        onTitleChange={setDocumentTitle}
        sizePreset={sizePreset}
        onSizePresetChange={setSizePreset}
        onNavigate={navigate}
        onDownload={handleDownloadPNG}
        onSaveToTimeline={handleSaveToTimeline}
        isProcessing={isProcessing}
      />

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Canva Tool Rail & Drawer) */}
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onApplyTemplate={handleApplyTemplate}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onInsertImage={handleInsertImage}
          onApplyBrandPalette={handleApplyBrandPalette}
          elements={elements}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          canvasWidth={dimensions.width}
          canvasHeight={dimensions.height}
          selectedElement={selectedElement}
          onUpdateElement={(updates) => selectedId && handleUpdateElement(selectedId, updates)}
          onDeconstructPoster={handleDeconstructPoster}
          pageAnimation={pageAnimation}
          onUpdatePageAnimation={setPageAnimation}
          onUpdateElementAnimation={handleUpdateElementAnimation}
          isPlayingAnimation={isPlayingAnimation}
          onTogglePlayAnimation={() => setIsPlayingAnimation((prev) => !prev)}
          onResetAnimation={() => {
            setIsPlayingAnimation(false);
            setCurrentTime(0);
          }}
          animationCurrentTime={currentTime}
          onAnimateToVideo={handleSaveToTimeline}
        />

        {/* Central Interactive Canvas (Fabric.js style with real-time motion & scrubber) */}
        <MainWorkspace
          elements={elements}
          selectedId={selectedId}
          onSelectId={setSelectedId}
          onUpdateElement={handleUpdateElement}
          onDuplicateElement={handleDuplicateElement}
          onDeleteElement={handleDeleteElement}
          onToggleLock={handleToggleLock}
          onMoveLayer={handleMoveLayer}
          onOpenPhotoAdjustments={() => setActiveTab("edit-image")}
          onOpenAnimate={() => setActiveTab("animate")}
          onOpenEditImage={() => setActiveTab("edit-image")}
          onDeconstructCurrentPoster={() => {
            if (selectedElement?.src) {
              handleDeconstructPoster(selectedElement.src, "poster");
            }
          }}
          onAddSceneToVideoTimeline={handleSaveToTimeline}
          canvasBg={canvasBg}
          dimensions={dimensions}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onUploadPhoto={handleUploadDirectPhoto}
          onStartBlank={handleStartBlankCanvas}
          onFitInView={handleFitInView}
          currentTime={currentTime}
          pageAnimation={pageAnimation}
          isPlayingAnimation={isPlayingAnimation}
          onTogglePlayAnimation={() => setIsPlayingAnimation((prev) => !prev)}
          onResetAnimation={() => {
            setIsPlayingAnimation(false);
            setCurrentTime(0);
          }}
          onTimeScrub={setCurrentTime}
        />

        {/* Right Element & Photo Adjustments Inspector */}
        <ElementInspector
          element={selectedElement}
          onUpdateElement={(updates) => selectedId && handleUpdateElement(selectedId, updates)}
          onDuplicate={() => selectedId && handleDuplicateElement(selectedId)}
          onDelete={() => selectedId && handleDeleteElement(selectedId)}
          onToggleLock={() => selectedId && handleToggleLock(selectedId)}
          onMoveLayer={(dir) => selectedId && handleMoveLayer(selectedId, dir)}
          canvasBg={canvasBg}
          onUpdateCanvasBg={setCanvasBg}
          totalElementsCount={elements.length}
          canvasWidth={dimensions.width}
          canvasHeight={dimensions.height}
          onUploadPhoto={handleUploadDirectPhoto}
          onStartBlank={handleStartBlankCanvas}
          onFitInView={handleFitInView}
          onApplyToAllPhotos={handleApplyToAllPhotos}
        />
      </div>
    </div>
  );
};
