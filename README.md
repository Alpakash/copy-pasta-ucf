# Copy Pasta Formaggi — Open Source Packages

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

These are the open-source packages from [Copy Pasta Formaggi](https://copypastaformaggi.com) — a cross-application formatting translator that converts clipboard content between apps so your text looks right no matter where you paste it.

---

## What's in This Repo

| Package | Description |
|---|---|
| `@copy-pasta/ucf-spec` | UCF (Unified Canonical Format) type definitions and constants |
| `@copy-pasta/detectors` | Format detectors — identifies clipboard format (Markdown, HTML, plain text, PDF) |
| `@copy-pasta/adapter-reference` | Reference adapter implementation (plain text decode/encode) — use as a template for custom adapters |
| `@copy-pasta/eslint-config` | Shared ESLint configuration for all packages |

## What's NOT in This Repo

The core conversion engine and all production adapters (Slack, Gmail, Notion, Discord, Teams, Telegram, WhatsApp, ChatGPT, Claude, etc.) are **closed source** and live in the private [copy-pasta-formaggi](https://github.com/Alpakash/copy-pasta-formaggi) repository.

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

- [Copy Pasta Formaggi](https://copypastaformaggi.com) — download the app
- [Private repository](https://github.com/Alpakash/copy-pasta-formaggi) — note: requires authorization
- [Contributing Guide](CONTRIBUTING.md) — how to write adapters
- [Report an issue](https://github.com/Alpakash/copy-pasta-ucf/issues) — for open-source packages only
