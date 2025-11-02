"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Route, Driver, Package } from "@/lib/types"

interface PackageFormProps {
  routes: Route[]
  drivers: Driver[]
  onSubmit: (packageData: Omit<Package, "id" | "date" | "time">) => void
  onCancel: () => void
}

export function PackageForm({ routes, drivers, onSubmit, onCancel }: PackageFormProps) {
  // Datos del Remitente
  const [senderName, setSenderName] = useState("")
  const [senderDni, setSenderDni] = useState("")
  const [senderPhone, setSenderPhone] = useState("")

  // Datos del Destinatario
  const [receiverName, setReceiverName] = useState("")
  const [receiverDni, setReceiverDni] = useState("")
  const [receiverPhone, setReceiverPhone] = useState("")

  const [isSearchingSender, setIsSearchingSender] = useState(false)
  const [isSearchingReceiver, setIsSearchingReceiver] = useState(false)
  const [senderHint, setSenderHint] = useState<string>("")
  const [receiverHint, setReceiverHint] = useState<string>("")

  // Detalles del Envío
  const [selectedRouteId, setSelectedRouteId] = useState("")
  const [status, setStatus] = useState<Package["status"]>("Pendiente")
  const [description, setDescription] = useState("")
  const [total, setTotal] = useState("")

  const selectedRoute = routes.find((r) => r.id.toString() === selectedRouteId)

  const fetchNamePhoneByDni = async (dni: string): Promise<{ name?: string; phone?: string } | null> => {
    try {
      const pSenderRes = await fetch(`/api/packages?sender_dni=${dni}`)
      const pSenderJson = await pSenderRes.json().catch(() => ({}))
      const pSender = Array.isArray(pSenderJson?.data) ? pSenderJson.data[0] : null
      if (pSender) {
        return { name: pSender.sender_name, phone: pSender.sender_phone }
      }

      const pRecRes = await fetch(`/api/packages?recipient_dni=${dni}`)
      const pRecJson = await pRecRes.json().catch(() => ({}))
      const pRec = Array.isArray(pRecJson?.data) ? pRecJson.data[0] : null
      if (pRec) {
        return { name: pRec.recipient_name, phone: pRec.recipient_phone }
      }

      const sRes = await fetch(`/api/sales?passenger_dni=${dni}`)
      const sJson = await sRes.json().catch(() => ({}))
      const s = Array.isArray(sJson?.data) ? sJson.data[0] : null
      if (s && s.passenger) {
        return { name: s.passenger.name, phone: s.passenger.phone }
      }

      return null
    } catch {
      return null
    }
  }

  const fetchDniApi = async (dni: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/dni?dni=${dni}`)
      if (!res.ok) return null
      const data = await res.json().catch(() => null)
      return data?.nombre_completo || null
    } catch {
      return null
    }
  }

  const handleSenderDniChange = async (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 8)
    setSenderDni(clean)
    setSenderHint("")
    if (clean.length === 8) {
      setIsSearchingSender(true)
      const existing = await fetchNamePhoneByDni(clean)
      if (existing?.name) {
        setSenderName(existing.name)
        if (existing.phone) setSenderPhone(existing.phone)
        setSenderHint("Datos cargados desde registros")
        setIsSearchingSender(false)
        return
      }
      const apiName = await fetchDniApi(clean)
      if (apiName) {
        setSenderName(apiName)
        setSenderHint("Nombre obtenido desde API de DNI")
      } else {
        setSenderHint("DNI no encontrado")
      }
      setIsSearchingSender(false)
    }
  }

  const handleReceiverDniChange = async (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 8)
    setReceiverDni(clean)
    setReceiverHint("")
    if (clean.length === 8) {
      setIsSearchingReceiver(true)
      const existing = await fetchNamePhoneByDni(clean)
      if (existing?.name) {
        setReceiverName(existing.name)
        if (existing.phone) setReceiverPhone(existing.phone)
        setReceiverHint("Datos cargados desde registros")
        setIsSearchingReceiver(false)
        return
      }
      const apiName = await fetchDniApi(clean)
      if (apiName) {
        setReceiverName(apiName)
        setReceiverHint("Nombre obtenido desde API de DNI")
      } else {
        setReceiverHint("DNI no encontrado")
      }
      setIsSearchingReceiver(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !senderName ||
      !senderDni ||
      !senderPhone ||
      !receiverName ||
      !receiverDni ||
      !receiverPhone ||
      !selectedRouteId ||
      !description ||
      !total
    ) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    if (!selectedRoute) return

    // Encontrar primer conductor activo disponible
    const firstActiveDriver = drivers.find((d) => d.isActive)
    if (!firstActiveDriver) {
      alert("No hay conductores activos disponibles")
      return
    }

    const packageData: Omit<Package, "id" | "date" | "time"> = {
      sender: {
        name: senderName,
        dni: senderDni,
        phone: senderPhone,
        address: "", // Campo requerido pero simplificado
      },
      receiver: {
        name: receiverName,
        dni: receiverDni,
        phone: receiverPhone,
        address: "", // Campo requerido pero simplificado
      },
      route: {
        id: selectedRoute.id,
        from: selectedRoute.from,
        to: selectedRoute.to,
        price: Number.parseFloat(total) || 0,
      },
      schedule: "08:00", // Valor por defecto
      description,
      weight: 1, // Valor por defecto
      dimensions: "", // Campo requerido pero simplificado
      value: 0, // Valor por defecto
      total: Number.parseFloat(total) || 0,
      status,
      driver: firstActiveDriver,
    }

    onSubmit(packageData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos del Remitente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">📤</span>
              Datos del Remitente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sender-dni">DNI *</Label>
              <div className="relative">
                <Input
                  id="sender-dni"
                  value={senderDni}
                  onChange={(e) => void handleSenderDniChange(e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  required
                  className={senderDni && senderDni.length !== 8 ? "border-red-500" : undefined}
                />
                {isSearchingSender && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Buscando…</div>
                )}
              </div>
              {senderDni.length > 0 && senderDni.length !== 8 && (
                <p className="text-sm text-red-500">El DNI debe tener exactamente 8 dígitos</p>
              )}
              {senderHint && <p className="text-xs text-muted-foreground">{senderHint}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-name">Nombres y Apellidos *</Label>
              <Input
                id="sender-name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Juan Pérez López"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-phone">Celular *</Label>
              <Input
                id="sender-phone"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="987 123 456"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos del Destinatario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <span className="mr-2">📥</span>
              Datos del Destinatario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiver-dni">DNI *</Label>
              <div className="relative">
                <Input
                  id="receiver-dni"
                  value={receiverDni}
                  onChange={(e) => void handleReceiverDniChange(e.target.value)}
                  placeholder="87654321"
                  maxLength={8}
                  required
                  className={receiverDni && receiverDni.length !== 8 ? "border-red-500" : undefined}
                />
                {isSearchingReceiver && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Buscando…</div>
                )}
              </div>
              {receiverDni.length > 0 && receiverDni.length !== 8 && (
                <p className="text-sm text-red-500">El DNI debe tener exactamente 8 dígitos</p>
              )}
              {receiverHint && <p className="text-xs text-muted-foreground">{receiverHint}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver-name">Nombres y Apellidos *</Label>
              <Input
                id="receiver-name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="María García Rodríguez"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiver-phone">Celular *</Label>
              <Input
                id="receiver-phone"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="987 654 321"
                required
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalles del Envío */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">📦</span>
            Detalles del Envío
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route">Ruta *</Label>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ruta" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.from} → {route.to}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Package["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Pagado">Pagado</SelectItem>
                  <SelectItem value="En Tránsito">En Tránsito</SelectItem>
                  <SelectItem value="Entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Contenido *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el contenido del paquete (ej: ropa, documentos, electrodomésticos, etc.)"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total a Pagar (S/) *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="50.00"
              required
            />
          </div>

          {/* Resumen */}
          {selectedRoute && total && (
            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Resumen del Envío
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ruta:</span>
                  <span className="font-medium">{selectedRoute.from} → {selectedRoute.to}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="font-medium">{status}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total a Pagar:</span>
                  <span className="text-green-600">S/ {Number.parseFloat(total || "0").toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <span className="mr-2">✅</span>
          Registrar Encomienda
        </Button>
      </div>
    </form>
  )
}
