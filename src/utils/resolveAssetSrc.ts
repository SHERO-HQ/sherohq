export function resolveAssetSrc(asset: unknown): string {
  if (typeof asset === "string") {
    return asset;
  }

  if (
    asset &&
    typeof asset === "object" &&
    "src" in asset &&
    typeof (asset as { src?: unknown }).src === "string"
  ) {
    return (asset as { src: string }).src;
  }

  return "";
}
