import matchTermsWithWildCard from './match-terms-with-wildcard';

const isItemWhitelisted = (items, whitelist) => {
  const whitelistLookup = whitelist.reduce((lookup, item) => {
    lookup[item] = true;
    return lookup;
  }, {});

  return items.some(item => !!whitelistLookup[item]);
};

const findBlacklistedItem = (list, blacklist, comparator) => {
  let matchingEntry;

  list.some(item => {
    blacklist.some(entry => {
      const matched = comparator(item, entry);

      if (matched) matchingEntry = entry;

      return matched;
    });
  });

  return matchingEntry;
};

const equals = (a, b) => a === b;
const contains = (a, b) => a.indexOf(b) !== -1;

export default function getBlockReason(
  {
    authors = [],
    title = '',
    tags = [],
    summary = '',
  },
  {
    authorBlacklist = [],
    titleBlacklist = [],
    tagBlacklist = [],
    authorWhitelist = [],
    tagWhitelist = [],
    summaryBlacklist = [],
  }
) {

  if (isItemWhitelisted(tags, tagWhitelist)) { 
    return null;
  }

  if (isItemWhitelisted(authors, authorWhitelist)) {
    return null;
  }

  const blockedTag = findBlacklistedItem(tags, tagBlacklist, matchTermsWithWildCard);
  if (blockedTag) {
    return {tag: blockedTag};
  }

  const author = findBlacklistedItem(authors, authorBlacklist, equals);
  if (author) {
    return {author};
  }

  const blockedTitle = findBlacklistedItem([title], titleBlacklist, matchTermsWithWildCard);
  if (blockedTitle) {
    return {title: blockedTitle};
  }

  const summaryTerm = findBlacklistedItem([summary], summaryBlacklist, contains);
  if (summaryTerm) {
    return {summary: summaryTerm};
  }

  return null;
}