"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { OrderStatus } from "@/lib/types"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("unauthorized")
  return supabase
}

/* ----------------------------- Orders ----------------------------- */

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("orders").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin")
  return { success: true }
}

export async function deleteOrder(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("orders").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin")
  return { success: true }
}

/* ---------------------------- Products ---------------------------- */

export async function upsertProduct(input: {
  id?: string
  title: string
  category: string
  price_iqd: number
  image_url: string | null
  in_stock: boolean
  shades: string[]
}) {
  const supabase = await requireAdmin()
  if (input.id) {
    const { error } = await supabase
      .from("products")
      .update({
        title: input.title,
        category: input.category,
        price_iqd: input.price_iqd,
        image_url: input.image_url,
        in_stock: input.in_stock,
        shades: input.shades,
      })
      .eq("id", input.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("products").insert({
      title: input.title,
      category: input.category,
      price_iqd: input.price_iqd,
      image_url: input.image_url,
      in_stock: input.in_stock,
      shades: input.shades,
    })
    if (error) return { error: error.message }
  }
  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true }
}

/* ----------------------------- Cities ----------------------------- */

export async function upsertCity(input: {
  id?: string
  name: string
  delivery_fee_iqd: number
  sort_order: number
}) {
  const supabase = await requireAdmin()
  if (input.id) {
    const { error } = await supabase
      .from("cities")
      .update({
        name: input.name,
        delivery_fee_iqd: input.delivery_fee_iqd,
        sort_order: input.sort_order,
      })
      .eq("id", input.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from("cities").insert({
      name: input.name,
      delivery_fee_iqd: input.delivery_fee_iqd,
      sort_order: input.sort_order,
    })
    if (error) return { error: error.message }
  }
  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true }
}

export async function deleteCity(id: string) {
  const supabase = await requireAdmin()
  const { error } = await supabase.from("cities").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/admin")
  revalidatePath("/")
  return { success: true }
}
