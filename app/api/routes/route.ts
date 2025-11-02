import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Route, CreateRoute, ApiResponse } from "@/lib/types/database"

/**
 * API Route para manejar operaciones CRUD de rutas
 *
 * GET /api/routes - Obtener todas las rutas
 * POST /api/routes - Crear una nueva ruta
 */

// GET: Obtener todas las rutas
export async function GET(): Promise<NextResponse<ApiResponse<any[]>>> {
  try {
    const supabase = createClient()

    const { data: routes, error } = await supabase
      .from("routes")
      .select("*")
      .order("origin", { ascending: true })

    if (error) {
      console.error("Error al obtener rutas:", error)
      return NextResponse.json({ error: "Error al obtener rutas" }, { status: 500 })
    }

    return NextResponse.json({ data: routes })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear una nueva ruta
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Route>>> {
  try {
    const supabase = createClient()
    const body: CreateRoute = await request.json()

    // Validar campos requeridos
    if (!body.origin || !body.destination || body.price === undefined || body.price === null || !body.schedule) {
      return NextResponse.json({ error: "Origen, destino, precio y horario son campos requeridos" }, { status: 400 })
    }

    // Validar que el precio sea un número válido
    const price = Number.parseFloat(body.price.toString())
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "El precio debe ser un número válido mayor a 0" }, { status: 400 })
    }

    // Verificar si ya existe una ruta similar
    const { data: existingRoute } = await supabase
      .from("routes")
      .select("id")
      .eq("origin", body.origin.trim())
      .eq("destination", body.destination.trim())
      .eq("schedule", body.schedule) // opcional: mismo horario también
      .single()

    if (existingRoute) {
      return NextResponse.json({ error: "Ya existe una ruta entre estas ciudades en ese horario" }, { status: 409 })
    }

    // Crear la nueva ruta
    const { data: newRoute, error: routeError } = await supabase
      .from("routes")
      .insert([
        {
          origin: body.origin.trim(),
          destination: body.destination.trim(),
          price: price,
          schedule: body.schedule,
        },
      ])
      .select()
      .single()

    if (routeError) {
      console.error("Error al crear ruta:", routeError)
      return NextResponse.json({ error: "Error al crear ruta" }, { status: 500 })
    }

    return NextResponse.json({ data: newRoute, message: "Ruta creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
