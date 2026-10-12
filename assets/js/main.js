// Mobile navigation toggle
(function () {
  var toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  var root = document.documentElement;

  function setOpen(open) {
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', function () {
    setOpen(!root.classList.contains('nav-open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
  document.querySelectorAll('.main-nav a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
})();
