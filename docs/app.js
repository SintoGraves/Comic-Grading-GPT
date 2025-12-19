/*-------------------------------------------------
 * app.js — Comic Grading Tool (Beta)
 * Main entry (Bindery + Corners + Edges)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

function CGT_initSampleClickPreview() {
  if (window.CGT && window.CGT.__sampleClickInit) return;
  if (window.CGT) window.CGT.__sampleClickInit = true;

  // Create overlay once
  var overlay = document.getElementById("sample-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sample-overlay";
    overlay.innerHTML = ''
      + '<div class="sample-overlay-inner">'
      + '  <img id="sample-overlay-img" alt="Grading example" />'
      + '  <button type="button" id="sample-overlay-close" aria-label="Close preview">Close</button>'
      + '</div>';
    document.body.appendChild(overlay);
  }

  var img = overlay.querySelector("#sample-overlay-img");
  var closeBtn = overlay.querySelector("#sample-overlay-close");

  function show(src) {
    if (!src) return;
    img.src = src;
    overlay.style.display = "flex";
  }
  function hide() {
    overlay.style.display = "none";
    img.src = "";
  }

  if (closeBtn) closeBtn.addEventListener("click", hide);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) hide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
  });

  // Delegated click handler: works with included HTML
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest ? e.target.closest("[data-sample-img]") : null;
    if (!el) return;

    var src = el.getAttribute("data-sample-img");
    if (src) show(src);
  });
}

function CGT_bootstrapApp() {
  var form = document.getElementById("grading-form");
  if (!form) return;

  var resultDiv = document.getElementById("result");
  var resetBtn  = document.getElementById("reset-btn");
  var printBtn  = document.getElementById("print-btn");

  var titleInput      = document.getElementById("comic_title");
  var issueInput      = document.getElementById("comic_issue");
  var stampFieldset   = document.getElementById("stamp-fieldset");
  var stampHint       = document.getElementById("stamp-hint");
  var titleSuggestion = document.getElementById("title-suggestion");

  var coverInput   = document.getElementById("cover_image");
  var coverPreview = document.getElementById("cover-preview");

  // Init sample preview (text-triggered via [data-sample-img])
  CGT_initSampleClickPreview();

  // READ LIVE (do not capture empty objects at bootstrap time)
  function getValueStampIndex() {
    return CGT.VALUE_STAMP_INDEX || {};
  }
  function getKnownTitles() {
    return CGT.KNOWN_TITLES || [];
  }

  // Warn (not fatal)
  if (!Object.keys(getValueStampIndex()).length) {
    console.warn("[stamp] VALUE_STAMP_INDEX not loaded — stamp lookup disabled");
  }
  if (!getKnownTitles().length) {
    console.warn("[stamp] KNOWN_TITLES not loaded — title suggestion disabled");
  }

  var stampApplies = false;

  /*-------------------------------------------------
   * Multi-location toggles (RUN EARLY)
   *-------------------------------------------------*/
  if (typeof CGT.initMultiLocationToggles === "function") {
    CGT.initMultiLocationToggles(form);
  }

  /*-------------------------------------------------
   * Title normalization & suggestion
   *-------------------------------------------------*/
  function normalizeTitle(rawTitle) {
    if (!rawTitle) return "";
    var t = rawTitle.trim().toLowerCase();

    if (t.startsWith("the ")) t = t.slice(4);
    t = t.replace(/\s+/g, " ");

    // common glued words
    t = t.replace(/spiderman/g, "spider-man");
    t = t.replace(/xmen/g, "x-men");
    t = t.replace(/ironman/g, "iron man");
    t = t.replace(/captainamerica/g, "captain america");
    t = t.replace(/doctorstrange/g, "doctor strange");
    t = t.replace(/dr\.\s*strange/g, "doctor strange");
    t = t.replace(/newmutants/g, "new mutants");

    // abbreviations
    t = t.replace(/^asm\s*/, "amazing spider-man ");
    t = t.replace(/^tmnt\s*/, "teenage mutant ninja turtles ");
    t = t.replace(/^tmt\s*/, "teenage mutant turtles ");
    t = t.replace(/^bprd\s*/, "bprd ");
    t = t.replace(/^ff\s*(?!#)/g, "fantastic four ");

    // "x men" -> "x-men"
    t = t.replace(/\bx men\b/g, "x-men");

    // & -> and
    t = t.replace(/ & /g, " and ");

    // strip punctuation
    t = t.replace(/[^a-z0-9\- ]+/g, "");
    t = t.replace(/\s\s+/g, " ");

    return t;
  }

  function editDistance(a, b) {
    var lenA = a.length;
    var lenB = b.length;
    var dp = Array.from({ length: lenA + 1 }, function () {
      return new Array(lenB + 1).fill(0);
    });

    for (var i = 0; i <= lenA; i++) dp[i][0] = i;
    for (var j = 0; j <= lenB; j++) dp[0][j] = j;

    for (i = 1; i <= lenA; i++) {
      for (j = 1; j <= lenB; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[lenA][lenB];
  }

  function displayTitleFromNormalized(norm) {
    return norm
      .split(" ")
      .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
      .join(" ");
  }

  function suggestTitle(rawTitle) {
    var normUser = normalizeTitle(rawTitle);
    if (!normUser || normUser.length < 3) return null;

    var titles = getKnownTitles(); // READ LIVE
    if (!titles.length) return null;

    var bestTitle = null;
    var bestDistance = Infinity;

    for (var k = 0; k < titles.length; k++) {
      var normT = normalizeTitle(titles[k]);
      var d = editDistance(normUser, normT);
      if (d < bestDistance) {
        bestDistance = d;
        bestTitle = normT;
      }
    }

    if (!bestTitle) return null;
    if (bestDistance === 0) return null;
    if (bestDistance > 3) return null;

    return { normalized: bestTitle, distance: bestDistance };
  }

  function makeStampKey(title, issue) {
    var normTitle = normalizeTitle(title);
    var normIssue = String(issue).trim().toLowerCase();
    normIssue = normIssue.replace(/^#/, "");
    return normTitle + "#" + normIssue;
  }

  /*-------------------------------------------------
   * Value stamp lookup (title + issue)
   *-------------------------------------------------*/
  function updateStampLookup() {
    var title = titleInput ? titleInput.value.trim() : "";
    var issue = issueInput ? issueInput.value.trim() : "";

    if (!title || !issue) {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      return;
    }

    var key = makeStampKey(title, issue);
    var index = getValueStampIndex(); // READ LIVE

    if (index[key]) {
      stampApplies = true;
      if (stampFieldset) stampFieldset.style.display = "block";
      if (stampHint) {
        stampHint.textContent =
          "This issue is known to include a value stamp or coupon. Please answer the question below.";
      }
    } else {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) {
        stampHint.textContent =
          "No value stamp or coupon is listed for this issue in the current lookup table.";
      }
    }
  }

  if (titleInput && issueInput) {
    titleInput.addEventListener("input", updateStampLookup);
    issueInput.addEventListener("input", updateStampLookup);
  }

  /*-------------------------------------------------
   * Title suggestion (Did you mean ... ?)
   *-------------------------------------------------*/
  if (titleInput && titleSuggestion) {
    var runTitleSuggestion = function () {
      var raw = titleInput.value || "";
      if (!raw.trim()) {
        titleSuggestion.textContent = "";
        return;
      }

      var suggestion = suggestTitle(raw);
      if (!suggestion) {
        titleSuggestion.textContent = "";
        return;
      }

      var display = displayTitleFromNormalized(suggestion.normalized);
      titleSuggestion.innerHTML = ''
        + 'Did you mean: <strong>' + display + '</strong>? '
        + '<button type="button" id="apply-title-suggestion-btn" style="margin-left:0.5rem; font-size:0.8rem;">'
        + 'Use this'
        + '</button>';

      var applyBtn = document.getElementById("apply-title-suggestion-btn");
      if (applyBtn) {
        applyBtn.addEventListener("click", function () {
          titleInput.value = display;
          titleSuggestion.textContent = "";
          updateStampLookup();
        });
      }
    };

    titleInput.addEventListener("blur", runTitleSuggestion);
    titleInput.addEventListener("change", runTitleSuggestion);
  }

  /*-------------------------------------------------
   * Cover image upload preview
   *-------------------------------------------------*/
  if (coverInput && coverPreview) {
    coverInput.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
        return;
      }

      var reader = new FileReader();
      reader.onload = function (ev) {
        coverPreview.src = ev.target.result;
        coverPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  /*-------------------------------------------------
   * Compute & render results (called by wizard and submit)
   *-------------------------------------------------*/
  function computeAndRenderResults() {
    if (!resultDiv) return;

    // Hardened calls: avoid runtime crash if a scoring file fails to load
    var bindery = (typeof CGT.computeBinderyScore === "function")
      ? CGT.computeBinderyScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

    var corners = (typeof CGT.computeCornersScore === "function")
      ? CGT.computeCornersScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

    var edges = (typeof CGT.computeEdgesScore === "function")
      ? CGT.computeEdgesScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

    var spine = (typeof CGT.computeSpineScore === "function")
      ? CGT.computeSpineScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

    var pages = (typeof CGT.computePagesScore === "function")
      ? CGT.computePagesScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

  
    var sectionScores = [bindery.finalScore, corners.finalScore, edges.finalScore, spine.finalScore, pages.finalScore];
    var overallScore = Math.min.apply(Math, sectionScores);
    var overallGrade = CGT.pickGrade(CGT.GRADES, overallScore);

    var titleText = titleInput ? titleInput.value.trim() : "";
    var issueText = issueInput ? issueInput.value.trim() : "";

    var displayHeading = (titleText || issueText)
      ? (titleText || "Unknown Title") + (issueText ? " #" + issueText : "")
      : "Comic Book Grading Report";

    var coverSrc = coverPreview ? coverPreview.src : "";

    resultDiv.innerHTML = ''
      + '<div class="print-header-row">'
      + '  <div class="print-main-meta">'
      + '    <h2 class="print-book-title">' + displayHeading + '</h2>'
      + '    <p><strong>Overall Grade (current build – Bindery, Corners &amp; Edges):</strong> '
      +        overallGrade.short + ' (' + overallGrade.label + ') – numeric ' + overallScore.toFixed(1)
      + '    </p>'

      + '    <h3>Bindery Section</h3>'
      + '    <p><strong>Bindery Grade:</strong> '
      +        bindery.grade.short + ' (' + bindery.grade.label + ') – ' + bindery.finalScore.toFixed(1) + '<br/>'
      + '      <strong>Base score:</strong> ' + bindery.baseScore.toFixed(1) + '<br/>'
      + '      <strong>Total penalties:</strong> ' + bindery.penaltyTotal.toFixed(1)
      + '    </p>'
      + '    <ul>' + bindery.elements.map(function (e) {
            return '<li>' + e.id + ': ' + e.score.toFixed(1) + '</li>';
          }).join("") + '</ul>'

      + '    <h3>Corners Section</h3>'
      + '    <p><strong>Corners Grade:</strong> '
      +        corners.grade.short + ' (' + corners.grade.label + ') – ' + corners.finalScore.toFixed(1) + '<br/>'
      + '      <strong>Base score:</strong> ' + corners.baseScore.toFixed(1) + '<br/>'
      + '      <strong>Total penalties:</strong> ' + corners.penaltyTotal.toFixed(1)
      + '    </p>'
      + '    <ul>' + corners.elements.map(function (e2) {
            return '<li>' + e2.id + ': ' + e2.score.toFixed(1) + '</li>';
          }).join("") + '</ul>'

      + '    <h3>Edges Section</h3>'
      + '    <p><strong>Edges Grade:</strong> '
      +        edges.grade.short + ' (' + edges.grade.label + ') – ' + edges.finalScore.toFixed(1) + '<br/>'
      + '      <strong>Base score:</strong> ' + edges.baseScore.toFixed(1) + '<br/>'
      + '      <strong>Total penalties:</strong> ' + edges.penaltyTotal.toFixed(1)
      + '    </p>'
      + '    <ul>' + edges.elements.map(function (e3) {
            return '<li>' + e3.id + ': ' + e3.score.toFixed(1) + '</li>';
          }).join("") + '</ul>'

      + '    <h3>Spine Section</h3>'
      + '    <p><strong>Spine Grade:</strong> '
      +        spine.grade.short + ' (' + spine.grade.label + ') – ' + spine.finalScore.toFixed(1) + '<br/>'
      + '      <strong>Base score:</strong> ' + spine.baseScore.toFixed(1) + '<br/>'
      + '      <strong>Total penalties:</strong> ' + spine.penaltyTotal.toFixed(1)
      + '    </p>'
      + '    <ul>' + spine.elements.map(function (e4) {
            return '<li>' + e4.id + ': ' + e4.score.toFixed(1) + '</li>';
          }).join("") + '</ul>'
      
      + '    <h3>Pages Section</h3>'
      + '    <p><strong>Pages Grade:</strong> '
      +        pages.grade.short + ' (' + pages.grade.label + ') – ' + pages.finalScore.toFixed(1) + '<br/>'
      + '      <strong>Base score:</strong> ' + pages.baseScore.toFixed(1) + '<br/>'
      + '      <strong>Total penalties:</strong> ' + pages.penaltyTotal.toFixed(1)
      + '    </p>'
      + '    <ul>' + pages.elements.map(function (e5) {
            return '<li>' + e5.id + ': ' + e5.score.toFixed(1) + '</li>';
          }).join("") + '</ul>'

      + '    <p><em>Note:</em> Cover section will be added later.</p>'
      + '  </div>'

      + (coverSrc
          ? '  <div class="print-cover-wrapper"><img class="print-cover" src="' + coverSrc + '" alt="Comic cover preview" /></div>'
          : ''
        )
      + '</div>';
  }

  /*-------------------------------------------------
   * Wizard init (separate file)
   *-------------------------------------------------*/
  if (typeof CGT.initWizardNav === "function") {
    CGT.initWizardNav(form, {
      firstPageName: "info",
      resultsPageName: "results",
      pageOrder: ["info", "bindery", "corners", "edges", "spine", "pages", "results"],
      onEnterResults: computeAndRenderResults
    });
  } else {
    console.warn("[wizard] ui/wizardNav.js not loaded; pages will not navigate");
  }

  /*-------------------------------------------------
   * Submit: treat Enter as "go to results"
   *-------------------------------------------------*/
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    computeAndRenderResults();
    if (CGT.wizard && typeof CGT.wizard.goTo === "function") {
      CGT.wizard.goTo("results");
    }
  });

  /*-------------------------------------------------
   * Reset handler
   *-------------------------------------------------*/
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();

      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      if (resultDiv) resultDiv.innerHTML = "";

      if (titleSuggestion) titleSuggestion.textContent = "";

      if (coverInput) coverInput.value = "";
      if (coverPreview) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
      }

      if (typeof CGT.initMultiLocationToggles === "function") {
        CGT.initMultiLocationToggles(form);
      }

      updateStampLookup();

      // Return to first page
      if (CGT.wizard && typeof CGT.wizard.goTo === "function") {
        CGT.wizard.goTo("info");
      }
    });
  }

  /*-------------------------------------------------
   * Print handler
   *-------------------------------------------------*/
  if (printBtn && resultDiv) {
    printBtn.addEventListener("click", function () {
      if (!resultDiv.innerHTML || !resultDiv.innerHTML.trim()) {
        alert("Please view results first, then print the report.");
        return;
      }
      window.print();
    });
  }

  // Initial stamp state
  updateStampLookup();
}

/*-------------------------------------------------
 * BOOTSTRAP GATE — RUN AFTER INCLUDES
 *-------------------------------------------------*/
if (window.CGT_INCLUDES_READY && typeof window.CGT_INCLUDES_READY.then === "function") {
  window.CGT_INCLUDES_READY.then(CGT_bootstrapApp);
} else {
  document.addEventListener("DOMContentLoaded", CGT_bootstrapApp);
}
