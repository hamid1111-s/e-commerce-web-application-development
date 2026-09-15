"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/app/admin/actions"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          ئیمەیڵ
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          required
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-foreground"
          placeholder="admin@gwlina.shop"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          وشەی نهێنی
        </label>
        <input
          id="password"
          name="password"
          type="password"
          dir="ltr"
          required
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground outline-none focus:border-foreground"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full rounded-full">
        {pending ? <Loader2 className="size-4 animate-spin" /> : "چوونەژوورەوە"}
      </Button>
    </form>
  )
}
