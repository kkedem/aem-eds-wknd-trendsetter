/*
 * scripts.js — Site Initialisation (eager)
 * Runs immediately on page load. Orchestrates the EDS loading pipeline.
 */

import {
  loadCSS,
  decorateSections,
  decorateBlocks,
  decorateIcons,
  decorateLinks,
  loadSection,
  loadBlocks,
} from './aem.js';

/**
 * Move the first section's first block above the fold immediately (LCP boost).
 * @param {Element} main
 */
function loadEager(main) {
  decorateSections(main);
  decorateBlocks(main);
  decorateIcons(main);
  decorateLinks(main);

  // Eagerly load the first section (LCP content)
  const firstSection = main.querySelector('.section');
  if (firstSection) loadSection(firstSection);
}

/**
 * Load everything else after the LCP section is visible.
 * @param {Element} main
 */
async function loadLazy(main) {
  loadCSS('/styles/lazy-styles.css');
  loadBlocks(main);
  await loadSection(main.querySelector('header > .nav') || document.createElement('div'));

  // Animate elements on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        io.unobserve(target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-animate]').forEach((el) => io.observe(el));
}

/**
 * Called after everything is loaded.
 */
function loadDelayed() {
  // Load analytics, chat widgets, etc. here (3rd party)
}

/**
 * Main init.
 */
async function init() {
  const main = document.querySelector('main');
  if (!main) return;

  // Show page (was hidden to prevent FOUC)
  document.body.classList.add('appear');

  loadEager(main);

  await new Promise((r) => { window.setTimeout(r, 0); }); // yield to browser
  await loadLazy(main);

  window.setTimeout(loadDelayed, 3000);
}

init();
