// Contact form: picks the subject from ?topic=, checks the required fields next to them, and
// sends the message by e-mail through FormSubmit (to sales@ecoes.eu, copy to bulfire@ecoes.eu).
// Without JavaScript the form still posts to FormSubmit, which then returns here with ?sent=1.
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button.querySelector('.btn-label');
  var topic = form.querySelector('#f-topic');
  var params = new URLSearchParams(window.location.search);
  var SENT = 'Thank you! Your message has been sent. We will contact you soon.';

  var wanted = params.get('topic');
  if (wanted) {
    for (var i = 0; i < topic.options.length; i++) {
      if (topic.options[i].getAttribute('data-topic') === wanted) topic.selectedIndex = i;
    }
  }

  var next = document.createElement('input');
  next.type = 'hidden';
  next.name = '_next';
  next.value = window.location.origin + window.location.pathname + '?sent=1#contact-form';
  form.appendChild(next);
  if (params.get('sent') === '1') show(SENT, false);

  var fields = [
    { el: form.querySelector('#f-name'), error: form.querySelector('#e-name'), ok: function (el) { return el.value.trim() !== ''; } },
    { el: form.querySelector('#f-email'), error: form.querySelector('#e-email'), ok: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()); } },
    { el: form.querySelector('#f-message'), error: form.querySelector('#e-message'), ok: function (el) { return el.value.trim() !== ''; } },
    { el: form.querySelector('#f-consent'), error: form.querySelector('#e-consent'), ok: function (el) { return el.checked; } }
  ];

  function check(field) {
    var valid = field.ok(field.el);
    field.el.setAttribute('aria-invalid', String(!valid));
    field.error.hidden = valid;
    return valid;
  }

  // once a field has been flagged, re-check it as the visitor fixes it
  fields.forEach(function (field) {
    field.el.addEventListener(field.el.type === 'checkbox' ? 'change' : 'input', function () {
      if (field.el.hasAttribute('aria-invalid')) check(field);
    });
  });

  function show(text, isError) {
    status.textContent = text;
    status.classList.toggle('is-error', isError);
    status.hidden = false;
  }

  function showError() {
    show('The message could not be sent. Please try again, or write to ', true);
    var link = document.createElement('a');
    link.href = 'mailto:sales@ecoes.eu';
    link.textContent = 'sales@ecoes.eu';
    link.setAttribute('translate', 'no');
    status.appendChild(link);
    status.appendChild(document.createTextNode('.'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!check(field) && !firstInvalid) firstInvalid = field.el;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    if (form.querySelector('#f-hp').value) return;   // filled in by a bot

    form.querySelector('input[name="_subject"]').value = 'ECOES website: ' + topic.value;
    button.disabled = true;
    buttonLabel.textContent = 'Sending…';
    status.hidden = true;

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });

    fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (String(result.success) !== 'true') throw new Error(result.message || 'not sent');
        form.reset();
        fields.forEach(function (field) { field.el.removeAttribute('aria-invalid'); });
        show(SENT, false);
      })
      .catch(function (err) {
        if (window.console) console.warn('Contact form:', err);
        showError();
      })
      .then(function () {
        button.disabled = false;
        buttonLabel.textContent = 'Send';
      });
  });
})();
