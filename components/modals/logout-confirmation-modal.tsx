"use client"

import { StandardModal } from "@/components/ui/standard-modal"
import { Button } from "@/components/ui/button"
import { LogOut, AlertTriangle, User } from "lucide-react"

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
}

export function LogoutConfirmationModal({ isOpen, onClose, onConfirm, userName }: LogoutConfirmationModalProps) {
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
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Cerrar Sesión
      </Button>
    </div>
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Cerrar Sesión?"
      description="¿Estás seguro de que quieres cerrar tu sesión actual?"
      size="sm"
      icon={<LogOut className="h-6 w-6 text-red-600" />}
      footer={footer}
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {userName || "Usuario"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sesión activa
              </p>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Información importante
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Al cerrar sesión, perderás cualquier trabajo no guardado y tendrás que iniciar sesión nuevamente para acceder al sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StandardModal>
  )
}
