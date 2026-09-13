import { Question, LearningResource } from './types';

/* =========================================================================
 * PragatiAI demo data. In production this comes from the PostgreSQL-backed
 * API; here it is a realistic local question bank & catalogue.
 * ======================================================================= */

export const PLATFORM_NAME = 'PragatiAI';
export const PLATFORM_SUBNAME = 'Personalized Competency & Learning Platform for iGOT Karmayogi';

export const ROLES = [
  'Statistical Investigator',
  'Statistical Officer',
  'Assistant Director (Statistics)',
  'Junior Statistical Officer',
  'Data Processing Assistant',
];

export const ORGANIZATIONS = [
  'National Statistical Office',
  'State Statistical Bureau',
  'Ministry of Statistics & Programme Implementation',
  'District Statistics Office',
  'Office of the Registrar General of India',
];

export const QUALIFICATIONS = [
  'B.A. / B.Sc. (Statistics)',
  'M.A. / M.Sc. (Statistics)',
  'B.Tech / B.E.',
  'MCA',
  'MBA',
  'Ph.D.',
  'Other',
];

export interface RoleCompetencyDef {
  competencyId: string;
  name: string;
  requiredScore: number;
}

/* Role competency model — required levels per role */
export const COMPETENCIES_BY_ROLE: Record<string, RoleCompetencyDef[]> = {
  'Statistical Investigator': [
    { competencyId: 'dm', name: 'Data Management', requiredScore: 75 },
    { competencyId: 'sa', name: 'Statistical Analysis', requiredScore: 75 },
    { competencyId: 'dv', name: 'Data Visualization', requiredScore: 75 },
    { competencyId: 'sm', name: 'Statistical Methods', requiredScore: 70 },
    { competencyId: 'di', name: 'Data Interpretation', requiredScore: 70 },
    { competencyId: 'qa', name: 'Quality Assurance', requiredScore: 65 },
  ],
  'Statistical Officer': [
    { competencyId: 'sa', name: 'Statistical Analysis', requiredScore: 80 },
    { competencyId: 'sm', name: 'Statistical Methods', requiredScore: 80 },
    { competencyId: 'di', name: 'Data Interpretation', requiredScore: 75 },
    { competencyId: 'dm', name: 'Data Management', requiredScore: 70 },
    { competencyId: 'dv', name: 'Data Visualization', requiredScore: 70 },
    { competencyId: 'os', name: 'Official Statistics', requiredScore: 80 },
  ],
  'Assistant Director (Statistics)': [
    { competencyId: 'sa', name: 'Statistical Analysis', requiredScore: 85 },
    { competencyId: 'sm', name: 'Statistical Methods', requiredScore: 85 },
    { competencyId: 'di', name: 'Data Interpretation', requiredScore: 80 },
    { competencyId: 'qa', name: 'Quality Assurance', requiredScore: 75 },
    { competencyId: 'os', name: 'Official Statistics', requiredScore: 85 },
    { competencyId: 'dv', name: 'Data Visualization', requiredScore: 70 },
  ],
  'Junior Statistical Officer': [
    { competencyId: 'dm', name: 'Data Management', requiredScore: 70 },
    { competencyId: 'sm', name: 'Statistical Methods', requiredScore: 70 },
    { competencyId: 'dv', name: 'Data Visualization', requiredScore: 65 },
    { competencyId: 'di', name: 'Data Interpretation', requiredScore: 70 },
    { competencyId: 'qa', name: 'Quality Assurance', requiredScore: 65 },
    { competencyId: 'os', name: 'Official Statistics', requiredScore: 65 },
  ],
  'Data Processing Assistant': [
    { competencyId: 'dm', name: 'Data Management', requiredScore: 75 },
    { competencyId: 'qa', name: 'Quality Assurance', requiredScore: 70 },
    { competencyId: 'dv', name: 'Data Visualization', requiredScore: 60 },
    { competencyId: 'sm', name: 'Statistical Methods', requiredScore: 60 },
    { competencyId: 'di', name: 'Data Interpretation', requiredScore: 65 },
    { competencyId: 'os', name: 'Official Statistics', requiredScore: 60 },
  ],
};

/* Initial baseline (pre-assessment) score the UI shows before the first test */
export const BASELINE_SCORE = 0;

/* =========================================================================
 * QUESTION BANK
 * Tagged by competency + difficulty. The initial assessment samples
 * questions for the user's role competencies; the AI quiz generator
 * filters by gaps/difficulty. A real LLM service would replace this.
 * ======================================================================= */
export const QUESTION_BANK: Question[] = [
  /* ---------- Data Management ---------- */
  {
    id: 'dm-1', competency: 'Data Management', difficulty: 'easy',
    question: 'What does "data normalization" mean in a database context?',
    options: ['Deleting duplicate rows manually', 'Organizing data to reduce redundancy and improve integrity', 'Storing all data in a single flat file', 'Encrypting data at rest'],
    correctAnswer: 1,
    explanation: 'Normalization structures data across related tables to reduce redundancy and improve integrity.',
  },
  {
    id: 'dm-2', competency: 'Data Management', difficulty: 'easy',
    question: 'Which practice BEST ensures the accuracy of collected survey data?',
    options: ['Storing data only once collected', 'Cross-referencing, range checks and duplicate detection during entry', 'Deleting outlier values automatically', 'Renaming files periodically'],
    correctAnswer: 1,
    explanation: 'Validation techniques such as cross-referencing, range checks and duplicate detection catch errors early.',
  },
  {
    id: 'dm-3', competency: 'Data Management', difficulty: 'medium',
    question: 'A field office sends monthly data in different file formats and layouts. What is the best first step to standardize it?',
    options: ['Ask each office to stop sending data', 'Define a common data dictionary and standardized intake template', 'Merge files as-is and fix issues later', 'Convert everything to images for review'],
    correctAnswer: 1,
    explanation: 'A common data dictionary and standardized intake template ensure consistency before analysis begins.',
  },
  {
    id: 'dm-4', competency: 'Data Management', difficulty: 'medium',
    question: 'In metadata management, what does a "data dictionary" describe?',
    options: ['Translation of survey questionnaires', 'Definitions, formats, and allowable values of each data element', 'A list of authorized users', 'Statistical formulas'],
    correctAnswer: 1,
    explanation: 'A data dictionary documents the meaning, type, format and allowable values of every data element.',
  },
  {
    id: 'dm-5', competency: 'Data Management', difficulty: 'hard',
    question: 'Which retention approach aligns with official statistics data governance?',
    options: ['Keep everything forever with no policy', 'A documented retention schedule with defined archival and disposal rules', 'Delete data after first publication', 'Store data on personal drives'],
    correctAnswer: 1,
    explanation: 'A documented retention schedule with archival and disposal rules supports compliance and reproducibility.',
  },
  {
    id: 'dm-6', competency: 'Data Management', difficulty: 'easy',
    question: 'Which of these is a primary key property in a well-designed table?',
    options: ['It may repeat across rows', 'It uniquely identifies each record', 'It is always textual', 'It changes frequently'],
    correctAnswer: 1,
    explanation: 'A primary key uniquely identifies each record and must not repeat or be null.',
  },

  /* ---------- Statistical Analysis ---------- */
  {
    id: 'sa-1', competency: 'Statistical Analysis', difficulty: 'easy',
    question: 'What is the correlation coefficient used for?',
    options: ['Calculating totals', 'Measuring the strength and direction of a linear relationship', 'Determining data size', 'Sorting files'],
    correctAnswer: 1,
    explanation: 'The correlation coefficient (−1 to +1) measures strength and direction of a linear relationship.',
  },
  {
    id: 'sa-2', competency: 'Statistical Analysis', difficulty: 'medium',
    question: 'How should missing data be handled in an analysis?',
    options: ['Ignore it silently', 'Analyze missingness patterns, document the method, then impute or exclude appropriately', 'Replace all gaps with zero', 'Restart the survey'],
    correctAnswer: 1,
    explanation: 'Sound practice: study missingness, document the approach, then impute or exclude in a statistically defensible way.',
  },
  {
    id: 'sa-3', competency: 'Statistical Analysis', difficulty: 'medium',
    question: 'A dataset has a very high mean but a low median. What does this suggest?',
    options: ['The data is symmetric', 'A right-skewed distribution with high-value outliers', 'The sample is too small', 'The data is wrong'],
    correctAnswer: 1,
    explanation: 'Mean >> median indicates right skew — a few high values pull the mean upward.',
  },
  {
    id: 'sa-4', competency: 'Statistical Analysis', difficulty: 'hard',
    question: 'In regression analysis, what does an R² of 0.85 indicate?',
    options: ['85% of observations are correct', '85% of variance in the dependent variable is explained by the model', 'The model is wrong 15% of the time', 'Correlation is 0.85 between all pairs'],
    correctAnswer: 1,
    explanation: 'R² is the proportion of variance in the dependent variable explained by the independent variables.',
  },
  {
    id: 'sa-5', competency: 'Statistical Analysis', difficulty: 'hard',
    question: 'Why is a stratified sample often preferred over simple random sampling in a national survey?',
    options: ['It is always cheaper', 'It guarantees every population unit is surveyed', 'It ensures subgroups are adequately represented, improving estimate precision', 'It removes the need for weights'],
    correctAnswer: 2,
    explanation: 'Stratification guarantees subgroup representation and typically increases the precision of estimates.',
  },
  {
    id: 'sa-6', competency: 'Statistical Analysis', difficulty: 'easy',
    question: 'What is exploratory data analysis (EDA)?',
    options: ['A method to hide data', 'Investigating data to discover patterns, distributions and anomalies before formal modeling', 'A way to complicate analysis', 'Deleting unnecessary data'],
    correctAnswer: 1,
    explanation: 'EDA is the first investigative pass over data to surface patterns and anomalies before formal analysis.',
  },

  /* ---------- Data Visualization ---------- */
  {
    id: 'dv-1', competency: 'Data Visualization', difficulty: 'easy',
    question: 'Which chart is best for showing a trend over time?',
    options: ['Pie chart', 'Line chart', 'Scatter plot', 'Stacked table'],
    correctAnswer: 1,
    explanation: 'Line charts encode time on an axis and are ideal for trends.',
  },
  {
    id: 'dv-2', competency: 'Data Visualization', difficulty: 'easy',
    question: 'The main purpose of an official dashboard is to:',
    options: ['Make data look attractive', 'Provide a centralized, at-a-glance view of key indicators', 'Replace all statistical reports', 'Store raw data'],
    correctAnswer: 1,
    explanation: 'Dashboards centralize key metrics so decision-makers can monitor performance at a glance.',
  },
  {
    id: 'dv-3', competency: 'Data Visualization', difficulty: 'medium',
    question: 'You must compare the share of five sectors in state GDP. The clearest chart is:',
    options: ['A pie chart with 30 slices', 'A bar chart sorted by value', 'A 3D exploded pie chart', 'A word cloud'],
    correctAnswer: 1,
    explanation: 'Sorted bar charts make comparing magnitudes far easier than many-slice pie charts.',
  },
  {
    id: 'dv-4', competency: 'Data Visualization', difficulty: 'medium',
    question: 'What is a key accessibility requirement for charts in government publications?',
    options: ['Use neon colors', 'Ensure sufficient color contrast and do not rely on color alone', 'Use 3D effects everywhere', 'Avoid labels'],
    correctAnswer: 1,
    explanation: 'Accessible charts use sufficient contrast, textures/labels and never encode meaning in color alone.',
  },
  {
    id: 'dv-5', competency: 'Data Visualization', difficulty: 'hard',
    question: 'Why are dual-axis charts often discouraged in official publications?',
    options: ['They load slowly', 'Two independent scales can mislead readers about relationships', 'They cannot show two series', 'They are not colorful'],
    correctAnswer: 1,
    explanation: 'Dual axes invite misreading because each scale is arbitrary relative to the other.',
  },
  {
    id: 'dv-6', competency: 'Data Visualization', difficulty: 'easy',
    question: 'A choropleth map is most appropriate when you want to show:',
    options: ['A geographic pattern of a variable across regions', 'The exact data table', 'A list of names', 'Network latency'],
    correctAnswer: 0,
    explanation: 'Choropleth maps shade regions by value, revealing geographic patterns.',
  },

  /* ---------- Statistical Methods ---------- */
  {
    id: 'sm-1', competency: 'Statistical Methods', difficulty: 'easy',
    question: 'Standard deviation measures:',
    options: ['The average value', 'The spread of data around the mean', 'The middle value', 'The maximum value'],
    correctAnswer: 1,
    explanation: 'Standard deviation quantifies dispersion around the mean.',
  },
  {
    id: 'sm-2', competency: 'Statistical Methods', difficulty: 'medium',
    question: 'What does a p-value of 0.03 mean in a hypothesis test at α = 0.05?',
    options: ['The null hypothesis is 3% likely to be true', 'Results this extreme occur in 3% of samples if the null hypothesis were true — reject H₀', '3% of data is erroneous', 'The effect size is 3%'],
    correctAnswer: 1,
    explanation: 'The p-value is the probability of results at least as extreme, assuming H₀ is true; 0.03 < 0.05 → reject H₀.',
  },
  {
    id: 'sm-3', competency: 'Statistical Methods', difficulty: 'easy',
    question: 'Sampling in survey research means:',
    options: ['Guessing about data', 'Selecting a representative subset of the population to draw conclusions about the whole', 'Collecting all data twice', 'Ignoring data quality'],
    correctAnswer: 1,
    explanation: 'Sampling selects a representative subset so conclusions can generalize to the population.',
  },
  {
    id: 'sm-4', competency: 'Statistical Methods', difficulty: 'hard',
    question: 'A Type I error occurs when:',
    options: ['A true null hypothesis is rejected', 'A false null hypothesis is not rejected', 'The sample is too large', 'Data is mislabeled'],
    correctAnswer: 0,
    explanation: 'Type I = false positive: rejecting a true H₀. Type II is failing to reject a false H₀.',
  },
  {
    id: 'sm-5', competency: 'Statistical Methods', difficulty: 'hard',
    question: 'The Central Limit Theorem states that, for large samples, the sampling distribution of the mean is:',
    options: ['Always uniform', 'Approximately normal regardless of the population shape', 'Identical to the population', 'Always skewed'],
    correctAnswer: 1,
    explanation: 'For sufficiently large samples, the sampling distribution of the mean approaches normality regardless of population shape.',
  },
  {
    id: 'sm-6', competency: 'Statistical Methods', difficulty: 'medium',
    question: 'A 95% confidence interval for a mean is (42, 50). This means:',
    options: ['95% of data lies between 42 and 50', 'If the procedure were repeated many times, 95% of such intervals would contain the true mean', 'The mean is definitely 46', 'The sample size was 95'],
    correctAnswer: 1,
    explanation: 'The confidence level describes the long-run capture rate of the interval-building procedure, not any single interval.',
  },

  /* ---------- Data Interpretation ---------- */
  {
    id: 'di-1', competency: 'Data Interpretation', difficulty: 'easy',
    question: 'Why is data interpretation important in official statistics?',
    options: ['It is not important', 'It converts statistical findings into insights that inform policy decisions', 'It makes reports longer', 'It hides uncertainty'],
    correctAnswer: 1,
    explanation: 'Interpretation turns statistical output into evidence usable for policy and administration.',
  },
  {
    id: 'di-2', competency: 'Data Interpretation', difficulty: 'medium',
    question: 'A district\'s literacy rate rose 4 points, but its population grew mainly in urban areas. Before crediting policy, you should:',
    options: ['Publish immediately', 'Check whether composition/urbanization changes explain part of the rise', 'Round the number', 'Remove the district from analysis'],
    correctAnswer: 1,
    explanation: 'Compositional shifts (Simpson\'s paradox effects) can mimic policy impact; decompose before attributing.',
  },
  {
    id: 'di-3', competency: 'Data Interpretation', difficulty: 'medium',
    question: '"Correlation is not causation" means:',
    options: ['Correlated variables always cause each other', 'A statistical association alone does not prove a causal mechanism', 'Correlation is useless', 'Causation needs no evidence'],
    correctAnswer: 1,
    explanation: 'Association may arise from confounders or coincidence; causal claims need additional evidence/design.',
  },
  {
    id: 'di-4', competency: 'Data Interpretation', difficulty: 'hard',
    question: 'Two tables report different poverty estimates for the same state. The most defensible first action is:',
    options: ['Average the two numbers', 'Compare definitions, reference periods and methodologies of both sources', 'Publish the larger number', 'Discard both'],
    correctAnswer: 1,
    explanation: 'Divergent estimates usually stem from differing definitions/methodologies; reconcile those first.',
  },
  {
    id: 'di-5', competency: 'Data Interpretation', difficulty: 'easy',
    question: 'When presenting findings to non-technical policymakers, you should:',
    options: ['Use dense formulas', 'Use clear language, focused visuals and contextualized takeaways', 'Avoid conclusions', 'Use jargon to sound rigorous'],
    correctAnswer: 1,
    explanation: 'Decision-makers need clear language, focused visuals and actionable context.',
  },

  /* ---------- Quality Assurance ---------- */
  {
    id: 'qa-1', competency: 'Quality Assurance', difficulty: 'easy',
    question: 'Which practice BEST supports data quality in a statistical organization?',
    options: ['One-time validation at publication', 'Systematic audits, validation rules and documentation at every stage', 'Avoiding reviews', 'Storing data without backups'],
    correctAnswer: 1,
    explanation: 'Quality assurance is continuous: audits, validation rules and documentation at each stage of the pipeline.',
  },
  {
    id: 'qa-2', competency: 'Quality Assurance', difficulty: 'medium',
    question: 'A sudden 30% jump in a monthly series is reported. Under QA protocols you should first:',
    options: ['Publish the jump as a trend', 'Verify collection/processing changes and outliers before publication', 'Silently revise old data', 'Ignore it'],
    correctAnswer: 1,
    explanation: 'Sudden spikes must be verified for operational changes, processing errors or genuine shocks before release.',
  },
  {
    id: 'qa-3', competency: 'Quality Assurance', difficulty: 'medium',
    question: 'What is a "quality gate" in a data pipeline?',
    options: ['A physical lock on servers', 'A defined checkpoint where data must meet criteria before proceeding', 'A firewall rule', 'A type of chart'],
    correctAnswer: 1,
    explanation: 'Quality gates are checkpoints with pass criteria that data must meet to advance in the pipeline.',
  },
  {
    id: 'qa-4', competency: 'Quality Assurance', difficulty: 'hard',
    question: 'Which document BEST supports reproducibility of an official estimate?',
    options: ['A slide deck', 'Complete documentation of sources, methods, code and revisions', 'An email thread', 'A summary press note'],
    correctAnswer: 1,
    explanation: 'Reproducibility requires full documentation of sources, methods, code and revision policy.',
  },

  /* ---------- Official Statistics ---------- */
  {
    id: 'os-1', competency: 'Official Statistics', difficulty: 'easy',
    question: 'Which of these is NOT a UN Fundamental Principle of Official Statistics?',
    options: ['Impartiality', 'Relevance and quality', 'Concealing sources and methods from users', 'Confidentiality of individual data'],
    correctAnswer: 2,
    explanation: 'The principles require transparency about sources and methods; confidentiality applies to individual records, not the methodology.',
  },
  {
    id: 'os-2', competency: 'Official Statistics', difficulty: 'medium',
    question: 'India\'s official statistical system is anchored by which body at the national level?',
    options: ['NITI Aayog', 'Ministry of Statistics & Programme Implementation (MoSPI) / NSO', 'RBI', 'Election Commission'],
    correctAnswer: 1,
    explanation: 'MoSPI, through the National Statistical Office (NSO), anchors India\'s official statistical system.',
  },
  {
    id: 'os-3', competency: 'Official Statistics', difficulty: 'easy',
    question: 'The iGOT Karmayogi platform is intended for:',
    options: ['Only IT staff', 'Capacity building of all government employees', 'Public grievances', 'Tax filing'],
    correctAnswer: 1,
    explanation: 'iGOT Karmayogi is the national online capacity-building platform for all government employees.',
  },
  {
    id: 'os-4', competency: 'Official Statistics', difficulty: 'hard',
    question: 'Why are pre-release access protocols important for official statistics?',
    options: ['They make statistics secret forever', 'They preserve impartiality and prevent market/political misuse before release', 'They reduce server load', 'They replace peer review'],
    correctAnswer: 1,
    explanation: 'Controlled pre-release access protects impartiality and equal access to statistics at publication.',
  },
  {
    id: 'os-5', competency: 'Official Statistics', difficulty: 'medium',
    question: 'A "statistical abstract" published by a state bureau is an example of:',
    options: ['Raw microdata', 'A compiled official statistical product', 'Personal data', 'Legislation'],
    correctAnswer: 1,
    explanation: 'A statistical abstract is a compiled official product aggregating indicators across domains.',
  },
];

/* =========================================================================
 * LEARNING CATALOGUE — mapped to competencies with iGOT links
 * ======================================================================= */
export const LEARNING_CATALOGUE: LearningResource[] = [
  {
    id: 'res-dm-1',
    title: 'Data Management Fundamentals',
    description: 'Organization, storage, validation and maintenance of statistical data collections.',
    competency: 'Data Management', priority: 'high', duration: '4 hours',
    type: 'Online Course', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-dm-2',
    title: 'Database Design & Data Quality',
    description: 'Design reliable databases with validation, deduplication and metadata standards.',
    competency: 'Data Management', priority: 'medium', duration: '6 hours',
    type: 'Hands-on Training', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-sa-1',
    title: 'Statistical Data Analysis',
    description: 'Descriptive and inferential analysis workflows for official statistics.',
    competency: 'Statistical Analysis', priority: 'high', duration: '6 hours',
    type: 'Interactive Training', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-sa-2',
    title: 'Advanced Analytical Techniques',
    description: 'Regression, segmentation and pattern analysis for large official datasets.',
    competency: 'Statistical Analysis', priority: 'medium', duration: '8 hours',
    type: 'Workshop', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-dv-1',
    title: 'Data Visualization Essentials',
    description: 'Charts, dashboards and accessible visual communication for public data.',
    competency: 'Data Visualization', priority: 'medium', duration: '5 hours',
    type: 'Online Course', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-dv-2',
    title: 'Dashboard Design for Official Indicators',
    description: 'Build clean, accessible dashboards for monitoring schemes and indicators.',
    competency: 'Data Visualization', priority: 'low', duration: '4 hours',
    type: 'Online Course', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-sm-1',
    title: 'Statistical Methods for Surveys',
    description: 'Sampling, estimation and hypothesis testing in survey practice.',
    competency: 'Statistical Methods', priority: 'high', duration: '7 hours',
    type: 'Video Lecture Series', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-sm-2',
    title: 'Advanced Statistical Modeling',
    description: 'Time series, multivariate methods and modeling for official statistics.',
    competency: 'Statistical Methods', priority: 'medium', duration: '10 hours',
    type: 'Online Course', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-di-1',
    title: 'Data Interpretation for Decision Making',
    description: 'Turn statistical findings into clear, defensible policy insights.',
    competency: 'Data Interpretation', priority: 'medium', duration: '4 hours',
    type: 'Case Study Analysis', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-qa-1',
    title: 'Quality Assurance in Official Statistics',
    description: 'Validation frameworks, audits and quality gates in the statistical pipeline.',
    competency: 'Quality Assurance', priority: 'high', duration: '3 hours',
    type: 'Online Course', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
  {
    id: 'res-os-1',
    title: 'Official Statistics Framework & Principles',
    description: 'UN Fundamental Principles, India\'s statistical system and release practices.',
    competency: 'Official Statistics', priority: 'high', duration: '3 hours',
    type: 'Video Lecture', status: 'recommended', progress: 0,
    igotUrl: 'https://igotkarmayogi.gov.in/#/course', provider: 'iGOT Karmayogi',
  },
];

/* Topics used by the upload "document analysis" simulation */
export const SAMPLE_MATERIAL_TOPICS = [
  'Data Collection', 'Statistical Sampling', 'Data Management', 'Data Visualization',
  'Hypothesis Testing', 'Descriptive Statistics', 'Data Quality', 'Survey Design',
  'Regression Analysis', 'Official Statistics',
];

export const IGOT_PORTAL_URL = 'https://igotkarmayogi.gov.in/#/';
export const IGOT_REFERENCE_URL = 'https://share.google/IWs6nn9aU81vNehjp';

export const CONTACT_EMAIL = 'infoPragati@gmail.com';
export const CONTACT_PHONE = '+91 8073986510';

export const TRAINING_PROGRAMMES = [
  {
    name: 'NSSTA Foundation Programme in Official Statistics',
    competencies: ['Statistical Methods', 'Data Management', 'Quality Assurance'],
    targetRole: 'Junior Statistical Officer / Statistical Investigator',
    duration: '6 weeks',
    priority: 'high',
    source: 'NSSTA / TPAC',
    recommendationReason: 'Recommended to close foundational gaps in statistical methods, data management, and quality assurance for a strong start in official statistics work.',
  },
  {
    name: 'TPAC Applied Data Analytics for Statistical Offices',
    competencies: ['Statistical Analysis', 'Data Visualization', 'Python'],
    targetRole: 'Statistical Officer / Assistant Director (Statistics)',
    duration: '4 weeks',
    priority: 'high',
    source: 'NSSTA / TPAC',
    recommendationReason: 'Recommended when analytical gaps are visible in statistical analysis, data visualization, or Python-based reporting workflows.',
  },
  {
    name: 'Advanced Survey Design & Sampling Practice',
    competencies: ['Statistical Methods', 'Survey Design', 'Data Interpretation'],
    targetRole: 'Statistical Officer',
    duration: '5 weeks',
    priority: 'medium',
    source: 'NSSTA / TPAC',
    recommendationReason: 'Recommended to strengthen survey design, sampling choices, and interpretation skills for more reliable field and administrative reporting.',
  },
];

export const COMPETENCY_FRAMEWORK = [
  {
    category: 'Statistical Competencies',
    skills: ['Survey Design', 'Sampling', 'National Accounts', 'Price Statistics', 'Labour Statistics', 'Agricultural Statistics', 'Industrial Statistics', 'SDG Indicators', 'Metadata Standards', 'Data Quality Frameworks'],
  },
  {
    category: 'Technical Competencies',
    skills: ['Python', 'R', 'SQL', 'Stata', 'SPSS', 'SAS', 'GIS', 'Data Visualization', 'AI/ML', 'Cloud Computing', 'APIs', 'Open Data'],
  },
  {
    category: 'Digital Governance',
    skills: ['Cybersecurity', 'Data Privacy', 'Digital Signatures', 'Government Cloud', 'Digital Public Infrastructure'],
  },
  {
    category: 'Behavioural & Managerial',
    skills: ['Leadership', 'Communication', 'Project Management', 'Ethics', 'Decision Making', 'Change Management'],
  },
];
