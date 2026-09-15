"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { OrdersPanel } from "./orders-panel"
import { ProductsPanel } from "./products-panel"
import { CitiesPanel } from "./cities-panel"
import type { Order, Product, City } from "@/lib/types"
import { LogOut, Package, ClipboardList, MapPin } from "lucide-react"

export function AdminDashboard({
  user,
  initialOrders,
  initialProducts,
  initialCities,
  signOutAction,
}: {
  user: { email: string }
  initialOrders: Order[]
  initialProducts: Product[]
  initialCities: City[]
  signOutAction: () => Promise<void>
}) {
  const [tab, setTab] = useState("orders")
  const pendingCount = initialOrders.filter((o) => o.status === "چاودێڕییە").length

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-foreground">پانێڵی بەڕێوەبردن</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit" className="gap-2 bg-transparent">
            <LogOut className="size-4" />
            چوونەدەرەوە
          </Button>
        </form>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="gap-2">
            <ClipboardList className="size-4" />
            داواکارییەکان
            {pendingCount > 0 && (
              <span className="ms-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="size-4" />
            کاڵاکان
          </TabsTrigger>
          <TabsTrigger value="cities" className="gap-2">
            <MapPin className="size-4" />
            شارەکان
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <OrdersPanel orders={initialOrders} />
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <ProductsPanel products={initialProducts} />
        </TabsContent>
        <TabsContent value="cities" className="mt-4">
          <CitiesPanel cities={initialCities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
