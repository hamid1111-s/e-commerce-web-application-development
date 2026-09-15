import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Vazirmatn } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vazirmatn",
})

export const metadata: Metadata = {
  title: "گوڵینە بۆ جوانکاری",
  description: "کۆگای جوانکاری و چاودێری پێست لە عێراق — ماکیاژ، چاودێری قژ، عەتر و بۆن",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#FAFAFA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ckb" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Toaster richColors position="top-center" dir="rtl" />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
