export const THEMES = ["midnight", "amber", "cyan", "paper"] as const;
export type Theme = (typeof THEMES)[number];

const KEY = "comlog:theme";

export const isTheme = (v: string): v is Theme => (THEMES as readonly string[]).includes(v);

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage may be unavailable in private or locked-down browsers.
  }
};

export const loadTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(KEY);
    // Keep old personal sites upgraded gracefully.
    if (saved && isTheme(saved)) return saved;
  } catch {
    // Fall through to the default palette.
  }
  return "midnight";
};
