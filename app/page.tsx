"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  DollarSign,
  FileText,
  Plus,
  Search,
  Printer,
  Bus,
  Edit,
  Trash2,
  MessageCircle,
  Send,
  Clock,
} from "lucide-react"

// Components
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SeatSelector } from "@/components/seats/seat-selector"
import { EditRouteModal } from "@/components/modals/edit-route-modal"
import { AddRouteModal } from "@/components/modals/add-route-modal"
import { WhatsAppWidget } from "@/components/support/whatsapp-widget"
import { LoginForm } from "@/components/auth/login-form"
import { DriverManagementModal } from "@/components/modals/driver-management-modal"
import { QuickPasswordModal } from "@/components/modals/quick-password-modal"
import { SendWhatsAppModal } from "@/components/modals/send-whatsapp-modal"
import { BulkWhatsAppModal } from "@/components/modals/bulk-whatsapp-modal"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationModal } from "@/components/modals/delete-confirmation-modal"
import { SalesSuccessModal } from "@/components/modals/sales-success-modal"
import { DeleteSaleModal } from "@/components/modals/delete-sale-modal"
import { LogoutConfirmationModal } from "@/components/modals/logout-confirmation-modal"

// Components
import { PackageForm } from "@/components/packages/package-form"
import { PackageList } from "@/components/packages/package-list"

// Reports
import { PassengerByDriverReport } from "@/components/reports/passenger-by-driver-report"

// Utils and Types
import type { Sale, SeatMap, Route, Driver, Package } from "@/lib/types"
import { DEFAULT_ROUTES, DEFAULT_SCHEDULES, COMPANY_CONFIG, DEFAULT_PACKAGES } from "@/lib/constants"
import { getSeatMapKey, getAvailableSeatsCount } from "@/lib/utils/seat-utils"
import { printTicket } from "@/lib/utils/print-utils"
import { authenticateUser, logout, saveAuthData, loadAuthData, type AuthState, hasPermission, setLogoutCallback, updateLastActivity, clearSessionTimeout, resetSessionTimeout } from "@/lib/auth"
import { printPackageLabel } from "@/lib/utils/package-utils"
import { sendPackageLabelViaWhatsApp } from "@/lib/utils/whatsapp-utils"

import { useDrivers, useSales, usePackages } from "@/lib/hooks/use-api"
import type { Package as ApiPackage } from "@/lib/types/database"

export default function Home() {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  })
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Existing State Management
  const [seatMap, setSeatMap] = useState<SeatMap>({})
  const [routes, setRoutes] = useState<Route[]>(DEFAULT_ROUTES)
  const [schedules, setSchedules] = useState(DEFAULT_SCHEDULES)
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("ventas")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Route Management State
  const [isEditRouteOpen, setIsEditRouteOpen] = useState(false)
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false)
  const [selectedRoute, setSelectedRouteForEdit] = useState<Route | null>(null)

  // WhatsApp State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isBulkWhatsAppModalOpen, setIsBulkWhatsAppModalOpen] = useState(false)
  const [selectedSaleForWhatsApp, setSelectedSaleForWhatsApp] = useState<Sale | null>(null)

  // Form States
  const [passengerName, setPassengerName] = useState("")
  const [passengerDni, setPassengerDni] = useState("")
  const [passengerPhone, setPassengerPhone] = useState("")
  const [selectedRouteId, setSelectedRouteId] = useState("")
  const [selectedSchedule, setSelectedSchedule] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [companyLogo, setCompanyLogo] = useState("/placeholder_logo.svg")
  const [userPhoto, setUserPhoto] = useState("/placeholder-user.jpg")
  
  const [searchTerm, setSearchTerm] = useState("")

  // Estados para búsqueda de DNI
  const [isAutoSearch, setIsAutoSearch] = useState(true)
  const [isDniSearching, setIsDniSearching] = useState(false)

  const { drivers, loading: driversLoading, createDriver, updateDriver, deleteDriver } = useDrivers()
  const { sales, loading: salesLoading, createSale, deleteSale, loadSales } = useSales()
  const { packages, loading: packagesLoading, createPackage, updatePackageStatus, deletePackage, loadPackages } = usePackages()
  const [isDriverManagementOpen, setIsDriverManagementOpen] = useState(false)

  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false)
  const [packageSearchTerm, setPackageSearchTerm] = useState("")

  const { toast } = useToast()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [salesSuccessModalOpen, setSalesSuccessModalOpen] = useState(false)
  const [lastSale, setLastSale] = useState<Sale | null>(null)

  const [deleteSaleModal, setDeleteSaleModal] = useState<{
    isOpen: boolean
    sale: Sale | null
  }>({
    isOpen: false,
    sale: null,
  })

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Check authentication on mount and setup session management
  useEffect(() => {
    const checkAuth = () => {
      const userData = loadAuthData()
      if (userData) {
        setAuthState({
          isAuthenticated: true,
          user: userData,
          isLoading: false,
        })
        setUserPhoto(userData.avatar || "/placeholder-user.jpg")

        // Setup auto-logout callback and start timeout
        setLogoutCallback(() => {
          handleSessionTimeout()
        })

        // Now start the session timeout since callback is set
        resetSessionTimeout()
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  // Setup activity tracking for session timeout
  useEffect(() => {
    if (!authState.isAuthenticated) return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      updateLastActivity()
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [authState.isAuthenticated])

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await fetch("/api/routes")
        if (response.ok) {
          const { data } = await response.json()
          const transformedRoutes = data.map((route: any) => ({
            id: route.id,
            from: route.origin,
            to: route.destination,
            price: route.price,
            schedule: route.departure_time || "07:00",
            origin: route.origin,
            destination: route.destination,
            departure_time: route.departure_time,
            arrival_time: route.arrival_time,
          }))
          setRoutes(transformedRoutes)
        }
      } catch (error) {
        console.error("Error cargando rutas:", error)
      }
    }

    loadRoutes()
  }, [])

  // Verificación de conexión a Supabase leyendo company_info
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        const res = await fetch("/api/company")
        let payload: any = null
        try {
          payload = await res.json()
        } catch {}
        if (res.ok) {
          toast({
            title: "Conectado a Supabase",
            description: payload?.name ? `Lectura OK: ${payload.name}` : "Lectura exitosa de company_info.",
          })
        } else {
          const message = (payload && payload.error) ? payload.error : `HTTP ${res.status}`
          toast({
            title: "Error de conexión a Supabase",
            description: message,
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Error de conexión a Supabase",
          description: err instanceof Error ? err.message : "Error desconocido",
          variant: "destructive",
        })
      }
    }
    checkSupabase()
  }, [])

  // Cargar ventas al inicializar el componente
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadSales()
    }
  }, [authState.isAuthenticated, loadSales])

  // Construir seatMap a partir de ventas existentes para marcar ocupados correctamente
  useEffect(() => {
    const map: SeatMap = {}
    for (const sale of sales) {
      const key = getSeatMapKey(sale.date, sale.route.id.toString(), sale.schedule)
      if (!map[key]) map[key] = {}
      map[key][sale.seatNumber] = sale
    }
    setSeatMap(map)
  }, [sales])

  // Session timeout handler
  const handleSessionTimeout = () => {
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.",
      variant: "destructive",
    })

    logout()
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    })
    setUserPhoto("/placeholder-user.jpg")
  }

  // Función para buscar DNI usando nuestro API proxy interno
  const searchDniInApi = async (dni: string) => {
    if (!isAutoSearch || dni.length !== 8) return null

    setIsDniSearching(true)
    try {
      console.log("🔍 Iniciando búsqueda de DNI:", dni)

      // Usar nuestro endpoint interno que actúa como proxy
      const url = `/api/dni?dni=${dni}`
      console.log("📡 URL de consulta (proxy interno):", url)

      const response = await fetch(url)

      console.log("📊 Estado de respuesta:", response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log("📋 Datos recibidos:", data)

        if (data && data.nombre_completo) {
          console.log("✅ Nombre encontrado:", data.nombre_completo)
          toast({
            title: "✅ DNI encontrado",
            description: `Datos cargados: ${data.nombre_completo}`,
          })
          return data.nombre_completo
        } else {
          console.log("❌ No se encontró nombre_completo")
          return null
        }
      } else {
        // Leer el error del servidor
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
        console.log("❌ Error del servidor:", errorData)

        if (response.status === 404) {
          console.log("📝 DNI no encontrado en la API externa")
          return null
        } else {
          toast({
            title: "Error en la consulta",
            description: errorData.error || `Error ${response.status}`,
            variant: "destructive",
          })
          return null
        }
      }
    } catch (error) {
      console.error("🚨 Error completo buscando DNI:", error)
      toast({
        title: "Error de conexión",
        description: `No se pudo conectar con el servidor: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      })
      return null
    } finally {
      setIsDniSearching(false)
    }
  }

  // Auth Handlers
  const handleLogin = async (credentials: { email: string; password: string }) => {
    setIsLoggingIn(true)
    setLoginError("")

    try {
      const user = await authenticateUser(credentials.email, credentials.password)
      saveAuthData(user)
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      })
      setUserPhoto(user.avatar || "/placeholder-user.jpg")

      // Setup auto-logout callback
      setLogoutCallback(() => {
        handleSessionTimeout()
      })
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Error de autenticación")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    clearSessionTimeout()
    logout()
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    })
    setShowLogoutModal(false)
    setUserPhoto("/placeholder-user.jpg")
  }

  // Show loading screen
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} isLoading={isLoggingIn} error={loginError} />
  }

  // Route Management Handlers
  const handleEditRoute = (route: Route) => {
    if (!hasPermission(authState.user, "write")) {
      alert("No tienes permisos para editar rutas")
      return
    }
    setSelectedRouteForEdit(route)
    setIsEditRouteOpen(true)
  }

  const handleSaveRoute = async (updatedRoute: Route) => {
    if (!hasPermission(authState.user, "write")) {
      alert("No tienes permisos para guardar cambios")
      return
    }

    try {
      const response = await fetch(`/api/routes/${updatedRoute.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: updatedRoute.from,
          destination: updatedRoute.to,
          price: updatedRoute.price,
        }),
      })

      if (response.ok) {
        setRoutes((prev) => prev.map((route) => (route.id === updatedRoute.id ? updatedRoute : route)))
        alert("Ruta actualizada correctamente")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error actualizando ruta:", error)
      alert("Error al actualizar la ruta")
    }
  }

  const handleAddRoute = async (routeData: Omit<Route, "id">) => {
    if (!hasPermission(authState.user, "create")) {
      alert("No tienes permisos para agregar rutas")
      return
    }

    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: routeData.from,
          destination: routeData.to,
          price: routeData.price,
          departure_time: routeData.departure_time,
          arrival_time: routeData.arrival_time,
          distance_km: 0,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()

        const newRoute: Route = {
          id: data.id,
          from: data.origin,
          to: data.destination,
          price: data.price,
          schedule: routeData.schedule || data.departure_time,
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
        }

        setRoutes((prev) => [...prev, newRoute])

        alert("Nueva ruta agregada correctamente")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error agregando ruta:", error)
      alert("Error al agregar la ruta")
    }
  }

  const handleDeleteRoute = async (routeId: number) => {
    if (!hasPermission(authState.user, "delete")) {
      alert("No tienes permisos para eliminar rutas")
      return
    }

    if (confirm("¿Está seguro que desea eliminar esta ruta? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`/api/routes/${routeId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setRoutes((prev) => prev.filter((route) => route.id !== routeId))

          // Limpiar selección si era la ruta seleccionada
          if (selectedRouteId === routeId.toString()) {
            setSelectedRouteId("")
            setSelectedSchedule("")
          }

          alert("Ruta eliminada correctamente")
        } else {
          const error = await response.json()
          alert(`Error: ${error.error}`)
        }
      } catch (error) {
        console.error("Error eliminando ruta:", error)
        alert("Error al eliminar la ruta")
      }
    }
  }

  const handleAddDriver = async (driverData: Omit<Driver, "id">) => {
    try {
      await createDriver(driverData)
      alert("Conductor agregado correctamente")
    } catch (error) {
      console.error("Error al agregar conductor:", error)
      alert("Error al agregar conductor")
    }
  }

  const handleUpdateDriver = async (updatedDriver: Driver) => {
    try {
      await updateDriver(updatedDriver.id, updatedDriver)
      alert("Conductor actualizado correctamente")
    } catch (error) {
      console.error("Error al actualizar conductor:", error)
      alert("Error al actualizar conductor")
    }
  }

  const handleDeleteDriver = async (driverId: string) => {
    try {
      await deleteDriver(driverId)
      alert("Conductor eliminado correctamente")
    } catch (error) {
      console.error("Error al eliminar conductor:", error)
      alert("Error al eliminar conductor")
    }
  }

  const handleDeleteSale = (sale: Sale) => {
    if (!hasPermission(authState.user, "delete")) {
      toast({
        title: "Sin permisos",
        description: "No tienes permisos para eliminar ventas",
        variant: "destructive",
      })
      return
    }

    setDeleteSaleModal({
      isOpen: true,
      sale: sale,
    })
  }

  const confirmDeleteSale = async () => {
    const sale = deleteSaleModal.sale
    if (!sale) return

    try {
      // Eliminar venta de Supabase
      await deleteSale(sale.id)

      // Liberar el asiento en el mapa
      const key = getSeatMapKey(sale.date, sale.route.id.toString(), sale.schedule)
      setSeatMap((prev) => {
        const newSeatMap = { ...prev }
        if (newSeatMap[key]) {
          const updatedSeats = { ...newSeatMap[key] }
          delete updatedSeats[sale.seatNumber]
          newSeatMap[key] = updatedSeats
        }
        return newSeatMap
      })

      toast({
        title: "Venta eliminada",
        description: `Venta ${sale.id} eliminada correctamente. El asiento ${sale.seatNumber.toString().padStart(2, "0")} está ahora disponible.`,
      })

      setDeleteSaleModal({ isOpen: false, sale: null })
    } catch (error) {
      console.error("Error al eliminar venta:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la venta. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  // WhatsApp Handlers
  const handleSendWhatsApp = (sale: Sale) => {
    setSelectedSaleForWhatsApp(sale)
    setIsWhatsAppModalOpen(true)
  }

  const handleSendBulkWhatsApp = () => {
    setIsBulkWhatsAppModalOpen(true)
  }

  const handleSendPackageWhatsApp = (pkg: Package) => {
    sendPackageLabelViaWhatsApp(pkg)
  }

  // Handlers
  const handleSeatSelection = (seatNumber: number) => {
    setSelectedSeat(seatNumber)
  }

  const handlePrintTicket = (sale: Sale) => {
    printTicket(sale)
  }

  const handleNewSale = async () => {
    if (!hasPermission(authState.user, "write")) {
      alert("No tienes permisos para registrar ventas")
      return
    }

    if (
      !passengerName ||
      !passengerDni ||
      !selectedRouteId ||
      !selectedSchedule ||
      !selectedDate ||
      !selectedSeat ||
      !selectedDriver
    ) {
      alert("Por favor complete todos los campos, seleccione un asiento y asigne un conductor")
      return
    }

    const route = routes.find((r) => r.id.toString() === selectedRouteId)
    if (!route) return

    try {
      // Preparar datos para la API de Supabase
      const saleData = {
        passenger_name: passengerName,
        passenger_dni: passengerDni,
        passenger_phone: passengerPhone || "",
        from_city: route.from,
        to_city: route.to,
        driver_name: selectedDriver.name,
        driver_id: selectedDriver.id,
        route_id: route.id,
        seat_number: selectedSeat,
        price: route.price,
        total: route.price,
        travel_date: selectedDate,
        schedule_time: selectedSchedule,
        status: "Pagado",
      }

      // Crear venta en Supabase (API ya devuelve formato correcto)
      const newSale = await createSale(saleData)

      // Actualizar mapa de asientos
      const key = getSeatMapKey(selectedDate, selectedRouteId, selectedSchedule)
      setSeatMap((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [selectedSeat]: newSale,
        },
      }))

      setLastSale(newSale)
      setSalesSuccessModalOpen(true)

      // Reset form
      setPassengerName("")
      setPassengerDni("")
      setPassengerPhone("")
      setSelectedRouteId("")
      setSelectedSchedule("")
      setSelectedDate("")
      setSelectedSeat(null)
      setSelectedDriver(null)
      setIsNewSaleOpen(false)

      toast({
        title: "¡Venta registrada!",
        description: "La venta se ha guardado correctamente en la base de datos.",
      })
    } catch (error) {
      console.error("Error al crear venta:", error)

      // Manejar error específico de asiento ocupado
      if (error instanceof Error && error.message.includes("asiento ya está ocupado")) {
        alert("El asiento seleccionado ya está ocupado para esta fecha y horario. Por favor seleccione otro asiento.")
      } else {
        alert("Error al registrar la venta. Por favor intente nuevamente.")
      }
    }
  }

  const handleChangePassword = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Por favor complete todos los campos")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }
    alert("Contraseña cambiada correctamente")
  }

  const handleNewPackage = async (packageData: Omit<Package, "id" | "date" | "time">) => {
    try {
      // Transformar datos del formulario al formato de la API
      const apiPackageData = {
        sender_name: packageData.sender.name,
        sender_dni: packageData.sender.dni,
        sender_phone: packageData.sender.phone,
        recipient_name: packageData.receiver.name,
        recipient_dni: packageData.receiver.dni,
        recipient_phone: packageData.receiver.phone,
        from_city: packageData.route.from,
        to_city: packageData.route.to,
        description: packageData.description,
        weight: packageData.weight,
        declared_value: packageData.value,
        shipping_cost: packageData.total,
        total: packageData.total,
        travel_date: new Date().toISOString().split("T")[0],
        status: packageData.status,
      }

      await createPackage(apiPackageData)
      setIsNewPackageOpen(false)

      toast({
        title: "¡Encomienda registrada!",
        description: "La encomienda se ha guardado correctamente en la base de datos.",
      })
    } catch (error) {
      console.error("Error al crear encomienda:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la encomienda. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePackageStatus = async (packageId: string, status: Package["status"]) => {
    try {
      // El hook usePackages ya maneja la actualización del estado internamente
      await updatePackageStatus(packageId, status)

      toast({
        title: "Estado actualizado",
        description: `Estado cambiado a: ${status}`,
      })
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado. Intente nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePackage = (packageId: string) => {
    const packageData = uiPackages.find((pkg) => pkg.id === packageId)
    if (!packageData) return

    setPackageToDelete(packageData)
    setDeleteModalOpen(true)
  }

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return

    setIsDeleting(true)

    try {
      await deletePackage(packageToDelete.id)

      toast({
        title: "Encomienda eliminada",
        description: `La encomienda ${packageToDelete.id} ha sido eliminada correctamente.`,
      })

      setDeleteModalOpen(false)
      setPackageToDelete(null)
    } catch (error) {
      console.error("Error al eliminar encomienda:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la encomienda. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeletePackage = () => {
    setDeleteModalOpen(false)
    setPackageToDelete(null)
    setIsDeleting(false)
  }

  const handlePrintPackageLabel = (pkg: Package) => {
    printPackageLabel(pkg)
  }

  // Función para transformar drivers de API a formato UI
  const transformApiDriversToUI = (apiDrivers: any[]): Driver[] => {
    return apiDrivers.map((apiDriver) => ({
      id: apiDriver.id,
      name: apiDriver.name,
      license: apiDriver.license,
      phone: apiDriver.phone,
      email: apiDriver.email || "",
      isActive: apiDriver.status === "active" || apiDriver.status == null || apiDriver.status === "",
    }))
  }

  // Función para transformar packages de API a formato UI
  const transformApiPackagesToUI = (apiPackages: ApiPackage[]): Package[] => {
    return apiPackages.map((apiPkg) => ({
      id: apiPkg.id,
      date: apiPkg.travel_date,
      time: new Date(apiPkg.created_at).toLocaleTimeString(),
      sender: {
        name: apiPkg.sender_name,
        dni: apiPkg.sender_dni,
        phone: apiPkg.sender_phone || "",
        address: "",
      },
      receiver: {
        name: apiPkg.recipient_name,
        dni: apiPkg.recipient_dni,
        phone: apiPkg.recipient_phone || "",
        address: "",
      },
      route: {
        id: 1, // Valor por defecto ya que no está en la nueva estructura
        from: apiPkg.from_city,
        to: apiPkg.to_city,
        price: Number(apiPkg.total),
      },
      schedule: "08:00", // Valor por defecto
      description: apiPkg.description,
      weight: Number(apiPkg.weight),
      dimensions: "",
      value: Number(apiPkg.declared_value),
      total: Number(apiPkg.total),
      status: apiPkg.status as Package["status"],
      driver: {
        id: "1",
        name: "Conductor",
        license: "",
        phone: "",
        email: "",
        isActive: true,
      },
    }))
  }

  // Transformar packages para la UI
  const uiPackages = transformApiPackagesToUI(packages)

  // Transformar drivers para la UI
  const uiDrivers = transformApiDriversToUI(drivers)

  // Calculations
  const todaySales = sales.filter((sale) => sale.date === new Date().toISOString().split("T")[0])
  const totalToday = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <Header
        totalToday={totalToday}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        onSettings={() => {
          if (!hasPermission(authState.user, "config")) {
            alert("No tienes permisos para acceder a la configuración")
            return
          }
          setIsConfigOpen(true)
        }}
        onLogout={handleLogout}
        userPhoto={userPhoto}
        companyLogo={companyLogo}
      >
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}
          companyLogo={companyLogo}
        />
      </Header>

      <div className="container mx-auto px-4 py-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs para desktop */}
          <TabsList className="grid w-full grid-cols-5 hidden md:grid">
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="boletas">Boletas</TabsTrigger>
            <TabsTrigger value="encomiendas">Encomiendas</TabsTrigger>
            <TabsTrigger value="asientos">Asientos</TabsTrigger>
            <TabsTrigger value="reportes" disabled={!hasPermission(authState.user, "reports")}>
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Título de sección para móvil */}
          <div className="md:hidden">
            <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          </div>

          {/* VENTAS TAB */}
          <TabsContent value="ventas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold hidden md:block">Gestión de Ventas</h2>
              {hasPermission(authState.user, "write") && (
                <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Nueva Venta</span>
                      <span className="sm:hidden">Nueva</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Nueva Venta</DialogTitle>
                      <DialogDescription>
                        Complete los datos del pasajero para registrar una nueva venta de boleto.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                      {/* Formulario */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Datos del Pasajero</h3>
                        <p className="text-sm text-muted-foreground mb-4">Los campos marcados con * son obligatorios</p>

                        {/* Campo de DNI con búsqueda integrada */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>DNI del Pasajero *</Label>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant={isAutoSearch ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsAutoSearch(true)}
                                className="text-xs"
                              >
                                🔍 Automático
                              </Button>
                              <Button
                                type="button"
                                variant={!isAutoSearch ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsAutoSearch(false)}
                                className="text-xs"
                              >
                                ✏️ Manual
                              </Button>
                            </div>
                          </div>
                          {isAutoSearch ? (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              🔍 Búsqueda automática habilitada: Se buscará primero en la base de datos local y luego en la API externa
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              ✏️ Modo manual: Solo se buscará en la base de datos local. Complete los datos manualmente
                            </p>
                          )}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              autoFocus
                              autoComplete="off"
                              placeholder="Ingrese DNI (8 dígitos)"
                              value={passengerDni}
                              onChange={async (e) => {
                                // Solo permitir números y máximo 8 dígitos
                                const value = e.target.value.replace(/\D/g, "").slice(0, 8)
                                setPassengerDni(value)

                                // Buscar cuando tenga 8 dígitos
                                if (value.length === 8) {
                                  // Primero buscar en pasajeros existentes
                                  const existingPassenger = sales.find(
                                    (sale) => sale.passenger.dni === value,
                                  )?.passenger

                                  if (existingPassenger) {
                                    setPassengerName(existingPassenger.name)
                                    setPassengerPhone(existingPassenger.phone)
                                  } else if (isAutoSearch) {
                                    // Si no encuentra y está habilitada la búsqueda automática, buscar en API
                                    const apiName = await searchDniInApi(value)
                                    if (apiName) {
                                      setPassengerName(apiName)
                                      setPassengerPhone("") // Limpiar teléfono ya que viene de API externa
                                    } else {
                                      // Si no encuentra en API, limpiar campos
                                      setPassengerName("")
                                      setPassengerPhone("")
                                    }
                                  } else {
                                    // Si está en modo manual, solo limpiar si había datos previos
                                    if (
                                      passengerName &&
                                      sales.some(
                                        (s) => s.passenger.dni === passengerDni && s.passenger.name === passengerName,
                                      )
                                    ) {
                                      setPassengerName("")
                                      setPassengerPhone("")
                                    }
                                  }
                                } else {
                                  // Si borra el DNI o tiene menos de 8 dígitos, limpiar campos relacionados
                                  if (
                                    passengerName &&
                                    (sales.some(
                                      (s) => s.passenger.dni === passengerDni && s.passenger.name === passengerName,
                                    ) || isDniSearching)
                                  ) {
                                    setPassengerName("")
                                    setPassengerPhone("")
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && passengerDni.length === 8) {
                                  e.preventDefault()
                                  // Enfocar el siguiente campo (nombre)
                                  const nameInput = document.querySelector(
                                    'input[placeholder="Nombres y apellidos completos"]',
                                  ) as HTMLInputElement
                                  nameInput?.focus()
                                }
                              }}
                              className={`pl-10 ${passengerDni.length > 0 && passengerDni.length !== 8 ? "border-red-500" : ""} ${isDniSearching ? "pr-16" : "pr-8"}`}
                              maxLength={8}
                              disabled={isDniSearching}
                            />
                            {isDniSearching && (
                              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                            {passengerDni && !isDniSearching && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                onClick={() => {
                                  setPassengerDni("")
                                  setPassengerName("")
                                  setPassengerPhone("")
                                }}
                              >
                                ×
                              </Button>
                            )}
                          </div>

                          {/* Validación de DNI */}
                          {passengerDni.length > 0 && passengerDni.length !== 8 && (
                            <p className="text-sm text-red-500">El DNI debe tener exactamente 8 dígitos</p>
                          )}

                          {/* Estado de búsqueda */}
                          {isDniSearching && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-300">
                                <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">🔍 Buscando DNI en API externa...</span>
                              </div>
                              <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-1">
                                Por favor espere mientras verificamos el DNI
                              </p>
                            </div>
                          )}

                          {/* Resultado de búsqueda */}
                          {passengerDni.length === 8 && !isDniSearching &&
                            (() => {
                              const existingPassenger = sales.find(
                                (sale) => sale.passenger.dni === passengerDni,
                              )?.passenger

                              if (existingPassenger) {
                                return (
                                  <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center space-x-2 text-green-800 dark:text-green-300">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-sm font-medium">
                                        ✅ Pasajero encontrado en la base de datos
                                      </span>
                                    </div>
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                                      <p>
                                        <strong>Nombre:</strong> {existingPassenger.name}
                                      </p>
                                      {existingPassenger.phone && (
                                        <p>
                                          <strong>Teléfono:</strong> {existingPassenger.phone}
                                        </p>
                                      )}
                                      <p className="text-xs mt-1 opacity-75">Los datos se han cargado automáticamente</p>
                                    </div>
                                  </div>
                                )
                              } else if (passengerName && isAutoSearch) {
                                return (
                                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      <span className="text-sm font-medium">
                                        🔍 Encontrado en API externa
                                      </span>
                                    </div>
                                    <div className="mt-2 text-sm text-emerald-700 dark:text-emerald-200">
                                      <p>
                                        <strong>Nombre:</strong> {passengerName}
                                      </p>
                                      <p className="text-xs mt-1 opacity-75">Datos obtenidos desde la API de DNI</p>
                                    </div>
                                  </div>
                                )
                              } else if (isAutoSearch) {
                                return (
                                  <div className="p-3 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-center space-x-2 text-orange-800 dark:text-orange-300">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      <span className="text-sm font-medium">⚠️ DNI no encontrado</span>
                                    </div>
                                    <p className="text-xs text-orange-700 dark:text-orange-200 mt-1">
                                      No se encontró en la base de datos ni en la API externa. Complete los datos manualmente.
                                    </p>
                                  </div>
                                )
                              } else {
                                return (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm font-medium">✏️ Modo manual activado</span>
                                    </div>
                                    <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                                      Complete los datos manualmente sin búsqueda automática
                                    </p>
                                  </div>
                                )
                              }
                            })()}

                          {/* Verificar si el DNI ya existe para esta fecha/ruta/horario */}
                          {passengerDni.length === 8 &&
                            selectedDate &&
                            selectedRouteId &&
                            selectedSchedule &&
                            (() => {
                              const existingSale = sales.find(
                                (sale) =>
                                  sale.passenger.dni === passengerDni &&
                                  sale.date === selectedDate &&
                                  sale.route.id.toString() === selectedRouteId &&
                                  sale.schedule === selectedSchedule,
                              )
                              return existingSale ? (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
                                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm font-medium">⚠️ Boleto duplicado detectado</span>
                                  </div>
                                  <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                                    Este pasajero ya tiene un boleto para esta fecha y horario
                                  </p>
                                  <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                                    Asiento actual: {existingSale.seatNumber.toString().padStart(2, "0")} | Boleta:{" "}
                                    {existingSale.id}
                                  </p>
                                </div>
                              ) : null
                            })()}
                        </div>

                        {/* Campos de datos del pasajero */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>Nombre Completo *</Label>
                            <Input
                              autoComplete="name"
                              value={passengerName}
                              onChange={(e) => {
                                // Solo permitir letras, espacios y acentos
                                const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉ��ÓÚ��Ñ\s]/g, "")
                                setPassengerName(value)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && passengerName.trim()) {
                                  e.preventDefault()
                                  // Enfocar el campo de teléfono
                                  const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement
                                  phoneInput?.focus()
                                }
                              }}
                              placeholder="Nombres y apellidos completos"
                              className={!passengerName.trim() && passengerName !== "" ? "border-red-500" : ""}
                              disabled={
                                passengerDni.length === 8 && sales.some((s) => s.passenger.dni === passengerDni)
                              }
                            />
                            {!passengerName.trim() && passengerName !== "" && (
                              <p className="text-sm text-red-500">El nombre es requerido</p>
                            )}
                            {passengerDni.length === 8 && sales.some((s) => s.passenger.dni === passengerDni) && (
                              <p className="text-xs text-muted-foreground">
                                📋 Datos cargados automáticamente desde registros anteriores
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input
                              type="tel"
                              autoComplete="tel"
                              value={passengerPhone}
                              onChange={(e) => {
                                // Solo permitir números, espacios, guiones y el símbolo +
                                const value = e.target.value.replace(/[^\d\s\-+]/g, "")
                                setPassengerPhone(value)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  // Enfocar el select de ruta
                                  const routeSelect = document.querySelector('[role="combobox"]') as HTMLElement
                                  routeSelect?.click()
                                }
                              }}
                              placeholder="999 123 456"
                              maxLength={15}
                              disabled={
                                passengerDni.length === 8 &&
                                sales.some((s) => s.passenger.dni === passengerDni) &&
                                passengerPhone
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Solo números. Ej: 999123456 o +51 999 123 456
                            </p>
                          </div>
                        </div>

                        <h3 className="font-semibold pt-4">Datos del Viaje</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ruta *</Label>
                            <Select
                              value={selectedRouteId}
                              onValueChange={(value) => {
                                setSelectedRouteId(value)
                                // Limpiar horario seleccionado al cambiar de ruta
                                setSelectedSchedule("")
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar ruta" />
                              </SelectTrigger>
                              <SelectContent>
                                {routes.map((route) => (
                                  <SelectItem key={route.id} value={route.id.toString()}>
                                    {route.from} → {route.to} (S/ {route.price})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Horario *</Label>
                            <Select
                              value={selectedSchedule}
                              onValueChange={setSelectedSchedule}
                              disabled={!selectedRouteId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={selectedRouteId ? "Seleccionar horario" : "Primero seleccione una ruta"} />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedRouteId && (() => {
                                  const selectedRoute = routes.find((r) => r.id.toString() === selectedRouteId)
                                  const schedules = selectedRoute ? [selectedRoute.departure_time || selectedRoute.schedule] : []
                                  return schedules.map((schedule, index) => (
                                    <SelectItem key={index} value={schedule}>
                                      {schedule}
                                    </SelectItem>
                                  ))
                                })()}
                              </SelectContent>
                            </Select>
                            {!selectedRouteId && (
                              <p className="text-sm text-muted-foreground">Seleccione una ruta para ver los horarios disponibles</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de Viaje</Label>
                            <Input
                              type="date"
                              autoComplete="off"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && selectedDate) {
                                  e.preventDefault()
                                  const seatSection = document.querySelector("[data-seat-selector]") as HTMLElement
                                  seatSection?.scrollIntoView({ behavior: "smooth" })
                                }
                              }}
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <Label>Conductor Asignado *</Label>
                          <Select
                            value={selectedDriver?.id || ""}
                            onValueChange={(value) => {
                              const driver = uiDrivers.find((d) => d.id === value && d.isActive)
                              setSelectedDriver(driver || null)
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar conductor" />
                            </SelectTrigger>
                            <SelectContent>
                              {uiDrivers
                  .filter((driver) => driver.isActive)
                                .map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{driver.name}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {driver.license} • {driver.phone}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          {!selectedDriver && (
                            <p className="text-sm text-muted-foreground">Seleccione un conductor para el viaje</p>
                          )}
                        </div>

                        {selectedSeat && selectedDriver && (
                          <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h3 className="font-semibold text-green-800 dark:text-green-300">Resumen</h3>
                            <div className="text-sm space-y-1 text-green-700 dark:text-green-200">
                              <p>
                                <strong>Asiento:</strong> {selectedSeat.toString().padStart(2, "0")}
                              </p>
                              <p>
                                <strong>Conductor:</strong> {selectedDriver.name}
                              </p>
                              <p>
                                <strong>Contacto:</strong> {selectedDriver.phone}
                              </p>
                              <p>
                                <strong>Total:</strong> S/{" "}
                                {selectedRouteId
                                  ? routes.find((r) => r.id.toString() === selectedRouteId)?.price || 0
                                  : 0}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Selector de asientos */}
                      <div>
                        <SeatSelector
                          seatMap={seatMap}
                          selectedDate={selectedDate}
                          selectedRoute={selectedRouteId}
                          selectedSchedule={selectedSchedule}
                          selectedSeat={selectedSeat}
                          onSeatSelect={handleSeatSelection}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsNewSaleOpen(false)
                          setSelectedSeat(null)
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleNewSale} disabled={!selectedSeat || !selectedDriver}>
                        Registrar Venta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Modal Cambiar Contraseña */}
            <QuickPasswordModal
              isOpen={isChangePasswordOpen}
              onClose={() => setIsChangePasswordOpen(false)}
              onChangePassword={handleChangePassword}
            />

            {/* Modal Configuración */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración del Sistema</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  {/* Información de la Empresa */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Información de la Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4" style={{marginBottom: "2px"}}>
                        <div className="flex flex-row">
                          <img
                            src={companyLogo || "/placeholder_logo.svg"}
                            alt="Logo de la empresa"
                            className="w-[214px] h-24 object-cover -ml-1"
                          />
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute bg-transparent top-[102px] left-[-142px]"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (e) => {
                                      setCompanyLogo(e.target?.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }
                                input.click()
                              }}
                            >
                              Cambiar
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Nombre de la Empresa</Label>
                        <Input defaultValue={COMPANY_CONFIG.name} />
                      </div>
                      <div>
                        <Label>RUC</Label>
                        <Input defaultValue={COMPANY_CONFIG.ruc} />
                      </div>
                      <div>
                        <Label>Dirección</Label>
                        <Input defaultValue={COMPANY_CONFIG.address} />
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input defaultValue={COMPANY_CONFIG.phone} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input defaultValue="admin@wjlturismo.com" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configuración de Usuario */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Perfil de Usuario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex flex-row">
                          <img
                            src={userPhoto || "/placeholder-user.jpg"}
                            alt="Foto de perfil"
                            className="w-24 h-24 rounded-full border-2 border-border object-cover -mt-px -ml-1"
                          />
                          <div className="relative">
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute bg-transparent top-[100px] left-[-78px]"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (e) => {
                                      setUserPhoto(e.target?.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }
                                input.click()
                              }}
                            >
                              Cambiar
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground" style={{margin: "41px 0 0 1px"}}>Foto de perfil</p>
                      </div>

                      <div>
                        <Label>Nombre de Usuario</Label>
                        <Input defaultValue={authState.user?.name} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input defaultValue={authState.user?.email} />
                      </div>
                      <div>
                        <Label>Rol</Label>
                        <Select defaultValue={authState.user?.role}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="operator">Operador</SelectItem>
                            <SelectItem value="viewer">Solo Lectura</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configuración de Combis */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración de Combis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Capacidad Actual</h4>
                        <div className="text-sm space-y-1">
                          <p>• Total de asientos: {COMPANY_CONFIG.totalSeats}</p>
                          <p>• Asientos para pasajeros: {COMPANY_CONFIG.passengerSeats}</p>
                          <p>• Asiento del conductor: 1</p>
                        </div>
                      </div>

                      <div>
                        <Label>Número de Combis</Label>
                        <Input type="number" defaultValue="3" min="1" max="10" />
                      </div>
                      <div>
                        <Label>Capacidad por Combi</Label>
                        <Select defaultValue="15">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 pasajeros</SelectItem>
                            <SelectItem value="15">15 pasajeros</SelectItem>
                            <SelectItem value="18">18 pasajeros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Configuración del Sistema */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuración del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Moneda</Label>
                        <Select defaultValue="PEN">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PEN">Soles (S/)</SelectItem>
                            <SelectItem value="USD">Dólares ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Zona Horaria</Label>
                        <Select defaultValue="America/Lima">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Lima">Lima, Perú (UTC-5)</SelectItem>
                            <SelectItem value="America/Bogota">Bogotá, Colombia (UTC-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Idioma</Label>
                        <Select defaultValue="es">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="notifications" defaultChecked />
                        <Label htmlFor="notifications">Activar notificaciones</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="autoBackup" defaultChecked />
                        <Label htmlFor="autoBackup">Respaldo automático</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rutas y Precios */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Rutas y Precios</CardTitle>
                        {hasPermission(authState.user, "write") && (
                          <Button onClick={() => setIsAddRouteOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Ruta
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {routes.map((route) => (
                          <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {route.origin || route.from} → {route.destination || route.to}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-4">
                                {route.schedule && (
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Horario: {route.schedule}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="font-semibold">S/ {route.price.toFixed(2)}</div>
                              </div>
                              <div className="flex space-x-2">
                                {hasPermission(authState.user, "write") && (
                                  <Button size="sm" variant="outline" onClick={() => handleEditRoute(route)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {hasPermission(authState.user, "delete") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 bg-transparent"
                                    onClick={() => handleDeleteRoute(route.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Gestión de Conductores</CardTitle>
                        <Button onClick={() => setIsDriverManagementOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Gestionar Conductores
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {uiDrivers
                          .filter((d) => d.isActive)
                          .map((driver) => {
                            const driverSales = sales.filter((sale) => sale.driver.id === driver.id)
                            const driverPackages = uiPackages.filter((pkg) => pkg.driver.id === driver.id)
                            const totalRevenue =
                              driverSales.reduce((sum, sale) => sum + sale.total, 0) +
                              driverPackages.reduce((sum, pkg) => sum + pkg.total, 0)

                            return (
                              <div key={driver.id} className="flex justify-between items-center py-2 border-b">
                                <div>
                                  <div className="font-medium">{driver.name}</div>
                                  <div className="text-xs text-muted-foreground">{driver.license}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">S/ {totalRevenue.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {driverSales.length + driverPackages.length} servicios
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      alert("Configuración guardada correctamente")
                      setIsConfigOpen(false)
                    }}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Modales de Gestión de Rutas */}
            <EditRouteModal
              isOpen={isEditRouteOpen}
              onClose={() => setIsEditRouteOpen(false)}
              route={selectedRoute}
              onSave={handleSaveRoute}
            />

            <AddRouteModal
              isOpen={isAddRouteOpen}
              onClose={() => setIsAddRouteOpen(false)}
              onAdd={handleAddRoute}
              existingRoutes={routes}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                      <p className="text-2xl font-bold">S/ {totalToday.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pasajeros Hoy</p>
                      <p className="text-2xl font-bold">{todaySales.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Boletas</p>
                      <p className="text-2xl font-bold">{sales.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bus className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Asientos Vendidos</p>
                      <p className="text-2xl font-bold">{todaySales.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ventas Recientes</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendBulkWhatsApp}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envío Masivo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Boleta</TableHead>
                        <TableHead className="min-w-[150px]">Pasajero</TableHead>
                        <TableHead className="min-w-[120px]">Ruta</TableHead>
                        <TableHead className="min-w-[100px]">Fecha</TableHead>
                        <TableHead className="min-w-[80px]">Horario</TableHead>
                        <TableHead className="min-w-[80px]">Asiento</TableHead>
                        <TableHead className="min-w-[80px]">Total</TableHead>
                        <TableHead className="min-w-[120px]">Conductor</TableHead>
                        <TableHead className="min-w-[120px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales
                        .slice(-10)
                        .reverse()
                        .map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.id}</TableCell>
                            <TableCell>{sale.passenger.name}</TableCell>
                            <TableCell>
                              {sale.route.from} → {sale.route.to}
                            </TableCell>
                            <TableCell>{sale.date}</TableCell>
                            <TableCell>{sale.schedule}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.seatNumber.toString().padStart(2, "0")}</Badge>
                            </TableCell>
                            <TableCell>S/ {sale.total.toFixed(2)}</TableCell>
                            <TableCell>{sale.driver.name}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => printTicket(sale)}
                                  title="Imprimir boleta"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendWhatsApp(sale)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  title="Enviar por WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                {hasPermission(authState.user, "delete") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
                                    onClick={() => handleDeleteSale(sale)}
                                    title="Eliminar venta"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASIENTOS TAB */}
          <TabsContent value="asientos" className="space-y-6">
            <h2 className="text-2xl font-bold hidden md:block">Control de Asientos</h2>

            <Card>
              <CardHeader>
                <CardTitle>Consultar Disponibilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Ruta y Horario</Label>
                    <Select
                      value={selectedRouteId}
                      onValueChange={(value) => {
                        setSelectedRouteId(value)
                        const route = routes.find((r) => r.id.toString() === value)
                        if (route && route.departure_time) {
                          setSelectedSchedule(route.departure_time)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ruta y horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id.toString()}>
                            {route.from} → {route.to} - {route.departure_time || route.schedule}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label>Horario</Label>
                    <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRouteId &&
                          schedules[Number.parseInt(selectedRouteId) as keyof typeof schedules]?.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>

                <SeatSelector
                  seatMap={seatMap}
                  selectedDate={selectedDate}
                  selectedRoute={selectedRouteId}
                  selectedSchedule={selectedSchedule}
                  onSeatSelect={handleSeatSelection}
                />
              </CardContent>
            </Card>

            {selectedDate && selectedRouteId && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Ocupación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {routes
                      .filter(
                        (route) =>
                          route.from === routes.find((r) => r.id.toString() === selectedRouteId)?.from &&
                          route.to === routes.find((r) => r.id.toString() === selectedRouteId)?.to,
                      )
                      .map((route) => {
                        const time = route.departure_time || route.schedule
                        const available = getAvailableSeatsCount(seatMap, selectedDate, route.id.toString(), time)
                        const occupied = COMPANY_CONFIG.passengerSeats - available
                        const percentage = (occupied / COMPANY_CONFIG.passengerSeats) * 100

                        return (
                          <Card key={`${route.id}-${time}`} className="border">
                            <CardContent className="p-4">
                              <div className="text-center">
                                <div className="text-lg font-bold">{time}</div>
                                <div className="text-2xl font-bold text-blue-600">{available}</div>
                                <div className="text-sm text-muted-foreground">disponibles</div>
                                <div className="mt-2">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {occupied}/{COMPANY_CONFIG.passengerSeats} ocupados
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* BOLETAS TAB */}
          <TabsContent value="boletas" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-2xl font-bold hidden md:block">Gestión de Boletas</h2>
              <div className="flex space-x-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por DNI o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">N° Boleta</TableHead>
                        <TableHead className="min-w-[100px]">Fecha</TableHead>
                        <TableHead className="min-w-[150px]">Pasajero</TableHead>
                        <TableHead className="min-w-[80px]">DNI</TableHead>
                        <TableHead className="min-w-[120px]">Ruta</TableHead>
                        <TableHead className="min-w-[80px]">Asiento</TableHead>
                        <TableHead className="min-w-[80px]">Estado</TableHead>
                        <TableHead className="min-w-[80px]">Total</TableHead>
                        <TableHead className="min-w-[120px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales
                        .filter((sale) => {
                          if (!searchTerm) return true
                          const searchLower = searchTerm.toLowerCase()
                          return (
                            sale.passenger.name.toLowerCase().includes(searchLower) ||
                            sale.passenger.dni.includes(searchTerm) ||
                            sale.id.toLowerCase().includes(searchTerm)
                          )
                        })
                        .map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell className="font-medium">{sale.id}</TableCell>
                            <TableCell>{sale.date}</TableCell>
                            <TableCell>
                              {searchTerm && sale.passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: sale.passenger.name.replace(
                                      new RegExp(`(${searchTerm})`, "gi"),
                                      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                    ),
                                  }}
                                />
                              ) : (
                                sale.passenger.name
                              )}
                            </TableCell>
                            <TableCell>
                              {searchTerm && sale.passenger.dni.includes(searchTerm) ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: sale.passenger.dni.replace(
                                      new RegExp(`(${searchTerm})`, "gi"),
                                      '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>',
                                    ),
                                  }}
                                />
                              ) : (
                                sale.passenger.dni
                              )}
                            </TableCell>
                            <TableCell>
                              {sale.route.from} → {sale.route.to}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{sale.seatNumber.toString().padStart(2, "0")}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sale.status === "Pagado" ? "default" : "secondary"}>{sale.status}</Badge>
                            </TableCell>
                            <TableCell>S/ {sale.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => printTicket(sale)}
                                  title="Imprimir boleta"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendWhatsApp(sale)}
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  title="Enviar por WhatsApp"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                                {hasPermission(authState.user, "delete") && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 bg-transparent"
                                    onClick={() => handleDeleteSale(sale)}
                                    title="Eliminar venta"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {sales.filter((sale) => {
                    if (!searchTerm) return true
                    const searchLower = searchTerm.toLowerCase()
                    return (
                      sale.passenger.name.toLowerCase().includes(searchLower) ||
                      sale.passenger.dni.includes(searchTerm) ||
                      sale.id.toLowerCase().includes(searchTerm)
                    )
                  }).length === 0 &&
                    searchTerm && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No se encontraron resultados para "{searchTerm}"</p>
                        <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                          Limpiar búsqueda
                        </Button>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ENCOMIENDAS TAB */}
          <TabsContent value="encomiendas" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold hidden md:block">Gestión de Encomiendas</h2>
              {hasPermission(authState.user, "write") && (
                <Dialog open={isNewPackageOpen} onOpenChange={setIsNewPackageOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Nueva Encomienda</span>
                      <span className="sm:hidden">Nueva</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Registrar Nueva Encomienda</DialogTitle>
                    </DialogHeader>
                    <PackageForm
                      routes={routes}
                      drivers={uiDrivers}
                      onSubmit={handleNewPackage}
                      onCancel={() => setIsNewPackageOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Stats Cards para Encomiendas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">📦</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Encomiendas</p>
                      <p className="text-2xl font-bold">{uiPackages.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                      <p className="text-2xl font-bold">{uiPackages.filter((p) => p.status === "Pendiente").length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">🚛</div>
                    <div>
                      <p className="text-sm text-muted-foreground">En Tránsito</p>
                      <p className="text-2xl font-bold">{uiPackages.filter((p) => p.status === "En Tránsito").length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">💰</div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ingresos Encomiendas</p>
                      <p className="text-2xl font-bold">
                        S/{" "}
                        {uiPackages
                          .filter(
                            (p) => p.status === "Pagado" || p.status === "En Tránsito" || p.status === "Entregado",
                          )
                          .reduce((sum, p) => sum + p.total, 0)
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <PackageList
              packages={uiPackages}
              onUpdateStatus={handleUpdatePackageStatus}
              onPrintLabel={handlePrintPackageLabel}
              onSendWhatsApp={handleSendPackageWhatsApp}
              onDelete={handleDeletePackage}
              searchTerm={packageSearchTerm}
              onSearchChange={setPackageSearchTerm}
            />
          </TabsContent>

          {/* REPORTES TAB */}
          <TabsContent value="reportes" className="space-y-6">
            <h2 className="text-2xl font-bold hidden md:block">Reportes y Estadísticas</h2>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">Reportes Generales</TabsTrigger>
                <TabsTrigger value="conductores">Pasajeros por Conductor</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por Ruta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {routes.map((route) => {
                        const routeSales = sales.filter(
                          (sale) => sale.route.from === route.from && sale.route.to === route.to,
                        )
                        const routeTotal = routeSales.reduce((sum, sale) => sum + sale.total, 0)

                        return (
                          <div key={route.id} className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm">
                              {route.from} → {route.to}
                            </span>
                            <div className="text-right">
                              <div className="font-semibold">S/ {routeTotal.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">{routeSales.length} pasajeros</div>
                            </div>
                          </div>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ocupación Promedio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Capacidad por Combi:</span>
                          <span className="font-semibold">{COMPANY_CONFIG.passengerSeats} pasajeros</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pasajeros Hoy:</span>
                          <span className="font-semibold">{todaySales.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Promedio por Boleta:</span>
                          <span className="font-semibold">
                            S/ {todaySales.length > 0 ? (totalToday / todaySales.length).toFixed(2) : "0.00"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas de Encomiendas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Encomiendas:</span>
                          <span className="font-semibold">{uiPackages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pendientes:</span>
                          <span className="font-semibold text-orange-600">
                            {uiPackages.filter((p) => p.status === "Pendiente").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">En Tránsito:</span>
                          <span className="font-semibold text-blue-600">
                            {uiPackages.filter((p) => p.status === "En Tránsito").length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Entregadas:</span>
                          <span className="font-semibold text-green-600">
                            {uiPackages.filter((p) => p.status === "Entregado").length}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold">Ingresos Encomiendas:</span>
                          <span className="font-bold text-green-600">
                            S/{" "}
                            {uiPackages
                              .filter((p) => p.status !== "Pendiente")
                              .reduce((sum, p) => sum + p.total, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Conductores Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {uiDrivers
                          .filter((d) => d.isActive)
                          .map((driver) => {
                            const driverSales = sales.filter((sale) => sale.driver.id === driver.id)
                            const driverPackages = uiPackages.filter((pkg) => pkg.driver.id === driver.id)
                            const totalRevenue =
                              driverSales.reduce((sum, sale) => sum + sale.total, 0) +
                              driverPackages.reduce((sum, pkg) => sum + pkg.total, 0)

                            return (
                              <div key={driver.id} className="flex justify-between items-center py-2 border-b">
                                <div>
                                  <div className="font-medium">{driver.name}</div>
                                  <div className="text-xs text-muted-foreground">{driver.license}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">S/ {totalRevenue.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {driverSales.length + driverPackages.length} servicios
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="conductores">
                <PassengerByDriverReport sales={sales} routes={routes} drivers={uiDrivers} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <DriverManagementModal
        isOpen={isDriverManagementOpen}
        onClose={() => setIsDriverManagementOpen(false)}
        drivers={uiDrivers}
        onAddDriver={handleAddDriver}
        onUpdateDriver={handleUpdateDriver}
        onDeleteDriver={handleDeleteDriver}
      />

      {/* WhatsApp Modals */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        sale={selectedSaleForWhatsApp}
      />

      <BulkWhatsAppModal
        isOpen={isBulkWhatsAppModalOpen}
        onClose={() => setIsBulkWhatsAppModalOpen(false)}
        sales={sales.slice(-20)} // Últimas 20 ventas
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDeletePackage}
        onConfirm={confirmDeletePackage}
        packageData={packageToDelete}
        isDeleting={isDeleting}
      />

      <SalesSuccessModal
        isOpen={salesSuccessModalOpen}
        onClose={() => setSalesSuccessModalOpen(false)}
        sale={lastSale}
        onPrintTicket={handlePrintTicket}
        onSendWhatsApp={handleSendWhatsApp}
      />

      <DeleteSaleModal
        isOpen={deleteSaleModal.isOpen}
        onClose={() => setDeleteSaleModal({ isOpen: false, sale: null })}
        onConfirm={confirmDeleteSale}
        sale={deleteSaleModal.sale}
      />

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        userName={authState.user?.email}
      />

      {/* WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  )
}
