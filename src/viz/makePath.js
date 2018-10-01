import { Path } from "paper";

export default function makePath(numSegments) {
  const p = new Path();
  p.strokeColor = 'black';

  for (let i = 0; i < numSegments; i++) {
    p.add([0, 0]);
  }

  return p;
}
