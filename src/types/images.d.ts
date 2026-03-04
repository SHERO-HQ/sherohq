/**
 * Override Next.js static image import types.
 *
 * In Next.js, importing an image file returns a `StaticImageData` object
 * with { src, width, height, blurDataURL }. In Vite, it returns a string URL.
 *
 * This declaration makes TypeScript treat image imports as `string | StaticImageData`,
 * compatible with both `<img src={...}>` and `<Image src={...}>`.
 */
declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.webp" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.ico" {
  const value: string;
  export default value;
}

declare module "*.woff2" {
  const value: string;
  export default value;
}
