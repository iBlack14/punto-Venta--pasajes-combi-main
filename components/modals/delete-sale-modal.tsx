"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, X, User, MapPin, Calendar, Clock, CreditCard, UserCheck } from "lucide-react"
import type { Sale } from "@/lib/types"

interface DeleteSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  sale: Sale | null
}

export function DeleteSaleModal({ isOpen, onClose, onConfirm, sale }: DeleteSaleModalProps) {
  if (!sale) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-red-800 mb-2">¿Eliminar esta venta?</DialogTitle>
          <p className="text-red-600 text-sm font-medium">Esta acción no se puede deshacer</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sale Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-500" />
              Detalles de la venta
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Boleta</p>
                  <p className="text-gray-600">{sale.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Pasajero</p>
                  <p className="text-gray-600">{sale.passenger.name}</p>
                  <p className="text-xs text-gray-500">DNI: {sale.passenger.dni}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Ruta</p>
                  <p className="text-gray-600">
                    {sale.route.from} → {sale.route.to}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-xs">Fecha</p>
                    <p className="text-gray-600 text-xs">{sale.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 text-xs">Horario</p>
                    <p className="text-gray-600 text-xs">{sale.schedule}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">Asiento {sale.seatNumber.toString().padStart(2, "0")}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">S/ {sale.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Conductor: {sale.driver.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
