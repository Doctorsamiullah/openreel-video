import { describe, it, expect } from "vitest";
import { VoiceboxProvider } from "./voicebox-provider";

describe("VoiceboxProvider", () => {
  it("provides capabilities with supported languages and license", async () => {
    const provider = new VoiceboxProvider("http://127.0.0.1:8000", true);
    const caps = await provider.capabilities();
    expect(caps.name).toBe("Voicebox");
    expect(caps.supportedLanguages).toContain("en");
    expect(caps.supportedLanguages).toContain("hi");
    expect(caps.supportedLanguages).toContain("ur");
    expect(caps.license).toContain("MIT");
  });

  it("requires explicit user consent to clone a voice profile", async () => {
    const provider = new VoiceboxProvider("http://127.0.0.1:8000", true);
    const mockAudio = new Blob(["fake audio data"], { type: "audio/wav" });

    // Should fail without consent
    await expect(
      provider.cloneVoice({
        name: "Test Speaker",
        referenceAudio: mockAudio,
        hasExplicitConsent: false,
      }),
    ).rejects.toThrow(/Explicit consent is legally required/);

    // Should succeed with consent in mock mode
    const result = await provider.cloneVoice({
      name: "Test Speaker",
      referenceAudio: mockAudio,
      hasExplicitConsent: true,
      consentStatement: "I hereby give consent to sample my voice.",
    });

    expect(result.voiceId).toBeDefined();
    expect(result.name).toBe("Test Speaker");
  });

  it("generates speech audio blob in mock mode", async () => {
    const provider = new VoiceboxProvider("http://127.0.0.1:8000", true);
    const result = await provider.generateSpeech({
      text: "Hello, this is a test narration for the video project.",
      voiceId: "mock-voice-1",
      language: "en",
    });

    expect(result.audioBlob).toBeInstanceOf(Blob);
    expect(result.audioBlob.type).toBe("audio/wav");
    expect(result.durationEstimate).toBeGreaterThan(0);
    expect(result.provider).toBe("voicebox-mock");
  });

  it("rejects empty text requests", async () => {
    const provider = new VoiceboxProvider("http://127.0.0.1:8000", true);
    await expect(
      provider.generateSpeech({
        text: "   ",
        voiceId: "mock-voice-1",
      }),
    ).rejects.toThrow(/Text prompt cannot be empty/);
  });
});
