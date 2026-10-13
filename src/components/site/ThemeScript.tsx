export const THEME_STORAGE_KEY = "shero-theme";

/**
 * Applies a saved theme before first paint so there is no flash.
 * Without a saved choice the site follows the system setting.
 */
export function ThemeScript() {
  const code = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
