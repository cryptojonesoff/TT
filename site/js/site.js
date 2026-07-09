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

  // Fades/slides elements in the first time they scroll into view.
  var revealEls = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-toggle');
    if (toggle) {
      document.querySelector('.main-nav').classList.toggle('nav-open');
    }
  });

  // Submits any Formspree-backed form via AJAX so the user stays on the page
  // instead of being redirected to Formspree's default confirmation page.
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[action*="formspree.io"]');
    if (!form) return;
    e.preventDefault();

    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status small muted';
      status.style.marginTop = '8px';
      form.appendChild(status);
    }
    status.textContent = 'Sending…';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        status.textContent = 'Thanks — you’re on the list.';
      } else {
        r.json().then(function (data) {
          var message = data && data.errors && data.errors.map(function (err) { return err.message; }).join(', ');
          status.textContent = message || 'Something went wrong — please try again.';
        });
      }
    }).catch(function () {
      status.textContent = 'Something went wrong — please try again.';
    });
  });
})();
