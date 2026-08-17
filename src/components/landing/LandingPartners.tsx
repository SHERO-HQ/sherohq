import { Briefcase } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";

interface Partner {
  name: string;
  logo: string;
  logoDark?: string;
  logoClassName?: string;
}

const PARTNERS: Partner[] = [
  { name: "HP", logo: "/assets/images/partners/hp.svg" },
  { name: "Dell", logo: "/assets/images/partners/dell.svg" },
  {
    name: "Lenovo",
    logo: "/assets/images/partners/lenovo.svg",
    logoClassName: "h-4 sm:h-7",
  },
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
    logoClassName: "h-10 sm:h-[48px]",
  },
  { name: "Nvidia", logo: "/assets/images/partners/nvidia.svg" },
  { name: "Intel", logo: "/assets/images/partners/intel.svg" },
];

const logoImageClass = (logoClassName?: string) =>
  `w-auto max-w-full object-contain filter grayscale opacity-45 dark:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 ${logoClassName ?? "h-6 sm:h-12"}`;

const PartnerLogo = ({ partner }: { partner: Partner }) => (
  <div
    className="group flex flex-col items-center justify-center py-2 sm:h-20 transition-all duration-300 hover:scale-105"
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
        <SectionBadge icon={Briefcase} className="mb-4">
          Trusted Brands
        </SectionBadge>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 transition-colors duration-300 md:text-2xl dark:text-slate-100">
          Trusted Brands We Supply & Support
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
