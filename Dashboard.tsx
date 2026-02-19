import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { EmissionBreakdown, SUSTAINABLE_TARGET, AVERAGE_FOOTPRINT } from '../lib/carbonCalculator';
import { MLPrediction } from '../lib/mlEngine';

interface DashboardProps {
  emissions: EmissionBreakdown;
  prediction?: MLPrediction;
}

const COLORS = {
  transport: '#3b82f6',
  energy: '#eab308',
  diet: '#f97316',
  waste: '#14b8a6',
  low: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
};

export default function Dashboard({ emissions, prediction }: DashboardProps) {
  const pieData = [
    { name: 'Transport', value: emissions.transport, color: COLORS.transport },
    { name: 'Energy', value: emissions.energy, color: COLORS.energy },
    { name: 'Diet', value: emissions.diet, color: COLORS.diet },
    { name: 'Waste', value: emissions.waste, color: COLORS.waste },
  ].filter(item => item.value > 0);

  const comparisonData = [
    { name: 'Your Footprint', value: emissions.total, color: COLORS[emissions.category.toLowerCase() as keyof typeof COLORS] },
    { name: 'Sustainable Target', value: SUSTAINABLE_TARGET, color: COLORS.low },
    { name: 'Average Footprint', value: AVERAGE_FOOTPRINT, color: COLORS.moderate },
  ];

  const trendData = prediction ? [
    { year: 'Current', emissions: emissions.total },
    { year: '1 Year', emissions: prediction.predictedEmissions1Year },
    { year: '2 Years', emissions: prediction.predictedEmissions2Year },
  ] : [];

  const categoryColor = emissions.category === 'Low' ? COLORS.low : emissions.category === 'Moderate' ? COLORS.moderate : COLORS.high;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-gray-600">{payload[0].value.toFixed(2)} kg CO₂e/year</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 shadow-lg border-2 border-green-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Annual Carbon Footprint</h2>
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span className="text-6xl font-bold" style={{ color: categoryColor }}>
              {emissions.total.toLocaleString()}
            </span>
            <span className="text-2xl text-gray-600">kg CO₂e</span>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full" style={{ backgroundColor: `${categoryColor}20` }}>
            <AlertCircle className="w-5 h-5" style={{ color: categoryColor }} />
            <span className="font-semibold" style={{ color: categoryColor }}>
              {emissions.category} Emitter
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emission Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700">{item.name}: {item.value.toFixed(0)} kg</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparison with Targets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {prediction && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Predicted Emission Trend</h3>
          <div className="flex items-center gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
            {prediction.trendDirection === 'increasing' && (
              <>
                <TrendingUp className="w-6 h-6 text-red-600" />
                <span className="text-sm text-gray-700">
                  Your emissions are projected to <span className="font-semibold text-red-600">increase</span> if current habits continue
                </span>
              </>
            )}
            {prediction.trendDirection === 'stable' && (
              <>
                <Minus className="w-6 h-6 text-yellow-600" />
                <span className="text-sm text-gray-700">
                  Your emissions are projected to remain <span className="font-semibold text-yellow-600">stable</span>
                </span>
              </>
            )}
            {prediction.trendDirection === 'decreasing' && (
              <>
                <TrendingDown className="w-6 h-6 text-green-600" />
                <span className="text-sm text-gray-700">
                  Your emissions are projected to <span className="font-semibold text-green-600">decrease</span>
                </span>
              </>
            )}
            <span className="ml-auto text-sm text-gray-500">
              Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="emissions" stroke="#3b82f6" strokeWidth={3} name="Emissions (kg CO₂e)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
