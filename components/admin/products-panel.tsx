"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatIQD } from "@/lib/format"
import { CATEGORIES, type Product } from "@/lib/types"
import { upsertProduct, deleteProduct } from "@/app/admin/data-actions"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react"

const EMPTY = {
  title: "",
  category: CATEGORIES[0] as string,
  price_iqd: 0,
  image_url: "" as string | null,
  in_stock: true,
  shades: [] as string[],
}

export function ProductsPanel({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [shadesText, setShadesText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setShadesText("")
    setOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      title: p.title,
      category: p.category,
      price_iqd: p.price_iqd,
      image_url: p.image_url,
      in_stock: p.in_stock,
      shades: p.shades,
    })
    setShadesText(p.shades.join("، "))
    setOpen(true)
  }

  async function onUpload(file: File) {
    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from("products").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })
      if (error) throw error
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(path)
      setForm((f) => ({ ...f, image_url: publicUrl }))
      toast.success("وێنە بارکرا")
    } catch {
      toast.error("بارکردنی وێنە سەرکەوتوو نەبوو")
    } finally {
      setUploading(false)
    }
  }

  async function onSave() {
    if (!form.title.trim()) {
      toast.error("ناوی کاڵا پێویستە")
      return
    }
    setSaving(true)
    const shades = shadesText
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const payload = { ...form, shades, price_iqd: Number(form.price_iqd) || 0 }
    const res = await upsertProduct(editing ? { ...payload, id: editing.id } : payload)
    setSaving(false)
    if (res?.error) {
      toast.error("پاشەکەوتکردن سەرکەوتوو نەبوو")
      return
    }
    // Optimistic local update
    if (editing) {
      setProducts((ps) =>
        ps.map((p) => (p.id === editing.id ? { ...p, ...payload, shades } : p)),
      )
    } else {
      setProducts((ps) => [
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...payload,
          shades,
        } as Product,
        ...ps,
      ])
    }
    toast.success(editing ? "کاڵا نوێکرایەوە" : "کاڵا زیادکرا")
    setOpen(false)
  }

  async function onDelete(id: string) {
    const prev = products
    setProducts((ps) => ps.filter((p) => p.id !== id))
    const res = await deleteProduct(id)
    if (res?.error) {
      setProducts(prev)
      toast.error("سڕینەوە سەرکەوتوو نەبوو")
    } else {
      toast.success("کاڵا سڕایەوە")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          کاڵای نوێ
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col gap-3 p-3">
            <div className="flex gap-3">
              <img
                src={p.image_url || "/placeholder.svg?height=80&width=80&query=beauty product"}
                alt={p.title}
                className="size-20 shrink-0 rounded-lg border object-cover"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-semibold text-foreground">{p.title}</span>
                <span className="text-xs text-muted-foreground">{p.category}</span>
                <span className="text-sm font-bold text-primary">{formatIQD(p.price_iqd)}</span>
                <Badge
                  variant="outline"
                  className={
                    p.in_stock
                      ? "w-fit border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "w-fit border-red-200 bg-red-50 text-red-700"
                  }
                >
                  {p.in_stock ? "بەردەستە" : "تەواوبووە"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 bg-transparent" onClick={() => openEdit(p)}>
                <Pencil className="size-3.5" />
                دەستکاری
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => onDelete(p.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "دەستکاری کاڵا" : "کاڵای نوێ"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>ناوی کاڵا</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="ناوی کاڵا"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>جۆر</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>نرخ (دینار)</Label>
                <Input
                  type="number"
                  value={form.price_iqd || ""}
                  onChange={(e) => setForm((f) => ({ ...f, price_iqd: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>وێنە</Label>
              <div className="flex items-center gap-3">
                {form.image_url && (
                  <img
                    src={form.image_url || "/placeholder.svg"}
                    alt="پێشبینین"
                    className="size-16 rounded-lg border object-cover"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onUpload(file)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                  بارکردنی وێنە
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>ڕەنگەکان (بە کۆما جیابکەرەوە)</Label>
              <Input
                value={shadesText}
                onChange={(e) => setShadesText(e.target.value)}
                placeholder="سوور، پەمەیی، ناسک"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="in_stock">لە کۆگا بەردەستە</Label>
              <Switch
                id="in_stock"
                checked={form.in_stock}
                onCheckedChange={(v) => setForm((f) => ({ ...f, in_stock: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              پاشگەزبوونەوە
            </Button>
            <Button onClick={onSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              پاشەکەوتکردن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
