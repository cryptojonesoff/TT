// Rotating line-art globe for the homepage hero — real coastlines (not a
// dot-matrix texture), drawn with d3-geo's orthographic projection onto a
// 2D canvas. Compact avatar pills float next to each visible marker with a
// thin leader line back to its dot, matching the "operators" reference.
// No build step on this site, so d3-geo / topojson / the world outline are
// all loaded from a CDN at runtime.
//
// Real current TT ecosystem items only (no more placeholder network / no
// more fundraise-backer category) — update this list directly as missions
// and projects change. Shape: name/category/place + lat/lng.
const ITEMS = [
  { name: 'SF&WF', category: 'Project', place: 'Siargao', lat: 9.86, lng: 126.05 },
  { name: 'Siargao Loop', category: 'Mission', place: 'Siargao', lat: 9.78, lng: 126.02 },
  { name: 'Lokal Lingo', category: 'Project', place: 'Siargao', lat: 9.93, lng: 126.1 },
  { name: 'Cookbook', category: 'Project', place: 'Melbourne', lat: -37.8136, lng: 144.9631 },
];

const CATEGORY_COLORS = {
  Mission: '#7A2436', // --accent
  Project: '#9C7A3E', // warm gold
};

const SPHERE_COLOR = '#FBF9F5'; // barely off-white — a whisper of warmth, not a filled shape
const COAST_COLOR = '#B8B0A2'; // light warm grey line-art, matches the reference's thin coastlines
const RING_COLOR = 'rgba(0,0,0,0.16)';
const LEADER_COLOR = 'rgba(0,0,0,0.18)';

const ROTATE_SPEED = 0.09; // degrees per frame — slow, calm drift
const TILT = -22;
const START_LNG = -175; // Pacific-centered start view — tweak this to nudge the initial framing
const LEADER_GAP = 22; // CSS px between a marker dot and its pill

// "live ledger" pill cycling — a dot + its pill only exist together, briefly,
// so the globe never looks cluttered even though it's a small, tight set.
const MAX_ACTIVE_LABELS = 2;
const LABEL_DURATION = 2600; // ms a pill stays up once popped in
const SPAWN_MIN = 900; // ms between pop-ins
const SPAWN_MAX = 1700;
const MIN_LABEL_DIST = 90; // CSS px — candidates too close to an active pill are skipped

function makeLabel(point) {
  const color = CATEGORY_COLORS[point.category];

  const el = document.createElement('div');
  el.className = 'globe-label';

  const avatar = document.createElement('span');
  avatar.className = 'label-avatar';
  avatar.style.background = color;

  const name = document.createElement('span');
  name.className = 'label-name';
  name.textContent = point.name;

  const type = document.createElement('span');
  type.className = 'label-type';
  type.style.color = color;
  type.textContent = point.category;

  const row1 = document.createElement('span');
  row1.className = 'label-row';
  row1.append(name, type);

  const place = document.createElement('span');
  place.className = 'label-loc';
  place.textContent = point.place;

  const row2 = document.createElement('span');
  row2.className = 'label-row';
  row2.append(place);

  const text = document.createElement('span');
  text.className = 'label-text';
  text.append(row1, row2);

  el.append(avatar, text);
  el.style.opacity = '0';
  return el;
}

async function initGlobe() {
  const canvas = document.getElementById('tt-globe-canvas');
  if (!canvas) return;
  const stage = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  let d3geo, topojson, world;
  try {
    [d3geo, topojson, world] = await Promise.all([
      import('https://esm.sh/d3-geo@3'),
      import('https://esm.sh/topojson-client@3'),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json').then((r) => r.json()),
    ]);
  } catch (err) {
    console.warn('TT globe: failed to load map data', err);
    return;
  }

  const land = topojson.feature(world, world.objects.land);

  const projection = d3geo.geoOrthographic().clipAngle(90);
  const path = d3geo.geoPath(projection, ctx);
  const rotation = [START_LNG, TILT]; // starts on the Pacific/Asia-Australia view (Siargao + Melbourne both in frame)
  const rotatePoint = (p) => d3geo.geoRotation(rotation)(p);

  const markers = ITEMS.map((p) => {
    const el = makeLabel(p);
    stage.appendChild(el);
    return { ...p, color: CATEGORY_COLORS[p.category], r: 4, el, active: false, activatedAt: 0 };
  });

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cssSize = stage.clientWidth;

  function resize() {
    cssSize = stage.clientWidth;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;
  }
  resize();
  new ResizeObserver(resize).observe(stage);

  let pointerDown = null;

  canvas.addEventListener('pointerdown', (e) => {
    pointerDown = e.clientX;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', () => {
    pointerDown = null;
    canvas.style.cursor = 'grab';
  });
  window.addEventListener('pointermove', (e) => {
    if (pointerDown === null) return;
    const dx = e.clientX - pointerDown;
    pointerDown = e.clientX;
    rotation[0] += dx * 0.25;
  });

  let nextSpawnAt = 0;

  let raf;
  function draw(now) {
    const w = canvas.width;
    const h = canvas.height;
    const radius = (Math.min(w, h) / 2) * 0.92;

    projection.scale(radius).translate([w / 2, h / 2]).rotate(rotation);
    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.fillStyle = SPHERE_COLOR;
    ctx.fill();

    ctx.beginPath();
    path(land);
    ctx.strokeStyle = COAST_COLOR;
    ctx.lineWidth = 1 * dpr;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // 1. locate every marker currently on the visible hemisphere
    for (const m of markers) {
      const [rlng, rlat] = rotatePoint([m.lng, m.lat]);
      m.visible = Math.cos((rlat * Math.PI) / 180) * Math.cos((rlng * Math.PI) / 180) > 0;
      if (!m.visible) {
        m.active = false;
        continue;
      }
      const [x, y] = projection([m.lng, m.lat]);
      m.x = x;
      m.y = y;
    }

    // 2. expire pills that have been up long enough
    for (const m of markers) {
      if (m.active && now - m.activatedAt > LABEL_DURATION) m.active = false;
    }

    // 3. pop a new pill in occasionally, skipping spots too close to one already up
    if (now >= nextSpawnAt) {
      const activePoints = markers.filter((m) => m.active);
      if (activePoints.length < MAX_ACTIVE_LABELS) {
        const candidates = markers.filter((m) => {
          if (!m.visible || m.active) return false;
          return activePoints.every((a) => Math.hypot(a.x - m.x, a.y - m.y) / dpr > MIN_LABEL_DIST);
        });
        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          pick.active = true;
          pick.activatedAt = now;
        }
      }
      nextSpawnAt = now + SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    }

    // 4. dot + leader line + pill only exist together, for active markers — nothing
    // lingers on the sphere once a marker's turn ends, so the map never fills up.
    for (const m of markers) {
      if (!m.visible || !m.active) {
        m.el.style.opacity = '0';
        continue;
      }

      const onLeft = m.x / dpr < cssSize / 2;
      const anchorX = m.x + (onLeft ? LEADER_GAP : -LEADER_GAP) * dpr;

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(anchorX, m.y);
      ctx.strokeStyle = LEADER_COLOR;
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();

      m.el.style.left = anchorX / dpr + 'px';
      m.el.style.top = m.y / dpr + 'px';
      m.el.style.transformOrigin = onLeft ? 'left center' : 'right center';
      m.el.style.transform = (onLeft ? 'translate(0, -50%)' : 'translate(-100%, -50%)') + ' scale(1)';
      m.el.style.opacity = '1';
    }

    if (pointerDown === null) rotation[0] += ROTATE_SPEED;
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);

  window.addEventListener('beforeunload', () => cancelAnimationFrame(raf));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}
