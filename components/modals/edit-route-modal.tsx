"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Route } from "@/lib/types"

interface EditRouteModalProps {
  isOpen: boolean
  onClose: () => void
  route: Route | null
  onSave: (route: Route) => void
}

export function EditRouteModal({ isOpen, onClose, route, onSave }: EditRouteModalProps) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    price: 0,
    schedule: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (route) {
      setFormData({
        from: route.from,
        to: route.to,
        price: route.price,
        schedule: route.departure_time || route.schedule || "",
      })
    }
  }, [route])

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm() || !route) return

    const updatedRoute: Route = {
      ...route,
      from: formData.from.trim(),
      to: formData.to.trim(),
      price: formData.price,
      departure_time: formData.schedule.trim(),
    }

    onSave(updatedRoute)
    onClose()
  }

  const handleClose = () => {
    setFormData({ from: "", to: "", price: 0, schedule: "" })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ruta</DialogTitle>
          <DialogDescription>
            Modifique los detalles de la ruta seleccionada, incluyendo origen, destino, precio y duración.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from">Origen</Label>
              <Input
                id="from"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                placeholder="Ciudad de origen"
                className={errors.from ? "border-red-500" : ""}
              />
              {errors.from && <p className="text-sm text-red-500">{errors.from}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">Destino</Label>
              <Input
                id="to"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="Ciudad de destino"
                className={errors.to ? "border-red-500" : ""}
              />
              {errors.to && <p className="text-sm text-red-500">{errors.to}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Precio (S/)</Label>
            <Input
              id="price"
              type="number"
              min="1"
              step="0.50"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              placeholder="25.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule">Horario</Label>
            <Input
              id="schedule"
              type="time"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              className={errors.schedule ? "border-red-500" : ""}
            />
            {errors.schedule && <p className="text-sm text-red-500">{errors.schedule}</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
