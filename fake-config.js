/**** CONFIG ********************/
window.ao3SaviorConfig = {
  showReasons: true,
  // set to false if you don't want to see why works were hidden

  showPlaceholders: true,
  // set to false if you don't want to see the "This work is hidden!" boxes (could result in empty works lists. Check out the "saved filters" script)

  authorBlacklist: ['Hated Author 1', 'smeyer', 'work4 author'],
  // excludes works with an author that exactly matches at least one term

  titleBlacklist: ['The Catcher in the Rye', 'Sylvester And The Magic Pebble', 'Work 5'],
  // excludes works with a title that exactly matches at least one term

  tagBlacklist: ['dobby', 'jar jar binks', '*mimes', 'work1-tag2', 'work2-tag1'],
  // excludes works with a tag that matches at least one term. Use * for wildcard

  tagWhitelist: ['work2-tag1'],
  // if a work contains any of these tags, it will not be blocked, even if it matches one of the blacklists

  summaryBlacklist: ['horse-sized ducks', 'duck-sized horses', "bee's knees", 'Work 8']
  // excludes works with summaries that contain at least one term
};
/********************************/