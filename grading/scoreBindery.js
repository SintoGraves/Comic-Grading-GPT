/*-------------------------------------------------
 * grading/scoreBindery.js
 * Bindery scoring
 * Global namespace: window.CGT
 *-------------------------------------------------*/
/* grading/scoreBindery.js */
window.CGT = window.CGT || {};

CGT.computeBinderyScore = function computeBinderyScore(form) {
  const staplePlacement = Math.min(
    CGT.getRadioValue(form, "bind_sp_height"),
    CGT.getRadioValue(form, "bind_sp_crooked"),
    CGT.getRadioValue(form, "bind_sp_pulling")
  );

  const stapleTightness = Math.min(
    CGT.getRadioValue(form, "bind_cover_attach"),
    CGT.getRadioValue(form, "bind_centerfold_secure")
  );

  const spineFoldAlign = CGT.getRadioValue(form, "bind_spine_align");
  const stapleRust     = CGT.getRadioValue(form, "bind_staple_rust");

  const coverTrimCuts = Math.min(
    CGT.getRadioValue(form, "bind_trim_uneven"),
    CGT.getRadioValue(form, "bind_trim_frayed"),
    CGT.getRadioValue(form, "bind_trim_overcut")
  );

  const printingTears = CGT.getRadioValue(form, "bind_tears");
  const registration  = CGT.getRadioValue(form, "bind_registration");

  const elements = [
    { id: "Staple Placement",                 score: staplePlacement },
    { id: "Staple Tightness & Attachment",    score: stapleTightness },
    { id: "Spine Fold (Bind) Alignment",      score: spineFoldAlign },
    { id: "Staples (Rust)",                   score: stapleRust },
    { id: "Cover Trim and Cuts",              score: coverTrimCuts },
    { id: "Printing/Bindery Tears",           score: printingTears },
    { id: "Cover/Interior Page Registration", score: registration }
  ];

  return CGT.finalizeSection(elements);
};
