const AUTOMATION_KEY = "ytLaunchSettings";
const DEFAULT_AUTOMATION = {
  enabled: false,
  destination: "home", // "home" | "shorts"
};

const DESTINATION_URLS = {
  home: "https://www.youtube.com/",
  shorts: "https://www.youtube.com/shorts/",
};

// Fires once when the browser application itself starts up (not on every
// new window/tab). This is the hook for "on startup, open Home or Shorts".
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get([AUTOMATION_KEY], (store) => {
    const settings = store[AUTOMATION_KEY] || DEFAULT_AUTOMATION;
    if (!settings.enabled) return;
    const url = DESTINATION_URLS[settings.destination] || DESTINATION_URLS.home;
    chrome.tabs.create({ url });
  });
});

// Lets the popup trigger "open now" without duplicating this URL map.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "open-destination") {
    const url = DESTINATION_URLS[message.destination] || DESTINATION_URLS.home;
    chrome.tabs.create({ url });
    sendResponse({ ok: true });
  }
  return true;
});
