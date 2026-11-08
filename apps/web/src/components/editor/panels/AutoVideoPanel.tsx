import React, { useState } from "react";
import {
  Sparkles,
  Play,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Film,
  Search,
  MessageSquare,
  Clock,
} from "@/icons/lucide-compat";
import { toast } from "../../../stores/notification-store";
import {
  OllamaScriptProvider,
  defaultOllamaScriptProvider,
  type GeneratedVideoScript,
} from "../../../services/providers/ollama-script-provider";
import {
  AutoVideoPipeline,
  type SelfCheckReport,
} from "../../../services/auto-video-pipeline";

export const AutoVideoPanel: React.FC = () => {
  const [brief, setBrief] = useState("");
  const [duration, setDuration] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const [script, setScript] = useState<GeneratedVideoScript | null>(null);
  const [report, setReport] = useState<SelfCheckReport | null>(null);
  const [openMontageJson, setOpenMontageJson] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);

  const handleGenerateScript = async () => {
    if (!brief.trim()) {
      toast.warning("Please enter a video idea or brief first.");
      return;
    }

    setIsGenerating(true);
    try {
      const generated = await defaultOllamaScriptProvider.generateVideoScript(
        brief,
        duration,
      );
      setScript(generated);
      const selfCheck = AutoVideoPipeline.generateSelfCheckReport(generated);
      setReport(selfCheck);
      toast.success(`Generated script with ${generated.scenes.length} scenes!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate script. Check if local Ollama is active or use mock mode.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportOpenMontage = () => {
    try {
      const parsed = JSON.parse(openMontageJson);
      const provider = new OllamaScriptProvider();
      const imported = provider.importOpenMontage(parsed);
      setScript(imported);
      const selfCheck = AutoVideoPipeline.generateSelfCheckReport(imported);
      setReport(selfCheck);
      setShowJsonImport(false);
      setOpenMontageJson("");
      toast.success(`Imported OpenMontage project: "${imported.title}"`);
    } catch {
      toast.error("Invalid JSON format for OpenMontage project.");
    }
  };

  const handleAssembleTimeline = async () => {
    if (!script) return;
    setIsAssembling(true);
    try {
      const result = await AutoVideoPipeline.assembleTimeline(script);
      if (result.success) {
        toast.success(`Assembled "${result.scriptTitle}" onto timeline with captions!`);
      } else {
        toast.error(result.error || "Failed to assemble timeline.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error assembling timeline.");
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 text-xs text-fg">
      {/* Header Banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-fg">Auto Video (Idea ➔ Timeline)</h3>
        </div>
        <p className="text-[11px] text-fg-muted">
          Transform a one-sentence idea into a structured draft with scenes, stock footage keywords, narration, and captions.
        </p>
      </div>

      {/* Input Section */}
      <div className="space-y-3">
        <div>
          <label className="font-semibold text-fg-2 block mb-1">Video Idea or Brief</label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="e.g. 3 simple steps to start a morning meditation habit..."
            rows={3}
            className="w-full rounded-md border border-border bg-bg-2 p-2 text-xs text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Duration Selection */}
        <div>
          <label className="font-semibold text-fg-2 block mb-1">Target Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "15s (Shorts)", value: 15 },
              { label: "30s (Promo)", value: 30 },
              { label: "60s (Deep Dive)", value: 60 },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDuration(option.value)}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  duration === option.value
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border bg-bg-2 text-fg hover:border-fg-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={isGenerating || !brief.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-primary text-primary-fg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isGenerating ? "Generating Script..." : "Generate Script"}
          </button>

          <button
            type="button"
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-md border border-border bg-bg-2 hover:bg-bg-3 text-fg transition-colors"
            title="Import OpenMontage Project"
          >
            <FileCode className="h-3.5 w-3.5" />
            Import
          </button>
        </div>

        {/* JSON Import Dialog */}
        {showJsonImport && (
          <div className="rounded border border-border bg-bg-2 p-3 space-y-2 mt-2">
            <h4 className="font-semibold text-fg">Import from OpenMontage</h4>
            <p className="text-[10px] text-fg-muted">Paste your OpenMontage project JSON below to convert into scenes.</p>
            <textarea
              value={openMontageJson}
              onChange={(e) => setOpenMontageJson(e.target.value)}
              placeholder='{ "title": "My Video", "scenes": [...] }'
              rows={4}
              className="w-full rounded border border-border bg-bg-1 p-2 font-mono text-[10px] text-fg"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowJsonImport(false)}
                className="py-1 px-2.5 rounded border border-border text-[11px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportOpenMontage}
                className="py-1 px-2.5 rounded bg-primary text-primary-fg font-semibold text-[11px]"
              >
                Load Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generated Script Review */}
      {script && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-fg">{script.title}</h4>
              <p className="text-[10px] text-fg-muted">Target: {script.targetAudience} • {script.modelUsed}</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {script.scenes.length} Scenes
            </span>
          </div>

          {/* Scene Cards */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {script.scenes.map((scene) => (
              <div key={scene.id} className="rounded-md border border-border bg-bg-2 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <Film className="h-3 w-3" /> Scene {scene.order}
                  </span>
                  <span className="flex items-center gap-1 text-fg-muted">
                    <Clock className="h-3 w-3" /> {scene.durationSeconds}s
                  </span>
                </div>

                <div className="text-[11px]">
                  <span className="text-fg-muted font-medium">Visual: </span>
                  <span className="text-fg">{scene.visualDescription}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-fg-muted">
                  <Search className="h-3 w-3 text-secondary shrink-0" />
                  <span>Stock Query: </span>
                  <span className="text-fg font-mono bg-bg-1 px-1 rounded">{scene.stockSearchQuery}</span>
                </div>

                <div className="rounded bg-bg-1 p-2 text-[11px] border border-border/50">
                  <div className="flex items-center gap-1 text-fg-muted text-[10px] mb-0.5">
                    <MessageSquare className="h-3 w-3" /> Narration / Captions:
                  </div>
                  <p className="text-fg italic">"{scene.captionText || scene.narrationText}"</p>
                </div>
              </div>
            ))}
          </div>

          {/* Self-Check Report Box */}
          {report && (
            <div className="rounded-lg border border-border bg-bg-2 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-fg flex items-center gap-1.5">
                  {report.status === "passed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  Pipeline Self-Check Report
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  report.status === "passed" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                }`}>
                  {report.status === "passed" ? "PASSED" : "ATTENTION"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-fg-muted">
                <div>Duration: <span className="text-fg font-semibold">{report.totalDurationSeconds}s</span></div>
                <div>A/V Sync: <span className={report.audioVideoSyncOk ? "text-green-400 font-semibold" : "text-amber-400"}>
                  {report.audioVideoSyncOk ? "Verified" : "Check Needed"}
                </span></div>
              </div>

              <div className="text-[10px] text-fg-muted border-t border-border pt-1.5">
                Stock License: <span className="text-fg font-medium">Wikimedia / Pexels (CC0 / Free for Commercial Use)</span>
              </div>

              {report.warnings.length > 0 && (
                <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2 text-[10px] text-amber-300 space-y-0.5">
                  {report.warnings.map((w, idx) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}

              {/* Assemble Button */}
              <button
                type="button"
                onClick={handleAssembleTimeline}
                disabled={isAssembling}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 mt-2"
              >
                <Play className="h-3.5 w-3.5" />
                {isAssembling ? "Assembling Timeline..." : "Assemble on Timeline"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
