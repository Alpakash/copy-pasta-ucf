# Copy Pasta Formaggi

**Copy anywhere. Paste perfectly.** A cross-application formatting translator that converts clipboard content between apps — so your text looks right no matter where you paste it.

[![Version](https://img.shields.io/badge/version-0.1.0--beta.1-blue)](https://github.com/Alpakash/copy-pasta-formaggi/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%2013.0%2B-lightgrey)](https://copypastaformaggi.com)

---

## What It Does

You copy rich text from ChatGPT, Notion, or Slack. You paste into Gmail, Discord, or WhatsApp. The formatting breaks — bold becomes asterisks, bullets become question marks, links get mangled.

Copy Pasta Formaggi runs in your menu bar and fixes this. It detects what you copied and reformats it for wherever you're pasting. One shortcut, one tray click — your text looks right.

- **14 built-in profiles:** Slack, Gmail, Google Docs, Notion, Discord, Microsoft Teams, Telegram, Beeper, WhatsApp, ChatGPT, Claude, Perplexity, Word → Plain, Social → Unicode
- **Auto-detection:** Figures out the source format so you don't have to
- **Per-app preferences:** Set a profile per destination app — automatic after the first time
- **Keyboard shortcuts:** Configure your own key combinations for convert-and-paste
- **100% local:** All conversions happen on your device. No account needed. No telemetry.

## What It Is NOT

- **Not a clipboard manager** — it doesn't store clipboard history. Use Maccy or Paste alongside it if you need history.
- **Not a cloud service** — no accounts, no sign-up, no network calls with clipboard contents.
- **Not a text expander** — it doesn't insert pre-written snippets. It reformats what you've already copied.
- **Not a plain-text-only cleaner** — it preserves semantic structure (bold, italic, lists, links). macOS "Paste and Match Style" strips everything; we translate.
- **Not an always-on paste hook** — it doesn't silently overwrite your clipboard. You control when and how conversion happens.

## Quick Install

**Requirements:** macOS 13.0 (Ventura) or later · Apple Silicon or Intel · ~20 MB.

```bash
# Homebrew (recommended)
brew install --cask copy-pasta-formaggi
```

Or download the latest DMG from [GitHub Releases](https://github.com/Alpakash/copy-pasta-formaggi/releases).

See the [Install Guide](#install-guide) below for detailed setup, troubleshooting, and uninstall instructions.

## Supported Conversions

| Source App | Target App | Format Flow |
|---|---|---|
| ChatGPT / Claude / Perplexity | Slack / Discord / Teams | Markdown → Slack/Discord/Teams markup |
| ChatGPT / Claude / Perplexity | Telegram | Markdown → Telegram MarkdownV2 |
| ChatGPT / Claude / Perplexity | Gmail / Google Docs | Markdown → Gmail-safe HTML |
| ChatGPT / Claude / Perplexity | WhatsApp / iMessage / SMS | Markdown → clean plain text |
| Notion / Google Docs | Gmail | Rich HTML → Gmail-safe HTML |
| Notion / Google Docs | Slack / Discord | Rich HTML → Slack/Discord markup |
| Notes.app / Safari / Terminal | Any app | Plain text → normalized plain text |
| Preview (PDF) | Docs / Notion | PDF text → formatted text (beta) |
| Any app | Any app | Any format → plain text fallback |

Full matrix with status indicators (✅/⚠️) in [docs/FORMATS.md](docs/FORMATS.md).

## How It Works

Copy Pasta Formaggi uses a deterministic UCF (Unified Canonical Format) pipeline:

1. **Copy** text in any app (ChatGPT, Notion, Google Docs, Safari, Notes…)
2. **Detect** the source format (Markdown, HTML, plain text, PDF)
3. **Decode** into UCF — a structured canonical representation
4. **Encode** to your target app's format (Slack markup, Gmail-safe HTML, plain text, etc.)
5. **Write** the correctly-formatted version to your clipboard

Manual mode: right-click the tray icon → "Convert clipboard to Slack/Gmail/Plain".
Auto mode: enable in Preferences and it converts on every paste based on your foreground app.

## Privacy

All clipboard processing happens **locally on your device**. No network calls. No telemetry. No accounts. No sign-up. See [Privacy Policy](docs/PRIVACY.md).

## Open Source

Copy Pasta Formaggi is a **source-available** project with an open-source core:

| Component | Status | Repository |
|---|---|---|
| UCF Type Spec (`@copy-pasta/ucf-spec`) | Open Source (MIT) | [copy-pasta-ucf](https://github.com/Alpakash/copy-pasta-ucf) |
| Format Detectors | Open Source (MIT) | [copy-pasta-ucf](https://github.com/Alpakash/copy-pasta-ucf) |
| Adapter Reference | Open Source (MIT) | [copy-pasta-ucf](https://github.com/Alpakash/copy-pasta-ucf) |
| ESLint Config | Open Source (MIT) | [copy-pasta-ucf](https://github.com/Alpakash/copy-pasta-ucf) |
| Core Engine & Adapters | Source Available | This repo |

The UCF spec, detectors, and adapter reference are published as open-source packages so the community can build custom adapters, integrate with other tools, and contribute improvements. The core conversion engine and production adapters remain proprietary.

See [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to write your own UCF adapter.

---

## Install Guide

### System Requirements

- macOS 14 (Sonoma) or later
- Apple Silicon (M1/M2/M3/M4) — Intel Macs are not yet supported in the beta
- ~20 MB disk space

### Option 1: Homebrew (Recommended)

```bash
brew install --cask copy-pasta-formaggi
```

This installs the app to `/Applications` and keeps it up to date with `brew upgrade`.

If the formula isn't found, tap the cask repo first:

```bash
brew tap Alpakash/homebrew-tap
brew install --cask copy-pasta-formaggi
```

### Option 2: Direct Download

1. Go to the [GitHub Releases page](https://github.com/Alpakash/copy-pasta-formaggi/releases)
2. Download the latest `Copy Pasta Formaggi_*.dmg` (Apple Silicon)
3. Open the DMG file
4. Drag "Copy Pasta Formaggi" to your Applications folder
5. Eject the DMG

### First Launch

1. Open Copy Pasta Formaggi from your Applications folder
2. macOS may show a security warning because the app is not notarized yet (beta). To open:
   - Right-click the app → "Open"
   - Or go to System Settings → Privacy & Security → "Open Anyway"
3. The app appears as a tray icon in your menu bar (look for the cheese icon)
4. Click the tray icon to see the menu: Convert to Slack, Gmail, Plain, or open Preferences

### Setup

#### Manual Mode (Default)

Right-click the tray icon and pick a conversion target. The app reads your clipboard, converts the content, and writes the converted version back. Paste as normal.

#### Auto Mode

1. Open Preferences from the tray menu
2. Toggle "Auto-convert on paste" ON
3. Configure per-app targets if desired (e.g., always convert to Slack when pasting into Slack.app)
4. The app now converts automatically when you paste — based on what app is in the foreground

#### Per-App Profiles

In Preferences → Per-App Targets, you can set specific conversion targets for specific apps:

- When Slack is active → always convert to Slack markup
- When Mail or Gmail is active → always convert to Gmail-safe HTML
- When WhatsApp is active → always convert to plain text

Unconfigured apps use your global default.

### Beta Channel

To receive beta (pre-release) updates:

1. Open Preferences
2. Toggle "Beta updates" ON
3. Restart the app when prompted

The app checks for updates automatically. Beta channel users get features earlier but may encounter more bugs.

### Troubleshooting

#### The app doesn't convert my text

- Make sure the tray icon is visible (it may be hidden in the menu bar overflow)
- Check that conversion isn't disabled: Preferences → Kill Switches → "Disable conversion" should be OFF
- Try manual conversion first: click tray icon → "Convert clipboard → Plain"

#### My paste looks wrong

- Enable debug logging: create `~/.copy-pasta-formaggi/.env` with `VITE_DEBUG_CLIPBOARD=true`, restart the app, and check the debug panel
- Copy the problematic text and paste it somewhere safe, then report the issue

#### The app keeps converting when I don't want it to

- Auto mode can be toggled off from the tray menu or Preferences
- You can also set per-app profiles to "none" for specific apps

#### Conversion keeps failing

After 3 consecutive failures within 2 minutes, auto-conversion disables itself as a safety measure. Restart the app or re-enable it manually in Preferences.

### Uninstall

1. Quit Copy Pasta Formaggi (tray icon → Quit)
2. Drag "Copy Pasta Formaggi" from Applications to Trash
3. Remove config files (optional):

```bash
rm -rf ~/Library/Application\ Support/com.copy-pasta.desktop/
```

If installed via Homebrew:

```bash
brew uninstall --cask copy-pasta-formaggi
```

### Updating

The app checks for updates automatically. When an update is available, you'll see a notification. Click "Install" to download and apply. A restart is required after updating.

To check manually: tray icon → "Check for Updates".

---

## FAQ

### What does Copy Pasta Formaggi do?

It converts formatted text between apps so your copy/paste always looks right. Copy from ChatGPT (Markdown with bold, italic, lists), paste into Slack (which uses `*bold*` and `_italic_`), and the formatting survives. Copy from Notion (rich HTML), paste into Gmail (which only accepts a limited subset of HTML), and nothing breaks.

### Is this a clipboard manager?

No. Copy Pasta Formaggi doesn't store clipboard history. If you need clipboard history, use Maccy or Paste alongside it — they're complementary tools. Copy Pasta Formaggi handles format conversion; clipboard managers handle clip storage and search.

### Does it send my clipboard data anywhere?

No. All processing happens **locally on your device**. Clipboard contents never leave your machine. There are no network calls that include clipboard data. No telemetry, no analytics, no accounts, no sign-up. See our [Privacy Policy](docs/PRIVACY.md).

### How does it work?

1. You copy text in any app
2. The app detects the source format (Markdown, HTML, plain text, PDF)
3. It decodes the text into UCF (Unified Canonical Format) — a structured representation
4. It re-encodes UCF into the target app's expected format
5. It writes the converted text back to your clipboard

In auto mode, step 2-5 happens automatically when you paste. In manual mode, you trigger it from the tray icon.

### Which apps and formats are supported?

**Source apps (what you copy FROM):**
- ChatGPT, Claude, Perplexity (Markdown)
- Notion, Google Docs (rich HTML)
- Any app that produces plain text

**Target apps (what you paste INTO):**
- Slack (Markdown markup: `*bold*`, `_italic_`)
- Gmail (safe HTML)
- WhatsApp, iMessage, SMS, Beeper (plain text)
- Discord, Microsoft Teams, Telegram
- Any app that accepts plain text

See [docs/FORMATS.md](docs/FORMATS.md) for the full conversion matrix.

### Can I use it alongside Maccy or Paste?

Yes. They do different things and work well together. Use a clipboard manager for clip history — use Copy Pasta Formaggi for format conversion.

### Does it work with PDFs?

Partially. Copying from PDF (Preview.app) and pasting into Docs or Notion works for single-column layouts. Partial text selections from multi-column PDFs can produce inconsistent line breaks. PDF support is actively being improved.

### Is there a Windows or Linux version?

Not yet. The beta is macOS-only (Apple Silicon). Windows and Linux support is planned.

### Is there a mobile version?

Not yet. Mobile (iOS Share Sheet integration) is on the roadmap.

### Why does the app need to restart when switching beta channels?

The update channel switch requires a full app restart. This is a known Tauri v2 limitation — the app cannot programmatically relaunch itself on macOS without user interaction.

### Does it cost money?

The v0.1 beta is free. Future pricing is still being determined — see our [pricing page](https://copypastaformaggi.com/pricing) for updates.

### How do I report a bug?

File an issue on [GitHub](https://github.com/Alpakash/copy-pasta-formaggi/issues). Include:
- What you copied (source app)
- Where you pasted (target app)
- What you expected vs. what happened
- The text content (if not sensitive)

### Known Issues

- **Code blocks (17 edge cases):** Some code block formatting is lost in rare input patterns. Being tracked and fixed.
- **PDF selection boundaries:** Partial text selections from PDFs can have inconsistent line breaks.
- **Beta channel restart:** Switching update channels requires an app restart.
- **macOS only:** No Windows or Linux support yet.

### How do I get started?

See the [Onboarding Guide](docs/ONBOARDING.md) for a step-by-step walkthrough. TL;DR:

1. Install via Homebrew or DMG
2. Launch the app (it lives in your menu bar as a tray icon)
3. Copy text in any app, then click the tray icon → "Convert clipboard → Slack/Gmail/Plain"
4. Paste the converted text

For automatic conversion when pasting, enable **Auto mode** in Preferences.

### What happens if a conversion fails?

The app falls back safely: your original clipboard content is preserved unchanged. After 3 consecutive failures within 2 minutes, auto-conversion disables itself as a safety measure. You can re-enable it manually in Preferences.

### How do I get help?

- [GitHub Issues](https://github.com/Alpakash/copy-pasta-formaggi/issues) — bug reports and feature requests
- [Changelog](CHANGELOG.md) — what's new in each release

---

## Documentation

| Document | Description |
|---|---|
| [Onboarding](docs/ONBOARDING.md) | First-time user walkthrough |
| [Supported Formats](docs/FORMATS.md) | Full source → target conversion matrix |
| [Product Narrative](docs/PRODUCT_NARRATIVE.md) | What the app is and isn't |
| [PRD](docs/PRD.md) | Product requirements |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture |
| [Changelog](CHANGELOG.md) | Version history |
| [Privacy Policy](docs/PRIVACY.md) | Plain-English privacy |
| [Contributing](CONTRIBUTING.md) | How to write a UCF adapter |

## Development

TypeScript/Rust monorepo using pnpm workspaces and Tauri v2.

```bash
pnpm install          # Install dependencies
pnpm -w lint          # Lint all packages
pnpm -w typecheck     # Type-check all packages
pnpm -w test          # Run all tests
pnpm -w build         # Build for production
pnpm --filter desktop tauri dev   # Start desktop app in dev mode
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## License

See [LICENSE](LICENSE).

## Feedback

Found a bug? Use the **Feedback** button in the app or [open an issue](https://github.com/Alpakash/copy-pasta-formaggi/issues).

---

*Copy Pasta Formaggi v0.1.0-beta.1*
