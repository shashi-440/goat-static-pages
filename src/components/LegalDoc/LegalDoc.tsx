import { Fragment } from "react";
import CustomLink from "@Components/CustomLink";
import Reveal from "@Pages/AboutUsV2/components/Reveal/Reveal";
import { Inline, LegalDocContent, isLink } from "./types";
import styles from "./LegalDoc.module.scss";
import wrapperHOC from "@Utils/wrapperHOC";

/** (a) … (h) markers for lettered lists — Figma node 2066:37. */
const LETTERS = ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)"];

/**
 * Renders a paragraph's runs, turning link runs into anchors and bold runs into
 * <strong>.
 *
 * `isExternal` is set explicitly on every link: CustomLink only auto-detects
 * `http(s)://`, so mailto:/tel: would otherwise be routed through react-router
 * and come out as `/mailto:…`. Only web links get a new tab — opening a mail or
 * dial handler in one leaves a blank window behind.
 */
const renderInline = (content: Inline[]) =>
  content.map((run, index) => {
    if (typeof run === "string") {
      // eslint-disable-next-line react/no-array-index-key
      return <Fragment key={index}>{run}</Fragment>;
    }

    if (isLink(run)) {
      return (
        <CustomLink
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          href={run.href}
          className={styles.link}
          isExternal
          {...(run.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {run.text}
        </CustomLink>
      );
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <strong className={styles.strong} key={index}>
        {run.text}
      </strong>
    );
  });

/**
 * The body of a legal document page — the preamble, the boxed aside, and the
 * numbered clauses, all on a 700px reading measure.
 *
 * Shared by /privacy-v2 and /terms-v2. Layout metrics come from Figma node
 * 2066:27: 40px between top-level pieces, 14px from a heading to its body, 16px
 * between consecutive paragraphs, 10px between list items.
 */
const LegalDoc = ({ content }: { content: LegalDocContent }) => (
  <section className={styles.section}>
    <div className={styles.inner}>
      {/* Preamble */}
      <Reveal className={styles.group}>
        {content.lead ? <p className={styles.lead}>{content.lead}</p> : null}
        {content.intro.map((paragraph, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <p className={styles.para} key={index}>
            {renderInline(paragraph)}
          </p>
        ))}
      </Reveal>

      <Reveal className={styles.callout}>
        <p className={styles.calloutText}>{content.callout}</p>
      </Reveal>

      <span className={styles.divider} aria-hidden="true" />

      {content.sections.map((entry, sectionIndex) => (
        <Reveal className={styles.clause} key={entry.title}>
          <h2 className={styles.heading}>
            {sectionIndex + 1}. {entry.title}
          </h2>

          {entry.blocks.map((block, blockIndex) =>
            block.kind === "para" ? (
              // eslint-disable-next-line react/no-array-index-key
              <p className={styles.para} key={blockIndex}>
                {renderInline(block.content)}
              </p>
            ) : (
              <ul
                className={styles.list}
                // eslint-disable-next-line react/no-array-index-key
                key={blockIndex}
              >
                {block.items.map((item, itemIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li className={styles.item} key={itemIndex}>
                    <span
                      className={block.markers === "letters" ? styles.letter : styles.bullet}
                      aria-hidden="true"
                    >
                      {block.markers === "letters" ? LETTERS[itemIndex] : "•"}
                    </span>
                    <span className={styles.itemText}>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            ),
          )}
        </Reveal>
      ))}
    </div>
  </section>
);

export default wrapperHOC(LegalDoc, {
  componentName: "LegalDoc",
  showForChina: true,
});
