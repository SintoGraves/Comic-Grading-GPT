/*-------------------------------------------------
 * grading/scoreSpine.js
 * Spine scoring (placeholder)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

CGT.computeSpineScore = function computeSpineScore(_form) {
  return {
    finalScore: 10.0,
    baseScore: 10.0,
    penaltyTotal: 0.0,
    grade: CGT.pickGrade(CGT.GRADES, 10.0),
    elements: [],
    placeholder: true
  };
};
