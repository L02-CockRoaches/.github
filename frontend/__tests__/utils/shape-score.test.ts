import { recognize } from '../../utils/shape-recognizer';

describe('Shape Recognizer - $1 Unistroke Algorithm', () => {
  it('should return 0 similarity for empty or short strokes', () => {
    expect(recognize([], 'circle')).toBe(0);
    expect(recognize([{ x: 10, y: 10 }], 'square')).toBe(0);
  });

  it('should recognize a drawn circle', () => {
    // Generate a list of points forming a circular path
    const circlePoints = [];
    const centerX = 150;
    const centerY = 150;
    const radius = 50;
    for (let i = 0; i <= 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      circlePoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }

    const similarity = recognize(circlePoints, 'circle');
    expect(similarity).toBeGreaterThan(0.7); // High similarity expected
  });

  it('should recognize a drawn square', () => {
    // Generate a list of points forming a square path
    const squarePoints = [];
    const startX = 100;
    const startY = 100;
    const side = 100;

    // Top
    for (let x = startX; x <= startX + side; x += 10) squarePoints.push({ x, y: startY });
    // Right
    for (let y = startY; y <= startY + side; y += 10) squarePoints.push({ x: startX + side, y });
    // Bottom
    for (let x = startX + side; x >= startX; x -= 10) squarePoints.push({ x, y: startY + side });
    // Left
    for (let y = startY + side; y >= startY; y -= 10) squarePoints.push({ x: startX, y });

    const similarity = recognize(squarePoints, 'square');
    expect(similarity).toBeGreaterThan(0.7);
  });

  it('should return low similarity when comparing circle to square template', () => {
    const circlePoints = [];
    const centerX = 150;
    const centerY = 150;
    const radius = 50;
    for (let i = 0; i <= 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      circlePoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }

    const circleToSquareSim = recognize(circlePoints, 'square');
    const circleToCircleSim = recognize(circlePoints, 'circle');
    
    // Circle should be recognized as a circle much better than a square
    expect(circleToCircleSim).toBeGreaterThan(circleToSquareSim);
  });

  it('should test our simulated triangle points', () => {
    const leftCenterX = 250;
    const leftCenterY = 300;
    const leftLines = [];
    const maxSteps = 30;
    const side = 100;
    const h = side * (Math.sqrt(3) / 2);
    const q = maxSteps / 3;

    for (let step = 1; step <= maxSteps; step++) {
      let x1 = leftCenterX;
      let y1 = leftCenterY;
      if (step <= q) {
        const t = step / q;
        x1 = leftCenterX + t * (side / 2);
        y1 = leftCenterY - ((2 / 3) * h) + t * h;
      } else if (step <= q * 2) {
        const t = (step - q) / q;
        x1 = leftCenterX + side / 2 - t * side;
        y1 = leftCenterY + ((1 / 3) * h);
      } else {
        const t = (step - q * 2) / q;
        x1 = leftCenterX - side / 2 + t * (side / 2);
        y1 = leftCenterY + ((1 / 3) * h) - t * h;
      }
      leftLines.push({ x: x1, y: y1 });
    }

    const similarity = recognize(leftLines, 'triangle');
    console.log('SIMULATED TRIANGLE SIMILARITY:', similarity);
    expect(similarity).toBeGreaterThan(0.65);
  });
});
