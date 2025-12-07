// === Grade scale ===
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
    id: "spine_gm_perfect",
    description: "Perfect (GM-level) – razor-flat spine, no ticks even under strong light, no bindery tears, no roll, no splits, perfectly centered clean staples.",
    max_score: 10.0,
    deduction: 0.0
  },
  {
    id: "spine_near_perfect",
    description: "Near perfect (NM-range) – flat spine, may allow a micro tick or bindery imperfection visible only under close/angled light. No color breaks, no roll, no splits.",
    max_score: 9.8,
    deduction: 0.2
  },
  {
    id: "spine_minor_stress",
    description: "1–2 tiny stress lines, no color break, no roll, no splits.",
    max_score: 9.4,
    deduction: 0.8
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
  perfect: {
    key: "perfect",
    label: "Perfect (GM-level)",
    deduction: 0.0,
    max_score: 10.0
  },
  near: {
    key: "near",
    label: "Near Perfect (NM-range)",
    deduction: 0.2,
    max_score: 9.8
  },
  light: {
    key: "light",
    label: "Light Wear",
    deduction: 0.8,
    max_score: 9.4
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


// === Structural attachment ===
const STRUCT_ATTACHMENT_RULES = {
  intact: {
    key: "intact",
    label: "Cover & centerfold fully attached",
    deduction: 0.0,
    max_score: 10.0   // was 9.8
  },
  loose_one: {
    key: "loose_one",
    label: "Minor looseness / pulls",
    deduction: 0.7,
    max_score: 8.5
  },
  detached_one: {
    key: "detached_one",
    label: "Detached at one staple or partial split",
    deduction: 3.0,
    max_score: 4.5
  },
  detached_both: {
    key: "detached_both",
    label: "Detached at both staples / loose wrap",
    deduction: 5.0,
    max_score: 2.0
  }
};

// === Staple rust ===
const STAPLE_RUST_RULES = {
  clean: {
    key: "clean",
    label: "Clean staples",
    deduction: 0.0,
    max_score: 10.0   // was 9.8
  },
  light: {
    key: "light",
    label: "Light rust, no migration",
    deduction: 0.5,
    max_score: 9.0
  },
  moderate: {
    key: "moderate",
    label: "Moderate rust with small migration",
    deduction: 1.5,
    max_score: 7.0
  },
  heavy: {
    key: "heavy",
    label: "Heavy rust / flaking / strong migration",
    deduction: 3.0,
    max_score: 4.0
  }
};


// === Surface dirt / handling ===
const SURFACE_RULES = {
  perfect: {
    key: "perfect",
    label: "Perfect (GM-level) surface",
    deduction: 0.0,
    max_score: 10.0
  },
  clean: {
    key: "clean",
    label: "Clean (NM-range)",
    deduction: 0.2,
    max_score: 9.8
  },
  light: {
    key: "light",
    label: "Light dirt / smudges",
    deduction: 0.8,
    max_score: 9.4
  },
  moderate: {
    key: "moderate",
    label: "Moderate dirt / abrasion",
    deduction: 1.5,
    max_score: 7.5
  },
  heavy: {
    key: "heavy",
    label: "Heavy dirt / abrasion",
    deduction: 3.0,
    max_score: 5.0
  }
};


// === Color / Gloss rules ===
const GLOSS_RULES = {
  perfect:   { key: "perfect",   label: "Perfect Gloss/Color (GM-level)",  deduction: 0.0, max_score: 10.0 },
  near:      { key: "near",      label: "Near Perfect Gloss/Color",        deduction: 0.2, max_score: 9.8 },
  light:     { key: "light",     label: "Slight Loss of Gloss/Color",      deduction: 0.8, max_score: 9.4 },
  moderate:  { key: "moderate",  label: "Moderate Loss of Gloss/Color",    deduction: 1.5, max_score: 8.0 },
  heavy:     { key: "heavy",     label: "Heavy Loss of Gloss/Color",       deduction: 3.0, max_score: 6.0 }
};

const UV_RULES = {
  none:     { key: "none",     label: "No UV Fade",            deduction: 0.0, max_score: 10.0 },
  light:    { key: "light",    label: "Light UV Fade",         deduction: 1.0, max_score: 8.8 },
  moderate: { key: "moderate", label: "Moderate UV Fade",      deduction: 2.0, max_score: 7.5 },
  heavy:    { key: "heavy",    label: "Heavy UV Fade",         deduction: 3.0, max_score: 5.0 }
};

const COLOR_RULES = {
  clean:    { key: "clean",    label: "Clean Color",                   deduction: 0.0, max_score: 10.0 },
  slight:   { key: "slight",   label: "Slight Color/Foxing Variation", deduction: 0.5, max_score: 9.0 },
  moderate: { key: "moderate", label: "Moderate Color/Foxing Variation", deduction: 1.5, max_score: 7.5 },
  heavy:    { key: "heavy",    label: "Heavy Color/Foxing Variation",  deduction: 3.0, max_score: 5.0 }
};

// === Water / moisture rules ===
const WATER_RULES = {
  none: {
    key: "none",
    label: "No water or moisture defects",
    deduction: 0.0,
    max_score: 10.0   // was 9.8
  },
  light: {
    key: "light",
    label: "Light ripple / very small spot",
    deduction: 1.0,
    max_score: 8.0
  },
  moderate: {
    key: "moderate",
    label: "Moderate tide mark or localized stain",
    deduction: 2.5,
    max_score: 6.0
  },
  heavy: {
    key: "heavy",
    label: "Heavy water damage / large stains",
    deduction: 4.0,
    max_score: 3.0
  }
};


// === Cover writing / stamps / dates ===
const COVER_MARK_RULES = {
  none: {
    key: "none",
    label: "No writing or stamps on cover",
    deduction: 0.0,
    max_score: 10.0   // was 9.8
  },
  small: {
    key: "small",
    label: "Small / minor marks",
    deduction: 0.5,
    max_score: 9.0
  },
  moderate: {
    key: "moderate",
    label: "Moderate writing / stamps",
    deduction: 1.5,
    max_score: 7.0
  },
  heavy: {
    key: "heavy",
    label: "Heavy writing / large stamps",
    deduction: 3.0,
    max_score: 5.0
  }
};

// === Interior page tone rules ===
const PAGE_TONE_RULES = {
  white:            { key: "white",            label: "White",               deduction: 0.0, max_score: 10.0 },
  off_white_white:  { key: "off_white_white",  label: "Off-White to White",  deduction: 0.2, max_score: 9.6 },
  offwhite:         { key: "offwhite",         label: "Off-White",           deduction: 0.5, max_score: 9.0 },
  cream_offwhite:   { key: "cream_offwhite",   label: "Cream to Off-White",  deduction: 1.0, max_score: 8.5 },
  cream:            { key: "cream",            label: "Cream",               deduction: 1.5, max_score: 7.5 },
  light_tan:        { key: "light_tan",        label: "Light Tan",           deduction: 2.5, max_score: 6.0 },
  tan:              { key: "tan",              label: "Tan",                 deduction: 3.5, max_score: 4.0 },
  brittle:          { key: "brittle",          label: "Brittle",             deduction: 5.0, max_score: 2.0 }
};

// === Interior tear rules ===
const INTERIOR_TEAR_RULES = {
  none:        { key: "none",        label: "No Tears",                       deduction: 0.0, max_score: 10.0 },
  small:       { key: "small",       label: "Small Tears",                    deduction: 0.5, max_score: 9.0 },
  multiple:    { key: "multiple",    label: "Multiple Tears / Small Pieces",  deduction: 2.0, max_score: 6.0 },
  big_missing: { key: "big_missing", label: "Big Tears / Pieces Missing",     deduction: 4.0, max_score: 3.0 }
};

// === Interior stain rules ===
const INTERIOR_STAIN_RULES = {
  none:     { key: "none",     label: "No Stains",                     deduction: 0.0, max_score: 10.0 },
  small:    { key: "small",    label: "Small Marks / Light Stains",    deduction: 0.5, max_score: 9.0 },
  moderate: { key: "moderate", label: "Moderate Staining / Writing",   deduction: 1.5, max_score: 7.0 },
  heavy:    { key: "heavy",    label: "Heavy Staining / Water Damage", deduction: 3.0, max_score: 4.0 }
};

// === Marvel Value Stamp / coupon rules ===
const STAMP_RULES = {
  na: {
    key: "na",
    label: "No Stamp / Not Applicable",
    deduction: 0.0,
    max_score: 10.0
  },
  intact: {
    key: "intact",
    label: "Stamp Intact",
    deduction: 0.0,
    max_score: 10.0   // was 9.8
  },
  missing: {
    key: "missing",
    label: "Stamp Missing / Clipped",
    deduction: 4.0,
    max_score: 2.0
  },
  replaced: {
    key: "replaced",
    label: "Stamp Replaced / Married",
    deduction: 3.0,
    max_score: 3.0
  },
  unsure: {
    key: "unsure",
    label: "Stamp Status Unsure",
    deduction: 2.0,
    max_score: 4.0
  }
};


// === Lookup: issues that DO contain a Marvel Value Stamp ===
// (unchanged – your big table)
const VALUE_STAMP_INDEX = {
  // Adventure Into Fear
  "adventure into fear#21": true,
  "adventure into fear#22": true,
  "adventure into fear#23": true,
  "adventure into fear#24": true,
  "adventure into fear#25": true,
  "adventure into fear#26": true,
  "adventure into fear#31": true,

  // Amazing Adventures
  "amazing adventures#23": true,
  "amazing adventures#24": true,
  "amazing adventures#26": true,
  "amazing adventures#27": true,
  "amazing adventures#33": true,
  "amazing adventures#34": true,

  // Amazing Spider-Man
  "amazing spider-man#130": true,
  "amazing spider-man#131": true,
  "amazing spider-man#132": true,
  "amazing spider-man#133": true,
  "amazing spider-man#134": true,
  "amazing spider-man#135": true,
  "amazing spider-man#136": true,
  "amazing spider-man#137": true,
  "amazing spider-man#138": true,
  "amazing spider-man#139": true,
  "amazing spider-man#140": true,
  "amazing spider-man#141": true,
  "amazing spider-man#144": true,
  "amazing spider-man#145": true,
  "amazing spider-man#146": true,
  "amazing spider-man#147": true,
  "amazing spider-man#152": true,
  "amazing spider-man#154": true,
  "amazing spider-man#156": true,
  "amazing spider-man#157": true,

  // ... (rest of your existing VALUE_STAMP_INDEX; unchanged)
  "astonishing tales#23": true,
  "astonishing tales#24": true,
  "astonishing tales#25": true,
  "astonishing tales#26": true,
  "astonishing tales#27": true,
  "astonishing tales#28": true,
  "astonishing tales#33": true,

  // (keep the rest of the table exactly as you already have it)
  "avengers#121": true,
  "avengers#122": true,
  // etc...
  "worlds unknown#6": true,
  "worlds unknown#7": true,
  "worlds unknown#8": true
};

// === Helper: convert numeric score into nearest grade ===
function pickGrade(grades, score) {
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

// === Helper: compute section from base, deduction, cap ===
function computeSection(baseScore, deduction, maxScore) {
  const raw = baseScore - deduction;
  const score = Math.min(raw, maxScore);
  return { raw, score };
}

// === Helper: normalize title & issue to lookup key ===
function normalizeTitle(rawTitle) {
  if (!rawTitle) return "";

  let t = rawTitle.trim().toLowerCase();

  // Drop leading "the "
  if (t.startsWith("the ")) {
    t = t.slice(4);
  }

  // Collapse multiple spaces
  t = t.replace(/\s+/g, " ");

  // Normalize common variations for Amazing Spider-Man
  // "amazing spiderman" → "amazing spider-man"
  t = t.replace(/spiderman/g, "spider-man");

  // Add more normalizations here over time if needed, e.g.:
  // t = t.replace(/xmen/g, "x-men");

  return t;
}

function makeStampKey(title, issue) {
  const normTitle = normalizeTitle(title);
  let normIssue = `${issue}`.trim().toLowerCase();

  // Strip a leading "#"
  normIssue = normIssue.replace(/^#/, "");

  return normTitle + "#" + normIssue;
}

// === DOMContentLoaded ===

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("grading-form");
  const resultDiv = document.getElementById("result");

  const titleInput = document.getElementById("comic_title");
  const issueInput = document.getElementById("comic_issue");
  const stampFieldset = document.getElementById("stamp-fieldset");
  const stampHint = document.getElementById("stamp-hint");

  const coverInput = document.getElementById("cover_image");
  const coverPreview = document.getElementById("cover-preview");

  let stampApplies = false;
  const resetBtn = document.getElementById("reset-btn");
const printBtn = document.getElementById("print-btn");
const gmCheckbox = document.getElementById("gm_candidate");  // <-- INSERT HERE
  
  function updateStampLookup() {
    const title = titleInput.value.trim();
    const issue = issueInput.value.trim();

    if (!title || !issue) {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      return;
    }

    const key = makeStampKey(title, issue);
    if (VALUE_STAMP_INDEX[key]) {
      stampApplies = true;
      if (stampFieldset) stampFieldset.style.display = "block";
      if (stampHint) {
        stampHint.textContent =
          "This issue is known to include a value stamp or coupon. Please answer the question below.";
      }
    } else {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) {
        stampHint.textContent =
          "No value stamp or coupon is listed for this issue in the current lookup table.";
      }
    }
  }

  if (titleInput && issueInput) {
    titleInput.addEventListener("input", updateStampLookup);
    issueInput.addEventListener("input", updateStampLookup);
  }

  // === Image upload preview ===
  if (coverInput && coverPreview) {
    coverInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        coverPreview.src = ev.target.result;
        coverPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }
  
    // === Reset button: clear form, hide stamp UI, clear result, clear image ===
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      if (resultDiv) resultDiv.innerHTML = "";

      if (coverInput) coverInput.value = "";
      if (coverPreview) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
      }
    });
  }


  // === Print button: print only after a result exists ===
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      if (!resultDiv || !resultDiv.innerHTML.trim()) {
        alert("Please estimate a grade first, then print the results.");
        return;
      }
      window.print();
    });
  }

  // === Sample image overlay (press-and-hold buttons) ===
  const sampleOverlay = document.createElement("div");
  sampleOverlay.id = "sample-overlay";
  sampleOverlay.innerHTML = `
    <img id="sample-overlay-img" alt="Grading example" />
  `;
  document.body.appendChild(sampleOverlay);

  const sampleOverlayImg = sampleOverlay.querySelector("#sample-overlay-img");

  function showSample(src) {
    if (!src) return;
    sampleOverlayImg.src = src;
    sampleOverlay.style.display = "flex";
  }

  function hideSample() {
    sampleOverlay.style.display = "none";
    sampleOverlayImg.src = "";
  }

  // Attach press-and-hold to all .sample-btn
  const sampleButtons = document.querySelectorAll(".sample-btn");

  sampleButtons.forEach((btn) => {
    const imgSrc = btn.getAttribute("data-sample-img");
    if (!imgSrc) return;

    // Mouse: show on mousedown, hide on mouseup/mouseleave
    btn.addEventListener("mousedown", () => showSample(imgSrc));
    btn.addEventListener("mouseup", hideSample);
    btn.addEventListener("mouseleave", hideSample);

    // Touch: show on touchstart, hide on touchend/cancel
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault(); // avoid ghost click
      showSample(imgSrc);
    }, { passive: false });

    btn.addEventListener("touchend", hideSample);
    btn.addEventListener("touchcancel", hideSample);
  });
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const baseScore = 10.0;
         
    // === Read choices from form ===
    const spineChoice        = form.elements["spine"].value;
    const structAttachChoice = form.elements["struct_attach"].value;
    const stapleRustChoice   = form.elements["staple_rust"].value;

    const frontCoverChoice   = form.elements["front_cover"].value;
    const backCoverChoice    = form.elements["back_cover"].value;

    const frontSurfaceChoice = form.elements["front_surface"].value;
    const backSurfaceChoice  = form.elements["back_surface"].value;

    const frontCornerChoice  = form.elements["front_corner"].value;
    const backCornerChoice   = form.elements["back_corner"].value;

    const frontGlossChoice   = form.elements["front_gloss"].value;
    const frontUVChoice      = form.elements["front_uv"].value;
    const frontColorChoice   = form.elements["front_color"].value;
    const frontWaterChoice   = form.elements["front_water"].value;

    const backGlossChoice    = form.elements["back_gloss"].value;
    const backUVChoice       = form.elements["back_uv"].value;
    const backColorChoice    = form.elements["back_color"].value;
    const backWaterChoice    = form.elements["back_water"].value;

    const coverMarksChoice   = form.elements["cover_marks"].value;

    const pageToneChoice     = form.elements["page_tone"].value;
    const interiorTearChoice = form.elements["interior_tears"].value;
    const interiorStainChoice= form.elements["interior_stains"].value;

    let stampRule = STAMP_RULES.na;
if (stampApplies) {
  const stampChoice = form.elements["value_stamp"].value;
  stampRule = STAMP_RULES[stampChoice] || STAMP_RULES.na;
}
  const gmCandidate = gmCheckbox ? gmCheckbox.checked : false;
    
    // === Map to rule objects ===
    const spineRule         = SPINE_RULES.find(r => r.id === spineChoice);
    const structAttachRule  = STRUCT_ATTACHMENT_RULES[structAttachChoice];
    const stapleRustRule    = STAPLE_RUST_RULES[stapleRustChoice];

    const frontCoverRule    = SEVERITY_RULES[frontCoverChoice];
    const backCoverRule     = SEVERITY_RULES[backCoverChoice];

    const frontSurfaceRule  = SURFACE_RULES[frontSurfaceChoice];
    const backSurfaceRule   = SURFACE_RULES[backSurfaceChoice];

    const frontCornerRule   = SEVERITY_RULES[frontCornerChoice];
    const backCornerRule    = SEVERITY_RULES[backCornerChoice];

    const frontGlossRule    = GLOSS_RULES[frontGlossChoice];
    const frontUVRule       = UV_RULES[frontUVChoice];
    const frontColorRule    = COLOR_RULES[frontColorChoice];
    const frontWaterRule    = WATER_RULES[frontWaterChoice];

    const backGlossRule     = GLOSS_RULES[backGlossChoice];
    const backUVRule        = UV_RULES[backUVChoice];
    const backColorRule     = COLOR_RULES[backColorChoice];
    const backWaterRule     = WATER_RULES[backWaterChoice];

    const coverMarksRule    = COVER_MARK_RULES[coverMarksChoice];

    const pageToneRule      = PAGE_TONE_RULES[pageToneChoice];
    const interiorTearRule  = INTERIOR_TEAR_RULES[interiorTearChoice];
    const interiorStainRule = INTERIOR_STAIN_RULES[interiorStainChoice];

    if (
      !spineRule || !structAttachRule || !stapleRustRule ||
      !frontCoverRule || !backCoverRule ||
      !frontSurfaceRule || !backSurfaceRule ||
      !frontCornerRule || !backCornerRule ||
      !frontGlossRule || !frontUVRule || !frontColorRule || !frontWaterRule ||
      !backGlossRule || !backUVRule || !backColorRule || !backWaterRule ||
      !coverMarksRule ||
      !pageToneRule || !interiorTearRule || !interiorStainRule || !stampRule
    ) {
      resultDiv.innerHTML = "<p>Something went wrong – one or more rules were not found.</p>";
      return;
    }

    // === Deductions ===
    const spineDeduction         = spineRule.deduction || 0;
    const structAttachDeduction  = structAttachRule.deduction || 0;
    const stapleRustDeduction    = stapleRustRule.deduction || 0;

    const frontCoverDeduction    = frontCoverRule.deduction || 0;
    const backCoverDeduction     = backCoverRule.deduction || 0;

    const frontSurfaceDeduction  = frontSurfaceRule.deduction || 0;
    const backSurfaceDeduction   = backSurfaceRule.deduction || 0;

    const frontCornerDeduction   = frontCornerRule.deduction || 0;
    const backCornerDeduction    = backCornerRule.deduction || 0;

    const frontGlossDeduction    = frontGlossRule.deduction || 0;
    const frontUVDeduction       = frontUVRule.deduction || 0;
    const frontColorDeduction    = frontColorRule.deduction || 0;
    const frontWaterDeduction    = frontWaterRule.deduction || 0;

    const backGlossDeduction     = backGlossRule.deduction || 0;
    const backUVDeduction        = backUVRule.deduction || 0;
    const backColorDeduction     = backColorRule.deduction || 0;
    const backWaterDeduction     = backWaterRule.deduction || 0;

    const coverMarksDeduction    = coverMarksRule.deduction || 0;

    const pageToneDeduction      = pageToneRule.deduction || 0;
    const interiorTearDeduction  = interiorTearRule.deduction || 0;
    const interiorStainDeduction = interiorStainRule.deduction || 0;

    const stampDeduction         = stampRule.deduction || 0;

    // === Section scores (for display) ===
    const spineSec       = computeSection(baseScore, spineDeduction, spineRule.max_score);
    const spineGrade     = pickGrade(GRADES, spineSec.score);

    const structAttachSec   = computeSection(baseScore, structAttachDeduction, structAttachRule.max_score);
    const structAttachGrade = pickGrade(GRADES, structAttachSec.score);

    const stapleRustSec   = computeSection(baseScore, stapleRustDeduction, stapleRustRule.max_score);
    const stapleRustGrade = pickGrade(GRADES, stapleRustSec.score);

    const frontCoverSec   = computeSection(baseScore, frontCoverDeduction, frontCoverRule.max_score);
    const frontCoverGrade = pickGrade(GRADES, frontCoverSec.score);

    const backCoverSec   = computeSection(baseScore, backCoverDeduction, backCoverRule.max_score);
    const backCoverGrade = pickGrade(GRADES, backCoverSec.score);

    const frontSurfaceSec   = computeSection(baseScore, frontSurfaceDeduction, frontSurfaceRule.max_score);
    const frontSurfaceGrade = pickGrade(GRADES, frontSurfaceSec.score);

    const backSurfaceSec   = computeSection(baseScore, backSurfaceDeduction, backSurfaceRule.max_score);
    const backSurfaceGrade = pickGrade(GRADES, backSurfaceSec.score);

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

    const frontWaterSec   = computeSection(baseScore, frontWaterDeduction, frontWaterRule.max_score);
    const frontWaterGrade = pickGrade(GRADES, frontWaterSec.score);

    const backWaterSec   = computeSection(baseScore, backWaterDeduction, backWaterRule.max_score);
    const backWaterGrade = pickGrade(GRADES, backWaterSec.score);

    const coverMarksSec   = computeSection(baseScore, coverMarksDeduction, coverMarksRule.max_score);
    const coverMarksGrade = pickGrade(GRADES, coverMarksSec.score);

    const pageToneSec   = computeSection(baseScore, pageToneDeduction, pageToneRule.max_score);
    const pageToneGrade = pickGrade(GRADES, pageToneSec.score);

    const interiorTearSec   = computeSection(baseScore, interiorTearDeduction, interiorTearRule.max_score);
    const interiorTearGrade = pickGrade(GRADES, interiorTearSec.score);

    const interiorStainSec   = computeSection(baseScore, interiorStainDeduction, interiorStainRule.max_score);
    const interiorStainGrade = pickGrade(GRADES, interiorStainSec.score);

    const stampSec   = computeSection(baseScore, stampDeduction, stampRule.max_score);
    const stampGrade = pickGrade(GRADES, stampSec.score);

    const interiorSysDeduction = pageToneDeduction + interiorTearDeduction + interiorStainDeduction + stampDeduction;
    const interiorSysMax = Math.min(
      pageToneRule.max_score,
      interiorTearRule.max_score,
      interiorStainRule.max_score,
      stampRule.max_score
    );
    const interiorSysSec   = computeSection(baseScore, interiorSysDeduction, interiorSysMax);
    const interiorSysGrade = pickGrade(GRADES, interiorSysSec.score);

    // === Overall / true grade ===
    const totalDeduction = (
      spineDeduction +
      structAttachDeduction +
      stapleRustDeduction +
      frontCoverDeduction + backCoverDeduction +
      frontSurfaceDeduction + backSurfaceDeduction +
      frontCornerDeduction + backCornerDeduction +
      frontGlossDeduction + backGlossDeduction +
      frontUVDeduction + backUVDeduction +
      frontColorDeduction + backColorDeduction +
      frontWaterDeduction + backWaterDeduction +
      coverMarksDeduction +
      pageToneDeduction + interiorTearDeduction + interiorStainDeduction +
      stampDeduction
    );

    const overallRaw = baseScore - totalDeduction;

    const overallMax = Math.min(
      spineRule.max_score,
      structAttachRule.max_score,
      stapleRustRule.max_score,
      frontCoverRule.max_score,
      backCoverRule.max_score,
      frontSurfaceRule.max_score,
      backSurfaceRule.max_score,
      frontCornerRule.max_score,
      backCornerRule.max_score,
      frontGlossRule.max_score,
      backGlossRule.max_score,
      frontUVRule.max_score,
      backUVRule.max_score,
      frontColorRule.max_score,
      backColorRule.max_score,
      frontWaterRule.max_score,
      backWaterRule.max_score,
      coverMarksRule.max_score,
      pageToneRule.max_score,
      interiorTearRule.max_score,
      interiorStainRule.max_score,
      stampRule.max_score
    );

    let overallScore = Math.min(overallRaw, overallMax);
    let overallGrade = pickGrade(GRADES, overallScore);

    // === Presentation grade (front view only) ===
    const frontPresentationDeduction = (
      spineDeduction +
      structAttachDeduction +
      stapleRustDeduction +
      frontCoverDeduction +
      frontSurfaceDeduction +
      frontCornerDeduction +
      frontGlossDeduction +
      frontUVDeduction +
      frontColorDeduction +
      frontWaterDeduction +
      coverMarksDeduction
    );

    const presentationRaw = baseScore - frontPresentationDeduction;

    const presentationMax = Math.min(
      spineRule.max_score,
      structAttachRule.max_score,
      stapleRustRule.max_score,
      frontCoverRule.max_score,
      frontSurfaceRule.max_score,
      frontCornerRule.max_score,
      frontGlossRule.max_score,
      frontUVRule.max_score,
      frontColorRule.max_score,
      frontWaterRule.max_score,
      coverMarksRule.max_score
    );

    let presentationScore = Math.min(presentationRaw, presentationMax);
    let presentationGrade = pickGrade(GRADES, presentationScore);

    // === If GM candidate and absolutely no deductions, bump to 10.0 ===
    let gmNote = "";
    if (gmCandidate && totalDeduction === 0) {
      overallScore = 10.0;
      overallGrade = pickGrade(GRADES, overallScore);

      presentationScore = 10.0;
      presentationGrade = pickGrade(GRADES, presentationScore);

      gmNote = "Gem Mint override applied: all selected conditions are top-tier with no deductions.";
    }

    // === Visible wear front vs back (for explanation) ===
    const frontVisibleDeduction = (
      frontCoverDeduction +
      frontSurfaceDeduction +
      frontCornerDeduction +
      frontGlossDeduction +
      frontUVDeduction +
      frontColorDeduction +
      frontWaterDeduction +
      coverMarksDeduction
    );

    const backVisibleDeduction = (
      backCoverDeduction +
      backSurfaceDeduction +
      backCornerDeduction +
      backGlossDeduction +
      backUVDeduction +
      backColorDeduction +
      backWaterDeduction
    );

    let presentationNote = "";
    if (frontVisibleDeduction === 0 && backVisibleDeduction === 0 && spineDeduction === 0) {
      presentationNote = "Spine, covers, corners, and color all present near perfect – presentation matches the true grade (interior and stamp included).";
    } else if (frontVisibleDeduction > 0 && backVisibleDeduction === 0) {
      presentationNote = "Most visible wear is on the front (cover, corners, surface, or color/UV/water) and spine – what you see from the front matches the true technical grade.";
    } else if (frontVisibleDeduction === 0 && backVisibleDeduction > 0) {
      presentationNote = "Most visible wear is on the back – from the front, the book presents stronger than the true technical grade (interior or stamp issues may also be a factor).";
    } else {
      presentationNote = "Both front and back show wear – interior condition and stamp status may further lower the technical grade beyond what you see from the front.";
    }

    // === Build display title for printing ===
const titleText = titleInput.value.trim();
const issueText = issueInput.value.trim();

// No more "Estimated Grades" in the heading text itself
const displayHeading = (titleText || issueText)
  ? `${titleText || "Unknown Title"}${issueText ? " #" + issueText : ""}`
  : "Comic Book Grading Report";

const coverSrc = coverPreview ? coverPreview.src : "";
    
           // === Output ===
    resultDiv.innerHTML = `
      <div class="print-header">
        <h2 class="print-book-title">${displayHeading}</h2>

        <div class="print-header-row">
          <div class="print-main-meta">
            <p><strong>Overall / True Grade:</strong>
              ${overallGrade.short} (${overallGrade.label})
            </p>

            <p><strong>Presentation Grade (front view only):</strong>
              ${presentationGrade.short} (${presentationGrade.label})
            </p>

            ${gmNote ? `<p class="gm-note"><em>${gmNote}</em></p>` : ""}

            <p class="presentation-note"><em>${presentationNote}</em></p>
          </div>

          ${
            coverSrc
              ? `<div class="print-cover-wrapper">
                   <img class="print-cover" src="${coverSrc}" alt="Comic cover preview" />
                 </div>`
              : ""
          }
        </div>
      </div>

      <div class="print-section-grades">
        <h3>Section Grades</h3>

      <!-- Spine / Edge section -->
      <section class="print-section">
        <h4>Spine / Edge</h4>
        <ul>
          <li><strong>Spine / Edge:</strong>
            ${spineGrade.short} (${spineGrade.label}) – ${spineRule.description}
          </li>
          <li><strong>Cover / Centerfold Attachment:</strong>
            ${structAttachGrade.short} (${structAttachGrade.label}) – ${structAttachRule.label}
          </li>
          <li><strong>Staple Condition:</strong>
            ${stapleRustGrade.short} (${stapleRustGrade.label}) – ${stapleRustRule.label}
          </li>
        </ul>
      </section>

      <!-- Cover Condition section -->
      <section class="print-section">
        <h4>Cover Condition</h4>
        <ul>
          <li><strong>Front Cover (physical wear):</strong>
            ${frontCoverGrade.short} (${frontCoverGrade.label}) – ${frontCoverRule.label}
          </li>
          <li><strong>Back Cover (physical wear):</strong>
            ${backCoverGrade.short} (${backCoverGrade.label}) – ${backCoverRule.label}
          </li>
          <li><strong>Front Surface Dirt / Handling:</strong>
            ${frontSurfaceGrade.short} (${frontSurfaceGrade.label}) – ${frontSurfaceRule.label}
          </li>
          <li><strong>Back Surface Dirt / Handling:</strong>
            ${backSurfaceGrade.short} (${backSurfaceGrade.label}) – ${backSurfaceRule.label}
          </li>
          <li><strong>Front Corners:</strong>
            ${frontCornerGrade.short} (${frontCornerGrade.label}) – ${frontCornerRule.label}
          </li>
          <li><strong>Back Corners:</strong>
            ${backCornerGrade.short} (${backCornerGrade.label}) – ${backCornerRule.label}
          </li>
        </ul>
      </section>

      <!-- Cover Finish (Color / Gloss / UV / Water) -->
      <section class="print-section">
        <h4>Cover Finish</h4>
        <ul>
          <li><strong>Front Color / Gloss / UV:</strong>
            ${frontColorSysGrade.short} (${frontColorSysGrade.label})
          </li>
          <li><strong>Back Color / Gloss / UV:</strong>
            ${backColorSysGrade.short} (${backColorSysGrade.label})
          </li>
          <li><strong>Front Water / Moisture:</strong>
            ${frontWaterGrade.short} (${frontWaterGrade.label}) – ${frontWaterRule.label}
          </li>
          <li><strong>Back Water / Moisture:</strong>
            ${backWaterGrade.short} (${backWaterGrade.label}) – ${backWaterRule.label}
          </li>
        </ul>
      </section>

      <!-- Markings -->
      <section class="print-section">
        <h4>Markings</h4>
        <ul>
          <li><strong>Cover Writing / Stamps / Dates:</strong>
            ${coverMarksGrade.short} (${coverMarksGrade.label}) – ${coverMarksRule.label}
          </li>
        </ul>
      </section>

      <!-- Interior Pages -->
      <section class="print-section">
        <h4>Interior Pages</h4>
        <ul>
          <li><strong>Page Tone:</strong>
            ${pageToneGrade.short} (${pageToneGrade.label}) – ${pageToneRule.label}
          </li>
          <li><strong>Interior Tears / Pieces Missing:</strong>
            ${interiorTearGrade.short} (${interiorTearGrade.label}) – ${interiorTearRule.label}
          </li>
          <li><strong>Interior Stains / Marks:</strong>
            ${interiorStainGrade.short} (${interiorStainGrade.label}) – ${interiorStainRule.label}
          </li>
          <li><strong>Stamp / Coupon Status:</strong>
            ${stampGrade.short} (${stampGrade.label}) – ${stampRule.label}
          </li>
          <li><strong>Combined Interior (overall):</strong>
            ${interiorSysGrade.short} (${interiorSysGrade.label})
          </li>
        </ul>
      </section>

      <h3>Internal Scores</h3>
      <p><small>
        Internal scores – Overall: ${overallScore.toFixed(1)},
        Presentation: ${presentationScore.toFixed(1)},
        Spine-only: ${spineSec.score.toFixed(1)},
        Structural Attachment-only: ${structAttachSec.score.toFixed(1)},
        Staple-only: ${stapleRustSec.score.toFixed(1)},
        Front Cover-only: ${frontCoverSec.score.toFixed(1)},
        Back Cover-only: ${backCoverSec.score.toFixed(1)},
        Front Surface-only: ${frontSurfaceSec.score.toFixed(1)},
        Back Surface-only: ${backSurfaceSec.score.toFixed(1)},
        Front Corners-only: ${frontCornerSec.score.toFixed(1)},
        Back Corners-only: ${backCornerSec.score.toFixed(1)},
        Front Color/Gloss/UV-only: ${frontColorSysSec.score.toFixed(1)},
        Back Color/Gloss/UV-only: ${backColorSysSec.score.toFixed(1)},
        Front Water-only: ${frontWaterSec.score.toFixed(1)},
        Back Water-only: ${backWaterSec.score.toFixed(1)},
        Cover Marks-only: ${coverMarksSec.score.toFixed(1)},
        Page Tone-only: ${pageToneSec.score.toFixed(1)},
        Interior Tears-only: ${interiorTearSec.score.toFixed(1)},
        Interior Stains-only: ${interiorStainSec.score.toFixed(1)},
        Stamp-only: ${stampSec.score.toFixed(1)},
        Combined Interior-only: ${interiorSysSec.score.toFixed(1)}
            </small></p>
    `;
  });   // <-- closes form.addEventListener("submit", ...)
});     // <-- closes document.addEventListener("DOMContentLoaded", ...)
