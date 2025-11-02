"use client"

import { useState } from "react"

/**
 * Cliente API para realizar peticiones HTTP al backend
 * Funciones helper para interactuar con las API routes
 */

import type {
  Driver,
  Route,
  Sale,
  Package,
  CreateDriver,
  CreateRoute,
  CreateSale,
  CreatePackage,
} from "@/lib/types/database"

// Configuración base para las peticiones
const API_BASE_URL = "/api"

// Helper para manejar respuestas de la API
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status}`

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorData.message || errorMessage
    } catch (parseError) {
      // Si no se puede parsear la respuesta, usar el status como error
      errorMessage = `Error HTTP: ${response.status} - ${response.statusText}`
    }

    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.data || data
}

// ============ CONDUCTORES ============

export const driversApi = {
  // Obtener todos los conductores
  getAll: async (): Promise<Driver[]> => {
    const response = await fetch(`${API_BASE_URL}/drivers`)
    return handleResponse<Driver[]>(response)
  },

  // Obtener un conductor específico
  getById: async (id: string): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`)
    return handleResponse<Driver>(response)
  },

  // Crear un nuevo conductor
  create: async (driver: CreateDriver): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driver),
    })
    return handleResponse<Driver>(response)
  },

  // Actualizar un conductor
  update: async (id: string, driver: Partial<CreateDriver>): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(driver),
    })
    return handleResponse<Driver>(response)
  },

  // Eliminar un conductor
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: "DELETE",
    })
    await handleResponse<void>(response)
  },
}

// ============ RUTAS ============

export const routesApi = {
  // Obtener todas las rutas
  getAll: async (): Promise<Route[]> => {
    const response = await fetch(`${API_BASE_URL}/routes`)
    return handleResponse<Route[]>(response)
  },

  // Crear una nueva ruta
  create: async (route: CreateRoute & { schedules?: string[] }): Promise<Route> => {
    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(route),
    })
    return handleResponse<Route>(response)
  },
}

// ============ VENTAS ============

export const salesApi = {
  // Obtener todas las ventas con filtros opcionales
  getAll: async (filters?: {
    date?: string
    status?: string
    driver_name?: string
    passenger_dni?: string
  }): Promise<Sale[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const url = `${API_BASE_URL}/sales${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url)
    return handleResponse<Sale[]>(response)
  },

  // Obtener una venta específica
  getById: async (id: string): Promise<Sale> => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`)
    return handleResponse<Sale>(response)
  },

  // Crear una nueva venta
  create: async (sale: CreateSale): Promise<Sale> => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    })
    return handleResponse<Sale>(response)
  },

  // Actualizar una venta
  update: async (id: string, sale: Partial<CreateSale>): Promise<Sale> => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    })
    return handleResponse<Sale>(response)
  },

  // Eliminar una venta
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: "DELETE",
    })
    await handleResponse<void>(response)
  },
}

// ============ PAQUETES ============

export const packagesApi = {
  // Obtener todos los paquetes con filtros opcionales
  getAll: async (filters?: {
    status?: string
    tracking_code?: string
    sender_dni?: string
    recipient_dni?: string
  }): Promise<Package[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const url = `${API_BASE_URL}/packages${params.toString() ? `?${params.toString()}` : ""}`
    const response = await fetch(url)
    return handleResponse<Package[]>(response)
  },

  // Obtener un paquete específico
  getById: async (id: string): Promise<Package> => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`)
    return handleResponse<Package>(response)
  },

  // Crear un nuevo paquete
  create: async (packageData: CreatePackage): Promise<Package> => {
    const response = await fetch(`${API_BASE_URL}/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageData),
    })
    return handleResponse<Package>(response)
  },

  // Actualizar un paquete completo
  update: async (id: string, packageData: Partial<CreatePackage>): Promise<Package> => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packageData),
    })
    return handleResponse<Package>(response)
  },

  // Actualizar estado de un paquete (PATCH para cambios parciales)
  updateStatus: async (id: string, status: string, tracking_code?: string): Promise<Package> => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tracking_code }),
    })
    return handleResponse<Package>(response)
  },

  // Eliminar un paquete
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`, {
      method: "DELETE",
    })
    await handleResponse<void>(response)
  },
}

// ============ UTILIDADES ============

// Hook personalizado para manejar estados de carga y errores
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (apiCall: () => Promise<T>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiCall()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, execute, setData, setError }
}
