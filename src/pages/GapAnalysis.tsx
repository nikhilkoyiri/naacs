import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { CRITERIA, getGradeFromCGPA } from '../data/naacConfig';
import { calculateScores, getGapAnalysis } from '../utils/calculations';
import { AllData } from '../data/sampleData';
import { Sliders, Target, TrendingUp, AlertTriangle, Lightbulb, ArrowUp } from 'lucide-react';

export default function GapAnalysis() {
  const { data, scores, darkMode } = useData();
  const [whatIfData, setWhatIfData] = useState<AllData>(JSON.parse(JSON.stringify(data)));
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const gaps = useMemo(() => getGapAnalysis(data), [data]);
  const whatIfScores = useMemo(() => calculateScores(whatIfData), [whatIfData]);
  
  const cgpaDiff = whatIfScores.cgpa - scores.cgpa;
  const scoreDiff = whatIfScores.totalScore - scores.totalScore;

  const currentGradeInfo = getGradeFromCGPA(scores.cgpa);
  const whatIfGradeInfo = getGradeFromCGPA(whatIfScores.cgpa);

  const nextGrade = getNextGradeTarget(scores.cgpa);

  const handleSliderChange = (criterionId: string, metricId: string, value: number) => {
    setWhatIfData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[criterionId]) next[criterionId] = {};
      next[criterionId][metricId] = { ...next[criterionId][metricId], value };
      return next;
    });
  };

  const handleReset = () => {
    setWhatIfData(JSON.parse(JSON.stringify(data)));
  };

  const handleAutoFill = () => {
    if (!nextGrade) return;
    const newData = JSON.parse(JSON.stringify(whatIfData));
    // Try to improve the weakest metrics first
    const sortedGaps = [...gaps].sort((a, b) => b.priority - a.priority);
    let currentCGPA = whatIfScores.cgpa;
    
    for (const gap of sortedGaps) {
      if (currentCGPA >= nextGrade.cgpaMin) break;
      const metric = CRITERIA.find(c => c.id === gap.criterionId)?.metrics.find(m => m.id === gap.metricId);
      if (!metric || !metric.benchmark) continue;
      
      // Set to benchmark value
      newData[gap.criterionId][gap.metricId] = { 
        ...newData[gap.criterionId][gap.metricId], 
        value: metric.benchmark 
      };
      
      const testScores = calculateScores(newData);
      currentCGPA = testScores.cgpa;
    }
    
    setWhatIfData(newData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gap Analysis & Simulation
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            What-if analysis: Adjust values to see impact on CGPA and grade
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Reset
          </button>
          {nextGrade && (
            <button
              onClick={handleAutoFill}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              Auto-fill to {nextGrade.grade}
            </button>
          )}
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current CGPA</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scores.cgpa.toFixed(2)}</p>
          <p className={`text-sm font-medium mt-1 ${
            currentGradeInfo.grade.startsWith('A') ? 'text-green-600 dark:text-green-400' :
            currentGradeInfo.grade.startsWith('B') ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>Grade: {currentGradeInfo.grade}</p>
        </div>
        <div className={`p-5 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50'}`}>
          <p className={`text-xs ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>What-If CGPA</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{whatIfScores.cgpa.toFixed(2)}</p>
          <p className={`text-sm font-medium mt-1 ${
            cgpaDiff > 0 ? 'text-green-600 dark:text-green-400' : cgpaDiff < 0 ? 'text-red-600 dark:text-red-400' : ''
          }`}>
            {cgpaDiff > 0 ? `+${cgpaDiff.toFixed(2)}` : cgpaDiff < 0 ? cgpaDiff.toFixed(2) : 'No change'} 
            {cgpaDiff !== 0 && ' CGPA'}
          </p>
        </div>
        <div className={`p-5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>What-If Grade</p>
          <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{whatIfGradeInfo.grade}</p>
          <p className={`text-sm font-medium mt-1 ${
            whatIfGradeInfo.grade !== currentGradeInfo.grade ? 'text-green-600 dark:text-green-400' : darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {whatIfGradeInfo.grade !== currentGradeInfo.grade ? `↑ Upgraded from ${currentGradeInfo.grade}` : 'Same grade'}
          </p>
        </div>
      </div>

      {/* Score Change */}
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`} />
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Score Change</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {Math.round(scores.totalScore)} → {Math.round(whatIfScores.totalScore)}
            </span>
            <span className={`text-lg font-bold ${scoreDiff > 0 ? 'text-green-600 dark:text-green-400' : scoreDiff < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
              {scoreDiff > 0 ? '+' : ''}{Math.round(scoreDiff)} pts
            </span>
          </div>
        </div>
      </div>

      {/* What-If Sliders */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Sliders className="w-5 h-5" />
          What-If Sliders
        </h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Adjust the sliders below to simulate improvements and see their impact on your score in real-time.
        </p>

        <div className="space-y-4">
          {gaps.slice(0, 15).map(gap => {
            const criterion = CRITERIA.find(c => c.id === gap.criterionId);
            const metric = criterion?.metrics.find(m => m.id === gap.metricId);
            if (!metric || !metric.benchmark) return null;

            const currentVal = Number(whatIfData[gap.criterionId]?.[gap.metricId]?.value || 0);
            const maxVal = metric.rule === 'lower_is_better' ? metric.benchmark * 2 : metric.benchmark * 2;
            const isExpanded = expandedMetric === gap.metricId;

            return (
              <div key={gap.metricId} className={`p-4 rounded-xl border transition-all
                ${darkMode ? 'bg-gray-750 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{criterion?.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {gap.metricId}: {gap.label}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Weightage: {metric.weightage} pts | Benchmark: {metric.benchmark} {metric.unit || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      currentVal >= (metric.benchmark || 0) ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {metric.rule === 'lower_is_better' ? `${currentVal} ${metric.unit || ''}` : `${currentVal} ${metric.unit || ''}`}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxVal}
                  step={metric.type === 'percent' ? 1 : 1}
                  value={currentVal}
                  onChange={e => handleSliderChange(gap.criterionId, gap.metricId, Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-600
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>0</span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    ← Benchmark: {metric.benchmark}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{maxVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Plan */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Improvement Plan
        </h3>
        <div className={`text-sm space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {nextGrade && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-indigo-900/20 border border-indigo-800' : 'bg-indigo-50 border border-indigo-100'}`}>
              <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-2">
                🎯 Target: {nextGrade.grade} Grade (CGPA ≥ {nextGrade.cgpaMin.toFixed(2)})
              </p>
              <p>You need to improve your total score by approximately {Math.ceil((nextGrade.cgpaMin - scores.cgpa) * 250)} points to reach {nextGrade.grade}.</p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="font-medium">Priority improvements (by weightage impact):</p>
            {gaps.slice(0, 5).map((gap, i) => {
              const metric = CRITERIA.find(c => c.id === gap.criterionId)?.metrics.find(m => m.id === gap.metricId);
              return (
                <div key={gap.metricId} className={`flex items-start gap-2 p-2 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-xs">{gap.label}</p>
                    <p className="text-xs opacity-75">
                      Current: {gap.current} → Target: {gap.benchmark} {metric?.unit || ''} 
                      (Impact: {gap.priority} pts weightage)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-100'}`}>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              💡 Quick Win: Focus on high-weightage metrics where you're close to the benchmark. 
              Even small improvements in C3 (Research, 250 pts) and C2 (Teaching, 200 pts) will have the biggest impact on your CGPA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNextGradeTarget(cgpa: number): { grade: string; cgpaMin: number } | null {
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
    if (cgpa < band.cgpaMin) return band;
  }
  return null;
}
