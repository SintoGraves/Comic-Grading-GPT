/*-------------------------------------------------
 * data/valueStampIndex.js
 * Value Stamp / Coupon lookup table
 * Global namespace: window.CGT
 *
 * Data only — no logic.
 *-------------------------------------------------*/
(function () {
  "use strict";

  const CGT = (window.CGT = window.CGT || {});

  CGT.VALUE_STAMP_INDEX = {
    // Adventure Into Fear
    "adventure into fear#21": true,
    "adventure into fear#22": true,
    "adventure into fear#23": true,
    "adventure into fear#24": true,
    "adventure into fear#25": true,
    "adventure into fear#26": true,
    "adventure into fear#31": true,

    // ...
    // PASTE YOUR FULL EXISTING LIST HERE, UNCHANGED
    // ...
  };

  // Optional convenience list (safe, derived, read-only)
  CGT.KNOWN_TITLES = Array.from(
    new Set(Object.keys(CGT.VALUE_STAMP_INDEX).map(k => k.split("#")[0]))
  );
})();
