export const UCF_VERSION = "0.2" as const;
export type UcfVersion = typeof UCF_VERSION;

/**
 * Escape hatch for decoder-specific signals that the closed UCF union cannot
 * model (e.g. `data-highlight`, cell spans). Optional and opaque: the
 * canonicalizer preserves it untouched, encoders may read it, and nodes
 * without attrs behave exactly as before.
 */
export type UcfAttrs = Record<string, unknown>;

export type UcfInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strikethrough" }
  | { type: "superscript" }
  | { type: "subscript" };

export type UcfText = {
  type: "text";
  text: string;
  marks?: UcfInlineMark[];
  attrs?: UcfAttrs;
};

export type UcfHardBreak = { type: "hardBreak" };

export type UcfInlineCode = {
  type: "inlineCode";
  text: string;
  attrs?: UcfAttrs;
};

export type UcfLink = {
  type: "link";
  href: string;
  title?: string;
  children: UcfInline[];
  attrs?: UcfAttrs;
};

export type UcfImage = {
  type: "image";
  src: string;
  alt?: string;
  title?: string;
  attrs?: UcfAttrs;
};

export type UcfInline =
  | UcfText
  | UcfHardBreak
  | UcfInlineCode
  | UcfLink
  | UcfImage;

export type UcfParagraph = {
  type: "paragraph";
  children: UcfInline[];
  attrs?: UcfAttrs;
};

export type UcfHeading = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: UcfInline[];
  attrs?: UcfAttrs;
};

export type UcfBlockQuote = {
  type: "blockquote";
  blocks: UcfBlock[];
  attrs?: UcfAttrs;
};

export type UcfListItem = {
  type: "listItem";
  level: number;
  blocks: UcfBlock[];
  attrs?: UcfAttrs;
};

export type UcfList = {
  type: "list";
  ordered: boolean;
  start?: number;
  items: UcfListItem[];
  attrs?: UcfAttrs;
};

export type UcfCodeBlock = {
  type: "codeBlock";
  text: string;
  language?: string;
  attrs?: UcfAttrs;
};

export type UcfDivider = { type: "divider" };

export type UcfTableCell = {
  type: "tableCell";
  children: UcfInline[];
  attrs?: UcfAttrs;
};

export type UcfTableRow = {
  type: "tableRow";
  cells: UcfTableCell[];
  attrs?: UcfAttrs;
};

export type UcfTable = {
  type: "table";
  rows: UcfTableRow[];
  headerRowCount?: number;
  attrs?: UcfAttrs;
};

export type UcfBlock =
  | UcfParagraph
  | UcfHeading
  | UcfList
  | UcfCodeBlock
  | UcfBlockQuote
  | UcfDivider
  | UcfTable;

export type UcfDocument = {
  version: UcfVersion;
  blocks: UcfBlock[];
  meta?: Record<string, unknown>;
};
