// Rotating line-art globe for the homepage hero — real coastlines (not a
// dot-matrix texture), drawn with d3-geo's orthographic projection onto a
// 2D canvas, with floating info pills for each marker (matching the "live
// network" reference). No build step on this site, so d3-geo / topojson /
// the world outline are all loaded from a CDN at runtime.
//
// All data below is placeholder — swap for real ones later, the shape
// (name/date or name/amount + lat/lng) is meant to stay stable.

// "event" — TT missions / IRL gatherings (independent from fundraise, no arcs between them)
const EVENTS = [
  { name: 'Siargao Mission', date: 'Feb 15, 2026', lat: 9.86, lng: 126.05 },
  { name: 'Byron Bay Mission', date: 'Nov 3, 2025', lat: -28.6474, lng: 153.602 },
  { name: 'Lisbon Mission', date: 'Mar 22, 2026', lat: 38.7223, lng: -9.1393 },
  { name: 'Cape Town Mission', date: 'Aug 9, 2025', lat: -33.9249, lng: 18.4241 },
  { name: 'Tulum Mission', date: 'May 30, 2026', lat: 20.2114, lng: -87.4654 },
];

// "fundraise" — financial backers, spread across continents
const FUNDRAISE = [
  { name: 'Paris, France', amount: '$4,200', lat: 48.8566, lng: 2.3522 },
  { name: 'New York, USA', amount: '$9,800', lat: 40.7128, lng: -74.006 },
  { name: 'Singapore', amount: '$6,100', lat: 1.3521, lng: 103.8198 },
  { name: 'São Paulo, Brazil', amount: '$3,450', lat: -23.5505, lng: -46.6333 },
];

const EVENT_COLOR = '#7A2436'; // --accent
const FUNDRAISE_COLOR = '#9C7A3E'; // deeper gold, reads against the blush sphere

const SPHERE_COLOR = '#E8DBD8'; // --bg-blush — pops off the cream page without going to black
const GRATICULE_COLOR = 'rgba(0,0,0,0.05)';
const COAST_COLOR = '#8A8880'; // matches --map-coast used on the Siargao route map
const RING_COLOR = 'rgba(122,36,54,0.35)'; // --accent, low opacity

const ROTATE_SPEED = 0.045; // degrees per frame
const TILT = -22;

function makeLabel(point, kind) {
  const el = document.createElement('div');
  el.className = 'globe-label ' + kind;
  const title = document.createElement('span');
  title.className = 'label-title';
  const sub = document.createElement('span');
  sub.className = 'label-sub';
  if (kind === 'event') {
    title.textContent = point.name;
    sub.textContent = point.date;
  } else {
    title.textContent = point.name;
    sub.textContent = 'pledged ' + point.amount;
  }
  el.append(title, sub);
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
  const graticule = d3geo.geoGraticule10();

  const projection = d3geo.geoOrthographic().clipAngle(90);
  const path = d3geo.geoPath(projection, ctx);
  const rotation = [0, TILT];
  const rotatePoint = (p) => d3geo.geoRotation(rotation)(p);

  const markers = [
    ...EVENTS.map((p) => ({ ...p, kind: 'event', color: EVENT_COLOR, r: 4.5 })),
    ...FUNDRAISE.map((p) => ({ ...p, kind: 'fundraise', color: FUNDRAISE_COLOR, r: 3.5 })),
  ].map((m) => {
    const el = makeLabel(m, m.kind);
    stage.appendChild(el);
    return { ...m, el };
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

  let raf;
  function draw() {
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
    path(graticule);
    ctx.strokeStyle = GRATICULE_COLOR;
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.beginPath();
    path(land);
    ctx.strokeStyle = COAST_COLOR;
    ctx.lineWidth = 1.3 * dpr;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    for (const m of markers) {
      const [rlng, rlat] = rotatePoint([m.lng, m.lat]);
      const visible = Math.cos((rlat * Math.PI) / 180) * Math.cos((rlng * Math.PI) / 180) > 0;
      m.el.style.opacity = visible ? '1' : '0';
      if (!visible) continue;

      const [x, y] = projection([m.lng, m.lat]);

      ctx.beginPath();
      ctx.arc(x, y, m.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();

      const cx = x / dpr;
      const cy = y / dpr;
      m.el.style.left = cx + 'px';
      m.el.style.top = cy + 'px';
      m.el.style.transform = cx < cssSize / 2 ? 'translate(12px, -50%)' : 'translate(calc(-100% - 12px), -50%)';
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
