/* ==========================================================================
   Дослідник Сонячної системи — інтерактивність
   Компоненти (за архітектурною схемою):
     Data      — масив PLANETS (локальні об’єкти, без сервера)
     Visual    — сцена Three.js / WebGL (initScene)
     Logic     — стан, керування часом, вибір планети, картка
     Frontend  — зв’язок із DOM
   ========================================================================== */
(() => {
  'use strict';

  /* ======================================================================
     DATA. Характеристики наближені, за відкритими матеріалами NASA.
     radius / orbit — УМОВНІ одиниці сцени (не в масштабі).
     periodDays — справжній орбітальний період, тому відносні швидкості
     планет на моделі відповідають реальним.
     ====================================================================== */
  const PLANETS = [
    {
      id: 'mercury', name: 'Меркурій',
      color: '#9a9a9a', c1: '#c4c0b8', c2: '#6f6c68',
      radius: 0.9, orbit: 15, periodDays: 88, startAngle: 0.6, spin: 0.15, tilt: 0.0,
      tex: { base: '#8d8a86', blotches: ['#6c6a67', '#aaa59d', '#7c7873'], blotchCount: 70 },
      description: 'Найменша планета й найближча до Сонця. Майже не має атмосфери, тому різниця між денною та нічною температурами величезна.',
      facts: {
        diameter: '4 879 км', distance: '57,9 млн км',
        day: '58,6 земної доби', dayNote: 'оберт навколо осі',
        year: '88 земних діб', temp: '+167 °C', tempNote: 'у середньому', moons: '0',
      },
    },
    {
      id: 'venus', name: 'Венера',
      color: '#e0b66f', c1: '#f3d9a2', c2: '#b88a45',
      radius: 1.5, orbit: 20, periodDays: 224.7, startAngle: 2.4, spin: -0.05, tilt: 3.09,
      tex: { base: '#dcb577', bands: ['#ecd3a0', '#c79a58', '#e3c288'], bandAlpha: [0.25, 0.5] },
      description: 'Найгарячіша планета: густа атмосфера з вуглекислого газу створює сильний парниковий ефект. Обертається у зворотний бік порівняно з більшістю планет.',
      facts: {
        diameter: '12 104 км', distance: '108,2 млн км',
        day: '243 земні доби', dayNote: 'оберт навколо осі',
        year: '224,7 земної доби', temp: '+464 °C', tempNote: 'на поверхні', moons: '0',
      },
    },
    {
      id: 'earth', name: 'Земля',
      color: '#3f86d6', c1: '#78b6f2', c2: '#1f4f94',
      radius: 1.6, orbit: 26, periodDays: 365.25, startAngle: 4.1, spin: 0.9, tilt: 0.41,
      tex: { base: '#1f5fae', blotches: ['#3f8f4a', '#6f8f3f', '#8a7a46', '#2f7d3a'], blotchCount: 38, clouds: true },
      description: 'Наш дім і єдина відома планета з життям. Понад дві третини її поверхні вкриті водою.',
      facts: {
        diameter: '12 742 км', distance: '149,6 млн км',
        day: '24 години', dayNote: 'точніше 23 год 56 хв',
        year: '365,25 доби', temp: '+15 °C', tempNote: 'у середньому', moons: '1',
      },
    },
    {
      id: 'mars', name: 'Марс',
      color: '#d2693a', c1: '#ee9a6a', c2: '#8f3a1c',
      radius: 1.2, orbit: 32, periodDays: 687, startAngle: 5.3, spin: 0.88, tilt: 0.44,
      tex: { base: '#b9532c', blotches: ['#8a3a1c', '#d6885c', '#9c4524'], blotchCount: 60, caps: true },
      description: 'Холодна пустельна планета з тонкою атмосферою. Червоний колір їй дає оксид заліза в ґрунті. Тут розташована найвища гора Сонячної системи — вулкан Олімп.',
      facts: {
        diameter: '6 779 км', distance: '227,9 млн км',
        day: '24 год 37 хв', dayNote: '',
        year: '687 земних діб', temp: '−63 °C', tempNote: 'у середньому', moons: '2',
      },
    },
    {
      id: 'jupiter', name: 'Юпітер',
      color: '#d4b08a', c1: '#ecd3b0', c2: '#9c7550',
      radius: 3.7, orbit: 45, periodDays: 4333, startAngle: 1.2, spin: 1.7, tilt: 0.05,
      tex: { base: '#cfae86', bands: ['#b58a62', '#ecdcc0', '#a3764f', '#d9bb94'], bandAlpha: [0.35, 0.8], redSpot: true },
      description: 'Найбільша планета Сонячної системи — газовий гігант, у якому помістилися б понад тисячу Земель. Велика червона пляма — атмосферний шторм, що триває століттями.',
      facts: {
        diameter: '139 820 км', distance: '778,5 млн км',
        day: '9,9 години', dayNote: '',
        year: '≈ 4 333 земні доби', yearNote: '≈ 11,9 року',
        temp: '≈ −110 °C', tempNote: 'на рівні верхніх хмар', moons: 'понад 100',
      },
    },
    {
      id: 'saturn', name: 'Сатурн',
      color: '#e2cf9c', c1: '#f4e7c3', c2: '#a98f58',
      radius: 3.2, orbit: 59, periodDays: 10759, startAngle: 3.5, spin: 1.5, tilt: 0.47, ring: true,
      tex: { base: '#e1cd9a', bands: ['#cdb27a', '#efe0b8', '#bfa56c'], bandAlpha: [0.25, 0.6] },
      description: 'Газовий гігант із найпомітнішою системою кілець, що складаються переважно з крижаних уламків. Середня густина Сатурна менша за густину води.',
      facts: {
        diameter: '116 460 км', distance: '1 434 млн км',
        day: '10,7 години', dayNote: '',
        year: '≈ 10 759 земних діб', yearNote: '≈ 29,4 року',
        temp: '≈ −140 °C', tempNote: 'на рівні верхніх хмар', moons: 'понад 280',
      },
    },
    {
      id: 'uranus', name: 'Уран',
      color: '#8fd6dc', c1: '#c3f0f2', c2: '#4f9aa3',
      radius: 2.3, orbit: 72, periodDays: 30687, startAngle: 0.2, spin: -0.9, tilt: 1.71,
      tex: { base: '#8ed4da', bands: ['#a3e1e6', '#7cc3cb'], bandAlpha: [0.15, 0.35] },
      description: 'Крижаний гігант, що обертається майже «лежачи на боці»: вісь нахилена приблизно на 98°. Блакитно-зелений колір створює метан в атмосфері.',
      facts: {
        diameter: '50 724 км', distance: '2 871 млн км',
        day: '17 год 14 хв', dayNote: 'зворотне обертання',
        year: '≈ 30 687 земних діб', yearNote: '≈ 84 роки',
        temp: '≈ −195 °C', tempNote: 'на рівні верхніх хмар', moons: '29',
      },
    },
    {
      id: 'neptune', name: 'Нептун',
      color: '#4a6fe0', c1: '#86a4f6', c2: '#2539a0',
      radius: 2.2, orbit: 84, periodDays: 60190, startAngle: 4.8, spin: 0.95, tilt: 0.49,
      tex: { base: '#3f64d8', bands: ['#2f4fb8', '#5d84ec', '#3a5bc8'], bandAlpha: [0.2, 0.5] },
      description: 'Найвіддаленіша планета. Темно-синій крижаний гігант, на якому дмуть найшвидші вітри Сонячної системи.',
      facts: {
        diameter: '49 244 км', distance: '4 495 млн км',
        day: '16 год 6 хв', dayNote: '',
        year: '≈ 60 190 земних діб', yearNote: '≈ 165 років',
        temp: '≈ −200 °C', tempNote: 'на рівні верхніх хмар', moons: '16',
      },
    },
  ];

  const SUN = { name: 'Сонце', radius: 7 };

  /* Швидкості (FR-05: щонайменше три режими) */
  const SPEEDS = [
    { value: 0.5, label: '×0,5', title: 'Повільно' },
    { value: 1,   label: '×1',   title: 'Нормально' },
    { value: 3,   label: '×3',   title: 'Швидко' },
    { value: 5,   label: '×5',   title: 'Дуже швидко' },
  ];
  const DEFAULT_SPEED = 1;

  const DAYS_PER_SECOND = 30; // за швидкості ×1: 1 с реального часу = 30 земних діб моделі
  const MIN_RADIUS_OVERVIEW = 16;
  const MIN_RADIUS_ABSOLUTE = 2.5;
  const MAX_RADIUS = 460;
  const TAU = Math.PI * 2;

  /* ======================================================================
     LOGIC. Спільний стан
     ====================================================================== */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    paused: reduceMotion,   // користувачі зі зменшеним рухом починають із паузи
    autoPaused: false,      // паузу поставила картка, а не користувач
    speed: DEFAULT_SPEED,
    timeScale: reduceMotion ? 0 : DEFAULT_SPEED, // згладжений множник часу
    simDays: 0,
    selected: null,
  };

  const byId = Object.fromEntries(PLANETS.map((p) => [p.id, p]));
  const $ = (id) => document.getElementById(id);

  const dom = {
    stage: $('model'), canvas: $('canvas'), labels: $('labels'),
    loading: $('loading'), fallback: $('fallback'),
    intro: $('intro'), introStart: $('intro-start'),
    list: $('planet-list'),
    play: $('btn-play'), pause: $('btn-pause'), speedGroup: $('speed-group'), simTime: $('sim-time'),
    zoomIn: $('zoom-in'), zoomOut: $('zoom-out'), zoomSlider: $('zoom-slider'),
    card: $('info-card'), cardClose: $('card-close'), cardVisual: $('card-visual'),
    cardTitle: $('card-title'), cardDesc: $('card-desc'), cardStats: $('card-stats'),
  };

  let scene3d = null;      // API сцени (або null, якщо WebGL недоступний)
  let lastTrigger = null;  // елемент, що відкрив картку — для повернення фокуса
  let hideCardTimer = 0;

  /* ---------- Список планет ---------- */
  function buildPlanetList() {
    const frag = document.createDocumentFragment();
    PLANETS.forEach((p) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'planet-btn';
      btn.dataset.id = p.id;
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="name"></span>';
      btn.querySelector('.dot').style.setProperty('--c', p.color);
      btn.querySelector('.name').textContent = p.name;
      btn.addEventListener('click', () => {
        if (state.selected === p.id) closeCard();
        else selectPlanet(p.id, btn);
      });
      li.appendChild(btn);
      frag.appendChild(li);
    });
    dom.list.appendChild(frag);
  }

  function syncListUI() {
    dom.list.querySelectorAll('.planet-btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.id === state.selected));
    });
  }

  /* ---------- Інформаційна картка (FR-04) ---------- */
  function renderCard(p) {
    dom.cardTitle.textContent = p.name;
    dom.cardDesc.textContent = p.description;

    dom.cardVisual.style.setProperty('--c1', p.c1);
    dom.cardVisual.style.setProperty('--c2', p.c2);
    dom.cardVisual.style.setProperty('--glow', p.c2 + '66');
    dom.cardVisual.classList.toggle('has-ring', !!p.ring);

    const f = p.facts;
    const rows = [
      ['Діаметр', f.diameter],
      ['Середня відстань від Сонця', f.distance],
      ['Тривалість доби', f.day, f.dayNote],
      ['Тривалість року', f.year, f.yearNote],
      ['Середня температура', f.temp, f.tempNote],
      ['Відомих супутників', f.moons],
    ];
    dom.cardStats.textContent = '';
    rows.forEach(([label, value, note]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      if (note) {
        const small = document.createElement('small');
        small.textContent = ' · ' + note;
        dd.appendChild(small);
      }
      row.append(dt, dd);
      dom.cardStats.appendChild(row);
    });
  }

  function openCardEl() {
    window.clearTimeout(hideCardTimer);
    dom.card.hidden = false;
    dom.stage.classList.add('has-card');
    // кадр для запуску CSS-переходу
    requestAnimationFrame(() => requestAnimationFrame(() => dom.card.classList.add('is-open')));
  }

  function closeCardEl() {
    dom.card.classList.remove('is-open');
    dom.stage.classList.remove('has-card');
    hideCardTimer = window.setTimeout(() => { dom.card.hidden = true; }, reduceMotion ? 0 : 300);
  }

  /* ---------- Вибір планети: фокус камери + автопауза + картка ---------- */
  function selectPlanet(id, trigger) {
    const p = byId[id];
    if (!p) return;

    hideIntro();
    if (trigger) lastTrigger = trigger;

    if (state.selected === null && !state.paused) {
      state.paused = true;
      state.autoPaused = true;
    }
    state.selected = id;

    renderCard(p);
    openCardEl();
    syncListUI();
    syncTimeUI();
    if (scene3d) scene3d.focus(id);

    dom.card.scrollTop = 0;
    dom.card.focus({ preventScroll: true });
  }

  function closeCard() {
    if (state.selected === null) return;
    state.selected = null;

    // Рух відновлюється лише якщо його зупинила сама картка
    if (state.autoPaused) {
      state.paused = false;
      state.autoPaused = false;
    }

    closeCardEl();
    syncListUI();
    syncTimeUI();
    if (scene3d) scene3d.unfocus();

    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    else if (!dom.stage.classList.contains('no-3d')) dom.canvas.focus({ preventScroll: true });
    lastTrigger = null;
  }

  /* ---------- Керування часом (FR-05, FR-07) ---------- */
  function buildSpeedButtons() {
    SPEEDS.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'speed-btn';
      b.dataset.value = String(s.value);
      b.textContent = s.label;
      b.title = s.title;
      b.setAttribute('aria-label', `${s.title}, ${s.label}`);
      b.addEventListener('click', () => { state.speed = s.value; syncTimeUI(); });
      dom.speedGroup.appendChild(b);
    });
  }

  function setPaused(value) {
    state.paused = value;
    state.autoPaused = false; // користувач узяв керування на себе
    syncTimeUI();
  }

  function syncTimeUI() {
    dom.play.setAttribute('aria-pressed', String(!state.paused));
    dom.pause.setAttribute('aria-pressed', String(state.paused));
    dom.speedGroup.querySelectorAll('.speed-btn').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.value) === state.speed));
    });
  }

  function updateSimTime() {
    const years = (state.simDays / 365.25).toFixed(1).replace('.', ',');
    const days = Math.floor(state.simDays).toLocaleString('uk-UA');
    dom.simTime.textContent = `${years} р. · ${days} діб`;
  }

  /* ---------- Вступ ---------- */
  function hideIntro() {
    dom.intro.classList.add('is-hidden');
  }

  /* ======================================================================
     VISUAL. Сцена Three.js
     ====================================================================== */
  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Процедурні текстури: без зовнішніх зображень, миттєве завантаження */
  function makePlanetTexture(def, seed) {
    const W = 512, H = 256;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const rnd = mulberry32(seed);
    const t = def.tex;

    ctx.fillStyle = t.base;
    ctx.fillRect(0, 0, W, H);

    if (t.bands) {
      const [a0, a1] = t.bandAlpha || [0.3, 0.6];
      for (let y = 0; y < H;) {
        const h = 3 + rnd() * 16;
        ctx.globalAlpha = a0 + rnd() * (a1 - a0);
        ctx.fillStyle = t.bands[Math.floor(rnd() * t.bands.length)];
        ctx.fillRect(0, y, W, h);
        y += h * (0.6 + rnd() * 0.5);
      }
    }

    if (t.blotches) {
      for (let i = 0; i < (t.blotchCount || 40); i++) {
        ctx.globalAlpha = 0.25 + rnd() * 0.45;
        ctx.fillStyle = t.blotches[Math.floor(rnd() * t.blotches.length)];
        const x = rnd() * W, y = 20 + rnd() * (H - 40);
        const rx = 6 + rnd() * 30, ry = 4 + rnd() * 16;
        for (const dx of [-W, 0, W]) { // безшовність по довготі
          ctx.beginPath();
          ctx.ellipse(x + dx, y, rx, ry, rnd() * Math.PI, 0, TAU);
          ctx.fill();
        }
      }
    }

    if (t.clouds) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 45; i++) {
        ctx.globalAlpha = 0.12 + rnd() * 0.25;
        const x = rnd() * W, y = rnd() * H;
        ctx.beginPath();
        ctx.ellipse(x, y, 18 + rnd() * 40, 3 + rnd() * 7, 0, 0, TAU);
        ctx.fill();
      }
    }

    if (t.redSpot) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#b5532e';
      ctx.beginPath();
      ctx.ellipse(W * 0.62, H * 0.64, 26, 13, 0, 0, TAU);
      ctx.fill();
    }

    if (t.caps) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#f4f6f8';
      ctx.fillRect(0, 0, W, 9);
      ctx.fillRect(0, H - 9, W, 9);
    }

    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function makeSunTexture() {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S; c.height = S / 2;
    const ctx = c.getContext('2d');
    const rnd = mulberry32(7);
    ctx.fillStyle = '#ffb21a';
    ctx.fillRect(0, 0, S, S / 2);
    const colors = ['#ff9a00', '#ffd04d', '#ff8200', '#ffe08a'];
    for (let i = 0; i < 220; i++) {
      ctx.globalAlpha = 0.18 + rnd() * 0.3;
      ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
      ctx.beginPath();
      ctx.ellipse(rnd() * S, rnd() * S / 2, 3 + rnd() * 14, 2 + rnd() * 8, 0, 0, TAU);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeGlowTexture() {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255, 220, 140, 0.95)');
    g.addColorStop(0.25, 'rgba(255, 170, 60, 0.45)');
    g.addColorStop(0.6, 'rgba(255, 120, 30, 0.12)');
    g.addColorStop(1, 'rgba(255, 100, 20, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  }

  function initScene() {
    const canvas = dom.canvas;
    const container = canvas.parentElement;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0B0E14);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 3500);

    /* Освітлення: Сонце + слабке навколишнє, щоб нічні боки не були чорними */
    scene.add(new THREE.AmbientLight(0x8fa3c8, 0.38));
    scene.add(new THREE.PointLight(0xffffff, 1.5, 0, 1));

    /* Зоряне тло */
    {
      const N = 1800;
      const pos = new Float32Array(N * 3);
      const rnd = mulberry32(42);
      for (let i = 0; i < N; i++) {
        const u = rnd() * 2 - 1, th = rnd() * TAU, r = 1400 + rnd() * 600;
        const s = Math.sqrt(1 - u * u);
        pos[i * 3] = r * s * Math.cos(th);
        pos[i * 3 + 1] = r * u;
        pos[i * 3 + 2] = r * s * Math.sin(th);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false });
      scene.add(new THREE.Points(g, m));
    }

    /* Сонце */
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN.radius, 48, 32),
      new THREE.MeshBasicMaterial({ map: makeSunTexture() })
    );
    scene.add(sun);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    glow.scale.setScalar(SUN.radius * 5.2);
    scene.add(glow);

    /* Планети та орбіти */
    // вихідне кодування sRGB: кольори ліній і кілець переводимо в лінійний простір, щоб збігалися з палітрою
    const srgb = (hex) => new THREE.Color(hex).convertSRGBToLinear();
    const ORBIT_COLOR = srgb(0x19C8FF);
    const ACTIVE_COLOR = srgb(0xFF6A1F);
    const bodies = [];

    PLANETS.forEach((def, i) => {
      // орбіта
      const pts = [];
      const SEG = 256;
      for (let k = 0; k < SEG; k++) {
        const a = (k / SEG) * TAU;
        pts.push(new THREE.Vector3(Math.cos(a) * def.orbit, 0, -Math.sin(a) * def.orbit));
      }
      const orbitMat = new THREE.LineBasicMaterial({ color: ORBIT_COLOR, transparent: true, opacity: 0.38 });
      const orbitLine = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), orbitMat);
      scene.add(orbitLine);

      // планета
      const group = new THREE.Group();
      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.z = def.tilt;
      group.add(tiltGroup);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(def.radius, 48, 32),
        new THREE.MeshStandardMaterial({ map: makePlanetTexture(def, 100 + i * 13), roughness: 0.92, metalness: 0 })
      );
      tiltGroup.add(mesh);

      if (def.ring) {
        const inner = def.radius * 1.45, outer = def.radius * 2.45;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(inner, outer, 96),
          new THREE.MeshBasicMaterial({ color: srgb(0xd9c797), side: THREE.DoubleSide, transparent: true, opacity: 0.72, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2;
        tiltGroup.add(ring);
      }

      // невидима сфера для зручного кліку по малих об’єктах
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 8),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      hit.userData.id = def.id;
      group.add(hit);

      scene.add(group);

      // підпис
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = def.name;
      dom.labels.appendChild(label);

      bodies.push({ def, group, mesh, hit, orbitMat, label });
    });

    // підпис Сонця
    const sunLabel = document.createElement('span');
    sunLabel.className = 'label';
    sunLabel.textContent = SUN.name;
    dom.labels.appendChild(sunLabel);

    /* Кільце-виділення вибраної планети (завжди повернуте до камери) */
    const marker = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1, 64),
      new THREE.MeshBasicMaterial({ color: srgb(0xFF6A1F), transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthTest: false })
    );
    marker.renderOrder = 10;
    marker.visible = false;
    scene.add(marker);

    /* ---------- Камера ---------- */
    const cam = {
      theta: 0.6, phi: 1.12, radius: 130, target: new THREE.Vector3(),
      dTheta: 0.6, dPhi: 1.12, dRadius: 130, dTarget: new THREE.Vector3(),
      focus: null, viewShift: 0,
    };
    const size = { w: 1, h: 1 };
    let userZoomed = false; // не скидаємо масштаб користувача під час зміни розміру вікна

    const overviewRadius = () => Math.min(MAX_RADIUS, Math.max(125, 210 / Math.max(size.w / size.h, 0.25)));
    const minRadius = () => (cam.focus ? Math.max(cam.focus.def.radius * 2.4, MIN_RADIUS_ABSOLUTE) : MIN_RADIUS_OVERVIEW);
    const clampRadius = (r) => Math.min(MAX_RADIUS, Math.max(minRadius(), r));

    function sliderFromRadius(r) {
      const lo = Math.log(MIN_RADIUS_ABSOLUTE), hi = Math.log(MAX_RADIUS);
      return Math.round((1 - (Math.log(r) - lo) / (hi - lo)) * 100);
    }
    function radiusFromSlider(v) {
      const lo = Math.log(MIN_RADIUS_ABSOLUTE), hi = Math.log(MAX_RADIUS);
      return Math.exp(lo + (1 - v / 100) * (hi - lo));
    }
    function syncSlider() {
      dom.zoomSlider.value = String(sliderFromRadius(cam.dRadius));
    }

    function resize() {
      const w = Math.max(container.clientWidth, 1), h = Math.max(container.clientHeight, 1);
      size.w = w; size.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!cam.focus && !userZoomed) { cam.dRadius = clampRadius(overviewRadius()); syncSlider(); }
    }
    cam.radius = cam.dRadius = overviewRadius();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container);
    else window.addEventListener('resize', resize);
    resize();
    cam.radius = cam.dRadius;
    syncSlider();

    /* ---------- Взаємодія: обертання, масштаб, вибір ---------- */
    const pointers = new Map();
    let pinchDist = 0;
    let downInfo = null;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hoverPending = null;

    function pickAt(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(bodies.map((b) => b.hit), false);
      return hits.length ? hits[0].object.userData.id : null;
    }

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) downInfo = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
      else downInfo = null; // жест двома пальцями — не клік
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
      hideIntro();
    });

    canvas.addEventListener('pointermove', (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) { hoverPending = { x: e.clientX, y: e.clientY }; return; }

      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;

      if (pointers.size === 1) {
        cam.dTheta -= dx * 0.0062;
        cam.dPhi = Math.min(Math.PI - 0.12, Math.max(0.12, cam.dPhi - dy * 0.0062));
        if (downInfo) downInfo.moved += Math.abs(dx) + Math.abs(dy);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0 && d > 0) {
          cam.dRadius = clampRadius(cam.dRadius * (pinchDist / d));
          userZoomed = true;
          syncSlider();
        }
        pinchDist = d;
      }
    });

    function endPointer(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (e.type === 'pointerup' && downInfo && pointers.size === 0) {
        const quick = performance.now() - downInfo.t < 450;
        if (downInfo.moved < 6 && quick) {
          const id = pickAt(e.clientX, e.clientY);
          if (id) selectPlanet(id, canvas);
        }
      }
      if (pointers.size === 0) downInfo = null;
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', () => { hoverPending = null; canvas.classList.remove('is-hover'); });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const k = e.deltaMode === 1 ? 0.05 : 0.0012;
      cam.dRadius = clampRadius(cam.dRadius * Math.exp(e.deltaY * k));
      userZoomed = true;
      syncSlider();
      hideIntro();
    }, { passive: false });

    canvas.addEventListener('keydown', (e) => {
      const step = 0.12;
      let handled = true;
      switch (e.key) {
        case 'ArrowLeft':  cam.dTheta += step; break;
        case 'ArrowRight': cam.dTheta -= step; break;
        case 'ArrowUp':    cam.dPhi = Math.max(0.12, cam.dPhi - step); break;
        case 'ArrowDown':  cam.dPhi = Math.min(Math.PI - 0.12, cam.dPhi + step); break;
        case '+': case '=': zoomBy(0.8); break;
        case '-': case '_': zoomBy(1.25); break;
        default: handled = false;
      }
      if (handled) { e.preventDefault(); hideIntro(); }
    });

    function zoomBy(factor) {
      userZoomed = true;
      cam.dRadius = clampRadius(cam.dRadius * factor);
      syncSlider();
    }

    /* ---------- Публічне API сцени ---------- */
    function focus(id) {
      const body = bodies.find((b) => b.def.id === id);
      if (!body) return;
      cam.focus = body;
      cam.dRadius = clampRadius(body.def.radius * (body.def.ring ? 7 : 5.5));
      syncSlider();
      bodies.forEach((b) => {
        const active = b === body;
        b.orbitMat.color.copy(active ? ACTIVE_COLOR : ORBIT_COLOR);
        b.orbitMat.opacity = active ? 0.9 : 0.2;
        b.label.classList.toggle('is-active', active);
      });
      marker.visible = true;
    }

    function unfocus() {
      cam.focus = null;
      userZoomed = false;
      cam.dTarget.set(0, 0, 0);
      cam.dRadius = clampRadius(overviewRadius());
      syncSlider();
      bodies.forEach((b) => {
        b.orbitMat.color.copy(ORBIT_COLOR);
        b.orbitMat.opacity = 0.38;
        b.label.classList.remove('is-active');
      });
      marker.visible = false;
    }

    /* ---------- Головний цикл (орієнтація на 60 кадрів/с) ---------- */
    const v = new THREE.Vector3();
    let last = performance.now();
    let firstFrame = true;
    let simTimeTick = 0;

    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      // плавна зміна швидкості та паузи — без різких стрибків
      const target = state.paused ? 0 : state.speed;
      state.timeScale += (target - state.timeScale) * (1 - Math.exp(-6 * dt));
      if (Math.abs(state.timeScale - target) < 0.002) state.timeScale = target;

      state.simDays += dt * DAYS_PER_SECOND * state.timeScale;

      sun.rotation.y += 0.03 * dt * state.timeScale;

      bodies.forEach((b) => {
        const a = b.def.startAngle + TAU * (state.simDays / b.def.periodDays);
        b.group.position.set(Math.cos(a) * b.def.orbit, 0, -Math.sin(a) * b.def.orbit);
        b.mesh.rotation.y += b.def.spin * dt * state.timeScale * 2.2;
      });

      // камера
      const kf = 1 - Math.exp(-5 * dt);
      if (cam.focus) cam.dTarget.copy(cam.focus.group.position);
      cam.target.lerp(cam.dTarget, cam.focus ? 1 - Math.exp(-9 * dt) : kf);
      cam.theta += (cam.dTheta - cam.theta) * kf;
      cam.phi += (cam.dPhi - cam.phi) * kf;
      cam.radius += (cam.dRadius - cam.radius) * kf;

      const sp = Math.sin(cam.phi);
      camera.position.set(
        cam.target.x + cam.radius * sp * Math.cos(cam.theta),
        cam.target.y + cam.radius * Math.cos(cam.phi),
        cam.target.z + cam.radius * sp * Math.sin(cam.theta)
      );
      camera.lookAt(cam.target);

      // зсув кадру: вибрана планета не ховається під карткою (лише на широких екранах)
      const wantShift = cam.focus && size.w > 720 ? 180 : 0;
      cam.viewShift += (wantShift - cam.viewShift) * kf;
      if (Math.abs(cam.viewShift) > 0.5) {
        camera.setViewOffset(size.w, size.h, cam.viewShift, 0, size.w, size.h);
      } else if (camera.view && camera.view.enabled) {
        camera.clearViewOffset();
      }
      camera.updateMatrixWorld();

      // області кліку та виділення
      bodies.forEach((b) => {
        const dist = camera.position.distanceTo(b.group.position);
        b.hit.scale.setScalar(Math.max(b.def.radius * 1.5, dist * 0.028));
      });
      if (cam.focus) {
        const dist = camera.position.distanceTo(cam.focus.group.position);
        marker.position.copy(cam.focus.group.position);
        marker.quaternion.copy(camera.quaternion);
        marker.scale.setScalar(Math.max(cam.focus.def.radius * (cam.focus.def.ring ? 2.9 : 1.55), dist * 0.022));
      }

      // підписи
      const placeLabel = (el, pos, dy) => {
        v.copy(pos).project(camera);
        if (v.z > 1 || v.z < -1) { el.style.visibility = 'hidden'; return; }
        const x = (v.x * 0.5 + 0.5) * size.w, y = (-v.y * 0.5 + 0.5) * size.h;
        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + dy).toFixed(1)}px, 0) translateX(-50%)`;
      };
      bodies.forEach((b) => {
        const dist = camera.position.distanceTo(b.group.position);
        const px = (b.def.radius / (dist * Math.tan(0.436))) * size.h * 0.5; // приблизний екранний радіус
        placeLabel(b.label, b.group.position, Math.max(px, 4) + 8);
      });
      const sunPx = (SUN.radius / (camera.position.length() * Math.tan(0.436))) * size.h * 0.5;
      placeLabel(sunLabel, sun.position, Math.max(sunPx, 6) + 10);

      // курсор «вказівник» над планетою
      if (hoverPending && pointers.size === 0) {
        canvas.classList.toggle('is-hover', !!pickAt(hoverPending.x, hoverPending.y));
        hoverPending = null;
      }

      renderer.render(scene, camera);

      simTimeTick += dt;
      if (simTimeTick > 0.25) { simTimeTick = 0; updateSimTime(); }

      if (firstFrame) {
        firstFrame = false;
        dom.loading.classList.add('is-done');
      }
    }
    requestAnimationFrame((t) => { last = t; frame(t); });

    // втрата контексту WebGL — повідомляємо користувача, сайт не «падає» (NFR-03)
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); showFallback(); });

    return {
      focus, unfocus, zoomBy,
      setZoomFromSlider: (val) => { userZoomed = true; cam.dRadius = clampRadius(radiusFromSlider(Number(val))); },
    };
  }

  /* ---------- Запасний режим (NFR-03) ---------- */
  function showFallback() {
    dom.stage.classList.add('no-3d');
    dom.fallback.hidden = false;
    dom.loading.classList.add('is-done');
    dom.canvas.style.display = 'none';
    dom.labels.style.display = 'none';
    scene3d = null;
  }

  /* ======================================================================
     Frontend: прив’язка подій та запуск
     ====================================================================== */
  function bindUI() {
    dom.play.addEventListener('click', () => setPaused(false));
    dom.pause.addEventListener('click', () => setPaused(true));

    dom.cardClose.addEventListener('click', closeCard);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.selected !== null) closeCard();
    });

    dom.introStart.addEventListener('click', () => {
      hideIntro();
      const first = dom.list.querySelector('.planet-btn');
      if (first) first.focus({ preventScroll: true });
    });

    dom.zoomIn.addEventListener('click', () => scene3d && scene3d.zoomBy(0.78));
    dom.zoomOut.addEventListener('click', () => scene3d && scene3d.zoomBy(1.28));
    dom.zoomSlider.addEventListener('input', (e) => scene3d && scene3d.setZoomFromSlider(e.target.value));
  }

  function init() {
    buildPlanetList();
    buildSpeedButtons();
    bindUI();
    syncTimeUI();
    updateSimTime();

    if (typeof THREE === 'undefined' || !hasWebGL()) {
      showFallback();
      return;
    }
    try {
      scene3d = initScene();
    } catch (err) {
      console.error('Не вдалося ініціалізувати 3D-сцену:', err);
      showFallback();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();