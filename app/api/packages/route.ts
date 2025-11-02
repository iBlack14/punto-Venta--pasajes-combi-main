import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Package, CreatePackage, ApiResponse } from "@/lib/types/database"

/**
 * API Route para manejar operaciones CRUD de paquetes/encomiendas
 *
 * GET /api/packages - Obtener todos los paquetes
 * POST /api/packages - Crear un nuevo paquete
 */

// Función para generar código de seguimiento único
function generateTrackingCode(): string {
  const prefix = "WJL"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

// GET: Obtener todos los paquetes
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Package[]>>> {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Parámetros de filtro opcionales
    const status = searchParams.get("status")
    const trackingCode = searchParams.get("tracking_code")
    const senderDni = searchParams.get("sender_dni")
    const recipientDni = searchParams.get("recipient_dni")

    let query = supabase.from("packages").select("*").order("created_at", { ascending: false })

    // Aplicar filtros si se proporcionan
    if (status) {
      query = query.eq("status", status)
    }

    if (trackingCode) {
      query = query.eq("tracking_code", trackingCode)
    }

    if (senderDni) {
      query = query.eq("sender_dni", senderDni)
    }

    if (recipientDni) {
      query = query.eq("recipient_dni", recipientDni)
    }

    const { data: packages, error } = await query

    if (error) {
      console.error("Error al obtener paquetes:", error)
      return NextResponse.json({ error: "Error al obtener paquetes" }, { status: 500 })
    }

    return NextResponse.json({ data: packages })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear un nuevo paquete
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Package>>> {
  try {
    const supabase = createClient()
    const body: CreatePackage = await request.json()

    // Validar campos requeridos
    if (
      !body.sender_name ||
      !body.sender_dni ||
      !body.recipient_name ||
      !body.recipient_dni ||
      !body.from_city ||
      !body.to_city ||
      !body.description ||
      !body.weight
    ) {
      return NextResponse.json({ error: "Todos los campos obligatorios deben ser completados" }, { status: 400 })
    }

    // Generar código de seguimiento único
    let trackingCode = generateTrackingCode()

    // Verificar que el código sea único
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 5) {
      const { data: existingPackage } = await supabase
        .from("packages")
        .select("id")
        .eq("tracking_code", trackingCode)
        .single()

      if (!existingPackage) {
        isUnique = true
      } else {
        trackingCode = generateTrackingCode()
        attempts++
      }
    }

    // Generar ID único para el paquete
    const packageId = `ENC-${Date.now().toString().slice(-6)}`

    // Crear el nuevo paquete
    const { data: newPackage, error } = await supabase
      .from("packages")
      .insert([
        {
          id: packageId,
          sender_name: body.sender_name,
          sender_dni: body.sender_dni,
          sender_phone: body.sender_phone,
          recipient_name: body.recipient_name,
          recipient_dni: body.recipient_dni,
          recipient_phone: body.recipient_phone,
          from_city: body.from_city,
          to_city: body.to_city,
          description: body.description,
          weight: body.weight,
          declared_value: body.declared_value || 0,
          shipping_cost: body.shipping_cost || body.total || 0,
          total: body.total,
          travel_date: body.travel_date || new Date().toISOString().split('T')[0],
          status: body.status || "Pendiente",
          tracking_code: trackingCode,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear paquete:", error)
      return NextResponse.json({ error: "Error al crear paquete" }, { status: 500 })
    }

    return NextResponse.json({ data: newPackage, message: "Paquete creado exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
