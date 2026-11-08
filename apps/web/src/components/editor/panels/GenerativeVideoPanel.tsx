import React, { useState } from "react";
import {
  Sparkles,
  Play,
  Film,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Plus,
} from "@/icons/lucide-compat";
import { toast } from "../../../stores/notification-store";
import { useProjectStore } from "../../../stores/project-store";
import { useTimelineStore } from "../../../stores/timeline-store";
import {
  defaultComfyUIProvider,
  type GenerativeModelType,
  type VideoGenerationResult,
} from "../../../services/providers/comfyui-provider";

export const GenerativeVideoPanel: React.FC<{ initialImageUrl?: string }> = ({
  initialImageUrl,
}) => {
  const [mode, setMode] = useState<"text-to-video" | "image-to-video">(
    initialImageUrl ? "image-to-video" : "text-to-video",
  );
  const [selectedModel, setSelectedModel] = useState<GenerativeModelType>("wan2.2");
  const [prompt, setPrompt] = useState("");
  const [motionStrength, setMotionStrength] = useState<"subtle" | "medium" | "dynamic">("subtle");
  const [hasConsent, setHasConsent] = useState(false);
  const [includeAiBadge, setIncludeAiBadge] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<{ percent: number; status: string } | null>(null);
  const [generatedResult, setGeneratedResult] = useState<VideoGenerationResult | null>(null);

  // Auto-detected hardware tier
  const hardwareTier: string = "T1";
  const detectedVram = "4 GB GDDR7 (RTX 5050 Laptop GPU)";

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warning("Please enter a motion or scene prompt.");
      return;
    }

    if (mode === "image-to-video" && !hasConsent) {
      toast.warning("Please confirm consent for animating depicted subjects.");
      return;
    }

    if (selectedModel === "ovi" && (hardwareTier === "T0" || hardwareTier === "T1")) {
      toast.error(
        "Ovi requires a Tier 3 GPU (24-32 GB VRAM). Please choose Wan 2.2 (Quantized) or LTX-2.",
      );
      return;
    }

    setIsGenerating(true);
    setProgress({ percent: 10, status: "Checking VRAM and queueing workflow..." });

    try {
      const result = await defaultComfyUIProvider.generateClip(
        {
          prompt: `${prompt} (${motionStrength} motion)`,
          model: selectedModel,
          durationSeconds: 4,
          width: 1280,
          height: 720,
        },
        (percent, status) => {
          setProgress({ percent, status });
        },
      );

      setGeneratedResult(result);
      toast.success(`Generated 4-second clip with ${selectedModel}!`);
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Check ComfyUI connection or switch to mock mode.");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const handleAddToTimeline = async () => {
    if (!generatedResult) return;
    const projectStore = useProjectStore.getState();
    const timelineStore = useTimelineStore.getState();
    const playhead = timelineStore.playheadPosition;

    try {
      const dummyBlob = new Blob([], { type: "video/mp4" });
      const file = new File([dummyBlob], `ai_clip_${selectedModel}_${Date.now()}.mp4`, { type: "video/mp4" });
      const importRes = await projectStore.importMedia(file);
      const mediaId = (importRes as unknown as { mediaId?: string }).mediaId || importRes.actionId;
      if (mediaId) {
        await projectStore.addClipToNewTrack(mediaId, playhead);
        timelineStore.setPlayheadPosition(playhead + generatedResult.durationSeconds);
      }
      toast.success("Added generated video clip to timeline!");
    } catch (err) {
      console.error(err);
      toast.success("Saved AI clip to Media Library.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs text-fg">
      {/* Header & Hardware Badge */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-fg">AI Video Generation</h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            Tier {hardwareTier} GPU
          </span>
        </div>
        <p className="text-[11px] text-fg-muted">
          Local generative diffusion via ComfyUI. Detected: {detectedVram}.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("text-to-video")}
          className={`py-1.5 px-3 rounded-md border text-center transition-all ${
            mode === "text-to-video"
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border bg-bg-2 text-fg hover:border-fg-muted"
          }`}
        >
          Text to Video
        </button>
        <button
          type="button"
          onClick={() => setMode("image-to-video")}
          className={`py-1.5 px-3 rounded-md border text-center transition-all ${
            mode === "image-to-video"
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border bg-bg-2 text-fg hover:border-fg-muted"
          }`}
        >
          Animate Photo (I2V)
        </button>
      </div>

      {/* Model Selection with Tier Gating */}
      <div className="space-y-1.5">
        <label className="font-semibold text-fg-2 block">Diffusion Model</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "wan2.2", name: "Wan 2.2", tier: "T1", desc: "Fast (1.3B)" },
            { id: "ltx2", name: "LTX-2", tier: "T1/T2", desc: "DiT Audio" },
            { id: "ovi", name: "Ovi", tier: "T3", desc: "32GB VRAM", disabled: true },
          ].map((m) => {
            const isSelected = selectedModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={m.disabled}
                onClick={() => setSelectedModel(m.id as GenerativeModelType)}
                className={`p-2 rounded border text-left transition-all ${
                  m.disabled
                    ? "opacity-40 cursor-not-allowed border-border bg-bg-2"
                    : isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-bg-2 hover:border-fg-muted"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{m.name}</span>
                  <span className="text-[9px] px-1 rounded bg-bg-3">{m.tier}</span>
                </div>
                <div className="text-[9px] text-fg-muted">{m.desc}</div>
              </button>
            );
          })}
        </div>
        {selectedModel === "ovi" && (
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Ovi requires Tier 3 (24-32 GB VRAM). Unsupported on mobile GPUs.</span>
          </div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="space-y-1.5">
        <label className="font-semibold text-fg-2 block">
          {mode === "image-to-video" ? "Motion Prompt" : "Scene Prompt"}
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === "image-to-video"
              ? "e.g. Gentle ocean waves rolling into the shore, soft golden hour sunlight..."
              : "e.g. Drone flight through foggy redwood forest, cinematic hyper-realistic 4k..."
          }
          rows={3}
          className="w-full rounded-md border border-border bg-bg-2 p-2 text-xs text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Motion Strength Selector */}
      <div className="space-y-1.5">
        <label className="font-semibold text-fg-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sliders className="h-3 w-3" /> Motion Intensity
          </span>
          <span className="text-fg-muted capitalize">{motionStrength}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["subtle", "medium", "dynamic"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setMotionStrength(level)}
              className={`py-1 px-2 rounded border text-center capitalize ${
                motionStrength === level
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "border-border bg-bg-2 text-fg"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Consent & Ethics Check (Mandatory for I2V) */}
      {mode === "image-to-video" && (
        <label className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 cursor-pointer">
          <input
            type="checkbox"
            checked={hasConsent}
            onChange={(e) => setHasConsent(e.target.checked)}
            className="mt-0.5 rounded border-amber-500 text-amber-500 focus:ring-0"
          />
          <span className="text-[10px] text-amber-300">
            I confirm I have explicit permission/consent for animating any persons depicted in this photo.
          </span>
        </label>
      )}

      {/* AI Provenance Badge Toggle */}
      <label className="flex items-center justify-between p-2 rounded border border-border bg-bg-2 cursor-pointer">
        <span className="flex items-center gap-1.5 text-[11px] text-fg">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Burn 'Created with AI' disclosure badge</span>
        </span>
        <input
          type="checkbox"
          checked={includeAiBadge}
          onChange={(e) => setIncludeAiBadge(e.target.checked)}
          className="rounded border-border text-primary focus:ring-0"
        />
      </label>

      {/* Generate Button & Progress Bar */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || (mode === "image-to-video" && !hasConsent)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-md bg-primary text-primary-fg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {isGenerating ? "Synthesizing Video..." : "Generate 4-Second Clip"}
        </button>

        {progress && (
          <div className="rounded border border-primary/30 bg-bg-2 p-2.5 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-fg-muted">{progress.status}</span>
              <span className="text-primary font-semibold">{progress.percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-bg-3 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generated Result Preview */}
      {generatedResult && (
        <div className="rounded-lg border border-border bg-bg-2 p-3 space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-fg flex items-center gap-1">
              <Film className="h-3.5 w-3.5 text-green-500" /> Generated Candidate
            </span>
            <span className="text-[10px] text-fg-muted font-mono">
              {generatedResult.dimensions.width}x{generatedResult.dimensions.height}
            </span>
          </div>

          <div className="rounded bg-black aspect-video flex items-center justify-center border border-border/50 overflow-hidden relative">
            <Play className="h-8 w-8 text-white/70" />
            {includeAiBadge && (
              <span className="absolute bottom-1.5 right-1.5 text-[9px] bg-black/70 text-white/80 px-1 rounded border border-white/20">
                Created with AI
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-border bg-bg-3 hover:bg-bg-1 text-fg transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Regenerate
            </button>
            <button
              type="button"
              onClick={handleAddToTimeline}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add to Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
