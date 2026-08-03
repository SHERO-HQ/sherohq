/**
 * Ghana regions and their major cities/towns.
 * Used for cascading region → city dropdowns in checkout.
 */

export interface GhanaRegion {
  value: string;
  label: string;
  cities: string[];
  /** Estimated delivery time from Tamale (Northern Region HQ) */
  deliveryEstimate: string;
}

export const GHANA_REGIONS: GhanaRegion[] = [
  {
    value: "Northern",
    label: "Northern",
    deliveryEstimate: "Same day delivery",
    cities: [
      "Tamale",
      "Yendi",
      "Savelugu",
      "Damongo",
      "Bimbilla",
      "Karaga",
      "Gushegu",
      "Zabzugu",
      "Kumbungu",
      "Tolon",
      "Sagnarigu",
      "Mion",
      "Nanton",
      "Tatale",
    ],
  },
  {
    value: "Savannah",
    label: "Savannah",
    deliveryEstimate: "24hrs – 2 days",
    cities: [
      "Damongo",
      "Bole",
      "Salaga",
      "Sawla",
      "Buipe",
      "Yapei",
    ],
  },
  {
    value: "North East",
    label: "North East",
    deliveryEstimate: "24hrs – 2 days",
    cities: [
      "Nalerigu",
      "Gambaga",
      "Walewale",
      "Chereponi",
      "Yunyoo",
    ],
  },
  {
    value: "Upper East",
    label: "Upper East",
    deliveryEstimate: "24hrs – 2 days",
    cities: [
      "Bolgatanga",
      "Navrongo",
      "Bawku",
      "Paga",
      "Zebilla",
      "Sandema",
      "Tongo",
      "Sirigu",
    ],
  },
  {
    value: "Upper West",
    label: "Upper West",
    deliveryEstimate: "24hrs – 2 days",
    cities: [
      "Wa",
      "Tumu",
      "Lawra",
      "Nandom",
      "Jirapa",
      "Nadowli",
      "Lambussie",
      "Sissala",
    ],
  },
  {
    value: "Bono",
    label: "Bono",
    deliveryEstimate: "2–3 days",
    cities: [
      "Sunyani",
      "Berekum",
      "Dormaa Ahenkro",
      "Wenchi",
      "Japekrom",
      "Sampa",
    ],
  },
  {
    value: "Bono East",
    label: "Bono East",
    deliveryEstimate: "2–3 days",
    cities: [
      "Techiman",
      "Kintampo",
      "Nkoranza",
      "Atebubu",
      "Yeji",
      "Prang",
    ],
  },
  {
    value: "Ahafo",
    label: "Ahafo",
    deliveryEstimate: "2–3 days",
    cities: [
      "Goaso",
      "Bechem",
      "Duayaw Nkwanta",
      "Kenyasi",
      "Kukuom",
    ],
  },
  {
    value: "Ashanti",
    label: "Ashanti",
    deliveryEstimate: "2–3 days",
    cities: [
      "Kumasi",
      "Obuasi",
      "Ejisu",
      "Konongo",
      "Mampong",
      "Bekwai",
      "Agogo",
      "Mankranso",
      "Offinso",
      "Juaben",
      "Tepa",
      "Nkawie",
    ],
  },
  {
    value: "Oti",
    label: "Oti",
    deliveryEstimate: "2–3 days",
    cities: [
      "Dambai",
      "Jasikan",
      "Kadjebi",
      "Nkwanta",
      "Krachi",
    ],
  },
  {
    value: "Greater Accra",
    label: "Greater Accra",
    deliveryEstimate: "2–5 days",
    cities: [
      "Accra",
      "Tema",
      "Madina",
      "Nungua",
      "Teshie",
      "Kasoa",
      "Ashaiman",
      "Dodowa",
      "Prampram",
      "Ada",
      "Amasaman",
      "Weija",
    ],
  },
  {
    value: "Eastern",
    label: "Eastern",
    deliveryEstimate: "2–5 days",
    cities: [
      "Koforidua",
      "Nkawkaw",
      "Nsawam",
      "Suhum",
      "Akim Oda",
      "Kade",
      "Akropong",
      "Aburi",
      "Donkorkrom",
      "Mpraeso",
      "Kibi",
      "Begoro",
    ],
  },
  {
    value: "Central",
    label: "Central",
    deliveryEstimate: "2–5 days",
    cities: [
      "Cape Coast",
      "Winneba",
      "Kasoa",
      "Mankessim",
      "Saltpond",
      "Dunkwa-on-Offin",
      "Elmina",
      "Agona Swedru",
      "Assin Fosu",
    ],
  },
  {
    value: "Western",
    label: "Western",
    deliveryEstimate: "2–5 days",
    cities: [
      "Takoradi",
      "Sekondi",
      "Tarkwa",
      "Axim",
      "Prestea",
      "Bogoso",
      "Elubo",
      "Agona Nkwanta",
    ],
  },
  {
    value: "Western North",
    label: "Western North",
    deliveryEstimate: "2–5 days",
    cities: [
      "Sefwi Wiawso",
      "Bibiani",
      "Juaboso",
      "Enchi",
      "Akontombra",
      "Dadieso",
    ],
  },
  {
    value: "Volta",
    label: "Volta",
    deliveryEstimate: "2–5 days",
    cities: [
      "Ho",
      "Hohoe",
      "Keta",
      "Anloga",
      "Kpando",
      "Sogakope",
      "Aflao",
      "Akatsi",
      "Adidome",
      "Peki",
    ],
  },
];

/** Flat list of all region values for Zod validation */
export const GHANA_REGION_VALUES = GHANA_REGIONS.map((r) => r.value);

/** Get cities for a given region */
export function getCitiesForRegion(region: string): string[] {
  return GHANA_REGIONS.find((r) => r.value === region)?.cities ?? [];
}

/** Get delivery estimate for a given region */
export function getDeliveryEstimate(region: string): string | null {
  return GHANA_REGIONS.find((r) => r.value === region)?.deliveryEstimate ?? null;
}
