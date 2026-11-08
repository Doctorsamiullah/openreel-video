import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore, THEME_DEFINITIONS } from "./theme-store";

describe("Theme Store (1 Dark Theme + 7 Colorful Light Themes)", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
  });

  it("contains exactly 1 dark theme and 7 light & colorful themes", () => {
    const darkThemes = THEME_DEFINITIONS.filter((t) => t.dark);
    const lightThemes = THEME_DEFINITIONS.filter((t) => !t.dark);

    expect(darkThemes).toHaveLength(1);
    expect(darkThemes[0].id).toBe("dark");
    expect(darkThemes[0].label).toBe("Cinematic Dark");

    expect(lightThemes).toHaveLength(7);
    const lightIds = lightThemes.map((t) => t.id);
    expect(lightIds).toContain("light");
    expect(lightIds).toContain("midnight-blue");
    expect(lightIds).toContain("sunset-orange");
    expect(lightIds).toContain("hacker-green");
    expect(lightIds).toContain("purple-haze");
    expect(lightIds).toContain("rose-gold");
    expect(lightIds).toContain("high-contrast");
  });

  it("assigns unique colorful accent colors to each theme", () => {
    const accents = THEME_DEFINITIONS.map((t) => t.accent);
    const uniqueAccents = new Set(accents);
    // At least 7 distinct accents across the 8 themes
    expect(uniqueAccents.size).toBeGreaterThanOrEqual(7);
  });

  it("removes .dark class when applying any of the 7 light & colorful themes", () => {
    const { setMode } = useThemeStore.getState();

    // Set to Ocean Blue (light & colorful)
    setMode("midnight-blue");
    expect(document.documentElement.dataset.theme).toBe("midnight-blue");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Sunset Peach (light & colorful)
    setMode("sunset-orange");
    expect(document.documentElement.dataset.theme).toBe("sunset-orange");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Botanical Mint (light & colorful)
    setMode("hacker-green");
    expect(document.documentElement.dataset.theme).toBe("hacker-green");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Lavender Lilac (light & colorful)
    setMode("purple-haze");
    expect(document.documentElement.dataset.theme).toBe("purple-haze");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Rose Quartz (light & colorful)
    setMode("rose-gold");
    expect(document.documentElement.dataset.theme).toBe("rose-gold");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Solar Gold (light & colorful)
    setMode("high-contrast");
    expect(document.documentElement.dataset.theme).toBe("high-contrast");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Set to Light Studio (light & colorful)
    setMode("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("adds .dark class only when applying the single dark theme (Cinematic Dark)", () => {
    const { setMode } = useThemeStore.getState();

    setMode("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
