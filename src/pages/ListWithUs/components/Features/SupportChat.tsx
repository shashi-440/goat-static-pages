import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "@Components/Image";
import styles from "./SupportChat.module.scss";
import partnerAvatar from "../../assets/avatar-3.png";

/**
 * The art for "Support when you need it": the support thread itself, running.
 *
 * ── Ported from Partner With Us's `SupportChat` ─────────────────────────────
 * The mechanism is that component's, unchanged — the FLIP glide, the beats, the message
 * window, the fade. What changed is WHO IS TALKING. There the thread is a STUDENT being
 * helped through search, comparison, booking and post-booking; here it is a PARTNER being
 * helped by amber's team, because that is what this card's copy claims: "from onboarding to
 * ongoing growth, our team is available 24/7".
 *
 * So the four turns are a partner's four kinds of ask, in the order a partner meets them —
 * onboarding, then availability, then performance, then billing. One loop is the relationship
 * the sentence describes, not four interchangeable questions.
 *
 * ── The thread GLIDES, and getting that right took two goes ────────────────
 * The column is bottom-anchored, so appending a bubble grows it upward and every
 * existing bubble jumps up by that bubble's height. The correction is to offset the
 * column back down by however far it moved, before the browser paints, and then
 * release that offset over a transition so the bubbles travel instead of teleport.
 *
 * ⚠️  The FIRST attempt measured the column's own `offsetHeight` change, and it was
 * subtly wrong in a way that only showed after a few beats. Once the thread reaches
 * `WINDOW` messages, every update DROPS one from the top as it appends one to the
 * bottom — so the net height change is about zero, the correction computed zero, and
 * the glide silently stopped for the rest of the loop while the content kept moving.
 * That was the remaining glitch.
 *
 * What actually has to be measured is how far a SURVIVING message moved, which is
 * unaffected by whatever left the top. So this is a FLIP: remember where the last
 * message sat at the previous paint, find that same message after the update, and
 * offset the column by the difference. One mechanism that is correct for an append, a
 * drop, and the typing bubble being swapped for a reply — all three of which happen
 * here, sometimes in the same tick.
 *
 * `useLayoutEffect`, not `useEffect`, because the offset has to land before paint. In
 * `useEffect` the jumped frame is already on screen and the correction becomes a
 * second jump.
 *
 * ── Why not a real scroll container ────────────────────────────────────────
 * A `overflow-y: auto` thread with `scrollTop` driven to the bottom would be the
 * obvious build, and it is wrong here: this card already lives inside a horizontal
 * scroller, and a nested scroll area swallows trackpad gestures meant for the rail.
 *
 * ── The typing indicator is load-bearing ───────────────────────────────────
 * Without it the reply lands in the same beat as the question and the exchange reads
 * as a block of text appearing rather than as somebody answering. It is the only
 * thing here that says somebody is on the other end — there is deliberately no
 * "amber support / replies in ~2 min" header; the thread is the whole art.
 */

/** A partner's four kinds of ask, in the order they come up. */
const THREAD = [
  { ask: "Can we add 12 more studios for Sept?", reply: "Added — they will be live within the hour." },
  { ask: "Two listings are showing as full.", reply: "Availability resynced. Both are back." },
  { ask: "Why did bookings dip last week?", reply: "Early-bird ended Friday. Want it extended?" },
  { ask: "Need the August invoice.", reply: "Sent to your billing contact just now." },
];

/** Beats. Unequal, which is why this is a chained timeout and not an interval. */
const ASK_TO_TYPING_MS = 620;
const TYPING_MS = 780;
const REPLY_TO_ASK_MS = 1180;

/**
 * Messages kept mounted. Deliberately more than the frame shows: a message is dropped only once
 * it is well above the fade, so no drop is ever visible. At 6 the oldest was still faintly under
 * the gradient when it vanished.
 *
 * ⚠️  A PER-FRAME NUMBER, not a preference, and it has been re-measured twice. The sibling page
 * uses 8; this card's media window is taller, and at 8 the seeded column here came out 74px
 * SHORTER than the frame, leaving a band of empty panel above the first bubble and giving the fade
 * nothing to fade. That put it at 12.
 *
 * Then the bubble type went from 9.5px to 12px, and 12 messages became a 551px column in a 318px
 * window — four bubbles mounted entirely off screen, doing nothing. 9 is the re-measure: the window
 * holds about seven bubbles at this size, so nine keeps two spare above the fade, which is what the
 * drop needs to stay invisible.
 *
 * If the bubble type, the card height, or the copy's line count changes again, measure the thread's
 * `offsetHeight` against the media window and re-derive this rather than guessing.
 */
const WINDOW = 9;

type Bubble = { key: string; side: "ask" | "reply"; text: string };

/**
 * The thread's STARTING state: a full window, not an empty column.
 *
 * ⚠️  This started empty and filled from the bottom, and the card spent its first several
 * seconds as a mostly blank grey panel with two bubbles at the foot — which is what the frame
 * looks like for as long as it takes four turns to play. The thread is meant to read as a
 * conversation already in progress that the reader has just looked at, so it opens mid-flow.
 *
 * Seeded to exactly `WINDOW` so the first real append drops the oldest, which is the steady
 * state — seeding fewer would leave a visible gap at the top until the loop caught up.
 *
 * Used for reduced motion too, where it is the whole thing: no loop runs, so this settled
 * window is what stays on screen.
 */
const seeded = (): Bubble[] =>
  // THREAD is four exchanges — eight bubbles — and `WINDOW` is nine, so it is walked TWICE and the
  // slice keeps the tail. Keys carry the pass index as well as the turn, or the second pass would
  // collide with the first and React would reuse the wrong rows.
  [0, 1]
    .flatMap((pass) =>
      THREAD.flatMap((t, i) => [
        { key: `s${pass}-${i}a`, side: "ask" as const, text: t.ask },
        { key: `s${pass}-${i}r`, side: "reply" as const, text: t.reply },
      ]),
    )
    .slice(-WINDOW);

const SupportChat = () => {
  const still =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [bubbles, setBubbles] = useState<Bubble[]>(seeded);
  const [typing, setTyping] = useState(false);
  const turn = useRef(0);
  const thread = useRef<HTMLDivElement>(null);
  /**
   * The FLIP anchor: which message was last at the previous paint, and where its top
   * edge sat. This is the only thing that makes the glide immune to messages leaving
   * the top of the window — see the ⚠️ note at the top of this file.
   */
  const anchor = useRef<{ key: string; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = thread.current;
    if (!el || still) return;

    const children = Array.from(el.children) as HTMLElement[];
    const last = children[children.length - 1];

    const prev = anchor.current;
    if (prev) {
      const kept = children.find((c) => c.dataset.k === prev.key);
      if (kept) {
        // How far the message the eye was last looking at has moved. Positive means
        // it travelled up, which is the case the glide exists for.
        const shift = prev.top - kept.getBoundingClientRect().top;
        if (Math.abs(shift) > 0.5) {
          el.style.transition = "none";
          el.style.transform = `translateY(${shift}px)`;
          // Two frames: one for the browser to accept the un-transitioned offset,
          // one to start the transition from it. Released in a single frame both
          // writes coalesce and no transition runs at all.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const node = thread.current;
              if (!node) return;
              node.style.transition = "transform 460ms cubic-bezier(0.22, 1, 0.36, 1)";
              node.style.transform = "translateY(0)";
            });
          });
        }
      }
    }

    // Re-anchor for the next update. Read AFTER the correction is written but the
    // value wanted is the resting position, so the transform is discounted — the
    // element is currently offset by `shift` and will end up `shift` higher.
    if (last) {
      const style = window.getComputedStyle(el);
      const matrix = new DOMMatrixReadOnly(style.transform === "none" ? "" : style.transform);
      anchor.current = {
        key: last.dataset.k || "",
        top: last.getBoundingClientRect().top - matrix.m42,
      };
    }
  }, [bubbles, typing, still]);

  useEffect(() => {
    if (still) return undefined;

    let alive = true;
    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => alive && fn(), ms));
    };

    const run = () => {
      if (!alive) return;
      const n = turn.current;
      const t = THREAD[n % THREAD.length];

      setBubbles((prev) =>
        [...prev, { key: `${n}a`, side: "ask" as const, text: t.ask }].slice(-WINDOW),
      );

      after(ASK_TO_TYPING_MS, () => setTyping(true));
      after(ASK_TO_TYPING_MS + TYPING_MS, () => {
        setTyping(false);
        setBubbles((prev) =>
          [...prev, { key: `${n}r`, side: "reply" as const, text: t.reply }].slice(-WINDOW),
        );
      });

      turn.current = n + 1;
      after(ASK_TO_TYPING_MS + TYPING_MS + REPLY_TO_ASK_MS, run);
    };

    run();
    return () => {
      alive = false;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [still]);

  return (
    <div className={styles.panel}>
      <div className={styles.thread} ref={thread}>
        {bubbles.map((b) => {
          const asking = b.side === "ask";
          return (
            // Each bubble gets a row of its own so the avatar can sit beside it
            // rather than inside it — inside, it would be part of the bubble's
            // padding and the text would wrap around it.
            <div
              className={`${styles.line} ${asking ? styles.lineAsk : styles.lineReply}`}
              key={b.key}
              // Read back by the FLIP above to find this same message after an update.
              data-k={b.key}
            >
              <div className={`${styles.bubble} ${asking ? styles.ask : styles.reply}`}>
                {b.text}
              </div>

              {/* ONE avatar, and only on the PARTNER's side. This is a single conversation
                  with a single partner, so a different face per message would say four people
                  are asking. amber's replies carry no avatar — the two sides are already told
                  apart by colour and side, and a second face would make the thread read as
                  two strangers rather than as a partner and a service. */}
              {asking && (
                <Image
                  src={partnerAvatar}
                  alt=""
                  className={styles.avatar}
                  width={20}
                  height={20}
                  isNotLazy
                />
              )}
            </div>
          );
        })}

        {typing && (
          <div className={`${styles.line} ${styles.lineReply}`} data-k="typing">
            <div className={`${styles.bubble} ${styles.reply} ${styles.typing}`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {/* Fades the oldest bubbles out rather than cutting them on a hard line, so
          the thread reads as continuing above the frame. */}
      <span className={styles.fade} aria-hidden="true" />
    </div>
  );
};

export default SupportChat;
