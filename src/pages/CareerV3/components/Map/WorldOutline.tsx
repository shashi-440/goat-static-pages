/**
 * Stylised dot-matrix world map.
 *
 * Rendered as a grid of small circles rather than as landmass paths: at this
 * size a detailed vector coastline reads as noise, while the dot matrix stays
 * legible, weighs nothing, and lets the market pins sit on top as the only
 * "solid" marks on the map.
 *
 * LANDMASK is generated, not hand-drawn — Natural Earth's ne_110m_land polygons
 * rasterised onto the grid below with a point-in-polygon test (`#` = land).
 * The projection is plain equirectangular over the window:
 *
 *   longitude  -168°  →  190°   (left → right)
 *   latitude     78°N →  -56°S  (top → bottom)
 *
 * Antarctica is excluded — it fills the bottom of the frame and amber has no
 * market there. The window runs past the antimeridian to 190°E so New Zealand
 * stays attached to Australia rather than wrapping off the right edge.
 *
 * IMPORTANT: the market pins in Map.tsx are positioned as percentages on this
 * same projection. If the window above changes, the pin percentages have to be
 * recomputed from lat/long to match — they are not independent numbers.
 */
const LANDMASK = [
  "..........###.#####...###########................##....#######....##..........",
  "..#......############...########..........#.....#..####################.......",
  "###################.###..######.........######################################",
  "###################.###..###...###....########################################",
  "################...####...##.........#####################################....",
  ".##....#################...........#..##.##########################...##......",
  "........#################.........##################################..##......",
  ".........################..........################################...........",
  ".........###############...........########..#######################..........",
  ".........############.............###.###########################..#..........",
  "..........##########...............#####.######################.####..........",
  "...........#########..............######.######################..#............",
  "...........######.#...............#############################...............",
  ".............###.................###############################..............",
  "..#..........###.#.#.............#################..#########.................",
  "..............####..#............############.###...###..###..##..............",
  ".................##..............###############.....#....###..#..............",
  "..................######.........###############.....##...##...#..............",
  "...................#######........#############..........##..##...............",
  "...................#######............#########...........#.#####.............",
  "...................#########..........########............######.###.#........",
  "...................##########..........######..............###....#####.......",
  "...................##########..........#######...................#.....#......",
  "....................########...........#######.#................##.##........",
  ".....................#######...........######.##...............######.........",
  ".....................#######...........######.#..............#########........",
  ".....................#####..............####..#..............#########........",
  ".....................#####..............####.................#########........",
  ".....................####...............###..................###..####....#...",
  "....................####...........................................##.....##..",
  "....................###.............................................#.....#...",
  "....................##...................................................#....",
  "....................##.#......................................................",
  "....................##........................................................",
];

// Grid geometry. The viewBox is sized so cells land on whole numbers.
const CELL = 10; // spacing between dot centres
const RADIUS = 3.2; // dot radius
const COLS = 78;
const ROWS = LANDMASK.length;

interface WorldOutlineProps {
  className?: string;
}

const WorldOutline = ({ className }: WorldOutlineProps) => {
  const dots: JSX.Element[] = [];

  LANDMASK.forEach((row, y) => {
    for (let x = 0; x < COLS; x += 1) {
      if (row[x] !== "#") continue;
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={x * CELL + CELL / 2}
          cy={y * CELL + CELL / 2}
          r={RADIUS}
          // Fade the top two rows — the Arctic reads as a solid bar otherwise,
          // which makes the map look like it has a frame around it.
          opacity={y < 2 ? 0.5 : 1}
        />,
      );
    }
  });

  return (
    <svg
      className={className}
      viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
      fill="currentColor"
      role="img"
      aria-label="World map showing the countries amber operates in"
      preserveAspectRatio="xMidYMid meet"
    >
      {dots}
    </svg>
  );
};

export default WorldOutline;
