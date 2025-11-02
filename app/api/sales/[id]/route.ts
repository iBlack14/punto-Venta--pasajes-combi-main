import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Sale, ApiResponse } from "@/lib/types/database"

/**
 * API Route para operaciones específicas de una venta
 *
 * GET /api/sales/[id] - Obtener una venta específica
 * PUT /api/sales/[id] - Actualizar una venta
 * DELETE /api/sales/[id] - Eliminar una venta
 */

// GET: Obtener una venta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Sale>>> {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: saleData, error } = await supabase.from("sales").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
      }
      console.error("Error al obtener venta:", error)
      return NextResponse.json({ error: "Error al obtener venta" }, { status: 500 })
    }

    // Transformar datos de Supabase al formato esperado por la UI
    const transformedSale = {
      id: saleData.id,
      date: saleData.travel_date,
      time: new Date(saleData.created_at).toLocaleTimeString(),
      passenger: {
        name: saleData.passenger_name,
        dni: saleData.passenger_dni,
        phone: saleData.passenger_phone || "",
      },
      route: {
        id: saleData.route_id,
        from: saleData.from_city,
        to: saleData.to_city,
        price: parseFloat(saleData.price),
      },
      schedule: saleData.schedule_time,
      seatNumber: saleData.seat_number,
      total: parseFloat(saleData.total),
      status: saleData.status,
      driver: {
        id: saleData.driver_id,
        name: saleData.driver_name,
        license: "",
        phone: "",
        email: "",
        isActive: true,
      },
    }

    return NextResponse.json({ data: transformedSale })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar una venta
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<Sale>>> {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    // Validar que la venta existe
    const { data: existingSale } = await supabase.from("sales").select("*").eq("id", id).single()

    if (!existingSale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Si se está cambiando el asiento, verificar disponibilidad
    if (body.seat_number && body.seat_number !== existingSale.seat_number) {
      const { data: conflictingSale } = await supabase
        .from("sales")
        .select("id")
        .eq("route_id", body.route_id || existingSale.route_id)
        .eq("travel_date", body.travel_date || existingSale.travel_date)
        .eq("schedule_time", body.schedule_time || existingSale.schedule_time)
        .eq("seat_number", body.seat_number)
        .eq("status", "confirmado")
        .neq("id", id)
        .single()

      if (conflictingSale) {
        return NextResponse.json({ error: "El asiento ya está ocupado para esta fecha y horario" }, { status: 409 })
      }
    }

    // Actualizar la venta
    const { data: updatedSale, error } = await supabase
      .from("sales")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar venta:", error)
      return NextResponse.json({ error: "Error al actualizar venta" }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedSale,
      message: "Venta actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar una venta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = createClient()
    const { id } = params

    // Verificar que la venta existe
    const { data: existingSale } = await supabase.from("sales").select("status, travel_date").eq("id", id).single()

    if (!existingSale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Verificar si la venta puede ser eliminada (ej: no ha pasado la fecha de viaje)
    const travelDate = new Date(existingSale.travel_date)
    const today = new Date()

    if (travelDate < today && existingSale.status === "confirmado") {
      return NextResponse.json({ error: "No se puede eliminar una venta de un viaje que ya pasó" }, { status: 409 })
    }

    // Eliminar la venta
    const { error } = await supabase.from("sales").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar venta:", error)
      return NextResponse.json({ error: "Error al eliminar venta" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Venta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
