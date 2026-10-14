(() => {
  const audio = document.getElementById("birthday-audio") || document.createElement("audio");
  const stateKey = "birthday-music-playback";
  const player = document.createElement("div");
  const button = document.createElement("button");
  const icon = document.createElement("span");
  const label = document.createElement("span");
  const status = document.createElement("span");
  let shouldPlay = false;
  let leavingPage = false;
  let lastSavedAt = 0;

  if (!audio.id) {
    audio.id = "birthday-audio";
    audio.src = "audio/Hold%20On,%20Abegail.mp3";
    audio.preload = "metadata";
    audio.loop = true;
    audio.hidden = true;
    document.body.appendChild(audio);
  }

  player.className = "site-music-control";
  player.setAttribute("role", "group");
  player.setAttribute("aria-label", "Birthday soundtrack controls");
  button.className = "site-music-toggle";
  button.type = "button";
  button.setAttribute("aria-label", "Play birthday music");
  icon.className = "site-music-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "▶";
  label.className = "site-music-label";
  label.textContent = "Birthday soundtrack";
  status.className = "site-music-status";
  status.setAttribute("aria-live", "polite");
  status.textContent = "Paused";
  button.append(icon, label);
  player.append(button, status);
  document.body.appendChild(player);

  const style = document.createElement("style");
  style.textContent = `
    .site-music-control {
      position: fixed;
      left: max(18px, env(safe-area-inset-left));
      bottom: max(18px, env(safe-area-inset-bottom));
      z-index: 9998;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: calc(100vw - 36px);
      padding: 9px 14px 9px 9px;
      border: 1px solid rgba(230, 211, 255, .24);
      border-radius: 999px;
      background: rgba(24, 16, 43, .88);
      box-shadow: 0 8px 30px rgba(4, 2, 15, .38), 0 0 22px rgba(173, 126, 255, .12);
      color: #fff8ff;
      font-family: 'DM Sans', sans-serif;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    .site-music-toggle {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      min-height: 38px;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: 600 .82rem/1.2 'DM Sans', sans-serif;
      cursor: pointer;
    }
    .site-music-icon {
      display: grid;
      width: 36px;
      height: 36px;
      flex: 0 0 36px;
      place-items: center;
      border-radius: 50%;
      background: linear-gradient(135deg, #a879ff, #ec81c8);
      color: #fff;
      box-shadow: 0 0 16px rgba(190, 133, 255, .32);
    }
    .site-music-control.is-playing .site-music-icon {
      animation: siteMusicPulse 1.8s ease-in-out infinite;
    }
    .site-music-status {
      max-width: 155px;
      overflow: hidden;
      color: rgba(255, 248, 255, .64);
      font-size: .7rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    @keyframes siteMusicPulse {
      50% { box-shadow: 0 0 23px rgba(190, 133, 255, .7); }
    }
    @media (max-width: 480px) {
      .site-music-control {
        left: max(10px, env(safe-area-inset-left));
        bottom: max(10px, env(safe-area-inset-bottom));
        gap: 8px;
        padding-right: 10px;
      }
      .site-music-label { font-size: .75rem; }
      .site-music-status { max-width: 92px; font-size: .65rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .site-music-control.is-playing .site-music-icon { animation: none; }
    }
  `;
  document.head.appendChild(style);

  function savePlaybackState() {
    try {
      sessionStorage.setItem(stateKey, JSON.stringify({
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        shouldPlay
      }));
    } catch (error) {
      console.error("Unable to save birthday music playback state:", error);
      status.textContent = "Playback won't continue on the next page";
    }
  }

  function updateControls() {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle("is-playing", playing);
    icon.textContent = playing ? "Ⅱ" : "▶";
    button.setAttribute("aria-label", playing ? "Pause birthday music" : "Play birthday music");
    status.textContent = playing ? "Playing" : shouldPlay ? "Tap to resume" : "Paused";

    const pagePlayButton = document.getElementById("play-btn");
    if (pagePlayButton) {
      pagePlayButton.textContent = playing ? "⏸" : "▶";
      pagePlayButton.title = playing ? "Pause" : "Play";
    }
  }

  function resumePlayback() {
    status.textContent = "Starting…";
    audio.play().then(() => {
      shouldPlay = true;
      savePlaybackState();
      updateControls();
    }).catch(error => {
      shouldPlay = true;
      savePlaybackState();
      updateControls();
      if (error.name === "NotAllowedError") {
        status.textContent = "Tap to resume";
        return;
      }
      console.error("Unable to play birthday music:", error);
      status.textContent = "Music unavailable";
    });
  }

  button.addEventListener("click", () => {
    if (audio.paused) {
      shouldPlay = true;
      resumePlayback();
    } else {
      shouldPlay = false;
      audio.pause();
      savePlaybackState();
    }
  });

  audio.addEventListener("play", () => {
    shouldPlay = true;
    updateControls();
    savePlaybackState();
  });
  audio.addEventListener("pause", () => {
    if (!leavingPage) {
      shouldPlay = false;
      savePlaybackState();
    }
    updateControls();
  });
  audio.addEventListener("ended", () => {
    shouldPlay = false;
    savePlaybackState();
    updateControls();
  });
  audio.addEventListener("error", () => {
    status.textContent = "Music unavailable";
    console.error("Unable to load birthday music:", audio.currentSrc || audio.src);
  });
  audio.addEventListener("timeupdate", () => {
    const now = Date.now();
    if (now - lastSavedAt >= 1000) {
      lastSavedAt = now;
      savePlaybackState();
    }
  });

  window.addEventListener("pagehide", () => {
    leavingPage = true;
    savePlaybackState();
  });

  let savedState = null;
  try {
    savedState = JSON.parse(sessionStorage.getItem(stateKey));
  } catch (error) {
    console.error("Unable to read birthday music playback state:", error);
    status.textContent = "Playback won't continue on the next page";
  }

  if (savedState && typeof savedState === "object") {
    shouldPlay = savedState.shouldPlay === true;
    const restorePlayback = () => {
      if (Number.isFinite(savedState.currentTime) && savedState.currentTime > 0) {
        audio.currentTime = savedState.currentTime;
      }
      if (shouldPlay) resumePlayback();
      else updateControls();
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) restorePlayback();
    else audio.addEventListener("loadedmetadata", restorePlayback, { once: true });
  } else {
    updateControls();
  }
})();
