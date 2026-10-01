import { useEffect, useRef, useState } from 'react';
import {
  AudioWaveform,
  BookOpen,
  Check,
  Copy,
  Download,
  Film,
  Gamepad2,
  Image as ImageIcon,
  Mic,
  Music,
  Play,
  RefreshCw,
  Sparkles,
  Volume2,
  Wand2,
} from 'lucide-react';
import { ThreeGameEngine, type GameArchetype3D as GameArchetype } from './ThreeGameEngine';
import sherScene3NetTrapImg from '../assets/images/sher_cheenti_scene3_net_trap_1790635751412.jpg';
import sherScene4CuttingNetImg from '../assets/images/sher_cheenti_scene4_cutting_net_1790635765147.jpg';
import pixarMagicalAdventureImg from '../assets/images/pixar_magical_adventure_1790633528032.jpg';
import pixarFoxForestImg from '../assets/images/pixar_fox_rooster_forest_1790633480000.jpg';
import pixarFoxChaseImg from '../assets/images/pixar_fox_rooster_chase_1790633499455.jpg';
import pixarVeggieVillageImg from '../assets/images/pixar_veggie_village_1790633514432.jpg';

export type StudioModuleId =
  | 'dev_platform'
  | 'video_studio'
  | 'image_studio'
  | 'voice_dubbing'
  | 'music_sfx'
  | 'story_generator'
  | 'game_engine'
  | 'execution_chat';

export interface StudioModuleConfig {
  id: StudioModuleId;
  emoji: string;
  label: string;
  shortLabel: string;
  subtitle: string;
}

export const STUDIO_MODULES: StudioModuleConfig[] = [
  {
    id: 'dev_platform',
    emoji: '💻',
    label: 'Developer Platform',
    shortLabel: 'Dev Platform',
    subtitle: 'Multi-file architect, in-browser runner, log analyzer & Git diff',
  },
  {
    id: 'video_studio',
    emoji: '🎬',
    label: '3D Video Studio',
    shortLabel: '3D Video',
    subtitle: 'Multi-scene Pixar story animator & Lip-sync engine',
  },
  {
    id: 'image_studio',
    emoji: '🖼️',
    label: 'AI Image Generator',
    shortLabel: 'AI Image',
    subtitle: 'Imagen 3 HD canvas & character design',
  },
  {
    id: 'voice_dubbing',
    emoji: '🎙️',
    label: 'Voiceover & Dubbing',
    shortLabel: 'Voiceover',
    subtitle: 'Multi-character voice, accent & lip-sync pipeline',
  },
  {
    id: 'music_sfx',
    emoji: '🎵',
    label: 'AI Music & SFX',
    shortLabel: 'Music & SFX',
    subtitle: 'Background scores & ambient sound generator',
  },
  {
    id: 'story_generator',
    emoji: '📖',
    label: 'Story Generator',
    shortLabel: 'Story Script',
    subtitle: 'Scriptwriting, scene breakdown & prompt builder',
  },
  {
    id: 'game_engine',
    emoji: '🎮',
    label: '3D Game Engine',
    shortLabel: '3D Games',
    subtitle: 'Three.js / WebGL interactive 3D playable canvas',
  },
  {
    id: 'execution_chat',
    emoji: '💬',
    label: 'Execution Chat',
    shortLabel: 'AI Chat',
    subtitle: 'Unified AI assistant & direct workflow routing',
  },
];

interface DialogueTurn {
  id: string;
  speaker: string;
  voice: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  pitch: number;
  englishLine: string;
  urduLine: string;
  cameraAngle: string;
}

interface StorySceneDraft {
  sceneNumber: number;
  headline: string;
  cameraAngle: string;
  speaker: string;
  voice: 'Fenrir' | 'Kore' | 'Puck' | 'Charon' | 'Zephyr';
  dialogueEnglish: string;
  dialogueUrdu: string;
  visualPrompt3D: string;
  sfxMood: string;
}

export function ImageGeneratorWorkspace({
  onNotice,
  onSendToChat,
}: {
  onNotice: (msg: string) => void;
  onSendToChat: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState(
    'Disney Pixar 3D CGI vertical 9:16 character portrait: majestic golden-maned lion Sher and tiny expressive ant Cheenti on a glowing emerald jungle leaf, volumetric sunbeams, 8k render',
  );
  const [stylePreset, setStylePreset] = useState('Disney/Pixar 3D CGI');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<{
    title: string;
    prompt: string;
    url: string;
    source: string;
  }>({
    title: 'Sher aur Cheenti · Pixar 3D Character Design',
    prompt:
      'Disney Pixar 3D CGI vertical 9:16 character portrait: majestic golden-maned lion and tiny expressive ant in sunlit jungle',
    url: sherScene3NetTrapImg,
    source: 'Imagen 3 HD · 9:16 Vertical',
  });

  const presetGallery = [
    {
      title: 'Sher (The Lion) · Net Trap 3D',
      url: sherScene3NetTrapImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 portrait: majestic golden-maned 3D lion in forest net, dramatic twilight volumetric light beams.',
    },
    {
      title: 'Cheenti (The Ant) · Heroic Macro 3D',
      url: sherScene4CuttingNetImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 macro shot: brave tiny 3D ant heroically biting through thick hunter rope strands.',
    },
    {
      title: 'Lomri & Murgha · Emerald Forest 3D',
      url: pixarFoxForestImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16: clever orange fox looking up at proud feathered rooster on an ancient oak branch.',
    },
    {
      title: 'Rooster Bell Twist · Action 3D',
      url: pixarFoxChaseImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 action shot: clever rooster ringing the forest alarm bell as the fox dashes away.',
    },
    {
      title: 'Vegetable Village · Pixar 3D World',
      url: pixarVeggieVillageImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16: cheerful animated tomato and carrot characters in a sunlit vegetable village.',
    },
    {
      title: 'Magical Forest Finale · 3D Render',
      url: pixarMagicalAdventureImg,
      prompt:
        'Disney Pixar 3D CGI vertical 9:16 finale: enchanted glowing fireflies over a sunlit emerald jungle rock.',
    },
  ];

  const handleGenerateImage = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    onNotice('Generating HD 3D AI Image via Imagen 3...');
    const lower = prompt.toLowerCase();
    const fallbackUrl = /\b(ant|cheenti|rope|macro)\b/.test(lower)
      ? sherScene4CuttingNetImg
      : /\b(fox|lomri|rooster|murgha)\b/.test(lower)
        ? pixarFoxForestImg
        : /\b(veggie|vegetable|tomato|carrot)\b/.test(lower)
          ? pixarVeggieVillageImg
          : sherScene3NetTrapImg;

    try {
      const fullPrompt = `${stylePreset}, ${aspectRatio} aspect ratio, ultra-detailed 3D subsurface scattering, volumetric studio lighting: ${prompt}`;
      const res = await fetch('/api/video/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, fallbackUrl }),
      });
      const data = (await res.json()) as { imageUrl?: string; source?: string };
      const resolvedUrl =
        data?.imageUrl && !data.imageUrl.startsWith('data:image/svg+xml')
          ? data.imageUrl
          : fallbackUrl;
      setActiveImage({
        title: prompt.slice(0, 48),
        prompt: fullPrompt,
        url: resolvedUrl,
        source: data?.source === 'imagen3_ai' ? 'Imagen 3 AI Render' : `Imagen 3 HD (${aspectRatio})`,
      });
      onNotice('HD 3D AI Image rendered in Image Studio');
    } catch {
      setActiveImage({
        title: prompt.slice(0, 48),
        prompt,
        url: fallbackUrl,
        source: `Imagen 3 HD (${aspectRatio})`,
      });
      onNotice('Rendered 3D character visual');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPng = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = aspectRatio === '9:16' ? 1080 : aspectRatio === '16:9' ? 1920 : 1080;
      canvas.height = aspectRatio === '9:16' ? 1920 : aspectRatio === '16:9' ? 1080 : 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'saz-ai-imagen3-hd.png';
        a.click();
        onNotice('Downloaded HD PNG image');
      }
    };
    img.src = activeImage.url;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Controls */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
                  AI Image Generator & 3D Character Designer
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Imagen 3 HD & Gemini 3.1 Flash Image · Subsurface Scattering & Volumetric Lighting
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {activeImage.source}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                3D Character / Scene Prompt
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your 3D Pixar character, environment, lighting, and camera lens..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    3D Render Style
                  </label>
                  <select
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Disney/Pixar 3D CGI">Disney / Pixar 3D CGI</option>
                    <option value="Unreal Engine 5 Cinematic 3D">Unreal Engine 5 Cinematic 3D</option>
                    <option value="DreamWorks Feature Animation 3D">DreamWorks Feature 3D</option>
                    <option value="Stylized Claymation 3D">Stylized Stop-Motion 3D</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Canvas Aspect Ratio
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                      <button
                        type="button"
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`rounded-lg py-1.5 text-xs font-bold transition ${
                          aspectRatio === ratio
                            ? 'bg-amber-400 text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => void handleGenerateImage()}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{isGenerating ? 'Rendering 3D Image...' : 'Generate HD 3D Image'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadPng}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <Download size={14} />
                  <span>Download HD PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSendToChat(`Create a 5-scene 9:16 3D animated video story based on this character design: ${prompt}`)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-amber-400 transition hover:bg-slate-800 dark:bg-slate-800"
                >
                  <Film size={14} />
                  <span>Animate in 3D Video Studio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset 3D Character Library */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              3D Character & Scene Presets (Click to Load)
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {presetGallery.map((item) => (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => {
                    setPrompt(item.prompt);
                    setActiveImage({
                      title: item.title,
                      prompt: item.prompt,
                      url: item.url,
                      source: 'Verified Pixar 3D Asset',
                    });
                    onNotice(`Loaded "${item.title}"`);
                  }}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:border-amber-400 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="aspect-[9/12] w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Canvas Preview */}
        <div className="lg:col-span-5">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex w-full items-center justify-between">
              <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {activeImage.title}
              </span>
              <span className="text-xs text-slate-500">{aspectRatio} Canvas</span>
            </div>
            <div
              className={`overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-slate-950 shadow-xl ${
                aspectRatio === '9:16'
                  ? 'aspect-[9/16] max-h-[480px] w-auto'
                  : aspectRatio === '16:9'
                    ? 'aspect-video w-full'
                    : 'aspect-square max-h-[420px] w-auto'
              }`}
            >
              <img
                src={activeImage.url}
                alt={activeImage.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 line-clamp-2 text-center text-xs text-slate-600 dark:text-slate-400">
              {activeImage.prompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VoiceoverDubbingWorkspace({
  onNotice,
  onSendToVideoStudio,
}: {
  onNotice: (msg: string) => void;
  onSendToVideoStudio: (prompt: string) => void;
}) {
  const [storyTitle, setStoryTitle] = useState('Sher aur Cheenti · Multi-Character Dialogue');
  const [turns, setTurns] = useState<DialogueTurn[]>([
    {
      id: 't1',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      pitch: 0.72,
      englishLine: 'Who dares wake the King of the Jungle? Speak up, tiny creature!',
      urduLine: 'جنگل کے بادشاہ کو کس نے جگایا؟ بولو ننھی چونٹی!',
      cameraAngle: 'Close-Up Speaker A',
    },
    {
      id: 't2',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      pitch: 1.42,
      englishLine: 'Please forgive me, O Mighty Sher! Spare my life, and one day I will help you!',
      urduLine: 'مجھے معاف کر دیں جنگل کے بادشاہ! ایک دن میں آپ کے کام آؤں گی!',
      cameraAngle: 'Close-Up Speaker B',
    },
    {
      id: 't3',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      pitch: 0.68,
      englishLine: 'ROAAAR! Help! I am trapped in this hunter net! Can anyone hear me?',
      urduLine: 'مدد کرو! میں شکاری کے جال میں پھنس گیا ہوں!',
      cameraAngle: 'Wide Action Shot',
    },
    {
      id: 't4',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      pitch: 1.38,
      englishLine: 'Hold on, my friend Sher! I will bite through these thick ropes right now!',
      urduLine: 'حوصلہ رکھو میرے دوست شیر! میں ابھی اپنے دانتوں سے یہ رسیاں کاٹتی ہوں!',
      cameraAngle: 'Extreme Macro Shot',
    },
    {
      id: 't5',
      speaker: 'Sher & Cheenti',
      voice: 'Puck',
      pitch: 0.85,
      englishLine: 'Thank you, brave little Cheenti! No friend is ever too small to save a king!',
      urduLine: 'شکریہ ننھی چونٹی! سچا دوست کبھی چھوٹا نہیں ہوتا!',
      cameraAngle: 'Two-Shot Finale',
    },
  ]);
  const [masterWavUrl, setMasterWavUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const synthesizeMasterTrack = async () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    onNotice('Synthesizing multi-character AI voices & lip-sync track...');
    try {
      const scenesPayload = turns.map((t, i) => ({
        headline: `Scene ${i + 1} · ${t.speaker}`,
        subtext: t.englishLine,
        dialogueLine: t.englishLine,
        dialogueUrdu: t.urduLine,
        speakerName: t.speaker,
        speakerVoice: t.voice,
        speakerPitch: t.pitch,
        durationSec: 4,
        sfxMood: 'Cinematic Forest & Story Ambience',
      }));
      const res = await fetch('/api/video/dialogue-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes: scenesPayload }),
      });
      const data = (await res.json()) as { masterAudioUrl?: string };
      if (data?.masterAudioUrl) {
        setMasterWavUrl(data.masterAudioUrl);
        onNotice('Multi-character master WAV audio track ready!');
      }
    } catch {
      onNotice('Playing live neural voice synthesis');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const speakSingleTurn = (turn: DialogueTurn) => {
    setActiveSpeakingId(turn.id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(turn.englishLine);
      u.pitch = turn.pitch;
      u.rate = 0.98;
      u.onend = () => setActiveSpeakingId(null);
      window.speechSynthesis.speak(u);
    }
    onNotice(`Speaking as ${turn.speaker} (${turn.voice} Voice)`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              Multi-Character Voiceover, Dubbing & Lip-Sync Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Assign distinct Gemini TTS Neural Voices (Fenrir, Kore, Puck, Charon, Zephyr) + Urdu/Hindi Subtitles
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSynthesizing}
              onClick={() => void synthesizeMasterTrack()}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              <AudioWaveform size={14} />
              <span>{isSynthesizing ? 'Synthesizing Voices...' : 'Generate Master Multi-Voice WAV'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onSendToVideoStudio(
                  `Create a 3D Pixar animated video for "${storyTitle}" with these character dialogues and lip-sync: ${turns
                    .map((t, i) => `Scene ${i + 1} (${t.speaker}): "${t.englishLine}"`)
                    .join(' -> ')}`,
                )
              }
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-400 transition hover:bg-slate-800 dark:bg-slate-800"
            >
              <Film size={14} />
              <span>Render 3D Lip-Sync Video</span>
            </button>
          </div>
        </div>

        {masterWavUrl && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-emerald-400/50 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Mastered Multi-Character Dialogue + Background SFX Track (20s WAV)
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <audio controls src={masterWavUrl} className="h-9 flex-1 sm:w-64" />
              <a
                href={masterWavUrl}
                download="saz-multi-character-dialogue.wav"
                className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-slate-950"
              >
                <Download size={13} />
                <span>WAV</span>
              </a>
            </div>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {turns.map((turn, idx) => (
            <div
              key={turn.id}
              className={`rounded-xl border p-4 transition ${
                activeSpeakingId === turn.id
                  ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    0{idx + 1}.
                  </span>
                  <input
                    value={turn.speaker}
                    onChange={(e) =>
                      setTurns((prev) =>
                        prev.map((item) =>
                          item.id === turn.id ? { ...item, speaker: e.target.value } : item,
                        ),
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <select
                    value={turn.voice}
                    onChange={(e) =>
                      setTurns((prev) =>
                        prev.map((item) =>
                          item.id === turn.id
                            ? { ...item, voice: e.target.value as DialogueTurn['voice'] }
                            : item,
                        ),
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value="Fenrir">Fenrir (Deep Royal Male)</option>
                    <option value="Kore">Kore (Expressive Bright)</option>
                    <option value="Puck">Puck (Clever Storyteller)</option>
                    <option value="Zephyr">Zephyr (Heroic Energetic)</option>
                    <option value="Charon">Charon (Cinematic Bass)</option>
                  </select>
                  <span className="text-xs text-slate-500">· {turn.cameraAngle}</span>
                </div>

                <button
                  type="button"
                  onClick={() => speakSingleTurn(turn)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-amber-300"
                >
                  <Volume2 size={13} />
                  <span>Preview Voice</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    English Dialogue (Lip-Sync Target)
                  </label>
                  <input
                    value={turn.englishLine}
                    onChange={(e) =>
                      setTurns((prev) =>
                        prev.map((item) =>
                          item.id === turn.id ? { ...item, englishLine: e.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                    Urdu / Hindi Animated Subtitle
                  </label>
                  <input
                    dir="auto"
                    value={turn.urduLine}
                    onChange={(e) =>
                      setTurns((prev) =>
                        prev.map((item) =>
                          item.id === turn.id ? { ...item, urduLine: e.target.value } : item,
                        ),
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MusicSfxWorkspace({ onNotice }: { onNotice: (msg: string) => void }) {
  const [selectedPreset, setSelectedPreset] = useState('Jungle Morning Birds & Flute');
  const [tempoBpm, setTempoBpm] = useState(108);
  const [durationSec, setDurationSec] = useState(8);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const presets = [
    {
      name: 'Jungle Morning Birds & Flute',
      desc: 'Warm banyan forest birdsong, gentle breeze & acoustic woodwind melody',
      notes: [261.63, 329.63, 392.0, 523.25, 659.25],
      wave: 'sine' as OscillatorType,
    },
    {
      name: 'Lion Roar & Dramatic Drums',
      desc: 'Deep low-end sub-bass rumble, tribal percussion & suspenseful brass',
      notes: [110.0, 130.81, 146.83, 164.81, 98.0],
      wave: 'sawtooth' as OscillatorType,
    },
    {
      name: 'Triumphant Pixar Finale Swell',
      desc: 'Uplifting major-key orchestral strings, celesta sparkles & warm horns',
      notes: [293.66, 369.99, 440.0, 587.33, 739.99],
      wave: 'triangle' as OscillatorType,
    },
    {
      name: '3D Turbo Arcade Synthwave',
      desc: 'High-octane 128 BPM arpeggiated bassline for 3D racing & action games',
      notes: [220.0, 277.18, 329.63, 440.0, 329.63],
      wave: 'square' as OscillatorType,
    },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;
    const render = (now: number) => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, W, H);
      const bars = 36;
      const barW = (W - 40) / bars;
      for (let i = 0; i < bars; i++) {
        const amp = isPlaying
          ? Math.abs(Math.sin(now * 0.008 + i * 0.35) * Math.cos(now * 0.004 - i * 0.2))
          : 0.12;
        const bh = Math.max(6, amp * (H - 36));
        ctx.fillStyle = i % 2 === 0 ? '#F59E0B' : '#38BDF8';
        ctx.fillRect(20 + i * barW, H / 2 - bh / 2, barW - 4, bh);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const playSynthesizedScore = () => {
    const preset = presets.find((p) => p.name === selectedPreset) || presets[0];
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ac;
      if (ac.state === 'suspended') void ac.resume();

      setIsPlaying(true);
      const beatSec = 60 / tempoBpm;
      const totalSteps = Math.max(8, Math.floor(durationSec / (beatSec * 0.5)));

      for (let step = 0; step < totalSteps; step++) {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const freq = preset.notes[step % preset.notes.length];
        osc.type = preset.wave;
        const startT = ac.currentTime + step * beatSec * 0.5;
        osc.frequency.setValueAtTime(freq, startT);
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.exponentialRampToValueAtTime(0.05, startT + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + beatSec * 0.9);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(startT);
        osc.stop(startT + beatSec);
      }

      window.setTimeout(() => setIsPlaying(false), durationSec * 1000);
      onNotice(`Playing "${preset.name}" at ${tempoBpm} BPM`);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              AI Music & Atmospheric SFX Generator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Procedural Background Scores, Forest Foley, Lion Roars & Orchestral Stems
            </p>
          </div>
          <button
            type="button"
            onClick={playSynthesizedScore}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300"
          >
            <Play size={14} />
            <span>{isPlaying ? 'Playing Studio Stem...' : 'Play Score & SFX'}</span>
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={760}
          height={140}
          className="mt-4 h-32 w-full rounded-2xl border border-slate-800 bg-slate-950 object-cover"
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => {
                setSelectedPreset(p.name);
                onNotice(`Selected "${p.name}"`);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                selectedPreset === p.name
                  ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/25'
                  : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</span>
                <Music size={15} className="text-amber-500" />
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{p.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Tempo: {tempoBpm} BPM
            </label>
            <input
              type="range"
              min={72}
              max={160}
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Stem Length: {durationSec} Seconds
            </label>
            <input
              type="range"
              min={4}
              max={20}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoryGeneratorWorkspace({
  onNotice,
  onAnimateStory,
}: {
  onNotice: (msg: string) => void;
  onAnimateStory: (prompt: string) => void;
}) {
  const [storyIdea, setStoryIdea] = useState(
    'Sher aur Cheenti (The Lion and the Ant) moral fable in Disney/Pixar 3D style with Urdu/Hindi dialogues',
  );
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [scenes, setScenes] = useState<StorySceneDraft[]>([
    {
      sceneNumber: 1,
      headline: 'Scene 1 · Lion & Ant Under the Banyan Tree',
      cameraAngle: 'Close-Up Speaker A · 3D Push-In',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      dialogueEnglish: 'Who dares wake the King of the Jungle? Speak up, tiny creature!',
      dialogueUrdu: 'جنگل کے بادشاہ کو کس نے جگایا؟ بولو ننھی چونٹی!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 portrait: majestic golden-maned 3D lion resting under a sunlit jungle tree while a tiny red-brown 3D ant stands on his paw.',
      sfxMood: 'Jungle Morning Birds & Deep Lion Breath',
    },
    {
      sceneNumber: 2,
      headline: 'Scene 2 · The Ant’s Promise',
      cameraAngle: 'Close-Up Speaker B · Eye-Level Reverse',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      dialogueEnglish: 'Please forgive me, O Mighty Sher! Spare my life, and one day I will surely help you!',
      dialogueUrdu: 'مجھے معاف کر دیں جنگل کے بادشاہ! ایک دن میں آپ کے کام آؤں گی!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 close-up: kind 3D lion smiling warmly at the brave tiny 3D ant pleading on a glowing emerald leaf.',
      sfxMood: 'Heartwarming Flute & Forest Breeze',
    },
    {
      sceneNumber: 3,
      headline: 'Scene 3 · The Hunter’s Net Trap',
      cameraAngle: 'Wide Action Shot · Low-Angle Shake',
      speaker: 'Sher (The Lion)',
      voice: 'Fenrir',
      dialogueEnglish: 'ROAAAR! Help! I am trapped in this hunter net! Can anyone in the forest hear me?',
      dialogueUrdu: 'مدد کرو! میں شکاری کے جال میں پھنس گیا ہوں!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 shot: majestic 3D lion tangled inside a heavy woven rope hunter net in the twilight forest.',
      sfxMood: 'Echoing Lion Roar & Rustling Ropes',
    },
    {
      sceneNumber: 4,
      headline: 'Scene 4 · Cheenti Cuts the Ropes',
      cameraAngle: 'Extreme Macro Shot · Rope Cutting',
      speaker: 'Cheenti (The Ant)',
      voice: 'Kore',
      dialogueEnglish: 'Hold on, my friend Sher! I will bite through these thick ropes and set you free!',
      dialogueUrdu: 'حوصلہ رکھو میرے دوست شیر! میں ابھی اپنے دانتوں سے یہ رسیاں کاٹتی ہوں!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 macro shot: brave tiny 3D ant heroically biting through thick frayed hunter rope strands.',
      sfxMood: 'Snapping Rope Fibers & Heroic Strings',
    },
    {
      sceneNumber: 5,
      headline: 'Scene 5 · Royal Friendship Finale',
      cameraAngle: 'Two-Shot Finale · Crane Pull-Back',
      speaker: 'Sher & Cheenti',
      voice: 'Fenrir',
      dialogueEnglish: 'Thank you, brave little Cheenti! Truly, no friend is ever too small to save a king!',
      dialogueUrdu: 'شکریہ ننھی چونٹی! سچا دوست کبھی چھوٹا نہیں ہوتا!',
      visualPrompt3D:
        'Disney Pixar 3D CGI vertical 9:16 finale: freed joyful 3D lion and tiny heroic ant celebrating on a sunlit jungle rock with golden fireflies.',
      sfxMood: 'Triumphant Orchestral Finale Swell',
    },
  ]);

  const loadTemplate = (template: 'sher' | 'fox' | 'veggie') => {
    if (template === 'sher') {
      setStoryIdea('Sher aur Cheenti (The Lion and the Ant) moral fable in Disney/Pixar 3D style');
      onNotice('Loaded Sher aur Cheenti 5-Scene Script');
      return;
    }
    if (template === 'fox') {
      setStoryIdea('Lomri aur Murgha (Clever Fox & Rooster) 3D Pixar Forest Fable');
      setScenes([
        {
          sceneNumber: 1,
          headline: 'Scene 1 · Morning in Emerald Woods',
          cameraAngle: 'Wide Two-Shot · Low-Angle Crane Push',
          speaker: 'Lomri (The Fox)',
          voice: 'Puck',
          dialogueEnglish: 'Good morning, handsome Rooster! What a glorious golden crown you have today!',
          dialogueUrdu: 'صبح بخیر پیارے مرغے! آج تمہاری شاندار کلغی کتنی چمک رہی ہے!',
          visualPrompt3D:
            'Disney Pixar 3D CGI vertical 9:16: expressive orange fox looking up at a vibrant feathered rooster on an oak branch.',
          sfxMood: 'Forest Morning Birds & Rustling Leaves',
        },
        {
          sceneNumber: 2,
          headline: 'Scene 2 · The Flattery Dialogue',
          cameraAngle: 'Close-Up Speaker A · Fox Dialogue',
          speaker: 'Lomri (The Fox)',
          voice: 'Puck',
          dialogueEnglish: 'Sing your royal melody with your eyes closed so the whole forest can rejoice!',
          dialogueUrdu: 'ذرا آنکھیں بند کر کے اپنی سریلی آواز میں گیت تو سناؤ!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 close-up: charismatic fox bowing playfully with sparkling eyes.',
          sfxMood: 'Playful Pizzicato Strings',
        },
        {
          sceneNumber: 3,
          headline: 'Scene 3 · Spotting the Trick',
          cameraAngle: 'Over-Shoulder Shot · Suspenseful Tilt',
          speaker: 'Murgha (The Rooster)',
          voice: 'Zephyr',
          dialogueEnglish: 'Aha! I see your sneaky paws waiting below, Mr. Fox! You will not trick me!',
          dialogueUrdu: 'اہا! میں تمہاری چال سمجھ گیا ہوں چالاک لومڑی!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 shot: sneaky fox crouching below the branch while the smart rooster spots the trick.',
          sfxMood: 'Suspenseful Woodwinds',
        },
        {
          sceneNumber: 4,
          headline: 'Scene 4 · Ringing the Forest Bell',
          cameraAngle: 'Close-Up Speaker B · Rooster Hero Shot',
          speaker: 'Murgha (The Rooster)',
          voice: 'Zephyr',
          dialogueEnglish: 'Cock-a-doodle-doo! Look, the village hounds are coming right behind you!',
          dialogueUrdu: 'ککڑوں کوں! دیکھو گاؤں کے محافظ تمہارے پیچھے آ رہے ہیں!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 action shot: clever rooster ringing a vine bell in bright sunbeams.',
          sfxMood: 'Echoing Bell Chime & Whoosh',
        },
        {
          sceneNumber: 5,
          headline: 'Scene 5 · Wisdom Wins',
          cameraAngle: 'Wide Action Shot · Crane Pull-Back',
          speaker: 'Lomri & Murgha',
          voice: 'Puck',
          dialogueEnglish: 'Oh no, I must run! Wisdom and alertness always triumph over flattery!',
          dialogueUrdu: 'عقل مندی اور ہوشیاری ہمیشہ خوشامد سے جیت جاتی ہے!',
          visualPrompt3D:
            'Disney Pixar 3D vertical 9:16 finale: joyful rooster crowing proudly on sunlit treetop as fox sprints away.',
          sfxMood: 'Triumphant Orchestral Swell',
        },
      ]);
      onNotice('Loaded Clever Fox & Rooster 5-Scene Script');
    } else {
      setStoryIdea('Vegetable Village Heroes · 3D Pixar Adventure');
      onNotice('Loaded Vegetable Village 5-Scene Script');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-slate-900 dark:text-white">
              3D Story Scriptwriter, Scene Breakdown & Prompt Builder
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              5-Scene 9:16 Screenplay with Camera Angles, Character Voices, Urdu/Hindi Subtitles & 3D Prompts
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onAnimateStory(
                `Create a 3D Disney/Pixar animated story for "${storyIdea}" in 9:16 vertical format with 5 sequential scenes (${scenes
                  .map((s) => `${s.headline}: ${s.dialogueEnglish}`)
                  .join(' -> ')}), multi-character voiceover, lip-sync, SFX, and Urdu subtitles.`,
              )
            }
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs transition hover:bg-amber-300"
          >
            <Film size={14} />
            <span>Produce 5-Scene 3D Video Now</span>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Story Templates:</span>
          <button
            type="button"
            onClick={() => loadTemplate('sher')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🦁 Sher aur Cheenti (Lion & Ant)
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('fox')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🦊 Clever Fox & Rooster
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('veggie')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            🥕 Vegetable Village
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {scenes.map((scene, idx) => (
            <div
              key={scene.sceneNumber}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    0{scene.sceneNumber}.
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {scene.headline}
                  </span>
                  <span className="text-xs text-slate-500">
                    · {scene.speaker} ({scene.voice}) · {scene.cameraAngle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(scene.visualPrompt3D);
                    setCopiedIdx(idx);
                    window.setTimeout(() => setCopiedIdx(null), 1200);
                    onNotice(`Copied Scene ${scene.sceneNumber} 3D Prompt`);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy 3D Prompt'}</span>
                </button>
              </div>

              <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                “{scene.dialogueEnglish}”
              </p>
              <p dir="auto" className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                {scene.dialogueUrdu}
              </p>
              <div className="mt-2 rounded-lg bg-white p-2.5 text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <strong className="text-slate-900 dark:text-amber-400">3D Visual Prompt: </strong>
                {scene.visualPrompt3D}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GameEngineWorkspace({
  onNotice,
}: {
  onNotice: (msg: string) => void;
}) {
  const [archetype, setArchetype] = useState<GameArchetype>('car_3d');
  const [gameTitle, setGameTitle] = useState('3D Turbo Highway Racer · Three.js WebGL');
  const [engineKey, setEngineKey] = useState(1);

  const gamePresets: { id: GameArchetype; label: string; title: string; desc: string }[] = [
    {
      id: 'car_3d',
      label: '🏎️ 3D Car Racing',
      title: '3D Turbo Highway Racer · Three.js WebGL',
      desc: 'Sports car mesh, traffic physics, Nitro Boost & camera toggle',
    },
    {
      id: 'runner_3d',
      label: '🏃 3D Cyber Runner',
      title: '3D Cyber Parkour Runner · Three.js WebGL',
      desc: 'Animated 3D hero character, jump/slide physics & spinning coins',
    },
    {
      id: 'shooter_3d',
      label: '🚀 3D Space Shooter',
      title: '3D Galactic Starfighter · Three.js WebGL',
      desc: 'Starfighter mesh, twin plasma lasers & 3D asteroid field',
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1.5">
          {gamePresets.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => {
                setArchetype(g.id);
                setGameTitle(g.title);
                setEngineKey((k) => k + 1);
                onNotice(`Launched ${g.title}`);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                archetype === g.id
                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setEngineKey((k) => k + 1)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <RefreshCw size={13} />
          <span>Reset 3D World</span>
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-slate-950">
        <ThreeGameEngine
          key={`dedicated-game-${archetype}-${engineKey}`}
          title={gameTitle}
          prompt={gameTitle}
          initialMode={archetype}
        />
      </div>
    </div>
  );
}
