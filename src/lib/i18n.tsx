import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Minimal co-located i18n system.
 *
 * Usage in any component:
 *   const { t, lang, setLang } = useLang();
 *   <h1>{t({ fr: "Bonjour", en: "Hello" })}</h1>
 *
 * Language persists in localStorage under "ora-lang".
 * Falls back to browser language (French default).
 */

export type Lang = "fr" | "en";

const STORAGE_KEY = "ora-lang";

type Msg = { fr: string; en: string };

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (msg: Msg) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "fr";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en") return stored;
  const nav = (navigator.language || "").toLowerCase();
  return nav.startsWith("en") ? "en" : "fr";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    }
  };

  const t = (msg: Msg) => msg[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLang(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useLang must be used inside <LangProvider>");
  }
  return ctx;
}
