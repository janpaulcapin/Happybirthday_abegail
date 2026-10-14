(() => {
  const scene = document.querySelector(".thread-cake-scene");
  const canvas = document.getElementById("thread-cake-stars");
  const svg = document.getElementById("thread-cake-art");
  const tip = document.getElementById("thread-cake-tip");
  const lines = Array.from(svg.querySelectorAll(".thread-line"));
  const flames = Array.from(svg.querySelectorAll(".thread-flame"));
  const context = canvas.getContext("2d");
  const pathLengths = lines.map(path => path.getTotalLength());
  const totalThreadLength = pathLengths.reduce((total, length) => total + length, 0);
  const drawingDuration = 60000;
  const drawingDelay = 1200;

  if (!context) {
    throw new Error("The birthday cake starfield requires a 2D canvas context.");
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const stars = [];
  const particles = [];
  const fireworks = [];
  const timers = new Set();
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;
  let previousFrameTime = 0;
  let drawingStartedAt = 0;
  let lastParticleAt = 0;
  let hiddenAt = 0;
  let finished = false;

  function schedule(callback, delay) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
  }

  function resizeCanvas() {
    const bounds = scene.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    stars.length = 0;
    const starCount = Math.min(100, Math.max(40, Math.round(width * height / 11000)));
    for (let index = 0; index < starCount; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.0012 + 0.00035,
        blue: Math.random() > 0.55
      });
    }
    drawStarfield(performance.now());
  }

  function drawStarfield(time, deltaSeconds = 1 / 60) {
    context.clearRect(0, 0, width, height);
    for (const star of stars) {
      const alpha = 0.22 + (Math.sin(time * star.speed + star.phase) + 1) * 0.24;
      context.beginPath();
      context.fillStyle = star.blue
        ? `rgba(142, 205, 255, ${alpha})`
        : `rgba(220, 197, 255, ${alpha})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.life -= deltaSeconds;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy -= 0.006;
      if (particle.life <= 0) {
        particles.splice(index, 1);
        continue;
      }

      const opacity = Math.min(1, particle.life / particle.maxLife);
      context.beginPath();
      context.fillStyle = `rgba(${particle.color}, ${opacity})`;
      context.shadowBlur = 10;
      context.shadowColor = `rgba(${particle.color}, ${opacity})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    for (let index = fireworks.length - 1; index >= 0; index -= 1) {
      const spark = fireworks[index];
      spark.age += deltaSeconds;
      if (spark.age >= spark.life) {
        fireworks.splice(index, 1);
        continue;
      }

      spark.previousX = spark.x;
      spark.previousY = spark.y;
      spark.x += spark.vx * deltaSeconds;
      spark.y += spark.vy * deltaSeconds;
      spark.vy += 110 * deltaSeconds;
      const opacity = 1 - spark.age / spark.life;
      context.beginPath();
      context.strokeStyle = `rgba(${spark.color}, ${opacity * .7})`;
      context.lineWidth = spark.radius * .9;
      context.moveTo(spark.previousX, spark.previousY);
      context.lineTo(spark.x, spark.y);
      context.stroke();
      context.beginPath();
      context.fillStyle = `rgba(${spark.color}, ${opacity})`;
      context.shadowBlur = 10;
      context.shadowColor = `rgba(${spark.color}, ${opacity})`;
      context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      context.fill();
    }
    context.shadowBlur = 0;
  }

  function launchSideFirework(x, y) {
    const colors = ["255, 221, 151", "151, 222, 255", "255, 172, 222", "210, 179, 255"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const sparkCount = 48;

    for (let index = 0; index < sparkCount; index += 1) {
      const angle = (Math.PI * 2 * index) / sparkCount + (Math.random() - .5) * .16;
      const speed = 65 + Math.random() * 100;
      fireworks.push({
        x,
        y,
        previousX: x,
        previousY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 1.6 + .8,
        color,
        age: 0,
        life: 1.25 + Math.random() * .65
      });
    }
  }

  function celebrateFinishedCake() {
    if (reducedMotion.matches) return;

    const burstPairs = [
      { delay: 0, y: .36 },
      { delay: 620, y: .28 },
      { delay: 1320, y: .4 }
    ];
    burstPairs.forEach(({ delay, y }) => {
      schedule(() => {
        launchSideFirework(width * .075, height * y);
        launchSideFirework(width * .925, height * y);
      }, delay);
    });
  }

  function emitThreadParticle(path, distance) {
    const matrix = path.getScreenCTM();
    if (!matrix) return;
    const point = svg.createSVGPoint();
    point.x = path.getPointAtLength(distance).x;
    point.y = path.getPointAtLength(distance).y;
    const screenPoint = point.matrixTransform(matrix);
    const bounds = scene.getBoundingClientRect();
    const palette = ["214, 174, 255", "142, 218, 255", "255, 221, 168"];
    const color = palette[Math.floor(Math.random() * palette.length)];
    particles.push({
      x: screenPoint.x - bounds.left + (Math.random() - 0.5) * 5,
      y: screenPoint.y - bounds.top + (Math.random() - 0.5) * 5,
      vx: (Math.random() - 0.5) * 0.45,
      vy: Math.random() * 0.45,
      radius: Math.random() * 1.6 + 0.7,
      color,
      life: 0.7 + Math.random() * 0.55,
      maxLife: 1.25
    });
  }

  function updateDrawing(time) {
    if (!drawingStartedAt) return;

    const progress = Math.min(1, (time - drawingStartedAt) / drawingDuration);
    let distanceRemaining = totalThreadLength * progress;
    let activePath = lines[lines.length - 1];
    let activePathDistance = pathLengths[pathLengths.length - 1];

    for (let index = 0; index < lines.length; index += 1) {
      const path = lines[index];
      const length = pathLengths[index];
      if (distanceRemaining >= length && index < lines.length - 1) {
        path.style.strokeDashoffset = "0";
        distanceRemaining -= length;
        continue;
      }

      activePath = path;
      activePathDistance = Math.min(distanceRemaining, length);
      path.style.strokeDashoffset = String(length - activePathDistance);
      for (let remainingIndex = index + 1; remainingIndex < lines.length; remainingIndex += 1) {
        lines[remainingIndex].style.strokeDashoffset = String(pathLengths[remainingIndex]);
      }
      break;
    }

    const position = activePath.getPointAtLength(activePathDistance);
    tip.setAttribute("cx", String(position.x));
    tip.setAttribute("cy", String(position.y));

    if (time - lastParticleAt > 34 && progress < 1) {
      emitThreadParticle(activePath, activePathDistance);
      lastParticleAt = time;
    }

    if (progress >= 1) {
      lines.forEach(path => {
        path.style.strokeDashoffset = "0";
      });
      finishDrawing();
    }
  }

  function revealGreeting() {
    scene.classList.add("is-greeting-revealed");
  }

  function lightCandles(index) {
    if (index >= flames.length) {
      schedule(revealGreeting, reducedMotion.matches ? 100 : 500);
      return;
    }
    flames[index].classList.add("lit");
    schedule(() => lightCandles(index + 1), reducedMotion.matches ? 180 : 620);
  }

  function finishDrawing() {
    if (finished) return;
    finished = true;
    scene.classList.remove("is-drawing");
    scene.classList.add("is-finished", "is-name-revealed");
    tip.style.opacity = "0";
    celebrateFinishedCake();
    schedule(() => lightCandles(0), reducedMotion.matches ? 100 : 850);
  }

  function animate(time) {
    frame = 0;
    const delta = previousFrameTime ? Math.min(time - previousFrameTime, 40) : 16;
    previousFrameTime = time;
    if (!reducedMotion.matches && !finished) updateDrawing(time);
    drawStarfield(time, delta / 1000);
    frame = window.requestAnimationFrame(animate);
  }

  function initializeDrawing() {
    lines.forEach((path, index) => {
      const length = pathLengths[index];
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = reducedMotion.matches ? "0" : String(length);
    });

    if (reducedMotion.matches) {
      finishDrawing();
      return;
    }
    schedule(beginDrawing, drawingDelay);
    frame = window.requestAnimationFrame(animate);
  }

  function beginDrawing() {
    if (document.hidden || finished || drawingStartedAt) return;
    drawingStartedAt = performance.now();
    scene.classList.add("is-drawing");
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousFrameTime = 0;
      hiddenAt = performance.now();
      return;
    }
    if (hiddenAt) {
      const pausedDuration = performance.now() - hiddenAt;
      if (drawingStartedAt) drawingStartedAt += pausedDuration;
      hiddenAt = 0;
    }
    if (!reducedMotion.matches && !frame) {
      beginDrawing();
      frame = window.requestAnimationFrame(animate);
    } else if (reducedMotion.matches) {
      drawStarfield(performance.now());
    }
  }

  function handleMotionPreferenceChange() {
    if (reducedMotion.matches && !finished) {
      lines.forEach(path => {
        path.style.strokeDashoffset = "0";
      });
      drawingStartedAt = 0;
      finishDrawing();
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      drawStarfield(performance.now());
    } else if (!reducedMotion.matches && !frame && !document.hidden) {
      frame = window.requestAnimationFrame(animate);
    }
  }

  function cleanup() {
    if (frame) window.cancelAnimationFrame(frame);
    timers.forEach(window.clearTimeout);
    timers.clear();
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", cleanup, { once: true });
  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);
  } else {
    reducedMotion.addListener(handleMotionPreferenceChange);
  }

  resizeCanvas();
  initializeDrawing();
})();
