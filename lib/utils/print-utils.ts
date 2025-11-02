import type { Sale } from "../types"
import { COMPANY_CONFIG } from "../constants"

interface CompanyInfo {
  name?: string
  phone?: string
  address?: string
  ruc?: string
}

export const printTicket = (sale: Sale, companyInfo?: CompanyInfo) => {
  const company = {
    name: companyInfo?.name || COMPANY_CONFIG.name,
    phone: companyInfo?.phone || COMPANY_CONFIG.phone,
    address: companyInfo?.address || COMPANY_CONFIG.address,
    ruc: companyInfo?.ruc || COMPANY_CONFIG.ruc,
  }

  const currentDate = new Date().toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  // Crear iframe oculto para imprimir
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (iframeDoc) {
    iframeDoc.write(`
      <html>
        <head>
          <title>Boleta - ${sale.id}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              background: white;
              margin: 20px;
              line-height: 1.6;
              color: #000;
            }

            .ticket {
              white-space: pre-line;
              font-size: 14px;
              line-height: 1.8;
              max-width: 600px;
              margin: 0 auto;
            }

            .bold {
              font-weight: bold;
            }

            @media print {
              body {
                margin: 10px;
              }
              .ticket {
                font-size: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">🎫 <span class="bold">BOLETA DE VIAJE - WJL TURISMO</span>

📋 <span class="bold">INFORMACIÓN DEL BOLETO</span>
• N° Boleta: <span class="bold">${sale.id}</span>
• Fecha de emisi��n: ${sale.date}
• Hora de emisión: ${currentDate.split(' ')[1]}
👤 <span class="bold">DATOS DEL PASAJERO</span>
• Nombre: <span class="bold">${sale.passenger.name}</span>
• DNI: ${sale.passenger.dni}
• Teléfono: ${sale.passenger.phone || "No registrado"}
🚌 <span class="bold">DETALLES DEL VIAJE</span>
• Ruta: <span class="bold">${sale.route.from} → ${sale.route.to}</span>
• Fecha de viaje: <span class="bold">${sale.date}</span>
• Horario de salida: <span class="bold">${sale.schedule}</span>
• Asiento asignado: <span class="bold">${sale.seatNumber.toString().padStart(2, "0")}</span>
💰 <span class="bold">INFORMACIÓN DE PAGO</span>
• Total pagado: <span class="bold">S/ ${sale.total.toFixed(2)}</span>
• Estado: ✅ Pagado
📍 <span class="bold">INSTRUCCIONES IMPORTANTES</span>
• Llegue 15 minutos antes de la hora de salida
• Presente su DNI al abordar
• Conserve este mensaje como comprobante
• Para consultas: ${company.phone}
¡Gracias por elegir ${company.name}! 🚐✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Impreso el: ${currentDate}
${company.address} • RUC: ${company.ruc}
━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
        </body>
      </html>
    `)
    iframeDoc.close()

    // Esperar a que se cargue y luego imprimir
    iframe.onload = () => {
      iframe.contentWindow?.print()
      
      // Remover el iframe después de imprimir
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 100)
    }
  }
}
