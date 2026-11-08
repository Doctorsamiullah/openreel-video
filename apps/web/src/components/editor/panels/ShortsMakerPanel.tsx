import React, { useState, useMemo } from "react";
import {
  Smartphone,
  Sparkles,
  FileCode,
  Download,
  Flame,
} from "@/icons/lucide-compat";
import { ToolcraftButton as Button } from "@openreel/ui";
import { ToolcraftText as Text } from "@openreel/ui";
import { useProjectStore } from "../../../stores/project-store";
import { useTimelineStore } from "../../../stores/timeline-store";
import { toast } from "../../../stores/notification-store";
import {
  detectShortHighlights,
  type ShortCandidate,
  type SubtitleSegment,
} from "../../../services/shorts/shorts-detector";
import {
  getHighlightStyleProps,
  type HighlightCaptionStyle,
} from "../../../services/shorts/word-highlight-captions";
import {
  serializeTimelineOtio,
  timelineToFcpxml,
  timelineToEdl,
  downloadBlob,
} from "@openreel/core";

export type ReframeMode = "center-crop" | "blurred-background" | "split-screen";

export const ShortsMakerPanel: React.FC = () => {
  const project = useProjectStore((s) => s.project);
  const updateSettings = useProjectStore((s) => s.updateSettings);
  const seekTo = useTimelineStore((s) => s.seekTo);

  const [candidates, setCandidates] = useState<ShortCandidate[]>([]);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [reframeMode, setReframeMode] = useState<ReframeMode>("center-crop");
  const [enableDynamicCaptions, setEnableDynamicCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState<HighlightCaptionStyle>("viral-yellow");

  // Extract subtitle segments or timeline clip intervals from project
  const subtitleSegments: SubtitleSegment[] = useMemo(() => {
    if (!project?.timeline?.subtitles || project.timeline.subtitles.length === 0) {
      // Fallback: derive from timeline clips
      const clips = project?.timeline?.tracks?.flatMap((t) => t.clips) || [];
      return clips.map((c) => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.startTime + c.duration,
        text: `Scene ${c.id}`,
      }));
    }
    return project.timeline.subtitles.map((s) => ({
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      text: s.text,
    }));
  }, [project]);

  // Handle detection of viral shorts
  const handleDetectShorts = () => {
    setIsScanning(true);
    try {
      const results = detectShortHighlights(subtitleSegments, {
        minDuration: 15,
        maxDuration: 60,
        targetCount: 3,
      });
      setCandidates(results);
      if (results.length > 0) {
        setSelectedShortId(results[0].id);
        toast.success("Shorts detected!", `Identified ${results.length} viral highlight candidates.`);
      }
    } catch (e) {
      toast.error("Analysis failed", e instanceof Error ? e.message : "Could not analyze highlights.");
    } finally {
      setIsScanning(false);
    }
  };

  const selectedShort = useMemo(
    () => candidates.find((c) => c.id === selectedShortId) || candidates[0] || null,
    [candidates, selectedShortId]
  );

  // Apply 9:16 vertical canvas reframe (1080x1920)
  const handleApplyVerticalReframe = async () => {
    try {
      await updateSettings({
        width: 1080,
        height: 1920,
      });
      toast.success(
        "Canvas reframed to 9:16",
        `Set to 1080x1920 vertical (${reframeMode.replace("-", " ")}) for Shorts/TikTok.`
      );
    } catch {
      toast.error("Reframe error", "Failed to update project canvas dimensions.");
    }
  };

  // Jump playhead to short start
  const handlePreviewShort = (cand: ShortCandidate) => {
    setSelectedShortId(cand.id);
    seekTo(cand.startTime);
  };

  // Export handlers for interchange
  const handleExportOtio = () => {
    if (!project?.timeline) {
      toast.error("No timeline", "Current project has no timeline to export.");
      return;
    }
    const otioStr = serializeTimelineOtio(project.timeline, {
      name: `${project.name || "OpenReel"}_Shorts`,
      fps: project.settings?.frameRate || 30,
    });
    const blob = new Blob([otioStr], { type: "application/json" });
    downloadBlob(blob, `${project.name || "project"}_interchange.otio`);
    toast.success("OTIO Exported", "Compatible with Kdenlive, DaVinci Resolve, and Premiere Pro.");
  };

  const handleExportFcpxml = () => {
    if (!project?.timeline) {
      toast.error("No timeline", "Current project has no timeline to export.");
      return;
    }
    const xmlStr = timelineToFcpxml(project.timeline, {
      name: `${project.name || "OpenReel"}_Shorts`,
      fps: project.settings?.frameRate || 30,
      width: 1080,
      height: 1920,
    });
    const blob = new Blob([xmlStr], { type: "application/xml" });
    downloadBlob(blob, `${project.name || "project"}_finalcut.fcpxml`);
    toast.success("FCPXML Exported", "Ready for DaVinci Resolve, Final Cut Pro, and Kdenlive.");
  };

  const handleExportEdl = () => {
    if (!project?.timeline) {
      toast.error("No timeline", "Current project has no timeline to export.");
      return;
    }
    const edlStr = timelineToEdl(project.timeline, {
      title: `${project.name || "OPENREEL"}_EDL`,
      fps: project.settings?.frameRate || 30,
    });
    const blob = new Blob([edlStr], { type: "text/plain" });
    downloadBlob(blob, `${project.name || "project"}.edl`);
    toast.success("EDL Exported", "Standard CMX 3600 list exported.");
  };

  const activeStyleProps = getHighlightStyleProps(captionStyle);

  return (
    <div className="space-y-5 text-text-primary">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-pink-400" aria-hidden />
            <Text type="label" weight="bold" className="text-sm">
              Shorts Maker & Interchange
            </Text>
          </div>
          <Text type="supporting" color="secondary" className="text-xs mt-0.5">
            Auto-detect hooks, 9:16 reframe, word-highlight captions & NLE handoff
          </Text>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">
          9:16 Vertical
        </span>
      </div>

      {/* Detection trigger */}
      <div className="space-y-2">
        <Button
          label={isScanning ? "Scanning Timeline..." : "Detect Viral Highlight Hooks"}
          icon={<Sparkles size={14} className={isScanning ? "animate-spin" : ""} aria-hidden />}
          onClick={handleDetectShorts}
          variant="primary"
          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white"
          disabled={isScanning}
        />
      </div>

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div className="space-y-2">
          <Text type="supporting" weight="bold" color="secondary" className="text-[11px] uppercase tracking-wider">
            Detected Highlight Candidates ({candidates.length})
          </Text>
          <div className="space-y-2">
            {candidates.map((cand) => {
              const isSelected = selectedShort?.id === cand.id;
              return (
                <div
                  key={cand.id}
                  onClick={() => handlePreviewShort(cand)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? "border-pink-500/60 bg-pink-500/10 ring-1 ring-pink-500/30"
                      : "border-border bg-background-secondary hover:bg-background-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Text type="label" weight="bold" className="text-xs truncate">
                      {cand.headline}
                    </Text>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-400">
                        <Flame size={12} className="text-amber-400" />
                        {cand.viralityScore}%
                      </span>
                      <span className="text-[10px] text-text-muted bg-background-elevated px-1.5 py-0.5 rounded">
                        {cand.duration}s
                      </span>
                    </div>
                  </div>
                  <Text type="supporting" color="secondary" className="text-[11px] line-clamp-1 italic">
                    "{cand.hookText}"
                  </Text>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[10px] text-text-muted">
                    <span>In: {cand.startTime}s • Out: {cand.endTime}s</span>
                    <span className="text-pink-400">{cand.reason}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9:16 Reframe Controls */}
      <div className="p-3 rounded-lg border border-border bg-background-secondary space-y-3">
        <div className="flex items-center justify-between">
          <Text type="label" weight="bold" className="text-xs">
            9:16 Canvas Reframing
          </Text>
          <span className="text-[10px] text-text-muted">1080 × 1920 px</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setReframeMode("center-crop")}
            className={`py-1.5 px-2 text-xs rounded border transition-colors ${
              reframeMode === "center-crop"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            Center Crop
          </button>
          <button
            type="button"
            onClick={() => setReframeMode("blurred-background")}
            className={`py-1.5 px-2 text-xs rounded border transition-colors ${
              reframeMode === "blurred-background"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            Blurred Fit
          </button>
          <button
            type="button"
            onClick={() => setReframeMode("split-screen")}
            className={`py-1.5 px-2 text-xs rounded border transition-colors ${
              reframeMode === "split-screen"
                ? "border-primary bg-primary/10 text-primary font-semibold"
                : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            Split Screen
          </button>
        </div>
        <Button
          label="Apply 9:16 Vertical Preset to Canvas"
          icon={<Smartphone size={13} aria-hidden />}
          onClick={handleApplyVerticalReframe}
          variant="secondary"
          className="w-full text-xs"
        />
      </div>

      {/* Dynamic Word-Highlight Captions */}
      <div className="p-3 rounded-lg border border-border bg-background-secondary space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Text type="label" weight="bold" className="text-xs">
              Word-Highlight Captions
            </Text>
            <Text type="supporting" color="secondary" className="text-[10px]">
              TikTok/Shorts style animated word emphasis
            </Text>
          </div>
          <input
            type="checkbox"
            checked={enableDynamicCaptions}
            onChange={(e) => setEnableDynamicCaptions(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary/40 bg-background-tertiary border-border cursor-pointer"
          />
        </div>

        {enableDynamicCaptions && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCaptionStyle("viral-yellow")}
                className={`py-1 px-2 text-[11px] rounded border transition-colors ${
                  captionStyle === "viral-yellow"
                    ? "border-amber-400 bg-amber-400/10 text-amber-400 font-bold"
                    : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                Viral Yellow
              </button>
              <button
                type="button"
                onClick={() => setCaptionStyle("cyber-cyan")}
                className={`py-1 px-2 text-[11px] rounded border transition-colors ${
                  captionStyle === "cyber-cyan"
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400 font-bold"
                    : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                Cyber Cyan
              </button>
              <button
                type="button"
                onClick={() => setCaptionStyle("clean-minimal")}
                className={`py-1 px-2 text-[11px] rounded border transition-colors ${
                  captionStyle === "clean-minimal"
                    ? "border-white bg-white/10 text-white font-bold"
                    : "border-border bg-background-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                Clean White
              </button>
            </div>

            {/* Live Caption Preview Box */}
            <div
              className="p-3 rounded flex items-center justify-center text-center font-black text-sm tracking-wide uppercase mt-2 select-none"
              style={{ backgroundColor: activeStyleProps.pillBg }}
            >
              <span>THIS IS A </span>
              <span style={{ color: activeStyleProps.highlightColor }} className="mx-1">
                VIRAL HOOK
              </span>
              <span> MOMENT</span>
            </div>
          </div>
        )}
      </div>

      {/* Project Interchange & NLE Handoff */}
      <div className="p-3 rounded-lg border border-border bg-background-secondary space-y-3">
        <div className="flex items-center gap-2">
          <FileCode size={15} className="text-cyan-400" aria-hidden />
          <Text type="label" weight="bold" className="text-xs">
            NLE Interchange Handoff
          </Text>
        </div>
        <Text type="supporting" color="secondary" className="text-[11px]">
          Transfer this cut to external NLEs without losing track alignment or edits:
        </Text>
        <div className="grid grid-cols-3 gap-2">
          <Button
            label="OTIO (.otio)"
            icon={<Download size={12} aria-hidden />}
            onClick={handleExportOtio}
            variant="secondary"
            className="w-full text-[11px]"
            title="OpenTimelineIO for Kdenlive, DaVinci Resolve, Premiere"
          />
          <Button
            label="FCPXML (.fcpxml)"
            icon={<Download size={12} aria-hidden />}
            onClick={handleExportFcpxml}
            variant="secondary"
            className="w-full text-[11px]"
            title="Final Cut Pro XML for Resolve, FCP, Premiere, Kdenlive"
          />
          <Button
            label="EDL (.edl)"
            icon={<Download size={12} aria-hidden />}
            onClick={handleExportEdl}
            variant="secondary"
            className="w-full text-[11px]"
            title="CMX 3600 standard Edit Decision List"
          />
        </div>
      </div>
    </div>
  );
};
