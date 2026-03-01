"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Loader2, Plus, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Puck } from "@measured/puck"
import "@measured/puck/puck.css"
import { config } from "@/lib/puck.config"
import type { PageSlug } from "@/lib/site-builder/types"

type PageListItem = {
  slug: string
  title: string
  status: "draft" | "published"
  draftVersion: number
  publishedVersion: number
  updatedAt: string
}

function getCurrentUser() {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("user_data")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function adaptLayoutToPuck(layout: any): any {
  if (layout?.content && Array.isArray(layout.content)) {
    return layout;
  }

  if (layout?.nodes && Array.isArray(layout.nodes)) {
    const zones: Record<string, any[]> = {}

    const content = layout.nodes.map((node: any, i: number) => {
      const type = node.type === "section" ? "Section" : node.type.charAt(0).toUpperCase() + node.type.slice(1).replace('_grid', 'Grid')
      const nodeId = `legacy-node-${i}`

      if (node.children && node.children.length > 0) {
        zones[`${nodeId}-content`] = node.children.map((child: any, j: number) => ({
          type: child.type.charAt(0).toUpperCase() + child.type.slice(1).replace('_grid', 'Grid'),
          props: { ...child.props, id: `legacy-child-${i}-${j}` }
        }))
      }

      return {
        type,
        props: { ...node.props, id: nodeId }
      }
    })

    return {
      content,
      root: { props: { title: "Página" } },
      zones
    }
  }

  return {
    content: [],
    root: { props: { title: "Página" } },
    zones: {}
  }
}

export function SiteBuilder() {
  const { toast } = useToast()
  const [view, setView] = useState<"list" | "editor">("list")
  const [pages, setPages] = useState<PageListItem[]>([])
  const [pagesLoading, setPagesLoading] = useState(true)
  const [creatingPage, setCreatingPage] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSlug, setNewSlug] = useState("")

  const [slug, setSlug] = useState<PageSlug>("inicio")
  const [loading, setLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [initialData, setInitialData] = useState<any>({ content: [], root: {}, zones: {} })
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const currentUser = useMemo(() => getCurrentUser(), [])
  const requestHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-user-role": currentUser?.role || "",
      "x-user-email": currentUser?.email || "",
    }),
    [currentUser],
  )

  const fetchPages = async () => {
    setPagesLoading(true)
    try {
      const response = await fetch(`/api/site/pages?t=${Date.now()}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "No se pudo cargar páginas")
      setPages(payload.data || [])
    } catch (error) {
      toast({
        title: "Error cargando páginas",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      })
    } finally {
      setPagesLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    if (view !== "editor") return
    const fetchPage = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/site/pages/${slug}?mode=draft`)
        const payload = await response.json()
        const layout = payload?.data?.layout

        setInitialData(adaptLayoutToPuck(layout));
      } catch {
        setInitialData(adaptLayoutToPuck(null));
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug, view])

  const handleCreatePage = async () => {
    const title = newTitle.trim()
    const slugValue = slugify(newSlug.trim() || title)
    if (!title) return

    setCreatingPage(true)
    try {
      const response = await fetch("/api/site/pages", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({ title, slug: slugValue }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "No se pudo crear")
      setNewTitle("")
      setNewSlug("")
      await fetchPages()
      toast({ title: "Página creada", description: `Se creó la página ${payload.data.slug}.` })
    } catch (error) {
      toast({
        title: "Error al crear página",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      })
    } finally {
      setCreatingPage(false)
    }
  }

  const handleDeletePage = async () => {
    if (!deleteTarget) return
    const targetSlug = deleteTarget
    setDeleteTarget(null)

    try {
      const response = await fetch(`/api/site/pages/${targetSlug}`, {
        method: "DELETE",
        headers: requestHeaders,
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "No se pudo eliminar")

      // Actualizar UI de forma inmediata sin esperar re-fetch (Optimistic Update)
      setPages(prev => prev.filter(p => p.slug !== targetSlug))

      await fetchPages()
      toast({ title: "Página eliminada", description: `Se eliminó ${targetSlug}.` })
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      })
    }
  }

  const openEditor = (targetSlug: string) => {
    setSlug(targetSlug)
    setView("editor")
  }

  const handlePublish = async (data: any) => {
    setIsPublishing(true)
    try {
      // 1. Guardar borrador en el formato que espera nuestro API proxy
      const draftRes = await fetch(`/api/site/pages/${slug}/draft`, {
        method: "PUT",
        headers: requestHeaders,
        body: JSON.stringify({ layout: data }),
      })

      if (!draftRes.ok) throw new Error("No se pudo guardar borrador")

      // 2. Publicar la página
      const response = await fetch(`/api/site/pages/${slug}/publish`, {
        method: "POST",
        headers: requestHeaders,
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "No se pudo publicar")
      }
      await fetchPages()
      toast({
        title: "Página publicada",
        description: `La página ${slug} fue publicada correctamente con Puck.`,
      })
    } catch (error) {
      toast({
        title: "Error al publicar",
        description: error instanceof Error ? error.message : "Error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }


  if (view === "list") {
    return (
      <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Páginas del Sitio Web</h2>
            <p className="text-slate-500 mt-1">Gestiona el contenido público usando el editor visual en vivo</p>
          </div>
          <Button onClick={fetchPages} variant="outline" className="bg-white shadow-sm hover:bg-slate-50">
            <Loader2 className={`w-4 h-4 mr-2 ${pagesLoading ? 'animate-spin' : ''}`} />
            Actualizar datos
          </Button>
        </div>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 px-6 py-4">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Crear nueva página
            </h3>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-5 items-end">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-medium">Título de la página</Label>
                <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ej: Servicios Integrales" className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
              </div>
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="slug" className="text-slate-700 font-medium">Ruta URL (Slug)</Label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-200 h-11 px-3 flex items-center text-slate-500 rounded-l-md text-sm">/</span>
                  <Input id="slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="ej: servicios-integrales" className="h-11 rounded-l-none bg-slate-50 border-slate-200 focus:bg-white transition-colors" />
                </div>
              </div>
              <Button onClick={handleCreatePage} disabled={creatingPage || !newTitle.trim()} className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full md:w-auto">
                {creatingPage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Crear Página
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Páginas Publicadas</h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">{pages.length} en total</Badge>
          </div>
          <div className="p-0">
            {pagesLoading ? (
              <div className="py-24 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Cargando tu contenido...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-5">Nombre de la página</th>
                      <th className="px-6 py-5">Ruta (URL)</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-6 py-5">Versiones</th>
                      <th className="px-6 py-5 text-right whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pages.map((page) => (
                      <tr key={page.slug} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-base">{page.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-mono border border-slate-200">/{page.slug}</span>
                        </td>
                        <td className="px-6 py-4">
                          {page.status === "published" ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-0 font-medium px-2.5 py-0.5 shadow-sm">Publicada</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-0 font-medium px-2.5 py-0.5 shadow-sm">Borrador</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 w-max">
                            <span className="mb-0.5"><span className="font-semibold text-slate-700">Edición:</span> v{page.draftVersion}</span>
                            <span><span className="font-semibold text-slate-700">En vivo:</span> v{page.publishedVersion}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 shadow-sm" onClick={() => openEditor(page.slug)}>
                              <Eye className="w-4 h-4 mr-1.5" /> Puck Editor
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm" onClick={() => window.open(`/${page.slug === "inicio" ? "" : page.slug}`, "_blank")}>
                              Ver web
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-1" onClick={() => setDeleteTarget(page.slug)} title="Eliminar página">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pages.length === 0 ? (
                      <tr>
                        <td className="px-6 py-16 text-center text-slate-500" colSpan={5}>
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
                              <Plus className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium text-slate-900">Aún no hay páginas</p>
                            <p className="text-slate-500 mt-1">Crea tu primera página usando el formulario de arriba.</p>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente la página <strong>/{deleteTarget}</strong> y todo su contenido, afectando tu sitio web público de inmediato.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePage} className="bg-red-600 hover:bg-red-700 text-white">
                Sí, eliminar página
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <div className="h-[80vh] w-full flex flex-col">
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-t-xl border-x border-t shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setView("list")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a páginas
          </Button>
          <div>
            <h2 className="text-xl font-bold">Editar página: {slug}</h2>
            <p className="text-sm text-muted-foreground">Constructor visual (Puck)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border relative">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            Cargando entorno visual...
          </div>
        ) : (
          <Puck
            config={config}
            data={initialData}
            onPublish={handlePublish}
            overrides={{
              headerActions: ({ children }) => (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const getPuckData = () => {
                        // Accedemos a los datos de Puck desde el interior del componente
                        const btn = document.querySelector('button[title="Publicar"]') as HTMLButtonElement | null;
                        if (btn) btn.click();
                      };
                      if (!isPublishing) getPuckData();
                    }}
                    disabled={isPublishing}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 rounded-md shadow-sm transition-all"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Publicar"
                    )}
                  </Button>
                </div>
              ),
            }}
          />
        )}
      </div>
    </div>
  )
}
