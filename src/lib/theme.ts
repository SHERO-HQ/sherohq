// Light/dark theme. The system setting applies until the visitor picks a theme
// with the toggle; that choice is stored and applied as data-theme on <html>.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "shero-theme";
const THEME_EVENT = "shero:theme";

/**
 * Runs inline in <head> before first paint, so a saved choice never flashes
 * the other theme. Keep it tiny and dependency-free.
 */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** The theme currently showing: the visitor's pick, else the system setting. */
export function currentTheme(): Theme {
  const picked = document.documentElement.dataset.theme;
  if (picked === "light" || picked === "dark") return picked;
  return systemQuery().matches ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** For useSyncExternalStore: re-read when the visitor or the system changes theme. */
export function subscribeTheme(callback: () => void) {
  const query = systemQuery();
  query.addEventListener("change", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    query.removeEventListener("change", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}
