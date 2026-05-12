import { View, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import type { ReactNode } from "react"
import {
  resolveAvatarFrame,
  type AvatarFrame,
} from "../../constants/cardCustomization"

interface AvatarFrameWrapperProps {
  /** Тип рамки. Якщо null/undefined — рендеримо як `none` (без рамки). */
  frame: AvatarFrame | string | null | undefined
  /** Розмір аватарки в px (квадратна). Wrapper розширить його на ringWidth*2. */
  size: number
  /** Контент усередині — зазвичай <Image style={{ borderRadius: size/2 }} />. */
  children: ReactNode
  /**
   * Колір фону між дитячою картинкою і рамкою (рендериться тільки коли є рамка).
   * За замовчуванням білий, але для темної VIPAC-картки треба передавати темний.
   */
  innerBackgroundColor?: string
}

/**
 * Обгортка для аватарки що додає круглу рамку залежно від обраного frame.
 *
 * - `none`   — без рамки, рендерить children як є.
 * - `gold`   — solid 3px ring кольору #FFD700.
 * - `aurora` — gradient ring (Solana purple → pink → cyan) через LinearGradient.
 *
 * Розмір самої аватарки залишається `size`. Зовнішній контейнер
 * стає `size + ringWidth*2` щоб рамка не зрізала контент.
 */
export const AvatarFrameWrapper = ({
  frame,
  size,
  children,
  innerBackgroundColor = "#FFFFFF",
}: AvatarFrameWrapperProps) => {
  const preset = resolveAvatarFrame(frame as any)

  // Випадок 1: рамки нема — рендеримо як було.
  if (preset.ringWidth === 0) {
    return <>{children}</>
  }

  const outerSize = size + preset.ringWidth * 2
  const outerRadius = outerSize / 2
  const innerRadius = size / 2
  const padding = preset.ringWidth

  // Випадок 2: solid color ring (gold, etc.) — просто borderColor + borderWidth.
  if (typeof preset.ringColor === "string") {
    return (
      <View
        style={{
          width: outerSize,
          height: outerSize,
          borderRadius: outerRadius,
          borderWidth: preset.ringWidth,
          borderColor: preset.ringColor,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: innerBackgroundColor,
        }}
      >
        {children}
      </View>
    )
  }

  // Випадок 3: gradient ring — LinearGradient як зовнішній контейнер,
  // всередині нього кружечок-маска кольору innerBackgroundColor, всередині —
  // власне дитяча картинка. Класичний "donut" pattern для gradient border.
  return (
    <LinearGradient
      colors={preset.ringColor as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerRadius,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: innerRadius,
          backgroundColor: innerBackgroundColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </View>
    </LinearGradient>
  )
}

export default AvatarFrameWrapper
