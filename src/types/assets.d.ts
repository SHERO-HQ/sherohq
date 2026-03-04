// Override Next.js image type declarations
// With disableStaticImages: true in next.config.ts, image imports return strings
// This must come AFTER next-env.d.ts to take effect

// CSS modules and plain CSS imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Image imports — override Next.js StaticImageData when disableStaticImages is true
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

declare module "*.avif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.ico" {
  const src: string;
  export default src;
}

declare module "*.woff2" {
  const src: string;
  export default src;
}
