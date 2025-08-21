(function(){
  if (document.querySelector('.security-badge')) return;
  // Styles
  const style = document.createElement('style');
  style.textContent = `
  .security-badge{position:fixed;bottom:18px;right:18px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:9999px;background:var(--bg-primary,#0b1220);border:1px solid var(--border-light,#374151);box-shadow:0 1px 3px rgba(0,0,0,.2);color:var(--text-primary,#e5e7eb);z-index:200;cursor:pointer;user-select:none;transition:transform .2s ease;backdrop-filter:saturate(120%) blur(6px);animation:sbPulse 4s ease-in-out infinite}
  .security-badge:hover{transform:translateY(-1px)}
  .security-badge .icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,122,198,.35),rgba(106,167,255,.25))}
  .security-badge .icon i{background-image:linear-gradient(90deg,var(--pink,#ff7ac6),var(--blue,#6aa7ff));-webkit-background-clip:text;background-clip:text;color:transparent}
  .security-badge .label{font-weight:700;font-size:13px;background-image:linear-gradient(90deg,var(--pink,#ff7ac6),var(--blue,#6aa7ff));-webkit-background-clip:text;background-clip:text;color:transparent}
  @keyframes sbPulse{0%,100%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 10px rgba(255,122,198,.35),0 0 18px rgba(106,167,255,.35)}50%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 16px rgba(255,122,198,.55),0 0 28px rgba(106,167,255,.55)}}`;
  document.head.appendChild(style);

  // Badge
  const badge = document.createElement('div');
  badge.className = 'security-badge';
  badge.id = 'securityBadge';
  badge.title = 'Security Settings';
  badge.innerHTML = '<div class="icon"><i class="fas fa-shield-alt"></i></div><div class="label">Protected</div>';
  badge.addEventListener('click', () => {
    const settings = document.getElementById('settingsSection');
    if (settings) {
      settings.style.display = 'block';
      settings.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.href = '/Settings.html#security';
    }
  });
  const append = () => { if (!document.querySelector('.security-badge')) document.body.appendChild(badge); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', append); else append();
})();

(function(){
  if (document.querySelector('.security-badge')) return;
  const style = document.createElement('style');
  style.textContent = `
  .security-badge{position:fixed;bottom:18px;right:18px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:9999px;background:var(--bg-primary,#0b1220);border:1px solid var(--border-light,#374151);box-shadow:0 1px 3px rgba(0,0,0,.2);color:var(--text-primary,#e5e7eb);z-index:200;cursor:pointer;user-select:none;transition:transform .2s ease;backdrop-filter:saturate(120%) blur(6px);animation:badgePulse 4s ease-in-out infinite}
  .security-badge:hover{transform:translateY(-1px)}
  .security-badge .icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,122,198,.35),rgba(106,167,255,.25))}
  .security-badge .icon i{background-image:linear-gradient(90deg,var(--pink,#ff7ac6),var(--blue,#6aa7ff));-webkit-background-clip:text;background-clip:text;color:transparent}
  .security-badge .label{font-weight:700;font-size:13px;background-image:linear-gradient(90deg,var(--pink,#ff7ac6),var(--blue,#6aa7ff));-webkit-background-clip:text;background-clip:text;color:transparent}
  @keyframes badgePulse{0%,100%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 10px rgba(255,122,198,.35),0 0 18px rgba(106,167,255,.35)}50%{box-shadow:0 1px 3px rgba(0,0,0,.2),0 0 16px rgba(255,122,198,.55),0 0 28px rgba(106,167,255,.55)}}`;
  document.head.appendChild(style);
  const badge = document.createElement('div');
  badge.className = 'security-badge';
  badge.id = 'securityBadge';
  badge.title = 'Security Settings';
  badge.innerHTML = '<div class="icon"><i class="fas fa-shield-alt"></i></div><div class="label">Protected</div>';
  badge.addEventListener('click', () => {
    const settings = document.getElementById('settingsSection');
    if (settings) {
      settings.style.display = 'block';
      settings.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.href = '/Settings.html#security';
  });
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(badge));
})();
