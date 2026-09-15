"use client"

import { cn } from "@/lib/utils"

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (c: string) => void
}) {
  const all = ["هەموو", ...categories]
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
      {all.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === c
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
