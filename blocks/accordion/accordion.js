/*
 * Accordion Block — FAQ expandable items.
 *
 * AEM content model (per row = one FAQ item):
 *   Column 1: Question (h3 or strong or p)
 *   Column 2: Answer (p or multiple p)
 */

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Detect optional header row
  let headerRow = null;
  if (rows[0] && rows[0].children.length === 1 && rows[0].querySelector('h2, h3')) {
    headerRow = rows.shift();
  }

  if (headerRow) {
    const header = document.createElement('div');
    header.className = 'accordion-header';
    const label = document.createElement('span');
    label.className = 'section-label';
    label.textContent = 'FAQ';
    header.appendChild(label);
    const heading = headerRow.querySelector('h2, h3');
    if (heading) header.appendChild(heading.cloneNode(true));
    block.insertAdjacentElement('beforebegin', header);
  }

  const list = document.createElement('div');
  list.className = 'accordion-items';

  rows.forEach((row, i) => {
    const cols = [...row.querySelectorAll(':scope > div')];
    const questionCol = cols[0];
    const answerCol   = cols[1] || cols[0];

    const questionText = questionCol?.querySelector('h3, h4, strong')?.textContent
      || questionCol?.textContent?.trim()
      || `Question ${i + 1}`;

    const item = document.createElement('div');
    item.className = 'accordion-item';

    // Trigger button
    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `accordion-panel-${i}`);
    trigger.id = `accordion-trigger-${i}`;

    const question = document.createElement('span');
    question.className = 'accordion-question';
    question.textContent = questionText;

    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');

    trigger.appendChild(question);
    trigger.appendChild(icon);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = `accordion-panel-${i}`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', `accordion-trigger-${i}`);

    const panelInner = document.createElement('div');
    panelInner.className = 'accordion-panel-inner';

    // Answer content — use second column if available
    const answerContent = cols[1] ? cols[1] : questionCol;
    // Remove the question element from the inner content if present
    const clonedAnswer = answerContent.cloneNode(true);
    clonedAnswer.querySelectorAll('h3, h4, strong:first-child').forEach((el) => {
      if (el.textContent.trim() === questionText) el.remove();
    });
    panelInner.innerHTML = clonedAnswer.innerHTML;

    panel.appendChild(panelInner);
    item.appendChild(trigger);
    item.appendChild(panel);

    // ── Toggle logic ─────────────────────────────────────
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        panel.style.height = panelInner.scrollHeight + 'px';
        // Collapse other open items
        list.querySelectorAll('.accordion-item.open').forEach((other) => {
          if (other !== item) {
            other.classList.remove('open');
            const otherTrigger = other.querySelector('.accordion-trigger');
            const otherPanel   = other.querySelector('.accordion-panel');
            otherTrigger?.setAttribute('aria-expanded', 'false');
            if (otherPanel) otherPanel.style.height = '0';
          }
        });
      } else {
        panel.style.height = '0';
      }
    });

    // Keyboard: Enter/Space already trigger button; also support arrow keys
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = item.nextElementSibling?.querySelector('.accordion-trigger');
        next?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = item.previousElementSibling?.querySelector('.accordion-trigger');
        prev?.focus();
      }
    });

    list.appendChild(item);
  });

  block.innerHTML = '';
  block.appendChild(list);
}
