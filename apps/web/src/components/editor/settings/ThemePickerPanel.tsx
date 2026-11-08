import React from "react";
import { ToolcraftText as Text } from "@openreel/ui";
import { Check } from "@/icons/lucide-compat";
import { useThemeStore, THEME_DEFINITIONS } from "../../../stores/theme-store";

export const ThemePickerPanel: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="space-y-3">
      <Text type="supporting" color="secondary" className="text-[11px]">
        Choose an app theme. Changes apply instantly.
      </Text>
      <div className="grid grid-cols-2 gap-2">
        {THEME_DEFINITIONS.map((theme) => {
          const isActive = mode === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setMode(theme.id)}
              aria-pressed={isActive}
              className={`relative flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-bg-2 hover:border-border-strong hover:bg-bg-3"
              }`}
            >
              {/* Color swatch */}
              <span
                className="h-6 w-6 flex-shrink-0 rounded-full border border-border-strong"
                style={{ background: theme.accent }}
              />
              <span className="flex-1 min-w-0">
                <span className="block text-[11px] font-medium text-fg truncate">
                  {theme.label}
                </span>
                <span className="block text-[9px] text-fg-muted truncate">
                  {theme.dark ? "Dark" : "Light"}
                </span>
              </span>
              {isActive && (
                <Check size={12} className="flex-shrink-0 text-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
