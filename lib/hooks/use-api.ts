"use client"

/**
 * Hooks personalizados para interactuar con la API
 * Manejo de estado, cache y optimistic updates
 */

import { useState, useEffect, useCallback } from "react"
import { driversApi, routesApi, salesApi, packagesApi } from "@/lib/api/client"
import type { Driver, Route, Sale, Package } from "@/lib/types/database"

// ============ HOOK PARA CONDUCTORES ============

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar conductores
  const loadDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await driversApi.getAll()
      setDrivers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar conductores")
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear conductor con optimistic update
  const createDriver = useCallback(async (driverData: any) => {
    try {
      const newDriver = await driversApi.create(driverData)
      setDrivers((prev) => [...prev, newDriver])
      return newDriver
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear conductor")
      throw err
    }
  }, [])

  // Actualizar conductor
  const updateDriver = useCallback(async (id: string, driverData: any) => {
    try {
      const updatedDriver = await driversApi.update(id, driverData)
      setDrivers((prev) => prev.map((d) => (d.id === id ? updatedDriver : d)))
      return updatedDriver
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar conductor")
      throw err
    }
  }, [])

  // Eliminar conductor
  const deleteDriver = useCallback(async (id: string) => {
    try {
      await driversApi.delete(id)
      setDrivers((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar conductor")
      throw err
    }
  }, [])

  // Cargar al montar el componente
  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  return {
    drivers,
    loading,
    error,
    loadDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
  }
}

// ============ HOOK PARA RUTAS ============

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar rutas
  const loadRoutes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await routesApi.getAll()
      setRoutes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar rutas")
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear ruta
  const createRoute = useCallback(async (routeData: any) => {
    try {
      const newRoute = await routesApi.create(routeData)
      setRoutes((prev) => [...prev, newRoute])
      return newRoute
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear ruta")
      throw err
    }
  }, [])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  return {
    routes,
    loading,
    error,
    loadRoutes,
    createRoute,
  }
}

// ============ HOOK PARA VENTAS ============

export function useSales(filters?: any) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar ventas
  const loadSales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await salesApi.getAll(filters)
      setSales(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar ventas")
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Crear venta
  const createSale = useCallback(async (saleData: any) => {
    try {
      const newSale = await salesApi.create(saleData)
      setSales((prev) => [newSale, ...prev])
      return newSale
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear venta")
      throw err
    }
  }, [])

  // Actualizar venta
  const updateSale = useCallback(async (id: string, saleData: any) => {
    try {
      const updatedSale = await salesApi.update(id, saleData)
      setSales((prev) => prev.map((s) => (s.id === id ? updatedSale : s)))
      return updatedSale
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar venta")
      throw err
    }
  }, [])

  // Eliminar venta
  const deleteSale = useCallback(async (id: string) => {
    try {
      await salesApi.delete(id)
      setSales((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar venta")
      throw err
    }
  }, [])

  useEffect(() => {
    loadSales()
  }, [loadSales])

  return {
    sales,
    loading,
    error,
    loadSales,
    createSale,
    updateSale,
    deleteSale,
  }
}

// ============ HOOK PARA PAQUETES ============

export function usePackages(filters?: any) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar paquetes
  const loadPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await packagesApi.getAll(filters)
      setPackages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar paquetes")
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Crear paquete
  const createPackage = useCallback(async (packageData: any) => {
    try {
      const newPackage = await packagesApi.create(packageData)
      setPackages((prev) => [newPackage, ...prev])
      return newPackage
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear paquete")
      throw err
    }
  }, [])

  // Actualizar paquete completo
  const updatePackage = useCallback(async (id: string, packageData: any) => {
    try {
      const updatedPackage = await packagesApi.update(id, packageData)
      setPackages((prev) => prev.map((p) => (p.id === id ? updatedPackage : p)))
      return updatedPackage
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar paquete")
      throw err
    }
  }, [])

  // Actualizar estado del paquete
  const updatePackageStatus = useCallback(async (id: string, status: string, tracking_code?: string) => {
    try {
      const updatedPackage = await packagesApi.updateStatus(id, status, tracking_code)
      setPackages((prev) => prev.map((p) => (p.id === id ? updatedPackage : p)))
      return updatedPackage
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar estado del paquete")
      throw err
    }
  }, [])

  // Eliminar paquete
  const deletePackage = useCallback(async (id: string) => {
    try {
      await packagesApi.delete(id)
      setPackages((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar paquete")
      throw err
    }
  }, [])

  // Obtener paquete por ID
  const getPackageById = useCallback(async (id: string) => {
    try {
      const packageData = await packagesApi.getById(id)
      return packageData
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener paquete")
      throw err
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  return {
    packages,
    loading,
    error,
    loadPackages,
    createPackage,
    updatePackage,
    updatePackageStatus,
    deletePackage,
    getPackageById,
  }
}
