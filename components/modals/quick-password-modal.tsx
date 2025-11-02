"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Eye, EyeOff, Lock } from "lucide-react"

interface QuickPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onChangePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => void
}

export function QuickPasswordModal({ isOpen, onClose, onChangePassword }: QuickPasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setErrors({})
    setShowPasswords({ current: false, new: false, confirm: false })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!currentPassword) {
      newErrors.current = "La contraseña actual es requerida"
    }
    if (!newPassword) {
      newErrors.new = "La nueva contraseña es requerida"
    } else if (newPassword.length < 6) {
      newErrors.new = "La contraseña debe tener al menos 6 caracteres"
    }
    if (!confirmPassword) {
      newErrors.confirm = "Confirme la nueva contraseña"
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onChangePassword(currentPassword, newPassword, confirmPassword)
      resetForm()
      onClose()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Cambiar Contraseña</span>
          </DialogTitle>
          <DialogDescription>
            Ingrese su contraseña actual y defina una nueva contraseña para su cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contraseña Actual */}
          <div className="space-y-2">
            <Label htmlFor="current">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="current"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (errors.current) setErrors((prev) => ({ ...prev, current: "" }))
                }}
                placeholder="Ingrese su contraseña actual"
                className={errors.current ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.current && <p className="text-sm text-red-500">{errors.current}</p>}
          </div>

          {/* Nueva Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="new">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="new"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (errors.new) setErrors((prev) => ({ ...prev, new: "" }))
                }}
                placeholder="Ingrese la nueva contraseña"
                className={errors.new ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.new && <p className="text-sm text-red-500">{errors.new}</p>}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: "" }))
                }}
                placeholder="Confirme la nueva contraseña"
                className={errors.confirm ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirm && <p className="text-sm text-red-500">{errors.confirm}</p>}
          </div>

          {/* Indicador de fortaleza */}
          {newPassword && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Fortaleza de la contraseña:</div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength =
                    newPassword.length >= 8 ? 4 : newPassword.length >= 6 ? 3 : newPassword.length >= 4 ? 2 : 1

                  return (
                    <div
                      key={level}
                      className={`h-2 flex-1 rounded ${
                        level <= strength
                          ? strength === 1
                            ? "bg-red-500"
                            : strength === 2
                              ? "bg-yellow-500"
                              : strength === 3
                                ? "bg-blue-500"
                                : "bg-green-500"
                          : "bg-muted"
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Cambiar Contraseña</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
