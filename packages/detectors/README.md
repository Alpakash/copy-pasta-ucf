# @copy-pasta/detectors

Deterministic heuristics for identifying likely source formats of clipboard content.

## API

```typescript
import { detectFormat } from "@copy-pasta/detectors";

const result = detectFormat("<p>Hello</p>");
// { format: "html", confidence: 0.9, reasons: ["Contains HTML-like opening tag", ...] }
```

- `detectFormat(input: string): DetectionResult`
  - `format`: `"markdown" | "html" | "plain" | "unknown"`
  - `confidence`: number between 0 and 1
  - `reasons`: deterministic explanations of the signals used

All detection logic is pure and deterministic; no network or side effects.

## Install

```bash
pnpm add @copy-pasta/detectors
```

## License

MIT
