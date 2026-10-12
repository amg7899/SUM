// Contact form: picks the subject from ?topic=, checks the required fields next to them, and
// sends the message by e-mail through FormSubmit (to sales@ecoes.eu, copy to bulfire@ecoes.eu).
// Without JavaScript the form still posts to FormSubmit, which then returns here with ?sent=1.
// If sending fails, the message says why (e.g. the form still waits for FormSubmit's one-time
// activation) and links to sales@ecoes.eu with everything the visitor typed already filled in.
// Texts follow the page language: data-lang on the form ("en" or "bg").
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  var TO = 'sales@ecoes.eu';
  var TEXT = {
    en: {
      sent: 'Thank you! Your message has been sent. We will contact you soon.',
      sending: 'Sending…',
      send: 'Send',
      notActive: 'The message was not sent because the contact form has not been activated yet. Please send it by e-mail to ',
      failed: 'The message could not be sent. Please try again later, or send it by e-mail to ',
      filledIn: ' (the link opens your e-mail program with your message filled in).',
      detail: 'Details: '
    },
    bg: {
      sent: 'Благодарим ви! Съобщението е изпратено. Ще се свържем с вас скоро.',
      sending: 'Изпращане…',
      send: 'Изпрати',
      notActive: 'Съобщението не беше изпратено, защото формата за контакт все още не е активирана. Моля, изпратете го по имейл до ',
      failed: 'Съобщението не можа да бъде изпратено. Моля, опитайте отново по-късно или го изпратете по имейл до ',
      filledIn: ' (връзката отваря вашата имейл програма с попълнено съобщение).',
      detail: 'Подробности: '
    }
  };
  var T = TEXT[form.getAttribute('data-lang')] || TEXT.en;

  var status = form.querySelector('.form-status');
  var button = form.querySelector('button[type="submit"]');
  var buttonLabel = button.querySelector('.btn-label');
  var topic = form.querySelector('#f-topic');
  var subject = form.querySelector('input[name="_subject"]');
  var params = new URLSearchParams(window.location.search);

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
  if (params.get('sent') === '1') show(T.sent, false);

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

  // a mailto link to sales@ecoes.eu (copy to bulfire@ecoes.eu) with the visitor's entries filled in
  function mailto() {
    var lines = [];
    ['#f-name', '#f-company', '#f-email', '#f-phone', '#f-country', '#f-topic'].forEach(function (id) {
      var el = form.querySelector(id);
      var label = form.querySelector('label[for="' + el.id + '"]');
      if (el.value.trim()) lines.push((label ? label.textContent.replace('*', '').trim() : el.name) + ': ' + el.value.trim());
    });
    var cc = form.querySelector('input[name="_cc"]');
    return 'mailto:' + TO +
      '?cc=' + encodeURIComponent(cc ? cc.value : '') +
      '&subject=' + encodeURIComponent(subject.value) +
      '&body=' + encodeURIComponent(lines.join('\r\n') + '\r\n\r\n' + form.querySelector('#f-message').value.trim());
  }

  function showError(reason) {
    var notActive = /activat/i.test(reason);
    show(notActive ? T.notActive : T.failed, true);
    var link = document.createElement('a');
    link.href = mailto();
    link.textContent = TO;
    link.setAttribute('translate', 'no');
    status.appendChild(link);
    status.appendChild(document.createTextNode(T.filledIn));
    if (!notActive && reason) {
      var detail = document.createElement('small');
      detail.className = 'form-detail';
      detail.textContent = T.detail + reason;
      status.appendChild(detail);
    }
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

    subject.value = 'ECOES website: ' + topic.value;
    button.disabled = true;
    buttonLabel.textContent = T.sending;
    status.hidden = true;

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });

    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, 25000);

    fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        return response.json().catch(function () { return { success: false, message: 'HTTP ' + response.status }; });
      })
      .then(function (result) {
        // FormSubmit answers {success: "true"} or {success: "false", message: "..."}
        if (String(result.success) !== 'true') throw new Error(result.message || 'not sent');
        form.reset();
        fields.forEach(function (field) { field.el.removeAttribute('aria-invalid'); });
        show(T.sent, false);
      })
      .catch(function (err) {
        if (window.console) console.warn('Contact form:', err);
        showError(err && err.name === 'AbortError' ? 'timeout' : String(err && err.message || err));
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        button.disabled = false;
        buttonLabel.textContent = T.send;
      });
  });
})();
