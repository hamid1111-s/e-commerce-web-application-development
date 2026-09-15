import type { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-svh bg-muted/30">{children}</div>
}
