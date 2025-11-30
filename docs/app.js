// Inline grade scale
const GRADES = [
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

// Simple spine rules
const SPINE_RULES = [
  {
    id: "spine_near_perfect",
    description: "Near perfect – no visible stress lines, no roll, no splits, staples clean",
    max_score: 9.6,
    deduction: 0.0
  },
  {
    id: "spine_minor_stress",
    description: "1–2 tiny stress lines, no color break, no roll, no splits",
    max_score: 9.0,
    deduction: 0.6
  },
  {
    id: "spine_multiple_stress_color_break",
    description: "Multiple spine stress lines with color break",
    max_score: 6.0,
    deduction: 3.0
  },
  {
    id: "spine_small_split",
    description: "Small spine split under 1/4 inch",
    max_score: 6.5,
    deduction: 3.0
  },
  {
    id: "spine_large_split_or_roll",
    description: "Spine roll or split over 1 inch",
    max_score: 3.0,
    deduction: 6.0
  }
];

function pickGrade(grades, score) {
  // choose the highest grade whose score is <= given score
  let best = grades[grades.length - 1]; // default to lowest
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("spine-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop page reload

    const chosen = form.elements["spine"].value;
    const rule = SPINE_RULES.find(r => r.id === chosen);

    if (!rule) {
      resultDiv.innerHTML = "<p>Something went wrong – rule not found.</p>";
      return;
    }

    const baseScore = 10.0;
    const rawScore = baseScore - (rule.deduction || 0);
    const finalScore = Math.min(rule.max_score, rawScore);

    const grade = pickGrade(GRADES, finalScore);

    resultDiv.innerHTML = `
      <h2>Estimated Spine Grade</h2>
      <p><strong>${grade.short}</strong> (${grade.label})</p>
      <p><em>Spine rule applied:</em> ${rule.description}</p>
      <p><small>Internal numeric estimate: ${finalScore.toFixed(1)}</small></p>
    `;
  });
});
