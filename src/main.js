const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const statusDiv = document.querySelector("#status");

function writeInfo(info) {
  statusDiv.innerHTML += "<p>" + info;
}

function clearInfo() {
  statusDiv.innerHTML = "";
}

let context;

startButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });

  const tracks = stream.getAudioTracks();

  for (let track of tracks) {
    track.applyConstraints({
      echoCancellation: false,
      noiseSuppression: true,
      autoGainControl: true,
    });
  }

  startButton.disabled = true;
  stopButton.disabled = false;

  context = new AudioContext();

  const userMedia = context.createMediaStreamSource(stream);

  const delays = [createDelay(context, 3)];

  const analyser = context.createAnalyser();
  analyser.smoothingTimeConstant = 0.8;

  userMedia.connect(analyser);

  const gain = context.createGain();
  gain.gain.value = 0.5;

  for (const delay of delays) {
    userMedia.connect(delay);
    delay.connect(gain);
  }

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2000;

  gain.connect(filter);

  filter.connect(context.destination);

  //manageVolume();

  writeInfo("Starting");
});

stopButton.addEventListener("click", async (e) => {
  e.preventDefault();

  if (context) {
    context.close();
  }

  startButton.disabled = false;
  stopButton.disabled = true;

  clearInfo();
});

function createDelay(context, time) {
  const delay = context.createDelay(time);
  delay.delayTime.setValueAtTime(time, context.currentTime);
  return delay;
}
