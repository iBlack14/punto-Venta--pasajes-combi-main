import { NextRequest, NextResponse } from "next/server"
import { getLatestVersion } from "@/lib/site-builder/server"
import { createClient } from "@/lib/supabase/server"

function isPublisherRole(request: NextRequest) {
  const role = request.headers.get("x-user-role")
  return role === "admin" || role === "operator"
}

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    if (!isPublisherRole(request)) {
      return NextResponse.json({ error: "Sin permisos para publicar" }, { status: 403 })
    }

    const supabase = createClient()
    const pageResult = await supabase.from("site_pages").select("*").eq("slug", params.slug).maybeSingle()
    if (!pageResult.data) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
    }
    const page = pageResult.data
    const draft = await getLatestVersion(page.id, false)
    if (!draft) {
      return NextResponse.json({ error: "No existe borrador para publicar" }, { status: 400 })
    }

    const currentPublished = await getLatestVersion(page.id, true)
    const version = (currentPublished?.version || 0) + 1

    const publishedInsert = await supabase
      .from("site_page_versions")
      .insert([
        {
          page_id: page.id,
          version,
          schema_version: draft.schema_version,
          layout_json: draft.layout_json,
          is_published: true,
          created_by: request.headers.get("x-user-email"),
        },
      ])
      .select("*")
      .single()

    if (publishedInsert.error || !publishedInsert.data) {
      return NextResponse.json({ error: publishedInsert.error?.message || "No se pudo publicar" }, { status: 500 })
    }

    await supabase
      .from("site_pages")
      .update({ status: "published", published_version_id: publishedInsert.data.id })
      .eq("id", page.id)

    return NextResponse.json({
      data: {
        slug: params.slug,
        version,
        publishedVersionId: publishedInsert.data.id,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
