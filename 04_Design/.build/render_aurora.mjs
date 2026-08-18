import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = path.resolve("FutureMe_Web_Design_Concepts");
const conceptRoot = path.join(root, "11_Concept_11");
const prototype = path.join(conceptRoot, "prototype", "index.html");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const views = [
  { file: "landing-page-desktop.png", page: "landing", size: "1440,1000" },
  { file: "landing-page-mobile.png", page: "landing", size: "390,844" },
  { file: "ai-interview-desktop.png", page: "interview", size: "1440,1000" },
  { file: "dashboard-desktop.png", page: "dashboard", size: "1440,1000" },
  { file: "career-result-desktop.png", page: "results", size: "1440,1000" },
  { file: "future-roadmap-mobile.png", page: "roadmap", size: "390,844" }
];

if (!fs.existsSync(chrome)) {
  throw new Error(`Chrome was not found at ${chrome}`);
}
if (!fs.existsSync(prototype)) {
  throw new Error(`Prototype was not found at ${prototype}`);
}

const jobs = [];
for (const mode of ["mockups", "wireframes"]) {
  const outputDirectory = path.join(conceptRoot, mode);
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const view of views) {
    const url = new URL(pathToFileURL(prototype));
    url.searchParams.set("page", view.page);
    if (view.size.startsWith("390,")) url.searchParams.set("capture", "mobile");
    if (mode === "wireframes") url.searchParams.set("mode", "wireframe");
    jobs.push({
      mode,
      name: view.file,
      output: path.join(outputDirectory, view.file),
      size: view.size,
      url: url.href
    });
  }
}

function render(job, index) {
  return new Promise(resolve => {
    const profile = `/tmp/futureme-aurora-chrome-${process.pid}-${index}`;
    fs.rmSync(job.output, { force: true });
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
      "--virtual-time-budget=1600",
      `--user-data-dir=${profile}`,
      `--screenshot=${job.output}`,
      `--window-size=${job.size}`,
      job.url
    ];

    const child = spawn(chrome, args, { stdio: "ignore" });
    let settled = false;
    let ready = false;

    const watcher = setInterval(() => {
      if (fs.existsSync(job.output) && fs.statSync(job.output).size >= 10_000) {
        ready = true;
        child.kill("SIGTERM");
      }
    }, 200);

    const timeout = setTimeout(() => child.kill("SIGKILL"), 25_000);

    function finish(error) {
      if (settled) return;
      settled = true;
      clearInterval(watcher);
      clearTimeout(timeout);
      fs.rmSync(profile, { recursive: true, force: true });
      resolve({
        ...job,
        ok: !error && ready && fs.existsSync(job.output) && fs.statSync(job.output).size >= 10_000,
        error
      });
    }

    child.on("error", error => finish(error.message));
    child.on("exit", code => finish(ready ? null : `Chrome exited ${code}`));
  });
}

const results = [];
let next = 0;
const concurrency = 4;

async function worker() {
  while (next < jobs.length) {
    const index = next++;
    const result = await render(jobs[index], index);
    results.push(result);
    console.log(`${result.ok ? "✓" : "✗"} ${result.mode}/${result.name}`);
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const failures = results.filter(result => !result.ok);
if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.output}: ${failure.error || "output missing"}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Rendered ${results.length} Aurora screenshots successfully.`);
}
