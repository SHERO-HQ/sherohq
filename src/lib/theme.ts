// Light/dark theme. The system setting applies until the visitor picks a theme
// with the footer switch; that choice is stored and applied as data-theme on
// <html>. Choosing "Match my device" clears it.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "shero-theme";
const THEME_EVENT = "shero:theme";

/**
 * Runs inline in <head> before first paint, so a saved choice never flashes
 * the other theme. Keep it tiny and dependency-free.
 */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const systemQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** What the visitor chose in the footer switch: a theme, or follow the device. */
export type ThemeChoice = Theme | "system";

export function currentChoice(): ThemeChoice {
  const picked = document.documentElement.dataset.theme;
  return picked === "light" || picked === "dark" ? picked : "system";
}

export function setThemeChoice(choice: ThemeChoice) {
  const root = document.documentElement;
  try {
    if (choice === "system") {
      delete root.dataset.theme;
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      root.dataset.theme = choice;
      localStorage.setItem(THEME_STORAGE_KEY, choice);
    }
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
