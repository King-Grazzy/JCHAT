(function() {
  try {
    var path = (window.location.pathname || '').toLowerCase();

    // Always redirect to Offline.html when there is no internet, except when already there
    var ORIGIN = (window.location && window.location.origin) ? window.location.origin : '';
    if (!navigator.onLine && !/\boffline\.html$/.test(path)) {
      window.location.replace(ORIGIN + '/offline.html');
      return;
    }

    // Pages that should not be blocked by auth check (but still respect offline redirect above)
    var AUTH_ALLOWLIST = [
      'login.html',
      'offline.html',
      'index.html',
      'auth/google/callback.html',
      'auth/github/callback.html',
      'auth/google/welcome.html',
      'auth/github/welcome.html',
      'google-login-test.html'
    ];

    var isAllowlisted = AUTH_ALLOWLIST.some(function(p) { return path.endsWith('/' + p) || path === '/' + p || path.endsWith(p); });

    function hasAuthenticatedUser() {
      try {
        var keys = Object.keys(localStorage || {});
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          if (k.indexOf('firebase:authUser:') === 0) {
            var raw = localStorage.getItem(k);
            if (!raw) continue;
            try {
              var data = JSON.parse(raw);
              if (data && data.uid && data.stsTokenManager && data.stsTokenManager.accessToken) {
                if (data.isAnonymous) continue; // treat anonymous as unauthorized
                return true;
              }
            } catch (_) {}
          }
        }
      } catch (e) {}
      return false;
    }

    // If page is not allowlisted, enforce authentication
    if (!isAllowlisted) {
      if (!hasAuthenticatedUser()) {
        // If not authenticated, send to Login.html
        window.location.replace(ORIGIN + '/Login.html');
        return;
      }
    }

    // Live listeners to react to connectivity changes
    window.addEventListener('offline', function() {
      var p = (window.location.pathname || '').toLowerCase();
      if (!/\boffline\.html$/.test(p)) {
        window.location.replace(ORIGIN + '/offline.html');
      }
    });
  } catch (err) {
    // Fail-closed: if anything goes wrong, prefer redirecting to Login (unless already offline page)
    try {
      var p2 = (window.location.pathname || '').toLowerCase();
      if (!/\boffline\.html$/.test(p2)) {
        window.location.replace(ORIGIN + '/Login.html');
      }
    } catch (_) {}
  }
})();
