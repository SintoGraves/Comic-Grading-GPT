/*-------------------------------------------------
 * ui/wizardNav.js
 * Single-form wizard navigation (multi-page UI)
 * Exposes:
 *   CGT.initWizardNav(form, options)
 *   CGT.wizard.goTo(pageName)
 *   CGT.wizard.getCurrent()
 *
 * Requirements:
 * - Pages are .cgt-page[data-page="..."]
 * - Uses show/hide, no data loss
 * - Injects Back/Next onto each page
 * - Injects jump links on Results page
 * - Calls options.onEnterResults() before showing results (if provided)
 *-------------------------------------------------*/
(function () {
  "use strict";

  var CGT = (window.CGT = window.CGT || {});

  CGT.initWizardNav = function initWizardNav(form, options) {
    options = options || {};

    var pageSelector = options.pageSelector || ".cgt-page";
    var resultsPageName = options.resultsPageName || "results";
    var firstPageName = options.firstPageName || "info";

    var pages = Array.from(document.querySelectorAll(pageSelector));
    if (!pages.length) {
      console.warn("[wizard] No pages found with selector:", pageSelector);
      return null;
    }

    // Prevent double-init
    if (CGT.__wizardInit) return CGT.wizard || null;
    CGT.__wizardInit = true;

    var order = Array.isArray(options.pageOrder) && options.pageOrder.length
      ? options.pageOrder.slice()
      : pages.map(function (p) { return p.getAttribute("data-page") || ""; }).filter(Boolean);

    // Build lookup by page name
    var pageIndexByName = {};
    pages.forEach(function (p, idx) {
      var name = p.getAttribute("data-page") || String(idx);
      pageIndexByName[name] = idx;
      p.setAttribute("data-page-index", String(idx));
    });

    // Resolve index for first page
    var currentIndex = (typeof pageIndexByName[firstPageName] === "number")
      ? pageIndexByName[firstPageName]
      : 0;

    function setActiveByIndex(idx) {
      if (idx < 0) idx = 0;
      if (idx > pages.length - 1) idx = pages.length - 1;

      pages.forEach(function (p, i) {
        if (i === idx) p.classList.add("is-active");
        else p.classList.remove("is-active");
      });

      currentIndex = idx;
      pages[idx].scrollIntoView && pages[idx].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function getNameByIndex(idx) {
      var p = pages[idx];
      return p ? (p.getAttribute("data-page") || String(idx)) : null;
    }

    function getIndexByName(name) {
      return (typeof pageIndexByName[name] === "number") ? pageIndexByName[name] : null;
    }

    function getNextIndexFromOrder(idx) {
      var name = getNameByIndex(idx);
      if (!name) return Math.min(idx + 1, pages.length - 1);

      var pos = order.indexOf(name);
      if (pos === -1) return Math.min(idx + 1, pages.length - 1);

      var nextName = order[pos + 1];
      var nextIdx = getIndexByName(nextName);
      return (typeof nextIdx === "number") ? nextIdx : Math.min(idx + 1, pages.length - 1);
    }

    function getPrevIndexFromOrder(idx) {
      var name = getNameByIndex(idx);
      if (!name) return Math.max(idx - 1, 0);

      var pos = order.indexOf(name);
      if (pos === -1) return Math.max(idx - 1, 0);

      var prevName = order[pos - 1];
      var prevIdx = getIndexByName(prevName);
      return (typeof prevIdx === "number") ? prevIdx : Math.max(idx - 1, 0);
    }

    function injectNavButtons() {
      pages.forEach(function (page) {
        if (page.querySelector(".wizard-nav")) return;

        var nav = document.createElement("div");
        nav.className = "wizard-nav";

        var left = document.createElement("div");
        left.className = "nav-left";

        var right = document.createElement("div");
        right.className = "nav-right";

        var backBtn = document.createElement("button");
        backBtn.type = "button";
        backBtn.textContent = "Back";
        backBtn.setAttribute("data-wizard", "back");

        var nextBtn = document.createElement("button");
        nextBtn.type = "button";
        nextBtn.textContent = "Next";
        nextBtn.setAttribute("data-wizard", "next");

        left.appendChild(backBtn);
        right.appendChild(nextBtn);

        nav.appendChild(left);
        nav.appendChild(right);

        page.appendChild(nav);
      });
    }

    function updateNavButtonStates() {
      pages.forEach(function (page) {
        var idx = parseInt(page.getAttribute("data-page-index") || "0", 10);
        var pageName = getNameByIndex(idx);

        var backBtn = page.querySelector('button[data-wizard="back"]');
        var nextBtn = page.querySelector('button[data-wizard="next"]');

        if (backBtn) backBtn.disabled = (idx === getIndexByName(firstPageName));

        if (nextBtn) {
          var nextIdx = getNextIndexFromOrder(idx);
          var nextName = getNameByIndex(nextIdx);

          if (pageName === resultsPageName) {
            nextBtn.textContent = "Update Results";
          } else if (nextName === resultsPageName) {
            nextBtn.textContent = "View Results";
          } else {
            nextBtn.textContent = "Next";
          }
        }
      });
    }

    function injectJumpLinks() {
      var resultsIdx = getIndexByName(resultsPageName);
      if (typeof resultsIdx !== "number") return;

      var resultsPage = pages[resultsIdx];
      if (!resultsPage || resultsPage.querySelector(".wizard-jumplinks")) return;

      var wrap = document.createElement("div");
      wrap.className = "wizard-jumplinks";

      // Build links from order
      var html = "<strong>Jump to:</strong> ";
      order.forEach(function (name) {
        html += '<a href="#" data-jump="' + name + '">' + name.charAt(0).toUpperCase() + name.slice(1) + "</a> ";
      });
      wrap.innerHTML = html;

      resultsPage.appendChild(wrap);
    }

    function goTo(nameOrIndex, opts) {
      opts = opts || {};
      var idx = (typeof nameOrIndex === "number") ? nameOrIndex : getIndexByName(nameOrIndex);

      if (typeof idx !== "number") {
        console.warn("[wizard] Unknown page:", nameOrIndex);
        return;
      }

      var pageName = getNameByIndex(idx);
      if (pageName === resultsPageName) {
        // Compute/render before showing results
        if (typeof options.onEnterResults === "function") {
          try { options.onEnterResults(); }
          catch (e) { console.warn("[wizard] onEnterResults failed:", e); }
        }
      }

      setActiveByIndex(idx);
      updateNavButtonStates();
    }

    // Delegated events for navigation + jump links
    document.addEventListener("click", function (e) {
      var navBtn = e.target && e.target.closest ? e.target.closest("[data-wizard]") : null;
      if (navBtn) {
        var action = navBtn.getAttribute("data-wizard");
        var pageEl = navBtn.closest(pageSelector);
        if (!pageEl) return;

        var idx = parseInt(pageEl.getAttribute("data-page-index") || "0", 10);

        if (action === "back") {
          goTo(getPrevIndexFromOrder(idx));
        } else if (action === "next") {
          // If currently on results, "Update Results" should re-run onEnterResults and stay
          var pageName = getNameByIndex(idx);
          if (pageName === resultsPageName) {
            if (typeof options.onEnterResults === "function") {
              try { options.onEnterResults(); }
              catch (err) { console.warn("[wizard] onEnterResults failed:", err); }
            }
            return;
          }
          goTo(getNextIndexFromOrder(idx));
        }
      }

      var jump = e.target && e.target.closest ? e.target.closest("[data-jump]") : null;
      if (jump) {
        e.preventDefault();
        var name = jump.getAttribute("data-jump");
        goTo(name);
      }
    });

    // Expose API
    CGT.wizard = {
      goTo: goTo,
      getCurrent: function () { return getNameByIndex(currentIndex); },
      getIndexByName: getIndexByName
    };

    // Init UI
    injectNavButtons();
    injectJumpLinks();
    goTo(firstPageName);

    return CGT.wizard;
  };

})();
