import { describe, it, expect, beforeEach, vi } from "vitest";
import { AutoVideoPipeline } from "./auto-video-pipeline";
import type { GeneratedVideoScript } from "./providers/ollama-script-provider";

const mockAddSubtitle = vi.fn();
const mockSetPlayheadPosition = vi.fn();

vi.mock("../stores/project-store", () => ({
  useProjectStore: {
    getState: vi.fn(() => ({
      addSubtitle: mockAddSubtitle,
    })),
  },
}));

vi.mock("../stores/timeline-store", () => ({
  useTimelineStore: {
    getState: vi.fn(() => ({
      setPlayheadPosition: mockSetPlayheadPosition,
    })),
  },
}));

describe("AutoVideoPipeline (Phase 5: Idea ➔ Editable Timeline)", () => {
  const validScript: GeneratedVideoScript = {
    title: "10-Minute Morning Routine",
    brief: "Healthy productivity morning habits",
    totalDurationSeconds: 15,
    targetAudience: "Busy professionals",
    modelUsed: "llama3.2",
    provider: "ollama",
    scenes: [
      {
        id: "scene-1",
        order: 1,
        durationSeconds: 5,
        visualDescription: "Sun rising over city horizon",
        stockSearchQuery: "sunrise city horizon",
        narrationText: "Wake up early to take charge of your day.",
        captionText: "Wake up early to take charge of your day.",
      },
      {
        id: "scene-2",
        order: 2,
        durationSeconds: 5,
        visualDescription: "Person drinking a fresh glass of water",
        stockSearchQuery: "drinking water glass morning",
        narrationText: "Hydrate immediately before checking your phone.",
        captionText: "Hydrate immediately before checking your phone.",
      },
      {
        id: "scene-3",
        order: 3,
        durationSeconds: 5,
        visualDescription: "Writing goals in a journal",
        stockSearchQuery: "journaling planning notes",
        narrationText: "Set your top three priorities for clarity.",
        captionText: "Set your top three priorities for clarity.",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a clean self-check report with complete attribution list", () => {
    const report = AutoVideoPipeline.generateSelfCheckReport(validScript);

    expect(report.status).toBe("passed");
    expect(report.warnings).toHaveLength(0);
    expect(report.totalScenes).toBe(3);
    expect(report.totalDurationSeconds).toBe(15);
    expect(report.audioVideoSyncOk).toBe(true);
    expect(report.stockAttributionList).toHaveLength(3);
    expect(report.stockAttributionList[0].query).toBe("sunrise city horizon");
    expect(report.stockAttributionList[0].license).toContain("CC0");
  });

  it("detects warnings when scenes have invalid pacing or missing captions", () => {
    const problematicScript: GeneratedVideoScript = {
      ...validScript,
      totalDurationSeconds: 30,
      scenes: [
        {
          id: "s1",
          order: 1,
          durationSeconds: 1, // too short (<2s)
          visualDescription: "Quick flash",
          stockSearchQuery: "flash",
          narrationText: "",
          captionText: "", // missing caption
        },
      ],
    };

    const report = AutoVideoPipeline.generateSelfCheckReport(problematicScript);
    expect(report.status).toBe("warnings");
    expect(report.audioVideoSyncOk).toBe(false);
    expect(report.warnings.some((w) => w.includes("shorter than recommended"))).toBe(true);
    expect(report.warnings.some((w) => w.includes("no narration or caption"))).toBe(true);
  });

  it("assembles scenes sequentially onto timeline tracks", async () => {
    const result = await AutoVideoPipeline.assembleTimeline(validScript);

    expect(result.success).toBe(true);
    expect(mockAddSubtitle).toHaveBeenCalledTimes(3);

    // Verify sequential time offsets
    expect(mockAddSubtitle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        startTime: 0,
        endTime: 5,
        text: "Wake up early to take charge of your day.",
      }),
    );

    expect(mockAddSubtitle).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        startTime: 5,
        endTime: 10,
        text: "Hydrate immediately before checking your phone.",
      }),
    );

    expect(mockAddSubtitle).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        startTime: 10,
        endTime: 15,
        text: "Set your top three priorities for clarity.",
      }),
    );

    expect(mockSetPlayheadPosition).toHaveBeenCalledWith(0);
  });

  it("gracefully rejects empty script payloads", async () => {
    const emptyScript: GeneratedVideoScript = {
      ...validScript,
      scenes: [],
    };

    const result = await AutoVideoPipeline.assembleTimeline(emptyScript);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Cannot assemble empty script");
  });
});
