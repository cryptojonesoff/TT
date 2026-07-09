// Rotating line-art globe for the homepage hero — real coastlines (not a
// dot-matrix texture), drawn with d3-geo's orthographic projection onto a
// 2D canvas. Compact avatar pills float next to each visible marker with a
// thin leader line back to its dot, matching the "operators" reference.
// No build step on this site, so d3-geo / topojson / the world outline are
// all loaded from a CDN at runtime.
//
// All data below is placeholder — swap for real ones later, the shape
// (name/place/date or person/place/amount + lat/lng) is meant to stay stable.

// "event" — TT missions / IRL initiatives (independent from fundraise, no arcs between them)
// SF&WF, Siargao Loop and Family Style are all real TT initiatives based out of Siargao —
// kept at distinct nearby points on the island rather than one stacked marker.
const EVENTS = [
  { name: 'SF&WF', place: 'Siargao', date: "Feb '26", lat: 9.86, lng: 126.05 },
  { name: 'Siargao Loop', place: 'Siargao', date: "Nov '25", lat: 9.78, lng: 126.02 },
  { name: 'Family Style', place: 'Siargao', date: "Mar '26", lat: 9.93, lng: 126.1 },
  { name: 'Ubuntu Table', place: 'Cape Town', date: "Aug '25", lat: -33.9249, lng: 18.4241 },
  { name: 'Casa Comal', place: 'Tulum', date: "May '26", lat: 20.2114, lng: -87.4654 },
  { name: 'Beach Kitchen', place: 'Byron Bay', date: "Oct '25", lat: -28.6474, lng: 153.602 },
  { name: 'Mesa Aberta', place: 'Lisbon', date: "Jun '26", lat: 38.7223, lng: -9.1393 },
];

// "fundraise" — financial backers, spread across continents
const FUNDRAISE = [
  { person: 'Camille B.', place: 'Paris', amount: '$4,200', lat: 48.8566, lng: 2.3522 },
  { person: 'Marcus T.', place: 'New York', amount: '$9,800', lat: 40.7128, lng: -74.006 },
  { person: 'Wei L.', place: 'Singapore', amount: '$6,100', lat: 1.3521, lng: 103.8198 },
  { person: 'Isabela R.', place: 'São Paulo', amount: '$3,450', lat: -23.5505, lng: -46.6333 },
  { person: 'Amara K.', place: 'Nairobi', amount: '$2,900', lat: -1.2921, lng: 36.8219 },
];

const EVENT_COLOR = '#7A2436'; // --accent
const FUNDRAISE_COLOR = '#9C7A3E'; // deeper gold

const SPHERE_COLOR = '#FBF9F5'; // barely off-white — a whisper of warmth, not a filled shape
const COAST_COLOR = '#B8B0A2'; // light warm grey line-art, matches the reference's thin coastlines
const RING_COLOR = 'rgba(0,0,0,0.16)';
const LEADER_COLOR = 'rgba(0,0,0,0.18)';

const ROTATE_SPEED = 0.3; // degrees per frame
const TILT = -22;
const LEADER_GAP = 22; // CSS px between a marker dot and its pill

// "live ledger" pill cycling — dots stay put, but only a couple of pills
// pop in/out at a time so nearby markers (e.g. the Siargao cluster) never
// stack on top of each other.
const MAX_ACTIVE_LABELS = 2;
const LABEL_DURATION = 2600; // ms a pill stays up once popped in
const SPAWN_MIN = 900; // ms between pop-ins
const SPAWN_MAX = 1700;
const MIN_LABEL_DIST = 90; // CSS px — candidates too close to an active pill are skipped

function makeLabel(point, kind) {
  const el = document.createElement('div');
  el.className = 'globe-label ' + kind;

  const avatar = document.createElement('span');
  avatar.className = 'label-avatar';
  avatar.textContent = kind === 'fundraise' ? point.person.charAt(0) : '';

  const name = document.createElement('span');
  name.className = 'label-name';
  name.textContent = kind === 'event' ? point.name : point.person;

  const place = document.createElement('span');
  place.className = 'label-loc';
  place.textContent = point.place;

  const value = document.createElement('span');
  value.className = 'label-amt';
  value.textContent = kind === 'event' ? point.date : point.amount;

  el.append(avatar, name, place, value);
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
  const rotation = [0, TILT];
  const rotatePoint = (p) => d3geo.geoRotation(rotation)(p);

  const markers = [
    ...EVENTS.map((p) => ({ ...p, kind: 'event', color: EVENT_COLOR, r: 4 })),
    ...FUNDRAISE.map((p) => ({ ...p, kind: 'fundraise', color: FUNDRAISE_COLOR, r: 4 })),
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

  for (const m of markers) {
    m.active = false;
    m.activatedAt = 0;
  }
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

    // 4. draw every visible dot, but only wire up leader line + pill for active ones
    for (const m of markers) {
      if (!m.visible) {
        m.el.style.opacity = '0';
        continue;
      }

      const onLeft = m.x / dpr < cssSize / 2;

      if (m.active) {
        const anchorX = m.x + (onLeft ? LEADER_GAP : -LEADER_GAP) * dpr;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(anchorX, m.y);
        ctx.strokeStyle = LEADER_COLOR;
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();

        m.el.style.left = anchorX / dpr + 'px';
        m.el.style.top = m.y / dpr + 'px';
        m.el.style.transformOrigin = onLeft ? 'left center' : 'right center';
        m.el.style.transform = (onLeft ? 'translate(0, -50%)' : 'translate(-100%, -50%)') + ' scale(1)';
        m.el.style.opacity = '1';
      } else {
        m.el.style.opacity = '0';
        m.el.style.transform = (onLeft ? 'translate(0, -50%)' : 'translate(-100%, -50%)') + ' scale(0.85)';
      }

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r * dpr, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
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
