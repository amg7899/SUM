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
    subs.forEach(function (li) { setSub(li, false); });
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
    header.classList.remove('nav-inline-off', 'mail-off');
    header.style.setProperty('--nav-scale', '1');
    list.style.removeProperty('--nav-shift');
    if (window.innerWidth < 1024) {
      header.classList.add('nav-inline-off');
      return;
    }
    // the e-mail box beside the language button gives way first, so the links keep their size
    // and at least 48px (18px header gap + 30) on each side
    if (needed() + 60 > nav.clientWidth) header.classList.add('mail-off');
    var scale = 1;
    for (var i = 0; i < 4 && needed() > nav.clientWidth; i++) {
      scale = Math.max(MIN_SCALE, scale * nav.clientWidth / needed() * 0.995);
      header.style.setProperty('--nav-scale', scale.toFixed(3));
      if (scale === MIN_SCALE) break;
    }
    if (needed() > nav.clientWidth) {
      header.classList.add('nav-inline-off');
      header.classList.remove('mail-off');      // the row is gone, so there is room again
    } else {
      centerRow();
      placeSubs();
    }
  }

  // The row is centred between the logo and what stands on the right (the e-mail box and the
  // language button, or the button alone). The two sides differ in width, so move the row to
  // the middle of the window, as far as the free space beside it allows while it stays at
  // least 48px (18px header gap + 30) from its neighbours.
  function centerRow() {
    var box = nav.getBoundingClientRect();
    var room = (nav.clientWidth - needed()) / 2 - 30;
    var shift = Math.max(-room, Math.min(box.left + box.width / 2 - root.clientWidth / 2, room));
    if (room > 0 && shift) list.style.setProperty('--nav-shift', (-shift).toFixed(1) + 'px');
  }

  // width of the links from the first to the last (the row is centred, so overflow runs off
  // both sides, where scrollWidth does not see it on the left)
  function needed() {
    var items = list.children;
    if (!items.length) return 0;
    return items[items.length - 1].getBoundingClientRect().right - items[0].getBoundingClientRect().left;
  }

  // "ECOES Conversion" has a panel with the bus & trucks and agro pages. A mouse opens it by
  // hovering (CSS); its arrow button opens and closes it for touch and keyboard. Escape, a click
  // elsewhere or moving the focus away closes it.
  var subs = Array.prototype.slice.call(list.querySelectorAll('.has-sub'));
  function setSub(li, open) {
    li.querySelector('.sub-toggle').setAttribute('aria-expanded', String(open));
    li.classList.toggle('is-open', open);
    if (open) li.classList.remove('is-dismissed');
  }
  // keep the panel inside the window: shift it left by as much as it would stick out
  function placeSubs() {
    subs.forEach(function (li) {
      li.style.removeProperty('--sub-shift');
      var over = li.getBoundingClientRect().left + li.querySelector('.sub-panel').offsetWidth -
        (root.clientWidth - 16);
      if (over > 0) li.style.setProperty('--sub-shift', -Math.ceil(over) + 'px');
    });
  }
  subs.forEach(function (li) {
    var button = li.querySelector('.sub-toggle');
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') !== 'true';
      subs.forEach(function (other) { setSub(other, false); });
      setSub(li, open);
    });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) setSub(li, false);
    });
    li.addEventListener('mouseleave', function () { li.classList.remove('is-dismissed'); });
  });
  document.addEventListener('click', function (e) {
    subs.forEach(function (li) { if (!li.contains(e.target)) setSub(li, false); });
  });
  // Escape closes an open panel, also one shown by hovering (it stays closed until the mouse leaves)
  function closeSubs() {
    var closed = false;
    subs.forEach(function (li) {
      var button = li.querySelector('.sub-toggle');
      if (button.getAttribute('aria-expanded') !== 'true' && !li.matches(':hover')) return;
      closed = true;
      setSub(li, false);
      li.classList.add('is-dismissed');
      if (li.contains(document.activeElement)) button.focus();
    });
    return closed;
  }

  toggle.addEventListener('click', function () {
    var open = !header.classList.contains('nav-open');
    setOpen(open);
    if (!open) fit();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (header.classList.contains('nav-open')) {
      setOpen(false);
      fit();
      toggle.focus();
    } else {
      closeSubs();
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

// Language. The EN | BG switch in the header links each page to the same page in the other
// language. When the browser translates a page into a language the site has itself (it sets
// <html lang>, e.g. Chrome translating English into Bulgarian), the visitor is taken to our own
// version of that page instead, so the wording is ours ("ECOES конверсия", not a machine
// translation). A language picked with the switch is kept for the session: its pages are then
// marked translate="no", so the browser does not translate them again.
(function () {
  var root = document.documentElement;
  var box = document.querySelector('.lang-switch');
  var current = box && box.querySelector('[aria-current]');
  if (!current) return;
  var KEY = 'ecoes-lang';
  var pageLang = current.getAttribute('hreflang');
  var versions = {};
  Array.prototype.forEach.call(box.querySelectorAll('a[hreflang]'), function (a) {
    versions[a.getAttribute('hreflang')] = a;
  });

  function chosen() {
    try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; }
  }

  // switching keeps the query and the anchor (e.g. contact-us/?topic=agro#contact-form)
  function target(a) {
    return a.href.split(/[?#]/)[0] + window.location.search + window.location.hash;
  }

  box.addEventListener('click', function (e) {
    var a = e.target.closest('a[hreflang]');
    if (!a || a === current) return;
    try { window.sessionStorage.setItem(KEY, a.getAttribute('hreflang')); } catch (err) { /* storage blocked */ }
    a.href = target(a);
  });

  if (chosen() === pageLang) root.setAttribute('translate', 'no');

  function follow() {
    var to = (root.getAttribute('lang') || '').toLowerCase().split('-')[0];
    if (to === pageLang || !versions[to] || chosen() === pageLang) return;
    window.location.replace(target(versions[to]));
  }
  follow();
  new MutationObserver(follow).observe(root, { attributes: true, attributeFilter: ['lang'] });
})();
