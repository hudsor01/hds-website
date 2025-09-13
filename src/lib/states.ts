// US States tax information for 2025
import type { StateInfo } from '@/types/paystub'

// States with NO income tax (9 states)
export const NO_INCOME_TAX_STATES: StateInfo[] = [
  { name: 'Alaska', code: 'AK', hasIncomeTax: false },
  { name: 'Florida', code: 'FL', hasIncomeTax: false },
  { name: 'Nevada', code: 'NV', hasIncomeTax: false },
  { name: 'New Hampshire', code: 'NH', hasIncomeTax: false },
  { name: 'South Dakota', code: 'SD', hasIncomeTax: false },
  { name: 'Tennessee', code: 'TN', hasIncomeTax: false },
  { name: 'Texas', code: 'TX', hasIncomeTax: false },
  { name: 'Washington', code: 'WA', hasIncomeTax: false },
  { name: 'Wyoming', code: 'WY', hasIncomeTax: false }
]

// States WITH income tax (41 states + DC)
export const INCOME_TAX_STATES: StateInfo[] = [
  { name: 'Alabama', code: 'AL', hasIncomeTax: true },
  { name: 'Arizona', code: 'AZ', hasIncomeTax: true },
  { name: 'Arkansas', code: 'AR', hasIncomeTax: true },
  { name: 'California', code: 'CA', hasIncomeTax: true },
  { name: 'Colorado', code: 'CO', hasIncomeTax: true },
  { name: 'Connecticut', code: 'CT', hasIncomeTax: true },
  { name: 'Delaware', code: 'DE', hasIncomeTax: true },
  { name: 'District of Columbia', code: 'DC', hasIncomeTax: true },
  { name: 'Georgia', code: 'GA', hasIncomeTax: true },
  { name: 'Hawaii', code: 'HI', hasIncomeTax: true },
  { name: 'Idaho', code: 'ID', hasIncomeTax: true },
  { name: 'Illinois', code: 'IL', hasIncomeTax: true },
  { name: 'Indiana', code: 'IN', hasIncomeTax: true },
  { name: 'Iowa', code: 'IA', hasIncomeTax: true },
  { name: 'Kansas', code: 'KS', hasIncomeTax: true },
  { name: 'Kentucky', code: 'KY', hasIncomeTax: true },
  { name: 'Louisiana', code: 'LA', hasIncomeTax: true },
  { name: 'Maine', code: 'ME', hasIncomeTax: true },
  { name: 'Maryland', code: 'MD', hasIncomeTax: true },
  { name: 'Massachusetts', code: 'MA', hasIncomeTax: true },
  { name: 'Michigan', code: 'MI', hasIncomeTax: true },
  { name: 'Minnesota', code: 'MN', hasIncomeTax: true },
  { name: 'Mississippi', code: 'MS', hasIncomeTax: true },
  { name: 'Missouri', code: 'MO', hasIncomeTax: true },
  { name: 'Montana', code: 'MT', hasIncomeTax: true },
  { name: 'Nebraska', code: 'NE', hasIncomeTax: true },
  { name: 'New Jersey', code: 'NJ', hasIncomeTax: true },
  { name: 'New Mexico', code: 'NM', hasIncomeTax: true },
  { name: 'New York', code: 'NY', hasIncomeTax: true },
  { name: 'North Carolina', code: 'NC', hasIncomeTax: true },
  { name: 'North Dakota', code: 'ND', hasIncomeTax: true },
  { name: 'Ohio', code: 'OH', hasIncomeTax: true },
  { name: 'Oklahoma', code: 'OK', hasIncomeTax: true },
  { name: 'Oregon', code: 'OR', hasIncomeTax: true },
  { name: 'Pennsylvania', code: 'PA', hasIncomeTax: true },
  { name: 'Rhode Island', code: 'RI', hasIncomeTax: true },
  { name: 'South Carolina', code: 'SC', hasIncomeTax: true },
  { name: 'Utah', code: 'UT', hasIncomeTax: true },
  { name: 'Vermont', code: 'VT', hasIncomeTax: true },
  { name: 'Virginia', code: 'VA', hasIncomeTax: true },
  { name: 'West Virginia', code: 'WV', hasIncomeTax: true },
  { name: 'Wisconsin', code: 'WI', hasIncomeTax: true }
]

// Combined list for dropdown
export const ALL_STATES = [...NO_INCOME_TAX_STATES, ...INCOME_TAX_STATES].sort((a, b) => a.name.localeCompare(b.name))

// Helper function to get state info
export const getStateInfo = (code: string): StateInfo | undefined => {
  return ALL_STATES.find(state => state.code === code)
}