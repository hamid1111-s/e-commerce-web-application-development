"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatIQD } from "@/lib/format"
import type { City } from "@/lib/types"
import { upsertCity, deleteCity } from "@/app/admin/data-actions"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

const EMPTY = { name: "", delivery_fee_iqd: 0, sort_order: 0 }

export function CitiesPanel({ cities: initial }: { cities: City[] }) {
  const [cities, setCities] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<City | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, sort_order: cities.length })
    setOpen(true)
  }

  function openEdit(c: City) {
    setEditing(c)
    setForm({ name: c.name, delivery_fee_iqd: c.delivery_fee_iqd, sort_order: c.sort_order })
    setOpen(true)
  }

  async function onSave() {
    if (!form.name.trim()) {
      toast.error("ناوی شار پێویستە")
      return
    }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      delivery_fee_iqd: Number(form.delivery_fee_iqd) || 0,
      sort_order: Number(form.sort_order) || 0,
    }
    const res = await upsertCity(editing ? { ...payload, id: editing.id } : payload)
    setSaving(false)
    if (res?.error) {
      toast.error("پاشەکەوتکردن سەرکەوتوو نەبوو")
      return
    }
    if (editing) {
      setCities((cs) =>
        cs
          .map((c) => (c.id === editing.id ? { ...c, ...payload } : c))
          .sort((a, b) => a.sort_order - b.sort_order),
      )
    } else {
      setCities((cs) =>
        [
          { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...payload } as City,
          ...cs,
        ].sort((a, b) => a.sort_order - b.sort_order),
      )
    }
    toast.success(editing ? "شار نوێکرایەوە" : "شار زیادکرا")
    setOpen(false)
  }

  async function onDelete(id: string) {
    const prev = cities
    setCities((cs) => cs.filter((c) => c.id !== id))
    const res = await deleteCity(id)
    if (res?.error) {
      setCities(prev)
      toast.error("سڕینەوە سەرکەوتوو نەبوو")
    } else {
      toast.success("شار سڕایەوە")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          شاری نوێ
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => (
          <Card key={c.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground">{c.name}</span>
              <span className="text-sm text-muted-foreground">
                کرێی گەیاندن: {formatIQD(c.delivery_fee_iqd)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="دەستکاری">
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(c.id)}
                aria-label="سڕینەوە"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "دەستکاری شار" : "شاری نوێ"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>ناوی شار</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="هەولێر"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>کرێی گەیاندن (دینار)</Label>
                <Input
                  type="number"
                  value={form.delivery_fee_iqd || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, delivery_fee_iqd: Number(e.target.value) }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>ڕیزبەندی</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
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
