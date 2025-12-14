/*-------------------------------------------------
 * grading/scoreEdges.js
 * Edges scoring
 * Global namespace: window.CGT
 *-------------------------------------------------*/
(function () {
  "use strict";

  const CGT = (window.CGT = window.CGT || {});

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
      case "lt_1_4_clean":         return many ? 5.0 : 7.0;
      case "multi_gt_1_4_no_art":  return many ? 2.0 : 2.5;
      case "into_art_readability": return many ? 1.0 : 1.5;
      default:                     return 10.0;
    }
  }

  function scoreEdgeCreases(choice, multi) {
    if (choice === "none") return 10.0;
    const many = (multi === "yes");
    switch (choice) {
      case "tiny_no_break":    return many ? 7.5 : 8.5;
      case "with_color_break": return many ? 6.0 : 7.0;
      case "multi_deep":       return many ? 2.5 : 4.5;
      default:                 return 10.0;
    }
  }

  function scoreEdgeOverhang(choice, multi) {
    if (choice === "none") return 10.0;
    const many = (multi === "yes");
    switch (choice) {
      case "minor":         return many ? 6.0 : 7.0;
      case "major":         return many ? 4.0 : 5.0;
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

  CGT.computeEdgesScore = function computeEdgesScore(form) {
    // 1) Cleanliness / Sharpness
    const cleanFront = scoreEdgeClean(
      CGT.choiceValue(form, "edge_clean_front", "none"),
      CGT.choiceValue(form, "edge_clean_front_multi", "no")
    );
    const cleanBack = scoreEdgeClean(
      CGT.choiceValue(form, "edge_clean_back", "none"),
      CGT.choiceValue(form, "edge_clean_back_multi", "no")
    );
    const cleanScore = Math.min(cleanFront, cleanBack);

    // 2) Chipping
    const chipFront = scoreEdgeChipping(
      CGT.choiceValue(form, "edge_chip_front", "none"),
      CGT.choiceValue(form, "edge_chip_front_multi", "no")
    );
    const chipBack = scoreEdgeChipping(
      CGT.choiceValue(form, "edge_chip_back", "none"),
      CGT.choiceValue(form, "edge_chip_back_multi", "no")
    );
    const chippingScore = Math.min(chipFront, chipBack);

    // 3) Nicks and Cuts
    const nicksFront = scoreEdgeNicksCuts(
      CGT.choiceValue(form, "edge_nicks_front", "none"),
      CGT.choiceValue(form, "edge_nicks_front_multi", "no")
    );
    const nicksBack = scoreEdgeNicksCuts(
      CGT.choiceValue(form, "edge_nicks_back", "none"),
      CGT.choiceValue(form, "edge_nicks_back_multi", "no")
    );
    const nicksCutsScore = Math.min(nicksFront, nicksBack);

    // 4) Tears
    const tearsFront = scoreEdgeTears(
      CGT.choiceValue(form, "edge_tears_front", "none"),
      CGT.choiceValue(form, "edge_tears_front_multi", "no")
    );
    const tearsBack = scoreEdgeTears(
      CGT.choiceValue(form, "edge_tears_back", "none"),
      CGT.choiceValue(form, "edge_tears_back_multi", "no")
    );
    const tearsScore = Math.min(tearsFront, tearsBack);

    // 5) Edge Creases
    const creaseFront = scoreEdgeCreases(
      CGT.choiceValue(form, "edge_crease_front", "none"),
      CGT.choiceValue(form, "edge_crease_front_multi", "no")
    );
    const creaseBack = scoreEdgeCreases(
      CGT.choiceValue(form, "edge_crease_back", "none"),
      CGT.choiceValue(form, "edge_crease_back_multi", "no")
    );
    const edgeCreaseScore = Math.min(creaseFront, creaseBack);

    // 6) Overhang damage
    const overhangFront = scoreEdgeOverhang(
      CGT.choiceValue(form, "edge_overhang_front", "none"),
      CGT.choiceValue(form, "edge_overhang_front_multi", "no")
    );
    const overhangBack = scoreEdgeOverhang(
      CGT.choiceValue(form, "edge_overhang_back", "none"),
      CGT.choiceValue(form, "edge_overhang_back_multi", "no")
    );
    const overhangScore = Math.min(overhangFront, overhangBack);

    // 7) Trim / bindery cuts
    const trimFront = scoreEdgeTrim(CGT.choiceValue(form, "edge_trim_front", "none"));
    const trimBack  = scoreEdgeTrim(CGT.choiceValue(form, "edge_trim_back", "none"));
    const trimScore = Math.min(trimFront, trimBack);

    // 8) Staining / Soiling
    const soilFront = scoreEdgeSoiling(
      CGT.choiceValue(form, "edge_soil_front", "none"),
      CGT.choiceValue(form, "edge_soil_front_multi", "no")
    );
    const soilBack = scoreEdgeSoiling(
      CGT.choiceValue(form, "edge_soil_back", "none"),
      CGT.choiceValue(form, "edge_soil_back_multi", "no")
    );
    const soilScore = Math.min(soilFront, soilBack);

    const elements = [
      { id: "Cleanliness and Sharpness", score: cleanScore },
      { id: "Chipping",                 score: chippingScore },
      { id: "Nicks and Cuts",           score: nicksCutsScore },
      { id: "Tears",                    score: tearsScore },
      { id: "Edge Creases",             score: edgeCreaseScore },
      { id: "Overhang Damage",          score: overhangScore },
      { id: "Trim/Bindery Cuts",        score: trimScore },
      { id: "Staining or Soiling",      score: soilScore }
    ];

    const baseScore = Math.min(...elements.map(e => e.score));

    let penaltyTotal = 0;
    for (const e of elements) {
      if (e.score > baseScore) penaltyTotal += CGT.penaltyForScore(e.score);
    }

    const finalScore = CGT.clampScore(baseScore - penaltyTotal);

    return {
      finalScore,
      baseScore,
      penaltyTotal,
      grade: CGT.pickGrade(CGT.GRADES, finalScore),
      elements
    };
  };
})();
