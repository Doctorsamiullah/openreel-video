/**
 * Voicebox Local Provider Adapter (Phase 3)
 *
 * Connects to the local Voicebox REST API (jamiepine/voicebox, MIT)
 * with strict explicit-consent tracking for voice cloning and mock fallback.
 */

export interface VoiceboxCapabilities {
  name: string;
  version: string;
  supportsVoiceCloning: boolean;
  supportedLanguages: string[];
  engines: string[];
  license: string;
}

export interface VoiceCloneRequest {
  name: string;
  referenceAudio: Blob;
  hasExplicitConsent: boolean;
  consentStatement?: string;
}

export interface SpeechSynthesisRequest {
  text: string;
  voiceId: string;
  language?: string;
  speed?: number;
}

export interface SpeechSynthesisResult {
  audioBlob: Blob;
  durationEstimate: number;
  provider: "voicebox" | "voicebox-mock";
  modelUsed: string;
}

export class VoiceboxProvider {
  private baseUrl: string;
  private mockMode: boolean;

  constructor(baseUrl = "http://127.0.0.1:8000", mockMode = false) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.mockMode = mockMode;
  }

  async health(): Promise<boolean> {
    if (this.mockMode) return true;
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(1500),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async capabilities(): Promise<VoiceboxCapabilities> {
    return {
      name: "Voicebox",
      version: "1.0.0",
      supportsVoiceCloning: true,
      supportedLanguages: ["en", "hi", "ur", "es", "fr", "de", "ja", "zh"],
      engines: ["Qwen3-TTS", "F5-TTS", "Kokoro"],
      license: "MIT (Per-model licenses vary)",
    };
  }

  async cloneVoice(request: VoiceCloneRequest): Promise<{ voiceId: string; name: string }> {
    if (!request.hasExplicitConsent) {
      throw new Error(
        "Explicit consent is legally required before cloning or sampling a voice profile.",
      );
    }

    if (this.mockMode) {
      return {
        voiceId: `mock-voice-${Date.now()}`,
        name: request.name,
      };
    }

    const isHealthy = await this.health();
    if (!isHealthy) {
      // Graceful fallback to mock mode if backend is not actively running
      return {
        voiceId: `mock-voice-${Date.now()}`,
        name: `${request.name} (Local Mock)`,
      };
    }

    const formData = new FormData();
    formData.append("name", request.name);
    formData.append("audio", request.referenceAudio, "reference.wav");
    formData.append("has_consent", "true");
    if (request.consentStatement) {
      formData.append("consent_statement", request.consentStatement);
    }

    const response = await fetch(`${this.baseUrl}/api/voices/clone`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Voicebox cloning failed (${response.status}): ${err}`);
    }

    const data = (await response.json()) as { voice_id: string; name: string };
    return { voiceId: data.voice_id, name: data.name };
  }

  async generateSpeech(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult> {
    if (!request.text.trim()) {
      throw new Error("Text prompt cannot be empty.");
    }

    if (this.mockMode) {
      return this.createMockSpeechResult(request.text);
    }

    const isHealthy = await this.health();
    if (!isHealthy) {
      return this.createMockSpeechResult(request.text);
    }

    const response = await fetch(`${this.baseUrl}/api/tts/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: request.text,
        voice_id: request.voiceId,
        language: request.language || "en",
        speed: request.speed || 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Voicebox generation failed with status ${response.status}`);
    }

    const audioBlob = await response.blob();
    return {
      audioBlob,
      durationEstimate: Math.max(1, request.text.split(/\s+/).length * 0.4),
      provider: "voicebox",
      modelUsed: "Qwen3-TTS",
    };
  }

  private createMockSpeechResult(text: string): SpeechSynthesisResult {
    // Generate a simple silent audio buffer wav in mock mode
    const duration = Math.max(1, Math.round(text.split(/\s+/).length * 0.4));
    const sampleRate = 16000;
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // Write minimal WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, numSamples * 2, true);

    const blob = new Blob([buffer], { type: "audio/wav" });
    return {
      audioBlob: blob,
      durationEstimate: duration,
      provider: "voicebox-mock",
      modelUsed: "Mock TTS Engine",
    };
  }
}

export const defaultVoiceboxProvider = new VoiceboxProvider("http://127.0.0.1:8000", false);
