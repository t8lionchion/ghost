// 將所有 window.addEventListener('unload', fn) 改綁到 'pagehide'
(function () {
  try {
    const origAdd = window.addEventListener;
    window.addEventListener = function (type, listener, options) {
      if (type === 'unload') {
        return origAdd.call(this, 'pagehide', listener, options);
      }
      return origAdd.call(this, type, listener, options);
    };
  } catch (e) {
    // 靜默失敗即可
  }
})();
