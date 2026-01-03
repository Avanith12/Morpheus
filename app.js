const container = document.getElementById('canvas-container');
let scene, camera, renderer, composer, bloomPass, controls, pane;
let particles = [];
let particleSystem, connectionSystem, starfield, trailSystems = [];
let audioContext, analyser, dataArray;
let gravityWell = { active: false, x: 0, y: 0, strength: 0, type: 'attract' };
let textPoints = [];

const config = {
  count: 250,
  range: 400,
  pointSize: 4.0,
  bloomStrength: 1.5,
  autoRotate: true,
  isStorm: false,
  audioActive: false,
  shape: 'Cloud',
  theme: 'Deep Ocean',
  trailsEnabled: true,
  gravityStrength: 2.0,
  morphSpeed: 0.03,
  rainbowMode: false,
  connectionPulse: false,
  backgroundGradient: true,
  particleSizeVariation: true,
  customText: 'MORPHEUS',
  colors: {
    node: new THREE.Color(0x00f2fe),
    pulse: new THREE.Color(0xffffff)
  }
};

function generateTextPoints(text, count) {
  const canvas = document.createElement('canvas');
  const size = 600;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Impact, Arial Black`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), size / 2, size / 2);

  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels = [];

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const i = (y * size + x) * 4;
      if (imageData.data[i] > 200) {
        pixels.push({
          x: (x - size / 2) * 1.5,
          y: -(y - size / 2) * 1.5,
          z: 0
        });
      }
    }
  }

  if (pixels.length === 0) {
    return [{ x: 0, y: 0, z: 0 }];
  }

  return pixels;
}

const morphTargets = {
  'Cloud': (i, total) => new THREE.Vector3(
    (Math.random() - 0.5) * config.range * 2,
    (Math.random() - 0.5) * config.range * 2,
    (Math.random() - 0.5) * config.range * 2
  ),
  'Sphere': (i, total) => {
    const phi = Math.acos(-1 + (2 * i) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 300;
    return new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    );
  },
  'Cube': (i, total) => {
    const sideCount = Math.ceil(Math.pow(total, 1 / 3));
    const spacing = 500 / sideCount;
    const x = (i % sideCount) - sideCount / 2;
    const y = (Math.floor(i / sideCount) % sideCount) - sideCount / 2;
    const z = Math.floor(i / (sideCount * sideCount)) - sideCount / 2;
    return new THREE.Vector3(x * spacing, y * spacing, z * spacing);
  },
  'Torus': (i, total) => {
    const u = (i / total) * Math.PI * 2;
    const v = ((i * 7) % total / total) * Math.PI * 2;
    const R = 300, r = 120;
    return new THREE.Vector3(
      (R + r * Math.cos(v)) * Math.cos(u),
      (R + r * Math.cos(v)) * Math.sin(u),
      r * Math.sin(v)
    );
  },
  'DNA': (i, total) => {
    const t = (i / total) * Math.PI * 8;
    const radius = 150;
    const height = 600;
    const strand = i % 2;
    const offset = strand * Math.PI;

    return new THREE.Vector3(
      radius * Math.cos(t + offset),
      (i / total) * height - height / 2,
      radius * Math.sin(t + offset)
    );
  },
  'Spiral': (i, total) => {
    const t = (i / total) * Math.PI * 6;
    const radius = 50 + (i / total) * 250;
    const height = 600;

    return new THREE.Vector3(
      radius * Math.cos(t),
      (i / total) * height - height / 2,
      radius * Math.sin(t)
    );
  },
  'Heart': (i, total) => {
    const t = (i / total) * Math.PI * 2;
    const scale = 150;

    const x = scale * 16 * Math.pow(Math.sin(t), 3);
    const y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const z = (Math.random() - 0.5) * 50;

    return new THREE.Vector3(x, y - 100, z);
  },
  'Star': (i, total) => {
    const angle = (i / total) * Math.PI * 2;
    const outerRadius = 300;
    const innerRadius = 150;
    const spikes = 5;
    const spikeAngle = angle * spikes;
    const isOuter = Math.floor(i / (total / (spikes * 2))) % 2 === 0;
    const radius = isOuter ? outerRadius : innerRadius;

    return new THREE.Vector3(
      radius * Math.cos(spikeAngle),
      radius * Math.sin(spikeAngle),
      (Math.random() - 0.5) * 50
    );
  },
  'Infinity': (i, total) => {
    const t = (i / total) * Math.PI * 2;
    const scale = 200;

    const x = scale * Math.cos(t) / (1 + Math.pow(Math.sin(t), 2));
    const y = scale * Math.sin(t) * Math.cos(t) / (1 + Math.pow(Math.sin(t), 2));
    const z = (Math.random() - 0.5) * 30;

    return new THREE.Vector3(x, y, z);
  },
  'Text': (i, total) => {
    if (textPoints.length === 0) {
      textPoints = generateTextPoints(config.customText, total);
    }
    const point = textPoints[i % textPoints.length];
    return new THREE.Vector3(point.x, point.y, point.z);
  }
};

const themes = {
  'Deep Ocean': {
    node: 0x00f2fe,
    bg: '#050a0f',
    gradientTop: '#0a1420',
    gradientBottom: '#020508'
  },
  'Cyber Pulse': {
    node: 0xf5576c,
    bg: '#120510',
    gradientTop: '#1a0815',
    gradientBottom: '#080308'
  },
  'Frozen Void': {
    node: 0x74ebd5,
    bg: '#050f15',
    gradientTop: '#0a1820',
    gradientBottom: '#020608'
  }
};

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
  camera.position.z = 800;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;

  const renderPass = new THREE.RenderPass(scene, camera);
  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );

  composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);

  createStarfield();
  setupTweakpane();
  createNetwork();
  animate();
}

function createStarfield() {
  const starCount = 1000;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const radius = 2000 + Math.random() * 1000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = radius * Math.cos(phi);

    const brightness = 0.5 + Math.random() * 0.5;
    starColors[i * 3] = brightness;
    starColors[i * 3 + 1] = brightness;
    starColors[i * 3 + 2] = brightness;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  starfield = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true
  }));
  scene.add(starfield);
}

function setupTweakpane() {
  pane = new Tweakpane.Pane({ title: 'Morpheus' });

  const atmosphere = pane.addFolder({ title: 'Atmosphere', expanded: true });
  atmosphere.addInput(config, 'theme', {
    options: {
      'Deep Ocean': 'Deep Ocean',
      'Cyber Pulse': 'Cyber Pulse',
      'Frozen Void': 'Frozen Void'
    }
  }).on('change', applyTheme);
  atmosphere.addInput(config, 'bloomStrength', { min: 0, max: 4, label: 'Bloom Glow' })
    .on('change', (e) => { bloomPass.strength = e.value; });
  atmosphere.addInput(config, 'audioActive', { label: 'Audio Reactive' })
    .on('change', setupAudio);
  atmosphere.addInput(config, 'rainbowMode', { label: 'Rainbow Colors' });

  const geometry = pane.addFolder({ title: 'Geometry', expanded: true });
  geometry.addInput(config, 'shape', {
    options: {
      'Cloud': 'Cloud',
      'Sphere': 'Sphere',
      'Cube': 'Cube',
      'Torus': 'Torus',
      'DNA': 'DNA',
      'Spiral': 'Spiral',
      'Heart': 'Heart',
      'Star': 'Star',
      'Infinity': 'Infinity'
    }
  }).on('change', updateMorphTargets);

  geometry.addInput(config, 'customText', { label: 'Custom Text' })
    .on('change', () => {
      if (config.shape === 'Text') {
        textPoints = [];
        updateMorphTargets();
      }
    });

  geometry.addInput(config, 'count', { min: 50, max: 500, step: 10, label: 'Node Count' })
    .on('change', () => createNetwork());
  geometry.addInput(config, 'pointSize', { min: 1, max: 15, label: 'Node Size' })
    .on('change', (e) => { if (particleSystem) particleSystem.material.size = e.value; });
  geometry.addInput(config, 'morphSpeed', { min: 0.001, max: 0.1, label: 'Morph Speed' });
  geometry.addInput(config, 'isStorm', { label: 'Storm Mode' });

  const effects = pane.addFolder({ title: 'Effects', expanded: true });
  effects.addInput(config, 'trailsEnabled', { label: 'Particle Trails' });
  effects.addInput(config, 'connectionPulse', { label: 'Connection Pulse' });
  effects.addInput(config, 'backgroundGradient', { label: 'Background Gradient' })
    .on('change', applyTheme);
  effects.addInput(config, 'particleSizeVariation', { label: 'Size Variation' });
  effects.addInput(config, 'gravityStrength', { min: 0, max: 5, label: 'Gravity Power' });

  const cameraFolder = pane.addFolder({ title: 'Camera', expanded: true });
  cameraFolder.addInput(config, 'autoRotate', { label: 'Auto Rotate' })
    .on('change', (e) => { controls.autoRotate = e.value; });

  pane.addButton({ title: 'Neural Explosion' }).on('click', triggerExplosion);
  pane.addButton({ title: 'Screenshot' }).on('click', captureScreenshot);
}

function captureScreenshot() {
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `morpheus-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}

function applyTheme(e) {
  const themeName = e ? e.value : config.theme;
  const theme = themes[themeName];

  if (config.backgroundGradient) {
    document.body.style.background = `linear-gradient(180deg, ${theme.gradientTop} 0%, ${theme.gradientBottom} 100%)`;
  } else {
    document.body.style.background = theme.bg;
  }

  config.colors.node = new THREE.Color(theme.node);

  if (particleSystem) {
    const colors = particleSystem.geometry.attributes.color;
    for (let i = 0; i < config.count; i++) {
      config.colors.node.toArray(colors.array, i * 3);
    }
    colors.needsUpdate = true;
  }
}

function updateMorphTargets() {
  particles.forEach((p, i) => {
    p.targetPos = morphTargets[config.shape](i, config.count);
  });
}

function createNetwork() {
  if (particleSystem) {
    scene.remove(particleSystem);
    particleSystem.geometry.dispose();
    particleSystem.material.dispose();
  }
  if (connectionSystem) {
    scene.remove(connectionSystem);
    connectionSystem.geometry.dispose();
    connectionSystem.material.dispose();
  }

  trailSystems.forEach(trail => {
    scene.remove(trail);
    trail.geometry.dispose();
    trail.material.dispose();
  });
  trailSystems = [];

  particles = [];
  const positions = new Float32Array(config.count * 3);
  const colors = new Float32Array(config.count * 3);

  for (let i = 0; i < config.count; i++) {
    const targetPos = morphTargets[config.shape](i, config.count);
    targetPos.toArray(positions, i * 3);
    config.colors.node.toArray(colors, i * 3);

    particles.push({
      pos: targetPos.clone(),
      targetPos: targetPos.clone(),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      connections: [],
      pulses: [],
      trail: []
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  particleSystem = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: config.pointSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true
  }));
  scene.add(particleSystem);

  const linePositions = [];
  const lineColors = [];

  particles.forEach((p, i) => {
    const nearby = particles
      .map((other, idx) => ({ idx, dist: p.pos.distanceTo(other.pos) }))
      .filter(item => item.idx !== i && item.dist < 200)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);

    nearby.forEach(({ idx }) => {
      const other = particles[idx];
      p.connections.push(other);
      linePositions.push(p.pos.x, p.pos.y, p.pos.z, other.pos.x, other.pos.y, other.pos.z);
      const dimColor = config.colors.node.clone().multiplyScalar(0.3);
      dimColor.toArray(lineColors, lineColors.length);
      dimColor.toArray(lineColors, lineColors.length);
    });
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors), 3));

  connectionSystem = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.25
  }));
  scene.add(connectionSystem);
}

function setupAudio(e) {
  if (e.value && !audioContext) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
      })
      .catch(err => console.error('Microphone access denied:', err));
  }
}

function triggerExplosion() {
  particles.forEach(p => {
    const force = new THREE.Vector3(
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500,
      (Math.random() - 0.5) * 1500
    );
    p.pos.add(force);
  });
}

function animate() {
  requestAnimationFrame(animate);

  if (starfield) {
    starfield.rotation.y += 0.0001;
    starfield.rotation.x += 0.00005;
  }

  if (config.audioActive && analyser) {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length;
    const boost = avg / 128.0;

    bloomPass.strength = config.bloomStrength + boost * 2.5;
    particleSystem.material.size = config.pointSize + boost * 8.0;
  }

  const positions = particleSystem.geometry.attributes.position.array;
  const colors = particleSystem.geometry.attributes.color.array;

  particles.forEach((p, i) => {
    if (gravityWell.active) {
      const dx = gravityWell.x - p.pos.x;
      const dy = gravityWell.y - p.pos.y;
      const dz = -p.pos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist > 0) {
        const force = (gravityWell.type === 'attract' ? 1 : -1) *
          (gravityWell.strength * config.gravityStrength) / (dist * 0.1);
        p.vel.x += (dx / dist) * force;
        p.vel.y += (dy / dist) * force;
        p.vel.z += (dz / dist) * force;
      }
    }

    const morphStrength = config.shape === 'Text' ? 0.15 : config.morphSpeed;
    p.pos.lerp(p.targetPos, morphStrength);

    if (config.isStorm) {
      p.pos.x += (Math.random() - 0.5) * 8;
      p.pos.y += (Math.random() - 0.5) * 8;
      p.pos.z += (Math.random() - 0.5) * 8;
    } else if (config.shape !== 'Text') {
      p.pos.add(p.vel);
      p.vel.multiplyScalar(0.98);
    }

    if (config.trailsEnabled && i % 3 === 0) {
      p.trail.push(p.pos.clone());
      if (p.trail.length > 20) p.trail.shift();

      if (p.trail.length > 1 && trailSystems.length < 50) {
        const trailPositions = [];
        p.trail.forEach(pos => trailPositions.push(pos.x, pos.y, pos.z));

        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));

        const trailMaterial = new THREE.LineBasicMaterial({
          color: config.colors.node,
          transparent: true,
          opacity: 0.3
        });

        const trail = new THREE.Line(trailGeometry, trailMaterial);
        scene.add(trail);
        trailSystems.push(trail);

        setTimeout(() => {
          scene.remove(trail);
          trail.geometry.dispose();
          trail.material.dispose();
          const idx = trailSystems.indexOf(trail);
          if (idx > -1) trailSystems.splice(idx, 1);
        }, 2000);
      }
    }

    p.pos.toArray(positions, i * 3);

    p.pulses = p.pulses.filter(pulse => pulse.life > 0);
    if (p.pulses.length > 0) {
      p.pulses.forEach(pulse => pulse.life -= 0.02);
      config.colors.pulse.toArray(colors, i * 3);
    } else if (config.rainbowMode) {
      const hue = ((i / config.count) + Date.now() * 0.0001) % 1;
      const rainbow = new THREE.Color().setHSL(hue, 1.0, 0.6);
      rainbow.toArray(colors, i * 3);
    } else {
      config.colors.node.toArray(colors, i * 3);
    }
  });

  particleSystem.geometry.attributes.position.needsUpdate = true;
  particleSystem.geometry.attributes.color.needsUpdate = true;

  const linePositions = connectionSystem.geometry.attributes.position.array;
  const lineColors = connectionSystem.geometry.attributes.color.array;
  let idx = 0;
  let colorIdx = 0;
  const pulseTime = Date.now() * 0.001;

  particles.forEach(p => {
    p.connections.forEach((conn, connIdx) => {
      linePositions[idx++] = p.pos.x;
      linePositions[idx++] = p.pos.y;
      linePositions[idx++] = p.pos.z;
      linePositions[idx++] = conn.pos.x;
      linePositions[idx++] = conn.pos.y;
      linePositions[idx++] = conn.pos.z;

      if (config.connectionPulse) {
        const pulsePhase = (pulseTime + connIdx * 0.1) % 1;
        const brightness = 0.2 + Math.sin(pulsePhase * Math.PI * 2) * 0.3;
        const pulseColor = config.colors.node.clone().multiplyScalar(brightness);
        pulseColor.toArray(lineColors, colorIdx);
        pulseColor.toArray(lineColors, colorIdx + 3);
        colorIdx += 6;
      }
    });
  });
  connectionSystem.geometry.attributes.position.needsUpdate = true;
  if (config.connectionPulse) {
    connectionSystem.geometry.attributes.color.needsUpdate = true;
  }

  controls.update();
  composer.render();
}

function firePulse(particle) {
  if (particle.pulses.length > 2) return;
  particle.pulses.push({ life: 1.0 });
  particle.connections.forEach(conn => {
    if (Math.random() > 0.5) {
      setTimeout(() => firePulse(conn), 200 + Math.random() * 200);
    }
  });
}

const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 20;
const mouse = new THREE.Vector2();
const mouseWorld = new THREE.Vector3();

window.addEventListener('mousedown', (event) => {
  if (event.target.closest('.tp-dfwv')) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    gravityWell.active = true;
    gravityWell.x = mouseWorld.x;
    gravityWell.y = mouseWorld.y;
    gravityWell.strength = 1;
    gravityWell.type = event.button === 2 || event.ctrlKey ? 'repel' : 'attract';
    return;
  }

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(particleSystem);

  if (intersects.length > 0) {
    const idx = intersects[0].index;
    firePulse(particles[idx]);
  }
});

window.addEventListener('mousemove', (event) => {
  if (gravityWell.active) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    raycaster.ray.intersectPlane(plane, mouseWorld);

    gravityWell.x = mouseWorld.x;
    gravityWell.y = mouseWorld.y;
  }
});

window.addEventListener('mouseup', () => {
  if (gravityWell.active) {
    gravityWell.active = false;
  }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('load', init);
