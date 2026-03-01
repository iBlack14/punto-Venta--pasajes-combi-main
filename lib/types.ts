export interface Sale {
  id: string
  date: string
  time: string
  passenger: {
    name: string
    dni: string
    phone: string
  }
  route: {
    id: number
    from: string
    to: string
    price: number
  }
  schedule: string
  seatNumber: number
  total: number
  status: "Pagado" | "Pendiente"
  driver: Driver // Agregar conductor
}

export interface SeatMap {
  [key: string]: {
    // fecha-ruta-horario
    [seatNumber: number]: Sale | null
  }
}

export interface Route {
  id: number
  from: string
  to: string
  price: number
  schedule: string
  departure_time?: string // Para compatibilidad con database.ts
  arrival_time?: string
}

export interface CompanyConfig {
  name: string
  ruc: string
  address: string
  phone: string
  totalSeats: number
  passengerSeats: number
  conductorSeat: number
}

// Agregar interface para Conductor
export interface Driver {
  id: string
  name: string
  license: string
  phone: string
  email?: string
  isActive: boolean
}

// Nueva interface para Encomiendas
export interface Package {
  id: string
  date: string
  time: string
  sender: {
    name: string
    dni: string
    phone: string
    address: string
  }
  receiver: {
    name: string
    dni: string
    phone: string
    address: string
  }
  route: {
    id: number
    from: string
    to: string
    price: number
  }
  schedule: string
  description: string
  weight: number
  dimensions: string
  value: number
  total: number
  status: "Pagado" | "Pendiente" | "En Tránsito" | "Entregado"
  driver: Driver
  deliveryDate?: string
  notes?: string
}

// ==========================================
// CMS Builder Types
// ==========================================

export type BlockType = "hero" | "features" | "routes_grid" | "text"

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface HeroBlock extends BaseBlock {
  type: "hero"
  title: string
  subtitle: string
  image: string
}

export interface FeaturesBlock extends BaseBlock {
  type: "features"
}

export interface RoutesGridBlock extends BaseBlock {
  type: "routes_grid"
}

export interface TextBlock extends BaseBlock {
  type: "text"
  content: string
}

export type SiteBlock = HeroBlock | FeaturesBlock | RoutesGridBlock | TextBlock

export interface SiteSettings {
  id: string
  blocks: SiteBlock[]
  updated_at: string
}
