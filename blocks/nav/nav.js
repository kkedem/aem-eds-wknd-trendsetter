/*
 * Nav Block
 * Fetches nav content from /nav (AEM fragment), builds sticky header
 * with mega-menu dropdowns and mobile hamburger.
 *
 * AEM source path: /content/wknd-trendsetters/en/nav
 * EDS renders this as a plain HTML fragment; nav.js builds the UI.
 */

import { loadCSS } from '../../scripts/aem.js';

/**
 * Build nav items from the unordered list in the nav fragment.
 * @param {Element} navEl - the raw AEM nav fragment
 * @returns {HTMLElement}
 */
function buildNavSections(navEl) {
  const ul = document.createElement('ul');
  ul.className = 'nav-sections';

  // Nav items defined in AEM as: ul > li > a (or ul > li > a + ul)
  const items = navEl.querySelectorAll(':scope > ul > li');
  items.forEach((item) => {
    const li = document.createElement('li');
    const link = item.querySelector(':scope > a');
    const subList = item.querySelector(':scope > ul');

    if (subList) {
      // Has dropdown
      const btn = document.createElement('button');
      btn.textContent = link ? link.textContent : item.firstChild.textContent.trim();
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-haspopup', 'true');

      const dropdown = document.createElement('ul');
      dropdown.className = 'nav-dropdown';
      subList.querySelectorAll('li').forEach((sub) => {
        const subLi = document.createElement('li');
        subLi.innerHTML = sub.innerHTML;
        dropdown.appendChild(subLi);
      });

      btn.addEventListener('click', () => {
        const isOpen = li.classList.toggle('active');
        btn.setAttribute('aria-expanded', String(isOpen));
        // Close other open dropdowns
        ul.querySelectorAll('li.active').forEach((other) => {
          if (other !== li) {
            other.classList.remove('active');
            other.querySelector('button')?.setAttribute('aria-expanded', 'false');
          }
        });
      });

      li.appendChild(btn);
      li.appendChild(dropdown);
    } else {
      const a = document.createElement('a');
      a.href = link?.href || '#';
      a.textContent = link?.textContent || '';
      li.appendChild(a);
    }

    ul.appendChild(li);
  });

  return ul;
}

/**
 * Main decorate function — called by EDS block loader.
 * @param {Element} block
 */
export default async function decorate(block) {
  // Move block into <header>
  const header = document.querySelector('header') || document.createElement('header');
  if (!document.querySelector('header')) document.body.prepend(header);

  // Fetch nav fragment from AEM (or use inline content if already provided)
  let navContent = block.innerHTML;
  if (block.querySelector('a[href="/nav"]') || !block.innerHTML.trim()) {
    try {
      const resp = await fetch('/nav.html');
      if (resp.ok) navContent = await resp.text();
    } catch {
      // Use block content as fallback
    }
  }

  const parser = new DOMParser();
  const navDoc = parser.parseFromString(`<div>${navContent}</div>`, 'text/html');
  const navEl  = navDoc.body.firstElementChild;

  // ── Build nav structure ──────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // Brand / Logo
  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = '/';
  brand.setAttribute('aria-label', 'WKND Trendsetters home');
  brand.innerHTML = `<span class="nav-brand-text">WKND <span>Trendsetters</span></span>`;

  // Nav sections
  const sections = buildNavSections(navEl);

  // Tools
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const subscribe = document.createElement('a');
  subscribe.className = 'nav-subscribe';
  subscribe.href = '#subscribe';
  subscribe.textContent = 'Subscribe';
  tools.appendChild(subscribe);

  // Hamburger
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Toggle navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';

  hamburger.addEventListener('click', () => {
    const isOpen = sections.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.appendChild(brand);
  nav.appendChild(sections);
  nav.appendChild(tools);
  nav.appendChild(hamburger);

  header.innerHTML = '';
  header.appendChild(nav);
  block.remove();

  // ── Scroll shadow ────────────────────────────────────────────
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // ── Close dropdowns on outside click ────────────────────────
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      sections.querySelectorAll('li.active').forEach((li) => {
        li.classList.remove('active');
        li.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
}
