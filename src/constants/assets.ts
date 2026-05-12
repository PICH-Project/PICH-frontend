/**
 * Static asset URLs used across the app.
 *
 * Чому remote URL а не локальний asset:
 *  - Hot-swap без ре-білда апки (швидше для дев-циклу)
 *  - Менший розмір APK
 *  - При офлайн-режимі краще закешуємо вже завантажений URL (RN робить це автоматом)
 *
 * Якщо колись треба буде офлайн-fallback — поміняти на `require('../../assets/default-avatar.png')`.
 */

/**
 * Дефолтний placeholder для аватарки користувача / картки, коли реальної нема.
 * Pixabay "Blank profile picture, mystery man" — нейтральний силует, public domain.
 *
 * Original page: https://pixabay.com/vectors/blank-profile-picture-mystery-man-973460/
 */
export const DEFAULT_AVATAR_URL =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
