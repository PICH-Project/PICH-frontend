import { mockQRCode } from "../utils/mockData"

// Mock delay function to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetches the user's QR code from the backend
 * @returns Promise with the QR code data as a base64 string
 */
export const fetchUserQRCode = async (): Promise<string> => {
  try {
    // Simulate API delay
    await delay(1200)

    // Return the mock QR code
    return mockQRCode
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
    // Simulate API delay
    await delay(1500)

    // In a real app, we would generate a new QR code
    // For demo purposes, we'll just return the same mock QR code
    return mockQRCode
  } catch (error) {
    console.error("Error refreshing QR code:", error)
    throw error
  }
}
