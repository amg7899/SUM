// Navigation: the menu button (left of the logo) always opens every section full-screen.
// The row of links stays in the header, wrapping onto more lines if needed, in any
// language; it is hidden only when it would need more than three lines (phones, very long
// translations). Re-checked on resize, after fonts load and when the page is translated.
(function () {
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var list = header && header.querySelector('.main-nav ul');
  var toggle = header && header.querySelector('.nav-toggle');
  if (!list || !toggle) return;

  function setOpen(open) {
    header.classList.toggle('nav-open', open);
    root.classList.toggle('nav-lock', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      var first = list.querySelector('a');
      if (first) first.focus();
    }
  }

  function rows() {
    var count = 0, lastTop = null;
    for (var i = 0; i < list.children.length; i++) {
      var top = list.children[i].offsetTop;
      if (lastTop === null || top > lastTop + 4) { count++; lastTop = top; }
    }
    return count;
  }

  function fit() {
    if (header.classList.contains('nav-open')) return;
    header.classList.remove('nav-inline-off');
    var off = window.innerWidth < 1024 || rows() > 3;
    header.classList.toggle('nav-inline-off', off);
  }

  toggle.addEventListener('click', function () {
    var open = !header.classList.contains('nav-open');
    setOpen(open);
    if (!open) fit();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      fit();
      toggle.focus();
    }
  });
  list.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  fit();
  window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  // browser translation swaps the text of the links
  new MutationObserver(fit).observe(list, { subtree: true, childList: true, characterData: true });
})();
