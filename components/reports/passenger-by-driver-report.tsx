"use client"

import { useState, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, MessageCircle, Calendar, User } from "lucide-react"
import type { Sale, Route, Driver } from "@/lib/types"
import { BusManifest } from "./bus-manifest"
import html2canvas from "html2canvas"
import { useToast } from "@/hooks/use-toast"

interface PassengerByDriverReportProps {
  sales: Sale[]
  routes: Route[]
  drivers: Driver[]
}

export function PassengerByDriverReport({ sales, routes, drivers }: PassengerByDriverReportProps) {
  const [selectedDriver, setSelectedDriver] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedRoute, setSelectedRoute] = useState<string>("all")
  const [selectedSchedule, setSelectedSchedule] = useState<string>("all")
  const [printMode, setPrintMode] = useState<boolean>(false)
  const manifestRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Obtener horarios únicos de las ventas
  const availableSchedules = useMemo(() => {
    const schedules = new Set<string>()
    sales.forEach((sale) => schedules.add(sale.schedule))
    return Array.from(schedules).sort()
  }, [sales])

  // Filtrar ventas según los criterios seleccionados
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (selectedDriver && selectedDriver !== "all" && sale.driver.id !== selectedDriver) return false
      if (selectedDate && sale.date !== selectedDate) return false
      if (selectedRoute && selectedRoute !== "all" && sale.route.id.toString() !== selectedRoute) return false
      if (selectedSchedule && selectedSchedule !== "all" && sale.schedule !== selectedSchedule) return false
      return true
    })
  }, [sales, selectedDriver, selectedDate, selectedRoute, selectedSchedule])

  // Agrupar ventas por conductor
  const salesByDriver = useMemo(() => {
    const grouped: Record<string, Sale[]> = {}
    filteredSales.forEach((sale) => {
      if (!grouped[sale.driver.id]) {
        grouped[sale.driver.id] = []
      }
      grouped[sale.driver.id].push(sale)
    })
    return grouped
  }, [filteredSales])

  const handleDownloadJPG = async () => {
    if (!manifestRef.current) return

    try {
      // Activar modo impresión antes de capturar
      setPrintMode(true)

      // Esperar un pequeño delay para que React renderice los cambios
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(manifestRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      // Desactivar modo impresión después de capturar
      setPrintMode(false)

      const link = document.createElement("a")
      link.download = `manifiesto-${selectedDate || "todos"}-${new Date().getTime()}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()

      toast({
        title: "Descarga exitosa",
        description: "El manifiesto se ha descargado como imagen JPG",
        variant: "default",
      })
    } catch (error) {
      // Asegurar que se desactive el modo impresión en caso de error
      setPrintMode(false)

      toast({
        title: "Error en descarga",
        description: "No se pudo descargar el manifiesto",
        variant: "destructive",
      })
    }
  }

  const handleSendWhatsApp = () => {
    const driverData = Object.entries(salesByDriver)[0]
    if (!driverData) return

    const [driverId, driverSales] = driverData
    const driver = drivers.find((d) => d.id === driverId)
    if (!driver) return

    const totalPassengers = driverSales.length
    const routes = [...new Set(driverSales.map((sale) => `${sale.route.from} → ${sale.route.to}`))].join(", ")
    const date = selectedDate || "Hoy"

    const message =
      `🚌 *MANIFIESTO DE PASAJEROS*\n\n` +
      `👨‍✈️ *Conductor:* ${driver.name}\n` +
      `📅 *Fecha:* ${date}\n` +
      `🛣️ *Rutas:* ${routes}\n` +
      `👥 *Total Pasajeros:* ${totalPassengers}\n\n` +
      `📋 *Detalles del viaje adjuntos en el manifiesto visual*\n\n` +
      `_WJL Turismo - Sistema de Gestión_`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    toast({
      title: "WhatsApp abierto",
      description: "Se ha preparado el mensaje para enviar al conductor",
      variant: "default",
    })
  }

  const clearFilters = () => {
    setSelectedDriver("all")
    setSelectedDate("")
    setSelectedRoute("all")
    setSelectedSchedule("all")
  }

  const totalPassengers = filteredSales.length
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const uniqueRoutes = new Set(filteredSales.map((sale) => `${sale.route.from} → ${sale.route.to}`)).size

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Manifiesto de Pasajeros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Conductor</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los conductores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los conductores</SelectItem>
                  {drivers
                    .filter((d) => d.isActive)
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Ruta</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las rutas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutas</SelectItem>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id.toString()}>
                      {route.from} → {route.to}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horario</Label>
              <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los horarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los horarios</SelectItem>
                  {availableSchedules.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <span>Total: {totalPassengers} pasajeros</span>
              <span>Ingresos: S/ {totalRevenue.toFixed(2)}</span>
              <span>Rutas: {uniqueRoutes}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
              <Button onClick={handleDownloadJPG} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar JPG
              </Button>
              <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div ref={manifestRef}>
        {Object.keys(salesByDriver).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No se encontraron datos con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(salesByDriver).map(([driverId, driverSales]) => {
              const driver = drivers.find((d) => d.id === driverId)
              if (!driver) return null

              // Agrupar por ruta y horario para crear manifiestos separados
              const manifestGroups = driverSales.reduce(
                (acc, sale) => {
                  const key = `${sale.route.from}-${sale.route.to}-${sale.schedule}-${sale.date}`
                  if (!acc[key]) {
                    acc[key] = {
                      sales: [],
                      route: `${sale.route.from} → ${sale.route.to}`,
                      schedule: sale.schedule,
                      date: sale.date,
                    }
                  }
                  acc[key].sales.push(sale)
                  return acc
                },
                {} as Record<string, { sales: Sale[]; route: string; schedule: string; date: string }>,
              )

              return Object.entries(manifestGroups).map(([key, group]) => (
                <BusManifest
                  key={`${driverId}-${key}`}
                  sales={group.sales}
                  driverName={driver.name}
                  route={group.route}
                  date={group.date}
                  schedule={group.schedule}
                  printMode={printMode}
                />
              ))
            })}
          </div>
        )}
      </div>
    </div>
  )
}
