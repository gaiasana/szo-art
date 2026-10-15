import { cp, mkdir, rm } from 'node:fs/promises';
import works from './works.json';
import legal from './legal.json';

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const logo = (await Bun.file(new URL('./public/assets/szo-art.svg', import.meta.url)).text())
  .replace('role="img" aria-label="SZO ART"', 'aria-hidden="true" focusable="false"');
const arrow = '<span aria-hidden="true">↗</span>';
const next = '<span aria-hidden="true">→</span>';
const words = (html: string) => {
  let i = 0;
  return html.split('<br>').map(line => line.trim().split(/\s+/).map(word => `<span class="w" style="--i:${i++}">${word}</span>`).join(' ')).join('<br> ');
};
const link = (href: string, label: string, primary = false) => `<a class="${primary ? 'button' : 'text-link'}" href="${href}">${label}${primary ? next : ''}</a>`;
const artwork = (slug: string, eager = false, placement: 'gallery' | 'hero' | 'featured' = 'gallery', details = false) => {
  const work = works.find(w => w.slug === slug)!;
  const sources = [400, 800].filter(width => width < work.width).map(width => `/assets/${slug}-${width}.webp ${width}w`);
  sources.push(`/assets/${slug}.webp ${work.width}w`);
  const sizes = placement === 'hero'
    ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) 48vw, 600px'
    : placement === 'featured' ? '(max-width: 767px) calc(100vw - 40px), 460px'
    : '(max-width: 479px) calc(50vw - 28px), (max-width: 767px) calc(50vw - 32px), (max-width: 1023px) 30vw, 420px';
  return `<a class="work" href="/werke/${slug}" aria-label="${escape(work.title)} ansehen"><figure><div class="artwork"><img src="/assets/${slug}-400.webp" srcset="${sources.join(', ')}" sizes="${sizes}" alt="${escape(work.title)}, Gemälde von Sabine Szotowski Salis" width="${work.width}" height="${work.height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${placement === 'hero' ? ' fetchpriority="high"' : ''}></div><figcaption><span>${escape(work.title)}</span>${details && work.year ? `<small>${work.year} · ${escape(work.medium!)}</small>` : ''}</figcaption></figure></a>`;
};
const header = (active: string) => `<header class="site-header"><a href="/" class="brand" aria-label="SZO ART, Home">${logo}</a><button class="menu-toggle" aria-controls="main-nav" aria-expanded="false">Menü <span aria-hidden="true">＋</span></button><nav id="main-nav" aria-label="Hauptnavigation">${[['/', 'Home'], ['/selektierte-werke', 'Werke'], ['/info', 'Info'], ['/kontakt', 'Kontakt']].map(([url, text]) => `<a href="${url}"${active === url ? ' aria-current="page"' : ''}>${text}</a>`).join('')}</nav></header>`;
const footer = `<footer class="site-footer"><a class="footer-name" href="/">Sabine Szotowski Salis</a><span class="copyright">© ${new Date().getFullYear()} SZO ART</span><nav aria-label="Rechtliche Informationen"><a href="/cookies">Cookies</a><a href="/impressum">Impressum</a><a href="/datenschutz">Datenschutz</a></nav></footer>`;
const viewer = `<dialog class="viewer" aria-labelledby="viewer-title"><div class="viewer-bar"><a id="viewer-title" href="/selektierte-werke"></a><button class="viewer-close" aria-label="Bildansicht schließen">Schließen <span aria-hidden="true">×</span></button></div><div class="viewer-stage" aria-busy="false"><img id="viewer-image" alt=""><p id="viewer-status" role="status"></p></div><div class="viewer-bottom"><div class="viewer-navigation"><button class="viewer-prev" aria-label="Vorheriges Werk">←</button><span id="viewer-count" aria-live="polite"></span><button class="viewer-next" aria-label="Nächstes Werk">→</button></div><a id="viewer-contact" class="text-link" href="/kontakt">Zu diesem Werk anfragen</a></div></dialog>`;
const flyer = `<dialog class="flyer-popup" aria-labelledby="flyer-title" aria-describedby="flyer-description"><div class="flyer-bar"><div><h2 id="flyer-title">ART Ettlingen &amp; friends</h2><p id="flyer-description">16.–18. Oktober 2026 · Schlossgartenhalle Ettlingen</p></div><button class="flyer-close" type="button" autofocus aria-label="Ausstellungsflyer schließen">Schließen <span aria-hidden="true">×</span></button></div><a class="flyer-image" href="/assets/Flyer_Q4_2026_Ettlingen.jpeg" target="_blank" rel="noopener" aria-label="Ausstellungsflyer in Originalgröße öffnen"><img data-src="/assets/flyer-q4-2026-ettlingen.webp" width="1500" height="2158" alt="Best of ART Ettlingen &amp; friends: Ausstellung 16.–18. Oktober 2026 in der Schlossgartenhalle Ettlingen. Freitag: Einlass 16 Uhr, Vernissage 18 Uhr mit PlayJazz aus Ettlingen. Samstag: 11–18 Uhr, am Piano Jephté Fanguere. Sonntag: Matinée 11 Uhr mit HotClub de Baugebiet aus Weingarten, Ausstellungsende 18 Uhr."></a><a class="text-link flyer-original" href="/assets/Flyer_Q4_2026_Ettlingen.jpeg" target="_blank" rel="noopener">Flyer in Originalgröße öffnen ↗</a></dialog>`;

const legalHeadings = new Set([
  'Angaben gemäß § 5 DDG', 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV', 'Haftung für Inhalte', 'Haftung für Links', 'Urheberrecht',
  'Grundlegendes', 'Verantwortliche Stelle', 'Hosting durch GitHub Pages', 'Keine Cookies, keine Analyse', 'Kontakt per E-Mail',
  'SSL- bzw. TLS-Verschlüsselung', 'Ihre Rechte', 'Beschwerderecht bei der Aufsichtsbehörde', 'Diese Website verwendet keine Cookies',
]);

const pages = [
  {
    route: '', title: 'Sabine Szotowski Salis | Freie Malerei · SZO ART',
    description: 'Freie Malerei von Sabine Szotowski Salis. Entdecken Sie ausgewählte Werke, erfahren Sie mehr über die Künstlerin und nehmen Sie Kontakt auf.',
    content: `<section class="hero"><div class="hero-copy"><p class="eyebrow">Sabine Szotowski Salis</p><h1>${words('Freie<br> Malerei')}</h1><p class="hero-note">Unerwartetes ergibt sich aus Farben und Licht, dem Gefühl für Raum und Linie und der Spontaneität.</p>${link('/selektierte-werke', 'Werke', true)}</div><div class="hero-art">${artwork('sky', true, 'hero')}</div></section>
      <section class="selection section"><div class="section-heading"><h2>Ausgewählte Werke</h2>${link('/selektierte-werke', `Alle ${works.length} Werke`)}</div><div class="selected-grid">${artwork('offenheit', false, 'featured', true)}${artwork('toscana', false, 'gallery', true)}${artwork('out-of-blue', false, 'gallery', true)}</div></section>
      <section class="artist-preview section"><div class="artist-image"><img src="/assets/atelier.webp" alt="Sabine Szotowski Salis beim Malen im Atelier" width="1200" height="900" loading="lazy"></div><div class="artist-copy"><p class="eyebrow">Die Künstlerin</p><h2>Die Freude am<br> Experimentieren.</h2><p>„Malen grenzt an Meditation. Es kehrt Ruhe und Konzentration ein. Die Zeit steht still.“</p>${link('/info', 'Info')}</div></section>
      <section class="contact-strip section"><h2>Im Gespräch<br> über Kunst.</h2><div><p>Über ein Feedback und Anfragen würde ich mich freuen.</p>${link('/kontakt', 'Kontakt', true)}</div></section>`,
  },
  {
    route: 'selektierte-werke', title: 'Ausgewählte Werke | SZO ART',
    description: 'Ausgewählte Gemälde von Sabine Szotowski Salis. Entdecken Sie Light, Offenheit, Toscana und weitere Werke in der Galerie.',
    content: `<section class="page-heading"><p class="eyebrow">Sabine Szotowski Salis</p><h1>Ausgewählte Werke</h1><p>Farbe, Licht, Raum und Linie.</p></section><section class="gallery" aria-label="Gemälde">${works.map((w, i) => artwork(w.slug, i < 3)).join('')}</section><section class="gallery-contact section"><h2>Ein Werk hat Sie angesprochen?</h2>${link('/kontakt', 'Kontakt', true)}</section>`,
  },
  {
    route: 'info', title: 'Info | Sabine Szotowski Salis · SZO ART',
    description: 'Über Sabine Szotowski Salis, ihre künstlerische Ausbildung und ihre Freude am Experimentieren mit Farbe, Licht, Raum und Linie.',
    content: `<section class="page-heading"><p class="eyebrow">Info</p><h1>Sabine<br> Szotowski Salis</h1></section><section class="biography"><div class="portrait"><img src="/assets/portrait.webp" alt="Sabine Szotowski Salis neben einem ihrer Gemälde" width="873" height="1200" fetchpriority="high"></div><div class="bio-copy"><h2>Ein Leben mit Farbe.</h2><p>Geboren 1954 in Freiburg, aufgewachsen in Stuttgart.</p><p>Nach dem Studium der Chemie und Biologie lange Zeit Lehrerin in Berlin und Baden-Württemberg.</p><p>Seit 2009 Malerei im Eigenstudium und begleitende Weiterbildungen an freien Kunstakademien, u.a. bei Richard Allgaier (Bad-Reichenhall) und Robert Suess (Augsburg). Studium an der europäischen Kunstakademie Trier.</p><blockquote>„Die Freude am Experimentieren ist auch Grundlage meiner Malerei. Unerwartetes ergibt sich aus Farben und Licht, dem Gefühl für Raum und Linie und der Spontaneität.“</blockquote>${link('/selektierte-werke', 'Werke')}</div></section><section class="artist-statement section"><p>${words('„Malen grenzt an Meditation.<br> Es kehrt Ruhe und Konzentration ein.<br> Die Zeit steht still.“')}</p><span>Sabine Szotowski Salis</span></section>`,
  },
  {
    route: 'kontakt', title: 'Kontakt | SZO ART',
    description: 'Kontakt zu Sabine Szotowski Salis. Fragen zu einem Gemälde oder Feedback zur Malerei: info@szo-art.de.',
    content: `<section class="page-heading"><p class="eyebrow">Sabine Szotowski Salis</p><h1>Kontakt</h1></section><section class="contact-layout"><div class="contact-intro"><h2>Ich freue mich<br> auf Ihre Nachricht.</h2><p>Für Fragen zu einem Werk oder Feedback zu meiner Malerei schreiben Sie mir gerne.</p><a class="email-link" href="mailto:info@szo-art.de">info@szo-art.de ${arrow}</a><img src="/assets/copper.webp" alt="Detailreiche Farbkomposition des Gemäldes Copper" width="600" height="600" loading="lazy"></div><form id="contact-form" aria-label="Nachricht vorbereiten"><div class="form-row"><label>Vorname<input name="vorname" autocomplete="given-name" required maxlength="100"></label><label>Nachname<input name="nachname" autocomplete="family-name" required maxlength="100"></label></div><label>E-Mail-Adresse<input type="email" name="email" autocomplete="email" required maxlength="254"></label><label>Betreff<input name="betreff" required maxlength="200"></label><label>Nachricht hinterlassen<textarea name="nachricht" rows="5" required maxlength="5000"></textarea></label><p class="form-help">Öffnet Ihr E-Mail-Programm. Erst dort versenden Sie die Nachricht.</p><button class="button" type="submit">E-Mail vorbereiten ${next}</button><p id="form-status" role="status"></p><div id="email-fallback" hidden><p>Kein E-Mail-Programm geöffnet? Kopieren Sie Ihre Nachricht und senden Sie sie an <a href="mailto:info@szo-art.de">info@szo-art.de</a>.</p><textarea id="email-draft" aria-label="Vorbereitete Nachricht zum Kopieren" readonly rows="7"></textarea><button class="text-link" type="button" id="copy-message">Nachricht kopieren</button></div></form></section>`,
  },
  ...works.map((work, index) => {
    const previous = works[(index - 1 + works.length) % works.length];
    const next = works[(index + 1) % works.length];
    const livingWidth = Math.min(30, 28.6 * work.width / work.height).toFixed(3);
    const galleryWidth = Math.min(30, 32 * work.width / work.height).toFixed(3);
    const roomImage = `/assets/${work.slug}${work.width > 800 ? '-800' : ''}.webp`;
    return {
      route: `werke/${work.slug}`,
      title: `${work.title} | Sabine Szotowski Salis · SZO ART`,
      description: `${work.title} von Sabine Szotowski Salis. Das Werk im Detail und als Raumansicht im Wohnzimmer und an einer Galeriewand.`,
      image: `/assets/${work.slug}.webp`,
      content: `<nav class="breadcrumb" aria-label="Brotkrumennavigation"><a href="/selektierte-werke">Werke</a><span aria-hidden="true">/</span><span aria-current="page">${escape(work.title)}</span></nav>
        <article class="work-detail"><div class="detail-image"><a href="/assets/${work.slug}.webp" data-work="${work.slug}" aria-label="${escape(work.title)} vergrößern"><img src="${roomImage}" srcset="${roomImage} ${Math.min(800, work.width)}w${work.width > 800 ? `, /assets/${work.slug}.webp ${work.width}w` : ''}" sizes="(max-width: 767px) calc(100vw - 40px), 650px" alt="${escape(work.title)}, Gemälde von Sabine Szotowski Salis" width="${work.width}" height="${work.height}" fetchpriority="high"><span class="detail-zoom">Original vergrößern</span></a></div><div class="detail-copy"><a class="detail-artist" href="/info">Sabine Szotowski Salis</a><h1>${escape(work.title)}</h1>${work.year ? `<dl class="work-facts"><div><dt>Jahr</dt><dd>${work.year}</dd></div><div><dt>Technik</dt><dd>${escape(work.medium!)}</dd></div><div><dt>Maße</dt><dd>${escape(work.dimensions!)}</dd></div></dl>` : '<p class="work-facts-note">Informationen zu Technik und Maßen auf Anfrage.</p>'}<div class="detail-actions">${link(`/kontakt?werk=${encodeURIComponent(work.title)}`, 'Werk anfragen', true)}${link('#raumansicht', 'Im Raum ansehen')}</div></div></article>
        <section class="room-preview section" id="raumansicht" aria-labelledby="room-heading"><div class="room-heading"><h2 id="room-heading">Im Raum</h2><p>Raumansichten zur Orientierung, nicht maßstabsgetreu.</p></div><div class="room-controls" role="group" aria-label="Raumansicht auswählen"><button type="button" data-room="living" aria-pressed="true" aria-controls="room-living">Wohnzimmer</button><button type="button" data-room="gallery" aria-pressed="false" aria-controls="room-gallery">Galeriewand</button></div>
          <div class="room-scene room-living" id="room-living" data-room-panel="living" role="img" aria-label="${escape(work.title)} über einem Sofa in einem hellen Wohnzimmer, illustrative Raumansicht"><img class="room-background" src="/assets/room-living.webp" alt="" width="1344" height="896" loading="lazy"><div class="room-art" style="--room-width:${livingWidth}%"><img src="${roomImage}" alt="" width="${work.width}" height="${work.height}" loading="lazy"></div></div>
          <div class="room-scene room-gallery" id="room-gallery" data-room-panel="gallery" role="img" aria-label="${escape(work.title)} an einer hellen Galeriewand, illustrative Raumansicht" hidden><img class="room-background" src="/assets/room-gallery.webp" alt="" width="1536" height="1024" loading="lazy"><div class="room-art" style="--room-width:${galleryWidth}%"><img src="${roomImage}" alt="" width="${work.width}" height="${work.height}" loading="lazy"></div></div>
          <noscript><style>.room-controls{display:none}.room-scene[hidden]{display:block!important;margin-top:24px}</style></noscript></section>
        <nav class="work-pagination" aria-label="Weitere Werke"><a href="/werke/${previous.slug}" rel="prev"><span>← Vorheriges Werk</span><strong>${escape(previous.title)}</strong></a><a href="/werke/${next.slug}" rel="next"><span>Nächstes Werk →</span><strong>${escape(next.title)}</strong></a></nav>`,
    };
  }),
  ...Object.entries(legal).map(([route, text]) => ({
    route, title: `${route === 'impressum' ? 'Impressum' : route === 'datenschutz' ? 'Datenschutz' : 'Cookies'} | SZO ART`,
    description: `Rechtliche Informationen von SZO ART: ${route}.`,
    content: `<article class="legal"><h1>${route === 'impressum' ? 'Impressum' : route === 'datenschutz' ? 'Datenschutz' : 'Cookie-Richtlinie'}</h1>${text.split('\n').slice(1).filter(line => line.trim() && line.trim() !== '\u200b').map(line => legalHeadings.has(line.trim()) ? `<h2>${escape(line)}</h2>` : `<p>${escape(line)}</p>`).join('')}</article>`,
  })),
];

function document(page: { route: string; title: string; description: string; content: string; image?: string }) {
  return `<!doctype html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><meta name="theme-color" content="#fbfaf7"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:type" content="website"><meta property="og:image" content="${page.image || '/assets/light.webp'}"><link rel="icon" href="/assets/szo-mark.svg" type="image/svg+xml"><link rel="preload" href="/assets/cinzel-latin.woff2" as="font" type="font/woff2" crossorigin><script>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.add('motion')</script><link rel="stylesheet" href="/styles.css"><script src="/app.js" defer></script><noscript><style>.menu-toggle,#contact-form{display:none}.site-header{height:auto;flex-wrap:wrap}.site-header nav{display:flex;position:static;flex-wrap:wrap;gap:16px;padding:0 0 12px;border:0}.site-header nav a{font-size:14px;padding:12px 0}</style></noscript></head><body><a class="skip-link" href="#main">Weiter zum Hauptinhalt</a>${header(page.route.startsWith('werke/') ? '/selektierte-werke' : '/' + page.route)}<main id="main" tabindex="-1">${page.content}</main>${footer}${viewer}${flyer}<script id="works-data" type="application/json">${JSON.stringify(works)}</script></body></html>`;
}
await rm(new URL('./dist', import.meta.url), { recursive: true, force: true });
await cp(new URL('./public', import.meta.url), new URL('./dist', import.meta.url), { recursive: true });
for (const page of pages) {
  const dir = new URL(`./dist/${page.route ? page.route + '/' : ''}`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await Bun.write(new URL('index.html', dir), document(page));
}
await Bun.write(new URL('./dist/404.html', import.meta.url), document({ route: '404', title: 'Seite nicht gefunden | SZO ART', description: 'Diese Seite wurde nicht gefunden.', content: `<section class="page-heading not-found"><p class="eyebrow">404</p><h1>Seite nicht gefunden</h1><p>Diese Seite existiert nicht.</p>${link('/', 'Home', true)}</section>` }));
console.log(`Built ${pages.length} pages, a 404 page, and ${works.length} artworks → dist/`);
