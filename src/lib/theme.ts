export const THEMES = ["green", "amber", "ice", "paper"] as const;
export type Theme = (typeof THEMES)[number];

const KEY = "comlog:theme";

export const isTheme = (v: string): v is Theme => (THEMES as readonly string[]).includes(v);

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private mode / storage disabled — the theme just won't persist.
  }
};

export const loadTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && isTheme(saved)) return saved;
  } catch {
    /* ignore */
  }
  return "green";
};
