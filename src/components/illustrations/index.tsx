import { Art, Band, Panel, TextLine, Tick, tone } from "./primitives";

type Props = { className?: string };

/** Home hero: the two slanted bands of the SHERO mark, with work getting done on top of them. */
export function HeroArt({ className }: Props) {
  return (
    <Art viewBox="0 0 400 400" className={className}>
      <circle cx="200" cy="200" r="176" className={tone.accentSoft} />
      <Band x={28} y={104} w={250} h={84} slant={84} className={tone.primary} />
      <Band x={64} y={204} w={250} h={84} slant={84} className={tone.accent} />

      <Panel x={214} y={40} w={160} h={92} r={14} />
      <Tick cx={244} cy={70} />
      <TextLine x={266} y={60} w={86} />
      <TextLine x={266} y={74} w={58} />
      <rect x="232" y="102" width="40" height="12" rx="6" className={tone.accentSoft} />
      <rect x="278" y="102" width="40" height="12" rx="6" className={tone.line} />

      <Panel x={22} y={262} w={196} h={112} r={14} />
      <TextLine x={42} y={282} w={70} />
      {[22, 34, 28, 48, 58].map((h, i) => (
        <rect
          key={i}
          x={44 + i * 32}
          y={354 - h}
          width="18"
          height={h}
          rx="4"
          className={i === 4 ? tone.accent : tone.primary}
          opacity={i === 4 ? 1 : 0.35 + i * 0.15}
        />
      ))}

      <Panel x={252} y={306} w={124} h={42} r={21} />
      <circle cx="274" cy="327" r="7" className={tone.accent} />
      <TextLine x={290} y={324} w={66} />
    </Art>
  );
}

/** Custom software: a code window. */
export function SoftwareArt({ className }: Props) {
  return (
    <Art viewBox="0 0 400 300" className={className}>
      <Band x={20} y={190} w={240} h={70} slant={70} className={tone.accentSoft} />
      <Panel x={64} y={36} w={272} h={200} r={14} />
      {[88, 104, 120].map((cx) => (
        <circle key={cx} cx={cx} cy={58} r={5} className={tone.line} />
      ))}
      <path d="M64 78h272" className={tone.stroke} />
      <TextLine x={88} y={98} w={44} className={tone.primary} />
      <TextLine x={138} y={98} w={92} />
      <TextLine x={108} y={118} w={70} />
      <TextLine x={184} y={118} w={50} className={tone.accent} />
      <TextLine x={108} y={138} w={120} />
      <TextLine x={128} y={158} w={64} className={tone.primary} />
      <TextLine x={198} y={158} w={40} />
      <TextLine x={108} y={178} w={88} />
      <TextLine x={88} y={198} w={30} className={tone.primary} />
      <Panel x={268} y={186} w={96} h={64} r={14} className={tone.primary} />
      <path
        d="M298 206l-12 12 12 12M334 206l12 12-12 12M322 202l-12 32"
        className="fill-none stroke-on-primary"
        strokeWidth={3}
      />
    </Art>
  );
}

/** Managed IT: a laptop whose checks are all passing. */
export function ManagedItArt({ className }: Props) {
  return (
    <Art viewBox="0 0 400 300" className={className}>
      <Band x={150} y={30} w={200} h={70} slant={70} className={tone.accentSoft} />
      <Panel x={86} y={52} w={228} h={150} r={12} />
      <path d="M58 214h284l-18 22H76z" className={tone.card} />
      <path d="M176 214h48" className={tone.stroke} />
      {[80, 114, 148].map((y, i) => (
        <g key={y}>
          <Tick cx={116} cy={y + 3} r={10} />
          <TextLine x={136} y={y} w={[110, 86, 124][i] ?? 100} />
        </g>
      ))}
      <path
        d="M118 182h40l10-14 12 26 12-20 8 8h80"
        className={tone.strokePrimary}
        strokeWidth={2.5}
      />
    </Art>
  );
}

/** Integrations: the tools a business already uses, connected through one hub. */
export function IntegrationsArt({ className }: Props) {
  const tiles = [
    { x: 30, y: 30 },
    { x: 290, y: 30 },
    { x: 30, y: 200 },
    { x: 290, y: 200 },
  ];
  return (
    <Art viewBox="0 0 400 300" className={className}>
      {tiles.map((t) => (
        <path
          key={`${t.x}-${t.y}`}
          d={`M200 150L${t.x + 40} ${t.y + 35}`}
          className={tone.strokePrimary}
          strokeWidth={2}
          strokeDasharray="2 7"
        />
      ))}
      {tiles.map((t, i) => (
        <g key={`${t.x}-${t.y}`}>
          <Panel x={t.x} y={t.y} w={80} h={70} r={12} />
          <circle
            cx={t.x + 22}
            cy={t.y + 24}
            r={8}
            className={i % 2 ? tone.accent : tone.primary}
          />
          <TextLine x={t.x + 16} y={t.y + 44} w={48} />
        </g>
      ))}
      <Panel x={152} y={102} w={96} h={96} r={18} className={tone.primary} />
      <Band x={170} y={128} w={40} h={18} slant={18} className="fill-on-primary" />
      <Band x={178} y={154} w={40} h={18} slant={18} className="fill-on-primary" opacity={0.6} />
    </Art>
  );
}

/** Hardware: a laptop and its box, ready to go out. */
export function HardwareArt({ className }: Props) {
  return (
    <Art viewBox="0 0 400 300" className={className}>
      <Band x={10} y={200} w={240} h={70} slant={70} className={tone.accentSoft} />
      <path d="M262 92l70 30v96l-70 30-70-30v-96z" className={tone.card} />
      <path d="M192 122l70 30 70-30M262 152v96" className={tone.stroke} />
      <path d="M192 122l70-30 70 30-70 30z" className={tone.accentSoft} />
      <path d="M227 107l70 30" className={tone.strokeAccent} strokeWidth={6} />
      <Panel x={46} y={70} w={160} h={108} r={10} />
      <Panel x={58} y={82} w={136} h={84} r={6} className={tone.frame} />
      <Band x={84} y={104} w={56} h={16} slant={16} className={tone.primary} />
      <Band x={96} y={126} w={56} h={16} slant={16} className={tone.accent} />
      <path d="M28 186h196l-14 16H42z" className={tone.card} />
    </Art>
  );
}

/** Merchander: chat orders turning into one tidy order list. */
export function MerchanderArt({ className }: Props) {
  return (
    <Art viewBox="0 0 400 400" className={className}>
      <circle cx="220" cy="200" r="168" className={tone.accentSoft} />
      <Panel x={176} y={34} w={168} h={318} r={28} />
      <rect x="236" y="48" width="48" height="8" rx="4" className={tone.line} />
      <Panel x={192} y={80} w={112} h={40} r={14} className={tone.frame} />
      <TextLine x={206} y={97} w={72} />
      <Panel x={232} y={132} w={98} h={40} r={14} className={tone.primary} />
      <TextLine x={246} y={149} w={62} className="fill-on-primary" />
      <Panel x={192} y={184} w={124} h={40} r={14} className={tone.frame} />
      <TextLine x={206} y={201} w={84} />
      <Panel x={240} y={236} w={90} h={40} r={14} className={tone.accent} />
      <TextLine x={254} y={253} w={54} className="fill-on-primary" />

      <Panel x={30} y={196} w={186} h={150} r={16} />
      <TextLine x={50} y={216} w={70} className={tone.primary} />
      {[244, 276, 308].map((y, i) => (
        <g key={y}>
          {i < 2 ? (
            <Tick cx={60} cy={y + 3} r={9} />
          ) : (
            <circle cx={60} cy={y + 3} r={9} className={tone.stroke} />
          )}
          <TextLine x={78} y={y} w={76} />
          <TextLine x={164} y={y} w={30} className={tone.ink} />
        </g>
      ))}
    </Art>
  );
}

/** Pharmasyst: stocked shelves and a stock card that flags what expires soon. */
export function PharmasystArt({ className }: Props) {
  const shelves = [96, 168, 240];
  return (
    <Art viewBox="0 0 400 400" className={className}>
      <circle cx="190" cy="200" r="168" className={tone.accentSoft} />
      <Panel x={40} y={50} w={220} h={270} r={16} />
      {shelves.map((y, row) => (
        <g key={y}>
          <path d={`M56 ${y + 52}h188`} className={tone.stroke} />
          {[0, 1, 2, 3].map((col) => {
            const x = 66 + col * 44;
            return row === 1 && col === 3 ? (
              <rect
                key={col}
                x={x}
                y={y + 14}
                width={30}
                height={38}
                rx={6}
                className={tone.line}
              />
            ) : (
              <g key={col} transform={`rotate(${col % 2 ? 0 : -8} ${x + 15} ${y + 33})`}>
                <rect x={x + 6} y={y + 4} width={18} height={44} rx={9} className={tone.card} />
                <path
                  d={`M${x + 6} ${y + 26}h18v13a9 9 0 0 1-18 0z`}
                  className={(row + col) % 2 ? tone.accent : tone.primary}
                />
              </g>
            );
          })}
        </g>
      ))}
      <Panel x={206} y={214} w={164} h={132} r={16} />
      <TextLine x={226} y={234} w={64} className={tone.primary} />
      {[262, 290, 318].map((y, i) => (
        <g key={y}>
          <circle cx={232} cy={y + 3} r={6} className={i === 1 ? "fill-warning" : tone.accent} />
          <TextLine x={246} y={y} w={70} />
          <TextLine x={324} y={y} w={26} className={tone.ink} />
        </g>
      ))}
    </Art>
  );
}

/** About: slanted steps climbing to a flag. Redefine possible, one step at a time. */
export function StoryArt({ className }: Props) {
  const steps = [
    { x: 24, y: 226 },
    { x: 96, y: 178 },
    { x: 168, y: 130 },
    { x: 240, y: 82 },
  ];
  return (
    <Art viewBox="0 0 400 300" className={className}>
      <circle cx="318" cy="70" r="44" className={tone.accentSoft} />
      <path
        d="M40 270c60-6 120-40 170-90s90-80 150-96"
        className={tone.stroke}
        strokeDasharray="2 8"
      />
      {steps.map((s, i) => (
        <Band
          key={s.x}
          x={s.x}
          y={s.y}
          w={96}
          h={36}
          slant={36}
          className={i === steps.length - 1 ? tone.primary : "fill-accent-subtle stroke-accent"}
          opacity={i === steps.length - 1 ? 1 : 0.55 + i * 0.15}
        />
      ))}
      <path d="M318 82V30" className="fill-none stroke-ink-muted" strokeWidth={2.5} />
      <path d="M318 30h44l-10 12 10 12h-44z" className={tone.accent} />
      <circle cx="96" cy="210" r="6" className={tone.accent} />
      <circle cx="168" cy="162" r="6" className={tone.accent} />
      <circle cx="240" cy="114" r="6" className={tone.accent} />
    </Art>
  );
}

export const serviceArt = {
  software: SoftwareArt,
  "managed-it": ManagedItArt,
  integrations: IntegrationsArt,
  hardware: HardwareArt,
} as const;

export const productArt = {
  merchander: MerchanderArt,
  pharmasyst: PharmasystArt,
} as const;
