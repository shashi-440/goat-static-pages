/**
 * Sphere geometry for the Mapbox globe.
 *
 * Two things Mapbox GL does not give us:
 *
 *  1. Great-circle interpolation between two coordinates. Mapbox draws a
 *     `LineString` along the shortest surface path between consecutive vertices, so
 *     a two-point line from Mumbai to London is *already* a great circle — but it
 *     cannot be partially drawn. Animating a line growing out of its origin means
 *     handing it a fresh vertex list every frame, so the path has to be sampled
 *     here.
 *
 *  2. An occlusion test. `map.project()` happily returns screen coordinates for a
 *     point on the FAR side of the globe — verified: at centre 15°E it places
 *     Sydney at (619, 352), inside the viewport, when Sydney is behind the earth.
 *     Anything positioned in the DOM from `project()` therefore needs `isFacing()`
 *     as well, or hover cards and labels appear over the wrong hemisphere.
 *     (Mapbox's own circle and symbol layers are occluded correctly; this is only
 *     a problem for our own DOM overlays.)
 */

export type LngLat = [number, number];

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Unit vector for a coordinate on the sphere. */
const toVec = (lng: number, lat: number): [number, number, number] => {
  const la = lat * RAD;
  const lo = lng * RAD;
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
};

/**
 * Sample the great-circle path between two coordinates as `samples + 1` points.
 *
 * Standard slerp, then back to lon/lat. Sampling densely rather than relying on
 * Mapbox's own two-point geodesic is what makes a partial arc possible: the drawn
 * line is a *slice* of this list.
 */
export const greatCircle = (from: LngLat, to: LngLat, samples = 48): LngLat[] => {
  const a = toVec(from[0], from[1]);
  const b = toVec(to[0], to[1]);
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const sinO = Math.sin(omega);

  const out: LngLat[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    let v: [number, number, number];
    if (sinO < 1e-9) {
      // Coincident or antipodal — no unique great circle. Degenerate rather than
      // divide by ~0; no route in the table hits this.
      v = a;
    } else {
      const s0 = Math.sin((1 - t) * omega) / sinO;
      const s1 = Math.sin(t * omega) / sinO;
      v = [a[0] * s0 + b[0] * s1, a[1] * s0 + b[1] * s1, a[2] * s0 + b[2] * s1];
    }
    let lon = Math.atan2(v[1], v[0]) * DEG;
    // ── UNWRAPPED, which matters on a flat map ─────────────────────────────
    // `atan2` returns -180..180, so a path crossing the antimeridian steps from +179 to
    // -179 between two samples. On a globe that is invisible — the two points are
    // neighbours in 3D. On a FLAT projection it is a line drawn the long way back across
    // the entire map, and one such streak crosses everything else on screen.
    //
    // Adding a turn each time the step exceeds half a revolution keeps the sequence
    // continuous, so the path simply carries on past 180 into the next copy of the world.
    // Mapbox accepts longitudes outside -180..180 and renders them in the wrapped copy,
    // so this is correct in both projections rather than a flat-map special case.
    const prev = out[out.length - 1];
    if (prev) {
      while (lon - prev[0] > 180) lon -= 360;
      while (lon - prev[0] < -180) lon += 360;
    }
    out.push([lon, Math.asin(Math.min(1, Math.max(-1, v[2]))) * DEG]);
  }
  return out;
};

/**
 * A bowed path between two coordinates, sampled as `samples + 1` points.
 *
 * ── Why not the great circle ────────────────────────────────────────────────
 * `greatCircle` above draws the true shortest route, and on a GLOBE that is also the
 * prettiest: it wraps over the sphere and the curvature is the sphere's own. Projected
 * flat it is nearly a straight line for most pairs — the only bend is whatever mercator
 * imposes, which for two places at similar latitudes is almost none. A dozen arcs
 * converging on one building came out as a bundle of straight ties.
 *
 * So on the flat map the arc is DRAWN rather than derived: a quadratic bezier whose
 * control point sits off the midpoint, perpendicular to the chord. That is the flight-map
 * convention, and the shape is honest about being a convention rather than pretending to
 * be a route.
 *
 * `bow` is the control point's offset as a fraction of the chord's length, so a long
 * journey bends more than a short one in absolute terms and the same amount in relative
 * ones — which is what stops short hops looking like near-circles.
 *
 * The bow is always NORTHWARD. Alternating it by geometry would send some arcs over the
 * top and some under the bottom of the same pair of endpoints, and the map would read as
 * two unrelated systems.
 */
export const arcPath = (
  from: LngLat,
  to: LngLat,
  samples = 96,
  bow = 0.3,
): LngLat[] => {
  const [x0, y0] = from;
  // The destination, moved to whichever copy of the world is nearest the origin. Without
  // this a Manila -> London arc is drawn the long way round the entire map — the same
  // antimeridian trap `greatCircle` documents, arriving here by a different route.
  let x1 = to[0];
  const y1 = to[1];
  while (x1 - x0 > 180) x1 -= 360;
  while (x1 - x0 < -180) x1 += 360;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1e-9;
  // Unit perpendicular, flipped so it always points north. `py` is the latitude component;
  // if it is negative the perpendicular is pointing at the south pole and both components
  // have to turn round together, or the bow leans the wrong way as well as down.
  let px = -dy / len;
  let py = dx / len;
  if (py < 0) {
    px = -px;
    py = -py;
  }

  const cx = (x0 + x1) / 2 + px * len * bow;
  const cy = (y0 + y1) / 2 + py * len * bow;

  const out: LngLat[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const u = 1 - t;
    out.push([
      u * u * x0 + 2 * u * t * cx + t * t * x1,
      u * u * y0 + 2 * u * t * cy + t * t * y1,
    ]);
  }
  return out;
};

/**
 * A slice of a sampled path, from fraction `t0` to `t1`, with the end vertices
 * interpolated so the line grows smoothly instead of in whole-sample steps.
 *
 * Interpolating linearly between two adjacent samples is safe here even though the
 * path is curved: at 48 samples the neighbours are a fraction of a degree apart, so
 * the chord and the arc are indistinguishable at any zoom this hero uses.
 */
export const slicePath = (path: LngLat[], t0: number, t1: number): LngLat[] => {
  const last = path.length - 1;
  const a = Math.max(0, Math.min(1, t0)) * last;
  const b = Math.max(0, Math.min(1, t1)) * last;
  if (b - a <= 0) return [];

  const lerp = (i: number): LngLat => {
    const j = Math.floor(i);
    const f = i - j;
    if (j >= last) return path[last];
    const p = path[j];
    const q = path[j + 1];
    // Longitudes are unwrapped relative to p, so a segment spanning the
    // antimeridian does not interpolate the long way round the planet.
    let dLng = q[0] - p[0];
    if (dLng > 180) dLng -= 360;
    if (dLng < -180) dLng += 360;
    return [p[0] + dLng * f, p[1] + (q[1] - p[1]) * f];
  };

  const out: LngLat[] = [lerp(a)];
  for (let j = Math.ceil(a); j <= Math.floor(b); j += 1) out.push(path[j]);
  out.push(lerp(b));
  // Two identical points make Mapbox drop the feature; one point is not a line.
  return out.length >= 2 ? out : [];
};

/**
 * Is this coordinate on the near face of the globe, given where the camera is
 * looking?
 *
 * Dot product of the two unit vectors: positive means the point is within 90° of
 * the sub-camera point and therefore visible. `slack` pulls the terminator in
 * slightly so a label does not flicker exactly on the limb, where it would be
 * edge-on and unreadable anyway.
 */
export const isFacing = (
  lng: number,
  lat: number,
  centre: { lng: number; lat: number },
  slack = 0.08,
): boolean => {
  const p = toVec(lng, lat);
  const c = toVec(centre.lng, centre.lat);
  return p[0] * c[0] + p[1] * c[1] + p[2] * c[2] > slack;
};
