// Tipos de datos para la base de datos - Basados en el esquema actual de Supabase

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  license: string
  status: string
  created_at: string
  updated_at: string
}

export interface Route {
  id: number
  origin: string
  destination: string
  price: number
  departure_time: string
  arrival_time: string
  distance_km: number
  status: string
  created_at: string
  updated_at: string
}

export interface RouteSchedule {
  id: number
  route_id: number
  schedule_time: string
  created_at: string
}

export interface Sale {
  id: string
  passenger_name: string
  passenger_dni: string
  passenger_phone: string
  from_city: string
  to_city: string
  driver_name: string
  driver_id: string
  route_id: number
  seat_number: number
  price: number
  total: number
  travel_date: string
  schedule_time: string
  status: string
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  sender_name: string
  sender_dni: string
  sender_phone: string
  recipient_name: string
  recipient_dni: string
  recipient_phone: string
  from_city: string
  to_city: string
  description: string
  weight: number
  declared_value: number
  shipping_cost: number
  total: number
  travel_date: string
  status: string
  tracking_code: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: any
  created_at: string
  updated_at: string
}

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Tipos para crear nuevos registros (sin campos auto-generados)
export type CreateDriver = Omit<Driver, "id" | "created_at" | "updated_at">
export type CreateRoute = Omit<Route, "id" | "created_at" | "updated_at">
export type CreateSale = Omit<Sale, "id" | "created_at" | "updated_at">
export type CreatePackage = Omit<Package, "id" | "created_at" | "updated_at" | "tracking_code">
