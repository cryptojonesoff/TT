// Loads shared header/footer partials and wires up the mobile nav toggle.
// {{base}} tokens in the partials get replaced with the page's relative path prefix
// so this works both at the site root and one level down (e.g. /archives/*.html).
(function () {
  var base = document.currentScript.getAttribute('data-base') || '';

  function include(el) {
    var name = el.getAttribute('data-include');
    fetch(base + 'partials/' + name + '.html')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        el.outerHTML = html.split('{{base}}').join(base);
      });
  }

  document.querySelectorAll('[data-include]').forEach(include);

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      document.querySelector('.main-nav').classList.toggle('nav-open');
    }
  });
})();
