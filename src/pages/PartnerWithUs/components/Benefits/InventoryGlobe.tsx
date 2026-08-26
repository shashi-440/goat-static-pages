import { useEffect, useRef, useState } from "react";
import config from "@Config/index";
import styles from "./InventoryGlobe.module.scss";

/**
 * A slowly turning Mapbox globe with amber's destinations pinned on it — the art
 * for the "Global housing inventory" card.
 *
 * ── Why a classic style and not Standard ────────────────────────────────────
 * The pins are MAPBOX'S OWN `lodging` icon, not a drawn one. That is the whole
 * reason the style here is `streets-v12` rather than the `standard` this repo's
 * other map (List With Us's DemandGlobe) uses: Standard is a style *package* and
 * its sprite is internal, so it publishes no icons by name. Measured, not assumed
 * — `map.listImages()` on Standard returns only the images our own code added,
 * while streets-v12 returns 440 including `lodging`, `marker` and `lighthouse`.
 * Ask Standard for `icon-image: "lodging"` and it resolves to nothing, draws
 * nothing, and warns nothing.
 *
 * `light-v11` also carries `lodging` and is the quieter map, but its land and
 * water are near-white and near-grey, and a globe that pale on a #f7f7f7 card has
 * no edge at all. Streets has the green-land / blue-ocean contrast the reference
 * shows, and its labels read at this size.
 *
 * ── Loaded from the CDN, not bundled ───────────────────────────────────────
 * Same arrangement as DemandGlobe and as amber-user-website's search pages: the
 * script is injected from api.mapbox.com and `mapboxgl` is an ambient global, so
 * nothing enters package.json and the component pastes back unchanged.
 *
 * ── It is decoration, and fails like decoration ────────────────────────────
 * No token, no WebGL2, a blocked CDN or a 401 all end the same way: `onFail` is
 * called and the card falls back to the drawn inventory panel it used before.
 * A benefit card must not depend on a third-party script to say what the benefit
 * is.
 *
 * ⚠️  NO ATTRIBUTION IS RENDERED, matching the precedent DemandGlobe set on the
 * sibling page and flagged there: `attributionControl: false` is the only way to
 * stop the control being created at all. That satisfied OpenStreetMap's ODbL
 * requirement before it was removed by request, so restoring it is one line —
 * `map.addControl(new mapboxgl.AttributionControl({ compact: true }))` — and it
 * needs settling with Mapbox before this goes to production.
 */

const MAPBOX_VERSION = "3.7.0";
const MAPBOX_JS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
const MAPBOX_CSS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;

declare const mapboxgl: any;

/**
 * One in-flight load shared by every caller, so two maps on one page do not each
 * inject the script. Resolves false rather than rejecting — the caller's job is
 * to fall back, not to handle an error.
 */
let loading: Promise<boolean> | null = null;

const loadMapbox = () => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof mapboxgl !== "undefined") return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = MAPBOX_CSS;
      document.head.appendChild(css);
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${MAPBOX_JS}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = MAPBOX_JS;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return loading;
};

/**
 * The pins — [lng, lat]. 94 of them, spread over every inhabited continent.
 *
 * ⚠️  THIS IS A DENSITY, NOT A SUPPLY LIST. It is deliberately not amber's footprint:
 * the brief for this card was to make the globe look populated wherever it happens to
 * be turned, and a set that only covered real markets left two thirds of every
 * rotation showing bare ocean. Do NOT read a pin here as a market amber serves, and
 * do not let this list become the source of truth for one.
 *
 * That is also why the screen-reader line below names regions rather than cities. The
 * globe is decoration and can be generous; the text is a claim and cannot.
 */
const CITIES: Array<[number, number]> = [
  // North America
  [-74.006, 40.7128], // New York
  [-79.3832, 43.6532], // Toronto
  [-123.1207, 49.2827], // Vancouver
  [-73.5673, 45.5017], // Montreal
  [-87.6298, 41.8781], // Chicago
  [-71.0589, 42.3601], // Boston
  [-118.2437, 34.0522], // Los Angeles
  [-122.4194, 37.7749], // San Francisco
  [-122.3321, 47.6062], // Seattle
  [-97.7431, 30.2672], // Austin
  [-84.388, 33.749], // Atlanta
  [-80.1918, 25.7617], // Miami
  [-114.0719, 51.0447], // Calgary
  [-99.1332, 19.4326], // Mexico City
  // South America
  [-46.6333, -23.5505], // Sao Paulo
  [-43.1729, -22.9068], // Rio de Janeiro
  [-58.3816, -34.6037], // Buenos Aires
  [-70.6693, -33.4489], // Santiago
  [-77.0428, -12.0464], // Lima
  [-74.0721, 4.711], // Bogota
  // Europe
  [-0.1276, 51.5074], // London
  [-2.2426, 53.4808], // Manchester
  [-3.1883, 55.9533], // Edinburgh
  [-6.2603, 53.3498], // Dublin
  [2.3522, 48.8566], // Paris
  [13.405, 52.52], // Berlin
  [11.582, 48.1351], // Munich
  [4.9041, 52.3676], // Amsterdam
  [4.3517, 50.8503], // Brussels
  [-3.7038, 40.4168], // Madrid
  [2.1734, 41.3851], // Barcelona
  [-9.1393, 38.7223], // Lisbon
  [12.4964, 41.9028], // Rome
  [9.19, 45.4642], // Milan
  [8.5417, 47.3769], // Zurich
  [16.3738, 48.2082], // Vienna
  [14.4378, 50.0755], // Prague
  [21.0122, 52.2297], // Warsaw
  [19.0402, 47.4979], // Budapest
  [23.7275, 37.9838], // Athens
  [18.0686, 59.3293], // Stockholm
  [12.5683, 55.6761], // Copenhagen
  [10.7522, 59.9139], // Oslo
  [24.9384, 60.1699], // Helsinki
  [28.9784, 41.0082], // Istanbul
  // Africa
  [31.2357, 30.0444], // Cairo
  [-7.5898, 33.5731], // Casablanca
  [10.1815, 36.8065], // Tunis
  [3.3792, 6.5244], // Lagos
  [-0.187, 5.6037], // Accra
  [36.8219, -1.2921], // Nairobi
  [38.7578, 9.0192], // Addis Ababa
  [28.0473, -26.2041], // Johannesburg
  [18.4241, -33.9249], // Cape Town
  // Middle East
  [55.2708, 25.2048], // Dubai
  [54.3773, 24.4539], // Abu Dhabi
  [51.531, 25.2854], // Doha
  [46.6753, 24.7136], // Riyadh
  [35.9106, 31.9539], // Amman
  [34.7818, 32.0853], // Tel Aviv
  // Asia
  [77.209, 28.6139], // Delhi
  [72.8777, 19.076], // Mumbai
  [77.5946, 12.9716], // Bengaluru
  [78.4867, 17.385], // Hyderabad
  [80.2707, 13.0827], // Chennai
  [79.8612, 6.9271], // Colombo
  [90.4125, 23.8103], // Dhaka
  [67.0011, 24.8607], // Karachi
  [74.3587, 31.5204], // Lahore
  [85.324, 27.7172], // Kathmandu
  [100.5018, 13.7563], // Bangkok
  [101.6869, 3.139], // Kuala Lumpur
  [103.8198, 1.3521], // Singapore
  [106.8456, -6.2088], // Jakarta
  [120.9842, 14.5995], // Manila
  [106.6297, 10.8231], // Ho Chi Minh City
  [105.8342, 21.0278], // Hanoi
  [114.1694, 22.3193], // Hong Kong
  [121.5654, 25.033], // Taipei
  [121.4737, 31.2304], // Shanghai
  [116.4074, 39.9042], // Beijing
  [126.978, 37.5665], // Seoul
  [139.6503, 35.6762], // Tokyo
  [135.5023, 34.6937], // Osaka
  [76.8512, 43.222], // Almaty
  [69.2401, 41.2995], // Tashkent
  // Oceania
  [151.2093, -33.8688], // Sydney
  [144.9631, -37.8136], // Melbourne
  [153.0251, -27.4698], // Brisbane
  [115.8605, -31.9505], // Perth
  [138.6007, -34.9285], // Adelaide
  [174.7633, -36.8485], // Auckland
  [174.7762, -41.2865], // Wellington
  [172.6362, -43.5321], // Christchurch
];

/**
 * The camera's framing. Shared by the initial centre and the spin loop — two copies
 * of the latitude would let the globe jump the moment it started turning.
 */
const CENTRE_LNG = -20;
const CENTRE_LAT = 46;

/** The recoloured pin's own sprite id, and the Mapbox icon it is made from. */
const SOURCE_ICON = "lodging";
const PIN = "amber-lodging";

/** amber's network blue, as the disc colour. */
const BLUE = [28, 100, 242];

/**
 * Repaint Mapbox's `lodging` icon in amber's blue, from its own pixels.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 * The pin has to be Mapbox's, not a drawn one — and Mapbox's is VIOLET, which is
 * its POI colour for lodging. The obvious lever does not work: `icon-color` only
 * applies to SDF icons and this sprite is a plain bitmap (`sdf: false`, measured).
 *
 * So the icon is taken out of the sprite and its pixels are remapped. It is still
 * Mapbox's artwork — same bed, same disc, same shape — wearing a different colour.
 *
 * ── How the two tones are told apart ──────────────────────────────────────
 * The icon is a coloured disc with a white bed on it. Recolouring every opaque pixel
 * would swallow the bed and leave a blue blob, so pixels are separated by LUMINANCE
 * and remapped along a blue-to-white ramp: the disc's mid-luminance violet lands on
 * blue, the bed's near-white stays near-white, and the antialiased rim in between
 * lands in between — which is what keeps the edge smooth instead of jagged.
 *
 * Alpha is copied untouched. It is the only channel carrying the disc's silhouette,
 * and touching it would fray the outline.
 *
 * Returns null if anything about the sprite is not as expected, and the caller then
 * uses the untinted Mapbox icon rather than no icon at all.
 */
const tintPin = (image: any) => {
  const src = image && image.data;
  if (!src || !src.data || !src.width || !src.height) return null;

  const { width, height } = src;
  const out = new Uint8Array(src.data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    const lum = (0.299 * out[i] + 0.587 * out[i + 1] + 0.114 * out[i + 2]) / 255;
    // 0.55 is the disc's luminance and 1 is the bed's; everything below the disc
    // clamps to solid blue, everything at or above the bed clamps to white.
    const t = Math.min(1, Math.max(0, (lum - 0.55) / 0.45));
    out[i] = Math.round(BLUE[0] + (255 - BLUE[0]) * t);
    out[i + 1] = Math.round(BLUE[1] + (255 - BLUE[1]) * t);
    out[i + 2] = Math.round(BLUE[2] + (255 - BLUE[2]) * t);
  }
  return { width, height, data: out };
};

/** Degrees of longitude per second. A full turn takes three minutes. */
const SPIN_DEG_PER_SEC = 2;
/** Frames the globe holds still after load before it starts turning. */
const SPIN_START_MS = 600;

const InventoryGlobe = ({ onFail }: { onFail: () => void }) => {
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    let raf = 0;

    const still =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    loadMapbox().then((ok) => {
      if (cancelled) return;
      if (!ok || !stage.current || !config.MAPBOX_ACCESS_TOKEN) {
        onFail();
        return;
      }
      // What the main app gates on too; the globe projection needs WebGL2.
      if (typeof mapboxgl.supported === "function" && !mapboxgl.supported()) {
        onFail();
        return;
      }

      mapboxgl.accessToken = config.MAPBOX_ACCESS_TOKEN;
      try {
        map = new mapboxgl.Map({
          container: stage.current,
          style: "mapbox://styles/mapbox/streets-v12",
          projection: "globe",
          // Centred on the Atlantic at 46°N, which is the reference's framing:
          // the limb crosses the top of the frame and Europe sits under it.
          center: [CENTRE_LNG, CENTRE_LAT],
          zoom: 1.35,
          // Every interaction off. The card is a picture, and a globe that
          // swallowed the wheel would trap the reader inside a benefit card.
          interactive: false,
          attributionControl: false,
        });
      } catch (error) {
        onFail();
        return;
      }

      map.on("error", (e: any) => {
        const status = e?.error?.status;
        // A 401/403 is an expired or domain-restricted token: the globe will be
        // blank rather than wrong, so take the fallback instead.
        if (status === 401 || status === 403) onFail();
      });

      map.on("load", () => {
        if (cancelled) return;

        // Space is the card, not a starfield: this globe sits on #f7f7f7 and an
        // opaque navy backdrop would make the card a dark slab with a planet in it.
        try {
          map.setFog({
            "space-color": "rgba(0, 0, 0, 0)",
            "star-intensity": 0,
            "high-color": "rgba(255, 255, 255, 0)",
            "horizon-blend": 0.02,
          });
        } catch (error) {
          // Older revisions do not take every fog key; not worth failing over.
        }

        // Registered BEFORE the layer names it: a layer whose `icon-image` does not
        // resolve draws nothing and warns nothing.
        let icon = SOURCE_ICON;
        try {
          const tinted = tintPin(map.style && map.style.getImage(SOURCE_ICON));
          if (tinted && !map.hasImage(PIN)) {
            map.addImage(PIN, tinted as any, {
              // Matched to the source sprite, or a 2x icon draws at double size.
              pixelRatio: map.style.getImage(SOURCE_ICON).pixelRatio || 1,
            });
          }
          if (map.hasImage(PIN)) icon = PIN;
        } catch (error) {
          // Falls through to Mapbox's own violet icon, which is a colour problem
          // rather than a missing pin.
        }

        map.addSource("beds", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: CITIES.map((location, i) => ({
              type: "Feature",
              id: i,
              properties: {},
              geometry: { type: "Point", coordinates: location },
            })),
          },
        });

        map.addLayer({
          id: "beds",
          type: "symbol",
          source: "beds",
          layout: {
            // Mapbox's own icon, repainted blue from its own pixels — see `tintPin`.
            // Falls back to the untinted `lodging` if the sprite cannot be read.
            "icon-image": icon,
            // Tuned against the pin COUNT, not picked once. At twelve pins 1.15 was
            // right; at ninety-four it turned the northern hemisphere into one blue
            // mass, so it came down to 0.82; 1 reads clearly at this density without
            // the European cluster merging.
            "icon-size": 1,
            // Always drawn: a decluttered pin would silently drop a destination,
            // and there is nothing here for it to collide with but its siblings.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
          // ── STILL NO PAINT PROPERTIES ─────────────────────────────────────
          // `icon-color` would be the obvious way to make these blue and it does
          // nothing here: it applies only to SDF icons, and this sprite is a bitmap
          // (`sdf: false`, measured — `marker` is too). The colour is baked into a
          // recoloured copy of Mapbox's own icon instead; see `tintPin` above.
        });

        setReady(true);

        if (still) return;
        // Turned by writing the centre each frame rather than with a Mapbox camera
        // animation: this has to run forever, and `easeTo` chained end to end
        // stutters at every handover. One property write per frame does not.
        //
        // ⚠️  The longitude is TRACKED HERE rather than read back off the map each
        // frame. `getCenter()` can hand back the transform's live centre object, so
        // the obvious version — mutate `centre.lng`, pass `centre` back to
        // `setCenter` — is passing the map the object it already holds, and its
        // "has this actually changed?" guard short-circuits. The globe sat
        // perfectly still. Keeping our own number and passing a fresh array cannot
        // hit that.
        let last = 0;
        let lng = CENTRE_LNG;
        const started = Date.now();
        const frame = (now: number) => {
          raf = window.requestAnimationFrame(frame);
          if (Date.now() - started < SPIN_START_MS) return;
          if (!last) last = now;
          const dt = Math.min(0.1, (now - last) / 1000);
          last = now;
          lng -= SPIN_DEG_PER_SEC * dt;
          // Wrapped, so the number cannot run off to -100000 over a long session.
          if (lng < -180) lng += 360;
          map.setCenter([lng, CENTRE_LAT]);
        };
        raf = window.requestAnimationFrame(frame);
      });
    });

    return () => {
      cancelled = true;
      if (raf) window.cancelAnimationFrame(raf);
      if (map) map.remove();
    };
  }, [onFail]);

  return (
    <div className={styles.wrap}>
      <div
        ref={stage}
        className={`${styles.stage} ${ready ? styles.ready : ""}`}
        aria-hidden="true"
      />
      {/* The globe is decoration; this is what the section actually asserts, and
          it is what a screen reader and a crawler get instead of a canvas. */}
      <span className={styles.sr}>
        amber lists student housing across major study destinations in North and South
        America, Europe, Africa, the Middle East, Asia and Oceania.
      </span>
    </div>
  );
};

export default InventoryGlobe;
