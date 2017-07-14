// ==UserScript==
// @name        ao3 filter shift
// @description Moves filter box before works index and collapses it
// @namespace   ao3
// @include     *archiveofourown.org/*works*
// @include     *testarchive.transformativeworks.org/*works*
// @grant       none
// @version     1.1
// ==/UserScript==

(function($) {

    $('<style>').text(
        'form.filters fieldset { margin: 1em 0; } form.filters .filters-top { margin: 0.643em; padding-right: 7.2em; position: relative; } form.filters .filters-top input, form.filters .filters-top img { vertical-align: middle; } form.filters .filters-top .collapse-toggle { cursor: pointer; display: inline-block; position: absolute; right: 0; text-align: right; top: 0.1em; white-space: nowrap; width: 7em } form.filters.collapsed:after { content: ""; } form.filters .collapse-toggle .arrow-right, form.filters.collapsed .collapse-toggle .arrow-down { display: none; } form.filters.collapsed .collapse-toggle .arrow-right { display: inline; } form.filters .filters-top input[type=text] { width: 92%; } form.filters .filters-top a.help { display: inline-block; margin-left: 0.4em; vertical-align: -0.25em; } form.filters.collapsed .filters-top a.help { display: none; } form.filters.collapsed .search-note { display: none; } .filters-top input { display: none; } form.filters.collapsed .filters-top input { display: inline-block; margin: 0.1em; } form.filters .big-search textarea { height: 7em; min-height: auto; resize: none; } form.filters .big-search input[type=submit] { margin: 0.5em 0; width: 100%; }'
    ).appendTo($('head'));
    
    $(document).ready(function() {

        // return;

        var form = $('form.filters'),
            filters = form.find('dl.filters'),
            index = $('ol.work.index'),
            search = $('#work_search_query'),
            newSearch = search.clone(),
            searchName = search.attr('name'),
            searchHelp = search.closest('dd').prev('dt').find('a.modal'),
            bigSearch = $('<div>').addClass('big-search'),
            searchBox = $('<textarea>'),
            submit1 = filters.find('dd.submit').first(),
            submit2 = filters.find('dd.submit').last(),
            bar = $('<div>').addClass('filters-top'),
            toggleButton = $('<span>').addClass('collapse-toggle');

        if (!form[0] || !index[0]) { return; }

        // swap filters and index positions
        form.insertBefore(index);

        // add the top bar
        bar.insertBefore(filters);
        
        // move search controls to the top
        bar.append(
                newSearch.attr('placeholder', 'Search')
                    .removeAttr('name'),
                $('<span>').addClass('search-note').text('Search within results'),
                searchHelp
            );
        search.closest('dd').prev('dt').andSelf().remove();
        submit1.prev('dt').andSelf().remove();
        
        submit2.find('input').val('Search, sort, and filter');
            
        bigSearch.append(
            searchBox.attr({
                'name': searchName,
                'placeholder': 'Advanced Search'
            }),
            submit2.find('input').clone()
        ).insertAfter(bar);

        toggleButton.append(
            'Advanced ',
            $('<img>').attr('src', '/images/arrow-right.gif').addClass('arrow-right'),
            $('<img>').attr('src', '/images/arrow-down.gif').addClass('arrow-down')
        )
        .attr('title', 'Advanced search')
        .click(function() { 
            if (bigSearch.is(':visible')) {
                newSearch.val(searchBox.val());
            } else {
                searchBox.val(newSearch.val());
            }
                       
            filters.toggle();
            bigSearch.toggle();
            form.toggleClass('collapsed');
        })
        .appendTo(bar);

        toggleButton.click();
        
        form.submit(function() {
            if (newSearch.is(':visible')) {
                searchBox.val(newSearch.val());
            }
        });

    });

})(window.jQuery);
