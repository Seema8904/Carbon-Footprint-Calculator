import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FootprintRecord {
  id?: string;
  user_name: string;
  transport_km_per_week: number;
  transport_mode: string;
  energy_kwh_per_month: number;
  lpg_kg_per_month: number;
  diet_type: string;
  red_meat_meals_per_week: number;
  waste_kg_per_week: number;
  waste_segregated: boolean;
  transport_emissions: number;
  energy_emissions: number;
  diet_emissions: number;
  waste_emissions: number;
  total_emissions: number;
  emission_category: string;
  created_at?: string;
}

export interface MLTrainingData {
  id?: string;
  transport_km: number;
  energy_units: number;
  diet_type: string;
  waste_kg: number;
  total_emission: number;
  emission_category: string;
  is_synthetic: boolean;
  created_at?: string;
}

export interface UserPrediction {
  id?: string;
  footprint_id: string;
  predicted_emissions_1year: number;
  predicted_emissions_2year: number;
  confidence_score: number;
  created_at?: string;
}

export interface Recommendation {
  id?: string;
  footprint_id: string;
  category: string;
  recommendation_text: string;
  potential_reduction_kg: number;
  priority: number;
  created_at?: string;
}
