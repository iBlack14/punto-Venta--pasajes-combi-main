"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Send, MessageCircle, Phone, Users, X, CheckCircle } from "lucide-react"
import type { Sale } from "@/lib/types"
import { sendBulkTicketsViaWhatsApp, isValidPeruvianPhone, formatPhoneNumber } from "@/lib/utils/whatsapp-utils"

interface BulkWhatsAppModalProps {
  isOpen: boolean
  onClose: () => void
  sales: Sale[]
}

export function BulkWhatsAppModal({ isOpen, onClose, sales }: BulkWhatsAppModalProps) {
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSending, setCurrentSending] = useState(0)
  const [totalToSend, setTotalToSend] = useState(0)

  // Filtrar ventas que tienen teléfono
  const salesWithPhone = useMemo(() => {
    return sales.filter((sale) => sale.passenger.phone && sale.passenger.phone.trim() !== "")
  }, [sales])

  const salesWithoutPhone = useMemo(() => {
    return sales.filter((sale) => !sale.passenger.phone || sale.passenger.phone.trim() === "")
  }, [sales])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSales(salesWithPhone.map((sale) => sale.id))
    } else {
      setSelectedSales([])
    }
  }

  const handleSelectSale = (saleId: string, checked: boolean) => {
    if (checked) {
      setSelectedSales((prev) => [...prev, saleId])
    } else {
      setSelectedSales((prev) => prev.filter((id) => id !== saleId))
    }
  }

  const handleBulkSend = async () => {
    const salesToSend = salesWithPhone.filter((sale) => selectedSales.includes(sale.id))

    if (salesToSend.length === 0) {
      alert("Seleccione al menos una boleta para enviar")
      return
    }

    setIsLoading(true)
    setTotalToSend(salesToSend.length)
    setCurrentSending(0)
    setProgress(0)

    try {
      await sendBulkTicketsViaWhatsApp(salesToSend, (current, total) => {
        setCurrentSending(current)
        setProgress((current / total) * 100)
      })

      // Limpiar selección después del envío exitoso
      setSelectedSales([])
    } catch (error) {
      console.error("Error in bulk send:", error)
      alert("Error durante el envío masivo")
    } finally {
      setIsLoading(false)
      setProgress(0)
      setCurrentSending(0)
      setTotalToSend(0)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSelectedSales([])
      setProgress(0)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-green-600" />
            <span>Envío Masivo por WhatsApp</span>
          </DialogTitle>
          <DialogDescription>
            Seleccione las boletas que desea enviar por WhatsApp y realice el envío masivo a los pasajeros.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Con Teléfono</p>
                  <p className="text-2xl font-bold text-green-800">{salesWithPhone.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Sin Teléfono</p>
                  <p className="text-2xl font-bold text-orange-800">{salesWithoutPhone.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Seleccionadas</p>
                  <p className="text-2xl font-bold text-blue-800">{selectedSales.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progreso del envío */}
          {isLoading && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Enviando mensajes...</span>
                <span className="text-sm text-blue-600">
                  {currentSending} de {totalToSend}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Tabla de boletas con teléfono */}
          {salesWithPhone.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Boletas Disponibles para Envío</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="selectAll"
                    checked={selectedSales.length === salesWithPhone.length}
                    onCheckedChange={handleSelectAll}
                    disabled={isLoading}
                  />
                  <label htmlFor="selectAll" className="text-sm font-medium">
                    Seleccionar todas ({salesWithPhone.length})
                  </label>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <span className="sr-only">Seleccionar</span>
                        </TableHead>
                        <TableHead>Boleta</TableHead>
                        <TableHead>Pasajero</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesWithPhone.map((sale) => {
                        const isValidPhone = isValidPeruvianPhone(formatPhoneNumber(sale.passenger.phone))
                        return (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedSales.includes(sale.id)}
                                onCheckedChange={(checked) => handleSelectSale(sale.id, checked as boolean)}
                                disabled={isLoading}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{sale.id}</TableCell>
                            <TableCell>{sale.passenger.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{sale.passenger.phone}</span>
                                {isValidPhone ? (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                                    ✓
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                                    ?
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {sale.route.from} → {sale.route.to}
                            </TableCell>
                            <TableCell>{sale.date}</TableCell>
                            <TableCell>
                              <Badge variant={sale.status === "Pagado" ? "default" : "secondary"}>{sale.status}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          {/* Boletas sin teléfono */}
          {salesWithoutPhone.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                Boletas Sin Teléfono ({salesWithoutPhone.length})
              </h3>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
                  Las siguientes boletas no pueden ser enviadas porque no tienen número de teléfono registrado:
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {salesWithoutPhone.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between text-sm">
                      <span>
                        {sale.id} - {sale.passenger.name}
                      </span>
                      <span className="text-orange-600">Sin teléfono</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              {isLoading ? "Enviando..." : "Cerrar"}
            </Button>
            <Button
              onClick={handleBulkSend}
              disabled={selectedSales.length === 0 || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar {selectedSales.length} Boletas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
