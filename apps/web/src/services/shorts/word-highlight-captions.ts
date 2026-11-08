export type HighlightCaptionStyle = "viral-yellow" | "cyber-cyan" | "clean-minimal";

export interface WordHighlightToken {
  word: string;
  start: number;
  end: number;
  isHighlighted?: boolean;
}

export interface WordHighlightGroup {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  tokens: WordHighlightToken[];
  fontFamily: string;
  style: HighlightCaptionStyle;
}

/**
 * Detect language script to assign appropriate font family.
 */
export function getFontFamilyForText(text: string): string {
  // Devanagari range: \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) {
    return "'Noto Sans Devanagari', sans-serif";
  }
  // Arabic / Urdu range: \u0600-\u06FF, \u0750-\u077F, \uFB50-\uFDFF, \uFE70-\uFEFF
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return "'Noto Nastaliq Urdu', serif";
  }
  return "'Inter', 'Montserrat', sans-serif";
}

/**
 * Splits subtitle sentences into punchy 2-4 word short phrases suitable
 * for fast-paced vertical video viewing (TikTok/Reels/Shorts).
 */
export function generateWordHighlightCaptions(
  subtitles: Array<{ startTime: number; endTime: number; text: string }>,
  style: HighlightCaptionStyle = "viral-yellow",
  wordsPerBeat: number = 3
): WordHighlightGroup[] {
  const groups: WordHighlightGroup[] = [];
  let groupId = 1;

  for (const sub of subtitles) {
    const rawWords = sub.text.trim().split(/\s+/).filter(Boolean);
    if (rawWords.length === 0) continue;

    const totalDuration = Math.max(0.2, sub.endTime - sub.startTime);
    const timePerWord = totalDuration / rawWords.length;

    for (let i = 0; i < rawWords.length; i += wordsPerBeat) {
      const slice = rawWords.slice(i, i + wordsPerBeat);
      const groupStart = sub.startTime + i * timePerWord;
      const groupEnd = sub.startTime + (i + slice.length) * timePerWord;
      const groupText = slice.join(" ");

      const tokens: WordHighlightToken[] = slice.map((w, idx) => ({
        word: w,
        start: groupStart + idx * timePerWord,
        end: groupStart + (idx + 1) * timePerWord,
        isHighlighted: idx === 0, // Primary word on the beat highlighted
      }));

      groups.push({
        id: `wh_group_${groupId++}`,
        startTime: Math.round(groupStart * 100) / 100,
        endTime: Math.round(groupEnd * 100) / 100,
        text: groupText,
        tokens,
        fontFamily: getFontFamilyForText(groupText),
        style,
      });
    }
  }

  return groups;
}

/**
 * Returns CSS color styling properties for the active word highlight token.
 */
export function getHighlightStyleProps(style: HighlightCaptionStyle): {
  highlightColor: string;
  normalColor: string;
  pillBg: string;
  stroke: string;
} {
  switch (style) {
    case "cyber-cyan":
      return {
        highlightColor: "#00E5FF",
        normalColor: "#FFFFFF",
        pillBg: "rgba(0, 0, 0, 0.75)",
        stroke: "2px #000000",
      };
    case "clean-minimal":
      return {
        highlightColor: "#FFFFFF",
        normalColor: "rgba(255, 255, 255, 0.7)",
        pillBg: "rgba(15, 23, 42, 0.65)",
        stroke: "1px #000000",
      };
    case "viral-yellow":
    default:
      return {
        highlightColor: "#FFE600",
        normalColor: "#FFFFFF",
        pillBg: "rgba(0, 0, 0, 0.8)",
        stroke: "2px #000000",
      };
  }
}
