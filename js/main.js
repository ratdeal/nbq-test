/* ============================================================
   AXIOM — main.js
   Navigation, mobile menu, shared page behavior
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     NAV: scroll state
  ---------------------------------------------------------- */
  const nav = document.getElementById('nav');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init

  /* ----------------------------------------------------------
     NAV: mobile toggle
  ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      // Animate hamburger bars
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });
  }

  /* ----------------------------------------------------------
     TEAM CARDS: expand / collapse bio
  ---------------------------------------------------------- */
  const teamCards = document.querySelectorAll('.team-card');

  teamCards.forEach(function (card) {
    const expandBtn = card.querySelector('.team-card__expand');
    if (!expandBtn) return;

    expandBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.setAttribute('aria-pressed', isExpanded);
    });

    // Also allow clicking the card itself (except the button)
    card.addEventListener('click', function (e) {
      if (e.target === expandBtn || expandBtn.contains(e.target)) return;
      const isExpanded = card.classList.toggle('expanded');
      expandBtn.setAttribute('aria-pressed', isExpanded);
    });
  });

  /* ----------------------------------------------------------
     CONTACT FORM: submission handler
  ---------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      let valid = true;
      const required = contactForm.querySelectorAll('[required]');
      required.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#c0392b';
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission — replace with real endpoint
      contactForm.style.opacity = '0.5';
      contactForm.style.pointerEvents = 'none';

      setTimeout(function () {
        contactForm.setAttribute('hidden', '');
        formSuccess.removeAttribute('hidden');
      }, 800);
    });
  }

  /* ----------------------------------------------------------
     SMOOTH ANCHOR SCROLLING (within same page)
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h'), 10) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });



  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const button = item.querySelector('.faq-item__question');
    if (!button) return;

    button.addEventListener('click', function () {
      const isOpen = item.classList.contains('active');

      faqItems.forEach(function (otherItem) {
        const otherButton = otherItem.querySelector('.faq-item__question');
        otherItem.classList.remove('active');
        if (otherButton) {
          otherButton.setAttribute('aria-expanded', 'false');
        }
      });

      if (!isOpen) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
  


    /* ----------------------------------------------------------
     CORE SERVICES TERMINAL SHOWCASE
  ---------------------------------------------------------- */
  const terminalViewport = document.getElementById('servicesTerminalViewport');
  const terminalTyping = document.getElementById('servicesTerminalTyping');

  if (terminalViewport && terminalTyping) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showcases = [
      {
        command: './launch vpn --hybrid-pqc',
        lines: [
          { type: 'output', text: 'Loading secure tunnel profile...' },
          {
            type: 'service',
            title: 'Post-Quantum Secure VPN Solutions',
            pills: ['Hybrid VPN', 'PQC-ready', 'Private Access'],
            progress: '84%'
          },
          { type: 'status', text: '[ok] encrypted communication stack initialized' }
        ]
      },
      {
        command: './launch migration --scan-assets',
        lines: [
          { type: 'output', text: 'Discovering cryptographic dependencies...' },
          {
            type: 'service',
            title: 'PQC Migration Solutions',
            pills: ['Discovery', 'Agility', 'Transition Planning'],
            progress: '91%'
          },
          { type: 'status', text: '[ok] migration readiness map compiled' }
        ]
      },
      {
        command: './launch hardening --infra-profile',
        lines: [
          { type: 'output', text: 'Applying resilient infrastructure baseline...' },
          {
            type: 'service',
            title: 'PQC Infrastructure Hardening',
            pills: ['Hardening', 'Resilience', 'Future-ready'],
            progress: '88%'
          },
          { type: 'status', text: '[ok] post-quantum hardening profile enforced' }
        ]
      }
    ];

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function createLineHtml(line) {
      if (line.type === 'output') {
        return `
          <div class="services-terminal__line">
            <span class="services-terminal__output">${escapeHtml(line.text)}</span>
          </div>
        `;
      }

      if (line.type === 'service') {
        const pills = line.pills.map(function (pill) {
          return `<span class="services-terminal__pill">${escapeHtml(pill)}</span>`;
        }).join('');

        return `
          <div class="services-terminal__service-block">
            <div class="services-terminal__service-title">${escapeHtml(line.title)}</div>
            <div class="services-terminal__service-meta">${pills}</div>
            <div class="services-terminal__progress">
              <div class="services-terminal__progress-bar" style="--progress-width:${escapeHtml(line.progress)};"></div>
            </div>
          </div>
        `;
      }

      if (line.type === 'status') {
        return `
          <div class="services-terminal__line">
            <span class="services-terminal__success">${escapeHtml(line.text)}</span>
          </div>
        `;
      }

      return '';
    }

    function setTyping(text) {
      terminalTyping.textContent = text;
    }

    function typeCommand(text, done) {
      if (reduceMotion) {
        setTyping(text);
        done();
        return;
      }

      let i = 0;
      setTyping('');

      function step() {
        setTyping(text.slice(0, i));
        i += 1;

        if (i <= text.length) {
          setTimeout(step, 34);
        } else {
          setTimeout(done, 220);
        }
      }

      step();
    }

    function streamLines(lines, done) {
      if (reduceMotion) {
        terminalViewport.innerHTML = lines.map(createLineHtml).join('');
        done();
        return;
      }

      let i = 0;
      terminalViewport.innerHTML = '';

      function next() {
        if (i >= lines.length) {
          done();
          return;
        }

        terminalViewport.insertAdjacentHTML('beforeend', createLineHtml(lines[i]));
        const current = lines[i];
        i += 1;

        const delay = current.type === 'service' ? 700 : 240;
        setTimeout(next, delay);
      }

      next();
    }

    function runShowcase(index) {
      const item = showcases[index];

      terminalViewport.innerHTML = '';
      setTyping('');

      typeCommand(item.command, function () {
        streamLines(item.lines, function () {
          setTimeout(function () {
            runShowcase((index + 1) % showcases.length);
          }, reduceMotion ? 1800 : 2200);
        });
      });
    }

    runShowcase(0);
  }


  document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinksContainer = document.getElementById("navLinks");
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const targetEl = document.querySelector(targetId);

      if (!targetEl) return;

      e.preventDefault();

      const navHeight = nav ? nav.offsetHeight : 0;
      const targetTop =
        targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });

      if (navLinksContainer) {
        navLinksContainer.classList.remove("open");
      }

      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
      }

      document
        .querySelectorAll(".nav__links a")
        .forEach((item) => item.classList.remove("active"));

      link.classList.add("active");
    });
  });
});
})();
