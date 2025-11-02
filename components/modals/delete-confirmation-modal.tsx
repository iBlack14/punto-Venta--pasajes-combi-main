"use client"

import { StandardModal } from "@/components/ui/standard-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Package, User, MapPin, Trash2 } from "lucide-react"
import type { Package as PackageType } from "@/lib/types"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  packageData: PackageType | null
  isDeleting?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  packageData,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!packageData) return null

  const getStatusColor = (status: PackageType["status"]) => {
    switch (status) {
      case "Pendiente":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "Pagado":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "En Tránsito":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Entregado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={onClose}
        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        disabled={isDeleting}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Eliminando..." : "Eliminar Encomienda"}
      </Button>
    </div>
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Eliminar Encomienda?"
      description="Esta acción no se puede deshacer. La encomienda será eliminada permanentemente."
      size="lg"
      icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
      footer={footer}
    >
      <div className="space-y-6">
        {/* Package Info Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">{packageData.id}</span>
            </div>
            <Badge className={getStatusColor(packageData.status)}>{packageData.status}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span>Remitente</span>
              </div>
              <div className="pl-6 space-y-1 text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">{packageData.sender?.name || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">DNI: {packageData.sender?.dni || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">{packageData.sender?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Receiver Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span>Destinatario</span>
              </div>
              <div className="pl-6 space-y-1 text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">{packageData.receiver?.name || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">DNI: {packageData.receiver?.dni || 'N/A'}</p>
                <p className="text-gray-600 dark:text-gray-400">{packageData.receiver?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Route and Package Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {packageData.route.from} → {packageData.route.to}
              </span>
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Peso:</span> {packageData.weight} kg
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">Total:</span> S/ {packageData.total.toFixed(2)}
            </div>
          </div>

          {packageData.description && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Descripción:</span> {packageData.description}
              </p>
            </div>
          )}
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-800 dark:text-red-200 mb-1">Advertencia importante</p>
              <p className="text-red-700 dark:text-red-300">
                Una vez eliminada, no podrás recuperar esta encomienda ni su información asociada. Asegúrate de que
                realmente deseas proceder con esta acción.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StandardModal>
  )
}
