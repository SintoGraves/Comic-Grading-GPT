/*-------------------------------------------------
 * grading/scoringUtils.js
 * Shared grade scale, grade picker, penalties, and form helpers
 * Global namespace: window.CGT
 *-------------------------------------------------*/
/* grading/scoringUtils.js
 * Grades + shared helpers
 */
window.CGT = window.CGT || {};

CGT.GRADES = [
  { score: 10.0, code: "GM",    label: "Gem Mint",               short: "10.0 GM" },
  { score: 9.9,  code: "MT",    label: "Mint",                   short: "9.9 MT" },
  { score: 9.8,  code: "NM/MT", label: "Near Mint/Mint",         short: "9.8 NM/MT" },
  { score: 9.6,  code: "NM+",   label: "Near Mint Plus",         short: "9.6 NM+" },
  { score: 9.4,  code: "NM",    label: "Near Mint",              short: "9.4 NM" },
  { score: 9.2,  code: "NM–",   label: "Near Mint Minus",        short: "9.2 NM–" },
  { score: 9.0,  code: "VF/NM", label: "Very Fine/Near Mint",    short: "9.0 VF/NM" },
  { score: 8.5,  code: "VF+",   label: "Very Fine Plus",         short: "8.5 VF+" },
  { score: 8.0,  code: "VF",    label: "Very Fine",              short: "8.0 VF" },
  { score: 7.5,  code: "VF–",   label: "Very Fine Minus",        short: "7.5 VF–" },
  { score: 7.0,  code: "FN/VF", label: "Fine/Very Fine",         short: "7.0 FN/VF" },
  { score: 6.5,  code: "FN+",   label: "Fine Plus",              short: "6.5 FN+" },
  { score: 6.0,  code: "FN",    label: "Fine",                   short: "6.0 FN" },
  { score: 5.5,  code: "FN–",   label: "Fine Minus",             short: "5.5 FN–" },
  { score: 5.0,  code: "VG/FN", label: "Very Good/Fine",         short: "5.0 VG/FN" },
  { score: 4.5,  code: "VG+",   label: "Very Good Plus",         short: "4.5 VG+" },
  { score: 4.0,  code: "VG",    label: "Very Good",              short: "4.0 VG" },
  { score: 3.0,  code: "GD/VG", label: "Good/Very Good",         short: "3.0 GD/VG" },
  { score: 2.0,  code: "GD",    label: "Good",                   short: "2.0 GD" },
  { score: 1.0,  code: "FR",    label: "Fair",                   short: "1.0 FR" },
  { score: 0.5,  code: "PR",    label: "Poor",                   short: "0.5 PR" }
];

CGT.pickGrade = function pickGrade(grades, score) {
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) best = g;
  }
  return best;
};

// Numeric radio group -> number (default 10.0)
CGT.getRadioValue = function getRadioValue(form, name) {
  const field = form.elements[name];
  if (!field) return 10.0;

  if (field.length === undefined) {
    return field.checked ? (parseFloat(field.value) || 10.0) : 10.0;
  }

  for (const input of field) {
    if (input.checked) return parseFloat(input.value) || 10.0;
  }
  return 10.0;
};

// String radio group -> string (fallback if none selected)
CGT.choiceValue = function choiceValue(form, name, fallback) {
  const field = form.elements[name];
  if (!field) return fallback;

  if (field.length === undefined) {
    return field.checked ? field.value : fallback;
  }

  for (const r of field) {
    if (r.checked) return r.value;
  }
  return fallback;
};

// Read checked value from radio group / single input
CGT.getCheckedValue = function getCheckedValue(field) {
  if (!field) return null;

  if (field.length === undefined) {
    return field.checked ? field.value : null;
  }

  for (const input of field) {
    if (input.checked) return input.value;
  }
  return null;
};

// Penalty ladder used across sections
CGT.penaltyForScore = function penaltyForScore(score) {
  if (score >= 9.95) return 0.0;     // treat 10 as perfect
  if (score >= 6.1 && score <= 9.9) return 0.1;
  if (score >= 3.1 && score <= 6.0) return 0.5;
  if (score >= 0.0 && score <= 3.0) return 1.0;
  return 0.0;
};

// Common section reducer: base = min(elements); penalties for others above base
CGT.finalizeSection = function finalizeSection(elements) {
  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) penaltyTotal += CGT.penaltyForScore(e.score);
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade: CGT.pickGrade(CGT.GRADES, finalScore),
    elements
  };
};
