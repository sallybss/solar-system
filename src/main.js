import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

const canvas = document.querySelector('#bg');
const labelLayer = document.querySelector('#planet-labels');
const cardTitle = document.querySelector('[data-card-title]');
const cardSubtitle = document.querySelector('[data-card-subtitle]');
const cardFact = document.querySelector('[data-card-fact]');
const nextFactButton = document.querySelector('[data-next-fact]');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
scene.fog = new THREE.FogExp2(0x02040a, 0.0011);

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(-34, 22, 42);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 12;
controls.maxDistance = 220;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xb8c4ff, 0.22);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x8ea2ff, 0x05070d, 0.35);
scene.add(hemisphereLight);

const sunLight = new THREE.PointLight(0xfff1b3, 4.8, 900, 1.4);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const originTarget = new THREE.Vector3(0, 0, 0);

const reusableVector = new THREE.Vector3();
const planets = [];
const celestialBodies = [];
const interactiveTargets = [];

const settings = {
  orbitSpeed: 0.1,
  labels: true,
  autoFocus: true,
};

const planetFacts = {
  Sun: [
    'The Sun contains more than 99 percent of the mass in the Solar System.',
    'Light from the Sun takes about 8 minutes to reach Earth.',
    'The Sun is a star powered by nuclear fusion in its core.',
  ],
  Mercury: [
    'A year on Mercury lasts only 88 Earth days.',
    'Mercury has almost no atmosphere, so temperatures swing from extreme heat to extreme cold.',
    'Despite being the closest planet to the Sun, Mercury is not the hottest planet.',
  ],
  Venus: [
    'Venus is the hottest planet because its thick atmosphere traps heat.',
    'A day on Venus is longer than its year.',
    'Venus spins in the opposite direction compared with most planets in the Solar System.',
  ],
  Earth: [
    'Earth is the only known planet confirmed to support life.',
    'About 71% of Earths surface is covered by water.',
    'Earths atmosphere protects life by blocking much of the Suns harmful radiation.',
  ],
  Mars: [
    'Mars is home to Olympus Mons, the tallest volcano in the Solar System.',
    'Mars has seasons because its axis is tilted, similar to Earth.',
    'Ancient river valleys show that liquid water once flowed on Mars.',
  ],
  Jupiter: [
    'Jupiter is the largest planet in the Solar System.',
    'The Great Red Spot is a storm that has lasted for centuries.',
    'Jupiter has dozens of moons, including Ganymede, the largest moon in the Solar System.',
  ],
  Saturn: [
    'Saturn is famous for its bright ring system made of ice and rock.',
    'Saturn is so low in density that it would float in water if there were an ocean big enough.',
    'Winds on Saturn can reach extremely high speeds.',
  ],
  Uranus: [
    'Uranus rotates on its side, giving it very unusual seasons.',
    'A season on Uranus can last more than 20 Earth years.',
    'Uranus has faint rings, although they are much less dramatic than Saturns.',
  ],
  Neptune: [
    'Neptune has the fastest winds measured in the Solar System.',
    'Neptune was discovered through mathematical prediction before it was directly observed.',
    'One year on Neptune lasts about 165 Earth years.',
  ],
};

const planetDefinitions = [
  {
    name: 'Mercury',
    subtitle: 'Rocky world closest to the Sun',
    size: 0.72,
    distance: 11,
    orbitSpeed: 0.023,
    rotationSpeed: 0.009,
    palette: ['#9f9d97', '#7d766b', '#5d5448'],
    atmosphere: null,
  },
  {
    name: 'Venus',
    subtitle: 'Cloud-covered furnace planet',
    size: 1.1,
    distance: 15,
    orbitSpeed: 0.017,
    rotationSpeed: 0.004,
    palette: ['#d7bc7d', '#b87037', '#86502f'],
    atmosphere: '#f0c68d',
  },
  {
    name: 'Earth',
    subtitle: 'Ocean planet with life',
    size: 1.16,
    distance: 20,
    orbitSpeed: 0.014,
    rotationSpeed: 0.018,
    palette: ['#2b64b8', '#2ea36f', '#f4f2de'],
    atmosphere: '#72b8ff',
  },
  {
    name: 'Mars',
    subtitle: 'Dusty red desert world',
    size: 0.92,
    distance: 26,
    orbitSpeed: 0.011,
    rotationSpeed: 0.015,
    palette: ['#b64d2d', '#8e341f', '#d7a17d'],
    atmosphere: '#d68f73',
  },
  {
    name: 'Jupiter',
    subtitle: 'Gas giant with giant storms',
    size: 2.8,
    distance: 36,
    orbitSpeed: 0.0062,
    rotationSpeed: 0.026,
    palette: ['#d9b38d', '#aa6e46', '#f1deb7'],
    atmosphere: '#d9c0a9',
  },
  {
    name: 'Saturn',
    subtitle: 'Ringed giant of ice and gas',
    size: 2.35,
    distance: 50,
    orbitSpeed: 0.0041,
    rotationSpeed: 0.021,
    palette: ['#d9c59a', '#af916f', '#f2e2c2'],
    atmosphere: '#d9cfb8',
    ring: {
      innerRadius: 3.2,
      outerRadius: 4.9,
      color: '#d8c29b',
    },
  },
  {
    name: 'Uranus',
    subtitle: 'Icy blue planet tilted on its side',
    size: 1.7,
    distance: 64,
    orbitSpeed: 0.0028,
    rotationSpeed: 0.016,
    palette: ['#b4f0ef', '#7cd2d6', '#eaf8fb'],
    atmosphere: '#b3f3ff',
    ring: {
      innerRadius: 2.15,
      outerRadius: 2.7,
      color: '#8acfd6',
    },
  },
  {
    name: 'Neptune',
    subtitle: 'Deep blue planet of violent winds',
    size: 1.62,
    distance: 78,
    orbitSpeed: 0.0019,
    rotationSpeed: 0.017,
    palette: ['#355ee0', '#1d2d89', '#7ca8ff'],
    atmosphere: '#5889ff',
  },
];

function createBandTexture(colors, resolution = 512) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = resolution;
  textureCanvas.height = resolution / 2;
  const context = textureCanvas.getContext('2d');

  const gradient = context.createLinearGradient(0, 0, 0, textureCanvas.height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  context.fillStyle = gradient;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

  for (let y = 0; y < textureCanvas.height; y += 4) {
    const mix = 0.08 + Math.random() * 0.18;
    context.fillStyle = `rgba(255,255,255,${mix})`;
    context.fillRect(0, y, textureCanvas.width, 1);
  }

  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * textureCanvas.width;
    const y = Math.random() * textureCanvas.height;
    const radius = Math.random() * 3.4;
    const alpha = 0.025 + Math.random() * 0.08;
    context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createAtmosphere(color, scale) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(scale, 48, 48),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}

function createOrbitRing(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
  const points = curve
    .getPoints(240)
    .map((point) => new THREE.Vector3(point.x, 0, point.y));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: 0x4c5a7a,
    transparent: true,
    opacity: 0.35,
  });

  const orbit = new THREE.LineLoop(geometry, material);
  orbit.rotation.x = Math.PI * 0.02;
  scene.add(orbit);
}

function createLabelButton(planet) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'planet-label';
  button.textContent = planet.name;
  button.addEventListener('click', () => selectPlanet(planet));
  labelLayer.appendChild(button);
  return button;
}

function createPlanet(definition) {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(definition.size, 64, 64);
  const material = new THREE.MeshStandardMaterial({
    map: createBandTexture(definition.palette),
    roughness: 0.95,
    metalness: 0.02,
  });
  const body = new THREE.Mesh(geometry, material);
  body.castShadow = false;
  body.receiveShadow = false;
  group.add(body);

  if (definition.atmosphere) {
    const atmosphere = createAtmosphere(definition.atmosphere, definition.size * 1.12);
    group.add(atmosphere);
  }

  if (definition.ring) {
    const ringGeometry = new THREE.RingGeometry(
      definition.ring.innerRadius,
      definition.ring.outerRadius,
      96
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: definition.ring.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.45;
    ring.rotation.z = Math.PI * 0.14;
    group.add(ring);
  }

  group.position.set(definition.distance, 0, 0);
  scene.add(group);

  const planet = {
    ...definition,
    mesh: group,
    body,
    angle: Math.random() * Math.PI * 2,
    facts: planetFacts[definition.name],
    factIndex: 0,
  };

  body.userData.planet = planet;
  interactiveTargets.push(body);
  createOrbitRing(definition.distance);
  planet.label = createLabelButton(planet);

  return planet;
}

function createStarfield(count, spread, color, size) {
  const positions = [];
  for (let i = 0; i < count; i += 1) {
    positions.push(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
}

function createSun() {
  const group = new THREE.Group();

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(5.8, 96, 96),
    new THREE.MeshBasicMaterial({ color: 0xffc85c })
  );

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(7.2, 96, 96),
    new THREE.MeshBasicMaterial({
      color: 0xff9f2f,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(6.4, 96, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffdd7a,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );

  group.add(sun);
  group.add(innerGlow);
  group.add(outerGlow);
  scene.add(group);

  const sunBody = {
    name: 'Sun',
    subtitle: 'The star at the center of the Solar System',
    size: 5.8,
    mesh: group,
    body: sun,
    facts: planetFacts.Sun,
    factIndex: 0,
  };

  sun.userData.planet = sunBody;
  interactiveTargets.push(sun);
  sunBody.label = createLabelButton(sunBody);
  celestialBodies.push(sunBody);

  return { group, sun, outerGlow, innerGlow, body: sunBody };
}

function updateCard(planet) {
  cardTitle.textContent = planet.name;
  cardSubtitle.textContent = planet.subtitle;
  cardFact.textContent = planet.facts[planet.factIndex];
}

function selectPlanet(planet) {
  celestialBodies.forEach((item) => {
    item.label.classList.toggle('is-active', item === planet);
  });

  updateCard(planet);
  selectedPlanet = planet;
}

function setNextFact() {
  if (!selectedPlanet) {
    return;
  }

  selectedPlanet.factIndex = (selectedPlanet.factIndex + 1) % selectedPlanet.facts.length;
  updateCard(selectedPlanet);
}

function updateLabels() {
  celestialBodies.forEach((planet) => {
    if (!settings.labels) {
      planet.label.classList.add('is-hidden');
      return;
    }

    reusableVector.setFromMatrixPosition(planet.mesh.matrixWorld);
    reusableVector.y += planet.size * 1.8;
    reusableVector.project(camera);

    const visible = reusableVector.z < 1;
    if (!visible) {
      planet.label.classList.add('is-hidden');
      return;
    }

    const x = (reusableVector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-reusableVector.y * 0.5 + 0.5) * window.innerHeight;

    planet.label.classList.remove('is-hidden');
    planet.label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });
}

function onPointerDown(event) {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersections = raycaster.intersectObjects(interactiveTargets);
  if (intersections.length > 0) {
    selectPlanet(intersections[0].object.userData.planet);
  }
}

const gui = new GUI({ title: 'Controls' });
gui.add(settings, 'orbitSpeed', 0, 3, 0.1).name('Orbit Speed');
gui.add(settings, 'labels').name('Planet Labels');
gui.add(settings, 'autoFocus').name('Auto Focus');

const sunParts = createSun();
createStarfield(4500, 780, 0xcdd7ff, 0.18);
createStarfield(900, 340, 0xffffff, 0.26);

let selectedPlanet = null;

planetDefinitions.forEach((definition) => {
  const planet = createPlanet(definition);
  planets.push(planet);
  celestialBodies.push(planet);
});

selectPlanet(planets.find((planet) => planet.name === 'Earth') ?? planets[0]);

nextFactButton.addEventListener('click', setNextFact);
renderer.domElement.addEventListener('pointerdown', onPointerDown);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  requestAnimationFrame(animate);

  sunParts.sun.rotation.y += 0.0015;
  sunParts.innerGlow.rotation.y -= 0.001;
  sunParts.outerGlow.rotation.y += 0.0007;

  planets.forEach((planet) => {
    planet.angle += planet.orbitSpeed * settings.orbitSpeed;
    planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
    planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    planet.mesh.rotation.y += planet.rotationSpeed;
  });

  if (selectedPlanet && settings.autoFocus) {
    controls.target.lerp(selectedPlanet.mesh.position, 0.045);
  } else {
    controls.target.lerp(originTarget, 0.02);
  }

  updateLabels();
  controls.update();
  renderer.render(scene, camera);
}

animate();
