import { SITE_SCHEMA_VERSION, type BuilderNode, type PageSlug, type SiteLayoutV2 } from "./types"

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createNode(type: BuilderNode["type"]): BuilderNode {
  switch (type) {
    case "hero":
      return {
        id: id("hero"),
        type: "hero",
        props: {
          title: "Viaja Seguro y Puntual",
          subtitle: "Compra tus pasajes y encomiendas en minutos.",
          image:
            "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop",
          ctaText: "Buscar Pasajes",
        },
      }
    case "text":
      return {
        id: id("text"),
        type: "text",
        props: {
          content: "Agrega tu contenido aquí.",
        },
      }
    case "image":
      return {
        id: id("image"),
        type: "image",
        props: {
          src: "/placeholder.svg",
          alt: "Imagen",
        },
      }
    case "button":
      return {
        id: id("button"),
        type: "button",
        props: {
          text: "Contáctanos",
          href: "/contacto",
        },
      }
    case "features":
      return {
        id: id("features"),
        type: "features",
        props: {
          title: "¿Por qué viajar con nosotros?",
        },
      }
    case "routes_grid":
      return {
        id: id("routes"),
        type: "routes_grid",
        props: {
          title: "Rutas Disponibles",
          maxItems: 6,
        },
      }
    case "section":
    default:
      return {
        id: id("section"),
        type: "section",
        props: {
          title: "Nueva Sección",
        },
        children: [],
      }
  }
}

export function defaultLayoutForSlug(slug: PageSlug): SiteLayoutV2 {
  if (slug === "inicio") {
    return {
      schemaVersion: SITE_SCHEMA_VERSION,
      nodes: [createNode("hero"), createNode("features"), createNode("routes_grid"), createNode("text")],
    }
  }

  if (slug === "nosotros") {
    const heading = createNode("text")
    heading.props.content = "Somos una empresa de transporte con enfoque en seguridad y puntualidad."
    return {
      schemaVersion: SITE_SCHEMA_VERSION,
      nodes: [createNode("hero"), heading, createNode("features")],
    }
  }

  const intro = createNode("text")
  intro.props.content = "Contáctanos para reservas, encomiendas y soporte."
  const button = createNode("button")
  button.props.text = "Ir al Portal de Administración"
  button.props.href = "/admin"

  return {
    schemaVersion: SITE_SCHEMA_VERSION,
    nodes: [intro, button],
  }
}

