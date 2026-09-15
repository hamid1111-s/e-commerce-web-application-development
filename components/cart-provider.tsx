"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { CartItem, Product } from "@/lib/types"

interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, shade: string | null) => void
  removeItem: (productId: string, shade: string | null) => void
  updateQuantity: (productId: string, shade: string | null, quantity: number) => void
  clear: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "gwlina-cart"

function keyOf(productId: string, shade: string | null) {
  return `${productId}__${shade ?? ""}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, loaded])

  function addItem(product: Product, shade: string | null) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => keyOf(i.productId, i.shade) === keyOf(product.id, shade),
      )
      if (existing) {
        return prev.map((i) =>
          keyOf(i.productId, i.shade) === keyOf(product.id, shade)
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price_iqd: product.price_iqd,
          image_url: product.image_url,
          shade,
          quantity: 1,
        },
      ]
    })
  }

  function removeItem(productId: string, shade: string | null) {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.productId, i.shade) !== keyOf(productId, shade)),
    )
  }

  function updateQuantity(productId: string, shade: string | null, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, shade)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        keyOf(i.productId, i.shade) === keyOf(productId, shade)
          ? { ...i, quantity }
          : i,
      ),
    )
  }

  function clear() {
    setItems([])
  }

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.price_iqd, 0),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totalItems,
      subtotal,
    }),
    [items, totalItems, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
