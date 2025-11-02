import type { Sale } from "@/lib/types"

interface BusManifestProps {
  sales: Sale[]
  driverName: string
  route: string
  date: string
  schedule: string
  printMode?: boolean
}

export function BusManifest({ sales, driverName, route, date, schedule, printMode = false }: BusManifestProps) {
  // Create a grid of 20 seats (4 rows x 5 seats)
  const totalSeats = 20
  const seatsPerRow = 5
  const rows = 4

  const getSeatData = (seatNumber: number) => {
    return sales.find(sale => sale.seatNumber === seatNumber)
  }

  const PassengerCard = ({ seat }: { seat: number }) => {
    const saleData = getSeatData(seat)
    const isOccupied = !!saleData

    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "140px" }}
      >
        <div
          className="rounded-lg border-2 flex flex-col items-center justify-center text-white font-bold text-sm p-3 relative"
          style={{
            backgroundColor: isOccupied ? "#16D05D" : "#E5E7EB",
            borderColor: isOccupied ? "#042333" : "#042333",
            color: isOccupied ? "#FFFFFF" : "#374151",
            width: "240px",
            height: "140px",
            fontSize: "12px",
            lineHeight: "16px"
          }}
        >
          {isOccupied ? (
            <div className="text-center">
              <div style={{ fontSize: "14px", marginBottom: "6px", fontWeight: "700" }}>PASAJERO</div>
              <div style={{ fontSize: "12px", marginBottom: "10px", fontWeight: "400" }}>
                {saleData.passenger.name}
              </div>
              <div style={{ fontSize: "14px", marginBottom: "6px", fontWeight: "700" }}>CONTACTO</div>
              <div style={{ fontSize: "12px" }}>{saleData.passenger.phone}</div>
            </div>
          ) : (
            <div className="text-center">
              {printMode ? (
                <>
                  <div style={{ fontSize: "14px", marginBottom: "6px", fontWeight: "700" }}>PASAJERO</div>
                  <div style={{ fontSize: "12px", marginBottom: "10px", fontWeight: "400", height: "14px" }}>
                    {/* Espacio en blanco para llenar manualmente */}
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "6px", fontWeight: "700" }}>CONTACTO</div>
                  <div style={{ fontSize: "12px", height: "14px" }}>
                    {/* Espacio en blanco para llenar manualmente */}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {seat.toString().padStart(2, '0')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white rounded-lg shadow-lg w-full"
      style={{
        border: "2px solid #16D05D",
        padding: "24px"
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 
          className="font-bold text-black"
          style={{ fontSize: "16px", marginBottom: "16px" }}
        >
          MANIFIESTO
        </h1>
        
        {/* Driver and Route Info */}
        <div className="space-y-2 text-left">
          <div className="flex">
            <span className="font-bold text-black mr-2" style={{ fontSize: "12px" }}>
              Conductor:
            </span>
            <span className="text-black" style={{ fontSize: "12px" }}>
              {driverName}
            </span>
          </div>

          <div className="flex">
            <span className="font-bold text-black mr-2" style={{ fontSize: "12px" }}>
              Ruta:
            </span>
            <span className="text-black" style={{ fontSize: "12px" }}>
              {route}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex">
              <span className="font-bold text-black mr-2" style={{ fontSize: "12px" }}>
                Fecha:
              </span>
              <span className="text-black" style={{ fontSize: "12px" }}>
                {date}
              </span>
            </div>
            <div className="flex">
              <span className="font-bold text-black mr-2" style={{ fontSize: "12px" }}>
                Horario:
              </span>
              <span className="text-black" style={{ fontSize: "12px" }}>
                {schedule}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="space-y-4">
        {/* First Row - Driver and 2 passengers */}
        <div className="grid grid-cols-3 gap-4">
          {/* Driver seat */}
          <div className="flex items-center justify-center">
            <div
              className="rounded-lg border-2 bg-gray-200 flex items-center justify-center"
              style={{
                borderColor: "#042333",
                width: "200px",
                height: "140px"
              }}
            >
              <img
                src="/driver_manifest.svg"
                alt="Driver"
                className="w-16 h-20 object-cover rounded"
              />
            </div>
          </div>
          
          {/* Two passenger seats */}
          <PassengerCard seat={2} />
          <PassengerCard seat={3} />
        </div>

        {/* Second Row - 3 passengers */}
        <div className="grid grid-cols-3 gap-4">
          <PassengerCard seat={4} />
          <PassengerCard seat={5} />
          <PassengerCard seat={6} />
        </div>

        {/* Third Row - 3 passengers */}
        <div className="grid grid-cols-3 gap-4">
          <PassengerCard seat={7} />
          <PassengerCard seat={8} />
          <PassengerCard seat={9} />
        </div>

        {/* Fourth Row - 3 passengers */}
        <div className="grid grid-cols-3 gap-4">
          <PassengerCard seat={10} />
          <PassengerCard seat={11} />
          <PassengerCard seat={12} />
        </div>

        {/* Bottom Row - 4 passengers */}
        <div className="grid grid-cols-4 gap-4">
          <PassengerCard seat={13} />
          <PassengerCard seat={14} />
          <PassengerCard seat={15} />
          <PassengerCard seat={16} />
        </div>
      </div>

      {/* PUERTA TRASERA Label */}
      <div 
        className="flex items-center justify-center mt-8"
        style={{ color: "#75857A", fontSize: "18px", fontWeight: "700" }}
      >
        🚪 PUERTA TRASERA
      </div>
    </div>
  )
}
