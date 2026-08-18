export const concepts = [
  {
    id: 1,
    folder: "01_Concept_01",
    slug: "compass",
    name: "Compass Coach",
    thaiName: "เข็มทิศอนาคต",
    descriptor: "AI career discovery coach",
    sentence: "A warm AI coach turns reflection and small experiments into three understandable next-step routes.",
    positioning: "A reassuring personal career coach for students who need a calm first step.",
    target: "Thai students in ม.3–ม.6 who feel overwhelmed by choices and want conversational guidance.",
    problem: "Career information is fragmented, advice feels generic, and students do not know where to begin.",
    uvp: "One calm conversation becomes three evidence-backed routes and one achievable mission.",
    emotional: "Reassured, seen, capable, and gently motivated.",
    visual: "Warm editorial paper-cut landscapes, compass metaphors, rounded cards, and generous calm space.",
    navigation: "Top navigation organized around Discover, My Paths, Roadmap, and Saved.",
    desktopNav: "Wide top bar with persistent Start discovery CTA and visible trust note.",
    mobileNav: "Compact header plus four-item bottom navigation.",
    interaction: "Coach-led conversation with progressive disclosure and a single next-best action.",
    interviewModel: "A side-by-side coach conversation and live evidence notebook.",
    landingLayout: "Editorial split hero: copy left, generated path illustration right, followed by a three-step discovery strip.",
    dashboardLayout: "Action-first dashboard led by Today’s next step, route health, saved choices, and counselor-share control.",
    resultsLayout: "Three route cards—Balanced, Growth, Practical—anchored by evidence and open questions.",
    roadmapLayout: "A vertical step path with expandable milestones and optional branches.",
    authLayout: "A short, reassuring sign-in card explaining privacy before phone/OTP or email entry.",
    color: { bg: "#F7F3EA", surface: "#FFFFFF", ink: "#15253D", muted: "#617083", primary: "#F06F54", secondary: "#78C7B4", accent: "#F4C66A", border: "#DCD6C9" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "24px",
    features: ["Socratic AI coach", "STAR evidence notebook", "RIASEC interest signals", "Scenario missions", "Three-route comparison", "30-day roadmap", "Consent-based sharing"],
    advantages: ["Lowest onboarding anxiety", "Easy to explain in a demo", "Strong trust and guidance tone"],
    disadvantages: ["Less novel than game or story concepts", "Coach quality depends heavily on dialogue design"],
    difficulty: "Medium",
    tech: "Semantic HTML/CSS/JavaScript prototype; production Next.js, FastAPI, PostgreSQL, Qdrant, rule engine, and Thai-capable LLM.",
    fit: "It expresses the knowledge base’s Socratic, motivational, multi-route approach in the clearest mainstream product form.",
    voice: "Warm, brief, reflective, never directive.",
    headline: "ไม่ต้องรู้คำตอบทั้งหมด แค่เริ่มจากก้าวถัดไป",
    subhead: "คุยกับ AI Coach ลองภารกิจสั้น ๆ แล้วเห็น 3 เส้นทางเรียน–อาชีพที่อธิบายได้จากเรื่องจริงของคุณ",
    cta: "เริ่มค้นหาเส้นทาง",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 01 landing page hero illustration
Primary request: an original hopeful visual metaphor for a Thai secondary-school student discovering several possible education and career paths with a calm AI career coach
Scene/backdrop: airy abstract studio landscape made of softly layered pathway ribbons, small learning milestones, and a distant sunrise; culturally neutral contemporary Thailand context
Subject: one age-appropriate Thai student seen in three-quarter view beside a friendly non-humanoid compass-like AI light, looking toward three distinct paths for digital work, healthcare, and creative work
Style/medium: premium editorial 3D paper-cut illustration with soft clay details, sophisticated educational product aesthetic
Composition/framing: wide 16:9 composition, subjects grouped toward the right half, generous quiet negative space on the left for HTML headline and buttons
Lighting/mood: warm morning light, reassuring, curious, capable, never childish
Color palette: deep navy, warm coral, mint, pale sky blue, cream
Materials/textures: tactile paper, matte clay, subtle grain
Background: clean layered abstract environment, no recognizable institution or commercial branding
Intended page: Compass Coach landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no photorealistic identifiable person, no prediction or fortune-telling imagery`
  },
  {
    id: 2,
    folder: "02_Concept_02",
    slug: "mirror",
    name: "The Mirror Interview",
    thaiName: "บทสนทนากับตัวเอง",
    descriptor: "Interactive personality interview",
    sentence: "A reflective interview lets students recognize patterns in their own stories before seeing any career label.",
    positioning: "A private reflection studio for students who dislike conventional personality quizzes.",
    target: "Introspective Thai students in ม.4–university year 1 who want language for what matters to them.",
    problem: "Multiple-choice tests flatten identity and encourage socially desirable answers.",
    uvp: "See the evidence behind each interest signal as it emerges from your own stories.",
    emotional: "Safe, thoughtful, validated, and pleasantly surprised.",
    visual: "Frosted glass, editorial collage, soft violet gradients, mirror facets, and quiet gallery pacing.",
    navigation: "Minimal centered navigation: Reflect, Evidence, Possibilities, Journal.",
    desktopNav: "Floating centered pill navigation that disappears during focused interview mode.",
    mobileNav: "A single progress rail and back control; navigation returns after each reflection chapter.",
    interaction: "Chaptered reflective prompts, pause-to-note moments, and editable evidence fragments.",
    interviewModel: "Full-screen reflection chapters with a live mirror of summarized phrases—not a chat transcript.",
    landingLayout: "Gallery-like split hero with a luminous mirror visual and floating reflection cards.",
    dashboardLayout: "A private journal arranged by themes, evidence moments, and unresolved questions.",
    resultsLayout: "Six interest facets unfold into route families; users can challenge or edit each inference.",
    roadmapLayout: "A journal timeline connecting reflections, trials, and decisions.",
    authLayout: "A frosted privacy panel with private-by-default reassurance and optional pseudonymous start.",
    color: { bg: "#F5F0F6", surface: "#FFF9FC", ink: "#30243D", muted: "#74657C", primary: "#7C4D8F", secondary: "#E8A58C", accent: "#C9A8E5", border: "#DED1E2" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Iowan Old Style\", \"Noto Serif Thai\", Georgia, serif",
    radius: "36px",
    features: ["Reflective chapters", "Editable AI summaries", "RIASEC facet view", "Values ladder", "Evidence journal", "Route hypotheses", "Private share packet"],
    advantages: ["Strong differentiation from static tests", "Builds self-awareness", "Excellent trust and consent moments"],
    disadvantages: ["Longer session", "Requires strong summarization UX and careful language"],
    difficulty: "Medium–High",
    tech: "Next.js state machine, streaming LLM responses, structured evidence store, RIASEC rule engine, and encrypted journal data.",
    fit: "It closely follows Socratic questioning, motivational interviewing, laddering, and the requirement to avoid premature labels.",
    voice: "Reflective, non-judgmental, precise, and spacious.",
    headline: "คำตอบไม่ได้อยู่ในตัวเลือก แต่อยู่ในเรื่องที่คุณเคยทำ",
    subhead: "บทสัมภาษณ์ส่วนตัวที่ช่วยสะท้อนความสนใจ คุณค่า และหลักฐานจากประสบการณ์จริงของคุณ",
    cta: "เปิดห้องสะท้อนตัวตน",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 02 landing page hero illustration
Primary request: an original visual metaphor for an interactive personality interview where a Thai student sees different sides of their interests reflected as possibilities rather than fixed labels
Scene/backdrop: contemporary quiet reflection studio with translucent panels, floating abstract question cards, and six subtle colored facets suggesting RIASEC without letters
Subject: one age-appropriate Thai student interacting thoughtfully with a tall soft-edged luminous mirror; reflected fragments show making, investigating, creating, helping, leading, and organizing through small symbolic scenes
Style/medium: sophisticated editorial collage mixing frosted glass, paper cutouts, and subtle ink textures
Composition/framing: wide 16:9 composition with the student and mirror centered-right; generous uncluttered negative space on the left for HTML copy
Lighting/mood: soft diffused gallery lighting, introspective, safe, validating, curious
Color palette: plum, orchid, peach, pale lilac, charcoal, warm white
Materials/textures: frosted glass, vellum paper, fine ink grain
Background: minimal studio, no commercial environment
Intended page: Mirror Interview landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no fortune-telling imagery, no diagnostic or medical imagery, no photorealistic identifiable person`
  },
  {
    id: 3,
    folder: "03_Concept_03",
    slug: "timeline",
    name: "Timefold",
    thaiName: "ไทม์ไลน์ตัวฉันในอนาคต",
    descriptor: "Future self timeline",
    sentence: "Students compare several believable future chapters and work backward to a useful next step.",
    positioning: "A future-self simulator for students motivated by seeing where choices could lead.",
    target: "Thai upper-secondary and vocational students planning TCAS, portfolios, or entry into work.",
    problem: "Education choices feel abstract because students cannot connect today’s action to later possibilities.",
    uvp: "Preview multiple possible futures—then reverse-plan one low-risk experiment.",
    emotional: "Ambitious, energized, grounded, and in control.",
    visual: "Cinematic dark canvas, luminous timeline ribbons, miniature future scenes, and time-based chapters.",
    navigation: "Timeline-first navigation: Now, Try, Study, Build, Work.",
    desktopNav: "A horizontal chapter rail with the current stage pinned.",
    mobileNav: "A thumb-friendly scrubber for moving between timeline chapters.",
    interaction: "Scroll or scrub through parallel future chapters, compare trade-offs, then reverse-plan.",
    interviewModel: "The AI asks from a future-scene prompt and folds evidence back into the current chapter.",
    landingLayout: "Immersive dark hero with the generated timeline as a cinematic background and a restrained copy panel.",
    dashboardLayout: "A horizontal life-roadmap with deadlines, portfolio moments, and alternate branches.",
    resultsLayout: "Side-by-side future scenes with assumptions, evidence, and trade-offs rather than match scores.",
    roadmapLayout: "Horizontal DAG with zoomable years and a compact vertical version on mobile.",
    authLayout: "A dark modal card explaining that future scenes are exploratory scenarios, not predictions.",
    color: { bg: "#071426", surface: "#0D2038", ink: "#F4F8FF", muted: "#A8BAD0", primary: "#43D7E8", secondary: "#8F6BFF", accent: "#FFB85A", border: "#26425F" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Arial Narrow\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "18px",
    features: ["Parallel future scenes", "Reverse planning", "TCAS milestones", "Portfolio checkpoints", "Assumption editor", "Branch comparison", "Deadline reminders"],
    advantages: ["Powerful presentation impact", "Makes roadmaps concrete", "Strong fit for DAG architecture"],
    disadvantages: ["Can feel deterministic without careful disclaimers", "Timeline visualization is complex on small screens"],
    difficulty: "High",
    tech: "React/Next.js, graph layout engine, timeline virtualization, FastAPI roadmap generator, PostgreSQL graph records.",
    fit: "It turns the documented Interactive Pathfinder DAG into the primary product experience while preserving multiple branches.",
    voice: "Forward-looking, concrete, ambitious, and explicit about uncertainty.",
    headline: "ลองเห็นหลายอนาคต ก่อนเลือกก้าวถัดไป",
    subhead: "สำรวจฉากอนาคตหลายแบบ เปรียบเทียบสิ่งที่ต้องแลก และย้อนกลับมาวางแผนจากวันนี้",
    cta: "เปิดไทม์ไลน์ของฉัน",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 03 landing page hero illustration
Primary request: an original future-self timeline showing an age-appropriate Thai student moving through learn, try, choose, and grow milestones across several possible futures
Scene/backdrop: a flowing horizontal ribbon timeline passing through a school desk, a hands-on mini project, an education choice junction, and an early-career studio; alternate branches remain visible
Subject: the same student represented at a few future stages as small consistent silhouettes, supported by an abstract guiding light; paths do not imply a guaranteed destiny
Style/medium: cinematic isometric editorial illustration with layered gradients and precise miniature environments
Composition/framing: wide 16:9 panoramic timeline from lower right toward upper right, broad dark negative space on the left for HTML headline
Lighting/mood: twilight-to-dawn transition, ambitious, reflective, hopeful, grounded
Color palette: midnight indigo, electric cyan, sunrise amber, soft violet, white
Materials/textures: luminous translucent ribbons, matte miniature architecture, gentle atmospheric haze
Background: abstract horizon, no branded institutions
Intended page: Timefold Timeline landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no clocks predicting fate, no fortune-telling symbols, no photorealistic identifiable person`
  },
  {
    id: 4,
    folder: "04_Concept_04",
    slug: "lab",
    name: "PathLab",
    thaiName: "ห้องทดลองเส้นทาง",
    descriptor: "Career exploration dashboard",
    sentence: "A transparent evidence lab lets students inspect how interests, strengths, constraints, and trials shape each route.",
    positioning: "A data-literate exploration workspace for students and counselors who want explainability.",
    target: "Analytical Thai students in ม.4–university year 1 and guidance counselors.",
    problem: "Opaque recommendation scores reduce trust and hide important constraints.",
    uvp: "Every recommendation can be opened, inspected, challenged, and updated.",
    emotional: "Capable, informed, curious, and confident in the process.",
    visual: "Bright cobalt data lab, modular bento panels, crisp geometry, charts, and evidence tokens.",
    navigation: "Persistent left rail: Overview, Evidence, Missions, Route Lab, Roadmap, Sources.",
    desktopNav: "Dense but ordered left rail with workspace switcher and source status.",
    mobileNav: "Bottom tabs plus a filter drawer for evidence and constraints.",
    interaction: "Drag evidence tokens into a route lab, adjust transparent weights, and compare outcomes.",
    interviewModel: "Chat sits beside a structured live extraction panel and source/evidence inspector.",
    landingLayout: "Product-dashboard hero with modular proof cards and a live-looking evidence workspace.",
    dashboardLayout: "Bento analytics dashboard with evidence coverage, mission results, route comparison, and data freshness.",
    resultsLayout: "Comparison table and inspectable decision matrix with no single winner state.",
    roadmapLayout: "Dependency graph with filters for skills, study, portfolio, and work.",
    authLayout: "A precise account panel with data controls and role selection.",
    color: { bg: "#F3F7FC", surface: "#FFFFFF", ink: "#14233A", muted: "#66758A", primary: "#245CEB", secondary: "#16B6B0", accent: "#B8E239", border: "#D6E0EC" },
    font: "\"IBM Plex Sans Thai\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"IBM Plex Sans Thai\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "14px",
    features: ["Evidence inspector", "Decision weight sandbox", "Route comparison", "Source drawer", "Constraint checks", "Mission analytics", "Counselor notes"],
    advantages: ["Highest explainability", "Strong counselor utility", "Scales to more data and routes"],
    disadvantages: ["Potentially intimidating for younger students", "More front-end and data complexity"],
    difficulty: "High",
    tech: "Next.js bento UI, TanStack tables, graph/chart components, FastAPI, PostgreSQL, Qdrant hybrid search, audit logs.",
    fit: "It makes the documented rule-based + RAG architecture visible and supports evidence-backed, non-guaranteed recommendations.",
    voice: "Clear, factual, transparent, and encouraging without hype.",
    headline: "เปิดดูได้ว่าแต่ละเส้นทางมาจากหลักฐานอะไร",
    subhead: "สำรวจข้อมูลจากเรื่องที่คุณเล่า ภารกิจที่ลอง และข้อจำกัดจริง—พร้อมแก้ไขสมมติฐานได้ทุกจุด",
    cta: "เข้าห้องทดลอง",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 04 landing page hero illustration
Primary request: an original visual metaphor for a career exploration laboratory where student evidence becomes understandable possibilities
Scene/backdrop: a clean modular analysis workspace with floating translucent cards, a skill radar, small project samples, and three route tiles connected by fine lines
Subject: an age-appropriate Thai student arranging evidence tokens from interests, past actions, and a mini mission; a subtle abstract AI lens helps sort them without judging
Style/medium: polished isometric product illustration, data-informed yet human, crisp geometric forms with soft depth
Composition/framing: wide 16:9 scene concentrated on the right two-thirds, quiet light negative space on the left for HTML copy
Lighting/mood: bright controlled studio light, capable, transparent, trustworthy
Color palette: cobalt blue, aqua, lime accent, graphite, cloud white
Materials/textures: frosted acrylic, matte polymer, light grid texture
Background: minimal analytics studio, no commercial branding
Intended page: PathLab Explorer landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no surveillance imagery, no guaranteed-score symbolism, no photorealistic identifiable person`
  },
  {
    id: 5,
    folder: "05_Concept_05",
    slug: "quest",
    name: "QuestMap",
    thaiName: "แผนที่ภารกิจค้นหาตัวตน",
    descriptor: "Gamified self-discovery journey",
    sentence: "Students unlock insight by completing short, varied missions across a playful map—not by chasing a score.",
    positioning: "A mission-based discovery game for students who learn through action.",
    target: "Thai students in ป.6–ม.3, especially those disengaged by long questionnaires.",
    problem: "Traditional guidance feels passive, school-like, and disconnected from actual behavior.",
    uvp: "Try before you decide: every mission reveals a new clue about how you like to work.",
    emotional: "Playful, brave, curious, and proud of progress.",
    visual: "Tactile 2.5D islands, bright tropical palette, mission badges, and rounded map controls.",
    navigation: "World-map navigation: Base Camp, Zones, Backpack, Routes, Team.",
    desktopNav: "Map header with current zone and compact mission inventory.",
    mobileNav: "Game-like bottom dock with a central Continue mission button.",
    interaction: "Choose a zone, complete a 3–5 minute scenario, collect evidence badges, and unlock route clues.",
    interviewModel: "A friendly guide asks short questions between missions; responses alter the next challenge.",
    landingLayout: "Playful map hero with zone previews, mission duration chips, and one prominent Continue journey control.",
    dashboardLayout: "Base Camp shows current quest, evidence backpack, streak-free progress, and route clues.",
    resultsLayout: "Route cards appear as unlocked regions with evidence badges and a Try next action.",
    roadmapLayout: "A map trail of missions and milestones rather than a formal Gantt-like plan.",
    authLayout: "Avatar-first onboarding with a plain-language parent/guardian consent checkpoint where required.",
    color: { bg: "#FFF4D8", surface: "#FFFDF6", ink: "#2B2740", muted: "#716B79", primary: "#E95A67", secondary: "#1FA99A", accent: "#F6C84A", border: "#E6D4A7" },
    font: "\"Arial Rounded MT Bold\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Arial Rounded MT Bold\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "28px",
    features: ["Mission zones", "Scenario sandbox", "Evidence backpack", "No-loss progress", "Route clues", "Team missions", "Counselor safety route"],
    advantages: ["Strong engagement for younger students", "Makes multi-evidence assessment tangible", "Great hackathon demo"],
    disadvantages: ["Gamification can trivialize serious choices", "Requires ongoing mission content production"],
    difficulty: "High",
    tech: "Next.js/PWA, lightweight game state, mission rules engine, animation library, FastAPI evaluation, content CMS.",
    fit: "It foregrounds the source-backed Scenario Missions phase and supports exploration before commitment.",
    voice: "Energetic, friendly, low-pressure, and never competitive.",
    headline: "ค้นหาตัวเองด้วยการลอง ไม่ใช่การเดา",
    subhead: "เลือกโซน ทำภารกิจ 3 นาที เก็บหลักฐานจากสิ่งที่คุณลงมือทำ แล้วค่อยเปิดเส้นทางใหม่",
    cta: "เริ่มภารกิจแรก",
    heroPrompt: `Use case: illustration-story
Asset type: Future Me Concept 05 landing page hero illustration
Primary request: an original gamified self-discovery journey for Thai students, shown as a friendly mission map with multiple valid routes
Scene/backdrop: a playful floating island map with six zones for making, investigating, creating, helping, leading, and organizing; short bridges lead to a project camp and a roadmap summit
Subject: a diverse small group of age-appropriate Thai student avatars choosing different mission paths with a warm firefly-like guide
Style/medium: high-quality 2.5D game-board illustration with tactile paper terrain and charming simple characters, age-appropriate for secondary school rather than young children
Composition/framing: wide 16:9 map sweeping across the right side, generous sky negative space on the left for HTML headline
Lighting/mood: golden afternoon, energetic, welcoming, exploratory, low-pressure
Color palette: jungle teal, mango yellow, coral, sky blue, aubergine, cream
Materials/textures: layered paper terrain, matte clay props, subtle screen-print grain
Background: imaginative landscape with abstract Thai tropical cues, no temple clichés, no branded places
Intended page: QuestMap landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no weapons, no winner podium, no fortune-telling imagery`
  },
  {
    id: 6,
    folder: "06_Concept_06",
    slug: "counselor",
    name: "Nara",
    thaiName: "เพื่อนแนะแนวดิจิทัล",
    descriptor: "Digital guidance counselor",
    sentence: "A calm digital counselor provides a confidential place to untangle pressure, choices, and practical next steps.",
    positioning: "A trustworthy guidance companion that extends—not replaces—the school counselor.",
    target: "Thai students in ม.3–ม.6 who feel pressured by family, grades, or uncertain choices.",
    problem: "Students rarely receive enough private, non-judgmental counseling time.",
    uvp: "A private conversation that prepares students for better human guidance conversations.",
    emotional: "Held, calmer, respected, and ready to talk with a trusted adult.",
    visual: "Soft sage interiors, natural materials, curved seating, and an original pebble-shaped AI presence.",
    navigation: "Conversation-centered navigation: Talk, My Notes, Options, Plan, Share.",
    desktopNav: "Compact top navigation that gives the conversation most of the canvas.",
    mobileNav: "Large Talk button with quiet secondary tabs for Notes and Plan.",
    interaction: "Voice-or-text counseling session with reflective summaries and consent checkpoints.",
    interviewModel: "A spacious counseling room UI with an optional voice waveform and private notes drawer.",
    landingLayout: "Quiet editorial hero: broad breathing room, counselor-room visual, trust and privacy assurances.",
    dashboardLayout: "Wellbeing-aware home with check-in, unresolved decisions, next conversation, and share packet.",
    resultsLayout: "A counselor’s summary: what we heard, possible routes, what needs checking, and who can help.",
    roadmapLayout: "A gentle weekly plan with a human support contact attached to difficult steps.",
    authLayout: "Trust-first entry explaining transcript privacy, deletion, and emergency/safety boundaries.",
    color: { bg: "#EEF3EA", surface: "#FAFCF7", ink: "#26352E", muted: "#69786F", primary: "#3D6E58", secondary: "#E79C72", accent: "#D6BE79", border: "#D3DDD2" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Iowan Old Style\", \"Noto Serif Thai\", Georgia, serif",
    radius: "32px",
    features: ["Private chat/voice", "Reflective summaries", "Pressure mapping", "Human counselor handoff", "Consent-based sharing", "Route options", "Weekly plan"],
    advantages: ["Strong emotional trust", "Clear ecosystem role with teachers", "Good for sensitive decision contexts"],
    disadvantages: ["Needs robust safety policy and escalation", "AI anthropomorphism must be carefully limited"],
    difficulty: "Medium–High",
    tech: "Next.js, Web Speech optional layer, streaming LLM, safety classifier, encrypted notes, RBAC share packets.",
    fit: "It operationalizes Motivational Interviewing, reflective listening, privacy boundaries, and counselor collaboration.",
    voice: "Calm, empathetic, boundaried, and never clinical or authoritative.",
    headline: "พื้นที่เงียบ ๆ สำหรับคิดเรื่องใหญ่ของคุณ",
    subhead: "นาราช่วยฟัง สะท้อน และเตรียมคำถามที่ควรคุยต่อกับครู ผู้ปกครอง หรือคนที่คุณไว้ใจ",
    cta: "คุยกับนารา",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 06 landing page hero illustration
Primary request: an original calm digital guidance counselor scene for a Thai student who feels uncertain about study and career choices
Scene/backdrop: a welcoming modern counseling nook with soft curved seating, a window suggesting several distant learning paths, and a small table with project artifacts
Subject: one age-appropriate Thai student in relaxed conversation with Nara, an original non-human AI counselor character made of a softly glowing pebble-shaped form with expressive light rings
Style/medium: premium warm 3D editorial illustration, rounded forms, subtle human-centered product aesthetic
Composition/framing: wide 16:9 interior concentrated on the right, ample calm negative space on the left for HTML copy
Lighting/mood: soft late-morning natural light, confidential, grounded, empathetic, never clinical
Color palette: forest green, sage, apricot, warm sand, dark charcoal
Materials/textures: boucle fabric, light wood, matte ceramic, translucent light
Background: neutral contemporary learning space, no institutional logos
Intended page: Nara Guidance landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no therapist or medical symbolism, no humanoid robot, no photorealistic identifiable person`
  },
  {
    id: 7,
    folder: "07_Concept_07",
    slug: "story",
    name: "Tomorrow Stories",
    thaiName: "เรื่องเล่าของวันพรุ่งนี้",
    descriptor: "Story-based career adventure",
    sentence: "Students enter short branching stories that reveal preferences through choices, consequences, and reflection.",
    positioning: "An interactive narrative anthology that lets students rehearse unfamiliar work contexts.",
    target: "Creative Thai students in ม.2–ม.6 who engage with stories more than dashboards.",
    problem: "Career descriptions are abstract and fail to show what everyday work can feel like.",
    uvp: "Experience a five-minute work story, then unpack what your choices reveal.",
    emotional: "Immersed, curious, expressive, and safely challenged.",
    visual: "Graphic-novel panels, bold ink, risograph texture, chapter cards, and cinematic branching doors.",
    navigation: "Chapter navigation: Library, Current Story, Clues, Endings, My Next Chapter.",
    desktopNav: "Editorial masthead with chapter index and reading progress.",
    mobileNav: "Swipeable chapter deck with tap zones and persistent accessibility controls.",
    interaction: "Branching narrative choices followed by Socratic debrief and a replay-from-another-perspective option.",
    interviewModel: "Questions appear between story beats as a director’s debrief rather than a chat window.",
    landingLayout: "Magazine-cover hero with strong type, generated doorway panorama, and featured story cards.",
    dashboardLayout: "A bookshelf of completed stories, discovered clues, alternate endings, and next recommended scene.",
    resultsLayout: "A narrative dossier linking choices to behavior evidence and three possible next chapters.",
    roadmapLayout: "A chapter arc where each milestone is a scene, project, or real conversation.",
    authLayout: "A simple library-card metaphor with privacy and content sensitivity controls.",
    color: { bg: "#F4E9D1", surface: "#FFF8E9", ink: "#102A43", muted: "#6E665B", primary: "#D84A32", secondary: "#1A8F91", accent: "#D9A928", border: "#C9B999" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Arial Black\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "8px",
    features: ["Branching career stories", "Choice replay", "Socratic debrief", "Evidence clues", "Perspective switch", "Route chapters", "Story accessibility controls"],
    advantages: ["Highly memorable", "Makes roles concrete", "Supports scenario-based evidence"],
    disadvantages: ["Expensive narrative content", "May bias users toward dramatized scenarios"],
    difficulty: "High",
    tech: "Next.js narrative state machine, headless CMS, authored decision trees, FastAPI evidence extraction, analytics.",
    fit: "It combines Scenario Missions with STAR reflection and avoids asking students to imagine careers from labels alone.",
    voice: "Vivid, concise, curious, and reflective after each choice.",
    headline: "ลองใช้ชีวิตหนึ่งวัน ก่อนเลือกบทถัดไป",
    subhead: "เล่นเรื่องสั้นจากโลกงาน ตัดสินใจในสถานการณ์จริง และค่อยย้อนดูว่าคุณเลือกแบบนั้นเพราะอะไร",
    cta: "เปิดเรื่องแรก",
    heroPrompt: `Use case: illustration-story
Asset type: Future Me Concept 07 landing page hero illustration
Primary request: an original branching story adventure where a Thai student tries short scenes from different careers before choosing what to explore
Scene/backdrop: one continuous illustrated panorama with three open doorways leading to a community design challenge, a small data mystery, and a hands-on engineering repair; every doorway remains reachable
Subject: one age-appropriate Thai student at the center holding a blank field notebook, with visual traces of choices branching and reconnecting
Style/medium: contemporary graphic novel illustration with bold shapes, editorial linework, screen-printed texture, sophisticated youth publishing style
Composition/framing: wide 16:9 panorama, action and doorways on the right two-thirds, strong quiet color field on the left for HTML headline
Lighting/mood: dramatic but optimistic stage lighting, curious, agency-rich, imaginative
Color palette: ink navy, vermilion, mustard, turquoise, paper cream
Materials/textures: risograph grain, cut-paper shadows, expressive ink lines
Background: abstract school-to-city transition, no commercial signage
Intended page: Tomorrow Stories landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no speech bubbles, no letters, no numbers, no logos, no trademarks, no watermark, no fantasy prophecy, no violence`
  },
  {
    id: 8,
    folder: "08_Concept_08",
    slug: "constellation",
    name: "Skill Constellation",
    thaiName: "จักรวาลทักษะของฉัน",
    descriptor: "Skill and interest mapping platform",
    sentence: "A living network connects interests, demonstrated skills, values, courses, and career clusters.",
    positioning: "A visual mapping tool for students with cross-disciplinary interests.",
    target: "Thai upper-secondary, vocational, and university students with several overlapping interests.",
    problem: "Linear career lists hide transferable skills and hybrid routes.",
    uvp: "See how one proven skill opens several education and career neighborhoods.",
    emotional: "Expansive, curious, intelligent, and free from fixed labels.",
    visual: "Deep indigo space, luminous glass nodes, elegant data-art, and connected clusters.",
    navigation: "Spatial navigation: My Orbit, Evidence, Clusters, Bridges, Route.",
    desktopNav: "A slim translucent rail over an interactive node canvas.",
    mobileNav: "Search-first node list with an optional simplified map view.",
    interaction: "Pan, zoom, filter, and connect evidence nodes; expand bridges between career clusters.",
    interviewModel: "A compact AI sidecar asks for missing evidence while the graph updates live.",
    landingLayout: "Dark immersive hero with the generated constellation and an interactive node teaser.",
    dashboardLayout: "Network canvas plus an insight drawer, saved cluster filters, and evidence coverage.",
    resultsLayout: "Three highlighted paths through the same network, each with different bridge skills.",
    roadmapLayout: "Graph route with prerequisite edges and alternate bridge nodes.",
    authLayout: "A dark glass panel explaining data ownership and graph visibility.",
    color: { bg: "#090B22", surface: "#131633", ink: "#F3F1FF", muted: "#A5A8C7", primary: "#6D5DFB", secondary: "#16D8E5", accent: "#F4B84D", border: "#2D3155" },
    font: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Avenir Next\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "20px",
    features: ["Skill graph", "Interest clusters", "Transferable skill bridges", "Evidence strength", "Route finder", "Course nodes", "Graph filters"],
    advantages: ["Most scalable knowledge visualization", "Excellent for hybrid careers", "Supports DAG and taxonomy well"],
    disadvantages: ["Graph interactions are difficult on mobile", "Needs careful simplification and performance work"],
    difficulty: "Very High",
    tech: "Next.js, WebGL/SVG graph renderer, graph service, PostgreSQL/graph tables, Qdrant, FastAPI pathfinding.",
    fit: "It visualizes the documented career-skill-degree mappings and DAG prerequisites as a flexible network.",
    voice: "Exploratory, precise, non-mystical, and explicit that links are evidence relationships.",
    headline: "หนึ่งทักษะ พาคุณไปได้มากกว่าหนึ่งทาง",
    subhead: "เชื่อมสิ่งที่ชอบ สิ่งที่เคยทำ และทักษะที่พิสูจน์แล้ว เข้ากับเส้นทางเรียนและอาชีพแบบเห็นภาพ",
    cta: "เปิดแผนที่ทักษะ",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 08 landing page hero illustration
Primary request: an original skill-and-interest constellation that maps evidence into connected career clusters without implying destiny
Scene/backdrop: deep indigo spatial field with luminous nodes connected as a clear network; clusters suggest technology, care, design, business, and engineering through abstract objects
Subject: an age-appropriate Thai student seen from behind gently connecting three evidence nodes from a project, a conversation, and an interest; several possible constellations remain visible
Style/medium: elegant cinematic 3D data-art illustration, museum-installation quality, crisp luminous particles with restrained detail
Composition/framing: wide 16:9 composition, glowing network arc on the right and center, dark uncluttered negative space on the left for HTML copy
Lighting/mood: soft bioluminescent glow, wondrous, analytical, calm, expansive
Color palette: near-black indigo, ultraviolet, electric cyan, magenta, warm gold
Materials/textures: translucent glass nodes, fine light trails, subtle star dust
Background: abstract data space, not literal astrology
Intended page: Skill Constellation landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no zodiac symbols, no horoscope imagery, no fate prediction, no photorealistic identifiable person`
  },
  {
    id: 9,
    folder: "09_Concept_09",
    slug: "clarity",
    name: "Clarity",
    thaiName: "การประเมินที่ชัดเจน",
    descriptor: "Minimal professional assessment",
    sentence: "A restrained assessment experience prioritizes comprehension, accessibility, and audit-ready recommendations.",
    positioning: "A credible school-ready assessment for institutions that value clarity and low cognitive load.",
    target: "Thai students in ม.3–ม.6, schools, counselors, and parents seeking a formal but humane tool.",
    problem: "Guidance products often look entertaining but lack institutional trust and accessibility.",
    uvp: "A calm, accessible assessment with transparent evidence, confidence, and next actions.",
    emotional: "Focused, respected, clear, and secure.",
    visual: "Swiss-inspired grid, warm white, restrained teal, sharp type hierarchy, and almost no decoration.",
    navigation: "Utility navigation: Assessment, Report, Plan, Saved, Account.",
    desktopNav: "Simple text navigation in a strict twelve-column grid.",
    mobileNav: "Plain labeled tabs; no icon-only controls.",
    interaction: "Linear assessment with save-and-return, keyboard-first controls, and explicit progress.",
    interviewModel: "A structured prompt-and-response workspace with transcript control and evidence review.",
    landingLayout: "Minimal asymmetric grid with abundant whitespace and one precise generated still life.",
    dashboardLayout: "A report-like dashboard with clear sections, tables, next action, and update date.",
    resultsLayout: "Accessible comparison table plus route dossiers and confidence/caveat notes.",
    roadmapLayout: "Numbered milestone list with prerequisites, dates, and print-friendly formatting.",
    authLayout: "Standard, highly usable form with clear error messages and consent details.",
    color: { bg: "#F7F7F3", surface: "#FFFFFF", ink: "#121716", muted: "#5F6B67", primary: "#176B62", secondary: "#52738F", accent: "#C9953D", border: "#CBD2CD" },
    font: "\"Helvetica Neue\", \"Noto Sans Thai\", Arial, sans-serif",
    headingFont: "\"Helvetica Neue\", \"Noto Sans Thai\", Arial, sans-serif",
    radius: "2px",
    features: ["Accessible assessment", "Save and return", "Evidence report", "Route comparison table", "Print/PDF view", "Audit notes", "Role-based summary"],
    advantages: ["Easiest to build and maintain", "Highest accessibility potential", "Strong institutional credibility"],
    disadvantages: ["Lower novelty and emotional appeal", "May feel too formal for younger users"],
    difficulty: "Low–Medium",
    tech: "Server-rendered Next.js, semantic forms, FastAPI, PostgreSQL, rule engine, optional RAG explanations.",
    fit: "It provides the clearest delivery vehicle for explainable, non-guaranteed guidance and privacy controls.",
    voice: "Plain, respectful, concise, and specific.",
    headline: "คำแนะนำที่อ่านเข้าใจ และตรวจสอบได้",
    subhead: "การประเมินที่เรียบง่าย แสดงหลักฐาน ความไม่แน่นอน และก้าวถัดไปโดยไม่ฟันธงอนาคต",
    cta: "เริ่มการประเมิน",
    heroPrompt: `Use case: stylized-concept
Asset type: Future Me Concept 09 landing page hero illustration
Primary request: an original minimal professional assessment visual showing three transparent route dossiers built from evidence
Scene/backdrop: bright architectural white space with a single long table, neatly layered evidence sheets, three raised pathway objects, and one simple plant
Subject: an age-appropriate Thai student reviewing a clean evidence board with an abstract circular guide; the composition communicates clarity, privacy, and calm choice
Style/medium: minimalist Swiss-inspired editorial 3D still life with human warmth, precise geometry, understated premium education product
Composition/framing: wide 16:9, sparse objects grouped on the right half, exceptional white negative space on the left for HTML copy
Lighting/mood: soft north-window daylight, precise, quiet, credible, low cognitive load
Color palette: warm white, black, restrained teal, muted blue, small amber accent
Materials/textures: uncoated paper, brushed metal, frosted glass, pale wood
Background: clean studio architecture, no institution or corporate marks
Intended page: Clarity Assessment landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no exam grade symbols, no guaranteed match score, no photorealistic identifiable person`
  },
  {
    id: 10,
    folder: "10_Concept_10",
    slug: "pulse",
    name: "Pulse",
    thaiName: "ฟีดทดลองอนาคต",
    descriptor: "Gen-Z social and visual experience",
    sentence: "A private, visual discovery feed turns small experiments into shareable learning—not popularity.",
    positioning: "A mobile-first discovery feed for students accustomed to visual stories and short interactions.",
    target: "Thai Gen-Z students in ม.2–university year 1 who prefer short, visual, social formats.",
    problem: "Long assessments lose attention, while public social platforms reward popularity rather than reflection.",
    uvp: "Swipe through private mini-experiments, react with how it felt, and build a visual evidence reel.",
    emotional: "Expressive, current, included, and energized.",
    visual: "Hot coral and ultraviolet gradients, editorial collage, story frames, sticker shapes, and bold type.",
    navigation: "Mobile feed navigation: Discover, Try, Reel, Paths, Me.",
    desktopNav: "A three-column social workspace with feed, active experiment, and private reel.",
    mobileNav: "Five-item bottom dock with a prominent Try action.",
    interaction: "Swipe experiment cards, hold to preview, submit a quick artifact, and react with effort/energy—not likes.",
    interviewModel: "AI prompts appear as short visual story cards with voice or text replies.",
    landingLayout: "High-energy collage hero with a phone-like experiment deck and safety-first private-feed promise.",
    dashboardLayout: "A private feed of missions, evidence reel, saved paths, and progress moments.",
    resultsLayout: "A visual route carousel backed by expandable evidence captions and no public rank.",
    roadmapLayout: "A vertical story reel of upcoming experiments and milestones.",
    authLayout: "Fast mobile entry followed by explicit privacy, age, and sharing choices.",
    color: { bg: "#15102A", surface: "#241A45", ink: "#FFF8FF", muted: "#C8BDDB", primary: "#FF5364", secondary: "#825CFF", accent: "#C8FF4D", border: "#46366D" },
    font: "\"Arial Rounded MT Bold\", \"Noto Sans Thai\", system-ui, sans-serif",
    headingFont: "\"Arial Black\", \"Noto Sans Thai\", system-ui, sans-serif",
    radius: "26px",
    features: ["Private discovery feed", "Swipe experiments", "Energy/effort reactions", "Evidence reel", "Visual route carousel", "Friend co-op opt-in", "Strong sharing controls"],
    advantages: ["Highest Gen-Z appeal", "Excellent mobile demo", "Supports frequent re-engagement"],
    disadvantages: ["Risk of superficiality and social comparison", "Needs rigorous privacy and anti-ranking design"],
    difficulty: "Medium–High",
    tech: "Next.js/PWA, touch gesture layer, media upload service, content moderation, FastAPI, object storage, privacy controls.",
    fit: "It translates short Scenario Missions and long-term progress tracking into a familiar mobile grammar while removing popularity metrics.",
    voice: "Short, vivid, inclusive, and transparent about privacy.",
    headline: "ลองสั้น ๆ รู้จักตัวเองเพิ่มทีละนิด",
    subhead: "ฟีดภารกิจส่วนตัวที่วัดพลังและความรู้สึกจากการลงมือทำ—ไม่มีไลก์ ไม่มีอันดับ ไม่มีคำทำนาย",
    cta: "ปัดดูภารกิจ",
    heroPrompt: `Use case: ads-marketing
Asset type: Future Me Concept 10 landing page hero visual
Primary request: an original energetic Gen-Z visual experience for Thai students sharing small experiments, interests, and future possibilities in a safe private space
Scene/backdrop: dynamic collage of vertical story frames, sticker-like abstract shapes, project snapshots, skill reactions, and a branching path ribbon; frames show making a prototype, helping a friend, analyzing a pattern, and creating media
Subject: a diverse group of age-appropriate Thai students represented through stylized editorial cutouts and hands interacting with cards; no influencer or celebrity styling
Style/medium: bold contemporary youth editorial collage mixing clean photography-like cutouts, 3D stickers, grain, and vibrant gradients
Composition/framing: wide 16:9 composition clustered on the right two-thirds, strong gradient negative space on the left for HTML headline
Lighting/mood: bright flash accents with soft daylight, expressive, inclusive, optimistic, trustworthy
Color palette: hot coral, acid lime, ultraviolet, cyan, midnight navy
Materials/textures: glossy sticker vinyl, paper grain, translucent gradient gel
Background: abstract social feed space, no real platform imitation
Intended page: Pulse Social landing page hero
Aspect ratio: 16:9 landscape
Constraints: no text, no letters, no numbers, no logos, no trademarks, no watermark, no like counts, no public popularity ranking, no copied social-media UI`
  }
];
