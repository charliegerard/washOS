// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

import { init as initBubbles, animationFunction, animate } from "./bubbles.js";

const URL = "http://localhost:4000/model/";
let counterStarted = false;
let interval;
let paused = false;

async function createModel() {
  const checkpointURL = URL + "model.json"; // model topology
  const metadataURL = URL + "metadata.json"; // model metadata
  const recognizer = speechCommands.create(
    "BROWSER_FFT", // fourier transform type, not useful to change
    undefined, // speech commands vocabulary feature, not useful for your models
    checkpointURL,
    metadataURL
  );
  await recognizer.ensureModelLoaded();
  return recognizer;
}

async function init() {
  const recognizer = await createModel();
  const classLabels = recognizer.wordLabels(); // get class labels
  console.log(classLabels);
  recognizer.listen(
    (result) => {
      const scores = result.scores;
      const max = Math.max(...scores);
      for (let i = 0; i < classLabels.length; i++) {
        if (max.toFixed(2) === result.scores[i].toFixed(2)) {
          if (classLabels[i] === "water" && !counterStarted) {
            triggerCountdown();
          }
          if (classLabels[i] === "_background_noise_" && counterStarted) {
            stopCountdown();
          }
        }
      }
    },
    {
      includeSpectrogram: true, // in case listen should return result.spectrogram
      probabilityThreshold: 0.75,
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5, // probably want between 0.5 and 0.75. More info in README
    }
  );
  // Stop the recognition in 5 seconds.
  // setTimeout(() => recognizer.stopListening(), 5000);
}

init();

const triggerCountdown = () => {
  let counter = parseInt(document.querySelector(".counter p").textContent);
  if (!counterStarted) {
    if (!paused) {
      initBubbles();
    } else {
      requestAnimationFrame(animate);
    }
    counterStarted = true;
    interval = setInterval(() => {
      if (counter > 1) {
        counter--;
        document.querySelector(".counter p").textContent = counter;
      } else {
        document.querySelector(".counter p").textContent = "Well done!";
        clearInterval(interval);
      }
    }, 1000);
  }
};

const stopCountdown = () => {
  counterStarted = false;
  paused = true;
  cancelAnimationFrame(animationFunction);
  clearInterval(interval);
};
