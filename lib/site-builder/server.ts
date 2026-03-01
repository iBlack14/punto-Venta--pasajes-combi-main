import { createClient } from "@/lib/supabase/server"
import { defaultLayoutForSlug } from "./defaults"
import { SITE_SCHEMA_VERSION, type PageSlug, type SiteLayoutV2 } from "./types"

type SitePageRow = {
  id: string
  slug: string
  title: string
  status: string
  published_version_id: string | null
}

type VersionRow = {
  id: string
  page_id: string
  version: number
  schema_version: number
  layout_json: SiteLayoutV2
  is_published: boolean
  created_by: string | null
  created_at: string
}

export async function ensureSitePage(slug: PageSlug): Promise<SitePageRow> {
  const supabase = createClient()
  const title = slug[0].toUpperCase() + slug.slice(1)

  const existing = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle()
  if (existing.data) {
    return existing.data as SitePageRow
  }

  const inserted = await supabase
    .from("site_pages")
    .insert([{ slug, title, status: "draft" }])
    .select("*")
    .single()

  if (inserted.error || !inserted.data) {
    throw new Error(inserted.error?.message || "No se pudo crear la página")
  }

  await supabase.from("site_page_versions").insert([
    {
      page_id: inserted.data.id,
      version: 1,
      schema_version: SITE_SCHEMA_VERSION,
      layout_json: defaultLayoutForSlug(slug),
      is_published: false,
      created_by: null,
    },
  ])

  return inserted.data as SitePageRow
}

export async function getLatestVersion(pageId: string, isPublished: boolean): Promise<VersionRow | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("site_page_versions")
    .select("*")
    .eq("page_id", pageId)
    .eq("is_published", isPublished)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data as VersionRow | null) || null
}

export function normalizeLayout(layout: any, slug: PageSlug): SiteLayoutV2 {
  if (!layout || typeof layout !== "object") {
    return defaultLayoutForSlug(slug)
  }
  if (layout.schemaVersion !== SITE_SCHEMA_VERSION || !Array.isArray(layout.nodes)) {
    return defaultLayoutForSlug(slug)
  }
  return layout as SiteLayoutV2
}

