(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { header && header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var links = document.getElementById('site-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
    });
  }

  // Hero slideshow
  var slides = document.querySelectorAll('.hero-slides img');
  var dotsWrap = document.querySelector('.slide-dots');
  if (slides.length && dotsWrap) {
    var current = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show photo ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = dotsWrap.querySelectorAll('button');
    function go(i) {
      slides[current].classList.remove('active');
      dots[current].removeAttribute('aria-current');
      current = i;
      slides[current].classList.add('active');
      dots[current].setAttribute('aria-current', 'true');
    }
    function restart() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go((current + 1) % slides.length); }, 5000); }
    go(0); restart();
  }

  // Materials filter
  var filterBtns = document.querySelectorAll('.filters button');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      document.querySelectorAll('.labels li').forEach(function (li) {
        li.classList.toggle('hide', f !== 'all' && li.dataset.type !== f);
      });
      var count = document.querySelectorAll('.labels li:not(.hide)').length;
      var live = document.getElementById('filter-status');
      if (live) live.textContent = count + ' materials shown';
    });
  });

  // Clients marquee: duplicate list for a seamless loop
  var mq = document.querySelector('.marquee ul');
  if (mq) {
    Array.prototype.slice.call(mq.children).forEach(function (li) {
      var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c);
    });
  }

  // Services sub-navigation: highlight the section in view
  var subLinks = document.querySelectorAll('.subnav a');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // Reveal once on scroll
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  // Quote form: static demo (validates, shows a note, sends nothing)
  var form = document.getElementById('quote');
  if (form) {
    var name = form.querySelector('#name');
    name.addEventListener('input', function () { name.setCustomValidity(''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!name.value.trim()) {
        name.setCustomValidity('Enter your name so we know who to call back.');
        name.reportValidity(); return;
      }
      // Portfolio demo: nothing is sent.
      var note = form.querySelector('.form-status');
      if (!note) { note = document.createElement('p'); note.className = 'form-status'; note.setAttribute('role', 'status'); form.appendChild(note); }
      note.textContent = 'Thanks! This is a portfolio demo, so no message was sent.';
      form.reset();
    });
  }

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
