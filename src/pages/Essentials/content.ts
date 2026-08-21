import kitStandard from "./assets/kit-standard.jpg";
import kitPremium from "./assets/kit-premium.jpg";
import kitDeluxe from "./assets/kit-deluxe.jpg";

/**
 * Copy and figures for the Essentials page, lifted verbatim from the final
 * mockup (`amber Essentials — final mockup_vf · web + mobile.html`) so the
 * content stays reviewable against it. Only the presentation was re-themed.
 */

/** The service switcher above the kit card. Essential Kit is this page. */
export const SERVICES = [
  { label: "Forex Card", href: "#" },
  { label: "Essential Kit", href: "#", current: true },
  { label: "Flights", href: "#" },
  { label: "Bank", href: "#" },
  { label: "Airport Pickup", href: "#" },
  { label: "Accommodation", href: "#" },
];

export interface Kit {
  name: string;
  image: string;
  rating: string;
  reviews: string;
  itemCount: string;
  /** Category breakdown — rendered as a two-column list. */
  contents: string[];
  priceWas: string;
  priceNow: string;
  discount: string;
  cta: string;
  /** The middle kit is flagged as matched to the student's room. */
  recommended?: boolean;
}

export const KITS: Kit[] = [
  {
    name: "Standard Kit",
    image: kitStandard,
    rating: "4.6",
    reviews: "347",
    itemCount: "34 items included",
    contents: ["5 Bedding", "3 Bathroom", "21 Kitchen", "5 Cleaning"],
    priceWas: "£232",
    priceNow: "£179",
    discount: "23%",
    cta: "View kit",
  },
  {
    name: "Premium Kit",
    image: kitPremium,
    rating: "4.4",
    reviews: "235",
    itemCount: "43 items included",
    contents: ["5 Bedding", "5 Bathroom", "31 Kitchen", "2 Cleaning"],
    priceWas: "£486",
    priceNow: "£379",
    discount: "22%",
    cta: "View your kit",
    recommended: true,
  },
  {
    name: "Deluxe Kit",
    image: kitDeluxe,
    rating: "4.5",
    reviews: "247",
    itemCount: "53 items included",
    contents: ["5 Bedding", "5 Bathroom", "41 Kitchen", "2 Cleaning"],
    priceWas: "£657",
    priceNow: "£519",
    discount: "21%",
    cta: "View kit",
  },
];

/** Left rail — the personalised pitch. */
export const PITCH = {
  heading: ["Gautam, your room", "ready before you arrive."],
  body:
    "Rooms come empty. Yours won’t: essentials like bedding, crockery & toiletries delivered " +
    "free before you land.",
  booking: {
    initial: "G",
    line: "Your kit is ready for iQ Bloomsbury, London for move-in on 15 Sept.",
    sub: "Free delivery + storage until you arrive · sizes pre-set to your room type",
  },
  trust: {
    rating: "4.4 · 1,100+ reviews",
    line: "amber supported over 3,700 students in their move-in",
  },
};

export interface SimPlan {
  name: string;
  /** Headline allowance — the line the card is scanned for. */
  allowance: string;
  pricePerMonth: string;
  /** Contract total, shown under the monthly figure. */
  total: string;
  features: string[];
  cta: string;
  /** Flags the middle plan as the default recommendation. */
  recommended?: boolean;
}

/**
 * SIM plans. The card layout follows the supplied design: name and allowance
 * stacked above a rule, then the monthly price with the contract total beneath
 * it, then the ticked feature list, and finally the price/CTA footer. "View
 * details" is an icon-only affordance pinned to the card's top-right corner so
 * it never competes with the buy action.
 */
export const SIM_PLANS: SimPlan[] = [
  {
    name: "Standard",
    allowance: "50 GB data",
    pricePerMonth: "£15.00",
    total: "£45.00 total for 3 months",
    features: [
      "Data + Voice + SMS",
      "50 GB",
      "30 days validity",
      "Unlimited incoming calls in the UK with unlimited local calls and texts from UK to UK",
    ],
    cta: "Buy Now",
  },
  {
    name: "Premium",
    allowance: "Unlimited data",
    pricePerMonth: "£25.00",
    total: "£75.00 total for 3 months",
    features: [
      "Data + Voice + SMS",
      "Unlimited data",
      "30 days validity",
      "Unlimited incoming calls in the UK with unlimited local calls and texts from UK to UK",
    ],
    cta: "Buy Now",
    recommended: true,
  },
];

/** The lilac device-compatibility prompt that sits under the plan cards. */
export const SIM_COMPATIBILITY = {
  line: ["Check if your device", "is compatible"],
  cta: "Check Now",
};

/** Reassurance strip closing the SIM section. */
export const SIM_TRUST = {
  note: {
    before: "Every plan includes a ",
    strong: "UK number",
    after: ", unlimited UK calls and texts, 5G and hotspot",
  },
  rating: "4.4 · 1,100+ reviews",
  points: ["Running on the Vodafone network", "Nothing renews — one payment"],
};

/** The without/with comparison. Three rows each, matched pairwise. */
export const COMPARISON = {
  title: "Moving in without a kit vs. with one",
  subtitle: "The same three days, two very different versions.",
  caption: "Everything sorted, before day one.",
  without: [
    "Online orders can’t arrive before you move in",
    "Tens of items, days of shopping",
    "Empty room on arrival",
  ],
  with: [
    "amber’s partnership keep your kit stored",
    "One box, delivered to your accommodation",
    "Bed, kitchen & bathroom setup in an hour",
  ],
};
