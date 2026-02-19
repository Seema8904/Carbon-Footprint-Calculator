import { useState } from 'react';
import { Car, Zap, Utensils, Trash2, User } from 'lucide-react';
import { LifestyleInputs } from '../lib/carbonCalculator';

interface InputFormProps {
  onSubmit: (inputs: LifestyleInputs, userName: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [userName, setUserName] = useState('');
  const [transportKm, setTransportKm] = useState(100);
  const [transportMode, setTransportMode] = useState('car');
  const [energyKwh, setEnergyKwh] = useState(200);
  const [lpgKg, setLpgKg] = useState(15);
  const [dietType, setDietType] = useState('vegetarian');
  const [redMeatMeals, setRedMeatMeals] = useState(0);
  const [wasteKg, setWasteKg] = useState(10);
  const [wasteSegregated, setWasteSegregated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      transportKmPerWeek: transportKm,
      transportMode,
      energyKwhPerMonth: energyKwh,
      lpgKgPerMonth: lpgKg,
      dietType,
      redMeatMealsPerWeek: redMeatMeals,
      wasteKgPerWeek: wasteKg,
      wasteSegregated,
    }, userName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Transport Habits</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Mode of Transport
            </label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="electric_car">Electric Car</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance Traveled Per Week: <span className="font-bold text-blue-600">{transportKm} km</span>
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={transportKm}
              onChange={(e) => setTransportKm(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 km</span>
              <span>500 km</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-yellow-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Energy Consumption</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Usage Per Month: <span className="font-bold text-yellow-600">{energyKwh} kWh</span>
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={energyKwh}
              onChange={(e) => setEnergyKwh(Number(e.target.value))}
              className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50 kWh</span>
              <span>1000 kWh</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LPG Consumption Per Month: <span className="font-bold text-yellow-600">{lpgKg} kg</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={lpgKg}
              onChange={(e) => setLpgKg(Number(e.target.value))}
              className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 kg</span>
              <span>50 kg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Utensils className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Dietary Habits</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diet Type
            </label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="pescatarian">Pescatarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
            </select>
          </div>

          {(dietType === 'non_vegetarian' || dietType === 'pescatarian') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Red Meat Meals Per Week: <span className="font-bold text-orange-600">{redMeatMeals}</span>
              </label>
              <input
                type="range"
                min="0"
                max="21"
                step="1"
                value={redMeatMeals}
                onChange={(e) => setRedMeatMeals(Number(e.target.value))}
                className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>21 meals</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-teal-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Waste Generation</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waste Per Week: <span className="font-bold text-teal-600">{wasteKg} kg</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={wasteKg}
              onChange={(e) => setWasteKg(Number(e.target.value))}
              className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 kg</span>
              <span>50 kg</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wasteSegregated"
              checked={wasteSegregated}
              onChange={(e) => setWasteSegregated(e.target.checked)}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="wasteSegregated" className="text-sm font-medium text-gray-700 cursor-pointer">
              I segregate my waste (wet, dry, recyclable)
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-green-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Calculating...' : 'Calculate My Carbon Footprint'}
      </button>
    </form>
  );
}
