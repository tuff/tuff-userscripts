// ==UserScript==
// @name    ao3 savior
// @description Tumblr savior clone for AO3 works pages.
// @namespace   ao3
// @include   http*://archiveofourown.org/*
// @grant     none
// @version   1.7
// @downloadURL https://github.com/tuff/tuff-userscripts/raw/master/uncompiled/ao3_savior.user.user.js
// ==/UserScript==


/**** CONFIG ********************/
window.ao3SaviorConfig = {
  showReasons: true,
  // set to false if you don't want to see why works were hidden

  showPlaceholders: true,
  // set to false if you don't want to see the "This work is hidden!" boxes (could result in empty works lists. Check out the "saved filters" script)

  authorBlacklist: ['Hated Author 1', 'smeyer'],
  // excludes works with an author that exactly matches at least one term

  titleBlacklist: ['The Catcher in the Rye', 'Sylvester And The Magic Pebble'],
  // excludes works with a title that exactly matches at least one term

  tagBlacklist: ['dobby', 'jar jar binks', '*mimes'],
  // excludes works with a tag that matches at least one term. Use * for wildcard

  tagWhitelist: [],
  // if a work contains any of these tags, it will not be blocked, even if it matches one of the blacklists

  summaryBlacklist: ['horse-sized ducks', 'duck-sized horses', "bee's knees"]
  // excludes works with summaries that contain at least one term
};
/********************************/

(function($) {
  var _works = $('li.blurb');
  if (!_works[0]) return;

  var _toggleClass = 'ao3-savior-hide-toggle';
  var _cfg = getConfig();

  _works.each(function() {
    var reason = shouldBlockWork($(this));
    if (reason) {
      blockWork($(this), reason)
    }
  });

  function getConfig() {
    var config = window.ao3SaviorConfig || {};

    config.showReasons = (config.showReasons !== undefined) ? config.showReasons : true;
    config.showPlaceholders = (config.showPlaceholders !== undefined) ? config.showPlaceholders : true;
    config.authorBlacklist = config.authorBlacklist || [];
    config.titleBlacklist = config.titleBlacklist || [];
    config.tagBlacklist = config.tagBlacklist || [];
    config.tagWhitelist = config.tagWhitelist || [];
    config.summaryBlacklist = config.summaryBlacklist || [];

    return config;
  }

  function blockWork(work, reason) {
    var cut = $('<div>').addClass('cut').html(work.html()),
      reason = '(' +reason +'.)',
      thisFold = makeFold(),
      reasonContainer = thisFold.find('.reason');

    if (!ao3SaviorConfig.showPlaceholders) {
      work.hide();
      return;
    }

    if (ao3SaviorConfig.showReasons) {
      reasonContainer.html(reason);
    } else {
      reasonContainer.remove();
    }

    work.empty().append(thisFold, cut.hide());
    work.find('a.action').click(function() {
      var fold = $(this).closest('.fold'),
        cut = fold.next('.cut');

      cut.add(fold.children('.'+_toggleClass)).toggle();
      $(this).text(cut.is(':visible') ? 'Hide' : 'Unhide');
    })

    function makeFold() {
      return $('<p>').addClass('fold').append(
        $('<span>').addClass(_toggleClass).text('This work is hidden! '),
        $('<span>').addClass(_toggleClass).html('This work <em>was</em> hidden. ').hide(),
        $('<span>').addClass('reason'),
        $('<span>').addClass('actions').append(
          $('<a>').addClass('action').css({
              'position': 'absolute',
              'right': 8,
              'top': 10
            }).text('Unhide')
          )
      );
    }
  }

  function shouldBlockWork(work) {
    var authors = work.find('a[rel=author]'),
      title = work.find('.header .heading a:first-child'),
      tags = work.find('a.tag'),
      summary = work.find('blockquote.summary').text(),
      reason = 'Reason: ';

    for (var i = 0, tag; tag = $(tags[i]).text(); i++) {
      for (var j = 0, wlTag; wlTag = _cfg.tagWhitelist[j]; j++) {
        if (tag == wlTag) return '';
      }
    }

    for (var i = 0, tag; tag = $(tags[i]).text(); i++) {
      for (var j = 0, blTag; blTag = _cfg.tagBlacklist[j]; j++) {
        if (termsMatch(tag, blTag)) {
          return reason +'tags include <strong>' +blTag +'</strong>';
        }
      }
    }

    for (var i = 0, blAuthor; blAuthor = _cfg.authorBlacklist[i]; i++) {
      var done;
      if (blAuthor == 'Anonymous' && !authors[0]) {
        done = true;
      } else {
        for (var j = 0, author; author = $(authors[j]).text(); j++) {
          if (author == blAuthor) {
            done = true;
            break;
          }
        }
      }

      if (done) {
        return reason +'author is <strong>' +blAuthor +'</strong>';
      }
    }

    var trimmedTitleText = title.text().replace(/^\s+|\s$/, '');
    for (var i = 0, blTitle; blTitle = _cfg.titleBlacklist[i]; i++) {
      if (trimmedTitleText == blTitle) {
        return reason +'title is <strong>' +blTitle +'</strong>';
      }
    }

    for (var i = 0, blSummaryTerm; blSummaryTerm = _cfg.summaryBlacklist[i]; i++) {
      if (summary.indexOf(blSummaryTerm) != -1) {
        return reason +'summary includes <strong>' +blSummaryTerm +'</strong>';
      }
    }

    return '';

    function termsMatch(testTerm, listTerm) {
      testTerm = testTerm.toLowerCase();
      listTerm = listTerm.toLowerCase();
      if (testTerm == listTerm) { return true; }

      if (listTerm.indexOf('*') == -1) return false;

      var parts = listTerm.split('*'),
        prevPartIndex = 0,
        firstPart,
        lastPart;

      for (var i = 0, part, len = parts.length; i < len; i++) {
        part = parts[i];
        partIndex = testTerm.indexOf(part);
        if (part && partIndex < prevPartIndex) {
          return false;
        }
        prevPartIndex = partIndex + part.length;
      }

      firstPart = parts[0];
      lastPart = parts[parts.length-1];

      return !(
        firstPart && testTerm.indexOf(firstPart) != 0 ||
        lastPart && testTerm.indexOf(lastPart)+lastPart.length != testTerm.length
      );
    }
  }

})(window.jQuery);
