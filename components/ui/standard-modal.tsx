"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ReactNode } from "react"

interface StandardModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
  icon?: ReactNode
}

export function StandardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  icon
}: StandardModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${sizeClasses[size]} mx-auto`}>
        {/* Header estandarizado */}
        <DialogHeader className="relative pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-left">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1 text-left">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Contenido del modal */}
        <div className="py-6">
          {children}
        </div>

        {/* Footer opcional */}
        {footer && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
