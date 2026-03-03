/*
 * aem.js — EDS Core Library
 * Handles block auto-discovery, CSS/JS lazy loading, and section decoration.
 * This is the EDS runtime engine (do not modify project-specific logic here).
 */

/**
 * Load a CSS file and inject it into the document head.
 * @param {string} href
 * @param {Element} [before]
 */
export function loadCSS(href, before) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (before) {
      document.head.insertBefore(link, before);
    } else {
      document.head.appendChild(link);
    }
    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
  }
  return Promise.resolve();
}

/**
 * Load a script file.
 * @param {string} src
 * @param {object} [attrs] - additional attributes
 */
export function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Get the block name from its class list.
 * @param {Element} block
 * @returns {string}
 */
export function getBlockName(block) {
  return block.classList[0];
}

/**
 * Decorate a block: add aria, data attributes.
 * @param {Element} block
 */
export function decorateBlock(block) {
  const name = getBlockName(block);
  block.classList.add('block');
  block.dataset.blockName = name;
  block.dataset.blockStatus = 'initialized';
}

/**
 * Load a single block's CSS and JS, then call its decorate function.
 * @param {Element} block
 * @returns {Promise}
 */
export async function loadBlock(block) {
  const name = getBlockName(block);
  if (block.dataset.blockStatus === 'loading' || block.dataset.blockStatus === 'loaded') return;
  block.dataset.blockStatus = 'loading';

  const cssPath = `/blocks/${name}/${name}.css`;
  const jsPath  = `/blocks/${name}/${name}.js`;

  try {
    const [mod] = await Promise.all([
      import(jsPath),
      loadCSS(cssPath),
    ]);
    if (mod && mod.default) {
      await mod.default(block);
    }
    block.dataset.blockStatus = 'loaded';
  } catch (err) {
    block.dataset.blockStatus = 'error';
    // eslint-disable-next-line no-console
    console.warn(`Failed to load block: ${name}`, err);
  }
}

/**
 * Decorate all blocks on the page.
 * @param {Element} main
 */
export function decorateBlocks(main) {
  main.querySelectorAll('div[class]').forEach((block) => {
    if (!block.classList.contains('section') && !block.classList.contains('block')) {
      decorateBlock(block);
    }
  });
}

/**
 * Decorate sections: wrap each top-level <main> > <div> as a .section
 * @param {Element} main
 */
export function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    section.classList.add('section');
    const metadata = section.querySelector('.section-metadata');
    if (metadata) {
      metadata.querySelectorAll(':scope > div').forEach((row) => {
        const [keyEl, valEl] = row.children;
        if (keyEl && valEl) {
          const key   = keyEl.textContent.trim().toLowerCase().replace(/\s+/g, '-');
          const value = valEl.textContent.trim();
          section.dataset[key] = value;
          if (key === 'style') {
            value.split(',').map((v) => v.trim()).forEach((v) => section.classList.add(v));
          }
        }
      });
      metadata.remove();
    }
  });
}

/**
 * Decorate icons: replace :icon-name: syntax with <img> tags.
 * @param {Element} element
 */
export function decorateIcons(element) {
  element.querySelectorAll('span.icon').forEach((icon) => {
    const name = [...icon.classList].find((c) => c.startsWith('icon-'))?.replace('icon-', '');
    if (name) {
      const img = document.createElement('img');
      img.src = `/icons/${name}.svg`;
      img.alt = name;
      img.loading = 'lazy';
      icon.appendChild(img);
    }
  });
}

/**
 * Load all blocks inside a section (used for LCP section eager loading).
 * @param {Element} section
 * @returns {Promise}
 */
export function loadSection(section) {
  const blocks = [...section.querySelectorAll('.block[data-block-status="initialized"]')];
  return Promise.all(blocks.map(loadBlock));
}

/**
 * Load all blocks in the document lazily (IntersectionObserver).
 * @param {Element} main
 */
export function loadBlocks(main) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        loadBlock(target);
        obs.unobserve(target);
      }
    });
  }, { rootMargin: '200px' });

  main.querySelectorAll('.block[data-block-status="initialized"]').forEach((block) => {
    observer.observe(block);
  });
}

/**
 * Decorate links: add target/rel for external links.
 * @param {Element} main
 */
export function decorateLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    try {
      const url = new URL(a.href, window.location.href);
      if (url.hostname !== window.location.hostname) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    } catch {
      // ignore invalid hrefs
    }
  });
}

/**
 * Build a picture element with responsive sources.
 * @param {string} src
 * @param {string} alt
 * @param {boolean} eager
 * @param {Array} breakpoints
 * @returns {Element}
 */
export function createOptimizedPicture(
  src,
  alt = '',
  eager = false,
  breakpoints = [{ media: '(min-width: 600px)', width: 2000 }, { width: 750 }],
) {
  const url = new URL(src, window.location.href);
  const picture = document.createElement('picture');

  breakpoints.forEach(({ media, width }) => {
    const source = document.createElement('source');
    source.srcset = `${url.pathname}?width=${width}&format=webp&optimize=medium`;
    if (media) source.media = media;
    source.type = 'image/webp';
    picture.appendChild(source);
  });

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = eager ? 'eager' : 'lazy';
  img.fetchpriority = eager ? 'high' : 'auto';
  picture.appendChild(img);

  return picture;
}
