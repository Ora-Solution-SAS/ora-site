/**
 * ReglementationPage — « Réglementation », l'article de fond sur notre
 * position face au RGPD, à l'AI Act et au secret professionnel.
 *
 * Mise en page éditoriale demandée par le client le 2026-09-10, capture de
 * medium.com à l'appui : colonne unique et étroite, titre sans empattement,
 * CORPS EN SERIF, gros interlignage, ligne d'auteur avec date et temps de
 * lecture. C'est la seule page du site dont le corps n'est pas en Inter :
 * c'est un texte long, il se lit comme un article, pas comme une interface.
 * La serif est une pile système (Iowan, Georgia), donc zéro requête réseau et
 * aucune police ajoutée à la charte.
 *
 * ⚠ CE QUI EST ÉCRIT ICI ENGAGE. Le texte décrit une architecture, il ne
 * revendique AUCUNE certification (pas d'ISO 27001, pas de HDS, pas de label)
 * et le dit explicitement, parce que nous n'en avons pas. Ne pas ajouter de
 * conformité attestée, de logo de certification ou de « certifié RGPD » sans
 * document à l'appui : sur cette page plus qu'ailleurs, une phrase de trop
 * est un risque juridique, pas une ligne de marketing.
 */

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { BOOKING_CTA } from "@/lib/bookingCta";

type Page = "home" | "produit" | "reglementation";

type Props = {
  theme: "light" | "dark";
  openBooking: () => void;
  onNavigate: (page: Page) => void;
};

/* La colonne d'article : 680 px de texte, la serif, l'interlignage long. */
const pageCSS = `
.reg-body { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif; }
.reg-body p { font-size: 20px; line-height: 1.78; letter-spacing: -0.003em; margin-top: 1.55em; }
.reg-body p:first-child { margin-top: 0; }
.reg-body strong { font-weight: 700; }
.reg-body ul { margin-top: 1.4em; padding-left: 1.1em; }
.reg-body li { font-size: 20px; line-height: 1.7; margin-top: 0.7em; list-style: disc; }
.reg-body a { text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 640px) {
  .reg-body p, .reg-body li { font-size: 18px; line-height: 1.72; }
}
.reg-quote { border-left: 3px solid #3b82f6; padding-left: 22px; }
.reg-quote p { font-size: 21px; line-height: 1.6; font-style: italic; color: #42506b; }
`;

const ReglementationPage: React.FC<Props> = ({ theme, openBooking, onNavigate }) => {
  const { t } = useLang();
  const dk = theme === "dark";
  const ink = dk ? "text-white" : "text-[#111827]";
  const body = dk ? "text-[#cbd5e1]" : "text-[#42506b]";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* Un titre de section : sans empattement, comme chez la référence. */
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className={`mt-16 font-instrument text-[27px] font-normal leading-[1.25] tracking-[-0.02em] md:text-[30px] ${ink}`}>
      {children}
    </h2>
  );

  return (
    <main className="min-h-screen" style={{ background: dk ? "#111827" : "#fcfbf7" }}>
      <style>{pageCSS}</style>

      <article className="mx-auto max-w-[720px] px-6 pb-28 pt-16 md:pt-24">
        <button
          onClick={() => onNavigate("home")}
          className="font-inter text-[13px] font-medium text-[#6b7688] transition-colors hover:text-[#3b82f6]"
        >
          {t({ fr: "Ora", en: "Ora" })}
          <span className="mx-2 text-[#c4cad6]">/</span>
          <span className={dk ? "text-white" : "text-[#111827]"}>
            {t({ fr: "Réglementation", en: "Regulation" })}
          </span>
        </button>

        <h1 className={`mt-8 font-instrument text-[38px] font-normal leading-[1.12] tracking-[-0.03em] md:text-[46px] ${ink}`}>
          {t({
            fr: "L'IA dans un cabinet, sans renoncer au secret professionnel",
            en: "AI in an accounting firm, without giving up professional secrecy",
          })}
        </h1>
        <p className="mt-5 font-inter text-[19px] leading-[1.5] text-[#5b6577] md:text-[21px]">
          {t({
            fr: "Où se place Ora face au RGPD, à l'AI Act et aux obligations de l'expert-comptable. Nos choix d'architecture, ce qu'ils garantissent, et ce que nous ne revendiquons pas.",
            en: "Where Ora stands on the GDPR, the AI Act and an accountant's professional duties. Our architecture choices, what they guarantee, and what we do not claim.",
          })}
        </p>

        {/* La ligne d'auteur de la référence : identité, date, temps de lecture. */}
        <div className="mt-10 flex items-center gap-3.5">
          <img src="/logos/icon-color.png" alt="" className="h-11 w-11 rounded-full bg-white object-contain p-1.5 ring-1 ring-black/[0.06]" />
          <div className="font-inter">
            <p className={`text-[15px] font-semibold ${ink}`}>{t({ fr: "L'équipe Ora", en: "The Ora team" })}</p>
            <p className="mt-0.5 text-[14px] text-[#6b7688]">
              {t({ fr: "9 min de lecture", en: "9 min read" })}
              <span className="mx-1.5">·</span>
              {t({ fr: "10 septembre 2026", en: "September 10, 2026" })}
            </p>
          </div>
        </div>

        <div className={`mt-8 border-t ${dk ? "border-white/10" : "border-[#e8e4d9]"}`} />

        <div className={`reg-body mt-12 ${body}`}>
          <p>
            {t({
              fr: "Un expert-comptable qui ouvre un outil d'IA se pose trois questions dans cet ordre : est-ce que les données de mon client sortent du cabinet, est-ce que je peux expliquer le chiffre que je signe, et qu'est-ce que je réponds si l'Ordre ou un juge me demande des comptes. Nous avons construit Ora autour de ces trois questions plutôt qu'autour d'une démonstration de puissance. Voici précisément où nous nous situons.",
              en: "An accountant opening an AI tool asks three questions, in this order: do my client's files leave the firm, can I explain the figure I am signing, and what do I answer if my professional body or a judge asks me to account for it. We built Ora around those three questions rather than around a demonstration of power. Here is exactly where we stand.",
            })}
          </p>

          <H>{t({ fr: "Le principe : le calcul ne quitte pas votre poste", en: "The principle: the computing never leaves your machine" })}</H>
          <p>
            {t({
              fr: "Ora est une application installée, pas un service en ligne où vous téléverseriez vos dossiers. Quand vous déposez un FEC, un grand livre ou une liasse, le fichier est lu et traité sur votre machine, par un moteur déterministe. Les écritures, les soldes, les retraitements, la balance : tout cela est du calcul, et le calcul s'exécute chez vous.",
              en: "Ora is an installed application, not an online service where you would upload your files. When you drop a ledger, a trial balance or a set of accounts, the file is read and processed on your own machine, by a deterministic engine. Entries, balances, adjustments, the trial balance itself: all of that is computation, and the computation runs on your side.",
            })}
          </p>
          <p>
            {t({
              fr: "Ce choix n'est pas une précaution parmi d'autres, c'est celui qui commande tous les autres. Une donnée qui n'est jamais transmise n'a pas besoin d'être protégée en transit, hébergée ailleurs, ni effacée sur demande : elle n'a pas bougé.",
              en: "That choice is not one precaution among others, it is the one that governs all the rest. Data that is never transmitted does not need to be protected in transit, hosted elsewhere, or deleted on request: it never moved.",
            })}
          </p>

          <H>{t({ fr: "Ce que le modèle voit, et ce qu'il ne voit jamais", en: "What the model sees, and what it never sees" })}</H>
          <p>
            {t({
              fr: "Une partie du travail, elle, relève bien de l'IA générative : reformuler une analyse, rédiger un commentaire de gestion, proposer les questions à poser au client. Pour cela, Ora s'appuie sur l'API de Mistral, un prestataire français. Deux limites encadrent cet appel, et elles sont dans le produit, pas dans une promesse.",
              en: "Part of the work does belong to generative AI: rephrasing an analysis, drafting a management commentary, suggesting the questions to ask a client. For that, Ora calls Mistral's API, a French provider. Two limits frame that call, and they sit in the product, not in a promise.",
            })}
          </p>
          <p>
            {t({
              fr: "D'abord, le modèle ne calcule rien. Il reçoit des chiffres déjà établis par le moteur et les met en phrases. Un résultat d'exercice n'est jamais « estimé » par une IA : il est calculé, puis raconté. C'est la raison pour laquelle vous pouvez refaire à la main n'importe quel montant affiché.",
              en: "First, the model computes nothing. It receives figures already established by the engine and turns them into sentences. A year's result is never « estimated » by an AI: it is computed, then narrated. That is why any amount on screen can be redone by hand.",
            })}
          </p>
          <p>
            {t({
              fr: "Ensuite, ce qui part est anonymisé avant l'envoi. Les noms de dossiers, de clients et de tiers sont remplacés avant que la requête ne quitte le poste. L'application l'affiche sous chaque zone de saisie plutôt que de l'enfouir dans des conditions générales, et le fichier lui-même, lui, ne part jamais.",
              en: "Second, whatever is sent is anonymized first. File, client and third-party names are replaced before the request leaves the machine. The application states this under every input box rather than burying it in terms and conditions, and the file itself never leaves at all.",
            })}
          </p>

          <div className="reg-quote mt-12">
            <p>
              {t({
                fr: "La question n'est pas de savoir si un modèle est fiable. C'est de savoir ce qu'on lui a confié, et ce qui aurait été perdu s'il s'était trompé.",
                en: "The question is not whether a model is reliable. It is what it was trusted with, and what would have been lost had it been wrong.",
              })}
            </p>
          </div>

          <H>{t({ fr: "RGPD : qui est responsable de quoi", en: "GDPR: who is responsible for what" })}</H>
          <p>
            {t({
              fr: "Dans la configuration normale d'Ora, le cabinet reste seul maître de ses données : elles ne transitent pas par nos serveurs, nous n'y avons pas accès, et nous ne pouvons donc pas en être le sous-traitant au sens de l'article 28. Notre rôle est celui d'un éditeur de logiciel, pas d'un hébergeur.",
              en: "In Ora's normal setup the firm remains the sole holder of its data: it does not pass through our servers, we have no access to it, and we therefore cannot be its processor within the meaning of Article 28. Our role is that of a software publisher, not a host.",
            })}
          </p>
          <p>
            {t({
              fr: "Trois principes du règlement structurent malgré tout la conception de l'application :",
              en: "Three principles of the regulation nonetheless shape how the application is designed:",
            })}
          </p>
          <ul>
            <li>
              <strong>{t({ fr: "Minimisation. ", en: "Minimisation. " })}</strong>
              {t({
                fr: "Un traitement ne reçoit que les colonnes dont il a besoin. Un prévisionnel n'a pas à connaître le nom du gérant pour projeter un chiffre d'affaires.",
                en: "A task receives only the columns it needs. A forecast does not need to know a director's name in order to project revenue.",
              })}
            </li>
            <li>
              <strong>{t({ fr: "Protection dès la conception. ", en: "Data protection by design. " })}</strong>
              {t({
                fr: "L'anonymisation avant appel au modèle n'est pas une option à cocher, c'est le chemin par défaut, et le seul.",
                en: "Anonymisation before any model call is not a checkbox, it is the default path, and the only one.",
              })}
            </li>
            <li>
              <strong>{t({ fr: "Traçabilité. ", en: "Traceability. " })}</strong>
              {t({
                fr: "Chaque traitement laisse un journal lisible : quel fichier, quelles étapes, quels contrôles. C'est ce journal qui rend une réponse opposable, des mois plus tard.",
                en: "Every run leaves a readable log: which file, which steps, which checks. That log is what makes an answer defensible, months later.",
              })}
            </li>
          </ul>
          <p>
            {t({
              fr: "Pour les services annexes du site, la prise de rendez-vous et les échanges par courrier électronique, nous avons retenu des prestataires européens plutôt que les plateformes américaines habituelles. Cela concerne des données de contact professionnel, jamais des dossiers clients.",
              en: "For the site's side services, appointment booking and email exchanges, we chose European providers rather than the usual American platforms. This concerns professional contact details, never client files.",
            })}
          </p>

          <H>{t({ fr: "AI Act : ce que nous sommes, ce que nous ne sommes pas", en: "AI Act: what we are, and what we are not" })}</H>
          <p>
            {t({
              fr: "Le règlement européen sur l'intelligence artificielle classe les systèmes par niveau de risque et impose des obligations croissantes, dont l'application s'échelonne jusqu'en 2027. Un outil d'aide à la production comptable ne relève pas, en l'état de notre analyse, des systèmes à haut risque énumérés par le règlement : Ora ne décide pas d'un recrutement, n'évalue pas la solvabilité d'une personne physique, ne note personne et ne prend aucune décision produisant des effets juridiques.",
              en: "The European AI regulation classifies systems by risk level and imposes increasing obligations, phased in until 2027. A tool that helps produce accounting work does not, as far as our own analysis goes, fall within the high-risk systems the regulation lists: Ora makes no hiring decision, does not assess a natural person's creditworthiness, scores no one, and takes no decision producing legal effects.",
            })}
          </p>
          <p>
            {t({
              fr: "Nous nous plaçons donc dans la catégorie des systèmes soumis à des obligations de transparence, et nous les tenons sans attendre l'échéance : l'utilisateur sait toujours qu'il s'adresse à un modèle, il sait ce qui est calculé et ce qui est rédigé, et le contenu produit est présenté comme un projet à relire, jamais comme un livrable définitif.",
              en: "We therefore place ourselves in the category of systems subject to transparency obligations, and we meet them without waiting for the deadline: the user always knows they are addressing a model, knows what is computed and what is written, and generated content is presented as a draft to review, never as a final deliverable.",
            })}
          </p>
          <p>
            {t({
              fr: "Une précision honnête : la qualification définitive d'un système dépend de l'usage qui en est fait. Si un cabinet devait employer Ora dans un contexte que le règlement classe autrement, nous en tirerions les conséquences avec lui plutôt que de nous retrancher derrière une analyse écrite un jour et jamais rouverte.",
              en: "An honest caveat: how a system is finally classified depends on how it is used. Should a firm use Ora in a context the regulation classifies differently, we would work through the consequences with them rather than hide behind an analysis written once and never revisited.",
            })}
          </p>

          <H>{t({ fr: "Le secret professionnel et les normes de l'Ordre", en: "Professional secrecy and the profession's own rules" })}</H>
          <p>
            {t({
              fr: "L'expert-comptable est tenu au secret professionnel dans les conditions prévues par l'ordonnance de 1945 et par le code de déontologie de la profession. Ce secret n'est pas une clause de confidentialité négociable : il est pénalement sanctionné, et il ne se délègue pas à un fournisseur.",
              en: "Accountants are bound by professional secrecy under the 1945 ordinance and the profession's code of ethics. That secrecy is not a negotiable confidentiality clause: breaching it is a criminal offence, and it cannot be delegated to a supplier.",
            })}
          </p>
          <p>
            {t({
              fr: "C'est exactement pourquoi nous avons écarté le modèle du service en ligne. Confier la liasse d'un client à une plateforme, même sérieuse, même chiffrée, revient à faire sortir du cabinet une information couverte par le secret. Avec Ora, la pièce reste sur le poste de celui qui y a droit.",
              en: "That is precisely why we ruled out the online-service model. Handing a client's accounts to a platform, however serious, however encrypted, means letting information covered by professional secrecy leave the firm. With Ora, the document stays on the machine of the person entitled to see it.",
            })}
          </p>
          <p>
            {t({
              fr: "Reste la question de la responsabilité, et sa réponse est simple : elle ne bouge pas. C'est le professionnel qui relit, corrige et signe. Un outil ne peut pas engager une signature, et nous n'écrirons jamais l'inverse, y compris sur une page commerciale.",
              en: "That leaves the question of liability, and the answer is simple: it does not move. The professional reviews, corrects and signs. A tool cannot commit a signature, and we will never write otherwise, including on a sales page.",
            })}
          </p>

          <H>{t({ fr: "Ce que nous ne revendiquons pas", en: "What we do not claim" })}</H>
          <p>
            {t({
              fr: "Beaucoup d'outils affichent une rangée de logos de conformité. Nous préférons dire ce que nous n'avons pas : Ora n'est certifié ISO 27001, ni HDS, ni SecNumCloud, et aucun label ne valide notre conformité au RGPD, pour la raison simple qu'aucune certification RGPD de ce type n'existe. Nous ne sommes pas non plus soumis à un audit externe qui attesterait ce que décrit cette page.",
              en: "Plenty of tools display a row of compliance logos. We would rather say what we do not have: Ora holds no ISO 27001, no health-data hosting and no SecNumCloud certification, and no label validates our GDPR compliance, for the simple reason that no such GDPR certification exists. Nor are we subject to an external audit attesting to what this page describes.",
            })}
          </p>
          <p>
            {t({
              fr: "Ce que nous offrons à la place est vérifiable autrement : une architecture que l'on peut examiner, un traitement local que votre service informatique peut observer, un journal d'exécution que vous conservez, et une équipe qui répond aux questions techniques précises plutôt que par une plaquette.",
              en: "What we offer instead is verifiable in another way: an architecture that can be examined, local processing your IT team can observe, an execution log you keep, and a team that answers precise technical questions rather than handing over a brochure.",
            })}
          </p>

          <H>{t({ fr: "Nos engagements, en clair", en: "Our commitments, plainly" })}</H>
          <ul>
            <li>
              {t({
                fr: "Vos fichiers ne sont pas téléversés vers nos serveurs, et nous n'y avons pas accès.",
                en: "Your files are not uploaded to our servers, and we have no access to them.",
              })}
            </li>
            <li>
              {t({
                fr: "Aucune donnée de cabinet n'est utilisée pour entraîner un modèle, ni le nôtre, ni celui d'un tiers.",
                en: "No firm data is used to train a model, neither ours nor a third party's.",
              })}
            </li>
            <li>
              {t({
                fr: "Les chiffres transmis pour rédaction sont anonymisés avant l'envoi, et cette étape n'est pas désactivable.",
                en: "Figures sent for drafting are anonymised beforehand, and that step cannot be switched off.",
              })}
            </li>
            <li>
              {t({
                fr: "Tout montant affiché est calculé par le moteur, traçable jusqu'à sa source et reproductible à l'identique.",
                en: "Every amount on screen is computed by the engine, traceable to its source and reproducible identically.",
              })}
            </li>
            <li>
              {t({
                fr: "Si l'un de ces points venait à changer, nous le dirions sur cette page avant de le faire, pas après.",
                en: "Should any of these change, we would say so on this page before doing it, not afterwards.",
              })}
            </li>
          </ul>

          <H>{t({ fr: "Parlons-en avec vos contraintes", en: "Let's discuss it against your own constraints" })}</H>
          <p>
            {t({
              fr: "Cette page décrit un cadre général. Un cabinet a des obligations particulières, une direction financière en a d'autres, et votre service informatique aura des questions que nous n'avons pas anticipées ici. Nous préférons y répondre une par une, en montrant l'application plutôt qu'en la décrivant.",
              en: "This page describes a general framework. An accounting firm has its own obligations, a finance department has others, and your IT team will have questions we have not anticipated here. We would rather answer them one by one, showing the application rather than describing it.",
            })}
          </p>
        </div>

        <div className={`mt-16 rounded-3xl px-8 py-10 ${dk ? "bg-white/[0.04]" : "bg-white"} ring-1 ${dk ? "ring-white/10" : "ring-[#e8e4d9]"}`}>
          <h2 className={`font-instrument text-[26px] font-normal leading-[1.2] tracking-[-0.02em] ${ink}`}>
            {t({ fr: "Une question sur un point précis ?", en: "A question on a specific point?" })}
          </h2>
          <p className="mt-3 font-inter text-[15px] leading-[1.65] text-[#5b6577]">
            {t({
              fr: "Venez avec vos contraintes, nous venons avec l'application ouverte.",
              en: "Come with your constraints, we come with the application open.",
            })}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={openBooking}
              className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3 font-inter text-[15px] font-semibold text-white transition-colors hover:bg-[#2563eb]"
            >
              {t(BOOKING_CTA)}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("produit")}
              className="font-inter text-[15px] font-semibold text-[#3b82f6] hover:underline"
            >
              {t({ fr: "Voir l'application", en: "See the application" })}
            </button>
          </div>
        </div>
      </article>
    </main>
  );
};

export default ReglementationPage;
