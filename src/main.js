
const startButton = document.querySelector("#start");
const statusDiv = document.querySelector("#status");

function writeInfo(info) {

  statusDiv.innerHTML += "<p>" + info;
}

startButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });

  const tracks = stream.getAudioTracks();

  for (let track of tracks) {
    track.applyConstraints({
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    });
  }

  startButton.disabled = true;

  const context = new AudioContext();

  const userMedia = context.createMediaStreamSource(stream);

  const delays = [
    createDelay(context, 3),
    createDelay(context, 7)
  ];

  const compressor = context.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-30, context.currentTime);
  compressor.knee.setValueAtTime(40, context.currentTime);
  compressor.ratio.setValueAtTime(12, context.currentTime);
  compressor.attack.setValueAtTime(0, context.currentTime);
  compressor.release.setValueAtTime(0.25, context.currentTime);

  const biquadFilter = context.createBiquadFilter();
  biquadFilter.type = "lowpass";
  biquadFilter.frequency.setValueAtTime(1500, context.currentTime);
  biquadFilter.Q.setValueAtTime(1, context.currentTime);

  const gain = context.createGain(0.8);
  gain.gain.setValueAtTime(0.8, context.currentTime);

  for (const delay of delays) {
    userMedia.connect(delay);
    delay.connect(biquadFilter);
  }
  biquadFilter.connect(gain);
  gain.connect(compressor);
  compressor.connect(context.destination);

  writeInfo("Starting");

});

function createDelay(context, time) {
  const delay = context.createDelay(time);
  delay.delayTime.setValueAtTime(time, context.currentTime);
  return delay;
}
