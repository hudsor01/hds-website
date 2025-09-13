import type { TaxData } from '@/types/paystub'

// Pay dates for each year (matching original)
export const PAY_DATES = {
  2020: [
    '2020-01-10', '2020-01-24', '2020-02-07', '2020-02-21', '2020-03-06', '2020-03-20',
    '2020-04-03', '2020-04-17', '2020-05-01', '2020-05-15', '2020-05-29', '2020-06-12',
    '2020-06-26', '2020-07-10', '2020-07-24', '2020-08-07', '2020-08-21', '2020-09-04',
    '2020-09-18', '2020-10-02', '2020-10-16', '2020-10-30', '2020-11-13', '2020-11-27',
    '2020-12-11', '2020-12-25'
  ],
  2021: [
    '2021-01-08', '2021-01-22', '2021-02-05', '2021-02-19', '2021-03-05', '2021-03-19',
    '2021-04-02', '2021-04-16', '2021-04-30', '2021-05-14', '2021-05-28', '2021-06-11',
    '2021-06-25', '2021-07-09', '2021-07-23', '2021-08-06', '2021-08-20', '2021-09-03',
    '2021-09-17', '2021-10-01', '2021-10-15', '2021-10-29', '2021-11-12', '2021-11-26',
    '2021-12-10', '2021-12-24'
  ],
  2022: [
    '2022-01-07', '2022-01-21', '2022-02-04', '2022-02-18', '2022-03-04', '2022-03-18',
    '2022-04-01', '2022-04-15', '2022-04-29', '2022-05-13', '2022-05-27', '2022-06-10',
    '2022-06-24', '2022-07-08', '2022-07-22', '2022-08-05', '2022-08-19', '2022-09-02',
    '2022-09-16', '2022-09-30', '2022-10-14', '2022-10-28', '2022-11-11', '2022-11-25',
    '2022-12-09', '2022-12-23'
  ],
  2023: [
    '2023-01-06', '2023-01-20', '2023-02-03', '2023-02-17', '2023-03-03', '2023-03-17',
    '2023-03-31', '2023-04-14', '2023-04-28', '2023-05-12', '2023-05-26', '2023-06-09',
    '2023-06-23', '2023-07-07', '2023-07-21', '2023-08-04', '2023-08-18', '2023-09-01',
    '2023-09-15', '2023-09-29', '2023-10-13', '2023-10-27', '2023-11-10', '2023-11-24',
    '2023-12-08', '2023-12-22'
  ],
  2024: [
    '2024-01-12', '2024-01-26', '2024-02-09', '2024-02-23', '2024-03-08', '2024-03-22',
    '2024-04-05', '2024-04-19', '2024-05-03', '2024-05-17', '2024-05-31', '2024-06-14',
    '2024-06-28', '2024-07-12', '2024-07-26', '2024-08-09', '2024-08-23', '2024-09-06',
    '2024-09-20', '2024-10-04', '2024-10-18', '2024-11-01', '2024-11-15', '2024-11-29',
    '2024-12-13', '2024-12-27'
  ],
  2025: [
    '2025-01-10', '2025-01-24', '2025-02-07', '2025-02-21', '2025-03-07', '2025-03-21',
    '2025-04-04', '2025-04-18', '2025-05-02', '2025-05-16', '2025-05-30', '2025-06-13',
    '2025-06-27', '2025-07-11', '2025-07-25', '2025-08-08', '2025-08-22', '2025-09-05',
    '2025-09-19', '2025-10-03', '2025-10-17', '2025-10-31', '2025-11-14', '2025-11-28',
    '2025-12-12', '2025-12-26'
  ]
}

// Tax data for each year (matching original)
export const TAX_DATA: Record<number, TaxData> = {
  2020: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  },
  2021: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  },
  2022: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  },
  2023: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  },
  2024: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  },
  2025: {
    ssWageBase: 160200,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareRate: 0.009,
    additionalMedicareThreshold: {
      single: 200000,
      marriedJoint: 250000,
      marriedSeparate: 125000,
      headOfHousehold: 200000,
      qualifyingSurvivingSpouse: 250000
    },
    federalBrackets: {
      single: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578125, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedJoint: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      marriedSeparate: [
        { limit: 11000, rate: 0.10 },
        { limit: 44725, rate: 0.12 },
        { limit: 95375, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 346875, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      headOfHousehold: [
        { limit: 15700, rate: 0.10 },
        { limit: 59850, rate: 0.12 },
        { limit: 95350, rate: 0.22 },
        { limit: 182050, rate: 0.24 },
        { limit: 231250, rate: 0.32 },
        { limit: 578100, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ],
      qualifyingSurvivingSpouse: [
        { limit: 22000, rate: 0.10 },
        { limit: 89450, rate: 0.12 },
        { limit: 190750, rate: 0.22 },
        { limit: 364200, rate: 0.24 },
        { limit: 462500, rate: 0.32 },
        { limit: 693750, rate: 0.35 },
        { limit: Infinity, rate: 0.37 }
      ]
    }
  }
}