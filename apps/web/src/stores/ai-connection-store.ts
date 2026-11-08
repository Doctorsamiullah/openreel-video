import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AIProvider =
  | "openai"
  | "anthropic"
  | "compatible"
  | "gemini"
  | "ollama"
  | "groq"
  | "openrouter"
  | "huggingface"
  | "cohere"
  | "together";

export interface AIProviderConfig {
  baseUrl: string;
  model: string;
  /** True if no API key is required */
  keyOptional?: boolean;
  /** Short description shown in the picker */
  description?: string;
  /** Badge: "free" | "local" | "paid" */
  tier?: "free" | "local" | "paid";
}

export const AI_PROVIDER_DEFAULTS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    tier: "paid",
    description: "OpenAI GPT-4o and family",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    model: "claude-sonnet-4-5",
    tier: "paid",
    description: "Anthropic Claude Sonnet/Opus",
  },
  compatible: {
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    keyOptional: true,
    tier: "local",
    description: "Any OpenAI-compatible endpoint (LM Studio, etc.)",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-1.5-flash",
    tier: "free",
    description: "Google Gemini 1.5 Flash — 1M TPM free via AI Studio",
  },
  ollama: {
    baseUrl: "http://localhost:11434/v1",
    model: "llama3.2:3b",
    keyOptional: true,
    tier: "local",
    description: "Local Ollama — run models offline (no API key)",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    tier: "free",
    description: "Groq — ultra-fast inference, 10k free tokens/min",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.2-3b-instruct:free",
    tier: "free",
    description: "OpenRouter — routes to free open models",
  },
  huggingface: {
    baseUrl: "https://api-inference.huggingface.co/models",
    model: "mistralai/Mistral-7B-Instruct-v0.3",
    tier: "free",
    description: "HuggingFace Inference API — free tier",
  },
  cohere: {
    baseUrl: "https://api.cohere.ai/v1",
    model: "command-r",
    tier: "free",
    description: "Cohere Command-R — free trial tier",
  },
  together: {
    baseUrl: "https://api.together.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    tier: "free",
    description: "Together.ai — 1B free tokens on sign-up",
  },
};

/** Providers that work without any API key at all */
export const KEY_OPTIONAL_PROVIDERS: AIProvider[] = ["ollama", "compatible"];

/** Providers that have a free tier */
export const FREE_PROVIDERS: AIProvider[] = ["gemini", "groq", "openrouter", "huggingface", "cohere", "together"];

interface AIConnectionState {
  provider: AIProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
  configure: (options: Partial<Pick<AIConnectionState, "provider" | "baseUrl" | "model" | "apiKey">>) => void;
  forgetKey: () => void;
}

/** Intentionally no key persistence: keys and connection details stay in this tab. */
export const useAIConnectionStore = create<AIConnectionState>()(
  persist(
    (set) => ({
      provider: "gemini" as AIProvider,
      ...AI_PROVIDER_DEFAULTS.gemini,
      apiKey: "",
      configure: (options) => set(options),
      forgetKey: () => set({ apiKey: "" }),
    }),
    {
      name: "openreel-ai-connection",
      // Never persist the actual API key
      partialize: (state) => ({
        provider: state.provider,
        baseUrl: state.baseUrl,
        model: state.model,
      }),
    },
  ),
);

