import { NextRequest, NextResponse } from "next/server"
import { SITE_SCHEMA_VERSION } from "@/lib/site-builder/types"
import { getLatestVersion, normalizeLayout } from "@/lib/site-builder/server"
import { createClient } from "@/lib/supabase/server"

function isEditorRole(request: NextRequest) {
  const role = request.headers.get("x-user-role")
  return role === "admin" || role === "operator"
}

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    if (!isEditorRole(request)) {
      return NextResponse.json({ error: "Sin permisos para editar borradores" }, { status: 403 })
    }

    const body = await request.json()
    const layout = normalizeLayout(body?.layout, params.slug)
    const supabase = createClient()
    const pageResult = await supabase.from("site_pages").select("*").eq("slug", params.slug).maybeSingle()
    if (!pageResult.data) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
    }
    const page = pageResult.data
    const currentDraft = await getLatestVersion(page.id, false)
    const version = (currentDraft?.version || 0) + 1

    const insertResult = await supabase
      .from("site_page_versions")
      .insert([
        {
          page_id: page.id,
          version,
          schema_version: SITE_SCHEMA_VERSION,
          layout_json: layout,
          is_published: false,
          created_by: request.headers.get("x-user-email"),
        },
      ])
      .select("*")
      .single()

    if (insertResult.error) {
      return NextResponse.json({ error: insertResult.error.message }, { status: 500 })
    }

    await supabase.from("site_pages").update({ status: "draft" }).eq("id", page.id)

    return NextResponse.json({
      data: {
        slug: params.slug,
        version,
        layout,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
