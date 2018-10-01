import setupAudioStream from "../audio/setupAudioStream";
import makePath from "../viz/makePath";
import paper from "paper";

const kWidth = 200;
const kHeight = 50;
const kLeft = 0;
const kTop = kHeight;

function getX(s) {
  return kLeft + kWidth * s;
}

function getY(s) {
  return kTop + kHeight * s;
}

class WaveForm {
  constructor(numSegments) {
    this.path = makePath(numSegments);
  }

  update(data) {
    const numSegments = this.path.segments.length;
    this.path.segments.forEach((segment, i) => {
      const s = i / (numSegments - 1);
      segment.point.x = getX(s);
      segment.point.y = getY(bilinearSample(data, s));
    });
  }
}

class SymmetricWaveForm {
  constructor(numSegments) {
    this.path = makePath(numSegments * 2);
  }

  update(data) {
    const numSegments = this.path.segments.length;
    for (let i = 0; i < numSegments / 2; i++) {
      // update from beginning of sequence, and from end of sequence
      const s = i / (numSegments / 2 - 1);
      const segmentAtBegin = this.path.segments[i];
      const segmentAtEnd = this.path.segments[numSegments - 1 - i];

      segmentAtBegin.point.x = getX(s);
      segmentAtEnd.point.x = getX(s);
      segmentAtBegin.point.y = getY(damp(bilinearSample(data, s), s));
      segmentAtEnd.point.y = getY(-damp(bilinearSample(data, s), s));
    }
  }
}

class BufferArray {
  constructor(size, bufferCount = 1) {
    this.buffers = [];
    for (let i=0; i<bufferCount; i++) {
      this.buffers.push(new Float32Array(size));
    }
  }

  get front() {
    return this.buffers[0];
  }

  rotate() {
    this.buffers.unshift(this.buffers.pop());
  }
}

function damp(v, t) {
  return v * (1.0 - Math.pow((t - 0.5) * 2, 2));
}

function lerp(a, b, t) {
  return a*(1-t) + b*t;
}

function bilinearSample(data, t) {
  const L = data.length - 1;
  const a = Math.max(0, Math.floor(t * L));
  const b = Math.min(L, Math.ceil(t * L));

  const weight = Math.max(0, t - a);
  return lerp(data[a], data[b], weight);
}

export default class AudioTest {
  constructor() {
    this.isInitialized = false;
    const kFftSize = 32;

    setupAudioStream().then((result) => {
      console.log(result);

      const { analyser, context, source, stream } = result;
      this.analyser = result.analyser;
      this.audioContext = result.context;
      this.audioSource = result.source;
      this.audioStream = result.stream;
      this.isInitialized = true;

      this.analyser.fftSize = kFftSize;
      this.analyser.smoothingTimeConstraint = 1.0; // default is 0.8; 0 is no smoothing; 1 is max
      this.fftTimeData = new BufferArray(this.analyser.frequencyBinCount, 3);
      this.fftFreqData = new Float32Array(this.analyser.frequencyBinCount);
      this.setupPaths();
    });
  }

  setupPaths() {
    const binCount = this.analyser.frequencyBinCount;
    this.background = new paper.Path();
    this.background.add([kLeft, kTop - kHeight]);
    this.background.add([kLeft + kWidth, kTop - kHeight]);
    this.background.add([kLeft + kWidth, kTop + kHeight]);
    this.background.add([kLeft, kTop + kHeight]);
    this.background.strokeColor = 'black';
    this.background.fillColor = 'black';

    this.freqPath = makePath(binCount);
    this.waveForms = [
      new SymmetricWaveForm(binCount),
      new SymmetricWaveForm(binCount),
      new SymmetricWaveForm(binCount)
    ];

    this.waveForms[0].path.strokeColor = 'transparent';
    this.waveForms[0].path.fillColor = 'yellow';
    this.waveForms[0].path.blendMode = 'add';

    this.waveForms[1].path.strokeColor = 'transparent';
    this.waveForms[1].path.fillColor = 'cyan';
    this.waveForms[1].path.blendMode = 'add';

    this.waveForms[2].path.fillColor = 'magenta';
    this.waveForms[2].path.blendMode = 'add';
    this.waveForms[2].path.strokeColor = 'transparent';
  }

  update(e) {
    if (!this.isInitialized) return;

    // glorious:
    // this.analyser.getFloatTimeDomainData(this.fftTimeData.front);
    // this.analyser.getFloatFrequencyData(this.fftFreqData);
    this.analyser.getFloatTimeDomainData(this.fftTimeData.front);


    /*
    this.freqPath.segments.forEach((segment, i) => {
      const numSegments = this.freqPath.segments.length;
      const s = i / (numSegments - 1);
      segment.point.x = kLeft + s * kWidth;
      segment.point.y = kTop + damp(this.fftFreqData[i]/256 * kHeight, s);
    });
    */

    let bufferId = 0;
    for (const waveForm of this.waveForms) {
      waveForm.update(this.fftTimeData.buffers[bufferId]);
      bufferId++;
    }

    this.fftTimeData.rotate();
  }
} // class
