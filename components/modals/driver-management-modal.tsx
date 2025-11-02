"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Phone, Mail, User, CreditCard } from "lucide-react"
import type { Driver } from "@/lib/types"

interface DriverManagementModalProps {
  isOpen: boolean
  onClose: () => void
  drivers: Driver[]
  onAddDriver: (driver: Omit<Driver, "id">) => void
  onUpdateDriver: (driver: Driver) => void
  onDeleteDriver: (driverId: string) => void
}

export function DriverManagementModal({
  isOpen,
  onClose,
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
}: DriverManagementModalProps) {
  const [isAddingDriver, setIsAddingDriver] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    license: "",
    phone: "",
    email: "",
    isActive: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setFormData({
      name: "",
      license: "",
      phone: "",
      email: "",
      isActive: true,
    })
    setErrors({})
    setIsAddingDriver(false)
    setEditingDriver(null)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    if (!formData.license.trim()) {
      newErrors.license = "La licencia es requerida"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    // Verificar si la licencia ya existe (excepto si estamos editando)
    const existingDriver = drivers.find(
      (driver) => driver.license === formData.license.trim() && driver.id !== editingDriver?.id,
    )
    if (existingDriver) {
      newErrors.license = "Esta licencia ya está registrada"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const driverData = {
      name: formData.name.trim(),
      license: formData.license.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      isActive: formData.isActive,
    }

    if (editingDriver) {
      onUpdateDriver({ ...editingDriver, ...driverData })
    } else {
      onAddDriver(driverData)
    }

    resetForm()
  }

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      license: driver.license,
      phone: driver.phone,
      email: driver.email || "",
      isActive: driver.isActive,
    })
    setEditingDriver(driver)
    setIsAddingDriver(true)
  }

  const handleDelete = (driverId: string) => {
    if (confirm("¿Está seguro que desea eliminar este conductor?")) {
      onDeleteDriver(driverId)
    }
  }

  const toggleDriverStatus = (driver: Driver) => {
    onUpdateDriver({ ...driver, isActive: !driver.isActive })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestión de Conductores</DialogTitle>
          <DialogDescription>
            Administre la información de los conductores, agregue nuevos conductores y edite los datos existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Botón Agregar / Formulario */}
          {!isAddingDriver ? (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Lista de Conductores</h3>
              <Button onClick={() => setIsAddingDriver(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Conductor
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">{editingDriver ? "Editar Conductor" : "Nuevo Conductor"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
                      setFormData({ ...formData, name: value })
                    }}
                    placeholder="Nombre completo del conductor"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Licencia de Conducir *</Label>
                  <Input
                    value={formData.license}
                    onChange={(e) => setFormData({ ...formData, license: e.target.value.toUpperCase() })}
                    placeholder="Q12345678"
                    className={errors.license ? "border-red-500" : ""}
                  />
                  {errors.license && <p className="text-sm text-red-500">{errors.license}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Teléfono *</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+51 999 123 456"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="conductor@wjlturismo.com"
                  />
                </div>

                <div className="flex items-center space-x-2 col-span-full">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <Label htmlFor="isActive">Conductor activo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>{editingDriver ? "Actualizar" : "Agregar"} Conductor</Button>
              </div>
            </div>
          )}

          {/* Lista de Conductores */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          {driver.email && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {driver.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{driver.license}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{driver.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={driver.isActive ? "default" : "secondary"}
                        className={`cursor-pointer ${
                          driver.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => toggleDriverStatus(driver)}
                      >
                        {driver.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(driver)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(driver.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {drivers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay conductores registrados</p>
                <Button variant="link" onClick={() => setIsAddingDriver(true)} className="mt-2">
                  Agregar el primer conductor
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
