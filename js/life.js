// Small signs of life on the island. The gulls are plain HTML and CSS (index.html);
// this adds a fish that leaps out of the sea now and then, somewhere along the
// boat's course (which is always open water), and removes it when it lands.
// Nothing moves for visitors who prefer reduced motion.
(function () {
  'use strict';

  var life = document.querySelector('[data-life]');
  var course = document.querySelector('[data-course]');
  if (!life || !course || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var length = course.getTotalLength();
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var FISH = '<svg viewBox="-6 -2.5 12 5"><path d="M5 0C3-2.2-2-2.2-4 0C-2 2.2 3 2.2 5 0ZM-4 0L-6-2L-5.4 0L-6 2Z"/></svg>';

  function leap() {
    // A point on the course, nudged sideways a little so fish don't line up on it.
    var at = rand(0.05, 0.95) * length;
    var p = course.getPointAtLength(at), q = course.getPointAtLength(Math.min(length, at + 1));
    var nx = -(q.y - p.y), ny = q.x - p.x, n = Math.hypot(nx, ny) || 1, side = rand(-28, 28);
    var x = p.x + nx / n * side, y = p.y + ny / n * side;

    var el = document.createElement('div');
    el.className = 'leap';
    el.style.cssText = '--x:' + x.toFixed(0) + ';--y:' + y.toFixed(0) + ';--a:' + rand(0, 360).toFixed(0) + 'deg';
    el.innerHTML = '<span class="leap-ring"></span><span class="leap-ring"></span><span class="leap-fish">' + FISH + '</span>';
    life.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  }

  function next() {
    setTimeout(function () {
      if (!document.hidden) leap();
      next();
    }, rand(6000, 12000));
  }

  setTimeout(leap, 3500);
  next();
})();
