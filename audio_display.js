window.onload = function() {


  let stopAudio = false;
  let source = null; // Declare source variable outside the function
  let audio_data = null;

  var audioFileInput = document.getElementById('audioFile');
  var canvas = document.getElementById('spectrogram');
  var parent = document.getElementById("body");
  canvas.width = parent.offsetWidth-10;
  var ctx = canvas.getContext('2d');


  var setB = document.getElementById('setB');
  B = setB.value;
  console.log("okayyy");

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

      loaded = true;
      audio_data = event.target.result;
      
    };

    document.getElementById("play").addEventListener("click", function() {
      stopAudio = false;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audio_data){
        audioContext.decodeAudioData(audio_data, function(buffer) {
          if (source) {
            source.stop();
          }
          source = audioContext.createBufferSource(); // Create a new buffer source each time
          source.buffer = buffer;

          visualizeSpectrogram(source, audioContext, canvas, ctx);
        });
      }
    });

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

    source.start(0);
    green = 50
    blue = 50
    index = 0


    function draw() {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // minimum bar width of 2px
      const barWidth = Math.max((WIDTH / bufferLength)* 2, 3);
      let x = 0;

      // control the cover of the bars, have them fade
      B = setB.value; // 
      B = (B-1) / (10-1) * (0.1 - 0.0005) + 0.0005
      period = (2*3.1415) / B
      green = 50 * Math.cos(B * (index) ) + 50
      blue = 50 * Math.cos(B * (index + (period * (1/3)))) + 50
      red = 50 * Math.cos(B * (index + (period * 2/3)) ) + 50

      index = index + 1
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        
        ctx.fillStyle = `rgb(${barHeight + red}, ${barHeight + green}, ${barHeight + blue})`;
        ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
      }
      console.log("animating");

      if (!stopAudio){
        requestAnimationFrame(draw);
      } else {
        source.stop();
        requestAnimationFrame(draw);
      }
    }

    draw();
  }
};
