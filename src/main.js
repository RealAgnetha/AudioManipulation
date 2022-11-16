// Thresholds of the 3-band-equalizer
//
// Please use these variables for an 
// easier review on my part
const lowerBandThreshold = 350;
const higherBandThreshold = 8000;

// instigate our audio context
let audioCtx;


// load some sound
const audioElement = document.querySelector("audio");
let track;

const playButton = document.querySelector(".tape-controls-play");

// play pause audio
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

// If track ends
audioElement.addEventListener(
    "ended",
    () => {
        playButton.dataset.playing = "false";
        playButton.setAttribute("aria-checked", "false");
    },
    false
);

const diff = higherBandThreshold - lowerBandThreshold;
const centerFreq = higherBandThreshold - (1 / 2) * diff;

function init() {
    audioCtx = new AudioContext();
    let lowFilter = new BiquadFilterNode(audioCtx, {type: 'lowshelf', frequency: lowerBandThreshold});
    let midFilter = new BiquadFilterNode(audioCtx, {type: 'bandpass', frequency: centerFreq, Q: 1});
    let highFilter = new BiquadFilterNode(audioCtx, {type: 'highshelf', frequency: higherBandThreshold})


    Lows.oninput = () => lowFilter.gain.value = Lows.value;
    Mids.oninput = () => midFilter.gain.value = Mids.value;
    Highs.oninput = () => highFilter.gain.value = Highs.value;


    track = new MediaElementAudioSourceNode(audioCtx, {
        mediaElement: audioElement,
    });

    // Create the node that controls the volume.
    const gainNode = new GainNode(audioCtx);

    const volumeControl = document.querySelector('[data-action="volume"]');
    volumeControl.addEventListener(
        "input",
        () => {
            gainNode.gain.value = volumeControl.value;
        },
        false
    );

    // connect graph
    gainNode.connect(audioCtx.destination);
    track.connect(lowFilter);
    lowFilter.connect(midFilter);
    midFilter.connect(highFilter);
    highFilter.connect(gainNode);

}
