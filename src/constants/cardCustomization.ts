/**
 * Преміум-кастомізації картки.
 *
 *  - `NameFont` — шрифт імені/назви компанії на картці. Premium ADDON / VIP.
 *  - `AvatarFrame` — рамка навколо аватарки. VIP-only.
 *
 * Значення з бека приходять як string | null. У UI завжди читаємо через
 * fallback: `card.nameFont ?? 'default'`, `card.avatarFrame ?? 'none'`.
 */

export type NameFont = "default" | "classic" | "script"
export type AvatarFrame = "none" | "gold" | "aurora"

export interface NameFontPreset {
  /** Ідентифікатор для бека/Redux. */
  id: NameFont
  /** Зрозуміле юзеру ім'я у пікері. */
  label: string
  /**
   * Назва fontFamily у RN <Text style={{ fontFamily: ... }} />.
   * Має збігатись з ключем у useFonts() в App.tsx.
   * null = system default — використовуй текущій typography.fontFamily.bold з theme.
   */
  fontFamily: string | null
  /** Sample-літери для preview у пікері. */
  sample: string
}

export const NAME_FONT_PRESETS: Record<NameFont, NameFontPreset> = {
  default: {
    id: "default",
    label: "Modern",
    fontFamily: null, // system / current theme bold
    sample: "Aa",
  },
  classic: {
    id: "classic",
    label: "Classic",
    fontFamily: "PlayfairDisplay_700Bold",
    sample: "Aa",
  },
  script: {
    id: "script",
    label: "Script",
    fontFamily: "Caveat_700Bold",
    sample: "Aa",
  },
}

export interface AvatarFramePreset {
  id: AvatarFrame
  label: string
  /** Товщина обвідки у px. */
  ringWidth: number
  /**
   * Один колір — звичайна borderColor.
   * Масив кольорів — gradient (рендеримо через LinearGradient).
   */
  ringColor: string | string[]
}

export const AVATAR_FRAME_PRESETS: Record<AvatarFrame, AvatarFramePreset> = {
  none: {
    id: "none",
    label: "None",
    ringWidth: 0,
    ringColor: "transparent",
  },
  gold: {
    id: "gold",
    label: "Gold",
    ringWidth: 3,
    ringColor: "#FFD700",
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    ringWidth: 3,
    // Solana-style gradient — фіолетовий → рожевий → бірюзовий.
    ringColor: ["#9945FF", "#FF6B9D", "#14F195"],
  },
}

/** Зручний хелпер для отримання fontFamily з типу або null-safe значення. */
export function resolveNameFont(value: string | null | undefined): string | null {
  const key = (value ?? "default") as NameFont
  return NAME_FONT_PRESETS[key]?.fontFamily ?? null
}

/** Зручний хелпер для отримання preset рамки з null-safe значення. */
export function resolveAvatarFrame(value: string | null | undefined): AvatarFramePreset {
  const key = (value ?? "none") as AvatarFrame
  return AVATAR_FRAME_PRESETS[key] ?? AVATAR_FRAME_PRESETS.none
}
