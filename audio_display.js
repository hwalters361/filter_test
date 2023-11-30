window.onload = function() {
  let stopAudio = false;
  let source = null; // Declare source variable outside the function

  const audioFileInput = document.getElementById('audioFile');
  const canvas = document.getElementById('spectrogram');
  const ctx = canvas.getContext('2d');

  audioFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
      document.getElementById("stop").addEventListener("click", function() {
        stopAudio = true;
        if (source) {
          source.stop();
        }
      });

      document.getElementById("play").addEventListener("click", function() {
        stopAudio = false;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContext.decodeAudioData(event.target.result, function(buffer) {
          if (source) {
            source.stop();
          }
          source = audioContext.createBufferSource(); // Create a new buffer source each time
          source.buffer = buffer;

          // Create a low-pass filter
          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowshelf';
          filter.frequency.value = 400; // Set the frequency value as desired

          // Connect nodes: source -> filter -> destination
          source.connect(filter);
          filter.connect(audioContext.destination);
          
          visualizeSpectrogram(source, audioContext, canvas, ctx);
        });
      });
    };

    if (file) {
      reader.readAsArrayBuffer(file);
    }
  });
  
  function visualizeSpectrogram(source, audioContext, canvas, ctx) {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    source.start();

    function draw() {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      if (!stopAudio){
        requestAnimationFrame(draw);
      } else {
        source.stop();
        requestAnimationFrame(draw);
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const barWidth = (WIDTH / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];

        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
    }

    draw();
  }
};
