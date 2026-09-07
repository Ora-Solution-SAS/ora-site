import { useEffect, useState } from "react";

/** Le seuil `md` de Tailwind, en pixels. */
export const MD = 768;

/**
 * Vrai tant que le viewport est sous `md`.
 *
 * Sert aux endroits où la mise en page mobile n'est pas une affaire de CSS mais
 * de ce qu'on monte : la section à onglets ne rend qu'un panneau sur téléphone
 * et les six sur PC, et DesktopThumb ne réduit une maquette que dans le premier
 * cas. Une media query ne peut pas trancher ça — elle cache, elle ne démonte
 * pas, et un panneau caché pèse toujours son poids dans le DOM.
 */
export function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => window.innerWidth < MD);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD - 1}px)`);
    const lire = () => setNarrow(mq.matches);
    lire();
    mq.addEventListener("change", lire);
    return () => mq.removeEventListener("change", lire);
  }, []);
  return narrow;
}
