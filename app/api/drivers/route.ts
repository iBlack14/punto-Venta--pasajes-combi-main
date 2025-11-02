import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Driver, CreateDriver, ApiResponse } from "@/lib/types/database"

/**
 * API Route para manejar operaciones CRUD de conductores
 *
 * GET /api/drivers - Obtener todos los conductores
 * POST /api/drivers - Crear un nuevo conductor
 */

// GET: Obtener todos los conductores
export async function GET(): Promise<NextResponse<ApiResponse<Driver[]>>> {
  try {
    const supabase = createClient()

    // Consultar todos los conductores ordenados por nombre
    const { data: drivers, error } = await supabase.from("drivers").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error al obtener conductores:", error)
      return NextResponse.json({ error: "Error al obtener conductores" }, { status: 500 })
    }

    return NextResponse.json({ data: drivers })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear un nuevo conductor
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Driver>>> {
  try {
    const supabase = createClient()

    // Obtener datos del cuerpo de la petición
    const body: CreateDriver = await request.json()

    // Validar campos requeridos
    if (!body.name || !body.phone || !body.license) {
      return NextResponse.json({ error: "Nombre, teléfono y licencia son campos requeridos" }, { status: 400 })
    }

    // Verificar si ya existe un conductor con la misma licencia
    const { data: existingDriver } = await supabase.from("drivers").select("id").eq("license", body.license).single()

    if (existingDriver) {
      return NextResponse.json({ error: "Ya existe un conductor con esta licencia" }, { status: 409 })
    }

    // Crear el nuevo conductor
    const { data: newDriver, error } = await supabase
      .from("drivers")
      .insert([
        {
          name: body.name,
          phone: body.phone,
          license: body.license,
          email: body.email || null,
          status: "active",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear conductor:", error)
      return NextResponse.json({ error: "Error al crear conductor" }, { status: 500 })
    }

    return NextResponse.json({ data: newDriver, message: "Conductor creado exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
