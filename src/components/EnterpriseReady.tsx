import {
  Network,
  KeyRound,
  ShieldCheck,
  Globe,
  BadgeCheck,
  RefreshCw,
  SlidersHorizontal,
  MonitorSmartphone,
  type LucideIcon,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

/**
 * EnterpriseReady — surfaces the real product capabilities that make Ora
 * credible to an enterprise finance buyer AND their IT/security review.
 * Everything here reflects what the product actually does (multi-tenant,
 * MFA, end-to-end encryption, EU hosting, signed automations, Excel
 * auto-sync, admin console, native desktop). No claims beyond the build.
 */

type Capability = { icon: LucideIcon; title: string; desc: string };

export default function EnterpriseReady() {
  const { t } = useLang();

  const capabilities: Capability[] = [
    {
      icon: Network,
      title: t({ fr: "Multi-tenant cloisonné", en: "Isolated multi-tenant" }),
      desc: t({
        fr: "Organisations, équipes et utilisateurs. Accès refusé par défaut, isolé par rôle au niveau base de données.",
        en: "Organisations, teams and users. Deny-by-default access, isolated per role at the database level.",
      }),
    },
    {
      icon: KeyRound,
      title: t({ fr: "Authentification & MFA", en: "Authentication & MFA" }),
      desc: t({
        fr: "Connexion sécurisée par JWT avec double authentification, gérée en Europe.",
        en: "Secure JWT sign-in with multi-factor authentication, managed in Europe.",
      }),
    },
    {
      icon: ShieldCheck,
      title: t({ fr: "Chiffrement de bout en bout", en: "End-to-end encryption" }),
      desc: t({
        fr: "Vos fichiers sont chiffrés sur votre appareil avant tout envoi. Illisibles sur nos serveurs.",
        en: "Your files are encrypted on your device before anything is sent. Unreadable on our servers.",
      }),
    },
    {
      icon: Globe,
      title: t({ fr: "Hébergement européen", en: "European hosting" }),
      desc: t({
        fr: "Données hébergées à Francfort et Genève. Hors de portée du CLOUD Act américain.",
        en: "Data hosted in Frankfurt and Geneva. Out of reach of the US CLOUD Act.",
      }),
    },
    {
      icon: BadgeCheck,
      title: t({ fr: "Automatisations signées", en: "Signed automations" }),
      desc: t({
        fr: "Chaque automatisation est signée puis vérifiée à l'exécution, et activée par client sans nouvelle version.",
        en: "Every automation is signed, verified at runtime, and granted per client without a new release.",
      }),
    },
    {
      icon: RefreshCw,
      title: t({ fr: "Synchronisation Excel", en: "Excel auto-sync" }),
      desc: t({
        fr: "Chaque enregistrement renvoie votre fichier vers le stockage chiffré, sans manipulation.",
        en: "Every save pushes your file back to encrypted storage, with no manual step.",
      }),
    },
    {
      icon: SlidersHorizontal,
      title: t({ fr: "Console d'administration", en: "Admin console" }),
      desc: t({
        fr: "Gérez accès, équipes et déploiement des automatisations depuis une console dédiée.",
        en: "Manage access, teams and automation rollout from a dedicated console.",
      }),
    },
    {
      icon: MonitorSmartphone,
      title: t({ fr: "macOS & Windows", en: "macOS & Windows" }),
      desc: t({
        fr: "Application desktop native, sur les postes Mac et Windows de vos équipes.",
        en: "Native desktop app, on your teams' Mac and Windows machines.",
      }),
    },
  ];

  return (
    <section
      id="enterprise"
      className="relative py-24 md:py-32 px-6 md:px-12 bg-[#fcfbf7] dark:bg-[#0f172a]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500 dark:text-blue-400">
            {t({ fr: "Sécurité & gouvernance", en: "Security & governance" })}
          </span>
          <h2 className="font-poppins font-semibold text-3xl md:text-[2.75rem] tracking-[-0.03em] leading-[1.12] text-[#111827] dark:text-white mt-4">
            {t({ fr: "Conçu pour l'entreprise, prêt pour votre DSI", en: "Built for the enterprise, ready for your IT" })}
          </h2>
          <p className="font-inter mt-5 text-base md:text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t({
              fr: "La sécurité et la gouvernance ne sont pas une option ajoutée après coup : elles sont au cœur d'Ora.",
              en: "Security and governance aren't bolted on after the fact: they're at the core of Ora.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-5 md:p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/[0.08] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <h3 className="font-poppins font-semibold text-[16px] text-gray-900 dark:text-white leading-snug">
                  {c.title}
                </h3>
                <p className="font-inter mt-2 text-[13.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
