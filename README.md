# LeetSense

A Chrome extension that enhances LeetCode with persistent notes, solution revision history, AI-powered complexity analysis, and a progress heatmap — all stored locally, no account needed.

![Chrome](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)

---

## Features

**Notes per problem**
A persistent markdown-enabled panel injected into every LeetCode problem page. Notes auto-save on keystroke and reload automatically on revisit — keyed to the problem slug via `chrome.storage.local`.

**Revision tracker**
Snapshots your solution every time you run or submit. Maintains a timestamped history per problem with a side-by-side diff view so you can trace how your approach evolved.

**AI complexity analysis**
Reads your current solution from the editor and sends it to Groq's LLM API. Returns time and space complexity with a plain-English explanation in under 2 seconds.

**Progress heatmap**
A GitHub-style activity heatmap in the extension popup showing problems solved per day, current streak, and an Easy / Medium / Hard breakdown — updated automatically as you solve.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension | Chrome Manifest V3 |
| Frontend | Vanilla JS, CSS |
| Persistence | `chrome.storage.local` |
| AI | Groq API (llama-3.3-70b-versatile) |
| Build | Webpack 5 |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/sachdevaryan/lc_enhancer.git
cd lc_enhancer

# Install dependencies
npm install

# Add your Groq API key
cp .env.example .env
# Open .env and set GROQ_API_KEY=your_key_here

# Build the extension
npm run build
```

### Load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder

Open any LeetCode problem — the LeetSense panel will appear alongside the editor.

---

## Development

```bash
# Rebuilds automatically on file save
npm run watch
```

After any change, go to `chrome://extensions` and click the refresh icon on the LeetSense card.

---

## Project Structure

```
leetsense/
├── src/
│   ├── background/
│   │   └── index.js          # Service worker — handles Groq API calls
│   ├── content/
│   │   ├── index.js          # Entry point injected into leetcode.com/problems/*
│   │   ├── panel.js          # Renders the side panel UI
│   │   ├── notes.js          # Notes feature
│   │   ├── history.js        # Revision tracker + diff view
│   │   └── analysis.js       # AI complexity estimator
│   ├── popup/
│   │   └── index.js          # Heatmap dashboard logic
│   └── utils/
│       ├── storage.js        # chrome.storage.local wrapper
│       ├── diff.js           # Diff algorithm
│       └── leetcode.js       # DOM helpers (editor access, problem slug)
├── public/
│   ├── manifest.json
│   ├── popup.html
│   └── icons/
├── webpack.config.js
└── .env.example
```

---

## How It Works

**Content script injection** — Webpack bundles `src/content/index.js` into a single `content.js` file that Chrome injects into every `leetcode.com/problems/*` page after the DOM is ready (`document_idle`).

**Editor access** — LeetCode uses CodeMirror embedded inside a React app. The extension queries the `.view-lines` DOM node to extract the current solution without interfering with the editor.

**Storage** — All data (notes, snapshots, daily stats) is stored in `chrome.storage.local` under namespaced keys (`notes:{slug}`, `history:{slug}`, `stats:{date}`). No server, no account, no data leaves your machine except for the complexity analysis API call.

**AI analysis** — The content script sends the extracted code to the background service worker via `chrome.runtime.sendMessage`. The service worker makes the Groq API call (keeping the API key out of the content script context) and returns the result.

---

## Environment Variables

```bash
# .env.example
GROQ_API_KEY=your_groq_api_key_here
```

> The API key is embedded into the background bundle at build time via Webpack's `DefinePlugin`. It is not exposed to page scripts.

---

## Roadmap

- [ ] Export notes as markdown file
- [ ] Tag problems with custom labels
- [ ] Spaced repetition reminders via `chrome.alarms`
- [ ] Firefox support (WebExtensions API compatible)

---

## License

MIT