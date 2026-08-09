/**
 * A minimal 3D toolkit: vector maths, polyhedral geometry, perspective
 * projection, and two-light shading.
 *
 * WHY THIS EXISTS INSTEAD OF THREE.JS: the hero needs one focal object with
 * real depth, not a scene graph, physics, or a material system. That object is
 * a few hundred vertices — small enough that projecting them by hand costs
 * less than a frame budget, and small enough that shipping ~600KB of WebGL
 * runtime to every visitor would be the expensive part of the page rather than
 * the object itself. Canvas 2D also has no GPU context to lose or leak, which
 * removes the whole class of WebGL teardown bugs on route changes.
 *
 * Everything here is pure and DOM-free, so the renderer stays a thin loop and
 * this file can be reasoned about (and typechecked) on its own.
 */

/** A point or direction in 3D. Readonly tuples keep vertex data immutable. */
export type Vec3 = readonly [number, number, number];

/** Triangle as three indices into a vertex array. */
export interface Face {
  a: number;
  b: number;
  c: number;
}

/** Line segment as two indices into a vertex array. */
export interface Edge {
  a: number;
  b: number;
}

/** Indexed geometry. Vertices are shared, so edges and faces stay in sync. */
export interface Mesh {
  vertices: Vec3[];
  faces: Face[];
  edges: Edge[];
}

/* ------------------------------------------------------------------ */
/* Vector maths                                                        */
/* ------------------------------------------------------------------ */

export function length(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/** Unit vector. Returns the input unchanged at zero length to avoid NaN. */
export function normalize(v: Vec3): Vec3 {
  const l = length(v);
  return l === 0 ? v : [v[0] / l, v[1] / l, v[2] / l];
}

export function scaleVec(v: Vec3, k: number): Vec3 {
  return [v[0] * k, v[1] * k, v[2] * k];
}

export function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Rotate around Y (yaw) then X (pitch). Two axes are enough for a floating
 * object and it keeps the hot path to eight multiplies per vertex; a full
 * matrix pipeline would buy generality this scene never uses.
 */
export function rotateYX(v: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v[0] * cy + v[2] * sy;
  const z1 = -v[0] * sy + v[2] * cy;
  const cx = Math.cos(pitch);
  const sx = Math.sin(pitch);
  const y2 = v[1] * cx - z1 * sx;
  const z2 = v[1] * sx + z1 * cx;
  return [x1, y2, z2];
}

/** Project a vertex to a unit-radius surface. Used to inflate subdivisions. */
export function toSphere(v: Vec3, radius: number): Vec3 {
  return scaleVec(normalize(v), radius);
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

/**
 * Icosahedron, optionally subdivided and re-inflated to a sphere.
 *
 * An icosphere is used rather than a lat/long sphere because its triangles are
 * near-uniform in size. A lat/long sphere bunches vertices at the poles, and
 * that bunching is plainly visible as a bright knot when every vertex is drawn
 * as a glowing node — which is exactly what this mesh is for.
 *
 * `detail` is the number of subdivisions: 0 gives 12 vertices / 30 edges,
 * 1 gives 42 / 120, 2 gives 162 / 480. Cost grows ~4x per level, so the
 * renderer picks a level from the device rather than hardcoding one.
 */
export function icosphere(radius: number, detail: number): Mesh {
  const t = (1 + Math.sqrt(5)) / 2;

  // Typed as Vec3[] at the literal rather than cast afterwards: `.map` over an
  // untyped literal widens to number[], and a cast back would silently accept a
  // row with the wrong arity.
  const seed: Vec3[] = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let vertices: Vec3[] = seed.map((v) => toSphere(v, radius));

  let faces: Face[] = [
    { a: 0, b: 11, c: 5 }, { a: 0, b: 5, c: 1 }, { a: 0, b: 1, c: 7 },
    { a: 0, b: 7, c: 10 }, { a: 0, b: 10, c: 11 }, { a: 1, b: 5, c: 9 },
    { a: 5, b: 11, c: 4 }, { a: 11, b: 10, c: 2 }, { a: 10, b: 7, c: 6 },
    { a: 7, b: 1, c: 8 }, { a: 3, b: 9, c: 4 }, { a: 3, b: 4, c: 2 },
    { a: 3, b: 2, c: 6 }, { a: 3, b: 6, c: 8 }, { a: 3, b: 8, c: 9 },
    { a: 4, b: 9, c: 5 }, { a: 2, b: 4, c: 11 }, { a: 6, b: 2, c: 10 },
    { a: 8, b: 6, c: 7 }, { a: 9, b: 8, c: 1 },
  ];

  for (let i = 0; i < detail; i += 1) {
    const midpoints = new Map<string, number>();
    const nextFaces: Face[] = [];

    // Cache midpoints by edge key so the two faces sharing an edge reuse one
    // vertex. Without this the mesh splits into unwelded triangles and the
    // shared edges draw twice, doubling their apparent brightness.
    const midpoint = (a: number, b: number): number => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`;
      const cached = midpoints.get(key);
      if (cached !== undefined) return cached;
      const mid = toSphere(
        scaleVec(addVec(vertices[a], vertices[b]), 0.5),
        radius
      );
      vertices = [...vertices, mid];
      const index = vertices.length - 1;
      midpoints.set(key, index);
      return index;
    };

    for (const f of faces) {
      const ab = midpoint(f.a, f.b);
      const bc = midpoint(f.b, f.c);
      const ca = midpoint(f.c, f.a);
      nextFaces.push(
        { a: f.a, b: ab, c: ca },
        { a: f.b, b: bc, c: ab },
        { a: f.c, b: ca, c: bc },
        { a: ab, b: bc, c: ca }
      );
    }
    faces = nextFaces;
  }

  return { vertices, faces, edges: edgesFromFaces(faces) };
}

/** Unique edges of a triangle list, deduped so shared edges are drawn once. */
export function edgesFromFaces(faces: Face[]): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];
  const add = (a: number, b: number) => {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b });
  };
  for (const f of faces) {
    add(f.a, f.b);
    add(f.b, f.c);
    add(f.c, f.a);
  }
  return edges;
}

/**
 * Points spread evenly over a sphere using the golden-angle spiral.
 *
 * Used for the orbiting data motes. Unlike the icosphere this needs no
 * connectivity, and the spiral gives an even scatter at any count — so the
 * mobile build can simply request fewer points without the distribution
 * clumping the way a randomly seeded scatter would.
 */
export function fibonacciSphere(count: number, radius: number): Vec3[] {
  const points: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push([
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ]);
  }
  return points;
}

/**
 * A circular ring lying in the XZ plane, tilted by `inclination` around X.
 *
 * The rings read as orbital paths around the core. They are generated rather
 * than drawn as CSS ellipses so they share the same projection as the mesh and
 * therefore pass correctly in front of and behind it.
 */
export function ring(radius: number, segments: number, inclination: number): Vec3[] {
  const points: Vec3[] = [];
  const cos = Math.cos(inclination);
  const sin = Math.sin(inclination);
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    points.push([x, -z * sin, z * cos]);
  }
  return points;
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

/** A vertex after projection: screen position plus the depth it came from. */
export interface Projected {
  x: number;
  y: number;
  /** Camera-space depth. Larger is farther away. */
  depth: number;
  /** Perspective divisor, reused to scale node radii with distance. */
  scale: number;
}

/**
 * Perspective-project a camera-space point onto the canvas.
 *
 * `distance` is the camera's distance from the origin along +Z. Points at or
 * behind the camera are clamped to a small positive depth instead of being
 * culled: this object always sits well in front of the lens, and clamping is
 * cheaper and steadier than a near-plane clip that could pop vertices in and
 * out during rotation.
 */
export function project(
  v: Vec3,
  distance: number,
  fov: number,
  cx: number,
  cy: number
): Projected {
  const depth = distance - v[2];
  const safe = Math.max(depth, 0.001);
  const scale = fov / safe;
  return { x: cx + v[0] * scale, y: cy - v[1] * scale, depth, scale };
}

/* ------------------------------------------------------------------ */
/* Shading                                                             */
/* ------------------------------------------------------------------ */

/** Normalised light direction and how strongly it contributes. */
export interface Light {
  direction: Vec3;
  intensity: number;
}

/**
 * Lambertian intensity from two lights, returned in 0..1.
 *
 * Two lights, not one: a single key light leaves unlit faces at flat black,
 * which on a dark page makes the object dissolve into the background. The fill
 * light lifts those faces just enough to keep the silhouette readable — the
 * same reason a photographer puts a reflector opposite the key.
 */
export function shade(normal: Vec3, key: Light, fill: Light): number {
  const k = Math.max(0, dot(normal, key.direction)) * key.intensity;
  const f = Math.max(0, dot(normal, fill.direction)) * fill.intensity;
  return Math.min(1, k + f);
}

/** Outward-facing normal of a triangle, assuming counter-clockwise winding. */
export function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return normalize(cross(subVec(b, a), subVec(c, a)));
}

/**
 * Map a value from one range to another, clamped to the output range.
 * Used to turn depth into opacity and scroll offset into camera motion.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  const clamped = Math.min(1, Math.max(0, t));
  return outMin + clamped * (outMax - outMin);
}

/**
 * Frame-rate independent easing toward a target.
 *
 * `smoothing` is the fraction of the remaining distance left after one second,
 * so motion feels identical at 60Hz and 120Hz. Lerping by a fixed per-frame
 * factor instead would make the object visibly twitchier on a high-refresh
 * display, which is precisely where it should look its best.
 */
export function damp(
  current: number,
  target: number,
  smoothing: number,
  dt: number
): number {
  return target + (current - target) * Math.exp(-smoothing * dt);
}
