// Navigation. The menu button (left of the logo) always opens every section full-screen.
// The links stay on one line in the header in any language: when a translation is longer,
// their size is scaled down just enough to fit (down to 74%). Below 1024px, or if even that
// is not enough, only the menu button remains. Re-checked on resize, after fonts load and
// whenever the browser translates the page (it swaps the text and sets <html lang>).
(function () {
  var MIN_SCALE = 0.74;
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var nav = header && header.querySelector('.main-nav');
  var list = nav && nav.querySelector('ul');
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

  function fit() {
    if (header.classList.contains('nav-open')) return;
    header.classList.remove('nav-inline-off');
    header.style.setProperty('--nav-scale', '1');
    if (window.innerWidth < 1024) {
      header.classList.add('nav-inline-off');
      return;
    }
    var scale = 1;
    for (var i = 0; i < 4 && needed() > nav.clientWidth; i++) {
      scale = Math.max(MIN_SCALE, scale * nav.clientWidth / needed() * 0.995);
      header.style.setProperty('--nav-scale', scale.toFixed(3));
      if (scale === MIN_SCALE) break;
    }
    if (needed() > nav.clientWidth) header.classList.add('nav-inline-off');
  }

  // width of the links from the first to the last (the row is right-aligned, so overflow
  // runs off to the left where scrollWidth does not see it)
  function needed() {
    var items = list.children;
    if (!items.length) return 0;
    return items[items.length - 1].getBoundingClientRect().right - items[0].getBoundingClientRect().left;
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
  if (document.fonts) {
    if (document.fonts.ready) document.fonts.ready.then(fit);
    // a translation can pull in another subset of the web font (e.g. Cyrillic) after the first fit
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fit);
  }
  new MutationObserver(fit).observe(list, { subtree: true, childList: true, characterData: true });
  new MutationObserver(fit).observe(root, { attributes: true, attributeFilter: ['lang', 'class'] });
})();
