/* Decorative About-page stickers, drawn for this site (original artwork, no logos or emoji).
   Die-cut style: each shape gets a white edge and a thin ink outline, no background circle.
   Which stickers appear is decided by the "Stickers" list in content.md; each name is matched by keyword. */
(function () {
  "use strict";
  var INK = "#1B1530", W = "#FFFFFF";
  // white die-cut border + thin ink outline around whatever shape is drawn
  function diecut(key, inner) {
    var id = "stk-cut-" + key;
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs><filter id="' + id + '" x="-25%" y="-25%" width="150%" height="150%">' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="4.2" result="o1"/>' +
      '<feFlood flood-color="' + INK + '"/><feComposite in2="o1" operator="in" result="ink"/>' +
      '<feMorphology in="SourceAlpha" operator="dilate" radius="3" result="o2"/>' +
      '<feFlood flood-color="' + W + '"/><feComposite in2="o2" operator="in" result="white"/>' +
      '<feMerge><feMergeNode in="ink"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter></defs><g filter="url(#' + id + ')">' + inner + '</g></svg>';
  }
  var S = {
    music: diecut("music",
      '<path d="M26 44V17l20-5v26" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M26 17l20-5v7l-20 5z" fill="' + INK + '"/>' +
      '<ellipse cx="20" cy="45" rx="7.5" ry="5.8" transform="rotate(-20 20 45)" fill="#FF4F8B" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<ellipse cx="40" cy="39" rx="7.5" ry="5.8" transform="rotate(-20 40 39)" fill="#FF4F8B" stroke="' + INK + '" stroke-width="2.2"/>'),
    // subtle: a small striped heart (sized smaller in the CSS)
    biflag: '<svg viewBox="0 0 64 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="stk-heart"><path d="M32 54C14 41 4 31 4 19 4 10 11 4 19 4c6 0 10 3 13 8 3-5 7-8 13-8 8 0 15 6 15 15 0 12-10 22-28 35z"/></clipPath></defs>' +
      '<g clip-path="url(#stk-heart)"><rect width="64" height="23" fill="#D60270"/><rect y="23" width="64" height="12" fill="#9B4F96"/><rect y="35" width="64" height="23" fill="#0038A8"/></g>' +
      '<path d="M32 54C14 41 4 31 4 19 4 10 11 4 19 4c6 0 10 3 13 8 3-5 7-8 13-8 8 0 15 6 15 15 0 12-10 22-28 35z" fill="none" stroke="' + W + '" stroke-width="5"/>' +
      '<path d="M32 54C14 41 4 31 4 19 4 10 11 4 19 4c6 0 10 3 13 8 3-5 7-8 13-8 8 0 15 6 15 15 0 12-10 22-28 35z" fill="none" stroke="' + INK + '" stroke-width="2"/></svg>',
    finance: diecut("finance",
      '<rect x="8" y="36" width="9" height="16" rx="2" fill="#B8F2D6" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<rect x="19" y="28" width="9" height="24" rx="2" fill="#B8F2D6" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<circle cx="42" cy="28" r="15" fill="#FFB627" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M47 22c-1.3-2-3.3-2.7-5.3-2.7-3 0-5 1.6-5 4s2.1 3.3 5 4 5 1.7 5 4.2-2.2 4-5.2 4c-2.3 0-4.3-1-5.3-2.8M42 16.5v23" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>'),
    marketing: diecut("marketing",
      '<path d="M12 27v11l7 1.5 3.5 11h6.5l-2.5-9.5 21 8.5V15L19 27z" fill="#C9B6FF" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<rect x="8" y="25.5" width="7" height="14" rx="2.5" fill="' + INK + '"/>' +
      '<path d="M53 22l5-3.5M54 31.5h6M53 41l5 3.5" stroke="#FF4F8B" stroke-width="3.5" stroke-linecap="round"/>'),
    guitar: diecut("guitar",
      '<g transform="rotate(35 32 32)">' +
      '<rect x="29" y="4" width="6" height="28" fill="#7A4A2A" stroke="' + INK + '" stroke-width="2"/>' +
      '<rect x="27" y="1" width="10" height="8" rx="2" fill="' + INK + '"/>' +
      '<path d="M32 27c-7 0-10.5 3.5-10.5 8 0 2.3 1.2 3.4 1.2 4.6-3.5 1.2-5.8 4.6-5.8 8 0 5.8 7 10.4 15.1 10.4s15.1-4.6 15.1-10.4c0-3.4-2.3-6.8-5.8-8 0-1.2 1.2-2.3 1.2-4.6 0-4.5-3.5-8-10.5-8z" fill="#FFB627" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<circle cx="32" cy="42" r="4.5" fill="' + INK + '"/><rect x="27.5" y="51" width="9" height="3" rx="1" fill="' + INK + '"/></g>'),
    analytics: diecut("analytics",
      '<rect x="8" y="38" width="10" height="16" rx="2" fill="#C9B6FF" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<rect x="21" y="30" width="10" height="24" rx="2" fill="#C9B6FF" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<rect x="34" y="21" width="10" height="33" rx="2" fill="#C9B6FF" stroke="' + INK + '" stroke-width="2.2"/>' +
      '<path d="M8 28l13-10 12 5 15-13" fill="none" stroke="#0B7368" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="9" r="4" fill="#FF4F8B" stroke="' + INK + '" stroke-width="2"/>')
  };
  var KEYS = [["music", "music"], ["bisexual", "biflag"], ["flag", "biflag"], ["financ", "finance"],
    ["marketing", "marketing"], ["guitar", "guitar"], ["analytic", "analytics"]];
  window.STICKERS = {
    svg: function (name) {
      var n = (name || "").toLowerCase();
      for (var i = 0; i < KEYS.length; i++) if (n.indexOf(KEYS[i][0]) > -1) return { key: KEYS[i][1], svg: S[KEYS[i][1]] };
      return null;
    }
  };
})();
