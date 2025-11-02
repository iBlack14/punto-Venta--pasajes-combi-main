import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Sale, CreateSale, ApiResponse } from "@/lib/types/database"

/**
 * API Route para manejar operaciones CRUD de ventas
 *
 * GET /api/sales - Obtener todas las ventas con filtros opcionales
 * POST /api/sales - Crear una nueva venta
 */

// GET: Obtener todas las ventas con filtros opcionales
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Sale[]>>> {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Parámetros de filtro opcionales
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const driverName = searchParams.get("driver_name")
    const passengerDni = searchParams.get("passenger_dni")

    let query = supabase.from("sales").select("*").order("created_at", { ascending: false })

    // Aplicar filtros si se proporcionan
    if (date) {
      query = query.eq("travel_date", date)
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (driverName) {
      query = query.ilike("driver_name", `%${driverName}%`)
    }

    if (passengerDni) {
      query = query.eq("passenger_dni", passengerDni)
    }

    const { data: salesData, error } = await query

    if (error) {
      console.error("Error al obtener ventas:", error)
      return NextResponse.json({ error: "Error al obtener ventas" }, { status: 500 })
    }

    // Transformar datos de Supabase al formato esperado por la UI
    const transformedSales = salesData?.map((sale: any) => ({
      id: sale.id,
      date: sale.travel_date,
      time: new Date(sale.created_at).toLocaleTimeString(),
      passenger: {
        name: sale.passenger_name,
        dni: sale.passenger_dni,
        phone: sale.passenger_phone || "",
      },
      route: {
        id: sale.route_id,
        from: sale.from_city,
        to: sale.to_city,
        price: parseFloat(sale.price),
      },
      schedule: sale.schedule_time,
      seatNumber: sale.seat_number,
      total: parseFloat(sale.total),
      status: sale.status,
      driver: {
        id: sale.driver_id,
        name: sale.driver_name,
        license: "",
        phone: "",
        email: "",
        isActive: true,
      },
    })) || []

    return NextResponse.json({ data: transformedSales })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear una nueva venta
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Sale>>> {
  try {
    const supabase = createClient()
    const body: CreateSale = await request.json()

    // Validar campos requeridos
    if (
      !body.passenger_name ||
      !body.passenger_dni ||
      !body.passenger_phone ||
      !body.from_city ||
      !body.to_city ||
      !body.driver_id ||
      !body.route_id ||
      !body.seat_number ||
      !body.travel_date ||
      !body.schedule_time
    ) {
      return NextResponse.json({ error: "Todos los campos son requeridos para crear una venta" }, { status: 400 })
    }

    // Verificar que el asiento no esté ocupado para la misma fecha, ruta y horario
    const { data: existingSale } = await supabase
      .from("sales")
      .select("id")
      .eq("route_id", body.route_id)
      .eq("travel_date", body.travel_date)
      .eq("schedule_time", body.schedule_time)
      .eq("seat_number", body.seat_number)
      .eq("status", "Pagado")
      .single()

    if (existingSale) {
      return NextResponse.json({ error: "El asiento ya está ocupado para esta fecha y horario" }, { status: 409 })
    }

    // Obtener información del conductor
    const { data: driver } = await supabase.from("drivers").select("name").eq("id", body.driver_id).single()

    // Generar ID único para la venta
    const saleId = `WJL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

    // Crear la nueva venta
    const { data: newSale, error } = await supabase
      .from("sales")
      .insert([
        {
          id: saleId,
          passenger_name: body.passenger_name,
          passenger_dni: body.passenger_dni,
          passenger_phone: body.passenger_phone,
          from_city: body.from_city,
          to_city: body.to_city,
          driver_name: driver?.name || "Conductor no encontrado",
          driver_id: body.driver_id,
          route_id: body.route_id,
          seat_number: body.seat_number,
          price: body.price,
          total: body.total,
          travel_date: body.travel_date,
          schedule_time: body.schedule_time,
          status: body.status || "Pagado",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error al crear venta:", error)
      return NextResponse.json({ error: "Error al crear venta" }, { status: 500 })
    }

    // Transformar la respuesta al formato esperado por la UI
    const transformedSale = {
      id: newSale.id,
      date: newSale.travel_date,
      time: new Date(newSale.created_at).toLocaleTimeString(),
      passenger: {
        name: newSale.passenger_name,
        dni: newSale.passenger_dni,
        phone: newSale.passenger_phone || "",
      },
      route: {
        id: newSale.route_id,
        from: newSale.from_city,
        to: newSale.to_city,
        price: parseFloat(newSale.price),
      },
      schedule: newSale.schedule_time,
      seatNumber: newSale.seat_number,
      total: parseFloat(newSale.total),
      status: newSale.status,
      driver: {
        id: newSale.driver_id,
        name: newSale.driver_name,
        license: "",
        phone: "",
        email: "",
        isActive: true,
      },
    }

    return NextResponse.json({ data: transformedSale, message: "Venta creada exitosamente" }, { status: 201 })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
