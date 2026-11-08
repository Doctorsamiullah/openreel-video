export type DesignSizePreset =
  | "instagram-post"
  | "instagram-story"
  | "youtube-thumbnail"
  | "a4-flyer"
  | "presentation-16-9"
  | "medical-poster";

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
}

export const SIZE_PRESETS: Record<DesignSizePreset, CanvasDimensions> = {
  "instagram-post": { width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  "instagram-story": { width: 1080, height: 1920, label: "Story / Reel / TikTok (9:16)" },
  "youtube-thumbnail": { width: 1280, height: 720, label: "YouTube Thumbnail (16:9)" },
  "a4-flyer": { width: 1240, height: 1754, label: "A4 Flyer (Print 300DPI)" },
  "presentation-16-9": { width: 1920, height: 1080, label: "Presentation (16:9)" },
  "medical-poster": { width: 1080, height: 1620, label: "Medical Poster / Infographic (2:3)" },
};

export interface PhotoAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  tint: number; // -100 to 100
  blur: number; // 0 to 40 (px)
  sharpness: number; // 0 to 100
  vignette: number; // 0 to 100
}

export const DEFAULT_PHOTO_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  tint: 0,
  blur: 0,
  sharpness: 0,
  vignette: 0,
};

export type ShapeType = "rect" | "circle" | "pill" | "star" | "triangle" | "line";

export interface DesignElement {
  id: string;
  type: "text" | "shape" | "badge" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex?: number;
  locked?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  flipV?: boolean;

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fill?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
  letterSpacing?: number;

  // Shape specific
  shapeType?: ShapeType;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;

  // Image specific (Photoshop raster tools)
  src?: string;
  originalWidth?: number;
  originalHeight?: number;
  adjustments?: PhotoAdjustments;

  // Style Match
  styleMatch?: StyleMatchPreset;

  // Canva Animation
  animation?: ElementAnimationConfig;

  // Badge specific
  badgeLabel?: string;
  category?: string;
}

export type AnimationPreset =
  | "none"
  | "fade"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down"
  | "pop"
  | "rise"
  | "breathe"
  | "wipe"
  | "typewriter"
  | "bounce"
  | "pulse"
  | "heartbeat";

export interface ElementAnimationConfig {
  preset: AnimationPreset;
  duration: number; // in seconds (e.g. 1.2)
  delay: number; // in seconds (e.g. 0.2)
  speed?: number; // 0.5 to 2
}

export interface PageAnimationConfig {
  preset: "none" | "pan" | "fade" | "pop" | "wipe" | "rise" | "breathe" | "stomp";
  duration: number; // in seconds (e.g. 5.0)
  direction?: "left" | "right" | "up" | "down";
}

export type StyleMatchPreset =
  | "none"
  | "scrapbook"
  | "etching"
  | "duotone"
  | "retro-pop"
  | "cyberpunk";

export type EditImageTool =
  | "adjust"
  | "magic-layers"
  | "magic-eraser"
  | "upscale"
  | "bg-remover"
  | "image-to-video"
  | "bg-generator";

export interface DesignTemplate {
  id: string;
  name: string;
  category: "Medical" | "Retail" | "Healthcare" | "Education" | "Festival" | "Creator";
  size: DesignSizePreset;
  backgroundColor: string;
  elements: DesignElement[];
}

export interface BrandPalette {
  name: string;
  bg: string;
  primary: string;
  accent: string;
  secondary: string;
}

export const BRAND_PALETTES: BrandPalette[] = [
  { name: "Medical Clinical", bg: "#f0fdf4", primary: "#059669", accent: "#0284c7", secondary: "#ea580c" },
  { name: "Emergency Red/Navy", bg: "#0f172a", primary: "#e11d48", accent: "#facc15", secondary: "#38bdf8" },
  { name: "Emerald Pro", bg: "#0f172a", primary: "#10b981", accent: "#facc15", secondary: "#064e3b" },
  { name: "Royal Indigo", bg: "#1e1b4b", primary: "#6366f1", accent: "#38bdf8", secondary: "#312e81" },
  { name: "Sunset Amber", bg: "#431407", primary: "#ea580c", accent: "#fde047", secondary: "#9a3412" },
  { name: "Rose Blush", bg: "#500724", primary: "#db2777", accent: "#fbcfe8", secondary: "#831843" },
  { name: "Clean Minimal", bg: "#ffffff", primary: "#0f172a", accent: "#3b82f6", secondary: "#e2e8f0" },
];
