export interface Point {
  x: number;
  y: number;
}

const NUM_POINTS = 64;
const SQUARE_SIZE = 250.0;
const ORIGIN = { x: 0, y: 0 };

function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += distance(points[i - 1], points[i]);
  }
  return len;
}

function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  const tempPoints = [...points];
  const I = pathLength(tempPoints) / (n - 1);
  let D = 0;
  const newPoints: Point[] = [tempPoints[0]];
  
  for (let i = 1; i < tempPoints.length; i++) {
    const p1 = tempPoints[i - 1];
    const p2 = tempPoints[i];
    const d = distance(p1, p2);
    
    if (D + d >= I) {
      const qx = p1.x + ((I - D) / d) * (p2.x - p1.x);
      const qy = p1.y + ((I - D) / d) * (p2.y - p1.y);
      const q = { x: qx, y: qy };
      newPoints.push(q);
      tempPoints.splice(i, 0, q);
      D = 0;
    } else {
      D += d;
    }
  }
  
  while (newPoints.length < n) {
    newPoints.push(tempPoints[tempPoints.length - 1]);
  }
  return newPoints;
}

function centroid(points: Point[]): Point {
  let x = 0, y = 0;
  for (let i = 0; i < points.length; i++) {
    x += points[i].x;
    y += points[i].y;
  }
  return { x: x / points.length, y: y / points.length };
}

function rotateBy(points: Point[], radians: number): Point[] {
  const c = centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const newPoints: Point[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const qx = (points[i].x - c.x) * cos - (points[i].y - c.y) * sin + c.x;
    const qy = (points[i].x - c.x) * sin + (points[i].y - c.y) * cos + c.y;
    newPoints.push({ x: qx, y: qy });
  }
  return newPoints;
}

function rotateToZero(points: Point[]): Point[] {
  const c = centroid(points);
  const theta = Math.atan2(c.y - points[0].y, c.x - points[0].x);
  return rotateBy(points, -theta);
}

function boundingBox(points: Point[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].x);
    maxX = Math.max(maxX, points[i].x);
    minY = Math.min(minY, points[i].y);
    maxY = Math.max(maxY, points[i].y);
  }
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
}

function scaleTo(points: Point[], size: number): Point[] {
  const box = boundingBox(points);
  const newPoints: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const qx = points[i].x * (size / box.width);
    const qy = points[i].y * (size / box.height);
    newPoints.push({ x: qx, y: qy });
  }
  return newPoints;
}

function translateTo(points: Point[], pt: Point): Point[] {
  const c = centroid(points);
  const newPoints: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const qx = points[i].x + pt.x - c.x;
    const qy = points[i].y + pt.y - c.y;
    newPoints.push({ x: qx, y: qy });
  }
  return newPoints;
}

export function preprocess(points: Point[]): Point[] {
  let pts = resample(points, NUM_POINTS);
  pts = rotateToZero(pts);
  pts = scaleTo(pts, SQUARE_SIZE);
  pts = translateTo(pts, ORIGIN);
  return pts;
}

function generateCircle(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const angle = (i / NUM_POINTS) * Math.PI * 2;
    pts.push({ x: Math.cos(angle) * 100, y: Math.sin(angle) * 100 });
  }
  return preprocess(pts);
}

function generateSquare(): Point[] {
  const pts: Point[] = [];
  const side = 200;
  const half = side / 2;
  const pointsPerSide = NUM_POINTS / 4;
  
  for (let i = 0; i < pointsPerSide; i++) {
    pts.push({ x: -half + (i / pointsPerSide) * side, y: -half });
  }
  for (let i = 0; i < pointsPerSide; i++) {
    pts.push({ x: half, y: -half + (i / pointsPerSide) * side });
  }
  for (let i = 0; i < pointsPerSide; i++) {
    pts.push({ x: half - (i / pointsPerSide) * side, y: half });
  }
  for (let i = 0; i < pointsPerSide; i++) {
    pts.push({ x: -half, y: half - (i / pointsPerSide) * side });
  }
  return preprocess(pts);
}

function generateTriangle(): Point[] {
  const pts: Point[] = [];
  const side = 200;
  const h = side * (Math.sqrt(3) / 2);
  const p1 = { x: 0, y: -h / 2 };
  const p2 = { x: side / 2, y: h / 2 };
  const p3 = { x: -side / 2, y: h / 2 };
  
  const pointsPerSide = Math.floor(NUM_POINTS / 3);
  
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    pts.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
  }
  for (let i = 0; i < pointsPerSide; i++) {
    const t = i / pointsPerSide;
    pts.push({ x: p2.x + (p3.x - p2.x) * t, y: p2.y + (p3.y - p2.y) * t });
  }
  const remaining = NUM_POINTS - pts.length;
  for (let i = 0; i < remaining; i++) {
    const t = i / remaining;
    pts.push({ x: p3.x + (p1.x - p3.x) * t, y: p3.y + (p1.y - p3.y) * t });
  }
  return preprocess(pts);
}

const TEMPLATES: Record<string, Point[]> = {
  circle: generateCircle(),
  square: generateSquare(),
  triangle: generateTriangle(),
};

function pathDistance(pts1: Point[], pts2: Point[]): number {
  let d = 0;
  for (let i = 0; i < pts1.length; i++) {
    d += distance(pts1[i], pts2[i]);
  }
  return d / pts1.length;
}

export function recognize(points: Point[], targetShape: 'circle' | 'square' | 'triangle'): number {
  if (points.length < 8) return 0;
  
  const preprocessed = preprocess(points);
  const template = TEMPLATES[targetShape];
  if (!template) return 0;
  
  const dist = pathDistance(preprocessed, template);
  
  const maxDistance = 140.0; 
  const similarity = Math.max(0, 1.0 - dist / maxDistance);
  return similarity;
}
