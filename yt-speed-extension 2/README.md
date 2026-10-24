# YT Speed & Launch

Controls YouTube playback speed (fixed or randomized) and can auto-open YouTube Home or Shorts when your browser starts.

## Install (Chrome, Edge, Brave, or any Chromium browser)

1. Unzip this folder somewhere permanent — don't delete it after installing.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select this folder.
5. Pin it from the puzzle-piece icon in the toolbar.

## Playback speed

- **Enable speed control** — master on/off switch.
- **Fixed** — pick one speed (0.25× to 4×) that's applied to every video and Short.
- **Random** — set a min and max range; a new random speed (rounded to the nearest 0.05×) is picked every time a video or Short starts playing, including replays and Shorts you swipe to.

Speed settings take effect immediately on any open YouTube tab — no refresh needed.

## Startup automation

- **Auto-open on browser startup** — when turned on, opens a new tab to your chosen destination the moment the browser itself launches (this fires once per browser launch, not on every new tab/window you open afterward).
- **Home / Shorts** — pick which one it opens to.
- **Open this destination now** — a manual button to test the destination right away without restarting your browser.

## How it works

- `content.js` runs on every YouTube page. It watches for `<video>` elements (using YouTube's own navigation events plus a DOM watcher, since YouTube is a single-page app and Shorts constantly swap video elements) and sets `playbackRate` on each one whenever it starts playing.
- `background.js` listens for `chrome.runtime.onStartup`, which Chrome fires once when the browser application starts up, and opens a tab if automation is enabled.
- Settings are stored in `chrome.storage.sync`, so they follow you across Chrome installs where you're signed in.
