import { NextRequest, NextResponse } from "next/server"
import { getLatestVersion, normalizeLayout } from "@/lib/site-builder/server"
import { defaultLayoutForSlug } from "@/lib/site-builder/defaults"
import { createClient } from "@/lib/supabase/server"
import { migrateLegacyBlocksToV2 } from "@/lib/site-builder/migration"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") === "published" ? "published" : "draft"
    const slug = params.slug
    const supabase = createClient()

    const pageResult = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle()
    if (!pageResult.data) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
    }
    const page = pageResult.data
    let version = await getLatestVersion(page.id, mode === "published")

    // Compatibilidad: migrar layout legacy de site_settings para inicio si no hay data.
    if (!version && slug === "inicio" && mode === "draft") {
      const legacy = await supabase
        .from("site_settings")
        .select("blocks")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (legacy.data?.blocks) {
        const migratedLayout = migrateLegacyBlocksToV2(legacy.data.blocks)
        await supabase.from("site_page_versions").insert([
          {
            page_id: page.id,
            version: 1,
            schema_version: 2,
            layout_json: migratedLayout,
            is_published: false,
          },
        ])
        version = await getLatestVersion(page.id, false)
      }
    }

    const layout = version ? normalizeLayout(version.layout_json, slug) : defaultLayoutForSlug(slug)

    return NextResponse.json({
      data: {
        slug,
        title: page.title,
        mode,
        version: version?.version || 1,
        layout,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const protectedPages = ["inicio"]
    if (protectedPages.includes(params.slug)) {
      return NextResponse.json({ error: "No se puede eliminar la página de inicio (base del sistema)" }, { status: 400 })
    }

    const supabase = createClient()
    const page = await supabase.from("site_pages").select("id").eq("slug", params.slug).maybeSingle()
    if (!page.data) {
      return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
    }

    const deleted = await supabase.from("site_pages").delete().eq("id", page.data.id)
    if (deleted.error) {
      return NextResponse.json({ error: deleted.error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Página eliminada" })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
