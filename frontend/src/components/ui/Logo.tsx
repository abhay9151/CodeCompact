import { Link } from '@tanstack/react-router';

interface LogoProps { size?: number; showWordmark?: boolean; className?: string; }

export default function Logo({ size = 32, showWordmark = true, className = '' }: LogoProps) {
  const mark = (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64"
        role={showWordmark ? undefined : 'img'}
        aria-label={showWordmark ? undefined : 'CodeCompact'}
        aria-hidden={showWordmark ? true : undefined}>
        <path d="M46.2 19.6A19 19 0 1 0 46.2 44.4" fill="none" strokeWidth="8" strokeLinecap="round"
          style={{ stroke: 'var(--color-accent, #5B7CFA)' }} />
        <rect className="logo-caret" x="33.5" y="23" width="7" height="18" rx="3.5"
          style={{ fill: '#F2A93B' }} />
      </svg>
      {showWordmark && (
        <span className="text-[19px] font-semibold leading-none tracking-tight text-ink">CodeCompact</span>
      )}
    </span>
  )

  return (
    <Link to="/" aria-label="CodeCompact home" className="inline-flex min-h-11 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
      {mark}
    </Link>
  )
}
