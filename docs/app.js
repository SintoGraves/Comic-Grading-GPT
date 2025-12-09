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


/// === Lookup: issues that DO contain a Marvel Value Stamp ===
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

  // =====================================================
  // 🔧 Title Normalization Rules (do NOT change meaning)
  // =====================================================

  // === Standardize separators & common missing dashes ===
  t = t.replace(/spiderman/g, "spider-man");
  t = t.replace(/xmen/g, "x-men");
  t = t.replace(/ironman/g, "iron man");
  t = t.replace(/captainamerica/g, "captain america");
  t = t.replace(/doctorstrange/g, "doctor strange");
  t = t.replace(/dr\.\s*strange/g, "doctor strange");
  t = t.replace(/newmutants/g, "new mutants");

  // === Normalize abbreviations ===
  t = t.replace(/^asm\s*/, "amazing spider-man ");
  t = t.replace(/^tmnt\s*/, "teenage mutant ninja turtles ");
  t = t.replace(/^tmt\s*/, "teenage mutant turtles ");
  t = t.replace(/^bprd\s*/, "bprd ");
  t = t.replace(/^ff\s*(?!#)/g, "fantastic four "); // avoids breaking FF #52

  // === Normalize “x men” typing errors ===
  t = t.replace(/\bx men\b/g, "x-men");

  // === Normalize “&” to “and” (publishers use “and”) ===
  t = t.replace(/ & /g, " and ");

  // === Remove stray punctuation not part of title ===
  t = t.replace(/[^a-z0-9\- ]+/g, ""); // remove punctuation or emoji etc.
  t = t.replace(/\s\s+/g, " ");        // collapse leftover double spaces

  // =====================================================

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

   // === Overall / true grade (Balanced, Option B) ===

// Keep totalDeduction so GM override still works:
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

// 1. Structural scores: these set the **ceiling**
const structuralScores = [
  spineSec.score,
  structAttachSec.score,
  stapleRustSec.score,
  interiorSysSec.score
];
const minStructuralScore = Math.min(...structuralScores);

// Map lowest structural score to a "Balanced" ceiling
function getStructuralCeiling(score) {
  if (score >= 9.0) return 10.0;  // very strong structure
  if (score >= 7.0) return 8.0;   // solid but not perfect
  if (score >= 5.0) return 6.0;   // mid-grade structure
  if (score >= 3.0) return 4.0;   // low-grade structure
  if (score >= 1.5) return 2.0;   // very weak structure
  return 1.5;                     // worst cases 0.5–1.0
}

const structuralCeiling = getStructuralCeiling(minStructuralScore);

// 2. Group scores (0–10) using averages
const spineGroupScore =
  (spineSec.score + structAttachSec.score + stapleRustSec.score) / 3;

const coverGroupScore =
  (frontCoverSec.score + backCoverSec.score +
   frontSurfaceSec.score + backSurfaceSec.score +
   frontCornerSec.score + backCornerSec.score) / 6;

const finishGroupScore =
  (frontColorSysSec.score + backColorSysSec.score +
   frontWaterSec.score + backWaterSec.score +
   coverMarksSec.score) / 5;

// Interior is already combined as a system
const interiorGroupScore = interiorSysSec.score;

// 3. Balanced weighted score (still 0–10)
const weightedScore =
  spineGroupScore   * 0.35 +
  coverGroupScore   * 0.35 +
  finishGroupScore  * 0.15 +
  interiorGroupScore* 0.15;

// 4. Apply the structural ceiling
let overallScore = Math.min(weightedScore, structuralCeiling);
let overallGrade = pickGrade(GRADES, overallScore);

// 5. Build “why capped” note (if ceiling actually limited it)
let capNote = "";
if (weightedScore > structuralCeiling + 0.05) {
  const limitingParts = [];
  if (spineSec.score === minStructuralScore) {
    limitingParts.push(`Spine / Edge (${spineGrade.short})`);
  }
  if (structAttachSec.score === minStructuralScore) {
    limitingParts.push(`Cover / Centerfold Attachment (${structAttachGrade.short})`);
  }
  if (stapleRustSec.score === minStructuralScore) {
    limitingParts.push(`Staple Condition (${stapleRustGrade.short})`);
  }
  if (interiorSysSec.score === minStructuralScore) {
    limitingParts.push(`Interior (overall) (${interiorSysGrade.short})`);
  }

  capNote = `Overall grade capped at ${overallGrade.short} due to structural limits from: ${limitingParts.join(", ")}.`;
}

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
  capNote = "";  // no cap when everything is perfect
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
      <!-- HEADER ROW: left = grades/meta, right = cover image -->
      <div class="print-header-row">
        <div class="print-main-meta">
          <h2 class="print-book-title">${displayHeading}</h2>

          <p><strong>Overall / True Grade:</strong>
  ${overallGrade.short} (${overallGrade.label})
</p>

<p><strong>Presentation Grade (front view only):</strong>
  ${presentationGrade.short} (${presentationGrade.label})
</p>

${gmNote ? `<p class="gm-note"><em>${gmNote}</em></p>` : ""}
${capNote ? `<p class="cap-note"><em>${capNote}</em></p>` : ""}

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

      <!-- SECTION GRADES LIVE *UNDER* THE HEADER ROW -->
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

        <!-- Cover Condition -->
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

        <!-- Cover Finish -->
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
      </div>

      <!-- Internal Scores (still present, but hidden in print by CSS) -->
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
    
    // Scroll the freshly-built report into view
    if (resultDiv && resultDiv.scrollIntoView) {
      resultDiv.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }); // <-- keep this: closes form.addEventListener("submit", ...)
});   // <-- and this: closes DOMContentLoaded
