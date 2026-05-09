/**
 * Типи карток і категорії.
 *
 * PAC   — Personal Automatic Card. Безкоштовна, дизайн не змінюється.
 *         1 номер телефону, 4 соцмережі. + Premium: +1 номер, +2 соц.
 * BAC   — Business Automatic Card. По підписці. Кастомізація розташування.
 *         2 номери, 5 соц, + поле "девіз/гасло", + 2 кастомні поля.
 *         + Premium: +1 номер, +2 соц.
 * VIPAC — VIP Automatic Card. По підписці. Замінює Premium.
 *         Максимальна кастомізація з коробки, 4 номери, 8 соц,
 *         4 кастомні поля, чорний фон, окремі privacy-настройки.
 */
export enum CardType {
  PAC = "PAC",
  BAC = "BAC",
  VIPAC = "VIPAC",
}

/** Категорія, до якої юзер відносить картку (для угрупування у Stack). */
export enum CardCategory {
  FAMILY = "FAMILY",
  FRIENDS = "FRIENDS",
  WORK = "WORK",
  OTHER = "OTHER",
}

/** TS-типи у вигляді string-union — зручно для API/DTO. */
export type CardTypeValue = `${CardType}`
export type CardCategoryValue = `${CardCategory}`

/** Зручне відображення імен типів картки в UI. */
export const CARD_TYPE_DISPLAY: Record<CardType, string> = {
  [CardType.PAC]: "Personal",
  [CardType.BAC]: "Business",
  [CardType.VIPAC]: "VIP",
}

/** Зручне відображення категорій в UI. */
export const CARD_CATEGORY_DISPLAY: Record<CardCategory, string> = {
  [CardCategory.FAMILY]: "Family",
  [CardCategory.FRIENDS]: "Friends",
  [CardCategory.WORK]: "Work",
  [CardCategory.OTHER]: "Other",
}

/**
 * Базові ліміти ПО ТИПУ КАРТКИ (без преміум-аддона).
 * Source: бізнес-спека від замовника.
 *
 * - PAC   → 1 phone, 4 socials, 0 custom notes
 * - BAC   → 2 phones, 5 socials, 2 custom notes (+ slogan field, окремо)
 * - VIPAC → 4 phones, 8 socials, 4 custom notes
 */
export interface CardTypeLimits {
  phones: number
  socials: number
  /** Кількість слотів-нотаток на back-side. */
  notes: number
}

export const CARD_TYPE_BASE_LIMITS: Record<CardType, CardTypeLimits> = {
  [CardType.PAC]: { phones: 1, socials: 4, notes: 0 },
  [CardType.BAC]: { phones: 2, socials: 5, notes: 2 },
  [CardType.VIPAC]: { phones: 4, socials: 8, notes: 4 },
}

/**
 * Premium-бонуси, які додаються поверх базових лімітів КАРТКИ, якщо у юзера
 * активний Premium ADDON або VIP (VIP включає Premium-перки автоматично).
 *
 * VIPAC бонусів не отримує — VIP-картка вже має максимум.
 */
export const PREMIUM_CARD_BONUS: Record<CardType, Pick<CardTypeLimits, "phones" | "socials">> = {
  [CardType.PAC]: { phones: 1, socials: 2 },
  [CardType.BAC]: { phones: 1, socials: 2 },
  [CardType.VIPAC]: { phones: 0, socials: 0 },
}

/**
 * Кінцеві ліміти для конкретної картки конкретного юзера.
 * type — який тип картки створюється; hasPremiumPerks — чи є Premium ADDON або VIP.
 */
export function getEffectiveCardLimits(
  type: CardType,
  hasPremiumPerks: boolean,
): CardTypeLimits {
  const base = CARD_TYPE_BASE_LIMITS[type]
  const bonus = hasPremiumPerks ? PREMIUM_CARD_BONUS[type] : { phones: 0, socials: 0 }
  return {
    phones: base.phones + bonus.phones,
    socials: base.socials + bonus.socials,
    notes: base.notes,
  }
}

/**
 * Чорно-золотиста палітра для VIPAC-картки (per Figma design).
 * Використовується у CardDetail (режим перегляду) і CreateCardNew (preview).
 * Кольори підібрані з референс-скріна; легко правляться в одному місці.
 */
export const VIPAC_THEME = {
  /** Фон самої картки. */
  cardBg: "#21201C",
  /** Основний текст (name, location, bio). */
  textPrimary: "#FFFFFF",
  /** Другорядний текст (nickname/contactPerson, hint'и). */
  textSecondary: "#CFCAC4",
  /** Тонкий divider між секціями. */
  divider: "#5C5750",
  /** Фон note-слотів на back-side. */
  noteSlotBg: "#F5EFD9",
  /** Колір "+" у пустому note-слоті. */
  noteSlotPlus: "#D9B447",
  /** Текст у заповненому note-слоті. */
  noteSlotText: "#27261F",
  /** Фон CTA-кнопки "TO CALL". */
  callButtonBg: "#FBE7A8",
  /** Текст і іконка телефону у "TO CALL". */
  callButtonText: "#27261F",
  /** Фон квадратика іконки соц-мережі. */
  socialIconBg: "#EFEAD9",
  /** Колір самої іконки соц-мережі (на світлому фоні). */
  socialIconColor: "#27261F",
  /** Фон зеленої "Verified"-смужки. */
  verifiedStripBg: "#5DB463",
  /** Текст у "Verified"-смужці. */
  verifiedStripText: "#FFFFFF",
}
