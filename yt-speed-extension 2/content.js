(function () {
  const STORAGE_KEY = "ytSpeedSettings";
  const DEFAULT_SETTINGS = {
    enabled: true,
    mode: "fixed", // "fixed" | "random"
    fixedSpeed: 1,
    randomMin: 0.75,
    randomMax: 1.5,
  };

  let currentSettings = DEFAULT_SETTINGS;

  function randomBetween(min, max) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    // round to the nearest 0.05 so it lands on a sane number
    const raw = Math.random() * (hi - lo) + lo;
    return Math.round(raw * 20) / 20;
  }

  function speedForSettings(settings) {
    if (settings.mode === "random") {
      return randomBetween(settings.randomMin, settings.randomMax);
    }
    return Number(settings.fixedSpeed) || 1;
  }

  function applyCurrentSpeed(video) {
    if (!currentSettings || !currentSettings.enabled) return;
    const speed = speedForSettings(currentSettings);
    try {
      video.playbackRate = speed;
    } catch (e) {
      /* ignore — element might not be ready */
    }
  }

  function bindVideo(video) {
    if (video.__ytSpeedExtBound) {
      // still apply once in case settings changed since it was bound
      applyCurrentSpeed(video);
      return;
    }
    video.__ytSpeedExtBound = true;

    // Re-roll / re-apply every time a video (re)starts playing.
    // This covers: normal video loads, replays, ads ending, and Shorts
    // swapping in a new <video> element as you scroll.
    video.addEventListener("play", () => applyCurrentSpeed(video));
    video.addEventListener("loadedmetadata", () => applyCurrentSpeed(video));

    applyCurrentSpeed(video);
  }

  function scanVideos() {
    document.querySelectorAll("video").forEach(bindVideo);
  }

  function loadSettingsAndScan() {
    chrome.storage.sync.get([STORAGE_KEY], (store) => {
      currentSettings = store[STORAGE_KEY] || DEFAULT_SETTINGS;
      scanVideos();
    });
  }

  loadSettingsAndScan();

  // Live update: when settings change in the popup, apply immediately to
  // whatever's already loaded (not just the next video that plays).
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes[STORAGE_KEY]) return;
    currentSettings = changes[STORAGE_KEY].newValue || DEFAULT_SETTINGS;
    document.querySelectorAll("video").forEach(applyCurrentSpeed);
  });

  // YouTube is a single-page app — full navigations don't reload the script.
  document.addEventListener("yt-navigate-finish", () => {
    setTimeout(scanVideos, 250);
  });

  // Shorts (and some SPA transitions) swap <video> elements in and out
  // without firing yt-navigate-finish reliably — catch those via a
  // lightweight, debounced DOM watcher.
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanVideos, 150);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
