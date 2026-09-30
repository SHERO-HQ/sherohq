/** "Chrome on Android" from a user agent, enough to recognise a device. */
export function deviceName(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : "A browser";
  const system = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad/.test(userAgent)
      ? "iPhone or iPad"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X/.test(userAgent)
          ? "Mac"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "another system";
  return `${browser} on ${system}`;
}
