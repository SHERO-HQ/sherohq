/** Ghana's 16 regions, for checkout and delivery rates. */
export const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
] as const;

export type Region = (typeof regions)[number];

/** Delivery-rate key for doorstep delivery inside Tamale (not by bus). */
export const TAMALE_LOCAL = "Tamale (local delivery)";
