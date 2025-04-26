// ==UserScript==
// @name         No More YouTube Shorts (Toggle Button)
// @version      1.3
// @description  Toggle removal of YouTube Shorts content
// @match        https://*.youtube.com/*
// @grant        none
// @downloadURL
// @updateURL 
// ==/UserScript==

(() => {
  const selectors = [
    ['a[title="Shorts"]', 'ytd-guide-entry-renderer'],
    ['a[title="Shorts"]', 'ytd-mini-guide-entry-renderer'],
    ['a[href^="/shorts/"]', 'ytd-video-renderer'],
    ['ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]', 'ytd-grid-video-renderer'],
    ['ytd-rich-grid-slim-media[is-short]', 'ytd-rich-shelf-renderer'],
    ['yt-horizontal-list-renderer.style-scope.ytd-reel-shelf-renderer', 'ytd-reel-shelf-renderer']
  ];

  let shortsEnabled = localStorage.getItem("shorts-block-enabled") !== "false";

  const removeShorts = () => {
    if (!shortsEnabled) return;

    selectors.forEach(([childSel, containerSel]) => {
      document.querySelectorAll(childSel).forEach((el) => {
        const parent = el.closest(containerSel);
        if (parent) parent.remove();
      });
    });

    // Eğer kullanıcı shorts sayfasına gelmişse, yönlendirme yapıyoruz
    if (location.pathname.startsWith("/shorts/")) {
      location.replace(location.href.replace("/shorts/", "/watch?v="));
    }
  };

  // MutationObserver'ı optimize et
  const observerCallback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        removeShorts(); // Sadece eklenen node'lar üzerinde işlem yap
      }
    });
  };

  const mutationObserver = new MutationObserver(observerCallback);
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  // --- Toggle Butonu Oluşturma ---
  const createToggleButton = () => {
    // Buton zaten varsa, yeniden eklemiyoruz
    if (document.getElementById("shorts-toggle-btn")) return;

    const container = document.querySelector("ytd-masthead #center");
    if (!container) return;

    const btn = document.createElement("button");
    btn.id = "shorts-toggle-btn";
    btn.textContent = shortsEnabled ? "Shorts: HIDDEN" : "Shorts: VISIBLE";
    btn.style = `
      margin-left: 10px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: bold;
      background: ${shortsEnabled ? "#cc0000" : "#555"};
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    `;

    btn.onclick = () => {
      shortsEnabled = !shortsEnabled;
      localStorage.setItem("shorts-block-enabled", shortsEnabled);
      btn.textContent = shortsEnabled ? "Shorts: HIDDEN" : "Shorts: VISIBLE";
      btn.style.background = shortsEnabled ? "#cc0000" : "#555";
      btn.style.fontWeight = "bold";
      removeShorts(); // Butona tıklandığında içeriği güncelle
    };

    container.prepend(btn); // Butonu başlığa ekliyoruz
  };

  const initButtonObserver = () => {
    const mastheadObserver = new MutationObserver(createToggleButton);
    mastheadObserver.observe(document.body, { childList: true, subtree: true });
    createToggleButton();
  };

  initButtonObserver();
})();
