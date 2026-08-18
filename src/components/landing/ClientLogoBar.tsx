"use client";

import React, { useMemo } from "react";
import { m } from "motion/react";
import { useClients } from "@/hooks/queries/useClients";
import { getImageUrl } from "@/services/api";

interface ClientLogo {
  id: string;
  name: string;
  logoSrc: string;
  logoDarkSrc?: string | null;
  website?: string | null;
}

export const ClientLogoBar = () => {
  const { data: dbClients = [] } = useClients();

  const clientList = useMemo<ClientLogo[]>(() => {
    if (!dbClients || dbClients.length === 0) {
      return [];
    }

    return dbClients.map((client) => ({
      id: client.id,
      name: client.name,
      logoSrc: client.logo,
      logoDarkSrc: client.logoDark,
      website: client.website,
    }));
  }, [dbClients]);

  if (clientList.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-20 overflow-hidden bg-linear-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900/35 dark:to-slate-950 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      {/* Precision Pattern Dots Grid */}
      <div className="pointer-events-none absolute inset-0 pattern-dots opacity-70" />

      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-10"
        >
          {/* Section Heading with Subtle Accent Lines */}
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-8 sm:w-14 bg-linear-to-r from-transparent to-slate-300 dark:to-slate-700" />
            <p className="text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400">
              We've Worked With
            </p>
            <span className="h-px w-8 sm:w-14 bg-linear-to-l from-transparent to-slate-300 dark:to-slate-700" />
          </div>

          {/* Logo Showcase List */}
          <ul className="flex flex-wrap items-center justify-center gap-12 sm:gap-16 md:gap-24 lg:gap-28 w-full max-w-5xl">
            {clientList.map((client) => {
              const logoUrl = getImageUrl(client.logoSrc);
              const logoDarkUrl = client.logoDarkSrc ? getImageUrl(client.logoDarkSrc) : null;

              const content = (
                <>
                  {/* Light mode logo */}
                  <img
                    src={logoUrl}
                    alt={`${client.name} logo`}
                    width={180}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className={`h-10 sm:h-12 md:h-14 w-auto max-w-[180px] sm:max-w-[220px] object-contain filter grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:drop-shadow-[0_0_12px_rgba(0,180,216,0.25)] ${logoDarkUrl
                        ? "dark:hidden block"
                        : "dark:grayscale dark:invert dark:opacity-75 dark:hover:filter-none dark:hover:opacity-100"
                      }`}
                  />

                  {/* Dedicated dark mode logo variant if provided */}
                  {logoDarkUrl && (
                    <img
                      src={logoDarkUrl}
                      alt={`${client.name} dark logo`}
                      width={180}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="h-10 sm:h-12 md:h-14 w-auto max-w-[180px] sm:max-w-[220px] object-contain filter grayscale opacity-70 transition-all duration-300 hidden dark:block hover:grayscale-0 hover:opacity-100 hover:drop-shadow-[0_0_12px_rgba(0,180,216,0.3)]"
                    />
                  )}
                </>
              );

              return (
                <li
                  key={client.id}
                  className="flex items-center justify-center transition-all duration-300 hover:scale-108 hover:-translate-y-0.5 cursor-pointer"
                  title={client.name}
                >
                  {client.website ? (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </m.div>
      </div>
    </section>
  );
};

export default ClientLogoBar;
