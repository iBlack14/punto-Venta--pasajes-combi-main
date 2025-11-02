"use client"

import { useEffect } from "react"

export function ResizeObserverWorkaround() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("ResizeObserver loop completed with undelivered notifications")) {
        return
      }
      if (typeof args[0] === "string" && args[0].includes("ResizeObserver loop limit exceeded")) {
        return
      }
      originalConsoleError(...args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  return null
}
