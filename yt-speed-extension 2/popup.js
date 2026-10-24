const SPEED_KEY = "ytSpeedSettings";
const LAUNCH_KEY = "ytLaunchSettings";

const DEFAULT_SPEED = { enabled: true, mode: "fixed", fixedSpeed: 1, randomMin: 0.75, randomMax: 1.5 };
const DEFAULT_LAUNCH = { enabled: false, destination: "home" };

const speedEnabledEl = document.getElementById("speedEnabled");
const modeFixedBtn = document.getElementById("modeFixedBtn");
const modeRandomBtn = document.getElementById("modeRandomBtn");
const fixedFieldEl = document.getElementById("fixedField");
const randomFieldEl = document.getElementById("randomField");
const randomNoteEl = document.getElementById("randomNote");
const fixedSpeedEl = document.getElementById("fixedSpeed");
const randomMinEl = document.getElementById("randomMin");
const randomMaxEl = document.getElementById("randomMax");

const launchEnabledEl = document.getElementById("launchEnabled");
const destHomeBtn = document.getElementById("destHomeBtn");
const destShortsBtn = document.getElementById("destShortsBtn");
const openNowBtn = document.getElementById("openNowBtn");

let mode = "fixed";
let destination = "home";

const MIN_SPEED = 0.05;
const MAX_SPEED = 16;

function clampSpeed(value) {
  if (Number.isNaN(value)) return 1;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, value));
}

function setMode(newMode) {
  mode = newMode;
  modeFixedBtn.classList.toggle("active", mode === "fixed");
  modeRandomBtn.classList.toggle("active", mode === "random");
  fixedFieldEl.style.display = mode === "fixed" ? "block" : "none";
  randomFieldEl.style.display = mode === "random" ? "flex" : "none";
  randomNoteEl.style.display = mode === "random" ? "block" : "none";
}

function setDestination(newDest) {
  destination = newDest;
  destHomeBtn.classList.toggle("active", destination === "home");
  destShortsBtn.classList.toggle("active", destination === "shorts");
}

function loadSettings() {
  chrome.storage.sync.get([SPEED_KEY, LAUNCH_KEY], (store) => {
    const speed = store[SPEED_KEY] || DEFAULT_SPEED;
    const launch = store[LAUNCH_KEY] || DEFAULT_LAUNCH;

    speedEnabledEl.checked = !!speed.enabled;
    setMode(speed.mode === "random" ? "random" : "fixed");
    fixedSpeedEl.value = String(speed.fixedSpeed ?? 1);
    randomMinEl.value = speed.randomMin ?? 0.75;
    randomMaxEl.value = speed.randomMax ?? 1.5;

    launchEnabledEl.checked = !!launch.enabled;
    setDestination(launch.destination === "shorts" ? "shorts" : "home");
  });
}

function saveSpeedSettings() {
  const clampedFixed = clampSpeed(Number(fixedSpeedEl.value));
  const clampedMin = clampSpeed(Number(randomMinEl.value));
  const clampedMax = clampSpeed(Number(randomMaxEl.value));
  fixedSpeedEl.value = clampedFixed;
  randomMinEl.value = clampedMin;
  randomMaxEl.value = clampedMax;

  const settings = {
    enabled: speedEnabledEl.checked,
    mode,
    fixedSpeed: clampedFixed,
    randomMin: clampedMin,
    randomMax: clampedMax,
  };
  chrome.storage.sync.set({ [SPEED_KEY]: settings });
}

function saveLaunchSettings() {
  const settings = {
    enabled: launchEnabledEl.checked,
    destination,
  };
  chrome.storage.sync.set({ [LAUNCH_KEY]: settings });
}

modeFixedBtn.addEventListener("click", () => {
  setMode("fixed");
  saveSpeedSettings();
});
modeRandomBtn.addEventListener("click", () => {
  setMode("random");
  saveSpeedSettings();
});
destHomeBtn.addEventListener("click", () => {
  setDestination("home");
  saveLaunchSettings();
});
destShortsBtn.addEventListener("click", () => {
  setDestination("shorts");
  saveLaunchSettings();
});

[speedEnabledEl, fixedSpeedEl, randomMinEl, randomMaxEl].forEach((el) => {
  el.addEventListener("input", saveSpeedSettings);
  el.addEventListener("change", saveSpeedSettings);
});
launchEnabledEl.addEventListener("change", saveLaunchSettings);

openNowBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "open-destination", destination });
});

loadSettings();
