// SHERO's illustrations, drawn in design tokens so they follow the light and
// dark themes. They show the kind of work, not a real client's system: no
// names, figures or logos. Swap in real photos and screenshots when SHERO has
// them. TODO(owner)
import { cn } from "@/lib/cn";

type ArtProps = { className?: string };

function Frame({
  label,
  viewBox = "0 0 400 225",
  className,
  children,
}: ArtProps & { label: string; viewBox?: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      // An empty label means pure decoration beside a text label that says the same.
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      // Full width by default; a caller that sizes the art replaces this.
      className={className ?? "h-auto w-full"}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** A raised panel with a soft shadow, the building block of every scene. */
function Panel({ x, y, w, h, r = 6, tone = "raised" }: { x: number; y: number; w: number; h: number; r?: number; tone?: "raised" | "page" }) {
  return (
    <>
      <rect x={x + 1} y={y + 4} width={w} height={h} rx={r} className="fill-ink" opacity={0.06} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        className={cn(tone === "raised" ? "fill-surface-raised" : "fill-page", "stroke-border")}
      />
    </>
  );
}

/** A line of placeholder text. */
function Line({ x, y, w, h = 5, tone = "muted" }: { x: number; y: number; w: number; h?: number; tone?: "muted" | "strong" | "brand" | "good" }) {
  const fill = { muted: "fill-border", strong: "fill-heading", brand: "fill-primary", good: "fill-secondary" }[tone];
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={fill} />;
}

/** A check mark in a filled circle. */
function Tick({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} className="fill-secondary" />
      <path
        d={`M${x - r * 0.45} ${y} l${r * 0.3} ${r * 0.35} l${r * 0.6} -${r * 0.7}`}
        className="stroke-on-secondary"
        strokeWidth={Math.max(1.25, r * 0.28)}
      />
    </>
  );
}

// ── Services ────────────────────────────────────────────────────────────────

/** Custom software: a business dashboard with a new order arriving. */
export function SoftwareArt({ className }: ArtProps) {
  const bars = [26, 40, 34, 52, 44, 62];
  return (
    <Frame label="Illustration: a business dashboard" className={className}>
      <Panel x={36} y={18} w={300} h={186} />
      <rect x="36.5" y="38" width="62" height="165.5" className="fill-surface" />
      <path d="M36.5 38 H335.5" className="stroke-border" />
      {[48, 58, 68].map((x) => (
        <circle key={x} cx={x} cy="28" r="3" className="fill-border" />
      ))}
      <rect x="46" y="50" width="42" height="12" rx="3" className="fill-primary" opacity={0.12} />
      <Line x={52} y={53.5} w={30} tone="brand" />
      {[72, 88, 104, 120].map((y) => (
        <Line key={y} x={52} y={y} w={y === 104 ? 22 : 30} />
      ))}

      <Line x={112} y={50} w={60} h={7} tone="strong" />
      {[112, 186, 260].map((x, i) => (
        <g key={x}>
          <rect x={x} y="66" width="64" height="40" rx="5" className="fill-page stroke-border" />
          <Line x={x + 10} y={75} w={26} />
          <Line x={x + 10} y={87} w={i === 1 ? 30 : 38} h={8} tone="strong" />
        </g>
      ))}
      <rect x="112" y="116" width="138" height="78" rx="5" className="fill-page stroke-border" />
      <path d="M122 176 H240" className="stroke-border" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={126 + i * 19}
          y={176 - h * 0.85}
          width="11"
          height={h * 0.85}
          rx="2"
          className={i === bars.length - 1 ? "fill-secondary" : "fill-primary"}
          opacity={i === bars.length - 1 ? 1 : 0.35 + i * 0.12}
        />
      ))}
      <rect x="258" y="116" width="66" height="78" rx="5" className="fill-page stroke-border" />
      {[130, 146, 162, 178].map((y) => (
        <g key={y}>
          <circle cx="269" cy={y} r="3.5" className="fill-secondary" opacity={0.35} />
          <Line x={277} y={y - 2.5} w={36} />
        </g>
      ))}

      <Panel x={276} y={140} w={96} h={42} />
      <Tick x={292} y={161} r={8} />
      <Line x={306} y={152} w={48} h={6} tone="strong" />
      <Line x={306} y={164} w={34} />
    </Frame>
  );
}

/** Hardware: a tested laptop, its check passed and its battery full. */
export function HardwareArt({ className }: ArtProps) {
  return (
    <Frame label="Illustration: a tested laptop with a full battery" className={className}>
      <rect x="111" y="24" width="180" height="118" rx="8" className="fill-ink" opacity={0.06} />
      <rect x="110" y="20" width="180" height="118" rx="8" className="fill-surface-raised stroke-border-strong" />
      <rect x="120" y="30" width="160" height="98" rx="3" className="fill-surface" />
      <rect x="152" y="50" width="92" height="34" rx="6" className="fill-page stroke-secondary" strokeWidth={2} />
      <rect x="245" y="60" width="5" height="14" rx="2" className="fill-secondary" />
      <rect x="157" y="55" width="82" height="24" rx="3" className="fill-secondary" />
      {[98, 112].map((y) => (
        <g key={y}>
          <Tick x={160} y={y} r={4.5} />
          <Line x={170} y={y - 2.5} w={y === 98 ? 62 : 48} />
        </g>
      ))}
      <path d="M92 138 H308 L320 154 Q321 158 316 158 H84 Q79 158 80 154 Z" className="fill-surface-raised stroke-border-strong" />
      {[143, 148].map((y) => (
        <path key={y} d={`M${y === 143 ? 120 : 116} ${y} H${y === 143 ? 280 : 284}`} className="stroke-border" strokeDasharray="6 3" />
      ))}
      <rect x="178" y="152" width="44" height="3" rx="1.5" className="fill-border" />

      <Panel x={26} y={100} w={104} h={86} />
      <Line x={40} y={112} w={44} h={6} tone="strong" />
      {[134, 152, 170].map((y) => (
        <g key={y}>
          <Tick x={44} y={y} />
          <Line x={56} y={y - 2.5} w={y === 152 ? 44 : 56} />
        </g>
      ))}

      <Panel x={274} y={112} w={100} h={74} />
      <circle cx="360" cy="126" r="4" className="fill-page stroke-border" />
      <Line x={288} y={124} w={50} />
      <Line x={288} y={140} w={70} h={10} tone="strong" />
      <rect x="288" y="160" width="46" height="12" rx="6" className="fill-secondary" opacity={0.18} />
      <Line x={296} y={164} w={30} h={4} tone="good" />
    </Frame>
  );
}

/** Managed IT: an office network, every device connected and backed up. */
export function ManagedItArt({ className }: ArtProps) {
  const links = ["M172 104 L138 64", "M228 104 L262 64", "M172 124 L138 164", "M228 124 L262 164"];
  const dots = [
    [155, 84],
    [245, 84],
    [155, 144],
    [245, 144],
  ];
  return (
    <Frame label="Illustration: an office network with backups" className={className}>
      {links.map((d) => (
        <path key={d} d={d} className="stroke-border-strong" strokeWidth={1.5} strokeDasharray="3 4" />
      ))}
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" className="fill-secondary stroke-page" strokeWidth={2} />
      ))}

      <path d="M186 96 V80 M214 96 V80" className="stroke-primary" strokeWidth={2.5} />
      <rect x="171" y="100" width="58" height="32" rx="7" className="fill-ink" opacity={0.08} />
      <rect x="170" y="96" width="60" height="32" rx="7" className="fill-primary" />
      {[186, 198, 210].map((x, i) => (
        <circle key={x} cx={x} cy="112" r="2.5" className={i === 0 ? "fill-secondary" : "fill-on-primary"} opacity={i === 0 ? 1 : 0.7} />
      ))}

      <Panel x={40} y={20} w={98} h={68} />
      <rect x="66" y="34" width="46" height="28" rx="3" className="fill-surface stroke-ink-muted" />
      <path d="M58 70 H120" className="stroke-ink-muted" strokeWidth={2.5} />

      <Panel x={262} y={20} w={98} h={68} />
      <rect x="288" y="31" width="46" height="30" rx="3" className="fill-surface stroke-ink-muted" />
      <path d="M311 61 V71 M299 72 H323" className="stroke-ink-muted" strokeWidth={2} />

      <Panel x={40} y={138} w={98} h={68} />
      <rect x="72" y="151" width="34" height="13" rx="1" className="fill-page stroke-ink-muted" />
      <rect x="62" y="161" width="54" height="24" rx="4" className="fill-surface stroke-ink-muted" />
      <Line x={70} y={176} w={20} h={3} />
      <circle cx="106" cy="170" r="2.5" className="fill-secondary" />

      <Panel x={262} y={138} w={98} h={68} />
      <path
        d="M290 188 H330 A12 12 0 0 0 328 164 A16 16 0 0 0 297 167 A11 11 0 0 0 290 188 Z"
        className="fill-surface stroke-ink-muted"
      />
      <path d="M311 183 V171 M305 176 L311 170 L317 176" className="stroke-secondary" strokeWidth={2} />
    </Frame>
  );
}

/** Systems integration: a MoMo payment flowing into point of sale, stock and a receipt. */
export function IntegrationArt({ className }: ArtProps) {
  return (
    <Frame label="Illustration: a mobile money payment updating sales and stock" className={className}>
      <rect x="33" y="30" width="80" height="162" rx="14" className="fill-ink" opacity={0.06} />
      <rect x="32" y="26" width="80" height="162" rx="14" className="fill-surface-raised stroke-border-strong" />
      <rect x="40" y="40" width="64" height="134" rx="6" className="fill-surface" />
      <rect x="62" y="31" width="20" height="3" rx="1.5" className="fill-border" />
      <Line x={50} y={56} w={24} />
      <Line x={50} y={66} w={44} h={10} tone="strong" />
      <Tick x={72} y={118} r={15} />
      <Line x={52} y={146} w={40} />
      <Line x={58} y={156} w={28} />

      {/* Payment to point of sale: starts on the phone's edge, ends on the till's. */}
      <circle cx="112" cy="107" r="3" className="fill-primary" />
      <path d="M112 107 H152" className="stroke-primary" strokeWidth={2} />
      <path d="M152 101.5 L160 107 L152 112.5 Z" className="fill-primary" />

      <Panel x={160} y={58} w={102} h={100} />
      <path d="M160 64 A6 6 0 0 1 166 58 H256 A6 6 0 0 1 262 64 V78 H160 Z" className="fill-primary" />
      <Line x={170} y={66} w={28} h={4} tone="muted" />
      {[92, 106, 120].map((y, i) => (
        <g key={y}>
          <Line x={172} y={y - 2.5} w={[46, 38, 42][i]} />
          <Line x={234} y={y - 2.5} w={18} />
        </g>
      ))}
      <path d="M172 134 H252" className="stroke-border" />
      <Line x={172} y={141} w={20} />
      <Line x={208} y={140} w={44} h={8} tone="strong" />

      {/* Point of sale to stock and receipt: one trunk that splits, rounded elbows. */}
      <circle cx="262" cy="108" r="3" className="fill-primary" />
      <path
        d="M262 108 H276 Q282 108 282 102 V71 Q282 65 288 65 H293 M276 108 Q282 108 282 114 V149 Q282 155 288 155 H293"
        className="stroke-primary"
        strokeWidth={2}
      />
      <path d="M292 59.5 L300 65 L292 70.5 Z" className="fill-primary" />
      <path d="M292 149.5 L300 155 L292 160.5 Z" className="fill-primary" />

      <Panel x={300} y={32} w={74} h={66} />
      <rect x="317" y="60" width="17" height="15" rx="1.5" className="fill-border" />
      <rect x="336" y="60" width="17" height="15" rx="1.5" className="fill-border" />
      <rect x="326" y="44" width="17" height="15" rx="1.5" className="fill-secondary" />
      <Line x={316} y={84} w={42} />

      <Panel x={300} y={118} w={74} h={74} />
      <path
        d="M320 130 H354 V176 L348.5 172 L343 176 L337.5 172 L332 176 L326.5 172 L320 176 Z"
        className="fill-page stroke-ink-muted"
      />
      <path d="M327 142 H347 M327 150 H347 M327 158 H339" className="stroke-border-strong" strokeWidth={1.5} />
    </Frame>
  );
}

// ── Product spots (Our own products) ──────────────────────────────────────────────

const spotBox = "0 0 160 88";

/** A phone with chat messages and the order they became. */
export function SocialSpot({ className }: ArtProps) {
  return (
    <Frame label="" viewBox={spotBox} className={className}>
      <rect x="54" y="6" width="52" height="78" rx="9" className="fill-surface-raised stroke-border-strong" />
      <rect x="59" y="14" width="42" height="62" rx="4" className="fill-surface" />
      <rect x="64" y="20" width="26" height="10" rx="5" className="fill-border" />
      <rect x="70" y="34" width="26" height="10" rx="5" className="fill-merchander" />
      <rect x="64" y="48" width="20" height="10" rx="5" className="fill-border" />
      <rect x="92" y="46" width="42" height="30" rx="5" className="fill-surface-raised stroke-border" />
      {/* A parcel: the order that came in through the chat. */}
      <path d="M99 56 L109 52 L119 56 V68 L109 72 L99 68 Z" className="fill-merchander" opacity={0.2} />
      <path d="M99 56 L109 60 L119 56 M109 60 V72 M99 56 L109 52 L119 56 V68 L109 72 L99 68 Z" className="stroke-merchander" strokeWidth={1.5} />
      <Line x={121} y={58} w={8} h={4} />
      <Line x={121} y={65} w={6} h={4} />
    </Frame>
  );
}

/** A medicine bottle, a pill and a claim form. */
export function PharmacySpot({ className }: ArtProps) {
  return (
    <Frame label="" viewBox={spotBox} className={className}>
      <rect x="86" y="14" width="44" height="60" rx="4" className="fill-surface-raised stroke-border" />
      <Line x={94} y={24} w={24} h={4} tone="strong" />
      <Line x={94} y={34} w={28} h={3} />
      <Line x={94} y={42} w={22} h={3} />
      <Line x={94} y={50} w={26} h={3} />
      <rect x="94" y="58" width="20" height="8" rx="4" className="fill-pharmasyst" opacity={0.25} />
      <rect x="36" y="18" width="32" height="10" rx="2" className="fill-border" />
      <rect x="34" y="28" width="36" height="48" rx="6" className="fill-surface-raised stroke-border-strong" />
      <rect x="40" y="40" width="24" height="22" rx="2" className="fill-surface" />
      <path d="M52 45 V57 M46 51 H58" className="stroke-pharmasyst" strokeWidth={2.5} />
      <g transform="rotate(-35 76 74)">
        <rect x="66" y="69" width="22" height="10" rx="5" className="fill-surface-raised stroke-border-strong" />
        <path d="M77 69 V79" className="stroke-border-strong" />
        <path d="M67 74 A5 5 0 0 1 72 69 H77 V79 H72 A5 5 0 0 1 67 74 Z" className="fill-pharmasyst" />
      </g>
    </Frame>
  );
}

/** A plain app window in the product's own colour, for products without a drawn spot. */
export function ProductSpot({ className }: ArtProps) {
  return (
    <Frame label="" viewBox={spotBox} className={className}>
      <rect x="30" y="10" width="100" height="68" rx="6" className="fill-surface-raised stroke-border-strong" />
      <path d="M30 24 H130" className="stroke-border" />
      <circle cx="39" cy="17" r="2" className="fill-border" />
      <circle cx="46" cy="17" r="2" className="fill-border" />
      <rect x="38" y="32" width="26" height="38" rx="3" className="fill-surface" />
      <Line x={42} y={37} w={16} h={4} tone="strong" />
      <Line x={42} y={46} w={18} h={3} />
      <Line x={42} y={53} w={14} h={3} />
      <rect x="72" y="32" width="50" height="16" rx="3" className="fill-product-accent" opacity={0.18} />
      <Line x={78} y={38} w={24} h={4} />
      <rect x="72" y="54" width="50" height="16" rx="3" className="fill-surface stroke-border" />
      <rect x="78" y="60" width="22" height="4" rx="2" className="fill-product-accent" />
    </Frame>
  );
}

// ── Home hero ──────────────────────────────────────────────────────────────

/** What SHERO does, in one scene: a business dashboard, a tested laptop and a MoMo payment. */
export function HeroArt({ className }: ArtProps) {
  const bars = [30, 46, 38, 58, 50, 70, 84];
  return (
    <Frame
      label="Illustration: a business dashboard, a tested laptop and a mobile money payment"
      viewBox="0 0 480 400"
      className={className}
    >
      {/* The dashboard, at the back. */}
      <Panel x={70} y={24} w={390} h={250} r={8} />
      <rect x="70.5" y="48" width="70" height="225.5" className="fill-surface" />
      <path d="M70.5 48 H459.5" className="stroke-border" />
      {[84, 94, 104].map((x) => (
        <circle key={x} cx={x} cy="36" r="3" className="fill-border" />
      ))}
      <rect x="80" y="60" width="50" height="14" rx="3" className="fill-primary" opacity={0.12} />
      <Line x={86} y={64.5} w={36} tone="brand" />
      {[88, 104, 120, 136].map((y) => (
        <Line key={y} x={86} y={y} w={y === 120 ? 24 : 36} />
      ))}
      <Line x={156} y={62} w={80} h={8} tone="strong" />
      {[156, 256, 356].map((x, i) => (
        <g key={x}>
          <rect x={x} y="80" width="88" height="48" rx="5" className="fill-page stroke-border" />
          <Line x={x + 12} y={91} w={34} />
          <Line x={x + 12} y={105} w={i === 1 ? 40 : 52} h={9} tone="strong" />
        </g>
      ))}
      <rect x="156" y="140" width="184" height="120" rx="5" className="fill-page stroke-border" />
      <path d="M168 246 H328" className="stroke-border" />
      {bars.map((h, i) => (
        <rect
          key={i}
          x={172 + i * 22}
          y={246 - h}
          width="12"
          height={h}
          rx="2"
          className={i === bars.length - 1 ? "fill-secondary" : "fill-primary"}
          opacity={i === bars.length - 1 ? 1 : 0.3 + i * 0.1}
        />
      ))}
      <rect x="352" y="140" width="96" height="120" rx="5" className="fill-page stroke-border" />
      {[158, 178, 198, 218, 238].map((y) => (
        <g key={y}>
          <circle cx="366" cy={y} r="4" className="fill-secondary" opacity={0.35} />
          <Line x={376} y={y - 2.5} w={y === 198 ? 40 : 56} />
        </g>
      ))}

      {/* A tested laptop, front left. */}
      <rect x="41" y="197" width="188" height="122" rx="8" className="fill-ink" opacity={0.07} />
      <rect x="40" y="192" width="188" height="122" rx="8" className="fill-surface-raised stroke-border-strong" />
      <rect x="50" y="202" width="168" height="102" rx="3" className="fill-surface" />
      <rect x="86" y="224" width="94" height="36" rx="6" className="fill-page stroke-secondary" strokeWidth={2} />
      <rect x="181" y="235" width="5" height="14" rx="2" className="fill-secondary" />
      <rect x="91" y="229" width="84" height="26" rx="3" className="fill-secondary" />
      {[276, 290].map((y) => (
        <g key={y}>
          <Tick x={94} y={y} r={4.5} />
          <Line x={104} y={y - 2.5} w={y === 276 ? 70 : 54} />
        </g>
      ))}
      <path d="M24 314 H244 L256 330 Q257 334 252 334 H16 Q11 334 12 330 Z" className="fill-surface-raised stroke-border-strong" />
      <rect x="112" y="328" width="44" height="3" rx="1.5" className="fill-border" />

      {/* A MoMo payment, front right. */}
      <rect x="351" y="156" width="104" height="206" rx="16" className="fill-ink" opacity={0.07} />
      <rect x="350" y="150" width="104" height="206" rx="16" className="fill-surface-raised stroke-border-strong" />
      <rect x="360" y="168" width="84" height="172" rx="6" className="fill-surface" />
      <rect x="392" y="156" width="20" height="4" rx="2" className="fill-border" />
      <Line x={372} y={186} w={30} />
      <Line x={372} y={198} w={58} h={12} tone="strong" />
      <Tick x={402} y={262} r={18} />
      <Line x={376} y={300} w={52} />
      <Line x={384} y={312} w={36} />

      {/* Done: floating over the dashboard's edge. */}
      <Panel x={18} y={72} w={150} h={52} />
      <Tick x={40} y={98} r={10} />
      <Line x={58} y={88} w={82} h={7} tone="strong" />
      <Line x={58} y={102} w={56} />
    </Frame>
  );
}

/** The closing call to action: a WhatsApp-style chat and the booked consultation. */
export function ConsultArt({ className }: ArtProps) {
  return (
    <Frame label="" viewBox="0 0 400 260" className={className}>
      {/* The chat, at the back. */}
      <Panel x={24} y={16} w={236} h={228} r={10} />
      <rect x="24.5" y="16.5" width="235" height="40" rx="9.5" className="fill-surface" />
      <rect x="24.5" y="46" width="235" height="10.5" className="fill-surface" />
      <path d="M24.5 56.5 H259.5" className="stroke-border" />
      <circle cx="46" cy="36.5" r="9" className="fill-secondary" />
      <Line x={62} y={30} w={64} h={6} tone="strong" />
      <Line x={62} y={40} w={40} />

      {/* Their question, our reply, their thanks. */}
      <rect x="40" y="72" width="150" height="40" rx="10" className="fill-surface stroke-border" />
      <Line x={52} y={84} w={120} />
      <Line x={52} y={96} w={82} />
      <rect x="92" y="124" width="152" height="48" rx="10" className="fill-primary" />
      <rect x="104" y="136" width="126" height="5" rx="2.5" className="fill-on-primary" opacity={0.85} />
      <rect x="104" y="148" width="98" height="5" rx="2.5" className="fill-on-primary" opacity={0.85} />
      <rect x="104" y="160" width="60" height="5" rx="2.5" className="fill-on-primary" opacity={0.5} />
      <rect x="40" y="184" width="104" height="30" rx="10" className="fill-surface stroke-border" />
      <Line x={52} y={196.5} w={72} />

      {/* The consultation, booked: a calendar card over the chat's edge. */}
      <Panel x={228} y={70} w={148} h={132} r={8} />
      <rect x="228.5" y="70.5" width="147" height="28" rx="7.5" className="fill-primary" />
      <rect x="228.5" y="90" width="147" height="8.5" className="fill-primary" />
      <rect x="240" y="81" width="52" height="6" rx="3" className="fill-on-primary" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3, 4].map((col) => {
          const booked = row === 1 && col === 3;
          const x = 244 + col * 24;
          const y = 114 + row * 22;
          return booked ? (
            <Tick key={`${row}-${col}`} x={x + 6} y={y + 6} r={8} />
          ) : (
            <rect key={`${row}-${col}`} x={x} y={y} width="12" height="12" rx="3" className="fill-surface stroke-border" />
          );
        }),
      )}
      <Line x={242} y={186} w={72} tone="good" />
    </Frame>
  );
}
