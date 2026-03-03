/*
 * Testimonials Block
 * Tabbed testimonial cards with avatar, name, role, and quote.
 *
 * AEM content model (per row = one testimonial):
 *   Column 1: Author name (strong/h3), role (em/p), avatar (img)
 *   Column 2: Quote text (p or blockquote)
 */

function buildInitialsAvatar(name) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  // Random-ish gradient based on name
  const colors = [
    ['#fce7f3','#e11d48'], ['#ede9fe','#7c3aed'],
    ['#d1fae5','#059669'], ['#fef3c7','#d97706'],
    ['#dbeafe','#2563eb'],
  ];
  const pair = colors[name.charCodeAt(0) % colors.length];
  const el = document.createElement('div');
  el.className = 'tab-avatar-initials';
  el.style.background = `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
  el.textContent = initials;
  return el;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Detect optional header row
  let headerRow = null;
  if (rows[0] && !rows[0].querySelector('img, picture, blockquote')
    && rows[0].querySelector('h2, h3')) {
    headerRow = rows.shift();
  }

  const inner = document.createElement('div');
  inner.className = 'testimonials-inner';

  // Header
  if (headerRow) {
    const header = document.createElement('div');
    header.className = 'testimonials-header';
    const label = document.createElement('span');
    label.className = 'section-label';
    label.textContent = 'What they say';
    header.appendChild(label);
    const heading = headerRow.querySelector('h2, h3');
    if (heading) header.appendChild(heading.cloneNode(true));
    inner.appendChild(header);
  }

  const layout = document.createElement('div');
  layout.className = 'testimonials-layout';

  const tabList = document.createElement('ul');
  tabList.className = 'testimonials-tabs';
  tabList.setAttribute('role', 'tablist');

  const panelsEl = document.createElement('div');
  panelsEl.className = 'testimonials-panels';

  const testimonials = [];

  rows.forEach((row, i) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const authorCol = cols[0];
    const quoteCol  = cols[1] || cols[0];

    // Parse author info
    const nameEl = authorCol?.querySelector('strong, h3, h4') || authorCol;
    const roleEl = authorCol?.querySelector('em, p:nth-child(2)');
    const imgEl  = authorCol?.querySelector('img');

    const name = nameEl?.textContent?.trim() || `Reviewer ${i + 1}`;
    const role = roleEl?.textContent?.trim() || '';

    // Parse quote
    const quoteEl   = quoteCol?.querySelector('blockquote, p');
    const quoteText = quoteEl?.textContent?.trim()
      || quoteCol?.textContent?.trim()
      || '';

    testimonials.push({ name, role, img: imgEl?.src, quote: quoteText });

    // ── Tab button ─────────────────────────────────────────
    const li = document.createElement('li');
    li.setAttribute('role', 'presentation');

    const tab = document.createElement('button');
    tab.className = `testimonials-tab${i === 0 ? ' active' : ''}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(i === 0));
    tab.setAttribute('aria-controls', `testimonial-panel-${i}`);
    tab.id = `testimonial-tab-${i}`;

    // Avatar
    if (imgEl?.src) {
      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'tab-avatar';
      const img = document.createElement('img');
      img.src = imgEl.src;
      img.alt = name;
      avatarWrap.appendChild(img);
      tab.appendChild(avatarWrap);
    } else {
      tab.appendChild(buildInitialsAvatar(name));
    }

    const info = document.createElement('div');
    info.className = 'tab-info';
    info.innerHTML = `<div class="tab-name">${name}</div><div class="tab-role">${role}</div>`;
    tab.appendChild(info);

    li.appendChild(tab);
    tabList.appendChild(li);

    // ── Panel ───────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.className = `testimonials-panel${i === 0 ? ' active' : ''}`;
    panel.id = `testimonial-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `testimonial-tab-${i}`);

    panel.innerHTML = `
      <div class="quote-card">
        <div class="quote-mark">"</div>
        <div class="quote-stars">${'<span>★</span>'.repeat(5)}</div>
        <p class="quote-text">${quoteText}</p>
        <div class="quote-author">
          <div class="quote-author-avatar">
            ${imgEl?.src
              ? `<img src="${imgEl.src}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`
              : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--color-accent-light),var(--color-accent));display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:600;color:white">${name.charAt(0)}</div>`
            }
          </div>
          <div>
            <div class="quote-author-name">${name}</div>
            <div class="quote-author-role">${role}</div>
          </div>
        </div>
      </div>`;

    panelsEl.appendChild(panel);
  });

  // ── Tab switching ──────────────────────────────────────────
  function activate(index) {
    tabList.querySelectorAll('.testimonials-tab').forEach((t, j) => {
      t.classList.toggle('active', j === index);
      t.setAttribute('aria-selected', String(j === index));
    });
    panelsEl.querySelectorAll('.testimonials-panel').forEach((p, j) => {
      p.classList.toggle('active', j === index);
    });
  }

  tabList.querySelectorAll('.testimonials-tab').forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));
  });

  layout.appendChild(tabList);
  layout.appendChild(panelsEl);
  inner.appendChild(layout);

  block.innerHTML = '';
  block.appendChild(inner);
}
