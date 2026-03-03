/*
 * Hero Block — image carousel with animated text overlay.
 *
 * AEM content model (per slide row):
 *   Column 1: Heading (h1), paragraph (description), links (CTAs)
 *   Column 2: Image / picture
 *
 * Each <div> row inside the block = one slide.
 */

const AUTOPLAY_INTERVAL = 6000;

function buildArrowSVG(direction) {
  const d = direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="${d.split('M')[1].split('l').map((p, i) => {
    // Build SVG path points
    return '';
  }).join('')}"></polyline></svg>`;
}

/**
 * Build a single slide element from a block row.
 * @param {Element} row
 * @param {number} index
 * @returns {HTMLElement}
 */
function buildSlide(row, index) {
  const slide = document.createElement('div');
  slide.className = 'hero-slide';
  if (index === 0) slide.classList.add('active');

  const cols = [...row.querySelectorAll(':scope > div')];

  // Column 2 = image
  const imgCol = cols[1] || cols[0];
  if (imgCol) {
    const picture = imgCol.querySelector('picture') || imgCol.querySelector('img');
    if (picture) {
      if (picture.tagName === 'IMG') {
        const pic = document.createElement('picture');
        pic.appendChild(picture.cloneNode(true));
        slide.appendChild(pic);
      } else {
        slide.appendChild(picture.cloneNode(true));
      }
    }
  }

  // Column 1 = text
  const textCol = cols[0];
  if (textCol) {
    const content = document.createElement('div');
    content.className = 'hero-content';

    // Eyebrow (optional — first <p> that's short)
    const allP = [...textCol.querySelectorAll('p')];
    const eyebrowEl = allP.find((p) => p.textContent.length < 60 && p.textContent.length > 0
      && !p.querySelector('a'));
    if (eyebrowEl) {
      const eyebrow = document.createElement('div');
      eyebrow.className = 'hero-eyebrow';
      eyebrow.textContent = eyebrowEl.textContent;
      content.appendChild(eyebrow);
      eyebrowEl.remove();
    }

    // Heading
    const heading = textCol.querySelector('h1, h2, h3');
    if (heading) {
      const h = document.createElement('h1');
      h.className = 'hero-title';
      h.innerHTML = heading.innerHTML;
      content.appendChild(h);
      heading.remove();
    }

    // Description
    const descEl = textCol.querySelector('p');
    if (descEl) {
      const desc = document.createElement('p');
      desc.className = 'hero-description';
      desc.innerHTML = descEl.innerHTML;
      content.appendChild(desc);
      descEl.remove();
    }

    // CTAs (links)
    const links = textCol.querySelectorAll('a');
    if (links.length) {
      const cta = document.createElement('div');
      cta.className = 'hero-cta';
      links.forEach((link, i) => {
        const a = link.cloneNode(true);
        a.className = `button ${i === 0 ? 'primary' : 'secondary'}`;
        cta.appendChild(a);
      });
      content.appendChild(cta);
    }

    slide.appendChild(content);
  }

  return slide;
}

/**
 * Main decorate function.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  // ── Build slides ───────────────────────────────────────────
  const slidesEl = document.createElement('div');
  slidesEl.className = 'hero-slides';

  const slides = rows.map((row, i) => {
    const slide = buildSlide(row, i);
    slidesEl.appendChild(slide);
    return slide;
  });

  // ── Prev / Next arrows ─────────────────────────────────────
  const prevBtn = document.createElement('button');
  prevBtn.className = 'hero-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'hero-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

  // ── Indicators ─────────────────────────────────────────────
  const indicators = document.createElement('ol');
  indicators.className = 'hero-indicators';
  const indicatorBtns = slides.map((_, i) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) btn.classList.add('active');
    li.appendChild(btn);
    indicators.appendChild(li);
    return btn;
  });

  // ── State & transitions ────────────────────────────────────
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    indicatorBtns[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    indicatorBtns[current].classList.add('active');
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
  }

  function startAutoplay() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), AUTOPLAY_INTERVAL);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });
  indicatorBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => { goTo(i); startAutoplay(); });
  });

  // Keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); startAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAutoplay(); }
  });

  // ── Assemble ───────────────────────────────────────────────
  block.innerHTML = '';
  block.appendChild(slidesEl);
  if (slides.length > 1) {
    block.appendChild(prevBtn);
    block.appendChild(nextBtn);
    block.appendChild(indicators);
    startAutoplay();
  }
}
