/**
 * Single source of truth for every fact rendered on the site.
 *
 * Nothing here is invented: all career, project, and research claims come from
 * the supplied brief. Where a URL was not supplied (repositories, DOIs, live
 * demos) the field is simply absent rather than guessed.
 */

export const profile = {
  name: 'Balwinder Singh',
  first: 'Balwinder',
  last: 'Singh',
  role: 'Software Development Engineer',
  location: 'Punjab, India',
  email: '1231262balwindersingh@gmail.com',
  available: 'Open to backend, cloud & full-stack roles',
  tagline: 'I build backend systems people depend on.',
  intro:
    'Software Development Engineer at Arovita Care, working on a multi-tenant '
    + 'hospital platform on AWS. I like the part of the job where a system has to '
    + 'stay correct under real load — and two IEEE papers where I got to measure '
    + 'whether it actually did.',
};

export const links = {
  github: 'https://github.com/stormdigger',
  linkedin: 'https://linkedin.com/in/balwinder-singh-518179225',
  leetcode: 'https://leetcode.com/KingHagemaru',
  email: `mailto:${profile.email}`,
};

/** Pre-filled mail link for the contact CTA — a static host cannot take a POST. */
export const contactHref = (() => {
  const subject = `Opportunity for ${profile.name}`;
  const body = [
    'Hi Balwinder,', '',
    'I came across your portfolio and would like to talk about a role.', '',
    'Company:', 'Role:', 'Location / remote:', '',
    'Thanks,',
  ].join('\n');
  return `${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
})();

export const heroMeta = [
  { label: 'Now', value: 'SDE · Arovita Care' },
  { label: 'Focus', value: 'Backend · AWS · APIs' },
  { label: 'Published', value: '2 IEEE papers' },
  { label: 'Based in', value: profile.location },
];

/** Scrolling capability strip under the hero. */
export const marquee = [
  'AWS Lambda', 'API Gateway', 'PostgreSQL', 'Spring Boot', 'Java', 'Python',
  'React', 'Flask', 'Cognito', 'Docker', 'MySQL', 'OpenCV', 'YOLOv8', 'REST APIs',
];

/**
 * Projects, newest first — a recruiter should hit production work immediately.
 * `diagram` selects the animated SVG rendered in the card.
 */
export const projects = [
  {
    id: 'arovita',
    title: 'Arovita HMS',
    year: '2025 — Present',
    role: 'Software Development Engineer · Arovita Care',
    tone: 'sky',
    diagram: 'serverless',
    question: 'What changes when someone depends on what you build?',
    summary:
      'Core modules of a multi-tenant Hospital Management System — built with a team of '
      + 'backend engineers, designers, and QA.',
    system:
      'Core modules of a multi-tenant Hospital Management System at Arovita Care, built as '
      + 'part of a team of backend engineers, designers, and QA.',
    engineering:
      'AWS API Gateway routes requests to Lambda functions backed by PostgreSQL. Cognito, JWT, '
      + 'and MFA support authentication. Role-based dashboards serve doctors, nurses, '
      + 'receptionists, and patients across OPD/IPD, appointments, EMR, prescriptions, and '
      + 'billing. Agora SDK enables real-time video and audio for telemedicine. Work also '
      + 'includes camera-based heart-rate monitoring, API integration, API design, and UX '
      + 'collaboration across the SDLC.',
    tools: ['AWS Lambda', 'API Gateway', 'PostgreSQL', 'Cognito', 'JWT', 'MFA', 'Agora SDK'],
    flow: ['Patient', 'API Gateway', 'Lambda', 'PostgreSQL'],
    note: 'The first system I worked on where being wrong had a real cost.',
  },
  {
    id: 'agristore',
    title: 'AgriStore',
    year: '2025',
    role: 'Full-stack · Solo project',
    tone: 'leaf',
    diagram: 'commerce',
    question: 'How do you take something built locally into the real world?',
    summary:
      'A full-stack commerce platform for farmers, with role-based auth, product management, '
      + 'and automated PDF invoices — deployed to AWS.',
    system:
      'A full-stack e-commerce platform designed around farmers, with role-based '
      + 'authentication, product management, and automated PDF invoices.',
    engineering:
      'Spring Boot handles application workflows, Thymeleaf renders the interface, and MySQL '
      + 'stores commerce data. The platform was deployed on AWS using Elastic Beanstalk, EC2, '
      + 'S3, and RDS. SQL query tuning supports the application as its data grows.',
    tools: ['Spring Boot', 'Thymeleaf', 'MySQL', 'Elastic Beanstalk', 'EC2', 'S3', 'RDS'],
    flow: ['User + role', 'Products', 'Order', 'MySQL', 'PDF invoice'],
    note: 'Building the application was one problem. Deploying it was another.',
  },
  {
    id: 'doctorg',
    title: 'DoctorG',
    year: '2024',
    role: 'Multimodal AI · Solo project',
    tone: 'violet',
    diagram: 'multimodal',
    question: 'What happens when software can see, hear and respond?',
    summary:
      'A multimodal AI assistant that listens, looks at an image, reasons, and answers out '
      + 'loud — wired into one low-latency loop.',
    system:
      'A multimodal AI medical-assistant project that combines voice conversations, image '
      + 'analysis, and conversational responses.',
    engineering:
      'Whisper transcribes speech. Llama 3 Vision analyzes image input through Groq, and the '
      + 'application generates a conversational response. ElevenLabs returns the response as '
      + 'speech. Flask connects these stages into a low-latency interaction loop.',
    tools: ['Flask', 'Groq API', 'Llama 3 Vision', 'Whisper', 'ElevenLabs'],
    flow: ['Voice', 'Whisper', 'Vision + reasoning', 'ElevenLabs'],
    note: 'A project in multimodal interaction, not a clinical service.',
  },
  {
    id: 'research',
    title: 'IEEE Research',
    year: '2024 / 2025',
    role: 'Two published papers',
    tone: 'amber',
    diagram: 'benchmark',
    question: 'Which approach works better, and why?',
    summary:
      'Two IEEE publications benchmarking traffic-sign detection models, and participant '
      + 'authentication for meeting platforms.',
    system:
      'Two IEEE research publications investigating traffic-sign detection and participant '
      + 'authentication in meeting platforms.',
    engineering:
      'Comparative Study of YOLOv8, Faster R-CNN & SSD in Traffic Sign Detection (2025) '
      + 'benchmarks detection approaches in the context of GPS feedback, monitoring systems, '
      + 'and autonomous-driving deployment. Login Confirmation Mechanism for Meeting Platforms '
      + '(2024) examines facial recognition, authentication, accuracy, latency, and robustness '
      + 'in real-world conditions.',
    tools: ['YOLOv8', 'Faster R-CNN', 'SSD', 'Computer vision', 'Facial recognition'],
    flow: ['Question', 'Models', 'Conditions', 'Comparison'],
    note: 'Building taught me what was possible. Research taught me to measure what was better.',
  },
  {
    id: 'facemeet',
    title: 'FaceMeet',
    year: '2023',
    role: 'Backend · Computer vision',
    tone: 'coral',
    diagram: 'auth',
    question: 'What if a meeting could verify that you were actually you?',
    summary:
      'Video conferencing with facial-recognition authentication at the door — identity '
      + 'first, then the call.',
    system:
      'A video conferencing platform with facial-recognition authentication and secure, '
      + 'real-time communication.',
    engineering:
      'A camera frame enters the facial-recognition workflow. The backend authenticates the '
      + 'participant, establishes a secure session, and connects them through VideoSDK. '
      + 'Backend workflow improvements support the journey from identity to a live call.',
    tools: ['Python', 'Flask', 'MySQL', 'Bootstrap', 'dlib', 'VideoSDK'],
    flow: ['Face', 'Detection', 'Auth', 'Video session'],
    note: 'An exploration of trust at the entrance to a meeting.',
  },
];

/** The story, condensed from twelve scenes to six. */
export const chapters = [
  {
    era: 'Where it started',
    tone: 'var(--coral)',
    title: 'A room, and one stubborn question',
    text:
      'I did not know what I wanted to become. I just wanted to know how things worked — '
      + 'which mostly meant breaking them and putting them back together.',
    facts: ['Self-taught start', 'Trial and error'],
  },
  {
    era: '2021 — 2025 · Chandigarh University',
    tone: 'var(--amber)',
    title: 'Curiosity found some structure',
    text:
      'A B.E. in Computer Science turned guessing into reasoning. Data structures, operating '
      + 'systems, networks, databases — the vocabulary for what I had been doing by feel.',
    facts: ['B.E. CSE', 'CGPA 8.0 / 10', 'Best Project of the Semester'],
  },
  {
    era: '2023 — 2024 · First real systems',
    tone: 'var(--leaf)',
    title: 'Software that could see and listen',
    text:
      'FaceMeet put identity at the door of a video call. DoctorG chained speech, vision, and '
      + 'a language model into one loop. Both taught me how much of the work is the wiring.',
    facts: ['FaceMeet', 'DoctorG', 'Python · Flask'],
  },
  {
    era: '2024 — 2025 · IEEE',
    tone: 'var(--sky)',
    title: 'Then I learned to measure it',
    text:
      'Building something was not enough. I wanted to know which approach was better, under '
      + 'what conditions, and by how much. Two papers came out of asking that properly.',
    facts: ['2 IEEE papers', 'YOLOv8 · Faster R-CNN · SSD'],
  },
  {
    era: '2025 · Into production',
    tone: 'var(--violet)',
    title: 'From my machine to the cloud',
    text:
      'AgriStore worked locally long before it worked on AWS. Elastic Beanstalk, EC2, S3, RDS '
      + '— deployment turned out to be its own engineering problem, not a final step.',
    facts: ['AgriStore', 'AWS', 'Spring Boot'],
  },
  {
    era: 'Nov 2025 — Present · Arovita Care',
    tone: 'var(--rose)',
    title: 'And then people depended on it',
    text:
      'Doctors, nurses, and patients use what our team ships. Multi-tenant, serverless, '
      + 'role-based, audited. The code stopped being an experiment.',
    facts: ['Arovita HMS', 'AWS Lambda', 'PostgreSQL', 'Telemedicine'],
  },
];

/** `icon` maps to a key in the ICONS table in app.js. */
export const toolbox = [
  {
    title: 'Cloud',
    tone: 'var(--sky)',
    icon: 'cloud',
    line: 'Beyond one machine.',
    text: 'Infrastructure taught me to think past the machine in front of me.',
    tools: ['AWS Lambda', 'API Gateway', 'Cognito', 'EC2', 'S3', 'RDS', 'Docker'],
  },
  {
    title: 'Databases',
    tone: 'var(--leaf)',
    icon: 'database',
    line: 'Where the truth lives.',
    text: 'Every interface eventually asks the same question: where does the truth live?',
    tools: ['PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    title: 'Backend',
    tone: 'var(--coral)',
    icon: 'server',
    line: 'Systems in conversation.',
    text: 'Systems became more interesting when they stopped living alone.',
    tools: ['REST APIs', 'Spring Boot', 'Flask', 'JWT'],
  },
  {
    title: 'Interfaces',
    tone: 'var(--violet)',
    icon: 'layout',
    line: 'For the person using it.',
    text: 'Good engineering still has to make sense to the person touching it.',
    tools: ['React.js', 'Flutter', 'HTML5', 'CSS3', 'Bootstrap'],
  },
  {
    title: 'AI & vision',
    tone: 'var(--rose)',
    icon: 'eye',
    line: 'A way to interpret.',
    text: 'Some problems needed software that could interpret the world, not just store it.',
    tools: ['OpenCV', 'YOLOv8', 'Groq API', 'OpenAI API'],
  },
  {
    title: 'Languages',
    tone: 'var(--amber)',
    icon: 'code',
    line: 'Different tools. Same curiosity.',
    text: 'Languages changed. The problem-solving did not.',
    tools: ['Java', 'Python', 'JavaScript', 'Dart', 'C++', 'C', 'SQL', 'Git'],
  },
];

export const achievements = [
  { value: 'AIR 53', tone: 'var(--coral)', title: 'National Source-O-Code', detail: 'Competitive programming contest' },
  { value: '11th', tone: 'var(--amber)', title: 'Celebal Anaverse', detail: 'National competition' },
  { value: '2×', tone: 'var(--sky)', title: 'IEEE publications', detail: 'Published 2024 & 2025' },
  { value: '8.0', tone: 'var(--leaf)', title: 'CGPA / 10', detail: 'B.E. Computer Science' },
];

export const certifications = [
  'Introduction to Cloud Computing · Coursera',
  'React JS · Great Learning',
  'Programming Through C++ · NPTEL',
];

export const education = {
  degree: 'B.E. Computer Science and Engineering',
  school: 'Chandigarh University',
  dates: 'August 2021 — May 2025',
  detail: 'CGPA 8.0 / 10 · Best Project of the Semester, Final Year CS Project',
};

export const research = [
  {
    title: 'Comparative Study of YOLOv8, Faster R-CNN & SSD in Traffic Sign Detection',
    meta: 'IEEE · 2025',
    detail: 'Object detection benchmarked for GPS feedback, monitoring, and autonomous driving.',
  },
  {
    title: 'Login Confirmation Mechanism for Meeting Platforms',
    meta: 'IEEE · 2024',
    detail: 'Participant authentication: accuracy, latency, and robustness in real conditions.',
  },
];
