/*-------------------------------------------------
 * grading/scoreBindery.js
 * Bindery scoring (dropdown/select version)
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
var CGT = (window.CGT = window.CGT || {});

/**
 * Helper: read a <select> value as a float.
 * Falls back to 10.0 if missing/invalid to preserve "default 10.0" rule.
 */
CGT.getSelectValue = CGT.getSelectValue || function getSelectValue(form, nameOrId, fallback) {
  const fb = (typeof fallback === "number") ? fallback : 10.0;

  if (!form) return fb;

  // Try by name first (form.elements), then by id (document lookup)
  let el = (form.elements && form.elements[nameOrId]) ? form.elements[nameOrId] : null;
  if (!el) el = document.getElementById(nameOrId);

  if (!el) return fb;

  const v = parseFloat(el.value);
  return Number.isFinite(v) ? v : fb;
};

CGT.computeBinderyScore = function computeBinderyScore(form) {
  // 1) Staple Placement
  const staplePlacement = Math.min(
    CGT.getSelectValue(form, "bindery_staple_highlow", 10.0),
    CGT.getSelectValue(form, "bindery_staple_crooked", 10.0),
    CGT.getSelectValue(form, "bindery_staple_pull", 10.0)
  );

  // 2) Staple Tightness & Attachment
  const stapleTightness = Math.min(
    CGT.getSelectValue(form, "bindery_cover_attach", 10.0),
    CGT.getSelectValue(form, "bindery_centerfold", 10.0)
  );

  // 3) Spine Fold (Bind Alignment)
  const spineFoldAlign = CGT.getSelectValue(form, "bindery_alignment", 10.0);

  // 4) Staples (Rust)
  const stapleRust = CGT.getSelectValue(form, "bindery_rust", 10.0);

  // 5) Cover Trim and Cuts
  const coverTrimCuts = Math.min(
    CGT.getSelectValue(form, "bindery_trim", 10.0),
    CGT.getSelectValue(form, "bindery_frayed", 10.0),
    CGT.getSelectValue(form, "bindery_overcut", 10.0)
  );

  // 6) Printing/Bindery Tears
  const printingTears = CGT.getSelectValue(form, "bindery_tears", 10.0);

  // 7) Cover / Interior Page Registration
  const registration = CGT.getSelectValue(form, "bindery_registration", 10.0);

  const elements = [
    { id: "Staple Placement",                  score: staplePlacement },
    { id: "Staple Tightness & Attachment",     score: stapleTightness },
    { id: "Spine Fold (Bind Alignment)",       score: spineFoldAlign },
    { id: "Staples (Rust)",                    score: stapleRust },
    { id: "Cover Trim and Cuts",               score: coverTrimCuts },
    { id: "Printing/Bindery Tears",            score: printingTears },
    { id: "Cover/Interior Page Registration",  score: registration }
  ];

  return CGT.finalizeSection(elements);
};
