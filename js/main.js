'use strict';
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const closeMenu = () => { navigation?.classList.remove('open'); document.body.classList.remove('menu-open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Open menu'); };
  menuButton?.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; navigation.classList.toggle('open', open); document.body.classList.toggle('menu-open', open); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  const menuBreakpoint = window.matchMedia('(min-width: 851px)');
  menuBreakpoint.addEventListener('change', event => { if (event.matches) closeMenu(); });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });

  const hero = document.querySelector('.hero');
  if (hero) {
    const slides = [...hero.querySelectorAll('[data-slide]')];
    const dots = [...hero.querySelectorAll('[data-goto]')];
    const counter = hero.querySelector('.slide-count');
    const pauseButton = hero.querySelector('.slide-pause');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0, paused = reducedMotion, timer, hover = false, focus = false;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.classList.toggle('active', i === current); slide.setAttribute('aria-hidden', String(i !== current)); slide.inert = i !== current; });
      dots.forEach((dot, i) => { dot.classList.toggle('active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
      counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    function schedule() { clearInterval(timer); if (!paused && !hover && !focus && !document.hidden) timer = setInterval(() => showSlide(current + 1), 6500); }
    function pauseLabel() { pauseButton.textContent = paused ? '▶' : 'Ⅱ'; pauseButton.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); pauseButton.title = paused ? 'Play slideshow' : 'Pause slideshow'; }
    dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); schedule(); }));
    hero.querySelector('.slide-prev').addEventListener('click', () => { showSlide(current - 1); schedule(); });
    hero.querySelector('.slide-next').addEventListener('click', () => { showSlide(current + 1); schedule(); });
    pauseButton.addEventListener('click', () => { paused = !paused; pauseLabel(); schedule(); });
    hero.addEventListener('mouseenter', () => { hover = true; schedule(); }); hero.addEventListener('mouseleave', () => { hover = false; schedule(); });
    hero.addEventListener('focusin', () => { focus = true; schedule(); }); hero.addEventListener('focusout', () => { requestAnimationFrame(() => { focus = hero.contains(document.activeElement); schedule(); }); });
    document.addEventListener('visibilitychange', schedule);
    let touchX = null;
    hero.addEventListener('touchstart', event => { touchX = event.changedTouches[0].screenX; }, { passive: true });
    hero.addEventListener('touchend', event => { if (touchX !== null) { const delta = event.changedTouches[0].screenX - touchX; if (Math.abs(delta) > 65) { showSlide(current + (delta < 0 ? 1 : -1)); schedule(); } } touchX = null; }, { passive: true });
    showSlide(0); pauseLabel(); schedule();
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const products = [...document.querySelectorAll('.product-card')];
  if (filters.length) {
    function filterProducts(value, updateURL = true) {
      const allowed = ['all', 'nara', 'franck', 'alchimia', 'english', 'nitro'];
      const brand = allowed.includes(value) ? value : 'all';
      let count = 0;
      products.forEach(product => { const visible = brand === 'all' || product.dataset.brand === brand; product.hidden = !visible; if (visible) count++; });
      filters.forEach(button => { const active = button.dataset.filter === brand; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
      document.getElementById('product-count').textContent = `${count} products & collections`;
      if (updateURL && ['http:', 'https:'].includes(location.protocol)) { const url = new URL(location.href); if (brand === 'all') url.searchParams.delete('brand'); else url.searchParams.set('brand', brand); history.replaceState(null, '', url); }
    }
    filters.forEach(button => button.addEventListener('click', () => filterProducts(button.dataset.filter)));
    filterProducts(new URLSearchParams(location.search).get('brand') || 'all', false);
  }

  const dialog = document.querySelector('.lightbox');
  if (dialog) {
    let lastTrigger;
    document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => { lastTrigger = button; dialog.querySelector('img').src = button.dataset.lightbox; dialog.querySelector('img').alt = button.dataset.name; dialog.querySelector('p').textContent = button.dataset.name; dialog.showModal(); document.body.classList.add('modal-open'); }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastTrigger?.focus(); });
  }

  const form = document.getElementById('enquiry-form');
  if (form) {
    const interest = new URLSearchParams(location.search).get('interest');
    if (interest) { const select = form.elements.interest; if ([...select.options].some(option => option.value === interest)) select.value = interest; else { const option = new Option(interest, interest, true, true); select.add(option); } form.elements.message.value = `I would like more information about ${interest}.`; }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const text = `Hello Vantage Global Travel Retail,\n\nName: ${data.get('name').trim()}\nCompany: ${data.get('company').trim() || 'Not specified'}\nContact: ${data.get('contact').trim()}\nInterest: ${data.get('interest')}\n\n${data.get('message').trim()}`;
      const subject = encodeURIComponent('Vantage GTR website enquiry');
      const url = `mailto:support@vantagegtr.com?subject=${subject}&body=${encodeURIComponent(text)}`;
      const status = document.getElementById('form-status');
      status.replaceChildren(document.createTextNode('Review and send your enquiry in your email app. '));
      const link = document.createElement('a');
      link.href = url;
      link.textContent = 'Open email draft';
      link.style.textDecoration = 'underline';
      status.append(link);
      window.location.href = url;
    });
  }
})();
