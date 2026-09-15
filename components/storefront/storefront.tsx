"use client"

import { useMemo, useState } from "react"
import { CartProvider } from "@/components/cart-provider"
import { StoreHeader } from "./store-header"
import { CategoryTabs } from "./category-tabs"
import { ProductCard } from "./product-card"
import { CartDrawer } from "./cart-drawer"
import { CheckoutModal } from "./checkout-modal"
import { SHOP } from "@/lib/config"
import type { City, Product } from "@/lib/types"

export function Storefront({
  products,
  cities,
}: {
  products: Product[]
  cities: City[]
}) {
  const [active, setActive] = useState("هەموو")
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  )

  const filtered = useMemo(
    () => (active === "هەموو" ? products : products.filter((p) => p.category === active)),
    [products, active],
  )

  return (
    <CartProvider>
      <div className="min-h-dvh bg-background">
        <StoreHeader onOpenCart={() => setCartOpen(true)} />

        <section className="border-b border-border bg-gradient-to-b from-accent/10 to-background">
          <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:py-16">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {SHOP.name}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
              جوانترین بەرهەمەکانی جوانکاری و چاودێری پێست، گەیاندن بۆ هەموو شارەکانی عێراق
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div className="sticky top-16 z-30 -mx-4 bg-background/90 px-4 py-3 backdrop-blur-sm">
            <CategoryTabs categories={categories} active={active} onChange={setActive} />
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              هیچ بەرهەمێک نییە لەم بەشەدا
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>

        <footer className="mt-8 border-t border-border py-8 text-center text-sm text-muted-foreground">
          <p>{SHOP.name} — هەموو مافەکان پارێزراون</p>
        </footer>

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false)
            setCheckoutOpen(true)
          }}
        />
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cities={cities}
        />
      </div>
    </CartProvider>
  )
}
