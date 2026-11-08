import React from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
} from "@/icons/lucide-compat";
import {
  DesignElement,
  AnimationPreset,
  ElementAnimationConfig,
  PageAnimationConfig,
} from "../types";

interface AnimationPanelProps {
  selectedElement: DesignElement | null;
  onUpdateElementAnimation: (config: ElementAnimationConfig) => void;
  pageAnimation: PageAnimationConfig;
  onUpdatePageAnimation: (config: PageAnimationConfig) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetAnimation: () => void;
  currentTime: number;
}

const ELEMENT_PRESETS: { id: AnimationPreset; label: string; desc: string; icon: string }[] = [
  { id: "none", label: "None", desc: "No motion", icon: "⊘" },
  { id: "fade", label: "Fade", desc: "Soft entry", icon: "🌫" },
  { id: "pan-left", label: "Pan Left", desc: "Glide from left", icon: "←" },
  { id: "pan-right", label: "Pan Right", desc: "Glide from right", icon: "→" },
  { id: "pan-up", label: "Pan Up", desc: "Glide from bottom", icon: "↑" },
  { id: "pan-down", label: "Pan Down", desc: "Glide from top", icon: "↓" },
  { id: "pop", label: "Pop", desc: "Spring bounce scale", icon: "💥" },
  { id: "rise", label: "Rise", desc: "Smooth upwards float", icon: "🚀" },
  { id: "bounce", label: "Bounce", desc: "Dynamic drop bounce", icon: "🏀" },
  { id: "typewriter", label: "Typewriter", desc: "Reveals letter by letter", icon: "⌨" },
  { id: "breathe", label: "Breathe", desc: "Subtle rhythmic scale", icon: "🌬" },
  { id: "pulse", label: "Pulse", desc: "Attention beat", icon: "💓" },
  { id: "heartbeat", label: "Heartbeat", desc: "Double pulsing rhythm", icon: "🫀" },
];

const PAGE_PRESETS: { id: PageAnimationConfig["preset"]; label: string; desc: string; icon: string }[] = [
  { id: "none", label: "None", desc: "Static page", icon: "⊘" },
  { id: "fade", label: "Fade", desc: "Whole page fades in", icon: "✨" },
  { id: "pan", label: "Pan", desc: "Dynamic directional pan", icon: "↔" },
  { id: "pop", label: "Pop", desc: "Elastic scale entrance", icon: "🎉" },
  { id: "rise", label: "Rise", desc: "Float all elements up", icon: "🛫" },
  { id: "breathe", label: "Breathe", desc: "Slow cinematic scale", icon: "🌊" },
  { id: "stomp", label: "Stomp", desc: "Heavy impact entrance", icon: "⚡" },
];

export const AnimationPanel: React.FC<AnimationPanelProps> = ({
  selectedElement,
  onUpdateElementAnimation,
  pageAnimation,
  onUpdatePageAnimation,
  isPlaying,
  onTogglePlay,
  onResetAnimation,
  currentTime,
}) => {
  const [activeTab, setActiveTab] = React.useState<"page" | "element">(
    selectedElement ? "element" : "page"
  );

  const currentElementPreset = selectedElement?.animation?.preset || "none";
  const currentElementDuration = selectedElement?.animation?.duration ?? 1.2;
  const currentElementDelay = selectedElement?.animation?.delay ?? 0;

  const handleSelectPagePreset = (presetId: PageAnimationConfig["preset"]) => {
    onUpdatePageAnimation({
      ...pageAnimation,
      preset: presetId,
    });
    onResetAnimation();
    if (!isPlaying) {
      onTogglePlay();
    }
  };

  const handleSelectElementPreset = (presetId: AnimationPreset) => {
    onUpdateElementAnimation({
      preset: presetId,
      duration: currentElementDuration,
      delay: currentElementDelay,
    });
    onResetAnimation();
    if (!isPlaying) {
      onTogglePlay();
    }
  };

  return (
    <div className="flex h-full w-80 flex-col border-r border-border bg-bg-1 overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-bg-2 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-fg">Canva Animate Suite</h3>
            <p className="text-[10px] text-fg-muted">Pro motion graphics & video transitions</p>
          </div>
        </div>

        {/* Play / Reset Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onResetAnimation}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-bg-3 text-fg-muted hover:text-fg hover:bg-bg-4 transition-all"
            title="Reset Time to 0s"
          >
            <RotateCcw size={12} />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white transition-all shadow-sm ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            <Play size={12} className={isPlaying ? "rotate-90" : ""} />
            <span>{isPlaying ? "Pause" : "Preview"}</span>
          </button>
        </div>
      </div>

      {/* Scrubber indicator */}
      <div className="flex items-center justify-between border-b border-border/60 bg-bg-2/50 px-4 py-1.5 text-[10px] text-fg-muted">
        <span>Timeline Scrubber</span>
        <span className="font-mono text-purple-400 font-semibold">{currentTime.toFixed(2)}s / {(pageAnimation.duration || 5.0).toFixed(1)}s</span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 border-b border-border bg-bg-2 p-1 gap-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("page")}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            activeTab === "page"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          <Layers size={13} />
          <span>Page Animation</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("element")}
          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all ${
            activeTab === "element"
              ? "bg-purple-500/20 text-purple-400 font-bold shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          <Activity size={13} />
          <span>Element Animation</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "page" ? (
          /* ── Page Animations ── */
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-fg-muted block mb-2">
                Page Animation Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAGE_PRESETS.map((preset) => {
                  const isActive = pageAnimation.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPagePreset(preset.id)}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                        isActive
                          ? "border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30 text-fg"
                          : "border-border bg-bg-2 text-fg-muted hover:border-purple-500/50 hover:bg-bg-3 hover:text-fg"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span className="text-base">{preset.icon}</span>
                        <span>{preset.label}</span>
                      </div>
                      <span className="text-[10px] text-fg-muted mt-0.5">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direction if pan */}
            {pageAnimation.preset === "pan" && (
              <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-2">
                <label className="text-xs font-semibold text-fg block">Pan Direction</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["left", "right", "up", "down"] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() =>
                        onUpdatePageAnimation({
                          ...pageAnimation,
                          direction: dir,
                        })
                      }
                      className={`flex items-center justify-center rounded-lg p-2 text-xs font-bold capitalize transition-all ${
                        pageAnimation.direction === dir
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-bg-3 text-fg-muted hover:text-fg"
                      }`}
                    >
                      {dir === "left" && <ArrowLeft size={14} />}
                      {dir === "right" && <ArrowRight size={14} />}
                      {dir === "up" && <ArrowUp size={14} />}
                      {dir === "down" && <ArrowDown size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scene Duration */}
            <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-fg">Animation Duration</span>
                <span className="font-mono text-purple-400 font-bold">{(pageAnimation.duration || 5.0).toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={pageAnimation.duration || 5.0}
                onChange={(e) =>
                  onUpdatePageAnimation({
                    ...pageAnimation,
                    duration: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-fg-muted">
                <span>1.0s (Fast)</span>
                <span>5.0s (Standard)</span>
                <span>10.0s (Cinema)</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Element Animations ── */
          <div className="space-y-4">
            {!selectedElement ? (
              <div className="rounded-xl border border-dashed border-border bg-bg-2 p-4 text-center">
                <p className="text-xs font-semibold text-fg">No Element Selected</p>
                <p className="text-[11px] text-fg-muted mt-1">
                  Click on any text, photo, or shape on the canvas to assign an individual entrance or emphasis animation!
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-lg bg-bg-2 p-2.5 border border-border">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-500/20 text-purple-400 text-xs font-bold">
                    ★
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-fg truncate">
                      {selectedElement.type === "text"
                        ? `Text: "${selectedElement.text?.slice(0, 24)}..."`
                        : selectedElement.type === "image"
                        ? "Selected Photo Layer"
                        : "Selected Vector Shape"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-fg-muted block mb-2">
                    Element Entrance & Motion
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ELEMENT_PRESETS.map((preset) => {
                      const isActive = currentElementPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectElementPreset(preset.id)}
                          className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                            isActive
                              ? "border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/30 text-fg"
                              : "border-border bg-bg-2 text-fg-muted hover:border-purple-500/50 hover:bg-bg-3 hover:text-fg"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <span className="text-base">{preset.icon}</span>
                            <span>{preset.label}</span>
                          </div>
                          <span className="text-[10px] text-fg-muted mt-0.5">{preset.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration & Delay */}
                {currentElementPreset !== "none" && (
                  <div className="rounded-xl border border-border bg-bg-2 p-3 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-fg">Motion Duration</span>
                        <span className="font-mono text-purple-400 font-bold">{currentElementDuration.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="3.0"
                        step="0.1"
                        value={currentElementDuration}
                        onChange={(e) =>
                          onUpdateElementAnimation({
                            preset: currentElementPreset,
                            duration: parseFloat(e.target.value),
                            delay: currentElementDelay,
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-fg">Start Delay</span>
                        <span className="font-mono text-purple-400 font-bold">{currentElementDelay.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.0"
                        max="2.5"
                        step="0.1"
                        value={currentElementDelay}
                        onChange={(e) =>
                          onUpdateElementAnimation({
                            preset: currentElementPreset,
                            duration: currentElementDuration,
                            delay: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="border-t border-border bg-bg-2 p-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] transition-all"
        >
          <Zap size={14} />
          <span>{isPlaying ? "Pause Preview" : "Play Canva Animation Loop"}</span>
        </button>
      </div>
    </div>
  );
};
