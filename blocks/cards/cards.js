/*
 * Cards Block
 * Renders a grid of article cards with image, category, title, description.
 *
 * AEM content model (per row = one card):
 *   Column 1: image / picture
 *   Column 2: category (strong), title (h2/h3/h4), description (p), date (em), link (a)
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Detect optional header row (no image)
  let headerRow = null;
  if (rows[0] && !rows[0].querySelector('img, picture') && rows[0].querySelector('h2, h3')) {
    headerRow = rows.shift();
  }

  // ── Header ─────────────────────────────────────────────────
  if (headerRow) {
    const header = document.createElement('div');
    header.className = 'cards-header';

    const headerText = document.createElement('div');
    headerText.className = 'cards-header-text';

    const label = document.createElement('span');
    label.className = 'section-label';
    label.textContent = 'Latest Articles';
    headerText.appendChild(label);

    const heading = headerRow.querySelector('h2, h3');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.innerHTML = heading.innerHTML;
      headerText.appendChild(h2);
    }
    header.appendChild(headerText);

    const viewAll = headerRow.querySelector('a');
    if (viewAll) {
      const link = viewAll.cloneNode(true);
      link.className = 'cards-view-all';
      header.appendChild(link);
    } else {
      const link = document.createElement('a');
      link.className = 'cards-view-all';
      link.href = '/blog';
      link.textContent = 'View all';
      header.appendChild(link);
    }

    block.insertAdjacentElement('beforebegin', header);
  }

  // ── Cards grid ──────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'cards-grid';

  rows.forEach((row, i) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const imgCol  = cols[0];
    const bodyCol = cols[1] || cols[0];

    const link = bodyCol?.querySelector('a') || document.createElement('a');
    const card = document.createElement('a');
    card.className = 'card';
    card.href = link.href || '#';
    card.setAttribute('data-animate', '');
    card.setAttribute('data-animate-delay', String(i % 4 + 1));

    // ── Image ─────────────────────────────────────────────
    const imageWrap = document.createElement('div');
    imageWrap.className = 'card-image';

    const picture = imgCol?.querySelector('picture') || imgCol?.querySelector('img');
    if (picture) {
      imageWrap.appendChild(picture.cloneNode(true));
    }

    // Category badge
    const categoryEl = bodyCol?.querySelector('strong, .category');
    if (categoryEl) {
      const badge = document.createElement('span');
      badge.className = 'card-category';
      badge.textContent = categoryEl.textContent.trim();
      imageWrap.appendChild(badge);
    }

    card.appendChild(imageWrap);

    // ── Body ──────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'card-body';

    // Date / meta
    const dateEl = bodyCol?.querySelector('em, time');
    if (dateEl) {
      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.textContent = dateEl.textContent.trim();
      body.appendChild(meta);
    }

    // Title
    const titleEl = bodyCol?.querySelector('h2, h3, h4');
    if (titleEl) {
      const title = document.createElement('h3');
      title.className = 'card-title';
      title.innerHTML = titleEl.innerHTML;
      body.appendChild(title);
    }

    // Description
    const descEl = [...(bodyCol?.querySelectorAll('p') || [])].find(
      (p) => !p.querySelector('a') && p.textContent.trim().length > 30,
    );
    if (descEl) {
      const desc = document.createElement('p');
      desc.className = 'card-description';
      desc.textContent = descEl.textContent.trim();
      body.appendChild(desc);
    }

    card.appendChild(body);

    // ── Footer ────────────────────────────────────────────
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    const readMore = document.createElement('span');
    readMore.className = 'card-read-more';
    readMore.textContent = 'Read more';
    footer.appendChild(readMore);
    card.appendChild(footer);

    grid.appendChild(card);
  });

  block.innerHTML = '';
  block.appendChild(grid);
}
