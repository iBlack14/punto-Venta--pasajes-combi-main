import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ResizeObserverWorkaround } from "@/components/dev/resizeobserver-workaround"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WJL Turismo - Sistema de Gestión",
  description: "Sistema de administración de pasajes para WJL Turismo",
  icons: {
    icon: [
      {
        url: '/placeholder-ico.jpg',
        type: 'image/jpeg',
      },
      {
        url: '/placeholder-ico.jpg',
        sizes: '32x32',
        type: 'image/jpeg',
      },
    ],
    shortcut: '/placeholder-ico.jpg',
    apple: '/placeholder-ico.jpg',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ResizeObserverWorkaround />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
