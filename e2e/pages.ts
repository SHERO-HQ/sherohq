import { projects } from "../src/content/work";
import { livePages, routes } from "../src/lib/site";

/** A listing from `yarn db:seed`, which CI runs against its own local database. */
export const sampleListing = `${routes.shop}/sample-dell-latitude-7490`;

/** Every page the site serves today, including one case study and one listing. */
export const pages: string[] = [
  ...livePages,
  `${routes.work}/${projects[0].slug}`,
  sampleListing,
  routes.cart,
  "/this-page-does-not-exist",
];
