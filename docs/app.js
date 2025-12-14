/*-------------------------------------------------
 * app.js — Comic Grading Tool (Beta)
 * Full consolidated JS (Bindery + Corners in current build)
 *
 * Design goals:
 *  - Centralized multi-location logic (easy future drop-ins)
 *  - No duplicate toggle functions
 *  - Clear section labeling for maintainability
 *-------------------------------------------------*/

/*-------------------------------------------------
 * 1. GRADE SCALE & GRADE PICKER
 *-------------------------------------------------*/

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

function pickGrade(grades, score) {
  let best = grades[grades.length - 1];
  for (const g of grades) {
    if (score >= g.score && g.score >= best.score) {
      best = g;
    }
  }
  return best;
}

/*-------------------------------------------------
 * 2. GENERIC FORM HELPERS
 *-------------------------------------------------*/

// Numeric radio group -> number (default 10.0)
function getRadioValue(form, name) {
  const field = form.elements[name];
  if (!field) return 10.0;

  if (field.length === undefined) {
    return field.checked ? (parseFloat(field.value) || 10.0) : 10.0;
  }

  for (const input of field) {
    if (input.checked) return parseFloat(input.value) || 10.0;
  }
  return 10.0;
}

// String radio group -> string (fallback if none selected)
function choiceValue(form, name, fallback) {
  const field = form.elements[name];
  if (!field) return fallback;

  if (field.length === undefined) {
    return field.checked ? field.value : fallback;
  }

  for (const r of field) {
    if (r.checked) return r.value;
  }
  return fallback;
}

// Read checked value from radio group / single input
function getCheckedValue(field) {
  if (!field) return null;

  if (field.length === undefined) {
    return field.checked ? field.value : null;
  }

  for (const input of field) {
    if (input.checked) return input.value;
  }
  return null;
}

// Force a follow-up yes/no radio group to "no"
function forceMultiDefaultNo(form, multiName) {
  const multiField = form.elements[multiName];
  if (!multiField) return;

  if (multiField.length === undefined) {
    if (multiField.value === "no") multiField.checked = true;
    return;
  }

  for (const r of multiField) {
    if (r.value === "no") r.checked = true;
  }
}

/*-------------------------------------------------
 * 3. MULTI-LOCATION TOGGLE (CENTRALIZED)
 *
 * Expected HTML wiring:
 *  - Base radio group name:      base
 *  - Follow-up row element id:   base + "_multi_row"
 *  - Follow-up radio group name: base + "_multi"
 *    values must be "no" and "yes"
 *
 * Rule:
 *  - Show follow-up row ONLY when selected value is in showWhen[]
 *  - Hide otherwise AND auto-reset follow-up to "no"
 *-------------------------------------------------*/

const MULTI_LOCATION_RULES = [
  /*-----------------------------------------------
   * CORNERS — Sharpness / Blunting
   * HTML values: none / slight / moderate / heavy
   *-----------------------------------------------*/
  { base: "corner_blunt_front", showWhen: ["slight", "moderate", "heavy"] },
  { base: "corner_blunt_back",  showWhen: ["slight", "moderate", "heavy"] },

  /*-----------------------------------------------
   * CORNERS — Creases
   * HTML values: none / short_nobreak / long_color / multi_severe
   *-----------------------------------------------*/
  { base: "corner_crease_front", showWhen: ["short_nobreak", "long_color", "multi_severe"] },
  { base: "corner_crease_back",  showWhen: ["short_nobreak", "long_color", "multi_severe"] },

  /*-----------------------------------------------
   * CORNERS — Fraying
   * HTML values: none / fray
   *-----------------------------------------------*/
  { base: "corner_fray_front", showWhen: ["fray"] },
  { base: "corner_fray_back",  showWhen: ["fray"] },

  /*-----------------------------------------------
   * CORNERS — Delamination
   * HTML values: none / delam
   *-----------------------------------------------*/
  { base: "corner_delam_front", showWhen: ["delam"] },
  { base: "corner_delam_back",  showWhen: ["delam"] },

  /*-----------------------------------------------
   * EDGES — Cleanliness / Sharpness
   * HTML values: none / slight / heavy_intact
   *-----------------------------------------------*/
  { base: "edge_clean_front", showWhen: ["slight", "heavy_intact"] },
  { base: "edge_clean_back",  showWhen: ["slight", "heavy_intact"] },

  /*-----------------------------------------------
   * EDGES — Chipping
   * HTML values: none / minor / heavy
   *-----------------------------------------------*/
  { base: "edge_chip_front", showWhen: ["minor", "heavy"] },
  { base: "edge_chip_back",  showWhen: ["minor", "heavy"] },

  /*-----------------------------------------------
   * EDGES — Nicks / Cuts
   * HTML values:
   *  none / small_1_16_to_1_4 / large_gt_1_4_no_art / large_gt_1_4_into_art
   *-----------------------------------------------*/
  { base: "edge_nicks_front", showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },
  { base: "edge_nicks_back",  showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },

  /*-----------------------------------------------
   * EDGES — Tears
   * HTML values:
   *  none / lt_1_4_clean / multi_gt_1_4_no_art / into_art_readability
   *-----------------------------------------------*/
  { base: "edge_tears_front", showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },
  { base: "edge_tears_back",  showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },

  /*-----------------------------------------------
   * EDGES — Edge Creases
   * HTML values:
   *  none / tiny_no_break / with_color_break / multi_deep
   *-----------------------------------------------*/
  { base: "edge_crease_front", showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },
  { base: "edge_crease_back",  showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },

  /*-----------------------------------------------
   * EDGES — Overhang Damage
   * HTML values: none / minor / major / loss_material
   *-----------------------------------------------*/
  { base: "edge_overhang_front", showWhen: ["minor", "major", "loss_material"] },
  { base: "edge_overhang_back",  showWhen: ["minor", "major", "loss_material"] },

  /*-----------------------------------------------
   * EDGES — Staining/Soiling
   * HTML values: none / light_dirt / staining / dirt_and_staining
   *-----------------------------------------------*/
  { base: "edge_soil_front", showWhen: ["light_dirt", "staining", "dirt_and_staining"] },
  { base: "edge_soil_back",  showWhen: ["light_dirt", "staining", "dirt_and_staining"] }
];

  
  /*-----------------------------------------------
   * Future: add new multi-location rules here only
   * Example:
   * { base: "spine_ticks_front", showWhen: ["light", "moderate", "heavy"] }
   *-----------------------------------------------*/

  // Edges — Cleanliness/Sharpness
  { base: "edge_clean_front", showWhen: ["slight", "heavy_intact"] },
  { base: "edge_clean_back",  showWhen: ["slight", "heavy_intact"] },

  // Edges — Chipping
  { base: "edge_chip_front",  showWhen: ["minor", "heavy"] },
  { base: "edge_chip_back",   showWhen: ["minor", "heavy"] },

  // Edges — Nicks/Cuts
  { base: "edge_nicks_front", showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },
  { base: "edge_nicks_back",  showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },

  // Edges — Tears
 { base: "edge_tears_front", showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },
 { base: "edge_tears_back",  showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },

  // Edges — Edge Creases
  { base: "edge_crease_front", showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },
  { base: "edge_crease_back",  showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },

  // Edges — Overhang Damage
  { base: "edge_overhang_front", showWhen: ["minor", "major", "loss_material"] },
  { base: "edge_overhang_back",  showWhen: ["minor", "major", "loss_material"] },

  // Edges — Staining/Soiling
  { base: "edge_soil_front", showWhen: ["light_dirt", "staining", "dirt_and_staining"] },
  { base: "edge_soil_back",  showWhen: ["light_dirt", "staining", "dirt_and_staining"] },
];

// Robust row finder
function findMultiRowElement(baseName) {
  // Your HTML uses id="${base}_multi_row"
  const id = `${baseName}_multi_row`;
  const el = document.getElementById(id);
  if (el) return el;

  // Fallback patterns if you ever change markup later
  const alt = document.getElementById(`${baseName}-multi-row`);
  if (alt) return alt;

  const dataEl = document.querySelector(`[data-multi-base="${baseName}"]`);
  if (dataEl) return dataEl;

  return null;
}

function setupMultiLocationToggle(form, baseName, showWhenValues) {
  const radios = form.elements[baseName];
  const row = findMultiRowElement(baseName);
  const multiName = `${baseName}_multi`;

  if (!radios || !row) return;

  function updateVisibility() {
    const selected = getCheckedValue(radios) || "none";
    const shouldShow = showWhenValues.includes(selected);

    if (shouldShow) {
      row.style.display = "flex";     // your rows use flex styling
    } else {
      row.style.display = "none";
      forceMultiDefaultNo(form, multiName);
    }
  }

  // listeners
  if (radios.length === undefined) {
    radios.addEventListener("change", updateVisibility);
  } else {
    for (const r of radios) r.addEventListener("change", updateVisibility);
  }

  // initial state
  updateVisibility();
}

function initMultiLocationToggles(form) {
  for (const rule of MULTI_LOCATION_RULES) {
    setupMultiLocationToggle(form, rule.base, rule.showWhen);
  }
}


/*-------------------------------------------------
 * 4. BINDERY SCORING
 *-------------------------------------------------*/

function binderyPenaltyForScore(score) {
  if (score >= 9.95) return 0.0;                    // treat 10 as perfect
  if (score >= 6.1 && score <= 9.9) return 0.1;
  if (score >= 3.1 && score <= 6.0) return 0.5;
  if (score >= 0.0 && score <= 3.0) return 1.0;
  return 0.0;
}

function computeBinderyScore(form) {
  const staplePlacement = Math.min(
    getRadioValue(form, "bind_sp_height"),
    getRadioValue(form, "bind_sp_crooked"),
    getRadioValue(form, "bind_sp_pulling")
  );

  const stapleTightness = Math.min(
    getRadioValue(form, "bind_cover_attach"),
    getRadioValue(form, "bind_centerfold_secure")
  );

  const spineFoldAlign = getRadioValue(form, "bind_spine_align");
  const stapleRust     = getRadioValue(form, "bind_staple_rust");

  const coverTrimCuts = Math.min(
    getRadioValue(form, "bind_trim_uneven"),
    getRadioValue(form, "bind_trim_frayed"),
    getRadioValue(form, "bind_trim_overcut")
  );

  const printingTears = getRadioValue(form, "bind_tears");
  const registration  = getRadioValue(form, "bind_registration");

  const elements = [
    { id: "Staple Placement",                  score: staplePlacement },
    { id: "Staple Tightness & Attachment",     score: stapleTightness },
    { id: "Spine Fold (Bind) Alignment",       score: spineFoldAlign },
    { id: "Staples (Rust)",                    score: stapleRust },
    { id: "Cover Trim and Cuts",               score: coverTrimCuts },
    { id: "Printing/Bindery Tears",            score: printingTears },
    { id: "Cover/Interior Page Registration",  score: registration }
  ];

  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) penaltyTotal += binderyPenaltyForScore(e.score);
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade: pickGrade(GRADES, finalScore),
    elements
  };
}

/*-------------------------------------------------
 * 5. CORNERS SCORING
 *-------------------------------------------------*/

function scoreBlunting(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "slight":   return many ? 9.2 : 9.7;
    case "moderate": return many ? 5.5 : 7.0;
    case "heavy":    return many ? 1.8 : 3.5;
    default:         return 10.0;
  }
}

function scoreCrease(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "short_nobreak": return many ? 8.0 : 8.5;
    case "long_color":    return many ? 5.5 : 6.5;
    case "multi_severe":  return many ? 3.5 : 4.5;
    default:              return 10.0;
  }
}

function scoreColorBreak(choice) {
  switch (choice) {
    case "none":  return 10.0;
    case "minor": return 7.0;
    case "multi": return 3.5;
    default:      return 10.0;
  }
}

function scoreTears(choice) {
  switch (choice) {
    case "none":  return 10.0;
    case "tiny":  return 5.0;
    case "large": return 2.5;
    default:      return 10.0;
  }
}

function scoreMissing(choice) {
  switch (choice) {
    case "none":    return 10.0;
    case "missing": return 2.0;
    default:        return 10.0;
  }
}

function scoreFray(choice, multi) {
  if (choice === "none") return 10.0;
  return (multi === "yes") ? 3.5 : 4.5;
}

function scoreDelam(choice, multi) {
  if (choice === "none") return 10.0;
  return (multi === "yes") ? 3.5 : 4.5;
}

function scoreDirt(choice) {
  switch (choice) {
    case "none":  return 10.0;
    case "light": return 6.0;
    default:      return 10.0;
  }
}

function scoreStain(choice) {
  switch (choice) {
    case "none":  return 10.0;
    case "stain": return 1.8;
    default:      return 10.0;
  }
}

function computeCornersScore(form) {
  /*-----------------------------------------------
   * A. Sharpness / Blunting
   *-----------------------------------------------*/
  const bluntFront = scoreBlunting(
    choiceValue(form, "corner_blunt_front", "none"),
    choiceValue(form, "corner_blunt_front_multi", "no")
  );
  const bluntBack = scoreBlunting(
    choiceValue(form, "corner_blunt_back", "none"),
    choiceValue(form, "corner_blunt_back_multi", "no")
  );
  const sharpnessScore = Math.min(bluntFront, bluntBack);

  /*-----------------------------------------------
   * B. Corner Creases
   *-----------------------------------------------*/
  const creaseFront = scoreCrease(
    choiceValue(form, "corner_crease_front", "none"),
    choiceValue(form, "corner_crease_front_multi", "no")
  );
  const creaseBack = scoreCrease(
    choiceValue(form, "corner_crease_back", "none"),
    choiceValue(form, "corner_crease_back_multi", "no")
  );
  const creaseScore = Math.min(creaseFront, creaseBack);

  /*-----------------------------------------------
   * C. Color Breaks
   *-----------------------------------------------*/
  const colorFront = scoreColorBreak(choiceValue(form, "corner_colorbreak_front", "none"));
  const colorBack  = scoreColorBreak(choiceValue(form, "corner_colorbreak_back", "none"));
  const colorBreakScore = Math.min(colorFront, colorBack);

  /*-----------------------------------------------
   * D. Tears / Chips / Missing Corners
   *-----------------------------------------------*/
  const tearsFront = scoreTears(choiceValue(form, "corner_tears_front", "none"));
  const tearsBack  = scoreTears(choiceValue(form, "corner_tears_back", "none"));
  const missingFront = scoreMissing(choiceValue(form, "corner_missing_front", "none"));
  const missingBack  = scoreMissing(choiceValue(form, "corner_missing_back", "none"));
  const tearsChipsScore = Math.min(tearsFront, tearsBack, missingFront, missingBack);

  /*-----------------------------------------------
   * E. Fraying & Delamination
   *-----------------------------------------------*/
  const frayFront = scoreFray(
    choiceValue(form, "corner_fray_front", "none"),
    choiceValue(form, "corner_fray_front_multi", "no")
  );
  const frayBack = scoreFray(
    choiceValue(form, "corner_fray_back", "none"),
    choiceValue(form, "corner_fray_back_multi", "no")
  );
  const delamFront = scoreDelam(
    choiceValue(form, "corner_delam_front", "none"),
    choiceValue(form, "corner_delam_front_multi", "no")
  );
  const delamBack = scoreDelam(
    choiceValue(form, "corner_delam_back", "none"),
    choiceValue(form, "corner_delam_back_multi", "no")
  );
  const frayDelamScore = Math.min(frayFront, frayBack, delamFront, delamBack);

  /*-----------------------------------------------
   * F. Dirt / Smudges / Stains
   *-----------------------------------------------*/
  const dirtFront = scoreDirt(choiceValue(form, "corner_dirt_front", "none"));
  const dirtBack  = scoreDirt(choiceValue(form, "corner_dirt_back", "none"));
  const stainFront = scoreStain(choiceValue(form, "corner_stain_front", "none"));
  const stainBack  = scoreStain(choiceValue(form, "corner_stain_back", "none"));
  const dirtStainScore = Math.min(dirtFront, dirtBack, stainFront, stainBack);

  const elements = [
    { id: "Sharpness / Blunting",           score: sharpnessScore },
    { id: "Corner Creases",                score: creaseScore },
    { id: "Color Breaks",                  score: colorBreakScore },
    { id: "Tears, Chips, Missing Corners", score: tearsChipsScore },
    { id: "Fraying & Delamination",        score: frayDelamScore },
    { id: "Dirt / Smudges / Stains",       score: dirtStainScore }
  ];

  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) penaltyTotal += binderyPenaltyForScore(e.score);
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade: pickGrade(GRADES, finalScore),
    elements
  };
}

/*-------------------------------------------------
 * EDGES SCORING
 *  - Mirrors bindery model: base = min(elements), penalties applied
 *-------------------------------------------------*/

function scoreEdgeClean(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "slight":       return many ? 9.0 : 9.2;
    case "heavy_intact": return many ? 5.5 : 6.5;
    default:             return 10.0;
  }
}

function scoreEdgeChipping(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "minor": return many ? 3.5 : 4.5;
    case "heavy": return many ? 1.8 : 2.5;
    default:      return 10.0;
  }
}

function scoreEdgeNicksCuts(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "small_1_16_to_1_4":     return many ? 5.0 : 7.0;
    case "large_gt_1_4_no_art":   return many ? 2.0 : 2.5;
    case "large_gt_1_4_into_art": return many ? 1.0 : 1.5;
    default:                      return 10.0;
  }
}

function scoreEdgeTears(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "lt_1_4_clean":          return many ? 5.0 : 7.0;
    case "multi_gt_1_4_no_art":   return many ? 2.0 : 2.5;
    case "into_art_readability":  return many ? 1.0 : 1.5;
    default:                      return 10.0;
  }
}

function scoreEdgeCreases(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "tiny_no_break":     return many ? 7.5 : 8.5;
    case "with_color_break":  return many ? 6.0 : 7.0;
    case "multi_deep":        return many ? 2.5 : 4.5;
    default:                  return 10.0;
  }
}

function scoreEdgeOverhang(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "minor":         return many ? 6.0 : 7.0;
    case "major":         return many ? 4.0 : 5.0; // your text also mentions 3.0; see note below
    case "loss_material": return many ? 1.5 : 2.5;
    default:              return 10.0;
  }
}

function scoreEdgeTrim(choice) {
  switch (choice) {
    case "none":            return 10.0;
    case "slightly_uneven": return 7.0;
    case "very_rough":      return 4.5;
    default:                return 10.0;
  }
}

function scoreEdgeSoiling(choice, multi) {
  if (choice === "none") return 10.0;
  const many = (multi === "yes");
  switch (choice) {
    case "light_dirt":        return many ? 6.0 : 7.0;
    case "staining":          return many ? 1.8 : 2.5;
    case "dirt_and_staining": return many ? 0.5 : 1.5;
    default:                  return 10.0;
  }
}

function computeEdgesScore(form) {
  // 1) Cleanliness / Sharpness
  const cleanFront = scoreEdgeClean(
    choiceValue(form, "edge_clean_front", "none"),
    choiceValue(form, "edge_clean_front_multi", "no")
  );
  const cleanBack = scoreEdgeClean(
    choiceValue(form, "edge_clean_back", "none"),
    choiceValue(form, "edge_clean_back_multi", "no")
  );
  const cleanScore = Math.min(cleanFront, cleanBack);

  // 2) Chipping
  const chipFront = scoreEdgeChipping(
    choiceValue(form, "edge_chip_front", "none"),
    choiceValue(form, "edge_chip_front_multi", "no")
  );
  const chipBack = scoreEdgeChipping(
    choiceValue(form, "edge_chip_back", "none"),
    choiceValue(form, "edge_chip_back_multi", "no")
  );
  const chippingScore = Math.min(chipFront, chipBack);

  // 3) Nicks and Cuts
  const nicksFront = scoreEdgeNicksCuts(
    choiceValue(form, "edge_nicks_front", "none"),
    choiceValue(form, "edge_nicks_front_multi", "no")
  );
  const nicksBack = scoreEdgeNicksCuts(
    choiceValue(form, "edge_nicks_back", "none"),
    choiceValue(form, "edge_nicks_back_multi", "no")
  );
  const nicksCutsScore = Math.min(nicksFront, nicksBack);

  // 4) Tears
  const tearsFront = scoreEdgeTears(
    choiceValue(form, "edge_tears_front", "none"),
    choiceValue(form, "edge_tears_front_multi", "no")
  );
  const tearsBack = scoreEdgeTears(
    choiceValue(form, "edge_tears_back", "none"),
    choiceValue(form, "edge_tears_back_multi", "no")
  );
  const tearsScore = Math.min(tearsFront, tearsBack);

  // 5) Edge Creases
  const creaseFront = scoreEdgeCreases(
    choiceValue(form, "edge_crease_front", "none"),
    choiceValue(form, "edge_crease_front_multi", "no")
  );
  const creaseBack = scoreEdgeCreases(
    choiceValue(form, "edge_crease_back", "none"),
    choiceValue(form, "edge_crease_back_multi", "no")
  );
  const edgeCreaseScore = Math.min(creaseFront, creaseBack);

  // 6) Overhang damage
  const overhangFront = scoreEdgeOverhang(
    choiceValue(form, "edge_overhang_front", "none"),
    choiceValue(form, "edge_overhang_front_multi", "no")
  );
  const overhangBack = scoreEdgeOverhang(
    choiceValue(form, "edge_overhang_back", "none"),
    choiceValue(form, "edge_overhang_back_multi", "no")
  );
  const overhangScore = Math.min(overhangFront, overhangBack);

  // 7) Trim / bindery cuts
  const trimFront = scoreEdgeTrim(choiceValue(form, "edge_trim_front", "none"));
  const trimBack  = scoreEdgeTrim(choiceValue(form, "edge_trim_back", "none"));
  const trimScore = Math.min(trimFront, trimBack);

  // 8) Staining / Soiling
  const soilFront = scoreEdgeSoiling(
    choiceValue(form, "edge_soil_front", "none"),
    choiceValue(form, "edge_soil_front_multi", "no")
  );
  const soilBack = scoreEdgeSoiling(
    choiceValue(form, "edge_soil_back", "none"),
    choiceValue(form, "edge_soil_back_multi", "no")
  );
  const soilScore = Math.min(soilFront, soilBack);

  const elements = [
    { id: "Cleanliness and Sharpness", score: cleanScore },
    { id: "Chipping", score: chippingScore },
    { id: "Nicks and Cuts", score: nicksCutsScore },
    { id: "Tears", score: tearsScore },
    { id: "Edge Creases", score: edgeCreaseScore },
    { id: "Overhang Damage", score: overhangScore },
    { id: "Trim/Bindery Cuts", score: trimScore },
    { id: "Staining or Soiling", score: soilScore }
  ];

  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) penaltyTotal += binderyPenaltyForScore(e.score);
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade: pickGrade(GRADES, finalScore),
    elements
  };
}


/*-------------------------------------------------
 * 6. PLACEHOLDERS FOR FUTURE SECTIONS
 *   Replace these stubs later.
 *-------------------------------------------------*/

function computeSpineScore(form) {
  return {
    finalScore: 10.0,
    baseScore: 10.0,
    penaltyTotal: 0.0,
    grade: pickGrade(GRADES, 10.0),
    elements: [],
    placeholder: true
  };
}

function computePagesScore(form) {
  return {
    finalScore: 10.0,
    baseScore: 10.0,
    penaltyTotal: 0.0,
    grade: pickGrade(GRADES, 10.0),
    elements: [],
    placeholder: true
  };
}

function computeCoverScore(form) {
  return {
    finalScore: 10.0,
    baseScore: 10.0,
    penaltyTotal: 0.0,
    grade: pickGrade(GRADES, 10.0),
    elements: [],
    placeholder: true
  };
}

/*-------------------------------------------------
 * 7. VALUE STAMP LOOKUP DATA
 *   (Your full list as provided)
 *-------------------------------------------------*/

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

  // Astonishing Tales
  "astonishing tales#23": true,
  "astonishing tales#24": true,
  "astonishing tales#25": true,
  "astonishing tales#26": true,
  "astonishing tales#27": true,
  "astonishing tales#28": true,
  "astonishing tales#33": true,

  // Avengers
  "avengers#121": true,
  "avengers#122": true,
  "avengers#123": true,
  "avengers#124": true,
  "avengers#125": true,
  "avengers#126": true,
  "avengers#127": true,
  "avengers#128": true,
  "avengers#129": true,
  "avengers#130": true,
  "avengers#131": true,
  "avengers#132": true,
  "avengers#143": true,
  "avengers#144": true,
  "avengers#147": true,

  // Giant-Size Avengers
  "giant-size avengers#3": true,

  // Captain America
  "captain america#171": true,
  "captain america#172": true,
  "captain america#173": true,
  "captain america#174": true,
  "captain america#175": true,
  "captain america#176": true,
  "captain america#177": true,
  "captain america#178": true,
  "captain america#179": true,
  "captain america#180": true,
  "captain america#181": true,
  "captain america#182": true,
  "captain america#184": true,
  "captain america#192": true,
  "captain america#193": true,
  "captain america#194": true,
  "captain america#195": true,
  "captain america#197": true,
  "captain america#198": true,

  // Captain Marvel
  "captain marvel#32": true,
  "captain marvel#33": true,
  "captain marvel#34": true,
  "captain marvel#35": true,
  "captain marvel#36": true,
  "captain marvel#41": true,
  "captain marvel#42": true,
  "captain marvel#43": true,

  // Champions
  "champions#3": true,
  "champions#4": true,
  "champions#5": true,

  // Conan
  "conan#36": true,
  "conan#37": true,
  "conan#38": true,
  "conan#39": true,
  "conan#40": true,
  "conan#41": true,
  "conan#42": true,
  "conan#43": true,
  "conan#44": true,
  "conan#49": true,
  "conan#59": true,
  "conan#60": true,
  "conan#62": true,

  // Creatures on the Loose
  "creatures on the loose#28": true,
  "creatures on the loose#29": true,
  "creatures on the loose#30": true,
  "creatures on the loose#31": true,
  "creatures on the loose#32": true,
  "creatures on the loose#33": true,
  "creatures on the loose#36": true,

  // Daredevil
  "daredevil#108": true,
  "daredevil#109": true,
  "daredevil#110": true,
  "daredevil#111": true,
  "daredevil#112": true,
  "daredevil#113": true,
  "daredevil#114": true,
  "daredevil#115": true,
  "daredevil#116": true,
  "daredevil#117": true,
  "daredevil#118": true,
  "daredevil#120": true,
  "daredevil#127": true,
  "daredevil#129": true,
  "daredevil#130": true,
  "daredevil#131": true,
  "daredevil#132": true,
  "daredevil#134": true,
  "daredevil#136": true,

  // Defenders
  "defenders#13": true,
  "defenders#15": true,
  "defenders#16": true,
  "defenders#17": true,
  "defenders#19": true,
  "defenders#20": true,
  "defenders#23": true,
  "defenders#31": true,
  "defenders#32": true,
  "defenders#33": true,
  "defenders#35": true,
  "defenders#37": true,
  "defenders#38": true,

  // Giant-Size Defenders
  "giant-size defenders#3": true,

  // Doctor Strange (v2)
  "doctor strange#1": true,
  "doctor strange#2": true,
  "doctor strange#3": true,
  "doctor strange#4": true,
  "doctor strange#5": true,
  "doctor strange#6": true,
  "doctor strange#12": true,
  "doctor strange#13": true,

  // Fantastic Four
  "fantastic four#144": true,
  "fantastic four#145": true,
  "fantastic four#146": true,
  "fantastic four#147": true,
  "fantastic four#149": true,
  "fantastic four#150": true,
  "fantastic four#151": true,
  "fantastic four#152": true,
  "fantastic four#153": true,
  "fantastic four#154": true,
  "fantastic four#155": true,
  "fantastic four#159": true,
  "fantastic four#160": true,
  "fantastic four#166": true,
  "fantastic four#167": true,
  "fantastic four#168": true,
  "fantastic four#170": true,

  // Giant-Size Fantastic Four
  "giant-size fantastic four#4": true,

  // Frankenstein
  "frankenstein#9": true,
  "frankenstein#10": true,
  "frankenstein#11": true,
  "frankenstein#12": true,
  "frankenstein#13": true,
  "frankenstein#14": true,
  "frankenstein#16": true,

  // Ghost Rider
  "ghost rider#5": true,
  "ghost rider#6": true,
  "ghost rider#7": true,
  "ghost rider#8": true,
  "ghost rider#9": true,
  "ghost rider#11": true,
  "ghost rider#16": true,
  "ghost rider#18": true,

  // Giant-Size Creatures / Dracula
  "giant-size creatures#1": true,
  "giant-size dracula#5": true,

  // Incredible Hulk
  "hulk#174": true,
  "hulk#175": true,
  "hulk#176": true,
  "hulk#177": true,
  "hulk#179": true,
  "hulk#180": true,
  "hulk#181": true,
  "hulk#182": true,
  "hulk#183": true,
  "hulk#184": true,
  "hulk#186": true,
  "hulk#195": true,
  "hulk#196": true,
  "hulk#197": true,
  "hulk#198": true,
  "hulk#199": true,
  "hulk#200": true,

  // Inhumans
  "inhumans#3": true,
  "inhumans#6": true,

  // Invaders
  "invaders#1": true,
  "invaders#3": true,
  "invaders#4": true,
  "invaders#7": true,

  // Iron Fist
  "iron fist#1": true,
  "iron fist#3": true,
  "iron fist#4": true,

  // Iron Man
  "iron man#67": true,
  "iron man#68": true,
  "iron man#69": true,
  "iron man#70": true,
  "iron man#71": true,
  "iron man#81": true,
  "iron man#82": true,
  "iron man#83": true,
  "iron man#84": true,
  "iron man#86": true,
  "iron man#87": true,
  "iron man#88": true,

  // Jungle Action
  "jungle action#9": true,
  "jungle action#10": true,
  "jungle action#11": true,
  "jungle action#12": true,
  "jungle action#13": true,
  "jungle action#20": true,
  "jungle action#21": true,

  // Ka-Zar
  "ka-zar#2": true,
  "ka-zar#3": true,
  "ka-zar#4": true,
  "ka-zar#5": true,
  "ka-zar#6": true,
  "ka-zar#8": true,
  "ka-zar#10": true,
  "ka-zar#12": true,
  "ka-zar#15": true,
  "ka-zar#16": true,
  "ka-zar#17": true,

  // Kull
  "kull#13": true,
  "kull#14": true,
  "kull#15": true,

  // Man-Thing
  "man-thing#3": true,
  "man-thing#4": true,
  "man-thing#5": true,
  "man-thing#6": true,
  "man-thing#7": true,
  "man-thing#8": true,
  "man-thing#9": true,
  "man-thing#10": true,
  "man-thing#11": true,
  "man-thing#13": true,
  "man-thing#14": true,

  // Giant-Size Man-Thing
  "giant-size man-thing#3": true,
  "giant-size man-thing#4": true,
  "giant-size man-thing#5": true,

  // Marvel Feature
  "marvel feature#3": true,

  // Marvel Premiere
  "marvel premiere#15": true,
  "marvel premiere#16": true,
  "marvel premiere#17": true,
  "marvel premiere#18": true,
  "marvel premiere#19": true,
  "marvel premiere#20": true,
  "marvel premiere#23": true,
  "marvel premiere#24": true,
  "marvel premiere#25": true,
  "marvel premiere#29": true,
  "marvel premiere#30": true,

  // Marvel Spotlight
  "marvel spotlight#14": true,
  "marvel spotlight#15": true,
  "marvel spotlight#16": true,
  "marvel spotlight#17": true,
  "marvel spotlight#18": true,
  "marvel spotlight#19": true,
  "marvel spotlight#20": true,
  "marvel spotlight#26": true,
  "marvel spotlight#27": true,

  // Marvel Team-Up
  "marvel team-up#19": true,
  "marvel team-up#20": true,
  "marvel team-up#21": true,
  "marvel team-up#22": true,
  "marvel team-up#23": true,
  "marvel team-up#24": true,
  "marvel team-up#25": true,
  "marvel team-up#26": true,
  "marvel team-up#27": true,
  "marvel team-up#28": true,
  "marvel team-up#29": true,
  "marvel team-up#30": true,
  "marvel team-up#33": true,
  "marvel team-up#39": true,
  "marvel team-up#41": true,
  "marvel team-up#42": true,
  "marvel team-up#43": true,
  "marvel team-up#44": true,
  "marvel team-up#45": true,

  // Marvel Two-In-One
  "marvel two-in-one#2": true,
  "marvel two-in-one#3": true,
  "marvel two-in-one#4": true,
  "marvel two-in-one#5": true,
  "marvel two-in-one#6": true,
  "marvel two-in-one#7": true,
  "marvel two-in-one#12": true,
  "marvel two-in-one#13": true,
  "marvel two-in-one#14": true,
  "marvel two-in-one#15": true,
  "marvel two-in-one#18": true,

  // Master of Kung Fu
  "master of kung fu#17": true,
  "master of kung fu#18": true,
  "master of kung fu#19": true,
  "master of kung fu#21": true,
  "master of kung fu#22": true,
  "master of kung fu#23": true,
  "master of kung fu#24": true,
  "master of kung fu#25": true,
  "master of kung fu#31": true,
  "master of kung fu#38": true,
  "master of kung fu#39": true,
  "giant-size master of kung fu#3": true,

  // Omega
  "omega#1": true,
  "omega#2": true,
  "omega#3": true,

  // Power Man
  "power man#18": true,
  "power man#19": true,
  "power man#20": true,
  "power man#21": true,
  "power man#23": true,
  "power man#24": true,
  "power man#29": true,
  "power man#32": true,
  "power man#33": true,

  // Sgt. Fury
  "sgt. fury#118": true,
  "sgt. fury#119": true,
  "sgt. fury#120": true,

  // Skull the Slayer
  "skull the slayer#3": true,
  "skull the slayer#4": true,

  // Son of Satan
  "son of satan#1": true,
  "son of satan#5": true,

  // Strange Tales
  "strange tales#173": true,
  "strange tales#174": true,
  "strange tales#175": true,
  "strange tales#176": true,

  // Sub-Mariner
  "sub-mariner#69": true,
  "sub-mariner#70": true,
  "sub-mariner#71": true,
  "sub-mariner#72": true,

  // Supernatural Thrillers
  "supernatural thrillers#8": true,
  "supernatural thrillers#9": true,
  "supernatural thrillers#11": true,
  "supernatural thrillers#12": true,

  // Super-Villain Team-Up
  "super-villain team-up#4": true,
  "super-villain team-up#5": true,

  // Thor
  "thor#221": true,
  "thor#222": true,
  "thor#223": true,
  "thor#224": true,
  "thor#225": true,
  "thor#226": true,
  "thor#227": true,
  "thor#228": true,
  "thor#229": true,
  "thor#231": true,
  "thor#232": true,
  "thor#235": true,
  "thor#237": true,
  "thor#238": true,
  "thor#243": true,
  "thor#244": true,
  "thor#245": true,
  "thor#246": true,
  "thor#248": true,
  "thor#249": true,

  // Tomb of Dracula
  "tomb of dracula#18": true,
  "tomb of dracula#19": true,
  "tomb of dracula#20": true,
  "tomb of dracula#21": true,
  "tomb of dracula#22": true,
  "tomb of dracula#23": true,
  "tomb of dracula#24": true,
  "tomb of dracula#25": true,
  "tomb of dracula#26": true,
  "tomb of dracula#27": true,
  "tomb of dracula#28": true,
  "tomb of dracula#29": true,
  "tomb of dracula#30": true,
  "tomb of dracula#31": true,
  "tomb of dracula#34": true,
  "tomb of dracula#35": true,
  "tomb of dracula#37": true,
  "tomb of dracula#39": true,
  "tomb of dracula#40": true,
  "tomb of dracula#41": true,
  "tomb of dracula#42": true,
  "tomb of dracula#43": true,
  "tomb of dracula#44": true,
  "tomb of dracula#45": true,

  // War Is Hell
  "war is hell#11": true,
  "war is hell#13": true,

  // Werewolf by Night
  "werewolf by night#15": true,
  "werewolf by night#16": true,
  "werewolf by night#17": true,
  "werewolf by night#19": true,
  "werewolf by night#20": true,
  "werewolf by night#21": true,
  "werewolf by night#22": true,
  "werewolf by night#23": true,
  "werewolf by night#24": true,
  "werewolf by night#25": true,
  "werewolf by night#26": true,
  "werewolf by night#27": true,

  // Worlds Unknown
  "worlds unknown#6": true,
  "worlds unknown#7": true,
  "worlds unknown#8": true
};

const KNOWN_TITLES = Array.from(
  new Set(Object.keys(VALUE_STAMP_INDEX).map(k => k.split("#")[0]))
);

/*-------------------------------------------------
 * 8. TITLE NORMALIZATION & SUGGESTION
 *-------------------------------------------------*/

function normalizeTitle(rawTitle) {
  if (!rawTitle) return "";
  let t = rawTitle.trim().toLowerCase();

  if (t.startsWith("the ")) t = t.slice(4);
  t = t.replace(/\s+/g, " ");

  // common glued words
  t = t.replace(/spiderman/g, "spider-man");
  t = t.replace(/xmen/g, "x-men");
  t = t.replace(/ironman/g, "iron man");
  t = t.replace(/captainamerica/g, "captain america");
  t = t.replace(/doctorstrange/g, "doctor strange");
  t = t.replace(/dr\.\s*strange/g, "doctor strange");
  t = t.replace(/newmutants/g, "new mutants");

  // abbreviations
  t = t.replace(/^asm\s*/, "amazing spider-man ");
  t = t.replace(/^tmnt\s*/, "teenage mutant ninja turtles ");
  t = t.replace(/^tmt\s*/, "teenage mutant turtles ");
  t = t.replace(/^bprd\s*/, "bprd ");
  t = t.replace(/^ff\s*(?!#)/g, "fantastic four ");

  // "x men" -> "x-men"
  t = t.replace(/\bx men\b/g, "x-men");

  // & -> and
  t = t.replace(/ & /g, " and ");

  // strip punctuation
  t = t.replace(/[^a-z0-9\- ]+/g, "");
  t = t.replace(/\s\s+/g, " ");

  return t;
}

function editDistance(a, b) {
  const lenA = a.length;
  const lenB = b.length;
  const dp = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[lenA][lenB];
}

function suggestTitle(rawTitle) {
  const normUser = normalizeTitle(rawTitle);
  if (!normUser || normUser.length < 3) return null;

  let bestTitle = null;
  let bestDistance = Infinity;

  for (const t of KNOWN_TITLES) {
    const d = editDistance(normUser, t);
    if (d < bestDistance) {
      bestDistance = d;
      bestTitle = t;
    }
  }

  if (!bestTitle) return null;
  if (bestDistance === 0) return null;
  if (bestDistance > 3) return null;

  return { normalized: bestTitle, distance: bestDistance };
}

function displayTitleFromNormalized(norm) {
  return norm
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function makeStampKey(title, issue) {
  const normTitle = normalizeTitle(title);
  let normIssue = `${issue}`.trim().toLowerCase();
  normIssue = normIssue.replace(/^#/, "");
  return normTitle + "#" + normIssue;
}

/*-------------------------------------------------
 * 9. DOM INITIALIZATION & EVENT WIRING
 *-------------------------------------------------*/

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("grading-form");
  if (!form) return;

  const resultDiv       = document.getElementById("result");
  const resetBtn        = document.getElementById("reset-btn");
  const printBtn        = document.getElementById("print-btn");

  const titleInput      = document.getElementById("comic_title");
  const issueInput      = document.getElementById("comic_issue");
  const stampFieldset   = document.getElementById("stamp-fieldset");
  const stampHint       = document.getElementById("stamp-hint");
  const titleSuggestion = document.getElementById("title-suggestion");

  const coverInput      = document.getElementById("cover_image");
  const coverPreview    = document.getElementById("cover-preview");

  let stampApplies = false;

  /*-------------------------------------------------
   * Multi-location toggles (RUN EARLY)
   *-------------------------------------------------*/
  initMultiLocationToggles(form);

/* ===== Debug: confirm multi-location wiring is alive ===== */
console.log("[multi] init start", MULTI_LOCATION_RULES.length);

for (const rule of MULTI_LOCATION_RULES) {
  const row = document.getElementById(`${rule.base}_multi_row`);
  const radios = form.elements[rule.base];
  if (!row || !radios) {
    console.warn("[multi] missing wiring:", rule.base, { row: !!row, radios: !!radios });
  }
}
console.log("[multi] init done");
  
  /*-------------------------------------------------
   * Value stamp lookup (title + issue)
   *-------------------------------------------------*/
  function updateStampLookup() {
    const title = titleInput ? titleInput.value.trim() : "";
    const issue = issueInput ? issueInput.value.trim() : "";

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

  /*-------------------------------------------------
   * Title suggestion (Did you mean ... ?)
   *-------------------------------------------------*/
  if (titleInput && titleSuggestion) {
    const runTitleSuggestion = () => {
      const raw = titleInput.value;
      if (!raw.trim()) {
        titleSuggestion.textContent = "";
        return;
      }

      const suggestion = suggestTitle(raw);
      if (!suggestion) {
        titleSuggestion.textContent = "";
        return;
      }

      const display = displayTitleFromNormalized(suggestion.normalized);
      titleSuggestion.innerHTML = `
        Did you mean: <strong>${display}</strong>?
        <button type="button" id="apply-title-suggestion-btn"
                style="margin-left:0.5rem; font-size:0.8rem;">
          Use this
        </button>
      `;

      const applyBtn = document.getElementById("apply-title-suggestion-btn");
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          titleInput.value = display;
          titleSuggestion.textContent = "";
          updateStampLookup();
        });
      }
    };

    titleInput.addEventListener("blur", runTitleSuggestion);
    titleInput.addEventListener("change", runTitleSuggestion);
  }

  /*-------------------------------------------------
   * Cover image upload preview
   *-------------------------------------------------*/
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

  /*-------------------------------------------------
   * Sample-image overlay (press-and-hold)
   *  - Any button with .sample-btn and data-sample-img
   *-------------------------------------------------*/
  const sampleOverlay = document.createElement("div");
  sampleOverlay.id = "sample-overlay";
  sampleOverlay.innerHTML = `<img id="sample-overlay-img" alt="Grading example" />`;
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

  document.querySelectorAll(".sample-btn").forEach((btn) => {
    const imgSrc = btn.getAttribute("data-sample-img");
    if (!imgSrc) return;

    btn.addEventListener("mousedown", () => showSample(imgSrc));
    btn.addEventListener("mouseup", hideSample);
    btn.addEventListener("mouseleave", hideSample);

    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      showSample(imgSrc);
    }, { passive: false });

    btn.addEventListener("touchend", hideSample);
    btn.addEventListener("touchcancel", hideSample);
  });

  /*-------------------------------------------------
   * Submit handler: compute sections and report
   *  - Current build: Bindery + Corners
   *  - Overall score: min(section scores)
   *-------------------------------------------------*/
  if (resultDiv) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

const bindery = computeBinderyScore(form);
const corners = computeCornersScore(form);
const edges   = computeEdgesScore(form);
      
      /*---------------------------------------------
       * Future drop-ins (placeholder wiring)
       *---------------------------------------------
       * const spine = computeSpineScore(form);
       * const pages = computePagesScore(form);
       * const cover = computeCoverScore(form);
       */

const sectionScores = [
  bindery.finalScore,
  corners.finalScore,
  edges.finalScore
  // Future:
  // spine.finalScore,
  // pages.finalScore,
  // cover.finalScore
];


      const overallScore = Math.min(...sectionScores);
      const overallGrade = pickGrade(GRADES, overallScore);

      const titleText = titleInput ? titleInput.value.trim() : "";
      const issueText = issueInput ? issueInput.value.trim() : "";

      const displayHeading = (titleText || issueText)
        ? `${titleText || "Unknown Title"}${issueText ? " #" + issueText : ""}`
        : "Comic Book Grading Report";

      const coverSrc = coverPreview ? coverPreview.src : "";

      resultDiv.innerHTML = `
        <div class="print-header-row">
          <div class="print-main-meta">
            <h2 class="print-book-title">${displayHeading}</h2>

            <p><strong>Overall Grade (current build – Bindery &amp; Corners):</strong>
              ${overallGrade.short} (${overallGrade.label}) – numeric ${overallScore.toFixed(1)}
            </p>

            <h3>Bindery Section</h3>
            <p>
              <strong>Bindery Grade:</strong>
              ${bindery.grade.short} (${bindery.grade.label}) – ${bindery.finalScore.toFixed(1)}<br/>
              <strong>Base score:</strong> ${bindery.baseScore.toFixed(1)}<br/>
              <strong>Total penalties:</strong> ${bindery.penaltyTotal.toFixed(1)}
            </p>
            <ul>
              ${bindery.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
            </ul>

            <h3>Corners Section</h3>
            <p>
              <strong>Corners Grade:</strong>
              ${corners.grade.short} (${corners.grade.label}) – ${corners.finalScore.toFixed(1)}<br/>
              <strong>Base score:</strong> ${corners.baseScore.toFixed(1)}<br/>
              <strong>Total penalties:</strong> ${corners.penaltyTotal.toFixed(1)}
            </p>
            <ul>
              ${corners.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
            </ul>

            <h3>Edges Section</h3>
            <p>
            <strong>Edges Grade:</strong>
            ${edges.grade.short} (${edges.grade.label}) – ${edges.finalScore.toFixed(1)}<br/>
            <strong>Base score:</strong> ${edges.baseScore.toFixed(1)}<br/>
            <strong>Total penalties:</strong> ${edges.penaltyTotal.toFixed(1)}
           </p>
           <ul>
           ${edges.elements.map(e => `<li>${e.id}: ${e.score.toFixed(1)}</li>`).join("")}
           </ul>

            <p><em>Note:</em> Spine, Pages, and Cover sections will be added later.</p>
          </div>

          ${
            coverSrc
              ? `<div class="print-cover-wrapper">
                   <img class="print-cover" src="${coverSrc}" alt="Comic cover preview" />
                 </div>`
              : ""
          }
        </div>
      `;

      resultDiv.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  }

  /*-------------------------------------------------
   * Reset handler
   *  - Clears stamp UI
   *  - Clears report
   *  - Clears cover preview
   *  - Re-applies multi-location visibility + resets hidden to No
   *-------------------------------------------------*/
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

      // Re-apply multi-location visibility rules and default resets
      initMultiLocationToggles(form);
    });
  }

  /*-------------------------------------------------
   * Print handler
   *-------------------------------------------------*/
  if (printBtn && resultDiv) {
    printBtn.addEventListener("click", () => {
      if (!resultDiv.innerHTML.trim()) {
        alert("Please estimate a grade first, then print the results.");
        return;
      }
      window.print();
    });
  }
});
