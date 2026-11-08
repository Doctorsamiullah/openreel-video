import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  DEFAULT_PHOTO_ADJUSTMENTS,
  ExportOptions,
} from "../components/editor/design-studio/types";
import { MEDICAL_POSTER_TEMPLATE } from "../components/editor/design-studio/templates/medical-poster-template";
import { deconstructPosterImage } from "../components/editor/design-studio/deconstruction/poster-deconstructor";
import { LeftSidebar, LeftTabId } from "../components/editor/design-studio/LeftSidebar";
import { MainWorkspace } from "../components/editor/design-studio/MainWorkspace";
import { ElementInspector } from "../components/editor/design-studio/ElementInspector";
import { DesignNavbar } from "../components/editor/design-studio/DesignNavbar";
import { ExportModal } from "../components/editor/design-studio/ExportModal";
import { normalizeImageFile, generatePdfBlobFromCanvas } from "../components/editor/design-studio/utils/image-utils";
import { computeAutoLayout, fitAllContentToCanvas } from "../components/editor/design-studio/utils/layout-engine";

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
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const isInitialMount = useRef<boolean>(true);

  // Canvas Undo / Redo History Stack
  const [history, setHistory] = useState<DesignElement[][]>([
    JSON.parse(JSON.stringify(MEDICAL_POSTER_TEMPLATE.elements)),
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const pushCanvasHistory = useCallback(
    (newEls: DesignElement[]) => {
      setHistory((prev) => {
        const next = [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(newEls))];
        return next.slice(-40);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 39));
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setElements(JSON.parse(JSON.stringify(prev)));
      setHistoryIndex(historyIndex - 1);
      toast.info("Undid last action");
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setElements(JSON.parse(JSON.stringify(next)));
      setHistoryIndex(historyIndex + 1);
      toast.info("Redid action");
    }
  }, [history, historyIndex]);

  // Delete element
  const handleDeleteElement = useCallback((id: string) => {
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== id);
      pushCanvasHistory(next);
      return next;
    });
    setSelectedId((current) => (current === id ? null : current));
    toast.info("Deleted layer");
  }, [pushCanvasHistory]);

  // Global Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Delete / Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          handleDeleteElement(selectedId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedId, handleDeleteElement]);

  // Restore saved project state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sami_design_studio_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.elements && Array.isArray(parsed.elements) && parsed.elements.length > 0) {
          setElements(parsed.elements);
          setHistory([parsed.elements]);
          setHistoryIndex(0);
        }
        if (parsed.canvasBg) setCanvasBg(parsed.canvasBg);
        if (parsed.documentTitle) setDocumentTitle(parsed.documentTitle);
        if (parsed.sizePreset && SIZE_PRESETS[parsed.sizePreset as DesignSizePreset]) {
          setSizePreset(parsed.sizePreset as DesignSizePreset);
        }
      }
    } catch (e) {
      console.warn("Could not load saved studio design", e);
    }
  }, []);

  // Continuous Autosave to LocalStorage (Debounced 1.5s)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setIsSaved(false);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          "sami_design_studio_state",
          JSON.stringify({
            documentTitle,
            sizePreset,
            canvasBg,
            elements,
            lastSavedAt: Date.now(),
          })
        );
        setIsSaved(true);
      } catch (e) {
        console.warn("Autosave quota exceeded", e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [documentTitle, sizePreset, canvasBg, elements]);

  // Manual Save Action
  const handleManualSave = useCallback(() => {
    try {
      localStorage.setItem(
        "sami_design_studio_state",
        JSON.stringify({
          documentTitle,
          sizePreset,
          canvasBg,
          elements,
          lastSavedAt: Date.now(),
        })
      );
      setIsSaved(true);
      toast.success("Project saved to local storage");
    } catch (e) {
      toast.error("Failed to save project");
    }
  }, [documentTitle, sizePreset, canvasBg, elements]);

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
    setElements((prev) => {
      const next = [...prev, imgElement];
      pushCanvasHistory(next);
      return next;
    });
    setSelectedId(imgElement.id);
  };

  // Update element
  const handleUpdateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements((prev) => {
      const next = prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
      return next;
    });
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
    setElements((prev) => {
      const next = [...prev, duplicated];
      pushCanvasHistory(next);
      return next;
    });
    setSelectedId(duplicated.id);
    toast.info("Duplicated layer");
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
      pushCanvasHistory(result.elements);
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

  // Upload multiple photos onto canvas (with automatic EXIF rotation fix)
  const handleUploadMultipleFiles = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;
      setIsProcessing(true);
      try {
        const newElements: DesignElement[] = [];
        const maxW = dimensions.width * 0.55;
        const maxH = dimensions.height * 0.55;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const { dataUrl, width: naturalW, height: naturalH } = await normalizeImageFile(file);

          const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);
          const w = Math.round(naturalW * scale);
          const h = Math.round(naturalH * scale);
          const stagger = (i % 6) * 28;

          const newEl: DesignElement = {
            id: `image-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            type: "image",
            src: dataUrl,
            fileName: file.name,
            x: Math.round((dimensions.width - w) / 2 + stagger),
            y: Math.round((dimensions.height - h) / 2 + stagger),
            width: w,
            height: h,
            originalWidth: naturalW,
            originalHeight: naturalH,
            rotation: 0,
            opacity: 1,
            zIndex: Date.now() + i,
            lockAspectRatio: true,
            aspectRatio: w / Math.max(h, 1),
            adjustments: { ...DEFAULT_PHOTO_ADJUSTMENTS },
          };
          newElements.push(newEl);
        }

        setElements((prev) => {
          const next = [...prev, ...newElements];
          pushCanvasHistory(next);
          return next;
        });

        if (newElements.length > 0) {
          setSelectedId(newElements[newElements.length - 1].id);
        }
        toast.success(
          `Uploaded ${newElements.length} photo${newElements.length > 1 ? "s" : ""} (EXIF normalized)`
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload photos");
      } finally {
        setIsProcessing(false);
      }
    },
    [dimensions, pushCanvasHistory]
  );

  // Single direct photo upload wrapper
  const handleUploadDirectPhoto = useCallback(
    (file: File) => {
      handleUploadMultipleFiles([file]);
    },
    [handleUploadMultipleFiles]
  );

  // Global Clipboard Paste (Ctrl+V) for Photos
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await handleUploadMultipleFiles(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleUploadMultipleFiles]);

  // Autofit WITHOUT Template: Auto Layout (Grid / Collage)
  const handleAutoLayout = useCallback(() => {
    const updated = computeAutoLayout(elements, dimensions);
    setElements(updated);
    pushCanvasHistory(updated);
    toast.success("Auto Layout applied: organized in balanced grid with even margins & zero overlap");
  }, [elements, dimensions, pushCanvasHistory]);

  // Visibility Guard & 1-Click Fix All Content
  const handleFitAllContent = useCallback(() => {
    const { elements: updated, adjustedCount } = fitAllContentToCanvas(elements, dimensions);
    setElements(updated);
    pushCanvasHistory(updated);
    const targetZoom = Math.min(Math.round((560 / dimensions.height) * 100), 100);
    setZoomLevel(Math.max(25, targetZoom));
    if (adjustedCount > 0) {
      toast.success(
        `Fit All Content: expanded overflowing boxes & bounded within canvas safe area (${adjustedCount} elements adjusted)`
      );
    } else {
      toast.info("All content is already fully visible within canvas safe margins");
    }
  }, [elements, dimensions, pushCanvasHistory]);

  // Start blank canvas (without template)
  const handleStartBlankCanvas = () => {
    setElements([]);
    pushCanvasHistory([]);
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
  const renderFullCanvasAsync = async (offscreen: HTMLCanvasElement, scale: number = 1) => {
    offscreen.width = Math.round(dimensions.width * scale);
    offscreen.height = Math.round(dimensions.height * scale);
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

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
          ctx.shadowOffsetX = el.textShadowOffsetX || 2;
          ctx.shadowOffsetY = el.textShadowOffsetY || 2;
        }

        const isJustified = el.textAlign === "justify";
        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;
          const isLastLine = index === lines.length - 1;
          const words = line.trim().split(/\s+/);

          if (isJustified && !isLastLine && words.length > 1) {
            ctx.textAlign = "left";
            const totalWordWidth = words.reduce((sum, w) => sum + ctx.measureText(w).width, 0);
            const gap = Math.max(0, (el.width - totalWordWidth) / (words.length - 1));
            let curX = -el.width / 2;
            words.forEach((w) => {
              if (el.strokeColor && el.strokeWidth) {
                ctx.strokeStyle = el.strokeColor;
                ctx.lineWidth = el.strokeWidth;
                ctx.strokeText(w, curX, lineY);
              }
              ctx.fillStyle = el.fill || "#ffffff";
              ctx.fillText(w, curX, lineY);
              curX += ctx.measureText(w).width + gap;
            });
          } else {
            if (el.strokeColor && el.strokeWidth) {
              ctx.strokeStyle = el.strokeColor;
              ctx.lineWidth = el.strokeWidth;
              ctx.strokeText(line, textX, lineY);
            }
            ctx.fillStyle = el.fill || "#ffffff";
            ctx.fillText(line, textX, lineY);
          }
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
            if (adj.exposure) {
              const exp = 1 + (adj.exposure || 0) / 100;
              filterStr += `brightness(${exp}) `;
            }
            if (adj.hueRotate) {
              filterStr += `hue-rotate(${adj.hueRotate}deg) `;
            }
            if (adj.invert) {
              filterStr += `invert(${adj.invert}%) `;
            }
            if (adj.grayscale) {
              filterStr += `grayscale(${adj.grayscale}%) `;
            }
            if (adj.sepia) {
              filterStr += `sepia(${adj.sepia}%) `;
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

          const hasRadius = el.borderRadius && el.borderRadius > 0;
          if (hasRadius) {
            ctx.save();
            ctx.beginPath();
            if (typeof ctx.roundRect === "function") {
              ctx.roundRect(-el.width / 2, -el.height / 2, el.width, el.height, el.borderRadius || 0);
            } else {
              ctx.rect(-el.width / 2, -el.height / 2, el.width, el.height);
            }
            ctx.clip();
          }

          if (el.crop) {
            ctx.drawImage(
              img,
              el.crop.x,
              el.crop.y,
              el.crop.width,
              el.crop.height,
              -el.width / 2,
              -el.height / 2,
              el.width,
              el.height
            );
          } else {
            ctx.drawImage(img, -el.width / 2, -el.height / 2, el.width, el.height);
          }
          ctx.filter = "none";

          if (hasRadius) {
            ctx.restore();
          }

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

  // High Resolution Multi-Format Export Pipeline (PNG, JPG, PDF)
  const handleExport = async (options: ExportOptions) => {
    setIsProcessing(true);
    try {
      const offscreen = document.createElement("canvas");
      await renderFullCanvasAsync(offscreen, options.scale || 1);

      const baseName = documentTitle.replace(/\s+/g, "-").toLowerCase();
      if (options.format === "pdf") {
        const pdfBlob = generatePdfBlobFromCanvas(offscreen, options.quality || 0.95);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.download = `${baseName}.pdf`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported high-resolution PDF (${options.scale}x scale)`);
      } else if (options.format === "jpg") {
        const link = document.createElement("a");
        link.download = `${baseName}.jpg`;
        link.href = offscreen.toDataURL("image/jpeg", options.quality || 0.92);
        link.click();
        toast.success(
          `Exported JPEG (${Math.round((options.quality || 0.92) * 100)}% quality, ${options.scale}x scale)`
        );
      } else {
        const link = document.createElement("a");
        link.download = `${baseName}.png`;
        link.href = offscreen.toDataURL("image/png");
        link.click();
        toast.success(`Exported high-resolution PNG (${options.scale}x scale)`);
      }
      setIsExportModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export design");
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Download PNG Action (Fallback)
  const handleDownloadPNG = async () => {
    await handleExport({ format: "png", quality: 1.0, scale: 1 });
  };

  // Add to Video Timeline Pipeline (Supports both static snapshot and animated motion scene)
  const handleSaveToTimeline = async () => {
    setIsProcessing(true);
    try {
      if (!hasOpenProject) {
        createNewProject("Video Project");
      }

      const offscreen = document.createElement("canvas");
      await renderFullCanvasAsync(offscreen, 1);

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
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onSaveToTimeline={handleSaveToTimeline}
        isProcessing={isProcessing}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onManualSave={handleManualSave}
        isSaved={isSaved}
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
          onUploadMultiplePhotos={handleUploadMultipleFiles}
          onStartBlank={handleStartBlankCanvas}
          onFitInView={handleFitInView}
          onAutoLayout={handleAutoLayout}
          onFitAllContent={handleFitAllContent}
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
          onAutoLayout={handleAutoLayout}
          onFitAllContent={handleFitAllContent}
          onApplyToAllPhotos={handleApplyToAllPhotos}
        />
      </div>

      {/* ── Multi-Format Export Modal ── */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentTitle={documentTitle}
        dimensions={dimensions}
        onExport={handleExport}
        onSaveToTimeline={handleSaveToTimeline}
        isProcessing={isProcessing}
      />
    </div>
  );
};
