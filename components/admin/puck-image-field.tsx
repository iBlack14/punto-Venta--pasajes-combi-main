import { useState, useRef } from "react"
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react"

export const PuckImageField = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) {
            alert("Por favor selecciona una imagen válida.")
            return
        }

        try {
            setIsUploading(true)
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/site/assets/upload", {
                method: "POST",
                body: formData,
            })

            const data = await res.json()
            if (data.success && data.url) {
                onChange(data.url)
            } else {
                alert("Hubo un error al subir la imagen: " + data.error)
            }
        } catch (e) {
            alert("Error de conexión al subir la imagen.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {value ? (
                <div className="relative group rounded-md overflow-hidden border border-slate-200">
                    <img src={value} alt="Preview" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button title="Cambiar imagen" onClick={(e) => { e.preventDefault(); onChange(""); }} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-105 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setDragActive(false)
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleUpload(e.dataTransfer.files[0])
                        }
                    }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0])
                        }}
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-blue-600">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium">Subiendo...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            <div>
                                <span className="text-sm font-semibold text-blue-600 hover:text-blue-500">Haz clic para subir</span>
                                <span className="text-sm"> o arrastra una imagen</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center gap-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">O usa un Enlace URL</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
        </div>
    )
}
