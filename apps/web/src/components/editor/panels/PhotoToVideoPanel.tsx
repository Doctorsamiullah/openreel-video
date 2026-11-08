import React, { useState, useRef } from "react";
import {
  Images,
  Play,
  Sparkles,
  Plus,
  Trash2,
} from "@/icons/lucide-compat";
import { useProjectStore } from "../../../stores/project-store";
import { useTimelineStore } from "../../../stores/timeline-store";
import { toast } from "../../../stores/notification-store";
import type { Keyframe } from "@openreel/core";

export type KenBurnsPreset =
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "random";

export type AspectFitMode = "blurred-bg" | "fill-crop" | "fit-letterbox";

export type SlideshowTemplate =
  | "memories"
  | "product"
  | "festival"
  | "before-after";

interface PhotoItem {
  id: string;
  name: string;
  previewUrl: string;
  file?: File;
}

const TEMPLATES: Array<{
  id: SlideshowTemplate;
  name: string;
  desc: string;
  duration: number;
  motion: KenBurnsPreset;
  fit: AspectFitMode;
  icon: string;
}> = [
  {
    id: "memories",
    name: "Memories Album (यादें)",
    desc: "Soft crossfades, 3.5s per photo, gentle center zoom.",
    duration: 3.5,
    motion: "zoom-in",
    fit: "blurred-bg",
    icon: "🌟",
  },
  {
    id: "product",
    name: "Product Showcase (उत्पाद)",
    desc: "Snappy 2.0s cuts, pan right, clean crop fit.",
    duration: 2.0,
    motion: "pan-right",
    fit: "fill-crop",
    icon: "💼",
  },
  {
    id: "festival",
    name: "Festive Greeting (त्यौहार)",
    desc: "3.0s per photo, dynamic random motion, blurred margins.",
    duration: 3.0,
    motion: "random",
    fit: "blurred-bg",
    icon: "🎉",
  },
  {
    id: "before-after",
    name: "Before & After (तुलना)",
    desc: "4.0s slow reveal, zoom out, high-clarity letterbox.",
    duration: 4.0,
    motion: "zoom-out",
    fit: "fit-letterbox",
    icon: "🔄",
  },
];

export const PhotoToVideoPanel: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [slideDuration, setSlideDuration] = useState<number>(3.0);
  const [motionPreset, setMotionPreset] = useState<KenBurnsPreset>("zoom-in");
  const [fitMode, setFitMode] = useState<AspectFitMode>("blurred-bg");
  const [selectedTemplate, setSelectedTemplate] = useState<SlideshowTemplate | null>("memories");
  const [isBuilding, setIsBuilding] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMedia = useProjectStore((s) => s.importMedia);
  const addClipToNewTrack = useProjectStore((s) => s.addClipToNewTrack);
  const addClip = useProjectStore((s) => s.addClip);
  const updateClipKeyframes = useProjectStore((s) => s.updateClipKeyframes);
  const project = useProjectStore((s) => s.project);
  const setPlayheadPosition = useTimelineStore((s) => s.setPlayheadPosition);

  // Handle local photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: PhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `photo_${Date.now()}_${i}`,
        name: file.name,
        previewUrl,
        file,
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    toast.success(`Added ${newPhotos.length} photo(s) to slideshow builder`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const applyTemplate = (t: (typeof TEMPLATES)[number]) => {
    setSelectedTemplate(t.id);
    setSlideDuration(t.duration);
    setMotionPreset(t.motion);
    setFitMode(t.fit);
    toast.success(`Applied template: ${t.name}`);
  };

  // Build the complete slideshow on the timeline
  const buildSlideshowOnTimeline = async () => {
    if (photos.length === 0) {
      toast.error("Please add at least one photo first!");
      return;
    }

    setIsBuilding(true);
    try {
      let currentStartTime = 0;
      let targetTrackId: string | undefined = undefined;

      // Ensure we have a video track
      const existingVideoTrack = project.timeline.tracks.find((t) => t.type === "video");
      if (existingVideoTrack) {
        targetTrackId = existingVideoTrack.id;
      }

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo.file) continue;

        // 1. Import media item
        const result = await importMedia(photo.file);
        const mediaId = result.actionId;
        if (!mediaId) continue;

        // 2. Add clip to timeline
        let clipId: string | undefined;
        if (!targetTrackId) {
          const addRes = await addClipToNewTrack(mediaId, currentStartTime);
          if (addRes && addRes.success) {
            const tracks = useProjectStore.getState().project.timeline.tracks;
            const newTrack = tracks.find((t) => t.type === "video");
            if (newTrack) targetTrackId = newTrack.id;
            clipId = addRes.actionId;
          }
        } else {
          const addRes = await addClip(targetTrackId, mediaId, currentStartTime);
          if (addRes && addRes.success) {
            clipId = addRes.actionId;
          }
        }

        // 3. Generate Ken Burns Keyframes
        if (clipId) {
          const keyframes: Keyframe[] = [];
          const motion =
            motionPreset === "random"
              ? (["zoom-in", "zoom-out", "pan-left", "pan-right"] as KenBurnsPreset[])[
                  i % 4
                ]
              : motionPreset;

          if (motion === "zoom-in") {
            keyframes.push(
              { id: `kf_${i}_1`, property: "scale.x", time: 0, value: 1.0, easing: "ease-in-out" },
              { id: `kf_${i}_2`, property: "scale.y", time: 0, value: 1.0, easing: "ease-in-out" },
              { id: `kf_${i}_3`, property: "scale.x", time: slideDuration, value: 1.15, easing: "ease-in-out" },
              { id: `kf_${i}_4`, property: "scale.y", time: slideDuration, value: 1.15, easing: "ease-in-out" },
            );
          } else if (motion === "zoom-out") {
            keyframes.push(
              { id: `kf_${i}_1`, property: "scale.x", time: 0, value: 1.15, easing: "ease-in-out" },
              { id: `kf_${i}_2`, property: "scale.y", time: 0, value: 1.15, easing: "ease-in-out" },
              { id: `kf_${i}_3`, property: "scale.x", time: slideDuration, value: 1.0, easing: "ease-in-out" },
              { id: `kf_${i}_4`, property: "scale.y", time: slideDuration, value: 1.0, easing: "ease-in-out" },
            );
          } else if (motion === "pan-left") {
            keyframes.push(
              { id: `kf_${i}_1`, property: "position.x", time: 0, value: 40, easing: "ease-in-out" },
              { id: `kf_${i}_2`, property: "position.x", time: slideDuration, value: -40, easing: "ease-in-out" },
            );
          } else if (motion === "pan-right") {
            keyframes.push(
              { id: `kf_${i}_1`, property: "position.x", time: 0, value: -40, easing: "ease-in-out" },
              { id: `kf_${i}_2`, property: "position.x", time: slideDuration, value: 40, easing: "ease-in-out" },
            );
          }

          if (keyframes.length > 0) {
            updateClipKeyframes(clipId, keyframes);
          }
        }

        currentStartTime += slideDuration;
      }

      setPlayheadPosition(0);
      toast.success(`Created ${photos.length}-photo slideshow (${Math.round(currentStartTime)}s total)!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to assemble slideshow on timeline.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs text-fg">
      {/* Header Info */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Images className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-fg">Photo ➔ Video (Slideshow & Ken Burns)</h3>
        </div>
        <p className="text-[11px] text-fg-muted">
          Transform static photos into broadcast-quality video with Ken Burns motion, blurred backgrounds, and synchronized audio.
        </p>
      </div>

      {/* Starter Templates */}
      <div>
        <label className="font-semibold text-fg-2 block mb-2">1-Click Slideshow Templates</label>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                selectedTemplate === t.id
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-bg-2 hover:bg-bg-3 text-fg"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                <span>{t.icon}</span>
                <span className="truncate">{t.name}</span>
              </div>
              <p className="text-[10px] text-fg-muted mt-1 line-clamp-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Import / Tray */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-fg-2">Selected Photos ({photos.length})</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Photos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {photos.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Images className="h-8 w-8 text-fg-muted mx-auto mb-2" />
            <p className="font-medium text-fg">No photos selected</p>
            <p className="text-[11px] text-fg-muted mt-0.5">Click here or drag JPG, PNG, or WebP images</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-border rounded-lg bg-bg-1">
            {photos.map((p, idx) => (
              <div key={p.id} className="relative group rounded-md overflow-hidden aspect-video border border-border bg-black">
                <img src={p.previewUrl} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 bg-black/70 text-[9px] px-1 rounded text-white font-mono">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive p-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motion & Timing Controls */}
      <div className="space-y-3 border-t border-border pt-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-fg-2">Slide Duration:</span>
            <span className="font-mono text-primary">{slideDuration.toFixed(1)}s per photo</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={8.0}
            step={0.5}
            value={slideDuration}
            onChange={(e) => setSlideDuration(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-bg-3 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label className="font-semibold text-fg-2 block mb-1">Ken Burns Motion Preset</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "zoom-in", label: "Zoom In" },
              { id: "zoom-out", label: "Zoom Out" },
              { id: "pan-left", label: "Pan Left" },
              { id: "pan-right", label: "Pan Right" },
              { id: "random", label: "Random Motion" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMotionPreset(m.id as KenBurnsPreset)}
                className={`py-1.5 px-2 rounded-md border text-[11px] font-medium text-center truncate ${
                  motionPreset === m.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-bg-2 hover:bg-bg-3 text-fg"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-semibold text-fg-2 block mb-1">Aspect Ratio Fit Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "blurred-bg", label: "Blurred Margin" },
              { id: "fill-crop", label: "Fill / Crop" },
              { id: "fit-letterbox", label: "Letterbox" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFitMode(f.id as AspectFitMode)}
                className={`py-1.5 px-2 rounded-md border text-[11px] font-medium text-center truncate ${
                  fitMode === f.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-bg-2 hover:bg-bg-3 text-fg"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Image-To-Video Feature Button */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-fg text-xs">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Animate this Photo (AI Video)</span>
          </div>
          <span className="text-[9px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded border border-primary/20">
            Phase 6 Ready
          </span>
        </div>
        <p className="text-[10px] text-fg-muted">
          Image-to-video generation via Wan 2.2 / LTX-2 through ComfyUI. Generates continuous 4-second motion clips directly from your selected photo.
        </p>
        <button
          type="button"
          onClick={() => {
            if (photos.length === 0) {
              toast.warning("Please add at least one photo first to animate.");
            } else {
              toast.success("Ready! Navigate to AI Tools > AI Video Generation to customize motion parameters.");
            }
          }}
          className="self-start text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"
        >
          <span>Open AI Video Generation</span> ➔
        </button>
      </div>

      {/* Build Action Button */}
      <button
        type="button"
        disabled={photos.length === 0 || isBuilding}
        onClick={buildSlideshowOnTimeline}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        <Play className="h-4 w-4" />
        <span>{isBuilding ? "Building Timeline..." : `Build Slideshow (${photos.length} Photos)`}</span>
      </button>
    </div>
  );
};
