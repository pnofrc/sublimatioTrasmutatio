const jsonContainer = document.getElementById("jsonContainer");
//const ws = new WebSocket('wss://trasmutatio.federicoponi.it/ws/');
const ws = new WebSocket("wss://socketsbay.com/wss/v2/8/cdf64fa4af7500cab77d6152a26305b2/")

let audioContext = new (window.AudioContext || window.webkitAudioContext)();



let oscillator;

// Initialize oscillator
function initOscillator(frequency) {
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Set oscillator type to sine wave
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
}

// play the sine or stop it
function sineW(frequency, io, t){
  if (io){
      initOscillator(frequency);
      oscillator.start();
     
      let elem = document.documentElement;
      if (elem.requestFullscreen) {
          elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
      }

      if(t){
        document.getElementById("testo").style.display = 'block'
      }
  } else if (!io){
    document.getElementById("testo").style.display = 'none'
    oscillator.stop();
  }
}

ws.addEventListener('open', (event) => {
  console.log('WebSocket connection opened');
});

function mapRange(value, fromLow, fromHigh, toLow, toHigh) {
  // First, map the value from the old range to the 0-1 range
  const normalized = (value - fromLow) / (fromHigh - fromLow);

  // Then, map the normalized value to the new range
  return normalized * (toHigh - toLow) + toLow;
}

ws.onmessage = (event) => {
        try {
	console.log(event)
          const data = JSON.parse(event.data);
         
          if (data.value == "stop_sine"){
            sineW(0,false, false)
            jsonContainer.innerHTML = ''
            jsonContainer.style.display = "block"
          } else if (data.type == "light"){
            let mappedVal = mapRange(data.value, -40, 80, 0, 100);
            // console.log(data.value)
            // console.log(mappedVal)
            document.body.style.background = `hsl(215,65%,${mappedVal}%)`
          } else {
            jsonContainer.innerHTML = data.title
           
            sineW(data.value*4, true, false)
            // rWave(data.value, data.value); // Adjust modulation depth (200)
            spastic(data.value)
           
          }
          
            // const arpeggioNotes = [data.value, data.value*0.3, data.value*0.6, data.value*1.2]; // Define the arpeggio notes
            // playArpeggio(data.value*3, 50,arpeggioNotes)
          // console.log(data.value);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      }



// Light cose quando brrr
function spastic(interval) {
  let index = 0;

  function doIteration() {
    if (index < interval) {
      setTimeout(() => {
        
        setTimeout(() => {
          
          document.body.style.background = "white";
        }, interval);
        document.body.style.background = "blue";
        index++;
        doIteration(); // Call the function recursively for the next iteration
      }, interval*2);
      
    }
  }

  doIteration(); // Start the loop
}
  



function rWave(frequency, frequencyFM) {
 
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const carrier = audioContext.createOscillator();
  const modulator = audioContext.createOscillator();
  const modulatorGain = audioContext.createGain();

  // Connect the modulator to modulatorGain and adjust the gain to control modulation depth
  modulator.connect(modulatorGain);
  modulatorGain.connect(carrier.frequency);

  // Set the frequency and type of the modulator
  modulator.frequency.value = Math.floor(frequencyFM); // Adjust this value for modulation frequency
  modulator.type = 'sine';

  // Set the frequency of the carrier oscillator (the actual note)
  carrier.frequency.value = frequency;

  // Create a GainNode for controlling the volume
  const volumeControl = audioContext.createGain();
  carrier.connect(volumeControl);
  volumeControl.connect(audioContext.destination);

  // Set the volume using the volumeControl
  volumeControl.gain.value = 1.5;
  // Schedule the initial gain value smoothly
  volumeControl.gain.setValueAtTime(1, audioContext.currentTime);

  // Start the oscillators
  modulator.start();
  carrier.start();
  // Stop the oscillators and note after the specified duration
  const currentTime = audioContext.currentTime;
  modulator.stop(currentTime + 10.2);
  carrier.stop(currentTime + 15.1);
}


// // Stop the animation when the window is unloaded.
// window.addEventListener('beforeunload', () => {
//   cancelAnimationFrame(animationId);
// });

function playArpeggio(frequency, frequencyFM, arpeggioNotes) {
  const audioContext = new AudioContext();
  const carrier = audioContext.createOscillator();
  const modulator = audioContext.createOscillator();
  const modulatorGain = audioContext.createGain();
  let arpeggioIndex = 0;

  // Connect the modulator to modulatorGain and adjust the gain to control modulation depth
  modulator.connect(modulatorGain);
  modulatorGain.connect(carrier.frequency);

  // Set the frequency and type of the modulator
  modulator.frequency.value = Math.floor(frequencyFM); // Adjust this value for modulation frequency
  modulator.type = 'triangle'; // Changed 'tri' to 'triangle'

  // Start the oscillators
  modulator.start();
  carrier.start();

  // Function to play the next note in the arpeggio
  function playNextNote() {
    if (arpeggioIndex < arpeggioNotes.length) {
      const nextFrequency = arpeggioNotes[arpeggioIndex];
      carrier.frequency.setValueAtTime(nextFrequency, audioContext.currentTime);
      arpeggioIndex++;
    } else {
      // Stop the oscillators when the arpeggio is finished
      const currentTime = audioContext.currentTime;
      modulator.stop(currentTime + 17.2);
      carrier.stop(currentTime + 9.1);
    }
  }

  // Schedule the arpeggio notes
  arpeggioNotes.forEach((note, index) => {
    const time = audioContext.currentTime + index * 0.5; // Adjust the time interval between notes
    carrier.frequency.setValueAtTime(note, time);
    carrier.frequency.setTargetAtTime(frequency, time, 0.01); // Optional, adds a slight fade to the notes
  });

  // Initial call to start the arpeggio
  playNextNote();
}


// One-liner to resume playback when user interacted with the page.
document.querySelector('button').addEventListener('click', function() {
  audioContext.resume().then(() => {
    console.log('Playback resumed successfully');
  });
});
