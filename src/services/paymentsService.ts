import api from "./api"

export interface CheckoutSession {
  /** URL від KiraPay куди перенаправляти юзера для оплати. */
  paymentUrl: string
  /** customOrderId — повертається в webhook'і коли оплата пройде. */
  orderId: string
}

export interface CreateCheckoutPayload {
  planCode: "FREE" | "PREMIUM" | "BUSINESS" | "VIP"
  billingCycle: "monthly" | "yearly"
}

const paymentsService = {
  /**
   * Створити checkout-сесію в KiraPay.
   * Бек поверне `paymentUrl` куди мобілка має перенаправити юзера
   * (через Phantom deeplink в нашому випадку).
   */
  createCheckoutSession: async (
    payload: CreateCheckoutPayload,
  ): Promise<CheckoutSession> => {
    const response = await api.post<{ success: boolean; data: CheckoutSession }>(
      "/payments/checkout",
      payload,
    )
    return response.data.data
  },
}

export default paymentsService
