/**
 * useMobileWallet — портативний хук для роботи з Solana Mobile Wallet Adapter (MWA).
 *
 * --------------------------------------------------------------------------
 *  Платформа: ANDROID ONLY. На iOS падає (це обмеження самого MWA — Solana
 *  Foundation його не зробила під iOS). Для iOS треба WalletConnect / Privy
 *  embedded / deep links.
 *
 *  Залежності, які треба встановити в проєкт:
 *    yarn add \
 *      @solana-mobile/mobile-wallet-adapter-protocol \
 *      @solana-mobile/mobile-wallet-adapter-protocol-web3js \
 *      @solana/web3.js \
 *      @react-native-async-storage/async-storage \
 *      buffer
 *
 *  + у вашому ентрі-файлі (App.tsx) поставте поліфіл Buffer:
 *      import { Buffer } from 'buffer'
 *      global.Buffer = Buffer
 *
 *  + після додавання залежностей зробити `expo prebuild --clean &&
 *    expo run:android` (це нативні модулі, fast-refresh не підхопить).
 *
 *  Файл написаний так, щоб його можна було скопіювати в інший проєкт як є —
 *  жодних project-specific імпортів, конфіг приймається через аргументи хука.
 * --------------------------------------------------------------------------
 *
 *  Базове використання:
 *
 *    const wallet = useMobileWallet({
 *      identity: { name: 'My App', uri: 'https://myapp.com' },
 *      cluster: 'mainnet-beta',
 *    })
 *
 *    // Підключитися (показує picker wallet'ів)
 *    await wallet.connect()
 *
 *    // Підписати повідомлення (для логіну / proof-of-ownership)
 *    const sig = await wallet.signMessage(new TextEncoder().encode('Hello'))
 *
 *    // Підписати готову транзу (бек дав base64-tx, ми її десеріалізуємо)
 *    const signed = await wallet.signTransaction(tx)
 *
 *    // Підписати + засабмітити в blockchain (повертає signature)
 *    const txSig = await wallet.signAndSendTransaction(tx, slot)
 *
 *    // Відключитись (видаляє кешований auth_token)
 *    await wallet.disconnect()
 *
 *  Хук кешує `auth_token` у AsyncStorage, тож після першого `connect()` всі
 *  наступні sign-операції не показують повторно picker — лише prompt підпису.
 */

import {
  AppIdentity,
  AuthorizationResult,
  AuthorizeAPI,
  Account as MWAAccount,
  AuthToken,
  Base64EncodedAddress,
  DeauthorizeAPI,
} from "@solana-mobile/mobile-wallet-adapter-protocol"
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js"
import {
  PublicKey,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useCallback, useEffect, useState } from "react"

// ---------------------------------------------------------------------------
//  Public types
// ---------------------------------------------------------------------------

/** Кластер Solana, до якого автентифікуємось. */
export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet"

/** Зручний обʼєкт акаунта (PublicKey уже відновлений з base64 адреси). */
export interface MobileWalletAccount {
  /** Адреса в base64 — як її повертає MWA. */
  address: Base64EncodedAddress
  /** Лейбл від wallet (наприклад «Phantom Wallet 1»). */
  label?: string
  /** PublicKey, готовий для web3.js операцій. */
  publicKey: PublicKey
}

export interface UseMobileWalletOptions {
  /**
   * Ідентифікація вашої апки для wallet'а — він її показує у вікні підпису.
   * Поля: { name: string, uri: string, icon?: string }.
   */
  identity: AppIdentity
  /**
   * Кластер. Для дев — `'devnet'`. Для прода — `'mainnet-beta'`.
   */
  cluster: SolanaCluster
  /**
   * Кастомний ключ AsyncStorage під кеш. За замовчуванням `'mwa-auth-cache'`.
   * Корисно якщо у проєкті кілька різних identitiy/clusters і хочете кешити окремо.
   */
  storageKey?: string
}

export interface UseMobileWalletReturn {
  /** Чи підвантажується кеш авторизації з AsyncStorage. */
  isLoading: boolean
  /** Чи є активна авторизація (юзер раніше підключався). */
  isConnected: boolean
  /** Поточний обраний акаунт або null. */
  account: MobileWalletAccount | null
  /** Усі акаунти, до яких юзер дав доступ (зазвичай 1). */
  accounts: MobileWalletAccount[]

  /** Відкрити wallet, попросити авторизацію. Повертає обраний акаунт. */
  connect: () => Promise<MobileWalletAccount>
  /** Видалити кеш auth_token локально + повідомити wallet. */
  disconnect: () => Promise<void>

  /** Підписати raw bytes (наприклад текст). Повертає сигнатуру (Uint8Array). */
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  /** Підписати транзу (Transaction або VersionedTransaction), не сабмітити. */
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>
  /**
   * Підписати + одразу засабмітити в blockchain. Потребує `minContextSlot`
   * (slot номер з RPC, для протекту від простроченого blockhash).
   */
  signAndSendTransaction: (
    tx: Transaction | VersionedTransaction,
    minContextSlot: number,
  ) => Promise<TransactionSignature>
}

// ---------------------------------------------------------------------------
//  Helpers (приватні)
// ---------------------------------------------------------------------------

const DEFAULT_STORAGE_KEY = "mwa-auth-cache"

/**
 * Очистити локальний кеш MWA (auth_token + accounts). Викликати на logout
 * вашого додатку, щоб новий юзер не успадковував попередню авторизацію wallet'а.
 *
 * NB: НЕ дерго wallet.deauthorize() — це б вимагало відкрити wallet-апку,
 * що псує UX при logout. Дотримуємось патерну NOMADZ — лише локальне очищення.
 *
 * @param storageKey якщо ви передавали кастомний `storageKey` у `useMobileWallet`,
 *   передайте сюди те саме значення. Інакше очиститься дефолтний ключ.
 */
export async function clearMobileWalletCache(
  storageKey: string = DEFAULT_STORAGE_KEY,
): Promise<void> {
  await AsyncStorage.removeItem(storageKey)
}

/** Серіалізована форма кешу (PublicKey → base58 string для JSON). */
type SerializedAuthCache = {
  authToken: AuthToken
  selectedAccountAddress: Base64EncodedAddress
  accounts: Array<{
    address: Base64EncodedAddress
    label?: string
    publicKeyBase58: string
  }>
}

type AuthCache = {
  authToken: AuthToken
  selectedAccount: MobileWalletAccount
  accounts: MobileWalletAccount[]
}

/** Конвертувати base64 адресу від MWA у `PublicKey`. */
function publicKeyFromMwaAddress(address: Base64EncodedAddress): PublicKey {
  // У RN зазвичай вже є глобальний Buffer (з `buffer` пакета). Якщо ні —
  // додайте поліфіл, як в інструкції на початку файлу.
  return new PublicKey(Buffer.from(address, "base64"))
}

function mwaAccountToOurAccount(account: MWAAccount): MobileWalletAccount {
  return {
    address: account.address,
    label: account.label,
    publicKey: publicKeyFromMwaAddress(account.address),
  }
}

function authCacheFromAuthorizationResult(result: AuthorizationResult): AuthCache {
  const accounts = result.accounts.map(mwaAccountToOurAccount)
  return {
    authToken: result.auth_token,
    accounts,
    selectedAccount: accounts[0],
  }
}

function serialize(cache: AuthCache): SerializedAuthCache {
  return {
    authToken: cache.authToken,
    selectedAccountAddress: cache.selectedAccount.address,
    accounts: cache.accounts.map((a) => ({
      address: a.address,
      label: a.label,
      publicKeyBase58: a.publicKey.toBase58(),
    })),
  }
}

function deserialize(raw: SerializedAuthCache): AuthCache | null {
  try {
    const accounts: MobileWalletAccount[] = raw.accounts.map((a) => ({
      address: a.address,
      label: a.label,
      publicKey: new PublicKey(a.publicKeyBase58),
    }))
    const selectedAccount =
      accounts.find((a) => a.address === raw.selectedAccountAddress) ?? accounts[0]
    if (!selectedAccount) return null
    return { authToken: raw.authToken, accounts, selectedAccount }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
//  Hook
// ---------------------------------------------------------------------------

export function useMobileWallet(options: UseMobileWalletOptions): UseMobileWalletReturn {
  const { identity, cluster, storageKey = DEFAULT_STORAGE_KEY } = options

  const [auth, setAuth] = useState<AuthCache | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Завантажити кеш на маунт.
  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) return
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as SerializedAuthCache
            setAuth(deserialize(parsed))
          } catch {
            // битий кеш — ігноруємо
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [storageKey])

  const persistAuth = useCallback(
    async (next: AuthCache | null) => {
      if (next) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(serialize(next)))
      } else {
        await AsyncStorage.removeItem(storageKey)
      }
      setAuth(next)
    },
    [storageKey],
  )

  /** Свіжа авторизація — показує picker wallet'ів, якщо їх кілька. */
  const authorizeFresh = useCallback(
    async (wallet: AuthorizeAPI): Promise<MobileWalletAccount> => {
      const result = await wallet.authorize({ identity, chain: cluster })
      const next = authCacheFromAuthorizationResult(result)
      await persistAuth(next)
      return next.selectedAccount
    },
    [identity, cluster, persistAuth],
  )

  /**
   * Спробувати переюзати кешований auth_token. Якщо wallet його відкине
   * (revoked, deinstalled, expired) — фолбек на свіжу авторизацію.
   * Завдяки цьому всі post-login операції не показують повторний picker —
   * тільки prompt підпису.
   */
  const authorizeReusingToken = useCallback(
    async (wallet: AuthorizeAPI): Promise<MobileWalletAccount> => {
      if (auth?.authToken) {
        try {
          const result = await wallet.authorize({
            identity,
            chain: cluster,
            auth_token: auth.authToken,
          })
          const next = authCacheFromAuthorizationResult(result)
          await persistAuth(next)
          return next.selectedAccount
        } catch (err) {
          // Token rejected → чистимо кеш і робимо свіжу авторизацію.
          // eslint-disable-next-line no-console
          console.warn("[useMobileWallet] cached token rejected, re-authorizing:", err)
          await persistAuth(null)
        }
      }
      return authorizeFresh(wallet)
    },
    [auth, identity, cluster, persistAuth, authorizeFresh],
  )

  // Невелика затримка після повернення з wallet-апки — інакше RN іноді
  // не встигає прийняти фокус назад і наступні операції падають.
  const stabilize = () => new Promise((resolve) => setTimeout(resolve, 500))

  const connect = useCallback(async (): Promise<MobileWalletAccount> => {
    const acc = await transact(async (wallet) => authorizeFresh(wallet))
    await stabilize()
    return acc
  }, [authorizeFresh])

  const disconnect = useCallback(async (): Promise<void> => {
    if (!auth?.authToken) return
    try {
      await transact(async (wallet: DeauthorizeAPI) => {
        await wallet.deauthorize({ auth_token: auth.authToken })
      })
    } catch {
      // якщо wallet недоступний — просто чистимо локально
    }
    await persistAuth(null)
  }, [auth, persistAuth])

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      const sig = await transact(async (wallet) => {
        const account = await authorizeReusingToken(wallet)
        const signed = await wallet.signMessages({
          addresses: [account.address],
          payloads: [message],
        })
        return signed[0]
      })
      await stabilize()
      return sig
    },
    [authorizeReusingToken],
  )

  const signTransaction = useCallback(
    async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
      const signed = await transact(async (wallet) => {
        await authorizeReusingToken(wallet)
        const result = await wallet.signTransactions({ transactions: [tx] })
        return result[0] as T
      })
      await stabilize()
      return signed
    },
    [authorizeReusingToken],
  )

  const signAndSendTransaction = useCallback(
    async (
      tx: Transaction | VersionedTransaction,
      minContextSlot: number,
    ): Promise<TransactionSignature> => {
      const sig = await transact(async (wallet) => {
        await authorizeReusingToken(wallet)
        const sigs = await wallet.signAndSendTransactions({
          transactions: [tx],
          minContextSlot,
        })
        return sigs[0]
      })
      await stabilize()
      return sig
    },
    [authorizeReusingToken],
  )

  return {
    isLoading,
    isConnected: !!auth?.selectedAccount,
    account: auth?.selectedAccount ?? null,
    accounts: auth?.accounts ?? [],
    connect,
    disconnect,
    signMessage,
    signTransaction,
    signAndSendTransaction,
  }
}
