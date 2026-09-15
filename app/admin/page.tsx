import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "./actions"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import type { Order, Product, City } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const [ordersRes, productsRes, citiesRes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("cities").select("*").order("sort_order", { ascending: true }),
  ])

  return (
    <AdminDashboard
      user={{ email: user.email ?? "" }}
      initialOrders={(ordersRes.data as Order[]) ?? []}
      initialProducts={(productsRes.data as Product[]) ?? []}
      initialCities={(citiesRes.data as City[]) ?? []}
      signOutAction={signOut}
    />
  )
}
