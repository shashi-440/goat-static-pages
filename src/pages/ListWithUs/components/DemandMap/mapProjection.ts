/**
 * Equirectangular projection and arc geometry for the flat demand map.
 *
 * Plate carrée: longitude and latitude map linearly to x and y. It distorts area
 * badly toward the poles (Greenland reads enormous), which is the usual reason to
 * avoid it — and the right trade here, because the whole point of this map is that
 * every city is visible at once with a stable, authorable label position. Mercator
 * would push the northern European cluster further apart but shove Sydney and São
 * Paulo into a much taller frame; an equal-area projection would curve the
 * graticule and make hand-placed labels far harder to keep tidy.
 *
 * Latitude is CLIPPED rather than shown in full. The high Arctic renders as an
 * unbroken band of dots across the top of the frame (northern Canada, Greenland,
 * Svalbard and Siberia all merge at this resolution) which reads as a border
 * artefact, and Antarctica is a solid bar along the bottom that no student books
 * from. Cutting at 74°N / 56°S keeps Iceland, mainland Norway and every market on
 * the list, trims Greenland part-way — normal for a stylised web map — and gives
 * the frame a 360:130 aspect.
 */
export const LAT_TOP = 74;
export const LAT_BOTTOM = -56;

/**
 * Longitude is clipped too, and for the same reason: the middle of the Pacific is
 * empty. A full 360° frame spends its left third and a slice of its right edge on
 * open ocean, which costs every marker and label real size for nothing.
 *
 * 125°W → 165°E is 290°, and it comfortably contains the whole network — Toronto
 * at 79°W and São Paulo at 47°W sit well inside the left edge, Sydney at 151°E
 * inside the right. Dropping those 70° makes everything on the map 1.24x larger at
 * the same frame width, which is most of what the mobile layout needed.
 */
export const LON_LEFT = -125;
export const LON_RIGHT = 165;

/** Frame aspect that follows from the clips, so the map never squashes. */
export const MAP_ASPECT = (LON_RIGHT - LON_LEFT) / (LAT_TOP - LAT_BOTTOM);

export interface Point {
  x: number;
  y: number;
}

/** lon/lat → pixels inside a `width` x `height` frame. */
export const project = (lon: number, lat: number, width: number, height: number): Point => ({
  x: ((lon - LON_LEFT) / (LON_RIGHT - LON_LEFT)) * width,
  y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * height,
});

/** Pixels → lon/lat, for walking the frame when plotting the land dots. */
export const unproject = (x: number, y: number, width: number, height: number) => ({
  lon: LON_LEFT + (x / width) * (LON_RIGHT - LON_LEFT),
  lat: LAT_TOP - (y / height) * (LAT_TOP - LAT_BOTTOM),
});

/**
 * Sample a demand arc from `from` to `to` as a quadratic curve bowing away from
 * the straight line.
 *
 * On a flat map there is no sphere to bow over, so the lift is a screen-space
 * offset perpendicular to the chord, scaled by the chord's length — long hauls
 * arch high, short hops stay flat. Always bowing toward the TOP of the frame
 * (negative y) rather than to one side keeps every arc reading as the same kind of
 * movement; arcs that bowed by signed perpendicular would flip direction
 * depending on which way the route ran and look inconsistent.
 *
 * Returned as a flat point list rather than a Path2D so the caller can draw a
 * partial arc (the comet) by slicing it, which a path cannot do.
 */
export const buildArc = (from: Point, to: Point, samples = 40): Point[] => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const chord = Math.hypot(dx, dy);

  // 0.22 of the chord, tapering off for very long routes so a half-map arc does
  // not fly out of the top of the frame.
  const lift = Math.min(chord * 0.22, 130);

  // Control point above the midpoint.
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2 - lift;

  const out: Point[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const u = 1 - t;
    out.push({
      x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
      y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
    });
  }
  return out;
};
