// Sound for the island, made in the browser with the Web Audio API: no audio files.
// - Sea: separate, quiet waves at irregular intervals, each one swelling, breaking
//   with a soft hiss of foam and drawing back, over a very faint background.
// - Departure: a ship's horn (two low notes together, brassy, with an echo over the water).
// Sound is off by default and only starts when the visitor turns it on (browsers
// require a click before playing audio anyway). The choice is remembered.
(function () {
  'use strict';

  var button = document.querySelector('[data-sound-toggle]');
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioContextClass) return;

  var STORAGE_KEY = 'portfolio-sound';
  var MASTER = 0.35;                 // overall volume when on
  var ctx = null, master = null, reverb = null, noise = null, pinkNoise = null;
  var on = false, waveTimer = null;

  function remember(value) {
    try { localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off'); } catch (e) { /* storage unavailable */ }
  }
  function remembered() {
    try { return localStorage.getItem(STORAGE_KEY) === 'on'; } catch (e) { return false; }
  }
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* Building blocks */

  // Brown noise (deep, for the body of the water) and pink-ish noise (for foam).
  function makeNoise(seconds, brown) {
    var length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
    var last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (var i = 0; i < length; i++) {
      var white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        b0 = 0.99765 * b0 + white * 0.099;
        b1 = 0.963 * b1 + white * 0.2965;
        b2 = 0.57 * b2 + white * 1.0526;
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.12;
      }
    }
    return buffer;
  }

  // A generated open-air echo for the horn.
  function makeReverb(seconds) {
    var length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var data = buffer.getChannelData(c);
      for (var i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
    var convolver = ctx.createConvolver();
    convolver.buffer = buffer;
    var wet = ctx.createGain();
    wet.gain.value = 0.3;
    convolver.connect(wet).connect(master);
    return convolver;
  }

  function setUp() {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    noise = makeNoise(4, true);
    pinkNoise = makeNoise(4, false);
    reverb = makeReverb(2.8);

    // A very faint, steady background of distant sea.
    var bed = ctx.createBufferSource(), bedFilter = ctx.createBiquadFilter(), bedGain = ctx.createGain();
    bed.buffer = noise;
    bed.loop = true;
    bedFilter.type = 'lowpass';
    bedFilter.frequency.value = 260;
    bedGain.gain.value = 0.12;
    bed.connect(bedFilter).connect(bedGain).connect(master);
    bed.start();
  }

  /* The sea: one wave at a time, at irregular intervals */
  function wave() {
    var now = ctx.currentTime;
    var rise = rand(2.2, 3.2), fall = rand(3.5, 5), size = rand(0.6, 1);
    var peak = now + rise, end = peak + fall;

    // The body of the wave: deep water that swells and draws back.
    var body = ctx.createBufferSource(), bodyFilter = ctx.createBiquadFilter(), bodyGain = ctx.createGain();
    body.buffer = noise;
    body.loop = true;
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(180, now);
    bodyFilter.frequency.linearRampToValueAtTime(520 * size, peak);
    bodyFilter.frequency.linearRampToValueAtTime(220, end);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.32 * size, peak);
    bodyGain.gain.linearRampToValueAtTime(0.0001, end);

    // The foam: a soft hiss as the wave breaks and runs up the shore.
    var foam = ctx.createBufferSource(), foamFilter = ctx.createBiquadFilter(), foamGain = ctx.createGain();
    foam.buffer = pinkNoise;
    foam.loop = true;
    foamFilter.type = 'bandpass';
    foamFilter.frequency.value = 2400;
    foamFilter.Q.value = 0.5;
    foamGain.gain.setValueAtTime(0.0001, now);
    foamGain.gain.linearRampToValueAtTime(0.0001, peak - 0.4);
    foamGain.gain.linearRampToValueAtTime(0.05 * size, peak + 0.3);
    foamGain.gain.exponentialRampToValueAtTime(0.0001, peak + fall * 0.8);

    // Each wave sits a little to the left or right.
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    var out = ctx.createGain();
    if (pan) { pan.pan.value = rand(-0.5, 0.5); out.connect(pan).connect(master); } else { out.connect(master); }

    body.connect(bodyFilter).connect(bodyGain).connect(out);
    foam.connect(foamFilter).connect(foamGain).connect(out);
    var offset = rand(0, 3);
    body.start(now, offset);
    foam.start(now, offset);
    body.stop(end + 0.1);
    foam.stop(end + 0.1);
  }

  function scheduleWaves() {
    clearTimeout(waveTimer);
    if (!on || document.hidden) return;
    wave();
    waveTimer = setTimeout(scheduleWaves, rand(4500, 8500));
  }

  /* Departure: a ship's horn */
  function horn() {
    var now = ctx.currentTime, length = 1.9;
    var tone = ctx.createGain();
    tone.gain.value = 1;

    // Two low notes a third apart, as many ship horns are; each starts slightly flat and rises.
    [[87, 0.5], [110, 0.42], [174, 0.12], [220, 0.08]].forEach(function (p, i) {
      var osc = ctx.createOscillator(), level = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(p[0] * 0.94, now);
      osc.frequency.exponentialRampToValueAtTime(p[0], now + 0.18);
      osc.detune.value = i % 2 ? 4 : -4;
      level.gain.value = p[1];
      osc.connect(level).connect(tone);
      osc.start(now);
      osc.stop(now + length + 1.2);
    });

    // Shape it into a brassy horn: cut the fizz, lift the "honk" around 300 and 800 Hz.
    var low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 1100;
    low.Q.value = 0.7;
    var formant1 = ctx.createBiquadFilter();
    formant1.type = 'peaking';
    formant1.frequency.value = 320;
    formant1.Q.value = 1.2;
    formant1.gain.value = 7;
    var formant2 = ctx.createBiquadFilter();
    formant2.type = 'peaking';
    formant2.frequency.value = 820;
    formant2.Q.value = 2;
    formant2.gain.value = 5;

    var envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.16, now + 0.22);
    envelope.gain.setValueAtTime(0.16, now + length - 0.5);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + length + 0.8);

    tone.connect(low).connect(formant1).connect(formant2).connect(envelope);
    envelope.connect(master);
    envelope.connect(reverb); // the echo across the water
  }

  /* On and off */
  function fadeTo(value, seconds) {
    var now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(value, now + seconds);
  }

  function setOn(value) {
    on = value;
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    button.title = on ? 'Sound on' : 'Sound off';
    remember(on);
    if (on) {
      if (!ctx) setUp();
      ctx.resume();
      fadeTo(MASTER, 2);
      scheduleWaves();
    } else if (ctx) {
      clearTimeout(waveTimer);
      fadeTo(0, 0.6);
    }
  }

  document.addEventListener('island:depart', function () {
    if (!on || !ctx) return;
    horn();
  });

  // Quiet while the page is in the background.
  document.addEventListener('visibilitychange', function () {
    if (!ctx || !on) return;
    if (document.hidden) { clearTimeout(waveTimer); ctx.suspend(); }
    else { ctx.resume(); scheduleWaves(); }
  });

  button.addEventListener('click', function () { setOn(!on); });
  button.hidden = false;

  // A visitor who left sound on: it comes back with their first click or key press.
  if (remembered()) {
    var resume = function (event) {
      if (button.contains(event.target)) return; // the button's own click decides
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      if (!on) setOn(true);
    };
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
  }

  window.islandSound = {
    isOn: function () { return on; },
    state: function () { return ctx ? ctx.state : 'not started'; }, // 'running' when audio is playing
    // For trying the sounds from the browser console.
    preview: { horn: function () { if (ctx) horn(); }, wave: function () { if (ctx) wave(); } }
  };
})();
