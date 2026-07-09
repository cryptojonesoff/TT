// Dotted 3D globe for the homepage hero (Anthropic-homepage-style: dark
// sphere of points, slow auto-rotation, marker pins joined by animated arcs).
// Loads `cobe` from a CDN since this site has no build step / bundler.
//
// All locations below are placeholder data — swap for real ones later,
// the shape (name/lat/lng) is meant to stay stable.
import createGlobe from 'https://cdn.jsdelivr.net/npm/cobe@2.0.1/dist/index.esm.js';

// "event" — TT missions / IRL gatherings
const EVENT_LOCATIONS = [
  { name: 'Siargao, Philippines', lat: 9.86, lng: 126.05 },
  { name: 'Byron Bay, Australia', lat: -28.6474, lng: 153.602 },
  { name: 'Lisbon, Portugal', lat: 38.7223, lng: -9.1393 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lng: 18.4241 },
  { name: 'Tulum, Mexico', lat: 20.2114, lng: -87.4654 },
];

// "fundraise" — financial backers, spread across continents
const FUNDRAISE_LOCATIONS = [
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.006 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333 },
];

const EVENT_COLOR = [0.478, 0.141, 0.212]; // matches --accent (#7A2436)
const FUNDRAISE_COLOR = [0.306, 0.612, 0.525]; // teal/sage

// fundraise → event flows, max 5, purely illustrative
const ARC_LINKS = [
  ['Paris, France', 'Siargao, Philippines'],
  ['New York, USA', 'Tulum, Mexico'],
  ['Singapore', 'Siargao, Philippines'],
  ['São Paulo, Brazil', 'Cape Town, South Africa'],
  ['Paris, France', 'Byron Bay, Australia'],
];

function findPoint(name) {
  return [...EVENT_LOCATIONS, ...FUNDRAISE_LOCATIONS].find((p) => p.name === name);
}

const MARKERS = [
  ...EVENT_LOCATIONS.map((p) => ({ location: [p.lat, p.lng], size: 0.06, color: EVENT_COLOR })),
  ...FUNDRAISE_LOCATIONS.map((p) => ({ location: [p.lat, p.lng], size: 0.045, color: FUNDRAISE_COLOR })),
];

const ARCS = ARC_LINKS.map(([from, to]) => {
  const a = findPoint(from);
  const b = findPoint(to);
  return { from: [a.lat, a.lng], to: [b.lat, b.lng], color: FUNDRAISE_COLOR };
});

function initGlobe() {
  const canvas = document.getElementById('tt-globe-canvas');
  if (!canvas) return;

  const stage = canvas.parentElement;
  let phi = 0;
  let pointerDown = null;
  let pointerMove = 0;
  let width = stage.clientWidth;

  const globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width: width * 2,
    height: width * 2,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 4,
    baseColor: [0.12, 0.12, 0.14],
    markerColor: EVENT_COLOR,
    glowColor: [0.25, 0.25, 0.3],
    opacity: 0.9,
    markers: MARKERS,
    arcs: ARCS,
    arcColor: FUNDRAISE_COLOR,
    arcWidth: 1.4,
    arcHeight: 0.3,
  });

  new ResizeObserver(([entry]) => {
    width = entry.contentRect.width;
    globe.update({ width: width * 2, height: width * 2 });
  }).observe(stage);

  let raf;
  (function animate() {
    if (pointerDown === null) phi += 0.0022;
    globe.update({ phi: phi + pointerMove });
    raf = requestAnimationFrame(animate);
  })();

  canvas.addEventListener('pointerdown', (e) => {
    pointerDown = e.clientX - pointerMove;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('pointerup', () => {
    pointerDown = null;
    canvas.style.cursor = 'grab';
  });
  window.addEventListener('pointermove', (e) => {
    if (pointerDown === null) return;
    pointerMove = (e.clientX - pointerDown) * 0.005;
  });

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(raf);
    globe.destroy();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobe);
} else {
  initGlobe();
}
