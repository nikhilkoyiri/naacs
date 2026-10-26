import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Edit, TrendingUp, AlertTriangle } from 'lucide-react';

export default function CriterionAnalysis() {
  const { n } = useParams<{ n: string }>();
  const { scores, data, darkMode } = useData();
  const criterionIndex = parseInt(n || '1') - 1;
  const criterion = CRITERIA[criterionIndex];

  if (!criterion) return <div className="text-center py-20">Criterion not found</div>;

  const criterionScore = scores.criteria[criterionIndex];
  const criterionData = data[criterion.id] || {};

  const chartData = criterionScore?.metrics
    .filter(m => m.maxScore > 0)
    .map(m => {
      const metric = criterion.metrics.find(cm => cm.id === m.metricId);
      return {
        name: metric?.id || m.metricId,
        label: metric?.label?.substring(0, 30) || '',
        earned: Math.round(m.earned * 10) / 10,
        max: m.maxScore,
        percentage: Math.round(m.percentage),
      };
    }) || [];

  const comparisonData = criterion.metrics
    .filter(m => m.type !== 'calculated' && m.type !== 'text' && m.benchmark !== null)
    .map(m => {
      const val = criterionData[m.id]?.value;
      let actual: number;
      if (m.type === 'boolean') {
        actual = val ? 100 : 0;
      } else {
        actual = Number(val || 0);
      }
      return {
        name: m.id,
        actual,
        benchmark: m.benchmark || 0,
        unit: m.unit || '',
      };
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {criterion.icon} {criterion.id}: {criterion.name}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Analysis & Performance Review
            </p>
          </div>
        </div>
        <Link
          to={`/data-entry/criterion/${criterionIndex + 1}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
        >
          <Edit className="w-4 h-4" />
          Edit Data
        </Link>
      </div>

      {/* Score Summary */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {Math.round(criterionScore?.totalEarned || 0)}<span className="text-sm font-normal">/{criterion.weightage}</span>
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Percentage</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {(criterionScore?.percentage || 0).toFixed(1)}%
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>GPA</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {(criterionScore?.gpa || 0).toFixed(2)}<span className="text-sm font-normal">/4.0</span>
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Weightage</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {criterion.weightage}<span className="text-sm font-normal"> pts</span>
          </p>
        </div>
      </div>

      {/* Metric Scores Chart */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Metric-wise Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis type="number" tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
            <YAxis dataKey="name" type="category" width={40} tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px' }}
              formatter={(value: number, name: string) => [value, name === 'earned' ? 'Earned' : 'Max']}
            />
            <Bar dataKey="earned" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.percentage >= 80 ? '#10b981' : entry.percentage >= 50 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark vs Actual */}
      {comparisonData.length > 0 && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Benchmark vs Actual
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual" />
              <Bar dataKey="benchmark" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Benchmark" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metric Details Table */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Detailed Metrics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID</th>
                <th className={`text-left py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metric</th>
                <th className={`text-right py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actual</th>
                <th className={`text-right py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Benchmark</th>
                <th className={`text-right py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</th>
                <th className={`text-right py-3 px-2 font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>%</th>
              </tr>
            </thead>
            <tbody>
              {criterionScore?.metrics.map((ms, i) => {
                const metric = criterion.metrics.find(m => m.id === ms.metricId);
                const actualVal = criterionData[ms.metricId]?.value;
                return (
                  <tr key={ms.metricId} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-2 font-mono text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ms.metricId}</td>
                    <td className={`py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="line-clamp-1">{metric?.label}</span>
                    </td>
                    <td className={`py-3 px-2 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metric?.type === 'calculated' ? '—' : 
                       metric?.type === 'boolean' ? (actualVal ? 'Yes' : 'No') :
                       String(actualVal || '—')}
                    </td>
                    <td className={`py-3 px-2 text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {metric?.benchmark ?? '—'}
                    </td>
                    <td className={`py-3 px-2 text-right font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {ms.earned.toFixed(1)}/{ms.maxScore}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        ms.percentage >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        ms.percentage >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {ms.percentage.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights */}
      <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
        </div>
        <div className={`text-sm space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {criterionScore && criterionScore.percentage < 70 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p>This criterion is scoring below 70%. Focus on improving metrics with highest weightage first.</p>
            </div>
          )}
          {criterionScore && criterionScore.percentage >= 90 && (
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p>Excellent performance! This criterion is near maximum score. Maintain current standards.</p>
            </div>
          )}
          {criterionScore && criterionScore.percentage >= 70 && criterionScore.percentage < 90 && (
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p>Good progress. Identify the weakest metrics and push them closer to benchmarks for maximum impact.</p>
            </div>
          )}
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            💡 Tip: Improving metrics closer to their benchmark gives the best ROI on effort.
          </p>
        </div>
      </div>
    </div>
  );
}
