// The pilot: a scripted guide with no AI and no server. Every port has a pilot who
// boards ships and steers them in; this one steers you round the page.
// When it takes you somewhere, its boat really sails the course on the 3D island
// (scene.js) while the camera follows, and then it docks at that part of the page.
(function () {
  'use strict';

  var launcher = document.querySelector('[data-pilot-launcher]');
  var panel = document.getElementById('pilot-panel');
  var log = panel.querySelector('[data-pilot-log]');
  var chipsBox = panel.querySelector('[data-pilot-chips]');
  var form = panel.querySelector('[data-pilot-form]');
  var input = panel.querySelector('#pilot-input');
  var title = panel.querySelector('#pilot-title');
  var scene = window.islandScene || null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var coarsePointer = window.matchMedia('(pointer: coarse)');

  var CHIPS = {
    home: [['Show me around', 'tour'], ['Projects', 'projects'], ['Skills', 'skills'], ['Are you an AI?', 'site']],
    projects: [['TellMotion', 'tellmotion'], ['Finanzas App', 'finanzas'], ['UniMan', 'uniman'], ['Snake', 'snake']],
    afterProject: [['Another project', 'projects'], ['Skills', 'skills'], ['How to reach Joel', 'contact']],
    afterSkills: [['AWS and cloud', 'cloud'], ['Projects', 'projects'], ['About Joel', 'about']],
    afterAbout: [['Skills', 'skills'], ['Projects', 'projects'], ['The highest point', 'summit']],
    island: [['Is the map real?', 'map'], ['About Joel', 'about'], ['Projects', 'projects']],
    end: [['Projects', 'projects'], ['Skills', 'skills'], ['Show me around', 'tour']]
  };

  // Everyday words only count when nothing more specific matches ("tell me about AWS" is about AWS).
  var GENERIC = ['about', 'who', 'where', 'joel', 'work', 'made', 'build', 'built', 'real', 'start', 'talk', 'tech', 'show'];

  // say: one line is picked at random each time, so the pilot doesn't repeat itself word for word.
  var SCRIPT = {
    hello: {
      keys: ['hi', 'hello', 'hey', 'hola', 'buenas', 'good morning', 'good afternoon', 'good evening'],
      say: ['Hello again. Where to?', 'Hola. Name a port or a project and we’ll cast off.', 'Hello. The tide’s fine. Where shall I take you?'],
      chips: CHIPS.home
    },
    thanks: {
      keys: ['thanks', 'thank you', 'gracias', 'cheers', 'great', 'nice', 'cool'],
      say: ['Any time. Pilots get paid in thanks round here.', 'My pleasure. Shout if you want another course plotted.'],
      chips: CHIPS.end
    },
    bye: { keys: ['bye', 'goodbye', 'close', 'exit', 'adios', 'quit'], close: true },
    help: {
      keys: ['help', 'what can you do', 'options', 'menu', 'commands'],
      say: ['I sail you to any part of this page and open what’s there. Try a project (“Snake”), a topic (“AWS”) or the island itself (“highest point”).'],
      chips: CHIPS.home
    },
    tour: { keys: ['tour', 'show me around', 'around', 'guide me', 'take me around', 'start'], tour: true },
    about: {
      keys: ['about', 'who', 'joel', 'story', 'study', 'studies', 'student', 'university', 'ulpgc', 'las palmas'],
      say: ['To Puerto de la Luz, the port of Las Palmas. Joel studies Computer Engineering just up the road, at ULPGC.', 'Las Palmas first: that’s where Joel is in the final year of Computer Engineering.', 'To Puerto de la Luz. Fair warning: as a kid, Joel took apart every gadget in reach just to look at the boards.'],
      act: { target: 'about', stop: 'about', did: 'Sailed to Puerto de la Luz and docked at About me' },
      chips: CHIPS.afterAbout
    },
    skills: {
      keys: ['skill', 'skills', 'stack', 'tech', 'technologies', 'languages', 'language', 'superpower', 'superpowers', 'good at', 'frontend', 'backend', 'react', 'angular', 'python', 'java', 'typescript', 'kotlin'],
      say: ['Round to Agaete, on the north-west coast. Skills are moored there, superpower first.', 'Heading west to Puerto de las Nieves. That’s where the skills are kept.'],
      act: { target: 'superpower', stop: 'skills', did: 'Sailed to Puerto de las Nieves and docked at Skills' },
      chips: CHIPS.afterSkills
    },
    cloud: {
      keys: ['aws', 'cloud', 'terraform', 'localstack', 'lambda', 'dynamodb', 's3', 'sqs', 'devops', 'docker', 'amazon'],
      say: ['Joel practises AWS with Terraform against services emulated in LocalStack. Emulated is the honest word. This site is the part on real AWS.'],
      act: { target: 'cloud', stop: 'skills', did: 'Docked at Cloud, in practice' },
      chips: [['How is this site built?', 'site'], ['Is the map real?', 'map'], ['Projects', 'projects']]
    },
    projects: {
      keys: ['project', 'projects', 'work', 'portfolio', 'built', 'build', 'made', 'achievements'],
      say: ['South to Mogán. Each project is a buoy off that coast. Which one shall I take you to?', 'Down to the south coast, where the projects are moored. Pick a buoy.'],
      act: { target: 'projects-title', stop: 'projects', did: 'Sailed to Puerto de Mogán and docked at Projects' },
      chips: CHIPS.projects
    },
    tellmotion: {
      keys: ['tellmotion', 'tell motion', 'animation', 'animations', 'motion canvas', 'explainer', 'video'],
      say: ['TellMotion, the one I’d see first. It turns an idea into a 2D explainer animation, and it’s open source.', 'Setting a course for TellMotion: ideas in, explainer animations out.'],
      act: { target: 'tellmotion', stop: 'tellmotion', open: true, did: 'Reached the TellMotion buoy and opened its notes' },
      chips: CHIPS.afterProject
    },
    finanzas: {
      keys: ['finanzas', 'finance', 'finances', 'financial', 'money', 'receipt', 'receipts', 'gemini', 'spending'],
      say: ['Finanzas App: it charts your spending and reads receipts with AI.', 'To Finanzas App. Take a photo of a receipt and it lands in your charts.'],
      act: { target: 'finanzas', stop: 'finanzas', open: true, did: 'Reached the Finanzas App buoy and opened its notes' },
      chips: CHIPS.afterProject
    },
    uniman: {
      keys: ['uniman', 'timetable', 'exams', 'grades', 'university manager'],
      say: ['UniMan keeps Joel’s degree on track: timetable, exams, assignments and grades, all in one place.'],
      act: { target: 'uniman', stop: 'uniman', open: true, did: 'Reached the UniMan buoy and opened its notes' },
      chips: CHIPS.afterProject
    },
    snake: {
      keys: ['snake', 'game', 'games', 'multiplayer', 'phaser', 'colyseus'],
      say: ['Snake Multiplayer, the furthest buoy. A team project, and Joel did most of it: developer and the team’s DevOps.', 'Out to Snake: real-time multiplayer in the browser. Joel was the team’s DevOps as well as a developer.'],
      act: { target: 'snake', stop: 'snake', open: true, did: 'Reached the Snake buoy and opened its notes' },
      chips: CHIPS.afterProject
    },
    contact: {
      keys: ['contact', 'linkedin', 'github', 'hire', 'reach', 'email', 'talk', 'cv'],
      say: ['Back towards Las Palmas. GitHub and LinkedIn are the ways to reach Joel, at the bottom of the page.'],
      act: { target: 'contact', stop: 'home', did: 'Sailed back out and docked at Find me' },
      chips: CHIPS.end
    },
    summit: {
      keys: ['highest', 'summit', 'peak', 'pico', 'mountain', 'nieves', 'tallest', 'roque nublo', 'top of the island'],
      say: ['Pico de las Nieves, 1,949 metres, right in the middle. Let me turn the chart so you can see it.'],
      act: { target: 'top', look: 'summit', did: 'Turned the chart to Pico de las Nieves' },
      chips: CHIPS.island
    },
    teide: {
      keys: ['teide', 'tenerife'],
      say: ['Teide is on Tenerife, the next island west, and at 3,715 metres it beats ours. This chart only covers Gran Canaria, though.'],
      chips: CHIPS.island
    },
    map: {
      keys: ['map', 'chart', 'elevation', 'relief', 'accurate', 'data', '3d', 'island', 'gran canaria'],
      say: ['The coastline and mountains are real: elevation data from the AWS Open Data registry, cut into layers every 300 metres. The sea depths are stylised.'],
      act: { target: 'top', look: 'summit', did: 'Turned the chart to the island’s summit' },
      chips: [['How is this site built?', 'site'], ['About Joel', 'about'], ['Projects', 'projects']]
    },
    weather: {
      keys: ['clouds', 'weather', 'sun', 'rain', 'wind', 'panza de burro'],
      say: ['Those are the trade-wind clouds that pile up on the north side. People here call them panza de burro, donkey’s belly.'],
      chips: CHIPS.end
    },
    sound: {
      keys: ['sound', 'audio', 'music', 'waves', 'horn', 'bell', 'mute', 'noise'],
      say: ['The speaker at the top right turns the sea on: waves, my horn when we set sail and the ship’s bell when we dock. It stays off until you ask.'],
      chips: CHIPS.home
    },
    flag: {
      keys: ['flag', 'boat', 'your boat', 'red and white', 'pilot', 'practico'],
      say: ['That’s flag H from the international code: half white, half red. A ship flies it to say “I have a pilot on board”. You do now.'],
      chips: CHIPS.home
    },
    site: {
      keys: ['ai', 'bot', 'robot', 'real', 'chatgpt', 'claude', 'llm', 'are you', 'who are you', 'this site', 'this website', 'hosted', 'hosting', 'amplify', 'how was', 'how does', 'how is', 'built with'],
      say: ['No AI on board. I’m a script of written answers in your browser, with no server and no cost. Keywords pick my answers, and my boat and camera are plain JavaScript and CSS 3D.'],
      act: { target: 'site', stop: 'home', did: 'Docked at the note about this site' },
      chips: CHIPS.end
    }
  };

  var TOUR = [
    { say: 'First stop, Puerto de la Luz in Las Palmas. This is who Joel is.', act: SCRIPT.about.act },
    { say: 'Round the north coast to Agaete. Joel’s superpower comes first, then the full stack.', act: SCRIPT.skills.act },
    { say: 'And south to the buoys off Mogán, the projects. TellMotion is the one to see first, so I’ve opened its notes.', act: SCRIPT.tellmotion.act }
  ];

  var greeted = false, tourStep = -1, busy = Promise.resolve(), sighted = null;

  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduceMotion.matches ? 0 : ms); }); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* Conversation */
  function addLine(kind, text) {
    var line = document.createElement('div');
    line.className = 'msg msg-' + kind;
    log.appendChild(line);
    if (kind !== 'pilot' || reduceMotion.matches) {
      line.textContent = text;
      log.scrollTop = log.scrollHeight;
      return Promise.resolve();
    }
    // The pilot types its answer. Screen readers get the whole line at once.
    var spoken = document.createElement('span');
    spoken.className = 'visually-hidden';
    spoken.textContent = text;
    var typed = document.createElement('span');
    typed.setAttribute('aria-hidden', 'true');
    typed.className = 'typing';
    line.appendChild(spoken);
    line.appendChild(typed);
    return new Promise(function (resolve) {
      var i = 0;
      var timer = setInterval(function () {
        i = Math.min(text.length, i + 2);
        typed.textContent = text.slice(0, i);
        log.scrollTop = log.scrollHeight;
        if (i >= text.length) { clearInterval(timer); typed.classList.remove('typing'); resolve(); }
      }, 16);
    });
  }

  function setChips(list) {
    chipsBox.textContent = '';
    (list || []).forEach(function (item) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = item[0];
      chip.addEventListener('click', function () { handle(item[1], item[0]); });
      chipsBox.appendChild(chip);
    });
    log.scrollTop = log.scrollHeight;
  }

  function escapeRegExp(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function understand(text) {
    var clean = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var best = null, bestScore = 0;
    Object.keys(SCRIPT).forEach(function (name) {
      SCRIPT[name].keys.forEach(function (key) {
        if (!new RegExp('(^|[^a-z0-9])' + escapeRegExp(key) + '($|[^a-z0-9])').test(clean)) return;
        var score = GENERIC.indexOf(key) === -1 ? key.length + 1 : 1;
        if (score > bestScore) { best = name; bestScore = score; }
      });
    });
    return best;
  }

  function handle(intent, userText) {
    if (intent !== '__next' && intent !== '__stop') tourStep = -1;
    busy = busy.then(function () {
      if (userText) addLine('user', userText);
      return run(intent);
    }).catch(function () {
      return addLine('pilot', 'Something fouled the line there. The menu at the top goes to the same places.');
    });
    return busy;
  }

  function run(intent) {
    if (intent === '__next') return nextTourStop();
    if (intent === '__stop') {
      setChips(CHIPS.end);
      return addLine('pilot', 'Tour over. You have the helm.');
    }

    var entry = SCRIPT[intent];
    if (!entry) {
      setChips(CHIPS.home);
      return addLine('pilot', pick([
        'That’s not on my chart. I’m a script, not an AI, so I only know this page and this island. Try one of these.',
        'No idea, I’m afraid. I only know what’s written in my script: this page and the island. These I can do.'
      ]));
    }
    if (entry.close) { closePanel(); return Promise.resolve(); }
    if (entry.tour) {
      tourStep = -1;
      return addLine('pilot', 'Three ports, all round the island. You say when we move on, and you can jump ship whenever you like.').then(nextTourStop);
    }

    setChips([]);
    return addLine('pilot', pick(entry.say))
      .then(function () { return entry.act ? perform(entry.act) : null; })
      .then(function () { setChips(entry.chips); });
  }

  function nextTourStop() {
    tourStep += 1;
    var stop = TOUR[tourStep];
    setChips([]);
    return addLine('pilot', stop.say).then(function () { return perform(stop.act); }).then(function () {
      if (tourStep < TOUR.length - 1) {
        setChips([['Next port', '__next'], ['End the tour', '__stop']]);
      } else {
        tourStep = -1;
        setChips(CHIPS.projects);
        return addLine('pilot', 'That’s the whole voyage. Hover over any project and the chart turns to its buoy, or ask me to take you.');
      }
    });
  }

  /* Acting on the page: sail, scroll, dock */
  function targetOf(name) {
    return document.querySelector('[data-target="' + name + '"]') || document.getElementById(name);
  }

  function clearSighted() {
    if (sighted) sighted.classList.remove('is-sighted');
    sighted = null;
  }

  function scrollToElement(el, extra) {
    var header = document.querySelector('.site-header').offsetHeight;
    var top = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - header - (extra || 28));
    var before = window.pageYOffset;
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    if (reduceMotion.matches || Math.abs(top - before) < 4) return Promise.resolve();
    return new Promise(function (resolve) {
      var last = window.pageYOffset, still = 0, ticks = 0;
      var timer = setInterval(function () {
        ticks += 1;
        still = Math.abs(window.pageYOffset - last) < 1 ? still + 1 : 0;
        last = window.pageYOffset;
        if (still >= 3 || ticks > 60) { clearInterval(timer); resolve(); }
      }, 50);
    });
  }

  function perform(action) {
    clearSighted();
    var el = targetOf(action.target);
    if (!el) return Promise.reject(new Error('Unknown target'));

    document.querySelectorAll('details.project[open]').forEach(function (d) { if (d !== el) d.open = false; });
    if (action.open) el.open = true;
    if (scene && el.dataset && el.dataset.buoy) scene.focusProject(el.dataset.buoy);

    // While the boat sails, the page fades out (scene.js), so it can scroll straight to the target.
    var first = el;

    var voyage = !scene ? Promise.resolve()
      : action.look ? scene.lookAt(action.look)
      : scene.sailTo(action.stop);

    return Promise.all([voyage, scrollToElement(first, 0)])
      .then(function () {
        if (first !== el) return wait(600).then(function () { return scrollToElement(el); });
      })
      .then(function () {
        if (action.target !== 'top') {
          el.classList.add('is-sighted');
          sighted = el;
        }
        return addLine('action', action.did);
      });
  }

  /* Open and close */
  function greeting() {
    var h = new Date().getHours();
    return h < 6 ? 'Evening, night owl.' : h < 13 ? 'Good morning.' : h < 20 ? 'Good afternoon.' : 'Good evening.';
  }

  function openPanel() {
    panel.hidden = false;
    document.documentElement.classList.add('pilot-open');
    if (scene) scene.showBoat();
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      busy = busy.then(function () {
        return addLine('pilot', greeting() + ' I’m the pilot. In a port, the pilot boards your ship and steers it in. Here I steer you round Joel’s island.');
      }).then(function () {
        setChips(CHIPS.home);
        return addLine('pilot', 'I’m a script, not an AI, but my boat really sails that chart. Pick a port or type a topic.');
      });
    }
    // On phones, focusing the input would bring up the keyboard and hide the island.
    (coarsePointer.matches ? title : input).focus({ preventScroll: true });
  }

  function closePanel() {
    panel.hidden = true;
    document.documentElement.classList.remove('pilot-open');
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    clearSighted();
    tourStep = -1;
    launcher.focus({ preventScroll: true });
  }

  launcher.addEventListener('click', openPanel);
  panel.querySelector('[data-pilot-close]').addEventListener('click', closePanel);

  document.querySelectorAll('[data-pilot-start]').forEach(function (button) {
    button.addEventListener('click', function () {
      openPanel();
      handle('tour', 'Show me around');
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    handle(understand(text) || '__unknown', text);
  });

  // Without JavaScript none of this shows, and the site still works in full.
  launcher.hidden = false;
  document.querySelectorAll('[data-pilot-only]').forEach(function (el) { el.hidden = false; });
})();
