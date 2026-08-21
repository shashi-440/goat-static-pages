/**
 * Shape of a legal document page (Privacy Policy, Terms & Conditions, …).
 *
 * The copy for these pages is legal text, so it is never authored in a component
 * — each page keeps a content module that reproduces its source verbatim and
 * hands it to <LegalDoc />.
 */

/** A run of body text: plain, a link, or bold. */
export type Inline = string | InlineLink | InlineStrong;

export interface InlineLink {
  text: string;
  href: string;
  /** Links to the outside world open in a new tab; mail/phone links do not. */
  newTab?: boolean;
}

export interface InlineStrong {
  text: string;
  strong: true;
}

export const isLink = (run: Inline): run is InlineLink =>
  typeof run !== "string" && "href" in run;

export type Block =
  | { kind: "para"; content: Inline[] }
  /** `letters` renders (a), (b), … in a 30px gutter; `bullets` renders • in 16px. */
  | { kind: "list"; markers: "letters" | "bullets"; items: Inline[][] };

export interface Section {
  title: string;
  blocks: Block[];
}

export interface LegalDocContent {
  /** Optional small-caps line above the preamble — the document's formal title. */
  lead?: string;
  /** Paragraphs before the first numbered clause. */
  intro: Inline[][];
  /** The one boxed aside, sitting between the preamble and the clauses. */
  callout: string;
  /** Numbered clauses. Numbers come from array order, never stored. */
  sections: Section[];
}
