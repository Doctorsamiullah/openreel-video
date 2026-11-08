import { useState } from "react";
import {
  useAIConnectionStore,
  AI_PROVIDER_DEFAULTS,
  FREE_PROVIDERS,
  KEY_OPTIONAL_PROVIDERS,
  type AIProvider,
} from "../../../stores/ai-connection-store";

const inputClass =
  "mt-1.5 w-full rounded-md border border-border bg-bg-2 px-3 py-2 text-sm text-fg focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50";

const PROVIDER_GROUPS: Array<{
  label: string;
  providers: Array<{ id: AIProvider; label: string; badge?: string; badgeColor?: string }>;
}> = [
  {
    label: "🆓 Free Providers",
    providers: [
      { id: "gemini",      label: "Google Gemini (AI Studio)", badge: "Free 1M TPM", badgeColor: "bg-blue-500/20 text-blue-300" },
      { id: "groq",        label: "Groq",                      badge: "Free 10k/min", badgeColor: "bg-orange-500/20 text-orange-300" },
      { id: "openrouter",  label: "OpenRouter",                badge: "Free models",  badgeColor: "bg-purple-500/20 text-purple-300" },
      { id: "huggingface", label: "HuggingFace Inference",     badge: "Free tier",    badgeColor: "bg-yellow-500/20 text-yellow-300" },
      { id: "cohere",      label: "Cohere",                    badge: "Free trial",   badgeColor: "bg-teal-500/20 text-teal-300" },
      { id: "together",    label: "Together.ai",               badge: "1B free",      badgeColor: "bg-green-500/20 text-green-300" },
    ],
  },
  {
    label: "💻 Local (No API Key)",
    providers: [
      { id: "ollama",     label: "Ollama",     badge: "Local",    badgeColor: "bg-accent-soft text-accent" },
      { id: "compatible", label: "LM Studio / Compatible", badge: "Local", badgeColor: "bg-accent-soft text-accent" },
    ],
  },
  {
    label: "☁️ Paid Providers",
    providers: [
      { id: "openai",    label: "OpenAI"    },
      { id: "anthropic", label: "Anthropic" },
    ],
  },
];

const PROVIDER_DOCS: Partial<Record<AIProvider, { url: string; label: string }>> = {
  gemini:      { url: "https://aistudio.google.com/app/apikey",   label: "Get free Gemini key" },
  groq:        { url: "https://console.groq.com/keys",             label: "Get free Groq key" },
  openrouter:  { url: "https://openrouter.ai/settings/keys",       label: "Get OpenRouter key" },
  huggingface: { url: "https://huggingface.co/settings/tokens",    label: "Get HF token" },
  cohere:      { url: "https://dashboard.cohere.com/api-keys",     label: "Get Cohere key" },
  together:    { url: "https://api.together.ai/settings/api-keys", label: "Get Together key" },
  openai:      { url: "https://platform.openai.com/api-keys",      label: "OpenAI Platform" },
  anthropic:   { url: "https://console.anthropic.com/settings/keys", label: "Anthropic Console" },
};

export function AIConnectionPanel({ disabled = false }: { disabled?: boolean }) {
  const connection = useAIConnectionStore();
  const [showKey, setShowKey] = useState(false);

  const def = AI_PROVIDER_DEFAULTS[connection.provider];
  const isKeyOptional = KEY_OPTIONAL_PROVIDERS.includes(connection.provider);
  const isFree = FREE_PROVIDERS.includes(connection.provider);
  const docs = PROVIDER_DOCS[connection.provider];

  return (
    <div className="space-y-4 text-xs">
      {/* Provider picker */}
      <div>
        <label className="block text-fg-2 font-medium mb-1.5">AI Provider</label>
        <div className="space-y-3">
          {PROVIDER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-fg-muted uppercase tracking-wider mb-1.5">{group.label}</p>
              <div className="grid grid-cols-1 gap-1">
                {group.providers.map(({ id, label, badge, badgeColor }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => connection.configure({ provider: id, ...AI_PROVIDER_DEFAULTS[id], apiKey: "" })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
                      connection.provider === id
                        ? "border-accent bg-accent-soft text-fg font-medium"
                        : "border-border bg-bg-2 text-fg-2 hover:border-border-strong hover:bg-bg-3"
                    } disabled:opacity-50`}
                  >
                    <span className="flex-1 truncate text-[11px]">{label}</span>
                    {badge && (
                      <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${badgeColor ?? "bg-bg-3 text-fg-3"}`}>
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider description */}
      {def.description && (
        <p className="text-[11px] text-fg-muted leading-relaxed rounded-md border border-border bg-bg-2 px-3 py-2">
          {def.description}
        </p>
      )}

      {/* Config fields */}
      <div className="space-y-3">
        <label className="block text-fg-2">
          Model ID
          <input
            aria-label="AI model ID"
            className={inputClass}
            disabled={disabled}
            value={connection.model}
            onChange={(e) => connection.configure({ model: e.target.value })}
            spellCheck={false}
          />
        </label>

        <label className="block text-fg-2">
          Base URL
          <input
            aria-label="AI base URL"
            className={inputClass}
            disabled={disabled}
            value={connection.baseUrl}
            onChange={(e) => connection.configure({ baseUrl: e.target.value })}
            spellCheck={false}
          />
        </label>

        {!isKeyOptional && (
          <label className="block text-fg-2">
            API Key {isKeyOptional && <span className="text-fg-muted">(optional)</span>}
            <div className="relative">
              <input
                aria-label="Session API key"
                type={showKey ? "text" : "password"}
                autoComplete="off"
                className={`${inputClass} pr-10`}
                disabled={disabled}
                value={connection.apiKey}
                onChange={(e) => connection.configure({ apiKey: e.target.value })}
                placeholder={isFree ? "Paste free API key here" : "sk-…"}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg text-[10px]"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </label>
        )}

        {connection.apiKey && (
          <button type="button" disabled={disabled} className="text-accent underline text-[11px]" onClick={connection.forgetKey}>
            Forget key
          </button>
        )}
      </div>

      {/* Quick links */}
      {docs && (
        <a
          href={docs.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-accent underline text-[11px] w-fit"
        >
          {docs.label} ↗
        </a>
      )}

      <p className="text-[11px] leading-relaxed text-fg-muted border-t border-border pt-3">
        Your key stays in this tab and clears on reload. Requests go directly to your provider.
        Local endpoints (Ollama, LM Studio) work offline with no API key.
      </p>
    </div>
  );
}
