# PICH — Mobile App

Solana-native digital business card app. Built during the Colosseum hackathon.

The backend API lives in a separate repo — see [Related repos](#related-repos) below.

---

## What PICH is

A mobile-first replacement for paper business cards. Users create personal (PAC), business (BAC), or VIP (VIPAC) cards, exchange them with one QR scan, pay for premium tiers in crypto on **Solana mainnet**, and can donate to Ukrainian charities through a privacy-preserving flow.

This repo is the React Native + Expo client. It handles login, card creation and exchange UI, Phantom wallet signing through Mobile Wallet Adapter, KiraPay checkout in-app, and Umbra-powered private donations.

---

## Solana integrations

Three production Solana paths live in this codebase, all running on **mainnet**:

### 1. KiraPay subscription flow
`src/screens/settings/Subscription.tsx`, `src/services/paymentsService.ts`

- User taps Subscribe → frontend asks backend for a KiraPay checkout URL → we open it inside **Phantom's embedded browser** so the user pays in native SOL.
- We append `/solana/` to the KiraPay path (`forceSolanaCheckout`) to skip their multi-chain picker and land directly in Solana flow — an undocumented quirk we found by trial.
- After checkout closes, the screen polls `/subscriptions/all` for the activation confirmation. AppState listener also triggers a refresh on foreground.

### 2. Mobile Wallet Adapter for Phantom
`src/features/solana/useMobileWallet.ts`

- Portable hook around `@solana-mobile/mobile-wallet-adapter-protocol-web3js` that caches the auth token in `AsyncStorage`. After the first `connect()`, subsequent `signTransaction` / `signAndSendTransaction` calls only prompt for the signature itself.
- Used for both the donation flow and any future signing operations.

### 3. Umbra Privacy donations
`src/screens/main/DonateCard.tsx`, `src/services/donationsService.ts`

- Donate tab in the Stack screen lists hardcoded Ukrainian charities (Come Back Alive, UNICEF, Prytula, UNBROKEN — fetched from the backend).
- Tapping Donate calls backend `/donations/prepare`, which returns a base64-encoded unsigned Umbra shielded-deposit transaction.
- Frontend deserializes the tx with `@solana/web3.js`, signs it via MWA, and submits to mainnet itself — backend never touches the signed tx.
- Success screen links straight to Solscan; Phantom history shows the call as "App interaction — Unknown", which is exactly the privacy property Umbra promises.

---

## Stack

- **React Native 0.79** + **Expo SDK 53** (Hermes)
- **Redux Toolkit** + **redux-persist**
- **@privy-io/expo** — Google OAuth login
- **@solana/web3.js** + **@solana-mobile/mobile-wallet-adapter-protocol-web3js**
- **expo-web-browser** — KiraPay checkout fallback
- **expo-google-fonts** (Playfair Display + Caveat) — premium custom-font feature
- **expo-linear-gradient** — gradient avatar frame (Solana-themed aurora ring)

---

## Quick start

```bash
yarn install

# Make sure deps are aligned with Expo SDK 53
npx expo install --fix
```

Update `src/services/api.ts` so `baseURL` points at your backend (LAN IP or an ngrok tunnel — both work).

### Run in Expo Go
```bash
npx expo start
```

### Run as a dev build (required for Phantom MWA)
```bash
npx expo prebuild --clean
npx expo run:android
```

Mobile Wallet Adapter only works on Android right now (Solana Foundation limitation) — iOS uses a different flow that's out of scope for this hackathon.

---

## Architecture

```
src/
├─ screens/
│  ├─ main/
│  │  ├─ Account.tsx         Profile + main card preview
│  │  ├─ Stack.tsx           Card list with "My / Connected / Donate" tabs
│  │  ├─ CardDetail.tsx      Front + back card view, QR / favorite / actions
│  │  ├─ CreateCardNew.tsx   Card constructor with live preview
│  │  ├─ Scan.tsx            QR scanner for exchanging cards
│  │  ├─ Share.tsx           QR generator for own card
│  │  └─ DonateCard.tsx      Umbra donation flow
│  └─ settings/
│     └─ Subscription.tsx    Plans + KiraPay checkout + polling
├─ components/
│  ├─ common/Avatar.tsx      Image picker with Supabase upload
│  └─ cards/                 Customization pickers + frame wrapper
├─ services/                 axios-based API clients
├─ features/solana/          useMobileWallet (MWA hook)
├─ store/slices/             Redux Toolkit slices
└─ constants/                Card customization, colors, assets
```

### State

- `cardsSlice` — user's own cards (CRUD)
- `connectionsSlice` — cards added via QR scan + `connectedCards` list
- `subscriptionsSlice` — active plans, `selectHasPremiumPerks`, `selectHasVip`
- `userSlice` — Privy-authed user profile
- `authSlice` — JWT lifecycle

---

## Key user flows

| Flow | Screens |
|---|---|
| Sign in | `Login` → `Account` (Privy Google OAuth) |
| Create card | `Stack` → `CardConstructor` → `CreateCardNew` |
| Buy subscription | `Settings` → `Subscription` → Phantom checkout → polling activation |
| Customize (Premium/VIP) | `CreateCardNew` → Font / Frame picker (gated by plan) |
| Exchange card | `Share` (QR) + `Scan` (camera) on two devices |
| Donate | `Stack` → Donate tab → `DonateCard` → Phantom signing → Solscan |

---

## Prioritization during the hackathon

1. **Privy auth** — Google OAuth without backend session bookkeeping
2. **Card CRUD + preview** — three card types with different field structures
3. **QR exchange** — Scan + Share + Connection model
4. **Subscription UI** — multi-tier plans, plan-gated card constructor
5. **KiraPay payments** — first Solana integration, in-Phantom checkout
6. **MWA signing** — portable hook with auth-token caching
7. **Umbra donations** — second Solana integration with privacy guarantees
8. **Premium customization** — fonts + avatar frames as plan-gated features
9. **Supabase image uploads** — avatars + card photos

---

## Related repos

- **[PICH-backend (NestJS)](https://github.com/PICH-Project/PICH-backend)** — API server, subscription engine, KiraPay webhook, Umbra deposit builder, Supabase upload proxy.

---

## Team

- **Volodymyr Havryliuk** — mobile app + integrations
- **Kateryna Striletska** — backend & Umbra deposit-builder

Built for the **Colosseum** Solana hackathon.
