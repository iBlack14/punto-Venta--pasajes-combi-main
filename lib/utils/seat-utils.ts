import type { SeatMap } from "../types"
import { COMPANY_CONFIG } from "../constants"

export const getSeatMapKey = (date: string, routeId: string, schedule: string) => {
  return `${date}-${routeId}-${schedule}`
}

export const getOccupiedSeats = (seatMap: SeatMap, date: string, routeId: string, schedule: string) => {
  const key = getSeatMapKey(date, routeId, schedule)
  return seatMap[key] || {}
}

export const isSeatAvailable = (
  seatMap: SeatMap,
  seatNumber: number,
  date: string,
  routeId: string,
  schedule: string,
) => {
  if (seatNumber === COMPANY_CONFIG.conductorSeat) return false
  const occupiedSeats = getOccupiedSeats(seatMap, date, routeId, schedule)
  return !occupiedSeats[seatNumber]
}

export const getAvailableSeatsCount = (seatMap: SeatMap, date: string, routeId: string, schedule: string) => {
  let available = 0
  for (let i = 2; i <= COMPANY_CONFIG.totalSeats; i++) {
    if (isSeatAvailable(seatMap, i, date, routeId, schedule)) {
      available++
    }
  }
  return available
}
