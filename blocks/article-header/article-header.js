/*
 * Article Header Block
 * Renders article title, category label, author, date, and read time.
 *
 * AEM content model:
 *   Row 1: Category label (p)
 *   Row 2: Article title (h1/h2)
 *   Row 3: Author name | Date | Read time (pipe-separated or separate cols)
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  const wrapper = document.createElement('div');

  rows.forEach((row, i) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const text = row.textContent.trim();

    if (i === 0) {
      // Category label
      const label = document.createElement('span');
      label.className = 'article-header-label';
      label.textContent = text;
      wrapper.appendChild(label);

    } else if (i === 1) {
      // Title
      const title = document.createElement('h1');
      title.className = 'article-header-title';
      const existing = row.querySelector('h1, h2, h3');
      title.innerHTML = existing ? existing.innerHTML : text;
      wrapper.appendChild(title);

    } else if (i === 2) {
      // Meta: author | date | read time
      const meta = document.createElement('div');
      meta.className = 'article-header-meta';

      // Author
      if (cols[0]) {
        const authorEl = document.createElement('div');
        authorEl.className = 'article-header-author';
        const img = cols[0].querySelector('img');
        if (img) {
          img.className = 'article-header-author-avatar';
          authorEl.appendChild(img);
        } else {
          // Placeholder avatar
          const avatar = document.createElement('div');
          avatar.className = 'article-header-author-avatar';
          avatar.style.cssText = `
            width:36px;height:36px;border-radius:50%;
            background:linear-gradient(135deg,var(--color-accent-light),var(--color-accent));
            display:flex;align-items:center;justify-content:center;
            font-size:14px;font-weight:600;color:white;
          `;
          const nameText = cols[0].textContent.trim();
          avatar.textContent = nameText.charAt(0).toUpperCase();
          authorEl.appendChild(avatar);
        }
        const name = document.createElement('span');
        name.className = 'article-header-author-name';
        name.textContent = cols[0].textContent.replace(img?.alt || '', '').trim();
        authorEl.appendChild(name);
        meta.appendChild(authorEl);
      }

      // Date
      if (cols[1]) {
        const date = document.createElement('span');
        date.className = 'article-header-date';
        date.textContent = cols[1].textContent.trim();
        meta.appendChild(date);
      }

      // Read time
      if (cols[2]) {
        const read = document.createElement('span');
        read.className = 'article-header-readtime';
        read.textContent = cols[2].textContent.trim();
        meta.appendChild(read);
      }

      wrapper.appendChild(meta);
    }
  });

  block.innerHTML = '';
  block.appendChild(wrapper);
}
