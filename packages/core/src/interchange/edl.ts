import type { Timeline } from "../types/timeline";

export interface EdlOptions {
  title?: string;
  fps?: number;
}

/**
 * Converts seconds into CMX 3600 SMPTE Timecode HH:MM:SS:FF.
 */
function toSmpteTimecode(seconds: number, fps: number): string {
  const nominal = Math.max(1, Math.round(fps));
  const totalFrames = Math.max(0, Math.round((Number.isFinite(seconds) ? seconds : 0) * nominal));
  const frames = totalFrames % nominal;
  const totalSeconds = Math.floor(totalFrames / nominal);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);

  return [h, m, s, frames]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

/**
 * Exports an OpenReel timeline as standard CMX 3600 EDL (Edit Decision List).
 * Universally supported by Kdenlive, DaVinci Resolve, Premiere, Avid Media Composer.
 */
export function timelineToEdl(
  timeline: Timeline,
  options: EdlOptions = {},
): string {
  const fps = options.fps && options.fps > 0 ? options.fps : 30;
  const title = (options.title || "OPENREEL_EXPORT").replace(/[^A-Za-z0-9_-]/g, "_").toUpperCase();

  const lines: string[] = [
    `TITLE: ${title}`,
    "FCM: NON-DROP FRAME",
    "",
  ];

  let eventNumber = 1;

  for (const track of timeline.tracks) {
    const isAudio = track.type === "audio" || track.role === "dialogue" || track.role === "music" || track.role === "effects";
    const editType = isAudio ? "A" : "V";

    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);

    for (const clip of sortedClips) {
      const eventIdStr = String(eventNumber).padStart(3, "0");
      const reel = "AX";
      const cutType = "C";

      const srcIn = toSmpteTimecode(clip.inPoint || 0, fps);
      const srcOut = toSmpteTimecode((clip.inPoint || 0) + clip.duration, fps);
      const dstIn = toSmpteTimecode(clip.startTime, fps);
      const dstOut = toSmpteTimecode(clip.startTime + clip.duration, fps);

      // Standard CMX 3600 format:
      // 001  AX       V     C        00:00:00:00 00:00:05:00 00:00:00:00 00:00:05:00
      const row = `${eventIdStr}  ${reel.padEnd(8)} ${editType.padEnd(5)} ${cutType.padEnd(8)} ${srcIn} ${srcOut} ${dstIn} ${dstOut}`;
      lines.push(row);

      const clipName = clip.id || clip.mediaId;
      lines.push(`* FROM CLIP NAME: ${clipName}`);
      if (clip.mediaId) {
        lines.push(`* SOURCE FILE: ${clip.mediaId}`);
      }
      lines.push("");

      eventNumber++;
    }
  }

  return lines.join("\r\n");
}
