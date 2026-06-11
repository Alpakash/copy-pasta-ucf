export const UCF_VERSION = "0.2" as const;
export type UcfVersion = typeof UCF_VERSION;

export type UcfInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strikethrough" };

export type UcfText = {
  type: "text";
  text: string;
  marks?: UcfInlineMark[];
};

export type UcfHardBreak = { type: "hardBreak" };

export type UcfInlineCode = {
  type: "inlineCode";
  text: string;
};

export type UcfLink = {
  type: "link";
  href: string;
  title?: string;
  children: UcfInline[];
};

export type UcfInline =
  | UcfText
  | UcfHardBreak
  | UcfInlineCode
  | UcfLink;

export type UcfParagraph = {
  type: "paragraph";
  children: UcfInline[];
};

export type UcfHeading = {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: UcfInline[];
};

export type UcfBlockQuote = {
  type: "blockquote";
  blocks: UcfBlock[];
};

export type UcfListItem = {
  type: "listItem";
  level: number;
  blocks: UcfBlock[];
};

export type UcfList = {
  type: "list";
  ordered: boolean;
  start?: number;
  items: UcfListItem[];
};

export type UcfCodeBlock = {
  type: "codeBlock";
  text: string;
  language?: string;
};

export type UcfDivider = { type: "divider" };

export type UcfBlock =
  | UcfParagraph
  | UcfHeading
  | UcfList
  | UcfCodeBlock
  | UcfBlockQuote
  | UcfDivider;

export type UcfDocument = {
  version: UcfVersion;
  blocks: UcfBlock[];
  meta?: Record<string, unknown>;
};
