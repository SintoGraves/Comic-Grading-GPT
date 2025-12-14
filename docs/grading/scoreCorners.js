/*-------------------------------------------------
 * grading/scoreCorners.js
 * Corners scoring
 * Namespace: window.CGT (aliased locally as CGT)
 *-------------------------------------------------*/
const CGT = (window.CGT = window.CGT || {});

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

CGT.computeCornersScore = function computeCornersScore(form) {
  // A. Sharpness / Blunting
  const bluntFront = scoreBlunting(
    CGT.choiceValue(form, "corner_blunt_front", "none"),
    CGT.choiceValue(form, "corner_blunt_front_multi", "no")
  );
  const bluntBack = scoreBlunting(
    CGT.choiceValue(form, "corner_blunt_back", "none"),
    CGT.choiceValue(form, "corner_blunt_back_multi", "no")
  );
  const sharpnessScore = Math.min(bluntFront, bluntBack);

  // B. Corner Creases
  const creaseFront = scoreCrease(
    CGT.choiceValue(form, "corner_crease_front", "none"),
    CGT.choiceValue(form, "corner_crease_front_multi", "no")
  );
  const creaseBack = scoreCrease(
    CGT.choiceValue(form, "corner_crease_back", "none"),
    CGT.choiceValue(form, "corner_crease_back_multi", "no")
  );
  const creaseScore = Math.min(creaseFront, creaseBack);

  // C. Color Breaks
  const colorFront = scoreColorBreak(CGT.choiceValue(form, "corner_colorbreak_front", "none"));
  const colorBack  = scoreColorBreak(CGT.choiceValue(form, "corner_colorbreak_back", "none"));
  const colorBreakScore = Math.min(colorFront, colorBack);

  // D. Tears / Chips / Missing Corners
  const tearsFront   = scoreTears(CGT.choiceValue(form, "corner_tears_front", "none"));
  const tearsBack    = scoreTears(CGT.choiceValue(form, "corner_tears_back", "none"));
  const missingFront = scoreMissing(CGT.choiceValue(form, "corner_missing_front", "none"));
  const missingBack  = scoreMissing(CGT.choiceValue(form, "corner_missing_back", "none"));
  const tearsChipsScore = Math.min(tearsFront, tearsBack, missingFront, missingBack);

  // E. Fraying & Delamination
  const frayFront = scoreFray(
    CGT.choiceValue(form, "corner_fray_front", "none"),
    CGT.choiceValue(form, "corner_fray_front_multi", "no")
  );
  const frayBack = scoreFray(
    CGT.choiceValue(form, "corner_fray_back", "none"),
    CGT.choiceValue(form, "corner_fray_back_multi", "no")
  );
  const delamFront = scoreDelam(
    CGT.choiceValue(form, "corner_delam_front", "none"),
    CGT.choiceValue(form, "corner_delam_front_multi", "no")
  );
  const delamBack = scoreDelam(
    CGT.choiceValue(form, "corner_delam_back", "none"),
    CGT.choiceValue(form, "corner_delam_back_multi", "no")
  );
  const frayDelamScore = Math.min(frayFront, frayBack, delamFront, delamBack);

  // F. Dirt / Smudges / Stains
  const dirtFront  = scoreDirt(CGT.choiceValue(form, "corner_dirt_front", "none"));
  const dirtBack   = scoreDirt(CGT.choiceValue(form, "corner_dirt_back", "none"));
  const stainFront = scoreStain(CGT.choiceValue(form, "corner_stain_front", "none"));
  const stainBack  = scoreStain(CGT.choiceValue(form, "corner_stain_back", "none"));
  const dirtStainScore = Math.min(dirtFront, dirtBack, stainFront, stainBack);

  const elements = [
    { id: "Sharpness / Blunting",           score: sharpnessScore },
    { id: "Corner Creases",                 score: creaseScore },
    { id: "Color Breaks",                   score: colorBreakScore },
    { id: "Tears, Chips, Missing Corners",  score: tearsChipsScore },
    { id: "Fraying & Delamination",         score: frayDelamScore },
    { id: "Dirt / Smudges / Stains",        score: dirtStainScore }
  ];

  return CGT.finalizeSection(elements);
};
