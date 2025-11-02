import { useState, useEffect } from 'react'

export interface CompanyInfo {
  id: string
  name: string
  business_name?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  ruc?: string
  description?: string
  settings?: Record<string, any>
  created_at: string
  updated_at: string
}

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/company')
      
      if (!response.ok) {
        throw new Error('Error al cargar información de la empresa')
      }
      
      const data = await response.json()
      setCompanyInfo(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setCompanyInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const updateCompanyInfo = async (updates: Partial<CompanyInfo>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) {
        throw new Error('Error al actualizar información de la empresa')
      }
      
      const data = await response.json()
      setCompanyInfo(data)
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  return {
    companyInfo,
    loading,
    error,
    refetch: fetchCompanyInfo,
    updateCompanyInfo
  }
}
