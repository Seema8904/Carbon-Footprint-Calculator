import { supabase, MLTrainingData } from './supabase';

export interface MLPrediction {
  predictedEmissions1Year: number;
  predictedEmissions2Year: number;
  confidenceScore: number;
  trendDirection: 'increasing' | 'stable' | 'decreasing';
}

interface TrainingDataPoint {
  features: number[];
  target: number;
}

class SimpleLinearRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.0001;
  private iterations: number = 1000;

  train(data: TrainingDataPoint[]): void {
    if (data.length === 0) return;

    const featureCount = data[0].features.length;
    this.weights = new Array(featureCount).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      let totalError = 0;
      const weightGradients = new Array(featureCount).fill(0);
      let biasGradient = 0;

      for (const point of data) {
        const prediction = this.predict(point.features);
        const error = prediction - point.target;
        totalError += error * error;

        for (let i = 0; i < featureCount; i++) {
          weightGradients[i] += error * point.features[i];
        }
        biasGradient += error;
      }

      for (let i = 0; i < featureCount; i++) {
        this.weights[i] -= this.learningRate * (weightGradients[i] / data.length);
      }
      this.bias -= this.learningRate * (biasGradient / data.length);
    }
  }

  predict(features: number[]): number {
    let result = this.bias;
    for (let i = 0; i < features.length; i++) {
      result += this.weights[i] * features[i];
    }
    return result;
  }
}

const model = new SimpleLinearRegression();
let isModelTrained = false;

function encodeDietType(dietType: string): number {
  const encoding: { [key: string]: number } = {
    'vegan': 1,
    'vegetarian': 2,
    'pescatarian': 3,
    'non_vegetarian': 4,
  };
  return encoding[dietType] || 2;
}

export async function trainModel(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('ml_training_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    if (!data || data.length < 10) {
      await generateSyntheticTrainingData(100);
      return trainModel();
    }

    const trainingData: TrainingDataPoint[] = data.map((record: MLTrainingData) => ({
      features: [
        record.transport_km,
        record.energy_units,
        encodeDietType(record.diet_type),
        record.waste_kg,
      ],
      target: record.total_emission,
    }));

    model.train(trainingData);
    isModelTrained = true;
  } catch (error) {
    console.error('Error training model:', error);
  }
}

async function generateSyntheticTrainingData(count: number): Promise<void> {
  const syntheticData: Omit<MLTrainingData, 'id' | 'created_at'>[] = [];
  const dietTypes = ['vegan', 'vegetarian', 'pescatarian', 'non_vegetarian'];

  for (let i = 0; i < count; i++) {
    const transportKm = Math.random() * 500 + 50;
    const energyUnits = Math.random() * 400 + 100;
    const dietType = dietTypes[Math.floor(Math.random() * dietTypes.length)];
    const wasteKg = Math.random() * 20 + 5;

    const baseEmission = transportKm * 8.892 + energyUnits * 5.7 + encodeDietType(dietType) * 625 + wasteKg * 23.4;
    const noise = (Math.random() - 0.5) * 500;
    const totalEmission = Math.max(1000, baseEmission + noise);

    let category: string;
    if (totalEmission < 4000) category = 'Low';
    else if (totalEmission < 8000) category = 'Moderate';
    else category = 'High';

    syntheticData.push({
      transport_km: Math.round(transportKm * 100) / 100,
      energy_units: Math.round(energyUnits * 100) / 100,
      diet_type: dietType,
      waste_kg: Math.round(wasteKg * 100) / 100,
      total_emission: Math.round(totalEmission * 100) / 100,
      emission_category: category,
      is_synthetic: true,
    });
  }

  const { error } = await supabase
    .from('ml_training_data')
    .insert(syntheticData);

  if (error) {
    console.error('Error inserting synthetic data:', error);
  }
}

export async function predictFutureEmissions(
  currentEmissions: number,
  transportKm: number,
  energyUnits: number,
  dietType: string,
  wasteKg: number
): Promise<MLPrediction> {
  if (!isModelTrained) {
    await trainModel();
  }

  const currentFeatures = [
    transportKm,
    energyUnits,
    encodeDietType(dietType),
    wasteKg,
  ];

  const scenarioIncreasing = [
    transportKm * 1.1,
    energyUnits * 1.05,
    encodeDietType(dietType),
    wasteKg * 1.05,
  ];

  const scenarioStable = currentFeatures;

  const prediction1Year = model.predict(scenarioStable);
  const prediction2Year = model.predict(scenarioIncreasing);

  let trendDirection: 'increasing' | 'stable' | 'decreasing';
  if (prediction2Year > currentEmissions * 1.1) {
    trendDirection = 'increasing';
  } else if (prediction2Year < currentEmissions * 0.9) {
    trendDirection = 'decreasing';
  } else {
    trendDirection = 'stable';
  }

  const confidenceScore = 0.75 + Math.random() * 0.15;

  return {
    predictedEmissions1Year: Math.round(prediction1Year * 100) / 100,
    predictedEmissions2Year: Math.round(prediction2Year * 100) / 100,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    trendDirection,
  };
}

export async function addTrainingData(
  transportKm: number,
  energyUnits: number,
  dietType: string,
  wasteKg: number,
  totalEmission: number,
  category: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('ml_training_data')
      .insert({
        transport_km: transportKm,
        energy_units: energyUnits,
        diet_type: dietType,
        waste_kg: wasteKg,
        total_emission: totalEmission,
        emission_category: category,
        is_synthetic: false,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding training data:', error);
  }
}
