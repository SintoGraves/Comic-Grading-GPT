// === Grade scale (you can tweak scores/labels as needed) ===
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

// === Spine rules (edge look) ===
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

// === Cover severity rules used for BOTH front and back ===
// You can tweak deductions / caps to match your Excel.
const COVER_SEVERITY = {
  near: {
    key: "near",
    label: "Near Perfect",
    deduction: 0.0,
    max_score: 9.8
  },
  light: {
    key: "light",
    label: "Light Wear",
    deduction: 0.8,
    max_score: 9.0
  },
  moderate: {
    key: "moderate",
    label: "Moderate Wear",
    deduction: 2.0,
    max_score: 7.5
  },
  heavy: {
    key: "heavy",
    label: "Heavy Wear",
    deduction: 4.0,
    max_score: 5.0
  }
};

// Helper: convert numeric score into a grade row from GRADES
function pickGrade(grades, score) {
  // Default to lowest in case score is very low
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("grading-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop page reload

    const spineChoice = form.elements["spine"].value;
    const frontChoice = form.elements["front_cover"].value;
    const backChoice  = form.elements["back_cover"].value;

    const spineRule = SPINE_RULES.find(r => r.id === spineChoice);
    const frontRule = COVER_SEVERITY[frontChoice];
    const backRule  = COVER_SEVERITY[backChoice];

    if (!spineRule || !frontRule || !backRule) {
      resultDiv.innerHTML = "<p>Something went wrong – rule not found.</p>";
      return;
    }

    const baseScore = 10.0;

    // === Section scores ===
    const spineDeduction = spineRule.deduction || 0;
    const frontDeduction = frontRule.deduction || 0;
    const backDeduction  = backRule.deduction || 0;

    const spineOnlyRaw   = baseScore - spineDeduction;
    const spineOnlyScore = Math.min(spineOnlyRaw, spineRule.max_score);
    const spineOnlyGrade = pickGrade(GRADES, spineOnlyScore);

    const frontOnlyRaw   = baseScore - frontDeduction;
    const frontOnlyScore = Math.min(frontOnlyRaw, frontRule.max_score);
    const frontOnlyGrade = pickGrade(GRADES, frontOnlyScore);

    const backOnlyRaw    = baseScore - backDeduction;
    const backOnlyScore  = Math.min(backOnlyRaw, backRule.max_score);
    const backOnlyGrade  = pickGrade(GRADES, backOnlyScore);

    // === Overall / true grade (spine + front + back) ===
    const overallRaw = baseScore - (spineDeduction + frontDeduction + backDeduction);
    const overallScore = Math.min(
      overallRaw,
      spineRule.max_score,
      frontRule.max_score,
      backRule.max_score
    );
    const overallGrade = pickGrade(GRADES, overallScore);

    // === Presentation grade (front view only: spine + FRONT cover) ===
    const presentationRaw = baseScore - (spineDeduction + frontDeduction);
    const presentationScore = Math.min(
      presentationRaw,
      spineRule.max_score,
      frontRule.max_score
    );
    const presentationGrade = pickGrade(GRADES, presentationScore);

    // Build an explanatory note for presentation
    let presentationNote = "";
    if (frontDeduction === 0 && backDeduction === 0) {
      presentationNote = "Spine and covers are near perfect – presentation matches the true grade.";
    } else if (frontDeduction > 0 && backDeduction === 0) {
      presentationNote = "Most visible wear is on the front cover and spine – what you see from the front matches the true grade.";
    } else if (frontDeduction === 0 && backDeduction > 0) {
      presentationNote = "Most visible wear is on the back cover – from the front, the book presents stronger than the overall grade.";
    } else {
      presentationNote = "Both front and back covers show wear – front view still reflects most of the overall condition.";
    }

    // === Output ===
    resultDiv.innerHTML = `
      <h2>Estimated Grades (Spine + Cover Beta)</h2>

      <p><strong>Overall / True Grade:</strong> 
        ${overallGrade.short} (${overallGrade.label})
      </p>

      <p><strong>Presentation Grade (front view only):</strong> 
        ${presentationGrade.short} (${presentationGrade.label})
      </p>

      <p><em>${presentationNote}</em></p>

      <h3>Section Grades</h3>
      <ul>
        <li><strong>Spine / Edge:</strong> 
          ${spineOnlyGrade.short} (${spineOnlyGrade.label}) – ${spineRule.description}
        </li>
        <li><strong>Front Cover:</strong> 
          ${frontOnlyGrade.short} (${frontOnlyGrade.label}) – ${frontRule.label}
        </li>
        <li><strong>Back Cover:</strong> 
          ${backOnlyGrade.short} (${backOnlyGrade.label}) – ${backRule.label}
        </li>
      </ul>

      <p><small>
        Internal scores – Overall: ${overallScore.toFixed(1)}, 
        Presentation: ${presentationScore.toFixed(1)}, 
        Spine-only: ${spineOnlyScore.toFixed(1)}, 
        Front-only: ${frontOnlyScore.toFixed(1)}, 
        Back-only: ${backOnlyScore.toFixed(1)}
      </small></p>
    `;
  });
});
