# @copy-pasta/adapter-reference

Reference adapter implementation for Copy Pasta Formaggi. A minimal, well-commented example of how to build a UCF adapter.

## What It Does

- **Decode**: plain text → UCF (splits on blank lines into paragraphs, single newlines into hardBreaks)
- **Encode**: UCF → plain text (reconstructs paragraphs with newlines)

## Use as a Template

Copy this package to implement your own source/target format:

1. **Detect** the source format → use `@copy-pasta/detectors`
2. **Decode** into UCF → implement a decoder using `@copy-pasta/ucf-spec` types
3. **Encode** from UCF to your target format → implement an encoder
4. **Test** with the provided fixture pattern

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for the full guide.

## Install

```bash
pnpm add @copy-pasta/adapter-reference
```

## Usage

```typescript
import { decodePlainToUcf, encodeUcfToPlain } from "@copy-pasta/adapter-reference";

const ucf = decodePlainToUcf("Hello world\n\nSecond paragraph");
const text = encodeUcfToPlain(ucf);
```

## License

MIT
