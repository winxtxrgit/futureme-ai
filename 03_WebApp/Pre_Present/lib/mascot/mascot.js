/*
 * FutureMe mascot — geometry and markup.
 *
 * This file is the single source of truth for the character. It builds one
 * layered SVG whose parts match the segmentation in SKILL.md (compass, helmet,
 * face, eyes, mouth, cheeks, torso, heart, arms, legs), so the same part names
 * survive a later move to Rive or a GLB rig.
 *
 * Nothing here knows about emotion or pose *appearance*: every emotion mouth and
 * eye variant is rendered once and revealed by `data-emotion` / `data-pose`
 * selectors in mascot.css. Keeping the DOM stable is what lets states cross-fade
 * instead of popping, and it means a static export is just markup + attributes.
 *
 * Loads as a classic script (file:// friendly, no bundler) and as a CommonJS
 * module so tools/export-assets.js can reuse the exact same drawing code.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FutureMeMascot = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /* ---------------------------------------------------------------- states */

  var EMOTIONS = [
    { id: 'dislike',    value: 1, label: 'Dislike',    labelTh: 'ไม่ชอบเลย',   scale: 'ไม่ใช่ฉันเลย' },
    { id: 'not-okay',   value: 2, label: 'Not Okay',   labelTh: 'ไม่ค่อยโอเค',  scale: 'ไม่ค่อยใช่ฉัน' },
    { id: 'neutral',    value: 3, label: 'Neutral',    labelTh: 'เฉย ๆ',        scale: 'เฉย ๆ' },
    { id: 'smile',      value: 4, label: 'Smile',      labelTh: 'ชอบ',          scale: 'ค่อนข้างใช่ฉัน' },
    { id: 'very-happy', value: 5, label: 'Very Happy', labelTh: 'ชอบมาก',       scale: 'ใช่ฉันมาก' }
  ];

  var POSES = [
    { id: 'idle',        label: 'Idle',        labelTh: 'ยืนเฉย' },
    { id: 'wave',        label: 'Wave',        labelTh: 'โบกมือ' },
    { id: 'think',       label: 'Thinking',    labelTh: 'กำลังคิด' },
    { id: 'listen',      label: 'Listening',   labelTh: 'กำลังฟัง' },
    { id: 'point-left',  label: 'Point Left',  labelTh: 'ชี้ซ้าย' },
    { id: 'point-right', label: 'Point Right', labelTh: 'ชี้ขวา' },
    { id: 'celebrate',   label: 'Celebrate',   labelTh: 'ดีใจ' },
    { id: 'jump',        label: 'Jump',        labelTh: 'กระโดด' },
    { id: 'sit',         label: 'Sit',         labelTh: 'นั่งรอ' }
  ];

  var VIEWS = [
    { id: 'front',         label: 'Front' },
    { id: 'three-quarter', label: '3/4' },
    { id: 'side',          label: 'Side' },
    { id: 'back',          label: 'Back' }
  ];

  /*
   * Sizes are the export targets from SKILL.md. The lab and the Next.js
   * component share this table so a "md" mascot is the same 200px everywhere.
   */
  var SIZES = { xs: 64, sm: 96, md: 200, lg: 300, xl: 440 };

  var EMOTION_IDS = EMOTIONS.map(function (e) { return e.id; });
  var POSE_IDS = POSES.map(function (p) { return p.id; });

  /* -------------------------------------------------------------- geometry */

  /*
   * Two framings off one drawing. `face` crops to the head so an emotion still
   * reads at questionnaire size — a full-body mascot squeezed into a 100px
   * scale option puts the face at ~45px, well under the 96px legibility floor
   * in SKILL.md.
   */
  var CROPS = {
    full: { viewBox: '0 0 320 380', ratio: 380 / 320 },
    /* Bottom edge lands just under the helmet stroke, so no torso sliver
     * appears below the chin. */
    face: { viewBox: '32 16 256 208', ratio: 208 / 256 }
  };

  /*
   * One 320x380 canvas, feet on y=350. Every number below is quoted in
   * docs/mascot-spec.md; change them here and the spec's proportion table is
   * what needs updating, not a pile of duplicated art.
   */
  var G = {
    viewBox: '0 0 320 380',
    center: 160,
    compass: { cx: 160, cy: 54, r: 30 },
    helmet: { top: 76, bottom: 218, left: 52, right: 268 },
    screen: { x: 84, y: 112, w: 152, h: 92, r: 34 },
    eye: { left: 124, right: 196, y: 152, rx: 17, ry: 21 },
    mouth: { cx: 160, cy: 180 },
    cheek: { left: 99, right: 221, y: 180, rx: 13, ry: 8 },
    ear: { left: 48, right: 272, cy: 158, rx: 18, ry: 23 },
    shoulder: { left: 94, right: 226, y: 232 },
    leg: { left: 142, right: 178, top: 300, w: 33, h: 50 },
    heart: { cx: 160, cy: 266, w: 52 },
    ground: { cy: 354, rx: 68, ry: 10 }
  };

  /*
   * Aurora-derived character palette. One object, so a re-tint is one edit and
   * the spec prints the swatches from the same values.
   *
   * Tuned brighter than the first pass: the body sat in mid indigo with a heavy
   * purple edge, which read as a dark character on a light page. The lit half
   * now starts higher up every gradient and the outline is lighter, so the
   * silhouette still holds without adding weight.
   */
  var PALETTE = {
    outline: '#3743D6',
    outlineSoft: '#5561E4',
    helmetTop: '#8C68F4',
    helmetMid: '#6E85F7',
    helmetLow: '#59CDFA',
    helmetRim: '#DDFDFF',
    screenTop: '#5060BE',
    screenBottom: '#4453B0',
    /* The dial stays deep. It shares no gradient with the face screen because
     * the needle's pale cyan half needs something dark to read against. */
    dial: '#1B2560',
    eye: '#111845',
    cheek: '#FF9ACB',
    torsoCore: '#FFFFFF',
    torsoMid: '#CBF4FF',
    torsoBlue: '#93CCFB',
    torsoViolet: '#93A8F7',
    torsoEdge: '#A484F5',
    limbTop: '#9B82F8',
    limbBottom: '#7358E8',
    earLeft: '#8FF2FF',
    earLeftDeep: '#55C5F5',
    earRight: '#FF8FDC',
    earRightDeep: '#D95BBE',
    heartCore: '#FFD6EF',
    heartMid: '#FF8AD4',
    heartEdge: '#FF56B4',
    compassRimA: '#8FF0FB',
    compassRimB: '#CE85F4',
    needleNorth: '#FF6FB4',
    needleSouth: '#BFF3FF'
  };

  var uidCounter = 0;

  /* ------------------------------------------------------------ part paths */

  /* Helmet: dome on top, softly squared jaw — the silhouette that has to stay
   * recognisable at 64px. */
  function helmetPath() {
    var h = G.helmet;
    return 'M ' + h.left + ',' + 150 +
      ' C ' + h.left + ',' + 100 + ' ' + 100 + ',' + h.top + ' ' + 160 + ',' + h.top +
      ' C ' + 220 + ',' + h.top + ' ' + h.right + ',' + 100 + ' ' + h.right + ',' + 150 +
      ' L ' + h.right + ',' + 176 +
      ' C ' + h.right + ',' + 206 + ' ' + 248 + ',' + h.bottom + ' ' + 214 + ',' + h.bottom +
      ' L ' + 106 + ',' + h.bottom +
      ' C ' + 72 + ',' + h.bottom + ' ' + h.left + ',' + 206 + ' ' + h.left + ',' + 176 +
      ' Z';
  }

  function torsoPath() {
    return 'M 160,206' +
      ' C 196,206 215,224 219,258' +
      ' C 223,294 205,320 160,320' +
      ' C 115,320 97,294 101,258' +
      ' C 105,224 124,206 160,206 Z';
  }

  function heartPath(cx, cy, w) {
    var s = w / 52;
    /* Drawn once at 52px wide around the origin, then placed. */
    var d = 'M 0,17 C -12,7 -26,-2 -26,-14 C -26,-24 -18,-30 -10,-30' +
            ' C -4,-30 -1,-26 0,-23 C 1,-26 4,-30 10,-30' +
            ' C 18,-30 26,-24 26,-14 C 26,-2 12,7 0,17 Z';
    return { d: d, transform: 'translate(' + cx + ' ' + cy + ') scale(' + s.toFixed(3) + ')' };
  }

  /* ------------------------------------------------------------------ defs */

  function defs(u) {
    var p = PALETTE;
    return [
      '<defs>',
      /* Near-vertical, so the rim light lands as a band along the jaw rather
       * than blowing out one whole side of the shell. */
      '<linearGradient id="fmHelmet' + u + '" x1="0.34" y1="0" x2="0.5" y2="1">',
      '<stop offset="0%" stop-color="' + p.helmetTop + '"/>',
      '<stop offset="28%" stop-color="' + p.helmetMid + '"/>',
      '<stop offset="60%" stop-color="' + p.helmetLow + '"/>',
      '<stop offset="88%" stop-color="' + p.helmetRim + '"/>',
      '<stop offset="100%" stop-color="#FFFFFF"/>',
      '</linearGradient>',

      '<linearGradient id="fmScreen' + u + '" x1="0.3" y1="0" x2="0.7" y2="1">',
      '<stop offset="0%" stop-color="' + p.screenTop + '"/>',
      '<stop offset="100%" stop-color="' + p.screenBottom + '"/>',
      '</linearGradient>',

      /* Lit from the heart outward, so the bright core has to be wide — a small
       * core with a heavy edge is what made the body read as dark. */
      '<radialGradient id="fmTorso' + u + '" cx="0.5" cy="0.44" r="0.8">',
      '<stop offset="0%" stop-color="' + p.torsoCore + '"/>',
      '<stop offset="30%" stop-color="' + p.torsoMid + '"/>',
      '<stop offset="58%" stop-color="' + p.torsoBlue + '"/>',
      '<stop offset="82%" stop-color="' + p.torsoViolet + '"/>',
      '<stop offset="100%" stop-color="' + p.torsoEdge + '"/>',
      '</radialGradient>',

      '<linearGradient id="fmLimb' + u + '" x1="0.15" y1="0" x2="0.85" y2="1">',
      '<stop offset="0%" stop-color="#B9A6FC"/>',
      '<stop offset="38%" stop-color="' + p.limbTop + '"/>',
      '<stop offset="100%" stop-color="' + p.limbBottom + '"/>',
      '</linearGradient>',

      '<linearGradient id="fmEarL' + u + '" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="' + p.earLeft + '"/>',
      '<stop offset="100%" stop-color="' + p.earLeftDeep + '"/>',
      '</linearGradient>',

      '<radialGradient id="fmEarR' + u + '" cx="0.4" cy="0.4" r="0.7">',
      '<stop offset="0%" stop-color="#FFE2F7"/>',
      '<stop offset="55%" stop-color="' + p.earRight + '"/>',
      '<stop offset="100%" stop-color="' + p.earRightDeep + '"/>',
      '</radialGradient>',

      '<radialGradient id="fmHeart' + u + '" cx="0.38" cy="0.3" r="0.8">',
      '<stop offset="0%" stop-color="' + p.heartCore + '"/>',
      '<stop offset="45%" stop-color="' + p.heartMid + '"/>',
      '<stop offset="100%" stop-color="' + p.heartEdge + '"/>',
      '</radialGradient>',

      '<radialGradient id="fmHeartGlow' + u + '" cx="0.5" cy="0.5" r="0.5">',
      '<stop offset="0%" stop-color="#FF5FBE" stop-opacity="0.55"/>',
      '<stop offset="60%" stop-color="#FF5FBE" stop-opacity="0.16"/>',
      '<stop offset="100%" stop-color="#FF5FBE" stop-opacity="0"/>',
      '</radialGradient>',

      '<linearGradient id="fmCompassRim' + u + '" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="' + p.compassRimA + '"/>',
      '<stop offset="100%" stop-color="' + p.compassRimB + '"/>',
      '</linearGradient>',

      /* Body light spill. Blur is cheap here because it only ever runs over a
       * small region and the filter is not animated. */
      '<filter id="fmSoftGlow' + u + '" x="-45%" y="-45%" width="190%" height="190%">',
      '<feGaussianBlur stdDeviation="7"/>',
      '</filter>',

      '<clipPath id="fmScreenClip' + u + '">',
      '<rect x="' + G.screen.x + '" y="' + G.screen.y + '" width="' + G.screen.w +
        '" height="' + G.screen.h + '" rx="' + G.screen.r + '"/>',
      '</clipPath>',
      '</defs>'
    ].join('');
  }

  /* ------------------------------------------------------------------ eyes */

  /*
   * One eye, all variants stacked. Local coordinates so left and right are the
   * same markup at two translations — the mirrored highlight is the only
   * asymmetry, and it is what keeps the face from looking printed on.
   */
  function eye(side) {
    var mirror = side === 'right' ? -1 : 1;
    var hx = (5 * mirror).toFixed(1);
    return [
      '<g class="fm-eye fm-eye--' + side + '" transform="translate(' +
        (side === 'right' ? G.eye.right : G.eye.left) + ' ' + G.eye.y + ')">',

      /* open — neutral / smile / listening; the default readable eye */
      '<g class="fm-eye-shape fm-eye-shape--open">',
      '<ellipse rx="' + G.eye.rx + '" ry="' + G.eye.ry + '" fill="' + PALETTE.eye + '"/>',
      '<circle cx="' + hx + '" cy="-8" r="5.2" fill="#FFFFFF"/>',
      '<circle cx="' + (-hx * 1.1).toFixed(1) + '" cy="7" r="2.4" fill="#FFFFFF" opacity="0.75"/>',
      '</g>',

      /* narrowed — dislike; the brow does the work, the eye only tightens */
      '<g class="fm-eye-shape fm-eye-shape--narrow">',
      '<ellipse rx="' + G.eye.rx + '" ry="' + (G.eye.ry - 4) + '" fill="' + PALETTE.eye + '"/>',
      '<circle cx="' + hx + '" cy="-6" r="4.6" fill="#FFFFFF"/>',
      '</g>',

      /* wobble — not okay; smaller pupil reads as unsure rather than angry */
      '<g class="fm-eye-shape fm-eye-shape--wobble">',
      '<ellipse rx="' + (G.eye.rx - 2) + '" ry="' + (G.eye.ry - 1) + '" fill="' + PALETTE.eye + '"/>',
      '<circle cx="' + hx + '" cy="-9" r="4.4" fill="#FFFFFF"/>',
      '<circle cx="' + (-hx * 1.2).toFixed(1) + '" cy="6" r="3.2" fill="#FFFFFF" opacity="0.8"/>',
      '</g>',

      /* crescent — very happy only. Level 4 must never use this. */
      '<path class="fm-eye-shape fm-eye-shape--happy" d="M -15,5 Q 0,-14 15,5"' +
        ' fill="none" stroke="' + PALETTE.eye + '" stroke-width="5.5" stroke-linecap="round"/>',

      /* blink — flatter than the crescent so a blink never reads as level 5 */
      '<path class="fm-eye-shape fm-eye-shape--blink" d="M -14,0 Q 0,7 14,0"' +
        ' fill="none" stroke="' + PALETTE.eye + '" stroke-width="5" stroke-linecap="round"/>',

      '</g>'
    ].join('');
  }

  function brow(side) {
    var x = side === 'right' ? G.eye.right : G.eye.left;
    var mirror = side === 'right' ? -1 : 1;
    return [
      '<g class="fm-brow fm-brow--' + side + '" transform="translate(' + x + ' ' +
        (G.eye.y - 30) + ') scale(' + mirror + ' 1)">',
      /* angled down toward the nose: annoyed, not enraged */
      '<path class="fm-brow-shape fm-brow-shape--cross" d="M -15,-4 L 13,7"' +
        ' stroke="' + PALETTE.eye + '" stroke-width="5" stroke-linecap="round" fill="none"/>',
      /* outer end lifted: worried */
      '<path class="fm-brow-shape fm-brow-shape--worry" d="M -15,4 Q -4,-4 12,0"' +
        ' stroke="' + PALETTE.eye + '" stroke-width="4.4" stroke-linecap="round" fill="none"/>',
      '</g>'
    ].join('');
  }

  /* ----------------------------------------------------------------- mouth */

  function mouths() {
    var m = G.mouth;
    var stroke = ' fill="none" stroke="' + PALETTE.eye + '" stroke-linecap="round" stroke-linejoin="round"';
    return [
      '<g class="fm-mouth" transform="translate(' + m.cx + ' ' + m.cy + ')">',
      '<path class="fm-mouth-shape fm-mouth-shape--dislike" d="M -13,5 Q 0,-8 13,5" stroke-width="5"' + stroke + '/>',
      '<path class="fm-mouth-shape fm-mouth-shape--not-okay" d="M -13,1 q 4.3,-6 8.6,0 t 8.6,0 t 8.6,0" stroke-width="4.4"' + stroke + '/>',
      '<path class="fm-mouth-shape fm-mouth-shape--neutral" d="M -10,0 L 10,0" stroke-width="5"' + stroke + '/>',
      '<path class="fm-mouth-shape fm-mouth-shape--smile" d="M -13,-4 Q 0,9 13,-4" stroke-width="5"' + stroke + '/>',
      '<g class="fm-mouth-shape fm-mouth-shape--very-happy">',
      '<path d="M -20,-7 Q 0,-12 20,-7 Q 20,17 0,17 Q -20,17 -20,-7 Z" fill="' + PALETTE.eye + '"/>',
      '<path d="M -10,10 Q 0,3 10,10 Q 10,17 0,17 Q -10,17 -10,10 Z" fill="#FF74BE"/>',
      '</g>',
      '</g>'
    ].join('');
  }

  /* ------------------------------------------------------------- assembled */

  function compass(u) {
    var c = G.compass;
    return [
      '<g class="fm-compass">',
      /* stem, drawn before the helmet so the helmet hides where it seats */
      '<rect class="fm-compass-stem" x="' + (c.cx - 7) + '" y="' + (c.cy + 14) +
        '" width="14" height="26" rx="6" fill="url(#fmLimb' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="4"/>',
      '<g class="fm-compass-dial">',
      '<circle cx="' + c.cx + '" cy="' + c.cy + '" r="' + c.r + '" fill="url(#fmCompassRim' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<circle cx="' + c.cx + '" cy="' + c.cy + '" r="' + (c.r - 6) + '" fill="' + PALETTE.dial + '"/>',
      /* tick marks at the cardinals, the only "instrument" detail we keep */
      '<g stroke="' + PALETTE.needleSouth + '" stroke-width="2.4" stroke-linecap="round" opacity="0.85">',
      '<path d="M ' + c.cx + ',' + (c.cy - 21) + ' v 5"/>',
      '<path d="M ' + c.cx + ',' + (c.cy + 16) + ' v 5"/>',
      '<path d="M ' + (c.cx - 21) + ',' + c.cy + ' h 5"/>',
      '<path d="M ' + (c.cx + 16) + ',' + c.cy + ' h 5"/>',
      '</g>',
      '<g class="fm-compass-needle" transform="translate(' + c.cx + ' ' + c.cy + ')">',
      /* Needle rests pointing north-east, as in the reference render. The
       * kite halves must not be collinear or they collapse to zero area. */
      '<g class="fm-needle-spin">',
      '<g transform="rotate(42)">',
      '<path d="M 0,-18 L 6.5,0 L 0,4 L -6.5,0 Z" fill="' + PALETTE.needleNorth + '"/>',
      '<path d="M 0,18 L 6.5,0 L 0,-4 L -6.5,0 Z" fill="' + PALETTE.needleSouth + '"/>',
      '<path d="M 0,-18 L 6.5,0 L 0,4 Z" fill="#FFFFFF" opacity="0.28"/>',
      '</g>',
      '</g>',
      '<circle r="3.4" fill="' + PALETTE.dial + '" stroke="#FFFFFF" stroke-width="1.6"/>',
      '</g>',
      '</g>',
      '</g>'
    ].join('');
  }

  function head(u) {
    var s = G.screen;
    return [
      '<g class="fm-head">',

      /* ear pods — cyan left, magenta right; the right one is the "listening"
       * indicator, which is why it gets the glow layer */
      '<g class="fm-ear fm-ear--left">',
      '<ellipse cx="' + G.ear.left + '" cy="' + G.ear.cy + '" rx="' + G.ear.rx + '" ry="' + G.ear.ry +
        '" fill="url(#fmEarL' + u + ')" stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<ellipse cx="' + (G.ear.left - 3) + '" cy="' + (G.ear.cy - 6) + '" rx="5" ry="8" fill="#FFFFFF" opacity="0.5"/>',
      '</g>',
      '<g class="fm-ear fm-ear--right">',
      '<ellipse class="fm-ear-glow" cx="' + G.ear.right + '" cy="' + G.ear.cy + '" rx="' + (G.ear.rx + 8) +
        '" ry="' + (G.ear.ry + 8) + '" fill="#FF8FDC" opacity="0.4" filter="url(#fmSoftGlow' + u + ')"/>',
      '<ellipse cx="' + G.ear.right + '" cy="' + G.ear.cy + '" rx="' + G.ear.rx + '" ry="' + G.ear.ry +
        '" fill="url(#fmEarR' + u + ')" stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<ellipse cx="' + (G.ear.right - 4) + '" cy="' + (G.ear.cy - 6) + '" rx="5" ry="7" fill="#FFFFFF" opacity="0.55"/>',
      '</g>',

      compass(u),

      '<g class="fm-helmet">',
      '<path d="' + helmetPath() + '" fill="url(#fmHelmet' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="5"/>',
      /* rim light along the jaw — the reference render's strongest read */
      '<path class="fm-helmet-rim" d="M 58,182 C 62,208 84,216 106,216 L 214,216 C 236,216 258,208 262,182"' +
        ' fill="none" stroke="' + PALETTE.helmetRim + '" stroke-width="7" stroke-linecap="round" opacity="0.75"/>',
      '<ellipse class="fm-helmet-spec" cx="212" cy="104" rx="13" ry="9" fill="#FFFFFF" opacity="0.42" transform="rotate(-24 212 104)"/>',
      '<ellipse class="fm-helmet-spec" cx="234" cy="122" rx="7" ry="5" fill="#FFFFFF" opacity="0.3" transform="rotate(-24 234 122)"/>',
      '</g>',

      /* In profile the near-side pod sits in front of the shell. Drawing it
       * after the helmet is the only way to get that without reordering the
       * layer stack at runtime. */
      '<g class="fm-side-pod">',
      '<circle cx="196" cy="158" r="21" fill="url(#fmEarR' + u + ')" stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<ellipse cx="190" cy="151" rx="6" ry="5" fill="#FFFFFF" opacity="0.55"/>',
      '</g>',

      '<g class="fm-face">',
      '<rect class="fm-screen" x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h +
        '" rx="' + s.r + '" fill="url(#fmScreen' + u + ')" stroke="' + PALETTE.helmetRim +
        '" stroke-width="3" stroke-opacity="0.4"/>',
      '<g clip-path="url(#fmScreenClip' + u + ')">',
      '<g class="fm-cheeks">',
      '<ellipse cx="' + G.cheek.left + '" cy="' + G.cheek.y + '" rx="' + G.cheek.rx + '" ry="' + G.cheek.ry +
        '" fill="' + PALETTE.cheek + '" opacity="0.8"/>',
      '<ellipse cx="' + G.cheek.right + '" cy="' + G.cheek.y + '" rx="' + G.cheek.rx + '" ry="' + G.cheek.ry +
        '" fill="' + PALETTE.cheek + '" opacity="0.8"/>',
      '</g>',
      /* Eyes and brows track gaze together; the mouth stays put, which is what
       * makes a glance read as a glance rather than the whole face sliding. */
      '<g class="fm-eyes">',
      brow('left'), brow('right'),
      eye('left'), eye('right'),
      '</g>',
      mouths(),
      '</g>',
      '</g>',
      '</g>'
    ].join('');
  }

  /*
   * Placement lives on its own wrapper. A CSS `transform` replaces the SVG
   * transform attribute rather than composing with it, so any element that
   * needs to be animated or re-posed from CSS must not also be the element
   * carrying its position — otherwise it snaps to the canvas origin.
   */
  function arm(side, u) {
    var x = side === 'right' ? G.shoulder.right : G.shoulder.left;
    var mirror = side === 'right' ? -1 : 1;
    return [
      '<g class="fm-arm fm-arm--' + side + '">',
      '<g class="fm-arm-place" transform="translate(' + x + ' ' + G.shoulder.y + ')">',
      '<g class="fm-arm-limb">',
      '<ellipse cx="0" cy="30" rx="18" ry="33" fill="url(#fmLimb' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<ellipse cx="' + (-5 * mirror) + '" cy="17" rx="4.5" ry="10" fill="#FFFFFF" opacity="0.35"/>',
      /* pointing finger, only revealed by the point poses */
      '<g class="fm-hand-point" transform="translate(' + (-11 * mirror) + ' 55) scale(' + mirror + ' 1)">',
      '<path d="M -18,-7 q -9,5 -9,10 q 0,7 10,7 l 14,0 q 8,0 8,-8 q 0,-8 -8,-8 z"' +
        ' fill="url(#fmLimb' + u + ')" stroke="' + PALETTE.outline + '" stroke-width="4.5" stroke-linejoin="round"/>',
      '</g>',
      '</g>',
      '</g>',
      '</g>'
    ].join('');
  }

  function leg(side, u) {
    var x = side === 'right' ? G.leg.right : G.leg.left;
    return [
      '<g class="fm-leg fm-leg--' + side + '">',
      '<g class="fm-leg-place" transform="translate(' + x + ' ' + G.leg.top + ')">',
      '<g class="fm-leg-limb">',
      '<rect x="' + (-G.leg.w / 2) + '" y="0" width="' + G.leg.w + '" height="' + G.leg.h +
        '" rx="' + (G.leg.w / 2) + '" fill="url(#fmLimb' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="4.5"/>',
      '<ellipse cx="-4" cy="18" rx="4" ry="8" fill="#FFFFFF" opacity="0.28"/>',
      '</g>',
      '</g>',
      '</g>'
    ].join('');
  }

  function torso(u) {
    var heart = heartPath(G.heart.cx, G.heart.cy, G.heart.w);
    return [
      '<g class="fm-torso">',
      '<path d="' + torsoPath() + '" fill="url(#fmTorso' + u + ')"' +
        ' stroke="' + PALETTE.outline + '" stroke-width="5"/>',
      '<ellipse cx="118" cy="248" rx="7" ry="14" fill="#FFFFFF" opacity="0.3" transform="rotate(-12 118 248)"/>',
      '<ellipse cx="203" cy="248" rx="7" ry="13" fill="#FFFFFF" opacity="0.26" transform="rotate(12 203 248)"/>',

      '<g class="fm-heart">',
      '<circle class="fm-heart-glow" cx="' + G.heart.cx + '" cy="' + G.heart.cy +
        '" r="56" fill="url(#fmHeartGlow' + u + ')"/>',
      '<path d="' + heart.d + '" transform="' + heart.transform + '" fill="url(#fmHeart' + u + ')"/>',
      '<ellipse cx="' + (G.heart.cx + 7) + '" cy="' + (G.heart.cy - 10) +
        '" rx="7" ry="6" fill="#FFFFFF" opacity="0.85"/>',
      '<circle class="fm-heart-spark" cx="' + (G.heart.cx - 26) + '" cy="' + (G.heart.cy + 6) + '" r="3" fill="#FFFFFF" opacity="0.7"/>',
      '<circle class="fm-heart-spark" cx="' + (G.heart.cx + 27) + '" cy="' + (G.heart.cy - 16) + '" r="2.4" fill="#FFFFFF" opacity="0.6"/>',
      '</g>',
      '</g>'
    ].join('');
  }

  /* Celebration confetti. Present in the DOM always, revealed by the pose so
   * there is no layout shift when the state flips. */
  function sparkles() {
    var pts = [
      [70, 132, 7, 0], [252, 118, 6, 1], [46, 208, 5, 2],
      [276, 200, 6, 3], [96, 76, 5, 4], [232, 62, 5, 5]
    ];
    return '<g class="fm-sparkles" aria-hidden="true">' + pts.map(function (p) {
      return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' +
        '<path class="fm-sparkle" style="--i:' + p[3] + '"' +
        ' d="M 0,' + -p[2] + ' Q 1.4,-1.4 ' + p[2] + ',0 Q 1.4,1.4 0,' + p[2] +
        ' Q -1.4,1.4 ' + -p[2] + ',0 Q -1.4,-1.4 0,' + -p[2] + ' Z" fill="#7CE9FA"/></g>';
    }).join('') + '</g>';
  }

  /* Thinking dots, anchored beside the head. */
  function thoughtDots() {
    return [
      '<g class="fm-thought" aria-hidden="true">',
      '<circle class="fm-thought-dot" style="--i:0" cx="272" cy="126" r="5"/>',
      '<circle class="fm-thought-dot" style="--i:1" cx="288" cy="106" r="7"/>',
      '<circle class="fm-thought-dot" style="--i:2" cx="300" cy="82" r="9"/>',
      '</g>'
    ].join('');
  }

  /* Listening rings on the magenta ear pod. */
  function listenRings() {
    return [
      '<g class="fm-listen" aria-hidden="true">',
      '<circle class="fm-listen-ring" style="--i:0" cx="' + G.ear.right + '" cy="' + G.ear.cy + '" r="26"/>',
      '<circle class="fm-listen-ring" style="--i:1" cx="' + G.ear.right + '" cy="' + G.ear.cy + '" r="26"/>',
      '</g>'
    ].join('');
  }

  /* ------------------------------------------------------------------- API */

  function normalise(state) {
    state = state || {};
    return {
      emotion: EMOTION_IDS.indexOf(state.emotion) >= 0 ? state.emotion : 'smile',
      pose: POSE_IDS.indexOf(state.pose) >= 0 ? state.pose : 'idle',
      view: state.view && ['front', 'three-quarter', 'side', 'back'].indexOf(state.view) >= 0
        ? state.view : 'front',
      crop: CROPS[state.crop] ? state.crop : 'full'
    };
  }

  /**
   * Build the mascot's SVG markup.
   *
   * @param {object} [opts]
   * @param {string} [opts.emotion]  one of EMOTIONS
   * @param {string} [opts.pose]     one of POSES
   * @param {string} [opts.view]     front | three-quarter | side | back
   * @param {number} [opts.size]     px; omit to inherit the container
   * @param {string} [opts.ariaLabel] set for meaningful states, omit for decoration
   * @param {string} [opts.className] extra classes on the root <svg>
   * @returns {string} SVG markup
   */
  function mascotSVG(opts) {
    opts = opts || {};
    var st = normalise(opts);
    var u = opts.uid || ('u' + (++uidCounter));
    var label = opts.ariaLabel;
    var crop = CROPS[st.crop];
    var dims = opts.size
      ? ' width="' + opts.size + '" height="' + (opts.size * crop.ratio).toFixed(0) + '"'
      : '';

    var a11y = label
      ? ' role="img" aria-label="' + String(label).replace(/"/g, '&quot;') + '"'
      : ' role="presentation" aria-hidden="true"';

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + crop.viewBox + '"' + dims +
        ' class="fm-mascot ' + (opts.className || '') + '"' +
        ' data-emotion="' + st.emotion + '" data-pose="' + st.pose + '" data-view="' + st.view +
        '" data-crop="' + st.crop + '"' +
        a11y + '>',
      defs(u),
      '<g class="fm-root">',
      '<ellipse class="fm-ground" cx="' + G.center + '" cy="' + G.ground.cy + '" rx="' + G.ground.rx +
        '" ry="' + G.ground.ry + '" fill="' + PALETTE.outline + '" opacity="0.16"/>',
      /* Three nested rigs so looping motion never fights a pose transform:
       * .fm-root floats, .fm-body holds the pose, .fm-breathe holds the loop. */
      '<g class="fm-body">',
      '<g class="fm-breathe">',
      leg('left', u), leg('right', u),
      torso(u),
      /* Rings sit behind the head so they read as sound leaving the ear pod
       * rather than as a ring drawn over the face. */
      listenRings(),
      head(u),
      /* Arms come after the head. Hanging at the sides they never reach it,
       * but a raised arm has to pass in front of the helmet — behind it, the
       * wave disappears almost completely. */
      arm('left', u), arm('right', u),
      thoughtDots(),
      sparkles(),
      '</g>',
      '</g>',
      '</g>',
      '</svg>'
    ].join('');
  }

  /**
   * Mount a mascot into an element and hand back its state API.
   *
   *   const m = FutureMeMascot.create(el, { emotion: 'smile', pose: 'wave' });
   *   m.setMascotState({ emotion: 'very-happy' });
   */
  function create(el, opts) {
    el.innerHTML = mascotSVG(opts);
    var svg = el.firstChild;
    var state = normalise(opts);

    function setMascotState(next) {
      state = normalise(Object.assign({}, state, next || {}));
      svg.setAttribute('data-emotion', state.emotion);
      svg.setAttribute('data-pose', state.pose);
      svg.setAttribute('data-view', state.view);
      svg.setAttribute('data-crop', state.crop);
      svg.setAttribute('viewBox', CROPS[state.crop].viewBox);
      return state;
    }

    return {
      el: svg,
      setMascotState: setMascotState,
      getState: function () { return Object.assign({}, state); },
      /* Blink is driven from JS because a CSS loop can only be regular, and a
       * metronome blink is the fastest way to make a character look dead. */
      blink: function () {
        if (state.emotion === 'very-happy') return;
        svg.setAttribute('data-blink', '1');
        setTimeout(function () { svg.removeAttribute('data-blink'); }, 150);
      }
    };
  }

  return {
    EMOTIONS: EMOTIONS,
    POSES: POSES,
    VIEWS: VIEWS,
    SIZES: SIZES,
    GEOMETRY: G,
    PALETTE: PALETTE,
    mascotSVG: mascotSVG,
    create: create
  };
});
