export interface LifestyleInputs {
  transportKmPerWeek: number;
  transportMode: string;
  energyKwhPerMonth: number;
  lpgKgPerMonth: number;
  dietType: string;
  redMeatMealsPerWeek: number;
  wasteKgPerWeek: number;
  wasteSegregated: boolean;
}

export interface EmissionBreakdown {
  transport: number;
  energy: number;
  diet: number;
  waste: number;
  total: number;
  category: 'Low' | 'Moderate' | 'High';
}

const EMISSION_FACTORS = {
  transport: {
    car: 0.171,
    bus: 0.089,
    train: 0.041,
    bike: 0,
    walk: 0,
    motorcycle: 0.113,
    electric_car: 0.053,
  },
  energy: {
    electricity: 0.475,
    lpg: 2.98,
  },
  diet: {
    vegetarian: 1500,
    vegan: 1050,
    non_vegetarian: 2500,
    pescatarian: 1750,
  },
  dietRedMeat: 27,
  waste: {
    segregated: 0.45,
    non_segregated: 0.73,
  },
};

export function calculateCarbonFootprint(inputs: LifestyleInputs): EmissionBreakdown {
  const transportEmissionFactor = EMISSION_FACTORS.transport[inputs.transportMode as keyof typeof EMISSION_FACTORS.transport] || 0.171;
  const transportEmissions = inputs.transportKmPerWeek * 52 * transportEmissionFactor;

  const electricityEmissions = inputs.energyKwhPerMonth * 12 * EMISSION_FACTORS.energy.electricity;
  const lpgEmissions = inputs.lpgKgPerMonth * 12 * EMISSION_FACTORS.energy.lpg;
  const energyEmissions = electricityEmissions + lpgEmissions;

  const baseDietEmission = EMISSION_FACTORS.diet[inputs.dietType as keyof typeof EMISSION_FACTORS.diet] || 1500;
  const redMeatEmissions = inputs.redMeatMealsPerWeek * 52 * EMISSION_FACTORS.dietRedMeat;
  const dietEmissions = baseDietEmission + redMeatEmissions;

  const wasteEmissionFactor = inputs.wasteSegregated
    ? EMISSION_FACTORS.waste.segregated
    : EMISSION_FACTORS.waste.non_segregated;
  const wasteEmissions = inputs.wasteKgPerWeek * 52 * wasteEmissionFactor;

  const totalEmissions = transportEmissions + energyEmissions + dietEmissions + wasteEmissions;

  let category: 'Low' | 'Moderate' | 'High';
  if (totalEmissions < 4000) {
    category = 'Low';
  } else if (totalEmissions < 8000) {
    category = 'Moderate';
  } else {
    category = 'High';
  }

  return {
    transport: Math.round(transportEmissions * 100) / 100,
    energy: Math.round(energyEmissions * 100) / 100,
    diet: Math.round(dietEmissions * 100) / 100,
    waste: Math.round(wasteEmissions * 100) / 100,
    total: Math.round(totalEmissions * 100) / 100,
    category,
  };
}

export function classifyEmitter(totalEmissions: number): 'Low' | 'Moderate' | 'High' {
  if (totalEmissions < 4000) return 'Low';
  if (totalEmissions < 8000) return 'Moderate';
  return 'High';
}

export const SUSTAINABLE_TARGET = 2000;
export const AVERAGE_FOOTPRINT = 6000;
