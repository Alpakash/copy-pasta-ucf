import { type UcfDocument, type UcfParagraph, type UcfInline, UCF_VERSION } from "@copy-pasta/ucf-spec";

function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n?/g, "\n");
}

/**
 * Decode plain text into a UCF document.
 *
 * Splits input on blank lines into paragraphs,
 * and splits each paragraph on newlines into lines
 * joined by hardBreak nodes.
 */
export function decodePlainToUcf(input: string): UcfDocument {
  const cleaned = normalizeLineEndings(input).trim();
  if (!cleaned) {
    return { version: UCF_VERSION, blocks: [] };
  }

  const blocks: UcfParagraph[] = cleaned.split(/\n\n+/).map((paragraph) => {
    const lines = paragraph.split("\n");
    const inlines: UcfInline[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) inlines.push({ type: "hardBreak" });
      if (lines[i].length > 0) inlines.push({ type: "text", text: lines[i] });
    }
    return { type: "paragraph", children: inlines };
  });

  return { version: UCF_VERSION, blocks };
}

/**
 * Encode a UCF document to plain text.
 *
 * Concatenates text nodes within paragraphs,
 * joins paragraphs with double newlines.
 * Only handles paragraph blocks — headings, lists,
 * code blocks, and blockquotes are skipped.
 */
export function encodeUcfToPlain(doc: UcfDocument): string {
  return doc.blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return block.children
          .map((child) =>
            child.type === "text"
              ? child.text
              : child.type === "hardBreak"
                ? "\n"
                : ""
          )
          .join("");
      }
      return ""; // heading, list, codeBlock, blockquote, divider: skipped
    })
    .filter(Boolean)
    .join("\n\n");
}
