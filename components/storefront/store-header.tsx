"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { SHOP } from "@/lib/config"

export function StoreHeader({ onOpenCart }: { onOpenCart: () => void }) {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-foreground">
            {SHOP.name}
          </span>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={onOpenCart}
          className="relative gap-2 rounded-full bg-transparent"
        >
          <ShoppingBag className="size-5" />
          <span className="hidden sm:inline">سەبەتە</span>
          {totalItems > 0 && (
            <span className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}
