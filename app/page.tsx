import { createClient } from "@/lib/supabase/server"
import { Storefront } from "@/components/storefront/storefront"
import type { City, Product } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: products }, { data: cities }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("cities").select("*").order("sort_order", { ascending: true }),
  ])

  return (
    <Storefront
      products={(products as Product[]) ?? []}
      cities={(cities as City[]) ?? []}
    />
  )
}
