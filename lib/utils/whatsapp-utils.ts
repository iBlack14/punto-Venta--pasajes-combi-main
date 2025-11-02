import type { Sale, Package } from "../types"
import { COMPANY_CONFIG } from "../constants"

interface CompanyInfo {
  name?: string
  phone?: string
}

// Función para validar y formatear números de teléfono peruanos
export function formatPhoneNumber(phone: string): string {
  // Remover espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-$$$$]/g, "")

  // Si empieza con +51, mantenerlo
  if (cleaned.startsWith("+51")) {
    return cleaned
  }

  // Si empieza con 51, agregar +
  if (cleaned.startsWith("51") && cleaned.length === 11) {
    return `+${cleaned}`
  }

  // Si es un número de 9 dígitos, agregar +51
  if (cleaned.length === 9 && cleaned.startsWith("9")) {
    return `+51${cleaned}`
  }

  // Devolver el número original si no se puede formatear
  return phone
}

// Función para validar número de teléfono peruano
export function isValidPeruvianPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  // Validar formato +51 seguido de 9 dígitos que empiecen con 9
  const regex = /^\+51[9]\d{8}$/
  return regex.test(formatted)
}

// Función para generar mensaje de boleta
export function generateTicketMessage(sale: Sale, companyInfo?: CompanyInfo): string {
  const company = {
    name: companyInfo?.name || COMPANY_CONFIG.name,
    phone: companyInfo?.phone || COMPANY_CONFIG.phone,
  }
  const message = `🎫 *BOLETA DE VIAJE - ${company.name}*

📋 *INFORMACIÓN DEL BOLETO*
• N° Boleta: *${sale.id}*
• Fecha de emisión: ${sale.date}
• Hora de emisión: ${sale.time}

👤 *DATOS DEL PASAJERO*
• Nombre: *${sale.passenger.name}*
• DNI: ${sale.passenger.dni}
• Teléfono: ${sale.passenger.phone || "No registrado"}

🚌 *DETALLES DEL VIAJE*
• Ruta: *${sale.route.from} → ${sale.route.to}*
• Fecha de viaje: *${sale.date}*
• Horario de salida: *${sale.schedule}*
• Asiento asignado: *${sale.seatNumber.toString().padStart(2, "0")}*

👨‍✈️ *CONDUCTOR ASIGNADO*
• Nombre: ${sale.driver.name}
• Licencia: ${sale.driver.license}
• Contacto: ${sale.driver.phone}

💰 *INFORMACIÓN DE PAGO*
• Total pagado: *S/ ${sale.total.toFixed(2)}*
• Estado: ✅ ${sale.status}

📍 *INSTRUCCIONES IMPORTANTES*
• Llegue 15 minutos antes de la hora de salida
• Presente su DNI al abordar
• Conserve este mensaje como comprobante
• Para consultas: ${company.phone}

¡Gracias por elegir ${company.name}! 🚐✨`

  return message
}

// Función para generar mensaje de encomienda
export function generatePackageMessage(pkg: Package, companyInfo?: CompanyInfo): string {
  const company = {
    name: companyInfo?.name || COMPANY_CONFIG.name,
    phone: companyInfo?.phone || COMPANY_CONFIG.phone,
  }
  const message = `📦 *ENCOMIENDA - ${company.name}*

📋 *INFORMACIÓN DE LA ENCOMIENDA*
• Código: *${pkg.id}*
• Fecha de registro: ${pkg.date}
• Hora de registro: ${pkg.time}

📤 *REMITENTE*
• Nombre: *${pkg.sender.name}*
• DNI: ${pkg.sender.dni}
• Teléfono: ${pkg.sender.phone}
• Dirección: ${pkg.sender.address}

📥 *DESTINATARIO*
• Nombre: *${pkg.receiver.name}*
• DNI: ${pkg.receiver.dni}
• Teléfono: ${pkg.receiver.phone}
• Dirección: ${pkg.receiver.address}

🚌 *DETALLES DEL ENVÍO*
• Ruta: *${pkg.route.from} → ${pkg.route.to}*
• Horario: *${pkg.schedule}*
• Descripción: ${pkg.description}
• Peso: ${pkg.weight} kg
• Dimensiones: ${pkg.dimensions}
• Valor declarado: S/ ${pkg.value.toFixed(2)}

👨‍✈️ *CONDUCTOR ASIGNADO*
• Nombre: ${pkg.driver.name}
• Licencia: ${pkg.driver.license}
• Contacto: ${pkg.driver.phone}

💰 *INFORMACIÓN DE PAGO*
• Total: *S/ ${pkg.total.toFixed(2)}*
• Estado: ${pkg.status === "Pendiente" ? "⏳" : pkg.status === "Pagado" ? "✅" : pkg.status === "En Tránsito" ? "🚛" : "📦"} ${pkg.status}

📍 *INSTRUCCIONES*
• Conserve este código para el seguimiento
• El destinatario debe presentar DNI para recoger
• Para consultas: ${company.phone}

¡Gracias por confiar en ${company.name}! 📦✨`

  return message
}

export function openWhatsApp(phone: string, message: string) {
  const formatted = formatPhoneNumber(phone)
  openWhatsAppPreferDesktop(formatted, message)
}

function openWhatsAppPreferDesktop(formattedPhone: string, message: string) {
  const numericPhone = formattedPhone.replace(/\D/g, "")
  const encoded = encodeURIComponent(message)
  const schemeUrl = `whatsapp://send?phone=${numericPhone}&text=${encoded}`
  const webDesktopUrl = `https://web.whatsapp.com/send?phone=${numericPhone}&text=${encoded}`
  const webMobileUrl = `https://wa.me/${numericPhone}?text=${encoded}`

  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Windows Phone/i.test(navigator.userAgent)

  if (isMobile) {
    window.location.href = schemeUrl
    setTimeout(() => {
      window.open(webMobileUrl, "_blank")
    }, 1200)
    return
  }

  let didLaunch = false
  const onBlur = () => {
    didLaunch = true
  }
  window.addEventListener("blur", onBlur, { once: true })

  const popup = window.open(schemeUrl)
  try {
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = schemeUrl
    document.body.appendChild(iframe)
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 1500)
  } catch {}

  setTimeout(() => {
    if (!didLaunch) {
      window.open(webDesktopUrl, "_blank")
    }
    window.removeEventListener("blur", onBlur)
  }, 1400)
}

// Función para enviar boleta por WhatsApp
export function sendTicketViaWhatsApp(sale: Sale, customPhone?: string, customMessage?: string): void {
  const phone = customPhone || sale.passenger.phone

  if (!phone) {
    alert("No se puede enviar: el pasajero no tiene número de teléfono registrado")
    return
  }

  const formattedPhone = formatPhoneNumber(phone)

  if (!isValidPeruvianPhone(formattedPhone)) {
    if (!confirm(`El número ${phone} no parece ser un número peruano válido. ¿Desea continuar?`)) {
      return
    }
  }

  const message = customMessage || generateTicketMessage(sale)
  openWhatsAppPreferDesktop(formattedPhone, message)
}

// Función para enviar encomienda por WhatsApp
export function sendPackageLabelViaWhatsApp(pkg: Package, customPhone?: string): void {
  const phone = customPhone || pkg.sender.phone

  if (!phone) {
    alert("No se puede enviar: no hay número de teléfono registrado")
    return
  }

  const formattedPhone = formatPhoneNumber(phone)

  if (!isValidPeruvianPhone(formattedPhone)) {
    if (!confirm(`El número ${phone} no parece ser un número peruano válido. ¿Desea continuar?`)) {
      return
    }
  }

  const message = generatePackageMessage(pkg)
  openWhatsAppPreferDesktop(formattedPhone, message)
}

// Función para envío masivo de boletas
export function sendBulkTicketsViaWhatsApp(sales: Sale[], onProgress?: (current: number, total: number) => void): void {
  const salesWithPhone = sales.filter((sale) => sale.passenger.phone)

  if (salesWithPhone.length === 0) {
    alert("No hay boletas con números de teléfono para enviar")
    return
  }

  if (!confirm(`¿Está seguro que desea enviar ${salesWithPhone.length} boletas por WhatsApp?`)) {
    return
  }

  let currentIndex = 0

  const sendNext = () => {
    if (currentIndex >= salesWithPhone.length) {
      alert(`Envío masivo completado: ${salesWithPhone.length} boletas enviadas`)
      return
    }

    const sale = salesWithPhone[currentIndex]
    sendTicketViaWhatsApp(sale)

    currentIndex++
    onProgress?.(currentIndex, salesWithPhone.length)

    // Delay de 1 segundo entre env��os para evitar spam
    setTimeout(sendNext, 1000)
  }

  sendNext()
}
