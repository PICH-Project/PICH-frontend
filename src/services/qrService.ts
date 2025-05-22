import api from "./api"

/**
 * Fetches the QR code for a specific card
 * @param cardId The ID of the card to get the QR code for
 * @returns Promise with the QR code data as a base64 string
 */
export const fetchCardQRCode = async (cardId: string): Promise<string> => {
  try {
    const response = await api.get(`/qr/card/${cardId}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching QR code for card ${cardId}:`, error)
    throw error
  }
}

/**
 * Fetches the QR code for the user's main card
 * @returns Promise with the QR code data as a base64 string
 */
export const fetchMainCardQRCode = async (): Promise<string> => {
  try {
    const response = await api.get("/qr/main-card")
    return response.data
  } catch (error) {
    console.error("Error fetching main card QR code:", error)
    throw error
  }
}

/**
 * Fetches the user's QR code from the backend
 * @returns Promise with the QR code data as a base64 string
 */
export const fetchUserQRCode = async (): Promise<string> => {
  try {
    // Use the main card QR code as the user QR code
    return await fetchMainCardQRCode()
  } catch (error) {
    console.error("Error fetching user QR code:", error)
    throw error
  }
}

/**
 * Refreshes the user's QR code by calling the generate endpoint again
 * @returns Promise with the new QR code data as a base64 string
 */
export const refreshUserQRCode = async (): Promise<string> => {
  try {
    // Since there's no specific refresh endpoint, we just call the generate endpoint again
    return await fetchMainCardQRCode()
  } catch (error) {
    console.error("Error refreshing QR code:", error)
    throw error
  }
}
