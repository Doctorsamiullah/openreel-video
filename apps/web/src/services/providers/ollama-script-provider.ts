/**
 * Ollama Script & Auto-Video Generator Provider (Phase 5)
 *
 * Connects to local Ollama (127.0.0.1:11434) to generate structured video scripts,
 * scene breakdowns with stock footage queries, and converts ideas into editable timelines.
 * Also provides an OpenMontage project JSON import adapter.
 */

export interface ScriptScene {
  id: string;
  order: number;
  durationSeconds: number;
  visualDescription: string;
  stockSearchQuery: string;
  narrationText: string;
  captionText: string;
}

export interface GeneratedVideoScript {
  title: string;
  brief: string;
  totalDurationSeconds: number;
  targetAudience: string;
  scenes: ScriptScene[];
  modelUsed: string;
  provider: "ollama" | "ollama-mock";
}

export interface OpenMontageProjectPayload {
  version: string;
  title: string;
  pipeline?: string;
  scenes: Array<{
    title?: string;
    duration?: number;
    visual?: string;
    audio?: string;
    voiceover?: string;
    subtitles?: string;
  }>;
}

export class OllamaScriptProvider {
  private baseUrl: string;
  private model: string;
  private mockMode: boolean;

  constructor(
    baseUrl = "http://127.0.0.1:11434",
    model = "llama3.2",
    mockMode = false,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
    this.mockMode = mockMode;
  }

  async health(): Promise<boolean> {
    if (this.mockMode) return true;
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(1500),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateVideoScript(
    prompt: string,
    targetDurationSeconds = 30,
  ): Promise<GeneratedVideoScript> {
    if (!prompt.trim()) {
      throw new Error("Video idea/brief prompt cannot be empty.");
    }

    if (this.mockMode) {
      return this.createMockScript(prompt, targetDurationSeconds);
    }

    const isHealthy = await this.health();
    if (!isHealthy) {
      return this.createMockScript(prompt, targetDurationSeconds);
    }

    const systemPrompt = `You are a professional video producer. Generate a structured JSON video plan for a ${targetDurationSeconds}-second video based on the user's brief. Output STRICT JSON with this schema:
{
  "title": "string",
  "brief": "string",
  "totalDurationSeconds": number,
  "targetAudience": "string",
  "scenes": [
    {
      "id": "scene-1",
      "order": 1,
      "durationSeconds": number,
      "visualDescription": "string",
      "stockSearchQuery": "string",
      "narrationText": "string",
      "captionText": "string"
    }
  ]
}`;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          system: systemPrompt,
          prompt: `Create a video script for: "${prompt}"`,
          format: "json",
          stream: false,
        }),
      });

      if (!response.ok) {
        return this.createMockScript(prompt, targetDurationSeconds);
      }

      const data = (await response.json()) as { response: string };
      const parsed = JSON.parse(data.response) as GeneratedVideoScript;
      parsed.provider = "ollama";
      parsed.modelUsed = this.model;
      return parsed;
    } catch {
      return this.createMockScript(prompt, targetDurationSeconds);
    }
  }

  importOpenMontage(payload: OpenMontageProjectPayload): GeneratedVideoScript {
    if (!payload.scenes || !Array.isArray(payload.scenes)) {
      throw new Error("Invalid OpenMontage payload: missing scenes array.");
    }

    const scenes: ScriptScene[] = payload.scenes.map((s, idx) => ({
      id: `openmontage-scene-${idx + 1}`,
      order: idx + 1,
      durationSeconds: s.duration || 5,
      visualDescription: s.visual || s.title || `Scene ${idx + 1}`,
      stockSearchQuery: s.visual ? s.visual.split(/\s+/).slice(0, 3).join(" ") : "b-roll footage",
      narrationText: s.voiceover || s.audio || "",
      captionText: s.subtitles || s.voiceover || "",
    }));

    const totalDuration = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);

    return {
      title: payload.title || "Imported OpenMontage Project",
      brief: `Imported from OpenMontage pipeline ${payload.pipeline || "standard"}`,
      totalDurationSeconds: totalDuration,
      targetAudience: "General Audience",
      scenes,
      modelUsed: "OpenMontage Importer",
      provider: "ollama-mock",
    };
  }

  private createMockScript(
    brief: string,
    targetDuration: number,
  ): GeneratedVideoScript {
    const sceneDuration = Math.max(3, Math.round(targetDuration / 3));
    return {
      title: `Story: ${brief.slice(0, 30)}...`,
      brief,
      totalDurationSeconds: targetDuration,
      targetAudience: "Social Media Viewers",
      modelUsed: "Local Mock Generator (T0)",
      provider: "ollama-mock",
      scenes: [
        {
          id: "scene-1",
          order: 1,
          durationSeconds: sceneDuration,
          visualDescription: "Eye-catching opening scene establishing the core message",
          stockSearchQuery: "cinematic intro landscape",
          narrationText: `Here is something you should know about ${brief.slice(0, 25)}.`,
          captionText: `Here is something you should know about ${brief.slice(0, 25)}.`,
        },
        {
          id: "scene-2",
          order: 2,
          durationSeconds: sceneDuration,
          visualDescription: "Engaging demonstration and core narrative breakdown",
          stockSearchQuery: "technology creative studio workflow",
          narrationText: "Focus on the key benefit and see how easily it comes together.",
          captionText: "Focus on the key benefit and see how easily it comes together.",
        },
        {
          id: "scene-3",
          order: 3,
          durationSeconds: targetDuration - sceneDuration * 2,
          visualDescription: "Inspiring closing scene with actionable call to action",
          stockSearchQuery: "happy creator smiling finish",
          narrationText: "Try it today and make something incredible.",
          captionText: "Try it today and make something incredible.",
        },
      ],
    };
  }
}

export const defaultOllamaScriptProvider = new OllamaScriptProvider();
