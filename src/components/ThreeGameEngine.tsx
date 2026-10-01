import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Camera,
  Flame,
  Gamepad2,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

export type GameArchetype3D = 'car_3d' | 'runner_3d' | 'shooter_3d';

export function detectGameArchetype(text: string): GameArchetype3D {
  const lower = text.toLowerCase();
  if (/\b(runner|run|parkour|temple|subway|dash|jump|hurdle|endless)\b/.test(lower)) {
    return 'runner_3d';
  }
  if (/\b(shoot|shooter|space|starfighter|asteroid|alien|laser|galaxy|cosmic)\b/.test(lower)) {
    return 'shooter_3d';
  }
  return 'car_3d';
}

export function isPlayableGamePrompt(text: string): boolean {
  const lower = text.toLowerCase();
  // Do not treat explicit animated story video prompts as games
  if (
    /\b(animated story|story video|pixar-style animated|sher aur cheenti|chunti|lomri|murga|rooster|kahani)\b/.test(
      lower,
    ) &&
    !/\b(game|playable|car|racing|runner|shooter|d-pad|webgl|three)\b/.test(lower)
  ) {
    return false;
  }
  return /\b(game|gaming|playable|3d\s*car|car\s*game|car\s*3d|racing|race|drive|driving|drift|highway|runner|parkour|surfer|shooter|space\s*shooter|arcade|webgl|three\.?js|d-pad|dpad|khel)\b/.test(
    lower,
  );
}

interface ThreeGameEngineProps {
  title?: string;
  prompt?: string;
  initialMode?: GameArchetype3D;
  compact?: boolean;
  onOpenFullPreview?: () => void;
}

export function ThreeGameEngine({
  title = '3D Turbo Highway Racer',
  prompt = 'Make a 3D car game',
  initialMode,
  compact = false,
  onOpenFullPreview,
}: ThreeGameEngineProps) {
  const detected = initialMode || detectGameArchetype(`${title} ${prompt}`);
  const [gameMode, setGameMode] = useState<GameArchetype3D>(detected);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = window.localStorage.getItem('saz-3d-best-score');
    return saved ? Number(saved) || 0 : 1250;
  });
  const [speedKmh, setSpeedKmh] = useState(165);
  const [nitroPct, setNitroPct] = useState(100);
  const [coinsCount, setCoinsCount] = useState(0);
  const [shieldPct, setShieldPct] = useState(100);
  const [cameraView, setCameraView] = useState<'chase' | 'cockpit' | 'aerial'>('chase');
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [fps, setFps] = useState(60);
  const [restartTrigger, setRestartTrigger] = useState(0);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Live control state shared between Keyboard & Mobile Touch D-Pad
  const controlsRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    action: false, // Nitro / Fire / Jump
  });

  const cameraViewRef = useRef<'chase' | 'cockpit' | 'aerial'>('chase');
  const isPausedRef = useRef(false);

  useEffect(() => {
    setGameMode(detectGameArchetype(`${title} ${prompt}`));
  }, [title, prompt]);

  useEffect(() => {
    cameraViewRef.current = cameraView;
  }, [cameraView]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const cycleCameraView = () => {
    setCameraView((prev) => (prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'aerial' : 'chase'));
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setIsPaused(false);
    setScore(0);
    setCoinsCount(0);
    setShieldPct(100);
    setNitroPct(100);
    setRestartTrigger((t) => t + 1);
  };

  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {});
    }
  };

  const setControl = (key: keyof typeof controlsRef.current, val: boolean) => {
    controlsRef.current[key] = val;
  };

  // Mount actual Three.js WebGL Engine on HTML5 <canvas>
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let cancelled = false;
    let animId = 0;

    const width = Math.max(300, stage.clientWidth || 640);
    const height = Math.max(260, stage.clientHeight || 420);

    const scene = new THREE.Scene();
    const bgHex =
      gameMode === 'car_3d' ? 0x060a17 : gameMode === 'runner_3d' ? 0x080d1f : 0x030612;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, gameMode === 'shooter_3d' ? 0.008 : 0.012);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 260);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Dynamic 3D Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.35);
    sunLight.position.set(18, 36, 24);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const accentPointLight = new THREE.PointLight(0xf59e0b, 2.4, 34);
    accentPointLight.position.set(0, 3, 2);
    scene.add(accentPointLight);

    // Procedural Asphalt Road / Neon Grid Texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 512;
    const tctx = texCanvas.getContext('2d');
    if (tctx) {
      tctx.fillStyle = gameMode === 'shooter_3d' ? '#050814' : '#0f172a';
      tctx.fillRect(0, 0, 512, 512);
      // Glowing shoulder stripes
      tctx.fillStyle = gameMode === 'runner_3d' ? '#10b981' : '#f59e0b';
      tctx.fillRect(10, 0, 14, 512);
      tctx.fillRect(488, 0, 14, 512);
      // Lane dividers
      tctx.fillStyle = '#e2e8f0';
      for (let y = 0; y < 512; y += 64) {
        tctx.fillRect(170, y, 8, 36);
        tctx.fillRect(334, y, 8, 36);
      }
    }
    const roadTexture = new THREE.CanvasTexture(texCanvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 18);

    const roadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 260),
      new THREE.MeshStandardMaterial({
        map: roadTexture,
        roughness: 0.68,
        metalness: 0.2,
      }),
    );
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.z = -95;
    roadMesh.receiveShadow = true;
    if (gameMode !== 'shooter_3d') {
      scene.add(roadMesh);
    }

    const gridHelper = new THREE.GridHelper(
      260,
      65,
      gameMode === 'runner_3d' ? 0x10b981 : 0x0ea5e9,
      0x1e293b,
    );
    gridHelper.position.y = gameMode === 'shooter_3d' ? -6 : -0.04;
    gridHelper.position.z = -95;
    scene.add(gridHelper);

    // 3D Starfield / Scenery Pillars
    const sceneryMeshes: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(2.4, 14, 2.4);
    for (let i = 0; i < 26; i++) {
      const isLeft = i % 2 === 0;
      const pillarMat = new THREE.MeshStandardMaterial({
        color: isLeft ? 0x0f172a : 0x1e1b4b,
        emissive: i % 3 === 0 ? 0x0284c7 : 0xd97706,
        emissiveIntensity: 0.32,
        roughness: 0.4,
        metalness: 0.6,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(isLeft ? -11.2 : 11.2, 6, -i * 10);
      scene.add(pillar);
      sceneryMeshes.push(pillar);
    }

    // Helper: Build Multi-Mesh 3D Sports Car
    const buildSportsCarMesh = (bodyHex: number, isPlayer: boolean) => {
      const carGroup = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: bodyHex,
        metalness: 0.75,
        roughness: 0.22,
      });
      const cabinMat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.92,
        roughness: 0.1,
      });
      const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.85,
      });
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.85,
        roughness: 0.2,
      });

      // Lower sculpted chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.52, 4.1), bodyMat);
      chassis.position.y = 0.5;
      chassis.castShadow = true;
      carGroup.add(chassis);

      // Aerodynamic hood & side skirts
      const hood = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.24, 1.35), bodyMat);
      hood.position.set(0, 0.72, -1.15);
      carGroup.add(hood);

      // Tinted cockpit canopy
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.48, 1.95), cabinMat);
      cabin.position.set(0, 0.96, -0.1);
      cabin.castShadow = true;
      carGroup.add(cabin);

      // Rear racing wing spoiler
      const wing = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.12, 0.44), bodyMat);
      wing.position.set(0, 0.98, 1.78);
      carGroup.add(wing);

      // 4 3D Wheels + Alloy Rims
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.34, 18);
      wheelGeo.rotateZ(Math.PI / 2);
      const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.36, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const wheelCoords: [number, number, number][] = [
        [-1.02, 0.4, -1.28],
        [1.02, 0.4, -1.28],
        [-1.02, 0.4, 1.28],
        [1.02, 0.4, 1.28],
      ];
      wheelCoords.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, wy, wz);
        carGroup.add(wheel);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.set(wx, wy, wz);
        carGroup.add(rim);
      });

      // Headlights & Tail-light LED bar
      const tailMat = new THREE.MeshBasicMaterial({
        color: isPlayer ? 0x38bdf8 : 0xf43f5e,
      });
      const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.16, 0.08), tailMat);
      tailBar.position.set(0, 0.58, isPlayer ? 2.06 : -2.06);
      carGroup.add(tailBar);

      return carGroup;
    };

    // Helper: Build Articulated 3D Cyber Runner Hero
    const buildRunnerHeroMesh = () => {
      const group = new THREE.Group();
      const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.2, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.55, roughness: 0.25 }),
      );
      torso.position.y = 1.45;
      torso.castShadow = true;
      group.add(torso);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.72, 0.72),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.45,
        }),
      );
      head.position.y = 2.45;
      group.add(head);

      const legGeo = new THREE.BoxGeometry(0.34, 0.9, 0.36);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.26, 0.48, 0);
      leftLeg.name = 'leftLeg';
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.26, 0.48, 0);
      rightLeg.name = 'rightLeg';
      group.add(rightLeg);

      return group;
    };

    // Helper: Build 3D Starfighter Mesh
    const buildStarfighterMesh = () => {
      const group = new THREE.Group();
      const hull = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 3.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }),
      );
      hull.rotation.x = -Math.PI / 2;
      hull.position.y = 1.0;
      group.add(hull);

      const wings = new THREE.Mesh(
        new THREE.BoxGeometry(3.8, 0.16, 1.2),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.35,
          metalness: 0.7,
        }),
      );
      wings.position.set(0, 1.0, 0.45);
      group.add(wings);

      const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.08 }),
      );
      cockpit.position.set(0, 1.32, -0.1);
      group.add(cockpit);

      return group;
    };

    const playerGroup =
      gameMode === 'car_3d'
        ? buildSportsCarMesh(0xf59e0b, true)
        : gameMode === 'runner_3d'
          ? buildRunnerHeroMesh()
          : buildStarfighterMesh();
    scene.add(playerGroup);

    // Nitro Flame Cone on Player
    const nitroFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 1.6, 12),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),
    );
    nitroFlame.rotation.x = Math.PI / 2;
    nitroFlame.position.set(0, 0.55, 2.7);
    nitroFlame.visible = false;
    playerGroup.add(nitroFlame);

    const lanes = [-4.2, 0, 4.2];
    const obstacles: { mesh: THREE.Object3D; speedMult: number }[] = [];
    const coins: THREE.Mesh[] = [];
    const lasers: THREE.Mesh[] = [];

    const state = {
      x: 0,
      targetX: 0,
      y: 0,
      vy: 0,
      slideTicks: 0,
      score: 0,
      coins: 0,
      nitro: 100,
      shield: 100,
      speed: 0.78,
      spawnTimer: 0,
      laserCooldown: 0,
      running: true,
      clock: 0,
    };

    const playerBox = new THREE.Box3();
    const targetBox = new THREE.Box3();

    const handleResize = () => {
      if (!stage) return;
      const w = Math.max(300, stage.clientWidth);
      const h = Math.max(260, stage.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(stage);
    window.addEventListener('resize', handleResize);

    // Keyboard Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') controlsRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') controlsRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') controlsRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') controlsRef.current.down = true;
      if (e.key === ' ') controlsRef.current.action = true;
      if (e.key === 'c' || e.key === 'C') cycleCameraView();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') controlsRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')
        controlsRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') controlsRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') controlsRef.current.down = false;
      if (e.key === ' ') controlsRef.current.action = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let frameCount = 0;
    let lastFpsCheck = performance.now();
    let lastHudSync = performance.now();

    const animate = (now: number) => {
      if (cancelled) return;
      animId = requestAnimationFrame(animate);

      frameCount++;
      if (now - lastFpsCheck >= 500) {
        setFps(Math.min(60, Math.max(30, Math.round((frameCount * 1000) / (now - lastFpsCheck)))));
        frameCount = 0;
        lastFpsCheck = now;
      }

      if (isPausedRef.current || !state.running) {
        renderer.render(scene, camera);
        return;
      }

      state.clock += 0.15;
      const ctrl = controlsRef.current;

      // Boost / Action logic
      const isBoosting = (ctrl.action || (gameMode === 'car_3d' && ctrl.up)) && state.nitro > 2;
      if (isBoosting && gameMode !== 'shooter_3d') {
        state.nitro = Math.max(0, state.nitro - 0.55);
        nitroFlame.visible = true;
        nitroFlame.scale.setScalar(0.85 + Math.sin(state.clock * 4) * 0.25);
      } else {
        state.nitro = Math.min(100, state.nitro + 0.22);
        nitroFlame.visible = false;
      }

      const brakeFactor = gameMode === 'car_3d' && ctrl.down ? 0.58 : 1.0;
      const boostFactor = isBoosting ? 1.68 : 1.0;
      const stepSpeed =
        (state.speed + Math.min(0.65, state.score / 8500)) * boostFactor * brakeFactor;

      // Lateral Steering (D-Pad Left / Right + Keyboard)
      if (ctrl.left) state.targetX -= 0.21;
      if (ctrl.right) state.targetX += 0.21;
      state.targetX = Math.max(-5.2, Math.min(5.2, state.targetX));
      state.x += (state.targetX - state.x) * 0.22;
      playerGroup.position.x = state.x;
      playerGroup.rotation.z = (state.x - state.targetX) * 0.35;
      playerGroup.rotation.y = (state.x - state.targetX) * 0.16;

      // Vertical Jump / Flight Physics (Runner & Space Shooter)
      if (gameMode === 'runner_3d') {
        if ((ctrl.up || ctrl.action) && state.y <= 0.05) {
          state.vy = 0.35;
        }
        if (ctrl.down) {
          state.slideTicks = 18;
        }
        state.y += state.vy;
        if (state.y > 0) state.vy -= 0.019;
        else {
          state.y = 0;
          state.vy = 0;
        }
        playerGroup.position.y = state.y;
        playerGroup.scale.y = state.slideTicks > 0 ? 0.52 : 1.0;
        if (state.slideTicks > 0) state.slideTicks--;

        const lLeg = playerGroup.getObjectByName('leftLeg');
        const rLeg = playerGroup.getObjectByName('rightLeg');
        if (lLeg && rLeg) {
          lLeg.rotation.x = Math.sin(state.clock * 2.2) * 0.75;
          rLeg.rotation.x = -Math.sin(state.clock * 2.2) * 0.75;
        }
      } else if (gameMode === 'shooter_3d') {
        if (ctrl.up) state.y = Math.min(3.8, state.y + 0.14);
        if (ctrl.down) state.y = Math.max(-1.2, state.y - 0.14);
        playerGroup.position.y = state.y;

        // Fire Twin Plasma Lasers
        if (state.laserCooldown > 0) state.laserCooldown--;
        if ((ctrl.action || ctrl.up || true) && state.laserCooldown === 0) {
          const boltGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8);
          boltGeo.rotateX(Math.PI / 2);
          const boltMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          [-1.3, 1.3].forEach((offsetX) => {
            const bolt = new THREE.Mesh(boltGeo, boltMat);
            bolt.position.set(playerGroup.position.x + offsetX, playerGroup.position.y + 1.0, -1.6);
            scene.add(bolt);
            lasers.push(bolt);
          });
          state.laserCooldown = ctrl.action ? 7 : 15;
        }
      }

      // Move Road Texture & Scenery
      roadTexture.offset.y -= stepSpeed * 0.075;
      sceneryMeshes.forEach((p) => {
        p.position.z += stepSpeed * 1.35;
        if (p.position.z > 16) p.position.z -= 260;
      });
      accentPointLight.position.set(playerGroup.position.x, playerGroup.position.y + 2.4, 1.5);

      state.score += Math.round(stepSpeed * 4);

      // Spawn 3D Obstacles (Traffic Cars / Hurdles / Asteroids) & 3D Coins
      state.spawnTimer += stepSpeed;
      if (state.spawnTimer > 20) {
        state.spawnTimer = 0;
        const laneX = lanes[Math.floor(Math.random() * lanes.length)];
        const enemyColors = [0xef4444, 0x3b82f6, 0x10b981, 0xa855f7, 0xec4899];
        const chosenColor = enemyColors[Math.floor(Math.random() * enemyColors.length)];

        let obsMesh: THREE.Object3D;
        if (gameMode === 'car_3d') {
          obsMesh = buildSportsCarMesh(chosenColor, false);
          obsMesh.position.set(laneX, 0, -135);
        } else if (gameMode === 'runner_3d') {
          const isLow = Math.random() > 0.4;
          obsMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2.4, isLow ? 1.15 : 2.6, 0.85),
            new THREE.MeshStandardMaterial({
              color: chosenColor,
              emissive: chosenColor,
              emissiveIntensity: 0.35,
            }),
          );
          obsMesh.position.set(laneX, isLow ? 0.6 : 1.3, -125);
        } else {
          obsMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.35, 0),
            new THREE.MeshStandardMaterial({
              color: chosenColor,
              roughness: 0.35,
              metalness: 0.5,
            }),
          );
          obsMesh.position.set(
            (Math.random() - 0.5) * 10,
            Math.random() * 2.8,
            -130,
          );
        }
        scene.add(obsMesh);
        obstacles.push({ mesh: obsMesh, speedMult: 0.85 + Math.random() * 0.35 });

        // Spawn 3D Spinning Gold Coin Octahedron
        const coinLane = lanes[(Math.floor(Math.random() * 3) + 1) % 3];
        const coinMesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.62, 0),
          new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.75,
            metalness: 0.85,
            roughness: 0.15,
          }),
        );
        coinMesh.position.set(coinLane, 1.1, -142);
        scene.add(coinMesh);
        coins.push(coinMesh);
      }

      // Update Lasers (Space Shooter)
      for (let i = lasers.length - 1; i >= 0; i--) {
        const b = lasers[i];
        b.position.z -= 2.2;
        if (b.position.z < -140) {
          scene.remove(b);
          lasers.splice(i, 1);
        }
      }

      playerBox.setFromObject(playerGroup);
      playerBox.expandByScalar(-0.24);

      // Update Coins
      for (let i = coins.length - 1; i >= 0; i--) {
        const c = coins[i];
        c.position.z += stepSpeed * 1.2;
        c.rotation.y += 0.09;
        targetBox.setFromObject(c);
        if (playerBox.intersectsBox(targetBox)) {
          state.coins += 1;
          state.score += 200;
          state.nitro = Math.min(100, state.nitro + 18);
          scene.remove(c);
          coins.splice(i, 1);
        } else if (c.position.z > 14) {
          scene.remove(c);
          coins.splice(i, 1);
        }
      }

      // Update Obstacles & 3D Bounding Box Collisions
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.mesh.position.z += stepSpeed * o.speedMult * 1.15;
        if (gameMode === 'shooter_3d') {
          o.mesh.rotation.x += 0.03;
          o.mesh.rotation.y += 0.04;
        }

        // Check laser hits in shooter mode
        let destroyedByLaser = false;
        if (gameMode === 'shooter_3d') {
          for (let j = lasers.length - 1; j >= 0; j--) {
            if (o.mesh.position.distanceTo(lasers[j].position) < 1.85) {
              scene.remove(o.mesh);
              obstacles.splice(i, 1);
              scene.remove(lasers[j]);
              lasers.splice(j, 1);
              state.score += 150;
              state.coins += 1;
              destroyedByLaser = true;
              break;
            }
          }
        }
        if (destroyedByLaser) continue;

        targetBox.setFromObject(o.mesh);
        targetBox.expandByScalar(-0.18);

        if (playerBox.intersectsBox(targetBox)) {
          scene.remove(o.mesh);
          obstacles.splice(i, 1);
          state.shield = Math.max(0, state.shield - 34);
          if (state.shield <= 0) {
            state.running = false;
            setIsGameOver(true);
            setScore(state.score);
            setBestScore((prev) => {
              const next = Math.max(prev, state.score);
              window.localStorage.setItem('saz-3d-best-score', String(next));
              return next;
            });
          }
        } else if (o.mesh.position.z > 16) {
          scene.remove(o.mesh);
          obstacles.splice(i, 1);
        }
      }

      // Smooth 3D Camera Tracking
      const targetFov = isBoosting ? 74 : 62;
      camera.fov += (targetFov - camera.fov) * 0.12;
      camera.updateProjectionMatrix();

      if (cameraViewRef.current === 'chase') {
        camera.position.lerp(
          new THREE.Vector3(playerGroup.position.x * 0.6, 4.1 + state.y * 0.35, 8.2),
          0.15,
        );
        camera.lookAt(playerGroup.position.x * 0.35, 1.0 + state.y * 0.2, -18);
      } else if (cameraViewRef.current === 'cockpit') {
        camera.position.lerp(
          new THREE.Vector3(playerGroup.position.x, 1.45 + state.y, 0.2),
          0.25,
        );
        camera.lookAt(playerGroup.position.x, 1.15 + state.y, -32);
      } else {
        camera.position.lerp(new THREE.Vector3(0, 15.5, 10.5), 0.1);
        camera.lookAt(0, 0, -16);
      }

      // Sync React HUD state at ~10Hz to keep 60fps silky smooth
      if (now - lastHudSync > 90) {
        lastHudSync = now;
        setScore(state.score);
        setCoinsCount(state.coins);
        setNitroPct(Math.round(state.nitro));
        setShieldPct(Math.round(state.shield));
        setSpeedKmh(Math.round(stepSpeed * 205));
        setBestScore((prev) => {
          if (state.score > prev) {
            window.localStorage.setItem('saz-3d-best-score', String(state.score));
            return state.score;
          }
          return prev;
        });
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
    };
  }, [gameMode, restartTrigger]);

  return (
    <div
      ref={rootRef}
      className={`flex flex-col bg-[#050811] text-white select-none overflow-hidden ${
        compact ? 'h-[460px] rounded-2xl border border-amber-400/50 shadow-xl' : 'h-full w-full'
      }`}
    >
      {/* Top 3D Game Telemetry & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/95 px-3 py-2 shrink-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
            <Gamepad2 size={11} />
            <span>Three.js WebGL · {fps} FPS</span>
          </span>
          <span className="truncate text-xs sm:text-sm font-black text-white">{title}</span>
        </div>

        {/* Switchable 3D Game Modes */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800">
          {(
            [
              { id: 'car_3d', label: '🏎️ 3D Car' },
              { id: 'runner_3d', label: '🏃 3D Runner' },
              { id: 'shooter_3d', label: '🚀 3D Space' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setGameMode(m.id);
                setIsGameOver(false);
              }}
              className={`rounded-lg px-2 py-1 text-[10.5px] font-extrabold transition ${
                gameMode === m.id
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Live Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cycleCameraView}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-bold text-amber-300 hover:bg-slate-700"
            title="Switch 3D Camera Angle"
          >
            <Camera size={12} />
            <span className="capitalize">{cameraView}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-white hover:bg-slate-700"
            title={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-amber-300"
          >
            <RotateCcw size={11} />
            <span>Restart</span>
          </button>
          {compact && onOpenFullPreview ? (
            <button
              type="button"
              onClick={onOpenFullPreview}
              className="flex items-center gap-1 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-extrabold text-emerald-300 hover:bg-emerald-500/30"
            >
              <Maximize2 size={11} />
              <span>Full Preview</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-white hover:bg-slate-700"
              title="Fullscreen 3D Viewport"
            >
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Live 3D WebGL HTML5 Canvas Viewport */}
      <div ref={stageRef} className="relative flex-1 w-full overflow-hidden bg-[#050811]">
        <canvas ref={canvasRef} className="block h-full w-full outline-none" />

        {/* Floating Live Score & Shield Telemetry HUD */}
        <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Score
              </div>
              <div className="text-sm font-black text-amber-400 tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <Trophy size={9} className="text-emerald-400" /> Best
              </div>
              <div className="text-sm font-black text-emerald-400 tabular-nums">
                {bestScore.toLocaleString()}
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                <Sparkles size={9} className="text-yellow-400" /> Pickups
              </div>
              <div className="text-sm font-black text-yellow-300 tabular-nums">{coinsCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Speed
              </div>
              <div className="text-xs sm:text-sm font-black text-sky-400 tabular-nums">
                {speedKmh} KM/H
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="w-20">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase text-slate-300">
                <span className="flex items-center gap-0.5">
                  <Shield size={9} className="text-emerald-400" /> Hull
                </span>
                <span>{shieldPct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${shieldPct}%` }}
                />
              </div>
            </div>
            <div className="w-20">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase text-amber-300">
                <span className="flex items-center gap-0.5">
                  <Flame size={9} /> Nitro
                </span>
                <span>{nitroPct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${nitroPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Game Over Modal Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/85 p-6 text-center backdrop-blur-md">
            <span className="rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-rose-300">
              3D Physics Impact Detected
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">Run Complete!</h2>
            <p className="mt-1 text-sm font-bold text-amber-400">
              Final Score: {score.toLocaleString()} · High Score: {bestScore.toLocaleString()} ·
              Pickups: {coinsCount}
            </p>
            <button
              type="button"
              onClick={handleRestart}
              className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 shadow-xl transition hover:bg-amber-300 active:scale-95"
            >
              <RotateCcw size={16} />
              <span>Play Again (60 FPS)</span>
            </button>
          </div>
        )}
      </div>

      {/* Responsive Mobile Touch D-Pad + Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-3 py-2.5 shrink-0 z-20">
        {/* Left: Cross D-Pad (Up, Down, Left, Right) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setControl('left', true);
            }}
            onPointerUp={() => setControl('left', false)}
            onPointerLeave={() => setControl('left', false)}
            onPointerCancel={() => setControl('left', false)}
            className="flex h-11 w-14 sm:w-16 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-xs font-black text-white shadow-inner active:border-amber-400 active:bg-amber-400 active:text-slate-950"
          >
            ◀ LEFT
          </button>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setControl('up', true);
              }}
              onPointerUp={() => setControl('up', false)}
              onPointerLeave={() => setControl('up', false)}
              onPointerCancel={() => setControl('up', false)}
              className="flex h-6 w-14 sm:w-16 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-[10px] font-black text-emerald-300 active:bg-emerald-400 active:text-slate-950"
            >
              ▲ UP
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setControl('down', true);
              }}
              onPointerUp={() => setControl('down', false)}
              onPointerLeave={() => setControl('down', false)}
              onPointerCancel={() => setControl('down', false)}
              className="flex h-6 w-14 sm:w-16 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-[10px] font-black text-rose-300 active:bg-rose-400 active:text-slate-950"
            >
              ▼ DOWN
            </button>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setControl('right', true);
            }}
            onPointerUp={() => setControl('right', false)}
            onPointerLeave={() => setControl('right', false)}
            onPointerCancel={() => setControl('right', false)}
            className="flex h-11 w-14 sm:w-16 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-xs font-black text-white shadow-inner active:border-amber-400 active:bg-amber-400 active:text-slate-950"
          >
            RIGHT ▶
          </button>
        </div>

        <div className="hidden md:block text-[11px] font-semibold text-slate-400">
          D-Pad Touch or Arrow / WASD Keys + Spacebar
        </div>

        {/* Right: Action Pad (Nitro Boost / Jump / Plasma Fire) */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setControl('action', true);
            }}
            onPointerUp={() => setControl('action', false)}
            onPointerLeave={() => setControl('action', false)}
            onPointerCancel={() => setControl('action', false)}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-400/20 px-4 text-xs font-black text-amber-300 shadow-inner active:bg-amber-400 active:text-slate-950"
          >
            <Zap size={14} />
            <span>
              {gameMode === 'car_3d'
                ? 'NITRO BOOST'
                : gameMode === 'runner_3d'
                  ? '3D JUMP'
                  : 'PLASMA FIRE'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
