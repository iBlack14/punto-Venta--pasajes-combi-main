"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useSiteSettings } from "@/lib/hooks/use-site-settings"
import { useRoutes } from "@/lib/hooks/use-api"
import type { HeroBlock, TextBlock } from "@/lib/types"
import type { SiteLayoutV2 } from "@/lib/site-builder/types"
import { PageRenderer } from "@/components/public/page-renderer"

export default function PublicLandingPage() {
  const router = useRouter()
  const { blocks, isLoading: legacyLoading } = useSiteSettings()
  const { routes, loading: routesLoading } = useRoutes()
  const [layoutV2, setLayoutV2] = useState<SiteLayoutV2 | null>(null)
  const [loadingV2, setLoadingV2] = useState(true)
  const [sitePages, setSitePages] = useState<any[]>([])

  useEffect(() => {
    const fetchPublishedInicio = async () => {
      try {
        const response = await fetch("/api/site/pages/inicio?mode=published")
        const payload = await response.json()
        if (response.ok && payload?.data?.layout) {
          setLayoutV2(payload.data.layout)
        }
      } catch {
        setLayoutV2(null)
      } finally {
        setLoadingV2(false)
      }
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

    fetchPublishedInicio()
    fetchSitePages()
  }, [])

  const isLoading = loadingV2 || (!layoutV2 && legacyLoading)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        {layoutV2 ? (
          <PageRenderer layout={layoutV2} routes={routes || []} />
        ) : (
          <>
            {blocks.map((block) => {
              if (block.type === "hero") {
                const hero = block as HeroBlock
                return (
                  <section key={block.id} className="relative bg-blue-700 py-16 text-white">
                    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${hero.image}')` }} />
                    <div className="relative max-w-7xl mx-auto px-4">
                      <h1 className="text-4xl font-extrabold mb-3">{hero.title}</h1>
                      <p className="text-xl text-blue-100">{hero.subtitle}</p>
                    </div>
                  </section>
                )
              }
              if (block.type === "text") {
                const text = block as TextBlock
                return (
                  <section key={block.id} className="py-10 bg-white">
                    <div className="max-w-4xl mx-auto px-4 text-center text-gray-700 whitespace-pre-wrap">{text.content}</div>
                  </section>
                )
              }
              return null
            })}
          </>
        )}
      </main>
    </div>
  )
}

