// Thresholds of the 3-band-equalizer
//
// Please use these variables for an 
// easier review on my part
const lowerBandThreshold = 350;
const higherBandThreshold = 8000;

let audioCtx;
let track;

const audioElement = document.querySelector("audio");
const playButton = document.getElementById("play-btn");
const visualizeBtn = document.getElementById("viz-btn");

//for bandpass 
const diff = higherBandThreshold - lowerBandThreshold;
const centerFreq = higherBandThreshold - (1 / 2) * diff;


function init() {
    audioCtx = new AudioContext();

    track = new MediaElementAudioSourceNode(audioCtx, {
        mediaElement: audioElement,
    });

    //le filters
    let lowFilter = new BiquadFilterNode(audioCtx, {type: 'lowshelf', frequency: lowerBandThreshold});
    let midFilter = new BiquadFilterNode(audioCtx, {type: 'bandpass', frequency: centerFreq, Q: 1});
    let highFilter = new BiquadFilterNode(audioCtx, {type: 'highshelf', frequency: higherBandThreshold})

    Lows.oninput = () => lowFilter.gain.value = Lows.value;
    Mids.oninput = () => midFilter.gain.value = Mids.value;
    Highs.oninput = () => highFilter.gain.value = Highs.value;


    // Volume
    const gainNode = new GainNode(audioCtx);
    const volumeControl = document.querySelector('[data-action="volume"]');
    volumeControl.addEventListener(
        "input",
        () => {
            gainNode.gain.value = volumeControl.value;
        },
        false
    );

    // audio graph
    gainNode.connect(audioCtx.destination);
    track.connect(lowFilter);
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(gainNode);

}

// play pause btn 
playButton.addEventListener(
    "click",
    () => {
        if (!audioCtx) {
            init();
        }

        // check if context is in suspended state (autoplay policy)
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (playButton.dataset.playing === "false") {
            audioElement.play();
            playButton.dataset.playing = "true";
            // if track is playing pause it
        } else if (playButton.dataset.playing === "true") {
            audioElement.pause();
            playButton.dataset.playing = "false";
        }

        // Toggle the state between play and not playing
        let state = playButton.getAttribute("aria-checked") === "true";
        playButton.setAttribute("aria-checked", state ? "false" : "true");
    },
    false
);

//after track
audioElement.addEventListener(
    "ended",
    () => {
        playButton.dataset.playing = "false";
        playButton.setAttribute("aria-checked", "false");
    },
    false
);

//for visualisation
const container = document.getElementById("visualisation");
const canvas = document.getElementById("canvas1");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasCtx = canvas.getContext('2d');
let analyser;

visualizeBtn.addEventListener("click", function () {

        analyser = audioCtx.createAnalyser();

        track.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const barWidth = canvas.width / bufferLength;
        let barHeight;
        let x = 0;

        function visualize() {
            x = 0;
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                canvasCtx.fillStyle = 'black';
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth;
            }
            requestAnimationFrame(visualize);
        }

        visualize();
    }
);

