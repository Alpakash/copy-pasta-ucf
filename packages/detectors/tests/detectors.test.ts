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
