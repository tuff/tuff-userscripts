// ==UserScript==
// @name        ao3 hide some tags
// @description Auto hide some tags you don't like to see
// @namespace   ao3
// @include     http*://archiveofourown.org/*
// @grant       none
// @version     1.1
// @downloadURL https://github.com/tuff/tuff-userscripts/raw/master/uncompiled/ao3_hide_some_tags.user.js
// ==/UserScript==


(function($) {


/**** CONFIG ********************/

    var tagsToHide = ["camel spiders", "*worms", "ticks"]; // use * for wildcard
    var buttonLabel = "~";

/********************************/




    $('.blurb ul.tags, .meta .tags ul').each(function() {
        var $list = $(this);
        $list.find('a.tag').each(function() {
            var $tag = $(this);
            var text = $tag.text();

            for (var i = 0, len = tagsToHide.length; i < len; i++) {
                if (termsMatch(text, tagsToHide[i])) {
                    hideTagsList($list);
                    return false;
                }
            }
        });
    });

    function hideTagsList($list) {
        $list.hide();
        $('<button>').addClass('hide-some-tags-userscript').text(buttonLabel).click(function() {
            $(this).next('ul').toggle();
        }).insertBefore($list);
    }

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

})(window.jQuery);
