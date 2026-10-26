import React from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA, getGradeFromCGPA } from '../data/naacConfig';
import { getDataCompletion } from '../utils/calculations';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { scores, data, darkMode } = useData();
  const completion = getDataCompletion(data);

  const radarData = CRITERIA.map((c, i) => ({
    subject: c.shortName,
    score: scores.criteria[i]?.percentage || 0,
    fullMark: 100,
  }));

  const barData = CRITERIA.map((c, i) => ({
    name: c.shortName,
    earned: Math.round(scores.criteria[i]?.totalEarned || 0),
    max: c.weightage,
    color: c.color,
  }));

  const nextGrade = getNextGrade(scores.cgpa);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Executive Dashboard
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Live accreditation score based on entered data
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Academic Year:</span>
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>2024-25</span>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Total Score"
          value={`${Math.round(scores.totalScore)}`}
          subtitle="out of 1000"
          icon={<Target className="w-5 h-5" />}
          color="indigo"
          darkMode={darkMode}
        />
        <ScoreCard
          title="CGPA"
          value={scores.cgpa.toFixed(2)}
          subtitle="out of 4.00"
          icon={<Award className="w-5 h-5" />}
          color="purple"
          darkMode={darkMode}
        />
        <ScoreCard
          title="Predicted Grade"
          value={scores.grade}
          subtitle={scores.status}
          icon={<Award className="w-5 h-5" />}
          color={scores.grade.startsWith('A') ? 'green' : scores.grade.startsWith('B') ? 'yellow' : 'red'}
          darkMode={darkMode}
        />
        <ScoreCard
          title="Data Completion"
          value={`${completion.overall}%`}
          subtitle={`${Object.keys(data).filter(k => completion[k] === 100).length}/7 criteria complete`}
          icon={completion.overall === 100 ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          color={completion.overall >= 80 ? 'green' : completion.overall >= 50 ? 'yellow' : 'red'}
          darkMode={darkMode}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Criteria Performance Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: darkMode ? '#6b7280' : '#9ca3af', fontSize: 10 }} />
              <Radar name="Score %" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Score Distribution by Criteria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: darkMode ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: darkMode ? '#fff' : '#000' }}
              />
              <Bar dataKey="earned" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Criteria Cards */}
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Criterion-wise Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {CRITERIA.map((criterion, i) => {
            const cs = scores.criteria[i];
            const comp = completion[criterion.id] || 0;
            return (
              <Link
                key={criterion.id}
                to={`/criteria/${i + 1}`}
                className={`p-5 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5
                  ${darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{criterion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {criterion.shortName}
                    </h4>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {criterion.weightage} pts max
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Score</span>
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(cs?.totalEarned || 0)}/{criterion.weightage}
                    </span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${cs?.percentage || 0}%`, backgroundColor: criterion.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                      Data: {comp}%
                    </span>
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                      GPA: {(cs?.gpa || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Gap Alert */}
      {nextGrade && (
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Path to {nextGrade.grade} Grade
              </h4>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You need a CGPA of {nextGrade.cgpaMin.toFixed(2)} to achieve {nextGrade.grade}. 
                Current CGPA is {scores.cgpa.toFixed(2)}. You need to improve by {(nextGrade.cgpaMin - scores.cgpa).toFixed(2)} points.
              </p>
              <Link to="/analytics/gap-analysis" className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                View Gap Analysis →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, value, subtitle, icon, color, darkMode }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; color: string; darkMode: boolean;
}) {
  const colorClasses: { [key: string]: string } = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-amber-500 to-yellow-500',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
    </div>
  );
}

function getNextGrade(cgpa: number): { grade: string; cgpaMin: number } | null {
  const bands = [
    { grade: 'A++', cgpaMin: 3.51 },
    { grade: 'A+', cgpaMin: 3.26 },
    { grade: 'A', cgpaMin: 3.01 },
    { grade: 'B++', cgpaMin: 2.76 },
    { grade: 'B+', cgpaMin: 2.51 },
    { grade: 'B', cgpaMin: 2.01 },
    { grade: 'C', cgpaMin: 1.51 },
  ];
  
  for (const band of bands) {
    if (cgpa < band.cgpaMin) {
      return band;
    }
  }
  return null;
}
