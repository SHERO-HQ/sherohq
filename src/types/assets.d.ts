// Custom module declarations for assets not handled by Next.js natively

// CSS modules and plain CSS imports
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Font files
declare module "*.woff2" {
  const src: string;
  export default src;
}
