/**
 * three@0.182 n'embarque AUCUN type et le projet n'a pas `@types/three`.
 * Cette déclaration ambiante suffit à ParticleOrbGL.tsx, le seul fichier qui
 * importe la bibliothèque : elle rend le module typé `any` au lieu de faire
 * échouer `tsc`.
 *
 * Pour retrouver l'autocomplétion et le typage réel le jour où Three servira
 * ailleurs : `npm i -D @types/three` puis SUPPRIMER ce fichier — laisser les
 * deux en place ferait gagner cette déclaration, plus permissive, sur les
 * vrais types.
 */
declare module "three";
