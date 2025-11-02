"use client"

import { useState } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Printer, MessageCircle, Eye, EyeOff, Trash2 } from "lucide-react"
import type { Package } from "@/lib/types"

interface PackageListProps {
  packages: Package[]
  onUpdateStatus: (packageId: string, status: Package["status"]) => void
  onPrintLabel: (pkg: Package) => void
  onSendWhatsApp: (pkg: Package) => void
  onDelete: (packageId: string) => void // Added onDelete prop
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function PackageList({
  packages,
  onUpdateStatus,
  onPrintLabel,
  onSendWhatsApp,
  onDelete, // Added onDelete prop
  searchTerm,
  onSearchChange,
}: PackageListProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const getStatusColor = (status: Package["status"]) => {
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

  const getStatusIcon = (status: Package["status"]) => {
    switch (status) {
      case "Pendiente":
        return "⏳"
      case "Pagado":
        return "✅"
      case "En Tránsito":
        return "🚛"
      case "Entregado":
        return "📦"
      default:
        return "❓"
    }
  }

  const filteredPackages = packages.filter((pkg) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      pkg.id.toLowerCase().includes(searchLower) ||
      pkg.sender.name.toLowerCase().includes(searchLower) ||
      pkg.receiver.name.toLowerCase().includes(searchLower) ||
      pkg.sender.dni.includes(searchTerm) ||
      pkg.receiver.dni.includes(searchTerm) ||
      pkg.description.toLowerCase().includes(searchLower)
    )
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle>Lista de Encomiendas</CardTitle>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre o DNI..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onSearchChange("")}
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">Código</TableHead>
                <TableHead className="min-w-[150px]">Remitente</TableHead>
                <TableHead className="min-w-[150px]">Destinatario</TableHead>
                <TableHead className="min-w-[120px]">Ruta</TableHead>
                <TableHead className="min-w-[100px]">Fecha</TableHead>
                <TableHead className="min-w-[80px]">Peso</TableHead>
                <TableHead className="min-w-[80px]">Total</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="min-w-[150px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => (
                <React.Fragment key={pkg.id}>
                  <TableRow>
                    <TableCell className="font-medium">{pkg.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {searchTerm && pkg.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pkg.sender.name.replace(
                                  new RegExp(`(${searchTerm})`, "gi"),
                                  '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                ),
                              }}
                            />
                          ) : (
                            pkg.sender.name
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {searchTerm && pkg.sender.dni.includes(searchTerm) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pkg.sender.dni.replace(
                                  new RegExp(`(${searchTerm})`, "gi"),
                                  '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                ),
                              }}
                            />
                          ) : (
                            pkg.sender.dni
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {searchTerm && pkg.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pkg.receiver.name.replace(
                                  new RegExp(`(${searchTerm})`, "gi"),
                                  '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                ),
                              }}
                            />
                          ) : (
                            pkg.receiver.name
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {searchTerm && pkg.receiver.dni.includes(searchTerm) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: pkg.receiver.dni.replace(
                                  new RegExp(`(${searchTerm})`, "gi"),
                                  '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                ),
                              }}
                            />
                          ) : (
                            pkg.receiver.dni
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pkg.route.from} → {pkg.route.to}
                    </TableCell>
                    <TableCell>{pkg.date}</TableCell>
                    <TableCell>{pkg.weight} kg</TableCell>
                    <TableCell>S/ {pkg.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={pkg.status}
                        onValueChange={(value) => onUpdateStatus(pkg.id, value as Package["status"])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={getStatusColor(pkg.status)}>
                              {getStatusIcon(pkg.status)} {pkg.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">⏳ Pendiente</SelectItem>
                          <SelectItem value="Pagado">✅ Pagado</SelectItem>
                          <SelectItem value="En Tránsito">🚛 En Tránsito</SelectItem>
                          <SelectItem value="Entregado">📦 Entregado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowDetails(showDetails === pkg.id ? null : pkg.id)}
                          title="Ver detalles"
                        >
                          {showDetails === pkg.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onPrintLabel(pkg)} title="Imprimir etiqueta">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSendWhatsApp(pkg)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          title="Enviar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(pkg.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          title="Eliminar encomienda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {showDetails === pkg.id && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/50">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Información del Remitente</h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <strong>Nombre:</strong> {pkg.sender.name}
                                </p>
                                <p>
                                  <strong>DNI:</strong> {pkg.sender.dni}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {pkg.sender.phone}
                                </p>
                                <p>
                                  <strong>Dirección:</strong> {pkg.sender.address}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Información del Destinatario</h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <strong>Nombre:</strong> {pkg.receiver.name}
                                </p>
                                <p>
                                  <strong>DNI:</strong> {pkg.receiver.dni}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {pkg.receiver.phone}
                                </p>
                                <p>
                                  <strong>Dirección:</strong> {pkg.receiver.address}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Detalles del Paquete</h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <strong>Descripción:</strong> {pkg.description}
                                </p>
                                <p>
                                  <strong>Peso:</strong> {pkg.weight} kg
                                </p>
                                <p>
                                  <strong>Dimensiones:</strong> {pkg.dimensions}
                                </p>
                                <p>
                                  <strong>Valor declarado:</strong> S/ {pkg.value.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Información del Viaje</h4>
                              <div className="text-sm space-y-1">
                                <p>
                                  <strong>Conductor:</strong> {pkg.driver.name}
                                </p>
                                <p>
                                  <strong>Licencia:</strong> {pkg.driver.license}
                                </p>
                                <p>
                                  <strong>Teléfono:</strong> {pkg.driver.phone}
                                </p>
                                <p>
                                  <strong>Horario:</strong> {pkg.schedule}
                                </p>
                                {pkg.deliveryDate && (
                                  <p>
                                    <strong>Fecha de entrega:</strong> {pkg.deliveryDate}
                                  </p>
                                )}
                                {pkg.notes && (
                                  <p>
                                    <strong>Notas:</strong> {pkg.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          {filteredPackages.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron resultados para "{searchTerm}"</p>
              <Button variant="link" onClick={() => onSearchChange("")} className="mt-2">
                Limpiar búsqueda
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
