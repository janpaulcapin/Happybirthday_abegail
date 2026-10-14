(() => {
  const canvas = document.getElementById("cosmic-canvas");
  const context = canvas.getContext("2d");
  const starButton = document.getElementById("cosmic-star");
  const portalButton = document.getElementById("portal-button");
  const celebrantName = document.getElementById("cosmic-name");
  const reveal = document.getElementById("cosmic-reveal");
  const nextSection = document.getElementById("cosmic-next");
  const camera = document.getElementById("cosmic-camera");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const defaultName = "Abegail";
  const configuredName = typeof activeConfig !== "undefined" && activeConfig.name
    ? activeConfig.name.trim().split(/\s+/)[0].toLowerCase().replace(/^./, letter => letter.toUpperCase())
    : defaultName;
  const timers = new Set();
  const stars = [];
  const galaxyDust = [];
  const particles = [];
  let animationFrame = 0;
  let previousFrameTime = 0;
  let lastDrawTime = 0;
  let elapsed = 0;
  let width = 0;
  let height = 0;
  let hasStarted = false;
  let isNavigating = false;

  celebrantName.textContent = configuredName || defaultName;

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function resizeCanvas() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    stars.length = 0;
    galaxyDust.length = 0;
    const starCount = Math.min(240, Math.max(130, Math.round((width * height) / 6000)));
    for (let index = 0; index < starCount; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.15 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        drift: (Math.random() - 0.5) * 0.09,
        tint: Math.random()
      });
    }
    const dustCount = Math.min(760, Math.max(440, Math.round((width * height) / 1500)));
    const galaxyRadius = Math.min(width, height) * 0.46;
    for (let index = 0; index < dustCount; index += 1) {
      const arm = Math.floor(Math.random() * 4);
      const radius = Math.sqrt(Math.random()) * galaxyRadius;
      galaxyDust.push({
        radius,
        angle: arm * (Math.PI / 2) + (radius / galaxyRadius) * 4.1 + (Math.random() - 0.5) * 0.38,
        size: Math.random() * 1.45 + (radius < galaxyRadius * 0.15 ? 0.65 : 0.25),
        phase: Math.random() * Math.PI * 2,
        speed: 0.12 + Math.random() * 0.28 + (1 - radius / galaxyRadius) * 0.48,
        color: Math.random() > 0.57 ? "182, 157, 255" : "117, 164, 255",
        sparkle: Math.random() > 0.935
      });
    }
    drawFrame(0);
  }

  function drawGalaxy() {
    const centerX = width / 2;
    const centerY = height / 2;
    for (const dust of galaxyDust) {
      const angle = dust.angle + elapsed * dust.speed;
      const x = centerX + Math.cos(angle) * dust.radius;
      const y = centerY + Math.sin(angle) * dust.radius * 0.7;
      const shimmer = 0.25 + (Math.sin(elapsed * 1.8 + dust.phase) + 1) * 0.24;

      if (dust.sparkle) {
        context.beginPath();
        context.fillStyle = `rgba(248, 239, 255, ${Math.min(shimmer + 0.22, 0.92)})`;
        context.arc(x, y, dust.size * 1.6, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.strokeStyle = `rgba(223, 215, 255, ${shimmer * 0.44})`;
        context.lineWidth = 0.55;
        context.moveTo(x - dust.size * 3.6, y);
        context.lineTo(x + dust.size * 3.6, y);
        context.moveTo(x, y - dust.size * 3.6);
        context.lineTo(x, y + dust.size * 3.6);
        context.stroke();
      } else {
        context.beginPath();
        context.fillStyle = `rgba(${dust.color}, ${shimmer})`;
        context.arc(x, y, dust.size, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function drawStarfield(deltaSeconds) {
    for (const star of stars) {
      star.y += star.drift * deltaSeconds * 60;
      if (star.y > height + 2) star.y = -2;
      if (star.y < -2) star.y = height + 2;
      const twinkle = 0.22 + ((Math.sin(elapsed * star.speed + star.phase) + 1) * 0.39);
      const color = star.tint > 0.84 ? "190, 168, 255" : star.tint > 0.58 ? "165, 198, 255" : "255, 255, 255";
      context.beginPath();
      context.fillStyle = `rgba(${color}, ${twinkle})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawParticles(deltaSeconds) {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.age += deltaSeconds;
      if (particle.age >= particle.life) {
        particles.splice(index, 1);
        continue;
      }
      const progress = particle.age / particle.life;
      const turn = particle.turn * deltaSeconds;
      const velocityX = particle.vx;
      particle.vx = velocityX * Math.cos(turn) - particle.vy * Math.sin(turn);
      particle.vy = velocityX * Math.sin(turn) + particle.vy * Math.cos(turn);
      particle.x += particle.vx * deltaSeconds;
      particle.y += particle.vy * deltaSeconds;

      const opacity = 1 - progress;
      context.beginPath();
      context.strokeStyle = `rgba(${particle.color}, ${opacity * 0.48})`;
      context.lineWidth = particle.size * (1 - progress * 0.5);
      context.moveTo(particle.previousX, particle.previousY);
      context.lineTo(particle.x, particle.y);
      context.stroke();
      particle.previousX = particle.x;
      particle.previousY = particle.y;

      context.beginPath();
      context.fillStyle = `rgba(${particle.color}, ${opacity})`;
      context.arc(particle.x, particle.y, particle.size * (1 - progress * 0.3), 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawFrame(deltaSeconds) {
    context.clearRect(0, 0, width, height);
    drawGalaxy();
    drawStarfield(deltaSeconds);
    drawParticles(deltaSeconds);
  }

  function animate(timestamp) {
    animationFrame = 0;
    if (document.hidden) return;
    if (timestamp - lastDrawTime < 32) {
      animationFrame = window.requestAnimationFrame(animate);
      return;
    }
    const deltaSeconds = previousFrameTime
      ? Math.min((timestamp - previousFrameTime) / 1000, 0.04)
      : 0;
    previousFrameTime = timestamp;
    lastDrawTime = timestamp;
    elapsed += deltaSeconds;
    drawFrame(deltaSeconds);
    animationFrame = window.requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (reducedMotion.matches || document.hidden || animationFrame) return;
    previousFrameTime = 0;
    animationFrame = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function createGalaxyBurst() {
    const originX = width / 2;
    const originY = height / 2;
    const colors = ["255, 255, 255", "205, 180, 255", "138, 167, 255", "255, 190, 239"];
    for (let index = 0; index < 260; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * Math.min(width, height) * 0.78;
      const radius = Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: originX + Math.cos(angle) * radius,
        y: originY + Math.sin(angle) * radius,
        previousX: originX + Math.cos(angle) * radius,
        previousY: originY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        turn: (Math.random() - 0.5) * 2.2,
        age: 0,
        life: 2.4 + Math.random() * 0.8,
        size: Math.random() * 1.9 + 0.7,
        color
      });
    }
  }

  function gatherParticles() {
    const originX = width / 2;
    const originY = height / 2;
    for (const particle of particles) {
      const remainingLife = Math.max(particle.life - particle.age, 0.45);
      particle.vx = (originX - particle.x) / remainingLife;
      particle.vy = (originY - particle.y) / remainingLife;
      particle.turn *= 0.45;
    }
  }

  function revealUniverse() {
    if (hasStarted) return;
    hasStarted = true;
    document.body.classList.add("is-awake");
    starButton.disabled = true;
    if (reducedMotion.matches) {
      particles.length = 0;
      drawFrame(0);
    } else {
      createGalaxyBurst();
      startAnimation();
      schedule(() => {
        document.body.classList.add("is-gathering");
        gatherParticles();
      }, 850);
    }

    schedule(() => {
      document.body.classList.add("is-revealed");
      reveal.setAttribute("aria-hidden", "false");
    }, reducedMotion.matches ? 0 : 1900);

    schedule(() => {
      document.body.classList.add("is-portal");
      nextSection.setAttribute("aria-hidden", "false");
      portalButton.disabled = false;
    }, reducedMotion.matches ? 0 : 3600);
  }

  function enterPortal() {
    if (isNavigating) return;
    isNavigating = true;
    portalButton.disabled = true;
    document.body.classList.add("is-traveling");
    schedule(() => {
      window.location.assign("video.html");
    }, reducedMotion.matches ? 20 : 1450);
  }

  function updateParallax(event) {
    if (reducedMotion.matches || hasStarted) return;
    const offsetX = (event.clientX / width - 0.5) * -9;
    const offsetY = (event.clientY / height - 0.5) * -9;
    camera.style.setProperty("--parallax-x", `${offsetX}px`);
    camera.style.setProperty("--parallax-y", `${offsetY}px`);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopAnimation();
    } else if (!reducedMotion.matches) {
      startAnimation();
    } else {
      drawFrame(0);
    }
  }

  function handleMotionPreferenceChange() {
    if (reducedMotion.matches) {
      stopAnimation();
      particles.length = 0;
      drawFrame(0);
    } else {
      startAnimation();
    }
  }

  function cleanup() {
    stopAnimation();
    timers.forEach(window.clearTimeout);
    timers.clear();
  }

  starButton.addEventListener("click", revealUniverse);
  portalButton.addEventListener("click", enterPortal);
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", updateParallax, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", cleanup, { once: true });
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
  } else {
    reducedMotion.addListener(handleMotionPreferenceChange);
  }

  resizeCanvas();
  startAnimation();
})();
