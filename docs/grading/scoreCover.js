/*-------------------------------------------------
 * grading/scoreCover.js
 * Cover scoring (object output consistent with other sections)
 * Uses finalizeSection() penalty model when available
 * Namespace: window.CGT
 *-------------------------------------------------*/
(function () {
  "use strict";

  var CGT = (window.CGT = window.CGT || {});

  function pickGradeSafe(score) {
    if (typeof CGT.pickGrade === "function" && CGT.GRADES) {
      return CGT.pickGrade(CGT.GRADES, score);
    }
    return { short: "NA", label: "Not Available" };
  }

  function getCheckedValueByName(form, name, defVal) {
    try {
      if (form && form.elements && form.elements[name] !== undefined) {
        var group = form.elements[name];
        if (group && typeof group.value === "string") {
          return group.value || defVal;
        }
      }
    } catch (e) { /* ignore */ }

    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : defVal;
  }

  function isMultiYes(form, base) {
    return getCheckedValueByName(form, base + "_multi", "no") === "yes";
  }

  /* -----------------------------
   * Per-element scoring
   * ----------------------------- */

  function scoreGloss(form, side) {
    var baseName = "cover_gloss_" + side; // front/back
    var v = getCheckedValueByName(form, baseName, "none");
    if (v === "none") return 10.0;

    var multi = isMultiYes(form, baseName);

    switch (v) {
      case "light_scuff":            return multi ? 7.5 : 8.5;
      case "dull_rubbed":            return multi ? 5.5 : 6.5;
      case "creases_color_interrupt":return multi ? 5.5 : 6.5;
      case "deep_abr_color_loss":    return multi ? 3.5 : 4.5;
      default:                       return 10.0;
    }
  }

  function scoreInk(form, side) {
    var baseName = "cover_ink_" + side;
    var v = getCheckedValueByName(form, baseName, "none");
    if (v === "none") return 10.0;

    var multi = isMultiYes(form, baseName);

    switch (v) {
      case "minor_fade": return multi ? 6.5 : 7.5;
      case "heavy_fade": return multi ? 2.5 : 4.5;
      default:           return 10.0;
    }
  }

  function scoreSoil(form, side) {
    var baseName = "cover_soil_" + side;
    var v = getCheckedValueByName(form, baseName, "none");
    if (v === "none") return 10.0;

    var multi = isMultiYes(form, baseName);

    switch (v) {
      case "light_smudges":      return multi ? 5.5 : 6.5;
      case "mild_fingerprints":  return multi ? 3.5 : 4.5;
      case "heavy_oil":          return multi ? 1.5 : 2.5;
      case "mold_related":       return multi ? 0.5 : 1.5;
      default:                   return 10.0;
    }
  }

  function scoreMarks(form, side) {
    var baseName = "cover_marks_" + side;
    var v = getCheckedValueByName(form, baseName, "none");
    if (v === "none") return 10.0;

    var multi = isMultiYes(form, baseName);

    switch (v) {
      case "small_no_art":       return 9.5;              // multi not meaningful here
      case "large_interferes":   return 2.5;              // severity-based
      case "small_sticker_pen":  return multi ? 4.5 : 6.5;
      case "heavy_across_art":   return multi ? 1.5 : 2.5;
      default:                   return 10.0;
    }
  }

  /* -----------------------------
   * Public API: computeCoverScore(form)
   * ----------------------------- */
  CGT.computeCoverScore = function computeCoverScore(form) {
    var elements = [];

    var glossFront = scoreGloss(form, "front");
    var glossBack  = scoreGloss(form, "back");
    elements.push({ id: "cover_gloss_front", score: glossFront });
    elements.push({ id: "cover_gloss_back",  score: glossBack });

    var inkFront = scoreInk(form, "front");
    var inkBack  = scoreInk(form, "back");
    elements.push({ id: "cover_ink_front", score: inkFront });
    elements.push({ id: "cover_ink_back",  score: inkBack });

    var soilFront = scoreSoil(form, "front");
    var soilBack  = scoreSoil(form, "back");
    elements.push({ id: "cover_soil_front", score: soilFront });
    elements.push({ id: "cover_soil_back",  score: soilBack });

    var marksFront = scoreMarks(form, "front");
    var marksBack  = scoreMarks(form, "back");
    elements.push({ id: "cover_marks_front", score: marksFront });
    elements.push({ id: "cover_marks_back",  score: marksBack });

    // Prefer the common finalizer (Bindery/Corners/Edges style)
    if (typeof CGT.finalizeSection === "function") {
      return CGT.finalizeSection(elements);
    }

    // Defensive fallback: min-of-elements only
    var baseScore = 10.0;
    for (var i = 0; i < elements.length; i++) {
      var s = elements[i].score;
      if (typeof s === "number" && !isNaN(s)) baseScore = Math.min(baseScore, s);
    }

    var finalScore = baseScore;
    var penaltyTotal = 10.0 - finalScore;
    if (penaltyTotal < 0) penaltyTotal = 0;

    return {
      finalScore: finalScore,
      baseScore: baseScore,
      penaltyTotal: penaltyTotal,
      grade: pickGradeSafe(finalScore),
      elements: elements
    };
  };

  // Optional compatibility alias
  CGT.scoreCover = function scoreCover(form) {
    return CGT.computeCoverScore(form).finalScore;
  };
})();
