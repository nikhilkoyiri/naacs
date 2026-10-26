import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CRITERIA } from '../data/naacConfig';
import { calculateScores } from '../utils/calculations';
import { ArrowLeft, ArrowRight, Info, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export default function CriterionForm() {
  const { n } = useParams<{ n: string }>();
  const navigate = useNavigate();
  const { data, updateMetric, darkMode, showToast } = useData();
  const criterionIndex = parseInt(n || '1') - 1;
  const criterion = CRITERIA[criterionIndex];
  const [localData, setLocalData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (criterion) {
      const ld: { [key: string]: any } = {};
      criterion.metrics.forEach(m => {
        ld[m.id] = data[criterion.id]?.[m.id]?.value ?? '';
      });
      setLocalData(ld);
    }
  }, [criterion, data]);

  if (!criterion) {
    return <div className="text-center py-20">Criterion not found</div>;
  }

  const handleChange = (metricId: string, value: any) => {
    setLocalData(prev => ({ ...prev, [metricId]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[metricId];
      return next;
    });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    criterion.metrics.forEach(metric => {
      const val = localData[metric.id];
      if (metric.type === 'number' || metric.type === 'percent') {
        if (val !== '' && val !== null && val !== undefined) {
          const num = Number(val);
          if (isNaN(num)) {
            newErrors[metric.id] = 'Must be a valid number';
          } else if (num < 0) {
            newErrors[metric.id] = 'Cannot be negative';
          } else if (metric.type === 'percent' && num > 100) {
            newErrors[metric.id] = 'Cannot exceed 100%';
          }
        }
      }
      // Special validations
      if (metric.id === '2.8' && localData['2.7']) {
        const appeared = Number(localData['2.7']);
        const passed = Number(val || 0);
        if (passed > appeared && appeared > 0) {
          newErrors[metric.id] = 'Passed cannot exceed appeared students';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      showToast('Please fix validation errors before saving.', 'error');
      return;
    }
    criterion.metrics.forEach(metric => {
      const val = localData[metric.id];
      if (val !== '' && val !== null && val !== undefined) {
        let processedVal: number | string | boolean = val;
        if (metric.type === 'boolean') {
          processedVal = val === true || val === 'true';
        } else if (metric.type === 'number' || metric.type === 'percent') {
          processedVal = Number(val);
        }
        updateMetric(criterion.id, metric.id, processedVal);
      }
    });
    showToast('Data saved successfully!', 'success');
  };

  const handleAutoSave = (metricId: string, value: any) => {
    handleChange(metricId, value);
    const metric = criterion.metrics.find(m => m.id === metricId);
    if (metric && value !== '' && value !== null) {
      let processedVal: number | string | boolean = value;
      if (metric.type === 'boolean') processedVal = value === true || value === 'true';
      else if (metric.type === 'number' || metric.type === 'percent') processedVal = Number(value);
      updateMetric(criterion.id, metricId, processedVal);
    }
  };

  // Calculate live preview scores
  const previewData = { ...data };
  criterion.metrics.forEach(m => {
    if (!previewData[criterion.id]) previewData[criterion.id] = {};
    const val = localData[m.id];
    if (val !== '' && val !== null && val !== undefined) {
      previewData[criterion.id][m.id] = { value: val, status: 'completed' as const };
    }
  });
  const previewScores = calculateScores(previewData);
  const criterionScore = previewScores.criteria[criterionIndex];

  // Calculated values for display
  const students = Number(localData['2.2'] || 0);
  const teachers = Number(localData['2.3'] || 0);
  const str = teachers > 0 ? (students / teachers).toFixed(1) : '—';
  const appeared = Number(localData['2.7'] || 0);
  const passed = Number(localData['2.8'] || 0);
  const passPercent = appeared > 0 ? ((passed / appeared) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/data-entry"
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {criterion.icon} {criterion.id}: {criterion.name}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {criterion.weightage} weightage points • {criterion.metrics.length} metrics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            Score: {Math.round(criterionScore?.totalEarned || 0)}/{criterion.weightage}
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
          >
            Save All
          </button>
        </div>
      </div>

      {/* Key Indicators */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Key Indicators</h3>
        <div className="flex flex-wrap gap-2">
          {criterion.keyIndicators.map((ki, i) => (
            <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {ki}
            </span>
          ))}
        </div>
      </div>

      {/* Metric Forms */}
      <div className="space-y-4">
        {criterion.metrics.map(metric => {
          const val = localData[metric.id] ?? '';
          const error = errors[metric.id];
          const isCalculated = metric.type === 'calculated';
          const hasData = val !== '' && val !== null && val !== undefined;

          // Calculate metric score for preview
          const metricScore = criterionScore?.metrics.find(ms => ms.metricId === metric.id);
          const scorePercent = metricScore?.percentage || 0;

          return (
            <div key={metric.id} className={`p-5 rounded-xl border transition-all
              ${error ? 'border-red-300 dark:border-red-800' : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold
                      ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {metric.id}
                    </span>
                    <h4 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metric.label}
                    </h4>
                    <button
                      onClick={() => setShowTooltip(showTooltip === metric.id ? null : metric.id)}
                      className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <HelpCircle className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  {showTooltip === metric.id && metric.tooltip && (
                    <div className={`mt-2 p-3 rounded-lg text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'}`}>
                      {metric.tooltip}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {metric.weightage} pts
                  </span>
                  {hasData && !isCalculated && (
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      scorePercent >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      scorePercent >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {scorePercent.toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>

              {/* Calculated fields display */}
              {isCalculated && metric.id === '2.4' && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                    Auto-calculated: {str}:1 (Students: {students || '—'} ÷ Teachers: {teachers || '—'})
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
                    Benchmark: 20:1 or lower. {Number(str) > 25 ? '⚠️ Warning: STR above 25:1' : Number(str) <= 20 && teachers > 0 ? '✅ Within benchmark' : ''}
                  </p>
                </div>
              )}
              {isCalculated && metric.id === '2.9' && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                    Auto-calculated: {passPercent}% (Passed: {passed || '—'} ÷ Appeared: {appeared || '—'})
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-indigo-600'}`}>
                    Benchmark: 90% or higher
                  </p>
                </div>
              )}

              {/* Input field */}
              {!isCalculated && (
                <div>
                  {metric.type === 'boolean' ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAutoSave(metric.id, true)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${val === true || val === 'true'
                            ? 'bg-green-500 text-white'
                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ✓ Yes
                      </button>
                      <button
                        onClick={() => handleAutoSave(metric.id, false)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${val === false || val === 'false'
                            ? 'bg-red-500 text-white'
                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        ✗ No
                      </button>
                    </div>
                  ) : metric.type === 'text' ? (
                    <textarea
                      value={String(val || '')}
                      onChange={e => handleAutoSave(metric.id, e.target.value)}
                      placeholder="Enter your institutional distinctiveness statement (min 500 words recommended)..."
                      rows={4}
                      className={`w-full p-3 rounded-lg border text-sm resize-none transition-all
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                        ${error ? 'border-red-400' : 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type={metric.type === 'percent' ? 'number' : 'number'}
                        value={val}
                        onChange={e => handleAutoSave(metric.id, e.target.value)}
                        placeholder={`Enter ${metric.unit || 'value'}...`}
                        step={metric.type === 'percent' ? '0.1' : metric.id === '2.10' ? '0.1' : '1'}
                        min={0}
                        max={metric.type === 'percent' ? 100 : undefined}
                        className={`w-full p-3 pr-16 rounded-lg border text-sm transition-all
                          ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}
                          ${error ? 'border-red-400' : 'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                      />
                      {metric.unit && (
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {metric.unit}
                        </span>
                      )}
                    </div>
                  )}
                  {error && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {error}
                    </p>
                  )}
                  {metric.benchmark !== null && !isCalculated && (
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Benchmark: {metric.benchmark} {metric.unit || ''} {metric.rule === 'lower_is_better' ? '(lower is better)' : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {criterionIndex > 0 ? (
          <Link
            to={`/data-entry/criterion/${criterionIndex}`}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border
              ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous: C{criterionIndex}
          </Link>
        ) : <div />}
        {criterionIndex < 6 ? (
          <Link
            to={`/data-entry/criterion/${criterionIndex + 2}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
          >
            Next: C{criterionIndex + 2}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to="/data-entry/review"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:shadow-lg transition-all"
          >
            Review & Submit
            <CheckCircle className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
