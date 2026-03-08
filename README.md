# SnapScroll Chrome Extension

SnapScroll is a lightweight, privacy-focused Chrome Extension that allows users to instantly save and return to specific scroll positions on any webpage or Single Page Application (SPA).

## Overview

Navigating long documents, documentation pages, or infinite-scrolling AI chat interfaces (like ChatGPT, Gemini, or Claude) often involves tedious manual scrolling to find a previous context. SnapScroll solves this by letting you drop a temporary checkpoint anywhere on the page using a keyboard shortcut. You can then navigate away, read other sections, and instantly jump back to your exact checkpoint with another shortcut.

## Key Features

- **Instant Checkpointing:** Save your exact X/Y scroll coordinate with a single keystroke.
- **Smart SPA Support:** Intelligently detects custom scrollable containers (like sidebars vs main chat areas) in modern Web Apps, ignoring standard window scroll limits when necessary.
- **Dynamic Growth Handling:** Automatically calculates distance-from-bottom metrics to keep your checkpoints accurate even when new content (like AI responses) continuously expands the bottom of the page.
- **Customizable Shortcuts:** Fully customizable keybindings integrated directly into Chrome's native extension shortcut engine.
- **Non-Intrusive UI:** Operates entirely in the background and via pure-CSS toast notifications. Zero heavy UI libraries or dependencies injected into the host page.
- **Privacy First:** Checkpoints are stored strictly in `chrome.storage.local`. No data ever leaves your device or browser. Data automatically expires entirely after 24 hours.

## Default Keyboard Shortcuts

You can customize these at any time by visiting `chrome://extensions/shortcuts` or clicking "Change Shortcuts" within the extension popup.

| Action                       | Windows / Linux | Mac          |
| :--------------------------- | :-------------- | :----------- |
| **Save / Update Checkpoint** | `Alt + S`       | `Option + S` |
| **Jump to Checkpoint**       | `Alt + J`       | `Option + J` |
| **Delete Checkpoint**        | `Alt + X`       | `Option + X` |

## Technical Implementation

Built with modern browser standards and performance in mind:

- **Manifest V3:** Adheres to the latest Chrome Web Store security and performance guidelines.
- **TypeScript & Vite:** Strongly typed codebase bundled efficiently for production.
- **JSDOM & Vitest:** Core DOM traversal heuristics and TTL storage logic are backed by isolated unit tests.
- **Zero Dependencies:** Content UI components (Toasts) use Vanilla JS and CSS transitions to prevent style leaking or conflicts with host websites.

## Development Setup

If you wish to build the extension locally or contribute:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run unit tests: `npm test`
4. Build the extension: `npm run build`
5. Open Chrome and navigate to `chrome://extensions/`
6. Enable "Developer mode" in the top right
7. Click "Load unpacked" and select the generated `dist/` directory

## License

[MIT License](./LICENSE)
