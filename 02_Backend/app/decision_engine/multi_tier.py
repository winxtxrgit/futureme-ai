"""
Multi-Tier Pathway Router & Educational Level Specialist.

Supports 4 Educational Tiers:
1. Primary (ป.4 - ป.6): Play-based discovery & interest exploration.
2. Lower Secondary (ม.1 - ม.3): Transition choices to ม.4 flexible learning plans,
   12 ปวช. 2567 vocational subject areas, ปวช. dual-education (DVE) routes,
   and counselor-supported safety routes.
3. Upper Secondary (ม.4 - ม.6): University faculty matching (TCAS context & TPAT2-5),
   certifications, 30-day action plans, and portfolio building.
4. Vocational (ปวช. - ปวส.): Continuous higher vocational (ปวส. to Bachelor's / DVE),
   certifications, 30-day action plans, and portfolio building.
"""

from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class EducationTier(str, Enum):
    PRIMARY = "PRIMARY"                   # ป.4 - ป.6
    LOWER_SECONDARY = "LOWER_SECONDARY"   # ม.1 - ม.3
    UPPER_SECONDARY = "UPPER_SECONDARY"   # ม.4 - ม.6
    VOCATIONAL = "VOCATIONAL"             # ปวช. - ปวส.


# --- Domain Reference Data ---

# 12 ปวช. 2567 Vocational Subject Areas (สอศ. กระทรวงศึกษาธิการ)
VOCATIONAL_AREAS_2567: List[Dict[str, str]] = [
    {"area_id": "V01", "name_th": "อุตสาหกรรม", "name_en": "Industry", "description_th": "ช่างยนต์, ช่างไฟฟ้ากำลัง, ช่างอิเล็กทรอนิกส์, ช่างกลโรงงาน, เมคคาทรอนิกส์"},
    {"area_id": "V02", "name_th": "บริหารธุรกิจ", "name_en": "Business", "description_th": "การบัญชี, การตลาด, เลขานุการ, คอมพิวเตอร์ธุรกิจ"},
    {"area_id": "V03", "name_th": "คหกรรม", "name_en": "Home economics", "description_th": "โภชนาการ, การดูแลเด็กและผู้สูงอายุ, คหกรรมศาสตร์"},
    {"area_id": "V04", "name_th": "ท่องเที่ยว", "name_en": "Tourism", "description_th": "การท่องเที่ยว, การโรงแรม, การบริการ"},
    {"area_id": "V05", "name_th": "สุขภาพและความงาม", "name_en": "Health and beauty", "description_th": "การดูแลสุขภาพ, สปา, ความงามและชะลอวัย"},
    {"area_id": "V06", "name_th": "โลจิสติกส์", "name_en": "Logistics", "description_th": "การจัดการโลจิสติกส์และซัพพลายเชน, ซัพพลายการขนส่ง"},
    {"area_id": "V07", "name_th": "อาหาร", "name_en": "Food", "description_th": "เทคโนโลยีอาหาร, การประกอบอาหาร, นวัตกรรมอาหาร"},
    {"area_id": "V08", "name_th": "ศิลปกรรมและเศรษฐกิจครีเอทีฟ", "name_en": "Art and creative economy", "description_th": "การออกแบบ, ทัศนศิลป์, งานประดิษฐ์สร้างสรรค์"},
    {"area_id": "V09", "name_th": "เกษตรกรรมและประมง", "name_en": "Agriculture and fisheries", "description_th": "เกษตรอัจฉริยะ, เทคโนโลยีประมง, สัตวศาสตร์"},
    {"area_id": "V10", "name_th": "แฟชั่นและสิ่งทอ", "name_en": "Fashion and textiles", "description_th": "การออกแบบแฟชั่น, สิ่งทอและเครื่องแต่งกาย"},
    {"area_id": "V11", "name_th": "ดิจิทัลและไอที", "name_en": "Digital and IT", "description_th": "เทคโนโลยีธุรกิจดิจิทัล, การพัฒนาซอฟต์แวร์, เครือข่ายคอมพิวเตอร์"},
    {"area_id": "V12", "name_th": "เอ็นเตอร์เทนเมนต์", "name_en": "Entertainment", "description_th": "การสร้างสื่อดิจิทัล, มัลติมีเดีย, การแสดงและโปรดักชัน"}
]

# Official MyTCAS TPAT Mappings (TPAT1 - TPAT5)
TPAT_MAPPINGS: Dict[str, Dict[str, str]] = {
    "TPAT1": {
        "name_th": "ความถนัดวิชาชีพแพทย์ (กสพท)",
        "target_faculties": "แพทยศาสตร์, ทันตแพทยศาสตร์, เภสัชศาสตร์, สัตวแพทยศาสตร์",
        "description_th": "ประเมินความถนัดแพทย์ จริยธรรมทางการแพทย์ และเชาวน์ปัญญา"
    },
    "TPAT2": {
        "name_th": "ความถนัดศิลปกรรมศาสตร์",
        "target_faculties": "ศิลปกรรมศาสตร์, วิจิตรศิลป์, การออกแบบสื่อ, ดนตรีและการแสดง",
        "description_th": "ประเมินความถนัดด้านทัศนศิลป์ ดนตรี และศิลปะการแสดง"
    },
    "TPAT3": {
        "name_th": "ความถนัดวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์",
        "target_faculties": "วิศวกรรมศาสตร์, วิทยาศาสตร์, เทคโนโลยีสารสนเทศ (IT), นวัตกรรมเทคโนโลยี",
        "description_th": "ประเมินความคิดเชิงวิทยาศาสตร์ วิศวกรรมศาสตร์ และการแก้ปัญหาเทคโนโลยี"
    },
    "TPAT4": {
        "name_th": "ความถนัดสถาปัตยกรรมศาสตร์",
        "target_faculties": "สถาปัตยกรรมศาสตร์, ออกแบบภายใน, ผังเมือง",
        "description_th": "ประเมินความเข้าใจมิติสัมพันธ์ และการออกแบบสถาปัตยกรรม"
    },
    "TPAT5": {
        "name_th": "ความถนัดทางวิชาชีพครู",
        "target_faculties": "ครุศาสตร์, ศึกษาศาสตร์ (ทุกสาขาเอก)",
        "description_th": "ประเมินความถนัดและจิตวิญญาณความเป็นครู"
    }
}

# General & Specialized ม.4 Learning Plans
M4_LEARNING_TRACKS: List[Dict[str, str]] = [
    {
        "track_id": "M4_SCI_MATH",
        "title_th": "สายวิทยาศาสตร์–คณิตศาสตร์ (วิทย์–คณิต)",
        "tags": ["วิทย์", "คณิต", "STEM", "สุขภาพ"],
        "description_th": "เน้นฟิสิกส์ เคมี ชีววิทยา คณิตศาสตร์เพิ่มเติม เตรียมเข้าคณะสายแพทย์ วิศวฯ สเต็ม"
    },
    {
        "track_id": "M4_ARTS_MATH",
        "title_th": "สายศิลปศาสตร์–คณิตศาสตร์ (ศิลป์–คำนวณ)",
        "tags": ["บริหาร", "บัญชี", "เศรษฐศาสตร์", "นิเทศ"],
        "description_th": "เน้นคณิตศาสตร์เพิ่มเติม ภาษาอังกฤษเข้มข้น เตรียมเข้าคณะบริหาร บัญชี เศรษฐศาสตร์"
    },
    {
        "track_id": "M4_ARTS_LANG",
        "title_th": "สายศิลปศาสตร์–ภาษาต่างประเทศ (ศิลป์–ภาษา)",
        "tags": ["ภาษา", "มนุษยศาสตร์", "อักษรศาสตร์", "การต่างประเทศ"],
        "description_th": "เน้นภาษาที่ 2 (จีน/ญี่ปุ่น/ฝรั่งเศส/เกาหลี) เตรียมเข้าคณะมนุษยศาสตร์ อักษรศาสตร์ รัฐศาสตร์"
    },
    {
        "track_id": "M4_ARTS_SOC",
        "title_th": "สายศิลปศาสตร์–สังคมศึกษา / ดนตรี / กีฬา / ศิลปะ",
        "tags": ["สังคมศาสตร์", "ศิลปะ", "กีฬา", "ดนตรี"],
        "description_th": "เน้นสุนทรียภาพ กีฬา สังคมศาสตร์ หรือนิเทศศาสตร์"
    },
    {
        "track_id": "M4_GIFTED_AI",
        "title_th": "แผนการเรียนบูรณาการความสามารถพิเศษ (Gifted / EP / AI & Robotics)",
        "tags": ["AI", "Robotics", "Gifted", "นวัตกรรม"],
        "description_th": "เน้นโค้ดดิ้ง วิทยาการคำนวณ ปัญญาประดิษฐ์ และโครงงานวิจัยเทคโนโลยี"
    }
]


class CandidatePathway(BaseModel):
    """Educational or career pathway candidate option."""
    pathway_id: str
    title_th: str
    tier: EducationTier
    category_th: str
    riasec_affinity: List[str]  # e.g., ["I", "R"]
    required_strengths: List[str]  # e.g., ["analytical_thinking"]
    learning_style_fit: List[str]  # e.g., ["visual_analytical"]
    tcas_tpat_requirement: Optional[str] = None  # e.g., "TPAT3"
    vocational_area_2567: Optional[str] = None  # e.g., "V11"
    is_dve_dual_education: bool = False
    is_safety_net: bool = False
    action_plan_30_days: List[str]
    certifications_recommended: List[str]
    portfolio_guide_th: str


class TierRoutingResult(BaseModel):
    """Output from multi-tier pathway router."""
    tier: EducationTier
    detected_grade_level: str
    guidance_focus_th: str
    candidate_pathways: List[CandidatePathway]
    counselor_safety_notes_th: Optional[str] = None


def detect_tier(grade_level: str) -> EducationTier:
    """
    Detects the student's education tier from grade level string.
    """
    g = grade_level.strip().lower()
    
    if any(k in g for k in ["ป.4", "ป.5", "ป.6", "ประถม", "primary"]):
        return EducationTier.PRIMARY
    elif any(k in g for k in ["ม.1", "ม.2", "ม.3", "ม.ต้น", "lower_secondary"]):
        return EducationTier.LOWER_SECONDARY
    elif any(k in g for k in ["ม.4", "ม.5", "ม.6", "ม.ปลาย", "upper_secondary"]):
        return EducationTier.UPPER_SECONDARY
    elif any(k in g for k in ["ปวช", "ปวส", "อาชีวะ", "vocational"]):
        return EducationTier.VOCATIONAL
    else:
        return EducationTier.UPPER_SECONDARY


def route_tier_pathways(
    grade_level: str,
    primary_riasec: str = "I",
    top_strengths: Optional[List[str]] = None,
    primary_learning_style: str = "hands_on_practical"
) -> TierRoutingResult:
    """
    Generates tier-specific educational candidate pathways matching student profile.
    """
    tier = detect_tier(grade_level)
    strengths = top_strengths or ["analytical_thinking"]
    candidate_pathways: List[CandidatePathway] = []
    counselor_notes: Optional[str] = None

    if tier == EducationTier.PRIMARY:
        guidance_focus = "การสำรวจความสนใจและเน้นการเรียนรู้ผ่านกิจกรรมเล่นเกม (Play-based Discovery)"
        candidate_pathways = [
            CandidatePathway(
                pathway_id="PRI_01",
                title_th="สโมสรนักคิดและนักทดลองจิ๋ว (Junior STEM Explorer)",
                tier=EducationTier.PRIMARY,
                category_th="สำรวจวิทยาศาสตร์และโค้ดดิ้งเบื้องต้น",
                riasec_affinity=["I", "R"],
                required_strengths=["analytical_thinking", "practical_execution"],
                learning_style_fit=["hands_on_practical", "visual_analytical"],
                action_plan_30_days=[
                    "ทดลองต่อวงจรไฟฟ้าอย่างง่ายหรือเลโก้หุ่นยนต์ 1 ครั้ง/สัปดาห์",
                    "เล่นเกมแก้โจทย์ตรรกะ Scratch Junior วันละ 15 นาที",
                    "บันทึกสิ่งที่สงสัยและคำตอบลงในสมุดไดอารี่นักคิด"
                ],
                certifications_recommended=["Scratch Code Explorer Badge", "Junior Science Quest Certificate"],
                portfolio_guide_th="รวบรวมภาพถ่ายสิ่งประดิษฐ์และเกียรติบัตรการเข้าร่วมค่ายกิจกรรมลงในแฟ้มสะสมงานจิ๋ว"
            ),
            CandidatePathway(
                pathway_id="PRI_02",
                title_th="สตูดิโอสร้างสรรค์และศิลปะดิจิทัล (Creative Art & Storytelling)",
                tier=EducationTier.PRIMARY,
                category_th="สำรวจศิลปะและเรื่องเล่าสร้างสรรค์",
                riasec_affinity=["A", "S"],
                required_strengths=["creative_problem_solving", "teamwork_collaboration"],
                learning_style_fit=["visual_analytical", "social_collaborative"],
                action_plan_30_days=[
                    "วาดภาพหรือทำนิทานช่องสั้นด้วยโปรแกรม Canva/Paint 2 เรื่อง",
                    "เข้าร่วมกิจกรรมชมรมศิลปะหรือละครสั้นประจำโรงเรียน",
                    "แบ่งปันผลงานนิทานให้เพื่อนและผู้ปกครองติชม"
                ],
                certifications_recommended=["Junior Digital Creator Badge"],
                portfolio_guide_th="เก็บรวบรวมภาพวาด ผลงานนิทาน และการ์ดอวยพรที่ออกแบบเอง"
            ),
            CandidatePathway(
                pathway_id="PRI_03",
                title_th="ชมรมผู้นำรุ่นเล็กและการสื่อสาร (Little Leader & Public Speaking)",
                tier=EducationTier.PRIMARY,
                category_th="สำรวจภาวะผู้นำและการสื่อสาร",
                riasec_affinity=["E", "S"],
                required_strengths=["leadership", "teamwork_collaboration"],
                learning_style_fit=["social_collaborative"],
                action_plan_30_days=[
                    "อาสารับบทบาทหัวหน้ากลุ่มในกิจกรรมห้องเรียน 2 ครั้ง",
                    "ฝึกพูดเล่าเรื่องหน้าชั้นเรียน 3 นาทีสัปดาห์ละครั้ง",
                    "ร่วมจัดกิจกรรมเกมกระชับความสัมพันธ์ในห้องเรียน"
                ],
                certifications_recommended=["Young Leader Participation Certificate"],
                portfolio_guide_th="ถ่ายภาพบันทึกการทำหน้าที่นำกิจกรรมและเกียรติบัตรความดี"
            )
        ]

    elif tier == EducationTier.LOWER_SECONDARY:
        guidance_focus = "การตัดสินใจเลือกทางแยก ม.4 แผนการเรียนสามัญ / 12 กลุ่มสาขา ปวช. 2567 / ระบบทวิภาคี DVE"
        counselor_notes = "หากนักเรียนยังไม่มั่นใจในระดับเกรดเฉลี่ย ให้เตรียมเส้นทางสำรอง (Safety Route) คู่ขนานระหว่าง ม.4 และ ปวช. โดยมีครูแนะแนวให้คำปรึกษา"
        
        candidate_pathways = [
            CandidatePathway(
                pathway_id="M3_TRACK_01",
                title_th="ม.4 แผนการเรียนวิทยาศาสตร์–คณิตศาสตร์ / AI & Robotics",
                tier=EducationTier.LOWER_SECONDARY,
                category_th="ม.4 สายสามัญ (General / Specialized Track)",
                riasec_affinity=["I", "R"],
                required_strengths=["analytical_thinking", "practical_execution"],
                learning_style_fit=["visual_analytical", "self_directed_inquiry"],
                tcas_tpat_requirement="TPAT3 (วิทยาศาสตร์ เทคโนโลยี วิศวกรรม)",
                action_plan_30_days=[
                    "ทบทวนเนื้อหาวิทยาศาสตร์และคณิตศาสตร์ ม.ต้น เพื่อเตรียมสอบเข้า ม.4",
                    "ลองเข้าคอร์สออนไลน์ Python for Beginners ฟรีของ สสวท./DEEP",
                    "ปรึกษาครูแนะแนวเกี่ยวกับการเลือกแผนการเรียน ม.4 วิทย์-คณิต"
                ],
                certifications_recommended=["Python Basic Programming Certificate", "สสวท. Digital Learning Badge"],
                portfolio_guide_th="จัดทำโครงงานวิทยาศาสตร์ ม.ต้น และวุฒิบัตรแข่งขันทักษะวิชาการ"
            ),
            CandidatePathway(
                pathway_id="M3_VOC_V11",
                title_th="ปวช. สาขาวิชาดิจิทัลและไอที (12 กลุ่มสาขา ปวช. 2567)",
                tier=EducationTier.LOWER_SECONDARY,
                category_th="ปวช. สายอาชีพ (Vocational Area V11)",
                riasec_affinity=["I", "R", "A"],
                required_strengths=["practical_execution", "analytical_thinking"],
                learning_style_fit=["hands_on_practical"],
                vocational_area_2567="V11",
                action_plan_30_days=[
                    "เยี่ยมชมวิทยาลัยเทคนิค/อาชีวศึกษาใกล้บ้านในวัน Open House",
                    "ฝึกสร้างเว็บไซต์ง่ายๆ ด้วย HTML/CSS หรือโปรแกรมสำเร็จรูป",
                    "ศึกษาคุณสมบัติและโอกาสงานสายเทคโนโลยีธุรกิจดิจิทัล"
                ],
                certifications_recommended=["Basic IT & Web Development Badge"],
                portfolio_guide_th="รวบรวมชิ้นงานซอฟต์แวร์ การประกอบคอมพิวเตอร์ หรือภาพผลงานดิจิทัล"
            ),
            CandidatePathway(
                pathway_id="M3_VOC_DVE",
                title_th="ปวช. ระบบทวิภาคี (DVE) สาขาอุตสาหกรรม/โลจิสติกส์ เรียนควบคู่ฝึกงานจริง",
                tier=EducationTier.LOWER_SECONDARY,
                category_th="ปวช. ทวิภาคี (Dual Vocational Education Route)",
                riasec_affinity=["R", "E", "C"],
                required_strengths=["practical_execution", "organization_discipline"],
                learning_style_fit=["hands_on_practical"],
                vocational_area_2567="V01",
                is_dve_dual_education=True,
                action_plan_30_days=[
                    "สอบถามข้อมูลสถานประกอบการร่วมจัดระบบทวิภาคีที่มีเบี้ยเลี้ยง",
                    "ยื่นสมัครเรียน ปวช. ทวิภาคี กับวิทยาลัยอาชีวศึกษาที่ร่วมมือกับเอกชน",
                    "เตรียมความพร้อมด้านทักษะปฏิบัติงานช่างและวินัยการทำงาน"
                ],
                certifications_recommended=["Pre-Vocational Technical Skill Certificate"],
                portfolio_guide_th="บันทึกประสบการณ์งานช่าง ภาพกิจกรรมปฏิบัติงาน และหนังสือรับรองฝึกงาน"
            ),
            CandidatePathway(
                pathway_id="M3_SAFETY_NET",
                title_th="เส้นทางสำรองปลอดภัย (Counselor Safety Net Route): ศิลป์-คำนวณ / ปวช. บริหารธุรกิจ",
                tier=EducationTier.LOWER_SECONDARY,
                category_th="เส้นทางสำรองมีครูแนะแนวดูแล (Safety Route)",
                riasec_affinity=["C", "E", "S"],
                required_strengths=["organization_discipline", "teamwork_collaboration"],
                learning_style_fit=["social_collaborative", "hands_on_practical"],
                vocational_area_2567="V02",
                is_safety_net=True,
                action_plan_30_days=[
                    "นัดหมายเข้าพบครูแนะแนวประจำโรงเรียนเพื่อประเมินทางเลือกสำรอง",
                    "วางแผนยื่นสมัครทั้ง ม.4 สายศิลป์ และ ปวช. การบัญชี/การตลาด",
                    "เข้าร่วมกิจกรรมแนะแนวอาชีพเสริมทักษะพาณิชยการ"
                ],
                certifications_recommended=["Basic Accounting & Business Literacy Certificate"],
                portfolio_guide_th="แฟ้มสะสมงานกิจกรรมนักเรียน ผลงานการทำบัญชีส่วนตัว และใบรับรองกิจกรรมแนะแนว"
            )
        ]

    elif tier == EducationTier.UPPER_SECONDARY:
        guidance_focus = "การเตรียมสอบ TCAS (TGAT/TPAT1-5/A-Level) จับคู่คณะมหาวิทยาลัย วางแผน 30 วัน และสร้าง Portfolio"
        candidate_pathways = [
            CandidatePathway(
                pathway_id="M6_TCAS_STEM",
                title_th="คณะวิศวกรรมศาสตร์ / วิทยาการคอมพิวเตอร์ (TCAS สาย STEM)",
                tier=EducationTier.UPPER_SECONDARY,
                category_th="อุดมศึกษา กลุ่ม STEM & Engineering",
                riasec_affinity=["I", "R"],
                required_strengths=["analytical_thinking", "practical_execution"],
                learning_style_fit=["visual_analytical", "self_directed_inquiry"],
                tcas_tpat_requirement="TPAT3",
                action_plan_30_days=[
                    "ฝึกทำข้อสอบเก่าวัดความถนัด TPAT3 และ A-Level Math 1 สัปดาห์ละ 2 ชุด",
                    "พัฒนาโปรแกรมหรือโครงงานซอฟต์แวร์ 1 ชิ้น อัปโหลดขึ้น GitHub",
                    "เรียบเรียง Portfolio รอบ 1 ตามเกณฑ์ประกาศของคณะเป้าหมาย"
                ],
                certifications_recommended=["Python Data Science Certificate", "TPAT3 Mock Exam Certificate"],
                portfolio_guide_th="จัดทำ Portfolio TCAS รอบ 1 แสดงโครงงาน Coding ลิ้งก์ GitHub และรางวัลการแข่งขัน"
            ),
            CandidatePathway(
                pathway_id="M6_TCAS_HEALTH",
                title_th="คณะวิทยาศาสตร์สุขภาพ (แพทยศาสตร์ / เภสัชศาสตร์ / สหเวชศาสตร์)",
                tier=EducationTier.UPPER_SECONDARY,
                category_th="อุดมศึกษา กลุ่ม Health Sciences",
                riasec_affinity=["I", "S"],
                required_strengths=["analytical_thinking", "teamwork_collaboration"],
                learning_style_fit=["visual_analytical"],
                tcas_tpat_requirement="TPAT1",
                action_plan_30_days=[
                    "ติวเข้มข้อสอบ กสพท (TPAT1) ด้านเชาวน์ปัญญาและจริยธรรมแพทย์",
                    "ทบทวนเนื้อหา A-Level ชีววิทยา และเคมี บทสำคัญ",
                    "เข้าร่วมกิจกรรมจิตอาสาโรงพยาบาลหรือปฐมพยาบาลเพื่อใส่ Portfolio"
                ],
                certifications_recommended=["Basic Life Support (BLS) First Aid Certificate"],
                portfolio_guide_th="รวบรวมหลักฐานกิจกรรมจิตอาสาดูแลผู้ป่วย ผลงานวิจัยชีววิทยา และเกียรติบัตรเรียนดี"
            ),
            CandidatePathway(
                pathway_id="M6_TCAS_BUSINESS",
                title_th="คณะบริหารธุรกิจ / พาณิชยศาสตร์และการบัญชี (TCAS สาย Business)",
                tier=EducationTier.UPPER_SECONDARY,
                category_th="อุดมศึกษา กลุ่ม Business & Economics",
                riasec_affinity=["E", "C"],
                required_strengths=["leadership", "organization_discipline"],
                learning_style_fit=["social_collaborative"],
                tcas_tpat_requirement="TGAT (TGAT1-3)",
                action_plan_30_days=[
                    "ฝึกทำข้อสอบ TGAT1 (การสื่อสารภาษาอังกฤษ) และ TGAT2 (การคิดอย่างมีเหตุผล)",
                    "ลองวางแผนโมเดลธุรกิจเล็กๆ (Business Model Canvas) สำหรับสินค้าในโรงเรียน",
                    "เรียนคอร์สการตลาดดิจิทัลเบื้องต้นบน Google Digital Garage"
                ],
                certifications_recommended=["Google Fundamentals of Digital Marketing"],
                portfolio_guide_th="แสดงแผนธุรกิจ รายรับ-รายจ่ายโครงการ และเกียรติบัตรกิจกรรมผู้นำนักเรียน"
            )
        ]

    else:  # VOCATIONAL (ปวช. - ปวส.)
        guidance_focus = "การต่อยอด ปวส. เข้าปริญญาตรี หรือก้าวสู่ตลาดแรงงานเฉพาะทาง (Skill Mastery & Portfolio)"
        candidate_pathways = [
            CandidatePathway(
                pathway_id="VOC_DEGREE_01",
                title_th="ปวส. ต่อเนื่อง ปริญญาตรีเทคโนโลยีปฏิบัติการ (สถาบันการอาชีวศึกษา)",
                tier=EducationTier.VOCATIONAL,
                category_th="อุดมศึกษาอาชีวศึกษา (Continuity Bachelor's Degree)",
                riasec_affinity=["R", "I"],
                required_strengths=["practical_execution", "analytical_thinking"],
                learning_style_fit=["hands_on_practical"],
                vocational_area_2567="V01",
                is_dve_dual_education=True,
                action_plan_30_days=[
                    "สอบถามหลักสูตรเทียบโอน ปวส. เข้าปริญญาตรีสายเทคโนโลยี",
                    "เข้ารับการทดสอบมาตรฐานฝีมือแรงงานแห่งชาติ ระดับ 1",
                    "จัดทำแฟ้มสะสมผลงานชิ้นงานอุตสาหกรรมจริงจากการฝึกงาน"
                ],
                certifications_recommended=["มาตรฐานฝีมือแรงงานแห่งชาติ ระดับ 1", "Industrial Automation Certificate"],
                portfolio_guide_th="รวบรวมแบบแบบแปลนเครื่องจักร หนังสือรับรองการฝึกงานในสถานประกอบการ และภาพชิ้นงาน"
            ),
            CandidatePathway(
                pathway_id="VOC_CAREER_02",
                title_th="ผู้เชี่ยวชาญเทคโนโลยีดิจิทัลและซอฟต์แวร์ (Direct Industry Specialist)",
                tier=EducationTier.VOCATIONAL,
                category_th="เข้าสู่สายงานอาชีพตรง (Industry Career Track)",
                riasec_affinity=["I", "R", "E"],
                required_strengths=["practical_execution", "creative_problem_solving"],
                learning_style_fit=["hands_on_practical", "self_directed_inquiry"],
                vocational_area_2567="V11",
                action_plan_30_days=[
                    "พัฒนาโปรแกรมซอฟต์แวร์ฉบับสมบูรณ์สำหรับลูกค้ารายแรก/ร้านค้าท้องถิ่น",
                    "สอบใบรับรองทักษะวิชาชีพสากล (เช่น AWS Certified / CompTIA Security+)",
                    "สร้างเว็บไซต์ Portfolio แสดงประวัติและผลงานพร้อมใช้งาน"
                ],
                certifications_recommended=["CompTIA Network+ / Security+", "AWS Cloud Practitioner"],
                portfolio_guide_th="เว็บไซต์ผลงานส่วนตัว ลิ้งก์ทดลองใช้งานระบบดิจิทัล และรีวิวจากผู้ใช้งานจริง"
            )
        ]

    return TierRoutingResult(
        tier=tier,
        detected_grade_level=grade_level,
        guidance_focus_th=guidance_focus,
        candidate_pathways=candidate_pathways,
        counselor_safety_notes_th=counselor_notes
    )


class MultiTierRouter:
    """
    Multi-Tier Educational Router Class supporting 4 education tiers:
    - Primary (ป.4-ป.6)
    - Lower Secondary (ม.1-ม.3)
    - Upper Secondary (ม.4-ม.6)
    - Vocational (ปวช.-ปวส.)
    """

    VOCATIONAL_12_AREAS: Dict[str, Dict[str, str]] = {
        item["name_th"]: item for item in VOCATIONAL_AREAS_2567
    }

    TPAT_MAPPINGS: Dict[str, Dict[str, str]] = {
        k: {
            "name": v["name_th"],
            "target_faculties": v["target_faculties"],
            "description": v["description_th"]
        }
        for k, v in TPAT_MAPPINGS.items()
    }

    def route(
        self,
        level: Union[str, EducationTier],
        riasec_top: Optional[List[str]] = None,
        interests: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Routes student profile to candidate pathways, 12 ปวช. vocational areas, safety routes, and TPAT mappings.
        """
        grade_str = str(level.value if isinstance(level, EducationTier) else level)
        primary_riasec = riasec_top[0] if riasec_top else "I"
        
        routing_res = route_tier_pathways(
            grade_level=grade_str,
            primary_riasec=primary_riasec
        )

        vocational_list = [area["name_th"] for area in VOCATIONAL_AREAS_2567]
        safety_route = (
            routing_res.counselor_safety_notes_th
            or "เส้นทางสำรองปลอดภัยคู่ขนาน สายสามัญ/ปวช. โดยมีครูแนะแนวให้คำปรึกษา"
        )

        return {
            "tier": routing_res.tier.value,
            "detected_grade_level": routing_res.detected_grade_level,
            "guidance_focus_th": routing_res.guidance_focus_th,
            "candidate_pathways": [p.model_dump() for p in routing_res.candidate_pathways],
            "vocational_areas_12": vocational_list,
            "counselor_safety_route": safety_route,
            "tpat_mappings": self.TPAT_MAPPINGS
        }

