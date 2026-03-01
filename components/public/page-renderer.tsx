"use client"

import { Render } from "@measured/puck"
import { config } from "@/lib/puck.config"
import type { SiteLayoutV2 } from "@/lib/site-builder/types"

interface Props {
  layout: any // The JSON data saved from Puck
  routes: any[]
  routesLoading?: boolean
}

function adaptLayoutToPuck(layout: any): any {
  // Si el layout ya es formato Puck 
  if (layout?.content && Array.isArray(layout.content)) {
    return layout;
  }

  // Si viene del legacy SiteBuilder (SiteLayoutV2), convertir nodos simples
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

  // Fallback si no hay nada válido
  return {
    content: [],
    root: { props: { title: "Página" } },
    zones: {}
  }
}

export function PageRenderer({ layout, routes, routesLoading = false }: Props) {
  // Pasamos los componentes del context (ej: options para Hero) mediante el config (en realidad, Puck no inyecta props externas fácilmente al Render() mas que si lo hacemos vía el data en tiempo de render o ajustando el config)
  // Como `routes` y `routesLoading` son dinámicos, lo ideal sería que esos componentes estáticos hagan su propio data fetching,
  // Pero para este caso simple, dejaremos que el Render dibuje el Layout de Puck usando la configuración base.

  const puckData = adaptLayoutToPuck(layout);

  return (
    <div className="puck-render-container">
      <Render config={config} data={puckData} />
    </div>
  )
}
