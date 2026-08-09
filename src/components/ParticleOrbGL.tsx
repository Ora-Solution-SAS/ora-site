import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ParticleOrbGL — anneau de particules en WebGL, PORTAGE du shader de
 * stripe.com fourni par le client (2026-08-06 : « réplique exactement ça mais
 * en bleu »), recoloré dans le bleu de marque.
 *
 * Les approximations SVG précédentes calculaient un semis figé ; ici c'est le
 * GPU qui déplace chaque particule, image par image, exactement selon leur
 * mathématique :
 *
 *   dir        = normalize(-pos)      → tout déplacement vise le CENTRE
 *   noiseInner = simplex(pos * 0.25)  → grain fin, la texture de l'anneau
 *   noiseOuter = simplex(pos * 0.07)  → houle large, la respiration
 *   pos += dir * noiseInner * 100 * pow(random, scatterPower)
 *   pos  = mix(pos, position, mouseDistance * mouseStrength + noiseOuter * 0.5)
 *
 * Le `pow(random, scatterPower)` est la clef du rendu : la plupart des
 * particules bougent à peine, une minorité part très loin. C'est ce qui donne
 * les mèches organiques qu'aucun semis aléatoire uniforme ne reproduit.
 *
 * Le `mix` final RAPPELLE les particules vers leur position d'origine autour
 * du curseur : l'anneau se recompose sous la souris, et se disperse à nouveau
 * quand elle s'éloigne. C'est leur interaction, conservée telle quelle.
 *
 * Fonctions de bruit : le `random` glsl est le one-liner classique (Rey,
 * 1998, popularisé via StackOverflow), `xxhash` vient de xxHash (Yann Collet,
 * licence BSD 2-clauses) et `simplexNoise` est la version de Stefan
 * Gustavson. Toutes trois sont publiées et réimplémentées partout.
 *
 * Les uniformes « thinking » de l'original pilotent chez eux les états de
 * leur assistant. Ici, aucun état de ce genre : le vecteur tourne lentement
 * avec une force faible, ce qui produit un renflement qui se promène autour
 * de l'anneau. La mathématique est intacte, seule son alimentation change.
 *
 * DEUX VARIANTES depuis le 2026-08-06 (client : « réplique ce design, mais que
 * cela forme une sorte de galaxie plutôt qu'une planète ») :
 *   `orb`     l'anneau d'origine, inchangé au pixel près ;
 *   `galaxy`  même shader, même interaction, mais un semis en spirale, un
 *             disque incliné, une rotation différentielle et une couleur qui
 *             suit le rayon. Tous les ajouts sont neutres quand `u_swirl` et
 *             `u_galaxy` valent zéro : l'anneau ne peut pas régresser.
 */

const VERT = /* glsl */ `
uniform vec2 u_resolution;
uniform vec2 u_mousePosition;
uniform float u_mouseStrength;
uniform float u_scatterPower;
uniform float u_thinkingStrength;
uniform vec2 u_thinkingVector;
uniform float u_pointSize;
uniform float u_pixelRatio;
uniform float u_time;
/* Variante GALAXIE (voir plus bas) : angle de rotation de référence, rayon du
 * disque. À zéro, le shader se comporte exactement comme l'anneau d'origine. */
uniform float u_swirl;
uniform float u_discRadius;
/* Variante PLANÈTE : 1 pour l'activer, et l'angle de rotation propre. */
uniform float u_planet;
uniform float u_spin;
/* Drapeau GALAXIE, 1 quand la variante est active. Declare ICI parce que le
 * resserrement au curseur s en sert dans CE shader : un uniform utilise sans
 * declaration dans son etage fait echouer la compilation du programme entier,
 * et les DEUX decors disparaissent — deja paye le 2026-08-08. Ne pas le
 * remplacer par un test sur u_swirl, qui part de zero et croit avec le temps.
 * (Sans accents ni backticks : ce bloc vit dans un template literal.) */
uniform float u_galaxy;

varying float v_radial;
varying float v_random;
varying float v_alpha;
/** 0 = océan, 1 = plein continent. Calculé dans le repère de la PLANÈTE. */
varying float v_land;
/** 1 face au regard, 0 sur la face cachée. */
varying float v_facing;

const float DESIGN_PIXEL_RATIO = 2.0;

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
float random(in vec3 pos) {
  return fract(sin(dot(pos.xyz, vec3(70.9898, 78.233, 32.4355))) * 43758.5453123);
}

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

/* ── BRUIT 3D, pour dessiner des continents ────────────────────────────────
 * Le bruit simplex du fichier est PLAN : il ne sait rien de la troisième
 * dimension, et une planète texturée avec lui montrerait ses coutures dès
 * qu'elle tourne. D'où ce bruit de valeur en volume : hachage aux huit coins
 * d'une maille cubique, interpolation lissée entre eux. Il est échantillonné sur
 * la position D'ORIGINE du point, donc dans le repère de la planète — c'est ce
 * qui fait que les terres tournent AVEC elle au lieu de défiler dessous.
 */
float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n000 = random(i);
  float n100 = random(i + vec3(1.0, 0.0, 0.0));
  float n010 = random(i + vec3(0.0, 1.0, 0.0));
  float n110 = random(i + vec3(1.0, 1.0, 0.0));
  float n001 = random(i + vec3(0.0, 0.0, 1.0));
  float n101 = random(i + vec3(1.0, 0.0, 1.0));
  float n011 = random(i + vec3(0.0, 1.0, 1.0));
  float n111 = random(i + vec3(1.0, 1.0, 1.0));
  return mix(
    mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
    mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
    f.z
  );
}

/* Quatre octaves : la première donne la masse des continents, les suivantes
 * découpent les côtes. Sans elles, on obtient des taches rondes qui ne se
 * lisent pas comme des terres. */
float fbm3(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

void main() {
  vec3 pos = position;

  // Semis tiré de la position D'ORIGINE, jamais du pos courant : sur la
  // galaxie il tourne à chaque image, et un semis qui suivrait ferait
  // clignoter la taille et l'opacité de chaque étoile.
  v_random = random(position.xy);
  v_alpha = random(position.yz);
  // Valeurs neutres pour les deux autres variantes : une varying laissée non
  // assignée sur un chemin d'exécution vaut n'importe quoi.
  v_land = 0.0;
  v_facing = 1.0;

  // ── PLANÈTE ────────────────────────────────────────────────────────────
  // Chemin court et séparé : aucun des déplacements de bruit de l'anneau ne
  // s'applique ici. Une planète dont la surface se disperse cesse d'être une
  // sphère, et c'est exactement ce que fait le reste de ce shader.
  if (u_planet > 0.5) {
    // Rotation propre autour de l'axe vertical. Le semis reste immobile dans
    // le tampon : c'est le shader qui fait tourner, donc rien à re-téléverser.
    float cs = cos(u_spin);
    float sn = sin(u_spin);
    vec3 p = vec3(position.x * cs + position.z * sn, position.y, -position.x * sn + position.z * cs);

    vec3 nrm = normalize(position);
    // Seuil sur le bruit : au-dessus, la terre ; en dessous, l'eau. La bande de
    // transition est étroite, sinon les côtes bavent et tout devient une brume.
    float h = fbm3(nrm * 1.75 + vec3(11.3, 4.7, 21.9));
    v_land = smoothstep(0.44, 0.56, h);

    // Face cachée : elle s'éteint au lieu d'être supprimée. Un demi-globe net
    // se lirait comme un disque ; une extinction progressive donne le volume.
    v_facing = smoothstep(-0.45, 0.30, normalize(p).z);

    v_radial = clamp(length(p.xy) / max(u_discRadius, 1.0), 0.0, 1.0);

    vec4 mp = modelMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewMatrix * mp;
    // Les terres portent des grains plus gros que l'océan : c'est la densité
    // apparente qui dessine les masses, autant que la couleur.
    gl_PointSize = (0.9 + u_pointSize * (0.35 + 0.65 * v_random) * (0.55 + 0.75 * v_land))
      * (u_pixelRatio / DESIGN_PIXEL_RATIO);
    return;
  }

  float rad = length(position.xy);
  v_radial = clamp(rad / max(u_discRadius, 1.0), 0.0, 1.0);

  // ── ROTATION DIFFÉRENTIELLE, la signature d'une galaxie ────────────────
  // Un disque solide tournerait d'un bloc et ne serait qu'un anneau qui
  // pivote. Ici la vitesse angulaire décroît avec le rayon : le cœur fait
  // presque trois tours quand le bord en fait un. Les bras s'enroulent donc
  // d'eux-mêmes au fil du temps, comme dans une vraie spirale.
  if (u_swirl != 0.0) {
    float w = u_swirl * (u_discRadius / (rad + u_discRadius * 0.42));
    float cs = cos(w);
    float sn = sin(w);
    pos.xy = mat2(cs, -sn, sn, cs) * pos.xy;
  }

  // Le renflement central porte des particules SUR l'origine : normalize y
  // donnerait un NaN, et un NaN en position efface le point.
  vec3 dir = length(pos) > 0.001 ? normalize(-pos) : vec3(0.0);

  float speedInner = u_time * 0.00004;
  float speedOuter = u_time * 0.00004;
  float noiseInner = simplexNoise(vec2(pos.x * 0.25 + speedInner, pos.y * 0.25 + speedInner));
  float noiseOuter = simplexNoise(vec2(pos.x * 0.07 + speedOuter, pos.y * 0.07 + speedOuter));

  float thinkingAlignment = dot(vec3(u_thinkingVector, 0.0), normalize(vec3(pos.x, pos.y, 0.0)));
  thinkingAlignment = pow(clamp(thinkingAlignment, 0.0, 1.0), 3.0) * u_thinkingStrength;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  float mouseDistance = distance(u_mousePosition, modelPosition.xy) / u_resolution.x;
  // Zone du curseur RETRECIE le 2026-08-08 au soir (client : « pas une grosse
  // portion de l'anneau, vraiment une toute petite portion ») : 0,09 de la
  // largeur du canvas au lieu de 0,2, soit ~68 px sur la carte. La zone et la
  // force sont deux reglages independants — la demande precedente avait
  // echoue en elargissant la zone pour chercher de la force.
  mouseDistance = smoothstep(0.09, 0.0, mouseDistance);

  pos += dir * noiseInner * 100.0 * pow(v_random, u_scatterPower + (u_scatterPower * thinkingAlignment));
  pos += dir * noiseInner * 20.0 * thinkingAlignment;
  pos += dir * noiseOuter * 5.0 * thinkingAlignment;
  pos = mix(pos, position, mouseDistance * u_mouseStrength + noiseOuter * 0.5);

  // LE RESSERREMENT LOCAL, meme date. Le mix ci-dessus ne peut que RENDRE a la
  // particule sa position de repos : sous le curseur l'anneau redevient net,
  // il ne devient pas plus serre. Pour serrer vraiment, la particule est tiree
  // sur la circonference exacte : le semis de +/-4,5 pour cent se resorbe et
  // la bande floue devient un trait, uniquement dans la petite zone.
  // SANS CONTRACTION depuis le 2026-08-08 au soir (client : « pas que le
  // cercle se deforme, juste que les particules se resserrent ») : la version
  // precedente contractait aussi le rayon de 12 pour cent, et c est cette
  // rentree locale qui se lisait comme une deformation du cercle. Le rayon
  // vise est donc u_discRadius TEL QUEL — le cercle garde sa forme, seule
  // l epaisseur de la couronne fond. La GALAXIE est exclue : ses bras
  // tiennent a leur geometrie, les rabattre sur un cercle les effacerait.
  // (Pas de backticks ni d accents dans ce bloc : template literal, et le
  // drapeau u_galaxy DOIT etre declare dans CE shader — les deux pieges ont
  // deja ete payes, voir la note memoire glsl-template-literal-backticks.)
  float grip = clamp(mouseDistance * u_mouseStrength, 0.0, 1.0);
  if (u_galaxy < 0.5 && grip > 0.001) {
    float rad2 = length(pos.xy);
    vec2 radial = rad2 > 0.001 ? pos.xy / rad2 : vec2(0.0);
    vec2 serre = radial * u_discRadius;
    pos.xy = mix(pos.xy, serre, grip * 0.95);
    pos.z = mix(pos.z, 0.0, grip * 0.95);
  }

  vec4 finalModelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * finalModelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_PointSize = (1.0 + u_pointSize * v_random) * (u_pixelRatio / DESIGN_PIXEL_RATIO);
  gl_Position = projectedPosition;
}
`;

/* Fragment : pastille ronde à bord fondu, teintée dans les bleus de marque.
 * Le fragment de Stripe colore ses particules par un DÉGRADÉ VERTICAL en
 * espace écran (`mix(colorTop, colorBot, 1.0 - st.y)`), pas par une valeur
 * propre à chaque point — c'est ce qui soude la nuée en un seul objet au lieu
 * d'un confetti multicolore. Même mécanique ici, entre #60a5fa en haut et
 * #1d4ed8 en pied ; la variation par particule ne sert plus qu'à éclaircir
 * une minorité de points et à poser quelques éclats blancs. */
const FRAG = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_galaxy;
uniform float u_planet;

varying float v_radial;
varying float v_random;
varying float v_alpha;
varying float v_land;
varying float v_facing;

out vec4 outColor;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.12, d);
  if (mask <= 0.001) discard;

  // ── PLANÈTE : les continents se lisent à l'ENCRE ET À LA DENSITÉ ───────
  // Deux bleus seulement, ceux de l'anneau. Les terres prennent le profond
  // #1d4ed8 et presque toute l'opacité ; l'océan garde le pâle #93b8f8 à peine
  // posé, assez pour que la sphère existe entre les continents mais pas assez
  // pour la remplir. C'est cet écart qui dessine les côtes, pas un contour.
  if (u_planet > 0.5) {
    vec3 terre = vec3(0.114, 0.306, 0.847);  // #1d4ed8
    vec3 mer   = vec3(0.576, 0.722, 0.976);  // #93b8f8
    vec3 pcol = mix(mer, terre, v_land);
    // Un liseré clair sur le bord du globe : la tranche accroche la lumière,
    // et c'est elle qui empêche la sphère de se lire comme un disque plat.
    pcol = mix(pcol, vec3(0.729, 0.831, 0.996), smoothstep(0.72, 1.0, v_radial) * 0.5);
    float palpha = mask * v_facing * mix(0.1, 0.92, v_land) * (0.5 + 0.5 * v_alpha);
    outColor = vec4(pcol, palpha);
    return;
  }

  // ── GALAXIE : la couleur suit le RAYON, pas la hauteur d'écran ─────────
  // Sur une carte blanche, un noyau clair serait un trou. La densité se lit
  // donc à l'encre : bleu profond au cœur, bleu de marque dans les bras,
  // bleu pâle qui se dissout au bord.
  if (u_galaxy > 0.5) {
    vec3 core = vec3(0.114, 0.306, 0.847);  // #1d4ed8
    vec3 arm  = vec3(0.231, 0.510, 0.965);  // #3b82f6
    vec3 rim  = vec3(0.576, 0.722, 0.976);  // #93b8f8
    vec3 gcol = mix(core, arm, smoothstep(0.03, 0.40, v_radial));
    gcol = mix(gcol, rim, smoothstep(0.42, 1.0, v_radial));
    // Une poignée d'étoiles teal, la même pointe que le reste de la grille.
    gcol = mix(gcol, vec3(0.176, 0.831, 0.749), step(0.993, v_random) * 0.6);
    float galpha = mask * (0.26 + 0.74 * v_alpha) * (1.0 - 0.5 * smoothstep(0.45, 1.0, v_radial));
    outColor = vec4(gcol, galpha);
    return;
  }

  vec2 st = gl_FragCoord.xy / u_resolution;

  // Le HAUT du canvas est la seule moitié qui dépasse de la maquette : c'est
  // lui qui porte le bleu de marque franc, le fond de gamme descend vers le
  // bas où il n'est plus qu'entrevu.
  vec3 colorTop = vec3(0.231, 0.510, 0.965);  // #3b82f6
  vec3 colorBot = vec3(0.114, 0.306, 0.847);  // #1d4ed8
  vec3 col = mix(colorTop, colorBot, 1.0 - st.y);
  // Une minorité de particules vire au bleu clair, une poignée au blanc :
  // le grain reste lisible sans casser le dégradé d'ensemble.
  col = mix(col, vec3(0.576, 0.772, 0.992), smoothstep(0.78, 1.0, v_random) * 0.45);
  col = mix(col, vec3(1.0), step(0.972, v_alpha) * 0.7);

  float alpha = mask * (0.32 + 0.68 * v_alpha);
  outColor = vec4(col, alpha);
}
`;

/** Générateur pseudo-aléatoire DÉTERMINISTE (mulberry32) : la galaxie est la
 *  même à chaque montage et pour tous les visiteurs. L'anneau, lui, garde le
 *  `Math.random` de la source — son semis est noyé par le shader de toute
 *  façon. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semis de GALAXIE SPIRALE (client 2026-08-06 : « réplique ce design, mais
 *  que cela forme une sorte de galaxie plutôt qu'une planète »).
 *
 *  Trois populations, comme dans une vraie galaxie, et c'est leur superposition
 *  qui fait qu'on la reconnaît :
 *    · le RENFLEMENT central, blob dense et sans structure ;
 *    · le DISQUE, où les étoiles se rangent le long de bras en spirale
 *      logarithmique — l'angle croît avec le rayon, d'où l'enroulement ;
 *    · le HALO, une minorité d'étoiles semées loin et au hasard, qui empêche
 *      le disque de s'arrêter sur un bord net.
 *
 *  La dispersion autour des bras S'OUVRE avec le rayon : serrés près du cœur,
 *  effilochés au bord. Un écart constant donnerait deux rubans dessinés au
 *  compas. */
function galaxyPositions(count: number, R: number, ARMS: number) {
  const rnd = mulberry32(20260806);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  /** Enroulement du cœur au bord. Trop serré, les bras se confondent en un
   *  disque ; trop lâche, ce sont deux virgules. */
  const TWIST = 5.5;
  // Renflement ALLÉGÉ quand la spirale a plus de deux bras : à trois, un cœur
  // dense écrase les courbes et la galaxie se lit comme une tache. Moins de
  // matière au centre, elle se lit comme des trajectoires.
  const BULGE = ARMS > 2 ? 0.1 : 0.2;
  // Halo DOUBLÉ au-delà de deux bras : ce sont les étoiles semées large et au
  // hasard qui donnent la dispersion, pas l'écartement des bras eux-mêmes —
  // écarter les bras finit par les fondre entre eux.
  // REDESCENDU de 0,16 à 0,11 le 2026-08-08 au soir (client : « un peu plus en
  // forme de galaxie ») : le halo était devenu si fourni que la spirale se
  // lisait comme une brume à peine structurée. Un point sur neuf hors des bras
  // suffit à casser le bord net, sans noyer les courbes.
  const HALO = ARMS > 2 ? 0.11 : 0.07;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const q = rnd();
    let r: number;
    let a: number;
    if (q < BULGE) {
      r = R * (ARMS > 2 ? 0.2 : 0.13) * Math.pow(rnd(), 0.4);
      a = rnd() * Math.PI * 2;
    } else if (q < BULGE + HALO) {
      r = R * (0.4 + rnd() * (ARMS > 2 ? 1.15 : 0.9));
      a = rnd() * Math.PI * 2;
    } else {
      const t = Math.pow(rnd(), 0.78);
      r = R * (0.05 + t * 1.0);
      const arm = Math.floor(rnd() * ARMS) * ((Math.PI * 2) / ARMS);
      // Dispersion autour des bras RESSERRÉE à trois bras et plus (0,4 → 0,26,
      // même passage que le halo ci-dessus) : c'est l'écart-type qui décide si
      // l'œil voit des COURBES ou un disque grumeleux. Le resserrement ne vaut
      // que loin du cœur — près du centre les bras se confondent de toute
      // façon, par construction de la spirale.
      a = arm + TWIST * Math.pow(r / R, 0.7) + gauss() * (0.1 + (ARMS > 2 ? 0.26 : 0.24) * (r / R));
    }
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r;
    pos[i * 3 + 2] = gauss() * R * 0.02;
  }
  return pos;
}

type Props = {
  className?: string;
  /** Côté du canvas en pixels CSS. */
  size?: number;
  /** Nombre de particules. */
  count?: number;
  /** Rayon de l'anneau au repos, en fraction du côté. */
  radius?: number;
  /** Exposant de dispersion : plus il est haut, plus rares sont les
   *  particules qui partent loin. */
  scatterPower?: number;
  /** `orb` = l'anneau d'origine. `galaxy` = spirale à bras, disque incliné,
   *  rotation différentielle, palette au rayon. `planet` = sphère en semis de
   *  Fibonacci, rotation propre autour d'un axe penché, continents dessinés par
   *  un bruit 3D échantillonné dans le repère de la planète (client 2026-08-07 :
   *  « plutôt qu'une galaxie, une planète qui tourne avec les continents formés
   *  par les particules »). */
  variant?: "orb" | "galaxy" | "planet";
  /** Diamètre du point, avant modulation par le semis. */
  pointSize?: number;
  /** Multiplicateur de VITESSE de toute l'animation : houle du bruit, ronde
   *  du renflement, rotation différentielle. Sous 1, tout ralentit dans les
   *  mêmes proportions — c'est ce qui compte : ralentir une seule des trois
   *  laisserait les deux autres s'agiter par-dessus une base immobile, et le
   *  décor paraîtrait plus nerveux, pas moins. */
  motion?: number;
  /** Nombre de BRAS de la spirale (`variant: "galaxy"`). À deux, la galaxie
   *  se lit comme une paire de virgules ; à trois ou quatre, comme plusieurs
   *  courbes qui s'enroulent — c'est la lecture demandée pour « Structure »
   *  (client 2026-08-07 : « une sorte de courbe, ou plusieurs petites qui
   *  forment comme une galaxie »). */
  arms?: number;
};

export default function ParticleOrbGL({
  className,
  size = 620,
  // RESSERRÉ le 2026-08-06 (client : « un tout petit peu plus compacté,
  // l'espace vide au milieu un peu plus petit, et le bleu un peu plus fort ») :
  // l'anneau au repos perd un cinquième de son rayon, la dispersion (± 100 px,
  // constante du shader) reste la même — la couronne est donc proportionnellement
  // plus épaisse et le trou central plus petit. La densité suit, sinon le
  // resserrement se paierait en semis clairsemé.
  count = 8200,
  radius = 0.225,
  // Exposant relevé : la poussière lointaine se raréfie, la couronne se tient.
  scatterPower = 4.6,
  variant = "orb",
  pointSize = 4.6,
  arms = 2,
  motion = 1,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // `any` et non `THREE.WebGLRenderer` : sans `@types/three`, le module est
    // typé `any` et son espace de noms n'expose aucun type (voir three.d.ts).
    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // pas de contexte WebGL : la carte reste simplement sans décor
    }
    renderer.setPixelRatio(dpr);
    renderer.setSize(size, size, false);
    renderer.setClearAlpha(0);
    const canvas = renderer.domElement;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    canvas.style.display = "block";
    host.appendChild(canvas);

    // Repère en PIXELS : les constantes du shader (100, 20, 5) sont calées
    // dessus, une caméra normalisée les rendrait absurdes.
    const half = size / 2;
    const camera = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 1000);
    camera.position.z = 10;
    const scene = new THREE.Scene();

    // Anneau de départ, volontairement PROPRE : c'est le shader qui crée le
    // désordre. Une géométrie déjà bruitée doublerait le bruit et brouillerait
    // les mèches. La galaxie, elle, tient sa structure de sa géométrie — ses
    // bras ne peuvent pas naître d'un bruit.
    const galaxy = variant === "galaxy";
    const planet = variant === "planet";
    const R = size * radius;
    let positions: Float32Array;
    if (planet) {
      // ── SEMIS DE FIBONACCI, et pas un tirage au sort ────────────────────
      // Tirer deux angles au hasard entasse les points aux pôles : la sphère
      // se met à briller en haut et en bas et paraît creuse à l'équateur. La
      // spirale de Fibonacci répartit les points à distance quasi égale sur
      // toute la surface, ce qui est exactement ce qu'il faut pour que la
      // densité ne raconte QUE les continents.
      positions = new Float32Array(count * 3);
      const GOLDEN = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const ring = Math.sqrt(Math.max(0, 1 - y * y));
        const th = GOLDEN * i;
        positions[i * 3] = Math.cos(th) * ring * R;
        positions[i * 3 + 1] = y * R;
        positions[i * 3 + 2] = Math.sin(th) * ring * R;
      }
    } else if (galaxy) {
      positions = galaxyPositions(count, R, arms);
    } else {
      positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = R * (1 + (Math.random() - 0.5) * 0.09);
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = Math.sin(a) * r;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const uniforms = {
      u_resolution: { value: new THREE.Vector2(size, size) },
      u_mousePosition: { value: new THREE.Vector2(1e5, 1e5) },
      u_mouseStrength: { value: 0 },
      u_scatterPower: { value: scatterPower },
      u_thinkingStrength: { value: 0.35 },
      u_thinkingVector: { value: new THREE.Vector2(0, 1) },
      u_pointSize: { value: pointSize },
      u_pixelRatio: { value: dpr },
      u_time: { value: 0 },
      u_swirl: { value: 0 },
      u_discRadius: { value: R },
      u_galaxy: { value: galaxy ? 1 : 0 },
      u_planet: { value: planet ? 1 : 0 },
      u_spin: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
      glslVersion: THREE.GLSL3,
    });

    const points = new THREE.Points(geometry, material);
    if (galaxy) {
      // Le disque est vu DE BIAIS : écrasé sur un axe puis penché. L'écrasement
      // vit sur la matrice de l'objet, pas dans la géométrie, pour que la
      // rotation différentielle du shader tourne bien dans le PLAN du disque.
      // Semée déjà aplatie, la spirale se déformerait à chaque tour.
      // Disque MOINS écrasé qu'au premier réglage : à 0,44 la spirale se
      // lisait comme une traînée diagonale, ses bras confondus. À 0,62 ils se
      // séparent et se lisent comme des courbes.
      points.scale.set(1, 0.62, 1);
      points.rotation.z = -0.42;
    }
    if (planet) {
      // Axe INCLINÉ, comme celui d'une vraie planète. Sans cette inclinaison on
      // voit un globe posé bien droit, et le regard le lit comme un cercle
      // plutôt que comme un corps : c'est le pôle légèrement de biais qui donne
      // l'orientation, donc le volume. La rotation propre, elle, vit dans le
      // shader et tourne autour de l'axe vertical LOCAL, celui qui vient d'être
      // penché ici.
      points.rotation.z = -0.34;
      points.rotation.x = 0.16;
    }
    scene.add(points);

    /* ── Souris : l'anneau se recompose sous le curseur ──────────────────────
     * ADOUCI EN PROFONDEUR le 2026-08-07 (« je veux que l'anneau de particules
     * soit bien plus smooth quand l'utilisateur passe son curseur dessus »).
     * Trois causes se cumulaient, et corriger une seule n'aurait rien donné :
     *
     * 1. LE POINT DE RÉFÉRENCE SAUTAIT. La position brute du curseur était
     *    envoyée telle quelle au shader, donc la zone recomposée se téléportait
     *    d'une image à l'autre. Elle est maintenant POURSUIVIE : une position
     *    lissée court après la vraie, avec ~90 ms de retard. C'est ce retard
     *    qu'on lit comme de la douceur.
     * 2. LA CADENCE ÉTAIT PLAFONNÉE À 30 Hz. Justifié pour une dérive de fond,
     *    intenable pour un effet qui suit un curseur : à 30 Hz on VOIT les
     *    paliers. Le plafond passe à 60 pendant le survol seulement (voir la
     *    boucle), donc le budget économisé au repos est intact.
     * 3. LES LISSAGES DÉPENDAIENT DE LA CADENCE. Un facteur fixe par image
     *    donne deux vitesses différentes à 30 et à 60 Hz — l'effet aurait changé
     *    de caractère au moment même où l'on entre. Ils sont réécrits en
     *    exponentielle sur le temps écoulé, donc identiques à toute cadence.
     */
    /** Position VISÉE, brute, celle du curseur. */
    const mouseCible = new THREE.Vector2(1e5, 1e5);
    /** Position SUIVIE, lissée, celle qui part au shader. */
    const mouse = new THREE.Vector2(1e5, 1e5);
    let wantStrength = 0;
    let survol = false;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseCible.set(e.clientX - r.left - half, -(e.clientY - r.top - half));
      // PREMIER CONTACT : on téléporte au lieu de lisser. La position suivie
      // repose à 1e5, très loin hors du cadre ; la laisser rejoindre le curseur
      // en glissant ferait traverser tout l'anneau par une vague d'entrée que
      // personne n'a demandée.
      if (!survol) mouse.copy(mouseCible);
      survol = true;
      wantStrength = 1;
    };
    const onLeave = () => {
      survol = false;
      wantStrength = 0;
    };
    const target = host.parentElement ?? host;
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerleave", onLeave);

    // ── Boucle, suspendue hors écran ──────────────────────────────────────
    let raf = 0;
    let visible = false;
    const start = performance.now();

    // ── Boucle plafonnée à 30 images par seconde ──────────────────────────
    // Ces décors dérivent très lentement (facteur `motion` à 0,15 sur la
    // galaxie) : à 60 Hz, une image sur deux est identique à la précédente à
    // l'œil nu, mais chacune coûte un appel de dessin et un rendu WebGL. La
    // page en fait tourner DEUX en même temps, et son défilement est piloté
    // par Lenis, donc sur le thread principal : tout ce qu'on lui rend, il le
    // rend au scroll. La rAF continue de cadencer, on se contente de sauter
    // le rendu une image sur deux.
    // 30 au repos, PLEINE CADENCE SOUS LE CURSEUR : la dérive de fond ne mérite
    // pas la pleine cadence, un effet qui suit la souris si. Le surcoût ne dure
    // que le temps du survol, et un seul décor est survolé à la fois.
    // DÉPLAFONNÉ le 2026-08-09 (client : « rendre l'animation du hover plus
    // smooth ») : le plafond de survol était à 60 Hz, or les Mac récents
    // affichent à 120 — l'écran passait donc une image sur deux, et c'est un
    // plafond de cadence qu'aucun réglage d'inertie ne peut compenser. À 8 ms,
    // la rAF cadence naturellement à la fréquence de l'écran (les lissages
    // étant exponentiels sur le temps écoulé, la vitesse perçue ne change pas).
    const INTERVALLE_REPOS = 1000 / 30;
    const INTERVALLE_SURVOL = 8;
    let dernier = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - dernier < (survol ? INTERVALLE_SURVOL : INTERVALLE_REPOS)) return;
      // Borné à 100 ms : au retour d'un onglet en arrière-plan, `now - dernier`
      // vaut plusieurs secondes et ferait converger les lissages d'un coup,
      // c'est-à-dire sauter.
      const dt = Math.min(now - dernier, 100) / 1000;
      dernier = now;
      uniforms.u_time.value = (now - start) * motion;
      // Le renflement fait lentement le tour de l'anneau.
      const t = (now - start) * 0.00006 * motion;
      uniforms.u_thinkingVector.value.set(Math.cos(t), Math.sin(t));
      // Une révolution du BORD toutes les ~3 minutes ; le cœur, lui, en fait
      // presque trois dans le même temps.
      if (galaxy) uniforms.u_swirl.value = (now - start) * 0.000035 * motion;
      // Un tour de planète en ~72 secondes à `motion` plein. Assez lent pour
      // qu'on ne surprenne jamais le mouvement, assez vif pour qu'un continent
      // ait changé de place quand le regard revient sur la carte.
      if (planet) uniforms.u_spin.value = (now - start) * 0.000087 * motion;
      // Lissages EXPONENTIELS sur le temps écoulé : `1 - exp(-dt/τ)` donne la
      // même vitesse de convergence quelle que soit la cadence, là où un facteur
      // fixe par image allait deux fois plus vite à 60 Hz qu'à 30.
      // τ = 150 ms sur la position (90 ms à l'origine, 130 la veille) —
      // RALENTI en deux passes avec l'intensité ci-dessous (client : « less
      // fast », puis « rendre l'animation du hover plus smooth »). Le gros du
      // gain de fluidité vient du déplafonnement de la cadence de survol,
      // plus haut ; l'inertie n'ajoute que la rondeur du geste.
      mouse.lerp(mouseCible, 1 - Math.exp(-dt / 0.15));
      uniforms.u_mousePosition.value.copy(mouse);
      // τ = 750 ms sur l'intensité (420 ms à l'origine). C'est LE levier de la
      // vitesse de contraction : le resserrement était jugé trop rapide pour
      // être vu se faire (« too fast for the particles to be contracted »).
      // À 750 ms, la pincée s'installe en ~2 s au lieu de ~1,2 s — on la voit
      // se former, et elle se défait à la même douceur. Le mécanisme reste
      // exponentiel sur le temps écoulé, donc identique à 30 et à 60 Hz.
      uniforms.u_mouseStrength.value +=
        (wantStrength - uniforms.u_mouseStrength.value) * (1 - Math.exp(-dt / 0.75));
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

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerleave", onLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [size, count, radius, scatterPower, variant, pointSize, arms, motion]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
