/* ─── DEFAULT CONFIGURATION ────────────────── */
const DEFAULT_CONFIG = {
  name: "ABEGAIL BAJAO",
  age: 29,
  ageSuffix: "st",
  birthdayDate: "10-14-2026",
  heroSubtext: "We know this birthday may be difficult, but please remember that you are not alone. From all of us at JEA Steel, we are here for you and your family.! 🌟",
  message: `Every memory we've made together is a treasure I keep close to my heart.
You light up every room you walk into, and the world is genuinely better because you're in it.

On this very special day, I want you to feel every ounce of love and joy that you deserve. Happy Birthday — here's to you, and to all the beautiful things still to come.`,
  messageSig: "-- With all my love 🌹",
  musicTitle: "Hold On, Abegail",
  musicArtist: "Personal Music File",
  theme: "rose",
  wishes: [
    { icon: "🌸", text: "Happy birthday, ma'am Abe. Wishing you good health, happiness, and more blessings in your life. May God grant all your heart's desires. Whatever you're going through right now just know that we your JEA fam are always here praying with you 💖.", author: "— By Johana <3", color: "black" },
    { icon: "🌊", text: "Happy Na Birthday Mo pa !,", author: "— By EdMarang", color: "#4169E1" },
    { icon: "🍀", text: "Happy Birthday, Abegail! 🥹💗 I hope this year brings healing to your heart, strength to your soul, and happiness that stays. You may face difficult days, but I hope you always find a reason to keep believing in better things. May life give you the love and peace you truly deserve.", author: "— By Jackielou", color: "#DC143C" },
    { icon: "✨", text: "Happy Birthday, Abegail! 🎂💖 May your special day bring you happiness, love, and beautiful memories. No matter what life brings, always remember how special and strong you are. You deserve all the good things in life. Keep shining like a star! ✨💕 ", author: "— By Marie ", color: "gold" },
    { icon: "🎯", text: "Happy Birthday, Abegail! 💖 I hope this new chapter of your life brings you genuine happiness, peace, and love. No matter what you’re going through, never forget that you deserve beautiful things and brighter days. Keep smiling and shining! ", author: "— By Roxan", color: "pink" },
    { icon: "🎊", text: "Happy Birthday, Abegail! 🥳💗 May your heart find peace, your days be filled with happiness, and your dreams slowly turn into reality. Always remember that brighter days are ahead. Keep shining! ", author: "— By Ma'am Jane", color: "#4B0082" },
    { icon: "🎊", text: "Happy Birthday, Abegail! 🎉❤️ Wishing you a year full of unexpected blessings, genuine smiles, peaceful days, and unforgettable memories. Whatever happens, never forget your worth and the beautiful person you are. You deserve to be happy, always!  ", author: "— By Honey", color: "#4B0082" },
    { icon: "💌", text: "happy birthday! we wish you all the best, and stay strong!", author: "— By Patrick", color: "black" },
    { icon: "🌷", text: "Happy Birthday Ma'am Abe! 🤍 I know things feel a little heavy right now, but I hope you still find reasons to smile today. Stay strong, and always remember that you’re not alone. Enjoy your special day! 🥰🎂 ", author: "— By Jan Paul", color: "black" }
  ],
  photos: [
  "images/ABE PROFILES.png",
    "images/pic2.jpg",
    "images/pic3.jpg",
    "images/littlequeen.jpg",
    "images/pic5.jpg",
    "images/pic6.jpg",
    "images/pic7.jpg",
    "images/pic77.jpg",
    "images/pic8.jpg"
  ]
};

const CONFIG_SIGNATURE = JSON.stringify({
  name: DEFAULT_CONFIG.name,
  age: DEFAULT_CONFIG.age,
  ageSuffix: DEFAULT_CONFIG.ageSuffix,
  birthdayDate: DEFAULT_CONFIG.birthdayDate,
  heroSubtext: DEFAULT_CONFIG.heroSubtext,
  message: DEFAULT_CONFIG.message,
  messageSig: DEFAULT_CONFIG.messageSig,
  musicTitle: DEFAULT_CONFIG.musicTitle,
  musicArtist: DEFAULT_CONFIG.musicArtist,
  theme: DEFAULT_CONFIG.theme,
  wishes: DEFAULT_CONFIG.wishes,
  photos: DEFAULT_CONFIG.photos
});

// Reset saved config when defaults change, except when migrating the removed
// timeline field so existing gallery, music, and wish customizations survive.
let activeConfig;
try {
  const savedConfig = JSON.parse(localStorage.getItem('bday_config'));
  if (!savedConfig || savedConfig.configSignature !== CONFIG_SIGNATURE) {
    if (savedConfig && Array.isArray(savedConfig.timeline)) {
      activeConfig = savedConfig;
      delete activeConfig.timeline;
    } else {
      activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }
    activeConfig.configSignature = CONFIG_SIGNATURE;
    localStorage.setItem('bday_config', JSON.stringify(activeConfig));
  } else {
    activeConfig = savedConfig;
  }
} catch (err) {
  activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  activeConfig.configSignature = CONFIG_SIGNATURE;
}

// Ensure there is a photos array; don't overwrite existing user photos
if (!activeConfig.photos || !Array.isArray(activeConfig.photos) || activeConfig.photos.length === 0) {
  activeConfig.photos = DEFAULT_CONFIG.photos.slice();
}

// Ensure wishes are populated — merge defaults if saved config has empty or missing entries
if (!activeConfig.wishes || !Array.isArray(activeConfig.wishes) || activeConfig.wishes.length === 0) {
  activeConfig.wishes = DEFAULT_CONFIG.wishes.map(w => Object.assign({}, w));
} else {
  DEFAULT_CONFIG.wishes.forEach((w, i) => {
    if (!activeConfig.wishes[i]) {
      activeConfig.wishes[i] = Object.assign({}, w);
    } else {
      if (!activeConfig.wishes[i].text || activeConfig.wishes[i].text.trim() === "") {
        activeConfig.wishes[i].text = w.text;
      }
      if (!activeConfig.wishes[i].icon) activeConfig.wishes[i].icon = w.icon;
      if (!activeConfig.wishes[i].author) activeConfig.wishes[i].author = w.author;
      if (!activeConfig.wishes[i].color) activeConfig.wishes[i].color = w.color;
    }
  });
}

activeConfig.configSignature = CONFIG_SIGNATURE;

const secretWishText = "My secret birthday wish... 🤫✨";
const wishesWithoutSecret = activeConfig.wishes.filter(w => w.text !== secretWishText);
if (wishesWithoutSecret.length !== activeConfig.wishes.length) {
  activeConfig.wishes = wishesWithoutSecret;
  saveConfig();
}

function saveConfig() {
  activeConfig.configSignature = CONFIG_SIGNATURE;
  localStorage.setItem('bday_config', JSON.stringify(activeConfig));
}

function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName || 'rose');
}

// Apply theme instantly on load
applyTheme(activeConfig.theme);

/* ─────────────────────────────────────
   SMOOTH CURSOR LERP
   ───────────────────────────────────── */
function initCursor() {
  const cur = document.getElementById("cursor");
  const trail = document.getElementById("cursor-trail");
  if (!cur || !trail) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let curX = mouseX, curY = mouseY;
  let trailX = mouseX, trailY = mouseY;

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tickCursor() {
    curX += (mouseX - curX) * 0.25;
    curY += (mouseY - curY) * 0.25;
    trailX += (mouseX - trailX) * 0.08;
    trailY += (mouseY - trailY) * 0.08;

    cur.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
    trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(tickCursor);
  }
  requestAnimationFrame(tickCursor);

  // Hover effects
  document.addEventListener('mouseover', e => {
    if (e.target.closest('button, a, .wish-card, .polaroid-card, .cake, .gift-box, .ctrl-btn, .theme-opt, .color-btn, .icon-btn, .customizer-toggle, .digit-input, input, textarea, select')) {
      trail.style.width = '52px';
      trail.style.height = '52px';
      trail.style.borderColor = 'var(--primary)';
      trail.style.background = 'rgba(255, 79, 123, 0.08)';
      cur.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest('button, a, .wish-card, .polaroid-card, .cake, .gift-box, .ctrl-btn, .theme-opt, .color-btn, .icon-btn, .customizer-toggle, .digit-input, input, textarea, select')) {
      trail.style.width = '36px';
      trail.style.height = '36px';
      trail.style.borderColor = 'var(--secondary)';
      trail.style.background = 'none';
      cur.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });

  document.addEventListener("mouseleave", () => {
    cur.style.opacity = 0;
    trail.style.opacity = 0;
  });
  document.addEventListener("mouseenter", () => {
    cur.style.opacity = 1;
    trail.style.opacity = 0.6;
  });
}

/* ─────────────────────────────────────
   BACKGROUND CANVAS PARTICLES
   ───────────────────────────────────── */
function initBackgroundCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let fireworks = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.r = Math.random() * 2.5 + .5;
    this.vx = (Math.random() - .5) * .3;
    this.vy = (Math.random() - .5) * .3;
    this.c = ["#ff4f7b", "#ffd166", "#c77dff", "#ff9b6a"][Math.floor(Math.random() * 4)];
    this.a = Math.random() * .5 + .1;
  }

  for (let i = 0; i < 70; i++) particles.push(new Particle());

  window.createFirework = function (x, y) {
    const count = 60;
    const colors = ["#ff4f7b", "#ffd166", "#ff9b6a", "#c77dff", "#00ffff", "#ff007f", "#39ff14"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      fireworks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: color,
        r: Math.random() * 2 + 1
      });
    }
  };

  (function animBG() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background particles
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    // Active fireworks particles
    fireworks.forEach((f, idx) => {
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = f.color; ctx.globalAlpha = f.alpha; ctx.fill();
      f.x += f.vx;
      f.y += f.vy;
      f.vy += 0.04; // gravity
      f.alpha -= 0.012;

      if (f.alpha <= 0) {
        fireworks.splice(idx, 1);
      }
    });

    requestAnimationFrame(animBG);
  })();
}

/* ─────────────────────────────────────
   CONFETTI BURST EFFECT
   ───────────────────────────────────── */
function launchConfetti() {
  const colors = ["#ff4f7b", "#ffd166", "#c77dff", "#ff9b6a", "#fff", "#7dd3fc", "#52b788", "#ff007f"];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${(Math.random() - 0.5) * 350}px;
      animation-duration: ${1.2 + Math.random() * 1.6}s;
      animation-delay: ${Math.random() * .3}s;
      transform: rotate(${Math.random() * 360}deg);
      width: ${4 + Math.random() * 6}px;
      height: ${7 + Math.random() * 9}px;
    `;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
}

/* ─────────────────────────────────────
   WEB AUDIO API SYNTHESIZER
   ───────────────────────────────────── */
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playBlowSound() {
  initAudio();
  if (!audioCtx) return;
  const startTime = audioCtx.currentTime;

  // White noise blast for puff sound
  const bufferSize = audioCtx.sampleRate * 0.12;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(450, startTime);
  filter.Q.setValueAtTime(2.5, startTime);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.08, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.11);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(startTime);
  noise.stop(startTime + 0.12);
}

function playSuccessChime() {
  initAudio();
  if (!audioCtx) return;
  const startTime = audioCtx.currentTime;

  // Success Arpeggio: C5 -> E5 -> G5 -> C6
  const tones = [523.25, 659.25, 783.99, 1046.50];
  tones.forEach((freq, idx) => {
    const time = startTime + idx * 0.12;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  });
}

// Initial calls on DOM content loaded
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initBackgroundCanvas();
});
