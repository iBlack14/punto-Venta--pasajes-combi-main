"use client"

import type React from "react"

import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, KeyRound } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useCompanyInfo } from "@/hooks/use-company-info"

interface HeaderProps {
  totalToday: number
  onChangePassword: () => void
  onSettings: () => void
  onLogout: () => void
  userPhoto?: string
  companyLogo?: string
  children?: React.ReactNode
}

export function Header({
  totalToday,
  onChangePassword,
  onSettings,
  onLogout,
  userPhoto,
  companyLogo,
  children,
}: HeaderProps) {
  const { companyInfo, loading } = useCompanyInfo()

  return (
    <header className="bg-background shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {children}
            <img
              src={companyInfo?.logo_url || companyLogo || "/placeholder_logo.svg"}
              alt="Logo WJL TURISMO"
              className="h-[37px] w-[91px] object-contain rounded-none shadow-none border-0 bg-transparent"
            />
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-foreground">
                {loading ? "Cargando..." : companyInfo?.name || "WJL TURISMO"}
              </h1>
              <p className="text-sm text-muted-foreground">Sistema de Administración</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-muted-foreground">Ventas de Hoy</p>
              <p className="text-2xl font-bold text-green-600">S/ {totalToday.toFixed(2)}</p>
            </div>

            {/* Ventas de hoy para móvil */}
            <div className="text-right sm:hidden">
              <p className="text-xs text-muted-foreground">Hoy</p>
              <p className="text-lg font-bold text-green-600">S/ {totalToday.toFixed(2)}</p>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Menu de Usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={userPhoto || "/placeholder-user.jpg"}
                      alt="Usuario"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">Administrador</p>
                  <p className="text-xs leading-none text-muted-foreground">admin@wjlturismo.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onChangePassword}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Cambiar Contraseña</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
