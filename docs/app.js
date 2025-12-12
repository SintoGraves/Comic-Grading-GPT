"use strict";

/* ============================================================
 * 1. GRADE SCALE
 * ============================================================ */
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

/* ============================================================
 * 2. GENERIC HELPERS
 * ============================================================ */

// Numeric radio: returns 10.0 if nothing selected
function getRadioValue(form, name) {
  const field = form.elements[name];
  if (!field) return 10.0;

  if (field.length === undefined) {
    return parseFloat(field.value) || 10.0;
  }

  for (const input of field) {
    if (input.checked) return parseFloat(input.value) || 10.0;
  }
  return 10.0;
}

// String radio: returns defaultVal if nothing selected
function getRadioChoice(form, name, defaultVal = null) {
  const field = form.elements[name];
  if (!field) return defaultVal;

  if (field.length === undefined) {
    return field.value || defaultVal;
  }

  for (const input of field) {
    if (input.checked) return input.value || defaultVal;
  }
  return defaultVal;
}

// Penalty logic shared by Bindery and Corners
function binderyPenaltyForScore(score) {
  if (score >= 9.95) return 0.0;                    // treat 10 as perfect
  if (score >= 6.1 && score <= 9.9) return 0.1;
  if (score >= 3.1 && score <= 6.0) return 0.5;
  if (score >= 0.0 && score <= 3.0) return 1.0;
  return 0.0;
}

/* ============================================================
 * 3. BINDERY SCORING
 * ============================================================ */
/*
   Elements (each 0–10):
   1. Staple Placement           -> min of 3 sub-elements
   2. Staple Tightness & Attach  -> min of 2 sub-elements
   3. Spine Fold (Bind) Align    -> single sub-element
   4. Staples (Rust)             -> single sub-element
   5. Cover Trim and Cuts        -> min of 3 sub-elements
   6. Printing/Bindery Tears     -> single sub-element
   7. Cover/Interior Registration-> single sub-element

   Base score = lowest element score.
   Other elements contribute penalties:
   - 0–3.0   => 1.0 penalty
   - 3.1–6.0 => 0.5 penalty
   - 6.1–9.9 => 0.1 penalty
   - 10.0    => 0.0 penalty
*/

function computeBinderyScore(form) {
  const staplePlacement = Math.min(
    getRadioValue(form, "bind_sp_height"),     // Staples too high/low or uneven
    getRadioValue(form, "bind_sp_crooked"),    // Staples inserted crooked
    getRadioValue(form, "bind_sp_pulling")     // Staples pulling at the paper
  );

  const stapleTightness = Math.min(
    getRadioValue(form, "bind_cover_attach"),       // Cover firmly attached
    getRadioValue(form, "bind_centerfold_secure")   // Centerfold secure
  );

  const spineFoldAlign   = getRadioValue(form, "bind_spine_align");
  const stapleRust       = getRadioValue(form, "bind_staple_rust");

  const coverTrimCuts = Math.min(
    getRadioValue(form, "bind_trim_uneven"),
    getRadioValue(form, "bind_trim_frayed"),
    getRadioValue(form, "bind_trim_overcut")
  );

  const printingTears    = getRadioValue(form, "bind_tears");
  const registration     = getRadioValue(form, "bind_registration");

  const elements = [
    { id: "Staple Placement",                  score: staplePlacement },
    { id: "Staple Tightness & Attachment",    score: stapleTightness },
    { id: "Spine Fold (Bind) Alignment",      score: spineFoldAlign },
    { id: "Staples (Rust)",                   score: stapleRust },
    { id: "Cover Trim and Cuts",              score: coverTrimCuts },
    { id: "Printing/Bindery Tears",           score: printingTears },
    { id: "Cover/Interior Page Registration", score: registration }
  ];

  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) {
      penaltyTotal += binderyPenaltyForScore(e.score);
    }
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  const grade = pickGrade(GRADES, finalScore);

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade,
    elements
  };
}

/* ============================================================
 * 4. CORNERS SCORING
 * ============================================================ */
/* === Sub-score helpers === */

// Blunting (softening / rounding)
function scoreCornerBlunting(severity, multi) {
  // severity: "none", "slight", "moderate", "heavy"
  switch (severity) {
    case "slight":
      return multi ? 9.2 : 9.7;
    case "moderate":
      return multi ? 5.5 : 7.0;
    case "heavy":
      return multi ? 1.8 : 3.5;
    case "none":
    default:
      return 10.0;
  }
}

// Tiny corner creases
function scoreCornerCrease(level, multi) {
  // level: "none", "small_no_break", "long_with_break", "multiple_severe"
  switch (level) {
    case "small_no_break":
      return multi ? 8.0 : 8.5;
    case "long_with_break":
      return multi ? 5.5 : 6.5;
    case "multiple_severe":
      return multi ? 3.5 : 4.5;
    case "none":
    default:
      return 10.0;
  }
}

// Color breaks
function scoreCornerColorBreak(level) {
  // level: "none", "minor_single", "multiple_prominent"
  switch (level) {
    case "minor_single":
      return 7.0;
    case "multiple_prominent":
      return 3.5;
    case "none":
    default:
      return 10.0;
  }
}

// Tears at corners
function scoreCornerTears(level) {
  // level: "none", "tiny", "large"
  switch (level) {
    case "tiny":
      return 5.0;
    case "large":
      return 2.5;
    case "none":
    default:
      return 10.0;
  }
}

// Missing chunks / chips
function scoreCornerMissing(level) {
  // level: "none", "missing"
  switch (level) {
    case "missing":
      return 2.0;
    case "none":
    default:
      return 10.0;
  }
}

// Fraying
function scoreCornerFray(hasFray, multi) {
  // hasFray: "none" or "yes"
  if (hasFray === "yes") {
    return multi ? 3.5 : 4.5;
  }
  return 10.0;
}

// Delamination
function scoreCornerDelam(hasDelam, multi) {
  // hasDelam: "none" or "yes"
  if (hasDelam === "yes") {
    return multi ? 3.5 : 4.5;
  }
  return 10.0;
}

// Dirt / smudges
function scoreCornerDirt(level) {
  // level: "none", "light"
  if (level === "light") return 6.0;
  return 10.0;
}

// Stains
function scoreCornerStain(level) {
  // level: "none", "present"
  if (level === "present") return 1.8;
  return 10.0;
}

/* === Main Corners score === */

function computeCornersScore(form) {
  // Blunting
  const bluntFrontSeverity = getRadioChoice(form, "corners_blunt_front_severity", "none");
  const bluntFrontMulti = getRadioChoice(form, "corners_blunt_front_multi", "no") === "yes";
  const bluntFrontScore = scoreCornerBlunting(bluntFrontSeverity, bluntFrontMulti);

  const bluntBackSeverity = getRadioChoice(form, "corners_blunt_back_severity", "none");
  const bluntBackMulti = getRadioChoice(form, "corners_blunt_back_multi", "no") === "yes";
  const bluntBackScore = scoreCornerBlunting(bluntBackSeverity, bluntBackMulti);

  const bluntingScore = Math.min(bluntFrontScore, bluntBackScore);

  // Creases
  const creaseFrontLevel = getRadioChoice(form, "corners_crease_front_level", "none");
  const creaseFrontMulti = getRadioChoice(form, "corners_crease_front_multi", "no") === "yes";
  const creaseFrontScore = scoreCornerCrease(creaseFrontLevel, creaseFrontMulti);

  const creaseBackLevel = getRadioChoice(form, "corners_crease_back_level", "none");
  const creaseBackMulti = getRadioChoice(form, "corners_crease_back_multi", "no") === "yes";
  const creaseBackScore = scoreCornerCrease(creaseBackLevel, creaseBackMulti);

  const creaseScore = Math.min(creaseFrontScore, creaseBackScore);

  // Color breaks
  const cbFrontLevel = getRadioChoice(form, "corners_colorbreak_front_level", "none");
  const cbBackLevel  = getRadioChoice(form, "corners_colorbreak_back_level", "none");
  const cbFrontScore = scoreCornerColorBreak(cbFrontLevel);
  const cbBackScore  = scoreCornerColorBreak(cbBackLevel);
  const cbScore      = Math.min(cbFrontScore, cbBackScore);

  // Tears
  const tearFrontLevel = getRadioChoice(form, "corners_tears_front_level", "none");
  const tearBackLevel  = getRadioChoice(form, "corners_tears_back_level", "none");
  const tearFrontScore = scoreCornerTears(tearFrontLevel);
  const tearBackScore  = scoreCornerTears(tearBackLevel);
  const tearScore      = Math.min(tearFrontScore, tearBackScore);

  // Missing chunks
  const missFrontLevel = getRadioChoice(form, "corners_missing_front_level", "none");
  const missBackLevel  = getRadioChoice(form, "corners_missing_back_level", "none");
  const missFrontScore = scoreCornerMissing(missFrontLevel);
  const missBackScore  = scoreCornerMissing(missBackLevel);
  const missingScore   = Math.min(missFrontScore, missBackScore);

  // Fraying
  const frayFrontHas = getRadioChoice(form, "corners_fray_front_has", "none");
  const frayFrontMulti = getRadioChoice(form, "corners_fray_front_multi", "no") === "yes";
  const frayFrontScore = scoreCornerFray(frayFrontHas, frayFrontMulti);

  const frayBackHas = getRadioChoice(form, "corners_fray_back_has", "none");
  const frayBackMulti = getRadioChoice(form, "corners_fray_back_multi", "no") === "yes";
  const frayBackScore = scoreCornerFray(frayBackHas, frayBackMulti);

  const frayScore = Math.min(frayFrontScore, frayBackScore);

  // Delamination
  const delamFrontHas = getRadioChoice(form, "corners_delam_front_has", "none");
  const delamFrontMulti = getRadioChoice(form, "corners_delam_front_multi", "no") === "yes";
  const delamFrontScore = scoreCornerDelam(delamFrontHas, delamFrontMulti);

  const delamBackHas = getRadioChoice(form, "corners_delam_back_has", "none");
  const delamBackMulti = getRadioChoice(form, "corners_delam_back_multi", "no") === "yes";
  const delamBackScore = scoreCornerDelam(delamBackHas, delamBackMulti);

  const delamScore = Math.min(delamFrontScore, delamBackScore);

  // Dirt
  const dirtFrontLevel = getRadioChoice(form, "corners_dirt_front_level", "none");
  const dirtBackLevel  = getRadioChoice(form, "corners_dirt_back_level", "none");
  const dirtFrontScore = scoreCornerDirt(dirtFrontLevel);
  const dirtBackScore  = scoreCornerDirt(dirtBackLevel);
  const dirtScore      = Math.min(dirtFrontScore, dirtBackScore);

  // Stains
  const stainFrontLevel = getRadioChoice(form, "corners_stain_front_level", "none");
  const stainBackLevel  = getRadioChoice(form, "corners_stain_back_level", "none");
  const stainFrontScore = scoreCornerStain(stainFrontLevel);
  const stainBackScore  = scoreCornerStain(stainBackLevel);
  const stainScore      = Math.min(stainFrontScore, stainBackScore);

  const elements = [
    { id: "Corner Sharpness / Blunting", score: bluntingScore },
    { id: "Corner Creases",              score: creaseScore },
    { id: "Corner Color Breaks",         score: cbScore },
    { id: "Tears at Corners",            score: tearScore },
    { id: "Missing Corners / Chips",     score: missingScore },
    { id: "Fraying",                     score: frayScore },
    { id: "Delamination",                score: delamScore },
    { id: "Light Dirt / Smudges",        score: dirtScore },
    { id: "Stains (water, oil, ink)",    score: stainScore }
  ];

  const baseScore = Math.min(...elements.map(e => e.score));

  let penaltyTotal = 0;
  for (const e of elements) {
    if (e.score > baseScore) {
      penaltyTotal += binderyPenaltyForScore(e.score);
    }
  }

  let finalScore = baseScore - penaltyTotal;
  if (finalScore < 0.5) finalScore = 0.5;
  if (finalScore > 10.0) finalScore = 10.0;

  const grade = pickGrade(GRADES, finalScore);

  return {
    finalScore,
    baseScore,
    penaltyTotal,
    grade,
    elements
  };
}

/* ============================================================
 * 5. VALUE STAMP LOOKUP + TITLE NORMALIZATION
 * ============================================================ */

// Lookup: issues that DO contain a Marvel Value Stamp
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

// Known titles list (for suggestions)
const KNOWN_TITLES = Array.from(
  new Set(
    Object.keys(VALUE_STAMP_INDEX).map(key => key.split("#")[0])
  )
);

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

function normalizeTitle(rawTitle) {
  if (!rawTitle) return "";

  let t = rawTitle.trim().toLowerCase();

  if (t.startsWith("the ")) t = t.slice(4);

  t = t.replace(/\s+/g, " ");

  t = t.replace(/spiderman/g, "spider-man");
  t = t.replace(/xmen/g, "x-men");
  t = t.replace(/ironman/g, "iron man");
  t = t.replace(/captainamerica/g, "captain america");
  t = t.replace(/doctorstrange/g, "doctor strange");
  t = t.replace(/dr\.\s*strange/g, "doctor strange");
  t = t.replace(/newmutants/g, "new mutants");

  t = t.replace(/^asm\s*/, "amazing spider-man ");
  t = t.replace(/^tmnt\s*/, "teenage mutant ninja turtles ");
  t = t.replace(/^tmt\s*/, "teenage mutant turtles ");
  t = t.replace(/^bprd\s*/, "bprd ");
  t = t.replace(/^ff\s*(?!#)/g, "fantastic four ");

  t = t.replace(/\bx men\b/g, "x-men");

  t = t.replace(/ & /g, " and ");

  t = t.replace(/[^a-z0-9\- ]+/g, "");
  t = t.replace(/\s\s+/g, " ");

  return t;
}

function makeStampKey(title, issue) {
  const normTitle = normalizeTitle(title);
  let normIssue = `${issue}`.trim().toLowerCase();
  normIssue = normIssue.replace(/^#/, "");
  return normTitle + "#" + normIssue;
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

/* ============================================================
 * 6. DOM INITIALISATION – FORM, STAMP LOOKUP, IMAGE, PRINT
 * ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form            = document.getElementById("grading-form");
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
  const gmCheckbox      = document.getElementById("gm_candidate"); // optional

  if (!form || !resultDiv) return;

  let stampApplies = false;

  // --- Value stamp lookup ---
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

  // --- Title suggestion (non-destructive) ---
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

  // --- Image upload preview ---
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

  // --- Sample overlay for reference images ---
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

  const sampleButtons = document.querySelectorAll(".sample-btn");
  sampleButtons.forEach((btn) => {
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

  /* ------------------------------------------------------------
   * FORM SUBMIT – compute Bindery + Corners and build report
   * ------------------------------------------------------------ */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bindery = computeBinderyScore(form);
    const corners = computeCornersScore(form);

    const sectionScores = [bindery.finalScore, corners.finalScore];
    const overallScore = sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length;
    const overallGrade = pickGrade(GRADES, overallScore);

    const titleText = titleInput ? titleInput.value.trim() : "";
    const issueText = issueInput ? issueInput.value.trim() : "";
    const displayHeading = (titleText || issueText)
      ? `${titleText || "Unknown Title"}${issueText ? " #"+issueText : ""}`
      : "Comic Book Grading Report";

    const coverSrc = (coverPreview && coverPreview.src) ? coverPreview.src : "";

    // Value stamp status (optional radio group in your HTML)
    let stampStatusText = "";
    const stampStatus = getRadioChoice(form, "stamp_status", null);
    if (stampApplies) {
      if (stampStatus) {
        stampStatusText = `This issue is in the value-stamp list. Reported status: ${stampStatus}.`;
      } else {
        stampStatusText = "This issue is in the value-stamp list. Please record the stamp/coupon status.";
      }
    } else {
      stampStatusText = "No value stamp or coupon listed for this issue in the current lookup table.";
    }

    // Optional Gem Mint candidate note
    let gmNote = "";
    if (gmCheckbox && gmCheckbox.checked) {
      gmNote = "Marked as a Gem Mint candidate by the grader.";
    }

    // Build HTML
    resultDiv.innerHTML = `
      <div class="print-header-row">
        <div class="print-main-meta">
          <h2 class="print-book-title">${displayHeading}</h2>

          <p><strong>Overall / True Grade (Bindery + Corners only at this stage):</strong>
            ${overallGrade.short} (${overallGrade.label}) – ${overallScore.toFixed(1)}
          </p>

          ${gmNote ? `<p class="gm-note"><em>${gmNote}</em></p>` : ""}

          <p class="stamp-note"><em>${stampStatusText}</em></p>
        </div>

        ${
          coverSrc
            ? `<div class="print-cover-wrapper">
                 <img class="print-cover" src="${coverSrc}" alt="Comic cover preview" />
               </div>`
            : ""
        }
      </div>

      <div class="print-section-grades">
        <h3>Section Grades</h3>

        <section class="print-section">
          <h4>Bindery</h4>
          <p>
            <strong>Bindery Grade:</strong>
            ${bindery.grade.short} (${bindery.grade.label}) –
            ${bindery.finalScore.toFixed(1)}<br/>
            <strong>Base score (lowest bindery element):</strong>
            ${bindery.baseScore.toFixed(1)}<br/>
            <strong>Total bindery penalties:</strong>
            ${bindery.penaltyTotal.toFixed(1)}
          </p>
          <ul>
            ${bindery.elements.map(e =>
              `<li>${e.id}: ${e.score.toFixed(1)}</li>`
            ).join("")}
          </ul>
        </section>

        <section class="print-section">
          <h4>Corners</h4>
          <p>
            <strong>Corners Grade:</strong>
            ${corners.grade.short} (${corners.grade.label}) –
            ${corners.finalScore.toFixed(1)}<br/>
            <strong>Base score (lowest corner element):</strong>
            ${corners.baseScore.toFixed(1)}<br/>
            <strong>Total corner penalties:</strong>
            ${corners.penaltyTotal.toFixed(1)}
          </p>
          <ul>
            ${corners.elements.map(e =>
              `<li>${e.id}: ${e.score.toFixed(1)}</li>`
            ).join("")}
          </ul>
        </section>
      </div>

      <h3>Internal Scores (for developer reference – hide in print if desired)</h3>
      <p><small>
        Bindery final: ${bindery.finalScore.toFixed(1)} |
        Corners final: ${corners.finalScore.toFixed(1)} |
        Overall: ${overallScore.toFixed(1)}
      </small></p>
    `;

    if (resultDiv.scrollIntoView) {
      resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // --- Reset button ---
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      stampApplies = false;
      if (stampFieldset) stampFieldset.style.display = "none";
      if (stampHint) stampHint.textContent = "";
      if (resultDiv) resultDiv.innerHTML = "";
      if (titleSuggestion) titleSuggestion.textContent = "";
      if (coverPreview) {
        coverPreview.src = "";
        coverPreview.style.display = "none";
      }
    });
  }

  // --- Print button ---
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      if (!resultDiv || !resultDiv.innerHTML.trim()) {
        alert("Please estimate a grade first, then print the results.");
        return;
      }
      window.print();
    });
  }
});
