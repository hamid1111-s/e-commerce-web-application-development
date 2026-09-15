"use client"

import Image from "next/image"
import { Minus, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatIQD } from "@/lib/format"
import { useCart } from "@/components/cart-provider"

export function CartDrawer({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  onCheckout: () => void
}) {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="سەبەتەی کڕین"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">سەبەتەی کڕین</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="داخستن">
            <X className="size-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-muted-foreground">سەبەتەکەت بەتاڵە</p>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.shade}`}
                className="flex gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=64&width=64&query=product"}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-tight text-foreground">
                        {item.title}
                      </p>
                      {item.shade && (
                        <p className="text-xs text-muted-foreground">
                          ڕەنگ: {item.shade}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.shade)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="سڕینەوە"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.shade, item.quantity - 1)
                        }
                        className="flex size-7 items-center justify-center text-foreground"
                        aria-label="کەمکردنەوە"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.shade, item.quantity + 1)
                        }
                        className="flex size-7 items-center justify-center text-foreground"
                        aria-label="زیادکردن"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {formatIQD(item.price_iqd * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-muted-foreground">کۆی گشتی</span>
              <span className="text-lg font-bold text-foreground">
                {formatIQD(subtotal)}
              </span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              کرێی گەیاندن لە کاتی داواکاریدا زیاد دەکرێت
            </p>
            <Button size="lg" className="w-full rounded-full" onClick={onCheckout}>
              بەردەوامبوون بۆ داواکاری
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
