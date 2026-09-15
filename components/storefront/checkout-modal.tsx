"use client"

import { useMemo, useState } from "react"
import { Check, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatIQD } from "@/lib/format"
import { useCart } from "@/components/cart-provider"
import { createClient } from "@/lib/supabase/client"
import { PAYMENT_METHODS, type City, type OrderItem } from "@/lib/types"
import { SHOP } from "@/lib/config"

type Step = "form" | "success"

export function CheckoutModal({
  open,
  onClose,
  cities,
}: {
  open: boolean
  onClose: () => void
  cities: City[]
}) {
  const { items, subtotal, clear } = useCart()
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [cityId, setCityId] = useState("")
  const [address, setAddress] = useState("")
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0].value)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCity = useMemo(
    () => cities.find((c) => c.id === cityId) ?? null,
    [cities, cityId],
  )
  const deliveryFee = selectedCity?.delivery_fee_iqd ?? 0
  const total = subtotal + deliveryFee
  const needsReceipt = payment !== "کاش"

  function reset() {
    setStep("form")
    setName("")
    setPhone("")
    setCityId("")
    setAddress("")
    setPayment(PAYMENT_METHODS[0].value)
    setReceipt(null)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !phone.trim() || !cityId || !address.trim()) {
      setError("تکایە هەموو خانەکان پڕبکەرەوە")
      return
    }
    if (needsReceipt && !receipt) {
      setError("تکایە وەسڵی پارەدان زیاد بکە")
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      let receiptUrl: string | null = null

      if (receipt) {
        const ext = receipt.name.split(".").pop()
        const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(path, receipt)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from("receipts").getPublicUrl(path)
        receiptUrl = data.publicUrl
      }

      const orderItems: OrderItem[] = items.map((i) => ({
        title: i.title,
        shade: i.shade,
        quantity: i.quantity,
        price_iqd: i.price_iqd,
      }))

      const { error: insertError } = await supabase.from("orders").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        city: selectedCity!.name,
        address_details: address.trim(),
        items: orderItems,
        delivery_fee_iqd: deliveryFee,
        total_price_iqd: total,
        payment_method: payment,
        payment_receipt_url: receiptUrl,
      })
      if (insertError) throw insertError

      // Build WhatsApp confirmation message
      const lines = [
        `*داواکاری نوێ — ${SHOP.name}*`,
        "",
        `ناو: ${name.trim()}`,
        `مۆبایل: ${phone.trim()}`,
        `شار: ${selectedCity!.name}`,
        `ناونیشان: ${address.trim()}`,
        "",
        "*کاڵاکان:*",
        ...items.map(
          (i) =>
            `• ${i.title}${i.shade ? ` (${i.shade})` : ""} ×${i.quantity} — ${formatIQD(i.price_iqd * i.quantity)}`,
        ),
        "",
        `کرێی گەیاندن: ${formatIQD(deliveryFee)}`,
        `کۆی گشتی: ${formatIQD(total)}`,
        `شێوازی پارەدان: ${payment}`,
      ]
      const waUrl = `https://wa.me/${SHOP.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`

      clear()
      setStep("success")
      window.open(waUrl, "_blank")
    } catch (err) {
      console.log("[v0] checkout error:", err)
      setError("هەڵەیەک ڕوویدا، تکایە دووبارە هەوڵبدەرەوە")
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    if (step === "success") reset()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {step === "form" ? "تەواوکردنی داواکاری" : "داواکاری نێردرا"}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose} aria-label="داخستن">
            <X className="size-5" />
          </Button>
        </div>

        {step === "success" ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="size-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">سوپاس بۆ داواکاریت!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                داواکارییەکەت وەرگیرا. بۆ دڵنیابوونەوە پەیوەندیت پێوە دەکەین لە ڕێگەی واتساپەوە.
              </p>
            </div>
            <Button className="w-full rounded-full" onClick={handleClose}>
              گەڕانەوە بۆ کۆگا
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ناوی تەواو</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-foreground"
                  placeholder="ناوت بنووسە"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ژمارەی مۆبایل</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-right text-foreground outline-none focus:border-foreground"
                  placeholder="07XX XXX XXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">شار</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-foreground"
                >
                  <option value="">شارێک هەڵبژێرە</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {formatIQD(c.delivery_fee_iqd)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  ناونیشانی ورد
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-foreground"
                  placeholder="گەڕەک، کۆڵان، نیشانەی دیار..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">شێوازی پارەدان</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPayment(m.value)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border px-3 py-2.5 text-right transition-colors",
                        payment === m.value
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {m.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{m.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {needsReceipt && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    وەسڵی پارەدان
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-4 text-sm text-muted-foreground hover:border-foreground/40">
                    {receipt ? (
                      <span className="flex items-center gap-2 text-foreground">
                        <Check className="size-4 text-success" />
                        {receipt.name}
                      </span>
                    ) : (
                      <>
                        <Upload className="size-4" />
                        وێنەی وەسڵ زیاد بکە
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-auto border-t border-border bg-card/50 p-5">
              <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                <span>کۆی کاڵاکان</span>
                <span>{formatIQD(subtotal)}</span>
              </div>
              <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                <span>کرێی گەیاندن</span>
                <span>{deliveryFee ? formatIQD(deliveryFee) : "—"}</span>
              </div>
              <div className="mb-4 flex justify-between text-base font-bold text-foreground">
                <span>کۆی گشتی</span>
                <span>{formatIQD(total)}</span>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full rounded-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    ناردن...
                  </>
                ) : (
                  "ناردنی داواکاری"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
