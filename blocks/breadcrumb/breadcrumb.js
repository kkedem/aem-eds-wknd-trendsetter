/*
 * Breadcrumb Block
 * Renders a structured breadcrumb trail from AEM page hierarchy.
 *
 * AEM content model: list of link items (ul > li > a)
 * The last item represents the current page (no link needed).
 */

export default function decorate(block) {
  const links = [...block.querySelectorAll('a')];
  const text  = block.textContent.trim();

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-nav';

  // If AEM provided links, use them; otherwise auto-build from URL
  if (links.length) {
    links.forEach((link) => {
      const li = document.createElement('li');
      const a = link.cloneNode(true);
      li.appendChild(a);
      ol.appendChild(li);
    });
    // Add current page as last item (non-linked)
    const currentPage = block.querySelector('strong, em')?.textContent
      || document.title.split(' | ')[0];
    const currentLi = document.createElement('li');
    currentLi.setAttribute('aria-current', 'page');
    currentLi.textContent = currentPage;
    ol.appendChild(currentLi);
  } else {
    // Auto-build from window.location
    const parts = window.location.pathname.split('/').filter(Boolean);
    const homeLi = document.createElement('li');
    const homeA = document.createElement('a');
    homeA.href = '/';
    homeA.textContent = 'Home';
    homeLi.appendChild(homeA);
    ol.appendChild(homeLi);

    parts.forEach((part, i) => {
      const li = document.createElement('li');
      const label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      if (i === parts.length - 1) {
        li.setAttribute('aria-current', 'page');
        li.textContent = label;
      } else {
        const a = document.createElement('a');
        a.href = '/' + parts.slice(0, i + 1).join('/');
        a.textContent = label;
        li.appendChild(a);
      }
      ol.appendChild(li);
    });
  }

  nav.appendChild(ol);
  block.innerHTML = '';
  block.appendChild(nav);
}
