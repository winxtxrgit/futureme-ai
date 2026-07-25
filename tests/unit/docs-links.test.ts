/**
 * Documentation rot is the failure mode nobody notices until a reviewer clicks
 * a link. These tests walk every Markdown file in the repository and check that
 * relative links, images and in-page anchors actually resolve.
 *
 * External URLs are deliberately not fetched — a test suite that fails because
 * someone else's site is down is a test suite people learn to ignore. External
 * sources are audited by hand instead; see docs/09-source-review.md.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "test-results", "playwright-report"]);

function markdownFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) markdownFiles(full, found);
    else if (entry.endsWith(".md")) found.push(full);
  }
  return found;
}

const FILES = markdownFiles(ROOT).sort();

/**
 * Approximates GitHub's heading-slug rules: lowercase, drop anything that is
 * not a letter, number, space, hyphen or underscore, then spaces to hyphens.
 */
function slug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/`/g, "")
    // \p{M} matters: Thai vowel and tone marks are combining marks, not
    // letters, and GitHub keeps them in the slug.
    .replace(/[^\p{L}\p{M}\p{N} \-_]/gu, "")
    .trim()
    .replace(/ /g, "-");
}

function anchorsIn(content: string): Set<string> {
  const anchors = new Set<string>();
  const prose = stripCode(content);

  for (const match of prose.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)) {
    // Strip inline markdown so the slug matches the rendered text.
    const text = match[2].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_]/g, "");
    anchors.add(slug(text));
  }

  for (const match of content.matchAll(/<a\s+id="([^"]+)"/g)) anchors.add(match[1]);

  return anchors;
}

/** Fenced blocks contain `# comments` and tree art, neither of which is a heading. */
function stripCode(content: string): string {
  return content.replace(/```[\s\S]*?```/g, "");
}

interface Link {
  file: string;
  target: string;
}

function linksIn(file: string): Link[] {
  const content = readFileSync(file, "utf8");
  const out: Link[] = [];

  // Markdown links and images, skipping fenced code blocks.
  const withoutCode = stripCode(content);
  for (const m of withoutCode.matchAll(/!?\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) {
    out.push({ file, target: m[1] });
  }
  for (const m of withoutCode.matchAll(/(?:href|src)="([^"]+)"/g)) {
    out.push({ file, target: m[1] });
  }

  return out;
}

const isExternal = (t: string) => /^(https?:|mailto:|tel:|data:)/.test(t);

describe("documentation links", () => {
  it("finds Markdown files to check", () => {
    expect(FILES.length).toBeGreaterThanOrEqual(12);
  });

  it("resolves every relative file link and image", () => {
    const broken: string[] = [];

    for (const file of FILES) {
      for (const { target } of linksIn(file)) {
        if (isExternal(target) || target.startsWith("#")) continue;

        const [filePart] = target.split("#");
        if (!filePart) continue;

        const resolved = path.resolve(path.dirname(file), filePart);
        try {
          statSync(resolved);
        } catch {
          broken.push(`${path.relative(ROOT, file)} → ${target}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });

  it("resolves every anchor, in this file and across files", () => {
    const anchorCache = new Map<string, Set<string>>();
    const anchorsFor = (file: string): Set<string> => {
      const cached = anchorCache.get(file);
      if (cached) return cached;
      const set = anchorsIn(readFileSync(file, "utf8"));
      anchorCache.set(file, set);
      return set;
    };

    const broken: string[] = [];

    for (const file of FILES) {
      for (const { target } of linksIn(file)) {
        if (isExternal(target)) continue;

        const hashIndex = target.indexOf("#");
        if (hashIndex === -1) continue;

        const anchor = target.slice(hashIndex + 1);
        if (!anchor) continue;

        const filePart = target.slice(0, hashIndex);
        const targetFile = filePart ? path.resolve(path.dirname(file), filePart) : file;

        let available: Set<string>;
        try {
          available = anchorsFor(targetFile);
        } catch {
          continue; // Missing files are the previous test's problem.
        }

        if (!available.has(anchor)) {
          broken.push(`${path.relative(ROOT, file)} → ${target}`);
        }
      }
    }

    expect(broken).toEqual([]);
  });
});

describe("bilingual documentation stays in step", () => {
  const en = readFileSync(path.join(ROOT, "READMEEN.md"), "utf8");
  const th = readFileSync(path.join(ROOT, "READMETH.md"), "utf8");

  const h2Count = (s: string) => (s.match(/^## /gm) ?? []).length;
  const h3Count = (s: string) => (s.match(/^### /gm) ?? []).length;

  it("has the same number of main sections in both languages", () => {
    expect(h2Count(th)).toBe(h2Count(en));
  });

  it("has the same number of subsections in both languages", () => {
    expect(h3Count(th)).toBe(h3Count(en));
  });

  it("has the same number of collapsible blocks and diagrams", () => {
    const count = (s: string, needle: string) => s.split(needle).length - 1;
    expect(count(th, "<details>")).toBe(count(en, "<details>"));
    expect(count(th, "```mermaid")).toBe(count(en, "```mermaid"));
  });

  it("uses exactly one H1 per README, and it is the project name", () => {
    for (const [name, content] of [["EN", en], ["TH", th]] as const) {
      const h1s = stripCode(content).match(/^# .+$/gm) ?? [];
      expect(h1s, name).toHaveLength(1);
      expect(h1s[0], name).toBe("# FutureMe AI");
    }
  });

  it("keeps the same ten top-level navigation entries in both", () => {
    // The nav is the one centred paragraph carrying several in-page links.
    // Each chunk is cut at its own </p> so it cannot absorb the prose that
    // follows, which contains in-page links of its own.
    const navLinks = (doc: string): number => {
      const blocks = doc
        .split(/<p align="center">/)
        .map((b) => b.split("</p>")[0])
        .map((b) => (b.match(/href="#/g) ?? []).length);
      return Math.max(0, ...blocks);
    };
    expect(navLinks(en)).toBe(10);
    expect(navLinks(th)).toBe(10);
  });
});

describe("no withdrawn claim returns", () => {
  // Every one of these was traced to a source that does not support it.
  // See docs/09-source-review.md. A reappearance is a regression, not a typo.
  const FORBIDDEN: [string, RegExp][] = [
    ["Thai mismatch 68.6%", /68\.6\s*%/],
    ["TDRI 304,378 postings", /304,378/],
    ["85% of DVE graduates in field", /85%\s*(of\s*)?(DVE|dual)/i],
    ["15–20% wage penalty", /15[–-]20\s*%\s*wage/i],
    ["6–8% GDP loss", /6[–-]8\s*%\s*(annual\s*)?GDP/i],
  ];

  // Documentation legitimately discusses these claims in order to withdraw
  // them. What must never happen is one reaching a learner, so the check runs
  // against the product surface: seed data and everything rendered from it.
  function sourceFiles(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) sourceFiles(full, found);
      else if (/\.(ts|tsx|json)$/.test(entry)) found.push(full);
    }
    return found;
  }

  const surface = ["data", "app", "components", "lib"]
    .flatMap((d) => sourceFiles(path.join(ROOT, d)))
    .map((f) => ({ file: path.relative(ROOT, f), content: readFileSync(f, "utf8") }));

  it("has a product surface to check", () => {
    expect(surface.length).toBeGreaterThan(10);
  });

  it.each(FORBIDDEN)("never shows a learner %s", (_label, pattern) => {
    const hits = surface.filter((p) => pattern.test(p.content)).map((p) => p.file);
    expect(hits).toEqual([]);
  });

  it("never shows a learner a hard-coded ปวช. subject-area count", () => {
    const hits = surface
      .filter((p) => /\b\d+\s*ปวช\./.test(p.content))
      .map((p) => p.file);
    expect(hits).toEqual([]);
  });
});
