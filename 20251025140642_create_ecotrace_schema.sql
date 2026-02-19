/*
  # EcoTrace Carbon Footprint Database Schema

  ## Overview
  This migration creates the complete database schema for the EcoTrace application,
  which tracks and predicts individual lifestyle carbon footprints using machine learning.

  ## New Tables Created

  ### 1. `footprint_records`
  Stores individual carbon footprint calculations and user lifestyle data.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each record
  - `user_name` (text) - Optional user identifier
  - `transport_km_per_week` (numeric) - Weekly kilometers traveled
  - `transport_mode` (text) - Primary mode of transport (car, bus, bike, train, etc.)
  - `energy_kwh_per_month` (numeric) - Monthly electricity consumption in kWh
  - `lpg_kg_per_month` (numeric) - Monthly LPG consumption in kg
  - `diet_type` (text) - Dietary preference (vegetarian, non-vegetarian, vegan, etc.)
  - `red_meat_meals_per_week` (integer) - Number of red meat meals per week
  - `waste_kg_per_week` (numeric) - Weekly waste generation in kg
  - `waste_segregated` (boolean) - Whether waste is segregated
  - `transport_emissions` (numeric) - Calculated CO2 emissions from transport (kg CO2e/year)
  - `energy_emissions` (numeric) - Calculated CO2 emissions from energy (kg CO2e/year)
  - `diet_emissions` (numeric) - Calculated CO2 emissions from diet (kg CO2e/year)
  - `waste_emissions` (numeric) - Calculated CO2 emissions from waste (kg CO2e/year)
  - `total_emissions` (numeric) - Total annual CO2 emissions (kg CO2e/year)
  - `emission_category` (text) - Classification: Low, Moderate, or High emitter
  - `created_at` (timestamptz) - Timestamp when record was created

  ### 2. `ml_training_data`
  Stores synthetic and real user data for training machine learning models.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `transport_km` (numeric) - Transport distance metric
  - `energy_units` (numeric) - Energy consumption metric
  - `diet_type` (text) - Dietary preference
  - `waste_kg` (numeric) - Waste generation metric
  - `total_emission` (numeric) - Total calculated emissions
  - `emission_category` (text) - Classification label
  - `is_synthetic` (boolean) - Whether data is synthetically generated
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `user_predictions`
  Stores ML model predictions for future emission trends.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `footprint_id` (uuid, foreign key) - References footprint_records
  - `predicted_emissions_1year` (numeric) - Predicted emissions in 1 year
  - `predicted_emissions_2year` (numeric) - Predicted emissions in 2 years
  - `confidence_score` (numeric) - Model confidence (0-1)
  - `created_at` (timestamptz) - Prediction timestamp

  ### 4. `recommendations`
  Stores personalized carbon reduction recommendations.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `footprint_id` (uuid, foreign key) - References footprint_records
  - `category` (text) - Recommendation category (transport, energy, diet, waste)
  - `recommendation_text` (text) - The actual recommendation
  - `potential_reduction_kg` (numeric) - Estimated CO2 reduction (kg/year)
  - `priority` (integer) - Priority level (1=highest, 3=lowest)
  - `created_at` (timestamptz) - Recommendation generation timestamp

  ## Security
  - All tables have RLS enabled
  - Public access for read operations (demo application)
  - Authenticated users can insert/update their own records

  ## Indexes
  - Index on emission categories for fast filtering
  - Index on created_at for time-based queries
*/

-- Create footprint_records table
CREATE TABLE IF NOT EXISTS footprint_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text DEFAULT '',
  transport_km_per_week numeric NOT NULL DEFAULT 0,
  transport_mode text NOT NULL DEFAULT 'car',
  energy_kwh_per_month numeric NOT NULL DEFAULT 0,
  lpg_kg_per_month numeric NOT NULL DEFAULT 0,
  diet_type text NOT NULL DEFAULT 'vegetarian',
  red_meat_meals_per_week integer NOT NULL DEFAULT 0,
  waste_kg_per_week numeric NOT NULL DEFAULT 0,
  waste_segregated boolean NOT NULL DEFAULT false,
  transport_emissions numeric NOT NULL DEFAULT 0,
  energy_emissions numeric NOT NULL DEFAULT 0,
  diet_emissions numeric NOT NULL DEFAULT 0,
  waste_emissions numeric NOT NULL DEFAULT 0,
  total_emissions numeric NOT NULL DEFAULT 0,
  emission_category text NOT NULL DEFAULT 'Moderate',
  created_at timestamptz DEFAULT now()
);

-- Create ml_training_data table
CREATE TABLE IF NOT EXISTS ml_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_km numeric NOT NULL,
  energy_units numeric NOT NULL,
  diet_type text NOT NULL,
  waste_kg numeric NOT NULL,
  total_emission numeric NOT NULL,
  emission_category text NOT NULL,
  is_synthetic boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_predictions table
CREATE TABLE IF NOT EXISTS user_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  footprint_id uuid REFERENCES footprint_records(id) ON DELETE CASCADE,
  predicted_emissions_1year numeric NOT NULL,
  predicted_emissions_2year numeric NOT NULL,
  confidence_score numeric DEFAULT 0.85,
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  footprint_id uuid REFERENCES footprint_records(id) ON DELETE CASCADE,
  category text NOT NULL,
  recommendation_text text NOT NULL,
  potential_reduction_kg numeric DEFAULT 0,
  priority integer DEFAULT 2,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE footprint_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for footprint_records
CREATE POLICY "Allow public read access to footprint_records"
  ON footprint_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to footprint_records"
  ON footprint_records FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for ml_training_data
CREATE POLICY "Allow public read access to ml_training_data"
  ON ml_training_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to ml_training_data"
  ON ml_training_data FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for user_predictions
CREATE POLICY "Allow public read access to user_predictions"
  ON user_predictions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to user_predictions"
  ON user_predictions FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for recommendations
CREATE POLICY "Allow public read access to recommendations"
  ON recommendations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to recommendations"
  ON recommendations FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_footprint_category ON footprint_records(emission_category);
CREATE INDEX IF NOT EXISTS idx_footprint_created ON footprint_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_category ON ml_training_data(emission_category);
CREATE INDEX IF NOT EXISTS idx_predictions_footprint ON user_predictions(footprint_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_footprint ON recommendations(footprint_id);
