"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Users2, Receipt, BarChart3, Package } from "lucide-react"
import { useCompanyInfo } from "@/hooks/use-company-info"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  companyLogo?: string
}

export function MobileNav({ activeTab, onTabChange, isOpen, onOpenChange, companyLogo }: MobileNavProps) {
  const { companyInfo } = useCompanyInfo()
  const menuItems = [
    { value: "ventas", label: "Ventas", icon: ShoppingCart },
    { value: "asientos", label: "Asientos", icon: Users2 },
    { value: "boletas", label: "Boletas", icon: Receipt },
    { value: "encomiendas", label: "Encomiendas", icon: Package },
    { value: "reportes", label: "Reportes", icon: BarChart3 },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <img
                src={companyLogo || "/placeholder_logo.svg"}
                alt="Logo"
                className="h-6 w-6 rounded object-cover"
              />
              <div>
                <h2 className="font-semibold text-foreground">{companyInfo?.name || "WJL TURISMO"}</h2>
                <p className="text-xs text-muted-foreground">Menú Principal</p>
              </div>
            </div>
          </div>

          {/* Items del menú */}
          <div className="flex-1 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    onTabChange(item.value)
                    onOpenChange(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors
                    ${
                      activeTab === item.value
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                        : "text-foreground hover:bg-accent"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Footer del menú */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <div>© 2024 {companyInfo?.name || "WJL TURISMO"}</div>
              <div>Sistema de Gestión v1.0</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
