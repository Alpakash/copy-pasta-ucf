import { type UcfBlock } from "@copy-pasta/core";

export type DetectedFormat = "markdown" | "html" | "plain" | "unknown";

export type DetectionResult = {
  format: DetectedFormat;
  confidence: number;
  reasons: string[];
};

const tagPattern = /<\s*([a-z][a-z0-9]*)\b[^>]*>/i;
const closingTagPattern = /<\s*\/\s*([a-z][a-z0-9]*)\s*>/i;
const commonHtmlPattern = /<\/?(p|div|br|ul|ol|li|h[1-6]|span|strong|em|a|table|thead|tbody|tr|td|th)\b[^>]*>/i;
const doctypePattern = /<!DOCTYPE|<html\b|<body\b/i;
const uppercaseTagPattern = /<\s*[A-Z][A-Za-z0-9_]*\s*>/;

const codeFencePattern = /(^|\n)```/;
const headingPattern = /(^|\n)#{1,6}\s+\S+/;
const listPattern = /(^|\n)(\s*[-*+]\s+\S+|\s*\d+\.\s+\S+)/;
const bulletSymbolPattern = /(^|\n)\s*•\s+\S+/;
const hrPattern = /(^|\n)(-{3,}|\*{3,}|_{3,})(\s|$)/;
const blockquotePattern = /(^|\n)\s*(>|&gt;)\s+\S+/;
const emphasisPattern = /(\*\*[^*]+\*\*|_[^_]+_)/;
const markdownLinkPattern = /\[[^\]]+\]\([^)]+\)/;
const singleAsteriskPattern = /(^|\s)\*[^\s*][^*]*\*(?=\s|$)/;
const singleUnderscorePattern = /(^|\s)_[^_\s][^_]*_(?=\s|$)/;
const singleTildePattern = /(^|\s)~[^~\s][^~]*~(?=\s|$)/;
const slackLinkPattern = /<\s*(https?:\/\/|mailto:|tel:)[^>|]+(\|[^>]+)?>/i;
const markdownFencePattern = /^(```|~~~)/m;
const markdownHeadingPattern = /^#{1,6}\s+\S+/m;
const markdownListPattern = /^(\s{0,3}[-*+]\s+\S+|\s{0,3}\d+\.\s+\S+)/m;
const markdownBlockquotePattern = /^>\s+\S+/m;
const markdownHrPattern = /^(\*\s*){3,}$|^(-\s*){3,}$/m;
const markdownHeadingPatternGlobal = /^#{1,6}\s+\S+/gm;
const markdownListPatternGlobal = /^(\s{0,3}[-*+]\s+\S+|\s{0,3}\d+\.\s+\S+)/gm;

export function normalizeForDetection(input: string): string {
  return input.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "").trim();
}

export function looksLikeMarkdown(input: string): boolean {
  const normalized = normalizeForDetection(input);
  if (!normalized) {
    return false;
  }

  if (markdownFencePattern.test(normalized)) {
    return true;
  }

  const headingMatches = normalized.match(markdownHeadingPatternGlobal) ?? [];
  if (headingMatches.length >= 2) {
    return true;
  }

  const listMatches = normalized.match(markdownListPatternGlobal) ?? [];
  if (listMatches.length > 0) {
    const cleaned = listMatches.map((line) => line.trimStart());
    const markers = cleaned.map((line) => {
      if (/^\d+\.\s+/.test(line)) {
        return "ordered";
      }
      const marker = /^([-*+])\s+/.exec(line);
      return marker ? marker[1] : "unknown";
    });
    const consistentMarkers = markers.every((marker) => marker === markers[0]);
    const hasLink =
      markdownLinkPattern.test(normalized) ||
      slackLinkPattern.test(normalized) ||
      /https?:\/\/\S+/i.test(normalized);
    const hasIndent = cleaned.some((line) => /^\s{2,}/.test(line));
    const hasBlankLine = /\n\s*\n/.test(normalized);

    if (consistentMarkers && (hasLink || hasIndent || hasBlankLine)) {
      return true;
    }
  }

  let signals = 0;
  if (markdownHeadingPattern.test(normalized)) {
    signals += 1;
  }
  if (markdownListPattern.test(normalized)) {
    signals += 1;
  }
  if (markdownBlockquotePattern.test(normalized)) {
    signals += 1;
  }
  if (markdownHrPattern.test(normalized)) {
    signals += 1;
  }

  return signals >= 2;
}

export function detectFormat(input: string): DetectionResult {
  const normalized = normalizeForDetection(input);

  if (!normalized) {
    return {
      format: "unknown",
      confidence: 0.1,
      reasons: ["Empty or whitespace-only input"],
    };
  }

  const htmlResult = detectHtml(normalized);
  if (htmlResult) {
    return htmlResult;
  }

  const markdownResult = detectMarkdown(normalized);
  if (markdownResult) {
    return markdownResult;
  }

  return {
    format: "plain",
    confidence: 0.7,
    reasons: ["No strong HTML or Markdown indicators detected"],
  };
}

function detectHtml(text: string): DetectionResult | null {
  const reasons: string[] = [];
  let score = 0;

  if (tagPattern.test(text)) {
    score += 0.4;
    reasons.push("Contains HTML-like opening tag");
  }

  if (closingTagPattern.test(text)) {
    score += 0.2;
    reasons.push("Contains HTML closing tag");
  }

  if (commonHtmlPattern.test(text)) {
    score += 0.2;
    reasons.push("Includes common HTML structure tags");
  }

  if (doctypePattern.test(text)) {
    score += 0.2;
    reasons.push("Contains HTML document markers");
  }

  if (uppercaseTagPattern.test(text) && !commonHtmlPattern.test(text)) {
    score -= 0.3;
    reasons.push("Uppercase angle-bracket pattern likely generic code");
  }

  if (score <= 0.3) {
    return null;
  }

  const confidence = Math.min(0.95, 0.6 + Math.max(score, 0) * 0.4);

  if (confidence < 0.8) {
    return null;
  }

  return {
    format: "html",
    confidence,
    reasons,
  };
}

function detectMarkdown(text: string): DetectionResult | null {
  const reasons: string[] = [];
  let score = 0;

  if (codeFencePattern.test(text)) {
    score += 0.35;
    reasons.push("Contains fenced code block");
  }

  if (headingPattern.test(text)) {
    score += 0.25;
    reasons.push("Has Markdown-style heading");
  }

  if (listPattern.test(text)) {
    score += 0.2;
    reasons.push("Has Markdown list markers");
  }

  const bulletMatches = text.match(new RegExp(bulletSymbolPattern.source, bulletSymbolPattern.flags + "g"));
  if (bulletMatches && bulletMatches.length >= 2) {
    score += 0.15;
    reasons.push("Has multiple bullet symbol list markers");
  }

  // Only score numbered lists if there are 2+ consecutive numbered items
  const orderedMatches = text.match(/(^|\n)\s*\d+\.\s+\S+/g);
  if (orderedMatches && orderedMatches.length >= 2) {
    score += 0.15;
    reasons.push("Has multiple ordered list markers");
  }

  if (blockquotePattern.test(text)) {
    score += 0.2;
    reasons.push("Includes Markdown blockquote markers");
  }

  if (hrPattern.test(text)) {
    score += 0.2;
    reasons.push("Includes horizontal rule markers");
  }

  if (emphasisPattern.test(text)) {
    score += 0.1;
    reasons.push("Includes Markdown emphasis patterns");
  }

  if (markdownLinkPattern.test(text)) {
    score += 0.2;
    reasons.push("Includes Markdown link patterns");
  }

  if (singleAsteriskPattern.test(text)) {
    score += 0.3;
    reasons.push("Includes single-asterisk emphasis patterns");
  }

  if (singleUnderscorePattern.test(text)) {
    score += 0.2;
    reasons.push("Includes single-underscore emphasis patterns");
  }

  if (singleTildePattern.test(text)) {
    score += 0.2;
    reasons.push("Includes single-tilde emphasis patterns");
  }

  if (slackLinkPattern.test(text)) {
    score += 0.3;
    reasons.push("Includes Slack-style link patterns");
  }

  if (score < 0.3) {
    return null;
  }

  const confidence = Math.min(0.9, 0.6 + score * 0.3);

  return {
    format: "markdown",
    confidence,
    reasons,
  };
}

/**
 * Detect whether a set of decoded UCF blocks looks like PDF-sourced content
 * that needs line-merge reflow. This is a content-based detector that works
 * regardless of which PDF app produced the clipboard content.
 *
 * Signals:
 * 1. Many blocks (> 5) with no semantic structure (no headings, lists, tables,
 *    blockquotes, code blocks, dividers)
 * 2. Mean paragraph length is short (< 100 chars) — PDF lines are wrapped at
 *    page width, typically 60-90 chars
 * 3. Line lengths are clustered (low coefficient of variation) —
 *    PDF column wraps produce similar-length lines
 * 4. Few paragraphs end with terminal punctuation (.!?) — wrapped lines
 *    don't end sentences
 */
export function looksLikePdfReflow(blocks: UcfBlock[]): boolean {
  // Need enough blocks to detect a pattern
  if (blocks.length < 8) return false;

  // Signal 1: No semantic blocks at all (only paragraphs)
  const hasNonHeadingSemantic = blocks.some(
    (b) =>
      b.type === "list" ||
      b.type === "table" ||
      b.type === "blockquote" ||
      b.type === "codeBlock" ||
      b.type === "divider"
  );
  if (hasNonHeadingSemantic) return false;

  // Only analyze paragraph blocks
  const paragraphs = blocks.filter((b) => b.type === "paragraph");
  if (paragraphs.length < 8) return false;

  // Signal 0: Exclude chat/CLI logs — these contain emoji, symbols, or
  // log-like markers that PDFs never have
  const hasLogMarkers = paragraphs.some((p) => {
    const text = p.children
      .map((c) => (c.type === "text" ? c.text : c.type === "inlineCode" ? c.text : ""))
      .join("")
      .trim();
    // Emoji, log markers, timestamps, status icons
    return /[✅❌⚠️🔧🔀📸⬆️↩️]|^\[?\d{4}-\d{2}-\d{2}|^──|^Total:|^Passed:|^Failed:/i.test(text);
  });
  if (hasLogMarkers) return false;

  // Signal 2: Compute paragraph text lengths
  const lengths = paragraphs.map((p) => {
    const text = p.children
      .map((c) => (c.type === "text" ? c.text : c.type === "inlineCode" ? c.text : ""))
      .join("");
    return text.trim().length;
  });

  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean === 0) return false;

  // Mean should be in the PDF line-width range (30-120 chars)
  // Raised minimum from 20 to 30 to exclude very short chat messages
  if (mean < 30 || mean > 120) return false;

  // Signal 3: Line length clustering — compute coefficient of variation
  const variance =
    lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
    lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // PDF lines are tightly clustered — lowered threshold from 0.6 to 0.5
  // to be more conservative
  if (cv > 0.5) return false;

  // Signal 4: Few paragraphs end with terminal punctuation
  const terminalPunct = paragraphs.filter((p) => {
    const text = p.children
      .map((c) => (c.type === "text" ? c.text : c.type === "inlineCode" ? c.text : ""))
      .join("")
      .trim();
    return /[.!?]$/.test(text);
  });

  const terminalRatio = terminalPunct.length / paragraphs.length;
  if (terminalRatio > 0.4) return false;

  return true;
}
