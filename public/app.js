const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.querySelector('span').textContent = '＋';
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.querySelector('span').textContent = open ? '−' : '＋';
  nav.classList.toggle('is-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);

const works = JSON.parse(document.querySelector('#works-data').textContent);
const dialog = document.querySelector('.viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerStage = document.querySelector('.viewer-stage');
const viewerStatus = document.querySelector('#viewer-status');
let current = 0;
let viewerOpener;
function showWork(index) {
  current = (index + works.length) % works.length;
  const work = works[current];
  viewerStage.setAttribute('aria-busy', 'true');
  viewerImage.hidden = false;
  viewerStatus.textContent = 'Bild wird geladen …';
  viewerImage.src = `/assets/${work.slug}.webp`;
  viewerImage.alt = `${work.title}, Gemälde von Sabine Szotowski Salis`;
  document.querySelector('#viewer-title').textContent = work.title;
  document.querySelector('#viewer-title').href = `/werke/${work.slug}`;
  document.querySelector('#viewer-count').textContent = `${current + 1} / ${works.length}`;
  document.querySelector('#viewer-contact').href = `/kontakt?werk=${encodeURIComponent(work.title)}`;
}
viewerImage.addEventListener('load', () => {
  viewerStage.setAttribute('aria-busy', 'false');
  viewerStatus.textContent = '';
});
viewerImage.addEventListener('error', () => {
  viewerImage.hidden = true;
  viewerStage.setAttribute('aria-busy', 'false');
  viewerStatus.textContent = 'Das Bild konnte nicht geladen werden. Wählen Sie ein anderes Werk oder öffnen Sie die Ansicht erneut.';
});
document.querySelectorAll('[data-work]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  viewerOpener = link;
  showWork(works.findIndex(work => work.slug === link.dataset.work));
  dialog.showModal();
  document.body.classList.add('viewer-open');
}));
dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.viewer-prev').addEventListener('click', () => showWork(current - 1));
dialog.querySelector('.viewer-next').addEventListener('click', () => showWork(current + 1));
dialog.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  viewerOpener?.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); showWork(current - 1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showWork(current + 1); }
});

const form = document.querySelector('#contact-form');
if (form) {
  const requestedWork = new URLSearchParams(location.search).get('werk');
  if (requestedWork) form.elements.betreff.value = `Anfrage zu „${requestedWork.slice(0, 160)}“`;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const body = `${fields.get('nachricht')}\n\n${fields.get('vorname')} ${fields.get('nachname')}\n${fields.get('email')}`;
    const draft = `An: info@szo-art.de\nBetreff: ${fields.get('betreff')}\n\n${body}`;
    document.querySelector('#email-draft').value = draft;
    document.querySelector('#email-fallback').hidden = false;
    document.querySelector('#form-status').textContent = 'Ihre Nachricht ist vorbereitet. Bitte versenden Sie sie in Ihrem E-Mail-Programm.';
    location.href = `mailto:info@szo-art.de?subject=${encodeURIComponent(fields.get('betreff'))}&body=${encodeURIComponent(body)}`;
  });
  document.querySelector('#copy-message').addEventListener('click', async () => {
    const draft = document.querySelector('#email-draft');
    try {
      await navigator.clipboard.writeText(draft.value);
      document.querySelector('#form-status').textContent = 'Nachricht kopiert. Sie können sie jetzt in Ihre E-Mail einfügen.';
    } catch {
      draft.focus(); draft.select();
      document.querySelector('#form-status').textContent = 'Nachricht markiert. Kopieren Sie sie mit Strg+C oder ⌘C.';
    }
  });
}

document.querySelectorAll('[data-room]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-room]').forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
    document.querySelectorAll('[data-room-panel]').forEach(panel => {
      panel.hidden = panel.dataset.roomPanel !== button.dataset.room;
    });
  });
});

if (document.documentElement.classList.contains('motion')) {
  const statement = [...document.querySelectorAll('.artist-statement .w')];
  if (statement.length) {
    const quote = statement[0].closest('p');
    const update = () => {
      const top = quote.getBoundingClientRect().top;
      const start = innerHeight * .9;
      // Finish by the time the page can't scroll further, so the last words never stay blurred.
      const end = Math.max(innerHeight * .4, top - (document.documentElement.scrollHeight - innerHeight - scrollY));
      const progress = end >= start ? 1 : Math.min(1, Math.max(0, (start - top) / (start - end)));
      statement.forEach((word, i) => word.style.setProperty('--t', Math.min(1, Math.max(0, progress * statement.length - i))));
    };
    addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    update();
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.section-heading, .selected-grid .work, .gallery .work, .artist-preview > *, .contact-strip, .gallery-contact, .biography > *, .room-preview, .work-pagination').forEach((element, i) => {
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('reveal');
    element.style.transitionDelay = `${(i % 3) * 90}ms`;
    observer.observe(element);
  });
}

const gallery = document.querySelector('.gallery');
if (gallery) {
  const layout = () => {
    const gap = parseFloat(getComputedStyle(gallery).columnGap) + 12;
    gallery.querySelectorAll('.work').forEach(work => {
      work.style.gridRowEnd = `span ${Math.ceil(work.querySelector('figure').getBoundingClientRect().height + gap)}`;
    });
  };
  gallery.classList.add('is-masonry');
  new ResizeObserver(layout).observe(gallery);
}
