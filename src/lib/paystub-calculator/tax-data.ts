import type { TaxData } from "@/types/paystub";

// Versioned federal tax data by tax year. Add new entries per IRS releases.
export const taxDataByYear: Record<number, TaxData> = {
  2024: {
    ssWageBase: 168600,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000,
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.1 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182100, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.1 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.1 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182100, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.1 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182100, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.1 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
      ],
    },
  },
};

// 2025 uses 2024 figures as placeholder until official tables update
taxDataByYear[2025] = JSON.parse(JSON.stringify(taxDataByYear[2024])) as TaxData;

export function getTaxDataForYear(year?: number): TaxData {
  const currentYear = new Date().getFullYear();
  const targetYear = year ?? currentYear;
  const availableYears = Object.keys(taxDataByYear).map(Number);

  const defaultData = taxDataByYear[2024];

  if (!defaultData) {
    throw new Error('Missing baseline tax data for 2024');
  }

  if (availableYears.length === 0) {
    // Fallback to 2024 if no data is available (shouldn't happen in practice)
    return defaultData;
  }

  const fallbackYear = Math.max(...availableYears);
  const fallbackData = taxDataByYear[fallbackYear] ?? defaultData;

  return taxDataByYear[targetYear] ?? fallbackData;
}
