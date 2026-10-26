import React from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { getDataCompletion, getGapAnalysis } from '../utils/calculations';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReviewSubmit() {
  const { data, scores, darkMode } = useData();
  const completion = getDataCompletion(data);
  const gaps = getGapAnalysis(data);

  const totalMetrics = CRITERIA.reduce((sum, c) => sum + c.metrics.filter(m => m.type !== 'calculated' && m.type !== 'text').length, 0);
  const completedMetrics = CRITERIA.reduce((sum, c) => {
    return sum + c.metrics.filter(m => {
      if (m.type === 'calculated' || m.type === 'text') return false;
      const md = data[c.id]?.[m.id];
      return md && md.value !== '' && md.value !== null && md.value !== undefined;
    }).length;
  }, 0);

  const criticalGaps = gaps.filter(g => g.priority >= 30);
  const allCriteriaComplete = Object.values(completion).every(v => v === 100);
  const canSubmit = completion.overall >= 80;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Review & Submit
        </h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Final checklist before generating your SSR report
        </p>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-2xl border-2 ${
        canSubmit 
          ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/10' 
          : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
      }`}>
        <div className="flex items-center gap-3">
          {canSubmit ? (
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          )}
          <div>
            <h2 className={`text-lg font-bold ${canSubmit ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {canSubmit ? 'Ready for Submission' : 'Data Entry Incomplete'}
            </h2>
            <p className={`text-sm ${canSubmit ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {canSubmit 
                ? 'All criteria have sufficient data. You can proceed to generate the SSR report.'
                : `Complete at least 80% data entry to proceed. Currently at ${completion.overall}%.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Metrics Completed</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{completedMetrics}/{totalMetrics}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Score</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{Math.round(scores.totalScore)}/1000</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CGPA</p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scores.cgpa.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Critical Gaps</p>
          <p className={`text-2xl font-bold ${criticalGaps.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>{criticalGaps.length}</p>
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Criteria-wise Checklist
        </h3>
        <div className="space-y-3">
          {CRITERIA.map((criterion, i) => {
            const comp = completion[criterion.id] || 0;
            const cs = scores.criteria[i];
            return (
              <div key={criterion.id} className={`flex items-center justify-between p-4 rounded-xl border
                ${comp === 100 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 
                  comp > 0 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' :
                  'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  {comp === 100 ? <CheckCircle className="w-5 h-5 text-green-500" /> :
                   comp > 0 ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                   <XCircle className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {criterion.icon} {criterion.id}: {criterion.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Score: {Math.round(cs?.totalEarned || 0)}/{criterion.weightage} | GPA: {(cs?.gpa || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${
                    comp === 100 ? 'text-green-600 dark:text-green-400' : 
                    comp > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                  }`}>{comp}%</span>
                  <Link
                    to={`/data-entry/criterion/${i + 1}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-medium"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Critical Gaps (High Weightage)
          </h3>
          <div className="space-y-2">
            {criticalGaps.slice(0, 8).map(gap => (
              <div key={gap.metricId} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{gap.metricId}: {gap.label.substring(0, 50)}...</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Current: {gap.current} → Benchmark: {gap.benchmark} | Weightage: {gap.priority} pts
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  gap.gap > gap.benchmark! * 0.5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  Gap: {gap.gap.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          <Link to="/analytics/gap-analysis" className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Full Gap Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Submit Button */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generate SSR Report</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Export your Self Study Report in NAAC format
            </p>
          </div>
          <Link
            to="/reports/ssr-generator"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all
              ${canSubmit 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              }`}
            onClick={e => !canSubmit && e.preventDefault()}
          >
            <FileText className="w-4 h-4" />
            Generate SSR Report
          </Link>
        </div>
      </div>
    </div>
  );
}
