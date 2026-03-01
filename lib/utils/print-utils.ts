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

  // Abrir ventana de vista previa
  const printWindow = window.open("", "_blank", "width=400,height=600")
  if (!printWindow) return

  const seatStr = sale.seatNumber?.toString().padStart(2, "0") || "00"
  const totalStr = sale.total ? sale.total.toFixed(2) : "0.00"

  const ticketContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Boleta - ${sale.id}</title>
        <style>
          * {
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace;
          }
          body {
            margin: 0;
            padding: 0;
            background: #f4f4f4;
            color: #000;
            display: flex;
            justify-content: center;
          }
          .ticket-container {
            background: #fff;
            width: 100%;
            max-width: 300px; /* Tamaño ideal para ticketeras térmicas (80mm) */
            padding: 15px;
            font-size: 13px;
            line-height: 1.4;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1, h2, h3, p {
            margin: 0 0 8px 0;
          }
          .center {
            text-align: center;
          }
          .bold {
            font-weight: bold;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .col-left {
            text-align: left;
            flex: 1;
            padding-right: 5px;
          }
          .col-right {
            text-align: right;
            font-weight: bold;
          }
          .large-text {
            font-size: 16px;
          }
          .xl-text {
            font-size: 20px;
          }
          
          /* Esconder fondo gris y forzar medidas al imprimir */
          @media print {
            body { 
              background: #fff; 
              margin: 0; 
              padding: 0; 
              align-items: flex-start; 
              justify-content: flex-start; 
            }
            .ticket-container { 
              width: 100%; 
              max-width: 100%; 
              padding: 5px; 
              margin-top: 0;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="center">
            <h2 class="bold" style="font-size: 20px; margin-bottom: 4px;">${company.name}</h2>
            <p>RUC: ${company.ruc}</p>
            <p>${company.address}</p>
            <p>Tel: ${company.phone}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="center">
            <h3 class="bold">BOLETA DE VIAJE</h3>
            <p>${sale.id}</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span class="col-left">Fecha Viaje:</span>
            <span class="col-right">${sale.date}</span>
          </div>
          <div class="row">
            <span class="col-left">Fecha Emisión:</span>
            <span class="col-right">${currentDate.split(' ')[0]}</span>
          </div>
          <div class="row">
            <span class="col-left">Hora Emisión:</span>
            <span class="col-right">${currentDate.split(' ')[1]}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="bold" style="margin-bottom: 4px;">DATOS DEL PASAJERO:</div>
          <div class="row">
            <span class="col-left" style="text-transform: uppercase;">${sale.passenger.name}</span>
          </div>
          <div class="row">
            <span class="col-left">DNI:</span>
            <span class="col-right">${sale.passenger.dni}</span>
          </div>
          ${sale.passenger.phone ? `<div class="row"><span class="col-left">Teléfono:</span><span class="col-right">${sale.passenger.phone}</span></div>` : ''}
          
          <div class="divider"></div>
          
          <div class="center bold large-text" style="font-size: 15px; margin: 10px 0;">
            ${sale.route.from} ➔ ${sale.route.to}
          </div>
          
          <div class="row">
            <span class="col-left">Salida:</span>
            <span class="col-right xl-text">${sale.schedule}</span>
          </div>
          <div class="row">
            <span class="col-left" style="padding-top: 4px;">Asiento N°:</span>
            <span class="col-right xl-text">${seatStr}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span class="col-left bold" style="padding-top: 2px;">TOTAL PAGADO:</span>
            <span class="col-right bold xl-text">S/ ${totalStr}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="center" style="font-size: 11px;">
            <p class="bold">¡Gracias por su preferencia!</p>
            <p style="margin-bottom: 2px;">• Preséntese 15 min antes del viaje.</p>
            <p style="margin-bottom: 2px;">• Presente su DNI al abordar.</p>
            <p style="margin: 10px 0;">Impreso: ${currentDate}</p>
          </div>
        </div>
        
        <script>
          // Esperamos medio segundo para que renderice todo y lanzamos ventana de impresion
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(ticketContent)
  printWindow.document.close()
}
