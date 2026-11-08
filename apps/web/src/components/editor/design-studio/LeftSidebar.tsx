import React from "react";
import {
  LayoutTemplate,
  Type,
  Shapes,
  Palette,
  Sparkles,
  Square,
  Circle,
  Triangle,
  Upload,
  Sliders,
  Play,
} from "@/icons/lucide-compat";
import {
  DesignElement,
  DesignTemplate,
  BRAND_PALETTES,
  SIZE_PRESETS,
  PageAnimationConfig,
  ElementAnimationConfig,
} from "./types";
import { ALL_DESIGN_TEMPLATES } from "./templates/starter-templates";
import { UploadsManager } from "./uploads/UploadsManager";
import { EditImageDrawer } from "./tools/EditImageDrawer";
import { AnimationPanel } from "./animation/AnimationPanel";

export type LeftTabId =
  | "templates"
  | "elements"
  | "text"
  | "uploads"
  | "edit-image"
  | "animate"
  | "brand"
  | "layers";

interface LeftSidebarProps {
  activeTab: LeftTabId;
  onTabChange: (tab: LeftTabId) => void;
  onApplyTemplate: (template: DesignTemplate) => void;
  onAddText: (type: "heading" | "subheading" | "body" | "hindi" | "urdu") => void;
  onAddShape: (shapeType: "rect" | "circle" | "pill" | "triangle") => void;
  onInsertImage: (element: DesignElement) => void;
  onApplyBrandPalette: (palette: typeof BRAND_PALETTES[0]) => void;
  elements: DesignElement[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  canvasWidth: number;
  canvasHeight: number;

  // Edit Image & Poster Deconstruct
  selectedElement: DesignElement | null;
  onUpdateElement: (updates: Partial<DesignElement>) => void;
  onDeconstructPoster: (imageSrc: string, fileName?: string) => void;

  // Animate
  pageAnimation: PageAnimationConfig;
  onUpdatePageAnimation: (config: PageAnimationConfig) => void;
  onUpdateElementAnimation: (config: ElementAnimationConfig) => void;
  isPlayingAnimation: boolean;
  onTogglePlayAnimation: () => void;
  onResetAnimation: () => void;
  animationCurrentTime: number;
  onAnimateToVideo?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  onApplyTemplate,
  onAddText,
  onAddShape,
  onInsertImage,
  onApplyBrandPalette,
  elements,
  selectedId,
  onSelectId,
  canvasWidth,
  canvasHeight,
  selectedElement,
  onUpdateElement,
  onDeconstructPoster,
  pageAnimation,
  onUpdatePageAnimation,
  onUpdateElementAnimation,
  isPlayingAnimation,
  onTogglePlayAnimation,
  onResetAnimation,
  animationCurrentTime,
  onAnimateToVideo,
}) => {
  return (
    <div className="flex h-full shrink-0 select-none">
      {/* Icon Rail */}
      <div className="flex w-16 flex-col items-center border-r border-border bg-bg-2 py-3 gap-2.5 shrink-0 overflow-y-auto">
        <button
          type="button"
          onClick={() => onTabChange("templates")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "templates"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Starter Templates"
        >
          <LayoutTemplate size={18} />
          <span>Templates</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("uploads")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "uploads"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Uploads & Magic Layers"
        >
          <Upload size={18} />
          <span>Uploads</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("text")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "text"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Text & Typography"
        >
          <Type size={18} />
          <span>Text</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("elements")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "elements"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Vector Shapes & Badges"
        >
          <Shapes size={18} />
          <span>Elements</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("edit-image")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "edit-image"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Edit Image & Photoshop Tools"
        >
          <Sliders size={18} />
          <span>Edit image</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("animate")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "animate"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Canva Animate Suite"
        >
          <Play size={18} />
          <span>Animate</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("brand")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "brand"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Brand Palettes"
        >
          <Palette size={18} />
          <span>Brand</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("layers")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "layers"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
          title="Layer Management"
        >
          <Sparkles size={18} />
          <span>Layers</span>
        </button>
      </div>

      {/* Render Edit Image Drawer or Animate Panel when active */}
      {activeTab === "edit-image" ? (
        <EditImageDrawer
          selectedElement={selectedElement}
          onUpdateElement={onUpdateElement}
          onDeconstructPoster={onDeconstructPoster}
          onClose={() => onTabChange("templates")}
          onAnimateToVideo={onAnimateToVideo}
        />
      ) : activeTab === "animate" ? (
        <AnimationPanel
          selectedElement={selectedElement}
          onUpdateElementAnimation={onUpdateElementAnimation}
          pageAnimation={pageAnimation}
          onUpdatePageAnimation={onUpdatePageAnimation}
          isPlaying={isPlayingAnimation}
          onTogglePlay={onTogglePlayAnimation}
          onResetAnimation={onResetAnimation}
          currentTime={animationCurrentTime}
        />
      ) : (
        /* Standard Drawer Body */
        <div className="flex w-72 flex-col border-r border-border bg-bg-1 shrink-0 overflow-y-auto p-4 custom-scrollbar">
          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Design Templates ({ALL_DESIGN_TEMPLATES.length})
              </span>
              <div className="space-y-3">
                {ALL_DESIGN_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => onApplyTemplate(tmpl)}
                    className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                      tmpl.id.startsWith("multicare-hospital")
                        ? "border-emerald-500/80 bg-emerald-500/10 hover:border-emerald-400 hover:bg-emerald-500/15"
                        : "border-border bg-bg-2 hover:border-purple-500/60 hover:bg-bg-3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-fg group-hover:text-purple-400 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="rounded bg-bg-3 px-1.5 py-0.5 text-[9px] font-bold uppercase text-purple-400">
                        {tmpl.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-fg-muted block">
                      {tmpl.size} ({SIZE_PRESETS[tmpl.size]?.width}x{SIZE_PRESETS[tmpl.size]?.height})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                      {tmpl.elements.length} Fully Editable Vector & Photo Layers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploads Tab */}
          {activeTab === "uploads" && (
            <UploadsManager
              onInsertImage={onInsertImage}
              onDeconstructPoster={onDeconstructPoster}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          )}

          {/* Text Tab */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Add Typography Blocks
              </span>
              <button
                type="button"
                onClick={() => onAddText("heading")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500 hover:bg-bg-3 transition-all"
              >
                <span className="text-xl font-black text-fg block">Add a Heading</span>
                <span className="text-[11px] text-fg-muted">Montserrat Bold 64px</span>
              </button>

              <button
                type="button"
                onClick={() => onAddText("subheading")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500 hover:bg-bg-3 transition-all"
              >
                <span className="text-base font-semibold text-fg block">Add a Sub-heading</span>
                <span className="text-[11px] text-fg-muted">Inter Medium 32px</span>
              </button>

              <button
                type="button"
                onClick={() => onAddText("body")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500 hover:bg-bg-3 transition-all"
              >
                <span className="text-sm text-fg-2 block">Add body paragraph text</span>
                <span className="text-[11px] text-fg-muted">Inter Regular 22px</span>
              </button>

              {/* Hindi Block */}
              <button
                type="button"
                onClick={() => onAddText("hindi")}
                className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-left hover:border-amber-400 hover:bg-amber-500/15 transition-all"
              >
                <span className="text-lg font-bold text-amber-400 block font-hindi">
                  हिंदी शीर्षक शामिल करें
                </span>
                <span className="text-[11px] text-fg-muted">Noto Sans Devanagari 54px</span>
              </button>

              {/* Urdu Block */}
              <button
                type="button"
                onClick={() => onAddText("urdu")}
                className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-right hover:border-cyan-400 hover:bg-cyan-500/15 transition-all"
              >
                <span className="text-lg font-bold text-cyan-400 block">
                  اردو عنوان شامل کریں
                </span>
                <span className="text-[11px] text-fg-muted text-left block">Noto Nastaliq Urdu 54px</span>
              </button>
            </div>
          )}

          {/* Elements Tab */}
          {activeTab === "elements" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Vector Shapes
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAddShape("rect")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-4 hover:border-purple-500 hover:bg-bg-3 transition-all"
                >
                  <Square size={26} className="text-blue-400" />
                  <span className="text-xs font-medium text-fg">Rectangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddShape("circle")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-4 hover:border-purple-500 hover:bg-bg-3 transition-all"
                >
                  <Circle size={26} className="text-rose-400" />
                  <span className="text-xs font-medium text-fg">Circle</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddShape("pill")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-4 hover:border-purple-500 hover:bg-bg-3 transition-all"
                >
                  <div className="h-6 w-12 rounded-full border-2 border-emerald-400 bg-emerald-500/20" />
                  <span className="text-xs font-medium text-fg">Pill Badge</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddShape("triangle")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-4 hover:border-purple-500 hover:bg-bg-3 transition-all"
                >
                  <Triangle size={26} className="text-amber-400" />
                  <span className="text-xs font-medium text-fg">Triangle</span>
                </button>
              </div>
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === "brand" && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Brand Kits & Palettes
              </span>
              <div className="space-y-2.5">
                {BRAND_PALETTES.map((pal) => (
                  <div
                    key={pal.name}
                    onClick={() => onApplyBrandPalette(pal)}
                    className="group cursor-pointer rounded-xl border border-border bg-bg-2 p-3 hover:border-purple-500 hover:bg-bg-3 transition-all"
                  >
                    <span className="text-xs font-semibold text-fg block mb-2">{pal.name}</span>
                    <div className="flex h-6 w-full overflow-hidden rounded-md border border-border">
                      <div className="flex-1" style={{ backgroundColor: pal.bg }} />
                      <div className="flex-1" style={{ backgroundColor: pal.primary }} />
                      <div className="flex-1" style={{ backgroundColor: pal.accent }} />
                      <div className="flex-1" style={{ backgroundColor: pal.secondary }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layers Tab */}
          {activeTab === "layers" && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Element Layers ({elements.length})
              </span>
              <div className="space-y-1.5">
                {[...elements].reverse().map((el, i) => (
                  <div
                    key={el.id}
                    onClick={() => onSelectId(el.id)}
                    className={`flex items-center justify-between rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                      selectedId === el.id
                        ? "border-purple-500 bg-purple-500/15 text-purple-400 font-semibold"
                        : "border-border bg-bg-2 text-fg-2 hover:bg-bg-3"
                    }`}
                  >
                    <span className="truncate max-w-[170px]">
                      {el.type === "text"
                        ? el.text || "Text Block"
                        : el.type === "image"
                        ? "Photo Layer"
                        : `${el.shapeType || "Shape"} Layer`}
                    </span>
                    <span className="text-[10px] text-fg-muted font-mono">
                      #{elements.length - i}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
