(function(){
  const style = document.createElement('style');
  style.textContent = `
  .ws-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);z-index:9999}
  .ws-card{width:min(520px,92vw);max-height:90vh;overflow:auto;background:var(--bg-primary,#0b1220);border:1px solid var(--border-light,#374151);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
  .ws-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--border-light,#374151)}
  .ws-hd h3{margin:0;font-size:18px;font-weight:800;background-image:linear-gradient(90deg,#ff7ac6,#6aa7ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .ws-bd{padding:16px 18px}
  .ws-ft{display:flex;gap:10px;padding:12px 18px;border-top:1px solid var(--border-light,#374151)}
  .ws-btn{flex:1;padding:10px 12px;border-radius:10px;border:1px solid var(--border-light,#374151);background:var(--bg-tertiary,#111827);color:var(--text-primary,#e5e7eb);cursor:pointer}
  .ws-btn.primary{background-image:linear-gradient(90deg,#ff7ac6,#6aa7ff);border:0;color:#0b1220;font-weight:800}
  .ws-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px dashed var(--border-light,#374151)}
  .ws-row:last-child{border-bottom:none}
  .ws-ok{color:#22c55e}
  .ws-warn{color:#eab308}
  .ws-fail{color:#ef4444}
  .security-badge{position:fixed;bottom:18px;right:18px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:9999px;background:var(--bg-primary,#0b1220);border:1px solid var(--border-light,#374151);box-shadow:0 1px 3px rgba(0,0,0,.2);color:var(--text-primary,#e5e7eb);z-index:200;cursor:pointer;user-select:none;transition:transform .2s ease,opacity .15s ease;backdrop-filter:saturate(120%) blur(6px);animation:wsPulse 4s ease-in-out infinite}
  .security-badge.ws-ghost{opacity:.15;pointer-events:none}
  .security-badge:hover{transform:translateY(-1px)}
  .security-badge .icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,122,198,.35),rgba(106,167,255,.25))}
  .security-badge .icon i{background-image:linear-gradient(90deg,#ff7ac6,#6aa7ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .security-badge .label{font-weight:700;font-size:13px;background-image:linear-gradient(90deg,#ff7ac6,#6aa7ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  @keyframes wsPulse{0%,100%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 10px rgba(255,122,198,.35),0 0 18px rgba(106,167,255,.35)}50%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 16px rgba(255,122,198,.55),0 0 28px rgba(106,167,255,.55)}}
  `;
  document.head.appendChild(style);

  function el(tag, attrs, html){ const e=document.createElement(tag); if(attrs) Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v)); if(html!=null) e.innerHTML=html; return e; }

  // --- Smart avoid state ---
  let badgeEl = null;
  let ghostTimeoutId = null;
  let avoidFrameScheduled = false;
  let lastCorner = 'br'; // br, bl, tr, tl

  const CLICKABLE_SELECTOR = [
    'a[href]','button','input:not([type="hidden"])','select','textarea',
    '[role="button"]','[onclick]','[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function isClickable(elm){
    if (!elm || elm === document.body || elm === document.documentElement) return false;
    if (elm.matches && elm.matches(CLICKABLE_SELECTOR)) return true;
    // Traverse up a little for clickable wrappers
    let p = elm.parentElement, depth = 0;
    while (p && depth < 3){ if (p.matches && p.matches(CLICKABLE_SELECTOR)) return true; p = p.parentElement; depth++; }
    return false;
  }

  function getBadgeSize(){
    const w = badgeEl ? badgeEl.offsetWidth : 64;
    const h = badgeEl ? badgeEl.offsetHeight : 40;
    return { w, h };
  }

  function rectsIntersect(a, b){
    return !(b.left > a.right || b.right < a.left || b.top > a.bottom || b.bottom < a.top);
  }

  function getCornerRect(corner){
    const { w, h } = getBadgeSize();
    const m = 18; // margin
    if (corner === 'br') return { left: window.innerWidth - w - m, top: window.innerHeight - h - m, right: window.innerWidth - m, bottom: window.innerHeight - m };
    if (corner === 'bl') return { left: m, top: window.innerHeight - h - m, right: m + w, bottom: window.innerHeight - m };
    if (corner === 'tr') return { left: window.innerWidth - w - m, top: m, right: window.innerWidth - m, bottom: m + h };
    // tl
    return { left: m, top: m, right: m + w, bottom: m + h };
  }

  function overlapScoreAtCorner(corner){
    const testRect = getCornerRect(corner);
    let score = 0;
    const nodes = document.querySelectorAll(CLICKABLE_SELECTOR);
    for (let i = 0; i < nodes.length; i++){
      const n = nodes[i];
      if (!n.offsetParent && n !== document.body) continue; // skip invisible/out of flow
      const r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (rectsIntersect(testRect, r)) score++;
      if (score > 12) break; // early exit
    }
    return score;
  }

  function pickBestCorner(){
    const corners = ['br','bl','tr','tl'];
    let best = lastCorner, bestScore = Infinity;
    for (const c of corners){
      const s = overlapScoreAtCorner(c);
      if (s < bestScore){ bestScore = s; best = c; }
    }
    return best;
  }

  function applyCorner(corner){
    lastCorner = corner;
    if (!badgeEl) return;
    badgeEl.style.top = '';
    badgeEl.style.bottom = '';
    badgeEl.style.left = '';
    badgeEl.style.right = '';
    const m = '18px';
    if (corner === 'br'){ badgeEl.style.bottom = m; badgeEl.style.right = m; return; }
    if (corner === 'bl'){ badgeEl.style.bottom = m; badgeEl.style.left = m; return; }
    if (corner === 'tr'){ badgeEl.style.top = m; badgeEl.style.right = m; return; }
    badgeEl.style.top = m; badgeEl.style.left = m; // tl
  }

  function scheduleAvoid(){
    if (avoidFrameScheduled) return; avoidFrameScheduled = true;
    requestAnimationFrame(()=>{ avoidFrameScheduled = false; try { applyCorner(pickBestCorner()); } catch(e){} });
  }

  function setGhost(on){
    if (!badgeEl) return;
    if (on){
      badgeEl.classList.add('ws-ghost');
      if (ghostTimeoutId) clearTimeout(ghostTimeoutId);
      ghostTimeoutId = setTimeout(()=>{ badgeEl.classList.remove('ws-ghost'); }, 1200);
    } else {
      badgeEl.classList.remove('ws-ghost');
      if (ghostTimeoutId) { clearTimeout(ghostTimeoutId); ghostTimeoutId = null; }
    }
  }

  // Throttled pointer move to ghost when covering clickable
  let lastPtrTs = 0;
  function onPointerMove(ev){
    const now = performance.now(); if (now - lastPtrTs < 50) return; lastPtrTs = now;
    if (!badgeEl) return;
    const r = badgeEl.getBoundingClientRect();
    if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom){
      // Peek underlying element
      const prev = badgeEl.style.pointerEvents;
      badgeEl.style.pointerEvents = 'none';
      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      badgeEl.style.pointerEvents = prev || '';
      if (isClickable(under)) setGhost(true);
    }
  }

  function deviceChecks(){
    const https = location.protocol === 'https:';
    const secure = window.isSecureContext === true;
    const sw = 'serviceWorker' in navigator;
    const swActive = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
    const notif = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
    return { https, secure, sw, swActive, notif };
  }

  function renderModal(){
    if (document.getElementById('wsModal')) return;
    const modal = el('div', { id:'wsModal', class:'ws-modal', role:'dialog', 'aria-modal':'true' });
    const card = el('div', { class:'ws-card' });
    const hd = el('div', { class:'ws-hd' });
    hd.appendChild(el('h3', null, 'Security Center'));
    const close = el('button', { class:'ws-btn', style:'flex:0 0 auto;padding:6px 10px' }, '<i class="fas fa-times"></i>');
    close.addEventListener('click', ()=> modal.style.display='none');
    hd.appendChild(close);

    const bd = el('div', { class:'ws-bd' });
    const checks = deviceChecks();
    const items = [
      ['HTTPS Connection', checks.https],
      ['Secure Context', checks.secure],
      ['Service Worker', checks.swActive || checks.sw],
      ['Notifications API', checks.notif === 'granted' || checks.notif === 'default']
    ];
    items.forEach(([label, ok])=>{
      const row = el('div', { class:'ws-row' });
      row.appendChild(el('div', null, label));
      row.appendChild(el('div', { class: ok ? 'ws-ok' : 'ws-warn' }, ok ? '<i class="fas fa-check"></i>' : '<i class="fas fa-exclamation-triangle"></i>'));
      bd.appendChild(row);
    });
    const tips = el('div', { style:'margin-top:12px;font-size:13px;color:var(--text-secondary,#cbd5e1)'}, 'Your PIN and sensitive preferences are stored locally. Use a strong PIN and keep your device secure.');
    bd.appendChild(tips);

    const ft = el('div', { class:'ws-ft' });
    const goSecurity = el('button', { class:'ws-btn primary' }, 'Open Security Settings');
    goSecurity.addEventListener('click', ()=>{
      const settings = document.getElementById('settingsSection');
      if (settings){ settings.style.display='block'; settings.scrollIntoView({behavior:'smooth', block:'start'}); }
      modal.style.display='none';
    });
    const closeBtn = el('button', { class:'ws-btn' }, 'Close');
    closeBtn.addEventListener('click', ()=> modal.style.display='none');
    ft.appendChild(goSecurity); ft.appendChild(closeBtn);

    card.appendChild(hd); card.appendChild(bd); card.appendChild(ft);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function ensureBadge(){
    if (document.getElementById('securityBadge')) { badgeEl = document.getElementById('securityBadge'); return; }
    const badge = el('div', { id:'securityBadge', class:'security-badge', title:'Security Center' }, '<div class="icon"><i class="fas fa-shield-alt"></i></div><div class="label">Protected</div>');
    badge.addEventListener('click', ()=>{
      renderModal();
      const m = document.getElementById('wsModal'); if (m) m.style.display='flex';
    });
    document.body.appendChild(badge);
    badgeEl = badge;
  }

  const start = ()=>{
    renderModal();
    ensureBadge();
    // Position to a corner that avoids clickable elements
    scheduleAvoid();
    // Re-evaluate on resize/scroll/content changes
    window.addEventListener('resize', scheduleAvoid, { passive: true });
    document.addEventListener('scroll', scheduleAvoid, true);
    // Ghost pass-through when mouse pointer is over badge and clickable exists beneath
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    // Touch-driven visibility: hidden by default; show while user is actively swiping/scrolling
    if (badgeEl) badgeEl.style.display = 'none';
    const showBadge = ()=>{ if (badgeEl) badgeEl.style.display = 'flex'; };
    const hideBadge = ()=>{ if (badgeEl) badgeEl.style.display = 'none'; };
    let touchActive = false; let hideTimer = null;
    const onTouchStart = ()=>{ touchActive = true; showBadge(); if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } };
    const onTouchMove = ()=>{ if (!touchActive) showBadge(); };
    const onTouchEnd = ()=>{ touchActive = false; if (hideTimer) clearTimeout(hideTimer); hideTimer = setTimeout(hideBadge, 250); };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
