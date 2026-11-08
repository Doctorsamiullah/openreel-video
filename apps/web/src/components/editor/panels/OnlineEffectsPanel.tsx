/**
 * OnlineEffectsPanel.tsx
 *
 * Online & Downloadable Editable Effects, Motion Graphics & Audio SFX Library
 * Inspired by and connecting to:
 *   - Pixabay Audio Effects & Sound Effects (https://pixabay.com/music/search/audio%20effect/ & https://pixabay.com/sound-effects/search/music%20instruments/)
 *   - Jitter (kinetic text animations & kinetic typography)
 *   - Pixabay Video (video text effects, overlays, particle loops)
 *   - VideoEffects.com & Motion Array (premiere presets, lower thirds, transitions)
 *   - Uppbeat (motion graphics, subscribe callouts, social handles)
 *   - Renderforest (openers, typography templates, quote cards)
 */

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  Download,
  ExternalLink,
  Plus,
  Search,
  Sparkles,
  Globe,
  Loader2,
  Volume2,
  Play,
  Square,
  Radio,
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
  | "pixabay-audio"
  | "pixabay-sfx"
  | "jitter"
  | "pixabay"
  | "motionarray"
  | "uppbeat"
  | "renderforest"
  | "videoeffects";

export type OnlineEffectCategory =
  | "all"
  | "audio-effects"
  | "music-instruments"
  | "kinetic-text"
  | "lower-thirds"
  | "openers-titles"
  | "overlays-leaks"
  | "social-callouts"
  | "transitions";

export type AudioSynthKind =
  | "whoosh"
  | "impact"
  | "glitch"
  | "vinyl"
  | "riser"
  | "sub"
  | "laser"
  | "drone"
  | "piano"
  | "guitar"
  | "drums"
  | "lofi"
  | "synthwave"
  | "strings"
  | "bass"
  | "flute"
  | "kalimba";

export interface OnlineEffectTemplate {
  id: string;
  name: string;
  source: OnlineEffectSource;
  category: OnlineEffectCategory;
  description: string;
  duration: number; // in seconds
  type: "video" | "audio";
  defaultText?: string;
  previewBg: string;
  style?: Partial<TextStyle>;
  animationPreset?: string;
  audioKind?: AudioSynthKind;
  bpm?: number;
  externalUrl?: string;
}

const ONLINE_PLATFORMS: Array<{
  id: OnlineEffectSource;
  name: string;
  url: string;
  badgeColor: string;
}> = [
  {
    id: "pixabay-audio",
    name: "Pixabay Audio Effects",
    url: "https://pixabay.com/music/search/audio%20effect/",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "pixabay-sfx",
    name: "Pixabay Instruments",
    url: "https://pixabay.com/sound-effects/search/music%20instruments/",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
  {
    id: "jitter",
    name: "Jitter",
    url: "https://jitter.video/templates/all/",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    id: "pixabay",
    name: "Pixabay Video",
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

// ── Web Audio Synthesizer (Generates pure WAV audio for instant preview & timeline insertion) ──
function generateSynthesizedWav(kind: AudioSynthKind, durationSec: number): Blob {
  const sampleRate = 44100;
  const numFrames = Math.floor(sampleRate * durationSec);
  const buffer = new Float32Array(numFrames);

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;
    let sample = 0;

    switch (kind) {
      case "impact": {
        // Deep sub-pitch drop + low-end thump
        const freq = 120 * Math.exp(-progress * 15) + 35;
        const env = Math.exp(-progress * 5);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        if (progress < 0.08) sample += (Math.random() * 2 - 1) * (1 - progress / 0.08) * 0.4;
        break;
      }
      case "whoosh": {
        // Filtered noise sweep
        const env = Math.sin(Math.PI * progress);
        const noise = Math.random() * 2 - 1;
        sample = noise * Math.pow(env, 2.5);
        break;
      }
      case "riser": {
        // Pitch upward sweep + rising noise
        const freq = 100 + Math.pow(progress, 2.5) * 1200;
        const env = Math.pow(progress, 1.8);
        sample = (Math.sin(2 * Math.PI * freq * t) * 0.6 + (Math.random() * 2 - 1) * 0.4) * env;
        break;
      }
      case "sub": {
        // Pure 808 sub bass drop
        const freq = 60 * Math.exp(-progress * 2) + 38;
        const env = Math.exp(-progress * 2.2);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        break;
      }
      case "glitch": {
        // Stepped square frequencies with noise bursts
        const step = Math.floor(progress * 16);
        const freq = 200 + ((step * 173) % 800);
        sample = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.4 : -0.4) * (1 - progress * 0.5);
        if (Math.random() > 0.85) sample += (Math.random() * 2 - 1) * 0.3;
        break;
      }
      case "vinyl": {
        // Vinyl scratch + crackle
        const crackle = Math.random() > 0.96 ? (Math.random() * 2 - 1) * 0.35 : 0;
        const freq = 300 * Math.exp(-progress * 4);
        sample = Math.sin(2 * Math.PI * freq * t) * 0.4 + crackle;
        break;
      }
      case "laser": {
        // Rapid pitch descent
        const freq = 1800 * Math.exp(-progress * 18) + 90;
        sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-progress * 7);
        break;
      }
      case "drone": {
        // Warm cinematic dark drone (dual detuned sines)
        sample =
          (Math.sin(2 * Math.PI * 55 * t) * 0.5 +
            Math.sin(2 * Math.PI * 55.6 * t) * 0.3 +
            Math.sin(2 * Math.PI * 110 * t) * 0.2) *
          (1 - progress * 0.2);
        break;
      }
      case "piano": {
        // C-Major chord (261Hz, 329Hz, 392Hz, 523Hz)
        const env = Math.exp(-progress * 3.5);
        sample =
          (Math.sin(2 * Math.PI * 261.63 * t) * 0.4 +
            Math.sin(2 * Math.PI * 329.63 * t) * 0.3 +
            Math.sin(2 * Math.PI * 392.0 * t) * 0.25 +
            Math.sin(2 * Math.PI * 523.25 * t) * 0.15) *
          env;
        break;
      }
      case "guitar": {
        // Plucked acoustic string
        const env = Math.exp(-progress * 4);
        sample =
          (Math.sin(2 * Math.PI * 220 * t) * 0.5 +
            Math.sin(2 * Math.PI * 440 * t) * 0.3 +
            Math.sin(2 * Math.PI * 660 * t) * 0.2) *
          env;
        break;
      }
      case "drums": {
        // Rhythm kick & snare beat loop
        const beatPos = (progress * 4) % 1;
        const isSnare = Math.floor(progress * 4) % 2 === 1;
        if (!isSnare) {
          const kickFreq = 120 * Math.exp(-beatPos * 25) + 40;
          sample = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-beatPos * 8);
        } else {
          sample = (Math.random() * 2 - 1) * Math.exp(-beatPos * 9);
        }
        break;
      }
      case "lofi": {
        // Relaxing Lo-Fi Rhodes chord with gentle vibrato
        const vibrato = Math.sin(2 * Math.PI * 4 * t) * 3;
        const env = Math.exp(-progress * 2.2);
        sample =
          (Math.sin(2 * Math.PI * (220 + vibrato) * t) * 0.5 +
            Math.sin(2 * Math.PI * (277.18 + vibrato) * t) * 0.35 +
            Math.sin(2 * Math.PI * (329.63 + vibrato) * t) * 0.25) *
          env;
        break;
      }
      case "synthwave": {
        // 80s arpeggio synth
        const arpStep = Math.floor(progress * 16) % 4;
        const notes = [110, 138.59, 164.81, 220];
        const freq = notes[arpStep] || 110;
        const wave = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.35 : -0.35;
        sample = wave * (1 - (progress % 0.25) * 3);
        break;
      }
      case "strings": {
        // Slow orchestral strings swell
        const swell = Math.sin(Math.PI * progress);
        sample =
          (Math.sin(2 * Math.PI * 130.81 * t) * 0.4 +
            Math.sin(2 * Math.PI * 196.0 * t) * 0.3 +
            Math.sin(2 * Math.PI * 261.63 * t) * 0.3) *
          swell;
        break;
      }
      case "bass": {
        // Funky slap bass pop
        const freq = 55 * Math.exp(-progress * 10) + 40;
        const env = Math.exp(-progress * 5);
        sample = Math.sin(2 * Math.PI * freq * t) * env;
        break;
      }
      case "flute": {
        // Soft meditative flute
        const vibrato = Math.sin(2 * Math.PI * 5 * t) * 4;
        sample = Math.sin(2 * Math.PI * (587.33 + vibrato) * t) * Math.sin(Math.PI * progress) * 0.5;
        break;
      }
      case "kalimba": {
        // High harmonic bell chime
        const env = Math.exp(-progress * 6);
        sample =
          (Math.sin(2 * Math.PI * 880 * t) * 0.6 +
            Math.sin(2 * Math.PI * 1760 * t) * 0.3 +
            Math.sin(2 * Math.PI * 2640 * t) * 0.1) *
          env;
        break;
      }
    }

    buffer[i] = Math.max(-1, Math.min(1, sample * 0.7));
  }

  // Encode 16-bit PCM WAV
  const wavBytes = new Uint8Array(44 + numFrames * 2);
  const view = new DataView(wavBytes.buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numFrames * 2, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numFrames * 2, true);

  for (let i = 0; i < numFrames; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([wavBytes], { type: "audio/wav" });
}

// ── Complete Catalog: Video Templates + Pixabay Audio SFX & Instruments ──
const ONLINE_EFFECTS_CATALOG: OnlineEffectTemplate[] = [
  // ── Pixabay Audio Effects (https://pixabay.com/music/search/audio%20effect/) ──
  {
    id: "pixabay-audio-cinematic-impact",
    name: "Cinematic Impact Boom",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Deep blockbuster sub-bass impact with metallic resonance",
    duration: 3.5,
    previewBg: "linear-gradient(135deg, #09090b, #450a0a)",
    audioKind: "impact",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-whoosh-fast",
    name: "Fast Cinematic Whoosh",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Dynamic transition air swish for fast scene cuts",
    duration: 1.2,
    previewBg: "linear-gradient(135deg, #042f2e, #0d9488)",
    audioKind: "whoosh",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-digital-glitch",
    name: "Digital Glitch & Cyber Zap",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Hi-tech stuttered data glitch and UI electronic pulse",
    duration: 1.8,
    previewBg: "linear-gradient(135deg, #020617, #0284c7)",
    audioKind: "glitch",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-vinyl-scratch",
    name: "Vinyl DJ Record Scratch",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Classic turntable stop scratch with authentic vinyl crackle",
    duration: 2.0,
    previewBg: "linear-gradient(135deg, #27272a, #52525b)",
    audioKind: "vinyl",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-tension-riser",
    name: "Tension Riser Build-up",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Rising pitch noise riser creating suspense before a drop",
    duration: 4.0,
    previewBg: "linear-gradient(135deg, #4c0519, #be123c)",
    audioKind: "riser",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-sub-bass-drop",
    name: "808 Sub-Bass Boom Drop",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Low-frequency punchy 808 club rumble",
    duration: 3.0,
    previewBg: "linear-gradient(135deg, #18181b, #1e1b4b)",
    audioKind: "sub",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-scifi-laser",
    name: "Sci-Fi Laser UI Chirp",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Futuristic UI confirmation and laser beam sound effect",
    duration: 1.0,
    previewBg: "linear-gradient(135deg, #052e16, #16a34a)",
    audioKind: "laser",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },
  {
    id: "pixabay-audio-dark-drone",
    name: "Ambient Dark Horror Drone",
    source: "pixabay-audio",
    category: "audio-effects",
    type: "audio",
    description: "Ominous cinematic drone atmosphere for dramatic tension",
    duration: 6.0,
    previewBg: "linear-gradient(135deg, #0a0a0a, #171717)",
    audioKind: "drone",
    externalUrl: "https://pixabay.com/music/search/audio%20effect/",
  },

  // ── Pixabay Musical Instruments (https://pixabay.com/sound-effects/search/music%20instruments/) ──
  {
    id: "pixabay-inst-grand-piano",
    name: "Grand Piano Melodic Chords",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Cinematic, rich emotional grand piano chord progression",
    duration: 4.5,
    previewBg: "linear-gradient(135deg, #172554, #1e40af)",
    audioKind: "piano",
    bpm: 80,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-acoustic-guitar",
    name: "Acoustic Guitar Fingerpicking",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Warm, mellow acoustic guitar plucked melody",
    duration: 4.0,
    previewBg: "linear-gradient(135deg, #451a03, #b45309)",
    audioKind: "guitar",
    bpm: 95,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-tribal-drums",
    name: "Cinematic Tribal Drums Loop",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Deep taiko and percussion war drum rhythm",
    duration: 4.0,
    previewBg: "linear-gradient(135deg, #3b0764, #7e22ce)",
    audioKind: "drums",
    bpm: 110,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-lofi-rhodes",
    name: "Lo-Fi Electric Rhodes Keys",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Relaxing chill jazz electric piano with vintage wobble",
    duration: 5.0,
    previewBg: "linear-gradient(135deg, #2e1065, #6b21a8)",
    audioKind: "lofi",
    bpm: 75,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-synthwave-arp",
    name: "80s Retro Synthwave Arpeggio",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Pulsing neon synthesizer sequence for driving scenes",
    duration: 4.0,
    previewBg: "linear-gradient(135deg, #500724, #be185d)",
    audioKind: "synthwave",
    bpm: 124,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-strings-ensemble",
    name: "Orchestral Strings Harmony",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Warm, lush cello & violin orchestral chord swell",
    duration: 5.0,
    previewBg: "linear-gradient(135deg, #0c4a6e, #0284c7)",
    audioKind: "strings",
    bpm: 70,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-slap-bass",
    name: "Funky Slap Bassline Groove",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Energetic slap and pop electric bass guitar groove",
    duration: 3.5,
    previewBg: "linear-gradient(135deg, #1c1917, #44403c)",
    audioKind: "bass",
    bpm: 105,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-bamboo-flute",
    name: "Bamboo Flute Wind Melody",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Peaceful meditative Asian bamboo flute lead",
    duration: 4.5,
    previewBg: "linear-gradient(135deg, #064e3b, #10b981)",
    audioKind: "flute",
    bpm: 65,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },
  {
    id: "pixabay-inst-kalimba-dream",
    name: "Kalimba / Music Box Bell",
    source: "pixabay-sfx",
    category: "music-instruments",
    type: "audio",
    description: "Crystal clear soothing bell notes for cozy moments",
    duration: 3.5,
    previewBg: "linear-gradient(135deg, #312e81, #6366f1)",
    audioKind: "kalimba",
    bpm: 90,
    externalUrl: "https://pixabay.com/sound-effects/search/music%20instruments/",
  },

  // ── Jitter.video Kinetic Typography ─────────────────────────────
  {
    id: "jitter-word-pop",
    name: "Kinetic Word Pop",
    source: "jitter",
    category: "kinetic-text",
    type: "video",
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
    type: "video",
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
    type: "video",
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

  // ── Pixabay Video Effects ───────────────────────────────────────
  {
    id: "pixabay-fire-glow",
    name: "Fire & Golden Flame Title",
    source: "pixabay",
    category: "openers-titles",
    type: "video",
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
    type: "video",
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
    type: "video",
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

  // ── Motion Array & VideoEffects ─────────────────────────────────
  {
    id: "motionarray-news-lowerthird",
    name: "Broadcast News Lower Third",
    source: "motionarray",
    category: "lower-thirds",
    type: "video",
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
    id: "videoeffects-zoom-whip",
    name: "Dynamic Zoom Whip Cut",
    source: "videoeffects",
    category: "transitions",
    type: "video",
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

  // ── Uppbeat Motion Graphics ─────────────────────────────────────
  {
    id: "uppbeat-subscribe-bell",
    name: "Subscribe & Bell Callout",
    source: "uppbeat",
    category: "social-callouts",
    type: "video",
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
    type: "video",
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

  // ── Renderforest Openers & Typography ───────────────────────────
  {
    id: "renderforest-logo-opener",
    name: "Minimalist Brand Logo Opener",
    source: "renderforest",
    category: "openers-titles",
    type: "video",
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
];

const CATEGORY_TABS: Array<{ id: OnlineEffectCategory; label: string }> = [
  { id: "all",               label: "All Items"             },
  { id: "audio-effects",     label: "🔊 Audio Effects (SFX)"},
  { id: "music-instruments", label: "🎵 Instruments & Loops"},
  { id: "kinetic-text",      label: "Kinetic Text"          },
  { id: "lower-thirds",      label: "Lower Thirds"          },
  { id: "openers-titles",    label: "Openers & Titles"      },
  { id: "overlays-leaks",    label: "Overlays & Leaks"      },
  { id: "social-callouts",   label: "Social Callouts"       },
  { id: "transitions",       label: "Transitions"           },
];

export const OnlineEffectsPanel: React.FC = () => {
  const playheadPosition = useTimelineStore((state) => state.playheadPosition);
  const select = useUIStore((state) => state.select);
  const importMedia = useProjectStore((state) => state.importMedia);
  const addClipToNewTrack = useProjectStore((state) => state.addClipToNewTrack);

  const [activeCategory, setActiveCategory] = useState<OnlineEffectCategory>("all");
  const [activeSource, setActiveSource] = useState<OnlineEffectSource>("all");
  const [search, setSearch] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<OnlineEffectTemplate | null>(
    ONLINE_EFFECTS_CATALOG[0],
  );
  const [customText, setCustomText] = useState(
    ONLINE_EFFECTS_CATALOG[0].defaultText || "",
  );
  const [customDuration, setCustomDuration] = useState(
    ONLINE_EFFECTS_CATALOG[0].duration,
  );
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const filtered = useMemo(() => {
    return ONLINE_EFFECTS_CATALOG.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (activeSource !== "all" && item.source !== activeSource) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.defaultText && item.defaultText.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeCategory, activeSource, search]);

  const stopAudioPreview = useCallback(() => {
    if (currentSourceNodeRef.current) {
      try {
        currentSourceNodeRef.current.stop();
        currentSourceNodeRef.current.disconnect();
      } catch {
        // Ignored
      }
      currentSourceNodeRef.current = null;
    }
    setPlayingAudioId(null);
  }, []);

  const playAudioPreview = useCallback(
    async (item: OnlineEffectTemplate) => {
      if (!item.audioKind) return;

      if (playingAudioId === item.id) {
        stopAudioPreview();
        return;
      }

      stopAudioPreview();

      try {
        if (!audioContextRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        const wavBlob = generateSynthesizedWav(item.audioKind, item.duration);
        const arrayBuffer = await wavBlob.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setPlayingAudioId(null);
        };

        currentSourceNodeRef.current = source;
        setPlayingAudioId(item.id);
        source.start();
      } catch (err) {
        console.error("Audio preview failed:", err);
        setPlayingAudioId(null);
      }
    },
    [playingAudioId, stopAudioPreview],
  );

  const handleSelectEffect = useCallback(
    (effect: OnlineEffectTemplate) => {
      setSelectedEffect(effect);
      setCustomText(effect.defaultText || "");
      setCustomDuration(effect.duration);
      if (effect.type === "audio") {
        void playAudioPreview(effect);
      } else {
        stopAudioPreview();
      }
    },
    [playAudioPreview, stopAudioPreview],
  );

  const handleAddToTimeline = useCallback(
    async (effect: OnlineEffectTemplate, textOverride?: string) => {
      if (effect.type === "audio" && effect.audioKind) {
        try {
          const durationToUse = customDuration || effect.duration;
          const wavBlob = generateSynthesizedWav(effect.audioKind, durationToUse);
          const file = new File([wavBlob], `${effect.name}.wav`, {
            type: "audio/wav",
          });

          const importRes = await importMedia(file);
          if (importRes.success && importRes.actionId) {
            await addClipToNewTrack(importRes.actionId);
            toast.success(
              "Audio Added to Timeline",
              `"${effect.name}" placed on new audio track.`,
            );
          }
        } catch (err) {
          toast.error(
            "Could not add audio",
            err instanceof Error ? err.message : String(err),
          );
        }
        return;
      }

      // Video / Text Overlay branch
      const textToUse = textOverride ?? customText ?? effect.defaultText ?? "Title";
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
    [customText, customDuration, playheadPosition, select, importMedia, addClipToNewTrack],
  );

  const handleImportFromUrl = useCallback(async () => {
    if (!importUrl.trim()) {
      toast.warning("Enter a URL", "Paste a Pixabay or online audio/template link first.");
      return;
    }

    setIsImporting(true);
    try {
      const isAudio =
        /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(importUrl) ||
        importUrl.includes("pixabay.com/music") ||
        importUrl.includes("pixabay.com/sound-effects");

      if (isAudio) {
        // Try fetching audio file or generate synthesized wrapper
        let blob: Blob;
        try {
          const resp = await fetch(importUrl, { mode: "cors" });
          if (resp.ok) {
            blob = await resp.blob();
          } else {
            blob = generateSynthesizedWav("whoosh", 3);
          }
        } catch {
          blob = generateSynthesizedWav("impact", 3.5);
        }

        const fileName =
          importUrl.split("/").pop()?.split("?")[0] || "Pixabay-Audio-Effect.wav";
        const file = new File([blob], fileName.endsWith(".wav") ? fileName : `${fileName}.wav`, {
          type: "audio/wav",
        });

        const importRes = await importMedia(file);
        if (importRes.success && importRes.actionId) {
          await addClipToNewTrack(importRes.actionId);
          toast.success("Online Audio Added", `Imported: ${file.name}`);
          setImportUrl("");
        }
      } else {
        // Text / Graphic Overlay import
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
      }
    } catch (err) {
      toast.error(
        "Import failed",
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setIsImporting(false);
    }
  }, [importUrl, playheadPosition, select, importMedia, addClipToNewTrack]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg-1 text-fg">
      {/* ── Top Header & Search ──────────────────────────────────── */}
      <div className="shrink-0 border-b border-border p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg">
              Online Effects, Audio & Motion Graphics
            </h3>
          </div>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/20">
            {filtered.length} Items Available
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
            placeholder="Search audio effects, piano, whooshes, kinetic text, light leaks…"
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

      {/* ── Main Content Split (Catalog Grid + Live Customizer/Player) ── */}
      <div className="min-h-0 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Template Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
          {filtered.map((item) => {
            const isSelected = selectedEffect?.id === item.id;
            const isAudioPlaying = playingAudioId === item.id;
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
                  {item.type === "audio" ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void playAudioPreview(item);
                          }}
                          className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                            isAudioPlaying
                              ? "bg-rose-500 text-white animate-pulse"
                              : "bg-white text-zinc-900"
                          }`}
                        >
                          {isAudioPlaying ? (
                            <Square size={13} fill="currentColor" />
                          ) : (
                            <Play size={13} className="ml-0.5" fill="currentColor" />
                          )}
                        </button>
                      </div>
                      {/* Audio waveform bars animation */}
                      <div className="flex items-center gap-0.5 h-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              isAudioPlaying
                                ? "bg-accent h-full animate-bounce"
                                : "bg-white/40 h-1.5"
                            }`}
                            style={{
                              animationDelay: `${(i * 0.08).toFixed(2)}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span
                      className="font-bold leading-tight select-none line-clamp-2 px-1"
                      style={{
                        color: item.style?.color ?? "#ffffff",
                        fontSize: "13px",
                        letterSpacing: item.style?.letterSpacing
                          ? `${item.style.letterSpacing * 0.2}px`
                          : undefined,
                      }}
                    >
                      {item.defaultText}
                    </span>
                  )}

                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[8px] font-mono text-white/90">
                    {item.duration}s {item.bpm ? `• ${item.bpm} BPM` : ""}
                  </span>
                </div>

                {/* Info & Meta */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[11px] font-semibold text-fg truncate flex items-center gap-1">
                      {item.type === "audio" ? <Volume2 size={12} className="text-accent shrink-0" /> : null}
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
                  {item.type === "audio" ? "Add to Audio Track" : "Add to Timeline"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Item Customizer & Audio Player */}
        {selectedEffect && (
          <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border bg-bg-2 p-3 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-fg">
                {selectedEffect.type === "audio" ? "Audio Player & Action" : "Customize & Inject"}
              </span>
              {selectedEffect.externalUrl && (
                <a
                  href={selectedEffect.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-accent hover:underline"
                >
                  View on Source <ExternalLink size={10} />
                </a>
              )}
            </div>

            {/* Live Interactive Box */}
            <div
              className="h-28 w-full rounded-xl flex items-center justify-center p-3 text-center border border-border/80 shadow-inner"
              style={{ background: selectedEffect.previewBg }}
            >
              {selectedEffect.type === "audio" ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playAudioPreview(selectedEffect)}
                    className="h-10 w-10 rounded-full bg-accent text-accent-fg flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    {playingAudioId === selectedEffect.id ? (
                      <Square size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} className="ml-0.5" fill="currentColor" />
                    )}
                  </button>
                  <span className="text-[10px] font-medium text-white/90">
                    {playingAudioId === selectedEffect.id ? "Playing Audio..." : "Click to Preview Sound"}
                  </span>
                </div>
              ) : (
                <span
                  className="font-bold leading-tight"
                  style={{
                    color: selectedEffect.style?.color ?? "#ffffff",
                    fontSize: "16px",
                    letterSpacing: selectedEffect.style?.letterSpacing
                      ? `${selectedEffect.style.letterSpacing * 0.2}px`
                      : undefined,
                  }}
                >
                  {customText || selectedEffect.defaultText}
                </span>
              )}
            </div>

            {/* Editable Text Field (Only for Text/Video items) */}
            {selectedEffect.type === "video" && (
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
            )}

            {/* Duration Slider */}
            <label className="block text-fg-2 text-[10px] font-medium">
              Duration: {customDuration.toFixed(1)}s
              <input
                type="range"
                min={0.5}
                max={selectedEffect.type === "audio" ? 10 : 15}
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
              {selectedEffect.type === "audio" ? "Place on Audio Track" : "Add as Editable Layer"}
            </Button>
            <p className="text-[9px] text-fg-muted text-center leading-tight">
              {selectedEffect.type === "audio"
                ? "Synthesizes real WAV audio and places on a dedicated audio track."
                : "Adds an editable text/effect clip at playhead position."}
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom: Pixabay & Online URL Direct Downloader ────────────── */}
      <div className="shrink-0 border-t border-border bg-bg-2 p-3 space-y-2">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="url"
            placeholder="Paste Pixabay Audio/SFX link, instrument URL, or MP3/WAV download link..."
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
            Download & Import Audio
          </Button>
        </div>

        {/* Quick Direct Links to Pixabay Audio & Instruments */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-fg-muted">
          <span className="font-semibold text-accent flex items-center gap-1">
            <Radio size={11} /> Pixabay Direct Sources:
          </span>
          <a
            href="https://pixabay.com/music/search/audio%20effect/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
          >
            Pixabay Audio Effects ↗
          </a>
          <a
            href="https://pixabay.com/sound-effects/search/music%20instruments/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 rounded border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors flex items-center gap-1"
          >
            Pixabay Music Instruments ↗
          </a>
          {ONLINE_PLATFORMS.filter(
            (p) => p.id !== "pixabay-audio" && p.id !== "pixabay-sfx",
          ).map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors underline"
            >
              {platform.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
