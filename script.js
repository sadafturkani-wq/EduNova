/* ==========================================================================
   EduNova — script.js
   All interactivity is vanilla JavaScript (no frameworks, no jQuery).

   Sections:
     1. Helpers & shared state
     2. Toast notifications
     3. Header: scroll state, progress bar, mobile menu, search panel
     4. Scrollspy (active nav link)
     5. Course filtering + search
     6. Course detail modal
     7. Sign-up modal (demo account creation)
     8. Newsletter validation
     9. Scroll-reveal animations
    10. Animated statistics counters
    11. Back-to-top button
    12. Misc demo feedback + footer year
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Helpers & shared state
     ------------------------------------------------------------------------ */
  const $  = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* Course catalogue used to fill the detail modal */
  const COURSES = {
    'web-development': {
      title: 'Web Development',
      category: 'Development',
      level: 'Beginner',
      levelClass: 'level-beginner',
      img: 'assets/img/course-web-development.webp',
      alt: 'Abstract 3D browser window with layout blocks representing web development',
      duration: '12 weeks',
      lessons: '48 lessons',
      rating: '4.8 / 5 (2,340 ratings)',
      desc: 'Start from a blank file and finish with a published, responsive website. You will learn how the web actually works while building pages you are proud to share.',
      outcomes: [
        'Structure semantic, accessible pages with HTML5',
        'Style responsive layouts with modern CSS, Flexbox and Grid',
        'Adapt any design to phones, tablets and desktops',
        'Publish a personal portfolio site with Git and GitHub Pages'
      ]
    },
    javascript: {
      title: 'JavaScript Programming',
      category: 'Development',
      level: 'Intermediate',
      levelClass: 'level-intermediate',
      img: 'assets/img/course-javascript.webp',
      alt: 'Glowing curly braces and light ribbons representing JavaScript programming',
      duration: '10 weeks',
      lessons: '42 lessons',
      rating: '4.9 / 5 (1,875 ratings)',
      desc: 'Go beyond syntax: understand the language deeply enough to debug anything. Build interactive interfaces, work with APIs and write code other people enjoy reading.',
      outcomes: [
        'Master functions, scope, closures and the event loop',
        'Manipulate the DOM and handle user events confidently',
        'Fetch and display data from real public APIs',
        'Structure a multi-file project with modern ES modules'
      ]
    },
    python: {
      title: 'Python for Beginners',
      category: 'Development',
      level: 'Beginner',
      levelClass: 'level-beginner',
      img: 'assets/img/course-python.webp',
      alt: 'Two intertwined glossy ribbons forming an abstract spiral representing Python',
      duration: '8 weeks',
      lessons: '36 lessons',
      rating: '4.8 / 5 (3,120 ratings)',
      desc: 'A gentle, friendly on-ramp to programming. Python reads like plain English, which lets you focus on thinking like a programmer instead of fighting syntax.',
      outcomes: [
        'Write clean programs with variables, loops and functions',
        'Model real problems with lists, dictionaries and classes',
        'Automate boring tasks like renaming files or scraping tables',
        'Finish a capstone automation project of your own design'
      ]
    },
    ai: {
      title: 'Artificial Intelligence',
      category: 'Data Science',
      level: 'Intermediate',
      levelClass: 'level-intermediate',
      img: 'assets/img/course-artificial-intelligence.webp',
      alt: 'Glowing neural network sphere representing artificial intelligence',
      duration: '14 weeks',
      lessons: '52 lessons',
      rating: '4.7 / 5 (980 ratings)',
      desc: 'Demystify the technology behind the headlines. You will build intuition for how modern AI systems learn, then train, evaluate and improve models yourself.',
      outcomes: [
        'Explain how neural networks learn from examples',
        'Prepare and split datasets for honest evaluation',
        'Train and tune classification models with scikit-learn',
        'Ship a small end-to-end ML project with a written report'
      ]
    },
    uiux: {
      title: 'UI/UX Design',
      category: 'Design',
      level: 'Beginner',
      levelClass: 'level-beginner',
      img: 'assets/img/course-uiux-design.webp',
      alt: 'Floating design tool panels, colour swatches and a bezier curve representing UI and UX design',
      duration: '9 weeks',
      lessons: '30 lessons',
      rating: '4.9 / 5 (1,410 ratings)',
      desc: 'Learn to design products people understand on first use. From research to polished prototype, you will build a case study that belongs in a professional portfolio.',
      outcomes: [
        'Run lightweight user research and define real problems',
        'Wireframe and prototype flows quickly in Figma',
        'Apply typography, colour and spacing with intention',
        'Test with users and present a complete case study'
      ]
    },
    'data-science': {
      title: 'Data Science',
      category: 'Data Science',
      level: 'Intermediate',
      levelClass: 'level-intermediate',
      img: 'assets/img/course-data-science.webp',
      alt: 'Holographic 3D bar chart with a rising trend line representing data science',
      duration: '12 weeks',
      lessons: '46 lessons',
      rating: '4.8 / 5 (1,265 ratings)',
      desc: 'Turn messy spreadsheets into decisions. Work with real datasets end to end: cleaning, analysing, visualising and telling a story stakeholders can act on.',
      outcomes: [
        'Clean and reshape messy real-world datasets with pandas',
        'Choose the right chart for the question you are asking',
        'Summarise findings with clear, honest visualisations',
        'Present an analysis notebook as a decision-ready report'
      ]
    }
  };

  /* ------------------------------------------------------------------------
     2. Toast notifications (honest demo feedback for backend-less actions)
     ------------------------------------------------------------------------ */
  const toastRegion = $('#toastRegion');

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast-item toast-' + (type || 'info');

    const icon = document.createElement('i');
    icon.className = 'bi ' + (type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill');
    icon.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(icon, text);
    toastRegion.appendChild(toast);

    window.setTimeout(function () {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', function () { toast.remove(); }, { once: true });
    }, 4200);
  }

  /* ------------------------------------------------------------------------
     3. Header: scroll state, progress bar, mobile menu, search panel
     ------------------------------------------------------------------------ */
  const header = $('#siteHeader');
  const scrollProgress = $('#scrollProgress');
  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  const menuBackdrop = $('#menuBackdrop');
  const searchToggle = $('#searchToggle');
  const searchPanel = $('#searchPanel');
  const navSearchForm = $('#navSearchForm');
  const navSearchInput = $('#navSearchInput');

  let scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(function () {
      // Solid header after leaving the very top of the page
      header.classList.toggle('is-scrolled', window.scrollY > 24);

      // Thin reading-progress bar along the top edge
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      scrollProgress.style.transform = 'scaleX(' + ratio + ')';

      // Back-to-top visibility (see section 11)
      backToTop.classList.toggle('is-visible', window.scrollY > 600);

      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  function setMobileMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu.classList.toggle('is-open', open);
    menuBackdrop.classList.toggle('is-open', open);
    menuBackdrop.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', function () {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    if (open) closeSearchPanel();
    setMobileMenu(open);
  });

  menuBackdrop.addEventListener('click', function () { setMobileMenu(false); });

  $$('.mobile-link').forEach(function (link) {
    link.addEventListener('click', function () { setMobileMenu(false); });
  });

  /* Expandable search panel */
  function setSearchPanel(open) {
    searchToggle.setAttribute('aria-expanded', String(open));
    searchPanel.classList.toggle('is-open', open);
    if (open) {
      window.setTimeout(function () { navSearchInput.focus(); }, 120);
    }
  }
  function closeSearchPanel() { setSearchPanel(false); }

  searchToggle.addEventListener('click', function () {
    const open = searchToggle.getAttribute('aria-expanded') !== 'true';
    if (open) setMobileMenu(false);
    setSearchPanel(open);
  });

  /* Header search feeds the course search, then jumps to the results */
  navSearchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    courseSearchInput.value = navSearchInput.value;
    applyCourseFilters();
    closeSearchPanel();
    goToSection('#courses');
    window.setTimeout(function () {
      courseSearchInput.focus({ preventScroll: true });
    }, 600);
    if (navSearchInput.value.trim()) {
      showToast('Showing course results for “' + navSearchInput.value.trim() + '”.', 'info');
    }
  });

  /* Smooth-scroll helper that also respects reduced-motion preferences */
  function goToSection(hash) {
    const target = $(hash);
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  /* Close menus with Escape */
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if ($('.modal-overlay.is-open')) return; // modals handle their own Escape
    if (mobileMenu.classList.contains('is-open')) setMobileMenu(false);
    if (searchPanel.classList.contains('is-open')) closeSearchPanel();
  });

  /* Reset transient UI when resizing up to desktop */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 991 && mobileMenu.classList.contains('is-open')) setMobileMenu(false);
  });

  /* ------------------------------------------------------------------------
     4. Scrollspy — highlight the nav link for the section in view
     ------------------------------------------------------------------------ */
  const spySections = ['home', 'courses', 'about', 'learning-paths', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink(id) {
    $$('.nav-item, .mobile-link').forEach(function (link) {
      const match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', match);
      if (match && link.classList.contains('nav-item')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  const spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  spySections.forEach(function (section) { spyObserver.observe(section); });

  /* ------------------------------------------------------------------------
     5. Course filtering + search
     ------------------------------------------------------------------------ */
  const courseCols = $$('.course-col');
  const filterButtons = $$('.filter-btn');
  const courseSearchInput = $('#courseSearch');
  const courseSearchClear = $('#courseSearchClear');
  const coursesCount = $('#coursesCount');
  const coursesEmpty = $('#coursesEmpty');
  let activeFilter = 'all';

  function applyCourseFilters() {
    const query = courseSearchInput.value.trim().toLowerCase();
    let visible = 0;

    courseCols.forEach(function (col) {
      const inCategory = activeFilter === 'all' || col.dataset.category === activeFilter;
      const haystack = col.textContent.toLowerCase();
      const matchesQuery = query === '' || haystack.indexOf(query) !== -1;
      const show = inCategory && matchesQuery;
      col.classList.toggle('is-hidden', !show);
      if (show) visible += 1;
    });

    coursesCount.textContent = 'Showing ' + visible + ' of ' + courseCols.length + ' courses';
    coursesEmpty.hidden = visible !== 0;
    courseSearchClear.hidden = query === '';
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach(function (btn) {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    applyCourseFilters();
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setFilter(btn.dataset.filter); });
  });

  courseSearchInput.addEventListener('input', applyCourseFilters);

  courseSearchClear.addEventListener('click', function () {
    courseSearchInput.value = '';
    applyCourseFilters();
    courseSearchInput.focus();
  });

  $('#resetFilters').addEventListener('click', function () {
    courseSearchInput.value = '';
    setFilter('all');
  });

  /* Footer category links act as pre-set filters */
  $$('[data-footer-filter]').forEach(function (link) {
    link.addEventListener('click', function () {
      setFilter(link.dataset.footerFilter);
    });
  });

  /* Learning-path buttons jump to the matching course category */
  $$('.path-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.pathFilter;
      const name = btn.dataset.pathName;
      setFilter(filter);
      goToSection('#courses');
      showToast('Showing ' + filterLabel(filter) + ' courses for the ' + name + ' path.', 'info');
    });
  });

  function filterLabel(filter) {
    const btn = filterButtons.find(function (b) { return b.dataset.filter === filter; });
    return btn ? btn.textContent.trim() : 'matching';
  }

  /* ------------------------------------------------------------------------
     6. Course detail modal (with focus trap)
     ------------------------------------------------------------------------ */
  const courseModal = $('#courseModal');
  const signupModal = $('#signupModal');
  let lastFocused = null;

  function focusables(container) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }

  function openModal(overlay) {
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(function () {
      const first = focusables(overlay)[0];
      if (first) first.focus();
    }, 60);
  }

  function closeModal(overlay) {
    overlay.classList.remove('is-open');
    if (!$('.modal-overlay.is-open')) document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  /* Keep Tab focus inside the open dialog */
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    const overlay = $('.modal-overlay.is-open');
    if (!overlay) return;

    const items = focusables(overlay);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      const overlay = $('.modal-overlay.is-open');
      if (overlay) closeModal(overlay);
    }
  });

  /* Click on the dark backdrop closes the dialog */
  [courseModal, signupModal].forEach(function (overlay) {
    overlay.addEventListener('mousedown', function (event) {
      if (event.target === overlay) closeModal(overlay);
    });
  });

  function openCourseModal(courseId) {
    const course = COURSES[courseId];
    if (!course) return;

    $('#modalImg').src = course.img;
    $('#modalImg').alt = course.alt;
    $('#modalTag').textContent = course.category;

    const level = $('#modalLevel');
    level.textContent = course.level;
    level.className = 'course-level ' + course.levelClass;

    $('#modalTitle').textContent = course.title;
    $('#modalDesc').textContent = course.desc;

    $('#modalMeta').innerHTML = '';
    [
      ['bi-clock-history', course.duration],
      ['bi-collection-play', course.lessons],
      ['bi-star-fill', course.rating]
    ].forEach(function (item) {
      const li = document.createElement('li');
      const icon = document.createElement('i');
      icon.className = 'bi ' + item[0];
      icon.setAttribute('aria-hidden', 'true');
      li.append(icon, document.createTextNode(' ' + item[1]));
      $('#modalMeta').appendChild(li);
    });

    $('#modalList').innerHTML = '';
    course.outcomes.forEach(function (outcome) {
      const li = document.createElement('li');
      li.textContent = outcome;
      $('#modalList').appendChild(li);
    });

    openModal(courseModal);
  }

  $$('.btn-view').forEach(function (btn) {
    btn.addEventListener('click', function () { openCourseModal(btn.dataset.course); });
  });

  $('#modalClose').addEventListener('click', function () { closeModal(courseModal); });

  $('#modalEnroll').addEventListener('click', function () {
    showToast('Demo build: enrollment is not connected to a backend yet.', 'info');
  });

  $('#modalSyllabus').addEventListener('click', function () {
    showToast('Demo build: syllabus downloads need a backend integration.', 'info');
  });

  /* ------------------------------------------------------------------------
     7. Sign-up modal (demo account creation with validation)
     ------------------------------------------------------------------------ */
  const signupForm = $('#signupForm');
  const signupFeedback = $('#signupFeedback');
  const signupSuccess = $('#signupSuccess');

  function openSignup() {
    setMobileMenu(false);
    openModal(signupModal);
  }

  ['#getStartedBtn', '#getStartedBtnMobile'].forEach(function (id) {
    const btn = $(id);
    if (btn) btn.addEventListener('click', openSignup);
  });

  ['#signInBtn', '#signInBtnMobile'].forEach(function (id) {
    const btn = $(id);
    if (btn) {
      btn.addEventListener('click', function () {
        setMobileMenu(false);
        showToast('Sign-in is a placeholder in this frontend demo — no accounts exist yet.', 'info');
      });
    }
  });

  $('#signupClose').addEventListener('click', function () { closeModal(signupModal); });
  $('#signupSuccessClose').addEventListener('click', function () {
    closeModal(signupModal);
    goToSection('#courses');
  });

  signupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = $('#signupName');
    const email = $('#signupEmail');
    const problems = [];

    name.classList.remove('is-invalid');
    email.classList.remove('is-invalid');

    if (name.value.trim().length < 2) {
      problems.push('please enter your name');
      name.classList.add('is-invalid');
    }
    if (!EMAIL_PATTERN.test(email.value.trim())) {
      problems.push('please enter a valid email address');
      email.classList.add('is-invalid');
    }

    if (problems.length) {
      signupFeedback.textContent = 'Almost there — ' + problems.join(' and ') + '.';
      signupFeedback.className = 'form-feedback is-error';
      return;
    }

    signupFeedback.textContent = '';
    signupForm.hidden = true;
    signupSuccess.hidden = false;
    showToast('Welcome aboard, ' + name.value.trim().split(' ')[0] + '! (demo only)', 'success');
    $('#signupSuccessClose').focus();
  });

  /* ------------------------------------------------------------------------
     8. Newsletter validation + success feedback
     ------------------------------------------------------------------------ */
  const newsletterForm = $('#newsletterForm');
  const newsletterEmail = $('#newsletterEmail');
  const newsletterFeedback = $('#newsletterFeedback');

  newsletterForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = newsletterEmail.value.trim();

    if (!EMAIL_PATTERN.test(value)) {
      newsletterEmail.classList.add('is-invalid');
      newsletterEmail.classList.remove('is-valid');
      newsletterFeedback.textContent = value === ''
        ? 'Please enter your email address.'
        : 'That doesn’t look like a valid email — try name@example.com.';
      newsletterFeedback.className = 'form-feedback is-error';
      newsletterEmail.focus();
      return;
    }

    newsletterEmail.classList.remove('is-invalid');
    newsletterEmail.classList.add('is-valid');
    newsletterFeedback.textContent = 'Thanks! You’re on the list — in a real deployment this is where the backend would confirm your subscription.';
    newsletterFeedback.className = 'form-feedback is-success';
    showToast('Subscribed (demo only): ' + value, 'success');
    newsletterForm.reset();
    newsletterEmail.classList.remove('is-valid');
  });

  newsletterEmail.addEventListener('input', function () {
    newsletterEmail.classList.remove('is-invalid');
    if (newsletterFeedback.classList.contains('is-error')) {
      newsletterFeedback.textContent = '';
      newsletterFeedback.className = 'form-feedback';
    }
  });

  /* ------------------------------------------------------------------------
     9. Scroll-reveal animations
     ------------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ------------------------------------------------------------------------
     10. Animated statistics counters
     ------------------------------------------------------------------------ */
  function animateCounter(element) {
    const target = parseInt(element.dataset.count, 10) || 0;
    const suffix = element.dataset.suffix || '';

    if (prefersReducedMotion) {
      element.textContent = target.toLocaleString('en-US') + suffix;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      element.textContent = value.toLocaleString('en-US') + suffix;
      if (progress < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  $$('.stat-value').forEach(function (el) { counterObserver.observe(el); });

  /* ------------------------------------------------------------------------
     11. Back-to-top button
     ------------------------------------------------------------------------ */
  const backToTop = $('#backToTop');
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------------------
     12. Misc demo feedback + footer year
     ------------------------------------------------------------------------ */
  $$('.social-link').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      showToast(link.dataset.social + ' profile is a placeholder in this demo.', 'info');
    });
  });

  const footerDemoBtn = $('#footerDemoBtn');
  if (footerDemoBtn) {
    footerDemoBtn.addEventListener('click', function () {
      showToast('EduNova is a frontend-only portfolio demo: HTML, CSS, Bootstrap 5 and vanilla JS — no backend.', 'info');
    });
  }

  $('#currentYear').textContent = String(new Date().getFullYear());

  /* Initial paint of scroll-dependent UI */
  onScroll();
  applyCourseFilters();
}());
