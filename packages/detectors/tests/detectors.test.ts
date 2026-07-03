import { describe, expect, it } from "vitest";
import { detectFormat, normalizeForDetection } from "../src/index.js";

const markdownSample = [
  "# Sample Heading",
  "",
  "- Item one",
  "- Item two",
  "",
  "Here is some **bold text** and a code block:",
  "",
  "```",
  'console.log("hello world");',
  "```",
  "",
].join("\n");

const htmlSample = [
  '<div class="note">',
  "  <h1>Sample Heading</h1>",
  "  <p>This is a paragraph with a <strong>bold</strong> word.</p>",
  "  <ul>",
  "    <li>Item one</li>",
  "    <li>Item two</li>",
  "  </ul>",
  "</div>",
].join("\n");

const plainSample = [
  "This is a plain text paragraph with no special formatting signals.",
  "It spans multiple lines to resemble copied text.",
].join("\n");

describe("detectFormat", () => {
  it("detects HTML with high confidence", () => {
    const result = detectFormat(htmlSample);
    expect(result.format).toBe("html");
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("detects Markdown with high confidence", () => {
    const result = detectFormat(markdownSample);
    expect(result.format).toBe("markdown");
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it("detects plain text when no strong signals", () => {
    const result = detectFormat(plainSample);
    expect(result.format).toBe("plain");
    expect(result.confidence).toBeGreaterThanOrEqual(0.6);
  });

  it("avoids classifying generics or comparisons as HTML", () => {
    const genericSnippet = "Map<T> should not look like HTML";
    const comparisonSnippet = "a < b and c > d";

    const genericResult = detectFormat(genericSnippet);
    const comparisonResult = detectFormat(comparisonSnippet);

    expect(genericResult.format).not.toBe("html");
    expect(comparisonResult.format).not.toBe("html");
  });

  it("prefers HTML when mixed content includes strong tags", () => {
    const mixed = "Here is text before a tag <div><p>content</p></div> and after";
    const result = detectFormat(mixed);
    expect(result.format).toBe("html");
  });

  it("is deterministic for identical input", () => {
    const normalized = normalizeForDetection(markdownSample);
    const first = detectFormat(normalized);
    const second = detectFormat(normalized);
    expect(first).toStrictEqual(second);
  });
});

// P2 signaal 3 (on-the-fly variant): zonder expliciet PDF-signaal mag reflow
// alleen bij overweldigend bewijs — regels die midden in een zin afbreken en
// met een kleine letter doorgaan. Gedichten/adressen doen dat niet.
describe("looksLikePdfReflowStrict", () => {
  const paragraphLines = (lines: string[]) =>
    lines.map((line) => ({
      type: "paragraph" as const,
      children: [{ type: "text" as const, text: line }],
    }));

  const pdfProse = [
    "Machine learning is a subset of artificial intelligence that focuses on",
    "building systems that can learn from data without being explicitly",
    "programmed to perform a task. Rather than following fixed rules, these",
    "systems use statistical algorithms to identify patterns in large datasets",
    "and improve their performance over time as they process more examples.",
    "The field has grown rapidly in recent years thanks to advances in",
    "computing power, the availability of massive datasets, and improved",
    "algorithms that can train much deeper neural networks than before.",
  ];

  const poem = [
    "The morning light falls gently on the quiet harbor town",
    "Where fishing boats are resting on the water calm and still",
    "A seagull circles slowly high above the wooden pier",
    "And somewhere in the distance rings a lonely chapel bell",
    "The nets are hanging heavy from the beams along the dock",
    "While fishermen are mending what the storm has torn apart",
    "The salty air is carrying the stories of the sea",
    "To every open window on the street along the shore",
  ];

  it("fires on line-wrapped pdf prose (lowercase continuations)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    expect(looksLikePdfReflowStrict(paragraphLines(pdfProse))).toBe(true);
  });

  it("does not fire on a poem (self-contained lines)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    expect(looksLikePdfReflowStrict(paragraphLines(poem))).toBe(false);
  });

  it("does not fire on short chat-like lines", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    const chat = ["yo man", "still in casablanca?", "yeah around the corner",
      "come thru", "bet", "on my way now", "cool see you", "in five minutes"];
    expect(looksLikePdfReflowStrict(paragraphLines(chat))).toBe(false);
  });

  it("does not fire on an address block (too few lines)", async () => {
    const { looksLikePdfReflowStrict } = await import("../src/index.js");
    const address = ["Jan Jansen", "Kerkstraat 12", "1234 AB Amsterdam", "Nederland"];
    expect(looksLikePdfReflowStrict(paragraphLines(address))).toBe(false);
  });
});
