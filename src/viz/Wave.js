export default class Wave {
  constructor(amplitude = 1, frequency = 1, c = 0) {
    this.a = amplitude;
    this.b = frequency;
    this.c = c;
    this.d = 0;
  }

  set amplitude(a) {
    this.a = a;
  }

  get amplitude() {
    return this.a;
  }

  set period(v) {
    this.b = v * Math.PI * 2;
  }

  get period() {
    return Math.PI * 2 / this.b;
  }

  get offset() {
    return this.c;
  }

  set offset(v) {
    this.c = v;
  }

  evaluate(t) {
    return this.a * Math.sin(this.b * t - this.c) + this.d;
  }

  get phaseShift() {
    return this.c / this.b;
  }

  get verticalShift() {
    return this.d;
  }
}
