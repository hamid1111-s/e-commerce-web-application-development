"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatIQD } from "@/lib/format"
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types"
import { updateOrderStatus, deleteOrder } from "@/app/admin/data-actions"
import { toast } from "sonner"
import { Trash2, Phone, MapPin, Receipt, ChevronDown, ChevronUp } from "lucide-react"

const STATUS_STYLES: Record<OrderStatus, string> = {
  چاودێڕییە: "bg-amber-100 text-amber-800 border-amber-200",
  دراوە: "bg-blue-100 text-blue-800 border-blue-200",
  نێردراوە: "bg-purple-100 text-purple-800 border-purple-200",
  تەواوبوو: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export function OrdersPanel({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [filter, setFilter] = useState<string>("هەموو")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === "هەموو" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  )

  async function onStatusChange(id: string, status: OrderStatus) {
    const prev = orders
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)))
    const res = await updateOrderStatus(id, status)
    if (res?.error) {
      setOrders(prev)
      toast.error("گۆڕینی دۆخ سەرکەوتوو نەبوو")
    } else {
      toast.success("دۆخی داواکاری نوێکرایەوە")
    }
  }

  async function onDelete(id: string) {
    const prev = orders
    setOrders((os) => os.filter((o) => o.id !== id))
    const res = await deleteOrder(id)
    if (res?.error) {
      setOrders(prev)
      toast.error("سڕینەوە سەرکەوتوو نەبوو")
    } else {
      toast.success("داواکاری سڕایەوە")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "هەموو" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("هەموو")}
        >
          هەموو ({orders.length})
        </Button>
        {ORDER_STATUSES.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
          >
            {s} ({orders.filter((o) => o.status === s).length})
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">هیچ داواکارییەک نییە</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const isOpen = expanded === order.id
            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{order.customer_name}</span>
                      <Badge variant="outline" className={STATUS_STYLES[order.status]}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="size-3.5" />
                        {order.customer_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {order.city}
                      </span>
                      <span>{new Date(order.created_at).toLocaleString("en-GB")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatIQD(order.total_price_iqd)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      aria-label="زانیاری زیاتر"
                    >
                      {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t bg-muted/30 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-foreground">کاڵاکان</h4>
                        <ul className="flex flex-col gap-1.5 text-sm">
                          {order.items.map((it, i) => (
                            <li key={i} className="flex justify-between gap-2">
                              <span className="text-muted-foreground">
                                {it.title}
                                {it.shade ? ` — ${it.shade}` : ""} × {it.quantity}
                              </span>
                              <span className="text-foreground">
                                {formatIQD(it.price_iqd * it.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-1 flex justify-between border-t pt-2 text-sm">
                          <span className="text-muted-foreground">کرێی گەیاندن</span>
                          <span>{formatIQD(order.delivery_fee_iqd)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">ناونیشان: </span>
                          <span className="text-foreground">{order.address_details}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">شێوازی پارەدان: </span>
                          <span className="font-medium text-foreground">{order.payment_method}</span>
                        </div>
                        {order.payment_receipt_url && (
                          <a
                            href={order.payment_receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            <Receipt className="size-4" />
                            بینینی پسووڵەی پارەدان
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">دۆخ:</span>
                        <Select
                          value={order.status}
                          onValueChange={(v) => onStatusChange(order.id, v as OrderStatus)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => onDelete(order.id)}
                      >
                        <Trash2 className="size-4" />
                        سڕینەوە
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
