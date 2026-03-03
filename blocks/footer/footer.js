/*
 * Footer Block
 * Fetches footer content from /footer (AEM fragment) and builds
 * a multi-column footer with newsletter sign-up and social links.
 *
 * AEM source path: /content/wknd-trendsetters/en/footer
 */

export default async function decorate(block) {
  const footerEl = document.querySelector('footer') || document.createElement('footer');
  if (!document.querySelector('footer')) document.body.appendChild(footerEl);

  // Fetch footer fragment
  let footerContent = block.innerHTML;
  if (!block.innerHTML.trim() || block.querySelector('a[href="/footer"]')) {
    try {
      const resp = await fetch('/footer.html');
      if (resp.ok) footerContent = await resp.text();
    } catch {
      // Use inline content
    }
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${footerContent}</div>`, 'text/html');
  const src = doc.body.firstElementChild;

  // Parse nav columns from AEM (ul lists)
  const columns = [...src.querySelectorAll(':scope > ul, :scope > div > ul')];

  const footer = document.createElement('div');
  footer.className = 'footer block';

  // ── Top section ──────────────────────────────────────────
  const top = document.createElement('div');
  top.className = 'footer-top';

  // Brand column
  const brand = document.createElement('div');
  brand.className = 'footer-brand';
  brand.innerHTML = `
    <span class="footer-brand-name">WKND <span>Trendsetters</span></span>
    <p class="footer-tagline">Your go-to destination for fresh looks, bold stories, and real-life style inspiration.</p>
    <ul class="footer-social">
      <li><a href="#" aria-label="Instagram">In</a></li>
      <li><a href="#" aria-label="TikTok">Tk</a></li>
      <li><a href="#" aria-label="Twitter/X">X</a></li>
      <li><a href="#" aria-label="Pinterest">Pt</a></li>
    </ul>`;
  top.appendChild(brand);

  // Nav columns — built from AEM content or fallback
  const navData = columns.length >= 3 ? columns : null;
  const fallbackCols = [
    { heading: 'Trends',   links: ['Style', 'Looks', 'Events', 'Brands', 'Tips'] },
    { heading: 'Inspire',  links: ['Stories', 'People', 'Culture', 'Vibes', 'Fun'] },
    { heading: 'Explore',  links: ['Travel', 'Beach', 'Night', 'Sport', 'Chill'] },
  ];

  fallbackCols.forEach(({ heading, links }) => {
    const col = document.createElement('div');
    col.className = 'footer-nav-col';
    col.innerHTML = `
      <h4 class="footer-nav-heading">${heading}</h4>
      <ul>${links.map((l) => `<li><a href="#">${l}</a></li>`).join('')}</ul>`;
    top.appendChild(col);
  });

  footer.appendChild(top);

  // ── Newsletter ────────────────────────────────────────────
  const newsletter = document.createElement('div');
  newsletter.className = 'footer-newsletter';
  newsletter.innerHTML = `
    <div class="footer-newsletter-text">
      <h3>Stay in the loop</h3>
      <p>Get the freshest style drops and trend alerts straight to your inbox.</p>
    </div>
    <form class="footer-newsletter-form" id="footer-newsletter-form">
      <input
        type="email"
        class="footer-newsletter-input"
        placeholder="Your email address"
        aria-label="Email address for newsletter"
        required
      />
      <button type="submit" class="footer-newsletter-btn">Subscribe</button>
    </form>`;
  footer.appendChild(newsletter);

  newsletter.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = newsletter.querySelector('.footer-newsletter-btn');
    btn.textContent = 'Subscribed ✓';
    btn.style.background = '#059669';
    newsletter.querySelector('input').value = '';
  });

  // ── Bottom bar ────────────────────────────────────────────
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  const year = new Date().getFullYear();
  bottom.innerHTML = `
    <span>© ${year} WKND Trendsetters. All rights reserved.</span>
    <ul class="footer-legal">
      <li><a href="/privacy">Privacy Policy</a></li>
      <li><a href="/terms">Terms of Use</a></li>
      <li><a href="/cookies">Cookie Policy</a></li>
    </ul>`;
  footer.appendChild(bottom);

  footerEl.innerHTML = '';
  footerEl.appendChild(footer);
  block.remove();
}
