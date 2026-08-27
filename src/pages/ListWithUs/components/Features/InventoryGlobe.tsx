import { useEffect, useRef, useState } from "react";
import config from "@Config/index";
import styles from "./InventoryGlobe.module.scss";
import { ORIGINS } from "../DemandMap/network";
// The hero globe's own avatar discs — exported from there rather than rebuilt. See the note on
// `loadFaces` in that file for why they are exported in place instead of moved.
import { BADGE, loadFaces, makeBadge, ORIGIN_SPRITE } from "../DemandGlobe/DemandGlobe";

/**
 * A turning globe pinned with amber's student avatars — the art for the "Access global demand"
 * card.
 *
 * ── Ported from Partner With Us's `InventoryGlobe`, with one change ─────────
 * The framing, the fog, the fade-in, the failure path and the screen-reader list are all that
 * component's. What changed is what marks a city: it pins Mapbox's `lodging` icon tinted blue,
 * and this pins the AVATAR BADGES the hero globe uses for its source cities. The card is about
 * where demand comes FROM, so the mark is a student, not a building.
 *
 * ⚠️  THIS IS THE PAGE'S SECOND MAPBOX MAP, and map loads are BILLED. The hero already runs one
 * (`DemandGlobe`), so this doubles the page's map loads and puts a second WebGL context in the
 * same document. Two things follow from that and both are deliberate:
 *   · It only mounts when the card is on screen (see `Features`), so a reader who never reaches
 *     the section never loads it.
 *   · It fails like decoration. No token, no WebGL2, a blocked CDN or a 401 all end at `onFail`
 *     and the card falls back to a drawn panel. A benefit card must not depend on a
 *     third-party script to say what the benefit is.
 *
 * ── streets-v12, not Standard ──────────────────────────────────────────────
 * Deliberately different from the hero, which runs `standard` with its labels switched off. This
 * card wants the place names — they are what makes it read as a map of real markets at this size
 * — and Standard's labels cannot be styled per-layer the way a classic style's can. It also
 * costs nothing here that it costs there: the hero needs a clean sphere for its own arcs and
 * tooltip, where this one is a slow turn behind a card.
 */

const MAPBOX_VERSION = "3.7.0";
const MAPBOX_JS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
const MAPBOX_CSS = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;

declare const mapboxgl: any;

/**
 * One in-flight load shared by every caller, so two maps on one page do not each inject the
 * script. Resolves false rather than rejecting — the caller's job is to fall back, not to
 * handle an error.
 */
let loading: Promise<boolean> | null = null;

const loadMapbox = (): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof mapboxgl !== "undefined") return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    if (!document.querySelector(`link[href="${MAPBOX_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = MAPBOX_CSS;
      document.head.appendChild(link);
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
 * Centred on the Atlantic at 46°N: the limb crosses the top of the frame and Europe sits under
 * it, which is the reference's framing and also where most of `ORIGINS` is.
 */
const CENTRE_LNG = -30;
const CENTRE_LAT = 46;
const ZOOM = 1.35;

/** Degrees of longitude per second. A full turn takes three minutes. */
const SPIN_DEG_PER_SEC = 2;
/** How long the globe holds still after load before it starts turning. */
const SPIN_START_MS = 600;

interface InventoryGlobeProps {
  /** Called when the globe cannot be drawn, so the card can show its fallback instead. */
  onFail: () => void;
}

const InventoryGlobe = ({ onFail }: InventoryGlobeProps) => {
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: any = null;
    let raf = 0;
    // Reduced motion gets a still globe. The spin is decoration and there is nothing it
    // communicates that the pinned avatars do not.
    const still = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Kicked off before the map is created so the decode overlaps Mapbox's own style and tile
    // fetches rather than queueing behind them.
    const facesReady = loadFaces();

    loadMapbox().then(async (ok) => {
      if (cancelled || !stage.current) return;
      if (!ok || !config.MAPBOX_ACCESS_TOKEN) {
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
          center: [CENTRE_LNG, CENTRE_LAT],
          zoom: ZOOM,
          // Every interaction off. The card is a picture, and a globe that swallowed the wheel
          // would trap the reader inside a benefit card.
          interactive: false,
          attributionControl: false,
        });
      } catch (error) {
        onFail();
        return;
      }

      map.on("error", (e: any) => {
        const status = e?.error?.status;
        // A 401/403 is an expired or domain-restricted token: the globe would be blank rather
        // than wrong, so take the fallback instead.
        if (status === 401 || status === 403) onFail();
      });

      const faces = await facesReady;
      if (cancelled) return;

      map.on("load", () => {
        if (cancelled) return;

        // Space is the card, not a starfield: this globe sits on #f7f7f7 and an opaque navy
        // backdrop would make the card a dark slab with a planet in it.
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

        // ── The avatars, registered BEFORE the layer names them ─────────────
        // A layer whose `icon-image` does not resolve draws nothing and warns nothing, so the
        // sprites go in first. One per origin, because each origin has its own face — same
        // arrangement as the hero globe, and the reason its `icon-image` is data-driven too.
        //
        // `pinRatio` is capped at 2 then doubled, matching the hero: it is what keeps the discs
        // crisp on retina without drawing them at four times the size everywhere.
        const pinRatio = Math.min(window.devicePixelRatio || 1, 2) * 2;
        ORIGINS.forEach((_origin, i) => {
          const id = `${ORIGIN_SPRITE}-inv-${i}`;
          if (map.hasImage(id)) return;
          const badge = makeBadge(faces[i % faces.length], pinRatio);
          if (badge) map.addImage(id, badge as any, { pixelRatio: pinRatio });
        });

        map.addSource("origins", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: ORIGINS.map((o, i) => ({
              type: "Feature",
              id: i,
              // `pin` names this origin's own sprite — the layer reads it below.
              properties: { pin: `${ORIGIN_SPRITE}-inv-${i}` },
              geometry: { type: "Point", coordinates: [o.location[1], o.location[0]] },
            })),
          },
        });

        map.addLayer({
          id: "origins",
          type: "symbol",
          source: "origins",
          layout: {
            "icon-image": ["get", "pin"],
            // The discs are drawn at `BADGE.size`; 0.62 of that reads as a cluster of faces
            // rather than a wall of them at this zoom. Tuned against the COUNT — twenty-six
            // origins over Europe merge into one mass at 1.
            "icon-size": 0.62,
            // Centre, not bottom: these are circular badges with no tip to put on the point.
            "icon-anchor": "center",
            // Always drawn. A decluttered badge would silently drop a source market, and there
            // is nothing here for them to collide with but each other.
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });

        // Faded in only once tiles have actually painted. Mapbox shows the style's flat
        // background until then, which on a globe is a hard rectangle of grey filling the card
        // — worse than empty space for the half-second it lasts.
        map.once("idle", () => {
          if (!cancelled) setReady(true);
        });

        if (still) return;

        // ── THE SPIN ────────────────────────────────────────────────────────
        // Turned by writing the centre each frame rather than with a Mapbox camera animation:
        // this has to run forever, and `easeTo` chained end to end stutters at every handover.
        // One property write per frame does not.
        //
        // ⚠️  The longitude is TRACKED HERE rather than read back off the map each frame.
        // `getCenter()` can hand back the transform's LIVE centre object, so the obvious version
        // — mutate `centre.lng`, pass `centre` back to `setCenter` — is handing the map the
        // object it already holds, and its "has this actually changed?" guard short-circuits.
        // The globe sits perfectly still. Keeping our own number and passing a fresh array
        // cannot hit that.
        let last = 0;
        let lng = CENTRE_LNG;
        const started = Date.now();
        const frame = (now: number) => {
          raf = window.requestAnimationFrame(frame);
          if (Date.now() - started < SPIN_START_MS) return;
          if (!last) last = now;
          // Capped, so a backgrounded tab handing back one enormous delta does not jump the
          // globe a third of the way round on return.
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
      <div ref={stage} className={`${styles.stage} ${ready ? styles.ready : ""}`} />
      {/* The globe is a canvas and says nothing to a screen reader or a crawler, so the markets
          it pins are also here as text. */}
      <p className={styles.sr}>
        Students search from {ORIGINS.map((o) => o.label).join(", ")} and beyond.
      </p>
    </div>
  );
};

export default InventoryGlobe;
