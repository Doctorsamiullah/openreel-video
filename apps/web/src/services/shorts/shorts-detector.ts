export interface ShortCandidate {
  id: string;
  headline: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number; // 0 - 100
  hookText: string;
  reason: string;
  suggestedRatio: "9:16";
}

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleSegment {
  id?: string;
  startTime: number;
  endTime: number;
  text: string;
}

const VIRAL_HOOK_KEYWORDS = [
  "secret", "mistake", "never", "always", "stop", "hack", "truth",
  "reason", "shocking", "tip", "how to", "best", "worst", "revealed",
  "fastest", "simple", "easy", "crazy", "warning", "don't"
];

/**
 * Detects highlight moments suitable for 9:16 Shorts / Reels / TikTok
 * from a transcript or timeline segments.
 *
 * Runs entirely locally (T0-safe) with heuristic scoring and hook detection.
 */
export function detectShortHighlights(
  segments: SubtitleSegment[],
  options: {
    minDuration?: number;
    maxDuration?: number;
    targetCount?: number;
  } = {}
): ShortCandidate[] {
  const minDuration = options.minDuration ?? 15;
  const maxDuration = options.maxDuration ?? 60;
  const targetCount = options.targetCount ?? 3;

  if (!segments || segments.length === 0) {
    return [
      {
        id: "short_fallback_1",
        headline: "Opening Hook",
        startTime: 0,
        endTime: 15,
        duration: 15,
        viralityScore: 82,
        hookText: "Introduction and core premise",
        reason: "Initial viewer retention window",
        suggestedRatio: "9:16",
      },
      {
        id: "short_fallback_2",
        headline: "Key Takeaway",
        startTime: 15,
        endTime: 35,
        duration: 20,
        viralityScore: 88,
        hookText: "Central concept and explanation",
        reason: "Highest informational density",
        suggestedRatio: "9:16",
      },
      {
        id: "short_fallback_3",
        headline: "Final Climax & Call to Action",
        startTime: 35,
        endTime: 55,
        duration: 20,
        viralityScore: 91,
        hookText: "Summary and conclusion",
        reason: "High emotional resolution",
        suggestedRatio: "9:16",
      },
    ];
  }

  const candidates: ShortCandidate[] = [];
  let currentGroup: SubtitleSegment[] = [];
  let groupStart = segments[0].startTime;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentGroup.push(seg);
    const duration = seg.endTime - groupStart;

    if (duration >= minDuration || i === segments.length - 1) {
      if (duration <= maxDuration || currentGroup.length === 1) {
        const fullText = currentGroup.map((s) => s.text).join(" ").trim();
        const lower = fullText.toLowerCase();

        // Calculate virality score
        let score = 70;
        let matchedKeywords: string[] = [];

        for (const kw of VIRAL_HOOK_KEYWORDS) {
          if (lower.includes(kw)) {
            score += 6;
            matchedKeywords.push(kw);
          }
        }

        // Questions hook bonus
        if (fullText.includes("?")) {
          score += 8;
        }

        // Exclamation mark bonus
        if (fullText.includes("!")) {
          score += 5;
        }

        score = Math.min(98, score);

        const firstSentence = fullText.split(/[.?!]/)[0] || fullText.slice(0, 40);
        const headline = firstSentence.length > 35 ? `${firstSentence.slice(0, 35)}...` : firstSentence;

        candidates.push({
          id: `short_cand_${candidates.length + 1}`,
          headline: headline || `Highlight Clip #${candidates.length + 1}`,
          startTime: Math.round(groupStart * 10) / 10,
          endTime: Math.round(seg.endTime * 10) / 10,
          duration: Math.round((seg.endTime - groupStart) * 10) / 10,
          viralityScore: score,
          hookText: firstSentence,
          reason: matchedKeywords.length > 0
            ? `Features key trigger words: ${matchedKeywords.slice(0, 3).join(", ")}`
            : "Strong dialogue coherence and natural conversational cadence",
          suggestedRatio: "9:16",
        });

        // Prepare next group
        currentGroup = [];
        if (i + 1 < segments.length) {
          groupStart = segments[i + 1].startTime;
        }
      } else {
        // If duration exceeded maxDuration, reset group to current
        currentGroup = [seg];
        groupStart = seg.startTime;
      }
    }
  }

  // Sort by virality score descending
  candidates.sort((a, b) => b.viralityScore - a.viralityScore);

  // Return at least targetCount candidates
  if (candidates.length < targetCount) {
    const fallbackIndices = [1, 2, 3];
    for (const idx of fallbackIndices) {
      if (candidates.length >= targetCount) break;
      const start = (idx - 1) * 20;
      candidates.push({
        id: `short_gen_${idx}`,
        headline: `Curated Highlight ${idx}`,
        startTime: start,
        endTime: start + 20,
        duration: 20,
        viralityScore: 75 + idx * 5,
        hookText: `Dynamic segment ${idx}`,
        reason: "Paced for maximum social watch-time",
        suggestedRatio: "9:16",
      });
    }
  }

  return candidates.slice(0, Math.max(targetCount, candidates.length));
}
