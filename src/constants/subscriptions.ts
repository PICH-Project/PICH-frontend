/**
 * Коди планів підписки (мають збігатись зі значеннями `code`, які повертає бек
 * у `subscription.plan.code` — uppercase strings).
 *
 * Дзеркало `PlanCode` з PICH-backend/src/subscriptions/subscriptions.enums.ts.
 *
 * Логіка доступу до карток / перків винесена у Redux-селектори
 * (`selectCanCreateCardType`, `selectHasPremiumPerks` тощо) у
 * `store/slices/subscriptionsSlice.ts`, бо у юзера МАСИВ активних підписок
 * (PRIMARY + опційно ADDON), а не один план.
 */
export enum PlanCode {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  BUSINESS = "BUSINESS",
  VIP = "VIP",
}

/**
 * Дефолтний план, якщо у юзера ще немає активної підписки.
 */
export const DEFAULT_PLAN = PlanCode.FREE

/**
 * Привести довільну строку (з бека/Redux) до PlanCode.
 * Якщо значення невалідне — повертаємо DEFAULT_PLAN.
 */
export function toPlanCode(value: string | undefined | null): PlanCode {
  if (!value) return DEFAULT_PLAN
  const upper = value.toUpperCase()
  if ((Object.values(PlanCode) as string[]).includes(upper)) {
    return upper as PlanCode
  }
  return DEFAULT_PLAN
}

/**
 * UI-метадані планів (frontend-only). Бек віддає сухі поля: code, displayName,
 * features, description. Тут — кольори, флаги типу "це addon", порядок у списку.
 */
export interface PlanDisplayMeta {
  /** Гарне імʼя для UI (на беку displayName інколи занадто специфічне). */
  prettyName: string
  /** Колір фону картки плану. */
  backgroundColor: string
  /** Чи показувати корону біля назви. */
  showCrown: boolean
  /** Чи це ADDON-план (стакається поверх PRIMARY). */
  isAddon: boolean
  /** Порядок сортування — як показувати у списку (менший = вище). */
  sortOrder: number
}

export const PLAN_DISPLAY: Record<PlanCode, PlanDisplayMeta> = {
  [PlanCode.FREE]: {
    prettyName: "Free Plan",
    backgroundColor: "transparent",
    showCrown: false,
    isAddon: false,
    sortOrder: 0,
  },
  [PlanCode.PREMIUM]: {
    prettyName: "Premium Plan",
    // Світло-сірий, щоб картка візуально виділилась (transparent губиться на фоні).
    backgroundColor: "#F5F2EC",
    showCrown: false,
    isAddon: true,
    sortOrder: 1,
  },
  [PlanCode.BUSINESS]: {
    prettyName: "Business Plan",
    backgroundColor: "#FFFAE8",
    showCrown: false,
    isAddon: false,
    sortOrder: 2,
  },
  [PlanCode.VIP]: {
    prettyName: "VIP Plan",
    backgroundColor: "#FFEEB8",
    showCrown: true,
    isAddon: false,
    sortOrder: 3,
  },
}

/**
 * Дзеркало `PlanFeatures` з бека (спрощене, для рендеру). Якщо колись зʼявляться
 * нові поля — додавати сюди і у `formatPlanFeatures`.
 */
export interface PlanFeaturesShape {
  maxCards?: number
  cardTypes?: string[]
  phoneNumbers?: number
  socialLinks?: number
  bioMaxLength?: number
  customization?: boolean
  additionalPhones?: number
  additionalSocials?: number
  coinFarmBonus?: boolean
  vipIndicator?: boolean
  blackTheme?: boolean
  privacySettings?: boolean
  animatedPhoto?: boolean
  animatedBackground?: boolean
}

/**
 * Перетворює обʼєкт `features` з бека у список рядків для UI (буллети картки).
 * Логіка різна для PRIMARY і ADDON планів:
 *  - PRIMARY (FREE/BUSINESS/VIP): показуємо абсолютні значення ("2 phones", "5 socials")
 *  - ADDON (PREMIUM): показуємо інкременти ("+1 phone", "+2 socials")
 */
export function formatPlanFeatures(
  code: PlanCode,
  features: PlanFeaturesShape | null | undefined,
): string[] {
  if (!features) return []
  const meta = PLAN_DISPLAY[code]
  const lines: string[] = []

  if (meta.isAddon) {
    if (features.additionalPhones && features.additionalPhones > 0) {
      lines.push(`+${features.additionalPhones} phone number`)
    }
    if (features.additionalSocials && features.additionalSocials > 0) {
      lines.push(`+${features.additionalSocials} social links`)
    }
    if (features.customization) lines.push("Card customization")
    if (features.coinFarmBonus) lines.push("Coin farm bonus")
    if (features.animatedPhoto) lines.push("Animated photo")
    if (features.animatedBackground) lines.push("Animated background")
    return lines
  }

  // PRIMARY plans
  if (features.cardTypes?.length) {
    lines.push(`Card types: ${features.cardTypes.join(", ")}`)
  }
  if (typeof features.maxCards === "number") {
    const v = features.maxCards === -1 ? "Unlimited" : features.maxCards
    lines.push(`${v} card${features.maxCards === 1 ? "" : "s"}`)
  }
  if (typeof features.phoneNumbers === "number") {
    lines.push(`${features.phoneNumbers} phone number${features.phoneNumbers === 1 ? "" : "s"}`)
  }
  if (typeof features.socialLinks === "number") {
    lines.push(`${features.socialLinks} social link${features.socialLinks === 1 ? "" : "s"}`)
  }
  if (features.customization) lines.push("Card customization")
  if (features.coinFarmBonus) lines.push("Coin farm bonus")
  if (features.vipIndicator) lines.push("VIP status indicator")
  if (features.blackTheme) lines.push("Black theme")
  if (features.privacySettings) lines.push("Advanced privacy settings")
  if (features.animatedPhoto) lines.push("Animated photo")
  if (features.animatedBackground) lines.push("Animated background")

  return lines
}
