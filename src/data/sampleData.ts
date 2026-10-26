import { CRITERIA } from './naacConfig';

export interface MetricData {
  value: number | string | boolean;
  status: 'not_started' | 'draft' | 'completed' | 'verified';
  evidence?: string[];
}

export interface CriterionData {
  [metricId: string]: MetricData;
}

export interface AllData {
  [criterionId: string]: CriterionData;
}

export function generateSampleData(): AllData {
  const data: AllData = {};
  
  // C1 - Curricular Aspects (target ~70% of 150)
  data['C1'] = {
    '1.1': { value: 8, status: 'completed' },
    '1.2': { value: 85, status: 'completed' },
    '1.3': { value: 90, status: 'completed' },
    '1.4': { value: 12, status: 'completed' },
    '1.5': { value: 65, status: 'completed' },
    '1.6': { value: true, status: 'completed' },
  };

  // C2 - Teaching-Learning (target ~75% of 200)
  data['C2'] = {
    '2.1': { value: 92, status: 'completed' },
    '2.2': { value: 3200, status: 'completed' },
    '2.3': { value: 180, status: 'completed' },
    '2.4': { value: 0, status: 'completed' }, // calculated
    '2.5': { value: 55, status: 'completed' },
    '2.6': { value: 8, status: 'completed' },
    '2.7': { value: 780, status: 'completed' },
    '2.8': { value: 720, status: 'completed' },
    '2.9': { value: 0, status: 'completed' }, // calculated
    '2.10': { value: 3.8, status: 'completed' },
    '2.11': { value: 70, status: 'completed' },
  };

  // C3 - Research (target ~60% of 250)
  data['C3'] = {
    '3.1': { value: 65, status: 'completed' },
    '3.2': { value: 18, status: 'completed' },
    '3.3': { value: 55, status: 'completed' },
    '3.4': { value: 4, status: 'completed' },
    '3.5': { value: 2, status: 'completed' },
    '3.6': { value: 12, status: 'completed' },
    '3.7': { value: 28, status: 'completed' },
    '3.8': { value: 12, status: 'completed' },
    '3.9': { value: 15, status: 'completed' },
  };

  // C4 - Infrastructure (target ~80% of 100)
  data['C4'] = {
    '4.1': { value: 75, status: 'completed' },
    '4.2': { value: 500, status: 'completed' },
    '4.3': { value: 8, status: 'completed' },
    '4.4': { value: 35000, status: 'completed' },
    '4.5': { value: true, status: 'completed' },
    '4.6': { value: 35, status: 'completed' },
    '4.7': { value: 8, status: 'completed' },
  };

  // C5 - Student Support (target ~70% of 100)
  data['C5'] = {
    '5.1': { value: 35, status: 'completed' },
    '5.2': { value: 55, status: 'completed' },
    '5.3': { value: 60, status: 'completed' },
    '5.4': { value: 22, status: 'completed' },
    '5.5': { value: 28, status: 'completed' },
    '5.6': { value: 18, status: 'completed' },
    '5.7': { value: 6, status: 'completed' },
  };

  // C6 - Governance (target ~75% of 100)
  data['C6'] = {
    '6.1': { value: 3, status: 'completed' },
    '6.2': { value: 40, status: 'completed' },
    '6.3': { value: 1.5, status: 'completed' },
    '6.4': { value: true, status: 'completed' },
    '6.5': { value: 4, status: 'completed' },
    '6.6': { value: 3, status: 'completed' },
  };

  // C7 - Values & Practices (target ~70% of 100)
  data['C7'] = {
    '7.1': { value: 5, status: 'completed' },
    '7.2': { value: 18, status: 'completed' },
    '7.3': { value: 2, status: 'completed' },
    '7.4': { value: 75, status: 'completed' },
    '7.5': { value: 4, status: 'completed' },
    '7.6': { value: 2, status: 'completed' },
    '7.7': { value: 'Our institution stands out for its commitment to rural development and community engagement. Over the past decade, we have pioneered a unique model of integrating academic learning with grassroots social work, where every student spends 40 hours per semester working with local communities on sustainable development projects. This has resulted in measurable improvements in literacy rates, health awareness, and agricultural practices in 15 surrounding villages. Additionally, our institution is recognized for its innovative approach to integrating traditional knowledge systems with modern scientific education, particularly in areas of herbal medicine, sustainable architecture, and water conservation. Our campus serves as a living laboratory for environmental sustainability, with rainwater harvesting, organic waste management, and solar energy systems that students help maintain as part of their curriculum.', status: 'completed' },
  };

  return data;
}

export function getEmptyData(): AllData {
  const data: AllData = {};
  CRITERIA.forEach(criterion => {
    data[criterion.id] = {};
    criterion.metrics.forEach(metric => {
      data[criterion.id][metric.id] = { value: '', status: 'not_started' };
    });
  });
  return data;
}
