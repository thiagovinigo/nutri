import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Bot } from 'lucide-react';

const MOOD_PRESETS = {
  calm: {
    label: 'Monitoramento Ativo',
    tagClass: 'cx-tag-info',
    cyan: 0x00aaff,
    blue: 0x0091ff,
    purple: 0x8000ff,
    pink: 0xff0099,
    peach: 0xff4d4d,
    speed: 1.0
  },
  alert: {
    label: 'Radar em Alerta',
    tagClass: 'cx-tag-risk',
    cyan: 0xff5577,
    blue: 0xff0066,
    purple: 0x9900ff,
    pink: 0xff0099,
    peach: 0xff2a2a,
    speed: 1.75
  },
  scanning: {
    label: 'Leitura IA / Scanner',
    tagClass: 'cx-tag-ok',
    cyan: 0x00f5d4,
    blue: 0x00b4d8,
    purple: 0x0077ff,
    pink: 0x10b981,
    peach: 0x38bdf8,
    speed: 2.35
  },
  celebrating: {
    label: 'Meta / Ação Sincronizada',
    tagClass: 'cx-tag-purple',
    cyan: 0x00e5ff,
    blue: 0x3b82f6,
    purple: 0xa855f7,
    pink: 0xff2a85,
    peach: 0xfbbf24,
    speed: 1.9
  },
  thinking: {
    label: 'Processando TACO IA',
    tagClass: 'cx-tag-info',
    cyan: 0x38bdf8,
    blue: 0x6366f1,
    purple: 0x8b5cf6,
    pink: 0xc084fc,
    peach: 0x60a5fa,
    speed: 1.5
  }
};

/**
 * Real-time 3D WebGL Holographic Nutrivvo Bot loaded from /clarix/nutrivvo-bot.glb
 * with Clarix's procedural ASCII/iridescent SDF shader and reactive mood palette.
 */
export default function ClarixRobotCanvas({
  mood = 'calm',
  pulseKey = 0,
  height = 330,
  onRobotClick,
  badgeLabel
}) {
  const mountRef = useRef(null);
  const moodRef = useRef(MOOD_PRESETS[mood] || MOOD_PRESETS.calm);
  const impulseRef = useRef(0);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    moodRef.current = MOOD_PRESETS[mood] || MOOD_PRESETS.calm;
  }, [mood]);

  useEffect(() => {
    if (pulseKey > 0) {
      impulseRef.current = 1.0;
    }
  }, [pulseKey]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let disposed = false;
    let renderer;
    let mixer;
    let modelRoot;
    let rafId = 0;
    let ro;

    const w0 = container.clientWidth || 360;
    const h0 = container.clientHeight || height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w0 / Math.max(h0, 1), 0.1, 100);
    camera.position.set(0, 0.08, 4.35);
    camera.lookAt(0, 0.02, 0);

    const pointerTarget = new THREE.Vector2(0, 0);
    const pointerSmooth = new THREE.Vector2(0, 0);
    const _revealVec = new THREE.Vector3();

    const targetCyan = new THREE.Color(moodRef.current.cyan);
    const targetBlue = new THREE.Color(moodRef.current.blue);
    const targetPurple = new THREE.Color(moodRef.current.purple);
    const targetPink = new THREE.Color(moodRef.current.pink);
    const targetPeach = new THREE.Color(moodRef.current.peach);

    const dpr0 = Math.min(window.devicePixelRatio || 1, 1.5);
    const computePixelSize = (w) => Math.max(4.5, Math.min(7.2, w / 62)) * dpr0;

    const uniforms = {
      time: { value: 0 },
      colorCyan: { value: new THREE.Color(moodRef.current.cyan) },
      colorPurple: { value: new THREE.Color(moodRef.current.purple) },
      colorBlue: { value: new THREE.Color(moodRef.current.blue) },
      colorPeach: { value: new THREE.Color(moodRef.current.peach) },
      colorHotPink: { value: new THREE.Color(moodRef.current.pink) },
      edgeBlurAmount: { value: 0.44 },
      uRevealProgress: { value: 0.0 },
      uRevealOrigin: { value: new THREE.Vector2(0.5 * (w0 / Math.max(h0, 1)), 0.5) },
      resolution: { value: new THREE.Vector2(w0 * dpr0, h0 * dpr0) },
      uPixelSize: { value: computePixelSize(w0) }
    };

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(dpr0);
      renderer.setSize(w0, h0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 1.15);
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(5, 10, 6);
      const rimLight = new THREE.DirectionalLight(0xa5f3fc, 1.25);
      rimLight.position.set(-5, -4, -5);
      scene.add(ambient, keyLight, rimLight);

      const applyClarixHoloShader = (mat) => {
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.time = uniforms.time;
          shader.uniforms.colorCyan = uniforms.colorCyan;
          shader.uniforms.colorPurple = uniforms.colorPurple;
          shader.uniforms.colorBlue = uniforms.colorBlue;
          shader.uniforms.colorPeach = uniforms.colorPeach;
          shader.uniforms.colorHotPink = uniforms.colorHotPink;
          shader.uniforms.edgeBlurAmount = uniforms.edgeBlurAmount;
          shader.uniforms.uRevealProgress = uniforms.uRevealProgress;
          shader.uniforms.uRevealOrigin = uniforms.uRevealOrigin;
          shader.uniforms.resolution = uniforms.resolution;
          shader.uniforms.uPixelSize = uniforms.uPixelSize;

          shader.vertexShader = `
            varying vec3 vLocalPosition;
          ` + shader.vertexShader;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             #ifdef USE_INSTANCING
               vLocalPosition = (instanceMatrix * vec4(position, 1.0)).xyz;
             #else
               vLocalPosition = position;
             #endif`
          );

          shader.fragmentShader = `
            uniform float time;
            uniform float edgeBlurAmount;
            uniform float uRevealProgress;
            uniform vec2 uRevealOrigin;
            uniform vec2 resolution;
            uniform float uPixelSize;
            uniform vec3 colorCyan;
            uniform vec3 colorPurple;
            uniform vec3 colorBlue;
            uniform vec3 colorPeach;
            uniform vec3 colorHotPink;
            varying vec3 vLocalPosition;
          ` + shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             vec3 vDir = normalize(vViewPosition);
             float fresnel = 1.0 - max(dot(vDir, normal), 0.0);
             float fresnelPow = pow(fresnel, 1.85);

             float wave1 = sin(vLocalPosition.x * 2.1 - time * 1.1);
             float wave2 = cos(vLocalPosition.y * 1.6 + time * 0.85);
             float wave3 = sin(vLocalPosition.z * 2.4 + time * 0.55);
             float combinedWave = smoothstep(-0.5, 0.5, (wave1 + wave2 + wave3) / 3.0);

             float wavePeach = sin(vLocalPosition.y * 2.0 - vLocalPosition.x * 1.0 + time * 1.25) * 0.5 + 0.5;

             vec3 mixColor = mix(colorBlue, colorCyan, combinedWave);
             vec3 pinkTransition = mix(mixColor, colorHotPink, smoothstep(0.22, 0.78, wavePeach));
             mixColor = mix(pinkTransition, colorPeach, smoothstep(0.55, 0.96, wavePeach));
             mixColor = mix(mixColor, colorPurple, fresnel);

             vec3 glow = colorCyan * fresnelPow * 1.45;
             float distortion = sin(vLocalPosition.x * 2.5 + time * 0.5) * 0.4 + cos(vLocalPosition.z * 2.0) * 0.4;
             float curvedY = vLocalPosition.y + distortion;
             float lines = fract((curvedY - time * 0.22) * 1.2);
             float lineIntensity = smoothstep(0.2, 0.6, lines) * smoothstep(1.0, 0.6, lines);
             vec3 lineGlow = vec3(0.18, 0.78, 1.0) * lineIntensity * (0.35 + fresnel * 0.95);

             vec3 finalEmission = (mixColor * 0.66 + glow + lineGlow) * 1.22;

             float pixelSize = max(4.0, uPixelSize);
             vec2 localUv = fract(gl_FragCoord.xy / pixelSize) - 0.5;
             float luma = dot(finalEmission, vec3(0.2126, 0.7152, 0.0722));
             float currentSize = clamp(luma * 1.24, 0.09, 0.46);
             float currentRadius = mix(0.0, currentSize, wavePeach);

             float d = length(max(abs(localUv) - (currentSize - currentRadius), 0.0)) - currentRadius;
             float shapeAlpha = smoothstep(1.5 / pixelSize, 0.0, d);
             if (shapeAlpha < 0.08) discard;

             float edgeStart = mix(1.0, 0.72, edgeBlurAmount);
             float edgeEnd = mix(0.99, 0.14, edgeBlurAmount);
             float edgeBlur = smoothstep(edgeStart, edgeEnd, fresnel);

             if (uRevealProgress < 0.999) {
               vec2 screenUv = gl_FragCoord.xy / max(resolution.xy, vec2(1.0));
               screenUv.x *= resolution.x / max(resolution.y, 1.0);
               float dist2D = distance(screenUv, uRevealOrigin);
               float rad2D = uRevealProgress * 2.4;
               float gridRandom = fract(sin(dot(floor(gl_FragCoord.xy / pixelSize), vec2(12.9898, 78.233))) * 43758.5453);
               if (dist2D > rad2D - gridRandom * 0.16) discard;
             }

             gl_FragColor = vec4(gl_FragColor.rgb * 0.35 + finalEmission, gl_FragColor.a * shapeAlpha * edgeBlur);`
          );
        };
      };

      const gltfLoader = new GLTFLoader();
      let revealStart = -1;

      gltfLoader.load(
        '/clarix/nutrivvo-bot.glb',
        (gltf) => {
          if (disposed) return;
          const rawModel = gltf.scene;
          const box = new THREE.Box3().setFromObject(rawModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          const normScale = 3.15 / maxDim;
          rawModel.scale.setScalar(normScale);

          const scaledBox = new THREE.Box3().setFromObject(rawModel);
          const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
          rawModel.position.sub(scaledCenter);

          rawModel.traverse((child) => {
            if (child.isMesh) {
              const mat = new THREE.MeshPhysicalMaterial({
                color: 0x050914,
                metalness: 0.88,
                roughness: 0.22,
                clearcoat: 1.0,
                clearcoatRoughness: 0.12,
                transparent: true,
                opacity: 0.96,
                side: THREE.DoubleSide
              });
              applyClarixHoloShader(mat);
              child.material = mat;
            }
          });

          const pivot = new THREE.Group();
          pivot.add(rawModel);
          pivot.rotation.set(-0.04, -0.32, 0.0);
          modelRoot = pivot;
          scene.add(modelRoot);

          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(rawModel);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          }

          revealStart = 0;
          setStatus('ready');
        },
        undefined,
        () => {
          if (!disposed) setStatus('fallback');
        }
      );

      const handlePointerMove = (e) => {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        pointerTarget.x = THREE.MathUtils.clamp(nx, -1, 1);
        pointerTarget.y = THREE.MathUtils.clamp(ny, -1, 1);
      };

      const handleResize = () => {
        if (!renderer || !container) return;
        const w = container.clientWidth || 320;
        const h = container.clientHeight || height;
        const curDpr = renderer.getPixelRatio();
        camera.aspect = w / Math.max(h, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        uniforms.resolution.value.set(w * curDpr, h * curDpr);
        uniforms.uPixelSize.value = computePixelSize(w);
      };

      ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
      if (ro) ro.observe(container);
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      const clock = new THREE.Clock();
      let shaderElapsed = 0;

      const animate = () => {
        if (disposed) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        const preset = moodRef.current;

        shaderElapsed += delta * preset.speed;
        uniforms.time.value = shaderElapsed;

        targetCyan.setHex(preset.cyan);
        targetBlue.setHex(preset.blue);
        targetPurple.setHex(preset.purple);
        targetPink.setHex(preset.pink);
        targetPeach.setHex(preset.peach);

        uniforms.colorCyan.value.lerp(targetCyan, 0.08);
        uniforms.colorBlue.value.lerp(targetBlue, 0.08);
        uniforms.colorPurple.value.lerp(targetPurple, 0.08);
        uniforms.colorHotPink.value.lerp(targetPink, 0.08);
        uniforms.colorPeach.value.lerp(targetPeach, 0.08);

        if (revealStart >= 0 && uniforms.uRevealProgress.value < 0.999) {
          revealStart += delta;
          const t = Math.min(1, revealStart / 0.95);
          uniforms.uRevealProgress.value = 1 - Math.pow(1 - t, 3);
        }

        if (impulseRef.current > 0.001) {
          impulseRef.current = Math.max(0, impulseRef.current - delta * 1.4);
        }

        pointerSmooth.lerp(pointerTarget, 0.07);

        if (modelRoot) {
          const t = shaderElapsed;
          const hoverY = prefersReduced ? 0 : Math.sin(t * 1.35) * 0.08;
          const impulseRot = impulseRef.current * Math.PI * 0.55;
          const targetYRot = -0.32 + pointerSmooth.x * 0.36 + (prefersReduced ? 0 : Math.sin(t * 0.45) * 0.08) + impulseRot;
          const targetXRot = -0.04 + pointerSmooth.y * 0.14;

          modelRoot.position.y = THREE.MathUtils.lerp(modelRoot.position.y, hoverY, 0.1);
          modelRoot.rotation.y = THREE.MathUtils.lerp(modelRoot.rotation.y, targetYRot, 0.09);
          modelRoot.rotation.x = THREE.MathUtils.lerp(modelRoot.rotation.x, targetXRot, 0.09);

          if (uniforms.uRevealProgress.value < 0.999) {
            modelRoot.getWorldPosition(_revealVec);
            _revealVec.project(camera);
            uniforms.uRevealOrigin.value.set(
              (_revealVec.x * 0.5 + 0.5) * camera.aspect,
              _revealVec.y * 0.5 + 0.5
            );
          }
        }

        if (mixer && !prefersReduced) {
          mixer.update(delta * preset.speed);
        }

        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(animate);
      };

      animate();

      return () => {
        disposed = true;
        window.cancelAnimationFrame(rafId);
        if (ro) ro.disconnect();
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('resize', handleResize);
        if (modelRoot) {
          modelRoot.traverse((child) => {
            if (child.isMesh) {
              child.geometry?.dispose?.();
              child.material?.dispose?.();
            }
          });
        }
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      setStatus('fallback');
      return undefined;
    }
  }, [height]);

  const activePreset = MOOD_PRESETS[mood] || MOOD_PRESETS.calm;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
        <span className={`cx-tag ${activePreset.tagClass}`}>
          <span className={`cx-live-dot${mood === 'alert' ? ' is-alert' : mood === 'scanning' ? ' is-scanning' : mood === 'celebrating' ? ' is-celebrating' : ''}`} />
          <span>{badgeLabel || activePreset.label}</span>
        </span>
        <span style={{ fontFamily: 'var(--cx-font-mono)', fontSize: '0.68rem', color: 'var(--cx-muted)' }}>
          {status === 'ready' ? 'NutrIA · PRESENÇA ATIVA' : status === 'fallback' ? 'NutrIA' : 'CONECTANDO NutrIA...'}
        </span>
      </div>

      <div
        ref={mountRef}
        role="button"
        tabIndex={0}
        aria-label="NutrIA — Assistente interativa Nutrivvo — clique para interagir"
        onClick={() => {
          impulseRef.current = 1.0;
          onRobotClick?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            impulseRef.current = 1.0;
            onRobotClick?.();
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: `${height}px`,
          cursor: 'pointer',
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        {status !== 'ready' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                width: '124px',
                height: '124px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'radial-gradient(circle, rgba(0,170,255,0.28), rgba(128,0,255,0.14) 60%, transparent)',
                border: '1px solid rgba(0,145,255,0.32)'
              }}
            >
              <Bot size={44} color="#0066cc" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
