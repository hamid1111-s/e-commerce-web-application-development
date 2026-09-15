"use client"

import Image from "next/image"
import { useState } from "react"
import { Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatIQD } from "@/lib/format"
import { useCart } from "@/components/cart-provider"
import type { Product } from "@/lib/types"

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const hasShades = product.shades && product.shades.length > 0
  const [shade, setShade] = useState<string | null>(
    hasShades ? product.shades[0] : null,
  )
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product, shade)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.image_url || "/placeholder.svg?height=400&width=400&query=beauty product"}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.in_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <span className="rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background">
              نەماوە
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-accent">{product.category}</p>
          <h3 className="mt-1 text-pretty font-semibold leading-snug text-foreground">
            {product.title}
          </h3>
        </div>

        {hasShades && (
          <div className="flex flex-wrap gap-1.5">
            {product.shades.map((s) => (
              <button
                key={s}
                onClick={() => setShade(s)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  shade === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-foreground">
            {formatIQD(product.price_iqd)}
          </span>
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={!product.in_stock}
            className="size-9 shrink-0 rounded-full"
            aria-label="زیادکردن بۆ سەبەتە"
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
