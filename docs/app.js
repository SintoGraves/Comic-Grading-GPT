/*-------------------------------------------------
 * app.js — Comic Grading Tool (Beta)
 * Main entry (Bindery + Corners + Edges + Spine + Pages + Cover)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

/*-------------------------------------------------
 * 1) Sample image click-to-preview overlay
 *-------------------------------------------------*/
function CGT_initSampleClickPreview() {
  if (window.CGT && window.CGT.__sampleClickInit) return;
  if (window.CGT) window.CGT.__sampleClickInit = true;

  // Create overlay once
  var overlay = document.getElementById("sample-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sample-overlay";
    overlay.innerHTML = ""
      + '<div class="sample-overlay-inner">'
      + '  <img id="sample-overlay-img" alt="Grading example" />'
      + '  <button type="button" id="sample-overlay-close" aria-label="Close preview">Close</button>'
      + "</div>";
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

/*-------------------------------------------------
 * 2) App bootstrap
 *-------------------------------------------------*/
function CGT_bootstrapApp() {
  var form = document.getElementById("grading-form");
  if (!form) return;

  /*-------------------------------------------------
   * 2A) DOM hooks
   *-------------------------------------------------*/
  var resultDiv = document.getElementById("result");
  var resetBtn  = document.getElementById("reset-btn");
  var printBtn  = document.getElementById("print-btn");

  var titleInput      = document.getElementById("comic_title");
  var issueInput      = document.getElementById("comic_issue");
  var stampFieldset   = document.getElementById("stamp-fieldset");
  var stampHint       = document.getElementById("stamp-hint");
  var titleSuggestion = document.getElementById("title-suggestion");

  // Image inputs (Front, Back, Inside)
  var coverInput        = document.getElementById("cover_image");
  var coverPreview      = document.getElementById("cover-preview");
  var backCoverInput    = document.getElementById("backcover_image");
  var backCoverPreview  = document.getElementById("backcover-preview");
  var insidePageInput   = document.getElementById("insidepage_image");
  var insidePagePreview = document.getElementById("insidepage-preview");

  /*-------------------------------------------------
   * 2B) Init sample overlay
   *-------------------------------------------------*/
  CGT_initSampleClickPreview();

  /*-------------------------------------------------
   * 2C) Live data accessors (avoid capturing empty objects at bootstrap time)
   *-------------------------------------------------*/
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
   * 3) Utilities
   *-------------------------------------------------*/
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeImgOrPlaceholder(src, altText) {
    if (src && String(src).trim()) {
      return '<img src="' + src + '" alt="' + escapeHtml(altText) + '" />';
    }
    return '<span style="font-size:0.85rem; color:#666;">No image provided</span>';
  }

  function buildSectionHtml(label, obj) {
    var grade = obj && obj.grade ? obj.grade : { short: "—", label: "—" };
    var finalScore = (obj && typeof obj.finalScore === "number") ? obj.finalScore : 10.0;

    var items = (obj && Array.isArray(obj.elements)) ? obj.elements : [];
    var listHtml = items.length
      ? ('<ul>' + items.map(function (e) {
          var id = (e && e.id) ? e.id : "item";
          var sc = (e && typeof e.score === "number") ? e.score : 10.0;
          return '<li>' + escapeHtml(id) + ": " + Number(sc).toFixed(1) + "</li>";
        }).join("") + "</ul>")
      : "<ul><li>—</li></ul>";

    return ""
      + '<section class="report-section">'
      + "  <h3>" + escapeHtml(label) + "</h3>"
      + '  <div style="margin:0 0 0.25rem;">'
      + "    <strong>Section Grade:</strong> "
      + escapeHtml(grade.short) + " (" + escapeHtml(grade.label) + ")"
      + "    – " + Number(finalScore).toFixed(1)
      + "  </div>"
      + listHtml
      + "</section>";
  }

  function waitForImagesIn(el) {
    var imgs = Array.prototype.slice.call(el.querySelectorAll("img"));
    var promises = imgs.map(function (img) {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(function (resolve) {
        img.onload = function () { resolve(); };
        img.onerror = function () { resolve(); };
      });
    });
    return Promise.all(promises);
  }

  /*-------------------------------------------------
   * 4) Multi-location toggles (RUN EARLY)
   *-------------------------------------------------*/
  if (typeof CGT.initMultiLocationToggles === "function") {
    CGT.initMultiLocationToggles(form);
  }

  /*-------------------------------------------------
   * 5) Title normalization & suggestion
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

  /*-------------------------------------------------
   * 6) Value stamp lookup (title + issue)
   *-------------------------------------------------*/
  function makeStampKey(title, issue) {
    var normTitle = normalizeTitle(title);
    var normIssue = String(issue).trim().toLowerCase().replace(/^#/, "");
    return normTitle + "#" + normIssue;
  }

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
   * 7) Title suggestion (Did you mean ... ?)
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
      titleSuggestion.innerHTML = ""
        + "Did you mean: <strong>" + escapeHtml(display) + "</strong>? "
        + '<button type="button" id="apply-title-suggestion-btn" style="margin-left:0.5rem; font-size:0.8rem;">'
        + "Use this"
        + "</button>";

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
   * 8) Image upload previews (Front / Back / Inside)
   *-------------------------------------------------*/
  function wireImagePreview(fileInput, imgEl) {
    if (!fileInput || !imgEl) return;
    fileInput.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) {
        imgEl.src = "";
        imgEl.style.display = "none";
        return;
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        imgEl.src = ev.target.result;
        imgEl.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  wireImagePreview(coverInput, coverPreview);
  wireImagePreview(backCoverInput, backCoverPreview);
  wireImagePreview(insidePageInput, insidePagePreview);

  /*-------------------------------------------------
   * 9) Compute & render results (called by wizard + submit + print)
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

    var cover = (typeof CGT.computeCoverScore === "function")
      ? CGT.computeCoverScore(form)
      : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

    // Overall = minimum of section finals
    var sectionScores = [bindery.finalScore, corners.finalScore, edges.finalScore, spine.finalScore, pages.finalScore, cover.finalScore];
    var overallScore = Math.min.apply(Math, sectionScores);
    var overallGrade = CGT.pickGrade(CGT.GRADES, overallScore);

    // Optional comic identifier line
    var titleText = titleInput ? titleInput.value.trim() : "";
    var issueText = issueInput ? issueInput.value.trim() : "";
    var comicLine = (titleText || issueText)
      ? (escapeHtml(titleText || "Unknown Title") + (issueText ? " #" + escapeHtml(issueText) : ""))
      : "";

    // Image sources (from preview <img> tags so they print)
    var coverSrc = coverPreview ? (coverPreview.src || "") : "";
    var backSrc  = backCoverPreview ? (backCoverPreview.src || "") : "";
    var pageSrc  = insidePagePreview ? (insidePagePreview.src || "") : "";

    resultDiv.innerHTML = ""
      + '<div class="report">'
      + '  <div class="report-titleblock">'
      + '    <h1 class="report-title">Comic Book Grading Report</h1>'
      + '    <div class="report-grade">Overall Grade: '
      +          escapeHtml(overallGrade.short) + " (" + escapeHtml(overallGrade.label) + ")"
      + "      – " + Number(overallScore).toFixed(1)
      + "    </div>"
      + "  </div>"
      + (comicLine
          ? '  <div style="margin:0 0 0.5rem; color:#555; font-weight:600;">' + comicLine + "</div>"
          : ""
        )
      + '  <div class="report-images">'
      + '    <figure class="report-image">'
      + "      <figcaption>Front Cover</figcaption>"
      + '      <div class="report-imgbox">' + safeImgOrPlaceholder(coverSrc, "Front cover image") + "</div>"
      + "    </figure>"
      + '    <figure class="report-image">'
      + "      <figcaption>Back Cover</figcaption>"
      + '      <div class="report-imgbox">' + safeImgOrPlaceholder(backSrc, "Back cover image") + "</div>"
      + "    </figure>"
      + '    <figure class="report-image">'
      + "      <figcaption>Inside Page</figcaption>"
      + '      <div class="report-imgbox">' + safeImgOrPlaceholder(pageSrc, "Inside page image") + "</div>"
      + "    </figure>"
      + "  </div>"
      + '  <div class="report-sections">'
      +        buildSectionHtml("Bindery", bindery)
      +        buildSectionHtml("Corners", corners)
      +        buildSectionHtml("Edges", edges)
      +        buildSectionHtml("Spine", spine)
      +        buildSectionHtml("Pages", pages)
      +        buildSectionHtml("Cover", cover)
      + "  </div>"
      + "</div>";
  }

  /*-------------------------------------------------
   * 10) Wizard init (separate file)
   *-------------------------------------------------*/
  if (typeof CGT.initWizardNav === "function") {
    CGT.initWizardNav(form, {
      firstPageName: "info",
      resultsPageName: "results",
      pageOrder: ["info", "bindery", "corners", "edges", "spine", "pages", "cover", "results"],
      onEnterResults: computeAndRenderResults
    });
  } else {
    console.warn("[wizard] ui/wizardNav.js not loaded; pages will not navigate");
  }

  /*-------------------------------------------------
   * 11) Submit: treat Enter as "go to results"
   *-------------------------------------------------*/
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    computeAndRenderResults();
    if (CGT.wizard && typeof CGT.wizard.goTo === "function") {
      CGT.wizard.goTo("results");
    }
  });

  /*-------------------------------------------------
   * 12) Reset handler
   *-------------------------------------------------*/
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();

      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      if (resultDiv) resultDiv.innerHTML = "";

      if (titleSuggestion) titleSuggestion.textContent = "";

      // Clear image inputs + previews
      if (coverInput) coverInput.value = "";
      if (coverPreview) { coverPreview.src = ""; coverPreview.style.display = "none"; }

      if (backCoverInput) backCoverInput.value = "";
      if (backCoverPreview) { backCoverPreview.src = ""; backCoverPreview.style.display = "none"; }

      if (insidePageInput) insidePageInput.value = "";
      if (insidePagePreview) { insidePagePreview.src = ""; insidePagePreview.style.display = "none"; }

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
   * 13) Print handler (regenerate, wait for images, then print)
   *-------------------------------------------------*/
  if (printBtn && resultDiv) {
    printBtn.addEventListener("click", function () {
      computeAndRenderResults();

      if (!resultDiv.innerHTML || !resultDiv.innerHTML.trim()) {
        alert("Please view results first, then print the report.");
        return;
      }

      waitForImagesIn(resultDiv).then(function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            window.print();
          });
        });
      });
    });
  }

  /*-------------------------------------------------
   * 14) Initial stamp state
   *-------------------------------------------------*/
  updateStampLookup();
}

/*-------------------------------------------------
 * 15) BOOTSTRAP GATE — RUN AFTER INCLUDES
 *-------------------------------------------------*/
if (window.CGT_INCLUDES_READY && typeof window.CGT_INCLUDES_READY.then === "function") {
  window.CGT_INCLUDES_READY.then(CGT_bootstrapApp);
} else {
  document.addEventListener("DOMContentLoaded", CGT_bootstrapApp);
}
