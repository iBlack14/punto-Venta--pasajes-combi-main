import type { SiteBlock } from "@/lib/types"
import { createNode } from "./defaults"
import { SITE_SCHEMA_VERSION, type SiteLayoutV2 } from "./types"

export function migrateLegacyBlocksToV2(blocks: SiteBlock[]): SiteLayoutV2 {
  const nodes = blocks.map((block) => {
    switch (block.type) {
      case "hero": {
        const node = createNode("hero")
        node.props.title = block.title
        node.props.subtitle = block.subtitle
        node.props.image = block.image
        return node
      }
      case "features":
        return createNode("features")
      case "routes_grid":
        return createNode("routes_grid")
      case "text": {
        const node = createNode("text")
        node.props.content = block.content
        return node
      }
      default:
        return createNode("text")
    }
  })

  return {
    schemaVersion: SITE_SCHEMA_VERSION,
    nodes,
  }
}

