import { EmissionBreakdown } from './carbonCalculator';
import { LifestyleInputs } from './carbonCalculator';

export interface RecommendationItem {
  category: string;
  text: string;
  potentialReduction: number;
  priority: number;
}

export function generateRecommendations(
  inputs: LifestyleInputs,
  emissions: EmissionBreakdown
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  const sortedCategories = [
    { name: 'transport', value: emissions.transport },
    { name: 'energy', value: emissions.energy },
    { name: 'diet', value: emissions.diet },
    { name: 'waste', value: emissions.waste },
  ].sort((a, b) => b.value - a.value);

  if (emissions.transport > 1000) {
    if (inputs.transportMode === 'car') {
      recommendations.push({
        category: 'transport',
        text: 'Switch to public transport 2-3 times per week to reduce emissions by up to 30%',
        potentialReduction: emissions.transport * 0.3,
        priority: 1,
      });
    }
    if (inputs.transportKmPerWeek > 100) {
      recommendations.push({
        category: 'transport',
        text: 'Consider carpooling or working from home 1-2 days per week',
        potentialReduction: emissions.transport * 0.2,
        priority: 2,
      });
    }
    if (inputs.transportMode === 'car' && inputs.transportKmPerWeek < 50) {
      recommendations.push({
        category: 'transport',
        text: 'For short distances under 5km, consider biking or walking',
        potentialReduction: emissions.transport * 0.15,
        priority: 2,
      });
    }
  }

  if (emissions.energy > 1500) {
    if (inputs.energyKwhPerMonth > 200) {
      recommendations.push({
        category: 'energy',
        text: 'Switch to LED bulbs and energy-efficient appliances to save up to 25% energy',
        potentialReduction: emissions.energy * 0.25,
        priority: sortedCategories[0].name === 'energy' ? 1 : 2,
      });
    }
    recommendations.push({
      category: 'energy',
      text: 'Use natural light during daytime and unplug devices when not in use',
      potentialReduction: emissions.energy * 0.15,
      priority: 2,
    });
    if (inputs.lpgKgPerMonth > 15) {
      recommendations.push({
        category: 'energy',
        text: 'Use pressure cookers and optimize cooking methods to reduce LPG consumption',
        potentialReduction: emissions.energy * 0.1,
        priority: 3,
      });
    }
  }

  if (emissions.diet > 2000) {
    if (inputs.dietType === 'non_vegetarian' && inputs.redMeatMealsPerWeek > 3) {
      recommendations.push({
        category: 'diet',
        text: 'Reduce red meat consumption to 2-3 times per week to cut diet emissions by 20-30%',
        potentialReduction: emissions.diet * 0.25,
        priority: sortedCategories[0].name === 'diet' ? 1 : 2,
      });
    }
    if (inputs.dietType === 'non_vegetarian') {
      recommendations.push({
        category: 'diet',
        text: 'Try "Meatless Mondays" or introduce more plant-based meals',
        potentialReduction: emissions.diet * 0.15,
        priority: 2,
      });
    }
    recommendations.push({
      category: 'diet',
      text: 'Buy local and seasonal produce to reduce transportation emissions',
      potentialReduction: emissions.diet * 0.1,
      priority: 3,
    });
  }

  if (emissions.waste > 200) {
    if (!inputs.wasteSegregated) {
      recommendations.push({
        category: 'waste',
        text: 'Start segregating waste into wet, dry, and recyclable categories',
        potentialReduction: emissions.waste * 0.35,
        priority: sortedCategories[0].name === 'waste' ? 1 : 2,
      });
    }
    if (inputs.wasteKgPerWeek > 5) {
      recommendations.push({
        category: 'waste',
        text: 'Practice composting for organic waste and reduce overall waste generation',
        potentialReduction: emissions.waste * 0.25,
        priority: 2,
      });
    }
    recommendations.push({
      category: 'waste',
      text: 'Avoid single-use plastics and carry reusable bags, bottles, and containers',
      potentialReduction: emissions.waste * 0.2,
      priority: 3,
    });
  }

  return recommendations
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.potentialReduction - a.potentialReduction;
    })
    .slice(0, 6);
}

export const ECO_TIPS = [
  "Every small action counts towards a sustainable future",
  "The best time to act on climate change was yesterday. The second best time is now.",
  "Your carbon footprint is a measure of impact, not character",
  "Reducing emissions by 2 tons/year is equivalent to planting 100 trees",
  "Sustainable living is a journey, not a destination",
  "Choose progress over perfection in your sustainability journey",
];

export function getRandomEcoTip(): string {
  return ECO_TIPS[Math.floor(Math.random() * ECO_TIPS.length)];
}
