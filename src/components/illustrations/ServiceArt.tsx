// Illustrations for the four services, drawn in SHERO's tokens so they follow
// the light and dark themes. They show the kind of work, not a real client's
// system: no names, figures or logos. Replace with real photos and screenshots
// when SHERO has them. TODO(owner)
import { cn } from "@/lib/cn";

type ArtProps = { className?: string };

function Frame({ label, className, children }: ArtProps & { label: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 400 225"
      role="img"
      aria-label={label}
      className={cn("h-auto w-full", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** A small check mark in a filled circle. */
function Tick({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} className="fill-secondary" />
      <path
        d={`M${x - r * 0.45} ${y} l${r * 0.3} ${r * 0.35} l${r * 0.6} -${r * 0.7}`}
        className="stroke-on-secondary"
        strokeWidth={1.5}
      />
    </>
  );
}

/** Custom software: a business dashboard. */
export function SoftwareArt({ className }: ArtProps) {
  const bars = [30, 44, 38, 56, 48, 64];
  return (
    <Frame label="Illustration: a business dashboard" className={className}>
      <rect x="40" y="16" width="320" height="193" rx="6" className="fill-surface-raised" />
      <rect x="40" y="36" width="64" height="173" className="fill-surface" />
      {[52, 68, 84, 100].map((y) => (
        <rect key={y} x="52" y={y} width="40" height="6" rx="3" className={y === 68 ? "fill-primary" : "fill-border"} />
      ))}
      <path d="M40 36 H360" className="stroke-border" />
      {[54, 64, 74].map((x) => (
        <circle key={x} cx={x} cy="26" r="3" className="fill-border" />
      ))}
      {[116, 196, 276].map((x) => (
        <g key={x}>
          <rect x={x} y="48" width="72" height="40" rx="4" className="fill-page stroke-border" />
          <rect x={x + 10} y="58" width="28" height="5" rx="2.5" className="fill-border" />
          <rect x={x + 10} y="70" width="40" height="8" rx="2" className="fill-heading" />
        </g>
      ))}
      <rect x="116" y="100" width="152" height="97" rx="4" className="fill-page stroke-border" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={130 + i * 21}
          y={185 - h}
          width="12"
          height={h}
          rx="2"
          className={i === bars.length - 1 ? "fill-secondary" : "fill-primary"}
        />
      ))}
      <rect x="276" y="100" width="72" height="97" rx="4" className="fill-page stroke-border" />
      {[116, 134, 152, 170].map((y) => (
        <g key={y}>
          <circle cx="288" cy={y} r="4" className="fill-secondary-subtle" />
          <rect x="298" y={y - 2.5} width="38" height="5" rx="2.5" className="fill-border" />
        </g>
      ))}
      <rect x="40" y="16" width="320" height="193" rx="6" className="stroke-border" />
    </Frame>
  );
}

/** Hardware: a tested laptop with its battery at full health. */
export function HardwareArt({ className }: ArtProps) {
  return (
    <Frame label="Illustration: a tested laptop with a full battery" className={className}>
      <rect x="110" y="20" width="180" height="120" rx="8" className="fill-surface-raised stroke-border-strong" />
      <rect x="120" y="30" width="160" height="100" rx="3" className="fill-surface" />
      <rect x="152" y="52" width="90" height="34" rx="5" className="fill-page stroke-secondary" strokeWidth={2} />
      <rect x="243" y="62" width="5" height="14" rx="2" className="fill-secondary" />
      <rect x="157" y="57" width="80" height="24" rx="3" className="fill-secondary" />
      {[100, 114].map((y) => (
        <g key={y}>
          <Tick x={160} y={y} r={4.5} />
          <rect x="170" y={y - 2.5} width="64" height="5" rx="2.5" className="fill-border" />
        </g>
      ))}
      <path d="M92 140 H308 L318 154 Q318 158 314 158 H86 Q82 158 82 154 Z" className="fill-border" />

      <rect x="28" y="104" width="100" height="84" rx="5" className="fill-surface-raised stroke-border" />
      {[122, 142, 162].map((y) => (
        <g key={y}>
          <Tick x={44} y={y} />
          <rect x="56" y={y - 3} width="56" height="6" rx="3" className="fill-border" />
        </g>
      ))}

      <rect x="272" y="118" width="100" height="68" rx="5" className="fill-surface-raised stroke-border" />
      <rect x="286" y="132" width="52" height="6" rx="3" className="fill-border" />
      <rect x="286" y="148" width="70" height="10" rx="2" className="fill-heading" />
      <rect x="286" y="166" width="44" height="9" rx="4.5" className="fill-secondary-subtle" />
    </Frame>
  );
}

/** Managed IT: an office network, every device connected and backed up. */
export function ManagedItArt({ className }: ArtProps) {
  const links = [
    "M172 106 L136 60",
    "M228 106 L264 60",
    "M172 122 L136 166",
    "M228 122 L264 166",
  ];
  const dots = [
    [154, 83],
    [246, 83],
    [154, 144],
    [246, 144],
  ];
  return (
    <Frame label="Illustration: an office network with backups" className={className}>
      {links.map((d) => (
        <path key={d} d={d} className="stroke-border-strong" strokeWidth={1.5} strokeDasharray="4 4" />
      ))}
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="fill-secondary" />
      ))}

      <path d="M184 98 V84 M216 98 V84" className="stroke-primary" strokeWidth={2} />
      <rect x="172" y="98" width="56" height="32" rx="5" className="fill-primary" />
      {[188, 200, 212].map((x) => (
        <circle key={x} cx={x} cy="114" r="2.5" className="fill-secondary-subtle" />
      ))}

      <rect x="40" y="20" width="96" height="68" rx="5" className="fill-surface-raised stroke-border" />
      <rect x="66" y="34" width="44" height="28" rx="3" className="fill-surface stroke-ink-muted" />
      <path d="M58 70 H118" className="stroke-ink-muted" strokeWidth={2} />

      <rect x="264" y="20" width="96" height="68" rx="5" className="fill-surface-raised stroke-border" />
      <rect x="290" y="32" width="44" height="30" rx="3" className="fill-surface stroke-ink-muted" />
      <path d="M312 62 V72 M300 72 H324" className="stroke-ink-muted" strokeWidth={2} />

      <rect x="40" y="138" width="96" height="68" rx="5" className="fill-surface-raised stroke-border" />
      <rect x="72" y="152" width="32" height="12" rx="1" className="fill-page stroke-ink-muted" />
      <rect x="62" y="162" width="52" height="24" rx="3" className="fill-surface stroke-ink-muted" />
      <circle cx="104" cy="170" r="2" className="fill-secondary" />

      <rect x="264" y="138" width="96" height="68" rx="5" className="fill-surface-raised stroke-border" />
      <path
        d="M292 186 H330 A12 12 0 0 0 328 162 A16 16 0 0 0 298 166 A10 10 0 0 0 292 186 Z"
        className="fill-surface stroke-ink-muted"
      />
      <path d="M312 182 V170 M306 175 L312 169 L318 175" className="stroke-secondary" strokeWidth={2} />
    </Frame>
  );
}

/** Systems integration: a MoMo payment flowing into point of sale, stock and a receipt. */
export function IntegrationArt({ className }: ArtProps) {
  return (
    <Frame label="Illustration: a mobile money payment updating sales and stock" className={className}>
      <rect x="32" y="28" width="80" height="160" rx="12" className="fill-surface-raised stroke-border-strong" />
      <rect x="40" y="44" width="64" height="128" rx="4" className="fill-surface" />
      <rect x="50" y="62" width="44" height="10" rx="2" className="fill-heading" />
      <rect x="50" y="80" width="30" height="5" rx="2.5" className="fill-border" />
      <Tick x={72} y={128} r={14} />

      <path d="M120 108 H154 M148 102 L154 108 L148 114" className="stroke-primary" strokeWidth={2} />

      <rect x="162" y="58" width="100" height="100" rx="5" className="fill-surface-raised stroke-border" />
      <path d="M162 63 A5 5 0 0 1 167 58 H257 A5 5 0 0 1 262 63 V78 H162 Z" className="fill-primary" />
      {[92, 106, 120].map((y) => (
        <g key={y}>
          <rect x="174" y={y - 2.5} width="46" height="5" rx="2.5" className="fill-border" />
          <rect x="232" y={y - 2.5} width="18" height="5" rx="2.5" className="fill-border" />
        </g>
      ))}
      <path d="M174 134 H250" className="stroke-border" />
      <rect x="206" y="140" width="44" height="8" rx="2" className="fill-heading" />

      <path d="M270 96 C284 96 282 64 296 64 M290 58 L296 64 L290 70" className="stroke-primary" strokeWidth={2} />
      <path d="M270 120 C284 120 282 152 296 152 M290 146 L296 152 L290 158" className="stroke-primary" strokeWidth={2} />

      <rect x="302" y="32" width="72" height="64" rx="5" className="fill-surface-raised stroke-border" />
      <rect x="318" y="58" width="16" height="14" rx="1" className="fill-border" />
      <rect x="336" y="58" width="16" height="14" rx="1" className="fill-border" />
      <rect x="327" y="44" width="16" height="14" rx="1" className="fill-secondary" />
      <rect x="318" y="80" width="40" height="5" rx="2.5" className="fill-border" />

      <rect x="302" y="120" width="72" height="72" rx="5" className="fill-surface-raised stroke-border" />
      <path
        d="M322 132 H354 V176 L349 172 L344 176 L339 172 L334 176 L329 172 L322 176 Z"
        className="fill-page stroke-ink-muted"
      />
      <path d="M329 144 H347 M329 152 H347 M329 160 H340" className="stroke-border-strong" strokeWidth={1.5} />
    </Frame>
  );
}
