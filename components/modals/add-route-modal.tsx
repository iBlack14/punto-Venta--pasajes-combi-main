"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StandardModal } from "@/components/ui/standard-modal"
import { MapPin, Clock, DollarSign, Route as RouteIcon } from "lucide-react"
import cn from "classnames"
import type { Route } from "@/lib/types"

interface AddRouteModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (route: Omit<Route, "id">) => void
  existingRoutes: Route[]
}

export function AddRouteModal({ isOpen, onClose, onAdd, existingRoutes }: AddRouteModalProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    price: 0,
    schedule: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showFromSuggestions, setShowFromSuggestions] = useState(false)
  const [showToSuggestions, setShowToSuggestions] = useState(false)

  const commonCities = [
    "Huarmaca",
    "Piura",
    "Chiclayo",
    "Lima",
    "Trujillo",
    "Cajamarca",
    "Lambayeque",
    "Chota",
    "Cutervo",
    "Olmos",
  ]

  const cityOptions = useMemo(() => {
    const set = new Set<string>()
    commonCities.forEach((c) => set.add(c))
    existingRoutes.forEach((r) => {
      if (r.from) set.add(r.from)
      if (r.to) set.add(r.to)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [existingRoutes])

  const filterCities = (query: string, exclude?: string) => {
    const q = query.trim().toLowerCase()
    return cityOptions
      .filter((c) => (!exclude || c.toLowerCase() !== exclude.trim().toLowerCase()))
      .filter((c) => (q.length === 0 ? true : c.toLowerCase().includes(q)))
      .slice(0, 8)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.from.trim()) {
      newErrors.from = "El origen es requerido"
    }
    if (!formData.to.trim()) {
      newErrors.to = "El destino es requerido"
    }
    if (formData.from.trim() === formData.to.trim()) {
      newErrors.to = "El destino debe ser diferente al origen"
    }
    if (formData.price <= 0) {
      newErrors.price = "El precio debe ser mayor a 0"
    }
    if (!formData.schedule.trim()) {
      newErrors.schedule = "El horario es requerido"
    }

    // Verificar si la ruta ya existe
    const routeExists = existingRoutes.some(
      (route) =>
        route.from.toLowerCase() === formData.from.trim().toLowerCase() &&
        route.to.toLowerCase() === formData.to.trim().toLowerCase(),
    )

    if (routeExists) {
      newErrors.to = "Esta ruta ya existe"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = () => {
    if (!validateForm()) return

    const newRoute = {
      from: formData.from.trim(),
      to: formData.to.trim(),
      price: formData.price,
      schedule: formData.schedule.trim(),
    }

    onAdd(newRoute)
    handleClose()
  }

  const handleClose = () => {
    setFormData({ from: "", to: "", price: 0, schedule: "" })
    setErrors({})
    onClose()
  }

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button
        variant="outline"
        onClick={handleClose}
        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleAdd}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
      >
        <RouteIcon className="h-4 w-4 mr-2" />
        Agregar Ruta
      </Button>
    </div>
  )

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agregar Nueva Ruta"
      description="Complete la información para crear una nueva ruta de viaje con origen, destino, precio y duración."
      size="md"
      icon={<MapPin className="h-6 w-6 text-blue-600" />}
      footer={footer}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="flex items-center space-x-2 font-medium">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Origen</span>
            </Label>
            <div className="relative">
              <Input
                id="from"
                placeholder="Escribe el origen"
                value={formData.from}
                onFocus={() => setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 100)}
                onChange={(e) => {
                  setFormData({ ...formData, from: e.target.value })
                  setShowFromSuggestions(true)
                }}
                className={cn(
                  "transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-green-200",
                  errors.from ? "border-red-500 ring-red-200" : "",
                )}
              />
              {showFromSuggestions && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                  <ul className="max-h-56 overflow-auto py-1 text-sm">
                    {filterCities(formData.from).map((city) => (
                      <li
                        key={city}
                        className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormData({ ...formData, from: city })
                          setShowFromSuggestions(false)
                        }}
                      >
                        {city}
                      </li>
                    ))}
                    {filterCities(formData.from).length === 0 && (
                      <li className="px-3 py-2 text-muted-foreground">Sin sugerencias</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {errors.from && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.from}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="to" className="flex items-center space-x-2 font-medium">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>Destino</span>
            </Label>
            <div className="relative">
              <Input
                id="to"
                placeholder="Escribe el destino"
                value={formData.to}
                onFocus={() => setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 100)}
                onChange={(e) => {
                  setFormData({ ...formData, to: e.target.value })
                  setShowToSuggestions(true)
                }}
                className={cn(
                  "transition-all duration-200 hover:border-red-400 focus:border-red-500 focus:ring-red-200",
                  errors.to ? "border-red-500 ring-red-200" : "",
                )}
              />
              {showToSuggestions && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                  <ul className="max-h-56 overflow-auto py-1 text-sm">
                    {filterCities(formData.to, formData.from).map((city) => (
                      <li
                        key={city}
                        className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setFormData({ ...formData, to: city })
                          setShowToSuggestions(false)
                        }}
                      >
                        {city}
                      </li>
                    ))}
                    {filterCities(formData.to, formData.from).length === 0 && (
                      <li className="px-3 py-2 text-muted-foreground">Sin sugerencias</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {errors.to && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.to}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="flex items-center space-x-2 font-medium">
            <DollarSign className="h-4 w-4 text-yellow-600" />
            <span>Precio (S/)</span>
          </Label>
          <Input
            id="price"
            type="number"
            min="1"
            step="0.50"
            value={formData.price || ""}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
            placeholder="25.00"
            className={cn(
              "transition-all duration-200 hover:border-yellow-400 focus:border-yellow-500 focus:ring-yellow-200",
              errors.price ? "border-red-500 ring-red-200" : "",
            )}
          />
          {errors.price && (
            <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.price}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule" className="flex items-center space-x-2 font-medium">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Horario</span>
          </Label>
          <Input
            id="schedule"
            type="time"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            className={cn(
              "transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200",
              errors.schedule ? "border-red-500 ring-red-200" : "",
            )}
          />
          {errors.schedule && (
            <p className="text-sm text-red-500 flex items-center space-x-1">
              <span>⚠️</span>
              <span>{errors.schedule}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-2 rounded-md">
            💡 Horario de salida del viaje
          </p>
        </div>
      </div>
    </StandardModal>
  )
}
