// Sound for the island, made in the browser with the Web Audio API: no audio files.
// - Waves: filtered noise that swells and falls, as a background while sound is on.
// - Departure: the ship's horn when the pilot sets sail.
// - Voyage: a rush of water while the boat is moving.
// - Arrival: two strikes of the ship's bell when it docks.
// Sound is off by default and only starts when the visitor turns it on (browsers
// require a click before playing audio anyway). The choice is remembered.
(function () {
  'use strict';

  var button = document.querySelector('[data-sound-toggle]');
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioContextClass) return;

  var STORAGE_KEY = 'portfolio-sound';
  var ctx = null, master = null, noise = null;
  var on = false;

  function remember(value) {
    try { localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off'); } catch (e) { /* storage unavailable */ }
  }
  function remembered() {
    try { return localStorage.getItem(STORAGE_KEY) === 'on'; } catch (e) { return false; }
  }

  // Two seconds of noise, reused by every water sound.
  function noiseBuffer() {
    var length = ctx.sampleRate * 2, buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0);
    var last = 0;
    for (var i = 0; i < length; i++) {
      // Brownish noise: smoother and deeper than white noise, closer to the sea.
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  function setUp() {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    noise = noiseBuffer();

    // The sea: noise through a low-pass filter, with a slow swell on its volume.
    var source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    var swell = ctx.createGain();
    swell.gain.value = 0.55;
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.11; // one wave about every nine seconds
    var lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.35;
    lfo.connect(lfoDepth).connect(swell.gain);
    var filterLfo = ctx.createGain();
    filterLfo.gain.value = 220;
    lfo.connect(filterLfo).connect(filter.frequency);
    source.connect(filter).connect(swell).connect(master);
    source.start();
    lfo.start();
  }

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
      fadeTo(0.5, 1.2);
    } else if (ctx) {
      fadeTo(0, 0.4);
    }
  }

  /* One-off sounds */
  function horn() {
    var now = ctx.currentTime, out = ctx.createGain();
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(0.28, now + 0.18);
    out.gain.setValueAtTime(0.28, now + 1.1);
    out.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    [98, 147, 196.5].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.value = freq;
      var level = ctx.createGain();
      level.gain.value = i === 0 ? 0.6 : 0.18;
      osc.connect(level).connect(filter);
      osc.start(now);
      osc.stop(now + 2);
    });
    filter.connect(out).connect(master);
  }

  function wash(seconds) {
    var now = ctx.currentTime, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), out = ctx.createGain();
    source.buffer = noise;
    source.loop = true;
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.linearRampToValueAtTime(1300, now + seconds * 0.5);
    filter.frequency.linearRampToValueAtTime(500, now + seconds);
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(0.32, now + 0.6);
    out.gain.setValueAtTime(0.32, now + Math.max(0.7, seconds - 0.8));
    out.gain.linearRampToValueAtTime(0, now + seconds + 0.4);
    source.connect(filter).connect(out).connect(master);
    source.start(now);
    source.stop(now + seconds + 0.5);
  }

  function bell(at) {
    var out = ctx.createGain();
    out.connect(master);
    // A ship's bell: a few inharmonic partials that ring and fade.
    [[620, 0.22, 2.6], [1240 * 1.01, 0.08, 1.6], [1708, 0.06, 1.2], [2650, 0.03, 0.7]].forEach(function (p) {
      var osc = ctx.createOscillator(), level = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = p[0];
      level.gain.setValueAtTime(0, at);
      level.gain.linearRampToValueAtTime(p[1], at + 0.005);
      level.gain.exponentialRampToValueAtTime(0.0001, at + p[2]);
      osc.connect(level).connect(out);
      osc.start(at);
      osc.stop(at + p[2] + 0.05);
    });
  }

  document.addEventListener('island:depart', function (event) {
    if (!on || !ctx) return;
    horn();
    wash((event.detail && event.detail.seconds) || 2);
  });
  document.addEventListener('island:arrive', function () {
    if (!on || !ctx) return;
    var now = ctx.currentTime;
    bell(now + 0.05);
    bell(now + 0.45); // two bells, the traditional double strike
  });

  // Quiet while the page is in the background.
  document.addEventListener('visibilitychange', function () {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });

  button.addEventListener('click', function () { setOn(!on); });
  button.hidden = false;

  // A visitor who left sound on: it comes back with their first click or key press.
  if (remembered()) {
    button.setAttribute('aria-pressed', 'false');
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
    state: function () { return ctx ? ctx.state : 'not started'; } // 'running' when audio is playing
  };
})();
