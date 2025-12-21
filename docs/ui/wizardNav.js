/*-------------------------------------------------
 * ui/wizardNav.js
 * Wizard navigation for multi-page form sections
 * - No frameworks, no modules, plain JS
 * - Defensive: never hard-crash if markup changes
 *
 * Behavior:
 * - Pages are .cgt-page[data-page="..."]
 * - Shows one page at a time via .is-active
 * - Adds Back/Next controls on all non-results pages
 * - Last grading page shows "View Results"
 * - Results page shows NO wizard Next/Update button (avoids duplicate)
 * - Results page gets jump links to any page
 *-------------------------------------------------*/
(function () {
  "use strict";

  var CGT = (window.CGT = window.CGT || {});

  var PAGE_ORDER = ["info", "bindery", "corners", "edges", "spine", "pages", "cover", "results"];

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getPages() {
    return $all(".cgt-page[data-page]");
  }

  function getPageByKey(key) {
    return $('.cgt-page[data-page="' + key + '"]');
  }

  function setActivePage(key) {
    var pages = getPages();
    if (!pages.length) return;

    pages.forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-page") === key);
    });

    // keep focus/scroll predictable
    var active = getPageByKey(key);
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getActiveKey() {
    var active = $(".cgt-page.is-active");
    return active ? active.getAttribute("data-page") : null;
  }

  function ensureWizardShell(pageEl) {
    if (!pageEl) return null;

    var existing = $(".wizard-nav", pageEl);
    if (existing) return existing;

    var nav = document.createElement("div");
    nav.className = "wizard-nav";
    nav.innerHTML = [
      '<div class="nav-left"></div>',
      '<div class="nav-right"></div>'
    ].join("");

    pageEl.appendChild(nav);
    return nav;
  }

  function buildNavForPage(key) {
    var pageEl = getPageByKey(key);
    if (!pageEl) return;

    // Results page: no wizard nav controls (prevents duplicate Update Results)
    if (key === "results") {
      var existing = $(".wizard-nav", pageEl);
      if (existing) existing.remove();
      return;
    }

    var nav = ensureWizardShell(pageEl);
    if (!nav) return;

    var left = $(".nav-left", nav);
    var right = $(".nav-right", nav);
    if (!left || !right) return;

    left.innerHTML = "";
    right.innerHTML = "";

    var idx = PAGE_ORDER.indexOf(key);
    var isFirst = idx <= 0;
    var isLastBeforeResults = (key === "pages"); // last grading page for now

    // Back
    if (!isFirst) {
      var backBtn = document.createElement("button");
      backBtn.type = "button";
      backBtn.textContent = "Back";
      backBtn.addEventListener("click", function () {
        var prevKey = PAGE_ORDER[Math.max(0, idx - 1)];
        setActivePage(prevKey);
        CGT._wizardActiveKey = prevKey;
      });
      left.appendChild(backBtn);
    }

    // Next / View Results
    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.textContent = isLastBeforeResults ? "View Results" : "Next";

    nextBtn.addEventListener("click", function () {
      // If we're on spine, go to results AND compute once
      if (isLastBeforeResults) {
        setActivePage("results");
        CGT._wizardActiveKey = "results";

        // Trigger a compute/render by submitting the form programmatically
        var form = $("#grading-form");
        if (form) {
          // requestSubmit preferred, fallback to dispatch submit event
          if (typeof form.requestSubmit === "function") {
            form.requestSubmit();
          } else {
            var evt = new Event("submit", { bubbles: true, cancelable: true });
            form.dispatchEvent(evt);
          }
        }
        return;
      }

      // Normal next
      var nextKey = PAGE_ORDER[Math.min(PAGE_ORDER.length - 1, idx + 1)];
      setActivePage(nextKey);
      CGT._wizardActiveKey = nextKey;
    });

    right.appendChild(nextBtn);
  }

  function buildJumpLinks() {
    var resultsPage = getPageByKey("results");
    if (!resultsPage) return;

    // Remove existing if present (avoid duplicates on re-init)
    var existing = $(".wizard-jumplinks", resultsPage);
    if (existing) existing.remove();

    var wrap = document.createElement("div");
    wrap.className = "wizard-jumplinks";

    var label = document.createElement("div");
    label.textContent = "Jump to:";
    label.style.fontWeight = "700";
    label.style.marginBottom = "0.35rem";
    wrap.appendChild(label);

    PAGE_ORDER.forEach(function (key) {
      var a = document.createElement("a");
      a.href = "#";
      a.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setActivePage(key);
        CGT._wizardActiveKey = key;
      });
      wrap.appendChild(a);
    });

    resultsPage.appendChild(wrap);
  }

  CGT.initWizardNav = function initWizardNav() {
    var pages = getPages();
    if (!pages.length) return;

    // Build nav for each page (removes nav on results)
    PAGE_ORDER.forEach(buildNavForPage);

    // Jump links on results
    buildJumpLinks();

    // Initial page
    var initial = CGT._wizardActiveKey || "info";
    setActivePage(initial);
  };

  // Auto-init after includes (preferred), fallback DOMContentLoaded
  function safeInit() {
    try {
      CGT.initWizardNav();
    } catch (e) {
      console.warn("[wizardNav] init failed:", e);
    }
  }

  if (window.CGT_INCLUDES_READY && typeof window.CGT_INCLUDES_READY.then === "function") {
    window.CGT_INCLUDES_READY.then(safeInit);
  } else {
    document.addEventListener("DOMContentLoaded", safeInit);
  }
})();
