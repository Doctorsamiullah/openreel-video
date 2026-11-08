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
} from "@/icons/lucide-compat";
import { DesignElement, DesignTemplate, BRAND_PALETTES, SIZE_PRESETS } from "./types";
import { ALL_DESIGN_TEMPLATES } from "./templates/starter-templates";
import { UploadsManager } from "./uploads/UploadsManager";

export type LeftTabId = "templates" | "elements" | "text" | "uploads" | "brand" | "layers";

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
}) => {
  return (
    <div className="flex h-full shrink-0 select-none">
      {/* Icon Rail */}
      <div className="flex w-16 flex-col items-center border-r border-border bg-bg-2 py-3 gap-3 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange("templates")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "templates"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
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
        >
          <Shapes size={18} />
          <span>Elements</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("brand")}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-[10px] font-medium transition-all ${
            activeTab === "brand"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg hover:bg-bg-3"
          }`}
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
        >
          <Sparkles size={18} />
          <span>Layers</span>
        </button>
      </div>

      {/* Drawer Body */}
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
                    tmpl.id === "multicare-hospital-medical-poster"
                      ? "border-emerald-500/80 bg-emerald-500/10 hover:border-emerald-400 hover:bg-emerald-500/15"
                      : "border-border bg-bg-2 hover:border-purple-500/60 hover:bg-bg-3"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-fg group-hover:text-purple-400 transition-colors">
                      {tmpl.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                        tmpl.category === "Medical"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-purple-500/15 text-purple-400"
                      }`}
                    >
                      {tmpl.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-fg-muted block">
                    {SIZE_PRESETS[tmpl.size]?.label || tmpl.size} • {tmpl.elements.length} Layers
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
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        )}

        {/* Text Tab */}
        {activeTab === "text" && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
              Add Typography
            </span>

            <button
              type="button"
              onClick={() => onAddText("heading")}
              className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
            >
              <span className="block text-xl font-black text-fg">Add a heading</span>
              <span className="text-[11px] text-fg-muted">Montserrat Black, 72px</span>
            </button>

            <button
              type="button"
              onClick={() => onAddText("subheading")}
              className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
            >
              <span className="block text-base font-semibold text-fg">Add a subheading</span>
              <span className="text-[11px] text-fg-muted">Inter Medium, 36px</span>
            </button>

            <button
              type="button"
              onClick={() => onAddText("body")}
              className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-purple-500/60 hover:bg-bg-3 transition-all"
            >
              <span className="block text-xs font-normal text-fg">Add body text</span>
              <span className="text-[11px] text-fg-muted">Inter Regular, 24px</span>
            </button>

            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
                Multilingual Fonts (Hindi & Urdu)
              </span>

              <button
                type="button"
                onClick={() => onAddText("hindi")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-amber-500/60 hover:bg-bg-3 transition-all"
              >
                <span className="block text-lg font-bold text-amber-400">हिंदी शीर्षक जोड़ें</span>
                <span className="text-[11px] text-fg-muted">Noto Sans Devanagari</span>
              </button>

              <button
                type="button"
                onClick={() => onAddText("urdu")}
                className="w-full rounded-xl border border-border bg-bg-2 p-3 text-left hover:border-sky-500/60 hover:bg-bg-3 transition-all"
              >
                <span className="block text-lg font-bold text-sky-400">اردو عنوان شامل کریں</span>
                <span className="text-[11px] text-fg-muted">Noto Nastaliq Urdu (RTL)</span>
              </button>
            </div>
          </div>
        )}

        {/* Elements Tab */}
        {activeTab === "elements" && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
              Vector Shapes & Cards
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onAddShape("rect")}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
              >
                <Square size={24} className="text-blue-400" />
                <span className="text-xs font-medium">Rectangle</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape("circle")}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
              >
                <Circle size={24} className="text-emerald-400" />
                <span className="text-xs font-medium">Circle</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape("pill")}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
              >
                <div className="h-5 w-20 rounded-full bg-purple-500" />
                <span className="text-xs font-medium">Pill / Badge Card</span>
              </button>

              <button
                type="button"
                onClick={() => onAddShape("triangle")}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-2 p-3 hover:bg-bg-3 hover:border-purple-500/60 transition-all"
              >
                <Triangle size={20} className="text-amber-400" />
                <span className="text-xs font-medium">Triangle / Banner Tag</span>
              </button>
            </div>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === "brand" && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-fg-3 block">
              Curated Brand Kits
            </span>
            <div className="space-y-2">
              {BRAND_PALETTES.map((pal) => (
                <div
                  key={pal.name}
                  onClick={() => onApplyBrandPalette(pal)}
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
    </div>
  );
};
