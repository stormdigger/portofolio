export const links = {
  github: 'https://github.com/stormdigger',
  linkedin: 'https://linkedin.com/in/balwinder-singh-518179225',
  leetcode: 'https://leetcode.com/KingHagemaru',
  email: 'mailto:1231262balwindersingh@gmail.com',
};

export const projects = [
  {
    id: 'facemeet', title: 'FaceMeet', year: '2023', category: 'IDENTITY / REAL-TIME', tone: 'blue',
    question: 'What if a meeting could verify that you were actually you?',
    system: 'A video conferencing platform with facial-recognition authentication and secure, real-time communication.',
    engineering: 'A camera frame enters the facial-recognition workflow. The backend authenticates the participant, establishes a secure session, and connects them through VideoSDK. Backend workflow improvements support the journey from identity to a live call.',
    tools: ['Python', 'Flask', 'MySQL', 'Bootstrap', 'dlib', 'VideoSDK'],
    flow: ['Face', 'Detection', 'Authentication', 'Session', 'Video connection'],
    note: 'An exploration of trust at the entrance to a meeting.',
  },
  {
    id: 'doctorg', title: 'DoctorG', year: '2024', category: 'VOICE / VISION / AI', tone: 'blue',
    question: 'What happens when software can see, hear and respond?',
    system: 'A multimodal AI medical-assistant project that combines voice conversations, image analysis, and conversational responses.',
    engineering: 'Whisper transcribes speech. Llama 3 Vision analyzes image input through Groq, and the application generates a conversational response. ElevenLabs returns the response as speech. Flask connects these stages into a low-latency interaction loop.',
    tools: ['Flask', 'Groq API', 'Llama 3 Vision', 'Whisper', 'ElevenLabs'],
    flow: ['Voice', 'Whisper', 'Vision + reasoning', 'Response', 'ElevenLabs'],
    note: 'A project in multimodal interaction, not a clinical service.',
  },
  {
    id: 'agristore', title: 'AgriStore', year: '2025', category: 'COMMERCE / CLOUD', tone: 'green',
    question: 'How do you take something built locally into the real world?',
    system: 'A full-stack e-commerce platform designed around farmers, with role-based authentication, product management, and automated PDF invoices.',
    engineering: 'Spring Boot handles application workflows, Thymeleaf renders the interface, and MySQL stores commerce data. The platform was deployed on AWS using Elastic Beanstalk, EC2, S3, and RDS. SQL query tuning supports the application as its data grows.',
    tools: ['Spring Boot', 'Thymeleaf', 'MySQL', 'Elastic Beanstalk', 'EC2', 'S3', 'RDS'],
    flow: ['User + role', 'Products', 'Order', 'MySQL', 'PDF invoice'],
    note: 'Building the application was one problem. Deploying it was another.',
  },
  {
    id: 'arovita', title: 'Arovita HMS', year: '2025 — PRESENT', category: 'HEALTHCARE / PRODUCTION', tone: 'blue',
    question: 'What changes when someone depends on what you build?',
    system: 'Core modules of a multi-tenant Hospital Management System at Arovita Care, built as part of a team of backend engineers, designers, and QA.',
    engineering: 'AWS API Gateway routes requests to Lambda functions backed by PostgreSQL. Cognito, JWT, and MFA support authentication. Role-based dashboards serve doctors, nurses, receptionists, and patients across OPD/IPD, appointments, EMR, prescriptions, and billing. Agora SDK enables real-time video and audio for telemedicine. Work also includes camera-based heart-rate monitoring, API integration, API design, and UX collaboration across the SDLC.',
    tools: ['AWS Lambda', 'API Gateway', 'PostgreSQL', 'Cognito', 'JWT', 'MFA', 'Agora SDK'],
    flow: ['Patient', 'Application', 'API Gateway', 'Lambda', 'PostgreSQL'],
    note: 'Software Development Engineer · Arovita Care · Remote · November 2025 to present',
  },
  {
    id: 'research', title: 'Research', year: '2024 / 2025', category: 'VISION / MEASUREMENT', tone: 'amber',
    question: 'Which approach works better, and why?',
    system: 'Two IEEE research publications investigating traffic-sign detection and participant authentication in meeting platforms.',
    engineering: 'Comparative Study of YOLOv8, Faster R-CNN & SSD in Traffic Sign Detection (2025) benchmarks detection approaches in the context of GPS feedback, monitoring systems, and autonomous-driving deployment. Login Confirmation Mechanism for Meeting Platforms (2024) examines facial recognition, authentication, accuracy, latency, and robustness in real-world conditions.',
    tools: ['YOLOv8', 'Faster R-CNN', 'SSD', 'Computer vision', 'Facial recognition'],
    flow: ['Question', 'Models', 'Conditions', 'Measurement', 'Comparison'],
    note: 'Building taught me what was possible. Research taught me to measure what was better.',
  },
];

export const toolbox = [
  { title: 'Cloud', label: 'Beyond one machine.', text: 'Infrastructure taught me to think beyond the machine in front of me.', tools: ['AWS Lambda', 'API Gateway', 'Cognito', 'EC2', 'S3', 'RDS', 'Docker'], flow: ['Request', 'API Gateway', 'Lambda', 'RDS'] },
  { title: 'Databases', label: 'Where the truth lives.', text: 'Every interface eventually asks the same question: where does the truth live?', tools: ['PostgreSQL', 'MySQL', 'MongoDB'], flow: ['SELECT', 'JOIN', 'INDEX', 'Result'] },
  { title: 'Backend', label: 'Systems in conversation.', text: 'Systems became more interesting when they stopped living alone.', tools: ['REST APIs', 'Spring Boot', 'Flask', 'JWT'], flow: ['Client', 'GET /patient/42', 'Service', '200 OK'] },
  { title: 'Interfaces', label: 'For the person using it.', text: 'Good engineering still has to make sense to the person touching it.', tools: ['React.js', 'Flutter', 'HTML5', 'CSS3', 'Bootstrap'], flow: ['Data', 'Role', 'Interface', 'Person'] },
  { title: 'AI & vision', label: 'A way to interpret.', text: 'Some problems needed software that could interpret the world, not just store it.', tools: ['OpenCV', 'YOLOv8', 'Groq API', 'OpenAI API'], flow: ['Image / voice', 'Model', 'Inference', 'Response'] },
  { title: 'Languages', label: 'Different tools. Same curiosity.', text: 'Languages changed. The problem-solving did not.', tools: ['Java', 'Python', 'JavaScript', 'Dart', 'C++', 'C', 'SQL', 'Git', 'Postman'], flow: ['Question', 'Logic', 'Code', 'Build'] },
];

export const chapters = [
  { id: 'curiosity', label: 'The room', act: 'PROLOGUE', world: 'room', eyebrow: 'EVERYTHING STARTS SOMEWHERE', title: 'How does<br><em>this work?</em>', text: "I didn't know what I wanted to become.<br>I just wanted to know how things worked.", cursor: 'Hello World', side: 'A SMALL ROOM.<br>AN ENDLESS QUESTION.' },
  { id: 'machine', label: 'Trial & error', act: 'ACT I', world: 'code', eyebrow: 'CURIOSITY BECAME EXPERIMENTATION', title: 'Most things<br>didn’t <em>work.</em>', text: 'So I tried again. And again.<br>Until they did.', cursor: 'learning', side: '01 TRY<br>02 FAIL<br>03 UNDERSTAND<br>04 REPEAT' },
  { id: 'university', label: 'Foundations', act: 'ACT II', world: 'corridor', eyebrow: 'CHANDIGARH UNIVERSITY · 2021—2025', title: 'A little less guessing.<br>A lot more <em>why.</em>', text: 'Curiosity found structure.<br>I started learning how systems work.', cursor: 'understanding', side: 'B.E. COMPUTER SCIENCE & ENGINEERING<br>CGPA 8.0 / 10' },
  { id: 'facemeet', label: 'Connection', act: 'ACT III', world: 'face', eyebrow: '2023 · FACEMEET', title: 'First, a face.<br>Then, a <em>connection.</em>', text: projects[0].question, cursor: 'connecting', project: 'facemeet', side: 'IDENTITY VERIFIED<br>SESSION ESTABLISHED' },
  { id: 'doctorg', label: 'Understanding', act: 'ACT IV', world: 'voice', eyebrow: '2024 · DOCTORG', title: 'What if software<br>could <em>listen?</em>', text: projects[1].question, cursor: 'interpreting', project: 'doctorg', side: 'VOICE → UNDERSTANDING<br>VISION → RESPONSE' },
  { id: 'research', label: 'The evidence', act: 'ACT V', world: 'research', eyebrow: '2024—2025 · IEEE RESEARCH', title: 'Build it.<br>Then <em>question it.</em>', text: 'Sometimes building something wasn’t enough.<br>I wanted to know which approach worked better. And why.', cursor: 'measuring', project: 'research', side: 'YOLOv8 / FASTER R-CNN / SSD<br>DETECTION · ACCURACY · LATENCY' },
  { id: 'agristore', label: 'Into the world', act: 'ACT VI', world: 'fields', eyebrow: '2025 · AGRISTORE', title: 'It worked here.<br>Now, <em>everywhere.</em>', text: 'A commerce platform for farmers.<br>From a local application to infrastructure on AWS.', cursor: 'deploying', project: 'agristore', side: 'PRODUCT → ORDER → INVOICE<br>APPLICATION → CLOUD' },
  { id: 'arovita', label: 'Responsibility', act: 'ACT VII', world: 'hospital', eyebrow: 'NOVEMBER 2025—PRESENT · AROVITA CARE', title: 'And then,<br>someone <em>depended on it.</em>', text: 'Doctors. Nurses. Patients.<br>The code was no longer just an experiment.', cursor: 'shipping', project: 'arovita', side: 'SOFTWARE DEVELOPMENT ENGINEER<br>MULTI-TENANT HEALTHCARE SYSTEM' },
  { id: 'toolbox', label: 'The toolbox', act: 'ACT VIII', world: 'tools', eyebrow: 'THE ENGINEERING WORKSHOP', title: 'The problems grew.<br>So did the <em>toolbox.</em>', text: 'Every tool has a reason to be here.', cursor: 'solving', special: 'toolbox' },
  { id: 'archive', label: 'The archive', act: 'ACT IX', world: 'archive', eyebrow: 'A COLLECTION OF QUESTIONS, ANSWERED', title: 'Things I’ve <em>built.</em>', text: 'Five doors. Five different ways of thinking.', special: 'archive' },
  { id: 'proof', label: 'Along the way', act: 'ACT X', world: 'proof', eyebrow: 'A FEW MARKERS ALONG THE WAY', title: 'The work left<br>some <em>evidence.</em>', special: 'proof' },
  { id: 'present', label: 'Still curious', act: 'EPILOGUE', world: 'room', eyebrow: 'THE ROOM CHANGED. THE CURIOSITY DIDN’T.', title: 'Years later.<br>The <em>same question.</em>', text: 'I still want to know how things work.', cursor: 'still building', special: 'ending' },
];
