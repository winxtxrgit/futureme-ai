const concept={"id":1,"slug":"compass","name":"Compass Coach","thaiName":"เข็มทิศอนาคต","descriptor":"AI career discovery coach","headline":"ไม่ต้องรู้คำตอบทั้งหมด แค่เริ่มจากก้าวถัดไป","subhead":"คุยกับ AI Coach ลองภารกิจสั้น ๆ แล้วเห็น 3 เส้นทางเรียน–อาชีพที่อธิบายได้จากเรื่องจริงของคุณ","cta":"เริ่มค้นหาเส้นทาง","interaction":"Coach-led conversation with progressive disclosure and a single next-best action."};
const main=document.querySelector("#main");
const status=document.querySelector(".a11y-status");
const params=new URLSearchParams(location.search);
let page=params.get("page")||"landing";
if(params.get("mode")==="wireframe")document.body.classList.add("wireframe");

const disclosure=`แนวทางเหล่านี้เป็นข้อมูลเพื่อช่วยสำรวจจากคำตอบและหลักฐานที่คุณให้ ไม่ใช่คำทำนายหรือการรับประกันการเรียนต่อ อาชีพ หรือรายได้ โปรดตรวจสอบเกณฑ์ล่าสุดและพูดคุยกับครูแนะแนวหรือผู้ใหญ่ที่ไว้ใจ`;
const iconArrow=`<span aria-hidden="true">→</span>`;

function shell(content,extra=""){return `<div class="page-shell ${extra}">${content}</div>`}
function landing(){
  return shell(`
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">${concept.descriptor} · สำหรับนักเรียนไทย</span>
        <h1 id="hero-title">${concept.headline}</h1>
        <p class="lead">${concept.subhead}</p>
        <div class="button-row">
          <a class="button primary" href="?page=interview" data-page="interview">${concept.cta} ${iconArrow}</a>
          <a class="button secondary" href="?page=results" data-page="results">ดูตัวอย่างเส้นทาง</a>
        </div>
        <p class="trust-note">เริ่มแบบ Guest ได้ • ข้อมูลเป็นส่วนตัว • แก้ไขสิ่งที่ AI เข้าใจได้ทุกจุด</p>
      </div>
      <figure class="hero-media">
        <img src="../assets/hero-visual.png" alt="ภาพประกอบแนวคิด ${concept.name} แสดงนักเรียนกำลังสำรวจหลายเส้นทาง">
        <figcaption class="proof-card"><strong>3 เส้นทาง ไม่ใช่ 1 คำตอบ</strong><span>Balanced · Growth · Practical</span></figcaption>
      </figure>
    </div>
  </section>
  <section class="section" aria-labelledby="how-title">
    <div class="section-head"><span class="eyebrow">Reflect · Try · Compare · Plan</span><h2 id="how-title">เริ่มจากเรื่องจริง แล้วค่อยเปิดความเป็นไปได้</h2><p>Future Me ผสานบทสนทนา ภารกิจสั้น และข้อมูลเส้นทางการศึกษา เพื่อช่วยให้คุณตัดสินใจอย่างมีข้อมูลมากขึ้น</p></div>
    <div class="journey-grid">
      <article class="journey-card"><div class="step-num">01</div><h3>เล่า</h3><p>AI ถามแบบ Socratic และ STAR จากประสบการณ์จริง ไม่รีบติดป้ายอาชีพ</p><div class="evidence-strip"><span class="chip">เรื่องที่เคยทำ</span></div></article>
      <article class="journey-card"><div class="step-num">02</div><h3>ลอง</h3><p>เลือกภารกิจ 3–5 นาที เพื่อดูพลัง ความสนใจ และวิธีแก้ปัญหาจากการลงมือทำ</p><div class="evidence-strip"><span class="chip">หลักฐานภารกิจ</span></div></article>
      <article class="journey-card"><div class="step-num">03</div><h3>วางทาง</h3><p>เปรียบเทียบ 3 กลยุทธ์ พร้อมหลักฐาน ข้อแลกเปลี่ยน สิ่งที่ยังไม่รู้ และก้าวถัดไป</p><div class="evidence-strip"><span class="chip">แก้ไขได้</span><span class="chip">มีแหล่งข้อมูล</span></div></article>
    </div>
    <div class="disclaimer" role="note">${disclosure}</div>
  </section>`);
}

function interview(){
  return shell(`
  <header class="page-head"><div><span class="eyebrow">Discovery · 4 of 8</span><h1>เล่าเรื่องที่คุณเคยลงมือทำ</h1></div><p>คำถามจะปรับตามคำตอบของคุณ คุณหยุดพัก ลบ หรือแก้ไขสรุปได้ทุกเมื่อ</p></header>
  <div class="interview-layout">
    <section class="interview-main" aria-labelledby="prompt-title">
      <div class="progress-row"><span>บทสนทนา 42%</span><div class="progress-track" aria-label="ความคืบหน้า 42 เปอร์เซ็นต์"><div class="progress-fill"></div></div><button class="button ghost small" type="button">พักไว้ก่อน</button></div>
      <div class="coach-line"><span class="coach-avatar" aria-hidden="true"></span><div><strong>${concept.name} guide</strong><small>ถามทีละเรื่อง • ไม่ตัดสิน</small></div></div>
      <div class="chat-stack" id="chat">
        <div class="chat-bubble ai"><p>เมื่อกี้คุณบอกว่าชอบทำโปสเตอร์งานโรงเรียน เพราะได้ลองหลายแบบและเห็นคนใช้จริง ฟังถูกไหม?</p></div>
        <div class="chat-bubble user"><p>ใช่ โดยเฉพาะตอนแก้จากความคิดเห็นของเพื่อน</p></div>
      </div>
      <div class="prompt-card"><span class="eyebrow">STAR · Action</span><h2 id="prompt-title">ตอนที่ความคิดเห็นของเพื่อนไม่ตรงกัน คุณทำอะไรเป็นอย่างแรก?</h2></div>
      <div class="reply-options" aria-label="คำตอบลัด"><button class="reply-chip" type="button">ขอตัวอย่างเพิ่ม</button><button class="reply-chip" type="button">ยังนึกไม่ออก</button><button class="reply-chip" type="button">ตอบด้วยเสียง</button></div>
      <div class="input-row"><label class="a11y-status" for="reply">คำตอบของคุณ</label><textarea id="reply" placeholder="เล่าตามที่เกิดขึ้นจริง ไม่ต้องตอบให้ดูดี…"></textarea><button class="button primary send-reply" type="button" aria-label="ส่งคำตอบ">ส่ง</button></div>
    </section>
    <aside class="evidence-panel" aria-labelledby="evidence-title">
      <span class="eyebrow">แก้ไขได้เสมอ</span><h2 id="evidence-title" style="font-size:2rem">สิ่งที่เราเข้าใจ</h2>
      <div class="evidence-item"><strong>ทดลองหลายทางก่อนตัดสินใจ</strong><div class="evidence-meta"><span>เรื่องที่เล่า</span><button class="button ghost small" type="button">แก้ไข</button></div></div>
      <div class="evidence-item"><strong>เปิดรับข้อเสนอแนะ</strong><div class="evidence-meta"><span>STAR: Action</span><button class="button ghost small" type="button">แก้ไข</button></div></div>
      <div class="evidence-item"><strong>ยังต้องสำรวจ: ทำงานกับข้อจำกัดเวลา</strong><div class="evidence-meta"><span>หลักฐานยังไม่พอ</span><span>รอถาม</span></div></div>
      <p class="source-note">บันทึกเหล่านี้เป็นข้อมูลส่วนตัว ผู้ปกครองหรือครูจะไม่เห็นบทสนทนา เว้นแต่คุณเลือกแชร์โดยชัดเจน</p>
    </aside>
  </div>`);
}

const routeData=[
  {type:"Balanced Next Step",title:"UX/UI + Product Design",why:["ชอบทำไอเดียให้มองเห็นได้","ปรับงานจากความคิดเห็น","สนใจทั้งเทคโนโลยีและคน"],unknown:"ควรลองสัมภาษณ์ผู้ใช้จริง",next:"ลองภารกิจออกแบบ 20 นาที"},
  {type:"Interest Growth Route",title:"Creative Technology",why:["พลังสูงกับการทดลองหลายแบบ","สนใจเครื่องมือดิจิทัลใหม่","มีหลักฐานด้านการเล่าเรื่อง"],unknown:"ยังไม่รู้ว่าชอบเขียนโค้ดแค่ไหน",next:"ทำ interactive poster ชิ้นเล็ก"},
  {type:"Practical Access Route",title:"ปวช./ปวส. ดิจิทัลมีเดีย",why:["เรียนรู้จากการลงมือทำ","ต้องการผลงานใช้จริง","เปิดรับเส้นทางฝึกงาน"],unknown:"ต้องตรวจหลักสูตรและ DVE ในพื้นที่",next:"เยี่ยมชม Open House หรือคุยรุ่นพี่"}
];
function results(){
 const cards=routeData.map((r,i)=>`<article class="route-card ${i===0?"featured":""}"><span class="route-type">${r.type}</span><h2 style="font-size:2rem;margin:10px 0">${r.title}</h2><p class="route-score">หลักฐาน ${i===0?"4":"3"} ชิ้น · ไม่ใช่คะแนนความเหมาะสม</p><ul class="why-list">${r.why.map(x=>`<li>${x}</li>`).join("")}</ul><p><strong>สิ่งที่ยังไม่รู้:</strong> ${r.unknown}</p><p><strong>ก้าวลอง:</strong> ${r.next}</p><button class="button ${i===0?"primary":"secondary"} save-route" type="button">${i===0?"เปิดเส้นทาง":"บันทึกไว้เทียบ"}</button><p class="source-note">ตัวอย่างข้อมูล • ต้องตรวจสอบหลักสูตร/เกณฑ์ล่าสุดจากแหล่งทางการ</p></article>`).join("");
 return shell(`<header class="page-head"><div><span class="eyebrow">Possibilities · อัปเดตได้</span><h1>3 เส้นทางที่ควรลองสำรวจต่อ</h1></div><p>เราแยกเส้นทางตามกลยุทธ์ เพื่อให้เห็นทางเลือกและข้อแลกเปลี่ยน—not one “perfect match.”</p></header><div class="route-grid">${cards}</div><div class="disclaimer" role="note">${disclosure}</div>`);
}

function dashboard(){
 return shell(`<header class="page-head"><div><span class="eyebrow">สวัสดี มายด์</span><h1>วันนี้ลองอีกหนึ่งก้าว</h1></div><p>โปรไฟล์ของคุณเปลี่ยนได้เสมอเมื่อมีหลักฐานใหม่</p></header>
 <div class="dashboard-grid">
   <article class="card next-card mission-card"><span class="eyebrow">ภารกิจถัดไป · 12 นาที</span><h2>ออกแบบหน้าจอเช็กอินชมรม</h2><p>ลองจัดข้อมูลให้เพื่อนเข้าใจง่าย แล้วสะท้อนว่าช่วงไหนทำให้คุณมีพลัง</p><button class="button secondary" type="button">เริ่มภารกิจ ${iconArrow}</button></article>
   <article class="card evidence-card"><span class="metric-label">Evidence profile</span><div class="progress-ring" aria-label="หลักฐานครบ 62 เปอร์เซ็นต์"></div><p>เพิ่มอีก 1 ภารกิจเพื่อแยก Design กับ Creative Technology</p></article>
   <article class="card saved-count-card"><span class="metric-label">เส้นทางที่บันทึก</span><div class="metric">03</div><p>อัปเดตข้อมูลล่าสุดวันนี้</p><a href="?page=results" data-page="results">เปิดเปรียบเทียบ →</a></article>
   <article class="card plan-card"><span class="eyebrow">Roadmap 30 วัน</span><h3>สร้าง mini case study จากปัญหาในโรงเรียน</h3><div class="saved-list"><div class="saved-row"><span>สัมภาษณ์เพื่อน 2 คน<small>หลักฐานด้านการฟัง</small></span><strong>วันนี้</strong></div><div class="saved-row"><span>ร่างหน้าจอ 3 แบบ<small>ภารกิจทดลอง</small></span><strong>สัปดาห์ 1</strong></div></div></article>
   <article class="card sharing-card"><span class="eyebrow">การแชร์</span><h3>ส่วนตัวอยู่</h3><p>ยังไม่มีผู้ปกครองหรือครูเข้าถึงสรุปของคุณ</p><button class="button ghost small" type="button">จัดการสิทธิ์</button></article>
 </div>`);
}

function roadmap(){
 const node=(state,num,title,body,action="")=>`<article class="roadmap-node ${state}"><div class="node-dot">${num}</div><div><span class="node-state">${state==="done"?"ทำแล้ว":state==="active"?"กำลังลอง":"ถัดไป"}</span><h3>${title}</h3><p>${body}</p></div>${action?`<button class="button primary small" type="button">${action}</button>`:""}</article>`;
 return shell(`<header class="page-head"><div><span class="eyebrow">Editable DAG · 30-day view</span><h1>เส้นทางนี้เริ่มจากการทดลอง ไม่ใช่การผูกมัด</h1></div><p>แต่ละขั้นแสดงสิ่งที่ต้องทำก่อน คุณเปลี่ยนเป้าหมายหรือเปิดทางเลือกสำรองได้</p></header>
 <div class="roadmap" aria-label="แผนเส้นทางส่วนตัว">
 ${node("done","✓","สถานะวันนี้","ม.5 วิทย์–คณิต · สนใจงานออกแบบและเทคโนโลยี")}
 <div class="roadmap-line"></div>
 ${node("active","1","ภารกิจ 30 วัน","สร้าง mini UX case study จากปัญหาในโรงเรียน","ทำต่อ")}
 <div class="roadmap-line"></div>
 <div class="branch-row">${node("","A","ทาง A · Portfolio","ออกแบบและทดสอบต้นแบบ 1 ชิ้น")}${node("","B","ทาง B · Practical","ลองคอร์สดิจิทัลมีเดียและ Open House")}</div>
 <div class="roadmap-line"></div>
 ${node("","2","เตรียมเส้นทางเรียน","เปรียบเทียบหลักสูตร เกณฑ์รับสมัคร เวลา ค่าใช้จ่าย และทางเลือกอาชีวะ")}
 <div class="roadmap-line"></div>
 ${node("","3","สร้างหลักฐานเพิ่ม","โปรเจกต์ ทีม และการพูดคุยกับคนทำงานจริง")}
 <div class="roadmap-line"></div>
 ${node("","4","ทบทวนเป้าหมาย","อัปเดตเส้นทางจากประสบการณ์ใหม่—not a fixed destination")}
 </div><div class="disclaimer" role="note">${disclosure}</div>`);
}

const renderers={landing,interview,results,dashboard,roadmap};
function render(next){
 page=renderers[next]?next:"landing";
 main.innerHTML=renderers[page]();
 document.title=`${concept.name} — ${page}`;
 document.querySelectorAll("[data-page]").forEach(a=>{a.toggleAttribute("aria-current",a.dataset.page===page)});
 bind();
 window.scrollTo({top:0,behavior:"instant"});
}
function navigate(next){
 const q=new URLSearchParams(location.search);q.set("page",next);history.pushState({page:next},"",`?${q}`);render(next);
}
function bind(){
 document.querySelectorAll("[data-page]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();navigate(a.dataset.page)}));
 document.querySelectorAll(".reply-chip").forEach(b=>b.addEventListener("click",()=>{document.querySelector("#reply").value=b.textContent==="ยังนึกไม่ออก"?"ยังนึกเหตุการณ์ไม่ออก ช่วยยกตัวอย่างเปรียบเทียบได้ไหม":"";document.querySelector("#reply").focus()}));
 const send=document.querySelector(".send-reply");if(send)send.addEventListener("click",()=>{const input=document.querySelector("#reply");const text=input.value.trim()||"เราเริ่มจากถามเพื่อนแต่ละคนว่าอะไรสำคัญ แล้วทำแบบกลางที่ทุกคนลองใช้ได้";document.querySelector("#chat").insertAdjacentHTML("beforeend",`<div class="chat-bubble user"><p>${text.replace(/[<>]/g,"")}</p></div>`);input.value="";status.textContent="ส่งคำตอบแล้ว และเพิ่มเป็นหลักฐานที่แก้ไขได้"});
 document.querySelectorAll(".save-route").forEach(b=>b.addEventListener("click",()=>{b.textContent="บันทึกแล้ว ✓";status.textContent="บันทึกเส้นทางแล้ว"}));
}
window.addEventListener("popstate",()=>render(new URLSearchParams(location.search).get("page")||"landing"));
render(page);

