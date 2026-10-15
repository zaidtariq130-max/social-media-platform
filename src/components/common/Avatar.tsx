import type { CSSProperties } from "react"

const SIZES = {
  xs: "w-6 h-6",
  sm: "w-7 h-7",
  compact: "w-9 h-9",
  md: "w-10 h-10",
  row: "w-11 h-11",
  lg: "w-12 h-12",
  xl: "w-20 h-20",
} as const

export type AvatarSize = keyof typeof SIZES

const LARGE_SIZES: AvatarSize[] = ["row", "lg", "xl"]

interface AvatarProps {
  src: string
  alt: string
  size?: AvatarSize
  /** Pass a boolean to render the presence dot (true = green dot). Omit for no dot. */
  isOnline?: boolean
  className?: string
  style?: CSSProperties
}

export default function Avatar({
  src,
  alt,
  size = "md",
  isOnline,
  className = "",
  style,
}: AvatarProps) {
  const img = (
    <img
      src={src}
      alt={alt}
      className={`${SIZES[size]} rounded-full object-cover ${className}`}
      style={style}
    />
  )

  if (isOnline === undefined) return img

  const dotSize = LARGE_SIZES.includes(size) ? "w-3 h-3" : "w-2.5 h-2.5"

  return (
    <div className="relative shrink-0">
      {img}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} bg-emerald-500 border-2 border-white rounded-full`}
        />
      )}
    </div>
  )
}
