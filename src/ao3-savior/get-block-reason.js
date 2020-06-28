import matchTermsWithWildCard from './match-terms-with-wildcard';

const isTagWhitelisted = (tags, whitelist) => {
  const whitelistLookup = whitelist.reduce((lookup, tag) => {
    lookup[tag] = true;
    return lookup;
  }, {});

  return tags.some(tag => !!whitelistLookup[tag]);
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
    tagWhitelist = [],
    summaryBlacklist = [],
  }
) {

  if (isTagWhitelisted(tags, tagWhitelist)) {
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