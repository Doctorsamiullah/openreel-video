/**
 * EditingPresetsPanel — one-click editing presets covering:
 *   • Color grades / LUTs (cinematic, vintage, neon, B&W, etc.)
 *   • Text animations (typewriter, slide, pop, bounce, fade)
 *   • Transition presets (cut, dissolve, wipe, zoom, glitch)
 *   • Caption styles (default, bold, minimal, neon, typewriter)
 *   • Speed effects (slow-mo, time-lapse, speed ramp)
 *   • Audio presets (podcast EQ, music duck, voice enhance)
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  Film, Type, Zap, Mic, Layers, Check, Search, Sparkles
} from "@/icons/lucide-compat";
import { toast } from "../../../stores/notification-store";

// ── Preset definitions ──────────────────────────────────────────────────────

export type PresetCategory =
  | "color"
  | "text"
  | "transition"
  | "caption"
  | "speed"
  | "audio";

export interface EditingPreset {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  icon?: string; // emoji
  /** CSS gradient for preview thumbnail */
  preview?: string;
  /** Parameters passed to the apply handler */
  params: Record<string, unknown>;
}

const COLOR_PRESETS: EditingPreset[] = [
  { id: "cinematic-teal-orange", name: "Cinematic Teal+Orange", category: "color", icon: "🎬", description: "Hollywood blockbuster grade", preview: "linear-gradient(135deg,#0d7a7a,#ff6600)", params: { liftR: -10, gainG: -5, gainB: 20, saturation: 120, contrast: 110 } },
  { id: "vintage-film", name: "Vintage Film", category: "color", icon: "📽️", description: "Faded warm film look", preview: "linear-gradient(135deg,#c8a87a,#6b4a2a)", params: { saturation: 70, temperature: 15, fade: 20, grain: 15 } },
  { id: "neon-cyberpunk", name: "Neon Cyberpunk", category: "color", icon: "🌆", description: "High saturation neon glow", preview: "linear-gradient(135deg,#ff00ff,#00ffff)", params: { saturation: 160, hue: 10, contrast: 130, vibrance: 50 } },
  { id: "bw-noir", name: "B&W Noir", category: "color", icon: "🎞️", description: "Classic black & white", preview: "linear-gradient(135deg,#000,#888)", params: { saturation: 0, contrast: 120, shadows: -20 } },
  { id: "golden-hour", name: "Golden Hour", category: "color", icon: "🌅", description: "Warm sunset tones", preview: "linear-gradient(135deg,#ff9900,#ffcc44)", params: { temperature: 30, saturation: 115, highlights: -15, liftR: 15, liftG: 5 } },
  { id: "matte-fade", name: "Matte Fade", category: "color", icon: "🌫️", description: "Instagram-style lifted blacks", preview: "linear-gradient(135deg,#8a8a8a,#c8bfb0)", params: { blackPoint: 20, saturation: 85, contrast: 90 } },
  { id: "moonlight", name: "Moonlight", category: "color", icon: "🌙", description: "Cool blue night scene", preview: "linear-gradient(135deg,#001a3a,#4488cc)", params: { temperature: -25, liftB: 20, saturation: 90, contrast: 108 } },
  { id: "vibrant-pop", name: "Vibrant Pop", category: "color", icon: "🎨", description: "Punchy colors for social media", preview: "linear-gradient(135deg,#ff4488,#44aaff)", params: { saturation: 145, vibrance: 40, contrast: 115, clarity: 20 } },
];

const TEXT_PRESETS: EditingPreset[] = [
  { id: "typewriter", name: "Typewriter", category: "text", icon: "⌨️", description: "Classic typing animation", preview: "linear-gradient(135deg,#1a1a1a,#333)", params: { animation: "typewriter", duration: 1.5 } },
  { id: "slide-up", name: "Slide Up", category: "text", icon: "⬆️", description: "Text slides in from bottom", preview: "linear-gradient(135deg,#0a0a2e,#1a1a6e)", params: { animation: "slideUp", duration: 0.6, easing: "ease-out" } },
  { id: "pop-bounce", name: "Pop & Bounce", category: "text", icon: "💥", description: "Elastic pop-in effect", preview: "linear-gradient(135deg,#2a0a2e,#6e1a6e)", params: { animation: "popBounce", duration: 0.8, scale: 1.2 } },
  { id: "glitch-reveal", name: "Glitch Reveal", category: "text", icon: "⚡", description: "Cyberpunk glitch effect", preview: "linear-gradient(135deg,#001a00,#00ff44)", params: { animation: "glitch", duration: 1.2, intensity: 0.4 } },
  { id: "fade-blur", name: "Fade + Blur", category: "text", icon: "✨", description: "Elegant fade with blur", preview: "linear-gradient(135deg,#1a1a1a,#444)", params: { animation: "fadeBlur", duration: 0.8, blur: 10 } },
  { id: "word-by-word", name: "Word by Word", category: "text", icon: "📝", description: "Each word appears in sequence", preview: "linear-gradient(135deg,#1a0a00,#664400)", params: { animation: "wordByWord", delay: 0.15 } },
];

const TRANSITION_PRESETS: EditingPreset[] = [
  { id: "smooth-cut", name: "Smooth Cut", category: "transition", icon: "✂️", description: "Clean frame-perfect cut", preview: "linear-gradient(135deg,#111,#333)", params: { type: "cut", duration: 0 } },
  { id: "cross-dissolve", name: "Cross Dissolve", category: "transition", icon: "🌊", description: "Classic fade overlap", preview: "linear-gradient(135deg,#0a2e1a,#2e1a0a)", params: { type: "dissolve", duration: 0.5 } },
  { id: "zoom-in", name: "Zoom In", category: "transition", icon: "🔍", description: "Zoom into next clip", preview: "linear-gradient(135deg,#0a0a2e,#2e2e6e)", params: { type: "zoom", direction: "in", duration: 0.6 } },
  { id: "glitch-cut", name: "Glitch Cut", category: "transition", icon: "⚡", description: "Distorted glitch transition", preview: "linear-gradient(135deg,#001100,#00ff44)", params: { type: "glitch", duration: 0.3 } },
  { id: "swipe-left", name: "Swipe Left", category: "transition", icon: "👈", description: "Hard wipe from right", preview: "linear-gradient(135deg,#2e0a0a,#6e1a1a)", params: { type: "wipe", direction: "left", duration: 0.4 } },
  { id: "light-leak", name: "Light Leak", category: "transition", icon: "💡", description: "Cinematic lens flare", preview: "linear-gradient(135deg,#4a3a00,#ff9900)", params: { type: "lightLeak", duration: 0.8, color: "#ffaa00" } },
];

const CAPTION_PRESETS: EditingPreset[] = [
  { id: "caption-modern", name: "Modern Bold", category: "caption", icon: "💬", description: "Bold sans-serif, bottom-center", preview: "linear-gradient(135deg,#000,#222)", params: { font: "Inter", weight: 700, size: 48, position: "bottom", background: "rgba(0,0,0,0.6)", borderRadius: 8 } },
  { id: "caption-typewriter", name: "Typewriter Captions", category: "caption", icon: "⌨️", description: "Animated word-by-word captions", preview: "linear-gradient(135deg,#001a00,#003300)", params: { font: "Courier New", animation: "typewriter", color: "#00ff00" } },
  { id: "caption-neon", name: "Neon Glow", category: "caption", icon: "✨", description: "Glowing neon text", preview: "linear-gradient(135deg,#000,#1a001a)", params: { font: "Inter", color: "#ff00ff", textShadow: "0 0 20px #ff00ff", weight: 800 } },
  { id: "caption-minimal", name: "Minimal White", category: "caption", icon: "🤍", description: "Simple white text, no background", preview: "linear-gradient(135deg,#111,#333)", params: { font: "Inter", color: "#ffffff", background: "transparent", weight: 400 } },
  { id: "caption-cinematic", name: "Cinematic", category: "caption", icon: "🎬", description: "Letterboxed cinematic subtitles", preview: "linear-gradient(135deg,#000,#1a1a00)", params: { font: "Georgia", color: "#f0e68c", weight: 400, letterboxed: true } },
];

const SPEED_PRESETS: EditingPreset[] = [
  { id: "slow-mo-50", name: "50% Slow Motion", category: "speed", icon: "🐌", description: "Half speed, smooth", preview: "linear-gradient(135deg,#0a0a2e,#1a1a6e)", params: { speed: 0.5, blendFrames: true } },
  { id: "slow-mo-25", name: "25% Slow Motion", category: "speed", icon: "🐢", description: "Quarter speed (4× slow)", preview: "linear-gradient(135deg,#000,#002244)", params: { speed: 0.25, blendFrames: true } },
  { id: "timelapse-4x", name: "4× Time-lapse", category: "speed", icon: "⚡", description: "4× speed compression", preview: "linear-gradient(135deg,#2e1a00,#8c5000)", params: { speed: 4, blendFrames: false } },
  { id: "speed-ramp", name: "Speed Ramp", category: "speed", icon: "📈", description: "Slow to fast ramp", preview: "linear-gradient(135deg,#1a1a1a,#ff6600)", params: { type: "ramp", fromSpeed: 0.3, toSpeed: 2.0, duration: 2 } },
  { id: "freeze-frame", name: "Freeze Frame", category: "speed", icon: "🧊", description: "Hold current frame for 1s", preview: "linear-gradient(135deg,#001a2e,#003366)", params: { type: "freeze", duration: 1.0 } },
];

const AUDIO_PRESETS: EditingPreset[] = [
  { id: "podcast-eq", name: "Podcast Voice EQ", category: "audio", icon: "🎙️", description: "Warm, clear voice for podcasts", preview: "linear-gradient(135deg,#1a0a00,#664400)", params: { eq: { "80hz": -6, "250hz": -3, "1kHz": 2, "3kHz": 4, "8kHz": 2 }, compressor: { threshold: -24, ratio: 3, attack: 10, release: 100 } } },
  { id: "music-enhance", name: "Music Enhancement", category: "audio", icon: "🎵", description: "Boost bass and highs", preview: "linear-gradient(135deg,#000a1a,#003366)", params: { eq: { "60hz": 3, "250hz": 1, "8kHz": 2, "16kHz": 3 }, stereo: "enhance" } },
  { id: "voice-boost", name: "Voice Clarity Boost", category: "audio", icon: "🗣️", description: "Cut mud, boost presence", preview: "linear-gradient(135deg,#0a1a0a,#1a4a1a)", params: { eq: { "200hz": -4, "1kHz": 3, "2.5kHz": 5, "5kHz": 2 }, gate: -40 } },
  { id: "auto-duck", name: "Auto Music Duck", category: "audio", icon: "🦆", description: "Lower music when voice plays", preview: "linear-gradient(135deg,#1a001a,#4a004a)", params: { ducking: { threshold: -30, reduction: -18, attack: 50, release: 200 } } },
  { id: "noise-reduce", name: "Noise Reduction", category: "audio", icon: "🔇", description: "Remove background hiss", preview: "linear-gradient(135deg,#000,#1a1a1a)", params: { noiseReduction: { amount: 60, sensitivity: 50 } } },
];

const ALL_PRESETS: EditingPreset[] = [
  ...COLOR_PRESETS,
  ...TEXT_PRESETS,
  ...TRANSITION_PRESETS,
  ...CAPTION_PRESETS,
  ...SPEED_PRESETS,
  ...AUDIO_PRESETS,
];

const CATEGORY_CONFIG: Record<PresetCategory, { label: string; icon: React.ReactNode; color: string }> = {
  color:      { label: "Color Grades",  icon: <Film size={12} />,   color: "#10b981" },
  text:       { label: "Text Animate",  icon: <Type size={12} />,   color: "#6a9bd8" },
  transition: { label: "Transitions",   icon: <Zap size={12} />,    color: "#e8a44a" },
  caption:    { label: "Captions",      icon: <Layers size={12} />, color: "#f472b6" },
  speed:      { label: "Speed Effects", icon: <Sparkles size={12} />, color: "#a78bfa" },
  audio:      { label: "Audio",         icon: <Mic size={12} />,    color: "#34d399" },
};

// ── Component ────────────────────────────────────────────────────────────────

export const EditingPresetsPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PresetCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return ALL_PRESETS.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, search]);

  const applyPreset = useCallback((preset: EditingPreset) => {
    // In production: dispatch to the store/engine. For now show feedback.
    setAppliedIds((prev) => {
      const next = new Set(prev);
      next.add(preset.id);
      return next;
    });
    toast.success(`Applied: ${preset.name}`);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search presets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-border bg-bg-2 pl-7 pr-3 py-1.5 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-fg-muted"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-accent text-accent-fg"
              : "bg-bg-2 text-fg-3 hover:bg-bg-3 hover:text-fg"
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_CONFIG) as PresetCategory[]).map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                activeCategory === cat
                  ? "text-accent-fg"
                  : "bg-bg-2 text-fg-3 hover:bg-bg-3 hover:text-fg"
              }`}
              style={activeCategory === cat ? { background: cfg.color } : {}}
            >
              {cfg.icon}
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Preset grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[11px] text-fg-muted py-8">No presets match your search.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((preset) => {
            const isApplied = appliedIds.has(preset.id);
            const catCfg = CATEGORY_CONFIG[preset.category];
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`relative rounded-lg border text-left overflow-hidden transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                  isApplied
                    ? "border-accent"
                    : "border-border hover:border-border-strong"
                }`}
              >
                {/* Preview thumbnail */}
                <div
                  className="h-12 w-full"
                  style={{ background: preset.preview ?? "var(--bg-3)" }}
                />
                {/* Info */}
                <div className="p-2 bg-bg-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm leading-none">{preset.icon}</span>
                    <span className="text-[10px] font-medium text-fg truncate">{preset.name}</span>
                    {isApplied && <Check size={9} className="flex-shrink-0 text-accent" />}
                  </div>
                  <span className="text-[9px] text-fg-muted line-clamp-1">{preset.description}</span>
                  {/* Category badge */}
                  <span
                    className="mt-1 inline-block rounded-sm px-1 py-0.5 text-[8px] font-semibold"
                    style={{ background: `${catCfg.color}22`, color: catCfg.color }}
                  >
                    {catCfg.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-fg-muted text-center pt-1">
        {filtered.length} preset{filtered.length !== 1 ? "s" : ""} available
      </p>
    </div>
  );
};


