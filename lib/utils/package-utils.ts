import type { Package } from "../types"

export const printPackageLabel = (pkg: Package) => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const labelContent = `
    <html>
      <head>
        <title>Etiqueta de Encomienda - ${pkg.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .label {
            width: 400px;
            border: 2px solid #000;
            padding: 15px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
          }
          .package-id {
            font-size: 18px;
            font-weight: bold;
            background: #000;
            color: white;
            padding: 5px 10px;
            margin: 10px 0;
            text-align: center;
          }
          .section {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ccc;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
          }
          .route-info {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            background: #f3f4f6;
            padding: 10px;
            margin: 10px 0;
          }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            letter-spacing: 2px;
            margin: 15px 0;
            padding: 10px;
            background: #f9f9f9;
            border: 1px dashed #666;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            margin-top: 15px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .label { width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <div class="company-name">WJL TURISMO</div>
            <div>Sistema de Encomiendas</div>
            <div class="package-id">${pkg.id}</div>
          </div>

          <div class="route-info">
            ${pkg.route.from} ➜ ${pkg.route.to}
            <br>
            <small>Horario: ${pkg.schedule} | Fecha: ${pkg.date}</small>
          </div>

          <div class="section">
            <div class="section-title">📤 Remitente</div>
            <div class="info-row">
              <span><strong>Nombre:</strong> ${pkg.sender.name}</span>
            </div>
            <div class="info-row">
              <span><strong>DNI:</strong> ${pkg.sender.dni}</span>
              <span><strong>Tel:</strong> ${pkg.sender.phone || "N/A"}</span>
            </div>
            ${pkg.sender.address ? `<div class="info-row"><span><strong>Dir:</strong> ${pkg.sender.address}</span></div>` : ""}
          </div>

          <div class="section">
            <div class="section-title">📥 Destinatario</div>
            <div class="info-row">
              <span><strong>Nombre:</strong> ${pkg.receiver.name}</span>
            </div>
            <div class="info-row">
              <span><strong>DNI:</strong> ${pkg.receiver.dni}</span>
              <span><strong>Tel:</strong> ${pkg.receiver.phone || "N/A"}</span>
            </div>
            ${pkg.receiver.address ? `<div class="info-row"><span><strong>Dir:</strong> ${pkg.receiver.address}</span></div>` : ""}
          </div>

          <div class="section">
            <div class="section-title">📦 Detalles del Paquete</div>
            <div class="info-row">
              <span><strong>Peso:</strong> ${pkg.weight} kg</span>
              <span><strong>Total:</strong> S/ ${pkg.total.toFixed(2)}</span>
            </div>
            ${pkg.dimensions ? `<div class="info-row"><span><strong>Dimensiones:</strong> ${pkg.dimensions}</span></div>` : ""}
            <div class="info-row">
              <span><strong>Valor:</strong> S/ ${pkg.value.toFixed(2)}</span>
              <span><strong>Estado:</strong> ${pkg.status}</span>
            </div>
            <div style="margin-top: 8px;">
              <strong>Contenido:</strong> ${pkg.description}
            </div>
          </div>

          <div class="section">
            <div class="section-title">🚛 Conductor</div>
            <div class="info-row">
              <span><strong>Nombre:</strong> ${pkg.driver.name}</span>
            </div>
            <div class="info-row">
              <span><strong>Licencia:</strong> ${pkg.driver.license}</span>
              <span><strong>Tel:</strong> ${pkg.driver.phone}</span>
            </div>
          </div>

          <div class="barcode">
            ||||| ${pkg.id} |||||
          </div>

          ${
            pkg.notes
              ? `
            <div class="section">
              <div class="section-title">📝 Notas</div>
              <div>${pkg.notes}</div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <div>Impreso el: ${new Date().toLocaleString()}</div>
            <div>WJL Turismo - Av. Principal 123, Huarmaca, Piura</div>
            <div>Tel: +51 987 654 321 | www.wjlturismo.com</div>
          </div>
        </div>
      </body>
    </html>
  `

  printWindow.document.write(labelContent)
  printWindow.document.close()
  printWindow.print()
}
