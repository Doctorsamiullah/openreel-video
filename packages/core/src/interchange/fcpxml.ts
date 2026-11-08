import type { Timeline } from "../types/timeline";

export interface FcpxmlOptions {
  name?: string;
  fps?: number;
  width?: number;
  height?: number;
}

/**
 * Exports an OpenReel timeline as standard FCPXML (Final Cut Pro XML v1.10).
 * Imports directly into DaVinci Resolve, Final Cut Pro, Premiere Pro, and Kdenlive.
 */
export function timelineToFcpxml(
  timeline: Timeline,
  options: FcpxmlOptions = {},
): string {
  const fps = options.fps && options.fps > 0 ? options.fps : 30;
  const width = options.width || 1920;
  const height = options.height || 1080;
  const name = escapeXml(options.name || "OpenReel Project");

  // Rational frame duration string e.g. "100/3000s" or "1/30s"
  const frameDurationStr = `1/${fps}s`;
  const totalFrames = Math.max(1, Math.round((timeline.duration || 1) * fps));
  const totalDurationStr = `${totalFrames}/${fps}s`;

  // Gather unique media assets
  const mediaMap = new Map<string, { id: string; name: string }>();
  let assetCounter = 1;

  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (!mediaMap.has(clip.mediaId)) {
        mediaMap.set(clip.mediaId, {
          id: `r${assetCounter++}`,
          name: clip.mediaId.split(/[/\\]/).pop() || clip.mediaId,
        });
      }
    }
  }

  // Build resources
  let resourcesXml = `    <format id="r_format" name="FFVideoFormat${height}p" frameDuration="${frameDurationStr}" width="${width}" height="${height}" />\n`;
  for (const [mediaId, asset] of mediaMap.entries()) {
    const safeUrl = escapeXml(mediaId.startsWith("http") || mediaId.startsWith("file:") ? mediaId : `file://localhost/${mediaId.replace(/\\/g, "/")}`);
    resourcesXml += `    <asset id="${asset.id}" name="${escapeXml(asset.name)}" src="${safeUrl}" start="0s" hasVideo="1" hasAudio="1" />\n`;
  }

  // Build spine / clips
  let spineXml = "";
  // Sort video tracks and audio tracks
  const videoTracks = timeline.tracks.filter((t) => t.type !== "audio" && t.role !== "music" && t.role !== "dialogue" && t.role !== "effects");
  const audioTracks = timeline.tracks.filter((t) => t.type === "audio" || t.role === "music" || t.role === "dialogue" || t.role === "effects");

  // Primary video track clips
  const primaryTrack = videoTracks[0];
  if (primaryTrack && primaryTrack.clips.length > 0) {
    const sorted = [...primaryTrack.clips].sort((a, b) => a.startTime - b.startTime);
    let lastEndFrame = 0;

    for (const clip of sorted) {
      const asset = mediaMap.get(clip.mediaId);
      const startFrame = Math.round(clip.startTime * fps);
      const durationFrames = Math.max(1, Math.round(clip.duration * fps));
      const inPointFrames = Math.round((clip.inPoint || 0) * fps);

      if (startFrame > lastEndFrame) {
        const gapDuration = startFrame - lastEndFrame;
        spineXml += `          <gap name="Gap" offset="${lastEndFrame}/${fps}s" duration="${gapDuration}/${fps}s" start="0s" />\n`;
      }

      spineXml += `          <clip name="${escapeXml(clip.id)}" offset="${startFrame}/${fps}s" duration="${durationFrames}/${fps}s" start="${inPointFrames}/${fps}s">\n`;
      if (asset) {
        spineXml += `            <video ref="${asset.id}" duration="${durationFrames}/${fps}s" />\n`;
      }
      spineXml += `          </clip>\n`;

      lastEndFrame = startFrame + durationFrames;
    }
  }

  // Additional audio and video tracks as synchronized secondary elements
  let secondaryXml = "";
  for (const aTrack of audioTracks) {
    for (const clip of aTrack.clips) {
      const asset = mediaMap.get(clip.mediaId);
      const startFrame = Math.round(clip.startTime * fps);
      const durationFrames = Math.max(1, Math.round(clip.duration * fps));
      const inPointFrames = Math.round((clip.inPoint || 0) * fps);

      secondaryXml += `          <asset-clip name="${escapeXml(clip.id)}" ref="${asset?.id ?? 'r_format'}" lane="-1" offset="${startFrame}/${fps}s" duration="${durationFrames}/${fps}s" start="${inPointFrames}/${fps}s" audioRole="${escapeXml(aTrack.role || 'dialogue')}">\n`;
      secondaryXml += `            <adjust-volume amount="${Math.round(20 * Math.log10(Math.max(0.001, clip.volume ?? 1)))}dB" />\n`;
      secondaryXml += `          </asset-clip>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
${resourcesXml}  </resources>
  <library>
    <event name="OpenReel Project Export">
      <project name="${name}">
        <sequence format="r_format" duration="${totalDurationStr}" tcStart="0s" tcFormat="NDF">
          <spine>
${spineXml}${secondaryXml}          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
