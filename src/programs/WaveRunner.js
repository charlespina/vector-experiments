import paper, { Path } from "paper";
import Wave from "../viz/Wave";
import makePath from "../viz/makePath";

const kNumSegments = 50;
const kWidth = 400;
const kHeight = 50;
const kVelocity = 0.1;
const kSpread = 2;
const kPeriod = 3;

function normalDistribution(t, sigmaSqr=0.05, mu=0.5) {
  return (1 / Math.sqrt(2 * Math.PI * sigmaSqr)) *
    Math.exp(-Math.pow(t - mu, 2)/(2*sigmaSqr));
}

function damp(v, t) {
  // return v * 1 / (Math.sqrt(2.0 * Math.PI) * Math.exp(-0.5* Math.pow((t-0.5)*2, 2)));
  // return 100 * normalDistribution(t);
  // return v * (1.0 - Math.pow(Math.pow((t - 0.5) * 2, 3), 2));
  return v * (1.0 - Math.pow((t - 0.5) * 2, 2));
}

export default class WaveRunner {
  constructor() {
    this.waves = [];
    this.paths = [];
    this.velocities = [];

    this.addWave();
    this.addWave();
    this.addWave();

    this.waves.forEach((wave, i) => {
      wave.offset = i/this.waves.length * kSpread;
    });


    this.group = new paper.Group(this.paths);

    /*
    const p = new Path();
    p.strokeColor = 'black';
    p.moveTo([0, 0]);
    p.lineTo([paper.view.bounds.left, paper.view.bounds.bottom/2]);
    p.lineTo([paper.view.bounds.right, paper.view.bounds.bottom/2]);
    */

    this.tlast = +Date.now();
  }

  addWave() {
    this.waves.push( new Wave(kHeight) );
    this.paths.push( makePath(kNumSegments) );
    this.velocities.push( 1 );
  }

  update() {
    const tnow = +Date.now();
    // dt - delta time in seconds
    const dt = (tnow - this.tlast) / 1000;
    this.tlast = tnow;

    this.waves.forEach((wave, w) => {
      wave.period = kPeriod;
      wave.amplitude = kHeight;
      this.velocities[w] = kVelocity;
    });

    for (let p = 0; p < this.paths.length; p++) {
      const wave = this.waves[p];
      const path = this.paths[p];
      for (let i = 0; i < path.segments.length; i++) {
        const segment = path.segments[i];
        segment.point.x = i/path.segments.length * kWidth - kWidth/2;

        const s = i/(path.segments.length - 1);
        wave.offset = dt * this.velocities[p] + wave.offset;
        segment.point.y = damp(wave.evaluate(s), s);
      }
      path.smooth();
    }

    this.group.position = paper.view.center;
  }
}
