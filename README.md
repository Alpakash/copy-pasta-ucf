# Copy Pasta Formaggi — Open Source

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Looking for the app?** [Download Copy Pasta Formaggi for macOS](https://github.com/Alpakash/copy-pasta-ucf/releases/latest) — copy text anywhere, paste it perfectly. See [Install the app](#install-the-app) below.

These are the open-source packages from [Copy Pasta Formaggi](https://copypastaformaggi.com) — a cross-application formatting translator that converts clipboard content between apps so your text looks right no matter where you paste it.

---

## Install the app

**Requirements:** macOS 13 (Ventura) or later on Apple Silicon. Intel Macs are not supported.

1. Download the latest `.dmg` from the [releases page](https://github.com/Alpakash/copy-pasta-ucf/releases/latest).
2. Open the DMG and drag **Copy Pasta Formaggi** to **Applications**.
3. **First launch:** the beta is not yet notarized by Apple. Right-click the app → **Open**, then click **Open** in the dialog (or **System Settings → Privacy & Security → Open Anyway**). This is a one-time step.
4. Grant **Accessibility** when asked: the app needs it to see your paste shortcut.

The app lives in your menu bar. Click the icon for the main window; right-click it for **Show Window** and **Quit**. Paste with **⌘V** and the app converts the clipboard for the app you paste into; per-app choices are in **Settings → Apps**, and **Safe mode** in the main window pauses conversion.

**Homebrew:** there is no Homebrew tap yet; use the DMG.

**Windows (preview):** the releases page also has a `*-preview-setup.exe` — unsigned, no in-app updates, far less tested than macOS. Default paste shortcut: Ctrl+Shift+V.

**Uninstall:** right-click the menu-bar icon → **Quit**, drag the app to the Trash, and optionally remove `~/Library/Application Support/com.copy-pasta.desktop`.

## Help and feedback

One place for bugs, questions and ideas: [GitHub Issues](https://github.com/Alpakash/copy-pasta-ucf/issues). The **Feedback** button in the app opens a pre-filled issue there. Mention the app you copied from, the app you pasted into, and what you expected.

Common fixes:

- **"App is damaged and can't be opened":** run `xattr -cr "/Applications/Copy Pasta Formaggi.app"` and open it again.
- **Nothing gets converted:** check that **Safe mode** is off (the app turns it on after three failed conversions within two minutes), that Accessibility is enabled for the app in **System Settings → Privacy & Security**, and that the target app is not disabled in **Settings → Apps**.
- **No menu-bar icon:** a menu-bar manager (Bartender, Hidden Bar) may be hiding it.

## What's in This Repo

| Package | Description |
|---|---|
| `@copy-pasta/ucf-spec` | UCF (Unified Canonical Format) type definitions and constants |
| `@copy-pasta/detectors` | Format detectors — identifies clipboard format (Markdown, HTML, plain text, PDF) |
| `@copy-pasta/adapter-reference` | Reference adapter implementation (plain text decode/encode) — use as a template for custom adapters |
| `@copy-pasta/eslint-config` | Shared ESLint configuration for all packages |

The full app with all production adapters is available at [copypastaformaggi.com](https://copypastaformaggi.com). These packages are the open-source foundation you can use to build custom integrations, write your own adapters, or embed UCF in other tools.

## Getting Started

```bash
git clone https://github.com/Alpakash/copy-pasta-ucf.git
cd copy-pasta-ucf
pnpm install
pnpm test
```

### Write Your Own Adapter

See [CONTRIBUTING.md](CONTRIBUTING.md) for a step-by-step guide on writing a UCF adapter. The `@copy-pasta/adapter-reference` package is a minimal, well-commented reference implementation.

The basic pattern:

1. **Detect** the source format → `@copy-pasta/detectors`
2. **Decode** into UCF (Unified Canonical Format) → implement a decoder using `@copy-pasta/ucf-spec` types
3. **Encode** from UCF to your target format → implement an encoder
4. **Test** with the provided fixtures

## UCF (Unified Canonical Format)

UCF is a structured document model that sits between source and target formats. Instead of writing N×M format converters, you write one decoder (source → UCF) and one encoder (UCF → target).

```
Source format → [Decoder] → UCF → [Encoder] → Target format
```

UCF represents documents as blocks (paragraphs, headings, lists, code blocks, blockquotes, dividers) with inline content (text, bold, italic, links, inline code, hard breaks).

## License

MIT — see [LICENSE](LICENSE).

## Links

- [Download the app](https://github.com/Alpakash/copy-pasta-ucf/releases/latest) — macOS (Apple Silicon), free beta, plus a Windows preview installer
- [Copy Pasta Formaggi](https://copypastaformaggi.com) — marketing site
- [Contributing Guide](CONTRIBUTING.md) — how to write adapters
- [Issues](https://github.com/Alpakash/copy-pasta-ucf/issues) — app bugs, feature requests and package issues, all in one place
