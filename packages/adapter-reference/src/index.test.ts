import { describe, it, expect } from "vitest";
import type { UcfParagraph } from "@copy-pasta/ucf-spec";
import { decodePlainToUcf, encodeUcfToPlain } from "./index";

describe("decodePlainToUcf", () => {
  it("handles empty input", () => {
    const result = decodePlainToUcf("");
    expect(result.blocks).toHaveLength(0);
  });

  it("handles whitespace-only input", () => {
    const result = decodePlainToUcf("   \n\n  ");
    expect(result.blocks).toHaveLength(0);
  });

  it("decodes a single line into one paragraph", () => {
    const result = decodePlainToUcf("Hello world");
    expect(result.blocks).toHaveLength(1);
    const para = result.blocks[0] as UcfParagraph;
    expect(para.type).toBe("paragraph");
    expect(para.children[0].type).toBe("text");
    expect((para.children[0] as { text: string }).text).toBe("Hello world");
  });

  it("splits on blank lines into paragraphs", () => {
    const result = decodePlainToUcf("First paragraph\n\nSecond paragraph");
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0].type).toBe("paragraph");
    expect(result.blocks[1].type).toBe("paragraph");
  });

  it("converts single newlines to hardBreak nodes", () => {
    const result = decodePlainToUcf("Line one\nLine two\nLine three");
    expect(result.blocks).toHaveLength(1);
    const para = result.blocks[0] as UcfParagraph;
    const children = para.children;
    // text, hardBreak, text, hardBreak, text
    expect(children).toHaveLength(5);
    expect(children[0].type).toBe("text");
    expect(children[1].type).toBe("hardBreak");
    expect(children[2].type).toBe("text");
    expect(children[3].type).toBe("hardBreak");
    expect(children[4].type).toBe("text");
  });

  it("normalizes CRLF to LF", () => {
    const result = decodePlainToUcf("Hello\r\nWorld");
    expect(result.blocks).toHaveLength(1);
    const para = result.blocks[0] as UcfParagraph;
    const children = para.children;
    expect(children).toHaveLength(3); // text, hardBreak, text
  });

  it("sets the UCF version", () => {
    const result = decodePlainToUcf("test");
    expect(result.version).toBe("0.2");
  });
});

describe("encodeUcfToPlain", () => {
  it("encodes a single paragraph with text", () => {
    const doc = decodePlainToUcf("Hello world");
    const result = encodeUcfToPlain(doc);
    expect(result).toBe("Hello world");
  });

  it("encodes multiple paragraphs", () => {
    const doc = decodePlainToUcf("First\n\nSecond");
    const result = encodeUcfToPlain(doc);
    expect(result).toBe("First\n\nSecond");
  });

  it("preserves hard breaks", () => {
    const doc = decodePlainToUcf("Line one\nLine two");
    const result = encodeUcfToPlain(doc);
    expect(result).toBe("Line one\nLine two");
  });

  it("roundtrips: decode then encode returns original", () => {
    const input = "Paragraph one\n\nParagraph two\nwith a line break";
    const doc = decodePlainToUcf(input);
    const output = encodeUcfToPlain(doc);
    expect(output).toBe(input);
  });

  it("handles empty document", () => {
    const doc = decodePlainToUcf("");
    const result = encodeUcfToPlain(doc);
    expect(result).toBe("");
  });
});
