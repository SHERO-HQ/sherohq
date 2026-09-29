import { projects } from "../src/content/work";
import { livePages, routes } from "../src/lib/site";

/** Every page the site serves today, including one case study. */
export const pages: string[] = [...livePages, `${routes.work}/${projects[0].slug}`, "/this-page-does-not-exist"];
