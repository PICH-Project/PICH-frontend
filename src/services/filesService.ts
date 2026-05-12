import api from "./api"

export interface UploadResponse {
  success: boolean
  url: string
  path: string
}

export type UploadFolder = "avatars" | "cards"

/**
 * Сервіс для завантаження зображень у Supabase Storage через наш бек.
 *
 * Бек ендпоінт: POST /upload/image  (multipart/form-data, JWT-protected)
 *   - file:   image (binary)
 *   - folder: 'avatars' | 'cards'
 *
 * Повертає публічний URL який можна одразу класти у `user.avatar`
 * або `card.avatar` і він буде доступний без auth.
 */
const filesService = {
  /**
   * Завантажити локальне зображення (з ImagePicker.uri чи Camera.uri) на сервер.
   *
   * @param localUri URI з expo-image-picker (типу `file:///data/.../IMG_xxx.jpg`)
   * @param folder   До якої папки скласти ('avatars' для юзер-фото, 'cards' для card photo)
   * @param mimeType MIME-тип ('image/jpeg' дефолт)
   */
  uploadImage: async (
    localUri: string,
    folder: UploadFolder,
    mimeType: string = "image/jpeg",
  ): Promise<UploadResponse> => {
    const formData = new FormData()

    // RN-специфічний формат FormData файла:
    //   { uri, name, type } — фронт-нативний об'єкт, бек-multer його розпарсить
    //   як Express.Multer.File.
    const filename = localUri.split("/").pop() ?? `upload-${Date.now()}.jpg`
    formData.append("file", {
      uri: localUri,
      name: filename,
      type: mimeType,
    } as any)
    formData.append("folder", folder)

    const response = await api.post<UploadResponse>("/upload/image", formData, {
      headers: {
        // ВАЖЛИВО: НЕ ставити Content-Type вручну — axios сам додасть з boundary
        // інакше multer не зможе розпарсити multipart.
        "Content-Type": "multipart/form-data",
      },
      // Аплоади можуть бути повільні, особливо через ngrok. Збільшуємо timeout.
      timeout: 60_000,
    })
    return response.data
  },
}

export default filesService
