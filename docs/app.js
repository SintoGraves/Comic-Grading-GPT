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
    description: "Near perfect – no visible stress lines, no roll, no splits, staples clean and tight.",
    max_score: 9.6,
    deduction: 0.0
  },
  {
    id: "spine_minor_stress",
    description: "1–2 tiny stress lines, no color break, no roll, no splits.",
    max_score: 9.0,
    deduction: 0.6
  },
  {
    id: "spine_multiple_stress_color_break",
    description: "Multiple spine stress lines with color break.",
    max_score: 6.0,
    deduction: 3.0
  },
  {
    id: "spine_small_split",
    description: "Small spine split under 1/4 inch.",
    max_score: 6.5,
    deduction: 3.0
  },
  {
    id: "spine_large_split_or_roll",
    description: "Spine roll or split over 1 inch.",
    max_score: 3.0,
    deduction: 6.0
  }
];

// === Severity rules used for cover + corners ===
const SEVERITY_RULES = {
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

// === Color / Gloss rules ===
const GLOSS_RULES = {
  near:     { key: "near",     label: "Near Perfect Gloss/Color",       deduction: 0.0, max_score: 9.8 },
  light:    { key: "light",    label: "Slight Loss of Gloss/Color",     deduction: 0.5, max_score: 9.0 },
  moderate: { key: "moderate", label: "Moderate Loss of Gloss/Color",   deduction: 1.5, max_score: 8.0 },
  heavy:    { key: "heavy",    label: "Heavy Loss of Gloss/Color",      deduction: 3.0, max_score: 6.0 }
};

const UV_RULES = {
  none:     { key: "none",     label: "No UV Fade",                    deduction: 0.0, max_score: 10.0 },
  light:    { key: "light",    label: "Light UV Fade",                 deduction: 1.0, max_score: 8.8 },
  moderate: { key: "moderate", label: "Moderate UV Fade",              deduction: 2.0, max_score: 7.5 },
  heavy:    { key: "heavy",    label: "Heavy UV Fade",                 deduction: 3.0, max_score: 5.0 }
};

const COLOR_RULES = {
  clean:    { key: "clean",    label: "Clean Color",                   deduction: 0.0, max_score: 9.8 },
  slight:   { key: "slight",   label: "Slight Color Variation",        deduction: 0.5, max_score: 9.0 },
  moderate: { key: "moderate", label: "Moderate Color Variation",      deduction: 1.5, max_score: 7.5 },
  heavy:    { key: "heavy",    label: "Heavy Color Variation",         deduction: 3.0, max_score: 5.0 }
};

// === Interior page rules ===
const PAGE_TONE_RULES = {
  white:    { key: "white",    label: "White / OW-W",  deduction: 0.0, max_score: 9.8 },
  offwhite: { key: "offwhite", label: "Off-White",     deduction: 0.5, max_score: 9.0 },
  cream:    { key: "cream",    label: "Cream",         deduction: 1.5, max_score: 7.5 },
  tan:      { key: "tan",      label: "Tan",           deduction: 3.0, max_score: 5.0 },
  brittle:  { key: "brittle",  label: "Brittle",       deduction: 5.0, max_score: 3.0 }
};

const INTERIOR_TEAR_RULES = {
  none:       { key: "none",       label: "No Tears",                            deduction: 0.0, max_score: 9.8 },
  small:      { key: "small",      label: "Small Tears",                         deduction: 1.0, max_score: 8.5 },
  multiple:   { key: "multiple",   label: "Multiple Tears / Small Pieces",       deduction: 2.5, max_score: 6.0 },
  big_missing:{ key: "big_missing",label: "Big Tears / Pieces Missing",          deduction: 4.0, max_score: 3.0 }
};

const INTERIOR_STAIN_RULES = {
  none:     { key: "none",     label: "No Stains",                     deduction: 0.0, max_score: 9.8 },
  small:    { key: "small",    label: "Small Marks / Light Stains",    deduction: 0.5, max_score: 9.0 },
  moderate: { key: "moderate", label: "Moderate Staining / Writing",   deduction: 1.5, max_score: 7.0 },
  heavy:    { key: "heavy",    label: "Heavy Staining / Water Damage", deduction: 3.0, max_score: 4.0 }
};

// Helper: convert numeric score into a grade row from GRADES
function pickGrade(grades, score) {
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

// Helper: compute a section's score from base, deduction, and cap
function computeSection(baseScore, deduction, maxScore) {
  const raw = baseScore - deduction;
  const score = Math.min(raw, maxScore);
  return { raw, score };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("grading-form");
  const resultDiv = document.getElementById("result");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // stop page reload

    const baseScore = 10.0;

    // === Read choices ===
    const spineChoice       = form.elements["spine"].value;
    const frontCoverChoice  = form.elements["front_cover"].value;
    const backCoverChoice   = form.elements["back_cover"].value;
    const frontCornerChoice = form.elements["front_corner"].value;
    const backCornerChoice  = form.elements["back_corner"].value;

    const frontGlossChoice  = form.elements["front_gloss"].value;
    const frontUVChoice     = form.elements["front_uv"]."].value;
    const frontColorChoice  = form.elements["front_color"].value;

    const backGlossChoice   = form.elements["back_gloss"].value;
    const backUVChoice      = form.elements["back_uv"].value;
    const backColorChoice   = form.elements["back_color"].value;

    const pageToneChoice    = form.elements["page_tone"].value;
    const interiorTearChoice   = form.elements["interior_tears"].value;
    const interiorStainChoice  = form.elements["interior_stains"].value;

    const spineRule        = SPINE_RULES.find(r => r.id === spineChoice);
    const frontCoverRule   = SEVERITY_RULES[frontCoverChoice];
    const backCoverRule    = SEVERITY_RULES[backCoverChoice];
    const frontCornerRule  = SEVERITY_RULES[frontCornerChoice];
    const backCornerRule   = SEVERITY_RULES[backCornerChoice];

    const frontGlossRule   = GLOSS_RULES[frontGlossChoice];
    const frontUVRule      = UV_RULES[frontUVChoice];
    const frontColorRule   = COLOR_RULES[frontColorChoice];

    const backGlossRule    = GLOSS_RULES[backGlossChoice];
    const backUVRule       = UV_RULES[backUVChoice];
    const backColorRule    = COLOR_RULES[backColorChoice];

    const pageToneRule     = PAGE_TONE_RULES[pageToneChoice];
    const interiorTearRule = INTERIOR_TEAR_RULES[interiorTearChoice];
    const interiorStainRule= INTERIOR_STAIN_RULES[interiorStainChoice];

    if (!spineRule || !frontCoverRule || !backCoverRule ||
        !frontCornerRule || !backCornerRule ||
        !frontGlossRule || !frontUVRule || !frontColorRule ||
        !backGlossRule || !backUVRule || !backColorRule ||
        !pageToneRule || !interiorTearRule || !interiorStainRule) {
      resultDiv.innerHTML = "<p>Something went wrong – one or more rules were not found.</p>";
      return;
    }

    // === Individual deductions ===
    const spineDeduction        = spineRule.deduction || 0;
    const frontCoverDeduction   = frontCoverRule.deduction || 0;
    const backCoverDeduction    = backCoverRule.deduction || 0;
    const frontCornerDeduction  = frontCornerRule.deduction || 0;
    const backCornerDeduction   = backCornerRule.deduction || 0;

    const frontGlossDeduction   = frontGlossRule.deduction || 0;
    const frontUVDeduction      = frontUVRule.deduction || 0;
    const frontColorDeduction   = frontColorRule.deduction || 0;

    const backGlossDeduction    = backGlossRule.deduction || 0;
    const backUVDeduction       = backUVRule.deduction || 0;
    const backColorDeduction    = backColorRule.deduction || 0;

    const pageToneDeduction     = pageToneRule.deduction || 0;
    const interiorTearDeduction = interiorTearRule.deduction || 0;
    const interiorStainDeduction= interiorStainRule.deduction || 0;

    // === Section scores (for display) ===
    const spineSec     = computeSection(baseScore, spineDeduction, spineRule.max_score);
    const spineGrade   = pickGrade(GRADES, spineSec.score);

    const frontCoverSec   = computeSection(baseScore, frontCoverDeduction, frontCoverRule.max_score);
    const frontCoverGrade = pickGrade(GRADES, frontCoverSec.score);

    const backCoverSec   = computeSection(baseScore, backCoverDeduction, backCoverRule.max_score);
    const backCoverGrade = pickGrade(GRADES, backCoverSec.score);

    const frontCornerSec   = computeSection(baseScore, frontCornerDeduction, frontCornerRule.max_score);
    const frontCornerGrade = pickGrade(GRADES, frontCornerSec.score);

    const backCornerSec   = computeSection(baseScore, backCornerDeduction, backCornerRule.max_score);
    const backCornerGrade = pickGrade(GRADES, backCornerSec.score);

    const frontColorSysDeduction = frontGlossDeduction + frontUVDeduction + frontColorDeduction;
    const frontColorSysMax = Math.min(
      frontGlossRule.max_score,
      frontUVRule.max_score,
      frontColorRule.max_score
    );
    const frontColorSysSec   = computeSection(baseScore, frontColorSysDeduction, frontColorSysMax);
    const frontColorSysGrade = pickGrade(GRADES, frontColorSysSec.score);

    const backColorSysDeduction = backGlossDeduction + backUVDeduction + backColorDeduction;
    const backColorSysMax = Math.min(
      backGlossRule.max_score,
      backUVRule.max_score,
      backColorRule.max_score
    );
    const backColorSysSec   = computeSection(baseScore, backColorSysDeduction, backColorSysMax);
    const backColorSysGrade = pickGrade(GRADES, backColorSysSec.score);

    const pageToneSec   = computeSection(baseScore, pageToneDeduction, pageToneRule.max_score);
    const pageToneGrade = pickGrade(GRADES, pageToneSec.score);

    const interiorTearSec   = computeSection(baseScore, interiorTearDeduction, interiorTearRule.max_score);
    const interiorTearGrade = pickGrade(GRADES, interiorTearSec.score);

    const interiorStainSec   = computeSection(baseScore, interiorStainDeduction, interiorStainRule.max_score);
    const interiorStainGrade = pickGrade(GRADES, interiorStainSec.score);

    // Combined interior system (for debug/feel)
    const interiorSysDeduction = pageToneDeduction + interiorTearDeduction + interiorStainDeduction;
    const interiorSysMax = Math.min(
      pageToneRule.max_score,
      interiorTearRule.max_score,
      interiorStainRule.max_score
    );
    const interiorSysSec   = computeSection(baseScore, interiorSysDeduction, interiorSysMax);
    const interiorSysGrade = pickGrade(GRADES, interiorSysSec.score);

    // === Overall / true grade (everything counted) ===
    const totalDeduction = (
      spineDeduction +
      frontCoverDeduction + backCoverDeduction +
      frontCornerDeduction + backCornerDeduction +
      frontGlossDeduction + backGlossDeduction +
      frontUVDeduction + backUVDeduction +
      frontColorDeduction + backColorDeduction +
      pageToneDeduction + interiorTearDeduction + interiorStainDeduction
    );

    const overallRaw = baseScore - totalDeduction;

    const overallMax = Math.min(
      spineRule.max_score,
      frontCoverRule.max_score,
      backCoverRule.max_score,
      frontCornerRule.max_score,
      backCornerRule.max_score,
      frontGlossRule.max_score,
      backGlossRule.max_score,
      frontUVRule.max_score,
      backUVRule.max_score,
      frontColorRule.max_score,
      backColorRule.max_score,
      pageToneRule.max_score,
      interiorTearRule.max_score,
      interiorStainRule.max_score
    );

    const overallScore = Math.min(overallRaw, overallMax);
    const overallGrade = pickGrade(GRADES, overallScore);

    // === Presentation grade (front view only: no interior) ===
    const frontPresentationDeduction = (
      spineDeduction +
      frontCoverDeduction +
      frontCornerDeduction +
      frontGlossDeduction +
      frontUVDeduction +
      frontColorDeduction
    );

    const presentationRaw = baseScore - frontPresentationDeduction;

    const presentationMax = Math.min(
      spineRule.max_score,
      frontCoverRule.max_score,
      frontCornerRule.max_score,
      frontGlossRule.max_score,
      frontUVRule.max_score,
      frontColorRule.max_score
    );

    const presentationScore = Math.min(presentationRaw, presentationMax);
    const presentationGrade = pickGrade(GRADES, presentationScore);

    // Visible wear for explanation (front vs back; interior is hidden)
    const frontVisibleDeduction = (
      frontCoverDeduction +
      frontCornerDeduction +
      frontGlossDeduction +
      frontUVDeduction +
      frontColorDeduction
    );

    const backVisibleDeduction = (
      backCoverDeduction +
      backCornerDeduction +
      backGlossDeduction +
      backUVDeduction +
      backColorDeduction
    );

    let presentationNote = "";
    if (frontVisibleDeduction === 0 && backVisibleDeduction === 0 && spineDeduction === 0) {
      presentationNote = "Spine, covers, corners, and color all present near perfect – presentation matches the true grade (interior included).";
    } else if (frontVisibleDeduction > 0 && backVisibleDeduction === 0) {
      presentationNote = "Most visible wear is on the front (cover, corners, or color/gloss) and spine – what you see from the front matches the true technical grade.";
    } else if (frontVisibleDeduction === 0 && backVisibleDeduction > 0) {
      presentationNote = "Most visible wear is on the back – from the front, the book presents stronger than the true technical grade (interior wear may also be a factor).";
    } else {
      presentationNote = "Both front and back show wear – interior condition may further lower the technical grade beyond what you see from the front.";
    }

    // === Output ===
    resultDiv.innerHTML = `
      <h2>Estimated Grades (Spine + Cover + Corners + Color/Gloss/UV + Interior)</h2>

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
          ${spineGrade.short} (${spineGrade.label}) – ${spineRule.description}
        </li>
        <li><strong>Front Cover (physical wear):</strong> 
          ${frontCoverGrade.short} (${frontCoverGrade.label}) – ${frontCoverRule.label}
        </li>
        <li><strong>Back Cover (physical wear):</strong> 
          ${backCoverGrade.short} (${backCoverGrade.label}) – ${backCoverRule.label}
        </li>
        <li><strong>Front Corners:</strong> 
          ${frontCornerGrade.short} (${frontCornerGrade.label}) – ${frontCornerRule.label}
        </li>
        <li><strong>Back Corners:</strong> 
          ${backCornerGrade.short} (${backCornerGrade.label}) – ${backCornerRule.label}
        </li>
        <li><strong>Front Color / Gloss / UV:</strong> 
          ${frontColorSysGrade.short} (${frontColorSysGrade.label})
        </li>
        <li><strong>Back Color / Gloss / UV:</strong> 
          ${backColorSysGrade.short} (${backColorSysGrade.label})
        </li>
        <li><strong>Interior Page Tone:</strong> 
          ${pageToneGrade.short} (${pageToneGrade.label}) – ${pageToneRule.label}
        </li>
        <li><strong>Interior Tears / Pieces Missing:</strong> 
          ${interiorTearGrade.short} (${interiorTearGrade.label}) – ${interiorTearRule.label}
        </li>
        <li><strong>Interior Stains / Marks:</strong> 
          ${interiorStainGrade.short} (${interiorStainGrade.label}) – ${interiorStainRule.label}
        </li>
        <li><strong>Combined Interior (overall):</strong> 
          ${interiorSysGrade.short} (${interiorSysGrade.label})
        </li>
      </ul>

      <p><small>
        Internal scores – Overall: ${overallScore.toFixed(1)}, 
        Presentation: ${presentationScore.toFixed(1)}, 
        Spine-only: ${spineSec.score.toFixed(1)}, 
        Front Cover-only: ${frontCoverSec.score.toFixed(1)}, 
        Back Cover-only: ${backCoverSec.score.toFixed(1)},
        Front Corners-only: ${frontCornerSec.score.toFixed(1)}, 
        Back Corners-only: ${backCornerSec.score.toFixed(1)},
        Front Color/Gloss/UV-only: ${frontColorSysSec.score.toFixed(1)},
        Back Color/Gloss/UV-only: ${backColorSysSec.score.toFixed(1)},
        Page Tone-only: ${pageToneSec.score.toFixed(1)},
        Interior Tears-only: ${interiorTearSec.score.toFixed(1)},
        Interior Stains-only: ${interiorStainSec.score.toFixed(1)},
        Combined Interior-only: ${interiorSysSec.score.toFixed(1)}
      </small></p>
    `;
  });
});
