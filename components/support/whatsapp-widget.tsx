"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Send, MessageCircle } from "lucide-react"
import { openWhatsApp } from "@/lib/utils/whatsapp-utils"

interface Message {
  id: string
  text: string
  sender: "user" | "bot" | "agent"
  timestamp: Date
}

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Garantizar que el widget inicie cerrado siempre
  useEffect(() => {
    setIsOpen(false)
  }, [])

  // Mensaje inicial informativo (soporte)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        text: "Soporte técnico WJL Turismo. Escríbenos y te ayudamos.",
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length])

  // Respuestas automáticas deshabilitadas: soporte solo mensajería
  const getBotResponse = (_userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("hola") || message.includes("buenos") || message.includes("buenas")) {
      return "¡Hola! 😊 ¿En qué puedo ayudarte? Puedo ayudarte con:\n\n• 🎫 Información sobre boletos\n• 🚐 Horarios y rutas\n• 💰 Precios y promociones\n• 📞 Contactar con un agente"
    }

    if (message.includes("precio") || message.includes("costo") || message.includes("tarifa")) {
      return "💰 **Consulta nuestras tarifas actuales:**\n\nPara conocer los precios más actualizados de nuestras rutas, por favor:\n\n• 💻 Consulta nuestro sistema en línea\n• 📞 Llama al +51 999 123 456\n• 🏢 Visita nuestra oficina\n\n¿Te gustaría que te conecte con un agente?"
    }

    if (message.includes("horario") || message.includes("hora") || message.includes("salida")) {
      return "🕐 **Horarios de salida:**\n\nNuestros horarios varían según la ruta y disponibilidad. Para información actualizada:\n\n• 💻 Consulta nuestro sistema de reservas\n• 📞 Llama al +51 999 123 456\n• 🏢 Visita nuestra oficina en Jr. Principal 123, Huarmaca\n\n¿Necesitas información sobre alguna ruta específica?"
    }

    if (message.includes("reserva") || message.includes("boleto") || message.includes("pasaje")) {
      return "🎫 Para hacer una reserva puedes:\n\n• 💻 Usar nuestro sistema en línea\n• 📞 Llamar al +51 999 123 456\n• 🏢 Visitar nuestra oficina en Jr. Principal 123, Huarmaca\n\n¿Prefieres que te conecte con un agente para ayudarte?"
    }

    if (message.includes("agente") || message.includes("humano") || message.includes("persona")) {
      return "👨‍💼 Te voy a conectar con uno de nuestros agentes. Por favor espera un momento...\n\n⏱️ Tiempo de espera estimado: 2-3 minutos"
    }

    if (message.includes("gracias") || message.includes("thank")) {
      return "¡De nada! 😊 Estoy aquí para ayudarte. Si tienes más preguntas, no dudes en escribirme.\n\n¿Hay algo más en lo que pueda asistirte?"
    }

    if (message.includes("adios") || message.includes("chau") || message.includes("bye")) {
      return "¡Hasta luego! 👋 Que tengas un excelente día. Recuerda que estoy aquí 24/7 para ayudarte con WJL Turismo. 🚐✨"
    }

    // Respuesta por defecto
    return "Gracias por tu mensaje. Un agente de soporte te responderá a la brevedad."
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simular respuesta del bot con delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openWhatsAppDirect = () => {
    const phoneNumber = "+51953576234" // Soporte: Alonso Yoset Huancas Cruz
    const message = "hola alonso nesecito ayuda"
    openWhatsApp(phoneNumber, message)
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-96 shadow-2xl border-2 border-green-500 z-50 flex flex-col">
          {/* Header */}
          <CardHeader className="bg-green-500 text-white p-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <img src="/whatsapp-logo.svg" alt="WhatsApp" className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Soporte Técnico</CardTitle>
                  <div className="flex items-center space-x-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-300" : "bg-gray-300"}`}></div>
                    <span>{isOnline ? "En línea" : "Desconectado"}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-green-600"
                  onClick={() => setIsOpen(false)}
                  title="Cerrar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Support Info Area */}
          <CardContent className="flex-1 p-4">
            <div className="space-y-3 text-sm">
              <p>
                Soporte técnico: <strong>Alonso Yoset Huancas Cruz</strong>
              </p>
              <p>
                Email: <a className="text-blue-600 underline" href="mailto:blxk.busines@gmail.com">blxk.busines@gmail.com</a>
              </p>
              <p>
                WhatsApp: <a className="text-green-600 underline" href="#" onClick={(e) => { e.preventDefault(); openWhatsAppDirect(); }}>+51 953 576 234</a>
              </p>
              <div className="bg-muted rounded p-3">
                <div className="text-xs text-muted-foreground mb-1">Mensaje predeterminado</div>
                <div className="font-medium">"hola alonso nesecito ayuda"</div>
              </div>
              <Button onClick={openWhatsAppDirect} className="bg-green-600 hover:bg-green-700 text-white">
                <Send className="h-4 w-4 mr-2" /> Enviar WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 relative"
          title="Soporte por WhatsApp"
        >
          <img src="/whatsapp-logo.svg" alt="WhatsApp" className="h-6 w-6" />

          {/* Notification badge */}
          {!isOpen && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              1
            </Badge>
          )}

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-green-500/70 animate-ping opacity-20"></div>
        </Button>

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
Soporte técnico: WhatsApp o email
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>

      {/* Quick Actions deshabilitadas: solo mensajes */}
    </>
  )
}
