/*-------------------------------------------------
 * app.js — Comic Grading Tool (Beta)
 * Main entry (Bindery + Corners + Edges)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

function CGT_bootstrapApp() {
  const form = document.getElementById("grading-form");
  if (!form) return;

  const resultDiv       = document.getElementById("result");
  const resetBtn        = document.getElementById("reset-btn");
  const printBtn        = document.getElementById("print-btn");

  const titleInput      = document.getElementById("comic_title");
  const issueInput      = document.getElementById("comic_issue");
  const stampFieldset   = document.getElementById("stamp-fieldset");
  const stampHint       = document.getElementById("stamp-hint");
  const titleSuggestion = document.getElementById("title-suggestion");

  const coverInput      = document.getElementById("cover_image");
  const coverPreview    = document.getElementById("cover-preview");

  // Data comes from data/valueStampIndex.js (READ LIVE — do not capture empty objects)
  function getValueStampIndex() {
    return CGT.VALUE_STAMP_INDEX || {};
  }
  function getKnownTitles() {
    return CGT.KNOWN_TITLES || [];
  }

  if (!Object.keys(getValueStampIndex()).length) {
    console.warn("[stamp] VALUE_STAMP_INDEX not loaded — stamp lookup disabled");
  }
  if (!getKnownTitles().length) {
    console.warn("[stamp] KNOWN_TITLES not loaded — title suggestion disabled");
  }

  let stampApplies = false;

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
    let t = rawTitle.trim().toLowerCase();

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
    const lenA = a.length;
    const lenB = b.length;
    const dp = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));

    for (let i = 0; i <= lenA; i++) dp[i][0] = i;
    for (let j = 0; j <= lenB; j++) dp[0][j] = j;

    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[lenA][lenB];
  }

  function suggestTitle(rawTitle) {
    const normUser = normalizeTitle(rawTitle);
    if (!normUser || normUser.length < 3) return null;

    let bestTitle = null;
    let bestDistance = Infinity;

    // Normalize dataset titles too (hardening)
    for (const t of KNOWN_TITLES) {
      const normT = normalizeTitle(t);
      const d = editDistance(normUser, normT);
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

  function displayTitleFromNormalized(norm) {
    return norm
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function makeStampKey(title, issue) {
    const normTitle = normalizeTitle(title);
    let normIssue = `${issue}`.trim().toLowerCase();
    normIssue = normIssue.replace(/^#/, "");
    return normTitle + "#" + normIssue;
  }

  /*-------------------------------------------------
   * Value stamp lookup (title + issue)
   *-------------------------------------------------*/
  function updateStampLookup() {
    const title = titleInput ? titleInput.value.trim() : "";
    const issue = issueInput ? issueInput.value.trim() : "";

    if (!title || !issue) {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      return;
    }

    const key = makeStampKey(title, issue);
    if (VALUE_STAMP_INDEX[key]) {
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
    const runTitleSuggestion = () => {
      const raw = titleInput.value;
      if (!raw.trim()) {
        titleSuggestion.textContent = "";
        return;
      }

      const suggestion = suggestTitle(raw);
      if (!suggestion) {
        titleSuggestion.textContent = "";
        return;
      }

      const display = displayTitleFromNormalized(suggestion.normalized);
      titleSuggestion.innerHTML = `
        Did you mean: <strong>${display}</strong>?
        <button type="button" id="apply-title-suggestion-btn"
                style="margin-left:0.5rem; font-size:0.8rem;">
          Use this
        </button>
      `;

      const applyBtn = document.getElementById("apply-title-suggestion-btn");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
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
    coverInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        coverPreview.src = ev.target.result;
        coverPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  /*-------------------------------------------------
   * Sample-image overlay (press-and-hold)
   *-------------------------------------------------*/
  const sampleOverlay = document.createElement("div");
  sampleOverlay.id = "sample-overlay";
  sampleOverlay.innerHTML = `<img id="sample-overlay-img" alt="Grading example" />`;
  document.body.appendChild(sampleOverlay);

  const sampleOverlayImg = sampleOverlay.querySelector("#sample-overlay-img");

  function showSample(src) {
    if (!src) return;
    sampleOverlayImg.src = src;
    sampleOverlay.style.display = "flex";
  }

  function hideSample() {
    sampleOverlay.style.display = "none";
    sampleOverlayImg.src = "";
  }

  document.querySelectorAll(".sample-btn").forEach((btn) => {
    const imgSrc = btn.getAttribute("data-sample-img");
    if (!imgSrc) return;

    btn.addEventListener("mousedown", () => showSample(imgSrc));
    btn.addEventListener("mouseup", hideSample);
    btn.addEventListener("mouseleave", hideSample);

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      showSample(imgSrc);
    }, { passive: false });

    btn.addEventListener("touchend", hideSample);
    btn.addEventListener("touchcancel", hideSample);
  });

  /*-------------------------------------------------
   * Submit handler: compute sections and report
   *-------------------------------------------------*/
  if (resultDiv) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Hardened calls: avoid runtime crash if a scoring file fails to load
      const bindery = (typeof CGT.computeBinderyScore === "function")
        ? CGT.computeBinderyScore(form)
        : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

      const corners = (typeof CGT.computeCornersScore === "function")
        ? CGT.computeCornersScore(form)
        : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

      const edges = (typeof CGT.computeEdgesScore === "function")
        ? CGT.computeEdgesScore(form)
        : { finalScore: 10.0, baseScore: 10.0, penaltyTotal: 0.0, grade: CGT.pickGrade(CGT.GRADES, 10.0), elements: [], placeholder: true };

      const sectionScores = [
        bindery.finalScore,
        corners.finalScore,
        edges.finalScore
      ];

      const overallScore = Math.min(...sectionScores);
      const overallGrade = CGT.pickGrade(CGT.GRADES, overallScore);

      const titleText = titleInput ? titleInput.value.trim() : "";
      const issueText = issueInput ? issueInput.value.trim() : "";

      const displayHeading = (titleText || issueText)
        ? `${titleText || "Unknown Title"}${issueText ? " #" + issueText : ""}`
        : "Comic Book Grading Report";

      const coverSrc = coverPreview ? coverPreview.src : "";

      resultDiv.innerHTML = `
        <div class="print-header-row">
          <div class="print-main-meta">
            <h2 class="print-book-title">${displayHeading}</h2>

            <p><strong>Overall Grade (current build – Bindery, Corners &amp; Edges):</strong>
              ${overallGrade.short} (${overallGrade.label}) – numeric ${overallScore.toFixed(1)}
            </p>

            <h3>Bindery Section</h3>
            <p>
              <strong>Bindery Grade:</strong>
              ${bindery.grade.short} (${bindery.grade.label}) – ${bindery.finalScore.toFixed(1)}<br/>
              <strong>Base score:</strong> ${bindery.baseScore.toFixed(1)}<br/>
              <strong>Total penalties:</strong> ${bindery.penaltyTotal.toFixed(1)}
            </p>
            <ul>
              ${bindery.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
            </ul>

            <h3>Corners Section</h3>
            <p>
              <strong>Corners Grade:</strong>
              ${corners.grade.short} (${corners.grade.label}) – ${corners.finalScore.toFixed(1)}<br/>
              <strong>Base score:</strong> ${corners.baseScore.toFixed(1)}<br/>
              <strong>Total penalties:</strong> ${corners.penaltyTotal.toFixed(1)}
            </p>
            <ul>
              ${corners.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
            </ul>

            <h3>Edges Section</h3>
            <p>
              <strong>Edges Grade:</strong>
              ${edges.grade.short} (${edges.grade.label}) – ${edges.finalScore.toFixed(1)}<br/>
              <strong>Base score:</strong> ${edges.baseScore.toFixed(1)}<br/>
              <strong>Total penalties:</strong> ${edges.penaltyTotal.toFixed(1)}
            </p>
            <ul>
              ${edges.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
            </ul>

            <p><em>Note:</em> Spine, Pages, and Cover sections will be added later.</p>
          </div>

          ${
            coverSrc
              ? `<div class="print-cover-wrapper">
                   <img class="print-cover" src="${coverSrc}" alt="Comic cover preview" />
                 </div>`
              : ""
          }
        </div>
      `;

      resultDiv.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  }

/*-------------------------------------------------
 * Reset handler
 *-------------------------------------------------*/
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    // 1) Reset all form controls back to defaults (first <option>, default radios, etc.)
    form.reset();

    // 2) Clear derived UI state
    stampApplies = false;
    if (stampFieldset) stampFieldset.style.display = "none";
    if (stampHint) stampHint.textContent = "";
    if (resultDiv) resultDiv.innerHTML = "";

    // Clear title suggestion text
    if (titleSuggestion) titleSuggestion.textContent = "";

    // 3) Clear cover preview
    if (coverInput) coverInput.value = "";
    if (coverPreview) {
      coverPreview.src = "";
      coverPreview.style.display = "none";
    }

    // 4) Re-apply multi-location toggle rules to the now-reset defaults
    if (typeof CGT.initMultiLocationToggles === "function") {
      CGT.initMultiLocationToggles(form);
    }

    // 5) Recompute stamp lookup based on cleared title/issue
    updateStampLookup();
  });
}


  /*-------------------------------------------------
   * Print handler
   *-------------------------------------------------*/
  if (printBtn && resultDiv) {
    printBtn.addEventListener("click", () => {
      if (!resultDiv.innerHTML.trim()) {
        alert("Please estimate a grade first, then print the results.");
        return;
      }
      window.print();
    });
  }
}

/*-------------------------------------------------
 * BOOTSTRAP GATE — RUN AFTER INCLUDES
 *-------------------------------------------------*/
if (window.CGT_INCLUDES_READY && typeof window.CGT_INCLUDES_READY.then === "function") {
  window.CGT_INCLUDES_READY.then(CGT_bootstrapApp);
} else {
  document.addEventListener("DOMContentLoaded", CGT_bootstrapApp);
}

