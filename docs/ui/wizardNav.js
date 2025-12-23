/*-------------------------------------------------
 * ui/wizardNav.js
 * Wizard navigation for multi-page form
 * Pages are div.cgt-page[data-page="..."]
 * Namespace: window.CGT
 *-------------------------------------------------*/
(function () {
  var CGT = (window.CGT = window.CGT || {});

  /*-------------------------------------------------
   * Helpers
   *-------------------------------------------------*/
  function qsa(root, sel) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function byPageName(form, name) {
    return form.querySelector('.cgt-page[data-page="' + name + '"]');
  }

  function setActivePage(form, name) {
    var pages = qsa(form, ".cgt-page");
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove("is-active");
    }
    var target = byPageName(form, name);
    if (target) target.classList.add("is-active");
  }

  function ensureNavShell(form) {
    // We attach nav UI to the currently-active page each time
    // but keep a single nav bar element.
    var nav = form.querySelector(".wizard-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.className = "wizard-nav";
      nav.innerHTML = ''
        + '<div class="nav-left">'
        + '  <button type="button" class="wizard-prev">Previous</button>'
        + '</div>'
        + '<div class="nav-right">'
        + '  <button type="button" class="wizard-next">Next</button>'
        + '</div>';
      form.appendChild(nav);
    }
    return nav;
  }

  function ensureJumpLinks(resultsPage) {
    if (!resultsPage) return null;

    var jl = resultsPage.querySelector(".wizard-jumplinks");
    if (!jl) {
      jl = document.createElement("div");
      jl.className = "wizard-jumplinks";
      // links will be populated on init
      resultsPage.appendChild(jl);
    }
    return jl;
  }

  /*-------------------------------------------------
   * Public init
   *-------------------------------------------------*/
  CGT.initWizardNav = function initWizardNav(form, options) {
    options = options || {};
    var pageOrder = options.pageOrder || [];
    var firstPage = options.firstPageName || (pageOrder[0] || "info");
    var resultsPageName = options.resultsPageName || "results";
    var onEnterResults = (typeof options.onEnterResults === "function") ? options.onEnterResults : null;

    if (!form || !pageOrder.length) {
      console.warn("[wizard] initWizardNav missing form or pageOrder");
      return null;
    }

    // show first page by default (unless one is already active)
    var anyActive = form.querySelector(".cgt-page.is-active");
    if (!anyActive) setActivePage(form, firstPage);

    var current = (function () {
      var active = form.querySelector(".cgt-page.is-active");
      if (!active) return firstPage;
      return active.getAttribute("data-page") || firstPage;
    })();

    var nav = ensureNavShell(form);
    var prevBtn = nav.querySelector(".wizard-prev");
    var nextBtn = nav.querySelector(".wizard-next");

    function indexOfPage(name) {
      return pageOrder.indexOf(name);
    }

    function updateButtons() {
      var idx = indexOfPage(current);
      var isFirst = (idx <= 0);
      var isLast = (idx >= pageOrder.length - 1);

      if (prevBtn) prevBtn.disabled = isFirst;

      // On results page, "Next" doesn’t make sense
      if (nextBtn) {
        nextBtn.disabled = isLast;
        nextBtn.style.display = (current === resultsPageName) ? "none" : "inline-block";
      }

      // Move nav to bottom of current page for better UX
      var currentEl = byPageName(form, current);
      if (currentEl && nav.parentNode !== currentEl) {
        currentEl.appendChild(nav);
      }
    }

    function goTo(name) {
      if (indexOfPage(name) === -1) {
        console.warn("[wizard] unknown page:", name);
        return;
      }
      current = name;
      setActivePage(form, name);

      if (name === resultsPageName && onEnterResults) {
        try { onEnterResults(); } catch (e) { console.warn("[wizard] onEnterResults error", e); }
      }
      updateButtons();
    }

    function next() {
      var idx = indexOfPage(current);
      if (idx === -1) return;
      if (idx >= pageOrder.length - 1) return;
      goTo(pageOrder[idx + 1]);
    }

    function prev() {
      var idx = indexOfPage(current);
      if (idx === -1) return;
      if (idx <= 0) return;
      goTo(pageOrder[idx - 1]);
    }

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // Build results jump links
    var resultsEl = byPageName(form, resultsPageName);
    var jl = ensureJumpLinks(resultsEl);
    if (jl) {
      jl.innerHTML = pageOrder
        .filter(function (p) { return p !== resultsPageName; })
        .map(function (p) {
          return '<a href="#" data-jump="' + p + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</a>';
        })
        .join(" ");

      jl.addEventListener("click", function (e) {
        var a = e.target && e.target.closest ? e.target.closest("a[data-jump]") : null;
        if (!a) return;
        e.preventDefault();
        var target = a.getAttribute("data-jump");
        if (target) goTo(target);
      });
    }

    // Wizard object
    var wizard = {
      goTo: goTo,
      next: next,
      prev: prev,
      getCurrent: function () { return current; }
    };

    // Persist global reference
    CGT.wizard = wizard;

    // initial button state + ensure results renders correctly if starting there
    updateButtons();
    if (current === resultsPageName && onEnterResults) {
      try { onEnterResults(); } catch (e2) { console.warn("[wizard] onEnterResults error", e2); }
    }

    return wizard; // CRITICAL: now app.js sees the wizard
  };
})();
