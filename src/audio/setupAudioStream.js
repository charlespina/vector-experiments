export default function setupAudioStream() {
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = context.createAnalyser();

  return navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      var source = context.createMediaStreamSource(stream);
    	source.connect(analyser);
      return {
        context,
        analyser,
        source,
        stream
      };
    })
    .catch((err) => {
      /* handle the error */
      console.error(err);
    }
  );
}
