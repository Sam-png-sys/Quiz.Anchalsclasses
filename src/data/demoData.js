// ── DEMO USER ─────────────────────────────────────────────────────────────
export const demoUser = {
  _id: 'u1', name: 'Sam Sharma', email: 'sam@example.com',
  role: 'student', branch: 'BDS', year: '2nd',
}

export const demoAdmin = {
  _id: 'a1', name: 'Dr. Anchal', email: 'admin@example.com', role: 'admin',
}

// ── QUIZ 1 QUESTIONS — Oral Anatomy ──────────────────────────────────────
export const quiz1Questions = [
  { _id: 'q1',  text: 'The cusp of Carabelli is found on which tooth?', options: ['Mandibular first molar', 'Maxillary second molar', 'Maxillary first molar', 'Mandibular second molar'], correctIndex: 2, difficulty: 'Medium', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The cusp of Carabelli is an accessory cusp on the mesiolingual surface of the maxillary first molar. It is a non-functional morphological variation.' },
  { _id: 'q2',  text: 'Which nerve supplies the lower lip and chin?', options: ['Lingual nerve', 'Mental nerve', 'Inferior alveolar nerve', 'Buccal nerve'], correctIndex: 1, difficulty: 'Easy', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The mental nerve exits the mental foramen and supplies sensory innervation to the lower lip, chin and buccal gingiva of lower premolars.' },
  { _id: 'q3',  text: 'The permanent maxillary first molar has how many roots?', options: ['1', '2', '3', '4'], correctIndex: 2, difficulty: 'Easy', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The maxillary first molar has 3 roots: mesiobuccal, distobuccal and palatal. The palatal root is the longest.' },
  { _id: 'q4',  text: 'Which muscle is responsible for protrusion of the mandible?', options: ['Masseter', 'Temporalis', 'Lateral pterygoid', 'Medial pterygoid'], correctIndex: 2, difficulty: 'Medium', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The lateral pterygoid is the primary muscle for mandibular protrusion. Both heads contract simultaneously to pull the condyle forward.' },
  { _id: 'q5',  text: 'Bone resorption is carried out by which cells?', options: ['Osteoblasts', 'Osteocytes', 'Osteoclasts', 'Fibroblasts'], correctIndex: 2, difficulty: 'Easy', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'Osteoclasts are large multinucleated cells that secrete acids and enzymes to dissolve the mineral matrix and break down bone.' },
  { _id: 'q6',  text: 'Which salivary gland produces the most saliva?', options: ['Parotid gland', 'Submandibular gland', 'Sublingual gland', 'Minor salivary glands'], correctIndex: 1, difficulty: 'Easy', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The submandibular gland produces approximately 60-70% of total salivary volume despite the parotid being the largest gland.' },
  { _id: 'q7',  text: 'Which cells are responsible for enamel formation?', options: ['Odontoblasts', 'Cementoblasts', 'Ameloblasts', 'Fibroblasts'], correctIndex: 2, difficulty: 'Easy', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'Ameloblasts are responsible for enamel formation (amelogenesis). They are lost after completion so enamel cannot regenerate.' },
  { _id: 'q8',  text: 'Which periodontal fiber group is most numerous?', options: ['Alveolar crest fibers', 'Horizontal fibers', 'Oblique fibers', 'Apical fibers'], correctIndex: 2, difficulty: 'Medium', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'Oblique fibers are the most numerous PDL fiber group, comprising about 2/3 of all fibers. They resist axial forces.' },
  { _id: 'q9',  text: 'The blood supply to the pulp is primarily from which artery?', options: ['Facial artery', 'Lingual artery', 'Inferior alveolar artery', 'Maxillary artery'], correctIndex: 3, difficulty: 'Medium', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The maxillary artery provides primary blood supply via its dental branches — anterior superior, posterior superior and inferior alveolar arteries.' },
  { _id: 'q10', text: 'Which muscle opens the mouth by depressing the mandible?', options: ['Masseter', 'Mylohyoid', 'Lateral pterygoid', 'Temporalis'], correctIndex: 1, difficulty: 'Medium', tag: 'BDS', subject: 'Oral Anatomy', explanation: 'The mylohyoid along with the digastric and geniohyoid depresses the mandible to open the mouth when the hyoid bone is fixed.' },
]

// ── QUIZ 2 QUESTIONS — Dental Materials ───────────────────────────────────
export const quiz2Questions = [
  { _id: 'q11', text: 'Which alloy is most commonly used for cast metal restorations?', options: ['Amalgam', 'Cobalt-Chromium', 'Gold alloy', 'Nickel-Titanium'], correctIndex: 2, difficulty: 'Hard', tag: 'MDS', subject: 'Dental Materials', explanation: 'Gold alloys are the gold standard for cast metal restorations due to their biocompatibility, corrosion resistance and superior mechanical properties.' },
  { _id: 'q12', text: 'What is the setting time of zinc oxide eugenol cement?', options: ['1-2 minutes', '4-10 minutes', '15-20 minutes', '30 minutes'], correctIndex: 1, difficulty: 'Hard', tag: 'MDS', subject: 'Dental Materials', explanation: 'ZOE cement sets in approximately 4-10 minutes clinically. Higher humidity and temperature accelerate the setting reaction.' },
  { _id: 'q13', text: 'Which material has the highest compressive strength among dental restoratives?', options: ['Composite resin', 'Glass ionomer', 'Dental amalgam', 'Zinc phosphate cement'], correctIndex: 2, difficulty: 'Hard', tag: 'MDS', subject: 'Dental Materials', explanation: 'Dental amalgam has the highest compressive strength among conventional restoratives, making it ideal for posterior load-bearing restorations.' },
  { _id: 'q14', text: 'The working time of an impression material is defined as?', options: ['Time from mix start to placement', 'Time from placement to removal', 'Time the material remains elastic', 'Time for complete polymerization'], correctIndex: 0, difficulty: 'Medium', tag: 'MDS', subject: 'Dental Materials', explanation: 'Working time is the period from the start of mixing to when the material must be placed in the mouth — after this it begins to set.' },
  { _id: 'q15', text: 'Which base material provides thermal insulation and medicinal benefit?', options: ['Zinc phosphate cement', 'Zinc oxide eugenol', 'Glass ionomer cement', 'Calcium hydroxide'], correctIndex: 3, difficulty: 'Medium', tag: 'BDS', subject: 'Dental Materials', explanation: 'Calcium hydroxide is used as a base/liner providing thermal insulation and stimulating secondary dentin formation due to its high pH.' },
  { _id: 'q16', text: 'Polymerization shrinkage is a major drawback of which material?', options: ['Dental amalgam', 'Composite resin', 'Glass ionomer', 'Zinc phosphate'], correctIndex: 1, difficulty: 'Easy', tag: 'BDS', subject: 'Dental Materials', explanation: 'Composite resin undergoes polymerization shrinkage (1-5%) during setting, which can cause marginal gaps, microleakage and postoperative sensitivity.' },
  { _id: 'q17', text: 'Which impression material is used for recording edentulous arches?', options: ['Alginate', 'Polyether', 'Zinc oxide eugenol paste', 'Polysulfide'], correctIndex: 2, difficulty: 'Medium', tag: 'MDS', subject: 'Dental Materials', explanation: 'ZOE impression paste is used for final impressions of edentulous arches due to its flow properties and dimensional accuracy.' },
  { _id: 'q18', text: 'The ADA specification for dental amalgam requires a minimum compressive strength of?', options: ['80 MPa', '105 MPa', '310 MPa', '450 MPa'], correctIndex: 2, difficulty: 'Hard', tag: 'MDS', subject: 'Dental Materials', explanation: 'ADA Specification No. 1 requires a minimum compressive strength of 310 MPa for dental amalgam at 1 hour after setting.' },
  { _id: 'q19', text: 'Which cement is used for permanent cementation of metal crowns?', options: ['Zinc oxide eugenol', 'Calcium hydroxide', 'Zinc phosphate cement', 'Polycarboxylate'], correctIndex: 2, difficulty: 'Easy', tag: 'BDS', subject: 'Dental Materials', explanation: 'Zinc phosphate cement is the traditional choice for permanent cementation of metal crowns due to its high compressive strength and long clinical record.' },
  { _id: 'q20', text: 'Which property allows gypsum products to be used for die construction?', options: ['High flow', 'Dimensional expansion on setting', 'High compressive strength', 'Low water/powder ratio'], correctIndex: 2, difficulty: 'Medium', tag: 'MDS', subject: 'Dental Materials', explanation: 'Die stone (Type IV gypsum) has high compressive strength (>34 MPa) and minimal expansion, making it ideal for accurate die construction.' },
]

// All questions combined for question bank
export const demoQuestions = [...quiz1Questions, ...quiz2Questions]

// ── QUIZZES ───────────────────────────────────────────────────────────────
export const demoQuizzes = [
  {
    _id: 'qz1',
    title: 'Oral Anatomy — Test 1',
    tag: 'BDS',
    difficulty: 'Medium',
    duration: 10,
    questionCount: 10,
    attempts: 312,
    isOpen: true,
    questions: quiz1Questions,
  },
  {
    _id: 'qz2',
    title: 'Dental Materials — Test 1',
    tag: 'MDS',
    difficulty: 'Hard',
    duration: 12,
    questionCount: 10,
    attempts: 248,
    isOpen: true,
    questions: quiz2Questions,
  },
]

// ── ANALYTICS ─────────────────────────────────────────────────────────────
export const demoAnalytics = {
  totalAttempts: 3,
  avgScore: 78,
  bestScore: 100,
  totalTime: '12m',
  rank: 5,
  scoreTrend: [
    { label: 'Oral Anat.', score: 72 },
    { label: 'Dental Mat.', score: 88 },
    { label: 'NEET MDS', score: 75 },
  ],
  subjectPerformance: [
    { subject: 'Oral Anatomy',   score: 72, color: '#185fa5' },
    { subject: 'Dental Mat.',    score: 88, color: '#7c3aed' },
    { subject: 'Prosthodontics', score: 54, color: '#e24b4a' },
  ],
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────
export const demoLeaderboard = [
  { userId: 'u2', name: 'Arjun Mehta',  avgScore: 91, attempts: 8 },
  { userId: 'u3', name: 'Rahul Singh',  avgScore: 86, attempts: 7 },
  { userId: 'u4', name: 'Priya Patel',  avgScore: 74, attempts: 6 },
  { userId: 'u5', name: 'Sneha Patel',  avgScore: 67, attempts: 5 },
  { userId: 'u1', name: 'Sam Sharma',   avgScore: 62, attempts: 3 },
  { userId: 'u6', name: 'Kavya Reddy',  avgScore: 55, attempts: 4 },
  { userId: 'u7', name: 'Rohit Kumar',  avgScore: 50, attempts: 2 },
  { userId: 'u8', name: 'Ananya Gupta', avgScore: 45, attempts: 3 },
]

// ── ADMIN STATS ───────────────────────────────────────────────────────────
export const demoAdminStats = {
  totalQuestions: 500,
  totalQuizzes: 12,
  totalStudents: 200,
}

// ── STUDENTS ──────────────────────────────────────────────────────────────
export const demoStudents = [
  { _id: 's1', name: 'Arjun Mehta',  phone: '9876543210', branch: 'BDS', year: '2nd', isActive: true },
  { _id: 's2', name: 'Rahul Singh',  phone: '9876543211', branch: 'BDS', year: '3rd', isActive: true },
  { _id: 's3', name: 'Priya Patel',  phone: '9876543212', branch: 'MDS', year: '1st', isActive: true },
  { _id: 's4', name: 'Sneha Patel',  phone: '9876543213', branch: 'BDS', year: '2nd', isActive: false },
  { _id: 's5', name: 'Sam Sharma',   phone: '9876543214', branch: 'BDS', year: '2nd', isActive: true },
  { _id: 's6', name: 'Kavya Reddy',  phone: '9876543215', branch: 'MDS', year: '2nd', isActive: true },
  { _id: 's7', name: 'Rohit Kumar',  phone: '9876543216', branch: 'BDS', year: '1st', isActive: false },
  { _id: 's8', name: 'Ananya Gupta', phone: '9876543217', branch: 'BDS', year: '4th', isActive: true },
]
