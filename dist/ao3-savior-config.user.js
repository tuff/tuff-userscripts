// ==UserScript==
// @name          ao3 savior config
// @description   Config script for AO3 Savior userscript
// @namespace     ao3
// @include       http*://archiveofourown.org/*
// @grant         none
// @version       1.0
// @downloadURL   https://github.com/tuff/ao3-userscripts/raw/master/dist/ao3-savior-config.user.js
// ==/UserScript==


;(function() {
/**** CONFIG ********************/
window.ao3SaviorConfig = {
  // Edit this file to configure AO3 Savior, then ensure that both 'ao3 savior' and 'ao3 savior
  // config' userscripts are enabled in Tampermonkey/Greasemonkey. This lets you avoid having to
  // replace the config block within AO3 Savior whenever you update - since it's stored here in a
  // separate userscript, and you should only update this one manually.


  // Set to false if you don't want to see why works were hidden.
  showReasons: true,

  // Set to false if you don't want to see the expandable "This work is hidden!" boxes.
  showPlaceholders: true,

  // Exclude works with an author that exactly matches at least one term.
  authorBlacklist: ['Hated Author 1', 'smeyer'],

  // Excludes works with a title that exactly matches at least one term
  titleBlacklist: ['The Catcher in the Rye', 'Sylvester And The Magic Pebble'],

  // Exclude works with a tag that matches at least one term. Use * for wildcard.
  tagBlacklist: ['dobby', 'jar jar binks', '*mimes'],

  // Include works matching these tags, even if they also match any of the blacklists.
  tagWhitelist: ['glitter'],

  // Exclude works with summaries that contain at least one term
  summaryBlacklist: ['horse-sized ducks', 'duck-sized horses', "bee's knees"]
};
/********************************/
}());

//# sourceMappingURL=ao3-savior-config.user.js.map
