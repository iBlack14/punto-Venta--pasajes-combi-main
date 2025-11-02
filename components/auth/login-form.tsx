"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react"
import { useCompanyInfo } from "@/hooks/use-company-info"

interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string }) => void
  isLoading?: boolean
  error?: string
}

export function LoginForm({ onLogin, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({})
  const { companyInfo } = useCompanyInfo()

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Ingresa un email válido"
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida"
    } else if (password.length < 4) {
      errors.password = "La contraseña debe tener al menos 4 caracteres"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onLogin({ email: email.trim(), password })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-36 h-28 flex items-center justify-center mb-4">
            <img
              src="/placeholder_logo.svg"
              alt="Logo WJL TURISMO"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{companyInfo?.name || "WJL TURISMO"}</h1>
          <p className="text-gray-600 dark:text-gray-400">Sistema de Administración</p>
        </div>

        {/* Formulario de Login */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error general */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (formErrors.email) {
                        setFormErrors((prev) => ({ ...prev, email: undefined }))
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingresa tu email"
                    className={`pl-10 ${formErrors.email ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formErrors.password) {
                        setFormErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingresa tu contraseña"
                    className={`pl-10 pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
              </div>

              {/* Botón de Login */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-2.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Información adicional */}
            <div className="pt-4 border-t">
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">¿Olvidaste tu contraseña? Contacta al administrador</p>
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <span>📞 +51 953 576 234</span>
                  <span>📧 blxk.busines@gmail.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2024 {companyInfo?.name || "WJL TURISMO"}. Todos los derechos reservados.</p>
          <p>Sistema de Gestión v1.0 • Desarrollado para el transporte interprovincial</p>
        </div>
      </div>
    </div>
  )
}
