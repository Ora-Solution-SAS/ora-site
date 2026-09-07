/**
 * mail.ts — les deux courriels d'une réservation, envoyés par Brevo.
 *
 * Brevo plutôt qu'un SMTP nu : le domaine porte déjà un `brevo-code` dans son
 * DNS, donc le compte existe et l'authentification d'envoi (SPF/DKIM) y est
 * déjà faite. Un envoi SMTP depuis une fonction Vercel partirait d'une adresse
 * IP partagée non authentifiée pour ce domaine et finirait en indésirable.
 *
 * ⚠ L'INVITATION EST UNE PIÈCE JOINTE `text/calendar`, pas un lien. C'est elle
 * qui pose vraiment le rendez-vous dans l'agenda du visiteur : un dépôt CalDAV
 * dans NOTRE agenda n'envoie aucune invitation tant que le serveur n'implémente
 * pas l'ordonnancement iTIP, ce qu'on ne peut pas supposer. On l'envoie donc
 * nous-mêmes, avec METHOD:REQUEST.
 */

export type MailAttachment = { name: string; contentBase64: string };

export type BrevoConfig = { apiKey: string; fromEmail: string; fromName: string };

async function send(
  cfg: BrevoConfig,
  to: Array<{ email: string; name?: string }>,
  subject: string,
  html: string,
  text: string,
  attachment?: MailAttachment,
  replyTo?: { email: string; name?: string },
): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": cfg.apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: { email: cfg.fromEmail, name: cfg.fromName },
      to,
      subject,
      htmlContent: html,
      textContent: text,
      ...(replyTo ? { replyTo } : {}),
      ...(attachment ? { attachment: [{ name: attachment.name, content: attachment.contentBase64 }] } : {}),
    }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}

const BLUE = "#3b82f6";
const INK = "#42506b";
const FAINT = "#6b7688";

/** Le gabarit, volontairement pauvre : tableaux et styles en ligne. C'est la
 *  seule mise en page que Outlook, Gmail et Mail rendent de la même façon. */
function shell(title: string, bodyRows: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fcfbf7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fcfbf7;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid rgba(10,37,64,0.08);border-radius:16px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<tr><td style="font-size:20px;line-height:1.25;color:#111827;font-weight:600;padding-bottom:20px;">${title}</td></tr>
${bodyRows}
<tr><td style="padding-top:24px;border-top:1px solid rgba(10,37,64,0.08);font-size:12px;line-height:1.6;color:${FAINT};">
Ora Solution &middot; automatisation des travaux r&eacute;p&eacute;titifs sur Excel<br>Trait&eacute; et h&eacute;berg&eacute; en Europe.
</td></tr>
</table></td></tr></table></body></html>`;
}

function row(html: string): string {
  return `<tr><td style="font-size:15px;line-height:1.6;color:${INK};padding-bottom:14px;">${html}</td></tr>`;
}

export type BookingMailData = {
  guestName: string;
  guestEmail: string;
  company?: string;
  phone?: string;
  notes?: string;
  /** Déjà mises en forme dans le fuseau du destinataire. */
  whenGuest: string;
  whenOrganiser: string;
  guestTimeZone: string;
  meetingUrl: string;
  organiserName: string;
  organiserEmail: string;
  durationMinutes: number;
  lang: "fr" | "en";
};

/** Au visiteur : la confirmation, avec l'invitation en pièce jointe. */
export async function sendGuestConfirmation(cfg: BrevoConfig, d: BookingMailData, ics: string): Promise<void> {
  const fr = d.lang === "fr";
  const title = fr ? "Votre rendez-vous est confirm&eacute;" : "Your call is confirmed";
  const body =
    row(fr ? `Bonjour ${escapeHtml(d.guestName)},` : `Hello ${escapeHtml(d.guestName)},`) +
    row(
      fr
        ? `Votre &eacute;change de ${d.durationMinutes} minutes avec ${escapeHtml(d.organiserName)} est bien enregistr&eacute;.`
        : `Your ${d.durationMinutes}-minute call with ${escapeHtml(d.organiserName)} is booked.`,
    ) +
    `<tr><td style="padding:16px;background:#fcfbf7;border-radius:12px;font-size:15px;line-height:1.7;color:#111827;">
<strong>${escapeHtml(d.whenGuest)}</strong><br>
<span style="color:${FAINT};font-size:13px;">${escapeHtml(d.guestTimeZone)}</span>
</td></tr><tr><td style="height:20px;"></td></tr>` +
    `<tr><td style="padding-bottom:20px;"><a href="${d.meetingUrl}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 26px;border-radius:999px;">${fr ? "Rejoindre l'appel" : "Join the call"}</a></td></tr>` +
    row(
      fr
        ? `Le lien reste valable jusqu'&agrave; l'heure du rendez-vous : <a href="${d.meetingUrl}" style="color:${BLUE};">${escapeHtml(d.meetingUrl)}</a>`
        : `The link stays valid until the call: <a href="${d.meetingUrl}" style="color:${BLUE};">${escapeHtml(d.meetingUrl)}</a>`,
    ) +
    row(
      fr
        ? `Un emp&ecirc;chement ? R&eacute;pondez simplement &agrave; ce message, on trouvera un autre cr&eacute;neau.`
        : `Something came up? Just reply to this email and we will find another slot.`,
    );

  const text = [
    fr ? `Bonjour ${d.guestName},` : `Hello ${d.guestName},`,
    "",
    fr ? `Votre echange de ${d.durationMinutes} minutes avec ${d.organiserName} est confirme.` : `Your ${d.durationMinutes}-minute call with ${d.organiserName} is confirmed.`,
    "",
    `${d.whenGuest} (${d.guestTimeZone})`,
    d.meetingUrl,
    "",
    fr ? "Repondez a ce message si vous devez changer de creneau." : "Reply to this email if you need to reschedule.",
  ].join("\n");

  await send(
    cfg,
    [{ email: d.guestEmail, name: d.guestName }],
    fr ? `Rendez-vous confirme : ${d.whenGuest}` : `Call confirmed: ${d.whenGuest}`,
    shell(title, body),
    text,
    { name: "rendez-vous-ora.ics", contentBase64: Buffer.from(ics, "utf8").toString("base64") },
    { email: d.organiserEmail, name: d.organiserName },
  );
}

/** À l'organisateur : la fiche du demandeur, pour préparer l'appel. */
export async function sendOrganiserNotice(cfg: BrevoConfig, d: BookingMailData, ics: string): Promise<void> {
  const body =
    row(`<strong>${escapeHtml(d.whenOrganiser)}</strong>`) +
    `<tr><td style="padding:16px;background:#fcfbf7;border-radius:12px;font-size:14px;line-height:1.8;color:#111827;">
<strong>${escapeHtml(d.guestName)}</strong><br>
<a href="mailto:${escapeHtml(d.guestEmail)}" style="color:${BLUE};">${escapeHtml(d.guestEmail)}</a>
${d.company ? `<br>${escapeHtml(d.company)}` : ""}
${d.phone ? `<br>${escapeHtml(d.phone)}` : ""}
${d.notes ? `<br><br><span style="color:${FAINT};">${escapeHtml(d.notes).replace(/\n/g, "<br>")}</span>` : ""}
</td></tr><tr><td style="height:20px;"></td></tr>` +
    row(`<a href="${d.meetingUrl}" style="color:${BLUE};">${escapeHtml(d.meetingUrl)}</a>`) +
    row(`<span style="color:${FAINT};font-size:13px;">Fuseau du visiteur : ${escapeHtml(d.guestTimeZone)}</span>`);

  await send(
    cfg,
    [{ email: d.organiserEmail, name: d.organiserName }],
    `Nouveau rendez-vous : ${d.guestName} - ${d.whenOrganiser}`,
    shell("Nouveau rendez-vous", body),
    `${d.guestName} <${d.guestEmail}>\n${d.whenOrganiser}\n${d.meetingUrl}\n\n${d.notes ?? ""}`,
    { name: "rendez-vous-ora.ics", contentBase64: Buffer.from(ics, "utf8").toString("base64") },
    { email: d.guestEmail, name: d.guestName },
  );
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
