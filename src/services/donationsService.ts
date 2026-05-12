import api from "./api"

/**
 * Charity-картка з бека — `GET /donations/charities`.
 * Дзеркало `CharityCard` з PICH-backend/src/donation/charities.constant.ts.
 */
export interface CharityCard {
  id: string
  type: "BAC"
  companyName: string
  contactPerson: string
  slogan: string
  donationWallet: string
  logoUrl: string
  cardColor: string
  description: string
  isCharity: true
}

export interface PreparedDonation {
  /** Base64-кодована unsigned Solana transaction. */
  transaction: string
}

const donationsService = {
  /**
   * Тягне список hardcoded charity-карток з бека.
   */
  getCharities: async (): Promise<CharityCard[]> => {
    const response = await api.get<{ success: boolean; data: CharityCard[] }>(
      "/donations/charities",
    )
    return response.data.data
  },

  /**
   * Просить бек збилдити unsigned Umbra-транзакцію для донату.
   *
   * Що далі — підписуємо локально через wallet adapter (Phantom MWA) і
   * самі ж сабмітимо на Solana RPC. На бек назад нічого слати не треба.
   *
   * @param senderAddress  Solana base58 — адреса юзера (з Phantom).
   * @param recipientAddress  Solana base58 — `donationWallet` обраної charity-картки.
   * @param amount  Сума у lamports як string (BigInt сериалізується в JSON погано).
   */
  prepareDonation: async (params: {
    senderAddress: string
    recipientAddress: string
    amount: string
  }): Promise<PreparedDonation> => {
    const response = await api.post<{
      success: boolean
      message: string
      data: PreparedDonation
    }>("/donations/prepare", params)
    return response.data.data
  },
}

export default donationsService
