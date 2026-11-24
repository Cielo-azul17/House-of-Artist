/* House of Artist — page behaviour (vanilla port of reference-js/).
 * Hooks into the markup via data-act / data-ref / data-i / data-cat and the
 * state classes in css/style.css (.nav-links.is-open, .hoa-loader.is-out,
 * .tl-step.is-on, [data-cursor]). Progressive: pages work without it. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var ref = function (name) { return document.querySelector('[data-ref="' + name + '"]'); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Set this to the form endpoint once the HOA team email is connected (Formspree, Web3Forms or similar).
   * While it is empty, enquiries are NOT sent; the thank-you message still shows. */
  var FORM_ENDPOINT = '';

  /* Small envelope illustration shown after a successful enquiry. */
  var THANKS_SVG = '<svg width="160" height="120" viewBox="0 0 160 120" fill="none" aria-hidden="true">' +
    '<rect x="22" y="36" width="116" height="70" rx="8" fill="#F4FBFD" stroke="#0B6E80" stroke-width="2"/>' +
    '<path d="M22 44 L80 82 L138 44" stroke="#0B6E80" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="124" cy="24" r="16" fill="#3FD0E6"/>' +
    '<path d="M117 24 l5 5 l9 -10" stroke="#0F1A1F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M14 18 l5 0 M16.5 15.5 l0 5" stroke="#3FD0E6" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M146 98 l4 0 M148 96 l0 4" stroke="#0B6E80" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';


  /* ---------- Loader (home only) ---------- */
  function initLoader() {
    var loader = $('.hoa-loader');
    if (!loader) return;
    var seen = false;
    try { seen = sessionStorage.getItem('hoa-intro-seen') === '1'; } catch (e) {}
    var timers = [];
    var finish = function () {
      timers.forEach(clearTimeout);
      loader.classList.add('is-out');
      timers.push(setTimeout(function () { loader.style.display = 'none'; }, 1200));
      try { sessionStorage.setItem('hoa-intro-seen', '1'); } catch (e) {}
    };
    if (seen || reduceMotion) { loader.style.display = 'none'; return; }
    timers.push(setTimeout(finish, 1850));
    var skip = $('[data-act="skip-intro"]', loader);
    if (skip) skip.addEventListener('click', finish);
  }

  /* ---------- Mobile nav drawer ---------- */
  function initNav() {
    var links = $('.nav-links');
    var toggles = $$('[data-act="menu-toggle"]');
    if (!links || !toggles.length) return;
    var set = function (open) {
      links.classList.toggle('is-open', open);
      toggles.forEach(function (t) { t.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    };
    toggles.forEach(function (t) { t.addEventListener('click', function () { set(!links.classList.contains('is-open')); }); });
    $$('[data-act="menu-close"]').forEach(function (t) { t.addEventListener('click', function () { set(false); }); });
    $$('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ---------- Custom cursor (pointer-fine only) ---------- */
  function initCursor() {
    var dot = ref('dotRef'), ring = ref('ringRef'), trailBox = ref('trailBoxRef');
    if (!finePointer || !dot || !ring) return;
    var trailEls = [];
    for (var i = 0; i < 10; i++) trailEls.push(ref('trailRef' + i));
    var root = null, client = null, snap = true, last = 0;
    var d = { x: 0, y: 0 }, pts = [];
    for (i = 0; i < 10; i++) pts.push({ x: 0, y: 0 });

    var toLocal = function () {
      if (!root || !client) return null;
      var r = root.getBoundingClientRect();
      var scale = root.offsetWidth ? r.width / root.offsetWidth : 1;
      return { x: (client.x - r.left) / scale, y: (client.y - r.top) / scale };
    };
    var tick = function (now) {
      var dt = last ? Math.min(now - last, 64) : 16.7;
      last = now;
      var t = toLocal();
      if (t) {
        var f = dt / 16.7;
        var kDot = 1 - Math.pow(1 - 0.42, f), kTrail = 1 - Math.pow(1 - 0.6, f);
        if (snap) {
          d.x = t.x; d.y = t.y;
          pts.forEach(function (p) { p.x = t.x; p.y = t.y; });
          snap = false;
        }
        d.x += (t.x - d.x) * kDot; d.y += (t.y - d.y) * kDot;
        dot.style.transform = 'translate3d(' + d.x + 'px,' + d.y + 'px,0)';
        var px = d.x, py = d.y;
        for (var j = 0; j < pts.length; j++) {
          var p = pts[j];
          p.x += (px - p.x) * kTrail; p.y += (py - p.y) * kTrail;
          if (trailEls[j]) trailEls[j].style.transform = 'translate3d(' + p.x + 'px,' + p.y + 'px,0)';
          px = p.x; py = p.y;
        }
      }
      requestAnimationFrame(tick);
    };
    document.addEventListener('pointermove', function (e) {
      var target = e.target;
      root = target.closest('.hoa') || document.querySelector('.hoa');
      if (!root) return;
      if (!client) snap = true;
      client = { x: e.clientX, y: e.clientY };
      root.setAttribute('data-cursor', 'on');
      var onField = target.closest('input, textarea, select');
      var onLink = target.closest('a, button, label');
      dot.style.opacity = onField ? '0' : '1';
      if (trailBox) trailBox.style.opacity = onField ? '0' : '1';
      var s = onLink ? 28 : 14;
      ring.style.width = s + 'px'; ring.style.height = s + 'px';
      ring.style.backgroundColor = onLink ? 'rgba(63,208,230,0.18)' : '#3FD0E6';
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      if (!e.relatedTarget && root) {
        dot.style.opacity = '0';
        if (trailBox) trailBox.style.opacity = '0';
        root.setAttribute('data-cursor', 'off');
        client = null;
      }
    });
    if (!reduceMotion) requestAnimationFrame(tick);
  }

  /* ---------- Scroll timeline (About → Our approach) ---------- */
  function initTimeline() {
    var wrap = ref('tlRef'), fill = ref('tlFillRef');
    if (!wrap || !fill) return;
    var steps = $$('.tl-step', wrap);
    if (!steps.length) return;
    var update = function () {
      var line = wrap.getBoundingClientRect();
      var mark = window.innerHeight * 0.62, last = -1;
      steps.forEach(function (el, i) {
        var r = el.getBoundingClientRect();
        var on = r.top + r.height / 2 <= mark;
        el.classList.toggle('is-on', on);
        if (on) last = i;
      });
      var top = line.top + 32;
      var end = last < 0 ? 0 : (steps[last].getBoundingClientRect().top + steps[last].getBoundingClientRect().height / 2) - top;
      var max = line.height - 64;
      fill.style.height = Math.max(0, Math.min(end, max)) + 'px';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    setTimeout(update, 60);
  }

  /* ---------- Work filters ---------- */
  function initFilters() {
    var buttons = $$('[data-act="filter"]');
    if (!buttons.length) return;
    var cards = $$('[data-cat]');
    var onStyle = buttons[0].style.cssText, offStyle = buttons[1] ? buttons[1].style.cssText : '';
    var apply = function (f) {
      buttons.forEach(function (b) {
        var on = b.getAttribute('data-filter') === f;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.style.cssText = on ? onStyle : offStyle;
      });
      cards.forEach(function (c) {
        c.style.display = (f === 'all' || c.getAttribute('data-cat') === f) ? '' : 'none';
      });
    };
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); }); });
  }

  /* ---------- Carousels (phone): arrows scroll one card ---------- */
  function initCarousels() {
    var pairs = [['svcRef', 'svc'], ['procRef', 'proc'], ['expRef', 'exp']];
    pairs.forEach(function (p) {
      var track = ref(p[0]);
      if (!track) return;
      var step = function (dir) {
        track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.75), behavior: reduceMotion ? 'auto' : 'smooth' });
      };
      var prev = $('[data-act="' + p[1] + '-prev"]'), next = $('[data-act="' + p[1] + '-next"]');
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });
    });
  }

  /* ---------- FAQ accordion (one open at a time) ---------- */
  function initFaq() {
    var toggles = $$('[data-act="faq-toggle"]');
    if (!toggles.length) return;
    var setOpen = function (btn, open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var panel = btn.parentElement && btn.parentElement.querySelector('p');
      if (panel) panel.style.display = open ? '' : 'none';
      var icon = btn.querySelector('svg path');
      if (icon) icon.setAttribute('d', open ? 'M5 12h14' : 'M12 5v14M5 12h14');
    };
    toggles.forEach(function (btn) {
      setOpen(btn, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        toggles.forEach(function (other) { setOpen(other, false); });
        setOpen(btn, open);
      });
    });
  }

  /* ---------- Contact form: role switch + validation ---------- */
  function initForm() {
    var form = $('.form-card');
    var perf = $('[data-act="role-performer"]'), org = $('[data-act="role-organizer"]');
    if (!form || !perf || !org) return;
    var send = $('[data-act="form-send"]');
    var heading = form.querySelector('h3');
    var sub = heading && heading.nextElementSibling;
    var fieldsWrap = form.querySelector('[style*="repeat(auto-fit"]');
    var messageWrap = $('#c-msg') && $('#c-msg').parentElement;
    var performerLink = $('#c-link') && $('#c-link').parentElement;
    var performerFields = fieldsWrap ? fieldsWrap.innerHTML : '';
    var label = 'display:flex;flex-direction:column;gap:8px';
    var lblStyle = 'font-size:13px;font-weight:500;color:#3E5259';
    var inStyle = 'min-height:48px;padding:0 16px;border-radius:8px;border:1px solid #D3E2E7;font-family:Montserrat,sans-serif;font-size:16px;color:#13232A;background:#FFFFFF';
    var orgFields = '' +
      '<div style="' + label + '"><label class="m-p14" for="c-name" style="' + lblStyle + '">Your name</label><input id="c-name" type="text" placeholder="Your name" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="c-email" style="' + lblStyle + '">Email</label><input id="c-email" type="email" placeholder="you@example.com" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="c-phone" style="' + lblStyle + '">Phone</label><input id="c-phone" type="tel" placeholder="+91" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="o-org" style="' + lblStyle + '">Agency or company</label><input id="o-org" type="text" placeholder="Agency or organisation" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="o-event" style="' + lblStyle + '">Project or event</label><input id="o-event" type="text" placeholder="What is the project?" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="o-date" style="' + lblStyle + '">Timeline</label><input id="o-date" type="text" placeholder="e.g. Q1 2027" style="' + inStyle + '"></div>' +
      '<div style="' + label + '"><label class="m-p14" for="o-city" style="' + lblStyle + '">City</label><input id="o-city" type="text" placeholder="City" style="' + inStyle + '"></div>';
    var setRole = function (role) {
      var isPerf = role === 'performer';
      perf.setAttribute('aria-pressed', isPerf ? 'true' : 'false');
      org.setAttribute('aria-pressed', isPerf ? 'false' : 'true');
      [perf, org].forEach(function (b) {
        var on = b.getAttribute('aria-pressed') === 'true';
        b.style.background = on ? '#13232A' : 'transparent';
        b.style.color = on ? '#FFFFFF' : '#13232A';
      });
      if (heading) heading.textContent = isPerf ? 'Join our team' : 'Work with us as an agency';
      if (sub) sub.textContent = isPerf ? 'Tell us about your skills, experience and the roles you’re interested in.' : 'Tell us about the event or campaign you need help with.';
      if (fieldsWrap) fieldsWrap.innerHTML = isPerf ? performerFields : orgFields;
      if (performerLink) performerLink.style.display = isPerf ? '' : 'none';
      if (messageWrap) messageWrap.querySelector('textarea').placeholder = isPerf ? 'Tell us a little about what you have in mind' : 'Tell us about the project: scope, dates and budget range';
    };
    perf.addEventListener('click', function () { setRole('performer'); });
    org.addEventListener('click', function () { setRole('organizer'); });
    setRole('organizer');
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(hp);

    var showThanks = function () {
      var kids = Array.prototype.slice.call(form.children).filter(function (c) { return c !== hp; });
      kids.forEach(function (c) { c.style.display = 'none'; });
      var box = document.createElement('div');
      box.id = 'form-thanks';
      box.setAttribute('role', 'status');
      box.style.cssText = 'display:flex;flex-direction:column;align-items:center;text-align:center;gap:18px;padding:24px 8px';
      box.innerHTML = THANKS_SVG +
        '<h3 style="margin:0;font-family:\'Playfair Display\',serif;font-weight:500;font-size:30px;color:#13232A">Thank you!</h3>' +
        '<p style="margin:0;max-width:420px;font-size:16px;line-height:1.7;color:#3E5259">We have received your enquiry. Our team will get back to you within 2 working days.</p>' +
        '<button type="button" id="form-again" style="min-height:44px;padding:0 22px;border-radius:999px;border:1px solid #0B6E80;background:transparent;color:#0B6E80;font:600 14px Montserrat,sans-serif;cursor:pointer">Send another enquiry</button>';
      form.appendChild(box);
      box.querySelector('#form-again').addEventListener('click', function () {
        box.remove();
        kids.forEach(function (c) { c.style.display = ''; });
      });
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (send) send.addEventListener('click', function () {
      var status = $('#form-status');
      if (!status) {
        status = document.createElement('p');
        status.id = 'form-status';
        status.setAttribute('role', 'status');
        status.style.cssText = 'margin:0;font-size:15px;line-height:1.6;color:#B3261E';
        send.parentElement.appendChild(status);
      }
      status.textContent = '';
      status.style.color = '#B3261E';

      // Honeypot: bots fill the hidden field; show the thank-you without sending.
      if (hp.value) { showThanks(); return; }

      var name = $('#c-name'), email = $('#c-email'), msg = $('#c-msg');
      var errs = [];
      if (!name || !name.value.trim()) errs.push('Please add your name.');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errs.push('Please add a valid email address.');
      if (!msg || msg.value.trim().length < 10) errs.push('Please tell us a little more about what you have in mind.');
      if (errs.length) { status.textContent = errs.join(' '); return; }

      var isOrg = org.getAttribute('aria-pressed') === 'true';
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var payload = {
        enquiry_type: isOrg ? 'Need services' : 'Join team',
        name: name.value.trim(),
        email: email.value.trim(),
        phone: v('c-phone'),
        message: msg.value.trim(),
        submitted_at: new Date().toISOString()
      };
      if (isOrg) {
        payload.agency = v('o-org');
        payload.project = v('o-event');
        payload.timeline = v('o-date');
        payload.city = v('o-city');
      } else {
        payload.role_or_skill = v('c-craft');
        payload.portfolio_link = v('c-link');
      }

      // No endpoint yet: nothing is sent. Set FORM_ENDPOINT at the top of this file.
      if (!FORM_ENDPOINT) { showThanks(); return; }

      send.disabled = true;
      status.style.color = '#0B6E80';
      status.textContent = 'Sending…';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        send.disabled = false;
        status.textContent = '';
        showThanks();
      }).catch(function () {
        send.disabled = false;
        status.style.color = '#B3261E';
        status.textContent = 'Sorry, something went wrong. Please try again or email us directly.';
      });
    });
  }

  /* ---------- Video player lightbox ---------- */
  var SHOWREEL = { title: 'House of Artist showreel', meta: '3 min · Music, events and film', source: 'Vimeo', video: '' };
  var player = null;

  function titleOf(card) {
    if (!card) return { title: '', meta: '' };
    var pf = $$('[style*="Playfair"]', card).map(function (n) { return n.textContent.trim(); }).filter(Boolean);
    var sm = $$('span,p', card).map(function (n) { return n.textContent.trim(); }).filter(function (t) { return t && t.length < 60; });
    var first = pf[0] || '';
    var other = sm.filter(function (t) { return t !== first; });
    return { title: first, meta: pf.length > 1 ? pf[1] : (other[0] || '') };
  }

  function buildPlayer() {
    var el = document.createElement('div');
    el.className = 'hoa-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Video player');
    el.tabIndex = -1;
    el.style.cssText = 'position:fixed;inset:0;z-index:150;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(11,20,24,0.42)';
    el.innerHTML =
      '<div class="hoa-modal-body" style="position:relative;width:min(100%,1000px);display:flex;flex-direction:column;gap:16px;background:#FFFFFF;border-radius:14px;padding:16px;box-shadow:0 30px 80px rgba(15,26,31,0.25)">' +
      '<button type="button" data-p="close" aria-label="Close player" style="position:absolute;top:24px;right:24px;z-index:2;width:40px;height:40px;border-radius:50%;border:none;background:rgba(19,35,42,0.88);color:#FFFFFF;font-size:22px;line-height:1;cursor:pointer">×</button>' +
      '<div data-p="frame" style="position:relative;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:radial-gradient(circle at 50% 40%,#24434F 0%,#0F1A1F 78%);display:flex;align-items:center;justify-content:center">' +
      '<span data-p="soon" style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#9FB3BA">Video coming soon</span></div>' +
      '<div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 24px">' +
      '<div style="display:flex;flex-direction:column;gap:6px;min-width:0">' +
      '<span data-p="title" style="font-family:Playfair Display,serif;font-size:clamp(22px,2.4vw,30px);line-height:1.15;color:#13232A"></span>' +
      '<span data-p="meta" style="font-size:14px;color:#4A5D64"></span></div>' +
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<button type="button" data-p="mute" aria-label="Mute video" aria-pressed="false" style="min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #0B6E80;background:transparent;color:#0B6E80;font:600 14px Montserrat,sans-serif;cursor:pointer">Sound on</button>' +
      '<span data-p="counter" style="font-size:14px;font-weight:600;letter-spacing:0.2em;color:#0B6E80"></span></div></div>' +
      '<div data-p="dots" aria-hidden="true" style="display:flex;gap:6px"></div>' +
      '</div>' +
            '<button type="button" data-p="prev" aria-label="Previous video" style="position:absolute;left:8px;top:40%;width:44px;height:44px;border-radius:50%;border:none;background:rgba(19,35,42,0.85);color:#FFFFFF;font-size:20px;cursor:pointer">‹</button>' +
      '<button type="button" data-p="next" aria-label="Next video" style="position:absolute;right:8px;top:40%;width:44px;height:44px;border-radius:50%;border:none;background:rgba(19,35,42,0.85);color:#FFFFFF;font-size:20px;cursor:pointer">›</button>';
    document.body.appendChild(el);
    var q = function (k) { return el.querySelector('[data-p="' + k + '"]'); };
    var state = { list: [], i: 0, muted: false, trigger: null, touchX: null };

    var render = function () {
      var n = state.list.length, cur = state.list[state.i] || {};
      var frame = q('frame');
      var old = frame.querySelector('iframe');
      if (old) old.remove();
      var soon = q('soon');
      if (cur.video && cur.source === 'Vimeo') {
        soon.style.display = 'none';
        var vf = document.createElement('iframe');
        vf.src = 'https://player.vimeo.com/video/' + encodeURIComponent(cur.video) + '?autoplay=1&muted=' + (state.muted ? 1 : 0);
        vf.allow = 'autoplay; fullscreen; picture-in-picture';
        vf.setAttribute('title', cur.title || 'Video');
        vf.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
        frame.appendChild(vf);
      } else if (cur.video) {
        soon.style.display = 'none';
        var yf = document.createElement('iframe');
        yf.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(cur.video) + '?autoplay=1&mute=' + (state.muted ? 1 : 0) + '&playsinline=1';
        yf.allow = 'autoplay; encrypted-media; picture-in-picture';
        yf.setAttribute('title', cur.title || 'Video');
        yf.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';
        frame.appendChild(yf);
      } else {
        soon.style.display = '';
      }
      q('title').textContent = cur.title || '';
      q('meta').textContent = cur.meta || '';
      q('counter').textContent = n > 1 ? (String(state.i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0')) : '';
      q('mute').textContent = state.muted ? 'Sound off' : 'Sound on';
      q('mute').setAttribute('aria-pressed', state.muted ? 'true' : 'false');
      var dots = q('dots');
      dots.innerHTML = '';
      if (n > 1) state.list.forEach(function (_, j) {
        var s = document.createElement('span');
        s.style.cssText = 'flex:1 1 0;height:3px;border-radius:2px;background:' + (j === state.i ? '#0B6E80' : 'rgba(19,35,42,0.12)');
        dots.appendChild(s);
      });
      q('prev').style.display = n > 1 ? '' : 'none';
      q('next').style.display = n > 1 ? '' : 'none';
    };
    var step = function (d) {
      var n = state.list.length;
      if (n < 2) return;
      state.i = (state.i + d + n) % n;
      render();
    };
    var close = function () {
      el.style.display = 'none';
      document.documentElement.style.overflow = '';
      var frame = q('frame'), f = frame.querySelector('iframe');
      if (f) f.remove();
      if (state.trigger && state.trigger.focus) state.trigger.focus();
    };
    state.open = function (list, i, trigger) {
      state.list = list; state.i = i; state.trigger = trigger;
      el.style.display = 'flex';
      document.documentElement.style.overflow = 'hidden';
      render();
      el.focus();
    };
    q('close').addEventListener('click', close);
    q('prev').addEventListener('click', function () { step(-1); });
    q('next').addEventListener('click', function () { step(1); });
    q('mute').addEventListener('click', function () { state.muted = !state.muted; render(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'm' || e.key === 'M') { state.muted = !state.muted; render(); }
    });
    el.addEventListener('touchstart', function (e) { state.touchX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (state.touchX === null) return;
      var dx = e.changedTouches[0].clientX - state.touchX;
      state.touchX = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
    return state;
  }

  function initPlayer() {
    var triggers = $$('[data-act^="play-"]');
    if (!triggers.length) return;
    player = buildPlayer();
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-act');
        var card = btn.closest('article') || btn.closest('[data-i]');
        var list, i = 0;
        if (act === 'play-showreel') {
          list = [{ title: SHOWREEL.title, meta: SHOWREEL.meta, source: SHOWREEL.source, video: btn.getAttribute('data-video') || '' }];
        } else {
          var scopeSel = act === 'play-work' ? '[data-act="play-work"]' : act === 'play-assoc' ? '[data-act="play-assoc"]' : '[data-act="play-highlight"]';
          var all = $$(scopeSel).filter(function (b) {
            var c = b.closest('article');
            return !c || c.style.display !== 'none';
          });
          list = all.map(function (b) {
            var c = b.closest('article');
            var t = titleOf(c);
            return { title: t.title, meta: t.meta, source: b.getAttribute('data-source') || 'YouTube', video: b.getAttribute('data-video') || '' };
          });
          i = Math.max(0, all.indexOf(btn));
        }
        player.open(list, i, btn);
      });
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = $('[aria-label="Back to top"]');
    if (!btn) return;
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    var update = function () {
      var show = (window.pageYOffset || document.documentElement.scrollTop) > 600;
      btn.style.opacity = show ? '1' : '0';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* Videos / Screengrabs / BTS view tabs */
  function initViewTabs() {
    var bars = $$("[data-view-tabs]");
    if (!bars.length) return;
    var panels = $$(".view-panel");
    bars.forEach(function (bar) {
      var btns = $$("button", bar);
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          var i = b.getAttribute("data-tab");
          btns.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
          panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== i; });
        });
      });
    });
  }

  function boot() {
    initViewTabs();
    initLoader(); initNav(); initCursor(); initTimeline(); initFilters();
    initCarousels(); initFaq(); initForm(); initPlayer(); initBackToTop();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
