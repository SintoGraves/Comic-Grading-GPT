/*-------------------------------------------------
 * grading/scoreBindery.js
 * Bindery scoring (RADIO version)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

/**
 * Helper: read a radio-group value as a float.
 * Falls back to 10.0 if missing/invalid to preserve "default 10.0" rule.
 *
 * Works for:
 *  - form.elements[name] returning RadioNodeList / NodeList
 *  - a single element (edge cases)
 */
CGT.getRadioValue = CGT.getRadioValue || function getRadioValue(form, name, fallback) {
  const fb = (typeof fallback === "number") ? fallback : 10.0;
  if (!form || !form.elements) return fb;

  const group = form.elements[name];
  if (!group) return fb;

  // If it's a RadioNodeList with .value, prefer that
  try {
    if (typeof group.value === "string" && group.value !== "") {
      const v = parseFloat(group.value);
      return Number.isFinite(v) ? v : fb;
    }
  } catch (_) {}

  // Otherwise, iterate
  const list = (group.length !== undefined) ? group : [group];
  for (const el of list) {
    if (el && el.checked) {
      const v = parseFloat(el.value);
      return Number.isFinite(v) ? v : fb;
    }
  }
  return fb;
};

CGT.computeBinderyScore = function computeBinderyScore(form) {
  // 1) Staple Placement
  // HTML names:
  //  - bind_sp_height
  //  - bind_sp_crooked
  //  - bind_sp_pulling
  const staplePlacement = Math.min(
    CGT.getRadioValue(form, "bind_sp_height", 10.0),
    CGT.getRadioValue(form, "bind_sp_crooked", 10.0),
    CGT.getRadioValue(form, "bind_sp_pulling", 10.0)
  );

  // 2) Staple Tightness & Attachment
  // HTML names:
  //  - bind_cover_attach
  //  - bind_centerfold_secure
  const stapleTightness = Math.min(
    CGT.getRadioValue(form, "bind_cover_attach", 10.0),
    CGT.getRadioValue(form, "bind_centerfold_secure", 10.0)
  );

  // 3) Spine Fold (Bind Alignment)
  // HTML name:
  //  - bind_spine_align
  const spineFoldAlign = CGT.getRadioValue(form, "bind_spine_align", 10.0);

  // 4) Staples (Rust)
  // HTML name:
  //  - bind_staple_rust
  const stapleRust = CGT.getRadioValue(form, "bind_staple_rust", 10.0);

  // 5) Cover Trim and Cuts
  // HTML names:
  //  - bind_trim_uneven
  //  - bind_trim_frayed
  //  - bind_trim_overcut
  const coverTrimCuts = Math.min(
    CGT.getRadioValue(form, "bind_trim_uneven", 10.0),
    CGT.getRadioValue(form, "bind_trim_frayed", 10.0),
    CGT.getRadioValue(form, "bind_trim_overcut", 10.0)
  );

  // 6) Printing / Bindery Tears
  // HTML name:
  //  - bind_tears
  const printingTears = CGT.getRadioValue(form, "bind_tears", 10.0);

  // 7) Cover / Interior Page Registration
  // HTML name:
  //  - bind_registration
  const registration = CGT.getRadioValue(form, "bind_registration", 10.0);

  const elements = [
    { id: "Staple Placement",                 score: staplePlacement },
    { id: "Staple Tightness & Attachment",    score: stapleTightness },
    { id: "Spine Fold (Bind Alignment)",      score: spineFoldAlign },
    { id: "Staples (Rust)",                   score: stapleRust },
    { id: "Cover Trim and Cuts",              score: coverTrimCuts },
    { id: "Printing/Bindery Tears",           score: printingTears },
    { id: "Cover/Interior Page Registration", score: registration }
  ];

  // finalizeSection should already exist in scoringUtils.js
  return CGT.finalizeSection(elements);
};
