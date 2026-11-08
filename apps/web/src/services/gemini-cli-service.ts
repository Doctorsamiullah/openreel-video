/**
 * gemini-cli-service.ts
 *
 * Bridge to Google Gemini API via the AI Connection store.
 * Supports:
 *   - Chat completions (text generation, editing suggestions)
 *   - File analysis (describe video frames, suggest edits)
 *   - Script generation for Ollama provider too
 *
 * Uses the openai-compatible endpoint format that Gemini AI Studio supports.
 * Configure via Settings → AI Connection → Google Gemini.
 */

import { useAIConnectionStore } from "../stores/ai-connection-store";

export interface GeminiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GeminiCompletionOptions {
  messages: GeminiMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface GeminiCompletionResult {
  text: string;
  model: string;
  provider: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

/**
 * Send a chat completion request to the configured AI provider.
 * Works with Gemini, Groq, Ollama, OpenAI, etc. — anything OpenAI-compatible.
 */
export async function chatCompletion(
  options: GeminiCompletionOptions,
): Promise<GeminiCompletionResult> {
  const store = useAIConnectionStore.getState();
  const { baseUrl, model, apiKey, provider } = store;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  // Gemini AI Studio requires x-goog-api-key instead of Authorization
  if (provider === "gemini" && apiKey) {
    headers["x-goog-api-key"] = apiKey;
    delete headers["Authorization"];
  }

  const endpoint = baseUrl.endsWith("/")
    ? `${baseUrl}chat/completions`
    : `${baseUrl}/chat/completions`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    signal: options.signal,
    body: JSON.stringify({
      model,
      messages: options.messages,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `AI request failed [${res.status} ${res.statusText}]: ${errorBody.slice(0, 200)}`,
    );
  }

  const json = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    model?: string;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const text = json.choices[0]?.message?.content?.trim() ?? "";
  return {
    text,
    model: json.model ?? model,
    provider,
    usage: json.usage
      ? {
          promptTokens: json.usage.prompt_tokens,
          completionTokens: json.usage.completion_tokens,
          totalTokens: json.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Generate a video editing script / storyboard outline using the connected AI.
 */
export async function generateEditingScript(
  projectDescription: string,
  targetDurationSeconds: number,
  style: "cinematic" | "vlog" | "social" | "documentary" | "music-video",
): Promise<string> {
  const result = await chatCompletion({
    messages: [
      {
        role: "system",
        content: `You are an expert video editor and cinematographer. Generate concise, actionable editing scripts.`,
      },
      {
        role: "user",
        content: `Create a ${style} style editing script for the following video project:

Project: ${projectDescription}
Target Duration: ${targetDurationSeconds} seconds

Provide:
1. Scene breakdown with timestamps
2. Suggested transitions between scenes
3. Music mood/tempo recommendations
4. Color grade style recommendations
5. Text/caption timing suggestions

Format as a structured outline with clear sections.`,
      },
    ],
    maxTokens: 1500,
    temperature: 0.8,
  });
  return result.text;
}

/**
 * Ask AI to suggest improvements to the current edit.
 */
export async function suggestEditImprovements(
  currentEditDescription: string,
): Promise<string> {
  const result = await chatCompletion({
    messages: [
      {
        role: "system",
        content: `You are a professional video editor. Give specific, actionable feedback to improve video edits.`,
      },
      {
        role: "user",
        content: `Review this video edit and suggest specific improvements:\n\n${currentEditDescription}`,
      },
    ],
    maxTokens: 800,
    temperature: 0.6,
  });
  return result.text;
}

/**
 * Generate caption text for a given scene description.
 */
export async function generateCaptions(
  sceneDescription: string,
  targetLanguage: string,
  style: "informative" | "entertaining" | "minimal",
): Promise<string[]> {
  const result = await chatCompletion({
    messages: [
      {
        role: "system",
        content: `You generate short, punchy video captions. Output ONLY the captions, one per line, no numbering.`,
      },
      {
        role: "user",
        content: `Generate ${style} captions in ${targetLanguage} for this scene: ${sceneDescription}
Write 3-5 captions, each max 8 words. Format: one caption per line.`,
      },
    ],
    maxTokens: 200,
    temperature: 0.9,
  });
  return result.text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Check if the configured AI provider is reachable.
 */
export async function testAIConnection(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const result = await chatCompletion({
      messages: [{ role: "user", content: 'Reply with only the word "pong".' }],
      maxTokens: 10,
      temperature: 0,
      signal: AbortSignal.timeout(8000),
    });
    return {
      ok: result.text.toLowerCase().includes("pong"),
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
