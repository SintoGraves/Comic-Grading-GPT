// === Grade scale (same core scale, you can tweak later) ===
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

// === Cover severity rules (front + back combined, not location) ===
const COVER_RULES = [
  {
    id: "cover_near_perfect",
    description: "Near perfect – flat, clean, only the lightest signs of handling",
    max_score: 9.8,
    deduction: 0.0
  },
  {
    id: "cover_light_wear",
    description: "Light wear – a few tiny ticks, faint bends, light edge wear, no major creases",
    max_score: 9.0,
    deduction: 0.8
  },
  {
    id: "cover_moderate_wear",
    description: "Moderate wear – several ticks or small creases, some color break, noticeable but not trashed",
    max_score: 7.5,
    deduction: 2.0
  },
  {
    id: "cover_heavy_wear",
    description: "Heavy wear – big creases, strong color breaks, obvious wear or small pieces missing",
    max_score: 5.0,
    deduction: 4.0
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
  const form = document.getElementById("grading-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop page reload

    const spineChoice = form.elements["spine"].value;
    const coverChoice = form.elements["cover"].value;
    const coverLoc    = form.elements["cover_location"].value;

    const spineRule = SPINE_RULES.find(r => r.id === spineChoice);
    const coverRule = COVER_RULES.find(r => r.id === coverChoice);

    if (!spineRule || !coverRule) {
      resultDiv.innerHTML = "<p>Something went wrong – rule not found.</p>";
      return;
    }

    // 1) Technical / structural score (spine + cover combined)
    const baseScore = 10.0;

    const totalDeduction = (spineRule.deduction || 0) + (coverRule.deduction || 0);
    const rawScore = baseScore - totalDeduction;

    const techScore = Math.min(
      spineRule.max_score,
      coverRule.max_score,
      rawScore
    );

    const techGrade = pickGrade(GRADES, techScore);

    // 2) Presentation adjustment based on cover location
    //    (spine is an edge view, so location is driven by cover only)
    let presentationScore = techScore;
    let presentationNote  = "";

    const coverHasRealWear = coverRule.deduction > 0;

    if (!coverHasRealWear) {
      // Near perfect cover: what you see is what it is
      presentationScore = techScore;
      presentationNote  = "Cover presents the same as the technical grade – no significant front or back defects.";
    } else if (coverLoc === "back_only") {
      presentationScore = Math.min(10.0, techScore + 0.7);
      presentationNote  = "Most visible wear is on the back cover – front presents stronger than the full technical grade.";
    } else if (coverLoc === "both") {
      presentationScore = Math.min(10.0, techScore + 0.3);
      presentationNote  = "Wear is on both front and back, but overall presentation may look slightly better at a glance than the raw technical grade.";
    } else {
      // front_only or anything else: what you see is what it is
      presentationScore = techScore;
      presentationNote  = "Most visible wear is on the front cover – presentation matches the technical grade.";
    }

    const presGrade = pickGrade(GRADES, presentationScore);

    // 3) Optional: show component estimates for spine and cover alone
    const spineOnlyScore = Math.min(spineRule.max_score, baseScore - (spineRule.deduction || 0));
    const coverOnlyScore = Math.min(coverRule.max_score, baseScore - (coverRule.deduction || 0));
    const spineOnlyGrade = pickGrade(GRADES, spineOnlyScore);
    const coverOnlyGrade = pickGrade(GRADES, coverOnlyScore);

    resultDiv.innerHTML = `
      <h2>Estimated Grade (Spine + Cover Beta)</h2>

      <p><strong>Overall Technical Grade:</strong> ${techGrade.short} (${techGrade.label})</p>

      <p><strong>Presentation (How it looks at a glance):</strong> 
        ${presGrade.short} (${presGrade.label})
      </p>

      <p><em>${presentationNote}</em></p>

      <h3>Breakdown</h3>
      <ul>
        <li><strong>Spine / Edge:</strong> ${spineOnlyGrade.short} (${spineOnlyGrade.label}) – ${spineRule.description}</li>
        <li><strong>Cover (structural):</strong> ${coverOnlyGrade.short} (${coverOnlyGrade.label}) – ${coverRule.description}</li>
      </ul>

      <p><small>
        Internal scores – Technical: ${techScore.toFixed(1)}, 
        Presentation: ${presentationScore.toFixed(1)}, 
        Spine-only: ${spineOnlyScore.toFixed(1)}, 
        Cover-only: ${coverOnlyScore.toFixed(1)}
      </small></p>
    `;
  });
});
