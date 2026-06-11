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

  if (bulletSymbolPattern.test(text)) {
    score += 0.2;
    reasons.push("Has bullet symbol list markers");
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
