# @copy-pasta/ucf-spec

UCF (Unified Canonical Format) type definitions and version constant.

UCF is the intermediate document model at the heart of Copy Pasta Formaggi. Instead of writing N×M converters between every pair of formats, you write one **decoder** (source → UCF) and one **encoder** (UCF → target).

## Document Model

```
UcfDocument
├── version: "0.2"
├── meta?: Record<string, unknown>
└── blocks: UcfBlock[]
    ├── UcfParagraph     { children: UcfInline[] }
    ├── UcfHeading       { level: 1-6, children: UcfInline[] }
    ├── UcfList          { ordered, start?, items: UcfListItem[] }
    ├── UcfCodeBlock     { text, language? }
    ├── UcfBlockQuote    { blocks: UcfBlock[] }
    └── UcfDivider       {}
```

## Install

```bash
pnpm add @copy-pasta/ucf-spec
```

## Usage

```typescript
import { type UcfDocument, type UcfParagraph, UCF_VERSION } from "@copy-pasta/ucf-spec";

const doc: UcfDocument = {
  version: UCF_VERSION,
  blocks: [{ type: "paragraph", children: [{ type: "text", text: "Hello" }] }]
};
```

## License

MIT
