/*-------------------------------------------------
 * ui/multiLocation.js
 * Centralized multi-location toggle logic (single implementation)
 * Global namespace: window.CGT
 *-------------------------------------------------*/
/* ui/multiLocation.js
 * Centralized multi-location toggles
 */
window.CGT = window.CGT || {};

CGT.MULTI_LOCATION_RULES = [
  // CORNERS — Sharpness / Blunting
  { base: "corner_blunt_front", showWhen: ["slight", "moderate", "heavy"] },
  { base: "corner_blunt_back",  showWhen: ["slight", "moderate", "heavy"] },

  // CORNERS — Creases
  { base: "corner_crease_front", showWhen: ["short_nobreak", "long_color", "multi_severe"] },
  { base: "corner_crease_back",  showWhen: ["short_nobreak", "long_color", "multi_severe"] },

  // CORNERS — Fraying
  { base: "corner_fray_front", showWhen: ["fray"] },
  { base: "corner_fray_back",  showWhen: ["fray"] },

  // CORNERS — Delamination
  { base: "corner_delam_front", showWhen: ["delam"] },
  { base: "corner_delam_back",  showWhen: ["delam"] },

  // EDGES — Cleanliness / Sharpness
  { base: "edge_clean_front", showWhen: ["slight", "heavy_intact"] },
  { base: "edge_clean_back",  showWhen: ["slight", "heavy_intact"] },

  // EDGES — Chipping
  { base: "edge_chip_front", showWhen: ["minor", "heavy"] },
  { base: "edge_chip_back",  showWhen: ["minor", "heavy"] },

  // EDGES — Nicks / Cuts
  { base: "edge_nicks_front", showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },
  { base: "edge_nicks_back",  showWhen: ["small_1_16_to_1_4", "large_gt_1_4_no_art", "large_gt_1_4_into_art"] },

  // EDGES — Tears
  { base: "edge_tears_front", showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },
  { base: "edge_tears_back",  showWhen: ["lt_1_4_clean", "multi_gt_1_4_no_art", "into_art_readability"] },

  // EDGES — Edge Creases
  { base: "edge_crease_front", showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },
  { base: "edge_crease_back",  showWhen: ["tiny_no_break", "with_color_break", "multi_deep"] },

  // EDGES — Overhang Damage
  { base: "edge_overhang_front", showWhen: ["minor", "major", "loss_material"] },
  { base: "edge_overhang_back",  showWhen: ["minor", "major", "loss_material"] },

  // EDGES — Staining/Soiling
  { base: "edge_soil_front", showWhen: ["light_dirt", "staining", "dirt_and_staining"] },
  { base: "edge_soil_back",  showWhen: ["light_dirt", "staining", "dirt_and_staining"] }
];

CGT.findMultiRowElement = function findMultiRowElement(baseName) {
  const id = `${baseName}_multi_row`;
  const el = document.getElementById(id);
  if (el) return el;

  const alt = document.getElementById(`${baseName}-multi-row`);
  if (alt) return alt;

  const dataEl = document.querySelector(`[data-multi-base="${baseName}"]`);
  if (dataEl) return dataEl;

  return null;
};

CGT.forceMultiDefaultNo = function forceMultiDefaultNo(form, multiName) {
  const multiField = form.elements[multiName];
  if (!multiField) return;

  if (multiField.length === undefined) {
    if (multiField.value === "no") multiField.checked = true;
    return;
  }

  for (const r of multiField) {
    if (r.value === "no") r.checked = true;
  }
};

CGT.setupMultiLocationToggle = function setupMultiLocationToggle(form, baseName, showWhenValues) {
  const radios = form.elements[baseName];
  const row = CGT.findMultiRowElement(baseName);
  const multiName = `${baseName}_multi`;

  if (!radios || !row) return;

  function updateVisibility() {
    const selected = CGT.getCheckedValue(radios) || "none";
    const shouldShow = showWhenValues.includes(selected);

    if (shouldShow) {
      row.style.display = "flex";
    } else {
      row.style.display = "none";
      CGT.forceMultiDefaultNo(form, multiName);
    }
  }

  if (radios.length === undefined) {
    radios.addEventListener("change", updateVisibility);
  } else {
    for (const r of radios) r.addEventListener("change", updateVisibility);
  }

  updateVisibility();
};

CGT.initMultiLocationToggles = function initMultiLocationToggles(form) {
  for (const rule of CGT.MULTI_LOCATION_RULES) {
    CGT.setupMultiLocationToggle(form, rule.base, rule.showWhen);
  }
};
