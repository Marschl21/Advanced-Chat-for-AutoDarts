/**
 * Autodarts Persistent Chat – v9
 *
 * Storage is keyed by the UUID from the current URL:
 *   /lobbies/<uuid>  and  /matches/<uuid>  → share the same history
 *   Navigating to a different UUID → fresh empty history
 */

(function () {
  'use strict';

  const MAX_MESSAGES = 500;
  const KEY_PREFIX   = 'adpc_v9_';

  let history    = [];
  let currentId  = null;   // UUID of the active lobby/match
  let wsHooked   = false;

  /* ── Extract UUID from URL ── */
  function uuidFromUrl(url) {
    const m = (url || location.href).match(/\/(lobbies|matches)\/([0-9a-f-]{36})/i);
    return m ? m[2] : null;
  }

  function storageKey(id) {
    return KEY_PREFIX + (id || 'global');
  }

  /* ── Storage ── */
  function load(id) {
    currentId = id;
    try { history = JSON.parse(localStorage.getItem(storageKey(id)) || '[]'); }
    catch { history = []; }
  }

  function save() {
    if (history.length > MAX_MESSAGES) history = history.slice(-MAX_MESSAGES);
    try { localStorage.setItem(storageKey(currentId), JSON.stringify(history)); } catch {}
  }

  /* ── Add ── */
  function add(user, text, isoTime) {
    text = (text || '').trim();
    if (!text || text.length > 400) return;
    const last = history[history.length - 1];
    if (last && last.user === user && last.text === text && (Date.now() - last.ts) < 2000) return;
    let time;
    try { time = isoTime ? new Date(isoTime).toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' }) : ts(); }
    catch { time = ts(); }
    history.push({ user: user || '', text, time, ts: Date.now() });
    save();
    refresh();
  }

  function ts() {
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  /* ── WebSocket hook ── */
  function hookWS() {
    if (wsHooked || typeof WebSocket === 'undefined') return;
    wsHooked = true;
    const Orig = WebSocket;
    window.WebSocket = function (...args) {
      const ws = new Orig(...args);
      ws.addEventListener('message', ev => {
        try { onMsg(JSON.parse(ev.data)); } catch {}
      });
      return ws;
    };
    Object.setPrototypeOf(window.WebSocket, Orig);
    window.WebSocket.prototype = Orig.prototype;
  }

  function onMsg(obj) {
    if (!obj || typeof obj !== 'object') return;
    if ((obj.channel || '').includes('chat')) {
      const d    = obj.data || {};
      const text = d.message || d.text || d.msg || '';
      let user   = '';
      if (d.author && typeof d.author === 'object') {
        user = d.author.name || d.author.login || d.author.username ||
               d.author.displayName || d.author.display_name || d.author.nickname || '';
      } else if (typeof d.author === 'string') {
        user = d.author;
      }
      if (text) { add(user, text, d.timestamp); return; }
    }
    walk(obj, 0);
  }

  function walk(obj, d) {
    if (!obj || typeof obj !== 'object' || d > 5) return;
    const keys   = Array.isArray(obj) ? [] : Object.keys(obj);
    const msgKey = keys.find(k => ['message','text','msg','content'].includes(k.toLowerCase()));
    const usrKey = keys.find(k => ['user','username','name','author','from','login'].includes(k.toLowerCase()));
    if (msgKey && typeof obj[msgKey] === 'string' && obj[msgKey].trim()) {
      add(typeof obj[usrKey] === 'string' ? obj[usrKey] : '', obj[msgKey]);
      return;
    }
    (Array.isArray(obj) ? obj : Object.values(obj))
      .forEach(v => { if (v && typeof v === 'object') walk(v, d + 1); });
  }

  /* ── URL / navigation watcher ── */
  function watchUrl() {
    let lastHref = location.href;

    function checkUrl() {
      const href = location.href;
      if (href === lastHref) return;
      lastHref = href;

      const newId = uuidFromUrl(href);

      // Different UUID → reload history for new context
      if (newId !== currentId) {
        load(newId);
        // Remove injected block so it gets re-injected with fresh data
        const el = document.getElementById('adpc-root');
        if (el) el.remove();
      }
    }

    // Poll (handles SPA pushState/replaceState without needing to patch history API)
    setInterval(checkUrl, 300);

    // Also patch history API for instant detection
    ['pushState', 'replaceState'].forEach(fn => {
      const orig = history[fn];
      history[fn] = function (...args) {
        const r = orig.apply(this, args);
        checkUrl();
        return r;
      };
    });

    window.addEventListener('popstate', checkUrl);
  }

  /* ── Find insertion anchor ── */
  function findAnchor() {
    const knownTexts = ['Hello!', 'Good luck!', 'Good darts!', 'Well played!', 'Quick break', "I'm sorry"];
    for (const btn of document.querySelectorAll('button')) {
      const t = (btn.innerText || btn.textContent || '').trim();
      if (!knownTexts.some(k => t.startsWith(k))) continue;
      let el = btn.parentElement;
      for (let i = 0; i < 5; i++) {
        if (!el || el === document.body) break;
        if (el.querySelectorAll('button').length >= 3) return el;
        el = el.parentElement;
      }
    }
    return null;
  }

  /* ── Inject ── */
  function tryInject() {
    if (document.getElementById('adpc-root')) return;
    const anchor = findAnchor();
    if (!anchor) return;

    const block = document.createElement('div');
    block.id = 'adpc-root';
    block.innerHTML = `
      <div id="adpc-header">
        <div id="adpc-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat-Verlauf
        </div>
        <button id="adpc-clear">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          Leeren
        </button>
      </div>
      <div id="adpc-list"></div>
    `;

    ['click','mousedown','mouseup','keydown','keyup','input','change']
      .forEach(ev => block.addEventListener(ev, e => e.stopPropagation()));

    block.querySelector('#adpc-clear').addEventListener('click', e => {
      e.stopPropagation();
      history = []; save(); refresh();
    });

    anchor.parentNode.insertBefore(block, anchor);

    // Expand the native AutoDarts chat panel to 75vh so cards are visible without scrolling
    expandPanel(anchor);

    refresh();
  }

  /* ── Render ── */
  function refresh() {
    const list = document.getElementById('adpc-list');
    if (!list) return;

    if (history.length === 0) {
      list.innerHTML = '<p class="adpc-empty">Noch keine Nachrichten…</p>';
      return;
    }

    list.innerHTML = '';
    history.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'adpc-card';
      card.style.setProperty('--h', strHue(msg.user));

      const head = document.createElement('div');
      head.className = 'adpc-card-head';

      const av = document.createElement('div');
      av.className = 'adpc-av';
      av.textContent = msg.user ? msg.user[0].toUpperCase() : '?';

      const name = document.createElement('span');
      name.className = 'adpc-name';
      name.textContent = msg.user || 'Unbekannt';

      const time = document.createElement('span');
      time.className = 'adpc-time';
      time.textContent = msg.time;

      head.appendChild(av);
      head.appendChild(name);
      head.appendChild(time);

      const body = document.createElement('div');
      body.className = 'adpc-body';
      body.textContent = msg.text;

      card.appendChild(head);
      card.appendChild(body);
      list.appendChild(card);
    });

    list.scrollTop = list.scrollHeight;
  }

  function strHue(str) {
    if (!str) return 210;
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
    return h % 360;
  }


  /* ── Expand the native chat panel to 75vh ── */
  function expandPanel(anchor) {
    let el = anchor.parentElement;
    for (let i = 0; i < 10; i++) {
      if (!el || el === document.body) break;
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if ((s.position === 'fixed' || s.position === 'sticky') &&
           r.bottom >= window.innerHeight - 20 &&
           r.width > window.innerWidth * 0.5) {
        el.style.setProperty('max-height', '75vh', 'important');
        el.style.setProperty('height', '75vh', 'important');
        el.style.setProperty('overflow-y', 'auto', 'important');
        const child = el.firstElementChild;
        if (child) {
          child.style.setProperty('max-height', '100%', 'important');
          child.style.setProperty('height', '100%', 'important');
          child.style.setProperty('overflow-y', 'auto', 'important');
        }
        break;
      }
      el = el.parentElement;
    }
  }

  /* ── Poll for panel ── */
  function poll() {
    setInterval(() => {
      if (!document.getElementById('adpc-root')) tryInject();
    }, 300);
  }

  /* ── Boot ── */
  hookWS();

  const start = () => {
    const id = uuidFromUrl();
    load(id);
    watchUrl();
    poll();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
