// Navigation: shows the links in the header while they fit; otherwise collapses them into a
// full-screen menu. Re-checks on resize, after fonts load and when the page is translated.
(function () {
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var inner = header && header.querySelector('.header-inner');
  var brand = header && header.querySelector('.brand');
  var list = header && header.querySelector('.main-nav ul');
  var toggle = header && header.querySelector('.nav-toggle');
  if (!inner || !brand || !list || !toggle) return;

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
    var wasCompact = header.classList.contains('nav-compact');
    header.classList.remove('nav-compact');
    var gap = parseFloat(getComputedStyle(inner).columnGap) || 0;
    var needed = brand.offsetWidth + gap + list.scrollWidth;
    var compact = needed > inner.clientWidth - parseFloat(getComputedStyle(inner).paddingLeft) - parseFloat(getComputedStyle(inner).paddingRight);
    header.classList.toggle('nav-compact', compact);
    if (wasCompact && !compact) setOpen(false);
  }

  toggle.addEventListener('click', function () {
    setOpen(!header.classList.contains('nav-open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  list.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(inner);
  else window.addEventListener('resize', fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  // browser translation swaps the text of the links
  new MutationObserver(fit).observe(list, { subtree: true, childList: true, characterData: true });
})();
