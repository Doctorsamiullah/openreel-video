import { describe, expect, it } from "vitest";
import {
  detectShortHighlights,
  type SubtitleSegment,
} from "./shorts-detector";

describe("Shorts Detector (Highlight suggestions & virality hooks)", () => {
  it("generates fallback curated highlights when segments are empty", () => {
    const candidates = detectShortHighlights([]);
    expect(candidates).toHaveLength(3);
    expect(candidates[0].suggestedRatio).toBe("9:16");
    expect(candidates[0].viralityScore).toBeGreaterThanOrEqual(70);
  });

  it("detects viral hook keywords and questions with high virality scores", () => {
    const segments: SubtitleSegment[] = [
      { startTime: 0, endTime: 5, text: "Stop doing this common video editing mistake right now!" },
      { startTime: 5, endTime: 12, text: "Here is the secret reason why your videos fail." },
      { startTime: 12, endTime: 22, text: "Always use keyframes to smoothly ramp the zoom." },
      { startTime: 22, endTime: 35, text: "The result is shocking and looks completely professional." },
    ];

    const candidates = detectShortHighlights(segments, { minDuration: 15, maxDuration: 60 });
    expect(candidates.length).toBeGreaterThanOrEqual(1);

    const topCandidate = candidates[0];
    expect(topCandidate.suggestedRatio).toBe("9:16");
    expect(topCandidate.viralityScore).toBeGreaterThanOrEqual(80);
    expect(topCandidate.headline).toBeDefined();
    expect(topCandidate.duration).toBeGreaterThanOrEqual(15);
  });

  it("handles Hindi and Urdu multilingual segments cleanly", () => {
    const hindiSegments: SubtitleSegment[] = [
      { startTime: 0, endTime: 10, text: "यह वीडियो एडिटिंग का सबसे बड़ा सीक्रेट है।" },
      { startTime: 10, endTime: 25, text: "क्या आप भी यह गलती कर रहे हैं?" },
    ];

    const candidates = detectShortHighlights(hindiSegments, { minDuration: 15 });
    expect(candidates.length).toBeGreaterThanOrEqual(1);
    expect(candidates[0].hookText).toContain("सीक्रेट");
  });
});
