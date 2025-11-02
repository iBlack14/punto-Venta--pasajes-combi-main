"use client"

import { User } from "lucide-react"
import type { SeatMap } from "@/lib/types"
import { getOccupiedSeats, isSeatAvailable, getAvailableSeatsCount } from "@/lib/utils/seat-utils"
import { COMPANY_CONFIG } from "@/lib/constants"

interface SeatSelectorProps {
  seatMap: SeatMap
  selectedDate: string
  selectedRoute: string
  selectedSchedule: string
  selectedSeat: number | null
  onSeatSelect: (seatNumber: number) => void
}

export function SeatSelector({
  seatMap,
  selectedDate,
  selectedRoute,
  selectedSchedule,
  selectedSeat,
  onSeatSelect,
}: SeatSelectorProps) {
  if (!selectedDate || !selectedRoute || !selectedSchedule) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Seleccione fecha, ruta y horario para ver los asientos disponibles
      </div>
    )
  }

  const occupiedSeats = getOccupiedSeats(seatMap, selectedDate, selectedRoute, selectedSchedule)
  const availableCount = getAvailableSeatsCount(seatMap, selectedDate, selectedRoute, selectedSchedule)

  const renderSeat = (seatNumber: number, isWide = false) => {
    const isOccupied = !!occupiedSeats[seatNumber]
    const isConductor = seatNumber === COMPANY_CONFIG.conductorSeat
    const isSelected = selectedSeat === seatNumber
    const isAvailable = isSeatAvailable(seatMap, seatNumber, selectedDate, selectedRoute, selectedSchedule)

    let bgColor = "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
    const textColor = "text-white"
    let cursor = "cursor-pointer"
    let content = null

    if (isConductor) {
      bgColor = "bg-muted"
      cursor = "cursor-not-allowed"
      content = <User className="h-3 w-3" />
    } else if (isOccupied) {
      bgColor = "bg-red-500 dark:bg-red-600"
      cursor = "cursor-not-allowed"
      // Mostrar las iniciales del nombre del pasajero
      const passengerName = occupiedSeats[seatNumber]?.passenger.name || ""
      const initials = passengerName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase()
      content = <span className="text-xs font-bold">{initials}</span>
    } else if (isSelected) {
      bgColor = "bg-blue-500 dark:bg-blue-600"
      content = <span className="text-xs font-bold">{seatNumber.toString().padStart(2, "0")}</span>
    } else {
      content = <span className="text-xs font-bold">{seatNumber.toString().padStart(2, "0")}</span>
    }

    return (
      <button
        key={seatNumber}
        onClick={() => !isConductor && !isOccupied && onSeatSelect(seatNumber)}
        className={`
        ${isWide ? "w-16" : "w-12"} h-12 rounded-lg flex items-center justify-center
        ${bgColor} ${textColor} ${cursor} transition-colors border-2 border-border
      `}
        disabled={isConductor || isOccupied}
        title={
          isConductor
            ? "Asiento del conductor"
            : isOccupied
              ? `Ocupado por: ${occupiedSeats[seatNumber]?.passenger.name} (DNI: ${occupiedSeats[seatNumber]?.passenger.dni})`
              : `Asiento ${seatNumber.toString().padStart(2, "0")}`
        }
      >
        {content}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Seleccionar Asiento</h3>
        <div className="text-sm text-muted-foreground">
          Disponibles: {availableCount}/{COMPANY_CONFIG.passengerSeats}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center space-x-4 text-xs flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 dark:bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
          </div>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-muted rounded"></div>
          <span>Conductor</span>
        </div>
      </div>

      {/* Layout de la combi */}
      <div className="relative bg-gradient-to-b from-green-400 to-green-500 dark:from-green-600 dark:to-green-700 rounded-3xl mx-auto" style={{ maxWidth: "253px", padding: "24px 0 24px 24px" }}>
        {/* Bordes de la combi */}
        <div className="absolute inset-2 bg-background rounded-2xl" style={{ width: "236px" }}></div>

        {/* Contenido de la combi */}
        <div className="relative z-10 space-y-4">
          {/* Frente de la combi */}
          <div className="text-center text-sm font-medium text-muted-foreground" style={{ margin: "0 auto 8px -2px" }}>🚐 FRENTE</div>

          {/* Fila 1: Conductor y asientos 2, 3 */}
          <div className="flex justify-start px-2" style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Conductor (semicírculo) */}
            <div className="flex items-center">
              <div className="w-16 h-12 bg-muted rounded-full border-2 border-border flex items-center justify-center">
                <button
                  className="w-12 h-8 rounded-full bg-muted text-muted-foreground text-xs font-bold cursor-not-allowed flex items-center justify-center"
                  disabled={true}
                  title="Conductor"
                >
                  <User className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Asientos 2 y 3 */}
            <div className="flex">
              <div style={{ marginLeft: "25px" }}>{renderSeat(2)}</div>
              <div style={{ marginLeft: "13px" }}>{renderSeat(3)}</div>
            </div>
          </div>

          {/* Fila 2: Asientos 4, 5, 6 */}
          <div className="flex justify-start" style={{ alignItems: "flex-start" }}>
            {renderSeat(4)}
            <div style={{ marginLeft: "3px" }}>{renderSeat(5)}</div>
            <div style={{ marginLeft: "2px" }}>{renderSeat(6)}</div>
          </div>

          {/* Fila 3: Asientos 7, 8 (izquierda) y 9 (derecha) */}
          <div className="flex justify-start px-2" style={{ alignItems: "flex-start" }}>
            <div className="flex">
              <div style={{ marginLeft: "-5px" }}>{renderSeat(7)}</div>
              <div style={{ marginLeft: "3px" }}>{renderSeat(8)}</div>
            </div>
            <div style={{ marginLeft: "50px" }}>{renderSeat(9)}</div>
          </div>

          {/* Fila 4: Asientos 10, 11 (izquierda) y 12 (derecha) */}
          <div className="flex justify-start items-center px-2" style={{ marginTop: "9px" }}>
            <div className="flex">
              <div style={{ margin: "-1px 0 0 -5px" }}>{renderSeat(10)}</div>
              <div style={{ marginLeft: "3px" }}>{renderSeat(11)}</div>
            </div>
            <div style={{ marginLeft: "51px" }}>
              {renderSeat(12)}
            </div>
          </div>

          {/* Fila 5: Asientos traseros 13, 14, 15, 16 (banco corrido) */}
          <div className="flex justify-start pt-2" style={{ alignItems: "flex-start", marginTop: "3px" }}>
            {renderSeat(13)}
            <div style={{ marginLeft: "4px" }}>
              <button
                key={14}
                onClick={() => onSeatSelect(14)}
                className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white cursor-pointer transition-colors border-2 border-border"
                title="Asiento 14"
              >
                <span className="text-xs font-bold" style={{ marginLeft: "2px" }}>14</span>
              </button>
            </div>
            <div style={{ marginLeft: "3px" }}>{renderSeat(15)}</div>
            <div style={{ marginLeft: "3px" }}>{renderSeat(16)}</div>
          </div>

          {/* Parte trasera */}
          <div className="text-center text-sm text-muted-foreground" style={{ margin: "16px 0 0 -4px" }}>🚪 PUERTA TRASERA</div>
        </div>

        {/* Elementos decorativos laterales (ventanas) */}
        <div className="absolute left-1 top-1/4 space-y-1">
          <div className="w-2 h-3 bg-purple-400 rounded-sm"></div>
          <div className="w-2 h-3 bg-orange-400 rounded-sm"></div>
          <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
          <div className="w-2 h-3 bg-green-600 rounded-sm"></div>
        </div>

        <div className="absolute right-1 top-1/2 space-y-1">
          <div className="w-2 h-3 bg-green-600 rounded-sm"></div>
          <div className="w-2 h-3 bg-yellow-400 rounded-sm"></div>
          <div className="w-2 h-3 bg-orange-400 rounded-sm"></div>
          <div className="w-2 h-3 bg-purple-400 rounded-sm"></div>
        </div>
      </div>

      {selectedSeat && (
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Asiento seleccionado: <strong>{selectedSeat.toString().padStart(2, "0")}</strong>
          </p>
        </div>
      )}

      {/* Lista de pasajeros ocupados */}
      {Object.keys(occupiedSeats).length > 0 && (
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Pasajeros en este viaje:</h4>
          <div className="space-y-1 text-xs">
            {Object.entries(occupiedSeats)
              .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
              .map(([seatNum, sale]) => (
                <div key={seatNum} className="flex justify-between items-center">
                  <span>Asiento {seatNum.padStart(2, "0")}:</span>
                  <span className="font-medium">{sale?.passenger.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
