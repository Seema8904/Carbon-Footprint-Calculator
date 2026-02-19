import { useState, useEffect } from 'react';
import { Leaf, Sparkles, BarChart3, ArrowRight, Info } from 'lucide-react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import Recommendations from './components/Recommendations';
import ReportGenerator from './components/ReportGenerator';
import { calculateCarbonFootprint, LifestyleInputs, EmissionBreakdown } from './lib/carbonCalculator';
import { predictFutureEmissions, trainModel, addTrainingData, MLPrediction } from './lib/mlEngine';
import { generateRecommendations, getRandomEcoTip, RecommendationItem } from './lib/recommendations';
import { supabase } from './lib/supabase';

type AppState = 'welcome' | 'input' | 'results';

function App() {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [emissions, setEmissions] = useState<EmissionBreakdown | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [ecoTip, setEcoTip] = useState('');
  const [showPrediction, setShowPrediction] = useState(false);
  const [currentInputs, setCurrentInputs] = useState<LifestyleInputs | null>(null);

  useEffect(() => {
    trainModel();
  }, []);

  const handleCalculate = async (inputs: LifestyleInputs, name: string) => {
    setIsLoading(true);
    setUserName(name);
    setCurrentInputs(inputs);

    try {
      const calculatedEmissions = calculateCarbonFootprint(inputs);
      setEmissions(calculatedEmissions);

      const recs = generateRecommendations(inputs, calculatedEmissions);
      setRecommendations(recs);

      const tip = getRandomEcoTip();
      setEcoTip(tip);

      const { data, error } = await supabase
        .from('footprint_records')
        .insert({
          user_name: name,
          transport_km_per_week: inputs.transportKmPerWeek,
          transport_mode: inputs.transportMode,
          energy_kwh_per_month: inputs.energyKwhPerMonth,
          lpg_kg_per_month: inputs.lpgKgPerMonth,
          diet_type: inputs.dietType,
          red_meat_meals_per_week: inputs.redMeatMealsPerWeek,
          waste_kg_per_week: inputs.wasteKgPerWeek,
          waste_segregated: inputs.wasteSegregated,
          transport_emissions: calculatedEmissions.transport,
          energy_emissions: calculatedEmissions.energy,
          diet_emissions: calculatedEmissions.diet,
          waste_emissions: calculatedEmissions.waste,
          total_emissions: calculatedEmissions.total,
          emission_category: calculatedEmissions.category,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const recPromises = recs.map(rec =>
          supabase.from('recommendations').insert({
            footprint_id: data.id,
            category: rec.category,
            recommendation_text: rec.text,
            potential_reduction_kg: rec.potentialReduction,
            priority: rec.priority,
          })
        );
        await Promise.all(recPromises);

        await addTrainingData(
          inputs.transportKmPerWeek * 52,
          inputs.energyKwhPerMonth * 12,
          inputs.dietType,
          inputs.wasteKgPerWeek * 52,
          calculatedEmissions.total,
          calculatedEmissions.category
        );
      }

      setAppState('results');
    } catch (error) {
      console.error('Error saving data:', error);
      setAppState('results');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredictFuture = async () => {
    if (!emissions || !currentInputs) return;

    setIsLoading(true);
    try {
      const pred = await predictFutureEmissions(
        emissions.total,
        currentInputs.transportKmPerWeek * 52,
        currentInputs.energyKwhPerMonth * 12,
        currentInputs.dietType,
        currentInputs.wasteKgPerWeek * 52
      );
      setPrediction(pred);
      setShowPrediction(true);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAppState('input');
    setEmissions(null);
    setRecommendations([]);
    setPrediction(null);
    setShowPrediction(false);
    setUserName('');
    setCurrentInputs(null);
  };

  if (appState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-teal-600 rounded-full mb-6 shadow-xl">
                <Leaf className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-6xl font-bold text-gray-800 mb-4">
                Eco<span className="text-green-600">Trace</span>
              </h1>
              <p className="text-2xl text-gray-600 mb-2">Know your impact, shape your future</p>
              <div className="flex items-center justify-center gap-2 text-teal-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Powered by Machine Learning</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-12 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Track Your Carbon Footprint
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Discover your environmental impact and receive personalized recommendations to reduce
                your carbon emissions. Our ML-powered system analyzes your lifestyle and predicts
                future trends to help you make sustainable choices.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Calculate</h3>
                  <p className="text-sm text-gray-600">
                    Input your lifestyle data to calculate your carbon footprint
                  </p>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Analyze</h3>
                  <p className="text-sm text-gray-600">
                    Get ML-powered insights and predictions about your emissions
                  </p>
                </div>

                <div className="text-center p-6 bg-teal-50 rounded-xl">
                  <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Act</h3>
                  <p className="text-sm text-gray-600">
                    Receive personalized recommendations to reduce your impact
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAppState('input')}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-5 px-8 rounded-xl font-semibold text-xl shadow-lg hover:from-green-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Info className="w-5 h-5" />
                <span className="font-semibold">Did You Know?</span>
              </div>
              <p className="text-green-50">
                The average person generates about 6 tons of CO₂ per year. Small changes in daily
                habits can reduce this by up to 30%.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Leaf className="w-10 h-10 text-green-600" />
                <h1 className="text-4xl font-bold text-gray-800">
                  Eco<span className="text-green-600">Trace</span>
                </h1>
              </div>
              <p className="text-gray-600">Enter your lifestyle details to calculate your carbon footprint</p>
            </div>

            <InputForm onSubmit={handleCalculate} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'results' && emissions) {
    const topContributors = [
      { category: 'transport', value: emissions.transport },
      { category: 'energy', value: emissions.energy },
      { category: 'diet', value: emissions.diet },
      { category: 'waste', value: emissions.waste },
    ]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <Leaf className="w-10 h-10 text-green-600" />
                <h1 className="text-4xl font-bold text-gray-800">
                  Eco<span className="text-green-600">Trace</span>
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Your Carbon Footprint Analysis</p>
            </div>

            <div className="space-y-8">
              <Dashboard emissions={emissions} prediction={showPrediction ? prediction || undefined : undefined} />

              {!showPrediction && (
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Want to see your future emission trends?
                  </h3>
                  <button
                    onClick={handlePredictFuture}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-8 rounded-xl font-semibold shadow-md hover:from-blue-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Predicting...' : 'Predict My Future Footprint'}
                  </button>
                </div>
              )}

              <Recommendations recommendations={recommendations} topContributors={topContributors} />

              <ReportGenerator
                userName={userName}
                emissions={emissions}
                recommendations={recommendations}
                prediction={prediction || undefined}
              />

              {ecoTip && (
                <div className="bg-gradient-to-r from-teal-600 to-green-600 rounded-xl p-6 shadow-lg text-white text-center">
                  <p className="text-lg font-medium italic">"{ecoTip}"</p>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-8 rounded-xl font-semibold shadow-md hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] transition-all"
                >
                  Calculate Again
                </button>
                <button
                  onClick={() => setAppState('welcome')}
                  className="bg-white text-gray-700 py-3 px-8 rounded-xl font-semibold shadow-md border-2 border-gray-300 hover:bg-gray-50 transform hover:scale-[1.02] transition-all"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
