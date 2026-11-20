import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Fullscreen fixed WebGL ASCII atmospheric shader canvas modeled on Clarix's bgScene.
 */
export default function ClarixAsciiField() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    let rafId = 0;
    let bgGeo;
    let bgMat;

    const targetMouse = new THREE.Vector2(0.55, 0.45);
    const shaderUniforms = {
      time: { value: 0 },
      mouse: { value: new THREE.Vector2(0.55, 0.45) },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      bgColor: { value: new THREE.Color(0xf6fafe) },
      colorCyan: { value: new THREE.Color(0x00aaff) },
      colorBlue: { value: new THREE.Color(0x0091ff) },
      colorHotPink: { value: new THREE.Color(0xff0099) },
      colorPeach: { value: new THREE.Color(0xff4d4d) }
    };

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10);
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderUniforms.resolution.value.set(window.innerWidth * dpr, window.innerHeight * dpr);

      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      host.appendChild(renderer.domElement);

      bgGeo = new THREE.PlaneGeometry(2, 2);
      bgMat = new THREE.ShaderMaterial({
        uniforms: shaderUniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.99, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec2 mouse;
          uniform vec3 bgColor;
          uniform vec2 resolution;
          uniform vec3 colorCyan;
          uniform vec3 colorBlue;
          uniform vec3 colorHotPink;
          uniform vec3 colorPeach;
          varying vec2 vUv;

          mat2 rotate2d(float _angle) {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
          }

          void main() {
            float pixelSize = 18.0;
            vec2 screenUv = vUv;
            float aspect = resolution.x / max(resolution.y, 1.0);
            vec2 aspectUv = vec2(screenUv.x * aspect, screenUv.y);

            vec2 gridUv = aspectUv * (resolution.y / pixelSize);
            vec2 localUv = fract(gridUv) - 0.5;

            float wave1 = sin(aspectUv.x * 3.8 - time * 0.65);
            float wave2 = cos(aspectUv.y * 2.8 + time * 0.55);
            float combinedWave = smoothstep(-0.8, 0.8, (wave1 + wave2) * 0.5);
            float wavePeach = sin(aspectUv.y * 2.6 - aspectUv.x * 1.8 + time * 0.75) * 0.5 + 0.5;

            vec3 mixColor = mix(colorBlue, colorCyan, combinedWave);
            vec3 pinkTransition = mix(mixColor, colorHotPink, smoothstep(0.15, 0.78, wavePeach));
            mixColor = mix(pinkTransition, colorPeach, smoothstep(0.55, 1.0, wavePeach));
            vec3 lightGridColor = mix(mixColor, vec3(1.0), 0.68);

            float boxSize = 0.28 + sin(time * 1.6 + gridUv.x * 0.18 + gridUv.y * 0.18) * 0.08;
            float radius = 0.12;
            float d = length(max(abs(localUv) - (boxSize - radius), 0.0)) - radius;
            float alpha = smoothstep(0.06, 0.0, d);

            vec2 radialCenter = mix(vec2(0.5, 0.5), mouse, 0.28);
            float radialMask = smoothstep(0.85, 0.12, distance(screenUv, radialCenter));

            vec2 p = aspectUv * 2.6;
            vec2 mouseAspect = vec2(mouse.x * aspect, mouse.y);
            float mouseDist = distance(aspectUv, mouseAspect);

            float noise = 0.0;
            noise += sin(p.x + time * 0.32) * sin(p.y + time * 0.24);
            p *= rotate2d(1.1);
            noise += sin(p.x * 1.4 - time * 0.42) * sin(p.y * 1.4 + time * 0.18);
            p *= rotate2d(2.3);
            noise += sin(p.x * 1.8 + time * 0.26) * sin(p.y * 1.8 - time * 0.34);
            noise += cos(mouseDist * 11.0 - time * 2.6) * smoothstep(0.55, 0.0, mouseDist) * 1.1;

            float blobMask = smoothstep(0.0, 1.55, noise);
            float cursorHighlight = smoothstep(0.18, 0.0, mouseDist);

            float finalMask = clamp((radialMask * blobMask) + (cursorHighlight * 0.38), 0.0, 1.0);
            float finalAlpha = alpha * finalMask * 0.58;

            vec3 finalColor = mix(bgColor, lightGridColor, finalAlpha);
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false
      });

      const mesh = new THREE.Mesh(bgGeo, bgMat);
      mesh.frustumCulled = false;
      scene.add(mesh);

      const handleMouseMove = (e) => {
        targetMouse.x = e.clientX / Math.max(window.innerWidth, 1);
        targetMouse.y = 1 - e.clientY / Math.max(window.innerHeight, 1);
      };

      const handleResize = () => {
        if (!renderer) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nextDpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(nextDpr);
        renderer.setSize(w, h);
        shaderUniforms.resolution.value.set(w * nextDpr, h * nextDpr);
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      const clock = new THREE.Clock();
      const renderLoop = () => {
        if (!renderer) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        shaderUniforms.time.value += delta;
        shaderUniforms.mouse.value.lerp(targetMouse, 0.06);
        renderer.render(scene, camera);
        if (!prefersReduced) {
          rafId = window.requestAnimationFrame(renderLoop);
        }
      };

      renderLoop();

      return () => {
        window.cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (bgGeo) bgGeo.dispose();
        if (bgMat) bgMat.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode === host) {
            host.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      return undefined;
    }
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 65% 55% at 80% 15%, rgba(0, 170, 255, 0.14), transparent 60%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(255, 0, 153, 0.08), transparent 60%), #f6fafe'
      }}
    />
  );
}
