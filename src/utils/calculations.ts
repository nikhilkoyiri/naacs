import { CRITERIA, getGradeFromCGPA } from '../data/naacConfig';
import { AllData } from '../data/sampleData';

export interface MetricScore {
  metricId: string;
  earned: number;
  maxScore: number;
  percentage: number;
}

export interface CriterionScore {
  criterionId: string;
  totalEarned: number;
  maxScore: number;
  percentage: number;
  gpa: number;
  metrics: MetricScore[];
}

export interface AssessmentResult {
  criteria: CriterionScore[];
  totalScore: number;
  cgpa: number;
  grade: string;
  status: string;
}

function calculateMetricScore(
  metricId: string,
  value: number | string | boolean,
  benchmark: number | null,
  weightage: number,
  rule?: string,
  type?: string
): { earned: number; maxScore: number } {
  if (type === 'calculated') {
    return { earned: 0, maxScore: weightage }; // Will be calculated from dependent metrics
  }

  if (type === 'text') {
    // Text metrics: if non-empty and reasonable length, give full score
    const textVal = String(value || '').trim();
    if (textVal.length > 50) {
      return { earned: weightage, maxScore: weightage };
    } else if (textVal.length > 10) {
      return { earned: weightage * 0.5, maxScore: weightage };
    }
    return { earned: 0, maxScore: weightage };
  }

  if (type === 'boolean') {
    const boolVal = value === true || value === 'true' || value === 1;
    return { earned: boolVal ? weightage : 0, maxScore: weightage };
  }

  if (benchmark === null || benchmark === 0) {
    return { earned: 0, maxScore: 0 }; // Supporting metric, no direct score
  }

  const numValue = Number(value);
  if (isNaN(numValue) || value === '' || value === null || value === undefined) {
    return { earned: 0, maxScore: weightage };
  }

  let ratio: number;
  if (rule === 'lower_is_better') {
    // Lower actual is better. If actual <= benchmark, full score
    ratio = numValue <= benchmark ? 1 : benchmark / numValue;
  } else {
    // Higher actual is better. If actual >= benchmark, full score
    ratio = Math.min(numValue / benchmark, 1);
  }

  return { earned: ratio * weightage, maxScore: weightage };
}

export function calculateScores(data: AllData): AssessmentResult {
  const criteriaScores: CriterionScore[] = [];
  let totalScore = 0;

  CRITERIA.forEach(criterion => {
    const criterionData = data[criterion.id] || {};
    let criterionTotal = 0;
    let criterionMax = 0;
    const metricScores: MetricScore[] = [];

    // First pass: calculate non-calculated metrics
    criterion.metrics.forEach(metric => {
      if (metric.type !== 'calculated') {
        const metricData = criterionData[metric.id];
        const value = metricData?.value ?? '';
        const { earned, maxScore } = calculateMetricScore(
          metric.id, value, metric.benchmark, metric.weightage, metric.rule, metric.type
        );
        metricScores.push({
          metricId: metric.id,
          earned,
          maxScore,
          percentage: maxScore > 0 ? (earned / maxScore) * 100 : 0,
        });
        criterionTotal += earned;
        criterionMax += maxScore;
      }
    });

    // Second pass: calculate dependent metrics
    // STR (2.4) = students / teachers
    const students = Number(criterionData['2.2']?.value || 0);
    const teachers = Number(criterionData['2.3']?.value || 0);
    if (criterion.id === 'C2' && teachers > 0) {
      const str = students / teachers;
      const strBenchmark = 20;
      const strRatio = str <= strBenchmark ? 1 : strBenchmark / str;
      const strWeightage = 30;
      const strEarned = strRatio * strWeightage;
      metricScores.push({
        metricId: '2.4',
        earned: strEarned,
        maxScore: strWeightage,
        percentage: (strEarned / strWeightage) * 100,
      });
      criterionTotal += strEarned;
      criterionMax += strWeightage;
    } else if (criterion.id === 'C2') {
      metricScores.push({ metricId: '2.4', earned: 0, maxScore: 30, percentage: 0 });
      criterionMax += 30;
    }

    // Pass % (2.9) = passed / appeared * 100
    const appeared = Number(criterionData['2.7']?.value || 0);
    const passed = Number(criterionData['2.8']?.value || 0);
    if (criterion.id === 'C2' && appeared > 0) {
      const passPercent = (passed / appeared) * 100;
      const passBenchmark = 90;
      const passRatio = Math.min(passPercent / passBenchmark, 1);
      const passWeightage = 40;
      const passEarned = passRatio * passWeightage;
      metricScores.push({
        metricId: '2.9',
        earned: passEarned,
        maxScore: passWeightage,
        percentage: (passEarned / passWeightage) * 100,
      });
      criterionTotal += passEarned;
      criterionMax += passWeightage;
    } else if (criterion.id === 'C2') {
      metricScores.push({ metricId: '2.9', earned: 0, maxScore: 40, percentage: 0 });
      criterionMax += 40;
    }

    const criterionScore: CriterionScore = {
      criterionId: criterion.id,
      totalEarned: criterionTotal,
      maxScore: criterion.weightage,
      percentage: (criterionTotal / criterion.weightage) * 100,
      gpa: (criterionTotal / criterion.weightage) * 4.0,
      metrics: metricScores,
    };

    criteriaScores.push(criterionScore);
    totalScore += criterionTotal;
  });

  // CGPA = weighted average
  const cgpa = criteriaScores.reduce((sum, cs) => {
    return sum + (cs.gpa * cs.maxScore);
  }, 0) / 1000;

  const { grade, status } = getGradeFromCGPA(cgpa);

  return {
    criteria: criteriaScores,
    totalScore,
    cgpa: Math.min(cgpa, 4.0),
    grade,
    status,
  };
}

export function getDataCompletion(data: AllData): { [key: string]: number } {
  const completion: { [key: string]: number } = {};
  let totalCompleted = 0;
  let totalMetrics = 0;

  CRITERIA.forEach(criterion => {
    let completed = 0;
    let total = criterion.metrics.filter(m => m.type !== 'calculated').length;
    
    criterion.metrics.forEach(metric => {
      if (metric.type === 'calculated') return;
      const metricData = data[criterion.id]?.[metric.id];
      if (metricData && metricData.status !== 'not_started' && metricData.value !== '' && metricData.value !== null && metricData.value !== undefined) {
        completed++;
      }
    });

    completion[criterion.id] = total > 0 ? Math.round((completed / total) * 100) : 0;
    totalCompleted += completed;
    totalMetrics += total;
  });

  completion['overall'] = totalMetrics > 0 ? Math.round((totalCompleted / totalMetrics) * 100) : 0;
  return completion;
}

export function getGapAnalysis(data: AllData): { metricId: string; criterionId: string; label: string; current: number; benchmark: number; gap: number; priority: number }[] {
  const gaps: { metricId: string; criterionId: string; label: string; current: number; benchmark: number; gap: number; priority: number }[] = [];

  CRITERIA.forEach(criterion => {
    criterion.metrics.forEach(metric => {
      if (metric.type === 'calculated' || metric.type === 'text' || metric.benchmark === null) return;
      
      const metricData = data[criterion.id]?.[metric.id];
      let current: number;

      if (metric.type === 'boolean') {
        current = metricData?.value ? 1 : 0;
      } else {
        current = Number(metricData?.value || 0);
      }

      const benchmark = metric.benchmark;
      let gap: number;

      if (metric.rule === 'lower_is_better') {
        gap = current > benchmark ? current - benchmark : 0;
      } else {
        gap = benchmark - current;
      }

      if (gap > 0) {
        gaps.push({
          metricId: metric.id,
          criterionId: criterion.id,
          label: metric.label,
          current,
          benchmark,
          gap,
          priority: metric.weightage,
        });
      }
    });
  });

  // Sort by priority (weightage) descending
  gaps.sort((a, b) => b.priority - a.priority);
  return gaps;
}
