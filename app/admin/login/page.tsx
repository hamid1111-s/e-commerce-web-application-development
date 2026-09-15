import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/admin/login-form"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/admin")

  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-foreground">پانێڵی بەڕێوەبردن</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            بچۆ ژوورەوە بۆ بەڕێوەبردنی داواکاری و بەرهەمەکان
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
