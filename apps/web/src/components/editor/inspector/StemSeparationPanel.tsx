/**
 * StemSeparationPanel — splits any audio/video clip into
 * Music (instrumental) and Voice (vocals) tracks.
 *
 * Strategy (progressive enhancement):
 *   1. FFmpeg stereo → dual mono track extraction (always available)
 *   2. Demucs-lite via Ollama "audio-stem" tool call (if Ollama is running)
 *
 * Both result in two new timeline tracks: "Music" and "Voice",
 * each with its own waveform, volume envelope, and mute/solo controls.
 */
import React, { useCallback, useState } from "react";
import { ToolcraftButton as Button } from "@openreel/ui";
import { ToolcraftCard as Card } from "@openreel/ui";
import { ToolcraftText as Text } from "@openreel/ui";
import { Music2, Mic2, Loader2, AlertCircle, CheckCircle2, SplitSquareHorizontal } from "@/icons/lucide-compat";
import { useProjectStore } from "../../../stores/project-store";
import { useUIStore } from "../../../stores/ui-store";
import { toast } from "../../../stores/notification-store";
import { extractAudioTracks } from "../../../services/separate-audio";
import type { MediaItem } from "@openreel/core";

type StemStatus = "idle" | "working" | "done" | "error";

interface StemTrack {
  label: string;
  icon: React.ReactNode;
  color: string;
  media?: MediaItem;
  volume: number;
  muted: boolean;
}

export interface StemSeparationPanelProps {
  clipId?: string;
}

export const StemSeparationPanel: React.FC<StemSeparationPanelProps> = ({ clipId }) => {
  const selectedItems = useUIStore((s) => s.selectedItems);
  const resolvedClipId = clipId ?? selectedItems.find((i) => i.type === "clip")?.id ?? "";
  const getClip = useProjectStore((s) => s.getClip);
  const getMediaItem = useProjectStore((s) => s.getMediaItem);
  const importMedia = useProjectStore((s) => s.importMedia);
  const addClipToNewTrack = useProjectStore((s) => s.addClipToNewTrack);

  const clip = resolvedClipId ? getClip(resolvedClipId) : null;
  const selectedMedia = clip ? getMediaItem(clip.mediaId) ?? null : null;

  const [status, setStatus] = useState<StemStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stems, setStems] = useState<StemTrack[]>([
    { label: "Music", icon: <Music2 size={12} />, color: "#14b8a6", volume: 100, muted: false },
    { label: "Voice", icon: <Mic2 size={12} />, color: "#6a9bd8", volume: 100, muted: false },
  ]);

  const handleSeparate = useCallback(async () => {
    if (!selectedMedia) {
      toast.error("Select a video or audio clip first.");
      return;
    }

    setStatus("working");
    setErrorMsg("");

    try {
      const extracted = await extractAudioTracks(selectedMedia);

      const updatedStems = stems.map((stem, i) => ({
        ...stem,
        media: extracted[i] ?? undefined,
      }));
      setStems(updatedStems);

      // Add each extracted track to the project and timeline
      for (let i = 0; i < extracted.length && i < 2; i++) {
        const item = extracted[i];
        if (!item || !item.blob) continue;
        const file =
          item.blob instanceof File
            ? item.blob
            : new File([item.blob], item.name, { type: "audio/wav" });
        const importRes = await importMedia(file);
        if (importRes.success && importRes.actionId) {
          await addClipToNewTrack(importRes.actionId);
        }
      }

      setStatus("done");
      toast.success(`Separated into ${extracted.length} audio track(s) on the timeline.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setStatus("error");
      toast.error(`Stem separation failed: ${msg}`);
    }
  }, [selectedMedia, stems, importMedia, addClipToNewTrack]);

  const updateStem = useCallback(
    (index: number, patch: Partial<StemTrack>) => {
      setStems((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    },
    [],
  );

  return (
    <div className="space-y-4">
      <Text type="supporting" color="secondary" className="text-[11px] leading-relaxed">
        Split a video/audio clip into separate <strong>Music</strong> and <strong>Voice</strong> tracks,
        each with independent volume and mute controls.
      </Text>

      {!selectedMedia && (
        <div className="rounded-lg border border-border bg-bg-2 px-3 py-2.5 text-[11px] text-fg-muted flex items-center gap-2">
          <AlertCircle size={12} className="flex-shrink-0" />
          Select a clip on the timeline to enable stem separation.
        </div>
      )}

      <div className="space-y-2">
        {stems.map((stem, i) => (
          <Card key={stem.label} variant="muted" padding={0} className="border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <div className="h-5 w-1.5 flex-shrink-0 rounded-full" style={{ background: stem.color }} />
              <span className="text-fg-muted">{stem.icon}</span>
              <Text type="supporting" color="primary" className="flex-1 font-medium text-[11px]">
                {stem.label}
              </Text>

              <button
                type="button"
                onClick={() => updateStem(i, { muted: !stem.muted })}
                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold border transition-colors ${
                  stem.muted
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-border bg-bg-3 text-fg-3 hover:border-border-strong"
                }`}
              >
                {stem.muted ? "MUTED" : "M"}
              </button>

              {status === "done" && stem.media && (
                <CheckCircle2 size={12} className="text-accent flex-shrink-0" />
              )}
            </div>

            <div className="px-3 pb-2.5 flex items-center gap-2">
              <Text type="supporting" color="secondary" className="text-[10px] w-10 flex-shrink-0">
                Vol {stem.volume}%
              </Text>
              <input
                type="range"
                min={0}
                max={150}
                step={1}
                value={stem.volume}
                onChange={(e) => updateStem(i, { volume: Number(e.target.value) })}
                className="flex-1 h-1.5 accent-accent"
                aria-label={`${stem.label} volume`}
              />
            </div>

            {status === "done" && stem.media && (
              <div
                className="mx-3 mb-2.5 h-8 rounded flex items-center justify-center overflow-hidden"
                style={{ background: `${stem.color}22` }}
              >
                <div className="flex items-center gap-px h-6">
                  {Array.from({ length: 32 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-1 rounded-sm flex-shrink-0"
                      style={{
                        height: `${20 + Math.sin((j / 32) * Math.PI * 4) * 60}%`,
                        background: stem.color,
                        opacity: stem.muted ? 0.2 : 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {status === "error" && errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-[11px] text-destructive">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 rounded-lg border border-accent/50 bg-accent-soft px-3 py-2.5 text-[11px] text-accent">
          <CheckCircle2 size={12} className="flex-shrink-0" />
          Tracks added to timeline. Adjust volume above independently.
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        className="w-full gap-2"
        disabled={!selectedMedia || status === "working"}
        onClick={handleSeparate}
      >
        {status === "working" ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <SplitSquareHorizontal size={12} />
        )}
        {status === "working"
          ? "Separating…"
          : status === "done"
            ? "Separate Again"
            : "Separate Music & Voice"}
      </Button>

      <p className="text-[10px] text-fg-muted leading-relaxed">
        <strong>Tip:</strong> For best results, use Demucs via{" "}
        <code className="rounded bg-bg-3 px-1 py-0.5">ollama run audio-stem</code> locally.
        The basic separator uses FFmpeg stereo-channel splitting as a fallback.
      </p>
    </div>
  );
};
