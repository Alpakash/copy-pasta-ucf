# Contributing to Copy Pasta Formaggi

Thanks for your interest in contributing. This guide covers how to write a UCF adapter — the core building block that adds support for a new source or target format.

## What is a UCF Adapter?

A UCF adapter translates between a specific format (Markdown, HTML, Slack mrkdwn, etc.) and the [Unified Canonical Format (UCF)](https://github.com/Alpakash/copy-pasta-ucf). Each adapter has two functions:

- **Decode:** Parse a formatted string into a `UcfDocument`
- **Encode:** Serialize a `UcfDocument` back to a formatted string

The UCF is the intermediate representation that sits between all formats. Once a format has a decoder and encoder, it can convert to and from every other supported format.

## Getting Started

### 1. Install the UCF spec

```bash
npm install @copy-pasta/ucf-spec
```

This package provides the TypeScript types you need: `UcfDocument`, `UcfBlock`, `UcfInline`, and all their variants.

### 2. Study the reference adapter

The [adapter-reference](https://github.com/Alpakash/copy-pasta-ucf/tree/main/packages/adapter-reference) package in the public mirror repo contains a minimal plain-text adapter with tests. It demonstrates the canonical decode/encode pattern.

### 3. Implement your adapter

Create a new file (e.g., `my-format-adapter.ts`) with this structure:

```typescript
import type { UcfDocument } from "@copy-pasta/ucf-spec";

export const FORMAT_KEY = "my-format" as const;

/**
 * Decode a formatted string into a UcfDocument.
 */
export function decode(input: string): UcfDocument {
  // Parse the input string and build a UcfDocument tree.
  // Return an empty document (no blocks) for empty input.
  // Throw on irrecoverable parse errors.
}

/**
 * Encode a UcfDocument back to a formatted string.
 */
export function encode(doc: UcfDocument): string {
  // Walk the UcfDocument tree and produce the output string.
  // Strip unrecognized block types (don't crash on them).
  // Return "" for an empty document.
}
```

### 4. Write tests

Tests verify correctness and prevent regressions. Write at minimum:

- **Empty input:** decode("") returns an empty document
- **Roundtrip:** encode(decode(input)) produces a semantically equivalent output
- **Known fixtures:** specific input strings produce expected `UcfDocument` structures
- **Edge cases:** nested structures, unusual whitespace, Unicode characters

### 5. Register your adapter

Once your adapter is ready, add it to the engine's decoder/encoder maps in the main repository. Open a pull request with:

- Your adapter implementation and tests
- Evidence of roundtrip correctness
- A note about any known limitations

## Design Principles

### Decoders must be lossy-tolerant

Real-world input is messy. A decoder should parse what it can and skip what it can't. Never throw on malformed input — return a best-effort document instead. Only throw on truly irrecoverable states.

### Encoders must never crash

An encoder receives a canonical UCF document that may contain block types it doesn't recognize (from other formats). Strip them silently. Never throw because of an unknown block or inline type.

### Determinism is non-negotiable

The same input must always produce the same output. No randomness, no timestamps, no external state. This is what makes golden-fixture testing possible.

### Preserve what you can, strip what you must

If a format supports bold text, encode it. If it doesn't, strip the bold annotation but keep the text content. Data loss is acceptable — data corruption is not.

## UCF Document Structure

A `UcfDocument` is a tree:

```
UcfDocument
  └─ blocks: UcfBlock[]
       ├─ UcfParagraph { inlines: UcfInline[] }
       ├─ UcfHeading { level: 1-6, inlines: UcfInline[] }
       ├─ UcfList { ordered, items: UcfListItem[] }
       ├─ UcfCodeBlock { language?, lines: string[] }
       ├─ UcfBlockQuote { blocks: UcfBlock[] }
       └─ UcfDivider
```

Inlines:
```
UcfText { text: string, marks?: UcfInlineMark[] }
UcfHardBreak
UcfInlineCode { text: string }
UcfLink { url: string, inlines: UcfInline[] }
```

For the complete type definitions, see the [@copy-pasta/ucf-spec](https://github.com/Alpakash/copy-pasta-ucf/tree/main/packages/ucf-spec) package.

## Questions?

Open an issue on the [public mirror repo](https://github.com/Alpakash/copy-pasta-ucf/issues) or the [main repo](https://github.com/Alpakash/copy-pasta-formaggi/issues). Tag it with `adapter` or `contributing`.
