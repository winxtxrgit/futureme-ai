#!/usr/bin/env node
/*
 * Export standalone SVG assets from the same geometry the lab renders.
 *
 *   node tools/export-assets.js
 *
 * Each file is self-contained: mascot.css is inlined so the asset renders
 * correctly when dropped into Figma, a <img src>, or a Next.js public folder.
 * Because the markup and the stylesheet both come from the live source, an
 * exported asset can never drift from what the team approved in the lab.
 *
 * Naming follows docs/asset-naming.md.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'svg');

const Mascot = require(path.join(ROOT, 'mascot.js'));
const css = fs.readFileSync(path.join(ROOT, 'mascot.css'), 'utf8');

/* The exported file has no ancestor carrying the motion switches, so the
 * toggle rules are inert — strip them rather than ship dead CSS. */
const inlineCss = css
  .split('/* --------------------------------------------------------- motion toggles */')[0]
  /* Comments are ~9 KB of every exported file and explain source we ship
   * separately, so they earn nothing here. */
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim() + `

@media (prefers-reduced-motion: reduce) {
  .fm-mascot * { animation: none !important; transition-duration: 0.01ms !important; }
}
`;

function build(opts) {
  const svg = Mascot.mascotSVG(Object.assign({ uid: 'x' }, opts));
  /*
   * CDATA is not optional here. A standalone .svg is parsed as XML, and the
   * stylesheet's own comments mention markup like <g> and <body> — unwrapped,
   * the parser reads those as tags and the file fails to render as an <img>.
   */
  return svg.replace(
    '<defs>',
    `<style><![CDATA[\n${inlineCss}\n]]></style>\n<defs>`
  );
}

function write(name, opts) {
  fs.writeFileSync(path.join(OUT, name), build(opts) + '\n');
  return name;
}

fs.mkdirSync(OUT, { recursive: true });

const written = [];

/* Five emotions at the canonical idle pose — the questionnaire set. */
for (const e of Mascot.EMOTIONS) {
  written.push(write(
    `futureme_mascot_emotion_${e.id.replace(/-/g, '_')}.svg`,
    { emotion: e.id, pose: 'idle', ariaLabel: `FutureMe mascot — ${e.label}` }
  ));
}

/* Same five, cropped to the head — what the 5-point scale actually renders. */
for (const e of Mascot.EMOTIONS) {
  written.push(write(
    `futureme_mascot_face_${e.id.replace(/-/g, '_')}.svg`,
    { emotion: e.id, pose: 'idle', crop: 'face', ariaLabel: `FutureMe mascot — ${e.label}` }
  ));
}

/* Nine poses at the default friendly face — the product-state set. */
for (const p of Mascot.POSES) {
  written.push(write(
    `futureme_mascot_pose_${p.id.replace(/-/g, '_')}.svg`,
    { emotion: 'smile', pose: p.id, ariaLabel: `FutureMe mascot — ${p.label}` }
  ));
}

/* Turnaround views for the 3D brief. */
for (const v of Mascot.VIEWS) {
  written.push(write(
    `futureme_mascot_view_${v.id.replace(/-/g, '_')}.svg`,
    { emotion: 'neutral', pose: 'idle', view: v.id, ariaLabel: `FutureMe mascot — ${v.label} view` }
  ));
}

console.log(`Wrote ${written.length} assets to assets/svg/`);
written.forEach((n) => console.log('  ' + n));
