/*-------------------------------------------------
 * grading/scoreSpine.js
 * Spine scoring
 * Namespace: window.CGT
 *-------------------------------------------------*/
(function () {
  const CGT = (window.CGT = window.CGT || {});

  function getVal(name, def) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : def;
  }

  function minSafe(a, b) {
    if (typeof a !== "number") return b;
    if (typeof b !== "number") return a;
    return Math.min(a, b);
  }

  /* ===============================
     Individual Scorers
  =============================== */

  function scoreSpineStress() {
    const base = getVal("spine_stress", "none");
    if (base === "none") return 10.0;

    const multi = getVal("spine_stress_multi", "no") === "yes";

    switch (base) {
      case "very_faint":
        return multi ? 9.2 : 9.4;
      case "few_minor":
        return multi ? 7.5 : 8.5;
      case "multiple_color_break":
        return multi ? 4.0 : 5.5;
      default:
        return 10.0;
    }
  }

  function scoreSpineRoll() {
    const v = getVal("spine_roll", "none");
    switch (v) {
      case "slight_roll":  return 4.5;
      case "slight_fold": return 3.5;
      case "severe_roll": return 2.5;
      case "severe_fold": return 1.8;
      default:            return 10.0;
    }
  }

  function scoreSpineSplit() {
    const base = getVal("spine_split", "none");
    if (base === "none") return 10.0;

    const multi = getVal("spine_split_multi", "no") === "yes";

    switch (base) {
      case "under_quarter":
        return multi ? 5.5 : 6.5;
      case "half_to_two":
        return multi ? 1.8 : 2.5;
      case "over_two":
        return multi ? 0.5 : 1.0;
      default:
        return 10.0;
    }
  }

  function scoreSpineSurface() {
    const base = getVal("spine_surface", "minimal");
    if (base === "minimal") return 9.7;

    const multi = getVal("spine_surface_multi", "no") === "yes";

    switch (base) {
      case "noticeable":
        return multi ? 6.5 : 8.5;
      case "heavy":
        return multi ? 2.5 : 4.5;
      default:
        return 9.7;
    }
  }

  function scoreSpineTears() {
    const base = getVal("spine_tears", "none");
    if (base === "none") return 10.0;

    const multi = getVal("spine_tears_multi", "no") === "yes";

    switch (base) {
      case "tiny":
        return multi ? 5.5 : 6.5;
      case "chunks":
        return multi ? 1.0 : 2.5;
      default:
        return 10.0;
    }
  }

  /* ===============================
     Public Entry Point
  =============================== */

  CGT.scoreSpine = function () {
    let score = 10.0;

    score = minSafe(score, scoreSpineStress());
    score = minSafe(score, scoreSpineRoll());
    score = minSafe(score, scoreSpineSplit());
    score = minSafe(score, scoreSpineSurface());
    score = minSafe(score, scoreSpineTears());

    return score;
  };
})();
