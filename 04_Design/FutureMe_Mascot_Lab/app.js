/*
 * Mascot Lab — the tool around the character.
 *
 * Every mascot on the page is built from the same mascot.js source, so what the
 * team approves here is exactly what tools/export-assets.js writes out and what
 * the Next.js component renders.
 */
(function () {
  'use strict';

  var M = window.FutureMeMascot;
  var $ = function (id) { return document.getElementById(id); };

  /* ------------------------------------------------------------ live stage */

  var stageSize = 'lg';
  var stage = M.create($('stageMascot'), {
    emotion: 'smile',
    pose: 'wave',
    ariaLabel: 'ตัวอย่างมาสคอต FutureMe'
  });

  function labelFor(emotion, pose) {
    var e = M.EMOTIONS.filter(function (x) { return x.id === emotion; })[0];
    var p = M.POSES.filter(function (x) { return x.id === pose; })[0];
    return e.labelTh + ' · ' + p.labelTh;
  }

  function render() {
    var s = stage.getState();
    var px = M.SIZES[stageSize];

    /* Capped at the container so a 440px hero preview cannot push the page
     * wider than a phone screen. */
    $('stageMascot').style.width = 'min(' + px + 'px, 100%)';
    /* The stage mascot carries meaning, so its label has to change with it. */
    stage.el.setAttribute('aria-label', 'มาสคอต FutureMe: ' + labelFor(s.emotion, s.pose));
    $('stageCaption').textContent = labelFor(s.emotion, s.pose) + ' — ' + px + 'px';
    $('stateCode').textContent =
      'setMascotState({\n  emotion: \'' + s.emotion + '\',\n  pose: \'' + s.pose + '\'\n});';

    syncPressed('emotionControls', s.emotion);
    syncPressed('poseControls', s.pose);
    syncPressed('sizeControls', stageSize);
  }

  function syncPressed(containerId, value) {
    var nodes = $(containerId).querySelectorAll('[data-value]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].setAttribute('aria-pressed', String(nodes[i].dataset.value === value));
    }
  }

  function chip(value, text, sub) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.value = value;
    b.setAttribute('aria-pressed', 'false');
    /* Text, never colour or mascot alone, identifies the choice. */
    b.innerHTML = '<span>' + text + '</span>' + (sub ? '<small>' + sub + '</small>' : '');
    return b;
  }

  M.EMOTIONS.forEach(function (e) {
    var b = chip(e.id, e.label, e.labelTh);
    b.addEventListener('click', function () { stage.setMascotState({ emotion: e.id }); render(); });
    $('emotionControls').appendChild(b);
  });

  M.POSES.forEach(function (p) {
    var b = chip(p.id, p.label, p.labelTh);
    b.addEventListener('click', function () { stage.setMascotState({ pose: p.id }); render(); });
    $('poseControls').appendChild(b);
  });

  Object.keys(M.SIZES).forEach(function (key) {
    var b = chip(key, key, M.SIZES[key] + 'px');
    b.addEventListener('click', function () { stageSize = key; render(); });
    $('sizeControls').appendChild(b);
  });

  $('copyState').addEventListener('click', function () {
    var btn = this;
    var done = function (msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText($('stateCode').textContent).then(
        function () { done('Copied'); },
        function () { done('Select it'); }
      );
    } else {
      done('Select it');
    }
  });

  /* -------------------------------------------------------- motion toggles */

  var MOTION = [
    { attr: 'data-fm-idle', label: 'Idle breathing — หายใจเบา ๆ', on: true },
    { attr: 'data-fm-hover', label: 'Small hover — ลอยขึ้นลง', on: true },
    { attr: 'data-fm-heart', label: 'Heart glow pulse — หัวใจเต้น', on: true },
    { attr: 'data-fm-compass', label: 'Compass drift — เข็มทิศขยับ', on: true },
    { attr: 'data-fm-anim', label: 'Animation master — เปิดทั้งหมด', on: true },
    /* Ticked means "show me what a reduced-motion user sees", so this one
     * switches motion off rather than on. */
    { attr: 'data-fm-reduced', label: 'Reduced-motion preview', on: false }
  ];

  MOTION.forEach(function (m) {
    var wrap = document.createElement('label');
    wrap.className = 'switch';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = m.on;
    var span = document.createElement('span');
    span.textContent = m.label;
    wrap.appendChild(input);
    wrap.appendChild(span);

    input.addEventListener('change', function () {
      document.body.setAttribute(m.attr, input.checked ? 'on' : 'off');
    });

    $('motionControls').appendChild(wrap);
  });

  /* ------------------------------------------------------------- blinking */

  /*
   * Irregular by design. A blink on a fixed interval reads as a machine; the
   * 3–7 s window in SKILL.md is what makes the character feel awake.
   */
  var blinkers = [stage];
  (function scheduleBlink() {
    var delay = 3000 + Math.random() * 4000;
    setTimeout(function () {
      if (document.body.getAttribute('data-fm-anim') !== 'off' &&
          document.body.getAttribute('data-fm-reduced') !== 'on') {
        blinkers.forEach(function (b) { b.blink(); });
      }
      scheduleBlink();
    }, delay);
  })();

  /* --------------------------------------------------------- 5-point scale */

  var scaleBox = $('scaleOptions');

  M.EMOTIONS.forEach(function (e) {
    var label = document.createElement('label');
    label.className = 'scale__option';

    var input = document.createElement('input');
    input.type = 'radio';
    input.name = 'fm-scale';
    input.value = String(e.value);

    var art = document.createElement('div');
    art.className = 'scale__art';
    /* Face crop, and decorative: the number and text label carry the value. */
    art.innerHTML = M.mascotSVG({ emotion: e.id, pose: 'idle', crop: 'face' });

    var num = document.createElement('span');
    num.className = 'scale__num';
    num.textContent = 'ระดับ ' + e.value;

    var name = document.createElement('span');
    name.className = 'scale__label';
    name.textContent = e.labelTh;

    var hint = document.createElement('span');
    hint.className = 'scale__hint';
    hint.textContent = e.scale;

    label.appendChild(input);
    label.appendChild(art);
    label.appendChild(num);
    label.appendChild(name);
    label.appendChild(hint);

    input.addEventListener('change', function () {
      $('scaleAnswer').textContent = 'เลือก: ระดับ ' + e.value + ' — ' + e.labelTh;
    });

    scaleBox.appendChild(label);
  });

  $('greyscaleToggle').addEventListener('change', function () {
    $('questionCard').classList.toggle('is-grey', this.checked);
  });

  /* --------------------------------------------------------- product states */

  var STATES = [
    { key: 'onboarding', title: 'Onboarding', emotion: 'smile', pose: 'wave',
      body: 'สวัสดี! เราจะช่วยหาเส้นทางอาชีพที่ใช่ของคุณ' },
    { key: 'assessment', title: 'Assessment question', emotion: 'neutral', pose: 'idle',
      body: 'ตอบตามความรู้สึกจริง ไม่มีคำตอบถูกผิด' },
    { key: 'listening', title: 'AI interview listening', emotion: 'neutral', pose: 'listen',
      body: 'กำลังฟังอยู่ เล่าต่อได้เลย' },
    { key: 'thinking', title: 'AI thinking', emotion: 'neutral', pose: 'think',
      body: 'กำลังประมวลผลคำตอบของคุณ' },
    { key: 'route', title: 'Route recommendation', emotion: 'smile', pose: 'point-right',
      body: 'เจอ 3 เส้นทางที่เหมาะกับคุณแล้ว' },
    { key: 'plan', title: '30-day plan ready', emotion: 'very-happy', pose: 'celebrate',
      body: 'แผน 30 วันพร้อมแล้ว เริ่มวันนี้ได้เลย' },
    { key: 'empty', title: 'Empty state', emotion: 'not-okay', pose: 'sit',
      body: 'ยังไม่มีข้อมูลตรงนี้ ลองทำแบบประเมินก่อนนะ' },
    { key: 'warning', title: 'Gentle warning', emotion: 'not-okay', pose: 'idle',
      body: 'ข้อมูลยังไม่พอ ผลลัพธ์อาจคลาดเคลื่อน', tone: 'warn' },
    { key: 'success', title: 'Success', emotion: 'very-happy', pose: 'jump',
      body: 'บันทึกแผนเรียบร้อย!', tone: 'ok' }
  ];

  STATES.forEach(function (s) {
    var card = document.createElement('article');
    card.className = 'card' + (s.tone ? ' card--' + s.tone : '');

    var art = document.createElement('div');
    art.className = 'card__art';
    var holder = document.createElement('div');
    art.appendChild(holder);
    /* Meaningful state → it gets a label a screen reader can use. */
    M.create(holder, { emotion: s.emotion, pose: s.pose, ariaLabel: s.title + ' — ' + s.body });

    var title = document.createElement('h3');
    title.className = 'card__title';
    title.textContent = s.title;

    var body = document.createElement('p');
    body.className = 'card__body';
    body.textContent = s.body;

    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = s.emotion + ' / ' + s.pose;

    card.appendChild(art);
    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(tag);
    $('stateCards').appendChild(card);
  });

  /* ------------------------------------------------------- theme previews */

  [['themeLight', 'light'], ['themeDark', 'dark']].forEach(function (pair) {
    var box = $(pair[0]);
    [
      { emotion: 'smile', pose: 'wave' },
      { emotion: 'neutral', pose: 'think' },
      { emotion: 'very-happy', pose: 'celebrate' },
      { emotion: 'dislike', pose: 'idle' }
    ].forEach(function (s) {
      var holder = document.createElement('div');
      box.appendChild(holder);
      M.create(holder, s);
    });
  });

  /* ------------------------------------------------------------ turnaround */

  M.VIEWS.forEach(function (v) {
    var box = document.createElement('div');
    box.className = 'view';
    var holder = document.createElement('div');
    holder.style.width = '100%';
    box.appendChild(holder);
    var caption = document.createElement('span');
    caption.textContent = v.label;
    box.appendChild(caption);
    M.create(holder, { emotion: 'neutral', pose: 'idle', view: v.id });
    $('viewRow').appendChild(box);
  });

  /* ----------------------------------------------------------- theme swap */

  var toggle = $('themeToggle');
  toggle.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    toggle.setAttribute('aria-pressed', String(next === 'dark'));
    $('themeToggleLabel').textContent = next === 'dark' ? 'Light' : 'Dark';
  });

  render();
})();
