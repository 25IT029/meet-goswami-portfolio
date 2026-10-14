(() => {
  const menuToggle = document.querySelector('#menu-toggle');
  const nav = document.querySelector('.site-nav');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('.project-card');
  const filterStatus = document.querySelector('#filter-status');
  const lightbox = document.querySelector('.lightbox');
  const lightboxContent = document.querySelector('.lightbox-content');
  const lightboxTitle = document.querySelector('#lightbox-title');
  const closeLightboxButton = document.querySelector('.lightbox-close');
  let lastLightboxTrigger = null;

  // Keep the checkbox menu usable by mouse, touch, and keyboard.
  function toggleMenu() {
    if (!menuToggle || !nav) return;
    nav.inert = window.matchMedia('(max-width: 768px)').matches && !menuToggle.checked;
  }

  menuToggle?.addEventListener('change', toggleMenu);
  window.matchMedia('(max-width: 768px)').addEventListener('change', toggleMenu);
  toggleMenu();

  // Smoothly scroll to in-page links and collapse the mobile menu afterward.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (menuToggle) {
        menuToggle.checked = false;
        toggleMenu();
      }
    });
  });

  // Filter cards by one of the categories listed in data-categories.
  function filterProjects(category) {
    let visibleCount = 0;
    projectCards.forEach((card) => {
      const categories = (card.dataset.categories || '').split(/\s+/);
      const visible = category === 'all' || categories.includes(category);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    filterStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} shown.`;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filterProjects(button.dataset.filter || 'all');
    });
  });

  // Use a native dialog so Escape, focus management, and modal semantics work.
  document.querySelectorAll('.lightbox-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!lightbox || typeof lightbox.showModal !== 'function') return;
      const card = trigger.closest('.project-card');
      const title = card?.querySelector('h3')?.textContent || 'Project preview';
      lightboxTitle.textContent = `${title} — project preview`;
      lightboxContent.replaceChildren(trigger.cloneNode(true));
      lastLightboxTrigger = trigger;
      lightbox.showModal();
      closeLightboxButton.focus();
    });
  });

  closeLightboxButton?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener('close', () => lastLightboxTrigger?.focus());

  // Show field-level feedback while typing and before opening the email app.
  const contactForm = document.querySelector('.contact-form');
  const formStatus = document.querySelector('.form-status');
  const fields = [
    { input: document.querySelector('#name'), error: document.querySelector('#name-error'), label: 'Your name' },
    { input: document.querySelector('#email'), error: document.querySelector('#email-error'), label: 'Email address' },
    { input: document.querySelector('#message'), error: document.querySelector('#message-error'), label: 'Message' },
  ];

  function validateField(field) {
    const { input, error, label } = field;
    let message = '';
    if (!input.value.trim()) message = `${label} is required.`;
    else if (input.type === 'email' && !input.validity.valid) message = 'Enter a valid email address.';
    error.textContent = message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  fields.forEach((field) => {
    field.input.addEventListener('input', () => {
      if (field.input.value || field.input.getAttribute('aria-invalid') === 'true') validateField(field);
      formStatus.textContent = '';
    });
    field.input.addEventListener('blur', () => validateField(field));
  });

  contactForm?.addEventListener('submit', (event) => {
    const results = fields.map(validateField);
    const firstInvalid = fields.find((field, index) => !results[index]);
    if (firstInvalid) {
      event.preventDefault();
      formStatus.textContent = 'Please check the highlighted fields.';
      firstInvalid.input.focus();
      return;
    }
    formStatus.textContent = 'Your details look good. Your email app should open to send your message.';
  });
})();
