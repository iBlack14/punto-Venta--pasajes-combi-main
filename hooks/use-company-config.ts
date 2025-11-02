import { useCompanyInfo } from './use-company-info'
import { COMPANY_CONFIG } from '@/lib/constants'

export function useCompanyConfig() {
  const { companyInfo, loading } = useCompanyInfo()

  const config = {
    name: companyInfo?.name || COMPANY_CONFIG.name,
    ruc: companyInfo?.ruc || COMPANY_CONFIG.ruc,
    address: companyInfo?.address || COMPANY_CONFIG.address,
    phone: companyInfo?.phone || COMPANY_CONFIG.phone,
    totalSeats: COMPANY_CONFIG.totalSeats,
    passengerSeats: COMPANY_CONFIG.passengerSeats,
    conductorSeat: COMPANY_CONFIG.conductorSeat,
    business_name: companyInfo?.business_name,
    email: companyInfo?.email,
    website: companyInfo?.website,
    logo_url: companyInfo?.logo_url,
    description: companyInfo?.description,
  }

  return { config, loading, companyInfo }
}
