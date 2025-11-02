import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Driver, ApiResponse } from "@/lib/types/database"

/**
 * API Route para operaciones específicas de un conductor
 *
 * GET /api/drivers/[id] - Obtener un conductor específico
 * PUT /api/drivers/[id] - Actualizar un conductor
 * DELETE /api/drivers/[id] - Eliminar un conductor
 */

// GET: Obtener un conductor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Driver>>> {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: driver, error } = await supabase.from("drivers").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
      }
      console.error("Error al obtener conductor:", error)
      return NextResponse.json({ error: "Error al obtener conductor" }, { status: 500 })
    }

    return NextResponse.json({ data: driver })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar un conductor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Driver>>> {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    // Validar que el conductor existe
    const { data: existingDriver } = await supabase.from("drivers").select("id").eq("id", id).single()

    if (!existingDriver) {
      return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 })
    }

    // Actualizar el conductor
    const { data: updatedDriver, error } = await supabase
      .from("drivers")
      .update({
        name: body.name,
        phone: body.phone,
        license: body.license,
        experience_years: body.experience_years,
        status: body.status || "active", // Mantener status o usar active por defecto
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar conductor:", error)
      return NextResponse.json({ error: "Error al actualizar conductor" }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedDriver,
      message: "Conductor actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar un conductor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = createClient()
    const { id } = params

    // Verificar si el conductor tiene ventas asociadas
    const { data: sales } = await supabase.from("sales").select("id").eq("driver_id", id).limit(1)

    if (sales && sales.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el conductor porque tiene ventas asociadas" },
        { status: 409 },
      )
    }

    // Eliminar el conductor
    const { error } = await supabase.from("drivers").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar conductor:", error)
      return NextResponse.json({ error: "Error al eliminar conductor" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Conductor eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
