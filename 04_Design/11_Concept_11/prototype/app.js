const main = document.querySelector("#main");
const statusRegion = document.querySelector(".sr-status");
const themeToggle = document.querySelector(".theme-toggle");
const params = new URLSearchParams(window.location.search);
let currentPage = params.get("page") || "landing";

const disclosure = "แนวทางเหล่านี้เป็นข้อมูลเพื่อช่วยสำรวจจากคำตอบ หลักฐาน และข้อจำกัดที่คุณให้ ไม่ใช่คำทำนายหรือการรับประกันการเรียนต่อ อาชีพ รายได้ หรือความสำเร็จ โปรดตรวจเกณฑ์ล่าสุดจากแหล่งทางการ และพูดคุยกับครูแนะแนวหรือผู้ใหญ่ที่คุณไว้ใจเมื่อจะตัดสินใจสำคัญ";

if (params.get("mode") === "wireframe") {
  document.body.classList.add("wireframe");
}
if (params.get("capture") === "mobile") {
  document.body.classList.add("capture-mobile");
}

function getSavedTheme() {
  try {
    return localStorage.getItem("aurora-theme");
  } catch {
    return null;
  }
}

function setTheme(theme, announce = false) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeToggle.querySelector(".theme-icon").textContent = next === "dark" ? "☼" : "☾";
  themeToggle.setAttribute("aria-label", next === "dark" ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", next === "dark" ? "#0B0B14" : "#F7F6FB");
  try {
    localStorage.setItem("aurora-theme", next);
  } catch {
    // Prototype still works when browser storage is unavailable.
  }
  if (announce) announceStatus(next === "dark" ? "เปลี่ยนเป็นโหมดมืดแล้ว" : "เปลี่ยนเป็นโหมดสว่างแล้ว");
}

setTheme(params.get("theme") || getSavedTheme() || "dark");

function announceStatus(message) {
  statusRegion.textContent = "";
  window.setTimeout(() => {
    statusRegion.textContent = message;
  }, 20);
}

function shell(content, extraClass = "") {
  return `<div class="page-shell ${extraClass}">${content}</div>`;
}

function landing() {
  return shell(`
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid">
        <div class="hero-copy">
          <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>สำหรับนักเรียนไทย · ส่วนตัวโดยค่าเริ่มต้น</span>
          <h1 id="hero-title">อนาคตไม่ได้มี<br><span class="gradient-text">คำตอบเดียว</span></h1>
          <p class="lead">คุยจากเรื่องจริง ลองภารกิจสั้น และเทียบ 3 เส้นทางที่อธิบายได้—ก่อนเลือกก้าวถัดไปของคุณ</p>
          <div class="button-row">
            <a class="button primary" href="?page=interview" data-page="interview">เริ่มค้นหาแบบ Guest <span aria-hidden="true">↗</span></a>
            <a class="button secondary" href="?page=results" data-page="results">ดูตัวอย่าง 3 เส้นทาง</a>
          </div>
          <p class="trust-inline">แก้สิ่งที่ AI เข้าใจได้ทุกจุด · ไม่มีคะแนนจัดอันดับ · แชร์เมื่อคุณอนุญาต</p>
        </div>

        <figure class="hero-visual" aria-labelledby="hero-caption">
          <div class="hero-frame">
            <img src="../assets/hero-visual.png" alt="นักเรียนไทยกำลังสำรวจภาพอนาคตหลายสาขาผ่านการ์ดเรืองแสง">
          </div>
          <figcaption id="hero-caption" class="orbit-card one">
            <div class="route-dots" aria-hidden="true"><i></i><i></i><i></i></div>
            <strong>3 เส้นทาง ไม่ใช่ 1 คำตอบ</strong>
            <small>พร้อมเหตุผลและสิ่งที่ยังไม่รู้</small>
          </figcaption>
          <div class="orbit-card two" aria-hidden="true">
            <strong>ภารกิจถัดไป · 12 นาที</strong>
            <small>ลองก่อน แล้วค่อยเลือก</small>
          </div>
        </figure>
      </div>
    </section>

    <section class="section" aria-labelledby="journey-title">
      <header class="section-head">
        <span class="eyebrow">REFLECT · TRY · COMPARE · PLAN</span>
        <h2 id="journey-title">เริ่มจากเรื่องจริง แล้วค่อยเปิดความเป็นไปได้</h2>
        <p>ไม่ต้องรู้คำตอบตั้งแต่วันแรก ทุกขั้นสร้างหลักฐานที่คุณตรวจ แก้ และเลือกใช้ได้เอง</p>
      </header>

      <div class="journey-bento">
        <article class="journey-card glass">
          <div class="journey-number">01</div>
          <h3>คุย</h3>
          <p>เล่าเรื่องที่เคยทำผ่านคำถามทีละเรื่อง ไม่ต้องตอบให้ดูดี</p>
        </article>
        <article class="journey-card glass">
          <div class="journey-number">02</div>
          <h3>ลอง</h3>
          <p>ภารกิจ 3–12 นาทีช่วยแยกสิ่งที่สนใจจากสิ่งที่ลงมือแล้วมีพลัง</p>
        </article>
        <article class="journey-card glass">
          <div class="journey-number">03</div>
          <h3>เทียบ</h3>
          <p>ดู 3 ทางพร้อมข้อแลกเปลี่ยน หลักฐาน และคำถามที่ยังเปิดอยู่</p>
        </article>
        <article class="journey-card glass">
          <div class="journey-number">04</div>
          <h3>วางแผน</h3>
          <p>เลือกการทดลอง 30 วันที่แก้ เปลี่ยนทาง หรือหยุดพักได้เสมอ</p>
        </article>
      </div>
    </section>

    <section class="future-card glass" aria-labelledby="future-title">
      <div class="future-copy">
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>FUTURE SELF · CONDITIONAL</span>
        <h2 id="future-title">เห็นภาพอนาคต<br>โดยไม่ฟันธงอนาคต</h2>
        <p>Future Me สร้างภาพจำลองจากสมมติฐานของคุณ พร้อมทางเลือกสำรองและสิ่งที่ต้องลองต่อ ไม่ใช่คำทำนาย</p>
        <a class="button secondary" href="?page=roadmap" data-page="roadmap">เปิด Roadmap ตัวอย่าง</a>
      </div>
      <div class="future-preview">
        <span class="mini-label">ถ้าคุณยังมีพลังกับการฟังผู้ใช้…</span>
        <strong>คุณอาจลองสร้าง mini UX case study ใน 30 วัน</strong>
        <small>สมมติฐาน 3 ข้อ · ทางเลือกสำรอง 1 ทาง · เปลี่ยนได้</small>
      </div>
    </section>

    <aside class="disclaimer" role="note">${disclosure}</aside>
  `);
}

function interview() {
  return shell(`
    <header class="page-head">
      <div>
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>DISCOVERY · 4 จาก 8</span>
        <h1>เล่าเรื่องที่คุณ<br><span class="gradient-text">เคยลงมือทำ</span></h1>
      </div>
      <p>ฉันช่วยตั้งคำถามและสรุปหลักฐาน ไม่ใช่ผู้ตัดสินอนาคตของคุณ คุณหยุด แก้ หรือลบได้ทุกเมื่อ</p>
    </header>

    <div class="interview-layout">
      <section class="interview-main glass" aria-labelledby="prompt-title">
        <div class="progress-row">
          <span>บทสนทนา 44%</span>
          <div class="progress-track" role="progressbar" aria-label="ความคืบหน้าบทสนทนา" aria-valuemin="0" aria-valuemax="100" aria-valuenow="44"><div class="progress-fill"></div></div>
          <button class="button ghost small pause-button" type="button">พักไว้ก่อน</button>
        </div>

        <div class="coach-row">
          <span class="coach-avatar" aria-hidden="true"></span>
          <div><strong>Aurora guide</strong><small>ถามทีละเรื่อง · ไม่ตัดสิน · แก้ได้</small></div>
        </div>

        <div class="chat-stack" id="chat-thread">
          <div class="chat-bubble">
            <span class="speaker">AURORA GUIDE</span>
            <p>เมื่อกี้คุณบอกว่าชอบทำโปสเตอร์งานโรงเรียน เพราะได้ลองหลายแบบและเห็นคนใช้จริง ฟังถูกไหม?</p>
          </div>
          <div class="chat-bubble user">
            <span class="speaker">คุณ</span>
            <p>ใช่ โดยเฉพาะตอนแก้จากความคิดเห็นของเพื่อน</p>
          </div>
        </div>

        <div class="prompt-card">
          <span>STAR · ACTION</span>
          <h2 id="prompt-title">ตอนที่ความคิดเห็นของเพื่อนไม่ตรงกัน คุณทำอะไรเป็นอย่างแรก?</h2>
        </div>

        <div class="quick-replies" aria-label="ตัวเลือกช่วยตอบ">
          <button class="quick-reply" type="button" data-reply="ช่วยยกตัวอย่างสถานการณ์ให้หน่อย">ขอตัวอย่าง</button>
          <button class="quick-reply" type="button" data-reply="ยังนึกเหตุการณ์ไม่ออก ช่วยถามอีกแบบได้ไหม">ยังนึกไม่ออก</button>
          <button class="quick-reply voice-reply" type="button">ตอบด้วยเสียง</button>
        </div>

        <div class="composer">
          <label class="sr-status" for="reply-input">คำตอบของคุณ</label>
          <textarea id="reply-input" placeholder="เล่าตามที่เกิดขึ้นจริง ไม่ต้องตอบให้ดูดี…"></textarea>
          <button class="button primary send-reply" type="button" aria-label="ส่งคำตอบ">ส่ง</button>
        </div>
      </section>

      <aside class="evidence-panel glass" aria-labelledby="evidence-title">
        <span class="eyebrow">แก้ได้เสมอ</span>
        <h2 id="evidence-title">สิ่งที่เราเข้าใจ</h2>
        <p class="panel-intro">ข้อสรุปชั่วคราวจากเรื่องที่คุณเล่า ไม่ใช่คะแนนบุคลิก</p>

        <div class="evidence-row">
          <strong>ทดลองหลายทางก่อนตัดสินใจ</strong>
          <div class="evidence-foot"><span class="status-chip">มีหลักฐาน</span><button class="text-button correct-evidence" type="button">แก้ไข</button></div>
        </div>
        <div class="evidence-row">
          <strong>เปิดรับข้อเสนอแนะ</strong>
          <div class="evidence-foot"><span>ที่มา: เรื่องโปสเตอร์</span><button class="text-button correct-evidence" type="button">แก้ไข</button></div>
        </div>
        <div class="evidence-row">
          <strong>ทำงานภายใต้เวลาจำกัด</strong>
          <div class="evidence-foot"><span class="status-chip">ยังไม่พอ</span><span>รอสำรวจ</span></div>
        </div>

        <div class="human-card">
          <p>อยากคิดต่อกับคนจริง? เราเตรียมสรุปที่ไม่รวมบทสนทนาดิบให้คุณตรวจได้</p>
          <button class="button ghost small human-button" type="button">คุยกับครูแนะแนว</button>
        </div>
        <p class="source-note">บทสนทนาเป็นส่วนตัว ผู้ปกครองหรือครูจะไม่เห็น เว้นแต่คุณเลือกแชร์อย่างชัดเจน</p>
      </aside>
    </div>
  `);
}

const routes = [
  {
    strategy: "BALANCED NEXT STEP · ทางที่สมดุล",
    title: "UX/UI + Product Design",
    meta: "หลักฐาน 4 ชิ้น · ไม่ใช่คะแนนความเหมาะสม",
    color: "var(--indigo)",
    reasons: ["ชอบทำไอเดียให้มองเห็นได้", "ปรับงานจากความคิดเห็น", "สนใจทั้งเทคโนโลยีและคน"],
    unknown: "ยังควรลองสัมภาษณ์ผู้ใช้จริง",
    next: "ทำภารกิจออกแบบ 20 นาที",
    featured: true
  },
  {
    strategy: "INTEREST GROWTH · ทางขยายความสนใจ",
    title: "Creative Technology",
    meta: "หลักฐาน 3 ชิ้น · มีคำถามเปิด 2 ข้อ",
    color: "var(--magenta)",
    reasons: ["มีพลังกับการทดลองหลายแบบ", "สนใจเครื่องมือดิจิทัลใหม่", "มีหลักฐานการเล่าเรื่อง"],
    unknown: "ยังไม่รู้ว่าชอบเขียนโค้ดแค่ไหน",
    next: "ทำ interactive poster ชิ้นเล็ก"
  },
  {
    strategy: "PRACTICAL ACCESS · ทางลงมือและเข้าถึงได้",
    title: "ปวช./ปวส. ดิจิทัลมีเดีย",
    meta: "หลักฐาน 3 ชิ้น · ต้องตรวจข้อมูลพื้นที่",
    color: "var(--coral)",
    reasons: ["เรียนรู้จากการลงมือทำ", "อยากมีผลงานใช้จริง", "เปิดรับเส้นทางฝึกงาน"],
    unknown: "ต้องตรวจหลักสูตรและ DVE ในพื้นที่",
    next: "เยี่ยม Open House หรือคุยรุ่นพี่"
  }
];

function results() {
  const cards = routes.map((route, index) => `
    <article class="route-card glass ${route.featured ? "featured" : ""}" style="--route-color:${route.color}">
      <span class="route-strategy">${route.strategy}</span>
      <h2>${route.title}</h2>
      <p class="route-meta">${route.meta}</p>
      <button class="text-button evidence-link" type="button">ทำไมจึงเสนอทางนี้</button>
      <ul class="evidence-list">
        ${route.reasons.map(reason => `<li>${reason}</li>`).join("")}
      </ul>
      <div class="unknown-box"><strong>สิ่งที่ยังไม่รู้</strong>${route.unknown}</div>
      <div class="unknown-box"><strong>ก้าวลองที่ย้อนกลับได้</strong>${route.next}</div>
      <button class="button ${index === 0 ? "primary" : "secondary"} save-route" type="button">${index === 0 ? "เปิดรายละเอียด" : "บันทึกไว้เทียบ"}</button>
      <p class="source-note">ตัวอย่างข้อมูล · ต้องตรวจหลักสูตรและเกณฑ์ล่าสุดจากแหล่งทางการ</p>
    </article>
  `).join("");

  return shell(`
    <header class="page-head">
      <div>
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>POSSIBILITIES · อัปเดตได้</span>
        <h1>3 เส้นทางที่ควร<br><span class="gradient-text">ลองสำรวจต่อ</span></h1>
      </div>
      <p>แต่ละทางคือกลยุทธ์คนละแบบ ไม่ใช่อันดับ เราแสดงเหตุผล ข้อแลกเปลี่ยน และสิ่งที่ยังไม่รู้ไว้ด้วยกัน</p>
    </header>
    <div class="route-grid">${cards}</div>
    <aside class="disclaimer" role="note">${disclosure}</aside>
  `);
}

function dashboard() {
  return shell(`
    <header class="page-head">
      <div>
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>สวัสดี มายด์ · PRIVATE SPACE</span>
        <h1>วันนี้ลองอีก<br><span class="gradient-text">หนึ่งก้าว</span></h1>
      </div>
      <p>โปรไฟล์ของคุณเปลี่ยนได้เสมอเมื่อมีหลักฐานใหม่ ไม่มี streak และไม่มีใครถูกจัดอันดับ</p>
    </header>

    <div class="dashboard-grid">
      <article class="dashboard-card mission-card glass">
        <span class="eyebrow">ภารกิจถัดไป · 12 นาที</span>
        <h2>ออกแบบหน้าจอเช็กอินชมรม</h2>
        <p>ลองจัดข้อมูลให้เพื่อนเข้าใจง่าย แล้วสะท้อนว่าช่วงไหนทำให้คุณมีพลังหรือหมดพลัง</p>
        <button class="button primary mission-button" type="button">เริ่มภารกิจ <span aria-hidden="true">↗</span></button>
      </article>

      <article class="dashboard-card evidence-card glass">
        <span class="metric-label">หลักฐานที่มี</span>
        <div class="evidence-meter" role="img" aria-label="มีหลักฐานครอบคลุม 62 เปอร์เซ็นต์"><strong>62%</strong></div>
        <p>เพิ่มอีก 1 ภารกิจเพื่อแยก Design กับ Creative Technology</p>
      </article>

      <article class="dashboard-card saved-card glass">
        <span class="metric-label">เส้นทางที่บันทึก</span>
        <div class="metric">03</div>
        <p>UX/UI · Creative Tech · Digital Media</p>
        <a href="?page=results" data-page="results">เปิดเปรียบเทียบ →</a>
      </article>

      <article class="dashboard-card roadmap-card glass">
        <span class="eyebrow">ROADMAP · 30 วัน</span>
        <h2 style="font-size:2rem">สร้าง mini case study จากปัญหาในโรงเรียน</h2>
        <div class="check-list">
          <label class="check-row"><input type="checkbox" checked><span>เลือกปัญหาที่อยากแก้<small>เสร็จแล้ว · หลักฐานด้านการสังเกต</small></span></label>
          <label class="check-row"><input type="checkbox"><span>สัมภาษณ์เพื่อน 2 คน<small>วันนี้ · 15 นาที</small></span></label>
          <label class="check-row"><input type="checkbox"><span>ร่างหน้าจอ 3 แบบ<small>สัปดาห์ 1 · เปลี่ยนได้</small></span></label>
        </div>
        <a class="button secondary small" href="?page=roadmap" data-page="roadmap" style="margin-top:15px">เปิด Roadmap</a>
      </article>

      <article class="dashboard-card privacy-card glass">
        <span class="privacy-badge">ยังเป็นส่วนตัว</span>
        <h3 style="margin-top:12px">คุณเป็นคนเลือกสิ่งที่แชร์</h3>
        <p>ยังไม่มีผู้ปกครองหรือครูเข้าถึงสรุปของคุณ</p>
        <button class="button ghost small privacy-button" type="button">จัดการสิทธิ์</button>
      </article>
    </div>
  `);
}

function roadmapNode(state, number, title, body, action = "") {
  const stateText = state === "done" ? "ทำแล้ว" : state === "active" ? "กำลังลอง" : "ก้าวถัดไป";
  return `
    <article class="roadmap-node glass ${state}">
      <div class="node-dot">${number}</div>
      <div class="node-copy">
        <span class="node-state">${stateText}</span>
        <h3>${title}</h3>
        <p>${body}</p>
      </div>
      ${action ? `<button class="button primary small roadmap-action" type="button">${action}</button>` : ""}
    </article>
  `;
}

function roadmap() {
  return shell(`
    <header class="page-head">
      <div>
        <span class="eyebrow"><span class="live-dot" aria-hidden="true"></span>EDITABLE PATH · 30 DAYS</span>
        <h1>เริ่มจากการทดลอง<br><span class="gradient-text">ไม่ใช่การผูกมัด</span></h1>
      </div>
      <p>แต่ละขั้นบอกสิ่งที่ต้องทำก่อน คุณเปลี่ยนเป้าหมาย เปิดทางสำรอง หรือพักได้โดยไม่เสียความคืบหน้า</p>
    </header>

    <div class="roadmap-wrap">
      <div class="roadmap" aria-label="Roadmap ส่วนตัว">
        ${roadmapNode("done", "✓", "สถานะวันนี้", "ม.5 วิทย์–คณิต · สนใจงานออกแบบและเทคโนโลยี")}
        <div class="roadmap-line" aria-hidden="true"></div>
        ${roadmapNode("active", "1", "ภารกิจ 30 วัน", "สร้าง mini UX case study จากปัญหาในโรงเรียน", "เช็กอิน")}
        <div class="roadmap-line" aria-hidden="true"></div>
        <div class="branch-grid" aria-label="สองทางเลือก">
          ${roadmapNode("", "A", "ทาง A · Portfolio", "ออกแบบและทดสอบต้นแบบ 1 ชิ้น")}
          ${roadmapNode("", "B", "ทาง B · Practical", "ลองคอร์สดิจิทัลมีเดียและ Open House")}
        </div>
        <div class="roadmap-line" aria-hidden="true"></div>
        ${roadmapNode("", "2", "เตรียมเส้นทางเรียน", "เทียบหลักสูตร เกณฑ์รับสมัคร เวลา ค่าใช้จ่าย และเส้นทางอาชีวะ")}
        <div class="roadmap-line" aria-hidden="true"></div>
        ${roadmapNode("", "3", "สร้างหลักฐานเพิ่ม", "ทำโปรเจกต์ทีมและคุยกับคนทำงานจริง")}
        <div class="roadmap-line" aria-hidden="true"></div>
        ${roadmapNode("", "4", "ทบทวนเป้าหมาย", "อัปเดตจากประสบการณ์ใหม่ ไม่ใช่ปลายทางตายตัว")}
      </div>

      <aside class="future-aside glass" aria-labelledby="future-aside-title">
        <span class="eyebrow">FUTURE SELF</span>
        <h2 id="future-aside-title" style="font-size:1.8rem">ภาพหนึ่งที่คุณอาจลองไปหา</h2>
        <p>ถ้าคุณยังมีพลังกับการฟังผู้ใช้ และสร้างผลงานต่อเนื่อง คุณอาจลองบทบาท Junior Product Designer ได้</p>
        <ul class="assumptions">
          <li>ทดลองสัมภาษณ์คนจริง</li>
          <li>สนุกกับการแก้จาก feedback</li>
          <li>มีช่องทางเรียนและทำ portfolio</li>
        </ul>
        <button class="button secondary small assumptions-button" type="button">ดูทางเลือก B</button>
        <p class="source-note">ภาพจำลองจากสมมติฐาน · ไม่ใช่คำทำนายหรือการรับประกัน</p>
      </aside>
    </div>
    <aside class="disclaimer" role="note">${disclosure}</aside>
  `);
}

const renderers = { landing, interview, results, dashboard, roadmap };

function bindPageEvents() {
  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      navigate(link.dataset.page);
    });
  });

  document.querySelectorAll(".quick-reply[data-reply]").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.querySelector("#reply-input");
      input.value = button.dataset.reply;
      input.focus();
    });
  });

  document.querySelector(".voice-reply")?.addEventListener("click", () => {
    announceStatus("ต้นแบบนี้แสดงตำแหน่งการตอบด้วยเสียง แต่ยังไม่เปิดไมโครโฟน");
  });

  document.querySelector(".send-reply")?.addEventListener("click", () => {
    const input = document.querySelector("#reply-input");
    const fallback = "เราเริ่มจากถามแต่ละคนว่าอะไรสำคัญ แล้วทำแบบกลางให้ทุกคนลองใช้";
    const message = (input.value.trim() || fallback).replace(/[<>]/g, "");
    document.querySelector("#chat-thread").insertAdjacentHTML("beforeend", `
      <div class="chat-bubble user">
        <span class="speaker">คุณ</span>
        <p>${message}</p>
      </div>
    `);
    input.value = "";
    announceStatus("ส่งคำตอบแล้ว และจะเพิ่มเป็นหลักฐานชั่วคราวที่แก้ไขได้");
  });

  document.querySelectorAll(".correct-evidence").forEach(button => {
    button.addEventListener("click", () => {
      button.textContent = "เปิดให้แก้แล้ว";
      announceStatus("เปิดรายการหลักฐานให้แก้ไขแล้ว");
    });
  });

  document.querySelectorAll(".save-route").forEach(button => {
    button.addEventListener("click", () => {
      button.textContent = "บันทึกแล้ว ✓";
      announceStatus("บันทึกเส้นทางไว้เปรียบเทียบแล้ว");
    });
  });

  document.querySelectorAll(".check-row input").forEach(input => {
    input.addEventListener("change", () => {
      announceStatus(input.checked ? "ทำเครื่องหมายงานเสร็จแล้ว" : "ยกเลิกเครื่องหมายเสร็จแล้ว");
    });
  });

  document.querySelector(".pause-button")?.addEventListener("click", () => announceStatus("บันทึกจุดปัจจุบันไว้แล้ว กลับมาต่อได้โดยไม่มี streak"));
  document.querySelector(".human-button")?.addEventListener("click", () => announceStatus("เปิดขั้นตอนเตรียมสรุปสำหรับครูแนะแนว โดยไม่รวมบทสนทนาดิบ"));
  document.querySelector(".mission-button")?.addEventListener("click", () => announceStatus("ภารกิจตัวอย่างพร้อมเริ่ม ระยะเวลาโดยประมาณ 12 นาที"));
  document.querySelector(".privacy-button")?.addEventListener("click", () => announceStatus("เปิดศูนย์จัดการผู้รับ ข้อมูล และวันหมดอายุของการแชร์"));
  document.querySelector(".roadmap-action")?.addEventListener("click", event => {
    event.currentTarget.textContent = "เช็กอินแล้ว ✓";
    announceStatus("บันทึกการเช็กอิน Roadmap แล้ว");
  });
  document.querySelector(".assumptions-button")?.addEventListener("click", event => {
    event.currentTarget.textContent = "ทาง B · ดิจิทัลมีเดีย + ฝึกงาน";
    announceStatus("แสดงทางเลือกสำรอง B แล้ว");
  });
  document.querySelectorAll(".evidence-link").forEach(button => {
    button.addEventListener("click", () => announceStatus("เหตุผลสามรายการใต้ปุ่มมาจากเรื่องเล่าและภารกิจที่ผู้ใช้ยืนยันแล้ว"));
  });
}

function render(pageName, focusMain = false) {
  currentPage = renderers[pageName] ? pageName : "landing";
  main.innerHTML = renderers[currentPage]();
  document.title = `Aurora — ${currentPage} · Future Me`;

  document.querySelectorAll("[data-page]").forEach(link => {
    link.toggleAttribute("aria-current", link.dataset.page === currentPage);
  });

  bindPageEvents();
  window.scrollTo({ top: 0, behavior: "instant" });
  if (focusMain) main.focus();
}

function navigate(pageName) {
  const query = new URLSearchParams(window.location.search);
  query.set("page", pageName);
  history.pushState({ page: pageName }, "", `?${query.toString()}`);
  render(pageName, true);
}

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
});

window.addEventListener("popstate", () => {
  render(new URLSearchParams(window.location.search).get("page") || "landing", true);
});

render(currentPage);
