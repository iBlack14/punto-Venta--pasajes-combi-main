export const SITE_SCHEMA_VERSION = 2

export type PageSlug = string
export const DEFAULT_PAGE_SLUGS = ["inicio"] as const

export type ViewportMode = "desktop" | "tablet" | "mobile"

export interface ResponsiveProps<T> {
  desktop?: T
  tablet?: T
  mobile?: T
}

export interface StyleToken {
  backgroundColor?: string
  textColor?: string
  paddingY?: number
  paddingX?: number
  align?: "left" | "center" | "right"
}

export type BuilderNodeType = "section" | "hero" | "text" | "image" | "button" | "features" | "routes_grid"

export interface BuilderNode {
  id: string
  type: BuilderNodeType
  props: Record<string, any>
  style?: StyleToken
  responsive?: ResponsiveProps<Record<string, any>>
  children?: BuilderNode[]
}

export interface SiteLayoutV2 {
  schemaVersion: 2
  nodes: BuilderNode[]
}

export interface SitePageVersion {
  id: string
  pageId: string
  version: number
  schemaVersion: number
  layout: SiteLayoutV2
  isPublished: boolean
  createdBy?: string | null
  createdAt: string
}

export interface SitePageDraft {
  slug: PageSlug
  title: string
  layout: SiteLayoutV2
  version: number
  updatedAt?: string
}

export interface SitePagePublished {
  slug: PageSlug
  title: string
  layout: SiteLayoutV2
  version: number
  publishedAt?: string
}

export interface SiteAsset {
  id: string
  path: string
  public_url: string
  mime: string
  size: number
  created_by?: string | null
  created_at: string
}
