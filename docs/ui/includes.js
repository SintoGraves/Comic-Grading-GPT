/*-------------------------------------------------
 * ui/includes.js
 * Client-side HTML includes loader
 * Exposes: window.CGT_INCLUDES_READY (Promise)
 *-------------------------------------------------*/
(function () {
  "use strict";

  function loadIncludes() {
    const includeElements = Array.from(
      document.querySelectorAll("[include-html]")
    );

    // Load sequentially to keep DOM order predictable
    return includeElements.reduce((chain, el) => {
      return chain.then(async () => {
        const file = el.getAttribute("include-html");
        if (!file) return;

        try {
          const response = await fetch(file, { cache: "no-store" });
          if (!response.ok) throw new Error("Failed to fetch " + file);

          const content = await response.text();
          el.innerHTML = content;
          el.removeAttribute("include-html");
        } catch (err) {
          el.innerHTML = `<p style="color:red;">Error loading ${file}</p>`;
          console.warn("[includes]", err);
          // Keep going; do not reject the global include promise
        }
      });
    }, Promise.resolve());
  }

  function whenDomReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      // DOM is already parsed (interactive/complete)
      fn();
    }
  }

  // Expose a single global Promise so app.js can wait safely
  window.CGT_INCLUDES_READY = new Promise((resolve) => {
    whenDomReady(function () {
      loadIncludes().then(resolve).catch(function (err) {
        // Defensive: never hard-fail the readiness promise
        console.warn("[includes] loadIncludes() unexpected failure", err);
        resolve();
      });
    });
  });
})();
