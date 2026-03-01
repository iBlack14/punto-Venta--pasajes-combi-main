import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import type { SiteBlock } from "@/lib/types"

export function useSiteSettings() {
    const [blocks, setBlocks] = useState<SiteBlock[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [settingsId, setSettingsId] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from("site_settings")
                .select("id, blocks")
                .order("updated_at", { ascending: false })
                .limit(1)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows found, normal if empty
                    setBlocks([])
                    setSettingsId(null)
                } else {
                    console.error("Error fetching site settings:", error)
                    setError(error.message)
                }
            } else if (data) {
                setBlocks(data.blocks as SiteBlock[])
                setSettingsId(data.id)
            }
        } catch (err: any) {
            console.error("Unexpected error fetching site settings:", err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const saveSettings = async (newBlocks: SiteBlock[]) => {
        try {
            setIsLoading(true)

            let error = null

            if (settingsId) {
                // Update existing
                const result = await supabase
                    .from("site_settings")
                    .update({ blocks: newBlocks, updated_at: new Date().toISOString() })
                    .eq("id", settingsId)

                error = result.error
            } else {
                // Create new
                const result = await supabase
                    .from("site_settings")
                    .insert([{ blocks: newBlocks }])
                    .select("id")
                    .single()

                error = result.error
                if (result.data) {
                    setSettingsId(result.data.id)
                }
            }

            if (error) {
                console.error("Error saving site settings:", error)
                throw new Error(error.message)
            }

            setBlocks(newBlocks)
            return true
        } catch (err: any) {
            console.error("Unexpected error saving site settings:", err)
            setError(err.message)
            return false
        } finally {
            setIsLoading(false)
        }
    }

    return {
        blocks,
        isLoading,
        error,
        saveSettings,
        refresh: fetchSettings
    }
}
