import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { concepts } from "./concepts.mjs";

const root = path.resolve("FutureMe_Web_Design_Concepts");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const views = [
  { file: "landing-page-desktop.png", page: "landing", size: "1440,1000" },
  { file: "landing-page-mobile.png", page: "landing", size: "390,844" },
  { file: "ai-interview-desktop.png", page: "interview", size: "1440,1000" },
  { file: "dashboard-desktop.png", page: "dashboard", size: "1440,1000" },
  { file: "career-result-desktop.png", page: "results", size: "1440,1000" },
  { file: "future-roadmap-mobile.png", page: "roadmap", size: "390,844" }
];

const jobs = [];
for (const concept of concepts) {
  const prototype = path.join(root, concept.folder, "prototype", "index.html");
  for (const mode of ["mockups", "wireframes"]) {
    const outDir = path.join(root, concept.folder, mode);
    fs.mkdirSync(outDir, { recursive: true });
    for (const view of views) {
      const url = new URL(pathToFileURL(prototype));
      url.searchParams.set("page", view.page);
      if (mode === "wireframes") url.searchParams.set("mode", "wireframe");
      jobs.push({
        concept: concept.id,
        mode,
        out: path.join(outDir, view.file),
        url: url.href,
        size: view.size
      });
    }
  }
}

let next = 0;
let completed = 0;
const failures = [];
const concurrency = 4;

function run(job, index) {
  return new Promise((resolve) => {
    const profile = `/tmp/futureme-chrome-${process.pid}-${index}`;
    fs.rmSync(job.out, { force: true });
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--no-first-run",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-sync",
      "--metrics-recording-only",
      "--force-device-scale-factor=1",
      "--virtual-time-budget=1200",
      `--user-data-dir=${profile}`,
      `--screenshot=${path.resolve(job.out)}`,
      `--window-size=${job.size}`,
      job.url
    ];
    const child = spawn(chrome, args, { stdio: "ignore" });
    let ready = false;
    let settled = false;
    const watcher = setInterval(() => {
      if (fs.existsSync(job.out) && fs.statSync(job.out).size >= 10_000) {
        ready = true;
        child.kill("SIGTERM");
      }
    }, 200);
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
    }, 25_000);
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearInterval(watcher);
      clearTimeout(timeout);
      failures.push(`${job.out}: ${error.message}`);
      fs.rmSync(profile, { recursive: true, force: true });
      resolve();
    });
    child.on("exit", (code) => {
      if (settled) return;
      settled = true;
      clearInterval(watcher);
      clearTimeout(timeout);
      if (!ready || !fs.existsSync(job.out) || fs.statSync(job.out).size < 10_000) {
        failures.push(`${job.out}: Chrome exit ${code}`);
      }
      fs.rmSync(profile, { recursive: true, force: true });
      completed += 1;
      if (completed % 12 === 0) console.log(`Rendered ${completed}/${jobs.length}`);
      resolve();
    });
  });
}

async function worker() {
  while (next < jobs.length) {
    const index = next++;
    await run(jobs[index], index);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Rendered all ${jobs.length} screenshots successfully.`);
}
