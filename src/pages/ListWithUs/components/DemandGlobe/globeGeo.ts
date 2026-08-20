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
    out.push([Math.atan2(v[1], v[0]) * DEG, Math.asin(Math.min(1, Math.max(-1, v[2]))) * DEG]);
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
