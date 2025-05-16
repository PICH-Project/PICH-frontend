import api from "./api"

/**
 * Fetches the user's QR code from the backend
 * @returns Promise with the QR code data as a base64 string
 */
export const fetchUserQRCode = async (): Promise<string> => {
  try {
    const response = await api.get("/api/qr/user")

    // The API returns the QR code as a base64 string
    // It should already be in the format "data:image/png;base64,..."
    return response.data.qrCode
  } catch (error) {
    console.error("Error fetching QR code:", error)
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
    // The backend will generate a new QR code for the authenticated user
    const response = await api.get("/api/qr/user")

    // The API returns the QR code as a base64 string
    return response.data
  } catch (error) {
    console.error("Error refreshing QR code:", error)
    throw error
  }
}
