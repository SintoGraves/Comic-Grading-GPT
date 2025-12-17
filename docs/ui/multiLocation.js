/*-------------------------------------------------
 * ui/multiLocation.js
 * Centralized multi-location toggle rules + wiring
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

/*-------------------------------------------------
 * Rules: base radio group -> follow-up row + follow-up yes/no group
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
  { base: "edge_soil_back",  showWhen: ["light_dirt", "staining", "dirt_and_staining"] },

  // SPINE — Stress Lines
  { base: "spine_stress", showWhen: ["very_faint", "few_minor", "multiple_color_break"] },

  // SPINE — Splits
  { base: "spine_split", showWhen: ["under_quarter", "half_to_two", "over_two"] },

  // SPINE — Surface Wear / Color Fading
  { base: "spine_surface", showWhen: ["noticeable", "heavy"] },

  // SPINE — Tears / Chips / Pieces Missing
  { base: "spine_tears", showWhen: ["tiny", "chunks"] },
];

/*-------------------------------------------------
 * Fallback helpers (if not present in scoringUtils.js)
 *-------------------------------------------------*/
CGT.getCheckedValue = CGT.getCheckedValue || function getCheckedValue(radiosOrRadioNodeList) {
  if (!radiosOrRadioNodeList) return null;

  // RadioNodeList (from form.elements[name]) supports .value in modern browsers
  if (typeof radiosOrRadioNodeList.value === "string") {
    return radiosOrRadioNodeList.value || null;
  }

  // Single element
  if (radiosOrRadioNodeList.tagName === "INPUT") {
    return radiosOrRadioNodeList.checked ? radiosOrRadioNodeList.value : null;
  }

  // Collection
  for (const r of radiosOrRadioNodeList) {
    if (r && r.checked) return r.value;
  }
  return null;
};

CGT.forceMultiDefaultNo = CGT.forceMultiDefaultNo || function forceMultiDefaultNo(form, multiName) {
  if (!form || !multiName) return;
  const multi = form.elements[multiName];
  if (!multi) return;

  // RadioNodeList case
  if (multi.length !== undefined) {
    for (const r of multi) {
      if (r && r.value === "no") {
        r.checked = true;
        return;
      }
    }
    // If there is no explicit "no", default to first option
    if (multi[0]) multi[0].checked = true;
    return;
  }

  // Single radio
  if (multi.value !== undefined) {
    multi.value = "no";
  }
};

/*-------------------------------------------------
 * Robust row finder (supports id and optional fallbacks)
 *-------------------------------------------------*/
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

/*-------------------------------------------------
 * Setup one toggle (idempotent / avoids duplicate listeners)
 *-------------------------------------------------*/
CGT.setupMultiLocationToggle = function setupMultiLocationToggle(form, baseName, showWhenValues) {
  if (!form || !baseName || !Array.isArray(showWhenValues)) return;

  const radios = form.elements[baseName];                // RadioNodeList
  const row    = CGT.findMultiRowElement(baseName);      // follow-up row
  const multiName = `${baseName}_multi`;                 // yes/no follow-up group

  if (!radios || !row) return;

  // Prevent duplicate binding if init is called again (e.g., on reset)
  const bindKey = `cgtBound_${baseName}`;
  if (row.dataset && row.dataset[bindKey] === "1") {
    // Still update visibility on re-init
    const selected = CGT.getCheckedValue(radios) || "none";
    const shouldShow = showWhenValues.includes(selected);
    row.style.display = shouldShow ? "flex" : "none";
    if (!shouldShow) CGT.forceMultiDefaultNo(form, multiName);
    return;
  }

  function updateVisibility() {
    const selected = CGT.getCheckedValue(radios) || "none";
    const shouldShow = showWhenValues.includes(selected);

    if (shouldShow) {
      row.style.display = "flex"; // your rows use flex styling
    } else {
      row.style.display = "none";
      CGT.forceMultiDefaultNo(form, multiName);
    }
  }

  // Bind change listeners
  if (radios.length === undefined) {
    radios.addEventListener("change", updateVisibility);
  } else {
    for (const r of radios) {
      if (r) r.addEventListener("change", updateVisibility);
    }
  }

  // Mark as bound
  if (row.dataset) row.dataset[bindKey] = "1";

  // Initial state
  updateVisibility();
};

/*-------------------------------------------------
 * Init all toggles for a form
 *-------------------------------------------------*/
CGT.initMultiLocationToggles = function initMultiLocationToggles(form) {
  if (!form) return;
  for (const rule of CGT.MULTI_LOCATION_RULES) {
    CGT.setupMultiLocationToggle(form, rule.base, rule.showWhen);
  }
};
