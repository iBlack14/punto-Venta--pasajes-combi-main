"use client"

import { StandardModal } from "@/components/ui/standard-modal"
import { Button } from "@/components/ui/button"
import { CheckCircle, Printer, MessageCircle, User, MapPin, Calendar, Clock, CreditCard } from "lucide-react"
import type { Sale } from "@/lib/types"

interface SalesSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  onPrintTicket?: (sale: Sale) => void
  onSendWhatsApp?: (sale: Sale) => void
}

export function SalesSuccessModal({ isOpen, onClose, sale, onPrintTicket, onSendWhatsApp }: SalesSuccessModalProps) {
  if (!sale) return null

  const handlePrint = () => {
    onPrintTicket?.(sale)
  }

  const handleWhatsApp = () => {
    onSendWhatsApp?.(sale)
  }

  const footer = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button
          onClick={handleWhatsApp}
          className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      <Button
        onClick={onClose}
        variant="outline"
        className="w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        Continuar
      </Button>

      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
        <p>Conductor: {sale.driver.name}</p>
        <p>Registrado: {sale.time}</p>
      </div>
    </div>
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="¡Venta Registrada!"
      description="El boleto ha sido generado exitosamente"
      size="md"
      icon={<CheckCircle className="h-6 w-6 text-green-600" />}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Boleto generado exitosamente
          </div>
        </div>

        {/* Ticket Details Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="text-center border-b border-gray-200 dark:border-gray-600 pb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Boleto #{sale.id}</h3>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {sale.status}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{sale.passenger.name}</p>
                <p className="text-gray-500 dark:text-gray-400">DNI: {sale.passenger.dni}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {sale.route.from} → {sale.route.to}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Asiento {sale.seatNumber.toString().padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{sale.date}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{sale.schedule}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <CreditCard className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <p className="font-bold text-lg text-green-600 dark:text-green-400">S/ {sale.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StandardModal>
  )
}
