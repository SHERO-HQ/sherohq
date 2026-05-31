import { Briefcase } from "lucide-react";

interface Partner {
  name: string;
  logo: string;
  logoDark?: string;
  logoClassName?: string;
}

const PARTNERS: Partner[] = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  { name: "Lenovo", logo: "/assets/images/partners/lenovo.svg" },
  { name: "JBL", logo: "/assets/images/partners/jbl.svg" },
  {
    name: "Apple",
    logo: "/assets/images/partners/apple.svg",
    logoDark: "/assets/images/partners/apple-dark.svg",
  },
  {
    name: "Samsung",
    logo: "/assets/images/partners/samsung.svg",
    logoDark: "/assets/images/partners/samsung-dark.svg",
    logoClassName: "h-8 sm:h-14",
  },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

const logoImageClass = (logoClassName?: string) =>
  `h-6 sm:h-10 w-auto max-w-full object-contain transition-transform duration-300 ${logoClassName ?? ""}`;

const PartnerLogo = ({ partner }: { partner: Partner }) => (
  <div
    className="group flex h-10 w-full items-center justify-center opacity-40 transition-all duration-300 hover:scale-105 hover:opacity-100 sm:h-16"
    title={partner.name}
  >
    <img
      src={partner.logo}
      alt={`${partner.name} logo`}
      className={`${logoImageClass(partner.logoClassName)} ${partner.logoDark ? "dark:hidden" : ""}`}
      loading="eager"
      decoding="async"
    />
    {partner.logoDark && (
      <img
        src={partner.logoDark}
        alt={`${partner.name} logo`}
        className={`${logoImageClass(partner.logoClassName)} hidden dark:block`}
        loading="eager"
        decoding="async"
      />
    )}
  </div>
);

const LandingPartners = () => {
  return (
    <section className="relative w-full overflow-hidden border-y border-slate-200 bg-white py-14 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-80 transition-opacity duration-300 dark:opacity-25" />

      <div className="container relative z-10 mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <span className="mb-4 inline-flex items-center gap-2 rounded border border-brand-secondary-500/50 bg-brand-secondary-100 px-4 py-1 text-[10px] font-semibold uppercase text-brand-secondary-600 transition-colors duration-300 dark:border-brand-secondary-800/50 dark:bg-brand-secondary-200/20 dark:text-brand-secondary-400">
          <Briefcase className="size-4" />
          Trusted Brands
        </span>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 transition-colors duration-300 md:text-2xl dark:text-slate-100">
          We Supply & Support the Best
        </h2>
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul
          className="grid grid-cols-4 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6"
          aria-label="Technology partners we supply and support"
        >
          {PARTNERS.map((partner) => (
            <li key={partner.name}>
              <PartnerLogo partner={partner} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default LandingPartners;
