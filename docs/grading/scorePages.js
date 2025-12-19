/*-------------------------------------------------
 * grading/scorePages.js
 * Pages scoring (object output consistent with other sections)
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
   * Individual element scorers
   * ----------------------------- */

  function scorePagesColor(form) {
    var v = getCheckedValueByName(form, "pages_color", "white");
    switch (v) {
      case "white":             return 10.0;
      case "offwhite_to_white": return 9.5;
      case "offwhite":          return 9.0;
      case "cream_to_offwhite": return 8.0;
      case "cream":             return 7.5;
      case "light_tan":         return 6.0;
      case "tan":               return 5.0;
      case "brown":             return 3.0;
      case "brittle":           return 0.0;
      default:                  return 10.0;
    }
  }

  function scorePagesStains(form) {
    var base = getCheckedValueByName(form, "pages_stains", "none");
    if (base === "none") return 10.0;

    var multi = isMultiYes(form, "pages_stains");

    switch (base) {
      case "light_soiling": return multi ? 4.5 : 5.5;
      case "fingerprints":  return multi ? 3.5 : 4.5;
      case "water_stains":  return multi ? 0.75 : 1.5;
      case "mold_mildew":   return multi ? 0.0 : 0.5;
      default:              return 10.0;
    }
  }

  function scorePagesTears(form) {
    var base = getCheckedValueByName(form, "pages_tears", "none");
    if (base === "none") return 10.0;

    var multi = isMultiYes(form, "pages_tears");

    switch (base) {
      case "tiny_edge_lt_quarter": return multi ? 5.0 : 6.0;
      case "larger_tears_rips":    return multi ? 2.0 : 3.0;
      case "missing_corner_chunk": return multi ? 1.0 : 2.0;
      case "affects_story_panel":  return multi ? 0.0 : 1.0;
      default:                     return 10.0;
    }
  }

  function scorePagesMissing(form) {
    var v = getCheckedValueByName(form, "pages_missing", "complete");
    switch (v) {
      case "complete":         return 10.0;
      case "missing_ad_page":  return 1.5;
      case "clipped_coupons":  return 1.0;
      case "missing_story_page": return 0.5;
      default:                 return 10.0;
    }
  }

  function scorePagesCenterfold(form) {
    var v = getCheckedValueByName(form, "pages_centerfold", "attached");
    switch (v) {
      case "attached":      return 10.0;
      case "detached_one":  return 4.0;
      case "detached_both": return 1.8;
      default:              return 10.0;
    }
  }

  function scorePagesMarks(form) {
    var base = getCheckedValueByName(form, "pages_marks", "none");
    if (base === "none") return 10.0;

    var multi = isMultiYes(form, "pages_marks");

    switch (base) {
      case "small_pencil":  return multi ? 3.0 : 4.0;
      case "marker_heavy":  return multi ? 0.5 : 1.5;
      case "coloring":      return multi ? 0.0 : 0.5;
      default:              return 10.0;
    }
  }

  function scorePagesWear(form) {
    var v = getCheckedValueByName(form, "pages_wear", "none");
    switch (v) {
      case "none":  return 10.0;
      case "minor": return 5.0;
      case "heavy": return 2.0;
      default:      return 10.0;
    }
  }

  /* -----------------------------
   * Public API: computePagesScore(form)
   * ----------------------------- */
  CGT.computePagesScore = function computePagesScore(form) {
    var elements = [];

    var color      = scorePagesColor(form);
    var stains     = scorePagesStains(form);
    var tears      = scorePagesTears(form);
    var missing    = scorePagesMissing(form);
    var centerfold = scorePagesCenterfold(form);
    var marks      = scorePagesMarks(form);
    var wear       = scorePagesWear(form);

    elements.push({ id: "pages_color",      score: color      });
    elements.push({ id: "pages_stains",     score: stains     });
    elements.push({ id: "pages_tears",      score: tears      });
    elements.push({ id: "pages_missing",    score: missing    });
    elements.push({ id: "pages_centerfold", score: centerfold });
    elements.push({ id: "pages_marks",      score: marks      });
    elements.push({ id: "pages_wear",       score: wear       });

    // Use the same section finalization (penalty model) as Bindery if available
    if (typeof CGT.finalizeSection === "function") {
      return CGT.finalizeSection(elements);
    }

    // Fallback (defensive): min-of-elements only
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
  CGT.scorePages = function scorePages(form) {
    return CGT.computePagesScore(form).finalScore;
  };
})();
