/*-------------------------------------------------
 * grading/scoreSpine.js
 * Spine scoring (object output consistent with other sections)
 * Namespace: window.CGT
 *-------------------------------------------------*/
(function () {
  "use strict";

  var CGT = (window.CGT = window.CGT || {});

  function pickGradeSafe(score) {
    if (typeof CGT.pickGrade === "function" && CGT.GRADES) {
      return CGT.pickGrade(CGT.GRADES, score);
    }
    // Defensive fallback
    return { short: "NA", label: "Not Available" };
  }

  function getCheckedValueByName(form, name, defVal) {
    try {
      if (form && form.elements && form.elements[name] !== undefined) {
        var group = form.elements[name]; // RadioNodeList or element
        if (group && typeof group.value === "string") {
          return group.value || defVal;
        }
        // Fallback: query selector
      }
    } catch (e) { /* ignore */ }

    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : defVal;
  }

  /* -----------------------------
   * Individual scorers (return numeric)
   * ----------------------------- */

  function scoreSpineStress(form) {
    var base = getCheckedValueByName(form, "spine_stress", "none");
    if (base === "none") return 10.0;

    var multi = (getCheckedValueByName(form, "spine_stress_multi", "no") === "yes");

    switch (base) {
      case "very_faint":            return multi ? 9.2 : 9.4;
      case "few_minor":             return multi ? 7.5 : 8.5;
      case "multiple_color_break":  return multi ? 4.0 : 5.5;
      default:                      return 10.0;
    }
  }

  function scoreSpineRoll(form) {
    var v = getCheckedValueByName(form, "spine_roll", "none");
    switch (v) {
      case "slight_roll":  return 4.5;
      case "slight_fold":  return 3.5;
      case "severe_roll":  return 2.5;
      case "severe_fold":  return 1.8;
      default:             return 10.0;
    }
  }

  function scoreSpineSplit(form) {
    var base = getCheckedValueByName(form, "spine_split", "none");
    if (base === "none") return 10.0;

    var multi = (getCheckedValueByName(form, "spine_split_multi", "no") === "yes");

    switch (base) {
      case "under_quarter": return multi ? 5.5 : 6.5;
      case "half_to_two":   return multi ? 1.8 : 2.5;
      case "over_two":      return multi ? 0.5 : 1.0;
      default:              return 10.0;
    }
  }

  function scoreSpineSurface(form) {
    var base = getCheckedValueByName(form, "spine_surface", "minimal");
    if (base === "minimal") return 9.7;

    var multi = (getCheckedValueByName(form, "spine_surface_multi", "no") === "yes");

    switch (base) {
      case "noticeable": return multi ? 6.5 : 8.5;
      case "heavy":      return multi ? 2.5 : 4.5;
      default:           return 9.7;
    }
  }

  function scoreSpineTears(form) {
    var base = getCheckedValueByName(form, "spine_tears", "none");
    if (base === "none") return 10.0;

    var multi = (getCheckedValueByName(form, "spine_tears_multi", "no") === "yes");

    switch (base) {
      case "tiny":   return multi ? 5.5 : 6.5;
      case "chunks": return multi ? 1.0 : 2.5;
      default:       return 10.0;
    }
  }

  /* -----------------------------
   * Public API: computeSpineScore(form)
   * ----------------------------- */
  CGT.computeSpineScore = function computeSpineScore(form) {
    // element detail list for report
    var elements = [];

    var stress  = scoreSpineStress(form);
    var roll    = scoreSpineRoll(form);
    var splits  = scoreSpineSplit(form);
    var surface = scoreSpineSurface(form);
    var tears   = scoreSpineTears(form);

    elements.push({ id: "spine_stress",  score: stress  });
    elements.push({ id: "spine_roll",    score: roll    });
    elements.push({ id: "spine_split",   score: splits  });
    elements.push({ id: "spine_surface", score: surface });
    elements.push({ id: "spine_tears",   score: tears   });

    // Section score rule: minimum sub-element score
    var baseScore = 10.0;
    for (var i = 0; i < elements.length; i++) {
      var s = elements[i].score;
      if (typeof s === "number" && !isNaN(s)) baseScore = Math.min(baseScore, s);
    }

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

  // Optional compatibility alias (non-breaking)
  CGT.scoreSpine = function scoreSpine(form) {
    return CGT.computeSpineScore(form).finalScore;
  };
})();
