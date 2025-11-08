import React, { useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import Link from "next/link";

export function GenerativeArtScene() {
  const mountRef = useRef(null);
  const lightRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pitch black background
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 1); // Set clear color to black
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color("#FF4757") },
      },
      vertexShader: `                uniform float time;
                varying vec3 vNormal;
                varying vec3 vPosition;

                // Perlin Noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    vec4 x = x_ * ns.x + ns.yyyy;
                    vec4 y = y_ * ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    vec4 s0 = floor(b0) * 2.0 + 1.0;
                    vec4 s1 = floor(b1) * 2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
                }

                void main() {
                    vNormal = normal;
                    vPosition = position;
                    float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
                    vec3 newPosition = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }`, // (same GLSL code as before)
      fragmentShader: `                uniform vec3 color;
                uniform vec3 pointLightPosition;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                    vec3 normal = normalize(vNormal);
                    vec3 lightDir = normalize(pointLightPosition - vPosition);
                    float diffuse = max(dot(normal, lightDir), 0.0);

                    // Fresnel effect for the glow
                    float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                    fresnel = pow(fresnel, 2.0);

                    vec3 finalColor = color * diffuse + color * fresnel * 0.5;

                    gl_FragColor = vec4(finalColor, 1.0);
                }`, // (same GLSL code as before)
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xff4757, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    let frameId;
    const animate = (t) => {
      material.uniforms.time.value = t * 0.0003;
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      lightRef.current.position.copy(pos);
      material.uniforms.pointLightPos.value = pos;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}

export function AnomalousMatterHero({
  title = "Observation Log: Anomaly 7",
  subtitle = "Matter in a state of constant, beautiful flux.",
  description = "A new form of digital existence has been observed. It responds to stimuli, changes form, and exudes an unknown energy. Further study is required.",
}) {
  return (
    <section
      role="banner"
      className="relative w-full h-screen bg-black text-white overflow-hidden flex flex-col"
    >
      <Suspense fallback={<div className="w-full h-full bg-black" />}>
        <GenerativeArtScene />
      </Suspense>

      {/* Logo - Top Left */}
      <div className="absolute top-18 left-8 md:top-22 md:left-12 z-30 flex items-center gap-2.5 opacity-0 animate-fade-in">
        <div className="relative w-8 h-8 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 120"
            className="w-full h-full"
          >
            {/* DiliGenie Logo - Elegant Flame */}
            <defs>
              <linearGradient
                id="flameGrad1"
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#FF6B6B", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#D63031", stopOpacity: 1 }}
                />
              </linearGradient>
              <linearGradient
                id="flameGrad2"
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: "#FF4757", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#C23030", stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            {/* Main flame curves */}
            <path
              d="M 35 90 Q 30 70 30 50 Q 30 30 40 15 Q 45 5 50 0 Q 55 5 60 15 Q 70 30 70 50 Q 70 70 65 90 Q 60 100 50 105 Q 40 100 35 90 Z"
              fill="url(#flameGrad1)"
            />
            <path
              d="M 42 85 Q 38 70 38 55 Q 38 40 45 25 Q 48 18 50 15 Q 52 18 55 25 Q 62 40 62 55 Q 62 70 58 85 Q 55 92 50 95 Q 45 92 42 85 Z"
              fill="url(#flameGrad2)"
              opacity="0.9"
            />
            <path
              d="M 46 75 Q 44 65 44 55 Q 44 45 48 35 Q 49 30 50 28 Q 51 30 52 35 Q 56 45 56 55 Q 56 65 54 75 Q 53 80 50 82 Q 47 80 46 75 Z"
              fill="#FF8A80"
              opacity="0.7"
            />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold text-white leading-none">
            DiliGenie
          </h1>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none" />
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-5xl px-6 animate-fade-in-long -mt-20">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
            Meet DiliGenie ΓÇö Your AI Copilot for Intelligent Conversations.
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-base md:text-lg leading-relaxed text-white drop-shadow-[0_3px_10px_rgba(0,0,0,1)]">
            Powered by Retrieval-Augmented Generation, DiliGenie helps you chat
            with your documents, automate tasks, and generate insights ΓÇö all in
            one conversational workspace.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex gap-4 justify-center items-center flex-wrap">
            <Link href="/chat">
              <button className="group relative px-8 py-3.5 bg-transparent text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all hover:scale-105 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                <span className="relative z-10 flex items-center gap-2">
                  Explore DiliGenie
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="group relative px-8 py-3.5 bg-transparent text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all hover:scale-105 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-30 w-full py-3 px-4 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-4 text-base text-gray-400 flex-wrap justify-center">
            <span className="text-gray-400">Powered by Diligent</span>
            <span>ΓÇó</span>
            <span>┬⌐ 2025 DiliGenie</span>
            <span>ΓÇó</span>
            <span className="flex items-center gap-1">
              Made with <span className="text-[#FF4757]">Γ¥ñ∩╕Å</span> by{" "}
              <span className="text-[#FF6B6B] font-semibold">Krishna</span>
            </span>
            <span>ΓÇó</span>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/mrkrisshu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#FF6B6B] transition-colors"
                aria-label="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/krishna-bantola-74b7b6202/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#FF6B6B] transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://krishnabantola.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#FF6B6B] transition-colors"
                aria-label="Portfolio"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11z" />
                  <path d="M0 0h24v24H0z" fill="none" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
