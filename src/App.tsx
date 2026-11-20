import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ASSETS = {
  turntableVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261118_015024_006266ee-7f2e-429b-9805-fe43b2d834fe.mp4',
  keyedPoster:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261118_014952_332a14ea-9b7d-4045-9036-9368eaf90eac.png&w=1920&q=85',
  plinth:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261118_020140_5b58d755-d5de-46b6-b66e-ab16bb461339.png&w=1920&q=85',
  wordmark:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261118_020004_0521c50e-09ca-4e84-8d93-013a72b5adfc.png&w=2400&q=85',
  marquee:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261118_020003_c9e68f16-e6f2-43e8-9459-ba5d9291348d.png&w=2400&q=85',
  detail:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261118_014903_73b0f091-ad2d-4039-8a7a-03a8397b45d0.png&w=1600&q=85',
  bubbleVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261118_020140_80f218f8-3ea6-4407-b343-db2278462d30.mp4',
  logoVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261118_020140_b48373e7-a263-431a-b3ef-da6b564f4e03.mp4',
} as const;

const ANCHORS = [0, 0.45, 0.79, 1] as const;

type SceneIndex = 0 | 1 | 2 | 3;

interface LensOption {
  id: 'acid' | 'ice' | 'ember' | 'ultra';
  label: string;
  deg: number;
  swatch: string;
}

const LENSES: LensOption[] = [
  { id: 'acid', label: 'Acid', deg: 0, swatch: '#c6ff3d' },
  { id: 'ice', label: 'Ice', deg: 95, swatch: '#3dffb5' },
  { id: 'ember', label: 'Ember', deg: -62, swatch: '#ff8f3d' },
  { id: 'ultra', label: 'Ultra', deg: 175, swatch: '#a86bff' },
];

const FITS = ['Narrow', 'Regular', 'Wide'] as const;
type FitOption = (typeof FITS)[number];

interface CornerPair {
  leftMain: string;
  leftSub: string;
  rightMain: string;
  rightSub: string;
}

const CORNERS: Record<SceneIndex, CornerPair> = {
  0: {
    leftMain: 'bangers only',
    leftSub: "IT'S ALWAYS TIME TO ENJOY.",
    rightMain: 'inspired',
    rightSub: 'FROM 10:00 TO 19:00',
  },
  1: {
    leftMain: 'detail.{01}',
    leftSub: 'LOOK CLOSER. HOVER THE POINTS.',
    rightMain: 'built light',
    rightSub: '24 GRAMS OF CHROME',
  },
  2: {
    leftMain: 'quick facts',
    leftSub: 'THE NUMBERS THAT MATTER.',
    rightMain: 'tested',
    rightSub: '2,400 KM OF RIDES',
  },
  3: {
    leftMain: 'ready?',
    leftSub: 'DROP 01 · 500 PAIRS WORLDWIDE.',
    rightMain: 'ships',
    rightSub: 'JUNE 2026 FREE RETURNS',
  },
};

interface HotspotItem {
  id: string;
  title: string;
  body: string;
  x: number;
  y: number;
}

const HOTSPOTS: HotspotItem[] = [
  {
    id: 'lens',
    title: 'PHOTOCHROMIC LENS',
    body: 'Adaptive 14% to 68% VLT polycarbonate shield reacts in 0.8s with zero edge distortion.',
    x: 42,
    y: 45,
  },
  {
    id: 'frame',
    title: 'LIQUID-CHROME FRAME',
    body: '24-gram vapor-deposited PVD mirror chassis engineered with zero-hinge flex geometry.',
    x: 59,
    y: 35,
  },
  {
    id: 'temples',
    title: 'GRIP TEMPLES',
    body: 'Hydro-lock elastomer micro-ridges anchor securely through sweat and 70 km/h crosswinds.',
    x: 75,
    y: 52,
  },
];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function formatPragueClock(d: Date): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Prague',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

function formatFooterDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function App() {
  const isRecMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('rec');
  }, []);

  const [scene, setScene] = useState<SceneIndex>(0);
  const [displayedCornerScene, setDisplayedCornerScene] = useState<SceneIndex>(0);
  const [introReady, setIntroReady] = useState(false);
  const [isLockedUI, setIsLockedUI] = useState(true);
  const [hoveringGlasses, setHoveringGlasses] = useState(false);
  const [activeLens, setActiveLens] = useState<LensOption>(LENSES[0]);
  const [lensPopKey, setLensPopKey] = useState(0);
  const [activeFit, setActiveFit] = useState<FitOption>('Regular');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [lobeVisible, setLobeVisible] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pre-order modal state with circular reveal origin
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExpanded, setModalExpanded] = useState(false);
  const [modalClipOrigin, setModalClipOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Live Prague clock
  const [clockText, setClockText] = useState(() => formatPragueClock(new Date()));
  const footerDate = useMemo(() => formatFooterDate(new Date()), []);

  // Refs for DOM choreography & 60fps loop
  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Corner mask line refs
  const cornerLeftMainRef = useRef<HTMLSpanElement>(null);
  const cornerLeftSubRef = useRef<HTMLSpanElement>(null);
  const cornerRightMainRef = useRef<HTMLSpanElement>(null);
  const cornerRightSubRef = useRef<HTMLSpanElement>(null);
  const cornerSwapTimerRef = useRef<number | null>(null);

  // Hero refs
  const wordmarkWrapRef = useRef<HTMLDivElement>(null);
  const wordmarkTrackRef = useRef<HTMLDivElement>(null);
  const plinthWrapRef = useRef<HTMLDivElement>(null);
  const glassesWrapRef = useRef<HTMLDivElement>(null);
  const glassesCanvasRef = useRef<HTMLCanvasElement>(null);
  const turntableVideoRef = useRef<HTMLVideoElement>(null);
  const heroHintRef = useRef<HTMLDivElement>(null);

  // Detail refs
  const detailLayerRef = useRef<HTMLDivElement>(null);
  const detailImgWrapRef = useRef<HTMLDivElement>(null);
  const detailCopyRef = useRef<HTMLDivElement>(null);

  // Quick facts refs
  const factsLayerRef = useRef<HTMLDivElement>(null);
  const blobWrapRef = useRef<HTMLDivElement>(null);
  const bubbleVideoRef = useRef<HTMLVideoElement>(null);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  // Outro refs
  const outroLayerRef = useRef<HTMLDivElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const outroSliceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outroHeadlineRef = useRef<HTMLSpanElement>(null);
  const outroCtaRef = useRef<HTMLDivElement>(null);

  // Custom cursor refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPosRef = useRef({ x: -100, y: -100, tx: -100, ty: -100, hovering: false });

  // Scene & animation controller refs
  const pvRef = useRef(0);
  const currentSceneRef = useRef<SceneIndex>(0);
  const lockUntilRef = useRef(0);
  const tweenRef = useRef<{
    active: boolean;
    from: number;
    to: number;
    startTime: number;
    duration: number;
    targetScene: SceneIndex;
  }>({
    active: false,
    from: 0,
    to: 0,
    startTime: 0,
    duration: 1700,
    targetScene: 0,
  });
  const introStartRef = useRef<number>(0);
  const hoveringGlassesRef = useRef(false);
  const mouseRef = useRef({ sx: 0, sy: 0, tx: 0, ty: 0 });
  const marqueeOffsetRef = useRef({ wordmark: 0, facts: 0 });
  const wheelAccumRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const bubbleStartedRef = useRef(false);
  const bubbleStartClockRef = useRef(0);
  const outroPlayedForEnterRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const modalOpenRef = useRef(false);

  useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  useEffect(() => {
    hoveringGlassesRef.current = hoveringGlasses;
  }, [hoveringGlasses]);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2900);
  }, []);

  // Update CSS --hue token when lens changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.style.setProperty('--hue', `${activeLens.deg}deg`);
    }
  }, [activeLens]);

  // Live Prague clock
  useEffect(() => {
    const id = window.setInterval(() => {
      setClockText(formatPragueClock(new Date()));
    }, 10000);
    return () => window.clearInterval(id);
  }, []);

  // Trigger 12 black vertical slice bars collapsing from center on Scene 4 entry
  const triggerOutroSlices = useCallback(() => {
    const bars = outroSliceRefs.current;
    bars.forEach((bar, i) => {
      if (!bar) return;
      bar.getAnimations().forEach((a) => a.cancel());
      const distFromCenter = Math.abs(i - 5.5);
      bar.style.transform = 'scaleY(1)';
      bar.style.opacity = '1';
      bar.animate(
        [
          { transform: 'scaleY(1)', opacity: 1 },
          { transform: 'scaleY(0)', opacity: 1 },
        ],
        {
          duration: 760,
          delay: distFromCenter * 55 + 60,
          easing: 'cubic-bezier(0.77, 0, 0.18, 1)',
          fill: 'forwards',
        }
      );
    });

    const headlineEl = outroHeadlineRef.current;
    if (headlineEl) {
      headlineEl.getAnimations().forEach((a) => a.cancel());
      headlineEl.animate(
        [
          { transform: 'translateY(115%)', opacity: 0 },
          { transform: 'translateY(0%)', opacity: 1 },
        ],
        {
          duration: 850,
          delay: 420,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );
    }

    const ctaEl = outroCtaRef.current;
    if (ctaEl) {
      ctaEl.getAnimations().forEach((a) => a.cancel());
      ctaEl.animate(
        [
          { transform: 'translateY(32px)', opacity: 0 },
          { transform: 'translateY(0px)', opacity: 1 },
        ],
        {
          duration: 780,
          delay: 580,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );
    }

    const lv = logoVideoRef.current;
    if (lv && !isRecMode) {
      lv.play().catch(() => {});
    }
  }, [isRecMode]);

  // Swap corner captions with masked slide out/in and cancel running animations
  useEffect(() => {
    if (!introReady) return;
    if (scene === displayedCornerScene) return;

    if (cornerSwapTimerRef.current) {
      window.clearTimeout(cornerSwapTimerRef.current);
    }

    const els = [
      cornerLeftMainRef.current,
      cornerLeftSubRef.current,
      cornerRightMainRef.current,
      cornerRightSubRef.current,
    ];

    els.forEach((el, idx) => {
      if (!el) return;
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(
        [
          { transform: 'translateY(0%)', opacity: 1 },
          { transform: 'translateY(-115%)', opacity: 0 },
        ],
        {
          duration: 240,
          delay: idx % 2 === 1 ? 35 : 0,
          easing: 'cubic-bezier(0.77, 0, 0.18, 1)',
          fill: 'forwards',
        }
      );
    });

    cornerSwapTimerRef.current = window.setTimeout(() => {
      setDisplayedCornerScene(scene);
      requestAnimationFrame(() => {
        const nextEls = [
          cornerLeftMainRef.current,
          cornerLeftSubRef.current,
          cornerRightMainRef.current,
          cornerRightSubRef.current,
        ];
        nextEls.forEach((el, idx) => {
          if (!el) return;
          el.getAnimations().forEach((a) => a.cancel());
          el.animate(
            [
              { transform: 'translateY(115%)', opacity: 0 },
              { transform: 'translateY(0%)', opacity: 1 },
            ],
            {
              duration: 560,
              delay: idx % 2 === 1 ? 75 : 0,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'forwards',
            }
          );
        });
      });
    }, 245);

    return () => {
      if (cornerSwapTimerRef.current) window.clearTimeout(cornerSwapTimerRef.current);
    };
  }, [scene, displayedCornerScene, introReady]);

  // Scene navigation controller
  const goToScene = useCallback(
    (targetIdx: SceneIndex) => {
      const now = performance.now();
      if (now < lockUntilRef.current) return;
      if (targetIdx === currentSceneRef.current) return;
      if (modalOpenRef.current) return;

      const prevIdx = currentSceneRef.current;
      const jump = Math.abs(targetIdx - prevIdx);
      const duration = jump > 1 ? 2200 : 1700;

      currentSceneRef.current = targetIdx;
      setScene(targetIdx);
      setActiveHotspot(null);

      // Reset scene-specific entry flags
      if (targetIdx === 2) {
        bubbleStartedRef.current = false;
        setLobeVisible([false, false, false]);
      } else {
        bubbleStartedRef.current = false;
      }

      if (targetIdx === 3) {
        outroPlayedForEnterRef.current = false;
        if (outroHeadlineRef.current) {
          outroHeadlineRef.current.getAnimations().forEach((a) => a.cancel());
          outroHeadlineRef.current.style.opacity = '0';
          outroHeadlineRef.current.style.transform = 'translateY(115%)';
        }
        if (outroCtaRef.current) {
          outroCtaRef.current.getAnimations().forEach((a) => a.cancel());
          outroCtaRef.current.style.opacity = '0';
          outroCtaRef.current.style.transform = 'translateY(32px)';
        }
        outroSliceRefs.current.forEach((bar) => {
          if (!bar) return;
          bar.getAnimations().forEach((a) => a.cancel());
          bar.style.transform = 'scaleY(1)';
        });
      }

      const extraLock = targetIdx === 2 ? 5400 : 150;
      lockUntilRef.current = now + duration + extraLock;
      setIsLockedUI(true);

      tweenRef.current = {
        active: true,
        from: pvRef.current,
        to: ANCHORS[targetIdx],
        startTime: now,
        duration,
        targetScene: targetIdx,
      };
    },
    []
  );

  // Intro sequence on mount
  useEffect(() => {
    const now = performance.now();
    introStartRef.current = now;
    lockUntilRef.current = now + 1350;
    setIsLockedUI(true);

    if (headerRef.current) {
      headerRef.current.animate(
        [
          { transform: 'translateY(-100%)', opacity: 0 },
          { transform: 'translateY(0%)', opacity: 1 },
        ],
        { duration: 820, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
      );
    }

    if (footerRef.current) {
      footerRef.current.animate(
        [
          { transform: 'translateY(100%)', opacity: 0 },
          { transform: 'translateY(0%)', opacity: 1 },
        ],
        { duration: 820, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
      );
    }

    const cornerEls = [
      cornerLeftMainRef.current,
      cornerLeftSubRef.current,
      cornerRightMainRef.current,
      cornerRightSubRef.current,
    ];
    cornerEls.forEach((el, idx) => {
      if (!el) return;
      el.animate(
        [
          { transform: 'translateY(115%)', opacity: 0 },
          { transform: 'translateY(0%)', opacity: 1 },
        ],
        {
          duration: 720,
          delay: 680 + (idx % 2) * 85,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
        }
      );
    });

    const t = window.setTimeout(() => {
      setIntroReady(true);
      setIsLockedUI(false);
    }, 1350);

    return () => window.clearTimeout(t);
  }, []);

  // WebGL Magenta Chroma-Key setup for turntable video & poster
  useEffect(() => {
    const canvas = glassesCanvasRef.current;
    const video = turntableVideoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) return;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_tex;
      varying vec2 v_uv;
      void main() {
        vec4 c = texture2D(u_tex, v_uv);
        float d = min(c.r, c.b) - c.g;
        float a = 1. - smoothstep(.10, .36, d);
        float sp = max(0., min(c.r, c.b) - c.g);
        c.r -= sp * .92;
        c.b -= sp * .92;
        float edge = smoothstep(0.0, 0.03, v_uv.x)
                   * smoothstep(0.0, 0.03, 1.0 - v_uv.x)
                   * smoothstep(0.0, 0.03, v_uv.y)
                   * smoothstep(0.0, 0.03, 1.0 - v_uv.y);
        a *= edge;
        gl_FragColor = vec4(max(c.rgb, 0.0) * a, a);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      return sh;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const posterImg = new Image();
    posterImg.crossOrigin = 'anonymous';
    let posterReady = false;
    let videoPlayingFrame = false;

    posterImg.onload = () => {
      posterReady = true;
      if (posterImg.naturalWidth && posterImg.naturalHeight) {
        canvas.style.aspectRatio = `${posterImg.naturalWidth} / ${posterImg.naturalHeight}`;
      }
    };
    posterImg.src = ASSETS.keyedPoster;

    const onVideoPlaying = () => {
      videoPlayingFrame = true;
      if (video.videoWidth && video.videoHeight) {
        canvas.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    };
    const onVideoMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        canvas.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    };

    video.addEventListener('playing', onVideoPlaying);
    video.addEventListener('loadedmetadata', onVideoMeta);
    video.addEventListener('canplay', () => {
      if (!isRecMode) {
        video.play().catch(() => {});
      }
    });

    if (!isRecMode) {
      video.play().catch(() => {});
    }

    let rafId = 0;
    const renderGL = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(2, Math.round(canvas.clientWidth * dpr));
      const ch = Math.max(2, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        gl.viewport(0, 0, cw, ch);
      }

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const useVideo = (videoPlayingFrame || isRecMode) && video.readyState >= 2;
      if (useVideo) {
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } catch {
          // Wait for CORS/frame readiness
        }
      } else if (posterReady) {
        try {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posterImg);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } catch {
          // Wait for poster
        }
      }

      rafId = requestAnimationFrame(renderGL);
    };

    rafId = requestAnimationFrame(renderGL);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('playing', onVideoPlaying);
      video.removeEventListener('loadedmetadata', onVideoMeta);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [isRecMode]);

  // Main 60fps Choreography + Marquee + Video Sync + Cursor Loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Update PV tween
      const tw = tweenRef.current;
      let isMoving = false;
      if (tw.active) {
        const elapsed = now - tw.startTime;
        const t = clamp(elapsed / tw.duration, 0, 1);
        const eased = easeInOutCubic(t);
        pvRef.current = tw.from + (tw.to - tw.from) * eased;
        isMoving = true;
        if (t >= 1) {
          pvRef.current = tw.to;
          tw.active = false;
        }
      }

      // Sync UI lock indicator
      if (now >= lockUntilRef.current) {
        setIsLockedUI((prev) => (prev ? false : prev));
      }

      const pv = pvRef.current;

      // 2. Smooth mouse parallax
      mouseRef.current.sx += (mouseRef.current.tx - mouseRef.current.sx) * 0.085;
      mouseRef.current.sy += (mouseRef.current.ty - mouseRef.current.sy) * 0.085;
      const { sx, sy } = mouseRef.current;

      // 3. Smooth custom cursor
      if (cursorRef.current) {
        const cp = cursorPosRef.current;
        cp.x += (cp.tx - cp.x) * 0.22;
        cp.y += (cp.ty - cp.y) * 0.22;
        cursorRef.current.style.transform = `translate3d(${cp.x}px, ${cp.y}px, 0) translate(-50%, -50%)`;
      }

      // 4. Intro progress values
      const introElapsed = now - introStartRef.current;
      const wmIntroP = easeOutExpo(clamp((introElapsed - 150) / 900, 0, 1));
      const plinthIntroP = easeOutExpo(clamp((introElapsed - 240) / 920, 0, 1));
      const glassesIntroP = easeOutExpo(clamp((introElapsed - 400) / 1050, 0, 1));

      // 5. Scene transition segments
      // Scene 1 -> 2: PV in [0, 0.45]
      const p12 = clamp(pv / 0.45, 0, 1);
      // Scene 2 -> 3: PV in [0.45, 0.79]
      const p23 = clamp((pv - 0.45) / 0.34, 0, 1);
      // Scene 3 -> 4: PV in [0.79, 1.0]
      const p34 = clamp((pv - 0.79) / 0.21, 0, 1);

      // --- SCENE 1: HERO ---
      if (wordmarkWrapRef.current) {
        const exitLift = -20 * Math.pow(p12, 1.15);
        const exitClipTop = clamp(p12 * 1.45, 0, 1) * 100;
        const introCenterClip = (1 - wmIntroP) * 50;
        if (p12 > 0.002) {
          wordmarkWrapRef.current.style.clipPath = `inset(0% 0% ${exitClipTop}% 0%)`;
        } else {
          wordmarkWrapRef.current.style.clipPath = `inset(${introCenterClip}% 0% ${introCenterClip}% 0%)`;
        }
        wordmarkWrapRef.current.style.transform = `translate3d(${sx * -26}px, ${exitLift}vh, 0)`;
        wordmarkWrapRef.current.style.opacity = p12 >= 0.85 ? '0' : '1';
      }

      // Wordmark continuous scroll (faster during scene transitions)
      if (wordmarkTrackRef.current) {
        const speed = isMoving ? 240 : 52;
        const halfW = wordmarkTrackRef.current.scrollWidth / 2;
        if (halfW > 10) {
          marqueeOffsetRef.current.wordmark = (marqueeOffsetRef.current.wordmark + speed * dt) % halfW;
          wordmarkTrackRef.current.style.transform = `translate3d(${-marqueeOffsetRef.current.wordmark}px, 0, 0)`;
        }
      }

      if (plinthWrapRef.current) {
        const introY = (1 - plinthIntroP) * 40;
        const exitY = p12 * 55;
        plinthWrapRef.current.style.transform = `translate3d(-50%, ${introY + exitY}vh, 0)`;
        plinthWrapRef.current.style.opacity = p12 >= 0.92 ? '0' : '1';
      }

      if (glassesWrapRef.current) {
        const fallY = (1 - glassesIntroP) * -30;
        const fallScale = 0.6 + 0.4 * glassesIntroP;
        const fallRot = (1 - glassesIntroP) * -14;
        const fallBlur = (1 - glassesIntroP) * 20;

        const exitSlideX = p12 * 34;
        const exitScale = 1 + p12 * 0.28;
        const exitClipRight = clamp((p12 - 0.12) / 0.72, 0, 1) * 100;

        glassesWrapRef.current.style.transform = `translate3d(calc(-50% + ${sx * -26 + exitSlideX * 10}px), calc(-50% + ${sy * -16}px + ${fallY}vh), 0) scale(${fallScale * exitScale}) rotate(${fallRot + sx * 2}deg)`;
        glassesWrapRef.current.style.clipPath = `inset(0% ${exitClipRight}% 0% 0%)`;
        glassesWrapRef.current.style.opacity = p12 >= 0.9 ? '0' : '1';
        glassesWrapRef.current.style.filter = `blur(${fallBlur.toFixed(2)}px) drop-shadow(0 28px 42px rgba(0, 0, 0, 0.85)) hue-rotate(var(--hue))`;
      }

      if (heroHintRef.current) {
        heroHintRef.current.style.opacity = `${clamp(1 - p12 * 3.5, 0, 1) * glassesIntroP}`;
      }

      // Turntable video playbackRate ease / ?rec clock stepping
      const tv = turntableVideoRef.current;
      if (tv) {
        if (isRecMode) {
          if (!tv.paused) tv.pause();
          if (tv.duration && Number.isFinite(tv.duration)) {
            tv.currentTime = ((now / 1000) * (hoveringGlassesRef.current ? 2.6 : 1)) % tv.duration;
          }
        } else {
          const targetRate = hoveringGlassesRef.current && pv < 0.12 ? 2.6 : 1.0;
          tv.playbackRate += (targetRate - tv.playbackRate) * 0.1;
        }
      }

      // --- SCENE 2: DETAIL ---
      const detailIn = clamp((p12 - 0.34) / 0.66, 0, 1);
      const detailOut = clamp(p23 / 0.55, 0, 1);
      const detailVis = detailIn * (1 - detailOut);

      if (detailLayerRef.current) {
        detailLayerRef.current.style.opacity = detailVis > 0.01 ? '1' : '0';
        detailLayerRef.current.style.pointerEvents = pv > 0.3 && pv < 0.62 ? 'auto' : 'none';
      }

      if (detailImgWrapRef.current) {
        const wipeLeft = (1 - easeOutExpo(detailIn)) * 100;
        const wipeOutRight = easeInOutCubic(detailOut) * 100;
        detailImgWrapRef.current.style.clipPath = `inset(0% ${wipeOutRight}% 0% ${wipeLeft}%)`;
        const isMobile = window.innerWidth <= 760;
        if (isMobile) {
          detailImgWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${0.96 + 0.04 * detailIn})`;
        } else {
          detailImgWrapRef.current.style.transform = `translate3d(${(1 - detailIn) * 4}vw, -50%, 0)`;
        }
      }

      if (detailCopyRef.current) {
        detailCopyRef.current.style.opacity = `${clamp(detailIn * 1.4 - detailOut * 1.6, 0, 1)}`;
        detailCopyRef.current.style.transform = `translate3d(0, ${(1 - detailIn) * 18 - detailOut * 18}px, 0)`;
      }

      // --- SCENE 3: QUICK FACTS ---
      const factsIn = clamp((p23 - 0.36) / 0.64, 0, 1);
      const factsOut = clamp(p34 / 0.62, 0, 1);
      const factsVis = factsIn * (1 - factsOut);

      if (factsLayerRef.current) {
        factsLayerRef.current.style.opacity = factsVis > 0.01 ? '1' : '0';
        factsLayerRef.current.style.pointerEvents = pv > 0.66 && pv < 0.89 ? 'auto' : 'none';
      }

      // Trigger Bubble playback from 0 when entering Scene 3
      const bv = bubbleVideoRef.current;
      if (bv) {
        if (currentSceneRef.current === 2 && factsIn > 0.35 && !bubbleStartedRef.current) {
          bubbleStartedRef.current = true;
          bubbleStartClockRef.current = now;
          bv.currentTime = 0;
          if (!isRecMode) {
            bv.play().catch(() => {});
          }
        }

        if (isRecMode && bubbleStartedRef.current && bv.duration && Number.isFinite(bv.duration)) {
          if (!bv.paused) bv.pause();
          const elapsedSec = (now - bubbleStartClockRef.current) / 1000;
          bv.currentTime = Math.min(elapsedSec, Math.max(0, bv.duration - 0.03));
        }

        // Hold last frame when near end
        if (!isRecMode && bv.duration && Number.isFinite(bv.duration) && bv.currentTime >= bv.duration - 0.05 && !bv.paused) {
          bv.pause();
        }

        // Check video time >= 3.7s staggered by 0.15s for the 3 lobe icons
        if (currentSceneRef.current === 2 && bubbleStartedRef.current) {
          const ct = bv.currentTime;
          const v0 = ct >= 3.7;
          const v1 = ct >= 3.85;
          const v2 = ct >= 4.0;
          setLobeVisible((prev) =>
            prev[0] === v0 && prev[1] === v1 && prev[2] === v2 ? prev : [v0, v1, v2]
          );
        } else if (currentSceneRef.current !== 2) {
          setLobeVisible((prev) => (prev[0] || prev[1] || prev[2] ? [false, false, false] : prev));
        }
      }

      if (blobWrapRef.current) {
        const slitPct = easeInOutCubic(factsOut) * 49.6;
        const openScale = 0.88 + 0.12 * easeOutExpo(factsIn);
        blobWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${openScale})`;
        blobWrapRef.current.style.clipPath = `inset(${slitPct}% 0% ${slitPct}% 0%)`;
        blobWrapRef.current.style.opacity = `${clamp(factsIn * 1.3, 0, 1) * (1 - clamp(factsOut * 1.15, 0, 1))}`;
      }

      if (marqueeWrapRef.current) {
        const mInClip = (1 - easeOutExpo(factsIn)) * 50;
        const mOutClip = easeInOutCubic(factsOut) * 50;
        const mClip = Math.max(mInClip, mOutClip);
        marqueeWrapRef.current.style.clipPath = `inset(${mClip}% 0% ${mClip}% 0%)`;
        marqueeWrapRef.current.style.opacity = factsVis > 0.02 ? '1' : '0';
      }

      if (marqueeTrackRef.current) {
        const speed = isMoving ? 220 : 62;
        const halfW = marqueeTrackRef.current.scrollWidth / 2;
        if (halfW > 10) {
          marqueeOffsetRef.current.facts = (marqueeOffsetRef.current.facts + speed * dt) % halfW;
          marqueeTrackRef.current.style.transform = `translate3d(${-marqueeOffsetRef.current.facts}px, 0, 0)`;
        }
      }

      // --- SCENE 4: OUTRO ---
      const outroVis = clamp((p34 - 0.35) / 0.65, 0, 1);
      if (outroLayerRef.current) {
        outroLayerRef.current.style.opacity = outroVis > 0.01 ? '1' : '0';
        outroLayerRef.current.style.pointerEvents = pv > 0.86 ? 'auto' : 'none';
      }

      if (currentSceneRef.current === 3 && p34 >= 0.45 && !outroPlayedForEnterRef.current) {
        outroPlayedForEnterRef.current = true;
        triggerOutroSlices();
      }

      const lv = logoVideoRef.current;
      if (lv && isRecMode && lv.duration && Number.isFinite(lv.duration)) {
        if (!lv.paused) lv.pause();
        lv.currentTime = (now / 1000) % lv.duration;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRecMode, triggerOutroSlices]);

  // Input listeners: wheel, keyboard, touch swipe, mousemove, hover cursor detection
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (modalOpenRef.current) return;
      if (performance.now() < lockUntilRef.current) {
        wheelAccumRef.current = 0;
        return;
      }

      wheelAccumRef.current += e.deltaY;
      if (wheelResetTimerRef.current) window.clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = window.setTimeout(() => {
        wheelAccumRef.current = 0;
      }, 220);

      if (Math.abs(wheelAccumRef.current) > 40) {
        const dir = wheelAccumRef.current > 0 ? 1 : -1;
        wheelAccumRef.current = 0;
        const next = clamp(currentSceneRef.current + dir, 0, 3) as SceneIndex;
        goToScene(next);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (modalOpenRef.current) {
        if (e.key === 'Escape') {
          setModalExpanded(false);
          window.setTimeout(() => {
            setModalOpen(false);
          }, 440);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToScene(clamp(currentSceneRef.current + 1, 0, 3) as SceneIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToScene(clamp(currentSceneRef.current - 1, 0, 3) as SceneIndex);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (modalOpenRef.current) return;
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (modalOpenRef.current) return;
      if (touchStartYRef.current === null || e.changedTouches.length === 0) return;
      const dy = touchStartYRef.current - e.changedTouches[0].clientY;
      touchStartYRef.current = null;
      if (Math.abs(dy) > 40) {
        const dir = dy > 0 ? 1 : -1;
        goToScene(clamp(currentSceneRef.current + dir, 0, 3) as SceneIndex);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current.tx = (e.clientX / w - 0.5) * 2;
      mouseRef.current.ty = (e.clientY / h - 0.5) * 2;

      cursorPosRef.current.tx = e.clientX;
      cursorPosRef.current.ty = e.clientY;

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(target?.closest('a, button, [data-cursor="hover"]'));
      if (cursorRef.current) {
        cursorRef.current.dataset.hover = isInteractive ? 'true' : 'false';
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [goToScene]);

  const handleSelectLens = (lens: LensOption) => {
    setActiveLens(lens);
    setLensPopKey((k) => k + 1);
    showToast(`LENS · ${lens.label.toUpperCase()} (${lens.deg}°)`);
  };

  const openPreOrderModal = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = e.clientX || rect.left + rect.width / 2;
    const cy = e.clientY || rect.top + rect.height / 2;
    setModalClipOrigin({ x: cx, y: cy });
    setModalExpanded(false);
    setModalOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalExpanded(true);
      });
    });
  };

  const closePreOrderModal = () => {
    setModalExpanded(false);
    window.setTimeout(() => {
      setModalOpen(false);
    }, 460);
  };

  const handleReservePair = () => {
    closePreOrderModal();
    showToast(`RESERVED · AERO.VISION · ${activeLens.label.toUpperCase()} / ${activeFit.toUpperCase()}`);
  };

  const cornerData = CORNERS[displayedCornerScene];

  const renderCornerMain = (text: string) => {
    if (text === 'detail.{01}') {
      return (
        <>
          detail.<span className="text-[#c6ff3d]">{'{01}'}</span>
        </>
      );
    }
    return text;
  };

  return (
    <div
      ref={stageRef}
      className="relative w-screen h-dvh overflow-hidden bg-black text-[#f1f3ee] select-none"
      style={{ '--hue': `${activeLens.deg}deg` } as React.CSSProperties}
    >
      {/* Faint radial lime glow at 50% 60% */}
      <div className="stage-glow pointer-events-none absolute inset-0 z-0" />

      {/* SVG fractal-noise grain overlay at opacity .18 */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[45] h-full w-full opacity-[0.18]"
      >
        <filter id="kyne-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#kyne-grain)" />
      </svg>

      {/* =================================================================== */}
      {/* SCENE 1: HERO                                                       */}
      {/* =================================================================== */}
      <section aria-label="Hero" className="pointer-events-none absolute inset-0 z-10">
        {/* Wordmark marquee at top 25vh */}
        <div
          ref={wordmarkWrapRef}
          className="strip-mask absolute left-0 right-0 overflow-hidden"
          style={{ top: '25vh', mixBlendMode: 'screen' }}
        >
          <div ref={wordmarkTrackRef} className="flex w-max items-center will-change-transform">
            {[0, 1, 2, 3].map((idx) => (
              <img
                key={idx}
                src={ASSETS.wordmark}
                alt={idx === 0 ? 'KYNE AERO.VISION' : ''}
                aria-hidden={idx > 0}
                referrerPolicy="no-referrer"
                className="strip-img shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Glossy black neon-rimmed plinth */}
        <div
          ref={plinthWrapRef}
          className="hero-plinth-wrap absolute will-change-transform"
          style={{
            mixBlendMode: 'screen',
            filter: 'hue-rotate(var(--hue))',
            transition: 'filter 450ms var(--out)',
          }}
        >
          <img
            src={ASSETS.plinth}
            alt="Neon-rimmed mirror podium"
            referrerPolicy="no-referrer"
            className="block w-full h-auto"
          />
        </div>

        {/* WebGL chroma-keyed glasses turntable */}
        <div
          ref={glassesWrapRef}
          className="hero-glasses-wrap absolute will-change-transform"
        >
          <div key={lensPopKey} className={lensPopKey > 0 ? 'lens-pop-active' : ''}>
            <canvas
              ref={glassesCanvasRef}
              className="block w-full h-auto"
              style={{ aspectRatio: '16 / 9' }}
            />
          </div>
        </div>

        {/* Interactive hover hit-box over the glasses in Scene 1 */}
        {scene === 0 && (
          <div
            data-cursor="hover"
            onMouseEnter={() => setHoveringGlasses(true)}
            onMouseLeave={() => setHoveringGlasses(false)}
            className="pointer-events-auto absolute left-1/2 top-[52vh] z-20 h-[34vh] w-[52vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 max-[760px]:w-[82vw]"
            aria-label="Hover to accelerate glasses spin"
          />
        )}

        {/* Hidden source video for WebGL chroma-keying */}
        <video
          ref={turntableVideoRef}
          src={ASSETS.turntableVideo}
          crossOrigin="anonymous"
          loop
          muted
          playsInline
          preload="auto"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />

        {/* Hero bottom-left spin / scroll caption */}
        <div
          ref={heroHintRef}
          className="f-mono pointer-events-none absolute left-[2.2vw] bottom-[10.5vh] z-20 flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase"
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: hoveringGlasses ? 'var(--lime)' : 'rgba(241,243,238,0.65)',
            }}
          />
          <span className={hoveringGlasses ? 'text-[#c6ff3d]' : 'text-[rgba(241,243,238,0.68)]'}>
            {hoveringGlasses ? 'SPINNING · 2.6×' : 'HOVER TO SPIN · SCROLL TO EXPLORE'}
          </span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SCENE 2: DETAIL                                                     */}
      {/* =================================================================== */}
      <section
        ref={detailLayerRef}
        aria-label="Product detail"
        className="absolute inset-0 z-20 opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* Detail close-up image + hotspots */}
        <div
          ref={detailImgWrapRef}
          className="detail-img-wrap absolute will-change-transform"
          style={{
            mixBlendMode: 'screen',
            clipPath: 'inset(0% 0% 0% 100%)',
          }}
        >
          <div
            key={`det-${lensPopKey}`}
            className={`relative w-full ${lensPopKey > 0 ? 'lens-pop-active' : ''}`}
          >
            <img
              src={ASSETS.detail}
              alt="KYNE AERO.VISION detail close-up"
              referrerPolicy="no-referrer"
              className="detail-radial-mask block w-full h-auto"
              style={{
                filter: 'hue-rotate(var(--hue))',
                transition: 'filter 450ms var(--out)',
              }}
            />

            {/* 3 interactive hotspots */}
            {HOTSPOTS.map((spot, idx) => {
              const isOpen = activeHotspot === spot.id;
              return (
                <div
                  key={spot.id}
                  className="absolute z-30"
                  style={{
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setActiveHotspot(spot.id)}
                  onMouseLeave={() => setActiveHotspot((prev) => (prev === spot.id ? null : prev))}
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot((prev) => (prev === spot.id ? null : spot.id))}
                    aria-label={spot.title}
                    aria-expanded={isOpen}
                    className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#c6ff3d]/80 bg-black/75 text-[#c6ff3d] transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
                    style={{
                      transform: scene === 1 ? 'scale(1)' : 'scale(0)',
                      transitionDelay: `${260 + idx * 90}ms`,
                      transitionTimingFunction: 'var(--spring)',
                    }}
                  >
                    <span className="kyne-ping pointer-events-none absolute inset-0 rounded-full border border-[#c6ff3d]/70" />
                    <span className="f-mono text-sm leading-none font-medium">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {/* Frosted card unrolling downward with clip-path */}
                  <div
                    className="pointer-events-none absolute top-[38px] left-1/2 z-40 w-[236px] -translate-x-1/2 rounded-sm border border-[#c6ff3d]/35 bg-black/80 p-3.5 backdrop-blur-md max-[760px]:w-[196px]"
                    style={{
                      clipPath: isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                      opacity: isOpen ? 1 : 0,
                      transition:
                        'clip-path 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease',
                    }}
                  >
                    <div className="f-mono text-[10px] tracking-[0.14em] text-[#c6ff3d]">
                      {spot.title}
                    </div>
                    <p className="f-ui mt-1.5 text-[12px] leading-[1.45] text-[#f1f3ee]/85">
                      {spot.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left detail copy */}
        <div ref={detailCopyRef} className="detail-copy-wrap absolute z-20 will-change-transform">
          {/* Striped lime-gradient swatch */}
          <div className="lens-swatch mb-4 h-3.5 w-24 border border-white/20" />

          <div className="ln">
            <span
              className="f-ui block text-[clamp(30px,3.8vw,58px)] leading-[1.02] font-medium tracking-[-0.03em]"
              style={{
                transform: scene === 1 ? 'translateY(0%)' : 'translateY(115%)',
                transition: 'transform 700ms var(--out) 140ms',
              }}
            >
              lens.
              <span
                className="text-[#c6ff3d]"
                style={{
                  filter: 'hue-rotate(var(--hue))',
                  transition: 'filter 450ms var(--out)',
                }}
              >
                {'{'}
                {activeLens.id}
                {'}'}
              </span>
            </span>
          </div>

          <div className="mt-5 space-y-3.5 max-[760px]:mt-3 max-[760px]:space-y-2">
            <div className="ln">
              <p
                className="f-mono text-[11px] leading-[1.65] tracking-[0.08em] text-[#f1f3ee]/85 uppercase max-[760px]:text-[10px]"
                style={{
                  transform: scene === 1 ? 'translateY(0%)' : 'translateY(115%)',
                  transition: 'transform 720ms var(--out) 230ms',
                }}
              >
                PHOTOCHROMIC SHIELD ADAPTS FROM CAT 1 TO CAT 3 IN 0.8 SECONDS. ZERO DISTORTION
                ACROSS FULL PERIPHERAL ARC.
              </p>
            </div>
            <div className="ln">
              <p
                className="f-mono text-[11px] leading-[1.65] tracking-[0.08em] text-[rgba(241,243,238,0.55)] uppercase max-[760px]:text-[10px]"
                style={{
                  transform: scene === 1 ? 'translateY(0%)' : 'translateY(115%)',
                  transition: 'transform 720ms var(--out) 320ms',
                }}
              >
                CNC-MILLED LIQUID-CHROME CHASSIS WITH MICRO-PERFORATED VENTING AND HYDRO-LOCK
                TEMPLE GRIPS.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom meta notes */}
        <div
          className="desk-only f-mono pointer-events-none absolute left-[2.2vw] bottom-[10.5vh] z-20 flex items-center gap-6 text-[10px] tracking-[0.12em] text-[rgba(241,243,238,0.55)] uppercase"
          style={{
            opacity: scene === 1 ? 1 : 0,
            transform: scene === 1 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 500ms var(--out) 360ms, transform 500ms var(--out) 360ms',
          }}
        >
          <span>OPTICS · POLYCARBONATE SHIELD · UV400</span>
          <span>CHASSIS · LIQUID-CHROME ALLOY · 24G</span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SCENE 3: QUICK FACTS                                                */}
      {/* =================================================================== */}
      <section
        ref={factsLayerRef}
        aria-label="Quick facts"
        className="absolute inset-0 z-20 opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* Iridescent bubble morph video + 3 lobe icons & labels */}
        <div
          ref={blobWrapRef}
          className="blob-wrap absolute will-change-transform"
          style={{ mixBlendMode: 'screen' }}
        >
          <div key={`blob-${lensPopKey}`} className={`relative w-full ${lensPopKey > 0 ? 'lens-pop-active' : ''}`}>
            <video
              ref={bubbleVideoRef}
              src={ASSETS.bubbleVideo}
              muted
              playsInline
              preload="auto"
              className="block w-full h-auto"
              style={{
                filter: 'hue-rotate(calc(var(--hue) * 0.5))',
                transition: 'filter 450ms var(--out)',
              }}
            />

            {/* 3 RGB-split lobe icons at 27%, 50%, 73% width and 48% height */}
            {[
              {
                key: 'weight',
                x: '27%',
                labelKey: 'WEIGHT',
                labelVal: '.24g',
                lower: false,
                svg: (
                  <svg viewBox="0 0 48 48" className="h-9 w-9 max-[760px]:h-7 max-[760px]:w-7" fill="none" stroke="white" strokeWidth="2.2">
                    <circle cx="24" cy="24" r="4" fill="white" />
                    {[0, 60, 120, 180, 240, 300].map((ang) => (
                      <ellipse
                        key={ang}
                        cx="24"
                        cy="12"
                        rx="4.2"
                        ry="8.5"
                        transform={`rotate(${ang} 24 24)`}
                      />
                    ))}
                  </svg>
                ),
              },
              {
                key: 'lens',
                x: '50%',
                labelKey: 'LENS',
                labelVal: '.photochromic',
                lower: true,
                svg: (
                  <svg viewBox="0 0 48 48" className="h-9 w-9 max-[760px]:h-7 max-[760px]:w-7" fill="none" stroke="white" strokeWidth="2.2" strokeLinejoin="round">
                    <polygon points="24,5 38,24 24,43 10,24" />
                    <polyline points="24,5 28,24 24,43" />
                    <polyline points="24,5 20,24 24,43" />
                    <line x1="10" y1="24" x2="38" y2="24" />
                  </svg>
                ),
              },
              {
                key: 'fit',
                x: '73%',
                labelKey: 'FIT',
                labelVal: '.wrap',
                lower: false,
                svg: (
                  <svg viewBox="0 0 48 48" className="h-9 w-9 max-[760px]:h-7 max-[760px]:w-7" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M8 15 Q16 9 24 15 T40 15" />
                    <path d="M8 24 Q16 18 24 24 T40 24" />
                    <path d="M8 33 Q16 27 24 33 T40 33" />
                  </svg>
                ),
              },
            ].map((item, idx) => {
              const shown = lobeVisible[idx];
              return (
                <div
                  key={item.key}
                  className="pointer-events-auto absolute z-30 flex flex-col items-center"
                  style={{
                    left: item.x,
                    top: '48%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <button
                    type="button"
                    aria-label={`${item.labelKey} ${item.labelVal}`}
                    onClick={() => showToast(`${item.labelKey} ${item.labelVal.toUpperCase()}`)}
                    className="lobe-icon-btn flex h-12 w-12 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
                    style={{
                      transform: shown ? 'scale(1) rotate(0deg)' : 'scale(0.15) rotate(-40deg)',
                      opacity: shown ? 1 : 0,
                      transition:
                        'transform 620ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 320ms ease',
                    }}
                  >
                    <span className="rgb-icon inline-flex items-center justify-center">
                      {item.svg}
                    </span>
                  </button>

                  {/* Labels under the lobes */}
                  <div
                    className={`pointer-events-none flex flex-col items-center text-center ${
                      item.lower ? 'mt-7 max-[760px]:mt-5' : 'mt-2.5'
                    }`}
                    style={{
                      opacity: shown ? 1 : 0,
                      transform: shown ? 'translateY(0)' : 'translateY(10px)',
                      transition: 'opacity 420ms ease 140ms, transform 480ms var(--out) 140ms',
                    }}
                  >
                    <span className="f-mono text-[9px] tracking-[0.16em] text-[rgba(241,243,238,0.6)] uppercase">
                      {item.labelKey}
                    </span>
                    <span className="f-disp skew-head mt-0.5 text-[clamp(12px,1.4vw,20px)] font-bold tracking-tight text-[#f1f3ee]">
                      {item.labelVal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QUICK FACTS marquee strip at 76% */}
        <div
          ref={marqueeWrapRef}
          className="strip-mask pointer-events-none absolute left-0 right-0 overflow-hidden"
          style={{ top: '76%', transform: 'translateY(-50%)', mixBlendMode: 'screen' }}
        >
          <div ref={marqueeTrackRef} className="flex w-max items-center will-change-transform">
            {[0, 1, 2, 3].map((idx) => (
              <img
                key={idx}
                src={ASSETS.marquee}
                alt={idx === 0 ? 'QUICK FACTS' : ''}
                aria-hidden={idx > 0}
                referrerPolicy="no-referrer"
                className="strip-img shrink-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SCENE 4: OUTRO                                                      */}
      {/* =================================================================== */}
      <section
        ref={outroLayerRef}
        aria-label="Outro"
        className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0"
        style={{ pointerEvents: 'none' }}
      >
        {/* 3D lime glass spinning logo video */}
        <div
          className="pointer-events-none absolute left-1/2 top-[43%] w-[min(92vw,1500px)] -translate-x-1/2 -translate-y-1/2"
          style={{ mixBlendMode: 'screen' }}
        >
          <div key={`logo-${lensPopKey}`} className={lensPopKey > 0 ? 'lens-pop-active' : ''}>
            <video
              ref={logoVideoRef}
              src={ASSETS.logoVideo}
              loop
              muted
              playsInline
              autoPlay={!isRecMode}
              preload="auto"
              className="block w-full h-auto"
              style={{
                filter: 'hue-rotate(var(--hue))',
                transition: 'filter 450ms var(--out)',
              }}
            />
          </div>
        </div>

        {/* Outro copy & Pre-order CTA */}
        <div className="relative z-20 mt-[26vh] flex flex-col items-center px-6 text-center">
          <div className="ln">
            <span
              ref={outroHeadlineRef}
              className="f-disp skew-head block text-[clamp(22px,3.6vw,54px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-[#f1f3ee] uppercase"
            >
              SEE IT BEFORE IT HAPPENS.
            </span>
          </div>

          <div ref={outroCtaRef} className="mt-6">
            <button
              type="button"
              onClick={openPreOrderModal}
              className="preorder-pill f-mono inline-flex items-center gap-3.5 rounded-full border border-[#c6ff3d]/70 bg-black/60 px-6 py-3 text-[11px] font-medium tracking-[0.16em] text-[#f1f3ee] uppercase backdrop-blur-md focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
            >
              <span>PRE-ORDER · $289</span>
              <span className="arrow-chip inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f1f3ee] text-[12px] text-black">
                →
              </span>
            </button>
          </div>
        </div>

        {/* 12 black vertical slice bars collapsing from center on every entry */}
        <div className="pointer-events-none absolute inset-0 z-30 grid grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                outroSliceRefs.current[i] = el;
              }}
              className="h-full w-full origin-top bg-black will-change-transform"
              style={{ transform: 'scaleY(0)' }}
            />
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* PERSISTENT HEADER                                                   */}
      {/* =================================================================== */}
      <header
        ref={headerRef}
        className="absolute top-0 right-[2.2vw] left-[2.2vw] z-40 flex items-center justify-between border-b border-[rgba(241,243,238,0.22)] will-change-transform"
        style={{ height: 'clamp(54px, 8.6vh, 80px)' }}
      >
        {/* Brand + Welcome */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => goToScene(0)}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
          >
            {/* Two forward-leaning blades SVG (left white with notch, right lime) */}
            <svg
              width="28"
              height="20"
              viewBox="0 0 28 20"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                d="M5.5 2H13.5L9.5 18H1.5L3.3 10.8L6.2 10.8L6.8 8.4L3.9 8.4L5.5 2Z"
                fill="#f1f3ee"
              />
              <path
                d="M17.5 2H25.5L21.5 18H13.5L17.5 2Z"
                fill="#c6ff3d"
                style={{
                  filter: 'hue-rotate(var(--hue))',
                  transition: 'filter 450ms var(--out)',
                }}
              />
            </svg>
            <span className="f-ui whitespace-nowrap text-[14px] font-medium tracking-[0.04em] text-[#f1f3ee]">
              KYNE AERO.VISION
            </span>
          </button>

          <span className="desk-only f-mono whitespace-nowrap text-[10px] tracking-[0.14em] text-[rgba(241,243,238,0.55)]">
            N.1 • WELCOME TO THE FUTURE
          </span>
        </div>

        {/* Center Nav */}
        <nav aria-label="Primary navigation" className="desk-only flex items-center gap-7">
          {[
            { label: '.shop', action: (e: React.MouseEvent) => openPreOrderModal(e) },
            { label: '.about', action: () => goToScene(1) },
            { label: '.collection', action: () => goToScene(0) },
            { label: '.info', action: () => goToScene(2) },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="nav-wipe f-mono whitespace-nowrap text-[11px] tracking-[0.1em] text-[#f1f3ee]/85 transition-colors hover:text-[#c6ff3d] focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: [PRG] Clock + Ping Dot + Pre-order pill */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="desk-only flex flex-col items-end leading-tight">
            <span className="f-mono text-[9px] tracking-[0.14em] text-[rgba(241,243,238,0.55)]">
              [PRG]
            </span>
            <span className="f-mono text-[11px] tracking-[0.08em] text-[#f1f3ee]">
              {clockText}
            </span>
          </div>

          <div
            aria-hidden="true"
            className="desk-only relative flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(241,243,238,0.28)]"
          >
            <span className="kyne-ping absolute inset-0 rounded-full border border-[#c6ff3d]/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#c6ff3d]" />
          </div>

          <button
            type="button"
            onClick={openPreOrderModal}
            className="preorder-pill f-mono inline-flex items-center gap-2.5 rounded-full border border-[rgba(241,243,238,0.28)] px-3.5 py-1.5 text-[10px] font-medium tracking-[0.14em] text-[#f1f3ee] uppercase whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
          >
            <span>PRE-ORDER</span>
            <span className="arrow-chip inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f1f3ee] text-[11px] text-black">
              →
            </span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* PERSISTENT TOP CORNER CAPTIONS (Hidden <=760px)                     */}
      {/* =================================================================== */}
      <div
        className="desk-only pointer-events-none absolute right-[2.2vw] left-[2.2vw] z-30 flex items-start justify-between"
        style={{ top: 'calc(clamp(54px, 8.6vh, 80px) + 2.2vh)' }}
      >
        <div>
          <div className="ln">
            <span
              ref={cornerLeftMainRef}
              className="f-ui block text-[clamp(22px,2.2vw,34px)] leading-[1.06] font-medium tracking-[-0.025em] text-[#f1f3ee]"
            >
              {renderCornerMain(cornerData.leftMain)}
            </span>
          </div>
          <div className="ln mt-1">
            <span
              ref={cornerLeftSubRef}
              className="f-mono block text-[10px] tracking-[0.14em] text-[rgba(241,243,238,0.55)] uppercase"
            >
              {cornerData.leftSub}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="ln">
            <span
              ref={cornerRightMainRef}
              className="f-ui block text-[clamp(22px,2.2vw,34px)] leading-[1.06] font-medium tracking-[-0.025em] text-[#f1f3ee]"
            >
              {cornerData.rightMain}
            </span>
          </div>
          <div className="ln mt-1">
            <span
              ref={cornerRightSubRef}
              className="f-mono block text-[10px] tracking-[0.14em] text-[rgba(241,243,238,0.55)] uppercase"
            >
              {cornerData.rightSub}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* LENS COLOUR PICKER (Bottom Right)                                   */}
      {/* =================================================================== */}
      <div className="absolute right-[2.2vw] bottom-[9.5vh] z-40 flex items-center gap-3 max-[760px]:bottom-[8vh]">
        <span className="f-mono text-[10px] tracking-[0.16em] text-[rgba(241,243,238,0.55)] uppercase">
          LENS
        </span>
        <div className="flex items-center gap-2 rounded-full border border-[rgba(241,243,238,0.2)] bg-black/60 px-2.5 py-1.5 backdrop-blur-md">
          {LENSES.map((lens) => {
            const active = lens.id === activeLens.id;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => handleSelectLens(lens)}
                title={`${lens.label} (${lens.deg}°)`}
                aria-label={`Select ${lens.label} lens`}
                aria-pressed={active}
                className="relative flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: lens.swatch,
                    boxShadow: active ? `0 0 12px ${lens.swatch}` : 'none',
                    transform: active ? 'scale(1.15)' : 'scale(0.9)',
                  }}
                />
                {active && (
                  <span className="pointer-events-none absolute inset-0 rounded-full border border-[#f1f3ee]/85" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLL · NEXT control (Scenes 2 & 3, bottom-right/left) */}
      {(scene === 1 || scene === 2) && (
        <button
          type="button"
          onClick={() => goToScene((scene + 1) as SceneIndex)}
          className="f-mono absolute bottom-[9.8vh] left-[2.2vw] z-40 flex items-center gap-2 text-[10px] tracking-[0.14em] uppercase transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-[#c6ff3d] max-[760px]:bottom-[8.2vh]"
          style={{
            opacity: isLockedUI ? 0.35 : 0.85,
            color: '#f1f3ee',
          }}
        >
          <span>SCROLL · NEXT</span>
          <span className="text-[#c6ff3d]">↓</span>
        </button>
      )}

      {/* =================================================================== */}
      {/* PERSISTENT FOOTER                                                   */}
      {/* =================================================================== */}
      <footer
        ref={footerRef}
        className="f-mono absolute right-[2.2vw] bottom-0 left-[2.2vw] z-40 flex h-[6.8vh] min-h-[44px] items-center justify-between border-t border-[rgba(241,243,238,0.12)] text-[clamp(9px,0.72vw,12px)] tracking-[0.12em] text-[rgba(241,243,238,0.65)] uppercase will-change-transform"
      >
        {/* Left: Star glyph + date + "+" */}
        <div className="flex items-center gap-3 whitespace-nowrap">
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
            className="text-[#c6ff3d]"
          >
            <path d="M6 0L7.3 4.7L12 6L7.3 7.3L6 12L4.7 7.3L0 6L4.7 4.7L6 0Z" />
          </svg>
          <span>{footerDate}</span>
          <span className="desk-only text-[rgba(241,243,238,0.35)]">+</span>
        </div>

        {/* Center: 4 clickable scene dashes + copyright */}
        <div className="flex items-center gap-4">
          <div role="navigation" aria-label="Scene progress" className="flex items-center gap-1.5">
            {([0, 1, 2, 3] as SceneIndex[]).map((idx) => {
              const active = idx === scene;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToScene(idx)}
                  aria-label={`Go to scene ${idx + 1}`}
                  aria-current={active ? 'step' : undefined}
                  className="flex h-7 items-center px-1 focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
                >
                  <span
                    className="block h-[2px] transition-all duration-500"
                    style={{
                      width: active ? '30px' : '14px',
                      backgroundColor: active ? '#c6ff3d' : 'rgba(241,243,238,0.28)',
                      transitionTimingFunction: 'var(--out)',
                    }}
                  />
                </button>
              );
            })}
          </div>
          <span className="desk-only whitespace-nowrap text-[rgba(241,243,238,0.48)]">
            ©2026 KYNE AERO.VISION
          </span>
        </div>

        {/* Right: "+" + corner bracket + coordinates */}
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className="desk-only text-[rgba(241,243,238,0.35)]">+</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
            className="text-[rgba(241,243,238,0.55)]"
          >
            <path d="M1 4V1H4M6 1H9V4M9 6V9H6M4 9H1V6" />
          </svg>
          <span>50°05′36.2″N 14°26′51.5″E</span>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* PRE-ORDER CIRCULAR REVEAL MODAL                                     */}
      {/* =================================================================== */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preorder-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 backdrop-blur-xl"
          style={{
            clipPath: modalExpanded
              ? `circle(155vmax at ${modalClipOrigin.x}px ${modalClipOrigin.y}px)`
              : `circle(0px at ${modalClipOrigin.x}px ${modalClipOrigin.y}px)`,
            transition: 'clip-path 480ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePreOrderModal();
          }}
        >
          {/* Trigger initial circular expand via mount keyframe wrapper */}
          <div
            className="w-full max-w-[460px] border border-[rgba(241,243,238,0.22)] bg-[#090a08]/95 p-7 shadow-2xl"
            style={{
              animation: 'lens-pop 460ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="flex items-start justify-between border-b border-[rgba(241,243,238,0.16)] pb-4">
              <div>
                <span className="f-mono text-[10px] tracking-[0.16em] text-[#c6ff3d] uppercase">
                  DROP 01 · 500 PAIRS
                </span>
                <h2
                  id="preorder-title"
                  className="f-disp skew-head mt-1 text-2xl font-extrabold tracking-tight text-[#f1f3ee]"
                >
                  AERO.VISION
                </h2>
              </div>
              <button
                type="button"
                onClick={closePreOrderModal}
                aria-label="Close pre-order panel"
                className="f-mono flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(241,243,238,0.22)] text-xs text-[#f1f3ee] transition-colors hover:border-[#c6ff3d] hover:text-[#c6ff3d] focus-visible:outline-2 focus-visible:outline-[#c6ff3d]"
              >
                ×
              </button>
            </div>

            {/* LENS chips */}
            <div className="mt-6">
              <div className="f-mono text-[10px] tracking-[0.16em] text-[rgba(241,243,238,0.55)] uppercase">
                LENS
              </div>
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {LENSES.map((lens) => {
                  const selected = lens.id === activeLens.id;
                  return (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => handleSelectLens(lens)}
                      className={`f-mono flex items-center justify-center gap-1.5 border py-2.5 text-[11px] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-[#c6ff3d] ${
                        selected
                          ? 'border-[#c6ff3d] bg-[#c6ff3d] font-medium text-black'
                          : 'border-[rgba(241,243,238,0.2)] text-[#f1f3ee] hover:border-[rgba(241,243,238,0.5)]'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full border border-black/30"
                        style={{ backgroundColor: lens.swatch }}
                      />
                      <span>{lens.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIT chips */}
            <div className="mt-6">
              <div className="f-mono text-[10px] tracking-[0.16em] text-[rgba(241,243,238,0.55)] uppercase">
                FIT
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {FITS.map((fit) => {
                  const selected = fit === activeFit;
                  return (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setActiveFit(fit)}
                      className={`f-mono border py-2.5 text-[11px] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-[#c6ff3d] ${
                        selected
                          ? 'border-[#c6ff3d] bg-[#c6ff3d] font-medium text-black'
                          : 'border-[rgba(241,243,238,0.2)] text-[#f1f3ee] hover:border-[rgba(241,243,238,0.5)]'
                      }`}
                    >
                      {fit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Reserve button */}
            <div className="mt-8 flex items-center justify-between border-t border-[rgba(241,243,238,0.16)] pt-5">
              <div>
                <div className="f-mono text-[10px] tracking-[0.14em] text-[rgba(241,243,238,0.55)] uppercase">
                  TOTAL
                </div>
                <div className="f-disp text-2xl font-extrabold tracking-tight text-[#f1f3ee]">
                  $289
                </div>
              </div>
              <button
                type="button"
                onClick={handleReservePair}
                className="f-mono inline-flex items-center gap-2 rounded-full bg-[#c6ff3d] px-6 py-3 text-[11px] font-medium tracking-[0.12em] text-black uppercase transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>Reserve pair →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOAST PILL (Bottom Centre)                                          */}
      {/* =================================================================== */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-[9.2vh] left-1/2 z-[60] -translate-x-1/2 transition-all duration-300"
        style={{
          opacity: toastMsg ? 1 : 0,
          transform: toastMsg ? 'translate(-50%, 0)' : 'translate(-50%, 16px)',
        }}
      >
        {toastMsg && (
          <div className="f-mono whitespace-nowrap rounded-full bg-[#c6ff3d] px-5 py-2 text-[10px] font-medium tracking-[0.14em] text-black uppercase shadow-lg">
            {toastMsg}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* CUSTOM CURSOR (12px ring -> 44px hover / 52px ?rec mode)            */}
      {/* =================================================================== */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        data-hover="false"
        className={`kyne-cursor pointer-events-none fixed top-0 left-0 z-[9999] rounded-full transition-[width,height,background-color,border-color] duration-200 ${
          isRecMode
            ? 'h-[52px] w-[52px] border border-[#c6ff3d] bg-[#c6ff3d]/10'
            : 'h-[12px] w-[12px] border-[1.5px] border-[#c6ff3d] data-[hover=true]:h-[44px] data-[hover=true]:w-[44px] data-[hover=true]:bg-[#c6ff3d]/15'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      >
        {isRecMode && (
          <span className="absolute top-1/2 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2d55]" />
        )}
      </div>
    </div>
  );
}
