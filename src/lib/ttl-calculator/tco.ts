import type { TCOResults, VehicleInputs } from '../../types/ttl-types'

export function calculateTCO(input: VehicleInputs): TCOResults {
  // Calculate total ownership cost over the period
  const totalOwnershipYears = input.loanTermMonths ? Math.ceil(input.loanTermMonths / 12) : 5;

  // Annual maintenance cost (increases over time)
  const totalMaintenanceCost = Array.from({ length: totalOwnershipYears }, (_, i) => {
    const year = i + 1;
    const baseMaintenance = input.maintenanceCostPerYear || 0;
    const maintenanceGrowth = Math.pow(1.07, year - 1); // 7% increase per year
    return baseMaintenance * maintenanceGrowth;
  }).reduce((sum, cost) => sum + cost, 0);

  // Annual fuel/energy cost
  const annualFuelCost = calculateAnnualFuelCost(input);
  const totalFuelCost = annualFuelCost * totalOwnershipYears;

  // Include purchase price and financing costs in TCO
  const financingCost = input.loanTermMonths * calculateMonthlyPayment(input) - (input.purchasePrice - input.downPayment);

  // Total cost of ownership
  const totalCostOfOwnership = input.purchasePrice + totalMaintenanceCost + totalFuelCost + financingCost;

  // Annual cost
  const annualCost = totalCostOfOwnership / totalOwnershipYears;

  return {
    totalCostOfOwnership,
    annualCost,
    maintenanceCost: totalMaintenanceCost,
    fuelCost: totalFuelCost
  };
}

// Helper function to calculate monthly payment
function calculateMonthlyPayment(input: VehicleInputs): number {
  const principal = input.purchasePrice - input.downPayment;
  const monthlyRate = input.interestRate / 1200;
  const months = input.loanTermMonths;

  if (monthlyRate === 0 || months === 0) {
    return months === 0 ? 0 : principal / months;
  }

  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
         (Math.pow(1 + monthlyRate, months) - 1);
}

// Helper function to calculate annual fuel cost
export function calculateAnnualFuelCost(input: VehicleInputs): number {
  if (input.isElectric) {
    // Electric vehicle: miles per year / miles per kWh * electricity rate ($/kWh)
    const milesPerKwh = 3.5; // Average EV efficiency
    return (input.milesPerYear || 12000) / milesPerKwh * (input.electricityRate || 0.13);
  } else {
    // Gas vehicle: miles per year / mpg * gas price
    return (input.milesPerYear || 12000) / (input.mpg || 25) * (input.gasPrice || 3.0);
  }
}

// Helper function to calculate total fuel cost over ownership period
export function calculateTotalFuelCost(input: VehicleInputs, years: number = 5): number {
  const annualFuelCost = calculateAnnualFuelCost(input);
  return annualFuelCost * years;
}
