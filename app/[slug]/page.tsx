"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRoutes } from "@/lib/hooks/use-api"
import { PageRenderer } from "@/components/public/page-renderer"
import type { SiteLayoutV2 } from "@/lib/site-builder/types"

export default function DynamicPublicPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const { routes, loading: routesLoading } = useRoutes()
  const [layout, setLayout] = useState<SiteLayoutV2 | null>(null)
  const [loading, setLoading] = useState(true)
  const [sitePages, setSitePages] = useState<any[]>([])

  useEffect(() => {
    const slug = params.slug
    const fetchPage = async () => {
      setLoading(true)
      const response = await fetch(`/api/site/pages/${slug}?mode=published`)
      const payload = await response.json().catch(() => null)
      if (response.ok && payload?.data?.layout) {
        setLayout(payload.data.layout)
      } else {
        router.replace("/")
      }
      setLoading(false)
    }

    const fetchSitePages = async () => {
      try {
        const res = await fetch("/api/site/pages")
        const data = await res.json()
        if (res.ok && data?.data) {
          setSitePages(data.data.filter((p: any) => p.status === "published" && p.slug !== "inicio"))
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchPage()
    fetchSitePages()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!layout) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PageRenderer layout={layout} routes={routes || []} routesLoading={routesLoading} />
    </div>
  )
}
