import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Package, ApiResponse } from "@/lib/types/database"

/**
 * API Route para manejar operaciones CRUD de paquetes individuales
 *
 * GET /api/packages/[id] - Obtener un paquete específico
 * PUT /api/packages/[id] - Actualizar un paquete específico
 * DELETE /api/packages/[id] - Eliminar un paquete específico
 */

// GET: Obtener un paquete por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Package>>> {
  try {
    const supabase = createClient()
    const { id } = params

    const { data: packageData, error } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
      }
      console.error("Error al obtener paquete:", error)
      return NextResponse.json({ error: "Error al obtener paquete" }, { status: 500 })
    }

    return NextResponse.json({ data: packageData })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar un paquete específico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Package>>> {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    // Campos que se pueden actualizar
    const updatableFields = {
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
      declared_value: body.declared_value,
      shipping_cost: body.shipping_cost,
      total: body.total,
      travel_date: body.travel_date,
      status: body.status,
      updated_at: new Date().toISOString(),
    }

    // Filtrar campos undefined para actualizar solo los campos proporcionados
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updatableFields).filter(([_, value]) => value !== undefined)
    )

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ error: "No se proporcionaron campos para actualizar" }, { status: 400 })
    }

    // Verificar que el paquete existe
    const { data: existingPackage } = await supabase
      .from("packages")
      .select("id")
      .eq("id", id)
      .single()

    if (!existingPackage) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    // Actualizar el paquete
    const { data: updatedPackage, error } = await supabase
      .from("packages")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar paquete:", error)
      return NextResponse.json({ error: "Error al actualizar paquete" }, { status: 500 })
    }

    return NextResponse.json({ 
      data: updatedPackage, 
      message: "Paquete actualizado exitosamente" 
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar un paquete específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const supabase = createClient()
    const { id } = params

    // Verificar que el paquete existe
    const { data: existingPackage } = await supabase
      .from("packages")
      .select("id, status")
      .eq("id", id)
      .single()

    if (!existingPackage) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    // Verificar que el paquete no esté en tránsito o entregado (opcional)
    if (existingPackage.status === "En Tránsito") {
      return NextResponse.json({ 
        error: "No se puede eliminar un paquete que está en tránsito" 
      }, { status: 400 })
    }

    // Eliminar el paquete
    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error al eliminar paquete:", error)
      return NextResponse.json({ error: "Error al eliminar paquete" }, { status: 500 })
    }

    return NextResponse.json({ 
      data: null, 
      message: "Paquete eliminado exitosamente" 
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH: Actualizar parcialmente un paquete (principalmente para cambio de estado)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Package>>> {
  try {
    const supabase = createClient()
    const { id } = params
    const body = await request.json()

    // Validar que se proporcione al menos un campo
    if (!body.status && body.tracking_code === undefined) {
      return NextResponse.json({ 
        error: "Se debe proporcionar al menos un campo para actualizar (status, tracking_code)" 
      }, { status: 400 })
    }

    // Verificar que el paquete existe
    const { data: existingPackage } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single()

    if (!existingPackage) {
      return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 })
    }

    // Preparar campos para actualizar
    const fieldsToUpdate: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.status) {
      // Validar estado válido
      const validStatuses = ["Pendiente", "Pagado", "En Tránsito", "Entregado"]
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ 
          error: `Estado inválido. Estados válidos: ${validStatuses.join(", ")}` 
        }, { status: 400 })
      }
      fieldsToUpdate.status = body.status
    }

    if (body.tracking_code !== undefined) {
      fieldsToUpdate.tracking_code = body.tracking_code
    }

    // Actualizar el paquete
    const { data: updatedPackage, error } = await supabase
      .from("packages")
      .update(fieldsToUpdate)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar paquete:", error)
      return NextResponse.json({ error: "Error al actualizar paquete" }, { status: 500 })
    }

    return NextResponse.json({ 
      data: updatedPackage, 
      message: "Paquete actualizado exitosamente" 
    })
  } catch (error) {
    console.error("Error inesperado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
