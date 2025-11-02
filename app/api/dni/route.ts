import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Obtener el DNI de los parámetros de la URL
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    // Validar que el DNI existe y tiene 8 dígitos
    if (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
      return NextResponse.json(
        { error: 'DNI debe tener exactamente 8 dígitos numéricos' },
        { status: 400 }
      )
    }

    console.log('🔍 Buscando DNI en API externa:', dni)

    // Hacer la solicitud a la API externa desde el servidor
    const apiUrl = `https://g6dbpxwt-8000.brs.devtunnels.ms/dni?dni=${dni}`
    console.log('📡 URL de consulta:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Estado de respuesta:', response.status, response.statusText)

    if (!response.ok) {
      console.log('❌ Error en API externa:', response.status)
      return NextResponse.json(
        { error: 'Error en la API externa', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('📋 Datos recibidos:', data)

    // Validar que tenga la estructura esperada
    if (!data || !data.nombre_completo) {
      console.log('❌ Datos incompletos:', data)
      return NextResponse.json(
        { error: 'DNI no encontrado en la API externa' },
        { status: 404 }
      )
    }

    console.log('✅ Nombre encontrado:', data.nombre_completo)

    // Retornar los datos
    return NextResponse.json({
      nombre_completo: data.nombre_completo,
      dni: dni
    })

  } catch (error) {
    console.error('🚨 Error en API proxy:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
