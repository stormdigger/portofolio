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
  { label: 'Published', value: '2 IEEE papers', href: '#research' },
  { label: 'Based in', value: profile.location },
];

/** Scrolling capability strip under the hero. */
export const marquee = [
  'AWS Lambda', 'API Gateway', 'PostgreSQL', 'Spring Boot', 'Java', 'Python',
  'React', 'Next.js', 'Three.js', 'Flask', 'Cognito', 'Docker', 'MySQL', 'OpenCV', 'YOLOv8', 'REST APIs',
];
/**
 * Projects, strongest first — the three live products lead, so a recruiter can
 * click straight into working software. `live` adds the browser-frame
 * screenshot and the "Visit live site" button; `stats` are read off the live
 * deployment. Projects without `live` keep their animated architecture diagram.
 */
export const projects = [
  {
    id: 'humanatlas',
    title: 'HumanAtlas 3D',
    year: '2026',
    role: 'Interactive 3D · Solo project',
    tone: 'teal',
    diagram: 'multimodal',
    live: { url: 'https://humanatlas3d.vercel.app/', host: 'humanatlas3d.vercel.app' },
    shots: ['assets/projects/humanatlas.jpg'],
    question: 'Can a browser tab hold the whole human body?',
    summary:
      'A free, interactive 3D anatomy atlas. 2,882 scan-derived meshes across 11 body '
      + 'systems — rotate, dissect layer by layer, slice on anatomical planes, and click any '
      + 'structure to learn what it does.',
    stats: [
      { value: '2,882', label: '3D meshes' },
      { value: '11', label: 'body systems' },
      { value: '2', label: 'reference bodies' },
    ],
    system:
      'A browser-based anatomy atlas built on scan-derived reference anatomy, with male and '
      + 'female models, guided tours, a quiz, a compare mode and a disease explorer.',
    engineering:
      'Next.js and React Three Fiber render the scene in WebGL. The male and female reference '
      + 'bodies are assembled from Z-Anatomy and BodyParts3D models (CC BY-SA) — 2,882 '
      + 'individually selectable meshes. Eleven body systems toggle independently; Dissect '
      + 'peels the body layer by layer and slices it on anatomical planes; every structure '
      + 'opens its anatomy, function and clinical notes. Guided tours, a spaced-repetition '
      + 'quiz, side-by-side compare and Ctrl+K search all sit on the same scene graph, so '
      + 'heavy geometry stays interactive on an ordinary laptop.',
    tools: ['Next.js', 'React Three Fiber', 'Three.js', 'WebGL', 'Radix UI', 'Framer Motion'],
    flow: ['Mesh library', 'Scene graph', 'Systems + layers', 'Click → notes'],
    note: 'Rendering 2,882 meshes was the easy part. Keeping them responsive to a click was the work.',
  },
  {
    id: 'agristore',
    title: 'AgriStore',
    year: '2025 — 2026',
    role: 'Full-stack · Data · Solo project',
    tone: 'leaf',
    diagram: 'commerce',
    live: { url: 'https://agristore.onrender.com/', host: 'agristore.onrender.com' },
    shots: ['assets/projects/agristore.jpg', 'assets/projects/agristore-2.jpg'],
    question: 'What does a farmer actually pay for the same pack?',
    summary:
      'A price-comparison engine for Indian farm inputs. Seeds, fertilisers, crop protection '
      + 'and machinery from 16 online sellers, matched by brand, product and pack size.',
    stats: [
      { value: '12,179', label: 'products' },
      { value: '26,723', label: 'seller prices' },
      { value: '16', label: 'sellers tracked' },
      { value: '464', label: 'brands' },
    ],
    system:
      'An independent price-comparison site for seeds, fertilisers, crop protection, manure, '
      + 'machinery and tools sold online in India. It links to sellers; it never sells.',
    engineering:
      'A Spring Boot application with Thymeleaf views and Spring Security. An ingestion '
      + 'pipeline reads the public product feeds of 16 sellers politely — robots.txt '
      + 'respected — and keeps every fetch time and SHA-256 fingerprint as evidence. Listings '
      + 'are grouped only when brand and normalised product name match (or, for equipment, the '
      + 'manufacturer model code), and never across different active ingredients. Prices are '
      + 'bucketed by pack size and normalised to per-litre, per-kg or per-1,000-seeds so '
      + 'different packs compare fairly; anything older than seven days is labelled '
      + 'historical, and rankings are never paid. It began as a farmer storefront deployed on '
      + 'AWS (Elastic Beanstalk, EC2, S3, RDS) and was rebuilt into this engine.',
    tools: ['Spring Boot', 'Spring Security', 'Thymeleaf', 'SQL', 'Data pipelines', 'AWS', 'Render'],
    flow: ['16 seller feeds', 'Ingest + fingerprint', 'Match + normalise', 'Price per pack'],
    note: 'Building a store taught me commerce. Turning it into a comparison engine taught me data.',
  },
  {
    id: 'health9000',
    title: 'Health 9000',
    year: '2024 — 2026',
    role: 'AI doctor · Solo project',
    tone: 'violet',
    diagram: 'multimodal',
    live: { url: 'https://health9000.vercel.app/landing', host: 'health9000.vercel.app' },
    shots: ['assets/projects/health9000.jpg', 'assets/projects/health9000-2.jpg'],
    question: 'What if the first consultation could happen any hour of the day?',
    summary:
      'An AI health companion: symptom analysis, instant consultations, vitals tracking and '
      + 'medication reminders — grown out of DoctorG, my voice-and-vision medical assistant.',
    stats: [
      { value: '24/7', label: 'availability' },
      { value: '3', label: 'input modes' },
      { value: '3', label: 'AI models chained' },
    ],
    system:
      'A personal health platform with AI consultations, health tracking with charts, and '
      + 'smart reminders for medication and appointments.',
    engineering:
      'The product is a Next.js app: landing, accounts, consultations, tracking dashboards '
      + 'and reminders. Its reasoning core began as DoctorG — Whisper transcribes speech, '
      + 'Llama 3 Vision on Groq reads an image, the model answers conversationally, and '
      + 'ElevenLabs speaks the reply. Flask wired those stages into one low-latency loop; '
      + 'Health 9000 turns that loop into something a person can come back to every day.',
    tools: ['Next.js', 'React', 'Flask', 'Groq API', 'Llama 3 Vision', 'Whisper', 'ElevenLabs'],
    flow: ['Voice / image / text', 'Whisper + Vision', 'Reasoning', 'Answer + reminders'],
    note: 'For guidance and learning — not a clinical service or a substitute for a doctor.',
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
      'A face-recognition gate for video calls became my first IEEE paper. DoctorG chained speech, vision, and '
      + 'a language model into one loop. Both taught me how much of the work is the wiring.',
    facts: ['Face-auth meetings', 'DoctorG', 'Python · Flask'],
  },
  {
    era: '2024 — 2025 · IEEE',
    tone: 'var(--sky)',
    title: 'Then I learned to measure it',
    text:
      'Building something was not enough. I wanted to know which approach was better, under '
      + 'what conditions, and by how much. Two papers came out of asking that properly.',
    facts: ['CCICT 2024', 'ICACCM 2024', 'YOLOv8 · Faster R-CNN · SSD'],
  },
  {
    era: '2025 — 2026 · Into production',
    tone: 'var(--violet)',
    title: 'From my machine to the open internet',
    text:
      'AgriStore worked locally long before it worked on AWS — deployment turned out to be its '
      + 'own engineering problem. Then it became a price engine over 26,000 seller prices, '
      + 'HumanAtlas put 2,882 meshes in a browser tab, and DoctorG grew into Health 9000.',
    facts: ['AgriStore', 'HumanAtlas 3D', 'Health 9000', 'AWS · Vercel'],
  },
  {
    era: 'Nov 2025 — Present · Arovita Care',
    tone: 'var(--rose)',
    title: 'And then people depended on it',
    text:
      'Doctors, nurses, and patients use what our team ships. Multi-tenant, serverless, '
      + 'role-based, audited. The code stopped being an experiment.',
    facts: ['Hospital platform', 'AWS Lambda', 'PostgreSQL', 'Telemedicine'],
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
    tools: ['React.js', 'Next.js', 'Three.js', 'Flutter', 'HTML5', 'CSS3'],
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

/**
 * Published papers. Every field below was checked against Crossref, IEEE Xplore
 * and Semantic Scholar — titles, venues, pages, DOIs and author order are as
 * published. `me` marks the author entry to highlight.
 */
export const research = [
  {
    id: 'traffic-signs',
    tone: 'amber',
    diagram: 'benchmark',
    kind: 'IEEE conference paper',
    title:
      'A Comparative Study of YOLOv8, Faster R-CNN, and SSD in Traffic Sign Detection '
      + 'with Consideration of GPS and Central Feedback',
    venue: 'ICACCM 2024',
    venueFull: '2024 International Conference on Advances in Computing, Communication and Materials',
    place: 'Dehradun, India',
    presented: 'Nov 2024',
    published: 'IEEE Xplore · Jul 2025',
    pages: '1–7',
    doi: '10.1109/ICACCM61117.2024.11059135',
    authors: ['Sonu', { name: 'Balwinder Singh', me: true }, 'Ajay', 'Ankita Sharma'],
    question: 'Which detector should a car trust — and what can GPS add?',
    abstract:
      'Benchmarks three detector families for live traffic-sign recognition and proposes an '
      + 'architecture that feeds GPS, telemetry and central feedback into detection, so the '
      + 'system stays reliable across weather and traffic conditions.',
    points: [
      'YOLOv8, Faster R-CNN and SSD compared on real-time video',
      'GPS and telemetry used as context for detection, not just extra layers',
      'HOG and CNN features combined for classification',
    ],
    keywords: ['YOLOv8', 'Faster R-CNN', 'SSD', 'CNN', 'HOG', 'GPS'],
    links: {
      ieee: 'https://ieeexplore.ieee.org/document/11059135',
      researchgate: 'https://www.researchgate.net/publication/393341117_A_Comparative_Study_of_YOLOv8_Faster_R-CNN_and_SSD_in_Traffic_Sign_Detection_with_Consideration_of_GPS_and_Central_Feedback',
      scholar: 'https://www.semanticscholar.org/paper/423c4c31ade3284fd231a7d85f037870528441a1',
    },
    cite:
      'Sonu, B. Singh, Ajay, and A. Sharma, "A Comparative Study of YOLOv8, Faster R-CNN, and '
      + 'SSD in Traffic Sign Detection with Consideration of GPS and Central Feedback," in Proc. '
      + '2024 Int. Conf. Advances in Computing, Communication and Materials (ICACCM), Dehradun, '
      + 'India, 2024, pp. 1–7, doi: 10.1109/ICACCM61117.2024.11059135.',
  },
  {
    id: 'face-login',
    tone: 'coral',
    diagram: 'auth',
    kind: 'IEEE conference paper',
    title:
      'A Login Confirmation Mechanism for Meeting Platforms with an Automatic Face '
      + 'Acknowledgment System',
    venue: 'CCICT 2024',
    venueFull:
      '2024 Sixth International Conference on Computational Intelligence and Communication '
      + 'Technologies',
    place: 'Sonepat, India',
    presented: 'Apr 2024',
    published: 'IEEE Xplore · 2024',
    pages: '609–616',
    doi: '10.1109/CCICT62777.2024.00100',
    authors: [
      'Sanjay Singla', 'Neha Rajput', 'Sonu', { name: 'Balwinder Singh', me: true },
      'Arpan Ghosh', 'Ajay Kumar',
    ],
    question: 'What stops someone with the link from walking into your meeting?',
    abstract:
      'A meeting link can be forwarded and a password can be shared. This paper puts face '
      + 'recognition at the door of an online meeting, so only the invited attendees get in.',
    points: [
      'Four stages: participant entry, face detection, recognition, database',
      'Haar-cascade detection with Local Binary Pattern Histogram recognition',
      'Closes the gap where anyone holding the URL can join',
    ],
    keywords: ['Face recognition', 'Haar cascade', 'LBPH', 'Authentication', 'Video conferencing'],
    links: {
      ieee: 'https://ieeexplore.ieee.org/document/10596633',
      scholar: 'https://www.semanticscholar.org/paper/e317818cb1982a76283be5cacdb785a6d15ba809',
    },
    cite:
      'S. Singla, N. Rajput, Sonu, B. Singh, A. Ghosh, and A. Kumar, "A Login Confirmation '
      + 'Mechanism for Meeting Platforms with an Automatic Face Acknowledgment System," in '
      + 'Proc. 2024 6th Int. Conf. Computational Intelligence and Communication Technologies '
      + '(CCICT), Sonepat, India, 2024, pp. 609–616, doi: 10.1109/CCICT62777.2024.00100.',
  },
];
