/* AMAN application form — enhancements layered on top of main.js.
   Loads after main.js (both deferred). Inert on any page without #schoolFormWrap.
   Adds: autosave/resume, mobile autofill hints, phone formatting, inline validation,
   scroll-to-first-error, empty totals state, "already enrolled?" note, confirmation summary. */
(function () {
  'use strict';
  var wrap = document.getElementById('schoolFormWrap');
  if (!wrap) return;
  document.body.classList.add('apply-page');

  var KEY = 'aman_apply_draft_v1';
  var TTL = 14 * 24 * 60 * 60 * 1000;               // drafts expire after 14 days
  // Never saved: honeypot, signature, agreements, and health/learning details.
  var NEVER = /^(hp_field|sig_|ag\d|consent_|h_|a_learning)/;
  var paused = false, timer = null;

  function $(id) { return document.getElementById(id); }
  function step() { return (typeof curStep !== 'undefined') ? curStep : 1; }
  function store(fn) { try { return fn(window.localStorage); } catch (e) { return null; } }

  /* ───────── 1. AUTOSAVE / RESUME ───────── */
  function snapshot() {
    var f = {}, st = {};
    wrap.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio' || el.readOnly || NEVER.test(el.id)) return;
      if (el.value) f[el.id] = el.value;
    });
    wrap.querySelectorAll('input[type=radio]:checked').forEach(function (r) {
      if (/^s\d+_status$/.test(r.name)) st[r.name] = r.value;
    });
    var ints = [].map.call(wrap.querySelectorAll('#interests input:checked'), function (c) { return c.value; });
    return { v: 1, ts: Date.now(), step: step(), n: wrap.querySelectorAll('.student-block').length, f: f, st: st, ints: ints };
  }
  function hasContent(d) { return d && (Object.keys(d.f).length || Object.keys(d.st).length || d.ints.length); }
  function loadDraft() {
    var raw = store(function (s) { return s.getItem(KEY); });
    if (!raw) return null;
    try {
      var d = JSON.parse(raw);
      if (!d || d.v !== 1 || Date.now() - d.ts > TTL || !hasContent(d)) { clearDraft(); return null; }
      return d;
    } catch (e) { clearDraft(); return null; }
  }
  function clearDraft() { store(function (s) { s.removeItem(KEY); }); }
  function save() {
    if (paused) return;
    var d = snapshot();
    if (!hasContent(d)) return;
    store(function (s) { s.setItem(KEY, JSON.stringify(d)); });
  }
  function queueSave() { clearTimeout(timer); timer = setTimeout(save, 500); }

  function restore(d) {
    while (wrap.querySelectorAll('.student-block').length < d.n) { _add(); tune(); }   // bypass the completeness gate while restoring
    Object.keys(d.f).forEach(function (id) {
      var el = $(id); if (!el) return;
      el.value = d.f[id];
      if (/_dob$/.test(id)) el.dispatchEvent(new Event('change', { bubbles: true }));   // recalculates age
    });
    Object.keys(d.st).forEach(function (name) {
      var r = wrap.querySelector('input[name="' + name + '"][value="' + d.st[name] + '"]');
      if (r) { r.checked = true; onStatusSelect(parseInt(name.slice(1), 10)); }
    });
    (d.ints || []).forEach(function (v) {
      var c = wrap.querySelector('#interests input[value="' + v + '"]');
      if (c) { c.checked = true; c.closest('.copt').classList.add('sel'); }
    });
    updateTotals();
    var s = Math.min(d.step || 1, 3);
    if (s > 1) showStep(s);
  }

  function ago(ts) {
    var m = Math.round((Date.now() - ts) / 60000);
    if (m < 2) return 'just now';
    if (m < 60) return m + ' minutes ago';
    var h = Math.round(m / 60);
    if (h < 36) return h + (h === 1 ? ' hour ago' : ' hours ago');
    var dd = Math.round(h / 24);
    return dd + ' days ago';
  }
  function showBanner(d) {
    var card = $('formCard'); if (!card) return;
    var b = document.createElement('div');
    b.className = 'draft-banner'; b.id = 'draftBanner'; b.setAttribute('role', 'region');
    b.innerHTML = '<strong>Welcome back</strong><p>You have an unfinished application saved on this device (last edited ' + ago(d.ts) +
      '). Health details and signatures are never saved, so you will re-enter those.</p>' +
      '<div class="db-btns"><button type="button" class="db-resume">Resume my application</button>' +
      '<button type="button" class="db-new">Start over</button></div>';
    card.insertBefore(b, card.firstChild);
    b.querySelector('.db-resume').onclick = function () { b.remove(); paused = false; restore(d); save(); };
    b.querySelector('.db-new').onclick = function () { b.remove(); clearDraft(); paused = false; };
  }

  /* ───────── 2. AUTOFILL HINTS, PHONE FORMAT, INLINE VALIDATION ───────── */
  var AUTO = {
    p_fname: 'given-name', p_mname: 'additional-name', p_lname: 'family-name',
    p_email: 'email', p_email2: 'email', p_phone: 'tel', p_street: 'address-line1',
    p_city: 'address-level2', p_state: 'address-level1', p_zip: 'postal-code',
    sig_fname: 'given-name', sig_lname: 'family-name'
  };
  function tune() {
    wrap.querySelectorAll('input,select,textarea').forEach(function (el) {
      if (!el.id || el.dataset.tuned) return;
      el.dataset.tuned = '1';
      if (AUTO[el.id]) el.setAttribute('autocomplete', AUTO[el.id]);
      else if (/^(s\d+_|ec_)/.test(el.id) && el.tagName !== 'SELECT') el.setAttribute('autocomplete', 'off'); // students & emergency contact are not the parent
      if (el.type === 'tel') el.setAttribute('inputmode', 'tel');
      if (el.type === 'email') el.setAttribute('inputmode', 'email');
      if (el.id === 'p_zip') el.setAttribute('inputmode', 'numeric');
      if (/(_fname|_mname|_lname|p_street|p_city|ec_relation)$/.test(el.id)) el.setAttribute('autocapitalize', 'words');
      if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') el.setAttribute('enterkeyhint', 'next');
    });
  }
  function fmtPhone(v) {
    if (v.charAt(0) === '+') return v;                         // international — leave as typed
    var d = v.replace(/\D/g, '');
    if (d.length > 10 && d.charAt(0) === '1') d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  wrap.addEventListener('input', function (e) {
    var el = e.target;
    if (el.type === 'tel' && !(e.inputType && e.inputType.indexOf('delete') === 0)) el.value = fmtPhone(el.value);
    if (el.classList && el.classList.contains('err') && el.value.trim() !== '' && el.id !== 'p_email' && el.id !== 'p_email2') {
      el.classList.remove('err');
      var er = $('e_' + el.id); if (er) er.classList.remove('show');
    }
    queueSave(); queueRefreshAdd();
  });
  wrap.addEventListener('change', function () { queueSave(); queueRefreshAdd(); });
  wrap.addEventListener('focusout', function (e) {
    var el = e.target;
    if (!el.id || !/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    var er = $('e_' + el.id); if (!er || /_age$/.test(el.id)) return;
    var val = el.value.trim(), ok;
    if (el.id === 'p_email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    else if (el.id === 'p_email2') ok = val !== '' && val === $('p_email').value.trim();
    else ok = val !== '';
    el.classList.toggle('err', !ok); er.classList.toggle('show', !ok);
  });

  function firstErrorIntoView(container) {
    var bad = container.querySelector('input.err,select.err,textarea.err');
    var target = bad || (container.querySelector('.ferr.show') && container.querySelector('.ferr.show').closest('.field')) || container.querySelector('.ferr.show');
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (bad && bad.focus) { try { bad.focus({ preventScroll: true }); } catch (e) { bad.focus(); } }
  }

  /* ───────── "Add Another Student" is locked until the current students are complete ───────── */
  var addBtn = wrap.querySelector('.add-more-btn');
  var gate = document.createElement('div');
  gate.className = 'add-gate'; gate.setAttribute('role', 'status');
  gate.textContent = 'Please fill in every required field (*) for your current student before adding another child.';
  var addRow = wrap.querySelector('.add-more-row');
  if (addRow) addRow.appendChild(gate);
  var addTimer = null;
  function refreshAdd() {
    var locked = !validateStudents(false);
    if (addBtn) { addBtn.classList.toggle('locked', locked); addBtn.setAttribute('aria-disabled', locked ? 'true' : 'false'); }
    if (!locked) gate.classList.remove('show');
  }
  function queueRefreshAdd() { clearTimeout(addTimer); addTimer = setTimeout(refreshAdd, 150); }

  /* ───────── wrap main.js functions (global function declarations) ───────── */
  var _next = window.nextStep;
  window.nextStep = function (s) {
    _next(s);
    if (step() === s) firstErrorIntoView($('step' + s));
    else queueSave();
  };
  var _prev = window.prevStep;
  window.prevStep = function (s) { _prev(s); queueSave(); };
  var _submit = window.submitForm;
  window.submitForm = function () { _submit(); firstErrorIntoView($('step4')); };
  var _add = window.addStudent;
  window.addStudent = function () {
    // A new student can only be added once every required field of the current students is filled.
    if (wrap.querySelectorAll('.student-block').length > 0 && !validateStudents(true)) {
      gate.classList.add('show', 'nudge');
      setTimeout(function () { gate.classList.remove('nudge'); }, 600);
      firstErrorIntoView($('studentsContainer'));
      return;
    }
    _add(); tune(); refreshAdd(); queueSave();
  };

  /* ───────── 3. TOTALS EMPTY STATE + "ALREADY ENROLLED?" NOTE ───────── */
  var note = document.createElement('div');
  note.className = 'update-note';
  note.innerHTML = '<strong>Already enrolled at AMAN and just updating your information?</strong> You do not need a new application &mdash; ' +
    '<a href="/update/">use the quick family update form</a>.';
  var sc = $('studentsContainer');
  if (sc && sc.parentNode) sc.parentNode.insertBefore(note, sc.nextSibling);

  var _ut = window.updateTotals;
  window.updateTotals = function () {
    _ut();
    var box = wrap.querySelector('.totals-box');
    var ts = $('totalStudents');
    if (box && ts) box.classList.toggle('empty', ts.textContent.trim() === '0');
    note.classList.toggle('show', !!wrap.querySelector('input[name$="_status"][value="Returning"]:checked'));
    refreshAdd(); queueSave();
  };

  var intro = $('step1') && $('step1').querySelector('.fs-sub');
  if (intro) {
    var an = document.createElement('div');
    an.className = 'autosave-note';
    an.innerHTML = '<span aria-hidden="true">🔒</span><span>Your progress saves on this device as you go, so you can come back later. Health details and signatures are never saved.</span>';
    intro.insertAdjacentElement('afterend', an);
  }

  /* ───────── 4. CONFIRMATION SCREEN ───────── */
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function val(id) { var e = $(id); return e ? e.value.trim() : ''; }
  function buildSummary() {
    var out = '<h4>Your application</h4><ul>';
    wrap.querySelectorAll('.student-block').forEach(function (p, i) {
      var n = i + 1, r = wrap.querySelector('input[name="s' + n + '_status"]:checked');
      var name = [val('s' + n + '_fname'), val('s' + n + '_lname')].join(' ').trim();
      if (name) out += '<li><strong>' + esc(name) + '</strong>' + (r ? ' &middot; ' + esc(r.value) + ' student' : '') + '</li>';
    });
    out += '</ul>';
    var parent = [val('p_fname'), val('p_lname')].join(' ').trim();
    if (parent) out += '<div>Parent / guardian: <strong>' + esc(parent) + '</strong></div>';
    if (val('p_email')) out += '<div>Contact: <strong>' + esc(val('p_email')) + '</strong>' + (val('p_phone') ? ' &middot; <strong>' + esc(val('p_phone')) + '</strong>' : '') + '</div>';
    return out;
  }
  var sw = $('successWrap');
  if (sw) {
    new MutationObserver(function () {
      if (!sw.classList.contains('show') || sw.dataset.done) return;
      sw.dataset.done = '1';
      clearDraft(); paused = true;
      var sum = $('sucSummary'); if (sum) sum.innerHTML = buildSummary();
      ['.prog-select-box', '#schoolIntro'].forEach(function (q) { var e = document.querySelector(q); if (e) e.style.display = 'none'; });
    }).observe(sw, { attributes: true, attributeFilter: ['class'] });
    var copy = $('sucCopy'), pr = $('sucPrint');
    if (copy) copy.onclick = function () {
      var ref = ($('suc-ref').textContent || '').replace(/^Reference #:\s*/, '');
      var done = function () { copy.textContent = 'Copied ✓'; setTimeout(function () { copy.textContent = 'Copy reference number'; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ref).then(done, done);
      else { var t = document.createElement('textarea'); t.value = ref; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
    };
    if (pr) pr.onclick = function () { window.print(); };
  }

  /* ───────── init (runs after main.js has created Student 1) ───────── */
  function init() {
    tune();
    window.updateTotals();            // sets the empty state immediately
    var d = loadDraft();
    if (d) { paused = true; showBanner(d); }
  }
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init);   // registered after main.js's own listener, so Student 1 already exists
})();
