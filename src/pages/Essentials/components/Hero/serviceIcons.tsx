/**
 * Line icons for the six services in the switcher.
 *
 * The mockup left these as flat grey placeholder squares (`.tabIco` had a
 * background and no artwork), so there was nothing to port — on a live page an
 * empty square reads as a failed image. These are drawn to match: one weight,
 * `currentColor` throughout, so each picks up its service's active/hover colour.
 */
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export const ForexIcon = () => (
  <svg {...base}>
    <rect x="2" y="5" width="20" height="14" rx="2.5" />
    <path d="M2 10h20" />
    <path d="M6 15h4" />
  </svg>
);

export const KitIcon = () => (
  <svg {...base}>
    <path d="M3 7.5l9-4.5 9 4.5v9L12 21 3 16.5v-9z" />
    <path d="M3 7.5l9 4.5 9-4.5M12 12v9" />
  </svg>
);

export const FlightIcon = () => (
  <svg {...base}>
    <path d="M2 13l20-6-6.5 13-2.5-5.5L2 13z" />
  </svg>
);

export const BankIcon = () => (
  <svg {...base}>
    <path d="M3 9.5L12 4l9 5.5" />
    <path d="M5 9.5V19h14V9.5M9 19v-5h6v5" />
  </svg>
);

export const PickupIcon = () => (
  <svg {...base}>
    <path d="M3 16V9.5h11V16" />
    <path d="M14 11.5h4l3 3V16" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 10.5L12 4l8 6.5V20H4v-9.5z" />
    <path d="M9.5 20v-5.5h5V20" />
  </svg>
);

/** Keyed by the service labels in content.ts. */
export const SERVICE_ICONS: Record<string, () => JSX.Element> = {
  "Forex Card": ForexIcon,
  "Essential Kit": KitIcon,
  Flights: FlightIcon,
  Bank: BankIcon,
  "Airport Pickup": PickupIcon,
  Accommodation: HomeIcon,
};
