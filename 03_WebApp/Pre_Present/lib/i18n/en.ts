import type {
  Dimension,
  EvidenceStrength,
  OpenQuestionCode,
  ReasonCode,
} from "@/lib/decision-engine/types";
import type { GapTaskCode } from "@/lib/plan";

/**
 * English is the source dictionary. `Dictionary` is derived from its shape, so
 * every other locale must supply exactly the same keys or the build fails —
 * a missing translation is a type error rather than a silent English fallback
 * discovered by a user.
 */
export const en = {
  chrome: {
    productName: "FutureMe AI",
    productTag: "PROTOTYPE",
    demoBadge: "Demo · not validated guidance",
    skipToContent: "Skip to content",
    footerDisclaimer:
      "FutureMe AI is a student prototype for exploration. It is not validated guidance and does not predict admission, employment or income. Always check current criteria against official sources and talk to a qualified counsellor.",
    privacyLink: "Privacy & your data",
    steps: {
      interview: "Interview",
      mission: "Mission",
      routes: "Routes",
      compare: "Compare",
      plan: "Plan",
    },
    stepCompleted: "(completed)",
    progressLabel: "Progress",
  },

  prefs: {
    languageLabel: "Language",
    themeLabel: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },

  assessment: {
    title: "Chat with FutureMe about you",
    intro:
      "FutureMe will ask one question at a time. There are no right answers, and nothing here is a test — reply as you actually are.",
    demoNotice: "Research-informed demo — not a validated test",
    questionCounter: "Question {current} of {total}",
    reviewLabel: "Review",
    answeredCounter: "{answered} of {total} answered",
    reviewAnswers: "Review answers",
    resetAnswers: "Start over",
    resetConfirmPrompt:
      "This clears every answer you have given and returns you to the first question. Any mission or plan built from them goes too. It cannot be undone.",
    resetConfirm: "Yes, clear my answers",
    resetCancel: "Keep my answers",
    resetDone: "Your answers were cleared. You are back at the first question.",
    eyebrowInterests: "Interests",
    eyebrowSituation: "Your situation",
    eyebrowOptional: "Optional",
    interestHelper: "How much would you like doing this activity?",
    interviewerName: "FutureMe AI",
    interviewerAsking: "Asking you",
    interviewerListening: "Listening",
    interviewerChecking: "Checking your reply",
    interviewerSaved: "Reply saved",
    interviewerClarifying: "Asking for clarification",
    replyLabel: "You",
    textChatHint: "Your message",
    optionsIntro: "Reply naturally, or use one of these numbers:",
    replyPlaceholder: "Type your reply to FutureMe…",
    composerHint: "Enter sends · Shift+Enter adds a new line",
    sendReply: "Send",
    savingReply: "Saving…",
    replyNotRecognised:
      "I cannot save that without guessing. Please reply with one answer from the numbered list.",
    replyTooLong: "Keep this answer under 160 characters so it can be matched safely.",
    previous: "Previous",
    next: "Next",
    skip: "Skip",
    backToQuestions: "Back to questions",
    continueToMission: "Continue to the mission →",
    readyToContinue: "Ready to continue.",
    answerRequired: "Answer the required questions to continue.",
    howUsedTitle: "How these answers are used:",
    howUsedBody:
      "they are scored in your browser by a rule-based engine to suggest study routes. In guest mode they are not sent to any server and nobody else can see them.",
    needToTalk: "Need someone to talk to?",

    reviewTitle: "Check your answers",
    reviewEyebrow: "Almost done",
    reviewIntro:
      "Select any line to change it. Nothing is final — you can come back to this before the mission.",
    reviewChangeHint: "— change this answer",
    reviewSkipped: "Skipped",
    reviewLeftBlank: "Left blank",
    sectionInterests: "Interests",
    sectionSituation: "Your situation",

    errorsTitle: "A few things are still missing",
    errorNotEnough:
      "Answer at least {min} of the {total} statements (you have {answered}).",
    errorMissingContext: "Choose an answer for “{question}”.",

    storageBlockedTitle: "Progress will not be saved",
    storageBlockedBody:
      "This browser is blocking local storage, so refreshing the page will lose your answers. You can still finish the demo in one sitting.",
    recoveredResetTitle: "We had to start you a new session",
    recoveredResetBody:
      "The data stored in this browser could not be read, so it was cleared and a fresh session started. Nothing was sent anywhere.",
    recoveredRepairedTitle: "Some saved answers could not be read",
    recoveredRepairedBody:
      "Part of what was stored in this browser did not match anything this version asks, so it was discarded rather than guessed at. Everything still shown below was read back intact.",
    loading: "Loading your session…",
  },

  landing: {
    heroNote: "Answer a few short questions, try one real task, then see up to three study routes — each with the evidence behind it.",
    ctaHeading: "Start with what you already know about yourself",
    tabHow: "How it works",
    tabHonest: "Straight talk",
    tabMore: "Other ways in",
    tabMoreBody: "You do not have to start with the questions. Ask something directly, or just look at what exists near you — neither needs an account or tells us anything about you.",
    nearbyButton: "What is near me",
    badge: "FUNCTIONAL PROTOTYPE · RUNNABLE END-TO-END DEMO",
    headlineLead: "A next step you can",
    headlineAccent: "actually explain.",
    subhead:
      "Answer a short interview, try one real task, then compare up to three study routes — each showing the evidence behind it and what it still does not know.",
    startGuest: "Start as guest →",
    chatButton: "Chat with FutureMe",
    whatHappens: "What happens to my answers?",
    noAccount:
      "No account needed. Assessment and mission answers stay in this browser; chat uses the separate network path explained on its page.",
    card1Title: "Ask, then check",
    card1Body: "A shortened interview plus your own words gives a starting guess — not a verdict.",
    card2Title: "Try, don't guess",
    card2Body:
      "A mission picked from your answers tests that guess against what you would actually do.",
    card3Title: "Up to three routes",
    card3Body: "Never ranked, never a winner — and none at all when the evidence is too thin.",
    honestTitle: "What this prototype is, honestly",
    honest1Strong: "research-informed but not validated",
    honest1: "The assessment is {strong}. It is built on the structure of the RIASEC model, but this specific questionnaire has never been tested for reliability or validity.",
    honest2Strong: "demo data",
    honest2: "Route information is {strong} compiled {date} and is not verified against current official sources.",
    honest3Strong: "deterministic rule engine",
    honest3:
      "Recommendations come from a {strong} you can read in lib/decision-engine/ — no model decides your route.",
    honest4:
      "This does not replace a qualified counsellor, and it has not been tested with real students.",
    readData: "Read exactly what data is collected →",
    howItWorks: "How this works →",
    howTitle: "How this works",
    howIntro: "Three steps, and what each one can and cannot tell you.",
    backHome: "Back to the start",
  },

  chat: {
    eyebrow: "FUTUREME COMPANION",
    title: "Ask about study and career directions",
    intro:
      "Talk through an idea, compare possible directions, or ask what you could try next. FutureMe answers from this prototype's project data and shows the sources it used when they are available.",
    privacyTitle: "Your message uses a separate network path",
    privacyBody:
      "Chat is optional. When you press Send, the conversation shown here is sent to the application server and may be sent to its AI provider. If you have chosen a province elsewhere in FutureMe, it is sent too, so the answer can name places near you — a province and never anything narrower. It is not saved in your guest session, and refreshing or clearing this page removes the on-screen transcript.",
    welcome:
      "Hi, I’m the FutureMe companion. Tell me what you are curious about, or ask me to explain one of the study routes in this prototype. I can help you explore, but I cannot choose your future or predict admission, employment, or income.",
    companionName: "FutureMe companion",
    assistantLabel: "FutureMe",
    youLabel: "You",
    modeAi: "AI response",
    modeOffline: "Project-data mode",
    sources: "Sources used",
    sourceStatus: "Source status",
    clear: "Clear chat",
    motionEnable: "Always animate",
    motionSystem: "Use system motion",
    conversationLabel: "Conversation with FutureMe",
    thinking: "FutureMe is checking the project data…",
    suggestionsLabel: "Try asking",
    suggestions: [
      "What study routes could I explore if I like technology?",
      "How can I compare vocational study and upper secondary school?",
      "What can I try this month if I am still unsure?",
    ],
    composerLabel: "Your message",
    placeholder: "Ask about interests, study routes, missions, or a next step…",
    composerHint: "Do not include your full name, school, phone number, or other identifying details.",
    send: "Send",
    sending: "Sending…",
    networkError:
      "I could not reach the chat service just now. You can try again, or use the structured assessment, which still works without the chat service.",
    rateLimited:
      "That is more messages than I can take at once. Please wait about {seconds} seconds and send it again — nothing you have written is lost.",
    mascotReady: "FutureMe is ready to listen",
    mascotThinking: "FutureMe is checking the project data",
    mascotSpeaking: "FutureMe has answered with AI assistance",
    mascotOffline: "FutureMe answered in project-data mode",
    mascotError: "FutureMe could not reach the chat service",
    moreOptionsLabel: "Other ways to use FutureMe",
    assessmentTitle: "Want route suggestions?",
    assessmentBody:
      "Use the structured assessment for route suggestions. Its fixed questions and rule engine, not this chat, decide which directions appear.",
    assessmentLink: "Start the assessment →",
    limitsTitle: "Use this as a starting point",
    limitsBody:
      "The chatbot can be wrong, and parts of the route catalogue are illustrative team estimates. Check current entry criteria, fees, and programmes with official sources before acting.",
    privacyLink: "Read the chat data details",
  },

  engine: {
    dimensions: {
      R: "practical, hands-on work",
      I: "investigating and analysing",
      A: "creative and design work",
      S: "helping and teaching people",
      E: "leading and persuading",
      C: "organising and keeping things accurate",
    },
    listConjunction: "and",
    noPattern: "no clear pattern yet",

    reasons: {
      INTEREST_MATCH: "Your interest answers line up with what this route asks for.",
      INTEREST_WEAK: "Your interest answers only partly line up with this route.",
      MISSION_CORROBORATES: "What you did in the mission backs up what you said in the interview.",
      MISSION_CONTRADICTS: "Your mission choices point somewhere different from your interview answers.",
      FEASIBLE_COST: "The cost band fits the constraint you described.",
      FEASIBLE_LOCATION: "This is usually available without moving away from home.",
      TIMING_MATCH: "The time before you start earning matches what you said you wanted.",
      KEEPS_OPTIONS_OPEN: "This route keeps a relatively wide range of later options open.",
      COST_CONSTRAINT:
        "This route is high-cost and you said cost matters a lot, so it is not in the list above. That can change if the money changes — ask about scholarships and the student loan fund.",
      LOCATION_CONSTRAINT:
        "This route usually means moving away and you said you need to stay near home, so it is not in the list above. If that changes, so does this.",
      TIER_MISMATCH: "This route does not admit at your stage yet. Nothing to do with your answers.",
      INSUFFICIENT_ANSWERS: "Not enough interview questions were answered.",
      INSUFFICIENT_EVIDENCE: "There is not enough evidence yet to separate the routes.",
      TIED_SCORES: "These routes scored close enough that the difference is not meaningful.",
      MISSING_COST_DATA: "You have not decided how much cost matters, so affordability was not checked.",
      MISSING_LOCATION_DATA: "You have not decided whether you could move, so location was not checked.",
      STALE_ROUTE_DATA: "This route information may be out of date — verify against official sources.",
    },

    strengthLabels: {
      strong: "Strong evidence",
      moderate: "Moderate evidence",
      limited: "Limited evidence",
      insufficient: "More exploration needed",
    },
    strengthHelp: {
      strong: "Your interview and your mission point the same way.",
      moderate: "Some signals agree, but not all of them.",
      limited: "This is based on a small number of signals.",
      insufficient: "There is not enough here to say much yet.",
    },

    openQuestions: {
      COST_UNKNOWN: "How much can your family realistically spend per year?",
      LOCATION_UNKNOWN: "Could you actually study away from home?",
      MISSION_VS_INTERVIEW: "Which felt more true — what you said, or what you chose in the mission?",
      WHAT_WOULD_YOU_TRY: "What would you need to try before you would trust this suggestion?",
      REQUIREMENTS_CHANGED: "Have the entry requirements changed since this data was compiled?",
      WHAT_WOULD_CHANGE_YOUR_MIND: "What would make you change your mind about this route?",
    },

    evidenceInterview: "Your interview leaned towards {interests}.",
    evidenceMission: "In the mission you chose: {note}",

    gapTasks: {
      MISSION_CONTRADICTION:
        "Redo the mission choosing what you would really do, then compare the two answers.",
      COST_UNKNOWN: "Ask at home what the realistic yearly budget for study is.",
      LOCATION_UNKNOWN: "Decide with your family whether studying away from home is possible.",
      RUN_EXPERIMENT: "Run the suggested experiment: {experiment}",
    },
    missionRationale: {
      learnerChoice: "You chose this mission yourself.",
      defaultTooFew:
        "Your interview is not far enough along to choose a mission from, so this is the default one. You can pick a different mission below.",
      defaultTooEven:
        "Your interview answers were too even for any one direction to stand out, so this is the default mission. You can pick a different one below.",
      defaultNoMatch: "No mission matched your profile, so this is the default one.",
      matched: "Chosen because {because}. “{dimension}” was {rank}.",
      rankStrongest: "your strongest interest",
      rankOther: "your {ordinal}-strongest interest, because nothing covers the ones above it",
    },
  },

  plan: {
    eyebrow: "30-DAY PLAN",
    exploratoryTitle: "This plan is exploratory",
    exploratoryBody:
      "It is built from a template so you can test the route cheaply before committing to it. Finishing it does not qualify you for anything, and it is not advice from a counsellor.",
    gapsTitle: "Extra tasks added for your specific gaps",
    progress: "{completed} of {total} tasks checked in",
    progressLabel: "Plan progress",
    week: "WEEK {n}",
    weekComplete: "All tasks ticked",
    weekCurrent: "Start here",
    gapTaskMarker: "added for a gap",
    noRouteTitle: "No route selected yet",
    noRouteChanged:
      "The route you picked is no longer among your results — your answers may have changed since.",
    noRouteYet: "Pick a route first and a 30-day plan will be built from it.",
    goToResults: "Go to results",
    compareRoutes: "Compare routes",
    changedMindTitle: "Changed your mind?",
    changedMindBody: "Revising is normal and costs you nothing. Your checked-in tasks are kept.",
    compareAgain: "Compare routes again",
    pickDifferent: "Pick a different route",
    changeAnswers: "Change my answers",
    keepTitle: "Want to keep this?",
    keepBody:
      "Right now this plan lives only in this browser. Accounts are not implemented in this prototype — saving permanently, and sharing a summary with a counsellor, are planned.",
    createAccount: "Create an account (not implemented)",
  },

  nearby: {
    stationAway: "{km} km",
    modes: {
      walk: "Walk",
      bicycle: "Bicycle",
      motorcycle: "Motorbike",
      songthaew: "Songthaew",
      bus: "Bus",
      van: "Minivan",
      coach: "Coach",
      car: "Car",
      metro: "BTS / MRT",
      train: "Train",
      plane: "Plane",
    },
    noticeTitle: "What this list is",
    filterLabel: "Show",
    filterAll: "Everything",
    filterVocational: "Wor Chor / Wor Sor",
    filterDegree: "Bachelor's degree",
    filterEmpty: "Nothing in this province matches that filter.",
    showMore: "Show {count} more",
    showLess: "Show fewer",
    title: "What is near you",
    intro:
      "Pick your province to see the schools, colleges and universities that continue after Mattayom 3, and how far each one is by road.",
    notARecommendation:
      "This is a list of what exists, ordered by distance. It does not say which one suits you — the assessment and its rule engine do that, and distance is never one of their inputs.",
    pickLabel: "Your province",
    pickPlaceholder: "Choose a province…",
    loading: "Looking up your province…",
    error: "Could not load that province just now. Try again in a moment.",
    empty: "No options are recorded for this province yet.",
    summaryTitle: "{province} at a glance",
    summaryInside: "{count} in this province",
    summaryWithin30: "{count} within 30 km",
    summaryVocational: "{count} offer Wor Chor or Wor Sor",
    summaryDegree: "{count} offer a bachelor's degree",
    summaryUnknown: "{count} here with no distance yet",
    originNote:
      "Distances are measured from the provincial capital, not from your home. If you live in an outer district the real journey may be much longer — or much shorter if you live near a neighbouring province.",
    driveNote:
      "Times shown are driving times. On a songthaew, a bus or while waiting for one, expect longer.",
    offersLabel: "Teaches",
    stationLabel: "Nearest station",
    unknownDistance: "In this province, distance not yet known",
    outsideProvince: "In {province}",
    kmAway: "{km} km by road",
    minutesAway: "about {minutes} min by car",
    bandWalkable: "Walking or cycling distance",
    bandLocal: "An ordinary daily journey",
    bandCommute: "Reachable daily, but it costs time and fare",
    bandHardCommute: "A hard daily journey — worth thinking about lodging",
    bandRelocate: "You would be moving there, not commuting",
    bandUnknown: "Distance not yet known",
    dataNote:
      "Built from the OVEC college register, the MHESI institution register and OpenStreetMap road routing. Institution details change every year — check with the place itself before deciding anything.",
    sourceLink: "How this list was built",
  },
  privacy: {
    title: "Your data, precisely",
    intro:
      "This page describes what the prototype actually does today — not what the production design intends. Where the two differ, it says so.",
    shortTitle: "The short version",
    shortBody:
      "Your assessment and mission answers stay in this browser, and the recommendation engine runs on your device. The optional chatbot is separate: when you press Send, its conversation goes to the application server and may go to an AI provider. Like any website, the app also exposes ordinary request metadata to its host.",
    collectedTitle: "What is collected",
    colData: "Data",
    colWhere: "Where it goes",
    colKept: "Kept for",
    rowInterview: "Interview answers",
    rowMission:
      "Mission answers, including free text — saved as you type, so a refresh does not lose unfinished writing",
    rowRoutes: "Generated routes and plan progress",
    rowProvince: "The province you picked, so route suggestions can name real places",
    rowSession: "Guest session id",
    rowAnalytics: "Analytics, cookies, trackers",
    rowChat: "Messages you send in the optional chatbot",
    thisBrowser: "This browser only",
    thisBrowserRandom: "This browser only — random, not linked to you",
    chatWhere: "Application server; AI provider when enabled",
    chatKept: "Not saved in the guest session; server and provider policies may apply",
    untilCleared: "Until you clear it",
    analyticsWhere:
      "None are implemented by the app. A deployment host may still process normal request metadata.",
    storedUnder: "Stored under the key {key} in localStorage. You can inspect it in your browser's developer tools.",
    aiTitle: "The optional chatbot and AI network paths",
    aiBody1Optional: "optional",
    aiBody1Off: "off unless the operator sets an API key",
    aiBody1:
      "The chatbot is {optional}. Provider-backed generation is {off}. Pressing Send still sends the visible conversation to the application server, which can answer in project-data mode when the provider is unavailable.",
    aiBody2:
      "When provider-backed chat is enabled, the server may forward the conversation to that provider. The separate route-card rewording control remains narrower: it sends only a validated route id and fixed reason codes, never the learner answers behind them.",
    aiBody3:
      "Chat messages are not written to localStorage or the guest session. Clear chat or refresh removes the on-screen transcript, but it cannot retract a request already sent. Provider retention and training treatment depend on the deployment owner's current agreement and must be checked before public use.",
    claimsTitle: "Two claims that are not the same",
    claim1Title: "“Not shared with parents or counsellors”",
    claim1Body:
      "A permission rule. It says who may read your data — not where your data physically is.",
    claim2Title: "“Assessment answers do not enter the recommendation network path”",
    claim2Body:
      "A narrower, verifiable claim. The rule engine reads assessment and mission answers from local storage in the browser. Chat is a separate, user-triggered network path and does not feed the route-selection engine.",
    claimsCorrection:
      "The chat screen states its network use before the composer. It does not silently attach assessment answers, mission answers, scores, or the guest session id to a chat request.",
    notYetTitle: "Not implemented yet",
    notYet1: "Accounts, login, and permanent saving",
    notYet2: "Parent and counsellor views, and the consent flow that would gate them",
    notYet3: "Server-side storage, retention policy, and audit logging",
    notYet4: "Data-subject request handling",
    notYetBody:
      "Those are described as the intended design in the project documentation. None of them exists in this prototype, so the app has no account-backed destination for learner answers.",
    researchLinkTitle: "Helping test the questionnaire",
    researchLinkBody:
      "The questionnaire has never been tried with real students. There is an optional way to share your interest answers, anonymously, to help find out whether it works.",
    researchLink: "Read about the pilot study →",
    rowResearch: "Response times and answer changes, if the pilot study is used",
    deleteTitle: "Delete everything",
    deleteBody:
      "This removes your guest session from this browser immediately. Chat is not part of that session; use Clear chat or refresh its page to remove the on-screen transcript. This control cannot retract chat requests already sent to a server or provider. Browser extensions, screenshots and device backups are also outside this control.",
    deleteButton: "Delete my data",
    deleted: "Deleted. Starting again will create a new session.",
    back: "← Back",
  },

  compare: {
    title: "Compare before you choose",
    intro:
      "The same criteria applied to every route. Bars show this prototype's scoring — they are a way to see the trade-offs, not a measurement of your future.",
    nothingTitle: "There is nothing to compare yet",
    nothingBody: "No routes were generated, so there is no comparison to show.",
    backToResults: "Back to results",
    caption: "Comparison of {n} suggested routes across consistent criteria",
    criterion: "Criterion",
    choose: "Choose",
    buildPlan: "Build a plan",
    backToCards: "← Back to the full cards",
    caveatStrong: "Read the last row before you trust the middle ones.",
    caveat:
      "Relative cost, whether you would need to move, and time before earning are the team's estimates — no source in this prototype supports them, and they are what the engine used to rule routes in or out. Check anything you would act on against the institution's own current page.",
    rowEvidence: "Evidence strength",
    rowInterest: "Interest fit ({pct}% of score)",
    rowFeasibility: "Feasibility ({pct}%)",
    rowStrengths: "Demonstrated strengths ({pct}%)",
    rowLearningStyle: "Learning style ({pct}%)",
    rowCost: "Relative cost",
    rowRelocate: "Need to move away?",
    rowTiming: "Time before earning",
    rowFlexibility: "Keeps options open",
    rowOpen: "Still unanswered",
    rowProvenance: "Where this comes from",
    usuallyYes: "Usually yes",
    usuallyNo: "Usually no",
    noSource: "No source recorded.",
    costLow: "Lower",
    costModerate: "Moderate",
    costHigh: "Higher",
    timingSoon: "Sooner",
    timingLater: "Several years",
    bandHigher: "Higher",
    bandMiddle: "Middle",
    bandLower: "Lower",
    bandLabel: "{band} score for this route",
    statusPartiallyVerified: "partially verified",
    statusIllustrative: "illustrative",
    statusUnverified: "unverified",
    guideTitle: "What should I compare for you first?",
    guideBody:
      "Choose one lens. I will apply it equally to every route, without ranking them or naming a winner.",
    focusFit: "Fit signals",
    focusPractical: "Practical trade-offs",
    focusEvidence: "Evidence & unknowns",
    yourFocus: "Your comparison focus",
    showingFocus:
      "Here is the same lens across every route, so you can see the trade-offs without a ranking.",
    fullMatrix: "Open the full comparison table",
  },

  mission: {
    eyebrow: "MISSION · {min} MIN",
    whyThisOneTitle: "Why you were given this one",
    whyThisOneRule:
      "The choice is made by a fixed rule in your browser that reads your interview profile — not by a model, and not by anything you cannot see.",
    whyExistsTitle: "Why this exists",
    whyExistsBody:
      "Saying you like something and doing it are different kinds of evidence. Your choices here are scored separately from the interview — if they disagree, you will be shown the disagreement rather than have it averaged away.",
    alreadyDoneTitle: "You already completed this mission",
    alreadyDoneBody:
      "Your previous answers are loaded below. Editing them and submitting again will change your routes.",
    charactersMinimum: "{count} / {min} characters minimum",
    draftSaved: "Saved in this browser as you type — a refresh will not lose this.",
    draftHint: "Answers are saved in this browser as you type.",
    errorsTitle: "Not finished yet",
    errorTextTooShort: "“{label}” needs at least {min} characters.",
    errorTooFewOptions: "Choose at least {min} options for “{label}”.",
    errorNoChoice: "Choose an answer for “{label}”.",
    submit: "Mark mission complete →",
    backToInterview: "← Back to interview",
    alternativesSummary: "Would you rather do a different mission?",
    alternativesLearnerChoice:
      "The rule would have suggested “{suggested}”. You are doing this one because you picked it.",
    alternativesDefault:
      "You are not stuck with the suggestion. Any of these produces the same kind of evidence.",
    alternativesDraftWarning: " Switching replaces the answers you have written here.",
    doThisInstead: "Do this instead",
  },

  routes: {
    programmesLiving: "Requires moving — living costs in {region} run about {min}–{max} baht a month · roughly {totalMin},000–{totalMax},000 over {years} years (team estimate citing TDRI/NSO ranges, not a per-province survey · tuition not included)",
    programmesProvenance: "Sources — programme and intake: MHESI/VEC registers · distance: OSRM road routing · interest profile: O*NET 29.1 (CC BY 4.0) · employment: VEC 2566 survey",
    programmesOccupations: "This field's interest profile comes from",
    programmesModes: "Get there by",
    programmesNoneAfterFilter: "No programme clears the bar with these filters. Try removing one.",
    programmesCost: "The state spends {baht} baht per student per year on this programme — production cost, not the tuition you pay",
    programmesOutcome: "Graduates of this field in {province}, {level}: working {working}% · studying on {studying}%",
    programmesOutcomeBase: "Of {tracked} the survey reached (out of {graduates} graduates), {year}",
    programmesOutcomeSmall: "⚠ Small sample — the figure moves a lot",
    programmesFilterAll: "All",
    programmesFilterLevel: "Level",
    programmesFilterProvince: "In my province only",
    programmesFilterSector: "Institution type",
    programmesFilterPublic: "Public",
    programmesFilterPrivate: "Private",
    programmesShowing: "Showing {shown} of {total} eligible programmes",
    programmesDistanceCaveat: "Distances are measured from your provincial centre, not your home — a border district could be far further. Good for comparing options, not for planning a journey.",
    programmesSite: "Institution website — check fees and entry requirements at the source",
    programmesSearch: "Search for the fee announcement of this institution (no official URL in the register)",
    programmesTitle: "The programmes that fit you best",
    programmesIntro: "Ranked on academic fit first; context (distance, cost, intake) then orders programmes of similar fit. Context can move a score by at most {cap} points, so it cannot lift a poor fit above a strong one.",
    programmesFieldsTitle: "Fields that fit you",
    programmesFieldsNote: "Academic fit resolves at field level — every programme in a field shares one interest vector.",
    programmesReachable: "{count} programmes you could reach",
    programmesCore: "Academic fit",
    programmesContext: "Context",
    programmesSeats: "{count} places planned",
    programmesSeatsUnknown: "Intake not stated",
    programmesUnknown: "No data yet",
    programmesUnknownNote: "No open dataset we hold carries these, so they are left blank rather than estimated.",
    programmesWhy: "Where this score came from",
    programmesDeclineTitle: "No programme ranking yet",
    programmesDeclineLowConfidence: "Too little evidence so far — an “unsure” answer is not counted as evidence.",
    programmesDeclineFlat: "Every dimension scored about the same ({diff} apart, {gate} needed). A flat profile does not mean everything fits; it means we do not know yet.",
    programmesDeclineAction: "Answer another round of questions and come back. Guessing is not something the system will do.",
    programmesCoverage: "Covering {n} programmes at {inst} institutions — degrees from the MHESI intake register, ปวช./ปวส. from the VEC enrolment register 2568.",
    programmesQuadrantGolden: "Enjoys it + capable",
    programmesQuadrantGrowth: "Enjoys it + not practised yet",
    programmesQuadrantBurnout: "Capable + does not enjoy it · take care",
    programmesQuadrantUnfavourable: "Not a fit yet",
    programmesQuadrantUnknown: "Confidence not measured",
    nearbyTitle: "Where you could do this, near {province}",
    nearbyNone:
      "No institution of the kind that teaches this route is recorded within reach of {province}. That is worth knowing before you choose it — it may mean living away from home.",
    nearbyMore: "and {count} more",
    nearbyCaveat:
      "These are the kinds of institution that teach this direction, and how far they are. Our register records what each place is, not which programmes it runs — ask the college itself whether it opens this subject.",
    nearbySetProvince: "Set your province to see where you could do these",
    nearbyChangeProvince: "Change province",
    errorTitle: "Something went wrong generating routes",
    tryAgain: "Try again",
    insufficientTitle: "We do not have enough evidence to suggest a route yet.",
    insufficientBody: "Complete another mission or review your responses.",
    answeredCount: "You answered {answered} of {total} statements.",
    reviewAnswers: "Review my answers",
    redoMission: "Redo the mission",
    headingMany: "{n} directions worth exploring",
    headingOne: "One direction worth exploring",
    introMany:
      "None of these is a “best match.” Think of them as hypotheses to test — skim the three, then compare.",
    introOne:
      "This is not a “best match” — it is one hypothesis to test. Read it, then explore the evidence.",
    notSureTitle: "Not sure which one?",
    notSureBody:
      "Put them side by side on cost, time to earning, flexibility and evidence before you decide anything.",
    compareN: "Compare the {n} routes →",
    compareOne: "See this route's details side by side →",
    filteredSummary: "{n} more routes are not in the list above — see why",
    generatedBy:
      "Generated in your browser by engine {version} from demo route data compiled {date}. No model chose these routes.",
    summaryTitle: "What your answers pointed to",
    summaryInterview: "Interview",
    summaryMission: "Mission",
    summaryNoLead: "No clear lead",
    missionNotDone: "Not completed yet",
    missionDiffered: "Pointed somewhere different",
    missionAgreed: "Agreed with your interview",
    whyMultiple: "Why you're seeing more than one",
    whyContradicted:
      "Your answers and your actions pointed in different directions. That is useful evidence, not a mistake — it often means you need more real-world exploration before choosing. Worth talking through with a counsellor.",
    whyTied:
      "Some of these routes are too close to rank confidently, so FutureMe shows them as equals rather than inventing an order the evidence does not support.",
    freshnessTitle: "About this information",
    compiled: "Compiled",
    daysAgo: "{date} · {days} days ago",
    pastReview: "past its {days}-day review point",
    withinReview: "within its {days}-day review point",
    fieldNames: {
      costBand: "relative cost",
      requiresRelocation: "whether you need to move",
      timeToEarning: "time before earning",
      flexibility: "how open it keeps your options",
      strengths: "the listed strengths",
      limitations: "the listed trade-offs",
    },
    notSourced: "Not sourced at all",
    notSourcedBody:
      "{fields} — these are the team's estimates, and they drive the filters that ruled routes in or out.",
    freshnessFooterStrong: "Explore",
    freshnessFooter:
      "Each route's own source is inside its {strong} panel. Entry criteria and fees change every academic year — check anything you would act on against the institution's own current page before you decide.",
    attrTimeToEarning: "Time to earning",
    attrRelocation: "Study away from home",
    attrFlexibility: "Flexibility",
    relocationUsually: "Usually",
    relocationNotNeeded: "Not needed",
    flexOpen: "Keeps options open",
    flexSpecialised: "More specialised",
    flexBalanced: "Balanced",
    timingSoon: "Sooner",
    timingLater: "Later",
    costLow: "Lower",
    costModerate: "Moderate",
    costHigh: "Higher",
    consider: "Consider",
    tryThisNext: "Try this next",
    hideDetails: "Hide details",
    exploreRoute: "Explore this route",
    whyShown: "Why FutureMe showed this",
    evidenceUsed: "Evidence used",
    strengths: "Strengths",
    tradeOffs: "Trade-offs",
    stillUnanswered: "Still unanswered",
    buildPlan: "Build a 30-day plan for this route →",
    whyItMayFit: "Why it may fit you",
    rewriting: "Rewriting…",
    showRewording: "Show the AI rewording",
    sayPlainer: "Say why in plainer words (AI)",
    provStatusPartial: "Structure checked against a listed source",
    provStatusIllustrative: "Written by the team — no source verifies this route as described",
    provStatusUnverified: "Not supported by any source in the registry",
    whereFrom: "Where this came from",
    sourceLabel: "Source:",
    lastChecked: " · last checked {date}",
    sourceNone: "Source: none recorded.",
  },

  research: {
    title: "Take part in the pilot study",
    eyebrow: "RESEARCH",
    purposeTitle: "What this is for",
    purposeBody:
      "This questionnaire has never been tested with real students, so nobody knows yet whether it measures anything reliably. Sharing your answers would help find that out. Taking part is entirely optional and changes nothing about the routes you were shown.",
    whatTitle: "What would be shared",
    whatShared1: "Your answers to the interest questions, as numbers",
    whatShared2: "How long you took on each question, and whether you changed an answer",
    whatShared3: "Your education level and which language you used",
    whatNotTitle: "What would never be shared",
    whatNot1: "Your name, school, or anything that identifies you",
    whatNot2: "Anything you typed in your own words",
    whatNot3: "Your mission answers, your routes, or your plan",
    idNote:
      "The file is labelled with a random code created in this browser. It is not linked to you and cannot be traced back.",
    consentTitle: "Before you take part",
    consentBody:
      "If you are under 18, ask a parent, guardian or teacher first. Nothing is sent automatically — the file is saved to your device, and you decide whether to hand it over.",
    consentCheckbox: "I have read the above and I choose to take part",
    exportButton: "Save my answers as a file",
    exportedNote: "Saved. Give the file to whoever is running the study.",
    nothingToExport: "There are no interest answers stored in this browser yet.",
    clearButton: "Delete the research data from this browser",
    clearedNote: "Research data deleted. Your assessment answers are untouched.",
    facilitatorTitle: "For whoever is running the study",
    facilitatorBody:
      "Collect one file per participant into a directory, then run the analysis pipeline. It reports item statistics, scale reliability with confidence intervals, and the circular-order structural test.",
    facilitatorNote:
      "Ethics approval, parental consent and a data-protection assessment are required before collecting from minors. This screen does not provide them.",
    back: "← Back to privacy",
  },

  safety: {
    heading: "Let's pause the career questions for a moment.",
    body: "Something you wrote suggests you might be going through something difficult. That matters more than any study route, so this prototype has stopped generating recommendations from that answer.",
    action:
      "Please talk to someone you trust — a parent or guardian, a teacher, your school counsellor, or another adult who looks out for you.",
    hotlineTitle: "If you need to talk to someone now",
    hotline: "In Thailand, the Department of Mental Health hotline is 1323 (24 hours).",
    disclaimer:
      "FutureMe AI is a student prototype. It is not a mental-health service, it cannot assess risk, and it is not monitored by anyone. If you are in immediate danger, contact local emergency services.",
    goBack: "Go back to my answers",
    limitsTitle: "How this works, and its limits.",
    limitsBody:
      "This screen is triggered by a simple keyword rule running in your browser — it is not a risk assessment. It will miss things and it will sometimes fire when nothing is wrong. Nothing you typed was sent anywhere, and nobody was alerted.",
    limitsBodyServer:
      "This screen was triggered by the same simple keyword rule on the application server — it is not a risk assessment. Your bounded chat reached the FutureMe server but was not sent to the AI provider. Nobody was alerted.",
  },
};

export type Dictionary = typeof en;

/**
 * Compile-time proof that the dictionary covers every code the engine can emit.
 *
 * `Dictionary = typeof en` already forces other locales to match English key
 * for key. These assertions close the other half: they force English to match
 * the *engine*, so adding a ReasonCode without a sentence is a build error
 * rather than an `undefined` rendered into a route card.
 */
type _EngineCoverage = [
  Dictionary["engine"]["reasons"] extends Record<ReasonCode, string> ? true : never,
  Dictionary["engine"]["dimensions"] extends Record<Dimension, string> ? true : never,
  Dictionary["engine"]["strengthLabels"] extends Record<EvidenceStrength, string> ? true : never,
  Dictionary["engine"]["strengthHelp"] extends Record<EvidenceStrength, string> ? true : never,
  Dictionary["engine"]["openQuestions"] extends Record<OpenQuestionCode, string> ? true : never,
  Dictionary["engine"]["gapTasks"] extends Record<GapTaskCode, string> ? true : never,
];
const _engineCoverage: _EngineCoverage = [true, true, true, true, true, true];
void _engineCoverage;
