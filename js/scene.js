// The island scene behind the page. Scrolling moves a camera from port to port:
// the hero shows the whole island, then each section turns to its own port.
// The pilot (pilot.js) uses window.islandScene to sail its boat and steer the camera.
(function () {
  'use strict';

  var scene = document.querySelector('[data-scene]');
  if (!scene) return;
  var stage = scene.querySelector('[data-stage]');
  var stems = scene.querySelector('[data-stems]');
  var course = scene.querySelector('[data-course]');
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  // Map points (the map is 1000 x 1000) and how high their labels float.
  var POINTS = {
    home: { x: 990, y: 140 },
    about: { x: 790, y: 262, top: 70 },
    skills: { x: 318, y: 292, top: 70 },
    projects: { x: 236, y: 738, top: 70 },
    summit: { x: 535, y: 500, foot: 96, top: 130, ink: true },
    tellmotion: { x: 345, y: 868, top: 45 },
    finanzas: { x: 505, y: 918, top: 45 },
    uniman: { x: 668, y: 880, top: 45 },
    snake: { x: 800, y: 772, top: 45 }
  };
  var BUOYS = ['tellmotion', 'finanzas', 'uniman', 'snake'];

  /* Labels: an anchor in 3D at the foot and one at the top; the label is drawn in 2D at the top */
  var pins = {};
  Object.keys(POINTS).forEach(function (name) {
    var point = POINTS[name];
    var el = document.querySelector('[data-pin="' + name + '"]');
    if (!el) return;
    var foot = anchor(point.x, point.y, point.foot || 0);
    var top = anchor(point.x, point.y, point.top);
    var line = document.createElementNS(SVG_NS, 'line');
    if (point.ink) line.setAttribute('class', 'is-ink');
    stems.appendChild(line);
    pins[name] = { el: el, foot: foot, top: top, line: line, o: 0 };
  });

  function anchor(x, y, z) {
    var el = document.createElement('i');
    el.className = 'anchor';
    el.style.cssText = '--x:' + x + ';--y:' + y + ';--z:' + z;
    stage.appendChild(el);
    return el;
  }

  /* Camera poses for each part of the page */
  var activeBuoy = null;
  function isNarrow() { return window.innerWidth <= 900; }

  function poseFor(name) {
    var w = window.innerWidth, h = window.innerHeight, narrow = isNarrow();
    var sectionY = narrow ? -0.13 * h : 0.04 * h;
    switch (name) {
      case 'about':
        return { fx: 780, fy: 270, zoom: narrow ? 1.7 : 2.0, rx: 60, rz: -32, sx: narrow ? 0 : 0.26 * w, sy: sectionY, deep: 0.03, spread: 1.1, pins: ['about'] };
      case 'skills':
        return { fx: 360, fy: 330, zoom: narrow ? 1.6 : 1.85, rx: 62, rz: 24, sx: narrow ? 0 : -0.25 * w, sy: sectionY, deep: 0.16, spread: 1.15, pins: ['skills', 'summit'] };
      case 'projects':
      case 'footer':
        // The island sits in the top half of the screen, above the projects panel, so every buoy shows.
        var buoy = activeBuoy ? POINTS[activeBuoy] : null;
        return {
          fx: buoy ? buoy.x : 575, fy: buoy ? buoy.y : 830,
          zoom: buoy ? (narrow ? 1.8 : 2.1) : (narrow ? 1.3 : 1.45),
          rx: 62, rz: buoy ? -6 : 0, sx: narrow ? 0 : 0.06 * w, sy: narrow ? -0.13 * h : -0.18 * h,
          deep: name === 'footer' ? 1 : 0.85, spread: 1.2, pins: BUOYS
        };
      default:
        return { fx: 500, fy: 500, zoom: narrow ? 0.9 : 1, rx: 54, rz: -12, sx: narrow ? 0 : 0.22 * w, sy: narrow ? 0.3 * h : 0.02 * h, deep: 0, spread: 1, pins: ['about', 'skills', 'projects', 'summit'] };
    }
  }

  // Scroll positions where each pose is reached.
  function keys() {
    var h = window.innerHeight, list = [{ y: 0, name: 'hero' }];
    document.querySelectorAll('[data-pose]').forEach(function (section) {
      list.push({ y: section.offsetTop - h * 0.15, name: section.dataset.pose });
    });
    var footer = document.querySelector('.site-footer');
    if (footer) list.push({ y: footer.offsetTop - h * 0.5, name: 'footer' });
    return list;
  }

  var NUMS = ['fx', 'fy', 'zoom', 'rx', 'rz', 'sx', 'sy', 'deep', 'spread'];
  function blend(a, b, t) {
    var out = { pinWeights: {} };
    NUMS.forEach(function (k) { out[k] = a[k] + (b[k] - a[k]) * t; });
    a.pins.forEach(function (p) { out.pinWeights[p] = (out.pinWeights[p] || 0) + (1 - t); });
    b.pins.forEach(function (p) { out.pinWeights[p] = (out.pinWeights[p] || 0) + t; });
    return out;
  }

  function scrollPose() {
    var y = window.pageYOffset, list = keys(), i = 0;
    while (i < list.length - 1 && y >= list[i + 1].y) i++;
    if (i === list.length - 1) return blend(poseFor(list[i].name), poseFor(list[i].name), 0);
    var a = list[i], b = list[i + 1];
    var t = (y - a.y) / Math.max(1, b.y - a.y);
    t = Math.min(1, Math.max(0, (t - 0.12) / 0.76)); // hold each pose for a moment
    t = t * t * (3 - 2 * t);
    if (reduceMotion.matches) t = t < 0.5 ? 0 : 1;
    return blend(poseFor(a.name), poseFor(b.name), t);
  }

  /* Stops along the course, measured as distance along the path */
  var pathLength = course.getTotalLength();
  var stopAt = {};
  Object.keys(POINTS).forEach(function (name) {
    var p = POINTS[name], best = 0, bestD = Infinity;
    for (var s = 0; s <= 400; s++) {
      var at = course.getPointAtLength(pathLength * s / 400);
      var d = Math.hypot(at.x - p.x, at.y - p.y);
      if (d < bestD) { bestD = d; best = pathLength * s / 400; }
    }
    stopAt[name] = bestD < 40 ? best : null;
  });
  // The boat is drawn in 2D above everything (land, clouds and the page), at the
  // screen position of a 3D anchor that moves along the course. That way nothing hides it.
  var boatAnchor = anchor(990, 140, 3), aheadAnchor = anchor(990, 140, 3);
  var pinsLayer = document.querySelector('.pins');
  var boat2d = document.createElement('div');
  boat2d.className = 'boat2d';
  boat2d.setAttribute('aria-hidden', 'true');
  boat2d.innerHTML = '<svg viewBox="-26 -26 52 52" width="52" height="52">' +
    '<path class="boat2d-hull" d="M 22 0 C 16 -7 8 -10 -2 -10 L -18 -10 L -18 10 L -2 10 C 8 10 16 7 22 0 Z"/>' +
    '<rect class="boat2d-cabin" x="-10" y="-6" width="12" height="12" rx="2"/>' +
    '<rect x="-17" y="-5" width="5" height="10" fill="#fff"/><rect x="-12" y="-5" width="5" height="10" fill="#d6102c"/>' +
    '</svg>';
  pinsLayer.appendChild(boat2d);
  // The wake is drawn on the map itself: a copy of the course showing only the stretch just sailed.
  var trail = document.createElementNS(SVG_NS, 'path');
  trail.setAttribute('d', course.getAttribute('d'));
  trail.setAttribute('class', 'boat-trail');
  course.parentNode.insertBefore(trail, course.nextSibling);
  var boatShown = false;

  var boatAt = 0;
  function placeBoat(length) {
    boatAt = length;
    var p = course.getPointAtLength(length);
    var q = course.getPointAtLength(Math.min(pathLength, length + 6));
    if (length > pathLength - 6) { q = p; p = course.getPointAtLength(length - 6); }
    boatAnchor.style.setProperty('--x', p.x.toFixed(1));
    boatAnchor.style.setProperty('--y', p.y.toFixed(1));
    aheadAnchor.style.setProperty('--x', q.x.toFixed(1));
    aheadAnchor.style.setProperty('--y', q.y.toFixed(1));
  }
  placeBoat(0);

  function measureBoat() {
    if (!boatShown) return null;
    return { a: boatAnchor.getBoundingClientRect(), b: aheadAnchor.getBoundingClientRect() };
  }

  function drawBoat(m) {
    if (!m) return;
    var a = m.a, b = m.b;
    var angle = Math.atan2(b.top - a.top, b.left - a.left) * 180 / Math.PI;
    boat2d.style.transform = 'translate(' + a.left.toFixed(1) + 'px,' + a.top.toFixed(1) + 'px) rotate(' + angle.toFixed(1) + 'deg)';
    if (sail) {
      var lo = Math.min(sail.from, boatAt), hi = Math.max(sail.from, boatAt);
      trail.style.strokeDasharray = '0 ' + lo.toFixed(1) + ' ' + (hi - lo).toFixed(1) + ' ' + pathLength.toFixed(0);
    }
  }

  function showBoat() {
    boatShown = true;
    boat2d.classList.add('is-on');
    kick();
  }

  var sail = null;     // a voyage in progress
  var override = { fx: 500, fy: 500, zoom: 1, sx: 0, sy: 0, rx: 58, w: 0, target: 0, until: 0 };

  // During a voyage the camera centres the boat in the part of the screen the pilot's panel leaves free.
  function frameFreeArea() {
    var panel = document.getElementById('pilot-panel');
    var open = panel && !panel.hidden;
    if (isNarrow()) { override.sx = 0; override.sy = 0; } // the phone sheet folds away while sailing
    else { override.sx = open ? -(panel.offsetWidth + 16) / 2 : 0; override.sy = 0; }
    override.rx = 58;
  }

  function sailTo(name) {
    var to = stopAt[name];
    if (to == null) return lookAt(name);
    if (sail) sail.resolve();
    showBoat();
    return new Promise(function (resolve) {
      var distance = Math.abs(to - boatAt);
      if (reduceMotion.matches || distance < 2) { placeBoat(to); kick(); resolve(); return; }
      sail = { from: boatAt, to: to, start: null, duration: Math.min(3600, Math.max(1400, distance / pathLength * 9500)), resolve: resolve };
      trail.style.opacity = 1;
      frameFreeArea();
      document.documentElement.classList.add('is-voyage');
      // sound.js listens for these to play the horn and the ship's bell.
      document.dispatchEvent(new CustomEvent('island:depart', { detail: { seconds: sail.duration / 1000 } }));
      override.target = 1;
      kick();
      // If the browser stops drawing frames (a background tab), finish the voyage anyway
      // so the page never stays faded out.
      var thisSail = sail;
      setTimeout(function () {
        if (sail !== thisSail) return;
        sail = null;
        placeBoat(to);
        override.target = 0;
        trail.style.opacity = 0;
        document.documentElement.classList.remove('is-voyage');
        document.dispatchEvent(new CustomEvent('island:arrive'));
        resolve();
        kick();
      }, thisSail.duration + 2000);
    });
  }

  // Turns the camera to a point that is not on the course (the summit) for a few seconds.
  function lookAt(name) {
    var p = POINTS[name];
    if (!p) return Promise.resolve();
    frameFreeArea();
    override.fx = p.x; override.fy = p.y; override.zoom = isNarrow() ? 2 : 2.4;
    override.target = 1; override.until = performance.now() + 6000;
    if (reduceMotion.matches) override.w = 1;
    kick();
    return new Promise(function (resolve) { setTimeout(resolve, reduceMotion.matches ? 0 : 1200); });
  }

  function focusProject(name) {
    if (activeBuoy === name) return;
    activeBuoy = name && POINTS[name] ? name : null;
    BUOYS.forEach(function (b) { if (pins[b]) pins[b].el.classList.toggle('is-current', b === activeBuoy); });
    kick();
  }

  /* The frame loop runs only while something is moving */
  var current = null, pointer = { x: 0, y: 0 }, running = false, introStart = null;
  var INTRO = { rx: 18, rz: 4, spread: 0.04 };

  function apply(p) {
    var st = stage.style;
    st.setProperty('--fx', p.fx.toFixed(2));
    st.setProperty('--fy', p.fy.toFixed(2));
    st.setProperty('--zoom', p.zoom.toFixed(4));
    st.setProperty('--rx', p.rx.toFixed(2) + 'deg');
    st.setProperty('--rz', p.rz.toFixed(2) + 'deg');
    st.setProperty('--sx', p.sx.toFixed(1) + 'px');
    st.setProperty('--sy', p.sy.toFixed(1) + 'px');
    st.setProperty('--spread', p.spread.toFixed(3));
    scene.style.setProperty('--deep-amt', p.deep.toFixed(3));
  }

  // Reads every anchor position first and writes afterwards: mixing reads and writes
  // makes the browser recalculate the page once per label instead of once per frame.
  function measurePins(weights) {
    var out = {};
    Object.keys(pins).forEach(function (name) {
      var pin = pins[name], o = Math.min(1, weights[name] || 0);
      pin.o += (o - pin.o) * (reduceMotion.matches ? 1 : 0.25);
      if (pin.o >= 0.02) out[name] = { top: pin.top.getBoundingClientRect(), foot: pin.foot.getBoundingClientRect() };
    });
    return out;
  }

  function placePins(rects) {
    Object.keys(pins).forEach(function (name) {
      var pin = pins[name];
      if (!rects[name]) {
        pin.el.classList.remove('is-on');
        pin.line.style.opacity = 0;
        return;
      }
      var top = rects[name].top, foot = rects[name].foot;
      pin.el.classList.toggle('is-on', pin.o > 0.4);
      pin.el.style.setProperty('--o', pin.o.toFixed(2));
      pin.el.style.setProperty('--px', top.left.toFixed(1) + 'px');
      pin.el.style.setProperty('--py', (top.top + 1).toFixed(1) + 'px');
      pin.line.setAttribute('x1', foot.left.toFixed(1));
      pin.line.setAttribute('y1', foot.top.toFixed(1));
      pin.line.setAttribute('x2', top.left.toFixed(1));
      pin.line.setAttribute('y2', top.top.toFixed(1));
      pin.line.style.opacity = pin.o.toFixed(2);
    });
  }

  function tick(now) {
    var target = scrollPose();
    var moving = false;

    // Opening: the layers rise from a flat chart.
    if (introStart !== null) {
      var t = Math.min(1, (now - introStart) / 1900), rise = 1 - Math.pow(1 - t, 3);
      target.rx = INTRO.rx + (target.rx - INTRO.rx) * rise;
      target.rz = INTRO.rz + (target.rz - INTRO.rz) * rise;
      target.spread = INTRO.spread + (target.spread - INTRO.spread) * rise;
      if (t >= 1) introStart = null; else moving = true;
    }

    if (finePointer.matches && !reduceMotion.matches) {
      target.rx -= pointer.y * 7;
      target.rz += pointer.x * 10;
    }

    // A voyage: the boat moves along the course and the camera follows it.
    if (sail) {
      if (sail.start === null) sail.start = now;
      var k = Math.min(1, (now - sail.start) / sail.duration);
      var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      placeBoat(sail.from + (sail.to - sail.from) * e);
      var at = course.getPointAtLength(boatAt);
      override.fx = at.x; override.fy = at.y; override.zoom = isNarrow() ? 1.5 : 1.8;
      moving = true;
      if (k >= 1) {
        var done = sail.resolve; sail = null;
        override.target = 0;
        trail.style.opacity = 0;
        setTimeout(function () { document.documentElement.classList.remove('is-voyage'); }, 250);
        document.dispatchEvent(new CustomEvent('island:arrive'));
        done();
      }
    }
    if (override.until && now > override.until) { override.until = 0; override.target = 0; }
    override.w += (override.target - override.w) * (reduceMotion.matches ? 1 : 0.06);
    if (Math.abs(override.target - override.w) > 0.002) moving = true;
    if (override.w > 0.001) {
      ['fx', 'fy', 'zoom', 'sx', 'sy', 'rx'].forEach(function (key) {
        target[key] += (override[key] - target[key]) * override.w;
      });
    }

    if (!current || reduceMotion.matches || introStart !== null) {
      current = Object.assign({}, target);
    } else {
      NUMS.forEach(function (key) {
        var diff = target[key] - current[key];
        current[key] += diff * 0.1;
        if (Math.abs(diff) > 0.01) moving = true;
      });
    }
    apply(current);
    var pinRects = measurePins(target.pinWeights), boatRects = measureBoat();
    placePins(pinRects);
    drawBoat(boatRects);
    Object.keys(pins).forEach(function (name) {
      if (Math.abs((target.pinWeights[name] || 0) - pins[name].o) > 0.02) moving = true;
    });

    if (moving) requestAnimationFrame(tick); else running = false;
  }

  function kick() {
    if (running) return;
    running = true;
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  window.addEventListener('mousemove', function (event) {
    if (!finePointer.matches) return;
    pointer.x = event.clientX / window.innerWidth - 0.5;
    pointer.y = event.clientY / window.innerHeight - 0.5;
    kick();
  }, { passive: true });

  // Project rows steer the camera to their buoy.
  document.querySelectorAll('[data-buoy]').forEach(function (row) {
    var name = row.dataset.buoy;
    row.addEventListener('mouseenter', function () { focusProject(name); });
    row.addEventListener('focusin', function () { focusProject(name); });
    row.addEventListener('toggle', function () { if (row.open) focusProject(name); });
  });
  var projectsPanel = document.querySelector('.depth-projects .panel');
  if (projectsPanel) projectsPanel.addEventListener('mouseleave', function () {
    var open = projectsPanel.querySelector('details[open][data-buoy]');
    focusProject(open ? open.dataset.buoy : null);
  });

  window.islandScene = { sailTo: sailTo, lookAt: lookAt, focusProject: focusProject, showBoat: showBoat, hasStop: function (n) { return stopAt[n] != null; } };

  // The model fades in and rises only once every layer is decoded, so no layer pops in late.
  // A time limit keeps a slow network from hiding the island for long.
  scene.classList.add('is-loading');
  var layers = Array.prototype.slice.call(stage.querySelectorAll('img'));
  var decoded = Promise.all(layers.map(function (img) {
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  }));
  Promise.race([decoded, new Promise(function (r) { setTimeout(r, 2500); })]).then(function () {
    scene.classList.remove('is-loading');
    if (!reduceMotion.matches && window.pageYOffset < 40) introStart = performance.now();
    kick();
  });
  kick();
})();
