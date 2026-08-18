import routesData from "@/data/routes.json";
import type { ChatLanguage, ChatSource } from "@/lib/chat/types";

interface LocalisedText {
  en: string;
  th: string;
}

interface KnowledgeRecord {
  id: string;
  title: LocalisedText;
  excerpt: LocalisedText;
  url?: string;
  status: string;
  keywords: string[];
  order: number;
}

export interface RetrievedKnowledge {
  source: ChatSource;
  context: string;
}

/**
 * Small, deliberately curated registry derived from the audited source list in
 * 01_Research/Data. It contains no quarantined claim and makes time-scoped
 * sources say that they must be checked again.
 */
const GENERAL_KNOWLEDGE: KnowledgeRecord[] = [
  {
    id: "ovec-voc-curriculum-2567",
    title: {
      en: "OVEC vocational curriculum 2567 catalogue",
      th: "ทะเบียนหลักสูตรอาชีวศึกษา ปวช. 2567 ของ สอศ.",
    },
    excerpt: {
      en:
        "OVEC publishes the official vocational curriculum catalogue. Programme availability, dual-study arrangements, costs and outcomes must be checked for the specific college and programme.",
      th:
        "สอศ. เผยแพร่ทะเบียนหลักสูตรอาชีวศึกษาอย่างเป็นทางการ ส่วนสถานศึกษาที่เปิดสอน รูปแบบทวิภาคี ค่าใช้จ่าย และผลลัพธ์ต้องตรวจสอบเป็นรายหลักสูตร",
    },
    url: "https://ckan.vec.go.th/th/dataset/voc_curriculum",
    status: "verified",
    keywords: [
      "ปวช",
      "ปวส",
      "อาชีว",
      "สอศ",
      "ทวิภาคี",
      "vocational",
      "ovec",
      "dve",
      "college",
      "ฝึกงาน",
    ],
    order: 0,
  },
  {
    id: "mytcas-70",
    title: { en: "Official myTCAS programme search (TCAS70)", th: "ระบบค้นหาหลักสูตร myTCAS (TCAS70)" },
    excerpt: {
      en:
        "Admission rounds and programme requirements change by institution, programme and academic year. Confirm current criteria in the official myTCAS search and the institution announcement.",
      th:
        "รอบรับและเกณฑ์สมัครเปลี่ยนตามสถาบัน หลักสูตร และปีการศึกษา จึงต้องยืนยันกับระบบ myTCAS และประกาศของสถาบันในปีที่สมัคร",
    },
    url: "https://school.mytcas.com/",
    status: "conditional",
    keywords: [
      "tcas",
      "mytcas",
      "admission",
      "university",
      "มหาวิทยาลัย",
      "คณะ",
      "สมัคร",
      "รับเข้า",
      "tgat",
      "tpat",
      "a-level",
    ],
    order: 1,
  },
  {
    id: "onet-interest-profiler-manual",
    title: { en: "O*NET Interest Profiler Manual", th: "คู่มือ O*NET Interest Profiler" },
    excerpt: {
      en:
        "The O*NET Interest Profiler uses six RIASEC interest areas for career exploration. Interests are evidence to explore, not proof of ability or a guaranteed career fit.",
      th:
        "O*NET Interest Profiler ใช้ความสนใจ 6 ด้านตามกรอบ RIASEC เพื่อสำรวจอาชีพ ความสนใจเป็นข้อมูลสำหรับทดลองสำรวจ ไม่ใช่หลักฐานความสามารถหรือคำตัดสินว่าอาชีพใดเหมาะแน่นอน",
    },
    url: "https://www.onetcenter.org/dl_files/IP_Manual.pdf",
    status: "verified",
    keywords: [
      "riasec",
      "holland",
      "interest profiler",
      "ความสนใจ",
      "แบบประเมิน",
      "อาชีพ",
      "career interest",
      "realistic",
      "investigative",
      "artistic",
      "social",
      "enterprising",
      "conventional",
    ],
    order: 2,
  },
  {
    id: "hsces-current-2026",
    title: { en: "High School Certificate Equivalency System", th: "ระบบเทียบวุฒิการศึกษาระดับมัธยมปลาย HSCES" },
    excerpt: {
      en:
        "HSCES provides current equivalency information for foreign upper-secondary credentials and GED applicants in Thailand. Institution-specific admission conditions still need confirmation.",
      th:
        "HSCES ให้ข้อมูลการเทียบวุฒิต่างประเทศและ GED สำหรับการสมัครในไทย แต่ยังต้องตรวจเงื่อนไขของแต่ละสถาบันโดยตรง",
    },
    url: "https://hsces.atc.chula.ac.th/",
    status: "conditional",
    keywords: ["ged", "hsces", "equivalency", "เทียบวุฒิ", "สอบเทียบ", "วุฒิต่างประเทศ"],
    order: 3,
  },
  {
    id: "tdri-human-capital-2025",
    title: { en: "TDRI: Thailand human-capital development", th: "TDRI: การพัฒนาทุนมนุษย์ไทย" },
    excerpt: {
      en:
        "TDRI discusses education-to-work alignment in Thailand. Any statistic must retain the population, period and source scope rather than being applied to every student.",
      th:
        "TDRI อธิบายความสอดคล้องระหว่างการศึกษากับงานในประเทศไทย การใช้สถิติต้องระบุกลุ่มประชากร ช่วงเวลา และขอบเขตของแหล่งข้อมูล ไม่ควรเหมารวมกับนักเรียนทุกคน",
    },
    url: "https://tdri.or.th/2025/09/thailand-human-capital-development/",
    status: "verified",
    keywords: [
      "tdri",
      "labour",
      "labor",
      "job market",
      "ตลาดแรงงาน",
      "งานไม่ตรงสาย",
      "ทักษะ",
      "human capital",
      "ทุนมนุษย์",
    ],
    order: 4,
  },
  /*
   * The fork a Mathayom 3 student is standing at, which the catalogue could not
   * describe. Asked "เลือกแผนการเรียนอะไรดี" it returned nothing at all, and
   * asked about ศิลป์-ภาษา it returned the arts-and-design career route — a
   * different thing with a similar name.
   */
  {
    id: "upper-secondary-study-plans",
    title: {
      en: "Upper-secondary study plans are arranged by each school",
      th: "แผนการเรียน ม.ปลาย เป็นสิ่งที่แต่ละโรงเรียนจัดเอง",
    },
    excerpt: {
      en:
        "วิทย์-คณิต, ศิลป์-คำนวณ, ศิลป์-ภาษา and ศิลป์-สังคม are names schools use, not categories set by the national curriculum. The 2551 core curriculum is a framework: it fixes the eight learning areas and the basic-course hours, and leaves each school to arrange its additional subjects. So the plans on offer differ from school to school, some run plans built around a faculty rather than a subject group, and the same plan name can mean different subject combinations in two schools. What a university programme actually asks for is subjects and scores, not a plan name — which is why the question to take to a teacher is which subjects a plan would give you, and the place to check what a programme requires is myTCAS. Ask your own school what it offers before assuming a plan exists there.",
      th:
        "วิทย์-คณิต ศิลป์-คำนวณ ศิลป์-ภาษา และศิลป์-สังคม เป็นชื่อที่โรงเรียนใช้เรียกกัน ไม่ใช่หมวดหมู่ที่หลักสูตรแกนกลางกำหนด หลักสูตรแกนกลาง 2551 เป็นกรอบทิศทาง กำหนด 8 กลุ่มสาระการเรียนรู้และเวลาเรียนรายวิชาพื้นฐาน แล้วให้แต่ละสถานศึกษาจัดรายวิชาเพิ่มเติมเอง แผนการเรียนที่เปิดจึงต่างกันไปในแต่ละโรงเรียน บางแห่งจัดแผนที่อิงคณะแทนที่จะอิงกลุ่มวิชา และชื่อแผนเดียวกันในสองโรงเรียนอาจได้เรียนวิชาไม่เหมือนกัน สิ่งที่หลักสูตรมหาวิทยาลัยกำหนดจริงคือรายวิชาและคะแนน ไม่ใช่ชื่อแผน คำถามที่ควรถามครูจึงเป็นว่าแผนนี้จะได้เรียนวิชาอะไรบ้าง ส่วนเงื่อนไขของหลักสูตรให้ดูที่ myTCAS และควรถามโรงเรียนของตัวเองก่อนว่าเปิดแผนไหนบ้าง",
    },
    url: "https://www.academic.obec.go.th/web/mission/view/34",
    status: "conditional",
    keywords: [
      "แผนการเรียน",
      "สายการเรียน",
      "วิทย์-คณิต",
      "วิทย์คณิต",
      "ศิลป์-คำนวณ",
      "ศิลป์คำนวณ",
      "ศิลป์-ภาษา",
      "ศิลป์ภาษา",
      "ศิลป์-สังคม",
      "สายวิทย์",
      "สายศิลป์",
      "study plan",
    ],
    order: 9,
  },
  {
    id: "tcas-rounds",
    title: {
      en: "The four TCAS rounds",
      th: "การรับเข้ามหาวิทยาลัย 4 รอบของ TCAS",
    },
    excerpt: {
      en:
        "University admission runs through TCAS, operated by the Council of University Presidents of Thailand, in four rounds each cycle: Portfolio, Quota, Admission, and Direct Admission. Portfolio is judged on work a student has collected rather than a central exam. Quota reserves places, often regionally. Admission is the central round where choices are ranked and national test scores are used. Direct Admission is run by each institution for places still open at the end. Every date, and what each round asks for, is set per cycle and per programme — the rounds are stable, the calendar is not, and a date remembered from an older year is a missed deadline. Check mytcas.com for the cycle a learner is actually in.",
      th:
        "การรับเข้ามหาวิทยาลัยใช้ระบบ TCAS ดำเนินการโดยสมาคมที่ประชุมอธิการบดีแห่งประเทศไทย แบ่งเป็น 4 รอบในแต่ละปีการศึกษา คือ รอบ Portfolio รอบโควตา รอบ Admission และรอบรับตรงอิสระ รอบ Portfolio พิจารณาจากผลงานที่สะสมมา ไม่ใช่คะแนนสอบกลาง รอบโควตาเป็นการกันที่นั่งไว้ มักเป็นตามพื้นที่ รอบ Admission เป็นรอบกลางที่เรียงลำดับความต้องการและใช้คะแนนสอบระดับชาติ ส่วนรอบรับตรงอิสระแต่ละสถาบันจัดเองสำหรับที่นั่งที่ยังเหลือ กำหนดวันและเงื่อนไขของแต่ละรอบตั้งใหม่ทุกปีและต่างกันตามหลักสูตร โครงสร้างรอบนิ่ง แต่ปฏิทินไม่นิ่ง การจำวันจากปีก่อนคือการพลาดกำหนด ให้ตรวจปีของผู้เรียนเองที่ mytcas.com",
    },
    url: "https://www.mytcas.com/",
    status: "conditional",
    keywords: [
      "tcas",
      "รอบพอร์ต",
      "portfolio",
      "โควตา",
      "quota",
      "แอดมิชชั่น",
      "admission",
      "รับตรง",
      "สมัครเรียนต่อ",
      "ยื่นคะแนน",
      "กี่รอบ",
    ],
    order: 10,
  },
  {
    id: "free-education-15-years",
    title: {
      en: "Fifteen years of free education covers ปวช. as well as ม.ปลาย",
      th: "เรียนฟรี 15 ปี ครอบคลุม ปวช. เท่ากับ ม.ปลาย",
    },
    excerpt: {
      en:
        "The Ministry of Education's fifteen-year free education policy runs from kindergarten to ม.6 or ปวช.3 — the vocational certificate is inside it, on the same footing as upper secondary, which families deciding between the two are often not told. It covers five things: tuition, textbooks, learning materials, uniforms and student development activities, and it reaches private as well as state institutions. Free at this level does not mean costless: schools may still ask for items outside those five, and travel, food and lodging are not in the policy at all — for a learner whose nearest college is an hour away those can be the larger number. Degree study is not covered by it. University fees are set per institution and per programme and differ by more than an order of magnitude between them, so a figure for one says nothing about another; check the specific programme, and see กยศ. for borrowing.",
      th:
        "นโยบายเรียนฟรี 15 ปีของกระทรวงศึกษาธิการครอบคลุมตั้งแต่อนุบาลถึง ม.6 หรือ ปวช.3 กล่าวคือ ปวช. อยู่ในนโยบายนี้ด้วย มีสถานะเท่ากับสายสามัญ ซึ่งเป็นข้อที่ครอบครัวที่กำลังเลือกระหว่างสองทางมักไม่ได้รับการบอก ครอบคลุม 5 รายการ คือ ค่าเล่าเรียน หนังสือเรียน อุปกรณ์การเรียน เครื่องแบบนักเรียน และกิจกรรมพัฒนาผู้เรียน และครอบคลุมทั้งสถานศึกษารัฐและเอกชน คำว่าฟรีในระดับนี้ไม่ได้แปลว่าไม่มีค่าใช้จ่ายเลย สถานศึกษายังอาจขอค่าใช้จ่ายนอกเหนือ 5 รายการนี้ได้ และค่าเดินทาง ค่าอาหาร ค่าหอพัก ไม่ได้อยู่ในนโยบาย สำหรับผู้เรียนที่วิทยาลัยใกล้ที่สุดอยู่ห่างเป็นชั่วโมง ค่าเหล่านี้อาจมากกว่าค่าเล่าเรียนเสียอีก ส่วนระดับปริญญาตรีไม่อยู่ในนโยบายนี้ ค่าเล่าเรียนกำหนดโดยแต่ละสถาบันและแต่ละหลักสูตร ต่างกันได้เกินสิบเท่า ตัวเลขของที่หนึ่งจึงบอกอะไรเกี่ยวกับอีกที่หนึ่งไม่ได้ ให้ตรวจหลักสูตรที่สนใจโดยตรง และดูเรื่องการกู้ยืมที่ กยศ.",
    },
    url: "https://www.moe.go.th/",
    status: "conditional",
    keywords: [
      "เรียนฟรี",
      "ค่าเทอม",
      "ค่าเล่าเรียน",
      "ค่าธรรมเนียม",
      "แพงไหม",
      "จ่ายเท่าไหร่",
      "tuition",
      "free education",
    ],
    order: 11,
  },
  /*
   * Money. Three records rather than one, because the three answers are not
   * interchangeable and a learner needs to know which one is theirs: a loan
   * anyone short of money can apply for, grants aimed at the poorest, and
   * whatever the particular institution happens to run.
   *
   * All three are `conditional` under 00_Governance/SOURCE_POLICY.md — the
   * funds are real and stable, the numbers are policy and move. The excerpts
   * therefore carry the condition into the answer rather than leaving the model
   * to state a threshold as though it were permanent, and none of them says or
   * implies that an applicant will receive anything.
   */
  {
    id: "studentloan-fund",
    title: {
      en: "Student Loan Fund (กยศ.)",
      th: "กองทุนเงินให้กู้ยืมเพื่อการศึกษา (กยศ.)",
    },
    excerpt: {
      en:
        "The national student loan fund lends across upper-secondary, ปวช., ปวส. and bachelor's level, so it is not tied to the academic track. Three of its categories reach a learner at those levels: financial need, fields of national priority, and shortage fields. A fourth category for academic excellence is a master's-level scheme and has been suspended in recent years, so it is not an option at this stage. Under the financial-need category a family income at or below 360,000 baht a year has been the threshold for borrowing living costs as well as tuition, with repayment beginning after a grace period following graduation. Every threshold, rate and grace period is set by policy and has changed before, and eligibility is decided by the fund and the institution, not by an application being submitted. Check studentloan.or.th for the current year.",
      th:
        "กองทุนกู้ยืมระดับประเทศ ให้กู้ได้ทั้งระดับมัธยมปลาย ปวช. ปวส. และปริญญาตรี จึงไม่ได้ผูกกับสายสามัญอย่างเดียว ลักษณะที่ใช้ได้ในระดับนี้มี 3 แบบ คือ ขาดแคลนทุนทรัพย์ สาขาที่เป็นความต้องการหลักของประเทศ และสาขาขาดแคลน ส่วนลักษณะที่ 4 เรียนดีเพื่อสร้างความเป็นเลิศ เป็นการกู้ระดับปริญญาโทและถูกระงับการให้กู้ในช่วงหลัง จึงยังไม่ใช่ทางเลือกในช่วงวัยนี้ ในลักษณะขาดแคลนทุนทรัพย์ เกณฑ์รายได้ครอบครัวที่ใช้มาคือไม่เกิน 360,000 บาทต่อปี ซึ่งกู้ได้ทั้งค่าเล่าเรียนและค่าครองชีพ และเริ่มผ่อนชำระหลังจบการศึกษาเมื่อพ้นระยะปลอดหนี้ ทั้งเกณฑ์รายได้ อัตราดอกเบี้ย และระยะปลอดหนี้เป็นนโยบายที่เคยเปลี่ยนมาแล้ว และผู้ให้สิทธิ์คือกองทุนกับสถานศึกษา ไม่ใช่การยื่นใบสมัคร ตรวจปีล่าสุดที่ studentloan.or.th",
    },
    url: "https://www.studentloan.or.th/",
    status: "conditional",
    keywords: [
      "student loan",
      "loan",
      "กยศ",
      "กู้ยืมเพื่อการศึกษา",
      "เงินกู้เรียน",
      "กู้เรียน",
    ],
    order: 5,
  },
  {
    id: "eef-equity-fund",
    title: {
      en: "Equitable Education Fund (กสศ.)",
      th: "กองทุนเพื่อความเสมอภาคทางการศึกษา (กสศ.)",
    },
    excerpt: {
      en:
        "กสศ. runs grants rather than loans, aimed at the lowest-income households. Its conditional cash transfer supports basic-education pupils in participating school systems, screened on household income per person per month together with a deprivation score, and paid per semester against an attendance condition. Its higher-vocational innovation scholarship funds ปวส., associate degrees and one-year nursing- or dental-assistant programmes, covering tuition and living costs, and takes applicants finishing ม.3, ม.6 or ปวช. A young person already out of school can be considered, but not by applying directly: they have to be put forward by a body the fund names, such as a provincial out-of-school-youth committee. That scholarship is allocated through colleges selected each round, so which colleges and which programmes are available changes from year to year. Amounts, screening thresholds and the full conditions live in each round's announcement; check eef.or.th.",
      th:
        "กสศ. ให้เป็นทุน ไม่ใช่เงินกู้ มุ่งที่ครัวเรือนรายได้น้อยที่สุด ทุนเสมอภาคช่วยนักเรียนการศึกษาขั้นพื้นฐานในสังกัดที่เข้าร่วม คัดกรองจากรายได้เฉลี่ยต่อคนต่อเดือนร่วมกับคะแนนความขาดแคลน จ่ายเป็นรายภาคเรียนโดยมีเงื่อนไขการมาเรียน ส่วนทุนนวัตกรรมสายอาชีพชั้นสูงให้ทุนระดับ ปวส. อนุปริญญา และหลักสูตรผู้ช่วยพยาบาลหรือผู้ช่วยทันตแพทย์แบบ 1 ปี ครอบคลุมทั้งค่าเล่าเรียนและค่าครองชีพ รับผู้ที่กำลังจบชั้น ม.3 ม.6 หรือ ปวช. ส่วนเยาวชนที่ออกจากระบบการศึกษาแล้วเข้าร่วมได้ แต่ไม่ใช่ด้วยการสมัครเอง ต้องมีหน่วยงานตามที่กองทุนกำหนดเป็นผู้เสนอชื่อ เช่น คณะกรรมการระดับจังหวัดที่ดูแลเด็กนอกระบบ ทุนนี้จัดสรรผ่านสถานศึกษาที่ได้รับคัดเลือกในแต่ละรอบ วิทยาลัยและสาขาที่เปิดจึงเปลี่ยนไปทุกปี จำนวนเงิน เกณฑ์คัดกรอง และเงื่อนไขทั้งหมดอยู่ในประกาศของแต่ละรอบ ตรวจที่ eef.or.th",
    },
    url: "https://www.eef.or.th/",
    status: "conditional",
    keywords: [
      "equity fund",
      "กสศ",
      "ทุนเสมอภาค",
      "ทุนนวัตกรรมสายอาชีพ",
      "ยากจน",
      "ขาดแคลนทุนทรัพย์",
      "หลุดจากระบบการศึกษา",
    ],
    order: 6,
  },
  /*
   * The one question a Thai family asks about the vocational route, and the one
   * this catalogue could not answer: จบอาชีวะแล้วตกงานไหม.
   *
   * Kept here rather than on a route card. Outcome data exists for the
   * vocational side because สอศ. publishes a follow-up survey, and there is no
   * equivalent in the same form for the academic side. Putting it on one set of
   * route cards and not the other would read as the vocational route being
   * examined while the academic route is assumed — an asymmetry produced by
   * what was published, not by what is true. In chat it arrives when someone
   * asks, which is the honest place for it.
   */
  {
    id: "vec-graduate-outcomes-2566",
    title: {
      en: "What vocational graduates did next (สอศ. follow-up, 2566)",
      th: "ผู้จบอาชีวศึกษาไปทำอะไรต่อ (ผลติดตามของ สอศ. ปี 2566)",
    },
    excerpt: {
      en:
        "สอศ. follows up its graduates each year. In 2566 it reached 207,632 of 268,338 — about 77% — and among those it reached, roughly seven in ten ปวช. graduates went on to study further rather than into work, which is the opposite of the route being an exit from education. At ปวส. the picture divides: about a quarter continued studying, a quarter were self-employed, a fifth were in private employment, and about one in six were waiting for work or unemployed. Continuing to study is an outcome, not a failure — collapsing these into an employment rate would count a learner who went on to a degree as someone who could not find a job. Every figure is a share of the graduates the survey managed to contact, not of everyone who finished, and it varies widely by province and by field: the ปวช. continuation share ranges from about a third to over nine in ten depending on the province. These describe one cohort in one year and say nothing about what will happen to any individual.",
      th:
        "สอศ. ติดตามผู้สำเร็จการศึกษาทุกปี ปี 2566 ติดตามได้ 207,632 คนจาก 268,338 คน หรือราว 77% ในกลุ่มที่ติดตามได้ ผู้จบ ปวช. ราว 7 ใน 10 เรียนต่อ ไม่ได้ออกไปทำงาน ซึ่งตรงข้ามกับความเข้าใจว่าสายนี้คือทางออกจากการศึกษา ส่วนระดับ ปวส. กระจายตัวกว่า ราวหนึ่งในสี่เรียนต่อ อีกหนึ่งในสี่ประกอบอาชีพอิสระ ราวหนึ่งในห้าทำงานเอกชน และราวหนึ่งในหกยังรองานหรือว่างงาน การเรียนต่อเป็นผลลัพธ์แบบหนึ่ง ไม่ใช่ความล้มเหลว การยุบตัวเลขเหล่านี้ให้เหลืออัตราการมีงานทำจะเท่ากับนับคนที่ไปเรียนปริญญาตรีว่าเป็นคนหางานไม่ได้ ทุกตัวเลขเป็นสัดส่วนของผู้ที่ติดตามได้ ไม่ใช่ของผู้สำเร็จการศึกษาทั้งหมด และต่างกันมากตามจังหวัดและประเภทวิชา สัดส่วนการเรียนต่อของ ปวช. อยู่ระหว่างราวหนึ่งในสามถึงกว่าเก้าในสิบแล้วแต่จังหวัด ตัวเลขทั้งหมดอธิบายผู้จบรุ่นเดียวในปีเดียว และไม่ได้บอกว่าจะเกิดอะไรกับผู้เรียนคนใดคนหนึ่ง",
    },
    url: "https://ckan.vec.go.th/dataset/employment",
    status: "conditional",
    keywords: [
      "จบอาชีวะ",
      "ตกงาน",
      "ว่างงาน",
      "มีงานทำ",
      "จบแล้วทำอะไร",
      "เรียนต่อได้ไหม",
      "ทางตัน",
      "vocational outcomes",
      "graduate employment",
    ],
    order: 8,
  },
  {
    id: "institution-scholarships",
    title: {
      en: "Scholarships run by individual universities and colleges",
      th: "ทุนที่มหาวิทยาลัยและวิทยาลัยจัดเอง",
    },
    excerpt: {
      en:
        "Beyond the national funds, each institution runs its own scholarships, and they differ enough that no general answer is safe. Some are tied to admission: a quota project may admit a student from a listed province under a family-income ceiling and carry tuition plus a living allowance, and those appear as admission rounds rather than as separate applications. Others are applied for after enrolment through the student-affairs office, ranging from partial help with expenses to full tuition with a monthly allowance, and some are nominated by a faculty rather than applied for. Names, amounts, income ceilings, GPA conditions and closing dates are set by each institution and change every year. The reliable move is to open the specific university's or college's own scholarship page, and to check myTCAS for the projects attached to admission.",
      th:
        "นอกจากกองทุนระดับประเทศ แต่ละสถาบันยังมีทุนของตัวเอง ซึ่งต่างกันมากจนไม่มีคำตอบกลางที่ปลอดภัย บางทุนผูกกับการรับเข้า เช่น โครงการโควตาที่รับนักเรียนจากจังหวัดที่กำหนดภายใต้เพดานรายได้ครอบครัว และให้ทั้งค่าเล่าเรียนและค่าครองชีพ ทุนแบบนี้จะมาในรูปรอบรับสมัคร ไม่ใช่การยื่นขอทุนแยก บางทุนสมัครหลังเข้าเรียนแล้วผ่านฝ่ายกิจการนักศึกษา ตั้งแต่ช่วยค่าใช้จ่ายบางส่วนไปจนถึงค่าเล่าเรียนเต็มพร้อมเงินรายเดือน และบางทุนใช้วิธีให้คณะเสนอชื่อแทนการสมัคร ชื่อทุน จำนวนเงิน เพดานรายได้ เกณฑ์เกรด และวันปิดรับ เป็นของแต่ละสถาบันและเปลี่ยนทุกปี วิธีที่เชื่อถือได้คือเปิดหน้าทุนของมหาวิทยาลัยหรือวิทยาลัยนั้นโดยตรง และดู myTCAS สำหรับโครงการที่ผูกกับการรับเข้า",
    },
    url: "https://www.mytcas.com/",
    status: "conditional",
    keywords: [
      "scholarship",
      "scholarships",
      "financial aid",
      "tuition fee",
      "ทุนการศึกษา",
      "ทุนเรียนฟรี",
      "ทุนเรียนดี",
      "ทุนช้างเผือก",
      "ค่าเทอม",
      "ค่าเล่าเรียน",
    ],
    order: 7,
  },
];

const ROUTE_KEYWORDS: Record<string, string[]> = {
  "sci-math-engineering": [
    "engineering",
    "engineer",
    "science maths",
    "sci math",
    "วิทย์คณิต",
    "วิศวกรรม",
    "วิศวะ",
    "ฟิสิกส์",
  ],
  "vocational-digital": [
    "digital",
    "information technology",
    "computer",
    "coding",
    "software",
    "ไอที",
    "ดิจิทัล",
    "คอมพิวเตอร์",
    "เขียนโปรแกรม",
    "ซอฟต์แวร์",
  ],
  "dve-dual": ["dual", "dve", "ทวิภาคี", "ฝึกงาน", "work based", "work-based"],
  "arts-design": ["art", "design", "creative", "portfolio", "ศิลปะ", "ออกแบบ", "สร้างสรรค์", "พอร์ต"],
  "business-admin": ["business", "administration", "marketing", "บัญชี", "ธุรกิจ", "บริหาร", "การตลาด"],
  "health-care": [
    "health",
    "healthcare",
    "nursing",
    "medical",
    "สุขภาพ",
    "พยาบาล",
    "แพทย์",
    "ดูแลผู้ป่วย",
  ],
  "vocational-ev-tech": [
    "ev",
    "electric vehicle",
    "automotive",
    "ยานยนต์ไฟฟ้า",
    "รถไฟฟ้า",
    "ช่างยนต์",
    "แบตเตอรี่",
    "อิเล็กทรอนิกส์",
  ],
  "vocational-culinary": [
    "culinary",
    "hospitality",
    "อาหาร",
    "โภชนาการ",
    "การโรงแรม",
    "ครัว",
    "เชฟ",
  ],
  "vocational-logistics": [
    "logistics",
    "supply chain",
    "warehouse",
    "โลจิสติกส์",
    "ซัพพลายเชน",
    "คลังสินค้า",
    "ขนส่ง",
  ],
  "university-ai-data": [
    "data science",
    "machine learning",
    "artificial intelligence",
    "วิทยาการข้อมูล",
    "ปัญญาประดิษฐ์",
    "วิเคราะห์ข้อมูล",
  ],
  "university-medtech-rehab": [
    "medical technology",
    "rehabilitation",
    "physiotherapy",
    "เทคนิคการแพทย์",
    "กายภาพบำบัด",
    "ฟื้นฟู",
  ],
  "university-digital-comm": [
    "communication arts",
    "digital media",
    "นิเทศศาสตร์",
    "สื่อดิจิทัล",
    "โซเชียลมีเดีย",
    "คอนเทนต์",
  ],
};

/**
 * The words learners use, as opposed to the words the sources use.
 *
 * Every keyword above was taken from the material being cited — สอศ., myTCAS,
 * RIASEC, ตลาดแรงงาน. A fifteen-year-old does not type any of that. They type
 * "ชอบวาดรูป", "อยากเป็นหมอ", "จบมาทำงานอะไร", and retrieval returned nothing,
 * which in this pipeline is not a worse answer but no answer at all: with no
 * source the chat never reaches the model, so the most natural way to ask was
 * the one guaranteed to fail.
 *
 * Kept as a separate map rather than folded into `keywords` so the two
 * vocabularies stay legible. One is what a source is about; the other is how
 * someone asks for it, and only the second needs revisiting when we watch real
 * learners type.
 *
 * Short stems are chosen where they are unambiguous — ศิลป covers ศิลปะ,
 * ศิลป์ and ศิลปิน; วิศว covers วิศวะ and วิศวกรรม. Ambiguous fragments are
 * left out: ช่าง would match ช่างเถอะ.
 *
 * หมอ was left out too, for fear of หมอน, and the cure was worse than the
 * disease: the list held อยากเป็นหมอ and เป็นหมอ, so "อยากเป็นหมอ ต้องเรียนอะไร"
 * retrieved the route and the shorter "หมอเรียนอะไร" retrieved nothing at all.
 * Medicine is the most named aspiration this product will meet, and it was
 * answerable only if you happened to phrase it the long way. The bare stem is
 * in now. หมอน costs a learner nothing they would notice, and the neighbours
 * that do occur — หมอนวด, หมอดู — are close enough to กายภาพบำบัด and
 * ผู้ช่วยพยาบาล that the route is a fair thing to show.
 *
 * English learner vocabulary lives here too. It was missing entirely for
 * health: "I want to be a doctor" matched nothing, because the only English on
 * file was the source's own — nursing, medical, healthcare.
 */
const LEARNER_VOCABULARY: Record<string, string[]> = {
  "ovec-voc-curriculum-2567": [
    "สายอาชีพ",
    "อาชีวะ",
    "วิทยาลัย",
    "เรียนสายอาชีพ",
    "ฝึกอาชีพ",
    "ทวิศึกษา",
  ],
  "mytcas-70": [
    "ม.ปลาย",
    "มัธยมปลาย",
    "สายสามัญ",
    "สอบเข้า",
    "เรียนต่อ",
    "ต่อมหาลัย",
    "มหาลัย",
    "แอดมิชชั่น",
    "โควตา",
    "รอบพอร์ต",
    "ยื่นคะแนน",
    "คณะไหน",
  ],
  "onet-interest-profiler-manual": [
    "ชอบอะไร",
    "ถนัด",
    "ความถนัด",
    "สนใจ",
    "ค้นหาตัวเอง",
    "เลือกไม่ถูก",
    "ไม่รู้จะเรียนอะไร",
    "ยังไม่รู้ว่าชอบอะไร",
    "แนะแนว",
  ],
  "hsces-current-2026": ["วุฒิ", "กศน", "เรียนนอกระบบ", "จบต่างประเทศ"],
  /*
   * How money gets asked about. Almost never by name: a learner says they have
   * no money for school, or that the fees are too much, long before they know
   * the word กยศ. "ไม่มีเงินเรียน" is the sentence this whole group exists for.
   */
  // ผ่อน on its own would match ผ่อนคลาย, so the debt sense is spelled out.
  "studentloan-fund": ["ทุน", "กู้", "ยืมเงิน", "ผ่อนหนี้", "ใช้หนี้", "ติดหนี้"],
  /*
   * Asked by a fifteen-year-old two months before they have to choose, and
   * almost never by the name of the thing.
   */
  "upper-secondary-study-plans": [
    "เลือกสายไหน",
    "เลือกแผนไหน",
    "ต่อ ม.4",
    "ขึ้น ม.4",
    "จบ ม.3 แล้ว",
    "เรียนสายไหนดี",
    "ต่อคณะอะไรได้",
  ],
  "tcas-rounds": ["สมัครมหาลัย", "สอบเข้ามหาลัย", "ยื่นพอร์ต", "เตรียมพอร์ต", "รอบไหน"],
  "free-education-15-years": ["ไม่มีเงินจ่ายค่าเทอม", "ต้องจ่ายเองไหม", "ฟรีจริงไหม", "เสียเงินไหม"],
  /*
   * This is asked as a fear, not as a query about labour statistics — usually
   * by a parent, often in the learner's words rather than their own.
   */
  "vec-graduate-outcomes-2566": [
    "จบมาตกงาน",
    "ไม่มีงานทำ",
    "หางานไม่ได้",
    "เรียนอาชีวะแล้ว",
    "ต่อปริญญาตรีได้ไหม",
    "จบ ปวช แล้ว",
    "จบ ปวส แล้ว",
    "ไม่มีอนาคต",
  ],
  "eef-equity-fund": ["ทางบ้านไม่พร้อม", "ที่บ้านจน", "พ่อแม่ไม่มีเงิน", "ออกกลางคัน"],
  "institution-scholarships": [
    "ไม่มีเงินเรียน",
    "ไม่มีตังค์เรียน",
    "ไม่มีทุน",
    "เรียนฟรี",
    "แพงไหม",
    "ค่าใช้จ่าย",
    "ขอทุน",
    "สมัครทุน",
  ],
  "tdri-human-capital-2025": [
    "หางาน",
    "ตกงาน",
    "เงินเดือน",
    "รายได้",
    "จบมาทำงานอะไร",
    "อาชีพในอนาคต",
    "ตลาดงาน",
    "งานที่ต้องการ",
  ],
  "route-sci-math-engineering": [
    "สายวิทย์",
    "วิทย์-คณิต",
    "วิศว",
    "คณิตศาสตร์",
    "เคมี",
    "ชีววิทยา",
    "วิทยาศาสตร์",
  ],
  "route-vocational-digital": [
    "เทคโนโลยี",
    "โปรแกรมเมอร์",
    "เขียนโค้ด",
    "ทำเกม",
    "ทำแอป",
    "ทำเว็บ",
    "สายไอที",
  ],
  "route-dve-dual": [
    "เรียนไปทำงานไป",
    "มีรายได้ระหว่างเรียน",
    "ทำงานจริง",
    "สหกิจ",
    // "ไม่อยากเรียนต่อ อยากทำงานเลย" and "ไม่ชอบท่องจำ ชอบลงมือทำ" are this
    // route's own audience saying so in their own words, and both retrieved
    // nothing. Work-based study is the answer to wanting out of the classroom,
    // so the phrases for wanting out belong here.
    "อยากทำงาน",
    "ทำงานเลย",
    "ลงมือทำ",
    "ได้ลงมือ",
  ],
  "route-arts-design": [
    "วาดรูป",
    "วาดภาพ",
    "กราฟิก",
    "ดีไซน์",
    "สายศิลป์",
    "ศิลป",
    "ถ่ายรูป",
    "ครีเอทีฟ",
    "งานคราฟต์",
  ],
  "route-business-admin": [
    "ค้าขาย",
    "ขายของ",
    "การเงิน",
    "เศรษฐศาสตร์",
    "ผู้ประกอบการ",
    "เปิดร้าน",
    "ทำธุรกิจ",
  ],
  "route-vocational-ev-tech": ["ซ่อมรถ", "รถ EV", "ช่างรถ", "มอเตอร์ไซค์ไฟฟ้า", "ชาร์จรถ"],
  "route-vocational-culinary": ["ทำอาหาร", "ทำขนม", "เปิดร้านอาหาร", "เป็นเชฟ", "งานโรงแรม", "บาริสต้า"],
  "route-vocational-logistics": ["ส่งของ", "งานคลัง", "จัดส่ง", "ขนส่งสินค้า", "สต็อกของ"],
  "route-university-ai-data": ["ทำ ai", "สาย ai", "ข้อมูลขนาดใหญ่", "data", "วิเคราะห์สถิติ"],
  "route-university-medtech-rehab": ["แล็บ", "ตรวจเลือด", "นักกายภาพ", "ฟื้นฟูผู้ป่วย", "เครื่องมือแพทย์"],
  "route-university-digital-comm": ["ทำคอนเทนต์", "ยูทูบเบอร์", "ตัดต่อ", "ทำสื่อ", "ครีเอเตอร์", "การตลาดออนไลน์"],
  "route-health-care": [
    "หมอ",
    "เภสัช",
    "ทันตแพทย์",
    "สาธารณสุข",
    "ผู้ช่วยพยาบาล",
    "ดูแลคน",
    "กายภาพบำบัด",
    "doctor",
    "nurse",
    "dentist",
    "pharmacist",
  ],
};

const ROUTE_KNOWLEDGE: KnowledgeRecord[] = routesData.routes.map((route, index) => ({
  id: `route-${route.id}`,
  title: {
    en: `FutureMe demo route: ${route.name.en}`,
    th: `ตัวอย่างเส้นทาง FutureMe: ${route.name.th}`,
  },
  excerpt: {
    en: `${route.summary.en} Next exploration: ${route.nextExperiment.en} Catalogue status: ${route.provenance.status}.`,
    th: `${route.summary.th} สิ่งที่ลองทำต่อได้: ${route.nextExperiment.th} สถานะข้อมูล: ${route.provenance.status}`,
  },
  url: route.provenance.sourceUrl ?? undefined,
  status: route.provenance.status,
  keywords: ROUTE_KEYWORDS[route.id] ?? [],
  order: 100 + index,
}));

const KNOWLEDGE = [...GENERAL_KNOWLEDGE, ...ROUTE_KNOWLEDGE].map((record) => ({
  ...record,
  keywords: [...record.keywords, ...(LEARNER_VOCABULARY[record.id] ?? [])],
}));

const STOP_WORDS = new Set([
  "about",
  "and",
  "are",
  "can",
  "for",
  "from",
  "have",
  "help",
  "how",
  "the",
  "this",
  "that",
  "those",
  "these",
  "one",
  "ones",
  "it",
  "its",
  "is",
  "was",
  // Common enough in the sources' own prose that a query containing them
  // scored a point against nearly every record — "I am not sure about
  // engineering" was pulling in health care.
  "not",
  "sure",
  "where",
  "should",
  "what",
  "with",
  "you",
  "your",
  "ฉัน",
  "อยาก",
  "อะไร",
  "อย่างไร",
  "เกี่ยวกับ",
  "ช่วย",
  "เรียน",
  "และ",
  "หรือ",
]);

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en").replace(/[–—]/g, "-");
}

/**
 * Saying you do not want something is not a way of asking about it.
 *
 * Keyword matching reads "ไม่ชอบดูแลคนเลย ไม่อยากทำงานกับคนป่วย" and sees
 * ดูแลคน, which is health-care vocabulary — so a learner who twice said care
 * work is not for them was handed the health-care route as their grounding,
 * and the model then answered warmly and at length about it. In a product whose
 * first promise is that it never picks a route for you, nothing reads as less
 * like listening.
 *
 * Only rejection counts, and rejection is narrower than negation. ไม่ชอบ,
 * ไม่อยาก and เกลียด turn a topic down. ไม่แน่ใจ and ไม่รู้ are someone
 * undecided *about* the topic they just named — "ไม่รู้จะเรียนอะไรดี" is
 * probably the single most common opening sentence in this product, and
 * treating its ไม่ as a refusal would answer "no idea" to the learner who needs
 * an answer most.
 */
const REJECTION_PATTERNS: RegExp[] = [
  /ไม่ชอบ/,
  /ไม่อยาก/,
  /ไม่สนใจ/,
  /ไม่ถนัด/,
  /ไม่เอา/,
  /ไม่ต้องการ/,
  /ไม่คิดจะ/,
  /ไม่ใช่แนว/,
  /ไม่ค่อย(?:ชอบ|สนใจ|ถนัด)/,
  /เกลียด/,
  /\bhates?\b/,
  /\b(?:do(?:es)?|did)\s+not\s+(?:like|want|enjoy)\b/,
  /\bdon'?t\s+(?:like|want|enjoy)\b/,
  /\bdoesn'?t\s+(?:like|want|enjoy)\b/,
  /\bnot\s+interested\b/,
  /\bno\s+interest\s+in\b/,
];

const THAI_CHARACTER = /[฀-๿]/;

/**
 * Splits a question into the parts a rejection can apply to.
 *
 * Thai puts spaces between clauses rather than between words, so a single space
 * is a boundary there and must not be one in English, where it would leave
 * "don't" and "like" in separate clauses and no rejection would ever match.
 * Segments are therefore split on punctuation first, and only Thai-bearing ones
 * are split again on spaces.
 *
 * แต่ and "but" are boundaries in their own right because "ไม่ชอบวาดรูป
 * แต่อยากทำธุรกิจ" is written without one, and it is the sentence shape where
 * getting this wrong costs most: the learner told us what they want in the same
 * breath as what they do not. Leaving "but" out cost exactly that — "I hate
 * maths but I like design" was one clause, so the rejection swallowed the
 * request and the learner who told us what they wanted got nothing.
 */
function clauses(text: string): string[] {
  const coarse = text
    .replace(/แต่/g, "\n")
    .replace(/\bbut\b/gi, "\n")
    .split(/[.,!?;:\n]+|\s{2,}/);
  const parts: string[] = [];
  for (const chunk of coarse) {
    if (THAI_CHARACTER.test(chunk)) parts.push(...chunk.split(/\s+/));
    else parts.push(chunk);
  }
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * Drops the clauses that turn a topic down, and keeps the rest.
 *
 * Dropping rather than penalising: a rejected clause should stop supporting its
 * own topic, not argue against a topic the learner raised elsewhere in the same
 * sentence. When every clause is a rejection nothing survives, retrieval
 * returns nothing, and the chat says so — which is the right answer to someone
 * who has only told us what they do not want.
 */
export function askedAbout(query: string): string {
  return clauses(query)
    .filter((clause) => {
      const normalized = normalize(clause);
      return !REJECTION_PATTERNS.some((pattern) => pattern.test(normalized));
    })
    .join(" ");
}

/**
 * `\p{M}` is in the class because Thai vowels and tone marks are combining
 * marks, not letters. Without it the pattern cuts a Thai word at every mark
 * and leaves fragments that mean nothing — "เท่ากับเท่าไหร่" became "บเท",
 * which then substring-matched "ระบบเทียบวุฒิ" and retrieved the credential
 * equivalency source for a question about arithmetic. Whole words match far
 * less often, which is correct: for Thai the curated keywords below are meant
 * to be doing the work, not accidents of where a tone mark fell.
 */
function tokens(value: string): string[] {
  return (normalize(value).match(/[\p{L}\p{N}\p{M}]+/gu) ?? []).filter(
    (token) => token.length >= 3 && !STOP_WORDS.has(token),
  );
}

function scoreRecord(record: KnowledgeRecord, query: string): number {
  const normalizedQuery = normalize(query);
  const queryTokens = new Set(tokens(query));
  const searchable = normalize(
    `${record.title.en} ${record.title.th} ${record.excerpt.en} ${record.excerpt.th}`,
  );
  const searchableTokens = new Set(tokens(searchable));
  let score = 0;

  for (const keyword of record.keywords) {
    const normalizedKeyword = normalize(keyword);
    const keywordTokens = tokens(keyword);
    const isAsciiKeyword = /^[a-z0-9\s-]+$/.test(normalizedKeyword);
    const exactMatch = isAsciiKeyword
      ? keywordTokens.length > 0 && keywordTokens.every((token) => queryTokens.has(token))
      : normalizedQuery.includes(normalizedKeyword);
    if (exactMatch) score += 5;
    else if (keywordTokens.some((token) => queryTokens.has(token))) score += 2;
  }

  for (const token of queryTokens) {
    const matches = /^[a-z0-9]+$/.test(token)
      ? searchableTokens.has(token)
      : searchable.includes(token);
    if (matches) score += 1;
  }

  return score;
}

export function retrieveKnowledge(
  query: string,
  language: ChatLanguage,
  limit = 4,
): RetrievedKnowledge[] {
  if (!query.trim() || limit <= 0) return [];

  // What is left after the parts that turned a topic down are removed. Nothing
  // left means the learner only told us what they do not want.
  const asked = askedAbout(query);
  if (!asked.trim()) return [];

  return KNOWLEDGE.map((record) => ({ record, score: scoreRecord(record, asked) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.order - b.record.order)
    .slice(0, limit)
    .map(({ record }) => {
      const title = record.title[language];
      const excerpt = record.excerpt[language];
      return {
        source: {
          id: record.id,
          title,
          excerpt,
          ...(record.url ? { url: record.url } : {}),
          status: record.status,
        },
        context: [
          `SOURCE_ID: ${record.id}`,
          `STATUS: ${record.status}`,
          `TITLE: ${title}`,
          `CONTENT: ${excerpt}`,
          record.url ? `URL: ${record.url}` : "URL: none (demo catalogue entry)",
        ].join("\n"),
      };
    });
}
