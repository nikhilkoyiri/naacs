// NAAC Configuration - 7 Criteria Framework (1000 Total Weightage Points)

export interface Metric {
  id: string;
  label: string;
  type: 'number' | 'percent' | 'boolean' | 'calculated' | 'text';
  benchmark: number | null;
  weightage: number;
  rule?: 'lower_is_better' | 'higher_is_better';
  usedFor?: string;
  unit?: string;
  tooltip?: string;
}

export interface Criterion {
  id: string;
  name: string;
  shortName: string;
  weightage: number;
  keyIndicators: string[];
  metrics: Metric[];
  color: string;
  icon: string;
}

export const GRADE_BANDING = [
  { grade: 'A++', cgpaMin: 3.51, cgpaMax: 4.00, status: 'Accredited' },
  { grade: 'A+', cgpaMin: 3.26, cgpaMax: 3.50, status: 'Accredited' },
  { grade: 'A', cgpaMin: 3.01, cgpaMax: 3.25, status: 'Accredited' },
  { grade: 'B++', cgpaMin: 2.76, cgpaMax: 3.00, status: 'Accredited' },
  { grade: 'B+', cgpaMin: 2.51, cgpaMax: 2.75, status: 'Accredited' },
  { grade: 'B', cgpaMin: 2.01, cgpaMax: 2.50, status: 'Accredited' },
  { grade: 'C', cgpaMin: 1.51, cgpaMax: 2.00, status: 'Accredited' },
  { grade: 'D', cgpaMin: 0.00, cgpaMax: 1.50, status: 'Not Accredited' },
];

export const CRITERIA: Criterion[] = [
  {
    id: 'C1',
    name: 'Curricular Aspects',
    shortName: 'Curriculum',
    weightage: 150,
    color: '#6366f1',
    icon: '📚',
    keyIndicators: ['Curriculum Design & Development', 'Academic Flexibility', 'Curriculum Enrichment', 'Feedback System'],
    metrics: [
      { id: '1.1', label: 'New courses introduced in the year', type: 'number', benchmark: 10, weightage: 20, unit: 'courses', tooltip: 'Number of new courses/programmes introduced during the year' },
      { id: '1.2', label: 'Programmes with syllabus revised in last 5 years (%)', type: 'percent', benchmark: 100, weightage: 30, unit: '%', tooltip: 'Percentage of programmes where syllabus was revised/updated in the last 5 years' },
      { id: '1.3', label: 'Programmes with CBCS / elective system (%)', type: 'percent', benchmark: 100, weightage: 30, unit: '%', tooltip: 'Percentage of programmes following Choice Based Credit System or elective system' },
      { id: '1.4', label: 'Value-added / certificate courses offered', type: 'number', benchmark: 15, weightage: 30, unit: 'courses', tooltip: 'Total number of value-added courses, certificate courses, skill-oriented courses offered' },
      { id: '1.5', label: 'Students undertaking projects / internships (%)', type: 'percent', benchmark: 80, weightage: 20, unit: '%', tooltip: 'Percentage of students who undertook projects, internships, field work during the year' },
      { id: '1.6', label: 'Stakeholder feedback collected and analysed', type: 'boolean', benchmark: 1, weightage: 20, tooltip: 'Whether systematic stakeholder feedback is collected and analysed for curriculum improvement' },
    ]
  },
  {
    id: 'C2',
    name: 'Teaching-Learning and Evaluation',
    shortName: 'Teaching & Learning',
    weightage: 200,
    color: '#8b5cf6',
    icon: '🎓',
    keyIndicators: ['Student Enrolment & Diversity', 'Teaching-Learning Process', 'Teacher Quality', 'Evaluation Process & Reforms', 'Student Performance & Outcomes', 'Student Satisfaction Survey'],
    metrics: [
      { id: '2.1', label: 'Seats filled against seats sanctioned (%)', type: 'percent', benchmark: 100, weightage: 25, unit: '%', tooltip: 'Percentage of sanctioned seats that are filled with students' },
      { id: '2.2', label: 'Total students enrolled', type: 'number', benchmark: null, weightage: 0, usedFor: 'STR', unit: 'students', tooltip: 'Total number of students enrolled in the institution' },
      { id: '2.3', label: 'Total full-time teachers', type: 'number', benchmark: null, weightage: 0, usedFor: 'STR', unit: 'teachers', tooltip: 'Total number of full-time regular teachers on roll' },
      { id: '2.4', label: 'Student-Teacher Ratio', type: 'calculated', benchmark: 20, weightage: 30, rule: 'lower_is_better', unit: ':1', tooltip: 'Auto-calculated: Students ÷ Teachers. Lower is better. Ideal ratio is 20:1 or less.' },
      { id: '2.5', label: 'Teachers with Ph.D. (%)', type: 'percent', benchmark: 80, weightage: 30, unit: '%', tooltip: 'Percentage of teachers holding Ph.D. degree' },
      { id: '2.6', label: 'Average teaching experience (years)', type: 'number', benchmark: 10, weightage: 15, unit: 'years', tooltip: 'Average years of teaching experience of all teachers' },
      { id: '2.7', label: 'Students appeared in final exams', type: 'number', benchmark: null, weightage: 0, usedFor: 'Pass %', unit: 'students', tooltip: 'Total number of students who appeared in final year/semester examinations' },
      { id: '2.8', label: 'Students passed', type: 'number', benchmark: null, weightage: 0, usedFor: 'Pass %', unit: 'students', tooltip: 'Total number of students who passed the final examinations' },
      { id: '2.9', label: 'Pass percentage', type: 'calculated', benchmark: 90, weightage: 40, unit: '%', tooltip: 'Auto-calculated: (Students Passed ÷ Students Appeared) × 100' },
      { id: '2.10', label: 'Student Satisfaction Survey average (out of 5)', type: 'number', benchmark: 4.5, weightage: 30, unit: '/5', tooltip: 'Average score from Student Satisfaction Survey (scale 1-5)' },
      { id: '2.11', label: 'Classes using ICT / LMS tools (%)', type: 'percent', benchmark: 80, weightage: 30, unit: '%', tooltip: 'Percentage of classes conducted using ICT-enabled tools or LMS platforms' },
    ]
  },
  {
    id: 'C3',
    name: 'Research, Innovations and Extension',
    shortName: 'Research',
    weightage: 250,
    color: '#ec4899',
    icon: '🔬',
    keyIndicators: ['Promotion of Research', 'Resource Mobilization', 'Innovation Ecosystem', 'Research Publications & Awards', 'Consultancy', 'Extension Activities', 'Collaborations'],
    metrics: [
      { id: '3.1', label: 'Research papers in Scopus / Web of Science (last 5 yrs)', type: 'number', benchmark: 100, weightage: 50, unit: 'papers', tooltip: 'Number of research papers published in Scopus/Web of Science indexed journals in last 5 years' },
      { id: '3.2', label: 'Books and book chapters published', type: 'number', benchmark: 30, weightage: 20, unit: 'books', tooltip: 'Total books and book chapters published by teachers in last 5 years' },
      { id: '3.3', label: 'Research grants received (INR lakhs)', type: 'number', benchmark: 100, weightage: 40, unit: '₹ lakhs', tooltip: 'Total research grants received from funding agencies in last 5 years (in lakhs)' },
      { id: '3.4', label: 'Patents filed / granted', type: 'number', benchmark: 10, weightage: 30, unit: 'patents', tooltip: 'Number of patents filed and/or granted during the last 5 years' },
      { id: '3.5', label: 'Incubation centres / startups supported', type: 'number', benchmark: 5, weightage: 20, unit: 'centres', tooltip: 'Number of incubation centres and startups supported by the institution' },
      { id: '3.6', label: 'Consultancy revenue (INR lakhs)', type: 'number', benchmark: 25, weightage: 20, unit: '₹ lakhs', tooltip: 'Revenue generated through consultancy projects in last 5 years (in lakhs)' },
      { id: '3.7', label: 'NSS / NCC / extension activities conducted', type: 'number', benchmark: 40, weightage: 30, unit: 'activities', tooltip: 'Number of NSS/NCC and other extension activities conducted in last 5 years' },
      { id: '3.8', label: 'Active MoUs and collaborations', type: 'number', benchmark: 20, weightage: 20, unit: 'MoUs', tooltip: 'Number of active MoUs with industry, academia, government for collaborative activities' },
      { id: '3.9', label: 'Awards and recognitions won by faculty / students', type: 'number', benchmark: 25, weightage: 20, unit: 'awards', tooltip: 'Number of awards and recognitions received by faculty and students in last 5 years' },
    ]
  },
  {
    id: 'C4',
    name: 'Infrastructure and Learning Resources',
    shortName: 'Infrastructure',
    weightage: 100,
    color: '#f59e0b',
    icon: '🏛️',
    keyIndicators: ['Physical Facilities', 'Library as a Learning Resource', 'IT Infrastructure', 'Campus Maintenance'],
    metrics: [
      { id: '4.1', label: 'ICT-enabled classrooms (%)', type: 'percent', benchmark: 100, weightage: 20, unit: '%', tooltip: 'Percentage of classrooms equipped with ICT facilities (projector, smart board, etc.)' },
      { id: '4.2', label: 'Internet bandwidth (Mbps)', type: 'number', benchmark: 1000, weightage: 15, unit: 'Mbps', tooltip: 'Total internet bandwidth available on campus' },
      { id: '4.3', label: 'Student-computer ratio (students per computer)', type: 'number', benchmark: 5, weightage: 15, rule: 'lower_is_better', unit: ':1', tooltip: 'Number of students per computer. Lower is better. Ideal is 5:1 or less.' },
      { id: '4.4', label: 'Library books + e-resources count', type: 'number', benchmark: 50000, weightage: 20, unit: 'resources', tooltip: 'Total number of books, e-books, and e-resources available in the library' },
      { id: '4.5', label: 'E-journal / INFLIBNET subscription active', type: 'boolean', benchmark: 1, weightage: 10, tooltip: 'Whether the institution has an active INFLIBNET/e-journal subscription' },
      { id: '4.6', label: 'Annual library usage (visits per student)', type: 'number', benchmark: 50, weightage: 10, unit: 'visits', tooltip: 'Average number of library visits per student per year' },
      { id: '4.7', label: 'Maintenance expenditure (% of total budget)', type: 'percent', benchmark: 10, weightage: 10, unit: '%', tooltip: 'Percentage of total budget spent on campus maintenance' },
    ]
  },
  {
    id: 'C5',
    name: 'Student Support and Progression',
    shortName: 'Student Support',
    weightage: 100,
    color: '#10b981',
    icon: '🤝',
    keyIndicators: ['Student Support', 'Student Progression', 'Student Participation & Activities', 'Alumni Engagement'],
    metrics: [
      { id: '5.1', label: 'Students receiving scholarships / freeships (%)', type: 'percent', benchmark: 40, weightage: 15, unit: '%', tooltip: 'Percentage of students receiving government/institutional scholarships or freeships' },
      { id: '5.2', label: 'Students benefitting from career counselling / coaching (%)', type: 'percent', benchmark: 70, weightage: 15, unit: '%', tooltip: 'Percentage of students who received career guidance, coaching for competitive exams' },
      { id: '5.3', label: 'Placement percentage of eligible students', type: 'percent', benchmark: 80, weightage: 25, unit: '%', tooltip: 'Percentage of eligible students who got placed through campus recruitment' },
      { id: '5.4', label: 'Students progressing to higher education (%)', type: 'percent', benchmark: 30, weightage: 15, unit: '%', tooltip: 'Percentage of graduating students who enrolled in higher education programmes' },
      { id: '5.5', label: 'Students qualifying NET / GATE / CAT / UPSC etc.', type: 'number', benchmark: 50, weightage: 15, unit: 'students', tooltip: 'Number of students qualifying national/state level competitive exams in last 5 years' },
      { id: '5.6', label: 'Sports and cultural awards won by students', type: 'number', benchmark: 30, weightage: 10, unit: 'awards', tooltip: 'Number of sports and cultural awards won by students at university/state/national level' },
      { id: '5.7', label: 'Alumni contribution (INR lakhs) / alumni meets held', type: 'number', benchmark: 10, weightage: 5, unit: '₹ lakhs', tooltip: 'Total alumni contribution in lakhs or number of alumni meets organized' },
    ]
  },
  {
    id: 'C6',
    name: 'Governance, Leadership and Management',
    shortName: 'Governance',
    weightage: 100,
    color: '#06b6d4',
    icon: '🏢',
    keyIndicators: ['Institutional Vision & Leadership', 'Strategy Development', 'Faculty Empowerment', 'Financial Management', 'Internal Quality Assurance System'],
    metrics: [
      { id: '6.1', label: 'E-governance modules implemented', type: 'number', benchmark: 4, weightage: 20, unit: 'modules', tooltip: 'Number of e-governance modules implemented (admin, finance, admission, exam)' },
      { id: '6.2', label: 'Teachers given financial support for conferences / training (%)', type: 'percent', benchmark: 50, weightage: 20, unit: '%', tooltip: 'Percentage of teachers who received financial support for attending conferences, training, FDPs' },
      { id: '6.3', label: 'Faculty Development Programmes attended per teacher', type: 'number', benchmark: 2, weightage: 15, unit: 'FDPs', tooltip: 'Average number of Faculty Development Programmes attended per teacher in the year' },
      { id: '6.4', label: 'Financial audit completed', type: 'boolean', benchmark: 1, weightage: 15, tooltip: 'Whether annual financial audit has been completed and submitted' },
      { id: '6.5', label: 'IQAC meetings held in the year', type: 'number', benchmark: 4, weightage: 15, unit: 'meetings', tooltip: 'Number of IQAC meetings conducted during the year' },
      { id: '6.6', label: 'Quality initiatives from IQAC (NIRF, ISO, audits)', type: 'number', benchmark: 5, weightage: 15, unit: 'initiatives', tooltip: 'Number of quality initiatives undertaken by IQAC (NIRF filing, ISO certification, audits, etc.)' },
    ]
  },
  {
    id: 'C7',
    name: 'Institutional Values and Best Practices',
    shortName: 'Values & Practices',
    weightage: 100,
    color: '#f97316',
    icon: '🌿',
    keyIndicators: ['Institutional Values & Social Responsibilities', 'Best Practices', 'Institutional Distinctiveness'],
    metrics: [
      { id: '7.1', label: 'Gender equity / sensitisation programmes held', type: 'number', benchmark: 6, weightage: 15, unit: 'programmes', tooltip: 'Number of gender equity and sensitisation programmes conducted in the year' },
      { id: '7.2', label: 'Renewable energy share of total power (%)', type: 'percent', benchmark: 30, weightage: 20, unit: '%', tooltip: 'Percentage of total power consumption from renewable energy sources (solar, wind, etc.)' },
      { id: '7.3', label: 'Green audit / energy audit / environment audit done', type: 'number', benchmark: 3, weightage: 15, unit: 'audits', tooltip: 'Number of green/energy/environment audits conducted' },
      { id: '7.4', label: 'Divyangjan-friendly facilities available (%)', type: 'percent', benchmark: 100, weightage: 15, unit: '%', tooltip: 'Percentage of Divyangjan (differently-abled) friendly facilities available on campus' },
      { id: '7.5', label: 'Code of conduct and values programmes held', type: 'number', benchmark: 5, weightage: 15, unit: 'programmes', tooltip: 'Number of programmes on code of conduct, ethics, values, human values conducted' },
      { id: '7.6', label: 'Best practices documented', type: 'number', benchmark: 2, weightage: 10, unit: 'practices', tooltip: 'Number of best practices documented with evidence (minimum 2 required)' },
      { id: '7.7', label: 'Institutional distinctiveness statement', type: 'text', benchmark: 1, weightage: 10, tooltip: 'A 500-word statement describing what makes your institution unique and distinctive' },
    ]
  }
];

export const ACADEMIC_YEARS = ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'];

export function getGradeFromCGPA(cgpa: number): { grade: string; status: string } {
  for (const band of GRADE_BANDING) {
    if (cgpa >= band.cgpaMin && cgpa <= band.cgpaMax) {
      return { grade: band.grade, status: band.status };
    }
  }
  return { grade: 'D', status: 'Not Accredited' };
}
