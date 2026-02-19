import { Lightbulb, TrendingDown, Star } from 'lucide-react';
import { RecommendationItem } from '../lib/recommendations';

interface RecommendationsProps {
  recommendations: RecommendationItem[];
  topContributors: Array<{ category: string; value: number }>;
}

const categoryIcons: { [key: string]: string } = {
  transport: '🚗',
  energy: '⚡',
  diet: '🍽️',
  waste: '♻️',
};

const categoryColors: { [key: string]: string } = {
  transport: 'bg-blue-50 border-blue-200 text-blue-700',
  energy: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  diet: 'bg-orange-50 border-orange-200 text-orange-700',
  waste: 'bg-teal-50 border-teal-200 text-teal-700',
};

export default function Recommendations({ recommendations, topContributors }: RecommendationsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Top Contributors</h3>
            <p className="text-sm text-gray-600">Your highest emission sources</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {topContributors.map((contributor, index) => (
            <div
              key={contributor.category}
              className={`p-4 rounded-lg border-2 ${categoryColors[contributor.category]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{categoryIcons[contributor.category]}</span>
                <span className="font-semibold capitalize">{contributor.category}</span>
              </div>
              <p className="text-2xl font-bold">{contributor.value.toFixed(0)} kg</p>
              <p className="text-xs mt-1">CO₂e per year</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Personalized Recommendations</h3>
            <p className="text-sm text-gray-600">Smart suggestions to reduce your carbon footprint</p>
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-5 rounded-xl border-2 ${categoryColors[rec.category]} transition-all hover:scale-[1.02] hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                    {categoryIcons[rec.category]}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold capitalize">
                      {rec.category}
                    </span>
                    {rec.priority === 1 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 font-medium mb-2">{rec.text}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">
                      Potential reduction: {rec.potentialReduction.toFixed(0)} kg CO₂e/year
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 shadow-lg text-white">
        <h4 className="font-semibold text-lg mb-2">Did You Know?</h4>
        <p className="text-green-50">
          Implementing just 3 of these recommendations could reduce your carbon footprint by up to{' '}
          {recommendations.slice(0, 3).reduce((sum, rec) => sum + rec.potentialReduction, 0).toFixed(0)} kg CO₂e per year.
          That's equivalent to planting{' '}
          {Math.round(recommendations.slice(0, 3).reduce((sum, rec) => sum + rec.potentialReduction, 0) / 20)} trees!
        </p>
      </div>
    </div>
  );
}
