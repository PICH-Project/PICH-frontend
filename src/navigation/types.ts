import type { CharityCard } from "../services/donationsService"

export type StackParamList = {
    StackMain: undefined
    CardDetail: { cardId: string }
    Actions: { cardId?: string }
    CreateCard: undefined
    EditCard: undefined
    SetMainCard: undefined
    DeleteCard: undefined
    CardConstructor: undefined
    DonateCard: { charity: CharityCard }
}
  
export type TabParamList = {
    Account: undefined
    Settings: undefined
    Share: undefined
    Scan: undefined
    Stack: undefined
}