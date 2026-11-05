// Marks the current section in the header menu while scrolling.
(function () {
  'use strict';

  var links = Array.prototype.slice.call(document.querySelectorAll('.site-header nav a'));
  if (!('IntersectionObserver' in window) || !links.length) return;

  function mark(id) {
    links.forEach(function (link) {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) mark(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['top', 'about', 'skills', 'projects'].forEach(function (id) {
    var section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();
