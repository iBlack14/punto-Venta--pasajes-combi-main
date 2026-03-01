import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Crear un nombre único para evitar colisiones
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${uniqueSuffix}-${originalName}`

    // Asegurarse de que el directorio existe
    const uploadDir = join(process.cwd(), "public", "uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignorar si ya existe
    }

    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)

    // La ruta pública es relativa a la carpeta public
    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl
    })

  } catch (error: any) {
    console.error("Error al subir archivo:", error)
    return NextResponse.json(
      { success: false, error: "Fallo al procesar la subida del archivo" },
      { status: 500 }
    )
  }
}
