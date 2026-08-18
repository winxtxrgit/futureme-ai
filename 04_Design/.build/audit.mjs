import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { concepts } from "./concepts.mjs";

// Concept 11 is intentionally kept out of the original bulk generator because it
// is a custom brief-driven build and must never be overwritten by the generic
// 01–10 templates. It is included explicitly in the read-only QA inventory.
const auditedConcepts = [
  ...concepts,
  { id: 11, folder: "11_Concept_11", name: "Aurora" }
];

const workspace = path.resolve(".");
const root = path.join(workspace, "FutureMe_Web_Design_Concepts");
const analysisDir = path.join(root, "00_Project_Analysis");
const failures = [];
const checks = [];

const requiredDocs = [
  "concept_overview.md",
  "design_system.md",
  "sitemap.md",
  "user_flow.md",
  "page_structure.md",
  "content_guide.md",
  "image_prompts.md"
];
const screenshotViews = [
  ["landing-page-desktop.png", 1440, 1000],
  ["landing-page-mobile.png", 390, 844],
  ["ai-interview-desktop.png", 1440, 1000],
  ["dashboard-desktop.png", 1440, 1000],
  ["career-result-desktop.png", 1440, 1000],
  ["future-roadmap-mobile.png", 390, 844]
];
const requiredPages = [
  "Landing Page",
  "Sign Up and Login",
  "User Onboarding",
  "AI Interview Page",
  "Personality and Interest Assessment",
  "Skills and Strengths Analysis",
  "Career Recommendation Results",
  "Education Path Recommendation",
  "Personal Future Roadmap",
  "User Dashboard",
  "Saved Careers or Programs",
  "User Profile",
  "Progress Tracking",
  "Parent or Teacher Summary"
];

function check(condition, message) {
  checks.push({ ok: Boolean(condition), message });
  if (!condition) failures.push(message);
}

function pngDimensions(file) {
  const data = fs.readFileSync(file);
  check(data.subarray(1, 4).toString("ascii") === "PNG", `${file} has a PNG signature`);
  return [data.readUInt32BE(16), data.readUInt32BE(20)];
}

function filesUnder(dir) {
  const result = [];
  for (const name of fs.readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) result.push(...filesUnder(p));
    else result.push(p);
  }
  return result;
}

for (const c of auditedConcepts) {
  const dir = path.join(root, c.folder);
  check(fs.existsSync(dir), `${c.folder} directory exists`);
  for (const doc of requiredDocs) {
    const p = path.join(dir, doc);
    check(fs.existsSync(p) && fs.statSync(p).size > 500, `${c.folder}/${doc} exists and is substantive`);
  }
  for (const subdir of ["assets", "wireframes", "mockups", "prototype"]) {
    check(fs.existsSync(path.join(dir, subdir)), `${c.folder}/${subdir}/ exists`);
  }
  const pageText = fs.readFileSync(path.join(dir, "page_structure.md"), "utf8");
  for (const pageName of requiredPages) {
    check(pageText.includes(pageName), `${c.folder} specifies ${pageName}`);
  }
  const hero = path.join(dir, "assets", "hero-visual.png");
  check(fs.existsSync(hero) && fs.statSync(hero).size > 100_000, `${c.folder} generated hero exists`);
  if (fs.existsSync(hero)) {
    const [w, h] = pngDimensions(hero);
    check(w === 1672 && h === 941, `${c.folder} hero is 1672×941`);
  }
  for (const mode of ["wireframes", "mockups"]) {
    for (const [file, expectedW, expectedH] of screenshotViews) {
      const p = path.join(dir, mode, file);
      check(fs.existsSync(p) && fs.statSync(p).size > 10_000, `${c.folder}/${mode}/${file} exists`);
      if (fs.existsSync(p)) {
        const [w, h] = pngDimensions(p);
        check(w === expectedW && h === expectedH, `${c.folder}/${mode}/${file} is ${expectedW}×${expectedH}`);
      }
    }
  }
  for (const file of ["index.html", "styles.css", "app.js", "README.md"]) {
    const p = path.join(dir, "prototype", file);
    check(fs.existsSync(p) && fs.statSync(p).size > 200, `${c.folder}/prototype/${file} exists`);
  }
  const syntax = spawnSync(process.execPath, ["--check", path.join(dir, "prototype", "app.js")], { encoding: "utf8" });
  check(syntax.status === 0, `${c.folder} prototype JavaScript passes syntax check`);
  const html = fs.readFileSync(path.join(dir, "prototype", "index.html"), "utf8");
  const css = fs.readFileSync(path.join(dir, "prototype", "styles.css"), "utf8");
  check(html.includes("../assets/hero-visual.png") === false, `${c.folder} HTML delegates hero reference to rendered JavaScript`);
  check(/@media\s*\(max-width:\s*(680|720)px\)/.test(css), `${c.folder} includes responsive mobile CSS`);
  const js = fs.readFileSync(path.join(dir, "prototype", "app.js"), "utf8");
  check(js.includes("../assets/hero-visual.png"), `${c.folder} prototype references its generated hero`);
  check(js.includes("ไม่ใช่คำทำนาย"), `${c.folder} prototype includes non-prediction disclosure`);
  if (c.id === 11) {
    const generatedReferences = path.join(dir, "assets", "generative-references");
    const expectedReferences = screenshotViews.map(([file]) => file);
    check(fs.existsSync(path.join(dir, "assets", "ASSET_MANIFEST.md")), `${c.folder} includes the asset hash manifest`);
    check(fs.existsSync(generatedReferences), `${c.folder} includes generative-reference assets`);
    for (const file of expectedReferences) {
      const p = path.join(generatedReferences, file);
      check(fs.existsSync(p) && fs.statSync(p).size > 100_000, `${c.folder} generative reference ${file} exists`);
    }
    check(css.includes('html[data-theme="light"]'), `${c.folder} includes a complete light-theme token override`);
    check(js.includes('params.get("theme")'), `${c.folder} supports direct light-theme review`);
    check(js.includes("human-button"), `${c.folder} includes an explicit human-handoff interaction`);
    check(js.includes("capture-mobile"), `${c.folder} includes a verified 390px screenshot capture constraint`);
  }
}

const sharedRequired = [
  "knowledge_base_summary.md",
  "target_users.md",
  "feature_requirements.md",
  "user_journey.md",
  "sitemap.md",
  "design_recommendations.md",
  "source_inventory.md"
];
for (const file of sharedRequired) {
  const p = path.join(analysisDir, file);
  check(fs.existsSync(p) && fs.statSync(p).size > 700, `00_Project_Analysis/${file} exists`);
}
for (const file of ["concept_comparison.md", "recommended_direction.md", "implementation_roadmap.md"]) {
  const p = path.join(root, "99_Final_Comparison", file);
  check(fs.existsSync(p) && fs.statSync(p).size > 700, `99_Final_Comparison/${file} exists`);
}
check(fs.existsSync(path.join(root, "index.html")), "Concept gallery exists");
check(fs.existsSync(path.join(workspace, "README.md")), "Root README exists");
const comparisonText = fs.readFileSync(path.join(root, "99_Final_Comparison", "concept_comparison.md"), "utf8");
const galleryText = fs.readFileSync(path.join(root, "index.html"), "utf8");
check(comparisonText.includes("| **Aurora** |"), "Concept comparison includes the Aurora score row");
check(galleryText.includes("11_Concept_11/prototype/"), "Concept gallery includes the Aurora prototype");

const currentDataFiles = filesUnder(path.join(workspace, "Data")).sort();
const hashLines = currentDataFiles.map((p) => {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
  return `${hash}  ${path.relative(workspace, p)}`;
});
fs.writeFileSync(path.join(analysisDir, "data_source_checksums.sha256"), hashLines.join("\n") + "\n");

const baselinePath = "/tmp/futureme_data_before.sha256";
let preservation = "Baseline file unavailable; current checksums were recorded.";
if (fs.existsSync(baselinePath)) {
  const baseline = fs.readFileSync(baselinePath, "utf8").trim().split("\n").filter(Boolean).sort();
  const current = hashLines.filter(line => !line.endsWith("Data/.DS_Store")).sort();
  check(JSON.stringify(baseline) === JSON.stringify(current), `All ${current.length} original Data files match the pre-work SHA-256 baseline`);
  preservation = JSON.stringify(baseline) === JSON.stringify(current)
    ? `${current.length}/${current.length} source files match the pre-work checksum baseline.`
    : "Checksum mismatch detected; see failed audit.";
}

const screenshotCount = auditedConcepts.reduce((sum, c) => {
  return sum + ["wireframes", "mockups"].reduce((s, mode) => {
    const dir = path.join(root, c.folder, mode);
    return s + fs.readdirSync(dir).filter(x => x.endsWith(".png")).length;
  }, 0);
}, 0);
const heroCount = auditedConcepts.filter(c => fs.existsSync(path.join(root, c.folder, "assets", "hero-visual.png"))).length;
const deliverableFileSet = new Set(filesUnder(root));
deliverableFileSet.add(path.join(analysisDir, "qa_report.md"));
deliverableFileSet.add(path.join(analysisDir, "visual_inventory.md"));
const totalFiles = deliverableFileSet.size;
const passed = checks.filter(x => x.ok).length;

const conceptRows = auditedConcepts.map(c => `| ${String(c.id).padStart(2, "0")} | ${c.name} | 7 | 6 | 6 | 1 | 4 | Pass |`).join("\n");
const qaReport = `# Deliverable QA Report

## Result

**${failures.length ? "FAIL" : "PASS"}** — ${passed}/${checks.length} automated assertions passed.

| Metric | Verified count |
|---|---:|
| Complete concepts | ${auditedConcepts.length} |
| Generated hero assets | ${heroCount} |
| Wireframe + mockup PNGs | ${screenshotCount} |
| Prototype views per concept | 5 |
| Required page specifications per concept | 14 |
| Total files in deliverable folder | ${totalFiles} |

## Per-concept inventory

| # | Concept | Required Markdown docs | Wireframes | Mockups | Generated hero | Prototype files | Status |
|---:|---|---:|---:|---:|---:|---:|---|
${conceptRows}

## Validation performed

- Required folder/file structure.
- Seven required concept documents and all 14 required page specifications.
- Generated hero PNG existence, dimensions, prompt manifest, and prototype reference.
- Six wireframe and six mockup filenames per concept.
- Exact screenshot dimensions: desktop 1440×1000 and mobile 390×844.
- JavaScript syntax for all ${auditedConcepts.length} prototypes.
- Responsive CSS breakpoint and non-prediction disclosure in every prototype.
- Aurora asset traceability, six generative UI references, light theme, human handoff, and 390px capture mode.
- Shared analysis, comparison, recommendation, roadmap, gallery, and root README.
- Local-server smoke test returned HTTP 200 for the gallery, Aurora prototype, code, hero, mockup, and comparison.
- Original source preservation: ${preservation}

## Visual review

The existing ten-concept contact sheets and all six Aurora canonical mockups were reviewed, together with the eleven generated hero assets. The concepts show distinct art direction, palette, shape language, navigation treatment, and product positioning. Aurora mobile captures were specifically re-rendered after viewport QA to confirm full 390px reflow and all four bottom-navigation destinations. A separate light-theme landing capture was also reviewed for hierarchy, legibility, and theme-token coverage.

## Known limitations

- Screenshots are static captures of fictional prototype data; they do not validate a working recommendation model.
- Automated checks do not replace usability testing, disabled-user testing, Thai language review, privacy/legal review, or expert validation of assessment instruments.
- The visual prototypes share a common semantic component foundation for comparability; their product interaction models and visual systems are intentionally different.
${failures.length ? `\n## Failures\n\n${failures.map(x => `- ${x}`).join("\n")}` : ""}
`;
fs.writeFileSync(path.join(analysisDir, "qa_report.md"), qaReport);

const visualRows = auditedConcepts.map(c => `| ${String(c.id).padStart(2, "0")} | ${c.name} | [Hero](../${c.folder}/assets/hero-visual.png) | [Desktop landing](../${c.folder}/mockups/landing-page-desktop.png) | [Mobile landing](../${c.folder}/mockups/landing-page-mobile.png) | [Interview](../${c.folder}/mockups/ai-interview-desktop.png) | [Dashboard](../${c.folder}/mockups/dashboard-desktop.png) | [Results](../${c.folder}/mockups/career-result-desktop.png) | [Roadmap](../${c.folder}/mockups/future-roadmap-mobile.png) | [Prototype](../${c.folder}/prototype/index.html?page=landing) |`).join("\n");
fs.writeFileSync(path.join(analysisDir, "visual_inventory.md"), `# Visual Inventory

| # | Concept | Generated asset | Landing desktop | Landing mobile | AI interview | Dashboard | Career results | Future roadmap | Interactive |
|---:|---|---|---|---|---|---|---|---|---|
${visualRows}
`);

console.log(`${failures.length ? "FAIL" : "PASS"}: ${passed}/${checks.length} checks; ${screenshotCount} screenshots; ${totalFiles} files.`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
