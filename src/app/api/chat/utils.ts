export function getVariantTokens(token: string): string[] {
  const variants = [token];
  if (token.endsWith("es") && token.length > 4) {
    variants.push(token.slice(0, -2)); // e.g. switches -> switch
  } else if (token.endsWith("s") && token.length > 3) {
    variants.push(token.slice(0, -1)); // e.g. laptops -> laptop
  }
  return variants;
}
