/* ============================================================
   AXIOM — animations.js
   Scroll-reveal, canvas grid visuals, hover effects,
   and subtle page animations
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. SCROLL REVEAL (Intersection Observer)
  ---------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: reveal all immediately
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ----------------------------------------------------------
     2. TECH GRID CANVAS (index.html — homepage)
     Renders an animated modular square grid inspired
     by the reference screenshot
  ---------------------------------------------------------- */
  var techCanvas = document.getElementById('techCanvas');
  if (techCanvas) {
    drawModularGrid(techCanvas, {
      dark: true,
      animate: true,
      baseSize: 24,
      gap: 6,
      cols: 9,
      rows: 9
    });
  }

  /* ----------------------------------------------------------
     3. TECH HERO CANVAS (technology.html)
  ---------------------------------------------------------- */
  var techHeroCanvas = document.getElementById('techHeroCanvas');
  if (techHeroCanvas) {
    drawModularGrid(techHeroCanvas, {
      dark: true,
      animate: true,
      baseSize: 32,
      gap: 8,
      cols: 9,
      rows: 7
    });
  }

  /* ----------------------------------------------------------
     DRAW MODULAR GRID FUNCTION
     Draws concentric-strength squares that pulse like data
     expanding into the encrypted domain
  ---------------------------------------------------------- */
  function drawModularGrid(canvas, opts) {
    var ctx  = canvas.getContext('2d');
    var W    = canvas.width;
    var H    = canvas.height;
    var dark = opts.dark;
    var cols = opts.cols || 9;
    var rows = opts.rows || 9;
    var gap  = opts.gap  || 6;
    var base = opts.baseSize || 24;

    // Pixel density
    var dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    // Center of grid
    var cx = W / 2;
    var cy = H / 2;

    // Precompute cell sizes based on distance from center
    // Cells closer to center are larger
    var cells = [];
    var midCol = Math.floor(cols / 2);
    var midRow = Math.floor(rows / 2);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var distCol = Math.abs(c - midCol);
        var distRow = Math.abs(r - midRow);
        var dist = Math.max(distCol, distRow);
        var maxDist = Math.max(midCol, midRow);

        // Normalized distance [0..1], 0 = center, 1 = edge
        var t = dist / maxDist;

        // Size: center cells are largest
        var size = base * (1 - t * 0.72);
        size = Math.max(size, 3);

        cells.push({
          col: c, row: r,
          dist: dist,
          size: size,
          baseSize: size,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // Total grid dimensions
    var totalW = cols * (base + gap) - gap;
    var totalH = rows * (base + gap) - gap;
    var startX = cx - totalW / 2;
    var startY = cy - totalH / 2;

    var t0 = performance.now();

    function draw(now) {
      var elapsed = (now - t0) / 1000; // seconds

      ctx.clearRect(0, 0, W, H);

      cells.forEach(function (cell) {
        // Pulse: each cell oscillates in opacity/size based on distance + phase
        var pulse = Math.sin(elapsed * 0.8 - cell.dist * 0.9 + cell.phase) * 0.5 + 0.5;

        var x = startX + cell.col * (base + gap);
        var y = startY + cell.row * (base + gap);

        // Animated size variation
        var s = cell.size * (0.9 + pulse * 0.18);
        var offset = (base - s) / 2;

        // Opacity: brighter at center, dimmer at edges, pulsing
        var baseOpacity = 1 - (cell.dist / Math.max(midCol, midRow)) * 0.5;
        var opacity = baseOpacity * (0.55 + pulse * 0.45);

        if (dark) {
          ctx.fillStyle = 'rgba(255,255,255,' + opacity + ')';
        } else {
          ctx.fillStyle = 'rgba(17,17,17,' + opacity + ')';
        }

        ctx.fillRect(x + offset, y + offset, s, s);
      });

      if (opts.animate) {
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(draw);
  }

  /* ----------------------------------------------------------
     4. MODULE GRID (technology.html pillars)
     Renders small static/pulsing dot grids in section visuals
  ---------------------------------------------------------- */
  function buildModuleGrid(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var canvas = document.createElement('canvas');
    canvas.width  = container.offsetWidth  || 400;
    canvas.height = container.offsetHeight || 320;
    canvas.style.width  = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    var dpr = window.devicePixelRatio || 1;
    var W = canvas.width;
    var H = canvas.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var cols = 12;
    var rows = 8;
    var gx = W / cols;
    var gy = H / rows;
    var dots = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        dots.push({
          x: c * gx + gx / 2,
          y: r * gy + gy / 2,
          size: Math.random() < 0.15 ? 5 : 2,
          phase: Math.random() * Math.PI * 2,
          bright: Math.random()
        });
      }
    }

    var t0 = performance.now();

    function draw(now) {
      var elapsed = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      dots.forEach(function (d) {
        var pulse = Math.sin(elapsed * 0.6 + d.phase) * 0.5 + 0.5;
        var alpha = d.size > 3
          ? (0.4 + pulse * 0.5)
          : (0.15 + pulse * 0.2);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
        ctx.fillRect(d.x - d.size / 2, d.y - d.size / 2, d.size, d.size);
      });
      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  buildModuleGrid('moduleGrid1');
  buildModuleGrid('moduleGrid2');

  /* ----------------------------------------------------------
     5. PERFORMANCE BARS (technology.html)
     Renders an animated horizontal bar chart
  ---------------------------------------------------------- */
  var perfBarsContainer = document.getElementById('perfBars');
  if (perfBarsContainer) {
    var perfCanvas = document.createElement('canvas');
    perfCanvas.style.width  = '100%';
    perfCanvas.style.height = '100%';
    perfCanvas.style.display = 'block';
    perfBarsContainer.appendChild(perfCanvas);

    // Wait for layout
    setTimeout(function () {
      var W = perfBarsContainer.offsetWidth  || 400;
      var H = perfBarsContainer.offsetHeight || 320;
      var dpr = window.devicePixelRatio || 1;
      perfCanvas.width  = W * dpr;
      perfCanvas.height = H * dpr;
      perfCanvas.style.width  = W + 'px';
      perfCanvas.style.height = H + 'px';
      var ctx = perfCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var bars = [
        { label: 'Software FHE',    value: 0.012, color: 'rgba(255,255,255,0.25)' },
        { label: 'GPU Accelerated', value: 0.18,  color: 'rgba(255,255,255,0.45)' },
        { label: 'Axiom FHE ASIC',  value: 1.0,   color: 'rgba(255,255,255,0.95)' }
      ];

      var pad = { top: 40, right: 40, bottom: 60, left: 16 };
      var chartW = W - pad.left - pad.right;
      var chartH = H - pad.top - pad.bottom;
      var barH = Math.min(40, chartH / bars.length - 20);
      var gap = (chartH - bars.length * barH) / (bars.length + 1);

      var t0 = performance.now();
      var animDone = false;

      function draw(now) {
        var elapsed = Math.min((now - t0) / 1200, 1);
        var eased   = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic

        ctx.clearRect(0, 0, W, H);

        bars.forEach(function (bar, i) {
          var y = pad.top + gap * (i + 1) + barH * i;
          var maxW = chartW;
          var bw = maxW * bar.value * eased;

          // Background track
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.fillRect(pad.left, y, maxW, barH);

          // Bar
          ctx.fillStyle = bar.color;
          ctx.fillRect(pad.left, y, bw, barH);

          // Label
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.font = '11px "DM Mono", monospace';
          ctx.letterSpacing = '0.08em';
          ctx.fillText(bar.label.toUpperCase(), pad.left, y - 10);

          // Value label (%)
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.textAlign = 'right';
          var pct = Math.round(bar.value * 100 * eased) + '%';
          ctx.fillText(pct, pad.left + maxW, y + barH - 10);
          ctx.textAlign = 'left';
        });

        // X axis line
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top + chartH + 8);
        ctx.lineTo(pad.left + chartW, pad.top + chartH + 8);
        ctx.stroke();

        // Note
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px "DM Mono", monospace';
        ctx.fillText('RELATIVE THROUGHPUT', pad.left, H - 16);

        if (elapsed < 1) requestAnimationFrame(draw);
      }

      // Trigger once visible
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting && !animDone) {
            animDone = true;
            t0 = performance.now();
            requestAnimationFrame(draw);
            obs.disconnect();
          }
        }, { threshold: 0.3 });
        obs.observe(perfBarsContainer);
      } else {
        requestAnimationFrame(draw);
      }
    }, 100);
  }

  /* ----------------------------------------------------------
     6. TRUST VISUAL (technology.html)
     Renders concentric rings / lock motif
  ---------------------------------------------------------- */
  var trustContainer = document.getElementById('trustVisual');
  if (trustContainer) {
    var trustCanvas = document.createElement('canvas');
    trustCanvas.style.display = 'block';
    trustContainer.appendChild(trustCanvas);

    setTimeout(function () {
      var W = trustContainer.offsetWidth  || 400;
      var H = trustContainer.offsetHeight || 320;
      var dpr = window.devicePixelRatio || 1;
      trustCanvas.width  = W * dpr;
      trustCanvas.height = H * dpr;
      trustCanvas.style.width  = W + 'px';
      trustCanvas.style.height = H + 'px';
      var ctx = trustCanvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var cx = W / 2;
      var cy = H / 2;
      var rings = 6;
      var maxR = Math.min(W, H) * 0.42;
      var t0 = performance.now();

      function draw(now) {
        var elapsed = (now - t0) / 1000;
        ctx.clearRect(0, 0, W, H);

        for (var i = rings; i >= 1; i--) {
          var r = maxR * (i / rings);
          var pulse = Math.sin(elapsed * 0.4 + i * 0.5) * 0.5 + 0.5;
          var alpha = (0.04 + pulse * 0.06) * (i / rings);

          ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center square
        var sq = 18 + Math.sin(elapsed * 0.7) * 2;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(cx - sq / 2, cy - sq / 2, sq, sq);

        // Rotating crosshair
        var angle = elapsed * 0.3;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        for (var j = 0; j < 4; j++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(maxR * 0.9 * Math.cos(j * Math.PI / 2), maxR * 0.9 * Math.sin(j * Math.PI / 2));
          ctx.stroke();
        }
        ctx.restore();

        // Label
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '10px "DM Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CRYPTOGRAPHIC BOUNDARY', cx, H - 20);
        ctx.textAlign = 'left';

        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
    }, 100);
  }

  /* ----------------------------------------------------------
     7. BUTTON HOVER RIPPLE (subtle tactile feedback)
  ---------------------------------------------------------- */
  document.querySelectorAll('.btn--primary, .btn--white').forEach(function (btn) {
    btn.addEventListener('mouseenter', function (e) {
      this.style.transition = 'background 200ms cubic-bezier(0.16,1,0.3,1), color 200ms, border-color 200ms';
    });
  });

  /* ----------------------------------------------------------
     8. SUBTLE PARALLAX on hero grid dots
  ---------------------------------------------------------- */
  var heroDots = document.querySelector('.hero__grid-dots');
  if (heroDots) {
    window.addEventListener('scroll', function () {
      var s = window.scrollY;
      heroDots.style.transform = 'translateY(' + (s * 0.2) + 'px)';
    }, { passive: true });
  }

  var techBgDots = document.querySelector('.tech-dark__bg-dots');
  if (techBgDots) {
    window.addEventListener('scroll', function () {
      var s = window.scrollY;
      techBgDots.style.transform = 'translateY(' + (s * 0.1) + 'px)';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     9. QUANTUM FIBONACCI CANVAS (index.html — hero)
     Fibonacci spiral + quantum probability rings + crypto grid
  ---------------------------------------------------------- */
  var quantumCanvas = document.getElementById('quantumCanvas');
  if (quantumCanvas) {
    (function () {
      var canvas = quantumCanvas;
      var dpr = window.devicePixelRatio || 1;
      var SIZE = canvas.offsetWidth || 420;
      canvas.width  = SIZE * dpr;
      canvas.height = SIZE * dpr;
      canvas.style.width  = SIZE + 'px';
      canvas.style.height = SIZE + 'px';
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var W = SIZE, H = SIZE;
      var cx = W / 2, cy = H / 2;

      /* --- Golden angle phyllotaxis — matches NBQ logo spiral --- */
      var PHI = (1 + Math.sqrt(5)) / 2;
      var GA  = Math.PI * 2 * (2 - PHI); // ~137.508°

      var N     = 200;
      var MAX_R = Math.min(W, H) * 0.455;

      var seeds = [];
      for (var i = 0; i < N; i++) {
        var frac = i / N;
        seeds.push({
          r:      Math.sqrt(frac) * MAX_R,
          theta:  i * GA,
          sz:     1.2 + frac * 9.5,     // small centre → large edge
          baseOp: 0.18 + frac * 0.75    // faint centre → bold edge
        });
      }

      /* --- Faint Fibonacci guide rings --- */
      var fibSeq = [1,1,2,3,5,8,13,21,34,55,89,144,233];
      var fibRings = fibSeq.slice(5).map(function (v) {
        return (v / 233) * MAX_R * 0.97;
      });

      /* --- Crypto hex nodes orbiting outside the spiral --- */
      var HEX = '0123456789ABCDEF';
      function rh(l) {
        var s = '';
        for (var j = 0; j < l; j++) s += HEX[Math.floor(Math.random() * 16)];
        return s;
      }
      var hexRing = [];
      for (var h = 0; h < 10; h++) {
        hexRing.push({
          theta: (h / 10) * Math.PI * 2,
          r:     MAX_R * (0.72 + Math.random() * 0.22),
          str:   rh(6),
          speed: (Math.random() < 0.5 ? 1 : -1) * (0.0008 + Math.random() * 0.001),
          phase: Math.random() * Math.PI * 2,
          op:    0.12 + Math.random() * 0.1
        });
      }
      setInterval(function () {
        hexRing[Math.floor(Math.random() * hexRing.length)].str = rh(6);
      }, 320);

      /* --- Labels --- */
      var label1 = document.getElementById('qlabel1');
      var label2 = document.getElementById('qlabel2');
      if (label1) label1.textContent = '\u03c6 = 1.618\u2026';
      if (label2) label2.textContent = 'PQC / FHE';

      var WAVE_PERIOD = 4.0;
      var t0 = performance.now();

      function draw(now) {
        var t = (now - t0) / 1000;
        ctx.clearRect(0, 0, W, H);

        /* 1. Faint Fibonacci guide rings */
        fibRings.forEach(function (r, i) {
          var alpha = 0.025 + Math.sin(t * 0.35 + i * 0.5) * 0.012;
          ctx.strokeStyle = 'rgba(17,17,17,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        });

        /* 2. Phyllotaxis spiral — logo-matched rotating square dots */
        var globalRot  = t * 0.04;
        var wavePhase  = (t % WAVE_PERIOD) / WAVE_PERIOD;

        for (var i = 0; i < N; i++) {
          var s    = seeds[i];
          var frac = i / N;
          var angle = s.theta + globalRot;
          var x = cx + Math.cos(angle) * s.r;
          var y = cy + Math.sin(angle) * s.r;

          /* Outward brightness pulse */
          var dw = Math.abs(frac - wavePhase);
          if (dw > 0.5) dw = 1 - dw;
          var wave    = Math.max(0, 1 - dw * 12);
          var flicker = Math.sin(t * 1.8 + i * 0.15) * 0.5 + 0.5;

          var op = Math.min(s.baseOp * (0.7 + flicker * 0.3) + wave * 0.45, 1.0);
          var sz = s.sz * (0.92 + wave * 0.22 + flicker * 0.06);

          /* Each square tilted outward — logo character */
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillStyle = 'rgba(17,17,17,' + op + ')';
          ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }

        /* 3. Hex crypto nodes */
        ctx.font = '7.5px "DM Mono", monospace';
        hexRing.forEach(function (node) {
          var a = node.theta + t * node.speed;
          var x = cx + Math.cos(a) * node.r;
          var y = cy + Math.sin(a) * node.r;
          var pulse = Math.sin(t * 0.8 + node.phase) * 0.5 + 0.5;
          ctx.fillStyle = 'rgba(17,17,17,' + (node.op * (0.55 + pulse * 0.45)) + ')';
          ctx.fillText(node.str, x - 14, y + 3);
        });

        /* 4. Centre square — still point */
        var cPulse = Math.sin(t * 1.4) * 0.5 + 0.5;
        var cSz = 3.5 + cPulse * 1.5;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.3);
        ctx.fillStyle = 'rgba(17,17,17,0.9)';
        ctx.fillRect(-cSz / 2, -cSz / 2, cSz, cSz);
        ctx.restore();

        requestAnimationFrame(draw);
      }

      requestAnimationFrame(draw);
    })();
  }

  /* ----------------------------------------------------------
     SPIRAL CANVAS — nbq-identity section (index.html)
     Teal logarithmic spiral with orbiting particles
  ---------------------------------------------------------- */
  (function () {
    var canvas = document.getElementById('spiralCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var C = {
      electric : 'rgba(61,207,234,',
      spark    : 'rgba(144,229,242,',
      teal     : 'rgba(42,139,168,',
      glass    : 'rgba(122,184,204,',
      depth    : 'rgba(15,122,143,'
    };

    function spiralPoints(turns, step, growth) {
      var pts = [];
      for (var a = 0; a < Math.PI * 2 * turns; a += step) {
        pts.push({ a: a, r: growth * a });
      }
      return pts;
    }

    var armData = spiralPoints(5, 0.04, 18);

    var particles = [];
    for (var i = 0; i < 60; i++) {
      particles.push({
        progress  : Math.random(),
        speed     : 0.00010 + Math.random() * 0.00020,
        size      : 1 + Math.random() * 2.5,
        opacity   : 0.25 + Math.random() * 0.55,
        armOffset : Math.random() * 0.6 - 0.3,
        colorKey  : ['electric','spark','teal','glass'][Math.floor(Math.random() * 4)]
      });
    }

    var t = 0;

    function draw() {
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2;
      var scale = Math.min(W, H) / 680;
      var maxR = armData[armData.length - 1].r * scale;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.018);

      /* spiral path */
      ctx.beginPath();
      for (var i = 0; i < armData.length; i++) {
        var p  = armData[i];
        var px = Math.cos(p.a) * p.r * scale;
        var py = Math.sin(p.a) * p.r * scale;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = C.depth + '0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* subtle rings */
      for (var ring = 1; ring <= 4; ring++) {
        var rr = (ring / 4) * maxR * 0.72;
        var pulse = Math.sin(t * 0.9 + ring * 1.1) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.strokeStyle = C.teal + (0.05 + pulse * 0.07) + ')';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      /* particles */
      particles.forEach(function (par) {
        par.progress += par.speed;
        if (par.progress > 1) par.progress = 0;
        var apt = armData[Math.floor(par.progress * (armData.length - 1))];
        var pr  = (apt.r + par.armOffset * 12) * scale;
        var px  = Math.cos(apt.a) * pr;
        var py  = Math.sin(apt.a) * pr;
        var glow = ctx.createRadialGradient(px, py, 0, px, py, par.size * 3);
        glow.addColorStop(0, C[par.colorKey] + par.opacity + ')');
        glow.addColorStop(1, C[par.colorKey] + '0)');
        ctx.beginPath();
        ctx.arc(px, py, par.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, par.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = C[par.colorKey] + (par.opacity * 0.9) + ')';
        ctx.fill();
      });

      /* central node */
      var cPulse = Math.sin(t * 1.6) * 0.5 + 0.5;
      var cR = (3 + cPulse * 2) * scale;
      var cGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, cR * 5);
      cGlow.addColorStop(0, C.electric + '0.85)');
      cGlow.addColorStop(1, C.electric + '0)');
      ctx.beginPath();
      ctx.arc(0, 0, cR * 5, 0, Math.PI * 2);
      ctx.fillStyle = cGlow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, cR, 0, Math.PI * 2);
      ctx.fillStyle = C.spark + '1)';
      ctx.fill();

      ctx.restore();
      t++;
      requestAnimationFrame(draw);
    }

    draw();
  })();

})();
