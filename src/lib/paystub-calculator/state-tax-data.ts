import type { TaxData } from "@/types/paystub";

// Simplified state tax data by year. Add or adjust per annual releases.
export type StateTaxBrackets = Record<string, TaxData['federalBrackets']>;

export const stateTaxDataByYear: Record<number, StateTaxBrackets> = {
  2024: {
    CA: {
      single: [
        { limit: 9325, rate: 0.01 },
        { limit: 22107, rate: 0.02 },
        { limit: 34892, rate: 0.04 },
        { limit: 48435, rate: 0.06 },
        { limit: 61214, rate: 0.08 },
        { limit: 312686, rate: 0.093 },
        { limit: 375221, rate: 0.103 },
        { limit: 625369, rate: 0.113 },
        { limit: Infinity, rate: 0.123 },
      ],
      marriedJoint: [
        { limit: 18650, rate: 0.01 },
        { limit: 44214, rate: 0.02 },
        { limit: 69784, rate: 0.04 },
        { limit: 96870, rate: 0.06 },
        { limit: 122428, rate: 0.08 },
        { limit: 625372, rate: 0.093 },
        { limit: 750442, rate: 0.103 },
        { limit: 1250738, rate: 0.113 },
        { limit: Infinity, rate: 0.123 },
      ],
      marriedSeparate: [
        { limit: 9325, rate: 0.01 },
        { limit: 22107, rate: 0.02 },
        { limit: 34892, rate: 0.04 },
        { limit: 48435, rate: 0.06 },
        { limit: 61214, rate: 0.08 },
        { limit: 312686, rate: 0.093 },
        { limit: 375221, rate: 0.103 },
        { limit: 625369, rate: 0.113 },
        { limit: Infinity, rate: 0.123 },
      ],
      headOfHousehold: [
        { limit: 18650, rate: 0.01 },
        { limit: 44214, rate: 0.02 },
        { limit: 69784, rate: 0.04 },
        { limit: 96870, rate: 0.06 },
        { limit: 122428, rate: 0.08 },
        { limit: 625372, rate: 0.093 },
        { limit: 750442, rate: 0.103 },
        { limit: 1250738, rate: 0.113 },
        { limit: Infinity, rate: 0.123 },
      ],
      qualifyingSurvivingSpouse: [
        { limit: 18650, rate: 0.01 },
        { limit: 44214, rate: 0.02 },
        { limit: 69784, rate: 0.04 },
        { limit: 96870, rate: 0.06 },
        { limit: 122428, rate: 0.08 },
        { limit: 625372, rate: 0.093 },
        { limit: 750442, rate: 0.103 },
        { limit: 1250738, rate: 0.113 },
        { limit: Infinity, rate: 0.123 },
      ],
    },
    NY: {
      single: [
        { limit: 8500, rate: 0.04 },
        { limit: 11700, rate: 0.045 },
        { limit: 13900, rate: 0.0525 },
        { limit: 21400, rate: 0.059 },
        { limit: 80650, rate: 0.0621 },
        { limit: 215400, rate: 0.0649 },
        { limit: 1077550, rate: 0.0685 },
        { limit: Infinity, rate: 0.0882 },
      ],
      marriedJoint: [
        { limit: 17150, rate: 0.04 },
        { limit: 23600, rate: 0.045 },
        { limit: 27950, rate: 0.0525 },
        { limit: 43000, rate: 0.059 },
        { limit: 161550, rate: 0.0621 },
        { limit: 323200, rate: 0.0649 },
        { limit: 2155000, rate: 0.0685 },
        { limit: Infinity, rate: 0.0882 },
      ],
      marriedSeparate: [
        { limit: 8500, rate: 0.04 },
        { limit: 11700, rate: 0.045 },
        { limit: 13900, rate: 0.0525 },
        { limit: 21400, rate: 0.059 },
        { limit: 80650, rate: 0.0621 },
        { limit: 215400, rate: 0.0649 },
        { limit: 1077550, rate: 0.0685 },
        { limit: Infinity, rate: 0.0882 },
      ],
      headOfHousehold: [
        { limit: 12800, rate: 0.04 },
        { limit: 17650, rate: 0.045 },
        { limit: 20800, rate: 0.0525 },
        { limit: 32200, rate: 0.059 },
        { limit: 107650, rate: 0.0621 },
        { limit: 269300, rate: 0.0649 },
        { limit: 1616450, rate: 0.0685 },
        { limit: Infinity, rate: 0.0882 },
      ],
      qualifyingSurvivingSpouse: [
        { limit: 17150, rate: 0.04 },
        { limit: 23600, rate: 0.045 },
        { limit: 27950, rate: 0.0525 },
        { limit: 43000, rate: 0.059 },
        { limit: 161550, rate: 0.0621 },
        { limit: 323200, rate: 0.0649 },
        { limit: 2155000, rate: 0.0685 },
        { limit: Infinity, rate: 0.0882 },
      ],
    },
    IL: flatBrackets(0.0495),
    PA: flatBrackets(0.0307),
    MA: flatBrackets(0.0535),
    TX: flatBrackets(0),
    FL: flatBrackets(0),
    WA: flatBrackets(0),
  },
};

export function getStateTaxBrackets(state: string, year?: number): TaxData['federalBrackets'] | undefined {
  const normalizedState = state?.toUpperCase();
  const targetYear = year ?? new Date().getFullYear();
  const yearTable = stateTaxDataByYear[targetYear] ?? stateTaxDataByYear[Math.max(...Object.keys(stateTaxDataByYear).map(Number))];
  return yearTable?.[normalizedState];
}

function flatBrackets(rate: number): TaxData['federalBrackets'] {
  return {
    single: [{ limit: Infinity, rate }],
    marriedJoint: [{ limit: Infinity, rate }],
    marriedSeparate: [{ limit: Infinity, rate }],
    headOfHousehold: [{ limit: Infinity, rate }],
    qualifyingSurvivingSpouse: [{ limit: Infinity, rate }],
  };
}

