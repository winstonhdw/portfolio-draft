/**
 * Winston Hansel - Personal Portfolio
 * Scroll Animation Engine: Handwriting Mask, Layered Morph, and Depth Typography
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // TACTILE PAPER & RUBBER STAMP SOUND ENGINE (Web Audio API)
  // Synthesizes organic paper rustles, card flips, tactile taps, & stamp thuds
  // ---------------------------------------------------------------------------
  const SoundFX = (function () {
    let ctx = null;
    let pinkNoiseBuffer = null;
    let whiteNoiseBuffer = null;
    let muted = false;

    function getContext() {
      if (muted) return null;
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        ctx = new AudioCtx();
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function isMuted() {
      return muted;
    }

    function setMuted(val) {
      muted = Boolean(val);
      return muted;
    }

    function toggleMute() {
      muted = !muted;
      return muted;
    }

    // Unlock AudioContext as early as pointerdown/keydown so click sounds never get swallowed
    function unlockAudio() {
      const audioCtx = getContext();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    }
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    function getPinkNoise(audioCtx) {
      if (pinkNoiseBuffer) return pinkNoiseBuffer;
      const sampleRate = audioCtx.sampleRate;
      const length = sampleRate * 1.0;
      const buffer = audioCtx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const sample = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.22;
        data[i] = Math.max(-1, Math.min(1, sample));
        b6 = white * 0.115926;
      }
      pinkNoiseBuffer = buffer;
      return buffer;
    }

    function getWhiteNoise(audioCtx) {
      if (whiteNoiseBuffer) return whiteNoiseBuffer;
      const sampleRate = audioCtx.sampleRate;
      const length = sampleRate * 1.0;
      const buffer = audioCtx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      whiteNoiseBuffer = buffer;
      return buffer;
    }

    // 1. Rubber Stamp Impact ("THOCK + Crisp Paper Ink Press")
    function stamp() {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const playNow = () => {
        const now = audioCtx.currentTime;
        const pitchVar = 0.93 + Math.random() * 0.14;

        // Layer A: Heavy wooden stamp block / rubber thump on table
        const osc = audioCtx.createOscillator();
        const thumpGain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(165 * pitchVar, now);
        osc.frequency.exponentialRampToValueAtTime(42 * pitchVar, now + 0.095);

        thumpGain.gain.setValueAtTime(0.001, now);
        thumpGain.gain.linearRampToValueAtTime(0.85, now + 0.004);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(thumpGain);
        thumpGain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.115);

        // Layer B: Punchy mid-wood knock transient
        const knockOsc = audioCtx.createOscillator();
        const knockGain = audioCtx.createGain();
        knockOsc.type = 'sine';
        knockOsc.frequency.setValueAtTime(420 * pitchVar, now);
        knockOsc.frequency.exponentialRampToValueAtTime(95 * pitchVar, now + 0.035);

        knockGain.gain.setValueAtTime(0.001, now);
        knockGain.gain.linearRampToValueAtTime(0.55, now + 0.002);
        knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        knockOsc.connect(knockGain);
        knockGain.connect(audioCtx.destination);
        knockOsc.start(now);
        knockOsc.stop(now + 0.045);

        // Layer C: Crisp vellum paper crunch on stamp impact
        const noise = audioCtx.createBufferSource();
        noise.buffer = getWhiteNoise(audioCtx);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 * pitchVar, now);
        filter.Q.setValueAtTime(1.1, now);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.75, now + 0.004);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now, Math.random() * 0.4);
        noise.stop(now + 0.08);

        // Layer D: Sticky ink-pad release & paper peel 65ms later
        const liftNoise = audioCtx.createBufferSource();
        liftNoise.buffer = getPinkNoise(audioCtx);
        const liftFilter = audioCtx.createBiquadFilter();
        liftFilter.type = 'bandpass';
        liftFilter.frequency.setValueAtTime(2400 * pitchVar, now + 0.065);
        liftFilter.Q.setValueAtTime(1.2, now + 0.065);

        const liftGain = audioCtx.createGain();
        liftGain.gain.setValueAtTime(0.001, now + 0.065);
        liftGain.gain.linearRampToValueAtTime(0.38, now + 0.078);
        liftGain.gain.exponentialRampToValueAtTime(0.001, now + 0.145);

        liftNoise.connect(liftFilter);
        liftFilter.connect(liftGain);
        liftGain.connect(audioCtx.destination);
        liftNoise.start(now + 0.065, Math.random() * 0.4);
        liftNoise.stop(now + 0.15);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playNow).catch(() => {});
      } else {
        playNow();
      }
    }

    // 2. Card Flip / Thick Paper Slide Swish
    function paperFlip() {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const playNow = () => {
        const now = audioCtx.currentTime;
        const pitchVar = 0.94 + Math.random() * 0.12;

        // Crisp paper rustle swish
        const noise = audioCtx.createBufferSource();
        noise.buffer = getPinkNoise(audioCtx);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(0.9, now);
        filter.frequency.setValueAtTime(600 * pitchVar, now);
        filter.frequency.exponentialRampToValueAtTime(2200 * pitchVar, now + 0.065);
        filter.frequency.exponentialRampToValueAtTime(750 * pitchVar, now + 0.14);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.65, now + 0.028);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.145);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now, Math.random() * 0.5);
        noise.stop(now + 0.15);

        // Subtle cardstock snap
        const snapOsc = audioCtx.createOscillator();
        const snapGain = audioCtx.createGain();
        snapOsc.type = 'triangle';
        snapOsc.frequency.setValueAtTime(220 * pitchVar, now + 0.015);
        snapOsc.frequency.exponentialRampToValueAtTime(75 * pitchVar, now + 0.06);

        snapGain.gain.setValueAtTime(0.001, now + 0.015);
        snapGain.gain.linearRampToValueAtTime(0.28, now + 0.02);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        snapOsc.connect(snapGain);
        snapGain.connect(audioCtx.destination);
        snapOsc.start(now + 0.015);
        snapOsc.stop(now + 0.07);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playNow).catch(() => {});
      } else {
        playNow();
      }
    }

    // 3. Paper Brush / Erase Sweep
    function paperErase() {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const playNow = () => {
        const now = audioCtx.currentTime;

        const noise = audioCtx.createBufferSource();
        noise.buffer = getPinkNoise(audioCtx);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(0.85, now);
        filter.frequency.setValueAtTime(750, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 0.09);
        filter.frequency.exponentialRampToValueAtTime(650, now + 0.22);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now, Math.random() * 0.4);
        noise.stop(now + 0.24);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playNow).catch(() => {});
      } else {
        playNow();
      }
    }

    // 4. Tactile Paper Tap / Button Press
    function paperClick() {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const playNow = () => {
        const now = audioCtx.currentTime;
        const pitchVar = 0.95 + Math.random() * 0.1;

        // Crisp paper-cardstock tap
        const noise = audioCtx.createBufferSource();
        noise.buffer = getWhiteNoise(audioCtx);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1650 * pitchVar, now);
        filter.Q.setValueAtTime(1.2, now);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.55, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start(now, Math.random() * 0.5);
        noise.stop(now + 0.05);

        // Warm cardstock body tap
        const osc = audioCtx.createOscillator();
        const bodyGain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240 * pitchVar, now);
        osc.frequency.exponentialRampToValueAtTime(72 * pitchVar, now + 0.04);

        bodyGain.gain.setValueAtTime(0.001, now);
        bodyGain.gain.linearRampToValueAtTime(0.45, now + 0.003);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(bodyGain);
        bodyGain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.048);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playNow).catch(() => {});
      } else {
        playNow();
      }
    }

    // 5. Origami Paper Crease & Aerodynamic Paper Airplane Whoosh Launch
    function paperFoldAndFly() {
      const audioCtx = getContext();
      if (!audioCtx) return;

      const playNow = () => {
        const now = audioCtx.currentTime;

        // Fold Crease 1 (0.04s) & Fold Crease 2 (0.24s)
        [0.04, 0.24].forEach((offset, idx) => {
          const t = now + offset;
          const pitch = idx === 0 ? 1.0 : 1.18;

          const noise = audioCtx.createBufferSource();
          noise.buffer = getPinkNoise(audioCtx);

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.setValueAtTime(1.1, t);
          filter.frequency.setValueAtTime(720 * pitch, t);
          filter.frequency.exponentialRampToValueAtTime(2300 * pitch, t + 0.08);
          filter.frequency.exponentialRampToValueAtTime(920 * pitch, t + 0.17);

          const gain = audioCtx.createGain();
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.58, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(audioCtx.destination);
          noise.start(t, Math.random() * 0.4);
          noise.stop(t + 0.19);
        });

        // Aerodynamic Flight Whoosh (0.58s -> 1.38s)
        const launchT = now + 0.58;
        const whooshNoise = audioCtx.createBufferSource();
        whooshNoise.buffer = getPinkNoise(audioCtx);

        const whooshFilter = audioCtx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.Q.setValueAtTime(0.8, launchT);
        whooshFilter.frequency.setValueAtTime(340, launchT);
        whooshFilter.frequency.exponentialRampToValueAtTime(1950, launchT + 0.28);
        whooshFilter.frequency.exponentialRampToValueAtTime(420, launchT + 0.78);

        const whooshGain = audioCtx.createGain();
        whooshGain.gain.setValueAtTime(0.001, launchT);
        whooshGain.gain.linearRampToValueAtTime(0.72, launchT + 0.18);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, launchT + 0.8);

        whooshNoise.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(audioCtx.destination);
        whooshNoise.start(launchT, Math.random() * 0.3);
        whooshNoise.stop(launchT + 0.82);
      };

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(playNow).catch(() => {});
      } else {
        playNow();
      }
    }

    return {
      stamp,
      paperFlip,
      paperErase,
      paperClick,
      paperFoldAndFly,
      isMuted,
      setMuted,
      toggleMute
    };
  })();

  // DOM Elements
  const navbar = document.getElementById('navbar');
  const headerLogo = document.getElementById('headerLogo');
  const soundMuteBtn = document.getElementById('soundMuteBtn');
  const soundMuteLabel = document.getElementById('soundMuteLabel');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const scrollBottomIndicator = document.getElementById('scrollBottomIndicator');
  const signatureWrapper = document.getElementById('signatureWrapper');
  const maskSolidFill = document.getElementById('maskSolidFill');
  const photoWrapper = document.getElementById('photoWrapper');
  const strokeElements = Array.from(document.querySelectorAll('.draw-stroke'));
  
  const textBlocks = [
    document.getElementById('textBlock1'),
    document.getElementById('textBlock2'),
    document.getElementById('textBlock3'),
    document.getElementById('textBlock4')
  ];

  // Initialize Stroke Dash Arrays (hide round linecaps completely until stroke begins)
  const strokeData = strokeElements.map((path) => {
    const length = path.getTotalLength();
    const weight = Math.max(length, 95); // give short strokes (i-dot, t-bar, period) smooth visible time
    path.style.strokeDasharray = `${length} ${length + 160}`;
    path.style.strokeDashoffset = `${length + 80}`;
    path.style.opacity = '0';
    return {
      el: path,
      length: length,
      weight: weight
    };
  });

  const totalStrokeWeight = strokeData.reduce((acc, cur) => acc + cur.weight, 0);

  // Cumulative distribution for sequential stroke drawing
  let cumulative = 0;
  const strokeIntervals = strokeData.map((s) => {
    const start = cumulative / totalStrokeWeight;
    cumulative += s.weight;
    const end = cumulative / totalStrokeWeight;
    return {
      el: s.el,
      length: s.length,
      start: start,
      end: end
    };
  });

  // Smooth scroll interpolation (Lerp for ultra-smooth 60/120fps physics)
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  const LERP_FACTOR = 0.095;

  function onScroll() {
    targetScrollY = window.scrollY;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Click scroll indicator to start exploring
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      window.scrollTo({
        top: window.innerHeight * 0.8,
        behavior: 'smooth'
      });
    });
  }

  // Click / Keyboard support for persistent bottom-left scroll-to-interact indicator
  if (scrollBottomIndicator) {
    const handleScrollInteractClick = () => {
      const homeSection = document.getElementById('home');
      const homeDist = homeSection ? Math.max(1, homeSection.offsetHeight - window.innerHeight) : (document.body.scrollHeight - window.innerHeight);
      const currP = homeDist > 0 ? (window.scrollY / homeDist) : 0;

      // Advance through natural storytelling checkpoints
      let targetProgress;
      if (currP < 0.35) {
        targetProgress = 0.48; // photo & signature centered stage
      } else if (currP < 0.85) {
        targetProgress = 0.92; // reveal all perspective text blocks
      } else {
        const aboutEl = document.getElementById('about');
        if (aboutEl) {
          window.scrollTo({
            top: aboutEl.offsetTop - 40,
            behavior: 'smooth'
          });
          return;
        }
        targetProgress = 1.0;
      }

      window.scrollTo({
        top: homeDist * targetProgress,
        behavior: 'smooth'
      });
    };

    scrollBottomIndicator.addEventListener('click', handleScrollInteractClick);
    scrollBottomIndicator.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleScrollInteractClick();
      }
    });
  }

  // Mobile / Touch support for photo hover toggle
  if (photoWrapper) {
    photoWrapper.addEventListener('click', () => {
      photoWrapper.classList.toggle('touch-active');
    });
  }

  // Animation Loop
  function tick() {
    // Lerp smoothing
    currentScrollY += (targetScrollY - currentScrollY) * LERP_FACTOR;
    if (Math.abs(targetScrollY - currentScrollY) < 0.1) {
      currentScrollY = targetScrollY;
    }

    const homeSection = document.getElementById('home');
    const homeScrollDist = homeSection ? Math.max(1, homeSection.offsetHeight - window.innerHeight) : Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, currentScrollY / homeScrollDist));

    updateScene(progress);
    updateActiveNav(progress);

    requestAnimationFrame(tick);
  }

  // Active Navbar indicator & Navigation handler
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  let wdContactFab = document.getElementById('wdContactFab');

  if (!wdContactFab) {
    wdContactFab = document.createElement('a');
    wdContactFab.href = '#contact';
    wdContactFab.className = 'wd-contact-fab';
    wdContactFab.id = 'wdContactFab';
    wdContactFab.setAttribute('aria-label', 'Contact Me');
    wdContactFab.setAttribute('title', 'Contact Me');
    wdContactFab.innerHTML = `
      <span class="wd-fab-ring" aria-hidden="true"></span>
      <svg class="wd-fab-phone-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
      <span class="wd-fab-label">Contact</span>
    `;
    document.body.appendChild(wdContactFab);
  }

  if (wdContactFab) {
    wdContactFab.addEventListener('click', (e) => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        e.preventDefault();
        window.scrollTo({
          top: contactSection.offsetTop - 40,
          behavior: 'smooth'
        });
      }
    });
  }

  function updateActiveNav(p) {
    const aboutSection = document.getElementById('about');
    const projectSection = document.getElementById('project');
    const workDetailSection = document.getElementById('work-detail');
    const mailSection = document.getElementById('mail');
    const contactSection = document.getElementById('contact');
    const scrollPos = window.scrollY;

    // Navbar mendapat latar kaca begitu konten (About) mulai lewat di bawahnya
    if (navbar && aboutSection) {
      navbar.classList.toggle('docked', scrollPos >= aboutSection.offsetTop - 100);
    }

    let currentId = 'home';

    if (contactSection && contactSection.offsetHeight > 50 && scrollPos >= contactSection.offsetTop - 180) {
      currentId = 'contact';
    } else if (mailSection && scrollPos >= mailSection.offsetTop - 180) {
      currentId = 'mail';
    } else if (workDetailSection && scrollPos >= workDetailSection.offsetTop - 180) {
      currentId = 'work-detail';
    } else if (projectSection && scrollPos >= projectSection.offsetTop - 150) {
      currentId = 'project';
    } else if (aboutSection && scrollPos >= aboutSection.offsetTop - 150) {
      currentId = 'about';
    } else {
      currentId = 'home';
    }

    // Show Glass Telephone FAB exclusively while inside Work Details section
    if (wdContactFab && workDetailSection) {
      const wdRect = workDetailSection.getBoundingClientRect();
      const inWorkDetail = wdRect.top <= window.innerHeight * 0.65 && wdRect.bottom >= window.innerHeight * 0.3;
      wdContactFab.classList.toggle('is-visible', inWorkDetail);
    }

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  if (headerLogo) {
    headerLogo.addEventListener('click', (e) => {
      e.preventDefault();
      const homeSection = document.getElementById('home');
      const homeDist = homeSection ? Math.max(1, homeSection.offsetHeight - window.innerHeight) : (document.body.scrollHeight - window.innerHeight);
      window.scrollTo({
        top: homeDist * 0.92,
        behavior: 'smooth'
      });
    });
  }

  if (soundMuteBtn) {
    soundMuteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nowMuted = SoundFX.toggleMute();
      soundMuteBtn.classList.toggle('is-muted', nowMuted);
      soundMuteBtn.setAttribute('aria-pressed', String(nowMuted));
      if (soundMuteLabel) {
        soundMuteLabel.textContent = nowMuted ? 'Muted' : 'Sound On';
      }
      if (!nowMuted) {
        SoundFX.paperClick();
      }
    });
  }

  // Smooth click navigation between sections
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetHref = link.getAttribute('href');
      const homeSection = document.getElementById('home');
      const homeDist = homeSection ? Math.max(1, homeSection.offsetHeight - window.innerHeight) : (document.body.scrollHeight - window.innerHeight);

      if (targetHref === '#home') {
        e.preventDefault();
        // Scroll ke tampilan penuh section Home (foto + tanda tangan + 4 teks perspektif lengkap)
        window.scrollTo({
          top: homeDist * 0.92,
          behavior: 'smooth'
        });
      } else if (targetHref && targetHref.startsWith('#')) {
        const targetEl = document.querySelector(targetHref);
        if (targetEl) {
          e.preventDefault();
          window.scrollTo({
            top: targetEl.offsetTop - 40,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  /**
   * Update all elements based on scroll progress p in [0, 1]
   */
  function updateScene(p) {
    // -------------------------------------------------------------------------
    // Phase 0: Center scroll prompt fade out (p: 0 -> 0.05)
    // -------------------------------------------------------------------------
    if (scrollIndicator) {
      if (p <= 0.005) {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
        scrollIndicator.classList.remove('faded');
      } else if (p < 0.05) {
        const indProgress = p / 0.05;
        scrollIndicator.style.opacity = `${Math.max(0, 1 - indProgress * 1.3)}`;
        scrollIndicator.style.pointerEvents = 'none';
        scrollIndicator.classList.remove('faded');
      } else {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
        scrollIndicator.classList.add('faded');
      }
    }

    // -------------------------------------------------------------------------
    // Phase 0B: Persistent bottom-left 'Scroll to interact' indicator
    // Visible while scrolling until all home content is opened (p >= 0.94)
    // -------------------------------------------------------------------------
    if (scrollBottomIndicator) {
      if (p < 0.93) {
        scrollBottomIndicator.style.opacity = '1';
        scrollBottomIndicator.style.pointerEvents = 'auto';
        scrollBottomIndicator.classList.remove('faded');
      } else if (p < 0.97) {
        const fadeOutProgress = (p - 0.93) / 0.04;
        scrollBottomIndicator.style.opacity = `${Math.max(0, 1 - fadeOutProgress)}`;
        scrollBottomIndicator.style.pointerEvents = 'none';
        scrollBottomIndicator.classList.remove('faded');
      } else {
        scrollBottomIndicator.style.opacity = '0';
        scrollBottomIndicator.style.pointerEvents = 'none';
        scrollBottomIndicator.classList.add('faded');
      }
    }

    // -------------------------------------------------------------------------
    // Phase 1: Handwriting animation (p: 0.02 -> 0.38)
    // Smooth overlapping stroke progression with zero initial pixel leak
    // -------------------------------------------------------------------------
    const writeStart = 0.02;
    const writeEnd = 0.38;
    const rawWrite = Math.min(1, Math.max(0, (p - writeStart) / (writeEnd - writeStart)));
    // Gentle ease-in-out curve so writing accelerates and decelerates naturally
    const writeProgress = rawWrite < 0.5
      ? 2 * rawWrite * rawWrite
      : 1 - Math.pow(-2 * rawWrite + 2, 2) / 2;

    strokeIntervals.forEach((item) => {
      const span = Math.max(0.001, item.end - item.start);
      // Slight overlap between consecutive strokes for fluid handwriting flow
      const overlap = span * 0.12;
      const sStart = Math.max(0, item.start - overlap);
      const sEnd = Math.min(1, item.end + overlap * 0.4);

      if (rawWrite <= 0.001 || writeProgress <= sStart) {
        // Completely hide stroke before it begins so round linecap never leaks pixels
        item.el.style.opacity = '0';
        item.el.style.strokeDashoffset = `${item.length + 80}`;
      } else if (writeProgress >= sEnd) {
        item.el.style.opacity = '1';
        item.el.style.strokeDashoffset = '0';
      } else {
        const localT = (writeProgress - sStart) / Math.max(0.0001, sEnd - sStart);
        // Smoothstep on individual stroke
        const smoothT = localT * localT * (3 - 2 * localT);
        // Fade in the tip during the first 8% of the stroke so round cap never pops
        const tipAlpha = Math.min(1, localT / 0.08);
        item.el.style.opacity = `${tipAlpha.toFixed(3)}`;
        item.el.style.strokeDashoffset = `${(item.length * (1 - smoothT)).toFixed(2)}`;
      }
    });

    // Gradual cross-fade of solid fill between 0.90 and 1.0 (no sudden pop)
    if (maskSolidFill) {
      if (writeProgress <= 0.90) {
        maskSolidFill.style.opacity = '0';
      } else {
        const fillT = Math.min(1, (writeProgress - 0.90) / 0.10);
        maskSolidFill.style.opacity = `${fillT.toFixed(3)}`;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 2: Signature fades & recedes smoothly to background, Photo & Navbar emerge (p: 0.36 -> 0.58)
    // -------------------------------------------------------------------------
    const fadeStart = 0.36;
    const fadeEnd = 0.58;

    if (p < fadeStart) {
      // Signature is full foreground
      if (signatureWrapper) {
        signatureWrapper.style.opacity = '1';
        signatureWrapper.style.transform = 'translate3d(-50%, -50%, 0) scale(1)';
      }
      if (photoWrapper) {
        photoWrapper.classList.remove('visible');
        photoWrapper.style.opacity = '0';
      }
      if (navbar) {
        navbar.classList.remove('visible');
      }
      if (headerLogo) {
        headerLogo.classList.remove('visible');
      }
      if (soundMuteBtn) {
        soundMuteBtn.classList.remove('visible');
      }
    } else {
      // Smoothstep transition to background watermark
      const rawFade = Math.min(1, (p - fadeStart) / (fadeEnd - fadeStart));
      const fadeT = rawFade * rawFade * (3 - 2 * rawFade);
      // Opacity goes smoothly from 1.0 down to 0.13 (more subtle watermark when photo & portfolio. appear)
      const sigOpacity = 1 - fadeT * 0.87;
      const sigScale = 1 - fadeT * 0.035;
      if (signatureWrapper) {
        signatureWrapper.style.opacity = `${sigOpacity.toFixed(3)}`;
        signatureWrapper.style.transform = `translate3d(-50%, -50%, 0) scale(${sigScale.toFixed(4)})`;
      }

      // Photo appears over the signature
      if (photoWrapper) {
        photoWrapper.classList.add('visible');
        photoWrapper.style.opacity = `${fadeT}`;
        // Scale smoothly from 0.88 to 1.0 with fixed -4deg natural tilt
        const photoScale = 0.88 + 0.12 * fadeT;
        photoWrapper.style.transform = `translate(-50%, -50%) rotate(-4deg) scale(${photoScale})`;
      }

      // Navbar, Header Logo, & Sound Toggle fade in simultaneously
      if (navbar) {
        if (p >= 0.42) {
          navbar.classList.add('visible');
        } else {
          navbar.classList.remove('visible');
        }
      }
      if (headerLogo) {
        if (p >= 0.42) {
          headerLogo.classList.add('visible');
        } else {
          headerLogo.classList.remove('visible');
        }
      }
      if (soundMuteBtn) {
        if (p >= 0.42) {
          soundMuteBtn.classList.add('visible');
        } else {
          soundMuteBtn.classList.remove('visible');
        }
      }
    }

    // -------------------------------------------------------------------------
    // Phase 3: Spatial Perspective Text Blocks (Courier Prime)
    // Emerge sequentially 1 by 1 (p: 0.58 -> 0.96)
    // -------------------------------------------------------------------------
    // Thresholds:
    // Item 1 (top-right, most receded): 0.60
    // Item 2 (mid-right): 0.70
    // Item 3 (mid-left): 0.80
    // Item 4 (bottom-left, largest): 0.88
    const thresholds = [0.58, 0.68, 0.78, 0.88];

    textBlocks.forEach((block, index) => {
      if (!block) return;
      const th = thresholds[index];
      if (p >= th) {
        block.classList.add('revealed');
      } else {
        block.classList.remove('revealed');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // ENVELOPE OPENING LOADING ENGINE
  // ---------------------------------------------------------------------------
  const letterLoader = document.getElementById('letterLoader');
  const envelopeContainer = document.getElementById('envelopeContainer');
  const headLetterWrapper = document.getElementById('headLetterWrapper');
  const loaderIndicator = document.getElementById('loaderIndicator');
  const loaderBarFill = document.getElementById('loaderBarFill');
  const loaderPercentage = document.getElementById('loaderPercentage');

  let loaderFinished = false;

  function runEnvelopeLoader() {
    if (!letterLoader) return;

    // Prevent body scroll during envelope opening sequence
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    let progress = 0;
    const duration = 1500; // ms for loading progress 0% -> 100%
    const startTime = performance.now();

    function updateLoader(now) {
      if (loaderFinished) return;
      const elapsed = now - startTime;
      progress = Math.min(100, Math.floor((elapsed / duration) * 100));

      if (loaderBarFill) loaderBarFill.style.width = `${progress}%`;
      if (loaderPercentage) loaderPercentage.textContent = `${progress}%`;

      if (elapsed < duration) {
        requestAnimationFrame(updateLoader);
      } else {
        // 100% reached! Proceed with flap opening
        triggerEnvelopeOpening();
      }
    }

    requestAnimationFrame(updateLoader);

    // Skip sequence if clicked or key pressed
    function onSkip() {
      if (loaderFinished) return;
      finishLoaderImmediately();
    }

    letterLoader.addEventListener('click', onSkip);
    window.addEventListener('keydown', onSkip, { once: true });
  }

  function triggerEnvelopeOpening() {
    if (loaderFinished) return;

    // 1. Fade out indicator
    if (loaderIndicator) loaderIndicator.classList.add('faded');

    // 2. Open Flap upwards (Pages 2 & 3 in PDF reference)
    setTimeout(() => {
      if (loaderFinished) return;
      if (envelopeContainer) envelopeContainer.classList.add('step-flap-open');

      // Halfway through the 3D flip (~420ms), switch flap z-index so it sits behind paper
      setTimeout(() => {
        if (headLetterWrapper) headLetterWrapper.style.zIndex = '1';
      }, 420);

      // 3. Paper slides upwards out of envelope pocket (Pages 3 & 4 in PDF reference)
      setTimeout(() => {
        if (loaderFinished) return;
        if (envelopeContainer) envelopeContainer.classList.add('step-paper-rise');

        // 4. Paper enters centered foreground position (Page 5 in PDF reference)
        setTimeout(() => {
          if (loaderFinished) return;
          if (envelopeContainer) envelopeContainer.classList.add('step-paper-center');

          // 5. Paper smoothly expands to 100% fullscreen solid #dddddd (Page 6 in PDF reference)
          setTimeout(() => {
            if (loaderFinished) return;
            if (envelopeContainer) envelopeContainer.classList.add('step-paper-fullscreen');

            // 6. Seamless transition into website landing page
            setTimeout(() => {
              finishLoaderImmediately();
            }, 750);
          }, 700);
        }, 750);
      }, 700);
    }, 300);
  }

  function finishLoaderImmediately() {
    if (loaderFinished) return;
    loaderFinished = true;

    // Restore body scrolling
    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    if (letterLoader) {
      letterLoader.classList.add('loader-hidden');
      setTimeout(() => {
        letterLoader.style.display = 'none';
      }, 650);
    }
  }

  // ---------------------------------------------------------------------------
  // INTERACTIVE KALKIR STAMP ENGINE
  // Exclusive to the About Me kertas kalkir sheet
  // ---------------------------------------------------------------------------
  function initKalkirStamps() {
    const kalkirSheet = document.getElementById('kalkirSheet');
    const stampsLayer = document.getElementById('kalkirStampsLayer');
    const eraserBtn = document.getElementById('stampEraserBtn');
    const eraserCount = document.getElementById('stampEraserCount');
    const indicatorPill = document.getElementById('stampIndicatorPill');

    if (!kalkirSheet || !stampsLayer) return;

    let stampCount = 0;
    let templateIdx = 0;

    // Authentic rubber stamp ink palette from reference image
    const stampColors = [
      '#1e2d5a', // Vintage Indigo Blue
      '#b82e24', // Terracotta Crimson Red
      '#54256c', // Royal Violet Purple
      '#1f4d38', // Alpine Pine Green
      '#a34d1e'  // Heritage Ochre Rust
    ];

    // 5 Unique Rubber Passport/Travel Stamp Designs
    const stampTemplates = [
      // 1. Circular Double-Ring (Paris / Netherlands style)
      function (id) {
        return `
          <svg viewBox="0 0 110 110" class="rubber-stamp-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" stroke="currentColor" stroke-width="2.8" fill="none" stroke-dasharray="6 2.5"/>
            <circle cx="55" cy="55" r="42" stroke="currentColor" stroke-width="1.4" fill="none"/>
            <circle cx="55" cy="55" r="30" stroke="currentColor" stroke-width="0.8" fill="none"/>
            <path id="circlePath_${id}" fill="none" d="M 20 55 A 35 35 0 1 1 90 55"/>
            <text font-size="7.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" letter-spacing="1.2">
              <textPath href="#circlePath_${id}" startOffset="50%" text-anchor="middle">★ WINSTON HANSEL ★</textPath>
            </text>
            <line x1="28" y1="46" x2="82" y2="46" stroke="currentColor" stroke-width="1"/>
            <text x="55" y="58" font-size="10" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">2026</text>
            <line x1="28" y1="63" x2="82" y2="63" stroke="currentColor" stroke-width="1"/>
            <text x="55" y="73" font-size="7" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">STUDIO VISA</text>
          </svg>`;
      },

      // 2. Hexagonal Alpine Stamp (Switzerland style)
      function (id) {
        return `
          <svg viewBox="0 0 116 102" class="rubber-stamp-svg" xmlns="http://www.w3.org/2000/svg">
            <polygon points="58,4 110,28 110,74 58,98 6,74 6,28" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linejoin="round"/>
            <polygon points="58,11 102,32 102,70 58,91 14,70 14,32" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
            <polyline points="22,66 40,40 56,54 74,34 94,66" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            <text x="58" y="78" font-size="8.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1.5">CREATIVE LAB</text>
            <text x="58" y="88" font-size="7" font-family="'Courier Prime', monospace" fill="currentColor" text-anchor="middle">JAKARTA • ID</text>
          </svg>`;
      },

      // 3. Classical Oval (Rome / Greece style)
      function (id) {
        return `
          <svg viewBox="0 0 120 90" class="rubber-stamp-svg" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="60" cy="45" rx="55" ry="39" stroke="currentColor" stroke-width="2.6" fill="none" stroke-dasharray="5 2"/>
            <ellipse cx="60" cy="45" rx="48" ry="32" stroke="currentColor" stroke-width="1.3" fill="none"/>
            <text x="60" y="32" font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="2">APPROVED</text>
            <line x1="26" y1="38" x2="94" y2="38" stroke="currentColor" stroke-width="1"/>
            <text x="60" y="52" font-size="10.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">DESIGN SYSTEM</text>
            <line x1="26" y1="57" x2="94" y2="57" stroke="currentColor" stroke-width="1"/>
            <text x="60" y="69" font-size="7" font-family="'Courier Prime', monospace" fill="currentColor" text-anchor="middle" letter-spacing="1">ARCHIVE // 2026</text>
          </svg>`;
      },

      // 4. Scalloped Island Crest (Singapore / Easter Island style)
      function (id) {
        return `
          <svg viewBox="0 0 110 110" class="rubber-stamp-svg" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="3.5 3"/>
            <circle cx="55" cy="55" r="44" stroke="currentColor" stroke-width="1.4" fill="none"/>
            <circle cx="55" cy="55" r="32" stroke="currentColor" stroke-width="0.8" fill="none"/>
            <text x="55" y="42" font-size="7.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1.2">VERIFIED</text>
            <text x="55" y="58" font-size="13" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">W • H</text>
            <text x="55" y="72" font-size="7" font-family="'Courier Prime', monospace" fill="currentColor" text-anchor="middle">MOTION &amp; CODE</text>
            <text x="55" y="90" font-size="6.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1.5">★ OFFICIAL PASSPORT ★</text>
          </svg>`;
      },

      // 5. Rectangular Architectural Border (London Bridge / Salisbury style)
      function (id) {
        return `
          <svg viewBox="0 0 118 84" class="rubber-stamp-svg" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="108" height="74" rx="7" stroke="currentColor" stroke-width="2.5" fill="none"/>
            <rect x="11" y="11" width="96" height="62" rx="4" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="4 2"/>
            <text x="59" y="30" font-size="9" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1.5">WINSTON HANSEL</text>
            <line x1="20" y1="37" x2="98" y2="37" stroke="currentColor" stroke-width="1"/>
            <text x="59" y="50" font-size="7.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">IMMIGRATION OF IDEAS</text>
            <line x1="20" y1="56" x2="98" y2="56" stroke="currentColor" stroke-width="1"/>
            <text x="59" y="68" font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1.8">PASSED // 2026</text>
          </svg>`;
      }
    ];

    function placeStamp(x, y) {
      const stampId = 'stamp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const generator = stampTemplates[templateIdx % stampTemplates.length];
      const color = stampColors[templateIdx % stampColors.length];
      templateIdx++;

      // Natural random angle between -16deg and +16deg
      const angle = (Math.random() * 32 - 16).toFixed(1);

      // Slightly randomized stamp size (105px to 125px)
      const size = Math.floor(105 + Math.random() * 20);

      const stampEl = document.createElement('div');
      stampEl.className = 'kalkir-placed-stamp';
      stampEl.style.width = `${size}px`;
      stampEl.style.height = `${size}px`;
      stampEl.style.left = `${x}px`;
      stampEl.style.top = `${y}px`;
      stampEl.style.setProperty('--stamp-rot', `${angle}deg`);
      stampEl.style.color = color;
      stampEl.innerHTML = generator(stampId);

      stampsLayer.appendChild(stampEl);
      SoundFX.stamp();

      stampCount++;
      if (eraserCount) eraserCount.textContent = stampCount;
      if (eraserBtn) eraserBtn.disabled = false;
    }

    // Click on kalkirSheet creates a stamp
    kalkirSheet.addEventListener('click', (e) => {
      // Ignore clicks on buttons or toolbars
      if (e.target.closest('#stampEraserBtn') || e.target.closest('#stampIndicatorPill')) {
        return;
      }

      const rect = kalkirSheet.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      placeStamp(x, y);
    });

    // Indicator Pill Demo Click
    if (indicatorPill) {
      indicatorPill.addEventListener('click', (e) => {
        e.stopPropagation();
        // Place sample stamp near the top right
        const rect = kalkirSheet.getBoundingClientRect();
        const demoX = Math.min(rect.width - 90, Math.max(90, rect.width * 0.72));
        const demoY = 110;
        placeStamp(demoX, demoY);
      });
    }

    // Eraser Button: Clear all stamps
    if (eraserBtn) {
      eraserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (stampCount === 0) return;

        SoundFX.paperErase();
        const stamps = Array.from(stampsLayer.querySelectorAll('.kalkir-placed-stamp'));
        stamps.forEach((stamp) => stamp.classList.add('stamp-erasing'));

        setTimeout(() => {
          stampsLayer.innerHTML = '';
          stampCount = 0;
          if (eraserCount) eraserCount.textContent = '0';
          eraserBtn.disabled = true;
        }, 300);
      });
    }

    // CV Preview Modal (View My CV button under Skills)
    const openCvModalBtn = document.getElementById('openCvModalBtn');
    const cvModal = document.getElementById('cvModal');
    const cvModalClose = document.getElementById('cvModalClose');
    const cvModalContactBtn = document.getElementById('cvModalContactBtn');
    const cvPreviewContainer = cvModal ? cvModal.querySelector('.cv-modal-preview') : null;

    if (openCvModalBtn && cvModal) {
      openCvModalBtn.addEventListener('click', () => {
        if (typeof cvModal.showModal === 'function') {
          cvModal.showModal();
          if (cvPreviewContainer) {
            cvPreviewContainer.scrollTop = 0;
          }
        }
      });
    }

    if (cvModalClose && cvModal) {
      cvModalClose.addEventListener('click', () => cvModal.close());
      cvModal.addEventListener('click', (e) => {
        if (e.target === cvModal) cvModal.close();
      });
    }

    // Smooth scroll to #contact for "Contact Me" buttons (both in CV Modal and under Skills)
    const contactButtons = Array.from(document.querySelectorAll('.cv-btn-contact, #cvModalContactBtn'));
    contactButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          e.preventDefault();
          if (cvModal && cvModal.open) {
            cvModal.close();
          }
          window.scrollTo({
            top: contactSection.offsetTop - 40,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTIVE SCATTERED PROJECT CARDS
  // Free draggable cards that stay where placed, and tap-to-flip description
  // ---------------------------------------------------------------------------
  function initProjectScatterCards() {
    const stage = document.getElementById('projectScatterStage');
    const resetBtn = document.getElementById('resetScatterBtn');
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll('.scatter-card'));
    let topZIndex = 50;

    cards.forEach((card) => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let hasMoved = false;

      function onPointerDown(e) {
        // Ignore pointerdown on the "See More ->" link so clicking it doesn't flip or drag the card
        if (e.target.closest('.back-see-more')) return;

        // Only primary mouse button or touch
        if (e.button !== undefined && e.button !== 0) return;

        // Bring card to topmost visual layer
        topZIndex++;
        card.style.zIndex = topZIndex;

        // Use unrotated layout offsetLeft/offsetTop so rotated bounding box never causes position jump
        initialLeft = card.offsetLeft;
        initialTop = card.offsetTop;

        // Convert inline styles to current pixel position if it was percentage
        card.style.left = `${initialLeft}px`;
        card.style.top = `${initialTop}px`;

        startX = e.clientX;
        startY = e.clientY;
        hasMoved = false;
        isDragging = true;

        if (card.setPointerCapture) {
          try {
            card.setPointerCapture(e.pointerId);
          } catch (_) {}
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      }

      function onPointerMove(e) {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // 8px dead-zone threshold so minor cursor movement during a click doesn't cancel flip,
        // and dragging never accidentally triggers a flip on release
        if (!hasMoved && Math.hypot(dx, dy) > 8) {
          hasMoved = true;
          card.classList.add('is-dragging');
        }

        if (hasMoved) {
          let newLeft = initialLeft + dx;
          let newTop = initialTop + dy;

          // Keep card reasonably contained within stage borders
          const minLeft = -card.offsetWidth * 0.25;
          const maxLeft = stage.offsetWidth - card.offsetWidth * 0.75;
          const minTop = -card.offsetHeight * 0.2;
          const maxTop = stage.offsetHeight - card.offsetHeight * 0.8;

          newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
          newTop = Math.max(minTop, Math.min(maxTop, newTop));

          card.style.left = `${newLeft}px`;
          card.style.top = `${newTop}px`;
        }
      }

      function onPointerUp(e) {
        if (!isDragging) return;
        isDragging = false;

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        if (card.releasePointerCapture && e.pointerId) {
          try {
            card.releasePointerCapture(e.pointerId);
          } catch (_) {}
        }

        if (hasMoved) {
          // Finished drag: Card stays in its new position!
          card.classList.remove('is-dragging');
        } else {
          // Tap without drag: Toggle flip to reveal description!
          SoundFX.paperFlip();
          card.classList.toggle('is-flipped');
        }
      }

      card.addEventListener('pointerdown', onPointerDown);

      // Smooth scroll to the specific Work Detail project block when clicking "See More ->"
      const seeMoreLink = card.querySelector('.back-see-more');
      if (seeMoreLink) {
        seeMoreLink.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetSelector = seeMoreLink.getAttribute('data-wd-target') || seeMoreLink.getAttribute('href');
          if (!targetSelector) return;
          const targetBlock = document.querySelector(targetSelector);
          if (targetBlock) {
            const rect = targetBlock.getBoundingClientRect();
            const targetTop = window.scrollY + rect.top - 96; // leave breathing room for fixed navbar
            window.scrollTo({
              top: targetTop,
              behavior: 'smooth'
            });
          }
        });
      }
    });

    // Reset Cards Button: Return all cards to their initial scattered positions
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        SoundFX.paperFlip();
        cards.forEach((card) => {
          card.classList.remove('is-flipped');
          card.style.transition = 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.left = '';
          card.style.top = '';
          setTimeout(() => {
            card.style.transition = '';
          }, 700);
        });
      });
    }
  }

  // ---------------------------------------------------------------------------
  // MAIL — SEND A LETTER
  // Postcard template + customizable stamp (design, ink, text).
  // NOTE: Static site, so "send" opens the visitor's email app via mailto:.
  // To send directly from the site later, replace sendLetter() with a call
  // to an email service (e.g. EmailJS / Formspree / your own API).
  // ---------------------------------------------------------------------------
  function initMailLetter() {
    const form = document.getElementById('letterCard');
    if (!form) return;

    const slot = document.getElementById('letterStampSlot');
    const pickerGrid = document.getElementById('stampPickerGrid');
    const inkRow = document.getElementById('stampInkRow');
    const customText = document.getElementById('stampCustomText');
    const message = document.getElementById('letterMessage');
    const charCount = document.getElementById('letterCharCount');
    const postmarkDate = document.getElementById('letterPostmarkDate');
    const status = document.getElementById('letterStatus');

    const inks = [
      { name: 'Indigo', value: '#1e2d5a' },
      { name: 'Crimson', value: '#b82e24' },
      { name: 'Violet', value: '#54256c' },
      { name: 'Pine', value: '#1f4d38' },
      { name: 'Rust', value: '#a34d1e' }
    ];

    // Stamp designs — each receives the custom text (t) and a unique id
    const designs = [
      {
        name: 'Circle',
        svg: (t, id) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" stroke="currentColor" stroke-width="2.8" fill="none" stroke-dasharray="6 2.5"/>
            <circle cx="55" cy="55" r="40" stroke="currentColor" stroke-width="1.3" fill="none"/>
            <path id="pgArc_${id}" fill="none" d="M 22 55 A 33 33 0 1 1 88 55"/>
            <text font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" letter-spacing="1.2">
              <textPath href="#pgArc_${id}" startOffset="50%" text-anchor="middle">★ ${t} ★</textPath>
            </text>
            <text x="55" y="64" font-size="12" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">${new Date().getFullYear()}</text>
            <text x="55" y="78" font-size="7" font-family="'Courier Prime', monospace" fill="currentColor" text-anchor="middle">AIR MAIL</text>
          </svg>`
      },
      {
        name: 'Mountain',
        svg: (t) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <polygon points="55,6 104,30 104,80 55,104 6,80 6,30" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linejoin="round"/>
            <polyline points="20,70 38,42 52,56 70,34 90,70" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            <text x="55" y="84" font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1">${t}</text>
          </svg>`
      },
      {
        name: 'Oval',
        svg: (t) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="55" cy="55" rx="50" ry="36" stroke="currentColor" stroke-width="2.6" fill="none" stroke-dasharray="5 2"/>
            <ellipse cx="55" cy="55" rx="43" ry="29" stroke="currentColor" stroke-width="1.2" fill="none"/>
            <text x="55" y="45" font-size="7" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="2">DELIVERED</text>
            <line x1="22" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="1"/>
            <text x="55" y="62" font-size="8.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle">${t}</text>
            <line x1="22" y1="67" x2="88" y2="67" stroke="currentColor" stroke-width="1"/>
          </svg>`
      },
      {
        name: 'Heart',
        svg: (t) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="98" height="98" rx="4" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>
            <path d="M55 74 C 30 58, 30 34, 46 34 C 52 34, 55 40, 55 42 C 55 40, 58 34, 64 34 C 80 34, 80 58, 55 74 Z" stroke="currentColor" stroke-width="2.2" fill="none"/>
            <text x="55" y="92" font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1">${t}</text>
          </svg>`
      },
      {
        name: 'Envelope',
        svg: (t) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="14" width="98" height="82" rx="6" stroke="currentColor" stroke-width="2.5" fill="none"/>
            <rect x="22" y="30" width="66" height="40" stroke="currentColor" stroke-width="1.8" fill="none"/>
            <polyline points="22,30 55,54 88,30" stroke="currentColor" stroke-width="1.8" fill="none"/>
            <text x="55" y="86" font-size="8" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1">${t}</text>
          </svg>`
      },
      {
        name: 'Star',
        svg: (t, id) => `
          <svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="50" stroke="currentColor" stroke-width="2.4" fill="none" stroke-dasharray="3.5 3"/>
            <polygon points="55,26 62,46 83,46 66,58 72,78 55,66 38,78 44,58 27,46 48,46" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/>
            <text x="55" y="96" font-size="7.5" font-family="'Courier Prime', monospace" font-weight="700" fill="currentColor" text-anchor="middle" letter-spacing="1">${t}</text>
          </svg>`
      }
    ];

    const state = { design: 0, ink: 0 };

    // Escape user text before injecting into SVG markup
    function escapeXml(str) {
      return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function getStampText() {
      const raw = (customText && customText.value.trim()) || 'WINSTON HANSEL';
      return escapeXml(raw.toUpperCase());
    }

    function renderSlot() {
      slot.style.color = inks[state.ink].value;
      slot.innerHTML = designs[state.design].svg(getStampText(), 'slot');
      slot.classList.remove('stamp-bump');
      void slot.offsetWidth; // restart animation
      slot.classList.add('stamp-bump');
    }

    function renderPicker() {
      pickerGrid.innerHTML = '';
      designs.forEach((d, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'stamp-option';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-label', `${d.name} stamp`);
        btn.setAttribute('aria-checked', String(i === state.design));
        btn.style.color = inks[state.ink].value;
        btn.innerHTML = d.svg(getStampText(), `opt${i}`);
        btn.addEventListener('click', () => {
          state.design = i;
          SoundFX.stamp();
          renderPicker();
          renderSlot();
        });
        pickerGrid.appendChild(btn);
      });
    }

    function renderInks() {
      inkRow.innerHTML = '';
      inks.forEach((ink, i) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'ink-swatch';
        sw.style.background = ink.value;
        sw.setAttribute('role', 'radio');
        sw.setAttribute('aria-label', `${ink.name} ink`);
        sw.setAttribute('aria-checked', String(i === state.ink));
        sw.addEventListener('click', () => {
          state.ink = i;
          SoundFX.stamp();
          renderInks();
          renderPicker();
          renderSlot();
        });
        inkRow.appendChild(sw);
      });
    }

    // Postmark date
    if (postmarkDate) {
      postmarkDate.textContent = new Date()
        .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase();
    }

    // Live char count
    if (message && charCount) {
      message.addEventListener('input', () => {
        charCount.textContent = message.value.length;
      });
    }

    // Live custom stamp text
    if (customText) {
      customText.addEventListener('input', () => {
        renderPicker();
        slot.innerHTML = designs[state.design].svg(getStampText(), 'slot');
      });
    }

    // Modal elements
    const modal = document.getElementById('letterModal');
    const modalClose = document.getElementById('letterModalClose');
    const exportImg = document.getElementById('letterExportImg');
    const btnCopy = document.getElementById('btnCopyImg');
    const copyBtnText = document.getElementById('copyBtnText');
    const btnDownload = document.getElementById('btnDownloadImg');
    const btnOpenMail = document.getElementById('btnOpenMailApp');

    let currentCanvas = null;
    let currentBlob = null;
    let currentDataUrl = '';
    let currentLetterData = null;

    // Helper: word-wrapping text for canvas
    function wrapCanvasText(ctx, text, maxWidth) {
      const lines = [];
      const paragraphs = text.split('\n');
      for (const para of paragraphs) {
        if (!para.trim()) {
          lines.push('');
          continue;
        }
        const words = para.split(/\s+/);
        let cur = words[0] || '';
        for (let i = 1; i < words.length; i++) {
          const test = cur + ' ' + words[i];
          if (ctx.measureText(test).width <= maxWidth) {
            cur = test;
          } else {
            lines.push(cur);
            cur = words[i];
          }
        }
        lines.push(cur);
      }
      return lines;
    }

    // Render postcard to HTML5 Canvas (high-res 1200x750)
    function renderPostcardToCanvas(data, onDone) {
      const W = 1200;
      const H = 750;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // 1. Off-white vintage paper background
      ctx.fillStyle = '#faf7f2';
      ctx.fillRect(0, 0, W, H);

      // 2. Air-mail diagonal stripes border (14px outer margin)
      const stripeW = 16;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.rect(14, 14, W - 28, H - 28);
      ctx.clip('evenodd');

      for (let x = -H; x < W + H; x += stripeW * 2) {
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW - H, H);
        ctx.lineTo(x - H, H);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#8a8a8a';
        ctx.beginPath();
        ctx.moveTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW * 2, 0);
        ctx.lineTo(x + stripeW * 2 - H, H);
        ctx.lineTo(x + stripeW - H, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 3. Inner frame line
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      // 4. Top Tag
      ctx.font = '700 13px "Courier Prime", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('[ POST CARD — WH STUDIO ]', 52, 60);

      // 5. Center dashed divider line
      const divX = 640;
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(divX, 75);
      ctx.lineTo(divX, H - 55);
      ctx.stroke();
      ctx.restore();

      // 6. Left side ("Dear," in Gladly Mailed + name beside it & MESSAGE)
      const leftX = 52;
      const leftW = divX - leftX - 44;

      ctx.font = '400 50px "gladly-mailed", "Gladly Mailed", cursive';
      ctx.fillStyle = '#111111';
      const dearPrefix = 'Dear,';
      ctx.fillText(dearPrefix, leftX, 132);
      const dearWidth = ctx.measureText(dearPrefix).width;

      ctx.font = '700 18px "Courier Prime", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText(data.from || 'Friend', leftX + dearWidth + 16, 130);

      ctx.strokeStyle = '#d5d5d5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftX, 140);
      ctx.lineTo(leftX + leftW, 140);
      ctx.stroke();

      ctx.font = '700 12.5px "Courier Prime", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('MESSAGE', leftX, 175);

      // Ruled stationery lines & message body
      ctx.font = '400 16px "Courier Prime", monospace';
      const lineHeight = 33;
      const messageStartY = 205;
      const maxLines = 14;
      const lines = wrapCanvasText(ctx, data.message || '', leftW);

      for (let i = 0; i < maxLines; i++) {
        const lineY = messageStartY + i * lineHeight;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftX, lineY + 6);
        ctx.lineTo(leftX + leftW, lineY + 6);
        ctx.stroke();

        if (i < lines.length) {
          ctx.fillStyle = '#111111';
          ctx.fillText(lines[i], leftX, lineY);
        }
      }

      // 7. Right side (STAMP, POSTMARK, TO ADDRESS)
      const stampBoxSize = 126;
      const stampBoxX = W - 180;
      const stampBoxY = 52;

      // Stamp dashed slot
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(stampBoxX, stampBoxY, stampBoxSize, stampBoxSize);
      ctx.restore();

      // Postmark mark (Jakarta + date + wavy cancel lines)
      const postmarkX = stampBoxX - 60;
      const postmarkY = stampBoxY + 63;
      ctx.save();
      ctx.translate(postmarkX, postmarkY);
      ctx.rotate(-11 * Math.PI / 180);

      ctx.strokeStyle = 'rgba(25, 25, 25, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '700 11px "Courier Prime", monospace';
      ctx.fillStyle = 'rgba(25, 25, 25, 0.65)';
      ctx.textAlign = 'center';
      ctx.fillText('JAKARTA', 0, -12);

      const fDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      ctx.font = '700 10px "Courier Prime", monospace';
      ctx.fillText(fDate, 0, 6);

      ctx.font = '9px "Courier Prime", monospace';
      ctx.fillText('★ POST ★', 0, 22);

      // Wavy cancellation lines
      ctx.beginPath();
      for (let wave = -12; wave <= 12; wave += 12) {
        ctx.moveTo(50, wave);
        for (let wx = 50; wx <= 135; wx += 20) {
          ctx.quadraticCurveTo(wx + 5, wave - 6, wx + 10, wave);
          ctx.quadraticCurveTo(wx + 15, wave + 6, wx + 20, wave);
        }
      }
      ctx.strokeStyle = 'rgba(25, 25, 25, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Recipient section
      const rightX = divX + 44;
      const rightW = W - rightX - 55;
      const toStartY = 330;

      ctx.textAlign = 'left';
      ctx.font = '700 12.5px "Courier Prime", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('FROM', rightX, toStartY);

      ctx.font = '700 20px "Courier Prime", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText(data.toName || 'Sender', rightX, toStartY + 30);

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rightX, toStartY + 40);
      ctx.lineTo(rightX + rightW, toStartY + 40);
      ctx.stroke();

      ctx.font = '700 12.5px "Courier Prime", monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText('EMAIL ADDRESS', rightX, toStartY + 85);

      ctx.font = '400 17.5px "Courier Prime", monospace';
      ctx.fillStyle = '#111111';
      ctx.fillText(data.toEmail || 'email@example.com', rightX, toStartY + 115);

      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(rightX, toStartY + 125);
      ctx.lineTo(rightX + rightW, toStartY + 125);
      ctx.stroke();

      // Authentic address lines below
      for (let l = 0; l < 3; l++) {
        const extraY = toStartY + 175 + l * 40;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rightX, extraY);
        ctx.lineTo(rightX + rightW, extraY);
        ctx.stroke();
      }

      ctx.font = '700 11px "Courier Prime", monospace';
      ctx.fillStyle = '#777777';
      ctx.fillText('PAR AVION · VIA AIR MAIL · NO. 2026-WH', rightX, H - 52);

      // 8. Draw the chosen Rubber Stamp SVG onto canvas
      const chosenInk = inks[state.ink].value;
      const rawSvg = designs[state.design].svg(getStampText(), 'canvas');
      let cleanSvg = rawSvg
        .replace(/stroke="currentColor"/g, `stroke="${chosenInk}"`)
        .replace(/fill="currentColor"/g, `fill="${chosenInk}"`)
        .replace(/currentColor/g, chosenInk);

      if (!cleanSvg.includes('width=')) {
        cleanSvg = cleanSvg.replace('<svg', '<svg width="120" height="120"');
      }

      const svgBlob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.save();
        ctx.translate(stampBoxX + stampBoxSize / 2, stampBoxY + stampBoxSize / 2);
        ctx.rotate(5.5 * Math.PI / 180);
        ctx.drawImage(img, -stampBoxSize / 2 + 6, -stampBoxSize / 2 + 6, stampBoxSize - 12, stampBoxSize - 12);
        ctx.restore();
        URL.revokeObjectURL(blobUrl);
        onDone(canvas);
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        onDone(canvas);
      };

      img.src = blobUrl;
    }

    function openEmailApp(data) {
      const subject = `A letter for you from ${data.from} ✉`;
      const body =
        `Hi ${data.toName},\n\n` +
        `I wrote you an interactive postcard letter!\n` +
        `I have exported it as an image for you.\n\n` +
        `-----------------------------------------\n` +
        `"${data.message}"\n` +
        `— ${data.from}\n` +
        `-----------------------------------------\n\n` +
        `[Tip: You can paste (Cmd+V / Ctrl+V) the postcard image directly here if copied from clipboard!]\n\n` +
        `Sent via Winston Hansel's Studio`;

      window.location.href =
        `mailto:${encodeURIComponent(data.toEmail)}` +
        `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    // Modal action: Copy image to clipboard
    if (btnCopy) {
      btnCopy.addEventListener('click', async () => {
        if (!currentBlob) return;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': currentBlob })
            ]);
            btnCopy.classList.add('is-copied');
            copyBtnText.textContent = '✓ Copied to Clipboard! (Paste in Email)';
            setTimeout(() => {
              btnCopy.classList.remove('is-copied');
              copyBtnText.textContent = 'Copy Image to Clipboard';
            }, 3500);
          } else {
            alert('Clipboard image copy is not supported in this browser. Please use "Download PNG" instead.');
          }
        } catch (err) {
          console.warn('Clipboard copy error:', err);
          alert('Could not copy to clipboard directly. Please use "Download PNG" and attach it to your email.');
        }
      });
    }

    // Modal action: Download PNG
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        if (!currentDataUrl || !currentLetterData) return;
        const safeName = (currentLetterData.toName || 'letter').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const link = document.createElement('a');
        link.download = `postcard-${safeName}.png`;
        link.href = currentDataUrl;
        link.click();
      });
    }

    // Modal action: Open Email app
    if (btnOpenMail) {
      btnOpenMail.addEventListener('click', () => {
        if (currentLetterData) {
          openEmailApp(currentLetterData);
        }
      });
    }

    // Modal close
    if (modalClose && modal) {
      modalClose.addEventListener('click', () => modal.close());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.close();
      });
    }

    let isAnimatingSend = false;

    // -------------------------------------------------------------------------
    // 3D ORIGAMI FOLD & PAPER AIRPLANE GLIDE LAUNCH ANIMATION
    // Folds the user's actual rendered postcard into a 3D paper airplane,
    // banks back in anticipation, and glides across the screen with shredded
    // paper trail particles & wind streaks before opening the export modal.
    // -------------------------------------------------------------------------
    function playPaperAirplaneFoldAndLaunch(cardEl, postcardDataUrl, onComplete) {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        onComplete();
        return;
      }

      const rect = cardEl.getBoundingClientRect();
      const stage = document.createElement('div');
      stage.className = 'letter-fold-stage';

      const rig = document.createElement('div');
      rig.className = 'letter-fold-rig';
      rig.style.width = `${rect.width}px`;
      rig.style.height = `${rect.height}px`;
      rig.style.left = `${rect.left}px`;
      rig.style.top = `${rect.top}px`;

      const safeBg = `url("${postcardDataUrl}")`;

      rig.innerHTML = `
        <div class="letter-origami-sheet">
          <div class="letter-origami-panel panel-left"></div>
          <div class="letter-origami-panel panel-center"></div>
          <div class="letter-origami-panel panel-right"></div>
        </div>
        <div class="letter-airplane-craft">
          <div class="letter-airplane-facet keel-left"></div>
          <div class="letter-airplane-facet keel-right"></div>
          <div class="letter-airplane-facet wing-left"></div>
          <div class="letter-airplane-facet wing-right"></div>
          <svg class="letter-airplane-lines" viewBox="0 0 280 210" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Outer wing edges & origami center valley crease lines -->
            <polygon points="280,17 11,55 112,118" stroke="#181818" stroke-width="2.2" stroke-linejoin="round" fill="rgba(255,255,255,0.06)"/>
            <polygon points="280,17 134,134 202,202" stroke="#181818" stroke-width="2.2" stroke-linejoin="round" fill="rgba(0,0,0,0.03)"/>
            <polygon points="280,17 112,118 123,151" stroke="#181818" stroke-width="1.8" stroke-linejoin="round" fill="rgba(0,0,0,0.14)"/>
            <polygon points="280,17 123,151 134,134" stroke="#181818" stroke-width="1.8" stroke-linejoin="round" fill="rgba(0,0,0,0.08)"/>
            <!-- Dashed air-mail fold guideline along wings -->
            <line x1="258" y1="26" x2="48" y2="68" stroke="rgba(20,20,20,0.45)" stroke-width="1.2" stroke-dasharray="5 4"/>
            <line x1="258" y1="30" x2="178" y2="174" stroke="rgba(20,20,20,0.45)" stroke-width="1.2" stroke-dasharray="5 4"/>
          </svg>
        </div>
      `;

      // Apply the live user-written postcard texture to every origami fold & airplane wing
      rig.querySelectorAll('.letter-origami-panel, .letter-airplane-facet').forEach((el) => {
        el.style.backgroundImage = safeBg;
      });

      stage.appendChild(rig);
      document.body.appendChild(stage);

      // Hide original card while its 3D origami double folds in place
      cardEl.classList.remove('is-returning');
      cardEl.classList.add('is-folding-hidden');

      // Play synchronized origami paper crease + aerodynamic whoosh sound
      if (typeof SoundFX.paperFoldAndFly === 'function') {
        SoundFX.paperFoldAndFly();
      }

      // Helper to spawn a wind slipstream line behind the gliding plane
      function spawnWindStreak(x, y, angleDeg) {
        const streak = document.createElement('div');
        streak.className = 'letter-wind-streak';
        const len = 70 + Math.random() * 85;
        streak.style.width = `${len}px`;
        streak.style.left = `${x - 20 + (Math.random() - 0.5) * 40}px`;
        streak.style.top = `${y + (Math.random() - 0.5) * 44}px`;
        streak.style.setProperty('--streak-angle', `${angleDeg}deg`);
        stage.appendChild(streak);
        setTimeout(() => streak.remove(), 560);
      }

      // Phase 1 (t = 30ms): Left & right postcard wings crease inward along 3D origami seams
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          rig.classList.add('phase-crease');
        });
      });

      // Phase 2 (t = 480ms): Sheet locks into the 3D sculpted Paper Airplane & pulls back slightly
      setTimeout(() => {
        rig.classList.add('phase-plane');
      }, 480);

      // Phase 3 (t = 650ms -> 1520ms): Smooth curved aerodynamic flight path across the screen
      const flightDelay = 650;
      const flightDuration = 880;

      setTimeout(() => {
        rig.classList.add('phase-fly');
        const startTime = performance.now();

        // Start center coordinates of the rig
        const startX = 0;
        const startY = 0;

        // Control & end points (sweeping pull-back, dip, then soaring glide up-right off viewport)
        const endX = Math.max(window.innerWidth - rect.left + 260, 780);
        const endY = -Math.max(rect.top + 280, 520);

        let lastTrailTime = 0;

        function stepFlight(now) {
          const rawT = Math.min(1, (now - startTime) / flightDuration);

          let tx = startX;
          let ty = startY;
          let rotZ = 0;
          let rotX = 0;
          let rotY = 0;
          let scale = 1;

          if (rawT < 0.22) {
            // Anticipation wind-up: plane banks back-left & pitches nose up ready to launch
            const p = rawT / 0.22;
            const easeOut = 1 - Math.pow(1 - p, 2);
            tx = -34 * easeOut;
            ty = 22 * easeOut;
            rotZ = -14 * easeOut;
            rotX = 18 * easeOut;
            rotY = -12 * easeOut;
            scale = 1 + 0.05 * easeOut;
          } else {
            // Launch & soaring curved cubic-bezier glide toward top-right sky
            const p = (rawT - 0.22) / 0.78;
            // Custom acceleration curve: snappy launch, graceful high-speed soar
            const easeFly = p < 0.3
              ? 2.2 * p * p
              : 1 - Math.pow(1 - p, 2.6) * 0.85;

            // Curved trajectory with a gentle aerodynamic swoop
            const swoop = Math.sin(p * Math.PI) * 75;
            tx = -34 + (endX + 34) * easeFly;
            ty = 22 + (endY - 22) * Math.pow(easeFly, 1.12) + swoop;

            // Dynamic pitch & banking along the curve tangent
            rotZ = -14 - 16 * Math.sin(p * Math.PI * 0.85);
            rotX = 18 - 28 * p;
            rotY = -12 + 26 * p;
            scale = Math.max(0.42, 1.05 - p * 0.58);

            // Emit shredded paper trail & wind slipstreams from the tail during flight
            if (now - lastTrailTime > 28 && p < 0.88) {
              lastTrailTime = now;
              const planeCenterX = rect.left + rect.width * 0.5 + tx;
              const planeCenterY = rect.top + rect.height * 0.5 + ty;
              const flightRad = (-28 * Math.PI) / 180;

              if (typeof window.__spawnMailPlaneScrap === 'function') {
                for (let s = 0; s < 3; s++) {
                  window.__spawnMailPlaneScrap(planeCenterX - 35, planeCenterY + 22, flightRad, 16);
                }
              }
              if (Math.random() < 0.65) {
                spawnWindStreak(planeCenterX - 30, planeCenterY + 18, -26 + (Math.random() - 0.5) * 10);
              }
            }
          }

          rig.style.transform =
            `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) ` +
            `rotateZ(${rotZ.toFixed(2)}deg) ` +
            `rotateX(${rotX.toFixed(2)}deg) ` +
            `rotateY(${rotY.toFixed(2)}deg) ` +
            `scale(${scale.toFixed(3)})`;

          if (rawT < 1) {
            requestAnimationFrame(stepFlight);
          } else {
            // Cleanup stage, restore card smoothly, and open the exported postcard modal
            stage.remove();
            cardEl.classList.remove('is-folding-hidden');
            cardEl.classList.add('is-returning');
            setTimeout(() => cardEl.classList.remove('is-returning'), 700);
            onComplete();
          }
        }

        requestAnimationFrame(stepFlight);
      }, flightDelay);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isAnimatingSend) return;
      if (!form.reportValidity()) return;

      isAnimatingSend = true;

      const data = {
        from: document.getElementById('letterFrom').value.trim(),
        toName: document.getElementById('letterToName').value.trim(),
        toEmail: document.getElementById('letterToEmail').value.trim(),
        message: message.value.trim()
      };

      currentLetterData = data;
      const sendBtn = document.getElementById('letterSendBtn');
      const origText = sendBtn ? sendBtn.textContent : 'SEND LETTER →';
      if (sendBtn) sendBtn.textContent = 'FOLDING & SENDING...';
      if (status) status.textContent = '✈ Folding your letter into a paper airplane...';

      // Ensure fonts are ready before canvas drawing for sharp text
      document.fonts.ready.then(() => {
        renderPostcardToCanvas(data, (canvas) => {
          currentCanvas = canvas;
          currentDataUrl = canvas.toDataURL('image/png');

          canvas.toBlob((blob) => {
            currentBlob = blob;

            // Try automatic copy to clipboard so it's already in user's paste buffer!
            if (navigator.clipboard && window.ClipboardItem && blob) {
              navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]).then(() => {
                if (btnCopy) {
                  btnCopy.classList.add('is-copied');
                  if (copyBtnText) copyBtnText.textContent = '✓ Copied to Clipboard! (Paste in Email)';
                }
              }).catch(() => {});
            }

            if (exportImg) {
              exportImg.src = currentDataUrl;
            }

            // Launch the 3D origami folding -> paper airplane gliding animation!
            playPaperAirplaneFoldAndLaunch(form, currentDataUrl, () => {
              isAnimatingSend = false;
              if (sendBtn) sendBtn.textContent = origText;
              if (status) status.textContent = `✓ Sent & exported as image for ${data.toEmail}`;

              if (modal && typeof modal.showModal === 'function') {
                modal.showModal();
              }
            });
          }, 'image/png');
        });
      });
    });

    renderInks();
    renderPicker();
    renderSlot();
  }

  // ---------------------------------------------------------------------------
  // WORK DETAILS — SLIDEABLE HORIZONTAL CAROUSELS
  // Supports Prev/Next navigation buttons, mouse/touch drag-to-scroll,
  // keyboard arrows, slide counter (01 / 06), and live progress bar.
  // ---------------------------------------------------------------------------
  function initWorkDetailCarousels() {
    const blocks = Array.from(document.querySelectorAll('.wd-project-block'));
    if (!blocks.length) return;

    blocks.forEach((block) => {
      const track = block.querySelector('.wd-carousel-track');
      const slides = Array.from(block.querySelectorAll('.wd-slide'));
      const prevBtn = block.querySelector('.wd-prev-btn');
      const nextBtn = block.querySelector('.wd-next-btn');
      const counterEl = block.querySelector('.wd-slide-counter');
      const progressFill = block.querySelector('.wd-progress-fill');

      if (!track || !slides.length) return;

      const totalSlides = slides.length;
      const pad2 = (n) => String(n).padStart(2, '0');

      function updateCarouselUI() {
        const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
        const scrollLeft = Math.max(0, track.scrollLeft);

        // Determine current active slide index based on scroll position
        let activeIdx = 0;
        if (maxScroll > 0 && scrollLeft >= maxScroll - 8) {
          activeIdx = totalSlides - 1;
        } else {
          let minDiff = Infinity;
          slides.forEach((slide, idx) => {
            const diff = Math.abs(slide.offsetLeft - scrollLeft);
            if (diff < minDiff) {
              minDiff = diff;
              activeIdx = idx;
            }
          });
        }

        if (counterEl) {
          counterEl.textContent = `${pad2(activeIdx + 1)} / ${pad2(totalSlides)}`;
        }

        if (progressFill) {
          if (maxScroll <= 2) {
            progressFill.style.width = '100%';
          } else {
            const ratio = Math.min(1, Math.max(0, scrollLeft / maxScroll));
            const minPct = 100 / totalSlides;
            const pct = minPct + ratio * (100 - minPct);
            progressFill.style.width = `${pct.toFixed(1)}%`;
          }
        }

        if (prevBtn) {
          prevBtn.disabled = scrollLeft <= 4;
        }
        if (nextBtn) {
          nextBtn.disabled = maxScroll > 0 && scrollLeft >= maxScroll - 4;
        }
      }

      function scrollBySlide(direction) {
        SoundFX.paperFlip();
        const gap = 16;
        const firstSlideWidth = slides[0] ? slides[0].offsetWidth : 340;
        const step = firstSlideWidth + gap;
        track.scrollBy({
          left: direction * step,
          behavior: 'smooth'
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', () => scrollBySlide(-1));
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => scrollBySlide(1));
      }

      // Keyboard navigation when track is focused
      track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          scrollBySlide(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          scrollBySlide(1);
        }
      });

      // Pointer drag-to-scroll on desktop mouse
      let isDown = false;
      let startX = 0;
      let startScrollLeft = 0;

      track.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') return; // native touch scroll handles mobile smoothly
        if (e.button !== 0) return;
        isDown = true;
        startX = e.clientX;
        startScrollLeft = track.scrollLeft;
        track.classList.add('is-dragging');
        if (track.setPointerCapture) {
          try {
            track.setPointerCapture(e.pointerId);
          } catch (_) {}
        }
      });

      track.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        track.scrollLeft = startScrollLeft - dx;
      });

      function endDrag(e) {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('is-dragging');
        if (track.releasePointerCapture && e && e.pointerId !== undefined) {
          try {
            track.releasePointerCapture(e.pointerId);
          } catch (_) {}
        }
      }

      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);

      track.addEventListener('scroll', updateCarouselUI, { passive: true });
      window.addEventListener('resize', updateCarouselUI);

      // Update once images load so scrollWidth is accurate
      slides.forEach((slide) => {
        const img = slide.querySelector('img');
        if (img && !img.complete) {
          img.addEventListener('load', updateCarouselUI, { once: true });
        }
      });

      updateCarouselUI();
    });
  }

  // ---------------------------------------------------------------------------
  // CONTACT NAME CARD — CLICK TO FLIP
  // Flips between contact details and "CONTACT ME." back face
  // ---------------------------------------------------------------------------
  function initContactNamecard() {
    const namecard = document.getElementById('contactNamecard');
    if (!namecard) return;

    namecard.addEventListener('click', (e) => {
      // Allow clicking directly on Phone, WhatsApp, Email, or Instagram links without flipping
      if (e.target.closest('a')) return;
      SoundFX.paperFlip();
      namecard.classList.toggle('is-flipped');
    });

    namecard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a')) return;
        e.preventDefault();
        SoundFX.paperFlip();
        namecard.classList.toggle('is-flipped');
      }
    });
  }

  // Global tactile paper click sound for buttons, links, and interactive controls
  function initGlobalPaperSounds() {
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      // Skip elements that already play dedicated stamp / erase / flip sounds
      if (
        target.closest('#kalkirSheet') && !target.closest('.cv-btn') ||
        target.closest('.stamp-option') ||
        target.closest('.ink-swatch') ||
        target.closest('#resetScatterBtn') ||
        target.closest('.wd-prev-btn') ||
        target.closest('.wd-next-btn')
      ) {
        return;
      }

      const clickable = target.closest('a, button, [role="button"], .software-item');
      if (clickable) {
        SoundFX.paperClick();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // EXPERIENCE SNAKING TIMELINE GRID (7 ITEMS + SVG PATH + SCROLL DOMINANCE)
  // Traces the continuous snaking timeline line across and down the 3x3 grid,
  // moves the indicator dot along the path on scroll, and highlights 1 dominant
  // experience at a time while fading inactive ones to low opacity.
  // ---------------------------------------------------------------------------
  function initExperienceTimeline() {
    const stage = document.getElementById('expTimelineStage');
    const svg = document.getElementById('expTimelineSvg');
    const pathBg = document.getElementById('expTimelinePathBg');
    const pathFill = document.getElementById('expTimelinePathFill');
    const dot = document.getElementById('expTimelineDot');
    const dotPulse = document.getElementById('expTimelineDotPulse');
    const indicatorLabel = document.getElementById('expActiveIndicatorLabel');
    const items = Array.from(document.querySelectorAll('.exp-timeline-item'));

    if (!stage || !svg || !pathBg || !pathFill || !dot || !items.length) return;

    let totalLen = 0;
    let waypoints = [];
    let currentDist = 0;
    let targetDist = 0;
    let activeIdx = 0;
    let manualOverrideUntil = 0;

    function buildSnakingPath() {
      const stageW = stage.offsetWidth;
      const stageH = stage.offsetHeight;
      if (stageW <= 0 || stageH <= 0) return;

      svg.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);

      const isMobile = window.innerWidth <= 640;
      const isTablet = window.innerWidth > 640 && window.innerWidth <= 960;

      // Helper: item box relative to stage
      const boxOf = (el) => {
        const sr = stage.getBoundingClientRect();
        const er = el.getBoundingClientRect();
        return {
          left: er.left - sr.left,
          right: er.right - sr.left,
          top: er.top - sr.top,
          bottom: er.bottom - sr.top,
          midX: er.left - sr.left + er.width * 0.5,
          midY: er.top - sr.top + er.height * 0.5
        };
      };

      const boxes = items.map(boxOf);

      if (isMobile || isTablet) {
        // Vertical left-rail timeline on mobile/tablet
        const xRail = 8;
        const yStart = Math.max(8, boxes[0].top);
        const yEnd = Math.min(stageH - 8, boxes[boxes.length - 1].bottom);
        const d = `M ${xRail} ${yStart} L ${xRail} ${yEnd}`;
        pathBg.setAttribute('d', d);
        pathFill.setAttribute('d', d);
        totalLen = pathBg.getTotalLength();
        waypoints = boxes.map((b, idx) => {
          const ratio = boxes.length > 1 ? idx / (boxes.length - 1) : 0;
          return ratio * totalLen;
        });
      } else {
        // Desktop 3-column × 2-row snaking path (6 items total):
        // Row 1 (Left -> Right): items[0] (col 1), items[1] (col 2), items[2] (col 3)
        // Row 2 (Right -> Left): items[3] (col 3), items[4] (col 2), items[5] (col 1)
        const b0 = boxes[0];
        const b1 = boxes[1] || b0;
        const b2 = boxes[2] || b1;
        const b3 = boxes[3] || b2;
        const b4 = boxes[4] || b3;
        const b5 = boxes[5] || b4;

        const xStart = Math.round(b0.left);
        const xRight = Math.round(stageW - 6);
        const xLeftEnd = Math.round(b5.left);

        const yTop = 10;
        const yMid12 = Math.round((Math.max(b0.bottom, b1.bottom, b2.bottom) + Math.min(b3.top, b4.top, b5.top)) * 0.5);

        // Segment vertices of the 2-row snaking path (no extra line below Row 2):
        // P0(xStart, yTop) -> P1(xRight, yTop) -> P2(xRight, yMid12) -> P3(xLeftEnd, yMid12)
        const pts = [
          { x: xStart,   y: yTop },
          { x: xRight,   y: yTop },
          { x: xRight,   y: yMid12 },
          { x: xLeftEnd, y: yMid12 }
        ];

        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        pathBg.setAttribute('d', d);
        pathFill.setAttribute('d', d);

        // Cumulative distance at each vertex P0..P3
        const cumDist = [0];
        for (let i = 1; i < pts.length; i++) {
          const segLen = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          cumDist.push(cumDist[i - 1] + segLen);
        }
        totalLen = pathBg.getTotalLength() || cumDist[cumDist.length - 1];

        // Map each of the 6 experiences to its exact milestone distance along the 2-row snaking line:
        // Row 1 (Left -> Right): 01 (col 1) -> 02 (col 2) -> 03 (col 3)
        const d0 = 0;
        const d1 = cumDist[0] + Math.max(0, b1.left - xStart);
        const d2 = cumDist[0] + Math.max(0, b2.left - xStart);
        // Row 2 (Right -> Left): 04 (col 3) -> 05 (col 2) -> 06 (col 1, end of Row 2 line)
        const d3 = cumDist[2] + Math.max(0, xRight - b3.midX);
        const d4 = cumDist[2] + Math.max(0, xRight - b4.midX);
        const d5 = totalLen;

        waypoints = [d0, d1, d2, d3, d4, d5];
      }

      pathFill.style.strokeDasharray = `${totalLen} ${totalLen}`;
      targetDist = waypoints[activeIdx] !== undefined ? waypoints[activeIdx] : 0;
      renderDotAtDistance(targetDist);
    }

    function renderDotAtDistance(dist) {
      if (totalLen <= 0) return;
      const clamped = Math.max(0, Math.min(totalLen, dist));
      const pt = pathBg.getPointAtLength(clamped);
      dot.setAttribute('cx', pt.x.toFixed(1));
      dot.setAttribute('cy', pt.y.toFixed(1));
      if (dotPulse) {
        dotPulse.setAttribute('cx', pt.x.toFixed(1));
        dotPulse.setAttribute('cy', pt.y.toFixed(1));
      }
      pathFill.style.strokeDashoffset = `${Math.max(0, totalLen - clamped).toFixed(1)}`;
    }

    function setActiveExperience(idx, continuousDist) {
      const clampedIdx = Math.max(0, Math.min(items.length - 1, idx));
      if (clampedIdx !== activeIdx) {
        activeIdx = clampedIdx;
        items.forEach((item, i) => {
          item.classList.toggle('is-active', i === activeIdx);
        });
        if (indicatorLabel) {
          const numStr = String(activeIdx + 1).padStart(2, '0');
          indicatorLabel.textContent = `[ ${numStr} / 07 — 2024 — 2026 ]`;
        }
      }
      if (typeof continuousDist === 'number') {
        targetDist = continuousDist;
      } else if (waypoints[activeIdx] !== undefined) {
        targetDist = waypoints[activeIdx];
      }
    }

    function onScrollUpdate() {
      if (Date.now() < manualOverrideUntil) return;
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;

      // Map scroll progress as the Experience stage travels through the viewport
      // Starts when top of stage enters 68% of viewport, ends when bottom reaches 42% of viewport
      const startY = vh * 0.68;
      const endY = vh * 0.42;
      const totalScrollSpan = Math.max(1, (rect.height + startY - endY));
      const scrolled = startY - rect.top;
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollSpan));

      // Map rawProgress [0, 1] across the 7 experiences [0..6]
      const floatIdx = rawProgress * (items.length - 1);
      const nearestIdx = Math.round(floatIdx);

      // Interpolate distance smoothly between waypoints
      const lowIdx = Math.floor(floatIdx);
      const highIdx = Math.min(items.length - 1, lowIdx + 1);
      const frac = floatIdx - lowIdx;
      const wLow = waypoints[lowIdx] || 0;
      const wHigh = waypoints[highIdx] !== undefined ? waypoints[highIdx] : wLow;
      const interpDist = wLow + (wHigh - wLow) * frac;

      setActiveExperience(nearestIdx, interpDist);
    }

    // Smooth animation loop for indicator dot gliding along the snaking line
    function animateTimeline() {
      currentDist += (targetDist - currentDist) * 0.16;
      if (Math.abs(targetDist - currentDist) < 0.25) {
        currentDist = targetDist;
      }
      renderDotAtDistance(currentDist);
      requestAnimationFrame(animateTimeline);
    }

    // Clicking any Experience item activates it and glides the indicator to its waypoint
    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        manualOverrideUntil = Date.now() + 1800;
        SoundFX.paperClick();
        setActiveExperience(idx, waypoints[idx]);
      });
    });

    buildSnakingPath();
    onScrollUpdate();
    requestAnimationFrame(animateTimeline);

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    window.addEventListener('resize', () => {
      buildSnakingPath();
      onScrollUpdate();
    });
  }

  // ---------------------------------------------------------------------------
  // FLOWY DIRECTIONAL PAPER AIRPLANE CURSOR & SHREDDED PAPER TRAIL
  // Smoothly banks and rotates the paper airplane toward the cursor movement
  // vector while leaving a fluttering trail of torn/shredded paper scraps.
  // Automatically yields to the Stamp cursor when hovering over #kalkirSheet.
  // ---------------------------------------------------------------------------
  function initFlowyPaperPlaneCursor() {
    // Only activate on fine pointer devices (mouse / trackpad)
    if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    // Create full-viewport canvas for shredded paper trail
    const canvas = document.createElement('canvas');
    canvas.className = 'paper-trail-canvas';
    canvas.id = 'paperTrailCanvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Create directional paper airplane element
    const planeEl = document.createElement('div');
    planeEl.className = 'flowy-plane-cursor';
    planeEl.id = 'flowyPlaneCursor';
    planeEl.setAttribute('aria-hidden', 'true');
    planeEl.innerHTML = '<img src="assets/image/kursor-2x.png" alt="" draggable="false">';
    document.body.appendChild(planeEl);

    document.documentElement.classList.add('has-flowy-cursor');

    // Keep the paper airplane cursor & trail visible on top of Top-Layer <dialog> modals
    // by moving them inside whichever <dialog> is currently open, and returning them to body on close.
    function syncCursorHostLayer() {
      const openDialog = document.querySelector('dialog[open]');
      const host = openDialog || document.body;
      if (canvas.parentNode !== host) {
        host.appendChild(canvas);
      }
      if (planeEl.parentNode !== host) {
        host.appendChild(planeEl);
      }
    }

    const dialogs = Array.from(document.querySelectorAll('dialog'));
    if (dialogs.length && typeof MutationObserver === 'function') {
      const dialogObserver = new MutationObserver(syncCursorHostLayer);
      dialogs.forEach((dlg) => {
        dialogObserver.observe(dlg, { attributes: true, attributeFilter: ['open'] });
        dlg.addEventListener('close', syncCursorHostLayer);
      });
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // In kursor-2x.png, the nose is at (2px, 2px) top-left, pointing at -152.5 deg
    const BASE_NOSE_ANGLE_DEG = -152.5;

    let mouseX = vw * 0.5;
    let mouseY = vh * 0.5;
    let planeX = mouseX;
    let planeY = mouseY;
    let prevPlaneX = planeX;
    let prevPlaneY = planeY;

    // Angle in radians (default pointing top-left like the original image)
    let currentAngle = (BASE_NOSE_ANGLE_DEG * Math.PI) / 180;
    let targetAngle = currentAngle;
    let currentBankScale = 1;
    let hasMovedOnce = false;
    let overStampZone = false;
    let isPressed = false;
    let spawnAccumulator = 0;

    // Shredded paper scrap particles
    const scraps = [];
    const MAX_SCRAPS = 95;
    const scrapPalette = [
      '#ffffff',
      '#f7f6f2',
      '#eceae4',
      '#dedcd6',
      '#c8c6c0'
    ];

    // Pre-generate irregular torn-paper polygon templates (4 to 6 vertices)
    function createTornPolygon(w, h) {
      const hw = w * 0.5;
      const hh = h * 0.5;
      const j = () => (Math.random() - 0.5) * 0.42;
      return [
        { x: -hw * (1 + j()), y: -hh * (1 + j()) },
        { x:  0,              y: -hh * (1 + j() * 0.8) },
        { x:  hw * (1 + j()), y: -hh * (0.85 + j()) },
        { x:  hw * (0.9 + j()), y: hh * (1 + j()) },
        { x: -hw * (0.2 + j()), y: hh * (0.95 + j()) },
        { x: -hw * (1 + j()), y:  hh * (0.7 + j()) }
      ];
    }

    function spawnShreddedScrap(x, y, flightAngle, speed) {
      if (scraps.length >= MAX_SCRAPS) {
        scraps.shift();
      }

      // Elongated or irregular torn paper shred dimensions
      const isStrip = Math.random() < 0.65;
      const w = isStrip ? (7 + Math.random() * 7) : (5 + Math.random() * 5);
      const h = isStrip ? (2.6 + Math.random() * 2.5) : (4.2 + Math.random() * 4);

      // Eject slightly backward from the paper airplane's tail with lateral flutter spread
      const spreadAngle = flightAngle + Math.PI + (Math.random() - 0.5) * 1.15;
      const ejectSpeed = Math.min(3.2, 0.4 + speed * 0.14) * (0.6 + Math.random() * 0.7);

      scraps.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(spreadAngle) * ejectSpeed,
        vy: Math.sin(spreadAngle) * ejectSpeed - 0.25,
        gravity: 0.035 + Math.random() * 0.03,
        drag: 0.94,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.14,
        tumblePhase: Math.random() * Math.PI * 2,
        tumbleSpeed: 0.09 + Math.random() * 0.11,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.07 + Math.random() * 0.06,
        swayAmp: 0.28 + Math.random() * 0.35,
        color: scrapPalette[Math.floor(Math.random() * scrapPalette.length)],
        poly: createTornPolygon(w, h),
        life: 1.0,
        decay: 0.015 + Math.random() * 0.012
      });
    }

    // Expose shredded paper trail spawner so the Mail 3D Paper Airplane launch can emit scraps too
    window.__spawnMailPlaneScrap = spawnShreddedScrap;

    // Shortest signed angle difference in radians (-PI to +PI)
    function angleDiff(from, to) {
      let d = (to - from) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return d;
    }

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMovedOnce) {
        hasMovedOnce = true;
        planeX = mouseX;
        planeY = mouseY;
        prevPlaneX = mouseX;
        prevPlaneY = mouseY;
        planeEl.classList.add('is-active');
      }

      // Check if hovering over the Biography kertas kalkir stamp area
      const target = e.target;
      if (target && typeof target.closest === 'function') {
        const inKalkir = Boolean(target.closest('#kalkirSheet'));
        const onEraser = Boolean(target.closest('#stampEraserBtn'));
        overStampZone = inKalkir && !onEraser;
      } else {
        overStampZone = false;
      }
      planeEl.classList.toggle('is-hidden-for-stamp', overStampZone);
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      isPressed = true;
      // Burst of 4 tiny paper scraps on click (outside stamp zone)
      if (hasMovedOnce && !overStampZone) {
        const tailDist = 36;
        const tailX = planeX - Math.cos(currentAngle) * tailDist;
        const tailY = planeY - Math.sin(currentAngle) * tailDist;
        for (let i = 0; i < 4; i++) {
          spawnShreddedScrap(tailX, tailY, currentAngle, 8);
        }
      }
    }, { passive: true });

    window.addEventListener('pointerup', () => {
      isPressed = false;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      planeEl.classList.remove('is-active');
    });

    document.addEventListener('mouseenter', () => {
      if (hasMovedOnce) {
        planeEl.classList.add('is-active');
      }
    });

    function animatePlaneAndTrail() {
      // 1. Smooth flowy position pursuit
      planeX += (mouseX - planeX) * 0.34;
      planeY += (mouseY - planeY) * 0.34;

      const vx = planeX - prevPlaneX;
      const vy = planeY - prevPlaneY;
      const speed = Math.hypot(vx, vy);

      // 2. Update target heading angle when moving above a tiny threshold
      if (speed > 0.65) {
        targetAngle = Math.atan2(vy, vx);
      }

      const dAngle = angleDiff(currentAngle, targetAngle);
      // Responsive angular lerp so the plane banks smoothly into turns
      currentAngle += dAngle * 0.22;

      // Subtle aerodynamic banking squeeze when making sharp turns
      const turnIntensity = Math.min(1, Math.abs(dAngle) / 1.2);
      const targetBank = (isPressed ? 0.9 : 1.0) - turnIntensity * 0.12;
      currentBankScale += (targetBank - currentBankScale) * 0.2;

      // Convert heading angle to CSS rotation relative to kursor-2x.png's -152.5 deg nose
      const headingDeg = (currentAngle * 180) / Math.PI;
      const cssRotDeg = headingDeg - BASE_NOSE_ANGLE_DEG;

      // Position plane so its nose (2px, 2px) sits right at (planeX, planeY)
      planeEl.style.transform =
        `translate3d(${(planeX - 2).toFixed(1)}px, ${(planeY - 2).toFixed(1)}px, 0) ` +
        `rotate(${cssRotDeg.toFixed(2)}deg) ` +
        `scale(${currentBankScale.toFixed(3)})`;

      // 3. Spawn shredded paper trail behind the airplane's tail
      if (hasMovedOnce && !overStampZone && speed > 1.4) {
        spawnAccumulator += speed;
        // Spawn a shredded paper scrap every ~13px of flight distance
        while (spawnAccumulator >= 13) {
          spawnAccumulator -= 13;
          const tailDist = 36;
          const tailX = planeX - Math.cos(currentAngle) * tailDist;
          const tailY = planeY - Math.sin(currentAngle) * tailDist;
          spawnShreddedScrap(tailX, tailY, currentAngle, speed);
        }
      }

      prevPlaneX = planeX;
      prevPlaneY = planeY;

      // 4. Render & update shredded paper scraps on canvas
      ctx.clearRect(0, 0, vw, vh);

      for (let i = scraps.length - 1; i >= 0; i--) {
        const s = scraps[i];
        s.life -= s.decay;
        if (s.life <= 0) {
          scraps.splice(i, 1);
          continue;
        }

        s.tumblePhase += s.tumbleSpeed;
        s.swayPhase += s.swaySpeed;

        // Fluttering paper aerodynamics
        s.vx = s.vx * s.drag + Math.sin(s.swayPhase) * s.swayAmp * 0.15;
        s.vy = s.vy * s.drag + s.gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vRot;

        // 3D paper tumble illusion (flat scrap flipping in air)
        const tumbleScaleY = 0.28 + 0.72 * Math.abs(Math.cos(s.tumblePhase));
        const alpha = Math.min(1, s.life * 1.25) * 0.92;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        ctx.scale(1, tumbleScaleY);

        ctx.beginPath();
        const poly = s.poly;
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let p = 1; p < poly.length; p++) {
          ctx.lineTo(poly[p].x, poly[p].y);
        }
        ctx.closePath();

        ctx.fillStyle = s.color;
        ctx.fill();

        // Crisp dark sketch outline matching the hand-drawn paper airplane style
        ctx.lineWidth = 0.85;
        ctx.strokeStyle = 'rgba(20, 20, 20, 0.55)';
        ctx.stroke();

        ctx.restore();
      }

      requestAnimationFrame(animatePlaneAndTrail);
    }

    requestAnimationFrame(animatePlaneAndTrail);
  }

  // Initial trigger
  window.addEventListener('DOMContentLoaded', () => {
    runEnvelopeLoader();
    initFlowyPaperPlaneCursor();
    initKalkirStamps();
    initExperienceTimeline();
    initProjectScatterCards();
    initWorkDetailCarousels();
    initMailLetter();
    initContactNamecard();
    initGlobalPaperSounds();
    updateScene(0);
    requestAnimationFrame(tick);
  });

  // Handle resize for stroke length precision
  window.addEventListener('resize', () => {
    targetScrollY = window.scrollY;
  });

})();
