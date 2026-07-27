import { cn } from "@/lib/utils"

type Props = { className?: string; style?: React.CSSProperties }

export function ScribbleUnderline({ className, style }: Props) {
  return (
    <svg viewBox="0 0 200 18" className={cn("w-full", className)} style={style} aria-hidden>
      <path
        d="M2 10 C 30 2, 70 2, 98 8 C 126 14, 160 14, 198 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Sparkle({ className, style }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        d="M12 2 C 12.8 7 13.5 7.7 18.5 8.5 C 13.5 9.3 12.8 10 12 15 C 11.2 10 10.5 9.3 5.5 8.5 C 10.5 7.7 11.2 7 12 2 Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function Smiley({ className, style }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="currentColor" />
      <circle cx="17" cy="20" r="3" fill="#3B2A4A" />
      <circle cx="31" cy="20" r="3" fill="#3B2A4A" />
      <path d="M15 29 C 19 35, 29 35, 33 29" fill="none" stroke="#3B2A4A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Pencil({ className, style }: Props) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <path d="M6 42 L10 32 L34 8 L40 14 L16 38 Z" fill="#FFC83D" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 12 L36 18" stroke="#3B2A4A" strokeWidth="2.5" />
      <path d="M6 42 L10 32" stroke="#3B2A4A" strokeWidth="2.5" />
      <path d="M6 42 L8.5 36 L12 39.5 Z" fill="#FF7A45" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

export function StarIcon({ className, style, filled = true }: Props & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        d="M12 2.5 L14.9 8.9 L22 9.8 L16.7 14.6 L18.2 21.5 L12 18 L5.8 21.5 L7.3 14.6 L2 9.8 L9.1 8.9 Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Heart({ className, style, filled = false }: Props & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        d="M12 21 C 12 21, 3 14.5, 3 8.8 C 3 5.6, 5.4 3, 8.3 3 C 10 3, 11.4 3.9, 12 5.2 C 12.6 3.9, 14 3, 15.7 3 C 18.6 3, 21 5.6, 21 8.8 C 21 14.5, 12 21, 12 21 Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Cloud({ className, style }: Props) {
  return (
    <svg viewBox="0 0 100 60" className={className} style={style} aria-hidden>
      <path
        d="M22 50 C 8 50, 4 36, 16 32 C 14 18, 36 14, 42 26 C 48 14, 70 16, 70 30 C 86 28, 92 46, 78 50 Z"
        fill="currentColor"
        stroke="#3B2A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Whale({ className, style }: Props) {
  return (
    <svg viewBox="0 0 120 90" className={className} style={style} aria-hidden>
      <path
        d="M10 55 C 10 35, 40 25, 70 28 C 95 30, 112 42, 112 55 C 112 68, 92 78, 60 78 C 30 78, 10 70, 10 55 Z"
        fill="#FFFFFF"
        stroke="#3B2A4A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M96 38 C 104 22, 116 22, 116 12 C 116 22, 108 24, 104 38" fill="#FFFFFF" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 60 C 104 70, 110 70, 114 64 C 110 66, 106 66, 100 60 Z" fill="#FFFFFF" stroke="#3B2A4A" strokeWidth="2.5" />
      <circle cx="30" cy="50" r="3" fill="#3B2A4A" />
      <path d="M18 70 C 24 80, 32 80, 38 72 C 32 74, 24 74, 18 70 Z" fill="#FFFFFF" stroke="#3B2A4A" strokeWidth="2" />
    </svg>
  )
}

export function Giraffe({ className, style }: Props) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <path d="M40 110 L40 56 C 40 44, 52 40, 58 48 L58 110 Z" fill="#FFC83D" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M70 110 L70 64 C 70 52, 82 48, 88 56 L88 110 Z" fill="#FFC83D" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M44 50 C 44 28, 60 18, 76 18 C 92 18, 100 30, 98 44 C 96 50, 86 52, 80 50 L78 60 L60 58 L58 48 C 52 52, 46 54, 44 50 Z" fill="#FFC83D" stroke="#3B2A4A" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="86" cy="32" r="2.5" fill="#3B2A4A" />
      <path d="M96 26 C 102 20, 104 16, 102 12" fill="none" stroke="#3B2A4A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M94 26 C 100 19, 100 14, 97 11" fill="none" stroke="#3B2A4A" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="54" cy="62" r="3" fill="#3B2A4A" opacity="0.4" />
      <circle cx="74" cy="70" r="3" fill="#3B2A4A" opacity="0.4" />
      <circle cx="66" cy="86" r="3" fill="#3B2A4A" opacity="0.4" />
      <circle cx="50" cy="92" r="3" fill="#3B2A4A" opacity="0.4" />
    </svg>
  )
}

export function Rainbow({ className, style }: Props) {
  return (
    <svg viewBox="0 0 100 60" className={className} style={style} aria-hidden>
      <path d="M8 52 a42 42 0 0 1 84 0" fill="none" stroke="#FF7A45" strokeWidth="6" />
      <path d="M16 52 a34 34 0 0 1 68 0" fill="none" stroke="#FFC83D" strokeWidth="6" />
      <path d="M24 52 a26 26 0 0 1 52 0" fill="none" stroke="#5CC9A7" strokeWidth="6" />
      <path d="M32 52 a18 18 0 0 1 36 0" fill="none" stroke="#4FA8E0" strokeWidth="6" />
    </svg>
  )
}

export function ZigZag({ className, style }: Props) {
  return (
    <svg viewBox="0 0 120 16" className={className} style={style} aria-hidden>
      <path d="M2 8 L14 2 L26 14 L38 2 L50 14 L62 2 L74 14 L86 2 L98 14 L110 2 L118 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DotGrid({ className, style }: Props) {
  return (
    <svg className={className} style={style} aria-hidden>
      <defs>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}
