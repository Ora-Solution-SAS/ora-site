import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * GradientRibbonGL — nappe dégradée en WebGL, PORTAGE du second shader de
 * stripe.com fourni par le client (2026-08-06 : « pour l'encadré Extraction,
 * réplique ce design »), recoloré dans la famille de marque.
 *
 * Ce n'est pas un dégradé CSS animé : c'est une VRAIE surface en 3 dimensions,
 * déformée puis vrillée par le GPU, dont la couleur naît de sa géométrie.
 *
 *   displace()  position.y += amount * simplex(x·fx + t, z·fz + t)
 *               → la houle, une seule nappe de bruit qui roule
 *   rotationA/B/C  angle = frequence · expStep(uv, power)
 *               → expStep vaut 1 au bord uv=0 et s'effondre aussitôt : la
 *                 torsion est TOTALE sur une arête et NULLE sur l'autre. C'est
 *                 ce qui donne le pli, pas une rotation d'ensemble.
 *
 * Et la trouvaille du fragment : `pdy = dFdy(v_uv).y · hauteur`, la dérivée
 * écran des coordonnées de texture. Là où la nappe se présente de face, deux
 * pixels voisins portent des uv voisins → pdy faible. Là où elle se replie et
 * fuit vers l'horizon, les uv se compriment → pdy fort. Autrement dit, pdy
 * mesure l'INCLINAISON perçue, gratuitement, sans normale ni lumière. Il sert
 * ensuite à deux choses :
 *   · les stries de bruit ne s'allument que sur les plis (· pdy) ;
 *   · `color += (1 - pdy) · 0.25` délave les parties plates.
 * D'où l'objet caractéristique : un corps presque blanc et une arête vive et
 * saturée qui court dedans.
 *
 * Fonctions reprises telles quelles de la source : `xxhash` (xxHash, Yann
 * Collet, licence BSD 2-clauses), `simplexNoise` (version de Stefan
 * Gustavson), `expStep` et `parabola` (Inigo Quilez), `hueShift` (godotshaders,
 * CC0). La palette, elle, est fabriquée ici : Stripe échantillonne une texture
 * maison, celle-ci est peinte au canvas dans le bleu et le teal d'Ora.
 */

const VERT = /* glsl */ `
uniform float u_time;
uniform float u_speed;
uniform vec2 u_resolution;

uniform float u_twistFrequencyX;
uniform float u_twistFrequencyY;
uniform float u_twistFrequencyZ;
uniform float u_twistPowerX;
uniform float u_twistPowerY;
uniform float u_twistPowerZ;

uniform float u_displaceFrequencyX;
uniform float u_displaceFrequencyZ;
uniform float u_displaceAmount;

varying vec2 v_uv;
varying vec3 v_position;
varying vec2 v_resolution;

float xxhash(vec2 x) {
  uvec2 t = floatBitsToUint(x);
  uint h = 0xc2b2ae3du * t.x + 0x165667b9u;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h += 0xc2b2ae3du * t.y;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h ^= h >> 15u;
  h *= 0x85ebca77u;
  h ^= h >> 13u;
  h *= 0xc2b2ae3du;
  h ^= h >> 16u;
  return uintBitsToFloat(h >> 9u | 0x3f800000u) - 1.0;
}

vec2 hash(vec2 x) {
  float k = 6.283185307 * xxhash(x);
  return vec2(cos(k), sin(k));
}

float simplexNoise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

  return dot(n, vec3(32.99));
}

float expStep(float x, float n) {
  return exp2(-exp2(n) * pow(x, n));
}

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,          oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s, 0.0,
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,          0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

vec3 displace(vec3 pos, float time, float frequencyX, float frequencyZ, float amount) {
  float noise = simplexNoise(vec2(pos.x * frequencyX + time, pos.z * frequencyZ + time));
  pos.y += amount * noise;
  return pos;
}

void main() {
  v_uv = uv;
  v_resolution = u_resolution;

  mat4 rotationA = rotationMatrix(vec3(0.5, 0.0, 0.5), u_twistFrequencyY * expStep(v_uv.x, u_twistPowerY));
  mat4 rotationB = rotationMatrix(vec3(0.0, 0.5, 0.5), u_twistFrequencyX * expStep(v_uv.y, u_twistPowerX));
  mat4 rotationC = rotationMatrix(vec3(0.5, 0.0, 0.5), u_twistFrequencyZ * expStep(v_uv.y, u_twistPowerZ));

  vec3 displaced = displace(position, u_time * u_speed, u_displaceFrequencyX, u_displaceFrequencyZ, u_displaceAmount);

  v_position = displaced;
  v_position = (vec4(v_position, 1.0) * rotationA).xyz;
  v_position = (vec4(v_position, 1.0) * rotationB).xyz;
  v_position = (vec4(v_position, 1.0) * rotationC).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(v_position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D u_paletteTexture;

uniform float u_colorSaturation;
uniform float u_colorContrast;
uniform float u_colorHueShift;

uniform float u_lineStrength;
uniform float u_lineFrequency;
uniform float u_lineAttenuation;
uniform float u_lineParabolaPower;

uniform float u_glowAmount;
uniform float u_glowPower;
uniform float u_glowRamp;

uniform float u_wash;
uniform float u_opacity;

varying vec2 v_uv;
varying vec3 v_position;
varying vec2 v_resolution;

out vec4 outColor;

float xxhash(vec2 x) {
  uvec2 t = floatBitsToUint(x);
  uint h = 0xc2b2ae3du * t.x + 0x165667b9u;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h += 0xc2b2ae3du * t.y;
  h = (h << 17u | h >> 15u) * 0x27d4eb2fu;
  h ^= h >> 15u;
  h *= 0x85ebca77u;
  h ^= h >> 13u;
  h *= 0xc2b2ae3du;
  h ^= h >> 16u;
  return uintBitsToFloat(h >> 9u | 0x3f800000u) - 1.0;
}

vec2 hash(vec2 x) {
  float k = 6.283185307 * xxhash(x);
  return vec2(cos(k), sin(k));
}

float simplexNoise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

  return dot(n, vec3(32.99));
}

float mapLinear(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float parabola(float x, float k) {
  return pow(4.0 * x * (1.0 - x), k);
}

vec3 contrast(in vec3 v, in float a) {
  return (v - 0.5) * a + 0.5;
}

vec3 desaturate(vec3 color, float factor) {
  vec3 lum = vec3(0.299, 0.587, 0.114);
  vec3 gray = vec3(dot(lum, color));
  return mix(color, gray, factor);
}

vec3 hueShift(vec3 color, float shift) {
  vec3 gray = vec3(0.57735);
  vec3 projection = gray * dot(gray, color);
  vec3 U = color - projection;
  vec3 V = cross(gray, U);
  return U * cos(shift) + V * sin(shift) + projection;
}

vec3 surfaceColor(vec2 uv, float pdy) {
  vec3 color = texture(u_paletteTexture, uv).rgb;

  float p = 1.0 - parabola(uv.x, u_lineParabolaPower);
  float n0 = simplexNoise(vec2(uv.x * 0.1, uv.y * 0.5));
  float n1 = simplexNoise(vec2(uv.x * (u_lineFrequency + (u_lineFrequency * 0.5 * n0)), uv.y * 4.0 * n0));
  n1 = mapLinear(n1, -1.0, 1.0, 0.0, 1.0);

  color += (n1 * u_lineStrength * (1.0 - color.b * u_lineAttenuation) * pdy * p);
  return color;
}

void main() {
  // dFdy(v_uv).y x hauteur = la COMPRESSION à l'écran : combien d'unités de
  // texture tiennent dans un pixel. Faible sur une nappe vue de face, monte
  // d'un ordre de grandeur sur un pli qui fuit. La source garde le signe et le
  // ramène par mapLinear(-1,1) ; ici la valeur absolue, parce que l'orientation
  // de nos faces dépend du sens de rotation du maillage et retournerait le
  // rendu au hasard. u_resolution est en pixels PHYSIQUES pour que le réglage
  // ne change pas entre un écran ordinaire et un écran de portable.
  vec2 dy = dFdy(v_uv);
  float pdy = abs(dy.y) * v_resolution.y * u_glowAmount;
  pdy = clamp(pdy, 0.0, 1.0);
  pdy = pow(pdy, u_glowPower);
  pdy = smoothstep(0.0, u_glowRamp, pdy);
  pdy = clamp(pdy, 0.0, 1.0);

  vec3 color = surfaceColor(v_uv, pdy);

  color = contrast(color, u_colorContrast);
  color = desaturate(color, 1.0 - u_colorSaturation);
  color = hueShift(color, u_colorHueShift);
  color += (1.0 - pdy) * u_wash;
  color = clamp(color, 0.0, 1.0);

  // La nappe est posée sur une carte BLANCHE : elle doit s'y dissoudre au
  // lieu de s'arrêter sur une arête franche. Deux fondus, un par axe des uv,
  // et un dernier qui efface d'autant plus que la couleur a déjà viré au
  // blanc — les parties délavées disparaissent, seul le pli reste.
  float edge =
    smoothstep(0.0, 0.40, v_uv.x) * smoothstep(1.0, 0.64, v_uv.x) *
    smoothstep(0.0, 0.36, v_uv.y) * smoothstep(1.0, 0.68, v_uv.y);
  float ink = 1.0 - clamp((color.r + color.g + color.b) / 3.0, 0.0, 1.0);
  float alpha = edge * smoothstep(0.04, 0.34, ink) * u_opacity;

  outColor = vec4(color, alpha);
}
`;

/** Palette peinte au canvas : le `u_paletteTexture` de Stripe, en couleurs
 *  Ora. Traversée horizontale, puis un voile vertical qui éclaircit le haut et
 *  charge le pied, pour que la nappe ait un dessus et un dessous.
 *
 *  REPEINTE le 2026-08-06 : « enlève la couleur violet pour une couleur plus
 *  light de ce style ». Le violet (#6c72ec) et la pervenche violacée (#a9b6f7)
 *  sortent, les quatre teintes données par le client entrent, dans l'ordre où
 *  il les a écrites : pervenche #8FB0EA → bleu ciel #A8D0F1 → bleu glacier
 *  #B8D8F6 → turquoise menthe #7ED7CB. Aucune ne descend sous 55 % de
 *  luminance : c'est ce qui tient le contraste bas et le rendu « verre ».
 *
 *  Le voile vertical perd aussi son plombage marine (#0c2c6e) : sur une gamme
 *  aussi claire, il ramenait une ombre sale au pied de la nappe. */
function makePaletteTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;

  const across = g.createLinearGradient(0, 0, c.width, 0);
  across.addColorStop(0.0, "#eef4fd");
  across.addColorStop(0.16, "#8fb0ea");
  across.addColorStop(0.42, "#a8d0f1");
  across.addColorStop(0.66, "#b8d8f6");
  across.addColorStop(0.86, "#9adcdd");
  across.addColorStop(1.0, "#7ed7cb");
  g.fillStyle = across;
  g.fillRect(0, 0, c.width, c.height);

  const down = g.createLinearGradient(0, 0, 0, c.height);
  down.addColorStop(0.0, "rgba(255,255,255,0.6)");
  down.addColorStop(0.45, "rgba(255,255,255,0)");
  down.addColorStop(1.0, "rgba(96,150,205,0.2)");
  g.fillStyle = down;
  g.fillRect(0, 0, c.width, c.height);

  // HALO de verre : une tache blanche à peine cyanée, très diffuse, posée au
  // centre-bas de la palette. Portée par la nappe elle-même plutôt que par un
  // dégradé CSS derrière, elle se plie avec la surface — c'est ce pli
  // lumineux qui fait le « verre » plutôt qu'un simple voile clair.
  const halo = g.createRadialGradient(
    c.width * 0.5,
    c.height * 0.96,
    0,
    c.width * 0.5,
    c.height * 0.96,
    c.width * 0.52,
  );
  halo.addColorStop(0.0, "rgba(255,255,255,0.92)");
  halo.addColorStop(0.34, "rgba(233,251,253,0.55)");
  halo.addColorStop(0.62, "rgba(214,244,250,0.22)");
  halo.addColorStop(1.0, "rgba(255,255,255,0)");
  g.fillStyle = halo;
  g.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Props = {
  className?: string;
  /** Débordement du canvas par rapport à la carte : au-delà de 1, la nappe est
   *  rognée par les bords, comme les décors « désencadrés » de Stripe. */
  overscan?: number;
};

export default function GradientRibbonGL({ className, overscan = 1.62 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Le canvas SUIT la carte : à taille fixe, une colonne étroite (1024 px de
    // fenêtre) n'en montrait plus que le cœur, donc un aplat saturé sans le
    // délavé qui fait tout le dessin. Le cadrage reste ainsi le même partout.
    const card = host.parentElement;
    const measure = () => {
      const w = card?.clientWidth ?? 440;
      const h = card?.clientHeight ?? 480;
      return {
        w: Math.round(Math.min(880, Math.max(420, w * overscan))),
        h: Math.round(Math.min(600, Math.max(320, h * 1.02))),
      };
    };
    let { w: width, h: height } = measure();

    // `any` et non `THREE.WebGLRenderer` : sans `@types/three`, le module est
    // typé `any` et son espace de noms n'expose aucun type (voir three.d.ts).
    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // pas de contexte WebGL : la carte reste simplement sans décor
    }
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.setClearAlpha(0);
    const canvas = renderer.domElement;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.display = "block";
    host.appendChild(canvas);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.62, 2.35);
    camera.lookAt(0, -0.06, 0);
    const scene = new THREE.Scene();

    // Nappe couchée dans le plan XZ (la source déplace `position.y` en
    // fonction de `position.x` et `position.z`) et FINEMENT segmentée : le pli
    // et les stries vivent dans la géométrie, un maillage grossier les casse.
    const geometry = new THREE.PlaneGeometry(3.4, 2.4, 240, 180);
    geometry.rotateX(-Math.PI / 2);

    const palette = makePaletteTexture();

    const uniforms = {
      u_time: { value: 0 },
      u_speed: { value: 0.00007 },
      u_resolution: { value: new THREE.Vector2(width * dpr, height * dpr) },

      u_twistFrequencyX: { value: 1.35 },
      u_twistFrequencyY: { value: 1.9 },
      u_twistFrequencyZ: { value: -1.05 },
      u_twistPowerX: { value: 2.6 },
      u_twistPowerY: { value: 1.9 },
      u_twistPowerZ: { value: 3.2 },

      u_displaceFrequencyX: { value: 1.15 },
      u_displaceFrequencyZ: { value: 0.85 },
      u_displaceAmount: { value: 0.42 },

      u_paletteTexture: { value: palette },
      u_colorSaturation: { value: 1.08 },
      u_colorContrast: { value: 1.06 },
      u_colorHueShift: { value: 0 },

      u_lineStrength: { value: 0.22 },
      u_lineFrequency: { value: 600 },
      u_lineAttenuation: { value: 0.55 },
      u_lineParabolaPower: { value: 3 },

      // Calé pour que la nappe vue de face retombe vers 0,1 et le pli sature à
      // 1 : c'est l'écart entre les deux qui fait tout le dessin.
      u_glowAmount: { value: 0.11 },
      u_glowPower: { value: 1.15 },
      u_glowRamp: { value: 0.62 },

      // « Fais en sorte que le background de cet encadré soit plus
      // transparent » (client 2026-08-06) : le délavé monte, l'opacité
      // descend d'un tiers. La nappe n'est plus un aplat posé sur la carte,
      // c'est un reflet qui la traverse.
      u_wash: { value: 0.58 },
      u_opacity: { value: 0.6 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      glslVersion: THREE.GLSL3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Boucle, suspendue hors écran ──────────────────────────────────────
    let raf = 0;
    let visible = false;
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      uniforms.u_time.value = now - start;
      renderer.render(scene, camera);
    };

    const renderOnce = () => {
      uniforms.u_time.value = 0;
      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          visible = true;
          if (reduced) renderOnce();
          else raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && visible) {
          visible = false;
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(host);

    // Le canvas est en position absolue : le redimensionner ne peut pas
    // relancer la mesure de la carte, aucune boucle à craindre.
    const ro = new ResizeObserver(() => {
      const next = measure();
      if (next.w === width && next.h === height) return;
      width = next.w;
      height = next.h;
      renderer.setSize(width, height, false);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      uniforms.u_resolution.value.set(width * dpr, height * dpr);
      if (visible && reduced) renderOnce();
    });
    if (card) ro.observe(card);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
      geometry.dispose();
      material.dispose();
      palette.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [overscan]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
