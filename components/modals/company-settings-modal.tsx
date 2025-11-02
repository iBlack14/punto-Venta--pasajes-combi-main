"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useCompanyInfo, type CompanyInfo } from "@/hooks/use-company-info"
import { Loader2 } from "lucide-react"

interface CompanySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CompanySettingsModal({ isOpen, onClose }: CompanySettingsModalProps) {
  const { companyInfo, updateCompanyInfo, loading } = useCompanyInfo()
  const [formData, setFormData] = useState<Partial<CompanyInfo>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name,
        business_name: companyInfo.business_name || "",
        address: companyInfo.address || "",
        phone: companyInfo.phone || "",
        email: companyInfo.email || "",
        website: companyInfo.website || "",
        ruc: companyInfo.ruc || "",
        description: companyInfo.description || "",
        logo_url: companyInfo.logo_url || "",
      })
    }
  }, [companyInfo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateCompanyInfo(formData)
      toast.success("Información de la empresa actualizada correctamente")
      onClose()
    } catch (error) {
      toast.error("Error al actualizar la información de la empresa")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de la Empresa</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando información...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Empresa *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="business_name">Razón Social</Label>
                <Input
                  id="business_name"
                  value={formData.business_name || ""}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  value={formData.ruc || ""}
                  onChange={(e) => handleChange("ruc", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="logo_url">URL del Logo</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url || ""}
                onChange={(e) => handleChange("logo_url", e.target.value)}
                placeholder="/placeholder_logo.svg"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
