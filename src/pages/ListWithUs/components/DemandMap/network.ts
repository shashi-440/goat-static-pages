/**
 * The demand map's network: where amber lists property, where the demand for it
 * comes from, and which origin feeds which city.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️  EVERY NUMBER IN THIS FILE IS ILLUSTRATIVE. NONE OF IT IS MEASURED.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The cities are real amber markets and the origins are real top student-source
 * markets, but the per-city `enquiries` counts, the totals derived from them, and
 * the origin→city pairings are all written. They are printed on the page, so this
 * matters: the map shows "412" next to London and a headline total, and a visitor
 * will read those as facts.
 *
 * They are deliberately plausible rather than impressive — mid-hundreds for the
 * biggest market, not thousands — so that swapping in real figures is unlikely to
 * make the page look like it has gone backwards.
 *
 * TO WIRE UP REAL DATA: keep the shapes and replace the arrays. `DemandMap` reads
 * `PROPERTIES`, `ORIGINS`, `ROUTES`, `PARTNERS` and `TOTALS` and nothing else, so this is a
 * one-file swap plus a fetch. `TOTALS.enquiries` is derived from the city counts
 * rather than typed in, so it cannot drift out of agreement with them.
 */

/**
 * Country flags.
 *
 * 72x72 PNGs in `../../assets/flags/`, named by ISO 3166-1 alpha-2 code. They are
 * rasterised from the MIT-licensed `lipis/flag-icons` 1x1 set — square, so they
 * mask to a circle without cropping the artwork, matching the circular flags
 * CareerV2 already uses on its team cards.
 *
 * Rasterised rather than shipped as SVG on purpose: the official Spanish flag's
 * coat of arms is 82KB of vector detail that is a smudge at 18px, and Sri Lanka,
 * Egypt and Brazil are similar. The whole set is 18KB as PNG against 117KB as
 * SVG, and 72px is 2x the largest size any of them is drawn at.
 *
 * Nepal's flag is the one non-rectangular national flag, so its PNG has a
 * transparent corner — which is why the flag elements carry a white background
 * (see `.pinFlag` / `.originFlag`), not only for it but for any flag with alpha.
 */
import au from "../../assets/flags/au.png";
import bd from "../../assets/flags/bd.png";
import br from "../../assets/flags/br.png";
import ca from "../../assets/flags/ca.png";
import cn from "../../assets/flags/cn.png";
import de from "../../assets/flags/de.png";
import eg from "../../assets/flags/eg.png";
import es from "../../assets/flags/es.png";
import gb from "../../assets/flags/gb.png";
import id from "../../assets/flags/id.png";
import ie from "../../assets/flags/ie.png";
import ind from "../../assets/flags/in.png";
import ke from "../../assets/flags/ke.png";
import lk from "../../assets/flags/lk.png";
import ng from "../../assets/flags/ng.png";
import nl from "../../assets/flags/nl.png";
import np from "../../assets/flags/np.png";
import ph from "../../assets/flags/ph.png";
import pk from "../../assets/flags/pk.png";
import us from "../../assets/flags/us.png";
import vn from "../../assets/flags/vn.png";
import ae from "../../assets/flags/ae.png";
import fr from "../../assets/flags/fr.png";
import hk from "../../assets/flags/hk.png";
import it from "../../assets/flags/it.png";
import nz from "../../assets/flags/nz.png";
import sg from "../../assets/flags/sg.png";
// SVG rather than PNG, and only these five. The set above was rasterised because those
// flags are drawn at 18px on a hover card where a coat of arms is a smudge; these are
// ORIGIN flags, and origins no longer draw a flag at all — they draw a face. Kept
// accurate anyway, because the day one of them is shown is not the day to discover the
// data was a placeholder.
import jp from "../../assets/flags/jp.svg";
import kr from "../../assets/flags/kr.svg";
import kz from "../../assets/flags/kz.svg";
import ru from "../../assets/flags/ru.svg";
import tr from "../../assets/flags/tr.svg";

/**
 * Partner wordmarks — the same eight files the hero's logo wall uses, so the map
 * and the wall below it can never show a different roster.
 */
import crmStudents from "../../assets/logos/crm-students.png";
import fresh from "../../assets/logos/fresh.png";
import homesForStudents from "../../assets/logos/homes-for-students.png";
import iqStudent from "../../assets/logos/iq-student.png";
import scape from "../../assets/logos/scape.png";
import studentRoost from "../../assets/logos/student-roost.png";
import uniteStudents from "../../assets/logos/unite-students.png";
import varsity from "../../assets/logos/varsity.png";

export interface Place {
  label: string;
  /** Real [latitude, longitude] — drives the pin AND the arc endpoint. */
  location: [number, number];
  /** Country this place is in, named in full for the accessible label. */
  country: string;
  /** That country's flag. */
  flag: string;
}

/**
 * Which side of its dot a city's label sits on, and how far off.
 *
 * Authored per city rather than computed. A flat map is static — nothing rotates
 * — so label positions can be placed once and stay placed, which is the whole
 * reason this reads better than the globe did. And they HAVE to be authored: at
 * 1200px wide the frame gives 3.3px per degree, so Coventry and Birmingham are
 * 1.2px apart and the four UK cities all fall inside 7px. Automatic placement
 * cannot solve that; a human fanning them out over the Atlantic can.
 *
 * `dx`/`dy` are pixels at the map's 1200px reference frame (1200 x 538, 4.14px per
 * degree) and scale with it.
 * Anything offset far enough to need one gets a leader line back to its dot.
 */
export interface LabelPlacement {
  dx: number;
  dy: number;
  /** Which end of the label box sits at the offset point. */
  align: "left" | "right";
}

export interface PropertyCity extends Place {
  /**
   * Relative inbound weight, 1–5. Drives dot size and how often this city's arcs
   * fire, so the busy markets look busy independently of the printed count.
   */
  weight: number;
  /** ILLUSTRATIVE enquiry count — printed on the map. See the file header. */
  enquiries: number;
  /**
   * Bookings that came out of those enquiries. ILLUSTRATIVE, and DERIVED — see `withBookings`
   * below rather than looking for it in the rows.
   */
  bookings: number;
  /**
   * Properties amber lists in this city — buildings, not rooms. ILLUSTRATIVE.
   *
   * Printed on the city's hover card. This replaced a `rooms` count that existed only to
   * derive an enquiries-per-room ratio; the ratio is gone, so the field it fed is gone with
   * it rather than being left behind unused.
   */
  properties: number;
  /** Percentage of listed rooms filled through amber. ILLUSTRATIVE. */
  filled: number;
  /**
   * Average value of a booking here, in USD. ILLUSTRATIVE.
   *
   * Formatted to one decimal as "$1.9k" where it is shown. Varies with the city's real
   * cost of living — New York above Florence — because a flat figure across eighteen
   * cities would be the first thing an operator in any of them spotted as invented.
   */
  avgBooking: number;
  label_at: LabelPlacement;
}

/**
 * amber-listed cities.
 *
 * ── These are real markets, checked against amberstudent.com ────────────────
 * Taken from that site's sitemap (`/places/search/<slug>`), which carries a page per
 * covered place. Fourteen countries have a country-level page: United States, United
 * Kingdom, Canada, Australia, New Zealand, Ireland, Germany, Spain, France, Italy,
 * United Arab Emirates, Singapore, China and Hong Kong.
 *
 * Two corrections that came out of checking rather than assuming:
 *   · AMSTERDAM WAS WRONG. There is no Netherlands page and no Amsterdam page — amber
 *     does not list there. It has been removed.
 *   · Italy's coverage is Florence, not Milan or Rome; neither of those has a page.
 *
 * The set below is one or two cities per country rather than every city, chosen so the
 * globe reads as genuinely global instead of as a British clump with outliers. Real
 * markets deliberately left off the map for legibility: Birmingham, Coventry, Leeds,
 * Liverpool, Sheffield, Nottingham, Glasgow, Edinburgh, Bristol, Newcastle, Cardiff,
 * Leicester, Southampton (UK); Boston, Philadelphia, San Francisco, Seattle, Austin,
 * Atlanta, Houston (US); Montreal, Ottawa, Calgary, Waterloo, Hamilton (CA); Brisbane,
 * Adelaide, Perth, Canberra, Gold Coast (AU); Cork, Galway, Limerick (IE); Munich,
 * Frankfurt, Hamburg, Cologne, Stuttgart (DE); Madrid, Valencia, Seville, Granada (ES);
 * Lyon, Toulouse, Bordeaux, Lille, Marseille (FR); Wellington (NZ); Abu Dhabi (AE).
 * Adding any of them back is a row here plus a route.
 *
 * `enquiries` remains ILLUSTRATIVE — see the file header. The cities are real; the
 * numbers beside them are not.
 *
 * ⚠️ `label_at` IS STALE FOR THE FLAT MAP. Those offsets were hand-derived and
 * collision-checked against the OLD twelve-city list on a 1200x538 frame clipped to
 * 125°W–165°E. This list is different and Auckland sits at 174.8°E, outside that clip
 * — so `DemandMap` would need its longitude clip widened and its label layout
 * re-derived before being switched back on. The Mapbox globe ignores these entirely:
 * it uses Mapbox's own symbol-collision engine for label placement.
 */
/**
 * Bookings per city, DERIVED from its enquiries rather than typed alongside them.
 *
 * ⚠️  Deliberately not a second column of hand-written numbers. Two independent figures for
 * the same city is two things to keep in step, and the failure is silent and embarrassing in
 * exactly one direction: a bookings count that drifts above its enquiries count claims more
 * bookings than enquiries, printed side by side in the same tooltip. Deriving makes that
 * impossible.
 *
 * The rate VARIES by city rather than being one multiplier, because a flat 22% across
 * eighteen cities is the first thing anyone would spot — and it varies with something real,
 * the city's `weight` (its relative inbound demand), so the busy markets convert a little
 * better. 19% at weight 1 up to 24% at weight 5.
 *
 * Rounded to whole bookings, and floored at 1 so a small market never prints "0 bookings"
 * beside a live enquiry count.
 */
const bookingsFor = (enquiries: number, weight: number) =>
  Math.max(1, Math.round(enquiries * (0.19 + 0.0125 * (weight - 1))));

const withBookings = (rows: Omit<PropertyCity, "bookings">[]): PropertyCity[] =>
  rows.map((c) => ({ ...c, bookings: bookingsFor(c.enquiries, c.weight) }));

export const PROPERTIES: PropertyCity[] = withBookings([
  // prettier-ignore
  { label: "London", country: "UK", flag: gb, location: [51.5072, -0.1276], weight: 5,
    enquiries: 4182, properties: 24, filled: 96, avgBooking: 1900,
    label_at: { dx: 30, dy: 22, align: "left" } },
  // prettier-ignore
  { label: "Manchester", country: "UK", flag: gb, location: [53.4808, -2.2426], weight: 4,
    enquiries: 2736, properties: 17, filled: 95, avgBooking: 1500,
    label_at: { dx: -38, dy: -36.9, align: "right" } },
  // prettier-ignore
  { label: "Dublin", country: "Ireland", flag: ie, location: [53.3498, -6.2603], weight: 3,
    enquiries: 1904, properties: 12, filled: 94, avgBooking: 1700,
    label_at: { dx: -21.3, dy: -63.4, align: "right" } },
  // prettier-ignore
  { label: "Paris", country: "France", flag: fr, location: [48.8566, 2.3522], weight: 3,
    enquiries: 1357, properties: 10, filled: 92, avgBooking: 1600,
    label_at: { dx: 20, dy: 26, align: "left" } },
  // prettier-ignore
  { label: "Berlin", country: "Germany", flag: de, location: [52.52, 13.405], weight: 3,
    enquiries: 1238, properties: 9, filled: 91, avgBooking: 1400,
    label_at: { dx: 0, dy: -26, align: "left" } },
  // prettier-ignore
  { label: "Barcelona", country: "Spain", flag: es, location: [41.3874, 2.1686], weight: 3,
    enquiries: 1061, properties: 8, filled: 93, avgBooking: 1300,
    label_at: { dx: 14, dy: 24, align: "left" } },
  // prettier-ignore
  { label: "Florence", country: "Italy", flag: it, location: [43.7696, 11.2558], weight: 2,
    enquiries: 638, properties: 5, filled: 95, avgBooking: 1200,
    label_at: { dx: 18, dy: 20, align: "left" } },
  // prettier-ignore
  { label: "New York", country: "USA", flag: us, location: [40.7128, -74.006], weight: 5,
    enquiries: 3364, properties: 19, filled: 97, avgBooking: 2400,
    label_at: { dx: -22, dy: 26, align: "right" } },
  // prettier-ignore
  { label: "Chicago", country: "USA", flag: us, location: [41.8781, -87.6298], weight: 3,
    enquiries: 1792, properties: 11, filled: 94, avgBooking: 1800,
    label_at: { dx: -24, dy: -20, align: "right" } },
  // prettier-ignore
  { label: "Los Angeles", country: "USA", flag: us, location: [34.0522, -118.2437], weight: 3,
    enquiries: 1573, properties: 12, filled: 93, avgBooking: 2100,
    label_at: { dx: 22, dy: 18, align: "left" } },
  // prettier-ignore
  { label: "Toronto", country: "Canada", flag: ca, location: [43.6532, -79.3832], weight: 4,
    enquiries: 2468, properties: 16, filled: 96, avgBooking: 1700,
    label_at: { dx: -28, dy: 0, align: "right" } },
  // prettier-ignore
  { label: "Vancouver", country: "Canada", flag: ca, location: [49.2827, -123.1207], weight: 3,
    enquiries: 1714, properties: 11, filled: 95, avgBooking: 1800,
    label_at: { dx: 22, dy: -18, align: "left" } },
  // prettier-ignore
  { label: "Sydney", country: "Australia", flag: au, location: [-33.8688, 151.2093], weight: 4,
    enquiries: 2613, properties: 15, filled: 96, avgBooking: 2000,
    label_at: { dx: -28, dy: 0, align: "right" } },
  // prettier-ignore
  { label: "Melbourne", country: "Australia", flag: au, location: [-37.8136, 144.9631], weight: 4,
    enquiries: 2179, properties: 14, filled: 95, avgBooking: 1800,
    label_at: { dx: -26, dy: 22, align: "right" } },
  // prettier-ignore
  { label: "Auckland", country: "New Zealand", flag: nz, location: [-36.8485, 174.7633], weight: 2,
    enquiries: 983, properties: 7, filled: 90, avgBooking: 1500,
    label_at: { dx: -26, dy: -20, align: "right" } },
  // prettier-ignore
  { label: "Dubai", country: "UAE", flag: ae, location: [25.2048, 55.2708], weight: 2,
    enquiries: 897, properties: 7, filled: 89, avgBooking: 1600,
    label_at: { dx: 20, dy: 20, align: "left" } },
  // prettier-ignore
  { label: "Singapore", country: "Singapore", flag: sg, location: [1.3521, 103.8198], weight: 2,
    enquiries: 812, properties: 6, filled: 92, avgBooking: 1900,
    label_at: { dx: 20, dy: 18, align: "left" } },
  // prettier-ignore
  { label: "Hong Kong", country: "Hong Kong", flag: hk, location: [22.3193, 114.1694], weight: 2,
    enquiries: 726, properties: 5, filled: 90, avgBooking: 1700,
    label_at: { dx: 20, dy: -18, align: "left" } },
]);

/**
 * Where the demand comes from — ONE ENTRY PER COUNTRY, not per city.
 *
 * This was city-level (Mumbai, Delhi, Hyderabad as three separate origins) and it
 * had to change once the markers became flags: three identical Indian flags
 * stacked on top of each other in a 40px patch of the map, saying nothing that one
 * flag did not. Country level is also what a flag actually communicates.
 *
 * `location` is the country's principal student-source city rather than its
 * centroid, so a flag sits on a real place and arcs leave from one — Egypt's flag
 * is on Cairo, not in the Western Desert.
 *
 * These positions are checked for collisions rather than trusted: at the 15px the
 * flags are drawn, the tightest pair on the map is Nepal and Bangladesh at 21px
 * apart, so nothing overlaps. Adding a country in the South Asia cluster needs
 * that re-checked.
 */
export interface SourceCountry extends Place {
  /** The city `location` refers to, for the accessible description. */
  via: string;
}

/**
 * Where the demand comes from.
 *
 * ── Two halves, and the second one was missing ──────────────────────────────
 * This started as the classic international-student source list — India, China, Nigeria,
 * Pakistan and so on — which is correct about the biggest flows and a bad picture of the
 * business. Drawn on a map it said amber is a one-way pipe out of South Asia and West
 * Africa: no arc ever started in Europe, and no student ever moved WITHIN their own
 * country, when domestic moves are a large share of any student housing market.
 *
 * So the list now carries both: the long-haul source markets it always had, and near-haul
 * and domestic origins in Europe and North America. A student going Birmingham to London
 * or Lyon to Paris is as real a booking as one going Mumbai to London, and without them
 * the whole of the northern hemisphere sat there as a destination and never as a home.
 *
 * ⚠️ Each origin is a COUNTRY, positioned at one representative city — deliberately not
 * the same city amber lists in, so a domestic arc has somewhere to travel from. Adding a
 * row here is enough; nothing keys off the length of this list.
 */
export const ORIGINS: SourceCountry[] = [
  // Long-haul source markets.
  { label: "India", country: "India", via: "Mumbai", flag: ind, location: [19.076, 72.8777] },
  { label: "China", country: "China", via: "Shanghai", flag: cn, location: [31.2304, 121.4737] },
  { label: "Nigeria", country: "Nigeria", via: "Lagos", flag: ng, location: [6.5244, 3.3792] },
  { label: "Kenya", country: "Kenya", via: "Nairobi", flag: ke, location: [-1.2921, 36.8219] },
  { label: "Egypt", country: "Egypt", via: "Cairo", flag: eg, location: [30.0444, 31.2357] },
  { label: "Pakistan", country: "Pakistan", via: "Karachi", flag: pk, location: [24.8607, 67.0011] },
  { label: "Bangladesh", country: "Bangladesh", via: "Dhaka", flag: bd, location: [23.8103, 90.4125] },
  { label: "Nepal", country: "Nepal", via: "Kathmandu", flag: np, location: [27.7172, 85.324] },
  { label: "Sri Lanka", country: "Sri Lanka", via: "Colombo", flag: lk, location: [6.9271, 79.8612] },
  { label: "Vietnam", country: "Vietnam", via: "Hanoi", flag: vn, location: [21.0278, 105.8342] },
  { label: "Indonesia", country: "Indonesia", via: "Jakarta", flag: id, location: [-6.2088, 106.8456] },
  { label: "Philippines", country: "Philippines", via: "Manila", flag: ph, location: [14.5995, 120.9842] },
  { label: "Brazil", country: "Brazil", via: "Sao Paulo", flag: br, location: [-23.5505, -46.6333] },

  // ── The northern band ──────────────────────────────────────────────────────
  // Added because the map had a hole in it. Between roughly 35°N and 60°N — the whole of
  // Russia, Central Asia and north-east Asia — there was not one origin, so any stop that
  // centred on a northern city (Berlin, London, Toronto) framed several thousand miles of
  // empty green. All five are real student-source markets; they were simply missing.
  //
  // What is still empty up there is Siberia above ~60°, Greenland and Arctic Canada, and
  // that stays empty: nobody lives there and amber lists nowhere in it.
  { label: "Turkey", country: "Turkey", via: "Istanbul", flag: tr, location: [41.0082, 28.9784] },
  { label: "Russia", country: "Russia", via: "Moscow", flag: ru, location: [55.7558, 37.6173] },
  { label: "Kazakhstan", country: "Kazakhstan", via: "Almaty", flag: kz, location: [43.222, 76.8512] },
  { label: "South Korea", country: "South Korea", via: "Seoul", flag: kr, location: [37.5665, 126.978] },
  { label: "Japan", country: "Japan", via: "Tokyo", flag: jp, location: [35.6762, 139.6503] },

  // Near-haul and domestic. Each sits in a city amber does NOT list in, so the arc from
  // it has a distance to cover — an origin dropped on its own destination draws nothing.
  { label: "United Kingdom", country: "United Kingdom", via: "Birmingham", flag: gb, location: [52.4862, -1.8904] },
  { label: "Ireland", country: "Ireland", via: "Cork", flag: ie, location: [51.8985, -8.4756] },
  { label: "France", country: "France", via: "Lyon", flag: fr, location: [45.764, 4.8357] },
  { label: "Germany", country: "Germany", via: "Munich", flag: de, location: [48.1351, 11.582] },
  { label: "Spain", country: "Spain", via: "Madrid", flag: es, location: [40.4168, -3.7038] },
  { label: "Italy", country: "Italy", via: "Milan", flag: it, location: [45.4642, 9.19] },
  { label: "Netherlands", country: "Netherlands", via: "Rotterdam", flag: nl, location: [51.9244, 4.4777] },
  { label: "United States", country: "United States", via: "Houston", flag: us, location: [29.7604, -95.3698] },
  { label: "Canada", country: "Canada", via: "Calgary", flag: ca, location: [51.0447, -114.0719] },
  { label: "Australia", country: "Australia", via: "Perth", flag: au, location: [-31.9505, 115.8605] },
];

export interface Route {
  /** Index into `ORIGINS`. */
  from: number;
  /** Index into `PROPERTIES`. */
  to: number;
}

/**
 * The arcs.
 *
 * Rebuilt for the eighteen-city list. Every destination is the target of at least two
 * routes and every source country sends at least two, so nothing on the globe is ever
 * inert — and because the destinations now span fourteen countries rather than clumping
 * on Britain, the arcs fan across the whole sphere instead of all converging on one
 * spot.
 *
 * Pairings are illustrative, but not arbitrary: they follow the corridors that actually
 * dominate international student flow — South Asia into the UK, Ireland and Canada;
 * China and Southeast Asia into Australia, New Zealand, Hong Kong and Singapore; Africa
 * into the UK and North America; Latin America into the US and Europe.
 */
export const ROUTES: Route[] = [
  { from: 0, to: 0 }, // India → London
  { from: 0, to: 1 }, // India → Manchester
  { from: 0, to: 2 }, // India → Dublin
  { from: 0, to: 10 }, // India → Toronto
  { from: 0, to: 7 }, // India → New York
  { from: 0, to: 13 }, // India → Melbourne
  { from: 1, to: 12 }, // China → Sydney
  { from: 1, to: 17 }, // China → Hong Kong
  { from: 1, to: 11 }, // China → Vancouver
  { from: 1, to: 8 }, // China → Chicago
  { from: 2, to: 0 }, // Nigeria → London
  { from: 2, to: 1 }, // Nigeria → Manchester
  { from: 2, to: 10 }, // Nigeria → Toronto
  { from: 3, to: 0 }, // Kenya → London
  { from: 3, to: 2 }, // Kenya → Dublin
  { from: 4, to: 4 }, // Egypt → Berlin
  { from: 4, to: 15 }, // Egypt → Dubai
  { from: 5, to: 1 }, // Pakistan → Manchester
  { from: 5, to: 15 }, // Pakistan → Dubai
  { from: 5, to: 5 }, // Pakistan → Barcelona
  { from: 6, to: 2 }, // Bangladesh → Dublin
  { from: 6, to: 11 }, // Bangladesh → Vancouver
  { from: 7, to: 7 }, // Nepal → New York
  { from: 7, to: 12 }, // Nepal → Sydney
  { from: 8, to: 13 }, // Sri Lanka → Melbourne
  { from: 8, to: 3 }, // Sri Lanka → Paris
  { from: 9, to: 16 }, // Vietnam → Singapore
  { from: 9, to: 14 }, // Vietnam → Auckland
  { from: 10, to: 12 }, // Indonesia → Sydney
  { from: 10, to: 16 }, // Indonesia → Singapore
  { from: 11, to: 14 }, // Philippines → Auckland
  { from: 11, to: 17 }, // Philippines → Hong Kong
  { from: 12, to: 9 }, // Brazil → Los Angeles
  { from: 12, to: 6 }, // Brazil → Florence
  { from: 12, to: 7 }, // Brazil → New York
  { from: 1, to: 4 }, // China → Berlin
  { from: 0, to: 9 }, // India → Los Angeles
  { from: 5, to: 8 }, // Pakistan → Chicago
  { from: 3, to: 6 }, // Kenya → Florence
  { from: 6, to: 3 }, // Bangladesh → Paris
  { from: 4, to: 5 }, // Egypt → Barcelona
  { from: 8, to: 11 }, // Sri Lanka → Vancouver
];

/**
 * Property partners already listing on amber.
 *
 * ⚠️ NO PER-PARTNER NUMBERS HERE, AND THAT IS DELIBERATE. Everything else in this
 * file is illustrative, but these are named third-party companies: printing an
 * invented "412 enquiries" beside Unite Students would be a fabricated claim about
 * someone else's business, which is a different thing from a made-up figure about
 * amber's own totals. A partner entry asserts only that the operator lists on
 * amber — which the logo wall further down the page already says.
 *
 * `city` IS illustrative: it decides which city's hover card a partner appears on. All
 * eight are UK operators and the city list now carries only two UK cities, so they split
 * across London and Manchester — every one of them genuinely operates in both, but which
 * card a given logo lands on is a choice, not a fact.
 *
 * THESE ARE NOT PLACED ON THE MAP. They were, as a column of eight wordmarks
 * beside London, and it was the densest thing on the map while being the least
 * spatial — the geography said nothing about them and they crowded out the network
 * they were supposed to belong to. They now live only in a destination's hover
 * card, so a city answers "who else lists here?" when asked, and stays a plain node
 * when not. Nothing here needs a layout offset any more.
 */
export interface Partner {
  name: string;
  logo: string;
  /** Index into `PROPERTIES` — whose hover card this partner appears on. */
  city: number;
}

export const PARTNERS: Partner[] = [
  { name: "Unite Students", logo: uniteStudents, city: 0 }, // London
  { name: "CRM Students", logo: crmStudents, city: 0 },
  { name: "Scape", logo: scape, city: 0 },
  { name: "Varsity", logo: varsity, city: 0 },
  { name: "iQ Student Accommodation", logo: iqStudent, city: 1 }, // Manchester
  { name: "Student Roost", logo: studentRoost, city: 1 },
  { name: "Fresh", logo: fresh, city: 1 },
  { name: "Homes for Students", logo: homesForStudents, city: 1 },
];

/**
 * Headline figures shown above the map.
 *
 * `enquiries` is SUMMED from the city counts rather than typed in, so the total
 * and the per-city numbers can never disagree — which they would, silently, the
 * first time someone edited one city.
 *
 * `countries` is illustrative like everything else here: `ORIGINS` names only the
 * sixteen biggest source cities, not the long tail the number claims.
 */
export const TOTALS = {
  enquiries: PROPERTIES.reduce((sum, city) => sum + city.enquiries, 0),
  // Illustrative, like every other figure here. The COUNTRIES AMBER LISTS IN are real
  // and counted below; this is the count of countries students enquire FROM.
  countries: 94,
  // Counted from the city list, so it cannot drift from what the map shows.
  listedCountries: new Set(PROPERTIES.map((c) => c.country)).size,
  cities: PROPERTIES.length,
  // Counted, not typed, so the figure and the chips on the map cannot disagree.
  partners: PARTNERS.length,
};
