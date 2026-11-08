/**
 * OnlineEffectsPanel.tsx
 *
 * Online & Downloadable Editable Effects & Motion Graphics Library
 * Inspired by and connecting to:
 *   - Jitter (kinetic text animations & kinetic typography)
 *   - Pixabay (video text effects, overlays, particle loops)
 *   - VideoEffects.com & Motion Array (premiere presets, lower thirds, transitions)
 *   - Uppbeat (motion graphics, subscribe callouts, social handles)
 *   - Renderforest (openers, typography templates, quote cards)
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Download,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  Globe,
  Loader2,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { useProjectStore } from "../../../stores/project-store";
import { useUIStore } from "../../../stores/ui-store";
import { useTimelineStore } from "../../../stores/timeline-store";
import { toast } from "../../../stores/notification-store";
import { insertTimelineOverlay } from "../../../stores/project/insert-timeline-overlay";
import type { TextStyle } from "@openreel/core";

export type OnlineEffectSource =
  | "all"
  | "jitter"
  | "pixabay"
  | "motionarray"
  | "uppbeat"
  | "renderforest"
  | "videoeffects";

export type OnlineEffectCategory =
  | "all"
  | "kinetic-text"
  | "lower-thirds"
  | "openers-titles"
  | "overlays-leaks"
  | "social-callouts"
  | "transitions";

export interface OnlineEffectTemplate {
  id: string;
  name: string;
  source: OnlineEffectSource;
  category: OnlineEffectCategory;
  description: string;
  duration: number; // in seconds
  defaultText: string;
  previewBg: string;
  previewAnimationClass?: string;
  style: Partial<TextStyle>;
  animationPreset?: string;
  externalUrl?: string;
}

const ONLINE_PLATFORMS: Array<{
  id: OnlineEffectSource;
  name: string;
  url: string;
  badgeColor: string;
}> = [
  {
    id: "jitter",
    name: "Jitter",
    url: "https://jitter.video/templates/all/",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    id: "pixabay",
    name: "Pixabay Effects",
    url: "https://pixabay.com/videos/search/text%20effect/",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "motionarray",
    name: "Motion Array",
    url: "https://motionarray.com/premiere-pro-presets/",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "uppbeat",
    name: "Uppbeat",
    url: "https://uppbeat.io/motion-graphics",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "renderforest",
    name: "Renderforest",
    url: "https://www.renderforest.com/templates",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
  {
    id: "videoeffects",
    name: "VideoEffects.com",
    url: "https://videoeffects.com/",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
];

const ONLINE_EFFECTS_CATALOG: OnlineEffectTemplate[] = [
  // ── Jitter.video Kinetic Typography ─────────────────────────────
  {
    id: "jitter-word-pop",
    name: "Kinetic Word Pop",
    source: "jitter",
    category: "kinetic-text",
    description: "Punchy viral-style text pop with dynamic scaling",
    duration: 3,
    defaultText: "DYNAMIC HEADLINE",
    previewBg: "linear-gradient(135deg, #09090b, #1e1e24)",
    style: {
      fontSize: 90,
      fontWeight: 900,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.85)",
      letterSpacing: -1,
    },
    animationPreset: "popBounce",
    externalUrl: "https://jitter.video/templates/all/",
  },
  {
    id: "jitter-typewriter-terminal",
    name: "Cyber Terminal Typewriter",
    source: "jitter",
    category: "kinetic-text",
    description: "Monospace blinking terminal code typing animation",
    duration: 4,
    defaultText: "> INITIALIZING SYSTEM...",
    previewBg: "linear-gradient(135deg, #020617, #064e3b)",
    style: {
      fontSize: 54,
      fontWeight: 700,
      fontFamily: "monospace",
      color: "#10b981",
      backgroundColor: "rgba(0,0,0,0.9)",
      letterSpacing: 1,
    },
    animationPreset: "typewriter",
    externalUrl: "https://jitter.video/templates/all/",
  },
  {
    id: "jitter-slide-blur",
    name: "Smooth Slide & Blur In",
    source: "jitter",
    category: "kinetic-text",
    description: "Elegant upward sliding text with motion-blur fade",
    duration: 3,
    defaultText: "Modern Elegance",
    previewBg: "linear-gradient(135deg, #0f172a, #334155)",
    style: {
      fontSize: 72,
      fontWeight: 600,
      color: "#f8fafc",
      letterSpacing: -0.5,
    },
    animationPreset: "slideUp",
    externalUrl: "https://jitter.video/templates/all/",
  },
  {
    id: "jitter-stomp-rhythm",
    name: "Fast Stomp Typography",
    source: "jitter",
    category: "kinetic-text",
    description: "High BPM rhythm kinetic text for fast-cut edits",
    duration: 2.5,
    defaultText: "BEAT // STOMP",
    previewBg: "linear-gradient(135deg, #7f1d1d, #18181b)",
    style: {
      fontSize: 104,
      fontWeight: 900,
      color: "#ef4444",
      letterSpacing: -2,
    },
    animationPreset: "popBounce",
    externalUrl: "https://jitter.video/templates/all/",
  },

  // ── Pixabay Motion & Text Effects ───────────────────────────────
  {
    id: "pixabay-fire-glow",
    name: "Fire & Golden Flame Title",
    source: "pixabay",
    category: "openers-titles",
    description: "Glowing fire aura text effect with warm ambient gradient",
    duration: 5,
    defaultText: "GOLDEN FIRE",
    previewBg: "linear-gradient(135deg, #451a03, #d97706)",
    style: {
      fontSize: 84,
      fontWeight: 800,
      color: "#fef08a",
      backgroundColor: "rgba(30,10,0,0.7)",
      letterSpacing: 2,
    },
    animationPreset: "fadeBlur",
    externalUrl: "https://pixabay.com/videos/search/text%20effect/",
  },
  {
    id: "pixabay-neon-flicker",
    name: "Tokyo Neon Sign Flicker",
    source: "pixabay",
    category: "openers-titles",
    description: "Pulsing retro cyberpunk neon tube signage",
    duration: 4.5,
    defaultText: "NEON NIGHTS",
    previewBg: "linear-gradient(135deg, #180026, #4a044e)",
    style: {
      fontSize: 88,
      fontWeight: 800,
      color: "#f43f5e",
      letterSpacing: 3,
    },
    animationPreset: "glitch",
    externalUrl: "https://pixabay.com/videos/search/text%20effect/",
  },
  {
    id: "pixabay-prismatic-flare",
    name: "Prismatic Light Leak Flare",
    source: "pixabay",
    category: "overlays-leaks",
    description: "Cinematic anamorphic light streak & flare transition",
    duration: 3,
    defaultText: "LIGHT LEAK",
    previewBg: "linear-gradient(135deg, #fbbf24, #ec4899, #3b82f6)",
    style: {
      fontSize: 64,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 1,
    },
    animationPreset: "fadeBlur",
    externalUrl: "https://pixabay.com/videos/search/text%20effect/",
  },
  {
    id: "pixabay-floating-particles",
    name: "Golden Ambient Bokeh Particles",
    source: "pixabay",
    category: "overlays-leaks",
    description: "Gentle floating golden dust particles for emotional scenes",
    duration: 6,
    defaultText: "MEMORIES",
    previewBg: "linear-gradient(135deg, #1c1917, #78350f)",
    style: {
      fontSize: 68,
      fontWeight: 300,
      color: "#fef3c7",
      letterSpacing: 4,
    },
    animationPreset: "fadeBlur",
    externalUrl: "https://pixabay.com/videos/search/text%20effect/",
  },

  // ── Motion Array & VideoEffects ─────────────────────────────────
  {
    id: "motionarray-news-lowerthird",
    name: "Broadcast News Lower Third",
    source: "motionarray",
    category: "lower-thirds",
    description: "Professional documentary speaker name & title strap",
    duration: 5,
    defaultText: "ALEX RIVERA | Lead Filmmaker",
    previewBg: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    style: {
      fontSize: 42,
      fontWeight: 700,
      color: "#ffffff",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      letterSpacing: 0,
    },
    animationPreset: "slideUp",
    externalUrl: "https://motionarray.com/premiere-pro-presets/",
  },
  {
    id: "motionarray-minimal-line-third",
    name: "Minimalist Line Lower Third",
    source: "videoeffects",
    category: "lower-thirds",
    description: "Sleek accent line with smooth left-to-right wipe",
    duration: 4,
    defaultText: "CREATIVE DIRECTOR // 2026",
    previewBg: "linear-gradient(135deg, #18181b, #27272a)",
    style: {
      fontSize: 36,
      fontWeight: 600,
      color: "#38bdf8",
      backgroundColor: "rgba(0,0,0,0.7)",
      letterSpacing: 1,
    },
    animationPreset: "slideUp",
    externalUrl: "https://videoeffects.com/",
  },
  {
    id: "videoeffects-zoom-whip",
    name: "Dynamic Zoom Whip Cut",
    source: "videoeffects",
    category: "transitions",
    description: "High-energy whip zoom transition text card",
    duration: 1.5,
    defaultText: "NEXT SCENE",
    previewBg: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    style: {
      fontSize: 96,
      fontWeight: 900,
      color: "#ffffff",
      letterSpacing: -1,
    },
    animationPreset: "popBounce",
    externalUrl: "https://videoeffects.com/",
  },
  {
    id: "motionarray-rgb-glitch",
    name: "RGB Chromatic Split",
    source: "motionarray",
    category: "transitions",
    description: "Distorted RGB channel split for action sequences",
    duration: 2,
    defaultText: "GLITCH // EFFECT",
    previewBg: "linear-gradient(135deg, #030712, #111827)",
    style: {
      fontSize: 78,
      fontWeight: 900,
      color: "#22d3ee",
      letterSpacing: 2,
    },
    animationPreset: "glitch",
    externalUrl: "https://motionarray.com/premiere-pro-presets/",
  },

  // ── Uppbeat Motion Graphics ─────────────────────────────────────
  {
    id: "uppbeat-subscribe-bell",
    name: "Subscribe & Bell Callout",
    source: "uppbeat",
    category: "social-callouts",
    description: "Animated red YouTube subscribe pill with ringing notification bell",
    duration: 4.5,
    defaultText: "🔔 SUBSCRIBE & LIKE",
    previewBg: "linear-gradient(135deg, #450a0a, #dc2626)",
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: "#ffffff",
      backgroundColor: "#dc2626",
      letterSpacing: 0,
    },
    animationPreset: "popBounce",
    externalUrl: "https://uppbeat.io/motion-graphics",
  },
  {
    id: "uppbeat-social-handle",
    name: "Social Handle Floating Pill",
    source: "uppbeat",
    category: "social-callouts",
    description: "Clean rounded handle pill for TikTok, Reels & Instagram",
    duration: 4,
    defaultText: "@yourusername",
    previewBg: "linear-gradient(135deg, #18181b, #3f3f46)",
    style: {
      fontSize: 38,
      fontWeight: 600,
      color: "#f4f4f5",
      backgroundColor: "rgba(0,0,0,0.8)",
      letterSpacing: 0,
    },
    animationPreset: "slideUp",
    externalUrl: "https://uppbeat.io/motion-graphics",
  },
  {
    id: "uppbeat-step-progress",
    name: "Chapter Progress Bar",
    source: "uppbeat",
    category: "social-callouts",
    description: "On-screen animated chapter step marker",
    duration: 5,
    defaultText: "STEP 01: INTRODUCTION",
    previewBg: "linear-gradient(135deg, #042f2e, #0d9488)",
    style: {
      fontSize: 34,
      fontWeight: 700,
      color: "#2dd4bf",
      backgroundColor: "rgba(4, 47, 46, 0.9)",
      letterSpacing: 1,
    },
    animationPreset: "slideUp",
    externalUrl: "https://uppbeat.io/motion-graphics",
  },

  // ── Renderforest Openers & Typography ───────────────────────────
  {
    id: "renderforest-logo-opener",
    name: "Minimalist Brand Logo Opener",
    source: "renderforest",
    category: "openers-titles",
    description: "Cinematic minimalist brand title reveal with clean subtitle",
    duration: 5,
    defaultText: "STUDIO PRODUCTIONS",
    previewBg: "linear-gradient(135deg, #09090b, #18181b)",
    style: {
      fontSize: 66,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: 6,
    },
    animationPreset: "fadeBlur",
    externalUrl: "https://www.renderforest.com/templates",
  },
  {
    id: "renderforest-podcast-quote",
    name: "Podcast Highlight Quote Card",
    source: "renderforest",
    category: "openers-titles",
    description: "Framed audiogram-style quote box with animated text",
    duration: 6,
    defaultText: '“The best videos start with great pacing.”',
    previewBg: "linear-gradient(135deg, #172554, #1e3a8a)",
    style: {
      fontSize: 44,
      fontWeight: 500,
      color: "#bfdbfe",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      letterSpacing: 0,
    },
    animationPreset: "slideUp",
    externalUrl: "https://www.renderforest.com/templates",
  },
  {
    id: "renderforest-end-screen",
    name: "YouTube Outro End Screen",
    source: "renderforest",
    category: "social-callouts",
    description: "End-of-video recommendation cards with watch-next text",
    duration: 7,
    defaultText: "THANKS FOR WATCHING // NEXT VIDEO",
    previewBg: "linear-gradient(135deg, #311042, #701a75)",
    style: {
      fontSize: 48,
      fontWeight: 800,
      color: "#f5d0fe",
      backgroundColor: "rgba(49, 16, 66, 0.9)",
      letterSpacing: 1,
    },
    animationPreset: "popBounce",
    externalUrl: "https://www.renderforest.com/templates",
  },
];

const CATEGORY_TABS: Array<{ id: OnlineEffectCategory; label: string }> = [
  { id: "all",             label: "All Effects"       },
  { id: "kinetic-text",    label: "Kinetic Text"      },
  { id: "lower-thirds",    label: "Lower Thirds"      },
  { id: "openers-titles",  label: "Openers & Titles"  },
  { id: "overlays-leaks",  label: "Overlays & Leaks"  },
  { id: "social-callouts", label: "Social Callouts"   },
  { id: "transitions",     label: "Transitions"       },
];

export const OnlineEffectsPanel: React.FC = () => {
  const playheadPosition = useTimelineStore((state) => state.playheadPosition);
  const select = useUIStore((state) => state.select);

  const [activeCategory, setActiveCategory] = useState<OnlineEffectCategory>("all");
  const [activeSource, setActiveSource] = useState<OnlineEffectSource>("all");
  const [search, setSearch] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<OnlineEffectTemplate | null>(
    ONLINE_EFFECTS_CATALOG[0],
  );
  const [customText, setCustomText] = useState(
    ONLINE_EFFECTS_CATALOG[0].defaultText,
  );
  const [customDuration, setCustomDuration] = useState(
    ONLINE_EFFECTS_CATALOG[0].duration,
  );

  const filtered = useMemo(() => {
    return ONLINE_EFFECTS_CATALOG.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (activeSource !== "all" && item.source !== activeSource) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.defaultText.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, activeSource, search]);

  const handleSelectEffect = useCallback((effect: OnlineEffectTemplate) => {
    setSelectedEffect(effect);
    setCustomText(effect.defaultText);
    setCustomDuration(effect.duration);
  }, []);

  const handleAddToTimeline = useCallback(
    async (effect: OnlineEffectTemplate, textOverride?: string) => {
      const textToUse = textOverride ?? customText ?? effect.defaultText;
      const durationToUse = customDuration || effect.duration;

      try {
        const created = await insertTimelineOverlay(
          playheadPosition,
          durationToUse,
          (trackId) =>
            useProjectStore.getState().createTextClip(
              trackId,
              playheadPosition,
              textToUse,
              durationToUse,
              effect.style,
              {
                sourceUrl: effect.externalUrl,
                templateId: effect.id,
              },
            ),
        );

        if (created) {
          select({
            type: "text-clip",
            id: created.id,
            trackId: created.trackId,
          });
          toast.success(
            "Effect Added to Timeline",
            `"${effect.name}" is now editable on the timeline.`,
          );
        }
      } catch (err) {
        toast.error(
          "Could not add effect",
          err instanceof Error ? err.message : String(err),
        );
      }
    },
    [customText, customDuration, playheadPosition, select],
  );

  const handleImportFromUrl = useCallback(async () => {
    if (!importUrl.trim()) {
      toast.warning("Enter a URL", "Paste a template or asset link first.");
      return;
    }

    setIsImporting(true);
    try {
      // Create an editable overlay with the URL metadata
      const label = importUrl.split("/").pop()?.split("?")[0] || "Custom Online Effect";
      const created = await insertTimelineOverlay(
        playheadPosition,
        5,
        (trackId) =>
          useProjectStore.getState().createTextClip(
            trackId,
            playheadPosition,
            label,
            5,
            { fontSize: 64, fontWeight: 700, color: "#ffffff" },
            { sourceUrl: importUrl },
          ),
      );

      if (created) {
        select({
          type: "text-clip",
          id: created.id,
          trackId: created.trackId,
        });
        toast.success("Online Effect Added", `Imported from: ${importUrl}`);
        setImportUrl("");
      }
    } catch (err) {
      toast.error(
        "Import failed",
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setIsImporting(false);
    }
  }, [importUrl, playheadPosition, select]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-1 text-fg">
      {/* ── Top Header & Search ──────────────────────────────────── */}
      <div className="shrink-0 border-b border-border p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">
              Online Effects & Motion Templates
            </h3>
          </div>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/20">
            {filtered.length} Editable Templates
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search kinetic text, lower thirds, light leaks, openers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-bg-2 pl-8 pr-3 py-1.5 text-xs text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Source Provider Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          <button
            type="button"
            onClick={() => setActiveSource("all")}
            className={`rounded-md px-2 py-0.5 font-medium transition-colors shrink-0 ${
              activeSource === "all"
                ? "bg-accent text-accent-fg"
                : "bg-bg-2 text-fg-3 hover:text-fg"
            }`}
          >
            All Sources
          </button>
          {ONLINE_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => setActiveSource(platform.id)}
              className={`rounded-md px-2 py-0.5 font-medium border transition-colors shrink-0 ${
                activeSource === platform.id
                  ? "bg-accent text-accent-fg border-accent"
                  : `${platform.badgeColor} bg-bg-2 hover:opacity-100`
              }`}
            >
              {platform.name}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-md px-2 py-1 font-medium transition-colors shrink-0 ${
                activeCategory === cat.id
                  ? "bg-bg-3 text-fg font-semibold border border-border"
                  : "text-fg-muted hover:text-fg hover:bg-bg-2"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Split (Catalog Grid + Live Interactive Editor) ── */}
      <div className="min-h-0 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Template Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
          {filtered.map((item) => {
            const isSelected = selectedEffect?.id === item.id;
            const platform = ONLINE_PLATFORMS.find((p) => p.id === item.source);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectEffect(item)}
                className={`group relative rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-border bg-bg-2 hover:border-border-strong hover:bg-bg-3"
                }`}
              >
                {/* Visual Preview Box */}
                <div
                  className="relative h-20 w-full rounded-lg overflow-hidden flex items-center justify-center p-2 mb-2 text-center"
                  style={{ background: item.previewBg }}
                >
                  <span
                    className="font-bold leading-tight select-none line-clamp-2 px-1"
                    style={{
                      color: item.style.color ?? "#ffffff",
                      fontSize: "13px",
                      letterSpacing: item.style.letterSpacing
                        ? `${item.style.letterSpacing * 0.2}px`
                        : undefined,
                    }}
                  >
                    {item.defaultText}
                  </span>

                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-mono text-white/90">
                    {item.duration}s
                  </span>
                </div>

                {/* Info & Meta */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[11px] font-semibold text-fg truncate">
                      {item.name}
                    </span>
                    {platform && (
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${platform.badgeColor}`}
                      >
                        {platform.name}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-fg-muted line-clamp-1 mb-2">
                    {item.description}
                  </p>
                </div>

                {/* Quick Add Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleAddToTimeline(item);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent hover:bg-accent hover:text-accent-fg transition-colors"
                >
                  <Plus size={11} />
                  Add to Timeline
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Effect Live Customizer */}
        {selectedEffect && (
          <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border bg-bg-2 p-3 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-fg">
                Customize & Inject
              </span>
              {selectedEffect.externalUrl && (
                <a
                  href={selectedEffect.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                >
                  View Source <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Live Interactive Canvas Box */}
            <div
              className="h-28 w-full rounded-xl flex items-center justify-center p-3 text-center border border-border/80 shadow-inner"
              style={{ background: selectedEffect.previewBg }}
            >
              <span
                className="font-bold leading-tight"
                style={{
                  color: selectedEffect.style.color ?? "#ffffff",
                  fontSize: "16px",
                  letterSpacing: selectedEffect.style.letterSpacing
                    ? `${selectedEffect.style.letterSpacing * 0.2}px`
                    : undefined,
                }}
              >
                {customText || selectedEffect.defaultText}
              </span>
            </div>

            {/* Editable Text Field */}
            <label className="block text-fg-2 text-[10px] font-medium">
              Editable Text Content
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-bg-1 p-2 text-xs text-fg focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Enter text..."
              />
            </label>

            {/* Duration Slider */}
            <label className="block text-fg-2 text-[10px] font-medium">
              Duration: {customDuration.toFixed(1)}s
              <input
                type="range"
                min={1}
                max={15}
                step={0.5}
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </label>

            {/* Add to Timeline Action */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddToTimeline(selectedEffect, customText)}
              className="w-full justify-center gap-1.5"
            >
              <Download size={13} />
              Add as Editable Layer
            </Button>
            <p className="text-[9px] text-fg-muted text-center leading-tight">
              Adds a new non-destructive text/effect clip on the timeline at the playhead.
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom: Online URL & External Sources Hub ────────────── */}
      <div className="shrink-0 border-t border-border bg-bg-2 p-3 space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="Paste download/template URL from Jitter, Pixabay, VideoEffects, Uppbeat, or MP4..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className="flex-1 w-full rounded-md border border-border bg-bg-1 px-3 py-1.5 text-xs text-fg placeholder:text-fg-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleImportFromUrl}
            disabled={isImporting || !importUrl.trim()}
            className="w-full sm:w-auto shrink-0 gap-1.5"
          >
            {isImporting ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
            Download & Import
          </Button>
        </div>

        {/* Quick Launch Links to All 6 Platforms */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-fg-muted">
          <span className="font-medium text-fg-3">Browse Free Resources:</span>
          {ONLINE_PLATFORMS.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 hover:text-accent transition-colors underline"
            >
              {platform.name} <ExternalLink size={9} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
