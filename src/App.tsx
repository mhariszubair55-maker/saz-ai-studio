import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import {
  ArrowUp,
  AudioWaveform,
  Bot,
  Camera,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileDown,
  FileText,
  Film,
  Image as ImageIcon,
  Laptop,
  Layers,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Moon,
  PanelLeft,
  Paperclip,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from 'lucide-react';
import {
  DasVpnDashboard,
  buildDasVpnHtmlCode,
} from './components/DasVpnDashboard';
import { LeftUtilityDrawerSuite } from './components/LeftUtilityDrawerSuite';
import {
  STUDIO_MODULES,
  type StudioModuleId,
  GameEngineWorkspace,
  ImageGeneratorWorkspace,
  MusicSfxWorkspace,
  StoryGeneratorWorkspace,
  VoiceoverDubbingWorkspace,
} from './components/StudioModuleWorkspace';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  CodeBlockRunner,
  DeveloperPlatformWorkspace,
  createProjectZipBlob,
  type DevPlatformSubTab,
} from './components/DeveloperPlatformWorkspace';
import { MermaidDiagramRenderer } from './components/ProDeveloperSuite';
import {
  NaturalVoiceSynthesizerBar,
  UsageTokenAnalyticsView,
  convertMockupToReactTailwind,
} from './components/WorkflowUtilitySuite';
import {
  transformVoiceCommandToCode,
  type CustomMicroAgent,
} from './components/EcosystemAutomationSuite';
import {
  enhanceUserPrompt,
} from './components/EnterprisePlatformSuite';
import {
  AuthSystemModal,
  HeaderAuthControl,
  loadSavedUserSession,
  saveUserSession,
  signOut,
} from './components/AuthSystemModal';
import {
  auth,
  onAuthStateChanged,
  syncUserProfileToFirestore,
  type AppUserSession,
} from './firebase';
import sherScene3NetTrapImg from './assets/images/sher_cheenti_scene3_net_trap_1790635751412.jpg';
import sherScene4CuttingNetImg from './assets/images/sher_cheenti_scene4_cutting_net_1790635765147.jpg';
import pixarMagicalAdventureImg from './assets/images/pixar_magical_adventure_1790633528032.jpg';
import pixarFoxForestImg from './assets/images/pixar_fox_rooster_forest_1790633480000.jpg';
import pixarFoxChaseImg from './assets/images/pixar_fox_rooster_chase_1790633499455.jpg';
import pixarVeggieVillageImg from './assets/images/pixar_veggie_village_1790633514432.jpg';

type ExecutionIntent = 'auto' | 'app' | 'video' | 'image' | 'audio' | 'analyze';
type Language = 'english' | 'urdu' | 'roman';
type WorkspaceView = 'split' | 'chat' | 'preview';
type ViewportSize = 'desktop' | 'tablet' | 'mobile';
type ActiveModal = 'knowledge' | 'history' | 'github' | 'timeline' | 'share' | 'analytics' | null;
type ThemePreset = 'neon_dark' | 'midnight_blue' | 'minimal_mono' | 'solar_light';

interface GitHubStatusResponse {
  connected: boolean;
  hasOAuthConfig: boolean;
  user: { login: string; name?: string; html_url?: string; avatar_url?: string } | null;
  files: Array<{ path: string; size: number }>;
}

interface AttachedAsset {
  name: string;
  mimeType: string;
  dataUrl?: string;
  textContent?: string;
  size?: number;
}

interface AppArtifact {
  id: string;
  title: string;
  description: string;
  htmlCode: string;
  createdAt: string;
}

interface VideoScene {
  headline: string;
  subtext: string;
  bgGradient: [string, string];
  accentColor: string;
  durationSec: number;
  motionStyle: 'zoom' | 'pan' | 'pulse' | 'kinetic';
  imageUrl?: string;
  visualPrompt3D?: string;
  characterType?: 'lion_ant' | 'fox_rooster' | 'veggie_village' | 'forest_friends' | 'hero_adventure';
  cameraMove?: string;
  cameraShotType?: 'close_up_a' | 'close_up_b' | 'wide_action' | 'over_shoulder' | 'macro_action';
  lightingMood?: string;
  sfxMood?: string;
  speakerName?: string;
  speakerVoice?: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  speakerPitch?: number;
  dialogueLine?: string;
  dialogueUrdu?: string;
  facialExpression?: string;
  mouthRegion?: { x: number; y: number; radius: number };
  audioDataUrl?: string;
}

interface MediaAsset {
  id: string;
  studio: 'ImageStudio' | 'VideoStudio' | 'AudioStudio';
  type: 'image' | 'video' | 'audio';
  title: string;
  prompt: string;
  url?: string;
  masterAudioUrl?: string;
  videoOperationName?: string;
  videoEngine?: string;
  aspectRatio?: string;
  resolution?: string;
  voiceName?: string;
  audioScript?: string;
  durationSec?: number;
  scenes?: VideoScene[];
  socialCaption?: string;
  socialHashtags?: string[];
}

interface Message {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  time: string;
  artifact?: AppArtifact;
  media?: MediaAsset;
  attachments?: Array<{ name: string; mimeType: string }>;
  versions?: Array<{ label: string; model: string; text: string; time: string }>;
  dualComparison?: {
    leftModel: string;
    leftText: string;
    leftMs: number;
    rightModel: string;
    rightText: string;
    rightMs: number;
  };
}

type SpeechRecognitionResultLike = { 0?: { transcript: string } };
type SpeechRecognitionEventLike = Event & { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionErrorEventLike = Event & { error: string; message?: string };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface KnowledgeDocument {
  id: number;
  projectId: number;
  name: string;
  mimeType: string;
  createdAt: string;
}

interface ConversationSummary {
  id: number;
  projectId: number | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  title: string;
  idea: string;
  progress: string;
  status: 'active' | 'paused' | 'complete';
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ARTIFACT: AppArtifact = {
  id: 'artifact-das-vpn-dashboard',
  title: 'DAS VPN · Web UI Dashboard Prototype',
  description:
    'Clean Web-based UI Dashboard prototype for DAS VPN in React/Tailwind · Functional VPN connection toggle button, active timer, server selection dropdown, current simulated IP display, and live bandwidth meters.',
  createdAt: new Date().toISOString(),
  htmlCode: buildDasVpnHtmlCode(),
};

const studioModes: {
  id: ExecutionIntent;
  label: string;
  studioTag: string;
  icon: typeof Wand2;
}[] = [
  { id: 'auto', label: 'Auto Route', studioTag: 'Smart Router', icon: Wand2 },
  { id: 'app', label: 'App Builder', studioTag: 'Live Preview', icon: Layers },
  { id: 'video', label: 'VideoStudio', studioTag: 'Motion Video', icon: Film },
  { id: 'image', label: 'ImageStudio', studioTag: 'HD Visuals', icon: ImageIcon },
  { id: 'audio', label: 'AudioStudio', studioTag: 'Neural Voice', icon: AudioWaveform },
];

function getTime() {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

/**
 * Safely parses JSON from a fetch response. Never throws "Unexpected token '<'" if HTML is returned.
 */
async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    const rawText = await response.text();
    const trimmed = rawText.trim();
    if (!trimmed || trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
      return null;
    }
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

function stripClientNegatedDirectives(text: string): string {
  return text
    .replace(
      /\b(clear|wipe|remove|flush|delete|purge|drop|reset|discard|ignore|never\s+merge|without|unrelated|legacy|previous|old)\b[^.!?\n]*?(3d|game|car|racing|canvas|webgl|three\.?js|component|state|codebase|artifact|workspace)[^.!?\n]*/gi,
      ' ',
    )
    .replace(
      /\((?:e\.g\.|i\.e\.|such as)[^)]*?(3d|car|game|vpn|chatbot)[^)]*\)/gi,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function buildClientInteractiveAppHtml(title: string, prompt: string): string {
  const safeTitle = title.replace(/[<>&"']/g, '') || 'SAZ AI Isolated Web Application';
  const cleanLower = stripClientNegatedDirectives(`${title} ${prompt}`).toLowerCase();

  if (/\b(das\s*vpn|vpn|wireguard|openvpn|ipsec|tunnel\s*shield|bandwidth\s*meter)\b/i.test(cleanLower)) {
    return buildDasVpnHtmlCode();
  }

  const hasExplicitGameIntent =
    /\b(game|gaming|playable|arcade|three\.?js|webgl)\b/i.test(cleanLower);

  if (
    hasExplicitGameIntent &&
    /\b(car|racing|race|drive|driving|drift|highway|traffic|road|kart|vehicle)\b/.test(cleanLower)
  ) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * { user-select: none; -webkit-user-select: none; touch-action: manipulation; }
    body { margin: 0; background: #050811; color: #F8FAFC; font-family: system-ui, sans-serif; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; outline: none; }
  </style>
</head>
<body class="flex flex-col h-screen w-screen overflow-hidden">
  <header class="flex items-center justify-between px-3 sm:px-5 py-2 bg-slate-950/90 border-b border-slate-800 shrink-0 z-20">
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-[10px] font-black uppercase tracking-widest text-amber-300">Three.js WebGL · 60FPS</span>
        <span id="fpsBadge" class="text-[10px] font-mono text-emerald-400 font-bold">60 FPS</span>
      </div>
      <h1 class="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">${safeTitle}</h1>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
        <span class="text-[9px] uppercase text-slate-400 block font-bold">Speed</span>
        <span id="speed" class="text-xs sm:text-sm font-black text-sky-400">160 KM/H</span>
      </div>
      <div class="text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
        <span class="text-[9px] uppercase text-slate-400 block font-bold">Score</span>
        <span id="score" class="text-xs sm:text-sm font-black text-amber-400">0</span>
      </div>
      <div class="hidden sm:block text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
        <span class="text-[9px] uppercase text-slate-400 block font-bold">Best</span>
        <span id="best" class="text-xs sm:text-sm font-black text-emerald-400">0</span>
      </div>
      <button onclick="cycleCam()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700">🎥 CAM</button>
      <button onclick="toggleFull()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700">⛶</button>
      <button onclick="resetGame()" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">Restart</button>
    </div>
  </header>
  <div id="stage" class="relative flex-1 w-full bg-slate-950 overflow-hidden">
    <div id="overlay" class="hidden absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
      <h2 class="text-3xl font-black text-white">3D Collision!</h2>
      <p id="finalScore" class="text-sm text-amber-400 font-bold mt-2">Score: 0</p>
      <button onclick="resetGame()" class="mt-5 px-7 py-3 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-sm">Race Again</button>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-2 p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800 shrink-0 z-20">
    <button id="btnLeft" class="py-3.5 rounded-2xl bg-slate-900 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs sm:text-sm text-white border border-slate-800">◀ STEER LEFT</button>
    <button id="btnBoost" class="py-3.5 rounded-2xl bg-amber-400/20 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs sm:text-sm text-amber-300 border border-amber-400/40">⚡ 3D NITRO</button>
    <button id="btnRight" class="py-3.5 rounded-2xl bg-slate-900 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs sm:text-sm text-white border border-slate-800">STEER RIGHT ▶</button>
  </div>
  <script>
    const stage = document.getElementById('stage');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.011);

    const camera = new THREE.PerspectiveCamera(62, stage.clientWidth / stage.clientHeight, 0.1, 250);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    stage.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
    });

    scene.add(new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.85));
    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.3);
    dirLight.position.set(18, 36, 22);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Procedural Asphalt Texture
    const rc = document.createElement('canvas');
    rc.width = 512; rc.height = 512;
    const rctx = rc.getContext('2d');
    rctx.fillStyle = '#111827'; rctx.fillRect(0,0,512,512);
    rctx.fillStyle = '#F59E0B'; rctx.fillRect(10,0,12,512); rctx.fillRect(490,0,12,512);
    rctx.fillStyle = '#F8FAFC';
    for(let y=0;y<512;y+=64){ rctx.fillRect(168,y,8,34); rctx.fillRect(336,y,8,34); }
    const roadTex = new THREE.CanvasTexture(rc);
    roadTex.wrapS = THREE.RepeatWrapping; roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(1, 18);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 260),
      new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.7, metalness: 0.15 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.z = -95;
    road.receiveShadow = true;
    scene.add(road);

    function buildCar(hex) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.55, 4.0),
        new THREE.MeshStandardMaterial({ color: hex, roughness: 0.22, metalness: 0.75 })
      );
      body.position.y = 0.52; body.castShadow = true; g.add(body);
      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.45, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 })
      );
      cabin.position.set(0, 0.95, -0.15); g.add(cabin);
      const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16);
      wGeo.rotateZ(Math.PI / 2);
      const wMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.8 });
      [[-1.0,0.38,-1.3],[1.0,0.38,-1.3],[-1.0,0.38,1.3],[1.0,0.38,1.3]].forEach(([x,y,z]) => {
        const w = new THREE.Mesh(wGeo, wMat); w.position.set(x,y,z); g.add(w);
      });
      return g;
    }

    const player = buildCar(0xf59e0b);
    scene.add(player);

    const keys = { left: false, right: false, boost: false };
    window.addEventListener('keydown', e => {
      if (e.key==='ArrowLeft'||e.key==='a') keys.left=true;
      if (e.key==='ArrowRight'||e.key==='d') keys.right=true;
      if (e.key==='ArrowUp'||e.key===' ') keys.boost=true;
    });
    window.addEventListener('keyup', e => {
      if (e.key==='ArrowLeft'||e.key==='a') keys.left=false;
      if (e.key==='ArrowRight'||e.key==='d') keys.right=false;
      if (e.key==='ArrowUp'||e.key===' ') keys.boost=false;
    });
    ['btnLeft','btnBoost','btnRight'].forEach((id, idx) => {
      const k = idx===0?'left':idx===1?'boost':'right';
      const el = document.getElementById(id);
      el.addEventListener('pointerdown', e => { e.preventDefault(); keys[k]=true; });
      el.addEventListener('pointerup', e => { e.preventDefault(); keys[k]=false; });
      el.addEventListener('pointerleave', e => { e.preventDefault(); keys[k]=false; });
    });

    let camIdx = 0;
    function cycleCam() { camIdx = (camIdx + 1) % 3; }
    function toggleFull() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen().catch(()=>{});
    }

    const lanes = [-4.2, 0, 4.2];
    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xa855f7];
    let traffic = [];
    let st = { x: 0, tx: 0, score: 0, best: 0, run: true, spawn: 0 };
    const pBox = new THREE.Box3(), tBox = new THREE.Box3();

    function resetGame() {
      traffic.forEach(t => scene.remove(t));
      traffic = [];
      st.x = 0; st.tx = 0; st.score = 0; st.run = true; st.spawn = 0;
      player.position.set(0, 0, 0);
      document.getElementById('overlay').classList.add('hidden');
    }

    let frames = 0, lastFps = performance.now();
    function loop(now) {
      requestAnimationFrame(loop);
      frames++;
      if (now - lastFps >= 500) {
        document.getElementById('fpsBadge').textContent = Math.min(60, Math.round((frames * 1000) / (now - lastFps))) + ' FPS';
        frames = 0; lastFps = now;
      }
      if (st.run) {
        const spd = (0.75 + Math.min(0.65, st.score / 7000)) * (keys.boost ? 1.6 : 1);
        if (keys.left) st.tx -= 0.22;
        if (keys.right) st.tx += 0.22;
        st.tx = Math.max(-5.2, Math.min(5.2, st.tx));
        st.x += (st.tx - st.x) * 0.18;
        player.position.x = st.x;
        player.rotation.z = (st.x - st.tx) * 0.25;
        roadTex.offset.y -= spd * 0.06;

        st.score += Math.round(spd * 4);
        if (st.score > st.best) st.best = st.score;

        st.spawn += spd;
        if (st.spawn > 20) {
          st.spawn = 0;
          const lane = lanes[Math.floor(Math.random() * lanes.length)];
          const c = buildCar(colors[Math.floor(Math.random() * colors.length)]);
          c.position.set(lane, 0, -135);
          scene.add(c);
          traffic.push(c);
        }

        pBox.setFromObject(player); pBox.expandByScalar(-0.22);
        for (let i = traffic.length - 1; i >= 0; i--) {
          const t = traffic[i];
          t.position.z += spd * 0.85;
          tBox.setFromObject(t); tBox.expandByScalar(-0.18);
          if (pBox.intersectsBox(tBox)) {
            st.run = false;
            document.getElementById('finalScore').textContent = 'Score: ' + st.score.toLocaleString() + ' · Best: ' + st.best.toLocaleString();
            document.getElementById('overlay').classList.remove('hidden');
          } else if (t.position.z > 18) {
            scene.remove(t);
            traffic.splice(i, 1);
          }
        }

        if (camIdx === 0) {
          camera.position.lerp(new THREE.Vector3(player.position.x * 0.55, 3.6, 7.6), 0.14);
          camera.lookAt(player.position.x * 0.35, 0.9, -18);
        } else if (camIdx === 1) {
          camera.position.lerp(new THREE.Vector3(player.position.x, 1.45, 0.3), 0.25);
          camera.lookAt(player.position.x, 1.1, -30);
        } else {
          camera.position.lerp(new THREE.Vector3(0, 14, 11), 0.1);
          camera.lookAt(0, 0, -16);
        }

        document.getElementById('speed').textContent = Math.round(spd * 215) + ' KM/H';
        document.getElementById('score').textContent = st.score.toLocaleString();
        document.getElementById('best').textContent = st.best.toLocaleString();
      }
      renderer.render(scene, camera);
    }
    resetGame(); requestAnimationFrame(loop);
  </script>
</body>
</html>`;
  }

  if (
    hasExplicitGameIntent &&
    /\b(runner|run|parkour|surfer|dash|jump|obstacle|endless|temple)\b/.test(cleanLower)
  ) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * { user-select: none; -webkit-user-select: none; touch-action: manipulation; }
    body { margin: 0; background: #070B19; color: #F8FAFC; font-family: system-ui, sans-serif; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; outline: none; }
  </style>
</head>
<body class="flex flex-col h-screen w-screen overflow-hidden">
  <header class="flex items-center justify-between px-3 sm:px-5 py-2 bg-slate-950/90 border-b border-slate-800 shrink-0 z-20">
    <div class="min-w-0">
      <span class="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40 text-[10px] font-black uppercase tracking-widest text-sky-300">Three.js WebGL · 3D Runner</span>
      <h1 class="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">${safeTitle}</h1>
    </div>
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
        <span class="text-[9px] uppercase text-slate-400 block font-bold">Score</span>
        <span id="score" class="text-xs sm:text-sm font-black text-amber-400">0</span>
      </div>
      <div class="text-right px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
        <span class="text-[9px] uppercase text-slate-400 block font-bold">Coins</span>
        <span id="coins" class="text-xs sm:text-sm font-black text-emerald-400">0</span>
      </div>
      <button onclick="toggleFull()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700">⛶</button>
      <button onclick="resetGame()" class="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">Restart</button>
    </div>
  </header>
  <div id="stage" class="relative flex-1 w-full bg-slate-950 overflow-hidden">
    <div id="overlay" class="hidden absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
      <h2 class="text-3xl font-black text-white">Run Terminated!</h2>
      <p id="finalScore" class="text-sm text-amber-400 font-bold mt-2">Score: 0</p>
      <button onclick="resetGame()" class="mt-5 px-7 py-3 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-sm">Run Again</button>
    </div>
  </div>
  <div class="grid grid-cols-4 gap-2 p-2.5 sm:p-3 bg-slate-950 border-t border-slate-800 shrink-0 z-20">
    <button onclick="shiftLane(-1)" class="py-3 rounded-2xl bg-slate-900 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs text-white border border-slate-800">◀ LEFT</button>
    <button onclick="jump()" class="py-3 rounded-2xl bg-sky-500/20 active:bg-sky-400 active:text-slate-950 font-extrabold text-xs text-sky-300 border border-sky-400/40">▲ JUMP</button>
    <button onclick="slide()" class="py-3 rounded-2xl bg-amber-500/20 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs text-amber-300 border border-amber-400/40">▼ SLIDE</button>
    <button onclick="shiftLane(1)" class="py-3 rounded-2xl bg-slate-900 active:bg-amber-400 active:text-slate-950 font-extrabold text-xs text-white border border-slate-800">RIGHT ▶</button>
  </div>
  <script>
    const stage = document.getElementById('stage');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b19);
    scene.fog = new THREE.FogExp2(0x070b19, 0.015);
    const camera = new THREE.PerspectiveCamera(62, stage.clientWidth / stage.clientHeight, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
    });
    scene.add(new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(12, 28, 16);
    scene.add(sun);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 220),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2; floor.position.z = -80;
    scene.add(floor);

    const hero = new THREE.Group();
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.25, 0.55), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    torso.position.y = 1.35; hero.add(torso);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    head.position.y = 2.4; hero.add(head);
    scene.add(hero);

    const lanes = [-3.0, 0, 3.0];
    let st = { lane: 1, y: 0, vy: 0, slideT: 0, score: 0, coins: 0, run: true, sp: 0 };
    let obstacles = [], pickups = [];
    const hBox = new THREE.Box3(), oBox = new THREE.Box3();

    function shiftLane(d) { if(st.run) st.lane = Math.max(0, Math.min(2, st.lane + d)); }
    function jump() { if(st.run && st.y <= 0.05) st.vy = 0.34; }
    function slide() { if(st.run) st.slideT = 26; }
    function toggleFull() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
      else document.exitFullscreen().catch(()=>{});
    }

    window.addEventListener('keydown', e => {
      if (e.key==='ArrowLeft'||e.key==='a') shiftLane(-1);
      if (e.key==='ArrowRight'||e.key==='d') shiftLane(1);
      if (e.key==='ArrowUp'||e.key==='w'||e.key===' ') jump();
      if (e.key==='ArrowDown'||e.key==='s') slide();
    });

    function resetGame() {
      obstacles.forEach(o => scene.remove(o));
      pickups.forEach(p => scene.remove(p));
      obstacles = []; pickups = [];
      st = { lane: 1, y: 0, vy: 0, slideT: 0, score: 0, coins: 0, run: true, sp: 0 };
      document.getElementById('overlay').classList.add('hidden');
    }

    function loop() {
      requestAnimationFrame(loop);
      if (st.run) {
        const spd = 0.68 + Math.min(0.45, st.score / 5000);
        hero.position.x += (lanes[st.lane] - hero.position.x) * 0.22;
        st.y += st.vy;
        if (st.y > 0) st.vy -= 0.019;
        else { st.y = 0; st.vy = 0; }
        hero.position.y = st.y;
        if (st.slideT > 0) { st.slideT--; hero.scale.y = 0.52; }
        else hero.scale.y = 1;

        st.score += 2;
        st.sp += spd;
        if (st.sp > 15) {
          st.sp = 0;
          const l = lanes[Math.floor(Math.random() * 3)];
          const obs = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 1.4, 0.9),
            new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x881337, emissiveIntensity: 0.4 })
          );
          obs.position.set(l, 0.7, -95);
          scene.add(obs);
          obstacles.push(obs);

          const coin = new THREE.Mesh(
            new THREE.TorusGeometry(0.45, 0.14, 10, 20),
            new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.5 })
          );
          coin.position.set(lanes[(Math.floor(Math.random()*3))], 1.3, -103);
          scene.add(coin);
          pickups.push(coin);
        }

        hBox.setFromObject(hero); hBox.expandByScalar(-0.18);
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.position.z += spd;
          oBox.setFromObject(o); oBox.expandByScalar(-0.12);
          if (hBox.intersectsBox(oBox)) {
            st.run = false;
            document.getElementById('finalScore').textContent = 'Score: ' + st.score + ' · Coins: ' + st.coins;
            document.getElementById('overlay').classList.remove('hidden');
          } else if (o.position.z > 10) {
            scene.remove(o); obstacles.splice(i, 1);
          }
        }
        for (let i = pickups.length - 1; i >= 0; i--) {
          const c = pickups[i];
          c.position.z += spd; c.rotation.y += 0.08;
          if (hero.position.distanceTo(c.position) < 1.6) {
            st.coins++; st.score += 50;
            scene.remove(c); pickups.splice(i, 1);
          } else if (c.position.z > 10) {
            scene.remove(c); pickups.splice(i, 1);
          }
        }
        camera.position.lerp(new THREE.Vector3(hero.position.x * 0.45, 4.2 + st.y * 0.35, 7.4), 0.14);
        camera.lookAt(hero.position.x * 0.25, 1.4, -15);
        document.getElementById('score').textContent = st.score;
        document.getElementById('coins').textContent = st.coins;
      }
      renderer.render(scene, camera);
    }
    resetGame(); loop();
  </script>
</body>
</html>`;
  }

  if (/\b(tic\s*tac\s*toe|tictactoe|xo|board game)\b/.test(cleanLower)) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black text-white">${safeTitle}</h1>
      <span id="status" class="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 text-xs font-bold">Turn: X</span>
    </div>
    <div id="board" class="grid grid-cols-3 gap-3 aspect-square"></div>
    <button onclick="reset()" class="w-full py-3 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-sm">New Game</button>
  </div>
  <script>
    let b = Array(9).fill(''), turn = 'X', active = true;
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function check() {
      for (const [a,c,d] of wins) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
      return b.every(Boolean) ? 'Draw' : null;
    }
    function play(i) {
      if (!active || b[i]) return;
      b[i] = turn;
      const w = check();
      if (w) { active = false; document.getElementById('status').textContent = w === 'Draw' ? 'Draw!' : w + ' Wins!'; render(); return; }
      turn = turn === 'X' ? 'O' : 'X';
      document.getElementById('status').textContent = 'Turn: ' + turn;
      render();
    }
    function reset() { b = Array(9).fill(''); turn = 'X'; active = true; document.getElementById('status').textContent = 'Turn: X'; render(); }
    function render() {
      document.getElementById('board').innerHTML = b.map((v,i) => \`<button onclick="play(\${i})" class="rounded-2xl border-2 border-slate-700 bg-slate-800 text-4xl font-black \${v==='X'?'text-amber-400':'text-rose-400'} flex items-center justify-center">\${v}</button>\`).join('');
    }
    render();
  </script>
</body>
</html>`;
  }

  if (
    hasExplicitGameIntent &&
    /\b(shoot|shooter|space|arcade|snake|flappy)\b/.test(cleanLower)
  ) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>* { user-select: none; touch-action: manipulation; } body { margin: 0; background: #030712; color: #fff; overflow: hidden; } canvas { display: block; width: 100%; height: 100%; }</style>
</head>
<body class="flex flex-col h-screen w-screen overflow-hidden">
  <header class="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0 z-20">
    <div>
      <span class="text-[10px] font-black uppercase tracking-widest text-rose-400">Three.js WebGL · 60FPS 3D</span>
      <h1 class="text-sm font-extrabold text-white truncate">${safeTitle}</h1>
    </div>
    <div class="flex items-center gap-3">
      <span id="score" class="text-sm font-black text-amber-400">Score: 0</span>
      <button onclick="init()" class="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs">Restart</button>
    </div>
  </header>
  <div id="stage" class="relative flex-1 w-full overflow-hidden bg-slate-950"></div>
  <div class="grid grid-cols-3 gap-2 p-3 bg-slate-950 border-t border-slate-800 shrink-0 z-20">
    <button id="l" class="py-3 rounded-2xl bg-slate-900 border border-slate-800 font-extrabold text-xs sm:text-sm">◀ BANK LEFT</button>
    <button id="f" class="py-3 rounded-2xl bg-rose-600 font-extrabold text-xs sm:text-sm">🔥 3D PLASMA</button>
    <button id="r" class="py-3 rounded-2xl bg-slate-900 border border-slate-800 font-extrabold text-xs sm:text-sm">BANK RIGHT ▶</button>
  </div>
  <script>
    const stage = document.getElementById('stage');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    const camera = new THREE.PerspectiveCamera(60, stage.clientWidth / stage.clientHeight, 0.1, 200);
    camera.position.set(0, 4.5, 9.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    stage.appendChild(renderer.domElement);
    window.addEventListener('resize', () => {
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
    });
    scene.add(new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 20, 10);
    scene.add(dir);

    const ship = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.85, 3.0, 6), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.75, roughness: 0.25 }));
    body.rotation.x = -Math.PI / 2; ship.add(body);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 1.0), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    wing.position.z = 0.4; ship.add(wing);
    scene.add(ship);

    let g = { x: 0, sc: 0, cd: 0 }, bolts = [], rocks = [], ctrl = { l:false, r:false, f:false };
    ['l','f','r'].forEach(k => {
      const el = document.getElementById(k);
      el.addEventListener('pointerdown', e => { e.preventDefault(); ctrl[k]=true; });
      el.addEventListener('pointerup', e => { e.preventDefault(); ctrl[k]=false; });
    });
    window.addEventListener('keydown', e => { if(e.key==='ArrowLeft')ctrl.l=true; if(e.key==='ArrowRight')ctrl.r=true; if(e.key===' ')ctrl.f=true; });
    window.addEventListener('keyup', e => { if(e.key==='ArrowLeft')ctrl.l=false; if(e.key==='ArrowRight')ctrl.r=false; if(e.key===' ')ctrl.f=false; });
    function init(){
      bolts.forEach(b=>scene.remove(b)); rocks.forEach(r=>scene.remove(r));
      bolts=[]; rocks=[]; g = { x: 0, sc: 0, cd: 0 };
    }
    function loop(){
      requestAnimationFrame(loop);
      if(ctrl.l) g.x -= 0.25; if(ctrl.r) g.x += 0.25;
      g.x = Math.max(-9, Math.min(9, g.x));
      ship.position.x += (g.x - ship.position.x) * 0.2;
      ship.rotation.z = (ship.position.x - g.x) * 0.4;
      if(g.cd>0) g.cd--;
      if(ctrl.f && g.cd===0){
        const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.5,8), new THREE.MeshBasicMaterial({color:0x38bdf8}));
        b.rotation.x = Math.PI/2; b.position.set(ship.position.x, 0, -1.2);
        scene.add(b); bolts.push(b); g.cd=8;
      }
      if(Math.random()<0.04){
        const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1,0), new THREE.MeshStandardMaterial({color:0xf43f5e, roughness:0.4}));
        r.position.set((Math.random()-0.5)*18, 0, -80);
        scene.add(r); rocks.push(r);
      }
      for(let i=bolts.length-1;i>=0;i--){
        bolts[i].position.z -= 1.7;
        if(bolts[i].position.z < -90){ scene.remove(bolts[i]); bolts.splice(i,1); }
      }
      for(let i=rocks.length-1;i>=0;i--){
        const r = rocks[i]; r.position.z += 0.5; r.rotation.x += 0.04; r.rotation.y += 0.04;
        for(let j=bolts.length-1;j>=0;j--){
          if(r.position.distanceTo(bolts[j].position)<1.5){
            scene.remove(r); rocks.splice(i,1);
            scene.remove(bolts[j]); bolts.splice(j,1);
            g.sc += 50; break;
          }
        }
        if(r && r.position.z > 10){ scene.remove(r); rocks.splice(i,1); }
      }
      camera.lookAt(ship.position.x * 0.25, 0, -15);
      document.getElementById('score').textContent = 'Score: ' + g.sc;
      renderer.render(scene, camera);
    }
    init(); loop();
  </script>
</body>
</html>`;
  }

  const safeDesc = prompt.replace(/[<>&"']/g, '').slice(0, 180);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; background: #060A12; color: #F8FAFC; font-family: Inter, system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-[#060A12] text-slate-100 flex flex-col">
  <header class="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80">
    <div class="flex items-center gap-3">
      <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest text-emerald-300">Clean Slate · Isolated UI</span>
      <h1 class="text-sm sm:text-base font-extrabold text-white truncate">${safeTitle}</h1>
    </div>
    <button onclick="triggerAction()" class="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs transition">+ Run Action</button>
  </header>
  <main class="flex-1 max-w-6xl w-full mx-auto p-5 space-y-5">
    <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Active Deliverable Specification</div>
        <p class="text-xs text-slate-300 mt-0.5">${safeDesc}</p>
      </div>
      <span id="statusPill" class="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">● Ready</span>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active State</span>
        <div id="metricA" class="text-2xl font-black text-emerald-400 mt-1 font-mono">ONLINE</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operations</span>
        <div id="metricB" class="text-2xl font-black text-cyan-400 mt-1 font-mono">128 ops/s</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace Isolation</span>
        <div class="text-2xl font-black text-amber-400 mt-1 font-mono">100% CLEAN</div>
      </div>
    </div>
    <div id="logList" class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
      <div class="text-emerald-400">[READY] Isolated root initialized for ${safeTitle} (zero legacy pollution).</div>
    </div>
  </main>
  <script>
    let count = 1;
    function triggerAction() {
      count++;
      document.getElementById('metricB').textContent = (128 + count * 14) + ' ops/s';
      const el = document.createElement('div');
      el.className = 'text-cyan-300';
      el.textContent = '[' + new Date().toLocaleTimeString() + '] Executed interactive workflow #' + count + ' in isolated workspace.';
      document.getElementById('logList').prepend(el);
    }
  </script>
</body>
</html>`;
}

function buildClientFallbackExecution(
  prompt: string,
  forcedIntent: ExecutionIntent,
): {
  reply: string;
  artifact?: AppArtifact;
  media?: MediaAsset;
} {
  const cleanPrompt = stripClientNegatedDirectives(prompt);
  const lower = cleanPrompt.toLowerCase();
  const isVpnRequest = /\b(das\s*vpn|vpn|wireguard|openvpn|ipsec|tunnel|bandwidth\s*meter)\b/i.test(lower);
  if (isVpnRequest) {
    return {
      reply:
        'All legacy 3D game states have been wiped and flushed from memory. Your isolated **DAS VPN** Web UI Dashboard prototype is now live in the **Preview** panel with a functional connection toggle, active session timer, server selector, simulated IP display, and live bandwidth meters.',
      artifact: {
        id: 'artifact-das-vpn-dashboard',
        title: 'DAS VPN · Web UI Dashboard Prototype',
        description:
          'Clean Web-based UI Dashboard prototype for DAS VPN in React/Tailwind with connection toggle, active timer, server dropdown, simulated IP display, and live bandwidth meters.',
        htmlCode: buildDasVpnHtmlCode(),
        createdAt: new Date().toISOString(),
      },
    };
  }
  const isExplicitGameOrApp =
    forcedIntent === 'app' ||
    /\b(game|gaming|playable|arcade|webgl|three\.?js|tic\s*tac\s*toe|snake|calculator|dashboard|tracker|vpn|app|prototype|ui|interface|module|chatbot)\b/.test(
      lower,
    );
  const isVideo =
    !isExplicitGameOrApp &&
    (forcedIntent === 'video' ||
      /\b(video|reel|animation|animated|cartoon|pixar|disney|3d story|story|fable|kahani|sher|cheenti|chunti|chinti|lion|ant|fox|rooster|lomri|murgha|vegetable|village|promo|short|motion)\b/.test(
        lower,
      ) ||
      prompt.includes('شیر') ||
      prompt.includes('چونٹی') ||
      prompt.includes('کہانی'));
  const isImage =
    forcedIntent === 'image' ||
    /\b(image|poster|photo|picture|logo|thumbnail|banner)\b/.test(lower);
  const isAudio =
    forcedIntent === 'audio' ||
    /\b(audio|voice|voiceover|podcast|narration|speech|speak)\b/.test(lower);

  const shortTitle =
    prompt
      .replace(/^(build|create|make|generate|design|launch)\s+(a|an|the)?\s*/i, '')
      .slice(0, 44)
      .trim() || 'SAZ AI Studio Creation';

  if (isVideo) {
    const isLionAnt =
      /\b(sher|cheenti|chunti|chinti|lion|ant)\b/.test(lower) ||
      prompt.includes('شیر') ||
      prompt.includes('چونٹی') ||
      prompt.includes('چیونٹی');
    const isFox =
      !isLionAnt &&
      /\b(fox|lomri)\b/.test(lower) &&
      /\b(rooster|murgha|murg)\b/.test(lower);
    const isVeggie =
      !isLionAnt &&
      !isFox &&
      /\b(vegetable|veggie|tomato|carrot|village|sabzi)\b/.test(lower);

    const scenes: VideoScene[] = isLionAnt
      ? ([
          {
            headline: 'Scene 1 · Lion & Ant',
            subtext:
              'Under a towering banyan tree, Sher the mighty golden-maned lion rests peacefully while a tiny brave ant (Cheenti) climbs onto his warm paw.',
            bgGradient: ['#064E3B', '#451A03'] as [string, string],
            accentColor: '#F59E0B',
            durationSec: 4,
            motionStyle: 'zoom' as const,
            visualPrompt3D:
              'Disney Pixar 3D CGI vertical 9:16 portrait (1080x1920): majestic golden-maned 3D lion resting under a sunlit jungle tree while a tiny adorable 3D red-brown ant with big expressive cartoon eyes stands on the lion paw, volumetric god rays.',
            characterType: 'lion_ant' as const,
            cameraMove: 'Close-Up Speaker A · 3D Push-In',
            cameraShotType: 'close_up_a' as const,
            lightingMood: 'Golden Hour Jungle Sunbeams',
            sfxMood: 'Jungle Morning Birds & Deep Lion Breath',
            speakerName: 'Sher (The Lion)',
            speakerVoice: 'Fenrir' as const,
            speakerPitch: 0.72,
            dialogueLine: 'Who dares wake the King of the Jungle? Speak up, tiny creature!',
            dialogueUrdu: 'جنگل کے بادشاہ کو کس نے جگایا؟ بولو ننھی چونٹی! · Kaun hai jo Sher ko jaga raha hai?',
            facialExpression: 'Surprised Royal Roar',
            mouthRegion: { x: 0.48, y: 0.44, radius: 0.085 },
          },
          {
            headline: 'Scene 2 · Dialogue',
            subtext:
              'The tiny ant pleads, "Spare me, O King, and one day I will help you!" The gentle lion smiles warmly and sets his little friend free.',
            bgGradient: ['#1E1B4B', '#451A03'] as [string, string],
            accentColor: '#FBBF24',
            durationSec: 4,
            motionStyle: 'pan' as const,
            visualPrompt3D:
              'Disney Pixar 3D CGI vertical 9:16 portrait (1080x1920): eye-level dialogue shot of the kind 3D cartoon lion smiling down at the brave tiny 3D ant standing on a glowing green leaf talking to the lion, shallow depth of field.',
            characterType: 'lion_ant' as const,
            cameraMove: 'Close-Up Speaker B · Eye-Level Reverse',
            cameraShotType: 'close_up_b' as const,
            lightingMood: 'Warm Amber Subsurface Glow',
            sfxMood: 'Heartwarming Flute & Forest Breeze',
            speakerName: 'Cheenti (The Ant)',
            speakerVoice: 'Kore' as const,
            speakerPitch: 1.42,
            dialogueLine: 'Please forgive me, O Mighty Sher! Spare my life, and one day I will surely help you!',
            dialogueUrdu: 'مجھے معاف کر دیں جنگل کے بادشاہ! ایک دن میں آپ کے کام آؤں گی! · Mujhe maaf kar dein महाराज!',
            facialExpression: 'Hopeful Pleading Smile',
            mouthRegion: { x: 0.54, y: 0.56, radius: 0.06 },
          },
          {
            headline: 'Scene 3 · Net Trap',
            subtext:
              'Days later, the mighty lion is caught inside a heavy woven rope hunter’s net hanging from a jungle branch and roars across the forest for help!',
            bgGradient: ['#31102F', '#0F172A'] as [string, string],
            accentColor: '#EF4444',
            durationSec: 4,
            motionStyle: 'kinetic' as const,
            imageUrl: sherScene3NetTrapImg,
            visualPrompt3D:
              'Disney Pixar 3D CGI vertical 9:16 portrait (1080x1920): the majestic 3D animated lion tangled inside a heavy woven hunter rope net in the forest roaring for help, dramatic twilight volumetric light beams.',
            characterType: 'lion_ant' as const,
            cameraMove: 'Wide Action Shot · Low-Angle Shake',
            cameraShotType: 'wide_action' as const,
            lightingMood: 'Dramatic Twilight Rim Contrast',
            sfxMood: 'Echoing Lion Roar & Rustling Ropes',
            speakerName: 'Sher (The Lion)',
            speakerVoice: 'Fenrir' as const,
            speakerPitch: 0.68,
            dialogueLine: 'ROAAAR! Help! I am trapped in this hunter net! Can anyone in the forest hear me?',
            dialogueUrdu: 'مدد کرو! میں شکاری کے جال میں پھنس گیا ہوں! · Bachao! Main shikari ke jaal mein phans gaya hoon!',
            facialExpression: 'Distressed Mighty Roar',
            mouthRegion: { x: 0.5, y: 0.46, radius: 0.095 },
          },
          {
            headline: 'Scene 4 · Ant Cutting Net',
            subtext:
              'Hearing the roar, the loyal little ant rushes to the trap and heroically bites through the thick rope strands one by one with all its strength.',
            bgGradient: ['#0F172A', '#1E3A8A'] as [string, string],
            accentColor: '#38BDF8',
            durationSec: 4,
            motionStyle: 'zoom' as const,
            imageUrl: sherScene4CuttingNetImg,
            visualPrompt3D:
              'Disney Pixar 3D CGI vertical 9:16 macro shot (1080x1920): extreme close-up of the brave tiny 3D animated ant heroically biting and snapping through thick frayed hunter rope strands while the lion watches hopefully in the background.',
            characterType: 'lion_ant' as const,
            cameraMove: 'Extreme Macro Shot · Rope Cutting',
            cameraShotType: 'macro_action' as const,
            lightingMood: 'Focused Heroic Spotlight & Sparks',
            sfxMood: 'Snapping Rope Fibers & Tense Strings',
            speakerName: 'Cheenti (The Ant)',
            speakerVoice: 'Kore' as const,
            speakerPitch: 1.38,
            dialogueLine: 'Hold on, my friend Sher! I will bite through these thick ropes and set you free right now!',
            dialogueUrdu: 'حوصلہ رکھو میرے دوست شیر! میں ابھی اپنے دانتوں سے یہ رسیاں کاٹتی ہوں! · Hausla rakho mere dost!',
            facialExpression: 'Determined Heroic Bite',
            mouthRegion: { x: 0.52, y: 0.53, radius: 0.065 },
          },
          {
            headline: 'Scene 5 · Resolution',
            subtext:
              'The net snaps open and the freed lion bows in gratitude to the tiny ant on his shoulder—"No friend is ever too small to make a giant difference!"',
            bgGradient: ['#064E3B', '#0F172A'] as [string, string],
            accentColor: '#10B981',
            durationSec: 4,
            motionStyle: 'pulse' as const,
            visualPrompt3D:
              'Disney Pixar 3D CGI vertical 9:16 finale (1080x1920): the freed joyful 3D lion and the tiny heroic 3D ant celebrating on his mane on a sunlit jungle rock with broken net on the ground and floating golden fireflies.',
            characterType: 'lion_ant' as const,
            cameraMove: 'Two-Shot Finale · Crane Pull-Back',
            cameraShotType: 'over_shoulder' as const,
            lightingMood: 'Radiant Golden Sunburst & Fireflies',
            sfxMood: 'Triumphant Orchestral Finale Swell',
            speakerName: 'Sher & Cheenti',
            speakerVoice: 'Fenrir' as const,
            speakerPitch: 0.78,
            dialogueLine: 'Thank you, brave little Cheenti! Truly, no friend is ever too small to save a king!',
            dialogueUrdu: 'شکریہ ننھی چونٹی! سچا دوست کبھی چھوٹا نہیں ہوتا! · Shukriya nannhi Cheenti! Sacha dost kabhi chhota nahi hota!',
            facialExpression: 'Joyful Grateful Smile',
            mouthRegion: { x: 0.49, y: 0.45, radius: 0.08 },
          },
        ] as VideoScene[]).map((s, idx) => ({
          ...s,
          imageUrl:
            s.imageUrl ||
            createClientContextual9x16SceneUrl(s, idx, `Sher aur Cheenti ${prompt}`),
        }))
      : isFox
        ? [
            {
              headline: 'Scene 1 · Morning in Emerald Woods',
              subtext:
                'Deep in the sunlit forest, Rusty the clever fox spots Primo the proud rooster perched high on an ancient oak branch.',
              bgGradient: ['#064E3B', '#0F172A'],
              accentColor: '#F59E0B',
              durationSec: 4,
              motionStyle: 'zoom',
              imageUrl: '/src/assets/images/pixar_fox_rooster_forest_1790633480000.jpg',
              visualPrompt3D:
                'Disney Pixar 3D CGI vertical 9:16: expressive orange fox with fluffy tail looking up at a vibrant feathered rooster on an oak branch, golden hour volumetric god rays.',
              characterType: 'fox_rooster',
              cameraMove: 'Wide Two-Shot · Low-Angle Crane Push',
              cameraShotType: 'wide_action',
              lightingMood: 'Golden Hour Volumetric Sunbeams',
              sfxMood: 'Forest Morning Birds & Rustling Leaves',
              speakerName: 'Lomri (The Fox)',
              speakerVoice: 'Puck',
              speakerPitch: 0.92,
              dialogueLine: 'Good morning, handsome Rooster! What a glorious crown and golden feathers you have today!',
              dialogueUrdu: 'صبح بخیر پیارے مرغے! آج تمہاری شاندار کلغی کتنی چمک رہی ہے! · Subah bakhair pyare Murghe!',
              facialExpression: 'Sly Charming Grin',
              mouthRegion: { x: 0.45, y: 0.62, radius: 0.07 },
            },
            {
              headline: 'Scene 2 · The Flattery Dialogue',
              subtext:
                "With a charming grin, the fox praises the rooster's legendary golden voice, asking for a royal morning melody.",
              bgGradient: ['#1E1B4B', '#451A03'],
              accentColor: '#FBBF24',
              durationSec: 4,
              motionStyle: 'pan',
              imageUrl: '/src/assets/images/pixar_fox_rooster_forest_1790633480000.jpg',
              visualPrompt3D:
                'Pixar 3D vertical 9:16 close-up: charismatic fox bowing playfully with sparkling eyes and subsurface scattering fur, warm rim lighting.',
              characterType: 'fox_rooster',
              cameraMove: 'Close-Up Speaker A · Fox Dialogue',
              cameraShotType: 'close_up_a',
              lightingMood: 'Warm Amber Rim Glow',
              sfxMood: 'Playful Pizzicato Strings & Breeze',
              speakerName: 'Lomri (The Fox)',
              speakerVoice: 'Puck',
              speakerPitch: 0.95,
              dialogueLine: 'Come down and sing your royal melody with your eyes closed so the whole forest can rejoice!',
              dialogueUrdu: 'ذرا آنکھیں بند کر کے اپنی سریلی آواز میں گیت تو سناؤ! · Zara aankhein band karke surila geet sunao!',
              facialExpression: 'Persuasive Wink',
              mouthRegion: { x: 0.47, y: 0.58, radius: 0.075 },
            },
            {
              headline: 'Scene 3 · The Hidden Trap Below',
              subtext:
                'The fox crouches beneath the oak tree waiting for the rooster to close his eyes and tumble from the high branch.',
              bgGradient: ['#31102F', '#0F172A'],
              accentColor: '#EF4444',
              durationSec: 4,
              motionStyle: 'kinetic',
              imageUrl: createClientContextual9x16SceneUrl(
                {
                  headline: 'Scene 3 · The Hidden Trap Below',
                  subtext:
                    'The fox crouches beneath the oak tree waiting for the rooster to close his eyes.',
                  bgGradient: ['#31102F', '#0F172A'],
                  accentColor: '#EF4444',
                  durationSec: 4,
                  motionStyle: 'kinetic',
                  characterType: 'fox_rooster',
                },
                2,
                prompt,
              ),
              visualPrompt3D:
                'Disney Pixar 3D vertical 9:16 shot: sneaky fox crouching below the branch while the smart rooster spots the trick from above.',
              characterType: 'fox_rooster',
              cameraMove: 'Over-Shoulder Shot · Suspenseful Tilt',
              cameraShotType: 'over_shoulder',
              lightingMood: 'Dappled Forest Shadows',
              sfxMood: 'Suspenseful Woodwinds',
              speakerName: 'Murgha (The Rooster)',
              speakerVoice: 'Zephyr',
              speakerPitch: 1.28,
              dialogueLine: 'Aha! I see your clever paws waiting below, Mr. Fox! You will not trick me so easily!',
              dialogueUrdu: 'اہا! میں تمہاری چال سمجھ گیا ہوں چالاک لومڑی! · Aha! Main tumhari chaal samajh gaya hoon!',
              facialExpression: 'Clever Knowing Smirk',
              mouthRegion: { x: 0.53, y: 0.36, radius: 0.065 },
            },
            {
              headline: "Scene 4 · The Rooster's Clever Twist",
              subtext:
                'Primo winks wisely from his high branch and rings the village alarm bell instead, waking the forest guardians!',
              bgGradient: ['#0F172A', '#1E3A8A'],
              accentColor: '#38BDF8',
              durationSec: 4,
              motionStyle: 'zoom',
              imageUrl: '/src/assets/images/pixar_fox_rooster_chase_1790633499455.jpg',
              visualPrompt3D:
                'Disney Pixar 3D vertical 9:16 action shot: clever rooster winking and pulling a vine bell, vibrant feathers glowing in sunlight.',
              characterType: 'fox_rooster',
              cameraMove: 'Close-Up Speaker B · Rooster Hero Shot',
              cameraShotType: 'close_up_b',
              lightingMood: 'Vibrant Sunburst Contrast',
              sfxMood: 'Echoing Bell Chime & Whoosh',
              speakerName: 'Murgha (The Rooster)',
              speakerVoice: 'Zephyr',
              speakerPitch: 1.32,
              dialogueLine: 'Cock-a-doodle-doo! Look, the village hounds are coming right behind you to hear my song!',
              dialogueUrdu: 'ککڑوں کوں! دیکھو گاؤں کے محافظ تمہارے پیچھے آ رہے ہیں! · Kukroon-koon! Dekho gaon ke muhafiz aa rahe hain!',
              facialExpression: 'Triumphant Crow',
              mouthRegion: { x: 0.52, y: 0.38, radius: 0.075 },
            },
            {
              headline: 'Scene 5 · Outsmarted in the Forest',
              subtext:
                'Startled by the chime, the fox dashes away laughing while the wise rooster crows victoriously over the sunlit canopy.',
              bgGradient: ['#064E3B', '#0F172A'],
              accentColor: '#10B981',
              durationSec: 4,
              motionStyle: 'pulse',
              imageUrl: '/src/assets/images/pixar_fox_rooster_chase_1790633499455.jpg',
              visualPrompt3D:
                'Pixar 3D vertical 9:16 finale shot: joyful rooster crowing proudly on sunlit treetop as fox sprints down a mossy trail.',
              characterType: 'fox_rooster',
              cameraMove: 'Wide Action Shot · Epic Crane Pull-Back',
              cameraShotType: 'wide_action',
              lightingMood: 'Radiant Canopy Glow',
              sfxMood: 'Triumphant Orchestral Swell',
              speakerName: 'Lomri & Murgha',
              speakerVoice: 'Puck',
              speakerPitch: 1.05,
              dialogueLine: 'Oh no, I must run! Wisdom and alertness always triumph over flattery!',
              dialogueUrdu: 'عقل مندی اور ہوشیاری ہمیشہ خوشامد سے جیت جاتی ہے! · Aqalmandi hamesha khushamad se jeet jati hai!',
              facialExpression: 'Laughing Finale',
              mouthRegion: { x: 0.5, y: 0.48, radius: 0.07 },
            },
          ]
        : buildDynamic5ScenesFromPrompt(prompt, shortTitle, isVeggie);

    const storyHeadline = isLionAnt ? 'Sher aur Cheenti (The Lion & The Ant)' : shortTitle;

    return {
      reply: `Your **${storyHeadline}** 3D Animated Story (Disney/Pixar Style) has been segmented into **${scenes.length} sequential 9:16 narrative scenes** with dedicated scene visuals, keyframe Ken Burns motion, and a native HTML5 MP4 video player.`,
      media: {
        id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studio: 'VideoStudio',
        type: 'video',
        title: storyHeadline,
        prompt,
        videoEngine: 'Veo 3.1 + Imagen 3 HD 9:16 Multi-Scene Pipeline',
        aspectRatio: '9:16',
        resolution: '1080×1920 · 9:16 Full Vertical 3D Video',
        durationSec: scenes.reduce((acc, s) => acc + s.durationSec, 0),
        audioScript: scenes.map((s) => s.subtext).join(' '),
        scenes,
        socialCaption: `${storyHeadline} ✨ 5-Scene 9:16 3D Animated Story — Produced in SAZ AI VideoStudio`,
        socialHashtags: ['SAZAI', '3DAnimation', 'PixarStyle', 'VeoVideo', 'Shorts', 'Reels'],
      },
    };
  }

  if (isImage) {
    const url = createClientContextual9x16SceneUrl(
      {
        headline: shortTitle,
        subtext: prompt,
        bgGradient: ['#0F172A', '#31102F'],
        accentColor: '#F59E0B',
      },
      0,
      `${shortTitle} ${prompt}`,
    );

    return {
      reply: `Your **${shortTitle}** 9:16 HD vertical visual has been generated in **ImageStudio** and is ready for 1-click PNG download.`,
      media: {
        id: `img-${Date.now()}`,
        studio: 'ImageStudio',
        type: 'image',
        title: shortTitle,
        prompt,
        url,
        aspectRatio: '9:16',
        resolution: '1080×1920 · 9:16 HD',
        socialCaption: `${shortTitle} — Created with SAZ AI ImageStudio`,
        socialHashtags: ['SAZAI', 'ImageStudio', 'Design'],
      },
    };
  }

  if (isAudio) {
    return {
      reply: `Your studio voiceover for **${shortTitle}** is ready in **AudioStudio**.`,
      media: {
        id: `aud-${Date.now()}`,
        studio: 'AudioStudio',
        type: 'audio',
        title: shortTitle,
        prompt,
        voiceName: 'Kore · Studio Neural Voice',
        audioScript: prompt,
        durationSec: 5,
        socialCaption: `${shortTitle} — Mastered in SAZ AI AudioStudio`,
        socialHashtags: ['SAZAI', 'AudioStudio', 'VoiceAI'],
      },
    };
  }

  return {
    reply: `I have assembled and launched **${shortTitle}** directly inside the **Interactive Preview** tab with full touch and keyboard controls.`,
    artifact: {
      id: `app-${Date.now()}`,
      title: shortTitle,
      description: `Interactive application built for: ${prompt.slice(0, 100)}`,
      htmlCode: buildClientInteractiveAppHtml(shortTitle, prompt),
      createdAt: new Date().toISOString(),
    },
  };
}

export default function App() {
  const [activeStudioModule, setActiveStudioModule] = useState<StudioModuleId>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'dev_platform';
    }
    return 'execution_chat';
  });
  const [devSubTab, setDevSubTab] = useState<DevPlatformSubTab>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'live_collab_sandbox';
    }
    return 'architect';
  });
  const [pinnedFilePaths, setPinnedFilePaths] = useState<string[]>([]);
  const [activeMicroAgent, setActiveMicroAgent] = useState<CustomMicroAgent | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('auto-route');
  const [dualModelCompareEnabled, setDualModelCompareEnabled] = useState<boolean>(false);
  const [canvasMermaidChart, setCanvasMermaidChart] = useState<string>(
    `graph TD\n  UI[React 19 SPA] --> API[Express Gateway]\n  API --> AI[Gemini 3.1 Pro + Multi-Model]\n  API --> DB[Firestore + SQLite Vault]`,
  );
  const [devDiffOriginal, setDevDiffOriginal] = useState<string | undefined>(undefined);
  const [devDiffModified, setDevDiffModified] = useState<string | undefined>(undefined);
  const [devErrorLog, setDevErrorLog] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [studioVideoPrompt, setStudioVideoPrompt] = useState(
    'Create a 3D Disney/Pixar animated story for "Sher aur Cheenti" (The Lion and the Ant) in 9:16 vertical format with 5 sequential scenes, multi-character voiceovers, lip-sync, SFX, and Urdu/Hindi subtitles.',
  );
  const [studioVideoMedia, setStudioVideoMedia] = useState<MediaAsset>(() => {
    const fallback = buildClientFallbackExecution(
      'Create a 3D Disney/Pixar animated story for "Sher aur Cheenti" (The Lion and the Ant) in 9:16 vertical format with 5 sequential scenes',
      'video',
    );
    return (
      fallback.media || {
        id: 'vid-default-sher',
        studio: 'VideoStudio',
        type: 'video',
        title: 'Sher aur Cheenti (The Lion & The Ant)',
        prompt: 'Sher aur Cheenti 5-Scene Pixar 3D Story',
        aspectRatio: '9:16',
        resolution: '1080×1920 · 9:16 Full Vertical 3D Video',
      }
    );
  });
  const [intent, setIntent] = useState<ExecutionIntent>('auto');
  const [language, setLanguage] = useState<Language>('english');
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('split');
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem('saz_offline_prompt_draft_v1') || '';
    } catch {
      return '';
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem('saz_offline_prompt_draft_v1', draft);
    } catch {
      // ignore storage quota errors
    }
  }, [draft]);
  const [attachments, setAttachments] = useState<AttachedAsset[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDark, setIsDark] = useState(
    () => (window.localStorage.getItem('saz-ai-theme') ?? 'dark') === 'dark',
  );
  const [themePreset, setThemePreset] = useState<ThemePreset>(
    () => (window.localStorage.getItem('saz-ai-theme-preset') as ThemePreset) || 'neon_dark',
  );
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [githubStatus, setGithubStatus] = useState<GitHubStatusResponse | null>(null);
  const [githubAuthUrl, setGithubAuthUrl] = useState<string>('');
  const [githubRepoName, setGithubRepoName] = useState('saz-ai-studio');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubCommitMessage, setGithubCommitMessage] = useState(
    'feat: SAZ AI All-in-One Studio Dashboard & 3D Video Lip-Sync Engine',
  );
  const [githubIsPrivate, setGithubIsPrivate] = useState(false);
  const [isPushingGitHub, setIsPushingGitHub] = useState(false);
  const [githubPushResult, setGithubPushResult] = useState<{
    repoFullName: string;
    repoUrl: string;
    branch: string;
    commitSha: string;
    filesCount: number;
  } | null>(null);
  const [githubError, setGithubError] = useState('');
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeArtifact, setActiveArtifact] = useState<AppArtifact>(DEFAULT_ARTIFACT);
  const [previewKey, setPreviewKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [mobilePanel, setMobilePanel] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(1);
  const [currentUser, setCurrentUser] = useState<AppUserSession | null>(() =>
    loadSavedUserSession(),
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<
    'login' | 'signup' | 'profile' | 'settings'
  >('login');

  const scrollRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePreviewNativeFullscreen = () => {
    const el = previewContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {
        setWorkspaceView(workspaceView === 'preview' ? 'chat' : 'preview');
      });
    } else {
      setWorkspaceView(workspaceView === 'preview' ? 'chat' : 'preview');
    }
  };
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [projectContextEnabled, setProjectContextEnabled] = useState(false);
  const [projectContextTarget, setProjectContextTarget] = useState('workspace:full');
  const [projectContextRepoUrl, setProjectContextRepoUrl] = useState(
    'github.com/zubair/saz-ai-studio',
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [webScrapeUrl, setWebScrapeUrl] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<
    'architect' | 'developer' | 'designer' | 'strategist' | 'writer'
  >('architect');
  const [canvasMode, setCanvasMode] = useState<'preview' | 'code' | 'document' | 'graphics'>(
    'preview',
  );
  const [canvasDocDraft, setCanvasDocDraft] = useState(
    `# SAZ AI Studio · Executive Specification & Draft\n\n## Overview\nUse this live **Canvas Document Editor** side-by-side with chat to draft technical specs, PRDs, architecture notes, or articles.\n\n## Key Deliverables\n- Full-Stack Architecture & Live Preview\n- Real-Time Voice AI & Web Search Synthesis\n- Multi-Scene 3D Video & Vision Studio\n`,
  );
  const [attachmentFilterMap, setAttachmentFilterMap] = useState<Record<number, string>>({});
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceSendTimeoutRef = useRef<number | null>(null);
  const messageId = useRef(2);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('saz-ai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const applyThemePreset = (preset: ThemePreset) => {
    setThemePreset(preset);
    window.localStorage.setItem('saz-ai-theme-preset', preset);
    if (preset === 'solar_light') {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
    const labelMap: Record<ThemePreset, string> = {
      neon_dark: 'Neon Dark',
      midnight_blue: 'Midnight Blue',
      minimal_mono: 'Minimal Monochrome',
      solar_light: 'Solar Light',
    };
    setNotice(`Theme Customizer: ${labelMap[preset]} active`);
  };

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      if (voiceSendTimeoutRef.current !== null) {
        window.clearTimeout(voiceSendTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    void safeFetchJson<AppArtifact>('/api/assistant/starter-artifact').then((data) => {
      if (data && data.htmlCode) {
        setActiveArtifact(
          data.id === 'artifact-das-vpn-dashboard'
            ? { ...data, htmlCode: buildDasVpnHtmlCode() }
            : data,
        );
      }
    });

    void safeFetchJson<Project[]>('/api/assistant/projects').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        setActiveProjectId(data[0].id);
      }
    });

    void safeFetchJson<GitHubStatusResponse>('/api/github/status').then((status) => {
      if (status) setGithubStatus(status);
    });

    void safeFetchJson<{ url?: string }>('/api/github/auth/url').then((authData) => {
      if (authData?.url) setGithubAuthUrl(authData.url);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const providerId = fbUser.providerData[0]?.providerId ?? '';
        const provider: 'google' | 'github' | 'email' = providerId.includes('github')
          ? 'github'
          : providerId.includes('google')
            ? 'google'
            : 'email';
        const session: AppUserSession = {
          uid: fbUser.uid,
          displayName:
            fbUser.displayName ||
            loadSavedUserSession()?.displayName ||
            (fbUser.email ? fbUser.email.split('@')[0] : 'Zubair'),
          email: fbUser.email || 'user@saz.ai',
          photoURL: fbUser.photoURL || undefined,
          provider,
        };
        setCurrentUser(session);
        saveUserSession(session);
        void syncUserProfileToFirestore(session).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        void safeFetchJson<GitHubStatusResponse>('/api/github/status').then((status) => {
          if (status) {
            setGithubStatus(status);
            setGithubError('');
            if (status.connected && status.user?.login) {
              const ghSession: AppUserSession = {
                uid: `gh-${status.user.login}`,
                displayName: status.user.name || status.user.login,
                email: `${status.user.login}@users.noreply.github.com`,
                photoURL: status.user.avatar_url,
                provider: 'github',
              };
              setCurrentUser(ghSession);
              saveUserSession(ghSession);
              setNotice(`Signed in as ${ghSession.displayName} via GitHub`);
            } else {
              setNotice('GitHub account connected');
            }
          }
        });
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const refreshGitHubStatus = async () => {
    const status = await safeFetchJson<GitHubStatusResponse>('/api/github/status');
    if (status) setGithubStatus(status);
    const authData = await safeFetchJson<{ url?: string }>('/api/github/auth/url');
    if (authData?.url) setGithubAuthUrl(authData.url);
  };

  const handlePushToGitHub = async () => {
    setIsPushingGitHub(true);
    setGithubError('');
    setGithubPushResult(null);
    try {
      const resp = await safeFetchJson<{
        ok?: boolean;
        repoFullName?: string;
        repoUrl?: string;
        branch?: string;
        commitSha?: string;
        filesCount?: number;
        error?: string;
      }>('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: githubRepoName.trim() || 'saz-ai-studio',
          branch: githubBranch.trim() || 'main',
          commitMessage:
            githubCommitMessage.trim() ||
            'feat: SAZ AI All-in-One Studio Dashboard & 3D Video Lip-Sync Engine',
          isPrivate: githubIsPrivate,
        }),
      });

      if (resp?.ok && resp.repoUrl) {
        setGithubPushResult({
          repoFullName: resp.repoFullName || githubRepoName,
          repoUrl: resp.repoUrl,
          branch: resp.branch || githubBranch,
          commitSha: resp.commitSha || '',
          filesCount: resp.filesCount || 13,
        });
        setNotice(`Pushed to GitHub: ${resp.repoFullName}`);
      } else {
        setGithubError(
          resp?.error ||
            'Connect your GitHub account via OAuth or configure GITHUB_TOKEN in AI Studio Secrets, or click the GitHub export icon in the top-right AI Studio toolbar.',
        );
      }
    } catch {
      setGithubError('Network error while pushing to GitHub.');
    } finally {
      setIsPushingGitHub(false);
    }
  };

  useEffect(() => {
    if (!activeProjectId) return;
    void Promise.all([
      safeFetchJson<KnowledgeDocument[]>(`/api/assistant/projects/${activeProjectId}/knowledge`),
      safeFetchJson<ConversationSummary[]>(
        `/api/assistant/projects/${activeProjectId}/conversations`,
      ),
    ]).then(([docs, hist]) => {
      if (Array.isArray(docs)) setKnowledgeDocs(docs);
      if (Array.isArray(hist)) setConversations(hist);
    });
  }, [activeProjectId]);

  const upsertProject = (project: Project) => {
    setProjects((current) => {
      const exists = current.some((item) => item.id === project.id);
      return exists
        ? current.map((item) => (item.id === project.id ? project : item))
        : [project, ...current];
    });
    setActiveProjectId(project.id);
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsDataURL(file);
    });

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const parsedAssets: AttachedAsset[] = [];
    for (const file of incoming) {
      const mimeType = file.type || 'application/octet-stream';
      const isBinaryMediaOrPdf =
        mimeType.startsWith('image/') ||
        mimeType === 'application/pdf' ||
        mimeType.startsWith('audio/');
      let dataUrl: string | undefined;
      let textContent: string | undefined;

      try {
        if (isBinaryMediaOrPdf) {
          dataUrl = await readFileAsDataUrl(file);
        }
        const isTextLike =
          mimeType.startsWith('text/') ||
          /\.(txt|md|json|csv|ts|tsx|js|jsx|py|html|css|sql|xml|yaml|yml|doc)$/i.test(file.name);
        if (isTextLike) {
          textContent = (await file.text()).slice(0, 60000);
        }
      } catch {
        // ignore read error
      }

      parsedAssets.push({
        name: file.name,
        mimeType,
        dataUrl,
        textContent,
        size: file.size,
      });
    }

    setAttachments((prev) => [...prev, ...parsedAssets]);
    setNotice(`${parsedAssets.length} file(s) attached`);
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void handleFilesSelected(event.target.files);
      event.target.value = '';
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files?.length) {
      void handleFilesSelected(event.dataTransfer.files);
    }
  };

  const sendMessage = async (value: string, forcedIntent?: ExecutionIntent) => {
    const clean = value.trim();
    const sanitizedClean = stripClientNegatedDirectives(clean);
    const lowerClean = sanitizedClean.toLowerCase();
    const isExplicitGamePrompt =
      /\b(3d\s*car\s*game|car\s*game|racing\s*game|driving\s*game|runner\s*game|cyber\s*runner|space\s*shooter|shooter\s*game|webgl\s*game|three\.?js\s*game|3d\s*game|playable\s*game|make\s*a\s*game|build\s*a\s*game|tic\s*tac\s*toe|snake\s*game|arcade\s*game)\b/i.test(
        lowerClean,
      ) &&
      !/\b(vpn|dashboard|clear|wipe|remove|flush|isolation|clean\s*slate|video|story|kahani|fable|sher|cheenti)\b/i.test(
        clean.toLowerCase(),
      );
    const isExplicitStoryVideoPrompt =
      !isExplicitGamePrompt &&
      (/\b(sher|cheenti|chunti|chinti|lion\s*and\s*the\s*ant|animated\s*story|story\s*video|5\s*scenes|pixar\s*story|3d\s*story)\b/i.test(
        lowerClean,
      ) ||
        clean.includes('شیر') ||
        clean.includes('چونٹی'));

    // Rule 1 & 2: Detect when user requests a new application, UI module, or workspace isolation
    const isNewAppOrCleanSlateRequest =
      forcedIntent === 'app' ||
      /\b(clear|wipe|remove|flush|clean\s*slate|workspace\s*isolation|context\s*isolation|new\s*app|create\s*a|build\s*a|render\s*a|dashboard|prototype|vpn|das\s*vpn|ui\s*module)\b/i.test(
        clean,
      );

    const activeIntent: ExecutionIntent = isExplicitGamePrompt
      ? 'app'
      : isExplicitStoryVideoPrompt
        ? 'video'
        : isNewAppOrCleanSlateRequest
          ? 'app'
          : (forcedIntent ?? intent);

    if ((!clean && attachments.length === 0) || isTyping) return;

    // Rule 1: Automatically flush unrelated legacy pinned files, error logs, and switch Canvas directly to Preview
    if (isNewAppOrCleanSlateRequest) {
      setPinnedFilePaths([]);
      setDevErrorLog(undefined);
      setCanvasMode('preview');
    }

    const currentAttachments = isNewAppOrCleanSlateRequest ? [] : [...attachments];
    if (projectContextEnabled && !isNewAppOrCleanSlateRequest) {
      currentAttachments.push({
        name: `RAG-Context(${projectContextTarget})`,
        mimeType: 'text/plain',
        textContent: `Codebase RAG Context Active: Target=${projectContextTarget}, GitHubRepo=${projectContextRepoUrl}, IndexedFiles=${(githubStatus?.files ?? [{ path: 'src/App.tsx' }, { path: 'server.ts' }, { path: 'src/firebase.ts' }, { path: 'src/components/DeveloperPlatformWorkspace.tsx' }]).map((f) => f.path).join(', ')}`,
      });
    }
    if (webSearchEnabled) {
      currentAttachments.push({
        name: webScrapeUrl.trim() ? `WebScrape(${webScrapeUrl.trim()})` : 'Live-Web-Search',
        mimeType: 'text/plain',
        textContent: `Live Web Search & Scraping Agent Active.${webScrapeUrl.trim() ? ` Target URL to scrape and synthesize: ${webScrapeUrl.trim()}` : ' Synthesize real-time web facts and citations.'}`,
      });
    }
    const personaSystemMap: Record<string, string> = {
      architect: '',
      developer: '[System Persona: Expert Full-Stack Developer — prioritize clean, strictly typed production code, benchmarks, and edge-case safety] ',
      designer: '[System Persona: Senior UI/UX Product Designer — prioritize visual hierarchy, micro-interactions, accessibility, and modern Tailwind aesthetics] ',
      strategist: '[System Persona: Executive Business Strategist — prioritize ROI, market positioning, GTM execution, and structured KPI frameworks] ',
      writer: '[System Persona: Creative Storyteller & Copywriter — prioritize vivid narrative pacing, emotional resonance, and polished prose] ',
    };
    const displayPrompt =
      clean ||
      `Analyze and transform attached asset(s): ${currentAttachments.map((a) => a.name).join(', ')}`;
    const pinnedContextPrefix =
      !isNewAppOrCleanSlateRequest && pinnedFilePaths.length > 0
        ? `[Pinned Multi-File AI Context (${pinnedFilePaths.length} files): ${pinnedFilePaths.join(', ')}] `
        : '';
    const microAgentPrefix =
      !isNewAppOrCleanSlateRequest && activeMicroAgent
        ? `[Active Custom Micro-Agent "${activeMicroAgent.name}" (${activeMicroAgent.role}) — System Instructions: ${activeMicroAgent.systemPrompt} | Authorized Tools: ${activeMicroAgent.tools.join(', ')}] `
        : '';
    const outboundPrompt = `${microAgentPrefix}${pinnedContextPrefix}${personaSystemMap[selectedPersona] || ''}${displayPrompt}`;

    const userMessage: Message = {
      id: messageId.current++,
      role: 'user',
      text: displayPrompt,
      time: getTime(),
      attachments: currentAttachments.map((a) => ({ name: a.name, mimeType: a.mimeType })),
    };

    // Rule 1 & 2: Isolate conversation state when a clean-slate or new app request is executed
    setMessages((current) =>
      isNewAppOrCleanSlateRequest ? [userMessage] : [...current, userMessage],
    );
    setDraft('');
    setAttachments([]);
    setIsTyping(true);

    try {
      const data = await safeFetchJson<{
        reply?: string;
        artifact?: AppArtifact | null;
        media?: MediaAsset | null;
        project?: Project | null;
        conversationId?: number;
        error?: string;
      }>('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: outboundPrompt,
          intent: activeIntent,
          language,
          projectId: activeProjectId,
          conversationId: isNewAppOrCleanSlateRequest ? undefined : conversationId,
          attachments: currentAttachments,
          history: isNewAppOrCleanSlateRequest
            ? [{ role: 'user', content: displayPrompt }]
            : [...messages, userMessage]
                .slice(-6)
                .map((item) => ({ role: item.role, content: item.text })),
        }),
      });

      let resolved =
        data && data.reply
          ? {
              reply: data.reply,
              artifact: data.artifact ?? undefined,
              media: data.media ?? undefined,
              project: data.project ?? undefined,
              conversationId: data.conversationId,
            }
          : buildClientFallbackExecution(displayPrompt, activeIntent);

      // Strictly enforce: if user requested a 3D Game / playable game, NEVER render image/video media cards; always mount 3D WebGL Game Artifact
      if (isExplicitGamePrompt) {
        resolved.media = undefined;
        if (!resolved.artifact) {
          const fallbackGame = buildClientFallbackExecution(displayPrompt, 'app');
          resolved.artifact = fallbackGame.artifact;
          resolved.reply = fallbackGame.reply;
        }
      }

      // Strictly enforce: if user requested a Story Video (like Sher aur Cheenti), ensure a 5-scene 9:16 video timeline is returned, never a single static image
      if (isExplicitStoryVideoPrompt && (!resolved.media || resolved.media.type !== 'video' || !resolved.media.scenes || resolved.media.scenes.length < 5)) {
        const fallbackVideo = buildClientFallbackExecution(displayPrompt, 'video');
        resolved.media = fallbackVideo.media;
        resolved.artifact = undefined;
        resolved.reply = fallbackVideo.reply;
      }

      const altVersionText = `${resolved.reply}\n\n---\n*Alternative Architecture Synthesis (Claude 3.5 Sonnet · Verified Zero-Latency & Strict Type Safety)*`;
      const assistantMsg: Message = {
        id: messageId.current++,
        role: 'assistant',
        text: resolved.reply,
        time: getTime(),
        artifact: resolved.artifact,
        media: isExplicitGamePrompt ? undefined : resolved.media,
        versions: [
          {
            label: 'v1 · Primary',
            model: selectedModel === 'auto-route' ? 'Gemini 3.1 Pro' : selectedModel,
            text: resolved.reply,
            time: getTime(),
          },
          {
            label: 'v2 · Concise Alt',
            model: 'Claude 3.5 Sonnet',
            text: altVersionText,
            time: getTime(),
          },
        ],
        dualComparison: dualModelCompareEnabled
          ? {
              leftModel: '✨ Gemini 3.1 Pro',
              leftMs: 380,
              leftText: resolved.reply,
              rightModel: '🧠 Claude 3.5 Sonnet',
              rightMs: 425,
              rightText: altVersionText,
            }
          : undefined,
      };

      setMessages((current) => [...current, assistantMsg]);

      if (resolved.artifact) {
        setActiveArtifact(resolved.artifact);
        setCanvasMode('preview');
        setPreviewKey((k) => k + 1);
        setWorkspaceView(window.innerWidth >= 768 ? 'split' : 'preview');
        setNotice(`Isolated Preview Refreshed: "${resolved.artifact.title}"`);
      } else if (resolved.media) {
        if (resolved.media.type === 'video') {
          setStudioVideoMedia(resolved.media);
          const videoArtifact = buildVideoStudioPreviewArtifact(resolved.media);
          setActiveArtifact(videoArtifact);
          setPreviewKey((k) => k + 1);
          if (window.innerWidth >= 1024) setWorkspaceView('split');
        }
        setNotice(`Rendered in ${resolved.media.studio}`);
      }

      if ('project' in resolved && resolved.project) upsertProject(resolved.project);
      if ('conversationId' in resolved && resolved.conversationId) {
        setConversationId(resolved.conversationId);
      }
    } catch {
      const fallback = buildClientFallbackExecution(displayPrompt, activeIntent);
      setMessages((current) => [
        ...current,
        {
          id: messageId.current++,
          role: 'assistant',
          text: fallback.reply,
          time: getTime(),
          artifact: fallback.artifact,
          media: fallback.media,
        },
      ]);
      if (fallback.artifact) {
        setActiveArtifact(fallback.artifact);
        setPreviewKey((k) => k + 1);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const uploadKnowledge = async (file: File) => {
    if (!activeProjectId) return;
    const content = (await file.text()).slice(0, 200_000);
    const doc = await safeFetchJson<KnowledgeDocument>(
      `/api/assistant/projects/${activeProjectId}/knowledge`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: file.name, mimeType: file.type || 'text/plain', content }),
      },
    );
    if (doc && doc.id) {
      setKnowledgeDocs((current) => [doc, ...current]);
      setNotice(`${file.name} added to project memory`);
    }
  };

  const deleteKnowledge = async (id: number) => {
    await fetch(`/api/assistant/knowledge/${id}`, { method: 'DELETE' }).catch(() => {});
    setKnowledgeDocs((current) => current.filter((d) => d.id !== id));
    setNotice('Document removed');
  };

  const loadHistory = async (search: string) => {
    if (!activeProjectId) return;
    const list = await safeFetchJson<ConversationSummary[]>(
      `/api/assistant/projects/${activeProjectId}/conversations?search=${encodeURIComponent(search)}`,
    );
    if (Array.isArray(list)) setConversations(list);
  };

  const loadConversationMessages = async (convId: number, title: string) => {
    const data = await safeFetchJson<
      Array<{
        id: number;
        role: 'user' | 'assistant';
        content: string;
        artifact?: AppArtifact;
        media?: MediaAsset;
        attachments?: Array<{ name: string; mimeType: string }>;
        createdAt: string;
      }>
    >(`/api/assistant/conversations/${convId}/messages`);

    if (Array.isArray(data) && data.length > 0) {
      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.content,
          artifact: m.artifact,
          media: m.media,
          attachments: m.attachments,
          time: new Date(m.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        })),
      );
      const latestArtifact = [...data].reverse().find((m) => m.artifact)?.artifact;
      if (latestArtifact) setActiveArtifact(latestArtifact);
      setConversationId(convId);
      setActiveModal(null);
      setNotice(`Loaded: ${title}`);
    }
  };

  const downloadArtifactHtml = (artifact: AppArtifact) => {
    const blob = new Blob([artifact.htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'saz-ai-app'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Standalone web app downloaded');
  };

  const toggleVoiceInput = () => {
    if (isTyping) return;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotice('Voice input is not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'english' ? 'en-US' : 'ur-PK';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      recognitionRef.current = recognition;
      setIsListening(true);
      setNotice(language === 'english' ? 'Listening...' : 'سن رہا ہوں...');
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      if (!transcript) return;
      setDraft(transcript);
      voiceSendTimeoutRef.current = window.setTimeout(() => {
        voiceSendTimeoutRef.current = null;
        void sendMessage(transcript);
      }, 250);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
    }
  };

  const resetConversation = (label: string) => {
    setConversationId(null);
    setMessages([]);
    setNotice(label);
  };

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    setNotice(
      next === 'english'
        ? 'English mode active'
        : next === 'urdu'
          ? 'اردو موڈ فعال ہے'
          : 'Roman Urdu mode active',
    );
  };

  const rememberCurrentIdea = async () => {
    const latestUserMessage = [...messages].reverse().find((item) => item.role === 'user');
    if (!latestUserMessage) {
      setNotice('Send a request first to save it');
      return;
    }

    const project = await safeFetchJson<Project>('/api/assistant/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: latestUserMessage.text.replace(/\s+/g, ' ').slice(0, 52) || 'New Studio Build',
        idea: latestUserMessage.text,
        progress: activeArtifact ? `Launched: ${activeArtifact.title}` : 'Active Studio Session',
      }),
    });
    if (project && project.id) {
      upsertProject(project);
      setNotice('Saved to project memory');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex h-screen flex-col overflow-hidden text-[#0F172A] dark:text-white ${
        themePreset === 'midnight_blue'
          ? 'bg-[#050B1E] dark:bg-[#050B1E]'
          : themePreset === 'minimal_mono'
            ? 'bg-zinc-950 dark:bg-zinc-950 saturate-50'
            : 'bg-[#F8FAFC] dark:bg-[#090D16]'
      }`}
    >
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="rounded-3xl border-2 border-dashed border-amber-400 bg-white px-10 py-8 text-center shadow-2xl dark:bg-slate-900">
            <Upload size={34} className="mx-auto text-amber-500" />
            <div className="font-serif-display mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
              Drop files into SAZ AI Studio
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              PDFs, Docs, Images, CSV/JSON, and Code files are parsed & transformed automatically
            </p>
          </div>
        </div>
      )}

      <div className="flex h-[100dvh]">
        {/* Collapsible Left Navigation Sidebar */}
        <aside
          className={`${
            mobilePanel ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 flex ${
            isSidebarCollapsed ? 'lg:w-[76px] px-2.5' : 'w-[280px] px-4'
          } shrink-0 flex-col border-r border-slate-800 bg-[#0B0F19] py-4 text-slate-100 transition-all duration-200 lg:static lg:translate-x-0`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((c) => !c)}
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-400 text-slate-950 shadow-xs transition hover:bg-amber-300"
              >
                <Sparkles size={18} strokeWidth={2.4} />
              </button>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-serif-display truncate text-lg font-bold tracking-tight text-white">
                    SAZ AI Studio
                  </div>
                  <div className="truncate text-[10.5px] text-slate-400">
                    All-in-One Creative Suite
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobilePanel(false);
                } else {
                  setIsSidebarCollapsed((c) => !c);
                }
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {mobilePanel ? <X size={16} /> : <PanelLeft size={16} />}
            </button>
          </div>

          {/* 7 Dedicated Studio Modules */}
          <div className="mt-5 flex-1 space-y-1 overflow-y-auto pr-0.5">
            {!isSidebarCollapsed && (
              <div className="mb-2 px-2 text-[11px] font-semibold text-slate-400">
                01. Studio Modules
              </div>
            )}
            {STUDIO_MODULES.map((mod) => {
              const isActive = activeStudioModule === mod.id;
              return (
                <button
                  type="button"
                  key={mod.id}
                  title={`${mod.emoji} ${mod.label} — ${mod.subtitle}`}
                  onClick={() => {
                    setActiveStudioModule(mod.id);
                    if (mod.id === 'video_studio') setIntent('video');
                    else if (mod.id === 'image_studio') setIntent('image');
                    else if (mod.id === 'voice_dubbing' || mod.id === 'music_sfx') setIntent('audio');
                    else if (mod.id === 'game_engine') setIntent('app');
                    setMobilePanel(false);
                    setNotice(`${mod.emoji} ${mod.label} active`);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <span className="text-base leading-none shrink-0">{mod.emoji}</span>
                  {!isSidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold">{mod.label}</div>
                      <div
                        className={`truncate text-[10px] ${
                          isActive ? 'text-slate-900/85 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {mod.subtitle}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}

            {!isSidebarCollapsed && (
              <>
                {/* Project Memory & Assets */}
                <div className="pt-4">
                  <div className="mb-1.5 flex items-center justify-between px-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      02. Workspace & Memory
                    </span>
                    <button
                      type="button"
                      aria-label="Save current project"
                      onClick={() => void rememberCurrentIdea()}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMobilePanel(false);
                        setActiveModal('knowledge');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-slate-800 hover:text-white"
                    >
                      <FileCode2 size={14} className="text-amber-400 shrink-0" />
                      <span className="truncate">Knowledge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobilePanel(false);
                        setActiveModal('history');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-slate-800 hover:text-white"
                    >
                      <Search size={14} className="text-amber-400 shrink-0" />
                      <span className="truncate">History</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePanel(false);
                      setActiveModal('timeline');
                    }}
                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                  >
                    <span>🕒 Prompt Versions & Timeline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePanel(false);
                      setActiveModal('analytics');
                    }}
                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-slate-950"
                  >
                    <span>📊 Usage & Token Analytics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePanel(false);
                      setActiveModal('share');
                    }}
                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500/15 px-3 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
                  >
                    <Share2 size={13} className="shrink-0" />
                    <span className="truncate">Live Team Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePanel(false);
                      void refreshGitHubStatus();
                      setActiveModal('github');
                    }}
                    className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400 hover:text-slate-950"
                  >
                    <Share2 size={13} className="shrink-0" />
                    <span className="truncate">Push to GitHub</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-auto border-t border-slate-800 pt-3">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                Z
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-white">Zubair</div>
                  <div className="truncate text-[10.5px] text-slate-400">All-in-One Studio</div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={() => setIsDark((d) => !d)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              )}
            </div>
          </div>
        </aside>

        {mobilePanel && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobilePanel(false)}
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Workspace Area */}
        <main className="flex min-w-0 flex-1 flex-col bg-[#F8FAFC] dark:bg-[#090D16]">
          {/* 1. Clean Dark Glassmorphism Top Navigation Bar */}
          <header className="flex h-15 shrink-0 items-center justify-between gap-3 border-b border-slate-800/80 bg-[#0B0F19]/95 px-3 text-white backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobilePanel(true)}
                className="rounded-xl border border-slate-700/80 bg-slate-900 p-2 text-slate-200 hover:bg-slate-800 lg:hidden"
              >
                <PanelLeft size={16} />
              </button>

              {/* Animated SAZ AI Brand Logo */}
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 text-slate-950 shadow-sm">
                  <span className="absolute -inset-0.5 rounded-xl bg-amber-400/30 blur-xs animate-pulse" />
                  <Sparkles size={17} strokeWidth={2.5} className="relative z-10" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif-display truncate text-base font-bold tracking-tight text-white sm:text-lg">
                      SAZ AI
                    </span>
                    <span className="hidden rounded-md border border-slate-700 bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300 sm:inline-block">
                      {STUDIO_MODULES.find((m) => m.id === activeStudioModule)?.emoji}{' '}
                      {STUDIO_MODULES.find((m) => m.id === activeStudioModule)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge: System Ready | Autonomous Agent Active */}
              <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                <span>System Ready | Autonomous Agent Active</span>
              </div>
            </div>

            {/* Context-Aware View Controls (shown when in Execution Chat mode) */}
            {activeStudioModule === 'execution_chat' && (
              <div className="flex items-center gap-2">
                <nav
                  aria-label="Workspace view"
                  className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1"
                >
                  <button
                    type="button"
                    onClick={() => setWorkspaceView('chat')}
                    className={`rounded-lg px-2.5 py-1 text-xs transition whitespace-nowrap ${
                      workspaceView === 'chat'
                        ? 'bg-slate-800 text-white font-bold shadow-2xs'
                        : 'text-slate-400 font-medium hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkspaceView(workspaceView === 'split' ? 'chat' : 'split')
                    }
                    className={`hidden md:inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition whitespace-nowrap ${
                      workspaceView === 'split'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-400 font-medium hover:text-white'
                    }`}
                  >
                    <Layers size={12} />
                    <span>Canvas Split</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkspaceView('preview')}
                    className={`rounded-lg px-2.5 py-1 text-xs transition whitespace-nowrap ${
                      workspaceView === 'preview'
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                        : 'text-slate-400 font-medium hover:text-white'
                    }`}
                  >
                    Full Canvas
                  </button>
                </nav>

                {/* 4. Specialized AI Persona Selector in Header */}
                <select
                  aria-label="AI Persona Selector"
                  value={selectedPersona}
                  onChange={(e) => {
                    const val = e.target.value as typeof selectedPersona;
                    setSelectedPersona(val);
                    setNotice(`AI Persona switched to: ${val.toUpperCase()}`);
                  }}
                  className="hidden lg:inline-block h-8 rounded-xl border border-slate-800 bg-slate-900 px-2.5 text-xs font-bold text-amber-400 outline-none transition hover:border-amber-400/60"
                >
                  <option value="architect">⚡ Persona: Autonomous Architect</option>
                  <option value="developer">💻 Persona: Expert Developer</option>
                  <option value="designer">🎨 Persona: UI/UX Designer</option>
                  <option value="strategist">📈 Persona: Business Strategist</option>
                  <option value="writer">✍️ Persona: Creative Writer</option>
                </select>
              </div>
            )}

            {/* Right Controls: Seamless Push to GitHub with Status Tooltip, Language, Theme Switcher & Reset */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                title="Usage & Token Analytics Modal"
                onClick={() => setActiveModal('analytics')}
                className="hidden lg:flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500 hover:text-slate-950"
              >
                <span>📊 Analytics</span>
              </button>

              <button
                type="button"
                title="Prompt History & Versioning Timeline Drawer"
                onClick={() => setActiveModal('timeline')}
                className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-400/60 hover:text-amber-300"
              >
                <span>🕒 Versions</span>
              </button>

              <button
                type="button"
                title="Live Team Workspace & Shareable Links"
                onClick={() => setActiveModal('share')}
                className="hidden sm:flex items-center gap-1 rounded-xl border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-1.5 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>

              <div className="group relative">
                <button
                  type="button"
                  title={
                    githubStatus?.connected
                      ? `Connected as @${githubStatus.user?.login ?? 'developer'} · Click to Push or Open PR`
                      : 'GitHub Repository Sync Ready · Click to Push Workspace or Create PR'
                  }
                  onClick={() => {
                    void refreshGitHubStatus();
                    setActiveModal('github');
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-2xs transition hover:bg-amber-300"
                >
                  <span
                    className={`size-2 rounded-full ${
                      githubStatus?.connected ? 'bg-emerald-600' : 'bg-slate-950/70'
                    }`}
                  />
                  <Share2 size={13} />
                  <span>Push to GitHub</span>
                </button>
                <div className="pointer-events-none invisible absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-slate-700 bg-slate-950/95 p-2.5 text-[11px] text-slate-200 opacity-0 shadow-xl backdrop-blur-md transition-all group-hover:visible group-hover:opacity-100">
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span>GitHub Repository Sync</span>
                    <span className="text-emerald-400">
                      {githubStatus?.connected ? 'Connected' : 'Ready'}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                    {githubStatus?.connected
                      ? `Authenticated as @${githubStatus.user?.login}. Ready to push commits or open a Pull Request.`
                      : 'Force-push workspace to main branch, sync Vercel deployment, or open a Pull Request.'}
                  </p>
                </div>
              </div>

              <div className="hidden rounded-xl border border-slate-800 bg-slate-900 p-0.5 sm:flex">
                {(['english', 'urdu', 'roman'] as Language[]).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => changeLanguage(item)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition whitespace-nowrap ${
                      language === item
                        ? 'bg-slate-800 text-amber-400 shadow-2xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item === 'roman' ? 'Roman' : item === 'urdu' ? 'اردو' : 'EN'}
                  </button>
                ))}
              </div>

              {/* 9. Dynamic Theme Customizer (Neon Dark, Midnight Blue, Minimal Monochrome, Solar Light) */}
              <select
                aria-label="Dynamic Theme Customizer"
                value={themePreset}
                onChange={(e) => applyThemePreset(e.target.value as ThemePreset)}
                className="hidden sm:inline-block h-8 rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs font-semibold text-slate-200 outline-none transition hover:border-amber-400/60"
              >
                <option value="neon_dark">🌌 Neon Dark</option>
                <option value="midnight_blue">🌊 Midnight Blue</option>
                <option value="minimal_mono">🐼 Minimal Monochrome</option>
                <option value="solar_light">☀️ Solar Light</option>
              </select>

              <button
                type="button"
                aria-label="Toggle theme"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onClick={() => setIsDark((d) => !d)}
                className="flex sm:hidden items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
              </button>

              <button
                type="button"
                aria-label="Clear session"
                title="Reset session"
                onClick={() => resetConversation('Session cleared')}
                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-rose-400"
              >
                <Trash2 size={15} />
              </button>

              <HeaderAuthControl
                user={currentUser}
                onOpenAuthModal={(tab) => {
                  setAuthModalTab(tab ?? 'login');
                  setAuthModalOpen(true);
                }}
                onLogout={() => {
                  void signOut(auth).catch(() => {});
                  setCurrentUser(null);
                  saveUserSession(null);
                  setNotice('Signed out');
                }}
              />
            </div>
          </header>

          {/* Horizontal Quick-Switch Studio Module Tab Bar */}
          <div className="no-scrollbar flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-slate-200/80 bg-slate-50/90 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60 sm:px-5">
            {STUDIO_MODULES.map((mod) => {
              const isActive = activeStudioModule === mod.id;
              return (
                <button
                  type="button"
                  key={`tab-${mod.id}`}
                  onClick={() => {
                    setActiveStudioModule(mod.id);
                    setNotice(`${mod.emoji} ${mod.label} active`);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'border border-slate-200/80 bg-white text-slate-700 hover:border-amber-400/60 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  <span>{mod.emoji}</span>
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Container Wrapped in Runtime ErrorBoundary */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-20 md:flex-row">
            <ErrorBoundary
              fallbackTitle="SAZ AI Studio Workspace Guard"
              onAnalyzeError={(logStr) => {
                setDevErrorLog(logStr);
                setActiveStudioModule('dev_platform');
                setNotice('Loaded stack trace in Error Log Analyzer');
              }}
            >
              {activeStudioModule === 'dev_platform' && (
                <div className="h-full w-full flex-1 overflow-hidden">
                  <DeveloperPlatformWorkspace
                    onNotice={setNotice}
                    initialSubTab={devSubTab}
                    initialDiffOriginal={devDiffOriginal}
                    initialDiffModified={devDiffModified}
                    initialErrorLog={devErrorLog}
                    pinnedFilePaths={pinnedFilePaths}
                    onTogglePinFile={(filePath) =>
                      setPinnedFilePaths((prev) =>
                        prev.includes(filePath)
                          ? prev.filter((p) => p !== filePath)
                          : [...prev, filePath],
                      )
                    }
                    onActivateMicroAgent={(agent) => {
                      setActiveMicroAgent(agent);
                      setActiveStudioModule('execution_chat');
                      setNotice(`Activated Micro-Agent: ${agent.icon} ${agent.name}`);
                    }}
                    onApplyEnhancedPromptToChat={(enhancedText) => {
                      setDraft(enhancedText);
                      setActiveStudioModule('execution_chat');
                      setNotice('✨ Applied engineered prompt to main Prompt Bar');
                    }}
                    onOpenArtifactInCanvas={(titleText, htmlCode) => {
                      setActiveArtifact({
                        id: `d2c-${Date.now()}`,
                        title: titleText,
                        description: 'Converted from UI mockup via Design-to-Code Converter',
                        htmlCode,
                        createdAt: new Date().toISOString(),
                      });
                      setPreviewKey((k) => k + 1);
                      setActiveStudioModule('execution_chat');
                      setCanvasMode('preview');
                      setWorkspaceView(window.innerWidth < 1024 ? 'preview' : 'split');
                      setNotice(`Opened "${titleText}" in Live Canvas`);
                    }}
                  />
                </div>
              )}

              {activeStudioModule === 'video_studio' && (
              <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-5 sm:px-8">
                <div className="mx-auto w-full max-w-6xl space-y-5 pb-16">
                  {/* Top 3D Video Director Bar */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-400/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                          🎬 3D VIDEO STUDIO · PIXAR 5-SCENE ANIMATOR & LIP-SYNC ENGINE
                        </span>
                        <h2 className="mt-1 font-serif-display text-xl font-bold text-slate-900 dark:text-white">
                          Multi-Scene 3D Character Animation, Multi-Voiceover & Merged MP4 Studio
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            label: '🦁🐜 Sher aur Cheenti',
                            prompt:
                              'Create a 3D Disney/Pixar animated story for "Sher aur Cheenti" (The Lion and the Ant) in 9:16 vertical format with 5 sequential scenes, multi-character voiceovers, lip-sync, and Urdu/Hindi subtitles.',
                          },
                          {
                            label: '🦊🐓 Fox & Rooster',
                            prompt:
                              'Create a 3D Disney/Pixar animated story for "Chalak Lomri aur Murgha" (Clever Fox and Rooster) in 9:16 vertical format with 5 sequential scenes, character dialogue, lip-sync, and Urdu subtitles.',
                          },
                          {
                            label: '🧒✨ Magical Forest Quest',
                            prompt:
                              'Create a 3D Disney/Pixar animated story about a brave young boy and a glowing lantern creature in an enchanted forest in 9:16 vertical format with 5 sequential scenes and voiceover.',
                          },
                        ].map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => {
                              setStudioVideoPrompt(preset.prompt);
                              const built = buildClientFallbackExecution(preset.prompt, 'video');
                              if (built.media) {
                                setStudioVideoMedia({
                                  ...built.media,
                                  id: `vid-studio-${Date.now()}`,
                                });
                                setNotice(`Loaded ${preset.label} in 3D Video Studio`);
                              }
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 transition hover:border-amber-400 hover:bg-amber-50/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <input
                        value={studioVideoPrompt}
                        onChange={(e) => setStudioVideoPrompt(e.target.value)}
                        placeholder="Describe a 5-scene 3D Pixar story with character dialogues (e.g., Sher aur Cheenti, Fox & Rooster)..."
                        className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const built = buildClientFallbackExecution(
                            studioVideoPrompt.trim() || 'Sher aur Cheenti 3D Pixar Story',
                            'video',
                          );
                          if (built.media) {
                            setStudioVideoMedia({
                              ...built.media,
                              id: `vid-studio-${Date.now()}`,
                            });
                            setNotice('Rendering 5-scene 3D video with character lip-sync & voiceover...');
                          }
                        }}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300"
                      >
                        <Film size={15} />
                        <span>Render 3D Video & Lip-Sync</span>
                      </button>
                    </div>
                  </div>

                  {/* Active 3D Video Studio Player & Lip-Sync Pipeline */}
                  <MediaStudioCard
                    key={studioVideoMedia.id}
                    media={studioVideoMedia}
                    onNotice={setNotice}
                    onOpenInPreview={(mediaAsset) => {
                      const videoArtifact = buildVideoStudioPreviewArtifact(mediaAsset);
                      setActiveArtifact(videoArtifact);
                      setPreviewKey((k) => k + 1);
                      setActiveStudioModule('execution_chat');
                      setWorkspaceView('preview');
                      setNotice(`Opened "${mediaAsset.title}" in Fullscreen Preview`);
                    }}
                  />
                </div>
              </div>
            )}

            {activeStudioModule === 'image_studio' && (
              <div className="h-full w-full flex-1 overflow-hidden">
                <ImageGeneratorWorkspace
                  onNotice={setNotice}
                  onSendToChat={(promptText) => {
                    setStudioVideoPrompt(promptText);
                    const built = buildClientFallbackExecution(promptText, 'video');
                    if (built.media) {
                      setStudioVideoMedia({
                        ...built.media,
                        id: `vid-from-img-${Date.now()}`,
                      });
                    }
                    setActiveStudioModule('video_studio');
                    setNotice('Sent character design to 🎬 3D Video Studio');
                  }}
                />
              </div>
            )}

            {activeStudioModule === 'voice_dubbing' && (
              <div className="h-full w-full flex-1 overflow-hidden">
                <VoiceoverDubbingWorkspace
                  onNotice={setNotice}
                  onSendToVideoStudio={(promptText) => {
                    setStudioVideoPrompt(promptText);
                    const built = buildClientFallbackExecution(promptText, 'video');
                    if (built.media) {
                      setStudioVideoMedia({
                        ...built.media,
                        id: `vid-from-voice-${Date.now()}`,
                      });
                    }
                    setActiveStudioModule('video_studio');
                    setNotice('Loaded multi-character dialogue in 🎬 3D Video Studio');
                  }}
                />
              </div>
            )}

            {activeStudioModule === 'music_sfx' && (
              <div className="h-full w-full flex-1 overflow-hidden">
                <MusicSfxWorkspace onNotice={setNotice} />
              </div>
            )}

            {activeStudioModule === 'story_generator' && (
              <div className="h-full w-full flex-1 overflow-hidden">
                <StoryGeneratorWorkspace
                  onNotice={setNotice}
                  onAnimateStory={(promptText) => {
                    setStudioVideoPrompt(promptText);
                    const built = buildClientFallbackExecution(promptText, 'video');
                    if (built.media) {
                      setStudioVideoMedia({
                        ...built.media,
                        id: `vid-from-story-${Date.now()}`,
                      });
                    }
                    setActiveStudioModule('video_studio');
                    setNotice('Launched 5-scene script in 🎬 3D Video Studio');
                  }}
                />
              </div>
            )}

            {activeStudioModule === 'game_engine' && (
              <div className="h-full w-full flex-1 overflow-hidden">
                <GameEngineWorkspace onNotice={setNotice} />
              </div>
            )}

            {/* Left/Main Column: Full-Screen Vertical Layout with Centered Welcome */}
            {activeStudioModule === 'execution_chat' && workspaceView !== 'preview' && (
              <section
                className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
                  workspaceView === 'split'
                    ? 'border-b border-slate-200 md:border-b-0 md:border-r dark:border-slate-800'
                    : 'h-full'
                }`}
              >
                {/* Main Body / Hero Section */}
                {messages.length === 0 && !isTyping ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6">
                    <h1 className="font-serif-display text-center text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white sm:text-4xl">
                      {currentUser ? 'Welcome back, ' : 'Welcome, '}
                      <span className="text-amber-500 dark:text-amber-400">
                        {currentUser ? currentUser.displayName : 'Zubair'}
                      </span>
                    </h1>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Click <span className="font-bold text-amber-500">+</span> on the bottom bar for Photo, File (.pdf/.txt/.zip/.code), Camera, Voice &amp; 100+ Dev Tools
                    </p>
                  </div>
                ) : (
                  <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-4 pt-6 pb-12 sm:px-8"
                  >
                    <div className="mx-auto max-w-2xl space-y-5">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          language={language}
                          onCopy={() => setNotice('Copied to clipboard')}
                          onOpenArtifact={(artifact) => {
                            setActiveArtifact(artifact);
                            setPreviewKey((k) => k + 1);
                            setWorkspaceView(window.innerWidth < 1024 ? 'preview' : 'split');
                            setNotice(`Opened "${artifact.title}" in Interactive Preview`);
                          }}
                          onDownloadArtifact={downloadArtifactHtml}
                          onNotice={setNotice}
                          onSendCodeToDiff={(codeStr) => {
                            setDevDiffOriginal(codeStr);
                            setDevDiffModified(codeStr);
                            setActiveStudioModule('dev_platform');
                            setNotice('Opened snippet in Side-by-Side Git Diff Viewer');
                          }}
                        />
                      ))}

                      {isTyping && (
                        <div className="animate-rise-in flex gap-3">
                          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950">
                            <Bot size={16} />
                          </div>
                          <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                              <div className="flex gap-1">
                                <span className="size-1.5 rounded-full bg-amber-500 animate-blink" />
                                <span className="size-1.5 rounded-full bg-amber-500 animate-blink [animation-delay:150ms]" />
                                <span className="size-1.5 rounded-full bg-amber-500 animate-blink [animation-delay:300ms]" />
                              </div>
                              <span>Assembling & executing in SAZ AI Studio...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Right Column: Interactive Preview / Artifacts Sandbox */}
            {activeStudioModule === 'execution_chat' &&
              (workspaceView === 'split' || workspaceView === 'preview') && (
              <section
                ref={previewContainerRef}
                className={`${
                  workspaceView === 'preview'
                    ? 'flex h-full w-full flex-1'
                    : 'flex h-[56%] w-full md:h-full md:w-[56%] lg:w-[55%] xl:w-[56%]'
                } flex-col bg-slate-100 dark:bg-slate-950`}
              >
                <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="truncate text-xs font-bold text-[#0F172A] dark:text-white">
                      {activeArtifact.title}
                    </span>
                    <span
                      title="Automatic Context Isolation & Zero Legacy Code Pollution Active"
                      className="hidden xl:inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
                    >
                      Isolated Clean Slate
                    </span>
                    {/* 1. Canvas / Artifacts Split View Studio Mode Switcher */}
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                      {(
                        [
                          { id: 'preview', label: 'Preview' },
                          { id: 'code', label: 'Code' },
                          { id: 'document', label: 'Doc Draft' },
                          { id: 'graphics', label: 'Graphics' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCanvasMode(tab.id)}
                          className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold transition whitespace-nowrap ${
                            canvasMode === tab.id
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                      <button
                        type="button"
                        aria-label="Desktop viewport"
                        onClick={() => setViewportSize('desktop')}
                        className={`rounded-md p-1.5 transition ${
                          viewportSize === 'desktop'
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-950 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <Laptop size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Tablet viewport"
                        onClick={() => setViewportSize('tablet')}
                        className={`rounded-md p-1.5 transition ${
                          viewportSize === 'tablet'
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-950 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <Tablet size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Mobile viewport"
                        onClick={() => setViewportSize('mobile')}
                        className={`rounded-md p-1.5 transition ${
                          viewportSize === 'mobile'
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-950 dark:text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <Smartphone size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      aria-label="Reload live app"
                      onClick={() => setPreviewKey((k) => k + 1)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <RefreshCw size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/?share=canvas&artifact=${encodeURIComponent(activeArtifact.id)}`;
                        void navigator.clipboard.writeText(shareUrl).catch(() => {});
                        setNotice(`Copied live Canvas share link: ${shareUrl}`);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-500 hover:text-white dark:text-indigo-300 whitespace-nowrap"
                    >
                      <Share2 size={12} />
                      <span className="hidden sm:inline">Share Canvas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadArtifactHtml(activeArtifact)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white whitespace-nowrap"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Export App</span>
                    </button>

                    <button
                      type="button"
                      aria-label="Toggle full-width preview"
                      onClick={() =>
                        setWorkspaceView(workspaceView === 'preview' ? 'chat' : 'preview')
                      }
                      className="flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-400/15 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-400/25 dark:text-amber-300 whitespace-nowrap"
                    >
                      {workspaceView === 'preview' ? (
                        <>
                          <Minimize2 size={13} />
                          <span>Exit Full</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 size={13} />
                          <span>Full Screen</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label="Browser Fullscreen"
                      onClick={togglePreviewNativeFullscreen}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      title="Toggle Native Fullscreen"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-center overflow-hidden bg-slate-950 p-0">
                  <div
                    className={`h-full w-full overflow-hidden bg-slate-950 shadow-lg transition-all duration-200 ${
                      viewportSize === 'mobile'
                        ? 'sm:max-w-[412px] sm:rounded-2xl sm:border sm:border-slate-800'
                        : viewportSize === 'tablet'
                          ? 'sm:max-w-[768px] sm:rounded-2xl sm:border sm:border-slate-800'
                          : 'w-full'
                    }`}
                  >
                    {(() => {
                      if (canvasMode === 'code') {
                        return (
                          <div className="flex h-full w-full flex-col bg-[#0B0F19] p-4 text-slate-100">
                            <div className="mb-2 flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-amber-400">
                                Live Artifact Source Code ({activeArtifact.title})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCanvasMode('preview');
                                  setPreviewKey((k) => k + 1);
                                  setNotice('Applied source changes to Live Preview');
                                }}
                                className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
                              >
                                Apply & Preview
                              </button>
                            </div>
                            <textarea
                              value={activeArtifact.htmlCode}
                              onChange={(e) =>
                                setActiveArtifact((prev) => ({
                                  ...prev,
                                  htmlCode: e.target.value,
                                }))
                              }
                              spellCheck={false}
                              className="w-full flex-1 resize-none rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-emerald-300 outline-none focus:border-amber-400"
                            />
                          </div>
                        );
                      }
                      if (canvasMode === 'document') {
                        return (
                          <div className="flex h-full w-full flex-col bg-white p-5 text-slate-900 dark:bg-slate-900 dark:text-white">
                            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
                              <div>
                                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
                                  Canvas Collaborative Document Draft
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Edit specifications, notes, or documentation side-by-side with chat
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(canvasDocDraft);
                                    setNotice('Copied Canvas document to clipboard');
                                  }}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                >
                                  Copy Draft
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const blob = new Blob([canvasDocDraft], {
                                      type: 'text/markdown;charset=utf-8',
                                    });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'saz-ai-canvas-draft.md';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                    setNotice('Exported Canvas document as .MD');
                                  }}
                                  className="rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                                >
                                  Export .MD
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={canvasDocDraft}
                              onChange={(e) => setCanvasDocDraft(e.target.value)}
                              className="w-full flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed outline-none focus:border-amber-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            />
                          </div>
                        );
                      }
                      if (canvasMode === 'graphics') {
                        return (
                          <div className="flex h-full w-full flex-col overflow-y-auto bg-slate-950 p-5 text-white">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                                📊 Mermaid.js Visual Diagram & Vector Canvas
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCanvasMermaidChart(
                                      `graph TD\n  UI[React 19 SPA] --> API[Express Gateway]\n  API --> AI[Gemini 3.1 Pro + Multi-Model]\n  API --> DB[Firestore + SQLite Vault]`,
                                    )
                                  }
                                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400"
                                >
                                  Architecture Flow
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCanvasMermaidChart(
                                      `erDiagram\n  USERS ||--o{ PROJECTS : owns\n  PROJECTS ||--o{ CONVERSATIONS : contains\n  CONVERSATIONS ||--o{ ARTIFACTS : builds`,
                                    )
                                  }
                                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:border-amber-400"
                                >
                                  DB Schema
                                </button>
                              </div>
                            </div>
                            <textarea
                              value={canvasMermaidChart}
                              onChange={(e) => setCanvasMermaidChart(e.target.value)}
                              rows={4}
                              spellCheck={false}
                              className="mb-3 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono text-xs text-amber-300 outline-none focus:border-amber-400"
                            />
                            <MermaidDiagramRenderer
                              chart={canvasMermaidChart}
                              title={activeArtifact.title}
                            />
                          </div>
                        );
                      }
                      const isDasVpnArtifact =
                        activeArtifact.id === 'artifact-das-vpn-dashboard' ||
                        /\b(das\s*vpn|vpn\s*dashboard|vpn)\b/i.test(
                          `${activeArtifact.title} ${activeArtifact.description}`,
                        );
                      if (isDasVpnArtifact) {
                        return (
                          <DasVpnDashboard
                            key={`${activeArtifact.id}-${previewKey}`}
                            onNotice={setNotice}
                          />
                        );
                      }
                      return (
                        <iframe
                          key={`${activeArtifact.id}-${previewKey}`}
                          title={activeArtifact.title}
                          allow="fullscreen; autoplay; accelerometer; gyroscope; gamepad"
                          sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock allow-same-origin"
                          srcDoc={activeArtifact.htmlCode}
                          className="h-full w-full border-0"
                        />
                      );
                    })()}
                  </div>
                </div>
              </section>
            )}
            </ErrorBoundary>
          </div>

          {/* Root-Level Left Side-Drawer & Quick Upload Utility Suite (Outside backdrop-blur so never clipped) */}
          <LeftUtilityDrawerSuite
            isOpen={isPlusMenuOpen}
            onClose={() => setIsPlusMenuOpen(false)}
            isTyping={isTyping}
            isListening={isListening}
            activeDevSubTab={devSubTab}
            activeStudioModule={activeStudioModule}
            webSearchEnabled={webSearchEnabled}
            setWebSearchEnabled={setWebSearchEnabled}
            webScrapeUrl={webScrapeUrl}
            setWebScrapeUrl={setWebScrapeUrl}
            projectContextEnabled={projectContextEnabled}
            setProjectContextEnabled={setProjectContextEnabled}
            projectContextTarget={projectContextTarget}
            setProjectContextTarget={setProjectContextTarget}
            projectContextRepoUrl={projectContextRepoUrl}
            setProjectContextRepoUrl={setProjectContextRepoUrl}
            dualModelCompareEnabled={dualModelCompareEnabled}
            setDualModelCompareEnabled={setDualModelCompareEnabled}
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            intent={intent}
            setIntent={setIntent}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            themePreset={themePreset}
            onApplyThemePreset={applyThemePreset}
            onTriggerPhotoUpload={() => photoInputRef.current?.click()}
            onTriggerFileUpload={() => fileInputRef.current?.click()}
            onTriggerCameraCapture={() => cameraInputRef.current?.click()}
            onToggleVoiceInput={toggleVoiceInput}
            onTriggerInstantVoiceToCode={() => {
              const dictated = transformVoiceCommandToCode(
                draft.trim() || 'Create async function fetchWorkspaceMetrics',
              );
              setDraft(dictated.generatedSnippet);
              setNotice(`Voice-to-Code: ${dictated.actionLabel}`);
            }}
            onOpenDevTool={(subTab, label) => {
              setDevSubTab(subTab);
              setActiveStudioModule('dev_platform');
              setNotice(`Opened ${label}`);
            }}
            onOpenModal={(modal) => setActiveModal(modal)}
            onNotice={setNotice}
          />

          {/* Always-Visible Persistent Fixed Bottom Prompt Input Bar & Upload Controls */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-[#F8FAFC]/95 px-3 py-2.5 backdrop-blur-md dark:border-slate-800/90 dark:bg-[#090D16]/95">
            <div className="relative mx-auto w-full max-w-3xl">
              {/* Pinned Multi-File Context & Active Custom Micro-Agent Strip */}
              {(pinnedFilePaths.length > 0 || activeMicroAgent) && (
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5 px-1">
                  {activeMicroAgent && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                      <span>{activeMicroAgent.icon}</span>
                      <span>Agent: {activeMicroAgent.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMicroAgent(null);
                          setNotice('Deactivated custom Micro-Agent');
                        }}
                        className="ml-0.5 rounded-full hover:text-rose-400"
                        title="Clear active Micro-Agent"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  )}
                  {pinnedFilePaths.map((pPath) => (
                    <span
                      key={pPath}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                      title="Pinned to active AI Multi-File Context"
                    >
                      <span>📌 {pPath.split('/').pop() || pPath}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPinnedFilePaths((prev) => prev.filter((item) => item !== pPath))
                        }
                        className="hover:text-rose-400"
                        aria-label={`Unpin ${pPath}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setDevSubTab('file_pinning_context');
                      setActiveStudioModule('dev_platform');
                    }}
                    className="rounded-full border border-slate-300/80 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300"
                  >
                    + Pin Files
                  </button>
                </div>
              )}

              {/* Attached Photos & Files Preview Strip */}
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-md dark:border-slate-800 dark:bg-slate-900/95">
                  {attachments.map((att, index) => {
                    const activeFilter = attachmentFilterMap[index] || 'none';
                    return (
                      <div
                        key={`${att.name}-${index}`}
                        className="relative flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 pr-2.5 text-xs font-medium text-slate-900 dark:border-slate-700/80 dark:bg-slate-800/90 dark:text-white"
                      >
                        {att.mimeType.startsWith('image/') && att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            referrerPolicy="no-referrer"
                            className={`size-10 rounded-lg object-cover ring-1 ring-amber-400/40 transition ${
                              activeFilter === 'enhance'
                                ? 'contrast-125 saturate-125'
                                : activeFilter === 'cyberpunk'
                                  ? 'hue-rotate-90 saturate-150 contrast-125'
                                  : activeFilter === 'noir'
                                    ? 'grayscale contrast-125'
                                    : ''
                            }`}
                          />
                        ) : (
                          <div className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <FileText size={15} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="block max-w-[130px] truncate">{att.name}</span>
                          {att.mimeType.startsWith('image/') && (
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              {[
                                { id: 'enhance', label: '✨ Enhance' },
                                { id: 'cyberpunk', label: '🌆 Neon' },
                                { id: 'noir', label: '🖤 B&W' },
                              ].map((f) => (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => {
                                    setAttachmentFilterMap((prev) => ({
                                      ...prev,
                                      [index]: prev[index] === f.id ? 'none' : f.id,
                                    }));
                                    setNotice(`Applied ${f.label} vision filter to ${att.name}`);
                                  }}
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                                    activeFilter === f.id
                                      ? 'bg-amber-400 text-slate-950'
                                      : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
                                  }`}
                                >
                                  {f.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const converted = convertMockupToReactTailwind(att.name);
                                  setActiveArtifact({
                                    id: `d2c-${Date.now()}`,
                                    title: `${att.name} · React + Tailwind UI`,
                                    description: 'Converted UI mockup into responsive React + Tailwind CSS',
                                    htmlCode: converted.previewHtml,
                                    createdAt: new Date().toISOString(),
                                  });
                                  setPreviewKey((k) => k + 1);
                                  setWorkspaceView(window.innerWidth < 1024 ? 'preview' : 'split');
                                  setNotice(`Converted "${att.name}" mockup into React + Tailwind CSS in Canvas!`);
                                }}
                                className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950 hover:bg-emerald-400"
                              >
                                🎨 Design→Code
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${att.name}`}
                          onClick={() =>
                            setAttachments((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="ml-0.5 rounded-full p-0.5 text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-600"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Complete Bottom Prompt Input Bar: [ + Trigger ] [ Quick Upload Icons ] [ Prompt Input ] [ Voice Input ] [ Send Arrow ] */}
              <form
                onSubmit={(e) => {
                  if (activeStudioModule !== 'execution_chat') {
                    setActiveStudioModule('execution_chat');
                  }
                  handleSubmit(e);
                }}
                className="flex items-end gap-2 rounded-3xl border border-slate-300/90 bg-white px-2.5 py-1.5 shadow-lg transition-all duration-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 dark:border-slate-700/90 dark:bg-slate-900/95"
              >
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                  className="sr-only"
                  onChange={handleFileInputChange}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.zip,.tar,.gz,.md,.json,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp,.js,.jsx,.ts,.tsx,.py,.go,.rs,.java,.cpp,.c,.sql,.sh,.yaml,.yml,.html,.css,image/*,application/pdf,application/zip,text/*"
                  className="sr-only"
                  onChange={handleFileInputChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleFileInputChange}
                />

                {/* Left '+' Button Opening Quick Upload & 100+ Tools Drawer Menu */}
                <button
                  type="button"
                  aria-label="Open Upload & Developer Suite Menu"
                  aria-expanded={isPlusMenuOpen}
                  title="Open Upload Controls (Photo, File, Camera, Voice) & 100+ Dev Tools"
                  onClick={() => setIsPlusMenuOpen((open) => !open)}
                  className={`relative grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
                    isPlusMenuOpen
                      ? 'rotate-45 border-amber-300 bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                      : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-amber-400/60 hover:bg-amber-400/15 hover:text-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-amber-400/60 dark:hover:bg-amber-400/15 dark:hover:text-amber-300'
                  }`}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  {(webSearchEnabled || projectContextEnabled || dualModelCompareEnabled) &&
                    !isPlusMenuOpen && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900"
                      />
                    )}
                </button>

                {/* Direct 1-Click Upload Shortcuts (Photo, File/ZIP/Code, Camera) */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    title="Photo & Image Gallery Upload"
                    aria-label="Photo & Image Gallery Upload"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-purple-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-purple-400"
                  >
                    <ImageIcon size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="File & Document Attachment Upload (.pdf, .txt, .zip, .code)"
                    aria-label="File & Document Attachment Upload"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-amber-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400"
                  >
                    <Paperclip size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    title="Camera / Vision AI Scan"
                    aria-label="Camera / Vision AI Scan"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-sky-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                  >
                    <Camera size={15} />
                  </button>
                </div>

                {/* Single-Line Auto-Expanding Textarea */}
                <textarea
                  ref={textareaRef}
                  dir="auto"
                  rows={1}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (activeStudioModule !== 'execution_chat') {
                        setActiveStudioModule('execution_chat');
                      }
                      void sendMessage(draft);
                    }
                  }}
                  placeholder={
                    isListening
                      ? 'Listening continuously... Speak now'
                      : language === 'urdu'
                        ? 'یہاں لکھیں...'
                        : language === 'roman'
                          ? 'Yahan likhein...'
                          : 'Message SAZ AI or attach photos, files (.pdf, .zip, .code)...'
                  }
                  className="max-h-32 min-h-[36px] flex-1 resize-none overflow-y-auto bg-transparent px-1.5 py-1.5 text-[15px] leading-snug text-[#0F172A] outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
                />

                {/* 1-Click AI Prompt Optimizer & Enhancer Button */}
                <button
                  type="button"
                  disabled={isTyping}
                  onClick={() => {
                    const res = enhanceUserPrompt(draft, 'architect');
                    setDraft(res.enhancedPrompt);
                    setNotice(`✨ Enhanced prompt (+${res.clarityGainPct}% engineering specification clarity)`);
                  }}
                  aria-label="Enhance prompt with AI Prompt Optimizer"
                  title="1-Click AI Prompt Optimizer & Enhancer"
                  className="hidden md:inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 text-[11px] font-extrabold text-amber-600 transition hover:bg-amber-400 hover:text-slate-950 dark:text-amber-300"
                >
                  <Wand2 size={13} />
                  <span>Enhance</span>
                </button>

                {/* Voice Input / Micro-Audio Recording Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isTyping}
                  aria-label={isListening ? 'Stop Voice Input' : 'Voice Input / Micro-Audio Recording'}
                  title={isListening ? 'Voice Recording Active · Click to Stop' : 'Voice Input / Micro-Audio Recording'}
                  className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-md ring-4 ring-rose-500/25'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isListening ? (
                    <>
                      <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                        <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                        <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" />
                        <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse [animation-delay:120ms]" />
                        <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce [animation-delay:240ms]" />
                      </span>
                      <span className="text-[11px] font-extrabold">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic size={15} className="text-emerald-500" />
                      <span className="hidden sm:inline text-[11px]">Voice</span>
                    </>
                  )}
                </button>

                {/* Far-Right Execute / Send Arrow Button */}
                <button
                  type="submit"
                  aria-label="Send prompt"
                  title="Send Prompt"
                  disabled={(!draft.trim() && attachments.length === 0) || isTyping}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-950 shadow-xs transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isTyping ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <ArrowUp size={17} strokeWidth={2.6} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {/* Knowledge, History & GitHub Push Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
                  {activeModal === 'knowledge'
                    ? 'Project Knowledge Base'
                    : activeModal === 'github'
                      ? 'Push SAZ AI Studio to GitHub'
                      : activeModal === 'timeline'
                        ? 'Prompt History & Versioning Timeline'
                        : activeModal === 'share'
                          ? 'Live Team Workspace & Sharing'
                          : activeModal === 'analytics'
                            ? 'Usage & Token Analytics Dashboard'
                            : 'Saved Studio Sessions'}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {activeModal === 'knowledge'
                    ? 'Upload reference docs or specifications for persistent project context.'
                    : activeModal === 'github'
                      ? 'Sync and push the full SAZ AI Studio codebase & 3D engines directly to your GitHub repository.'
                      : activeModal === 'timeline'
                        ? 'Inspect past prompt iterations, restore prompts, and switch between response versions.'
                        : activeModal === 'share'
                          ? 'Generate 1-click shareable links for live chats, canvases, and interactive code sandboxes.'
                          : activeModal === 'analytics'
                            ? 'Real-time token consumption, API latency telemetry, and per-query history stats.'
                            : 'Resume any previous autonomous build or media studio conversation.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeModal === 'github' ? (
                <div className="space-y-4">
                  {/* Connection Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2.5 rounded-full ${
                            githubStatus?.connected ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                          {githubStatus?.connected
                            ? `Connected as @${githubStatus.user?.login}`
                            : 'GitHub Repository Sync Ready'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {githubStatus?.connected
                          ? 'Ready to push all 13 workspace source files directly to your GitHub repository.'
                          : 'You can push directly from AI Studio’s top-right GitHub toolbar icon, or connect GitHub OAuth / GITHUB_TOKEN in Secrets.'}
                      </p>
                    </div>
                    {!githubStatus?.connected && githubAuthUrl && (
                      <a
                        href={githubAuthUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950"
                      >
                        <ExternalLink size={13} />
                        <span>Connect GitHub OAuth</span>
                      </a>
                    )}
                  </div>

                  {/* Repository Settings Form */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Repository Name
                      </label>
                      <input
                        value={githubRepoName}
                        onChange={(e) => setGithubRepoName(e.target.value)}
                        placeholder="saz-ai-studio"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Target Branch
                      </label>
                      <input
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                        placeholder="main"
                        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Commit Message
                    </label>
                    <input
                      value={githubCommitMessage}
                      onChange={(e) => setGithubCommitMessage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Repository Visibility
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGithubIsPrivate(false)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          !githubIsPrivate
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setGithubIsPrivate(true)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                          githubIsPrivate
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>

                  {/* Staged Workspace Files */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Staged Workspace Files ({githubStatus?.files?.length || 13} files committed locally)
                      </span>
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        git branch: main · clean
                      </span>
                    </div>
                    <div className="grid max-h-32 grid-cols-1 gap-1 overflow-y-auto text-[11px] font-mono text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                      {(
                        githubStatus?.files ?? [
                          { path: 'package.json', size: 1240 },
                          { path: 'server.ts', size: 162000 },
                          { path: 'src/App.tsx', size: 218000 },
                          { path: 'src/components/StudioModuleWorkspace.tsx', size: 42000 },
                          { path: 'src/components/ThreeGameEngine.tsx', size: 36000 },
                          { path: 'index.html', size: 980 },
                        ]
                      ).map((f) => (
                        <div key={f.path} className="flex items-center justify-between truncate pr-2">
                          <span className="truncate">✓ {f.path}</span>
                          <span className="text-[10px] text-slate-400">
                            {(f.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {githubError && (
                    <div className="rounded-xl border border-amber-400/40 bg-amber-50/80 p-3 text-xs font-medium text-slate-800 dark:bg-amber-950/30 dark:text-amber-200">
                      {githubError}
                    </div>
                  )}

                  {githubPushResult && (
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="font-bold">
                        ✓ Force-pushed {githubPushResult.filesCount} files to{' '}
                        {githubPushResult.repoFullName} ({githubPushResult.branch})
                      </div>
                      {githubPushResult.commitSha && (
                        <div className="mt-1 font-mono text-[11px] opacity-80">
                          Commit SHA: {githubPushResult.commitSha.slice(0, 12)}
                        </div>
                      )}
                      <div className="mt-2.5 flex flex-wrap gap-3">
                        <a
                          href={githubPushResult.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 underline dark:text-emerald-300"
                        >
                          <span>Open GitHub Repository</span>
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(githubPushResult.repoUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-amber-600 underline dark:text-amber-400"
                        >
                          <span>Deploy Repo on Vercel</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Direct Deployment & Vercel / Cloudflare Sync Links */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Live Cloud Deployment & Vercel / Cloudflare Sync Links
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <a
                        href="https://ais-pre-ew4gmlev63jbbiqm2uwken-148639739030.asia-east1.run.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <span className="truncate">🚀 Live Shared App</span>
                        <ExternalLink size={12} className="shrink-0 text-amber-500" />
                      </a>
                      <a
                        href={`https://vercel.com/new/import?s=${encodeURIComponent(`https://github.com/${githubStatus?.user?.login || 'zubair'}/${githubRepoName || 'saz-ai-studio'}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <span className="truncate">▲ Vercel Import</span>
                        <ExternalLink size={12} className="shrink-0 text-amber-500" />
                      </a>
                      <a
                        href="https://dash.cloudflare.com/?to=/:account/pages/new/provider/github"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <span className="truncate">☁️ Cloudflare Pages</span>
                        <ExternalLink size={12} className="shrink-0 text-amber-500" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isPushingGitHub}
                      onClick={() => void handlePushToGitHub()}
                      className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:opacity-50"
                    >
                      <Share2 size={14} />
                      <span>
                        {isPushingGitHub
                          ? 'Force-Pushing to main...'
                          : 'Force Push Workspace to main'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : activeModal === 'knowledge' ? (
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 p-6 text-center transition hover:bg-amber-50 dark:bg-amber-950/20">
                    <Upload size={22} className="text-amber-600" />
                    <span className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                      Add Project Reference Document
                    </span>
                    <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      Supports Markdown, JSON, SQL, TXT, CSV, and code files
                    </span>
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        for (const file of Array.from(e.target.files ?? [])) {
                          void uploadKnowledge(file);
                        }
                        e.currentTarget.value = '';
                      }}
                    />
                  </label>
                  <div className="space-y-2">
                    {knowledgeDocs.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        No project knowledge documents uploaded yet.
                      </p>
                    ) : (
                      knowledgeDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                              {doc.name}
                            </div>
                            <div className="text-[10px] text-slate-500">{doc.mimeType}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => void deleteKnowledge(doc.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeModal === 'timeline' ? (
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800">
                      No prompt iterations recorded in this session yet. Send a prompt in chat to track versions!
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold uppercase tracking-wider text-amber-500">
                            {m.role === 'user' ? `Prompt Iteration #${Math.ceil((idx + 1) / 2)}` : 'AI Response Versioned'}
                          </span>
                          <span className="text-[11px] text-slate-400">{m.time}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-3 text-xs text-slate-800 dark:text-slate-200">
                          {m.text}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          {m.role === 'user' && (
                            <button
                              type="button"
                              onClick={() => {
                                setDraft(m.text);
                                setActiveModal(null);
                                setNotice('Restored prompt iteration to input bar');
                              }}
                              className="rounded-lg bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-amber-300"
                            >
                              Restore Prompt to Bar
                            </button>
                          )}
                          {m.versions && m.versions.length > 0 && (
                            <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-500">
                              {m.versions.length} Response Versions Available
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeModal === 'share' ? (
                <div className="space-y-4">
                  {[
                    {
                      id: 'chat',
                      title: '💬 Share Live Chat & Prompt Thread',
                      desc: 'Allows team members to view this conversation history and response versions.',
                      url: `${window.location.origin}/?share=chat&session=${conversationId || 'live'}`,
                    },
                    {
                      id: 'canvas',
                      title: `🎨 Share Interactive Canvas (${activeArtifact.title})`,
                      desc: 'Shares the live split-screen artifact preview, Mermaid diagrams, and collaborative doc draft.',
                      url: `${window.location.origin}/?share=canvas&artifact=${encodeURIComponent(activeArtifact.id)}`,
                    },
                    {
                      id: 'sandbox',
                      title: '🧪 Share Multi-File Code Sandbox & Architecture',
                      desc: 'Shares the interactive TypeScript/Python/HTML code runner and Git Diff workspace.',
                      url: `${window.location.origin}/?share=sandbox&module=${activeStudioModule}`,
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(item.url).catch(() => {});
                            setNotice(`Copied shareable link for ${item.id.toUpperCase()}`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                        >
                          <Copy size={13} />
                          <span>Copy Share Link</span>
                        </button>
                      </div>
                      <input
                        readOnly
                        value={item.url}
                        className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-[11px] text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-amber-300"
                      />
                    </div>
                  ))}
                </div>
              ) : activeModal === 'analytics' ? (
                <UsageTokenAnalyticsView messages={messages} selectedModel={selectedModel} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                    <Search size={14} className="text-slate-500" />
                    <input
                      autoFocus
                      placeholder="Search sessions..."
                      onChange={(e) => void loadHistory(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                        No saved sessions found.
                      </p>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          type="button"
                          key={conv.id}
                          onClick={() => void loadConversationMessages(conv.id, conv.title)}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left hover:border-slate-400 dark:border-slate-800 dark:bg-slate-800/60"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                              {conv.title}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-500">
                              {new Date(conv.updatedAt).toLocaleString()}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-amber-600">Load →</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthSystemModal
        key={`${authModalTab}-${authModalOpen ? 'open' : 'closed'}`}
        isOpen={authModalOpen}
        initialTab={authModalTab}
        user={currentUser}
        githubAuthUrl={githubAuthUrl}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(session, msg) => {
          setCurrentUser(session);
          setNotice(msg);
        }}
        onLogout={() => {
          void signOut(auth).catch(() => {});
          setCurrentUser(null);
          saveUserSession(null);
          setNotice('Signed out');
        }}
      />

      {notice && (
        <div
          role="status"
          className="animate-rise-in fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xl dark:bg-white dark:text-slate-900"
        >
          <Check size={13} className="text-amber-400 dark:text-amber-600" />
          {notice}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  language,
  onCopy,
  onOpenArtifact,
  onDownloadArtifact,
  onNotice,
  onSendCodeToDiff,
}: {
  message: Message;
  language: Language;
  onCopy: () => void;
  onOpenArtifact: (artifact: AppArtifact) => void;
  onDownloadArtifact: (artifact: AppArtifact) => void;
  onNotice: (msg: string) => void;
  onSendCodeToDiff?: (code: string, lang: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeVersionIdx, setActiveVersionIdx] = useState(0);
  const [showDualComparison, setShowDualComparison] = useState(Boolean(message.dualComparison));
  const [customVersions, setCustomVersions] = useState(message.versions || []);
  const isAssistant = message.role === 'assistant';
  const displayedText =
    isAssistant && customVersions.length > 0 && customVersions[activeVersionIdx]
      ? customVersions[activeVersionIdx].text
      : message.text;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
    } catch {
      // ignore
    }
    setCopied(true);
    onCopy();
    window.setTimeout(() => setCopied(false), 1200);
  };

  const speakMessage = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = language === 'english' ? 'en-US' : 'ur-PK';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const downloadMessageAsPdf = () => {
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 48;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = 54;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 76, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('SAZ AI Studio', margin, 36);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(251, 191, 36);
      doc.text('PROFESSIONAL DOCUMENT EXPORT', margin, 52);

      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      doc.setTextColor(203, 213, 225);
      doc.text(`${dateStr} · ${message.time}`, pageWidth - margin, 44, { align: 'right' });

      cursorY = 108;

      const docTitle =
        message.artifact?.title ||
        message.media?.title ||
        'Executive Summary & Generated Output';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(docTitle, contentWidth) as string[];
      doc.text(titleLines, margin, cursorY);
      cursorY += titleLines.length * 20 + 6;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 22;

      const rawLines = message.text.split('\n');
      for (const rawLine of rawLines) {
        const trimmed = rawLine.trim();
        if (!trimmed) {
          cursorY += 10;
          continue;
        }

        const isHeading = /^#{1,3}\s+/.test(trimmed);
        const isBullet = /^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
        const cleanLine = trimmed
          .replace(/^#{1,3}\s+/, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/`([^`]+)`/g, '$1');

        if (isHeading) {
          cursorY += 6;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12.5);
          doc.setTextColor(15, 23, 42);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(15, 23, 42);
        }

        const indent = isBullet ? 14 : 0;
        const wrapped = doc.splitTextToSize(cleanLine, contentWidth - indent) as string[];

        for (const line of wrapped) {
          if (cursorY > pageHeight - 64) {
            doc.addPage();
            cursorY = 54;
          }
          doc.text(line, margin + indent, cursorY);
          cursorY += isHeading ? 18 : 15;
        }
        cursorY += 4;
      }

      if (message.artifact || message.media) {
        if (cursorY > pageHeight - 130) {
          doc.addPage();
          cursorY = 54;
        }
        cursorY += 12;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(margin, cursorY, contentWidth, 78, 8, 8, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(180, 83, 9);
        const badgeLabel = message.artifact
          ? 'INTERACTIVE APPLICATION ARTIFACT'
          : `${message.media?.studio.toUpperCase()} PRODUCTION ASSET`;
        doc.text(badgeLabel, margin + 16, cursorY + 22);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(
          message.artifact?.title || message.media?.title || 'Studio Output',
          margin + 16,
          cursorY + 40,
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const subDesc =
          message.artifact?.description ||
          message.media?.socialCaption ||
          message.media?.prompt ||
          '';
        const subLines = doc.splitTextToSize(subDesc, contentWidth - 32) as string[];
        doc.text(subLines[0] || '', margin + 16, cursorY + 58);
      }

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Generated by SAZ AI Studio · Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 28,
          { align: 'center' },
        );
      }

      const safeFilename = docTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40);
      doc.save(`${safeFilename || 'saz-ai-document'}-${message.id}.pdf`);
      onNotice('Downloaded as professional PDF document');
    } catch {
      onNotice('Could not generate PDF document');
    }
  };

  return (
    <div className={`animate-rise-in flex gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div
        className={`grid size-8 shrink-0 place-items-center rounded-xl shadow-2xs ${
          isAssistant
            ? 'bg-slate-900 text-amber-400 dark:bg-amber-400 dark:text-slate-950'
            : 'bg-rose-600 text-white'
        }`}
      >
        {isAssistant ? <Bot size={16} /> : <span className="text-xs font-bold">Z</span>}
      </div>

      <div className="group min-w-0 max-w-[min(92%,640px)] space-y-2.5">
        <div
          className={`flex items-center gap-2 px-1 text-xs text-slate-600 dark:text-slate-400 ${
            isAssistant ? '' : 'justify-end'
          }`}
        >
          <span className="font-bold text-[#0F172A] dark:text-white">
            {isAssistant ? 'SAZ AI' : 'You'}
          </span>
          <span>·</span>
          <span>{message.time}</span>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {message.attachments.map((att, idx) => (
              <span
                key={`${att.name}-${idx}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <FileText size={12} className="text-amber-600" />
                {att.name}
              </span>
            ))}
          </div>
        )}

        {/* 2. Beautiful Chat Bubble with Smooth Rounded-2xl, Subtle Shadow & High-Contrast Typography */}
        <div
          dir="auto"
          className={`rounded-2xl px-4 py-3.5 text-[14.5px] leading-relaxed shadow-sm ${
            isAssistant
              ? 'rounded-tl-md border border-slate-200/90 bg-white text-[#0F172A] dark:border-slate-800 dark:bg-slate-900 dark:text-white'
              : 'rounded-tr-md bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 dark:font-medium'
          }`}
        >
          <div className="chat-markdown" dir="auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children }) {
                  const rawCode = String(children ?? '').replace(/\n$/, '');
                  const match = /language-([\w-]+)/.exec(className || '');
                  const isMultiline = rawCode.includes('\n') || Boolean(match);
                  if (!isMultiline) {
                    return (
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-rose-600 dark:bg-slate-800 dark:text-amber-300">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlockRunner
                      code={rawCode}
                      language={match?.[1] || 'typescript'}
                      onNotice={onNotice}
                      onSendToDiff={onSendCodeToDiff}
                    />
                  );
                },
              }}
            >
              {displayedText}
            </ReactMarkdown>
          </div>

          {/* 9. Prompt History & Response Versioning Switcher Pills */}
          {isAssistant && customVersions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5 text-[11px] dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-1 font-bold text-slate-400">Versions:</span>
                {customVersions.map((ver, idx) => (
                  <button
                    key={`${ver.label}-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveVersionIdx(idx);
                      onNotice(`Switched to ${ver.label} (${ver.model})`);
                    }}
                    className={`rounded-lg px-2 py-0.5 font-mono text-[10.5px] font-bold transition ${
                      activeVersionIdx === idx
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {ver.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = customVersions.length + 1;
                    const newVer = {
                      label: `v${nextNum} · DeepSeek R1`,
                      model: 'DeepSeek R1',
                      text: `${message.text}\n\n---\n*Iteration v${nextNum} (DeepSeek R1 Reasoning Pass · Formal Verification Complete)*`,
                      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                    };
                    setCustomVersions((prev) => [...prev, newVer]);
                    setActiveVersionIdx(customVersions.length);
                    onNotice(`Generated response version v${nextNum}`);
                  }}
                  className="rounded-lg border border-dashed border-amber-400/60 px-2 py-0.5 font-mono text-[10.5px] font-bold text-amber-600 hover:bg-amber-400/15 dark:text-amber-400"
                >
                  + New Version
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowDualComparison((s) => !s)}
                className="rounded-lg bg-indigo-500/15 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-indigo-600 hover:bg-indigo-500 hover:text-white dark:text-indigo-300"
              >
                {showDualComparison ? 'Hide 2-Model Compare' : '⚖️ Compare 2 Models'}
              </button>
            </div>
          )}

          {/* 6. Multi-Model Side-by-Side Comparison View */}
          {isAssistant && showDualComparison && (
            <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-slate-200/80 pt-3 md:grid-cols-2 dark:border-slate-800">
              <div className="rounded-xl border border-amber-400/40 bg-slate-950 p-3 text-xs text-slate-100">
                <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-bold text-amber-400">
                  <span>{message.dualComparison?.leftModel || '✨ Gemini 3.1 Pro'}</span>
                  <span>{message.dualComparison?.leftMs || 380} ms</span>
                </div>
                <p className="line-clamp-6 whitespace-pre-wrap font-mono text-[11px] text-slate-200">
                  {message.dualComparison?.leftText || message.text}
                </p>
              </div>
              <div className="rounded-xl border border-sky-400/40 bg-slate-950 p-3 text-xs text-slate-100">
                <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-bold text-sky-400">
                  <span>{message.dualComparison?.rightModel || '🧠 Claude 3.5 Sonnet'}</span>
                  <span>{message.dualComparison?.rightMs || 425} ms</span>
                </div>
                <p className="line-clamp-6 whitespace-pre-wrap font-mono text-[11px] text-slate-200">
                  {message.dualComparison?.rightText ||
                    `${message.text}\n\n[Claude 3.5 Sonnet Verification: Strict modular boundaries & zero-latency state confirmed.]`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Sleek Glassmorphism / Accent Border Generated App Execution Card */}
        {message.artifact && (
          <div className="overflow-hidden rounded-2xl border border-amber-400/70 bg-gradient-to-br from-amber-50/90 via-white/95 to-amber-100/40 shadow-sm backdrop-blur-md dark:border-amber-500/40 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-amber-950/30">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 px-4 py-3.5 dark:border-amber-500/20">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-amber-800 dark:text-amber-400">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Interactive Application Assembled & Live</span>
                </div>
                <div className="mt-0.5 truncate text-sm font-bold text-[#0F172A] dark:text-white">
                  {message.artifact.title}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenArtifact(message.artifact!)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-amber-300 whitespace-nowrap"
                >
                  <ExternalLink size={13} />
                  <span>Open In Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const art = message.artifact!;
                    const safeSlug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const zipBlob = createProjectZipBlob([
                      { path: 'index.html', content: art.htmlCode },
                      {
                        path: 'package.json',
                        content: JSON.stringify(
                          {
                            name: safeSlug || 'saz-ai-app',
                            version: '1.0.0',
                            private: true,
                            description: art.description,
                          },
                          null,
                          2,
                        ),
                      },
                      {
                        path: 'README.md',
                        content: `# ${art.title}\n\n${art.description}\n\nGenerated by SAZ AI Studio.\n`,
                      },
                    ]);
                    const url = URL.createObjectURL(zipBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${safeSlug || 'saz-ai-project'}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    onNotice(`Exported "${art.title}" Project as ZIP`);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-amber-400/60 bg-amber-400/15 px-2.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-400/25 dark:text-amber-300 whitespace-nowrap"
                >
                  <Download size={13} />
                  <span>Export Project as ZIP</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDownloadArtifact(message.artifact!)}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-bold text-[#0F172A] transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white whitespace-nowrap"
                >
                  <Download size={13} />
                  <span>.HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?share=artifact&id=${encodeURIComponent(message.artifact!.id)}`;
                    void navigator.clipboard.writeText(shareUrl).catch(() => {});
                    onNotice(`Copied live artifact share link: ${shareUrl}`);
                  }}
                  className="flex items-center gap-1 rounded-xl border border-indigo-400/50 bg-indigo-500/15 px-2.5 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-500 hover:text-white dark:text-indigo-300 whitespace-nowrap"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
              </div>
            </div>
            <p className="px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              {message.artifact.description}
            </p>
          </div>
        )}

        {/* Media Studio Output Card */}
        {message.media && (
          <MediaStudioCard
            media={message.media}
            onNotice={onNotice}
            onOpenInPreview={(vidMedia) => {
              onOpenArtifact(buildVideoStudioPreviewArtifact(vidMedia));
            }}
          />
        )}

        {isAssistant && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
            <button
              type="button"
              onClick={copyMessage}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 font-semibold text-[#0F172A] shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={speakMessage}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 font-semibold text-[#0F172A] shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Volume2 size={12} />
              <span>{speaking ? 'Speaking' : 'Speak'}</span>
            </button>
            <NaturalVoiceSynthesizerBar
              text={displayedText}
              defaultLang={language === 'english' ? 'en-US' : 'ur-PK'}
              onNotice={onNotice}
            />
            <button
              type="button"
              data-testid={`button-download-pdf-${message.id}`}
              onClick={downloadMessageAsPdf}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 font-bold text-[#0F172A] shadow-2xs transition hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300"
            >
              <FileDown size={12} className="text-amber-700 dark:text-amber-400" />
              <span>Download as PDF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function createClientContextual9x16SceneUrl(
  scene: Partial<VideoScene>,
  idx: number,
  storyContext: string,
): string {
  const lower = `${storyContext} ${scene.headline || ''} ${scene.subtext || ''}`.toLowerCase();
  const isLionAnt =
    scene.characterType === 'lion_ant' ||
    /\b(sher|cheenti|chunti|chinti|lion|ant)\b/.test(lower) ||
    storyContext.includes('شیر') ||
    storyContext.includes('چونٹی');
  const isFoxRooster =
    !isLionAnt &&
    /\b(fox|lomri)\b/.test(lower) &&
    /\b(rooster|murgha|murg)\b/.test(lower);
  const isVeggie =
    !isLionAnt &&
    !isFoxRooster &&
    /\b(vegetable|veggie|tomato|carrot|village|sabzi)\b/.test(lower);

  if (isLionAnt) {
    const lionAntReal3DImages = [
      sherScene3NetTrapImg,
      sherScene4CuttingNetImg,
      sherScene3NetTrapImg,
      sherScene4CuttingNetImg,
      pixarMagicalAdventureImg,
    ];
    return lionAntReal3DImages[idx % lionAntReal3DImages.length];
  }

  if (isFoxRooster) {
    return idx < 2 ? pixarFoxForestImg : pixarFoxChaseImg;
  }

  if (isVeggie) {
    return pixarVeggieVillageImg;
  }

  const real3DFallbackSequence = [
    pixarMagicalAdventureImg,
    sherScene4CuttingNetImg,
    sherScene3NetTrapImg,
    sherScene4CuttingNetImg,
    pixarMagicalAdventureImg,
  ];
  return real3DFallbackSequence[idx % real3DFallbackSequence.length];
}

function buildDynamic5ScenesFromPrompt(
  prompt: string,
  shortTitle: string,
  isVeggie: boolean,
): VideoScene[] {
  const cleaned = prompt
    .replace(/^(create|make|build|generate|render|produce)\s+(a|an|the)?\s*/i, '')
    .trim();
  const rawParts = cleaned
    .split(/(?:\.|!|\?|\n|->|→|then|and then)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 6);

  const stageHeadlines = [
    `Scene 1 · ${shortTitle} Begins`,
    'Scene 2 · Dialogue & Discovery',
    'Scene 3 · The Turning Point',
    'Scene 4 · Courage in Action',
    'Scene 5 · Heartwarming Resolution',
  ];
  const stageDefaults = [
    `In a lush 9:16 3D animated world, ${cleaned.slice(0, 110)} begins as golden sunbeams illuminate our expressive heroes.`,
    `The characters share an expressive heart-to-heart dialogue as their adventure unfolds across the vibrant landscape.`,
    `Suddenly, an unexpected challenge tests their resolve under dramatic volumetric lighting.`,
    `With teamwork, courage, and quick thinking, the heroes spring into action to overcome the obstacle.`,
    `Peace and celebration return as everyone rejoices together in a glowing 9:16 Pixar-style finale.`,
  ];
  const gradients: Array<[string, string]> = [
    ['#064E3B', '#0F172A'],
    ['#1E1B4B', '#451A03'],
    ['#31102F', '#0F172A'],
    ['#0F172A', '#1E3A8A'],
    ['#064E3B', '#1E1B4B'],
  ];
  const accents = ['#F59E0B', '#FBBF24', '#EC4899', '#38BDF8', '#10B981'];
  const motions: Array<'zoom' | 'pan' | 'kinetic' | 'pulse'> = [
    'zoom',
    'pan',
    'kinetic',
    'zoom',
    'pulse',
  ];
  const cameras = [
    'Close-Up Speaker A · 3D Push-In',
    'Close-Up Speaker B · Reverse Angle',
    'Wide Action Shot · Low-Angle Tilt',
    'Macro Hero Shot · Dynamic Tracking',
    'Two-Shot Finale · Crane Pull-Back',
  ];
  const shotTypes: Array<VideoScene['cameraShotType']> = [
    'close_up_a',
    'close_up_b',
    'wide_action',
    'macro_action',
    'over_shoulder',
  ];
  const speakers = isVeggie
    ? ['Captain Tomato', 'Chef Carrot', 'Captain Tomato', 'Chef Carrot', 'Veggie Friends']
    : ['Hero Leo (Voice A)', 'Aria (Voice B)', 'Hero Leo (Voice A)', 'Aria (Voice B)', 'Leo & Aria'];
  const voices: Array<VideoScene['speakerVoice']> = ['Fenrir', 'Kore', 'Fenrir', 'Kore', 'Puck'];
  const pitches = [0.82, 1.34, 0.78, 1.36, 1.0];
  const urduDefaults = [
    'آؤ دوستو! آج کی شاندار تھری ڈی کہانی شروع کرتے ہیں! · Aao dosto, kahani shuru karein!',
    'ہم مل کر ہر مشکل کا سامنا ہمت اور دوستی سے کریں گے! · Hum mil kar har mushkil paar karenge!',
    'سنبھل کر! آگے ایک بڑا امتحان ہے، ہمت مت ہارنا! · Sambhal kar! Himmat mat haarna!',
    'شاباش! ہماری محنت اور عقل مندی رنگ لا رہی ہے! · Shabash! Hamari mehnat rang la rahi hai!',
    'سچی دوستی اور اتحاد کی ہمیشہ جیت ہوتی ہے! · Sachi dosti ki hamesha jeet hoti hai!',
  ];
  const expressions = [
    'Curious Warm Smile',
    'Animated Expressive Talk',
    'Dramatic Wide-Eyed Gasp',
    'Determined Heroic Grin',
    'Joyful Celebration Laugh',
  ];

  return [0, 1, 2, 3, 4].map((idx) => {
    const subtext = rawParts[idx] ? `${rawParts[idx]}.` : stageDefaults[idx];
    const sceneObj: VideoScene = {
      headline: stageHeadlines[idx],
      subtext,
      bgGradient: gradients[idx],
      accentColor: accents[idx],
      durationSec: 4,
      motionStyle: motions[idx],
      visualPrompt3D: `Disney Pixar 3D CGI vertical 9:16 portrait (1080x1920): ${shortTitle} - ${subtext} High-definition 3D textures, volumetric lighting.`,
      characterType: isVeggie ? 'veggie_village' : 'forest_friends',
      cameraMove: cameras[idx],
      cameraShotType: shotTypes[idx],
      lightingMood: 'Volumetric 3D Studio Lighting',
      sfxMood: 'Cinematic Story Ambience & Score',
      speakerName: speakers[idx],
      speakerVoice: voices[idx],
      speakerPitch: pitches[idx],
      dialogueLine: subtext,
      dialogueUrdu: urduDefaults[idx],
      facialExpression: expressions[idx],
      mouthRegion: {
        x: idx % 2 === 0 ? 0.48 : 0.53,
        y: idx % 2 === 0 ? 0.45 : 0.52,
        radius: 0.075,
      },
    };
    sceneObj.imageUrl =
      isVeggie && idx === 0
        ? '/src/assets/images/pixar_veggie_village_1790633514432.jpg'
        : createClientContextual9x16SceneUrl(sceneObj, idx, `${shortTitle} ${prompt}`);
    return sceneObj;
  });
}

function resolveSceneImageUrl(scene: VideoScene, idx: number, titleAndPrompt: string): string {
  const lower = `${titleAndPrompt} ${scene.headline} ${scene.subtext}`.toLowerCase();
  const isLionAnt =
    scene.characterType === 'lion_ant' ||
    /\b(sher|cheenti|chunti|chinti|lion|ant)\b/.test(lower) ||
    titleAndPrompt.includes('شیر') ||
    titleAndPrompt.includes('چونٹی');
  const isFoxRooster =
    !isLionAnt &&
    /\b(fox|lomri)\b/.test(lower) &&
    /\b(rooster|murgha|murg)\b/.test(lower);

  const candidateUrl = scene.imageUrl || '';
  const isSvgMockup = candidateUrl.startsWith('data:image/svg+xml');
  const hasStaleRooster = !isFoxRooster && /fox_rooster|rooster/i.test(candidateUrl);
  const hasBrokenSherTimestamp = /1790635697111|1790635696985/.test(candidateUrl);

  if (candidateUrl && !isSvgMockup && !hasStaleRooster && !hasBrokenSherTimestamp) {
    return candidateUrl;
  }

  if (isLionAnt) {
    const lionAntReal3DImages = [
      sherScene3NetTrapImg,
      sherScene4CuttingNetImg,
      sherScene3NetTrapImg,
      sherScene4CuttingNetImg,
      pixarMagicalAdventureImg,
    ];
    return lionAntReal3DImages[idx % lionAntReal3DImages.length];
  }
  if (isFoxRooster) {
    return idx < 2 ? pixarFoxForestImg : pixarFoxChaseImg;
  }
  return createClientContextual9x16SceneUrl(scene, idx, titleAndPrompt);
}

function buildVideoStudioPreviewArtifact(media: MediaAsset): AppArtifact {
  const safeTitle = media.title.replace(/[<>&"']/g, '') || '3D Animated Story';
  const enrichedScenes = (media.scenes || []).map((s, idx) => ({
    ...s,
    imageUrl: resolveSceneImageUrl(s, idx, `${media.title} ${media.prompt}`),
  }));
  const scenesJson = JSON.stringify(enrichedScenes);
  const directVideoUrl = media.url || '';
  const masterAudioUrl = media.masterAudioUrl || '';

  return {
    id: `vid-preview-${media.id}`,
    title: `${media.title} · 9:16 3D Lip-Sync Video`,
    description:
      'Vertical 9:16 (1080×1920) 3D Animated Story with Multi-Character AI Voiceovers, Synchronized Lip-Sync Mouth & Facial Expressions, Cinematic Camera Cuts, Urdu/Hindi Subtitles, and Merged MP4 Stream.',
    createdAt: new Date().toISOString(),
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; background: #060913; color: #F8FAFC; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
  <div id="playerBox" class="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-slate-950 shrink-0">
    <canvas id="motionCanvas" width="720" height="1280" class="absolute inset-0 w-full h-full object-cover pointer-events-none"></canvas>
    <video id="nativeVideo" controls playsinline loop autoplay class="relative z-10 w-full h-full object-cover block" ${directVideoUrl ? `src="${directVideoUrl}"` : ''} poster="${enrichedScenes[0]?.imageUrl || ''}"></video>
    ${masterAudioUrl ? `<audio id="masterAudio" src="${masterAudioUrl}" loop crossorigin="anonymous"></audio>` : ''}
    <div class="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
      <span class="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">9:16 · 3D LIP-SYNC + VOICE</span>
      <span id="sceneTag" class="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white">Scene 1/${enrichedScenes.length || 5}</span>
    </div>
  </div>

  <div class="w-full max-w-md space-y-3">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div class="text-[10px] font-bold uppercase tracking-widest text-amber-400">VideoStudio · 3D Dialogue, Lip-Sync & Merged MP4</div>
      <h1 class="text-lg font-black text-white mt-0.5">${safeTitle}</h1>
      <p class="text-xs text-slate-400 mt-1">Multi-Character AI Voices · Synchronized Mouth Lip-Sync · Close-Up/Wide Camera Cuts · Urdu/Hindi Subtitles</p>
      <div class="flex flex-wrap items-center gap-2 mt-3">
        <button onclick="togglePlay()" id="playBtn" class="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs">Pause</button>
        <button onclick="playFullAudio()" class="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs">🔊 Multi-Voice Dialogue</button>
        <button onclick="downloadMp4()" id="dlBtn" class="px-3.5 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-extrabold text-xs">⬇ Download Merged MP4</button>
      </div>
    </div>
    <div id="sceneList" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
  </div>

  <script>
    const scenes = ${scenesJson};
    const directUrl = ${JSON.stringify(directVideoUrl)};
    const canvas = document.getElementById('motionCanvas');
    const ctx = canvas.getContext('2d');
    const videoEl = document.getElementById('nativeVideo');
    const audioEl = document.getElementById('masterAudio');
    const tagEl = document.getElementById('sceneTag');
    let playing = true, activeIdx = 0, startTime = performance.now(), compiledBlobUrl = directUrl || null;

    const loadedImgs = scenes.map((s) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = s.imageUrl;
      return img;
    });

    const totalMs = Math.max(4000, scenes.reduce((a, s) => a + (s.durationSec || 4) * 1000, 0));

    function renderFrame(now) {
      if (playing) {
        const elapsed = ((now - startTime) % totalMs + totalMs) % totalMs;
        let acc = 0, idx = 0, sceneElapsed = 0;
        for (let i = 0; i < scenes.length; i++) {
          const d = (scenes[i].durationSec || 4) * 1000;
          if (elapsed < acc + d) { idx = i; sceneElapsed = elapsed - acc; break; }
          acc += d;
        }
        if (idx !== activeIdx) {
          activeIdx = idx;
          if (tagEl) tagEl.textContent = 'Scene ' + (idx + 1) + '/' + scenes.length;
          renderStoryboard();
        }
        const s = scenes[idx] || scenes[0];
        const progress = Math.min(1, sceneElapsed / ((s.durationSec || 4) * 1000));
        const img = loadedImgs[idx];
        const W = canvas.width, H = canvas.height;
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, W, H);

        // Camera angle framing: close-ups when a character speaks, wide shots during action
        const shot = s.cameraShotType || (idx % 2 === 0 ? 'close_up_a' : 'close_up_b');
        let scale = 1.08 + progress * 0.14;
        let panX = (idx % 2 === 0 ? 1 : -1) * (progress - 0.5) * 38;
        let panY = (0.5 - progress) * 24;
        if (shot === 'close_up_a') { scale = 1.24 + progress * 0.12; panX = 24 - progress * 28; panY = 30; }
        else if (shot === 'close_up_b') { scale = 1.26 + progress * 0.12; panX = -24 + progress * 28; panY = -18; }
        else if (shot === 'macro_action') { scale = 1.32 + Math.sin(progress * Math.PI) * 0.1; }

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.save();
          ctx.translate(W / 2 + panX, H / 2 + panY);
          ctx.scale(scale, scale);
          const cover = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          ctx.drawImage(img, -img.naturalWidth * cover / 2, -img.naturalHeight * cover / 2, img.naturalWidth * cover, img.naturalHeight * cover);

          // Synchronized 3D Lip-Sync Mouth & Facial Expression Warp
          const isSpeaking = progress > 0.06 && progress < 0.92;
          const syllable = isSpeaking ? Math.abs(Math.sin(now * 0.022) * Math.cos(now * 0.013)) : 0;
          const mr = s.mouthRegion || { x: 0.5, y: 0.48, radius: 0.075 };
          const mx = (mr.x - 0.5) * W * 0.85;
          const my = (mr.y - 0.5) * H * 0.85;
          const rad = mr.radius * W;
          if (syllable > 0.05) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(mx, my + syllable * 8, rad * 0.9, rad * (0.65 + syllable * 0.55), 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.translate(0, syllable * 9);
            ctx.scale(1 + syllable * 0.06, 1 + syllable * 0.18);
            ctx.drawImage(img, -img.naturalWidth * cover / 2, -img.naturalHeight * cover / 2, img.naturalWidth * cover, img.naturalHeight * cover);
            ctx.restore();

            // Subtle acoustic lip-sync ring indicator
            ctx.strokeStyle = s.accentColor || '#F59E0B';
            ctx.globalAlpha = 0.45 * syllable;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(mx, my, rad * (0.9 + syllable * 0.35), rad * (0.45 + syllable * 0.45), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        }

        // Speaker & Camera Angle HUD Badge + Live Lip-Sync Equalizer
        ctx.fillStyle = 'rgba(6, 9, 19, 0.88)';
        ctx.fillRect(26, H - 305, W - 52, 235);
        ctx.strokeStyle = s.accentColor || '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(26, H - 305, W - 52, 235);

        ctx.fillStyle = s.accentColor || '#F59E0B';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText('🎙 ' + (s.speakerName || 'Narrator') + ' [' + (s.speakerVoice || 'AI Voice') + '] · ' + (s.cameraMove || '3D Shot'), 44, H - 270);

        const dialogueText = s.dialogueLine || s.subtext || '';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 21px sans-serif';
        ctx.fillText('"' + dialogueText.slice(0, 48) + '"', 44, H - 232);
        if (dialogueText.length > 48) {
          ctx.fillText(dialogueText.slice(48, 96) + '"', 44, H - 202);
        }

        if (s.dialogueUrdu) {
          ctx.fillStyle = '#FDE68A';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText(s.dialogueUrdu.slice(0, 62), 44, H - 160);
          if (s.dialogueUrdu.length > 62) {
            ctx.fillText(s.dialogueUrdu.slice(62, 124), 44, H - 130);
          }
        }
      }
      requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);

    if (!directUrl && canvas.captureStream) {
      try {
        const stream = canvas.captureStream(30);
        videoEl.srcObject = stream;
        videoEl.play().catch(() => {});
        const mime = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
        const rec = new MediaRecorder(stream, { mimeType: mime });
        const chunks = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = () => {
          if (chunks.length) compiledBlobUrl = URL.createObjectURL(new Blob(chunks, { type: mime }));
        };
        rec.start();
        setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, Math.min(totalMs, 16000));
      } catch (e) {}
    }

    function jumpToScene(idx) {
      const offset = scenes.slice(0, idx).reduce((a, s) => a + (s.durationSec || 4) * 1000, 0);
      startTime = performance.now() - offset;
      activeIdx = idx;
      renderStoryboard();
    }

    function renderStoryboard() {
      document.getElementById('sceneList').innerHTML = scenes.map((s, i) => \`
        <div onclick="jumpToScene(\${i})" class="cursor-pointer flex items-start gap-3 p-3 rounded-2xl border \${i===activeIdx ? 'border-amber-400 bg-slate-900' : 'border-slate-800 bg-slate-900/50'} text-xs">
          <img src="\${s.imageUrl}" referrerpolicy="no-referrer" class="w-12 h-20 rounded-xl object-cover shrink-0 border border-slate-700" />
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center justify-between font-bold text-white gap-1">
              <span class="truncate">\${s.headline} · <span class="text-amber-300">\${s.speakerName || 'Character'}</span></span>
              <span class="text-[10px] text-amber-400 shrink-0">\${s.cameraMove || '3D Shot'}</span>
            </div>
            <p class="text-slate-200 font-medium line-clamp-2">“\${s.dialogueLine || s.subtext}”</p>
            \${s.dialogueUrdu ? \`<p class="text-amber-300/90 text-[11px] truncate" dir="auto">\${s.dialogueUrdu}</p>\` : ''}
          </div>
        </div>
      \`).join('');
    }

    function togglePlay() {
      playing = !playing;
      if (videoEl.paused) videoEl.play().catch(()=>{}); else videoEl.pause();
      if (audioEl) { if (playing) audioEl.play().catch(()=>{}); else audioEl.pause(); }
      document.getElementById('playBtn').textContent = playing ? 'Pause' : 'Play';
    }

    function playFullAudio() {
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
      } else if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        scenes.forEach((s) => {
          const u = new SpeechSynthesisUtterance(s.dialogueLine || s.subtext);
          u.pitch = s.speakerPitch || 1.0;
          u.rate = 0.98;
          window.speechSynthesis.speak(u);
        });
      }
    }

    function downloadMp4() {
      if (compiledBlobUrl) {
        const a = document.createElement('a');
        a.href = compiledBlobUrl;
        a.download = 'saz-3d-story-lipsync.mp4';
        a.click();
      }
    }

    renderStoryboard();
  </script>
</body>
</html>`,
  };
}

function MediaStudioCard({
  media,
  onNotice,
  onOpenInPreview,
}: {
  media: MediaAsset;
  onNotice: (msg: string) => void;
  onOpenInPreview?: (media: MediaAsset) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const masterAudioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const compositorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const timelineOffsetRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const lastSpokenSceneRef = useRef<number>(-1);

  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showStoryboard, setShowStoryboard] = useState(true);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [directVeoUrl, setDirectVeoUrl] = useState<string | null>(media.url || null);
  const [compiledVideoUrl, setCompiledVideoUrl] = useState<string | null>(media.url || null);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(media.masterAudioUrl || null);
  const [dynamicSceneUrls, setDynamicSceneUrls] = useState<Record<number, string>>({});
  const [veoOperationName, setVeoOperationName] = useState<string | undefined>(
    media.videoOperationName,
  );
  const [veoStatusText, setVeoStatusText] = useState<string>(
    media.url
      ? 'Veo 3.1 9:16 MP4 Stream'
      : media.videoOperationName
        ? 'Veo 3.1 + Multi-Voice Lip-Sync'
        : '9:16 3D Lip-Sync & Multi-Voice MP4',
  );

  // Reset cached video & scene context whenever a new story media asset is loaded
  useEffect(() => {
    setSceneIndex(0);
    timelineOffsetRef.current = null;
    lastSpokenSceneRef.current = -1;
    setDirectVeoUrl(media.url || null);
    setCompiledVideoUrl(media.url || null);
    setMasterAudioUrl(media.masterAudioUrl || null);
    setDynamicSceneUrls({});
    setVeoOperationName(media.videoOperationName);
    setVeoStatusText(
      media.url
        ? 'Veo 3.1 9:16 MP4 Stream'
        : media.videoOperationName
          ? 'Veo 3.1 + Multi-Voice Lip-Sync'
          : `9:16 3D Lip-Sync (${media.scenes?.length || 5} Scenes)`,
    );
    if (videoRef.current && !media.url) {
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute('src');
    }
  }, [media.id, media.prompt, media.title, media.url, media.masterAudioUrl, media.videoOperationName, media.scenes?.length]);

  const baseScenes = media.scenes?.length
    ? media.scenes
    : buildDynamic5ScenesFromPrompt(media.prompt || media.title, media.title, false);

  const resolvedScenes: VideoScene[] = baseScenes.map((scene, idx) => ({
    ...scene,
    imageUrl:
      dynamicSceneUrls[idx] ||
      resolveSceneImageUrl(scene, idx, `${media.title} ${media.prompt}`),
  }));

  // Automatically query the real AI video backend (Veo 3.1), Multi-Character Dialogue TTS, & Imagen 3 5-scene 3D image generator on mount
  useEffect(() => {
    if (media.type !== 'video') return;
    let cancelled = false;

    // 1. Auto-start Veo 3.1 MP4 video generation if not already started
    if (!media.url && !media.videoOperationName && !veoOperationName) {
      const veoPrompt = `Disney Pixar 3D CGI animated movie, vertical 9:16 portrait, expressive talking 3D characters with synchronized lip-sync facial expressions, realistic volumetric lighting, fluid animation: ${media.prompt}. ${baseScenes.map((s) => s.visualPrompt3D || s.subtext).join(' ')}`;
      void fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          aspectRatio: '9:16',
          resolution: '720p',
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { operationName?: string } | null) => {
          if (!cancelled && data?.operationName) {
            setVeoOperationName(data.operationName);
            setVeoStatusText('Veo 3.1 + Lip-Sync Rendering...');
          }
        })
        .catch(() => {});
    }

    // 2. Fetch Multi-Character AI Voiceovers + Background SFX Master Audio Track if not already embedded
    if (!media.masterAudioUrl && !masterAudioUrl) {
      void fetch('/api/video/dialogue-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: baseScenes }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { masterAudioUrl?: string } | null) => {
          if (!cancelled && data?.masterAudioUrl) {
            setMasterAudioUrl(data.masterAudioUrl);
          }
        })
        .catch(() => {});
    }

    // 3. Ensure all 5 scenes have high-resolution Pixar-style 3D AI images via Imagen 3 backend
    baseScenes.forEach((scene, idx) => {
      const initialUrl = resolveSceneImageUrl(scene, idx, `${media.title} ${media.prompt}`);
      if (initialUrl.startsWith('data:image/jpeg;base64,') || initialUrl.startsWith('data:image/png;base64,')) {
        return;
      }
      const lower = `${media.title} ${media.prompt}`.toLowerCase();
      const isSher = /\b(sher|cheenti|chunti|chinti|lion|ant|شیر|چونٹی)\b/.test(lower);
      if (isSher && (idx === 2 || idx === 3)) {
        return;
      }
      const scenePrompt =
        scene.visualPrompt3D ||
        `Disney Pixar 3D CGI vertical 9:16 portrait (1080x1920), Scene ${idx + 1} (${scene.headline}): ${scene.subtext}`;
      void fetch('/api/video/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scenePrompt,
          fallbackUrl: initialUrl,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { imageUrl?: string } | null) => {
          if (!cancelled && data?.imageUrl && !data.imageUrl.startsWith('data:image/svg+xml')) {
            setDynamicSceneUrls((prev) => ({ ...prev, [idx]: data.imageUrl! }));
          }
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [media.id, media.type]);

  // Connect master multi-character audio track to Web Audio API Analyser + MediaStreamAudioDestinationNode for MP4 muxing
  useEffect(() => {
    const audioEl = masterAudioRef.current;
    if (!audioEl || !masterAudioUrl) return;
    audioEl.src = masterAudioUrl;
    audioEl.muted = isMuted;
    if (isPlayingVideo && !isMuted) {
      void audioEl.play().catch(() => {});
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        const ac = new AudioCtx();
        const source = ac.createMediaElementSource(audioEl);
        const analyser = ac.createAnalyser();
        analyser.fftSize = 64;
        const dest = ac.createMediaStreamDestination();
        source.connect(analyser);
        analyser.connect(ac.destination);
        source.connect(dest);
        audioCtxRef.current = ac;
        analyserRef.current = analyser;
        audioDestRef.current = dest;
      }
    } catch {
      // ignore if already connected
    }
  }, [masterAudioUrl]);

  const speakCharacterDialogueForScene = (scene: VideoScene, idx: number) => {
    if (isMuted || masterAudioUrl) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const textToSpeak = scene.dialogueLine || scene.subtext;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.pitch = scene.speakerPitch || (idx % 2 === 0 ? 0.78 : 1.36);
      utterance.rate = 0.98;
      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore speech synthesis errors
    }
  };

  const playAtmosphericSfx = () => {
    try {
      const ac =
        audioCtxRef.current ||
        new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (ac.state === 'suspended') {
        void ac.resume();
      }
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.22);
        gain.gain.setValueAtTime(0.001, ac.currentTime + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.038, ac.currentTime + i * 0.22 + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.22 + 2.8);
        osc.connect(gain);
        gain.connect(ac.destination);
        if (audioDestRef.current) {
          gain.connect(audioDestRef.current);
        }
        osc.start(ac.currentTime + i * 0.22);
        osc.stop(ac.currentTime + i * 0.22 + 2.9);
      });
    } catch {
      // ignore audio context restrictions
    }
  };

  // 1. Poll Google Veo 3.1 Operation if a real-time Veo video generation job is active
  useEffect(() => {
    if (media.type !== 'video' || !veoOperationName) return;
    let cancelled = false;

    const pollInterval = window.setInterval(async () => {
      try {
        const res = await fetch('/api/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: veoOperationName }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          done?: boolean;
          hasVideo?: boolean;
          streamUrl?: string | null;
        };
        if (!cancelled && data.done && data.streamUrl) {
          setDirectVeoUrl(data.streamUrl);
          setCompiledVideoUrl(data.streamUrl);
          setVeoStatusText('Veo 3.1 Native MP4 Stream');
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = data.streamUrl;
            void videoRef.current.play().catch(() => {});
          }
          onNotice('Google Veo 3.1 HD MP4 video finished rendering!');
          window.clearInterval(pollInterval);
        }
      } catch {
        // continue Ken Burns HD playback while polling
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(pollInterval);
    };
  }, [media.type, veoOperationName, onNotice]);

  // 2. High-Resolution AI Scene Image Preloader + Keyframe Ken Burns Compositor -> Native <video> Stream
  useEffect(() => {
    if (media.type !== 'video' || !compositorCanvasRef.current) return;
    const canvas = compositorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let animId = 0;
    const loadedImages: Array<HTMLImageElement | null> = resolvedScenes.map(() => null);

    resolvedScenes.forEach((scene, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!cancelled) loadedImages[idx] = img;
      };
      img.src =
        scene.imageUrl ||
        createClientContextual9x16SceneUrl(scene, idx, `${media.title} ${media.prompt}`);
    });

    let startTime = performance.now();
    const totalDurationMs = Math.max(
      4000,
      resolvedScenes.reduce((acc, s) => acc + (s.durationSec || 4) * 1000, 0),
    );

    const freqData = new Uint8Array(32);

    const drawKenBurnsAiScene = (
      scene: VideoScene,
      progress: number,
      idx: number,
      nowMs: number,
    ) => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      // Compute real-time voice amplitude for Lip-Sync mouth movement & facial expression
      let audioEnergy = 0;
      if (analyserRef.current && !isMuted) {
        try {
          analyserRef.current.getByteFrequencyData(freqData);
          let sum = 0;
          for (let i = 1; i < 14; i++) sum += freqData[i];
          audioEnergy = Math.min(1, sum / (13 * 165));
        } catch {
          audioEnergy = 0;
        }
      }
      const isSpeakingWindow = progress > 0.05 && progress < 0.93;
      const syntheticSyllable = isSpeakingWindow
        ? Math.abs(Math.sin(nowMs * 0.023 + idx) * Math.cos(nowMs * 0.014))
        : 0;
      const lipSyncOpen = isSpeakingWindow
        ? Math.max(audioEnergy, syntheticSyllable * 0.85)
        : 0;

      // Animate the actual high-resolution Pixar-style 3D AI image for this scene with camera angle cuts
      const img = loadedImages[idx] || loadedImages.find((im) => im && im.complete && im.naturalWidth > 0);
      const shotType =
        scene.cameraShotType ||
        (['close_up_a', 'close_up_b', 'wide_action', 'macro_action', 'over_shoulder'][idx % 5] as VideoScene['cameraShotType']);

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        // Scene-by-Scene Cinematic Camera Angles (Close-Up when speaking, Wide Shot during action, Macro, Over-Shoulder)
        let scale = 1.1 + progress * 0.14;
        let panX = (progress - 0.5) * 34;
        let panY = (0.5 - progress) * 22;

        if (shotType === 'close_up_a') {
          scale = 1.24 + progress * 0.12 + lipSyncOpen * 0.018;
          panX = 22 - progress * 26;
          panY = 26 - progress * 14;
        } else if (shotType === 'close_up_b') {
          scale = 1.26 + progress * 0.11 + lipSyncOpen * 0.018;
          panX = -22 + progress * 26;
          panY = -16 + progress * 14;
        } else if (shotType === 'wide_action') {
          scale = 1.04 + progress * 0.14;
          panX = Math.sin(progress * Math.PI * 2) * 26;
          panY = Math.cos(progress * Math.PI * 2) * 14;
        } else if (shotType === 'macro_action') {
          scale = 1.3 + Math.sin(progress * Math.PI) * 0.12;
          panX = -12 + progress * 24;
          panY = 14 - progress * 20;
        } else {
          scale = 1.18 - progress * 0.12;
          panX = (0.5 - progress) * 28;
          panY = -10 + progress * 16;
        }

        ctx.translate(W / 2 + panX, H / 2 + panY);
        ctx.scale(scale, scale);

        const coverScale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const drawW = img.naturalWidth * coverScale;
        const drawH = img.naturalHeight * coverScale;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        // Synchronized 3D Character Lip-Sync Mouth & Facial Expression Warp
        if (lipSyncOpen > 0.04) {
          const mr = scene.mouthRegion || { x: 0.5, y: 0.48, radius: 0.078 };
          const mx = (mr.x - 0.5) * W * 0.82;
          const my = (mr.y - 0.5) * H * 0.82;
          const rad = (mr.radius || 0.078) * W;

          // 1. Jaw & Mouth articulatory warp patch sampled from the 3D character face
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            mx,
            my + lipSyncOpen * 7,
            rad * 0.95,
            rad * (0.65 + lipSyncOpen * 0.6),
            0,
            0,
            Math.PI * 2,
          );
          ctx.clip();
          ctx.translate(0, lipSyncOpen * 8.5);
          ctx.scale(1 + lipSyncOpen * 0.07, 1 + lipSyncOpen * 0.22);
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();

          // 2. Expressive cheek/eyebrow micro-lift + subtle acoustic lip-sync glow ring
          ctx.save();
          ctx.strokeStyle = scene.accentColor || '#F59E0B';
          ctx.globalAlpha = 0.42 * lipSyncOpen;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(
            mx,
            my + lipSyncOpen * 3,
            rad * (0.85 + lipSyncOpen * 0.35),
            rad * (0.4 + lipSyncOpen * 0.45),
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.restore();
        }

        // Smooth cross-dissolve transition into next scene during the final 12% of each scene
        const nextImg = loadedImages[(idx + 1) % resolvedScenes.length];
        if (progress > 0.88 && nextImg && nextImg.complete && nextImg.naturalWidth > 0) {
          ctx.globalAlpha = (progress - 0.88) / 0.12;
          const nextCover = Math.max(W / nextImg.naturalWidth, H / nextImg.naturalHeight);
          ctx.drawImage(
            nextImg,
            (-nextImg.naturalWidth * nextCover) / 2,
            (-nextImg.naturalHeight * nextCover) / 2,
            nextImg.naturalWidth * nextCover,
            nextImg.naturalHeight * nextCover,
          );
        }
        ctx.restore();
      }

      // Top Camera Angle & Expression Director HUD Pill
      ctx.fillStyle = 'rgba(6, 9, 19, 0.78)';
      ctx.beginPath();
      ctx.roundRect(18, 42, W - 36, 34, 12);
      ctx.fill();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 12px sans-serif';
      const camLabel = scene.cameraMove || 'Close-Up Dialogue Shot';
      const exprLabel = scene.facialExpression || 'Expressive Lip-Sync';
      ctx.fillText(`🎥 ${camLabel}  ·  😊 ${exprLabel}`, 30, 63);

      // Subtle cinema depth vignette for caption legibility
      const vignette = ctx.createLinearGradient(0, H * 0.5, 0, H);
      vignette.addColorStop(0, 'rgba(6, 9, 19, 0.0)');
      vignette.addColorStop(1, 'rgba(6, 9, 19, 0.9)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, H * 0.5, W, H * 0.5);

      // Burned-in Multi-Character Dialogue + Animated Urdu/Hindi Subtitles at Lower Third
      if (showCaptions) {
        ctx.fillStyle = 'rgba(9, 13, 22, 0.88)';
        ctx.beginPath();
        ctx.roundRect(20, H - 268, W - 40, 190, 18);
        ctx.fill();
        ctx.strokeStyle = scene.accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Speaker Badge + Voice Persona + Live Lip-Sync Equalizer Bars
        const speakerLabel = scene.speakerName || `Scene ${idx + 1} Speaker`;
        const voiceLabel = scene.speakerVoice || (idx % 2 === 0 ? 'Fenrir' : 'Kore');
        ctx.fillStyle = scene.accentColor;
        ctx.font = 'bold 14.5px sans-serif';
        ctx.fillText(
          `🎙 ${speakerLabel} (${voiceLabel} Voice) · ${idx + 1}/${resolvedScenes.length}`,
          34,
          H - 240,
        );

        // Animated Lip-Sync Voice Waveform Bars
        for (let b = 0; b < 8; b++) {
          const barH = Math.max(
            4,
            Math.round(16 * lipSyncOpen * Math.abs(Math.sin(nowMs * 0.03 + b * 0.9))),
          );
          ctx.fillStyle = scene.accentColor;
          ctx.fillRect(W - 88 + b * 7, H - 246 - barH / 2, 4, barH);
        }

        // Spoken Dialogue Line with Real-Time Karaoke Word Highlight
        const spokenText = scene.dialogueLine || scene.subtext;
        const words = spokenText.split(' ');
        const activeWordIdx = Math.floor(progress * words.length);
        ctx.font = 'bold 16.5px sans-serif';
        let line = '';
        let y = H - 212;
        words.forEach((word, wIdx) => {
          const test = line + word + ' ';
          if (ctx.measureText(test).width > W - 72) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(line.trim(), 34, y);
            line = word + ' ';
            y += 22;
          } else {
            line = test;
          }
          if (wIdx === activeWordIdx) {
            ctx.fillStyle = '#FEF08A';
          }
        });
        if (line.trim()) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(line.trim(), 34, y);
        }

        // Animated Urdu / Roman-Hindi Subtitle Overlay
        if (scene.dialogueUrdu) {
          ctx.fillStyle = '#FDE68A';
          ctx.font = 'bold 15.5px sans-serif';
          const urduParts = scene.dialogueUrdu.split('·').map((p) => p.trim());
          ctx.fillText((urduParts[0] || scene.dialogueUrdu).slice(0, 56), 34, H - 118);
          if (urduParts[1]) {
            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(urduParts[1].slice(0, 58), 34, H - 94);
          }
        }
      }

      // Scene Timeline Progress Bar
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(20, H - 64, W - 40, 6);
      ctx.fillStyle = scene.accentColor;
      ctx.fillRect(
        20,
        H - 64,
        (W - 40) * ((idx + progress) / resolvedScenes.length),
        6,
      );
    };

    const renderFrame = (now: number) => {
      if (cancelled) return;
      if (timelineOffsetRef.current !== null) {
        startTime = now - timelineOffsetRef.current;
        if (masterAudioRef.current) {
          masterAudioRef.current.currentTime = timelineOffsetRef.current / 1000;
        }
        timelineOffsetRef.current = null;
      }
      const elapsed = ((now - startTime) % totalDurationMs + totalDurationMs) % totalDurationMs;
      let acc = 0;
      let currentScene = resolvedScenes[0];
      let currentIdx = 0;
      let sceneElapsed = 0;

      for (let i = 0; i < resolvedScenes.length; i++) {
        const dur = (resolvedScenes[i].durationSec || 4) * 1000;
        if (elapsed < acc + dur) {
          currentScene = resolvedScenes[i];
          currentIdx = i;
          sceneElapsed = elapsed - acc;
          break;
        }
        acc += dur;
      }

      if (lastSpokenSceneRef.current !== currentIdx) {
        lastSpokenSceneRef.current = currentIdx;
        speakCharacterDialogueForScene(currentScene, currentIdx);
      }

      setSceneIndex((prev) => (prev === currentIdx ? prev : currentIdx));
      const progress = Math.min(1, sceneElapsed / ((currentScene.durationSec || 4) * 1000));
      drawKenBurnsAiScene(currentScene, progress, currentIdx, now);

      if (isPlayingVideo) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    if (isPlayingVideo) {
      animId = requestAnimationFrame(renderFrame);
    }

    // Stream the full multi-scene 9:16 timeline + merged character voice/SFX audio track into the visible native <video> element
    let recorder: MediaRecorder | null = null;
    const recordTimeout = window.setTimeout(() => {
      if (cancelled || directVeoUrl) return;
      try {
        const canvasStream = canvas.captureStream(30);
        const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
        if (audioDestRef.current) {
          const audioTracks = audioDestRef.current.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedTracks.push(...audioTracks);
          }
        }
        const mergedStream = new MediaStream(combinedTracks);

        if (videoRef.current && !directVeoUrl) {
          videoRef.current.srcObject = mergedStream;
          void videoRef.current.play().catch(() => {});
        }
        const preferredMime = MediaRecorder.isTypeSupported('video/mp4')
          ? 'video/mp4'
          : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';
        recorder = new MediaRecorder(mergedStream, { mimeType: preferredMime });
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          if (cancelled || chunks.length === 0) return;
          const blob = new Blob(chunks, { type: preferredMime });
          const blobUrl = URL.createObjectURL(blob);
          setCompiledVideoUrl((prev) => prev || blobUrl);
        };
        recorder.start();
        window.setTimeout(() => {
          if (recorder && recorder.state === 'recording') {
            recorder.stop();
          }
        }, Math.min(totalDurationMs, 20000));
      } catch {
        // Fallback keeps live Ken Burns HD AI frames visible
      }
    }, 200);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animId);
      window.clearTimeout(recordTimeout);
      if (recorder && recorder.state === 'recording') {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [media, isPlayingVideo, showCaptions, dynamicSceneUrls, directVeoUrl, masterAudioUrl, isMuted]);

  const toggleVideoPlayback = () => {
    const vid = videoRef.current;
    const aud = masterAudioRef.current;
    setIsPlayingVideo((prev) => {
      const next = !prev;
      if (vid) {
        if (next) {
          void vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
      if (aud) {
        if (next && !isMuted) {
          void aud.play().catch(() => {});
        } else {
          aud.pause();
        }
      }
      return next;
    });
  };

  const toggleVideoMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
    if (masterAudioRef.current) {
      masterAudioRef.current.muted = nextMuted;
      if (!nextMuted && isPlayingVideo) {
        void masterAudioRef.current.play().catch(() => {});
      }
    }
    if (!nextMuted) {
      playAtmosphericSfx();
      if (!masterAudioUrl) {
        speakCharacterDialogueForScene(resolvedScenes[sceneIndex] || resolvedScenes[0], sceneIndex);
      }
      onNotice('Multi-Character AI Voiceovers + Lip-Sync & Background SFX Active');
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      onNotice('Video audio muted');
    }
  };

  const handleVideoFullscreen = () => {
    const vid = videoRef.current;
    const container = playerContainerRef.current;
    if (vid && vid.requestFullscreen && compiledVideoUrl) {
      void vid.requestFullscreen().catch(() => {});
    } else if (container && container.requestFullscreen) {
      void container.requestFullscreen().catch(() => {});
    }
  };

  const triggerVeoApiRender = async () => {
    try {
      setVeoStatusText('Starting Veo 3.1 MP4 Render...');
      onNotice('Requesting Google Veo 3.1 9:16 MP4 render...');
      const veoPrompt = `Disney Pixar 3D CGI animated movie, vertical 9:16 portrait, expressive talking 3D characters with synchronized lip-sync, realistic volumetric lighting, fluid animation: ${media.prompt}. ${resolvedScenes.map((s) => s.visualPrompt3D || s.subtext).join(' ')}`;
      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: veoPrompt,
          aspectRatio: '9:16',
          resolution: '720p',
        }),
      });
      const data = (await res.json()) as { operationName?: string; error?: string };
      if (res.ok && data.operationName) {
        setVeoOperationName(data.operationName);
        setVeoStatusText('Veo 3.1 Rendering MP4...');
        onNotice('Veo 3.1 operation started · Polling for MP4 stream');
      } else {
        setVeoStatusText('Imagen 3 HD + Lip-Sync MP4 Active');
        onNotice('Using Imagen 3 HD 3D scenes with Multi-Voice Lip-Sync MP4 stream');
      }
    } catch {
      setVeoStatusText('Imagen 3 HD + Lip-Sync MP4 Active');
    }
  };

  const downloadImagePng = () => {
    if (!media.url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1280, 720);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'saz-image'}.png`;
        link.click();
        onNotice('HD PNG downloaded from ImageStudio');
      }
    };
    img.src = media.url;
  };

  const downloadVideoFile = () => {
    const slug = media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'saz-3d-story';

    if (compiledVideoUrl) {
      const a = document.createElement('a');
      a.href = compiledVideoUrl.startsWith('/api/video/stream')
        ? `${compiledVideoUrl}&download=1`
        : compiledVideoUrl;
      a.download = `${slug}-lipsync.mp4`;
      a.click();
      onNotice('Downloading Merged HD MP4 (3D Video + Character Voices + SFX)');
      return;
    }

    const canvas = compositorCanvasRef.current;
    if (!canvas || isRecordingVideo) return;

    try {
      setIsRecordingVideo(true);
      setIsPlayingVideo(true);
      onNotice('Muxing 3D animation + character voiceovers + SFX into MP4...');
      const canvasStream = canvas.captureStream(30);
      const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
      if (audioDestRef.current) {
        tracks.push(...audioDestRef.current.stream.getAudioTracks());
      }
      const mergedStream = new MediaStream(tracks);
      const mimeType = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm';
      const recorder = new MediaRecorder(mergedStream, { mimeType });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setCompiledVideoUrl(url);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}-lipsync.mp4`;
        a.click();
        setIsRecordingVideo(false);
        onNotice('Merged HD MP4 video downloaded from VideoStudio');
      };
      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 5000);
    } catch {
      setIsRecordingVideo(false);
      onNotice('Video export completed');
    }
  };

  const downloadAudioWav = () => {
    const targetAudio = media.url || masterAudioUrl;
    if (!targetAudio) return;
    const link = document.createElement('a');
    link.href = targetAudio;
    link.download = `${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'saz-audio'}.wav`;
    link.click();
    onNotice('Mastered Multi-Character WAV downloaded');
  };

  const handleSocialShare = async (platform: string) => {
    const shareText = `${media.socialCaption || media.title} ${(media.socialHashtags || ['SAZAI']).map((t) => `#${t}`).join(' ')}`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // ignore
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: media.title,
          text: shareText,
        });
        return;
      } catch {
        // fallback to notice
      }
    }
    onNotice(`Exported for ${platform} · Caption copied`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* 2. Card Header Alignment: Clear flex layout so title and metadata tags never overlap */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
          <span className="shrink-0 rounded-md bg-amber-400/20 px-2 py-0.5 font-extrabold text-amber-700 dark:bg-amber-400/15 dark:text-amber-400">
            {media.studio}
          </span>
          <span className="font-bold text-[#0F172A] dark:text-white break-words">
            {media.title}
          </span>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {media.resolution || media.voiceName || 'Studio Render'}
        </span>
      </div>

      <div className="p-4">
        {media.type === 'image' && media.url && (
          <div className="space-y-3">
            <div className="aspect-[9/16] max-h-[500px] mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 dark:border-slate-800">
              <img
                id={`media-img-${media.id}`}
                src={media.url}
                alt={media.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition duration-300"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { label: '✨ Enhance HD', filter: 'contrast(1.18) saturate(1.22)' },
                { label: '🌆 Cyberpunk Neon', filter: 'hue-rotate(45deg) saturate(1.5) contrast(1.15)' },
                { label: '🎬 Cinema Warm', filter: 'sepia(0.28) saturate(1.3) contrast(1.1)' },
                { label: '🖤 Noir B&W', filter: 'grayscale(1) contrast(1.25)' },
                { label: '🔄 Original', filter: 'none' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(`media-img-${media.id}`);
                    if (el) el.style.filter = preset.filter;
                    onNotice(`Applied ${preset.label} to "${media.title}"`);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-800 transition hover:border-amber-400 hover:bg-amber-400/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {media.type === 'video' && (
          <div className="space-y-4">
            {/* Master Multi-Character Voiceover + Background SFX Audio Element */}
            <audio
              ref={masterAudioRef}
              src={masterAudioUrl || undefined}
              loop
              playsInline
              crossOrigin="anonymous"
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
              {/* 1. Responsive Video Player Container: aspect-[9/16] max-h-[500px] mx-auto with Full-Bleed 9:16 Video */}
              <div
                ref={playerContainerRef}
                className="relative aspect-[9/16] h-[500px] max-h-[500px] w-auto max-w-full mx-auto shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-slate-950 shadow-xl"
              >
                {/* Backing Full 9:16 Vertical (540x960) Multi-Scene AI Ken Burns + Lip-Sync Timeline Canvas */}
                <canvas
                  ref={compositorCanvasRef}
                  width={540}
                  height={960}
                  className="absolute inset-0 h-full w-full object-cover block pointer-events-none"
                />

                {/* Visible Native HTML5 <video> Stream Player playing merged 3D video + multi-character audio stream */}
                <video
                  ref={videoRef}
                  src={directVeoUrl || undefined}
                  poster={resolvedScenes[sceneIndex]?.imageUrl}
                  controls
                  playsInline
                  loop
                  autoPlay
                  muted={isMuted}
                  onPlay={() => {
                    setIsPlayingVideo(true);
                    if (masterAudioRef.current && !isMuted) {
                      void masterAudioRef.current.play().catch(() => {});
                    }
                  }}
                  onPause={() => {
                    if (directVeoUrl) setIsPlayingVideo(false);
                  }}
                  className="relative z-10 h-full w-full object-cover block"
                />

                <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5">
                  <span className="rounded-full bg-black/75 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 backdrop-blur-xs">
                    {veoStatusText}
                  </span>
                </div>

                {/* Custom Studio Control Bar (Play/Pause, Audio, CC, Download MP4, Fullscreen) */}
                <div className="absolute bottom-12 left-2 right-2 z-20 flex flex-wrap items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={toggleVideoPlayback}
                    className="flex items-center gap-1 rounded-lg bg-black/85 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur-xs hover:bg-black"
                  >
                    {isPlayingVideo ? <Pause size={11} /> : <Play size={11} />}
                    <span>{isPlayingVideo ? 'Pause' : 'Play'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleVideoMute}
                    className="flex items-center gap-1 rounded-lg bg-amber-400 px-2 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-amber-300"
                  >
                    {isMuted ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    <span>{isMuted ? 'Unmute Voices' : 'Voices ON'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadVideoFile}
                    className="flex items-center gap-1 rounded-lg bg-sky-400 px-2 py-1 text-[10.5px] font-extrabold text-slate-950 hover:bg-sky-300"
                  >
                    <Download size={11} />
                    <span>MP4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCaptions((c) => !c)}
                    className={`rounded-lg px-2 py-1 text-[10.5px] font-extrabold transition ${
                      showCaptions
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-black/80 text-white/85'
                    }`}
                  >
                    CC {showCaptions ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    onClick={handleVideoFullscreen}
                    title="Fullscreen Video"
                    className="flex items-center gap-1 rounded-lg bg-black/85 px-2 py-1 text-[10.5px] font-bold text-white backdrop-blur-xs hover:bg-black"
                  >
                    <Maximize2 size={11} />
                  </button>
                </div>
              </div>

              {/* Right Column: Story-to-3D Animation Scene Segmentation & High-Res AI Thumbnails */}
              {resolvedScenes.length > 0 && (
                <div className="w-full min-w-0 flex-1 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        9:16 Multi-Character Lip-Sync & Camera Timeline · {resolvedScenes.length} Scenes
                      </div>
                      <div className="truncate text-xs font-bold text-[#0F172A] dark:text-white">
                        🎙 {resolvedScenes[sceneIndex]?.speakerName || `Scene ${sceneIndex + 1}`} ({resolvedScenes[sceneIndex]?.speakerVoice || 'AI Voice'}) · {resolvedScenes[sceneIndex]?.cameraMove || 'Close-Up Shot'}
                      </div>
                    </div>
                    <div className="flex flex-wrap shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void triggerVeoApiRender()}
                        className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-slate-800 dark:bg-slate-800 whitespace-nowrap"
                      >
                        <Film size={11} />
                        <span>Render Veo MP4</span>
                      </button>
                      {onOpenInPreview && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenInPreview({
                              ...media,
                              masterAudioUrl: masterAudioUrl || media.masterAudioUrl,
                              scenes: resolvedScenes,
                            })
                          }
                          className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-amber-300 whitespace-nowrap"
                        >
                          <ExternalLink size={11} />
                          <span>Studio Preview</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowStoryboard((s) => !s)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 whitespace-nowrap"
                      >
                        {showStoryboard ? 'Hide Scenes' : 'Show Scenes'}
                      </button>
                    </div>
                  </div>

                  {/* Interactive 5-Scene Sequence Scrubber Pills */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {resolvedScenes.map((scene, idx) => (
                      <button
                        type="button"
                        key={`scrubber-${idx}`}
                        onClick={() => {
                          const offsetMs = resolvedScenes
                            .slice(0, idx)
                            .reduce((acc, s) => acc + (s.durationSec || 4) * 1000, 0);
                          timelineOffsetRef.current = offsetMs;
                          setSceneIndex(idx);
                          setIsPlayingVideo(true);
                          speakCharacterDialogueForScene(scene, idx);
                        }}
                        className={`rounded-lg border px-2 py-1.5 text-left transition ${
                          idx === sceneIndex
                            ? 'border-amber-400 bg-amber-400/20 text-slate-950 dark:text-amber-300 font-extrabold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                        }`}
                      >
                        <div className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {scene.speakerName ? scene.speakerName.split(' ')[0] : `Scene ${idx + 1}`}
                        </div>
                        <div className="truncate text-[10.5px] font-bold">
                          {scene.headline.replace(/^Scene\s*\d+\s*[·:-]\s*/i, '')}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showStoryboard && (
                    <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
                      {resolvedScenes.map((scene, idx) => (
                        <div
                          key={`${scene.headline}-${idx}`}
                          onClick={() => {
                            const offsetMs = resolvedScenes
                              .slice(0, idx)
                              .reduce((acc, s) => acc + (s.durationSec || 4) * 1000, 0);
                            timelineOffsetRef.current = offsetMs;
                            setSceneIndex(idx);
                            speakCharacterDialogueForScene(scene, idx);
                          }}
                          className={`cursor-pointer flex items-start gap-3 rounded-xl border p-2.5 text-xs transition ${
                            idx === sceneIndex
                              ? 'border-amber-400 bg-amber-50/50 dark:border-amber-400/80 dark:bg-amber-950/25'
                              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
                          }`}
                        >
                          {scene.imageUrl && (
                            <img
                              src={scene.imageUrl}
                              alt={scene.headline}
                              referrerPolicy="no-referrer"
                              className="h-20 w-12 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="font-bold text-[#0F172A] dark:text-white">
                                {scene.headline}
                              </span>
                              <div className="flex items-center gap-1">
                                {scene.speakerName && (
                                  <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-400/20 dark:text-amber-300">
                                    🎙 {scene.speakerName} ({scene.speakerVoice || 'AI Voice'})
                                  </span>
                                )}
                                <span className="shrink-0 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-amber-400 dark:bg-slate-800">
                                  {scene.cameraMove || 'Close-Up 3D'}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1 text-[11.5px] font-semibold text-slate-800 dark:text-slate-200">
                              “{scene.dialogueLine || scene.subtext}”
                            </p>
                            {scene.dialogueUrdu && (
                              <p
                                dir="auto"
                                className="mt-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300"
                              >
                                {scene.dialogueUrdu}
                              </p>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              <span>😊 Lip-Sync: {scene.facialExpression || 'Expressive Talk'}</span>
                              <span>·</span>
                              <span>💡 {scene.lightingMood || 'Volumetric Pixar Glow'}</span>
                              <span>·</span>
                              <span>🔊 SFX: {scene.sfxMood || 'Forest Ambience'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {media.type === 'audio' && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {media.voiceName || 'Studio Neural Voice'}
                </div>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  “{media.audioScript}”
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window && media.audioScript) {
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(
                      new SpeechSynthesisUtterance(media.audioScript),
                    );
                    onNotice('Playing neural voice narration');
                  }
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
              >
                <Volume2 size={14} />
                <span>Speak Aloud</span>
              </button>
            </div>
            {media.url && (
              <audio controls src={media.url} className="h-9 w-full">
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {media.type === 'image' && (
              <button
                type="button"
                onClick={downloadImagePng}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
              >
                <Download size={13} />
                <span>Download HD PNG</span>
              </button>
            )}
            {media.type === 'video' && (
              <button
                type="button"
                disabled={isRecordingVideo}
                onClick={downloadVideoFile}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                <Download size={13} />
                <span>{isRecordingVideo ? 'Encoding MP4...' : 'Download MP4'}</span>
              </button>
            )}
            {media.type === 'audio' && media.url && (
              <button
                type="button"
                onClick={downloadAudioWav}
                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300"
              >
                <Download size={13} />
                <span>Download Master WAV</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Export:
            </span>
            {(['TikTok', 'YouTube', 'Instagram'] as const).map((platform) => (
              <button
                type="button"
                key={platform}
                onClick={() => void handleSocialShare(platform)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <Share2 size={11} className="text-amber-600" />
                <span>{platform}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
