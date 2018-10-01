import paper, { Path, Point } from "paper";
import Program from "./programs/AudioTest";

let program;
function setup() {
  program = new Program();
}

function draw(e) {
  program.update(e);
}

function onLoad() {
  paper.setup(document.querySelector('canvas'));
  setup();
  paper.view.onFrame = draw;
}

document.addEventListener('DOMContentLoaded', onLoad);
