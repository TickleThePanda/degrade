
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

  startButton.disabled = true;

  recordLoop(stream);
  writeInfo("Starting");

});

let context = new AudioContext();

async function recordLoop(stream) {

  let lastRecording = undefined;
  let loopNumber = 0;

  while (true) {
    writeInfo(`Recording ${loopNumber++}`);
    const [recording] = await Promise.all([recordSound(stream, 3000), playSound(lastRecording)]);
    lastRecording = await convertRecordingToSound(recording);
  }

}

async function convertRecordingToSound(recording) {
  return new Promise(async (resolve) => {

    const recordingAsArrayBuffer = await recording.arrayBuffer();
    context.decodeAudioData(recordingAsArrayBuffer, b => {
      resolve(b);
    });

  })

}

async function recordSound(stream, length) {

  const chunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  return new Promise(async (resolve) => {

    mediaRecorder.addEventListener("dataavailable", e => {
      chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", e => {
      resolve(new Blob(chunks, {
        'type': 'audio/wav'
      }));
    });

    setTimeout(() => {
      mediaRecorder.requestData();
      mediaRecorder.stop();
    }, length);

    mediaRecorder.start();
  });
}

async function playSound(audioBuffer) {
  const source = context.createBufferSource();
  source.connect(context.destination);
  source.buffer = audioBuffer;
  source.start(context.currentTime);
}
