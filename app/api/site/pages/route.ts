import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { DEFAULT_PAGE_SLUGS, type PageSlug } from "@/lib/site-builder/types"
import { ensureSitePage, getLatestVersion, normalizeLayout } from "@/lib/site-builder/server"
import { defaultLayoutForSlug } from "@/lib/site-builder/defaults"

export const dynamic = 'force-dynamic'
export const revalidate = 0

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function GET() {
  try {
    const supabase = createClient()

    for (const slug of DEFAULT_PAGE_SLUGS) {
      await ensureSitePage(slug)
    }

    const { data: pages, error } = await supabase.from("site_pages").select("*").order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const payload = await Promise.all(
      (pages || []).map(async (page: any) => {
        const draft = await getLatestVersion(page.id, false)
        const published = await getLatestVersion(page.id, true)
        return {
          slug: page.slug as PageSlug,
          title: page.title,
          status: page.status,
          draftVersion: draft?.version || 0,
          publishedVersion: published?.version || 0,
          updatedAt: page.updated_at,
          draftLayout: draft ? normalizeLayout(draft.layout_json, page.slug as PageSlug) : null,
          publishedLayout: published ? normalizeLayout(published.layout_json, page.slug as PageSlug) : null,
        }
      }),
    )

    return NextResponse.json({ data: payload })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const title = String(body?.title || "").trim()
    const desiredSlug = String(body?.slug || "").trim()

    if (!title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }

    const slug = slugify(desiredSlug || title)
    if (!slug) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 })
    }

    const supabase = createClient()
    const existing = await supabase.from("site_pages").select("id").eq("slug", slug).maybeSingle()
    if (existing.data) {
      return NextResponse.json({ error: "Ya existe una página con ese slug" }, { status: 409 })
    }

    const inserted = await supabase
      .from("site_pages")
      .insert([{ slug, title, status: "draft" }])
      .select("*")
      .single()

    if (inserted.error || !inserted.data) {
      return NextResponse.json({ error: inserted.error?.message || "No se pudo crear la página" }, { status: 500 })
    }

    await supabase.from("site_page_versions").insert([
      {
        page_id: inserted.data.id,
        version: 1,
        schema_version: 2,
        layout_json: defaultLayoutForSlug(slug),
        is_published: false,
        created_by: null,
      },
    ])

    return NextResponse.json(
      {
        data: {
          slug,
          title,
          status: "draft",
          draftVersion: 1,
          publishedVersion: 0,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

