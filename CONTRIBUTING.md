# Contributing to Copy Pasta Formaggi

Thanks for your interest in contributing. This guide walks you through writing a UCF adapter — the building block that adds support for a new format.

---

## Quick Start: Build Your First Adapter in 5 Minutes

This section gives you a working adapter you can copy, run, and modify. We'll build a **Markdown-to-UCF decoder** together.

### Step 1 — Install the dependencies

```bash
mkdir my-adapter && cd my-adapter
pnpm init
pnpm add @copy-pasta/ucf-spec @copy-pasta/detectors
pnpm add -D typescript vitest @copy-pasta/eslint-config
```

### Step 2 — Create the decoder

Create `src/decode.ts`:

```typescript
import type { UcfDocument, UcfBlock, UcfInline } from "@copy-pasta/ucf-spec";
import { UCF_VERSION } from "@copy-pasta/ucf-spec";

/**
 * Decode a Markdown string into a UcfDocument.
 *
 * This is a minimal decoder. It supports:
 *   - Paragraphs (separated by blank lines)
 *   - Bold (**text**)
 *   - Italic (*text*)
 *   - Inline code (`text`)
 */
export function decodeMarkdown(input: string): UcfDocument {
  if (!input.trim()) return { version: UCF_VERSION, blocks: [] };

  const blocks: UcfBlock[] = [];

  // Split on blank lines to get paragraphs
  const paragraphs = input.trim().split(/\n\n+/);

  for (const paraText of paragraphs) {
    const inlines = parseInlineMarkdown(paraText.replace(/\n/g, " "));
    blocks.push({ type: "paragraph", children: inlines });
  }

  return { version: UCF_VERSION, blocks };
}

function parseInlineMarkdown(text: string): UcfInline[] {
  const result: UcfInline[] = [];
  // Match: **bold**, *italic*, `code`, or plain text
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // **bold**
      result.push({ type: "text", text: match[2], marks: [{ type: "bold" }] });
    } else if (match[3]) {
      // *italic*
      result.push({ type: "text", text: match[4], marks: [{ type: "italic" }] });
    } else if (match[5]) {
      // `code`
      result.push({ type: "inlineCode", text: match[6] });
    } else if (match[7]) {
      // plain text
      result.push({ type: "text", text: match[7] });
    }
  }

  return result;
}
```

### Step 3 — Write a test

Create `src/decode.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { decodeMarkdown } from "./decode";

describe("decodeMarkdown", () => {
  it("handles empty input", () => {
    const result = decodeMarkdown("");
    expect(result.blocks).toHaveLength(0);
  });

  it("decodes a plain paragraph", () => {
    const result = decodeMarkdown("Hello world");
    expect(result.blocks[0].type).toBe("paragraph");
    expect(result.blocks[0].children[0]).toEqual({
      type: "text",
      text: "Hello world",
    });
  });

  it("decodes bold text", () => {
    const result = decodeMarkdown("**bold** text");
    const children = result.blocks[0].children;
    expect(children[0]).toEqual({
      type: "text",
      text: "bold",
      marks: [{ type: "bold" }],
    });
    expect(children[1]).toEqual({ type: "text", text: " text" });
  });

  it("decodes multiple paragraphs", () => {
    const result = decodeMarkdown("First\n\nSecond");
    expect(result.blocks).toHaveLength(2);
  });
});
```

### Step 4 — Run the tests

```bash
pnpm vitest run
```

You now have a working Markdown decoder. Replace `decodeMarkdown` with your own format, add an encoder, and you've built a UCF adapter.

---

## Understanding UCF (Unified Canonical Format)

UCF is the intermediate document model. Instead of writing N×M converters between every pair of formats, you write **one decoder** (your format → UCF) and **one encoder** (UCF → your format).

```
Your format ──[decode]──>  UCF  ──[encode]──> Any other format
```

### Document Tree

```
UcfDocument
├── version: "0.2"
└── blocks: UcfBlock[]
    ├── UcfParagraph      { type: "paragraph",   children: UcfInline[] }
    ├── UcfHeading        { type: "heading",     level: 1-6, children: UcfInline[] }
    ├── UcfList           { type: "list",        ordered: bool, items: UcfListItem[] }
    │   └── UcfListItem   { type: "listItem",    level: number, blocks: UcfBlock[] }
    ├── UcfCodeBlock      { type: "codeBlock",   text: string, language?: string }
    ├── UcfBlockQuote     { type: "blockquote",  blocks: UcfBlock[] }
    └── UcfDivider        { type: "divider" }
```

### Inline Content

```
UcfInline (union):
├── UcfText        { type: "text",        text: string, marks?: UcfInlineMark[] }
├── UcfHardBreak   { type: "hardBreak" }
├── UcfInlineCode  { type: "inlineCode",  text: string }
└── UcfLink        { type: "link",        href: string, children: UcfInline[] }

UcfInlineMark: "bold" | "italic" | "underline" | "strikethrough"
```

Full type definitions: [@copy-pasta/ucf-spec](https://github.com/Alpakash/copy-pasta-ucf/tree/main/packages/ucf-spec)

---

## Architecture: Decoder + Encoder

Every adapter exports two functions:

```typescript
import type { UcfDocument } from "@copy-pasta/ucf-spec";
import { UCF_VERSION } from "@copy-pasta/ucf-spec";

export const FORMAT_ID = "my-format" as const;

/**
 * Decoder: raw input string → UcfDocument
 *
 * Rules:
 *   - Empty/whitespace-only input → return { version: UCF_VERSION, blocks: [] }
 *   - Malformed input → parse what you can, skip what you can't
 *   - Only throw on truly unrecoverable states (e.g. binary garbage)
 */
export function decode(input: string): UcfDocument {
  if (!input.trim()) return { version: UCF_VERSION, blocks: [] };
  // ... parse input into blocks and inlines ...
  return { version: UCF_VERSION, blocks: [] };
}

/**
 * Encoder: UcfDocument → formatted output string
 *
 * Rules:
 *   - Empty document → return ""
 *   - Unknown block types → strip silently (don't crash)
 *   - Unsupported inline marks → strip the mark, keep the text
 *   - Never throw
 */
export function encode(doc: UcfDocument): string {
  if (doc.blocks.length === 0) return "";
  // ... walk blocks, produce output ...
  return "";
}
```

### Use the reference adapter as your template

Copy the [adapter-reference](https://github.com/Alpakash/copy-pasta-ucf/tree/main/packages/adapter-reference) package. It's a minimal, working plain-text decoder + encoder with tests. Replace the logic with your own format.

---

## Design Rules (READ THIS)

### 1. Decoders: lossy-tolerant

Real-world input is messy. Parse what you can, skip what you can't. Never throw on malformed input.

```typescript
// Good: graceful fallback
const blocks = parseWhateverYouCan(dirtyInput);

// Bad: don't do this
if (!input.startsWith("<valid>")) throw new Error("Invalid format");
```

### 2. Encoders: never crash

An encoder receives UCF documents that may contain block types from other formats. Strip them silently.

```typescript
function encodeBlock(block: UcfBlock): string {
  switch (block.type) {
    case "paragraph": return encodeParagraph(block);
    case "heading":   return encodeHeading(block);
    // ... handle what you support ...
    default:
      // Unknown block type — skip it
      return "";
  }
}
```

### 3. 100% deterministic

Same input → same output. Always. No randomness, no timestamps, no external state. This makes golden-fixture testing reliable.

### 4. Data loss is acceptable, data corruption is not

If your format doesn't support bold, strip the bold mark but **keep the text**. The user's words must survive.

```typescript
function encodeInline(inline: UcfInline): string {
  if (inline.type === "text") {
    return inline.text; // Marks are ignored if unsupported — text is preserved
  }
  if (inline.type === "inlineCode") {
    return inline.text; // Backticks are stripped — text is preserved
  }
  // ... etc
}
```

---

## Testing Your Adapter

Minimum test coverage:

| Test | What it checks |
|---|---|
| Empty input | `decode("")` → `{ blocks: [] }` |
| Whitespace only | `decode("  \n  ")` → `{ blocks: [] }` |
| Simple roundtrip | `encode(decode("hello"))` ≈ `"hello"` (semantically equivalent) |
| Structure | Known input produces expected block types and counts |
| Inlines | Bold, italic, code, links are correctly parsed |
| Edge cases | Nested structures, unusual whitespace, Unicode, emoji |
| Unknown blocks | Encoder doesn't crash on blocks from other formats |

### Test helpers

```typescript
import { describe, it, expect } from "vitest";
import type { UcfDocument, UcfParagraph } from "@copy-pasta/ucf-spec";

/** Narrow a UcfBlock to a specific type for safer test assertions */
function asParagraph(doc: UcfDocument, index = 0): UcfParagraph {
  const block = doc.blocks[index];
  if (block.type !== "paragraph") throw new Error(`Expected paragraph, got ${block.type}`);
  return block;
}

it("example", () => {
  const doc = decode("hello");
  const para = asParagraph(doc);
  expect(para.children[0]).toEqual({ type: "text", text: "hello" });
});
```

---

## Common Pitfalls

**"My adapter works but the app ignores it"**

Adapters must be registered in the engine's adapter map. Community adapters follow a different path than built-in adapters — see [Publishing](#publishing-your-adapter) below.

**"encode(decode(x)) !== x"**

This is expected. Roundtrips are lossy by design. Bold in HTML → plain text drops the bold. What matters is **semantic equivalence** — the meaning is preserved.

**"I'm getting type errors on UcfBlock.children"**

`UcfBlock` is a union type. Only `UcfParagraph` and `UcfHeading` have `children`. Use type narrowing:

```typescript
if (block.type === "paragraph" || block.type === "heading") {
  block.children; // ✅ TypeScript knows this is safe
}
```

**"My decoder crashes on HTML with weird nesting"**

Remember Rule #1: parse what you can, skip what you can't. Use `try/catch` around risky parsing and fall back to plain text.

---

## Publishing Your Adapter

Community adapters are published as standalone npm packages. You own the package and maintain it.

1. **Name it:** `@your-scope/copy-pasta-adapter-<format>` or `copy-pasta-adapter-<format>`
2. **Publish to npm:** `pnpm publish --access public`
3. **Tell us about it:** Open an issue on [copy-pasta-ucf](https://github.com/Alpakash/copy-pasta-ucf/issues) with:
   - Link to your package
   - What format(s) it supports
   - Any known limitations
4. **We'll list it** in the community adapters section of the README

---

## Checklist Before Submitting

- [ ] Decoder handles empty input (returns `{ blocks: [] }`)
- [ ] Decoder is lossy-tolerant (never throws on malformed input)
- [ ] Encoder never crashes on unknown block/inline types
- [ ] Roundtrip test passes: `encode(decode(input))` produces sensible output
- [ ] All functions are deterministic (no randomness, no dates, no external state)
- [ ] Tests cover: empty, simple, edge cases, nested structures
- [ ] `FORMAT_ID` is defined and unique
- [ ] Package has a README with install + usage

---

## Questions?

- **Package issues** (UCF spec, detectors, adapter reference, ESLint config) — open on [copy-pasta-ucf/issues](https://github.com/Alpakash/copy-pasta-ucf/issues)
- **App bugs & feature requests** — use the [Canny board](https://copypastaformaggi.canny.io/feature-requests) or the in-app Feedback button
