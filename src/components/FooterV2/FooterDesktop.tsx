/**
 * Compatibility shim.
 *
 * Pages ported from amber-user-website import the footer as
 * `@Components/FooterV2/FooterDesktop`. Re-exporting the static Footer from that
 * exact path is what lets AboutUsV2.tsx — and every future ported v2 page — stay
 * byte-identical to its upstream original, so files can move in either direction
 * without an edit.
 *
 * ⚠️  This is the one switch that decides which footer the whole sandbox renders, and
 * it points at the REPLICA — `components/Footer`, the byte-accurate copy of
 * production's footer. Every page goes through here, including Partner With Us.
 *
 * `components/FooterV3` is a redesigned footer that lives in the tree but is not
 * rendered anywhere. To put it back on every page, change one line:
 *
 *   export { default } from "@Components/FooterV3/FooterV3";
 */
export { default } from "@Components/Footer/Footer";
