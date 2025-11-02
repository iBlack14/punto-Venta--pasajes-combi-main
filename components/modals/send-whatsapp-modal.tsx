"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, User, Send, X, Ticket, MapPin, Calendar, Armchair } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Sale } from "@/lib/types"
import {
  sendTicketViaWhatsApp,
  generateTicketMessage,
  formatPhoneNumber,
  isValidPeruvianPhone,
} from "@/lib/utils/whatsapp-utils"

interface SendWhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

export function SendWhatsAppModal({ isOpen, onClose, sale }: SendWhatsAppModalProps) {
  const [customPhone, setCustomPhone] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [useCustomMessage, setUseCustomMessage] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (sale && isOpen) {
      setCustomPhone(sale.passenger.phone || "")
      setCustomMessage(generateTicketMessage(sale))
      setUseCustomMessage(false)
    }
  }, [sale, isOpen])

  const handleSend = async () => {
    if (!sale) return

    setIsLoading(true)

    try {
      const phoneToUse = customPhone || sale.passenger.phone
      const messageToUse = useCustomMessage ? customMessage : generateTicketMessage(sale)

      if (!phoneToUse) {
        alert("Por favor ingrese un número de teléfono")
        return
      }

      sendTicketViaWhatsApp(sale, phoneToUse, messageToUse)
      onClose()
    } catch (error) {
      console.error("Error sending WhatsApp:", error)
      alert("Error al enviar mensaje por WhatsApp")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setCustomPhone("")
    setCustomMessage("")
    setUseCustomMessage(false)
    onClose()
  }

  if (!sale) return null

  const hasRegisteredPhone = !!sale.passenger.phone
  const phoneToValidate = customPhone || sale.passenger.phone || ""
  const isValidPhone = phoneToValidate ? isValidPeruvianPhone(formatPhoneNumber(phoneToValidate)) : false

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            <span>Enviar Boleta por WhatsApp</span>
          </DialogTitle>
          <DialogDescription>
            Configure el número de teléfono y personalice el mensaje antes de enviar la boleta por WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center space-x-2">
              <Ticket className="h-5 w-5" />
              <span>Información de la Boleta</span>
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 font-mono">
                    {sale.id}
                  </Badge>
                  <span className="text-muted-foreground">N° Boleta</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{sale.passenger.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                    {sale.passenger.dni}
                  </span>
                  <span className="text-muted-foreground text-xs">DNI</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {sale.route.from} → {sale.route.to}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>{sale.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Armchair className="h-4 w-4 text-purple-600" />
                  <span>Asiento {sale.seatNumber.toString().padStart(2, "0")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Número de WhatsApp</span>
              </Label>
              {hasRegisteredPhone ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <Phone className="h-3 w-3 mr-1" />
                  Teléfono registrado
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                  <User className="h-3 w-3 mr-1" />
                  Sin teléfono registrado
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <Input
                placeholder="+51 999 123 456"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className={cn(
                  "transition-all duration-200",
                  !isValidPhone && phoneToValidate
                    ? "border-red-500 ring-red-200 focus:ring-red-300"
                    : "hover:border-green-400 focus:border-green-500 focus:ring-green-200",
                )}
              />

              {!hasRegisteredPhone && (
                <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Este pasajero no tiene teléfono registrado. Ingrese un número para enviar.</span>
                  </p>
                </div>
              )}

              {phoneToValidate && !isValidPhone && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 flex items-center space-x-2">
                    <span>❌</span>
                    <span>Formato de número no válido. Use formato: +51 999 123 456</span>
                  </p>
                </div>
              )}

              {phoneToValidate && isValidPhone && (
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center space-x-2">
                    <span>✅</span>
                    <span>Número válido: {formatPhoneNumber(phoneToValidate)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Configuración del mensaje */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Mensaje</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCustomMessage"
                  checked={useCustomMessage}
                  onChange={(e) => setUseCustomMessage(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="useCustomMessage" className="text-sm">
                  Personalizar mensaje
                </Label>
              </div>
            </div>

            {useCustomMessage ? (
              <div className="space-y-2">
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Escriba su mensaje personalizado..."
                />
                <p className="text-xs text-muted-foreground">
                  Caracteres: {customMessage.length} | WhatsApp permite hasta 4096 caracteres
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border max-h-60 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono">{generateTicketMessage(sale)}</pre>
                </div>
                <p className="text-xs text-muted-foreground">Vista previa del mensaje estándar que se enviará</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-border/30">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={!phoneToValidate || !isValidPhone || isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Enviando..." : "Enviar por WhatsApp"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
