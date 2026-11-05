// Small signs of life on the island. The gulls and the lighthouse are plain HTML and
// CSS (index.html); this file adds:
// - a fish that leaps out of the sea now and then, somewhere along the boat's course
//   (which is always open water), removed when it lands;
// - a pair of dolphins that leap beside the pilot's boat while it sails;
// - night mode: between 20:00 and 07:00 local time the scene turns to dusk and the
//   lighthouse shines brighter. The pilot can switch it with "night" and "day".
// Leaping animals are skipped for visitors who prefer reduced motion.
(function () {
  'use strict';

  var life = document.querySelector('[data-life]');
  var course = document.querySelector('[data-course]');
  var root = document.documentElement;
  if (!life || !course) return;

  /* Night mode (also for reduced motion: it doesn't move) */
  function setNight(value) {
    root.classList.toggle('is-night', value);
    if (window.islandScene) window.islandScene.redraw(); // places the lighthouse glow
  }
  var hour = new Date().getHours();
  setNight(hour >= 20 || hour < 7);

  window.islandLife = {
    setNight: setNight,
    isNight: function () { return root.classList.contains('is-night'); }
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var length = course.getTotalLength();
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var FISH = '<svg viewBox="-6 -2.5 12 5"><path d="M5 0C3-2.2-2-2.2-4 0C-2 2.2 3 2.2 5 0ZM-4 0L-6-2L-5.4 0L-6 2Z"/></svg>';
  var DOLPHIN = '<svg viewBox="-12 -5 24 10"><path d="M11 0.6C8 -2.6 2 -3.4 -3 -2.2L-1 -4.6L-5.6 -1.8C-8 -1.2 -9.6 -0.2 -10.4 0.4L-12 -1.4L-11.2 1.2L-12.4 3L-9.6 1.6C-6 2.8 4 3.4 11 0.6Z"/></svg>';

  // One leap: rings where it leaves and enters the water, and the animal in between.
  function leap(x, y, angle, kind, delay) {
    var el = document.createElement('div');
    el.className = 'leap' + (kind === 'dolphin' ? ' leap-dolphin' : '');
    el.style.cssText = '--x:' + x.toFixed(0) + ';--y:' + y.toFixed(0) + ';--a:' + angle.toFixed(0) + 'deg;--delay:' + (delay || 0) + 's';
    el.innerHTML = '<span class="leap-ring"></span><span class="leap-ring"></span><span class="leap-fish">' + (kind === 'dolphin' ? DOLPHIN : FISH) + '</span>';
    life.appendChild(el);
    setTimeout(function () { el.remove(); }, 2800 + (delay || 0) * 1000);
  }

  /* Fish: somewhere along the course, nudged sideways so they don't line up on it */
  function fish() {
    var at = rand(0.05, 0.95) * length;
    var p = course.getPointAtLength(at), q = course.getPointAtLength(Math.min(length, at + 1));
    var nx = -(q.y - p.y), ny = q.x - p.x, n = Math.hypot(nx, ny) || 1, side = rand(-28, 28);
    leap(p.x + nx / n * side, p.y + ny / n * side, rand(0, 360), 'fish');
  }

  function nextFish() {
    setTimeout(function () {
      if (!document.hidden) fish();
      nextFish();
    }, rand(6000, 12000));
  }
  setTimeout(fish, 3500);
  nextFish();

  /* Dolphins: a pair leaps beside the boat, swimming the same way, twice per voyage */
  function dolphins() {
    if (!window.islandScene || !window.islandScene.boat) return;
    var b = window.islandScene.boat(), r = b.angle * Math.PI / 180;
    var side = Math.random() < 0.5 ? -1 : 1;
    // A little ahead of the boat and off to one side.
    var ax = Math.cos(r) * 30, ay = Math.sin(r) * 30, sx = -Math.sin(r) * 26 * side, sy = Math.cos(r) * 26 * side;
    leap(b.x + ax + sx, b.y + ay + sy, b.angle, 'dolphin', 0);
    leap(b.x + ax + sx * 1.7 - Math.cos(r) * 14, b.y + ay + sy * 1.7 - Math.sin(r) * 14, b.angle, 'dolphin', 0.25);
  }

  document.addEventListener('island:depart', function (event) {
    var seconds = (event.detail && event.detail.seconds) || 2;
    setTimeout(dolphins, 500);
    if (seconds > 2.2) setTimeout(dolphins, seconds * 1000 * 0.55);
  });
})();
