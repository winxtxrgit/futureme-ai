"""Thai names for the O*NET occupations shown to learners.

The crosswalk averages a field's RIASEC over a set of O*NET occupations. Those
occupations are the most concrete thing the system knows about a programme —
"ช่างเชื่อม · ช่างโลหะแผ่น" says more to a fifteen-year-old than "ช่างเชื่อมโลหะ
86.8" ever will — but O*NET titles are English, and English job titles are not
useful to the learner this product is for.

So the titles the app displays are translated here, by hand. 140 of them, which
is 90% of the example slots across all 23,257 programmes. The remaining tail is
deliberately left untranslated and simply not shown: an untranslated English
title on a Thai card is worse than one fewer example.

These are occupational names, not literal translations. "Bookkeeping,
Accounting, and Auditing Clerks" becomes "เสมียนบัญชี" because that is what the
job is called in Thailand, not because it is what the words say.
"""

OCCUPATION_TH = {
    # computing
    "Computer User Support Specialists": "เจ้าหน้าที่สนับสนุนผู้ใช้คอมพิวเตอร์",
    "Computer Network Support Specialists": "เจ้าหน้าที่ดูแลระบบเครือข่าย",
    "Computer Network Architects": "สถาปนิกระบบเครือข่าย",
    "Computer Programmers": "โปรแกรมเมอร์",
    "Computer Systems Analysts": "นักวิเคราะห์ระบบ",
    "Computer Systems Engineers/Architects": "วิศวกรระบบคอมพิวเตอร์",
    "Computer and Information Research Scientists": "นักวิจัยวิทยาการคอมพิวเตอร์",
    "Software Developers": "นักพัฒนาซอฟต์แวร์",
    "Web Developers": "นักพัฒนาเว็บ",
    "Web and Digital Interface Designers": "นักออกแบบเว็บและอินเทอร์เฟซ",
    "Database Architects": "สถาปนิกฐานข้อมูล",
    "Desktop Publishers": "เจ้าหน้าที่จัดหน้าสิ่งพิมพ์",
    "Data Entry Keyers": "เจ้าหน้าที่บันทึกข้อมูล",
    # electrical, electronics, automation
    "Electricians": "ช่างไฟฟ้า",
    "Helpers--Electricians": "ผู้ช่วยช่างไฟฟ้า",
    "Electrical and Electronics Repairers, Commercial and Industrial Equipment":
        "ช่างซ่อมอุปกรณ์ไฟฟ้าและอิเล็กทรอนิกส์ในโรงงาน",
    "Electrical and Electronics Repairers, Powerhouse, Substation, and Relay":
        "ช่างซ่อมอุปกรณ์ไฟฟ้าโรงไฟฟ้าและสถานีย่อย",
    "Electrical and Electronic Engineering Technologists and Technicians":
        "ช่างเทคนิควิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์",
    "Electronics Engineers, Except Computer": "วิศวกรอิเล็กทรอนิกส์",
    "Electrical Engineers": "วิศวกรไฟฟ้า",
    "Electrical and Electronics Drafters": "ช่างเขียนแบบไฟฟ้าและอิเล็กทรอนิกส์",
    "Avionics Technicians": "ช่างเทคนิคอิเล็กทรอนิกส์การบิน",
    "Energy Engineers, Except Wind and Solar": "วิศวกรพลังงาน",
    "Wind Energy Engineers": "วิศวกรพลังงานลม",
    "Robotics Engineers": "วิศวกรหุ่นยนต์",
    "Robotics Technicians": "ช่างเทคนิคหุ่นยนต์",
    "Mechatronics Engineers": "วิศวกรเมคคาทรอนิกส์",
    "Electro-Mechanical and Mechatronics Technologists and Technicians":
        "ช่างเทคนิคเมคคาทรอนิกส์",
    # mechanical, metal, manufacturing
    "Machinists": "ช่างกลโรงงาน",
    "Tool and Die Makers": "ช่างทำแม่พิมพ์",
    "Welders, Cutters, Solderers, and Brazers": "ช่างเชื่อมและตัดโลหะ",
    "Sheet Metal Workers": "ช่างโลหะแผ่น",
    "Mechanical Engineers": "วิศวกรเครื่องกล",
    "Mechanical Engineering Technologists and Technicians": "ช่างเทคนิควิศวกรรมเครื่องกล",
    "Industrial Engineers": "วิศวกรอุตสาหการ",
    "Industrial Engineering Technologists and Technicians": "ช่างเทคนิควิศวกรรมอุตสาหการ",
    "Industrial Machinery Mechanics": "ช่างซ่อมเครื่องจักรอุตสาหกรรม",
    "Engine and Other Machine Assemblers": "ช่างประกอบเครื่องยนต์และเครื่องจักร",
    "Architectural and Engineering Managers": "ผู้จัดการงานสถาปัตยกรรมและวิศวกรรม",
    # automotive
    "Automotive Service Technicians and Mechanics": "ช่างซ่อมรถยนต์",
    "Automotive Body and Related Repairers": "ช่างซ่อมตัวถังรถยนต์",
    "Bus and Truck Mechanics and Diesel Engine Specialists": "ช่างซ่อมรถบรรทุกและเครื่องยนต์ดีเซล",
    "Automotive Engineers": "วิศวกรยานยนต์",
    # construction
    "Construction Managers": "ผู้จัดการงานก่อสร้าง",
    "Construction Laborers": "คนงานก่อสร้าง",
    "Carpenters": "ช่างไม้",
    "Civil Engineering Technologists and Technicians": "ช่างเทคนิควิศวกรรมโยธา",
    "Interior Designers": "นักออกแบบภายใน",
    "Commercial and Industrial Designers": "นักออกแบบผลิตภัณฑ์อุตสาหกรรม",
    # business, accounting, sales
    "Accountants and Auditors": "นักบัญชีและผู้สอบบัญชี",
    "Bookkeeping, Accounting, and Auditing Clerks": "เสมียนบัญชี",
    "Billing and Posting Clerks": "เจ้าหน้าที่วางบิล",
    "Tax Preparers": "ผู้จัดทำภาษี",
    "Tax Examiners and Collectors, and Revenue Agents": "เจ้าหน้าที่สรรพากร",
    "Retail Salespersons": "พนักงานขายหน้าร้าน",
    "First-Line Supervisors of Retail Sales Workers": "หัวหน้าพนักงานขาย",
    "Cashiers": "แคชเชียร์",
    "Gambling Change Persons and Booth Cashiers": "พนักงานเก็บเงินประจำจุด",
    "General and Operations Managers": "ผู้จัดการทั่วไป",
    "Administrative Services Managers": "ผู้จัดการงานธุรการ",
    "Executive Secretaries and Executive Administrative Assistants": "เลขานุการผู้บริหาร",
    "Legal Secretaries and Administrative Assistants": "เลขานุการฝ่ายกฎหมาย",
    "Human Resources Managers": "ผู้จัดการฝ่ายบุคคล",
    "Human Resources Specialists": "เจ้าหน้าที่ฝ่ายบุคคล",
    "Market Research Analysts and Marketing Specialists": "นักวิเคราะห์การตลาด",
    "Marketing Managers": "ผู้จัดการการตลาด",
    "Sales Managers": "ผู้จัดการฝ่ายขาย",
    "Advertising Sales Agents": "ตัวแทนขายโฆษณา",
    "Advertising and Promotions Managers": "ผู้จัดการโฆษณาและส่งเสริมการขาย",
    "Public Relations Managers": "ผู้จัดการประชาสัมพันธ์",
    "Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel":
        "ตัวแทนขายบริการ",
    "Statisticians": "นักสถิติ",
    # logistics
    "Logisticians": "นักโลจิสติกส์",
    "Cargo and Freight Agents": "ตัวแทนขนส่งสินค้า",
    "Dispatchers, Except Police, Fire, and Ambulance": "เจ้าหน้าที่จัดคิวและสั่งการเดินรถ",
    "Shipping, Receiving, and Inventory Clerks": "เจ้าหน้าที่คลังสินค้าและรับส่งของ",
    # hospitality, tourism, food
    "Lodging Managers": "ผู้จัดการที่พัก",
    "Concierges": "พนักงานต้อนรับส่วนหน้า",
    "Maids and Housekeeping Cleaners": "พนักงานแม่บ้าน",
    "Janitors and Cleaners, Except Maids and Housekeeping Cleaners": "พนักงานทำความสะอาดอาคาร",
    "Travel Agents": "ตัวแทนท่องเที่ยว",
    "Tour Guides and Escorts": "มัคคุเทศก์",
    "Reservation and Transportation Ticket Agents and Travel Clerks": "เจ้าหน้าที่สำรองที่นั่งและตั๋วเดินทาง",
    "Meeting, Convention, and Event Planners": "นักจัดงานประชุมและอีเวนต์",
    "Chefs and Head Cooks": "เชฟและหัวหน้าครัว",
    "Cooks, Restaurant": "พ่อครัวแม่ครัวร้านอาหาร",
    "Food Service Managers": "ผู้จัดการร้านอาหาร",
    "First-Line Supervisors of Food Preparation and Serving Workers": "หัวหน้างานครัวและบริการอาหาร",
    "Food Preparation Workers": "ผู้ช่วยเตรียมอาหาร",
    "Bakers": "ช่างทำขนมปัง",
    "Dietetic Technicians": "ช่างเทคนิคโภชนาการ",
    "Food Scientists and Technologists": "นักวิทยาศาสตร์การอาหาร",
    "Food Science Technicians": "ช่างเทคนิควิทยาศาสตร์การอาหาร",
    # agriculture, animals, environment
    "Farmers, Ranchers, and Other Agricultural Managers": "เกษตรกรและผู้จัดการฟาร์ม",
    "Farmworkers and Laborers, Crop, Nursery, and Greenhouse": "คนงานเกษตรและเรือนเพาะชำ",
    "First-Line Supervisors of Farming, Fishing, and Forestry Workers": "หัวหน้างานเกษตร ประมง และป่าไม้",
    "Agricultural Technicians": "ช่างเทคนิคการเกษตร",
    "Agricultural Engineers": "วิศวกรเกษตร",
    "Agricultural Inspectors": "ผู้ตรวจสอบมาตรฐานสินค้าเกษตร",
    "Animal Scientists": "นักสัตวบาล",
    "Soil and Plant Scientists": "นักวิทยาศาสตร์ดินและพืช",
    "Fish and Game Wardens": "เจ้าพนักงานประมงและสัตว์ป่า",
    "Environmental Engineers": "วิศวกรสิ่งแวดล้อม",
    "Environmental Engineering Technologists and Technicians": "ช่างเทคนิควิศวกรรมสิ่งแวดล้อม",
    # arts, media
    "Graphic Designers": "นักออกแบบกราฟิก",
    "Fine Artists, Including Painters, Sculptors, and Illustrators": "ศิลปิน จิตรกร และนักวาดภาพประกอบ",
    "Craft Artists": "ช่างศิลปหัตถกรรม",
    "Special Effects Artists and Animators": "นักทำแอนิเมชันและเทคนิคพิเศษ",
    "Art Directors": "ผู้กำกับศิลป์",
    "Fashion Designers": "นักออกแบบแฟชั่น",
    "Actors": "นักแสดง",
    "Dancers": "นักเต้น",
    "Choreographers": "นักออกแบบท่าเต้น",
    "Music Directors and Composers": "ผู้อำนวยเพลงและนักประพันธ์เพลง",
    "Producers and Directors": "โปรดิวเซอร์และผู้กำกับ",
    "Media Programming Directors": "ผู้อำนวยการผังรายการ",
    "Audio and Video Technicians": "ช่างเทคนิคเสียงและภาพ",
    "Broadcast Technicians": "ช่างเทคนิคงานออกอากาศ",
    # teaching, language
    "Career/Technical Education Teachers, Postsecondary": "ครูอาชีวศึกษา ระดับหลังมัธยม",
    "Career/Technical Education Teachers, Middle School": "ครูการงานอาชีพ ระดับมัธยมต้น",
    "Middle School Teachers, Except Special and Career/Technical Education": "ครูมัธยมต้น",
    "Secondary School Teachers, Except Special and Career/Technical Education": "ครูมัธยมปลาย",
    "English Language and Literature Teachers, Postsecondary": "อาจารย์ภาษาและวรรณคดีอังกฤษ",
    "Foreign Language and Literature Teachers, Postsecondary": "อาจารย์ภาษาต่างประเทศ",
    "Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors":
        "ครูการศึกษาผู้ใหญ่และครูสอนภาษาอังกฤษ",
    "Interpreters and Translators": "ล่ามและนักแปล",
    # law, public
    "Lawyers": "ทนายความ",
    "Judicial Law Clerks": "เจ้าหน้าที่ศาล",
    "Administrative Law Judges, Adjudicators, and Hearing Officers": "ผู้พิจารณาคดีทางปกครอง",
    "Arbitrators, Mediators, and Conciliators": "อนุญาโตตุลาการและผู้ไกล่เกลี่ย",
    "Political Scientists": "นักรัฐศาสตร์",
    # health, science, care
    "Registered Nurses": "พยาบาลวิชาชีพ",
    "Nurse Practitioners": "พยาบาลเวชปฏิบัติ",
    "Nurse Midwives": "พยาบาลผดุงครรภ์",
    "Licensed Practical and Licensed Vocational Nurses": "ผู้ช่วยพยาบาล",
    "Massage Therapists": "นักนวดบำบัด",
    "Childcare Workers": "พี่เลี้ยงเด็ก",
    "Microbiologists": "นักจุลชีววิทยา",
    "Chemists": "นักเคมี",
    "Medical Scientists, Except Epidemiologists": "นักวิทยาศาสตร์การแพทย์",
}
