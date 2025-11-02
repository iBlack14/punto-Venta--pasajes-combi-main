import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Route, ApiResponse } from "@/lib/types/database"

/**
 * API Route para operaciones específicas de una ruta
 *
 * GET /api/routes/[id] - Obtener una ruta específica
 * PUT /api/routes/[id] - Actualizar una ruta
 * DELETE /api/routes/[id] - Eliminar una ruta
 */

// GET: Obtener una ruta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Route>>> {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: route, error } = await supabase.from("routes").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
      }
      console.error("Error al obtener ruta:", error)
      return NextResponse.json({ error: "Error al obtener ruta" }, { status: 500 })
    }

    return NextResponse.json({ data: route })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar una ruta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Route>>> {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    // Validar que la ruta existe
    const { data: existingRoute } = await supabase.from("routes").select("id").eq("id", id).single()

    if (!existingRoute) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    // Validar campos requeridos si se proporcionan
    if (body.price !== undefined) {
      const price = Number.parseFloat(body.price.toString())
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ error: "El precio debe ser un número válido mayor a 0" }, { status: 400 })
      }
      body.price = price
    }

    if (body.distance_km !== undefined) {
      body.distance_km = Number.parseInt(body.distance_km.toString()) || 0
    }

    // Actualizar la ruta
    const { data: updatedRoute, error } = await supabase
      .from("routes")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar ruta:", error)
      return NextResponse.json({ error: "Error al actualizar ruta" }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedRoute,
      message: "Ruta actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar una ruta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = createClient()
    const { id } = params

    // Verificar si la ruta tiene ventas asociadas
    const { data: sales } = await supabase.from("sales").select("id").eq("route_id", id).limit(1)

    if (sales && sales.length > 0) {
      return NextResponse.json({ error: "No se puede eliminar la ruta porque tiene ventas asociadas" }, { status: 409 })
    }

    // Verificar si la ruta tiene paquetes asociados
    const { data: packages } = await supabase.from("packages").select("id").eq("route_id", id).limit(1)

    if (packages && packages.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar la ruta porque tiene paquetes asociados" },
        { status: 409 },
      )
    }

    // Eliminar la ruta
    const { error } = await supabase.from("routes").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar ruta:", error)
      return NextResponse.json({ error: "Error al eliminar ruta" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Ruta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
