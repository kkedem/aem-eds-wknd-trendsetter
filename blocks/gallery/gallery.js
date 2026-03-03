/*
 * Gallery Block
 * Renders a responsive image grid with hover effects.
 *
 * AEM content model: each row = one image
 *   Column 1: image / picture
 *   Column 2: (optional) caption text
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Check for optional header row (no image, just text)
  let headerRow = null;
  const firstCols = rows[0]?.querySelectorAll(':scope > div');
  if (firstCols && !rows[0].querySelector('img, picture') && rows[0].querySelector('h2, h3')) {
    headerRow = rows.shift();
  }

  // ── Header ─────────────────────────────────────────────────
  if (headerRow) {
    const header = document.createElement('div');
    header.className = 'gallery-header';
    header.innerHTML = headerRow.innerHTML;
    block.insertAdjacentElement('beforebegin', header);
  }

  // ── Grid ───────────────────────────────────────────────────
  const grid = document.createElement('div');
  grid.className = 'gallery-grid';

  rows.forEach((row) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const imgCol     = cols[0];
    const captionCol = cols[1];

    if (!imgCol) return;

    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-animate', '');

    const picture = imgCol.querySelector('picture') || imgCol.querySelector('img');
    if (picture) {
      item.appendChild(picture.cloneNode(true));
    }

    if (captionCol?.textContent.trim()) {
      const caption = document.createElement('div');
      caption.className = 'gallery-caption';
      caption.textContent = captionCol.textContent.trim();
      item.appendChild(caption);
    }

    // Lightbox: open image full-size on click
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        cursor:zoom-out;
      `;
      const img = document.createElement('img');
      img.src = src;
      img.style.cssText = `max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;`;
      overlay.appendChild(img);
      overlay.addEventListener('click', () => overlay.remove());
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.remove(); }, { once: true });
      document.body.appendChild(overlay);
    });

    grid.appendChild(item);
  });

  block.innerHTML = '';
  block.appendChild(grid);
}
