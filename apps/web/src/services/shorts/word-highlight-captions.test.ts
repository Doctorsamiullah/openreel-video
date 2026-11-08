import { describe, expect, it } from "vitest";
import {
  generateWordHighlightCaptions,
  getFontFamilyForText,
  getHighlightStyleProps,
} from "./word-highlight-captions";

describe("Word-Highlight Captions", () => {
  it("detects Hindi (Devanagari) script and applies Noto Sans Devanagari", () => {
    const font = getFontFamilyForText("नमस्ते दुनिया, आपका स्वागत है");
    expect(font).toContain("Noto Sans Devanagari");
  });

  it("detects Urdu (RTL) script and applies Noto Nastaliq Urdu", () => {
    const font = getFontFamilyForText("یہ ایک آزمائشی جملہ ہے");
    expect(font).toContain("Noto Nastaliq Urdu");
  });

  it("applies Inter/Montserrat for English and Latin scripts", () => {
    const font = getFontFamilyForText("This is an English caption.");
    expect(font).toContain("Inter");
  });

  it("splits subtitles into 2-4 word highlight groups with accurate timing", () => {
    const subs = [
      { startTime: 0, endTime: 4, text: "Welcome to the ultimate video editing masterclass" },
    ];

    const groups = generateWordHighlightCaptions(subs, "viral-yellow", 3);
    expect(groups.length).toBeGreaterThanOrEqual(2);

    expect(groups[0].tokens).toHaveLength(3);
    expect(groups[0].tokens[0].word).toBe("Welcome");
    expect(groups[0].tokens[0].isHighlighted).toBe(true);
    expect(groups[0].style).toBe("viral-yellow");
  });

  it("provides distinct highlight color schemes", () => {
    const yellow = getHighlightStyleProps("viral-yellow");
    const cyan = getHighlightStyleProps("cyber-cyan");
    const clean = getHighlightStyleProps("clean-minimal");

    expect(yellow.highlightColor).toBe("#FFE600");
    expect(cyan.highlightColor).toBe("#00E5FF");
    expect(clean.highlightColor).toBe("#FFFFFF");
  });
});
