import matchTermsWithWildCard from '../../src/ao3-savior/match-terms-with-wildcard';

let assert = require('chai').assert;

describe('matchTermsWithWildCard', function() {
  it('should do simple matches correctly', function() {
    const pattern = 'skeleton war';
    const term = 'Skeleton War';
    const miss = 'emu war';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });

  it('should do single internal wildcard matches correctly', function() {
    const pattern = 'first * war';
    const term = 'first world war';
    const miss = 'second world war';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });

  it('should do single leading wildcard matches correctly', function() {
    const pattern = '* war';
    const term = 'first world war';
    const miss = 'Warlords of Draenor';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });

  it('should do single trailing wildcard matches correctly', function() {
    const pattern = 'skele*';
    const term = 'skeletal';
    const miss = 'skellybones';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });

  it('should do multiple wildcard matches correctly', function() {
    const term = 'The quick brown fox';
    const miss = 'There is a red fox';
    const pattern = 'the * brown *';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });

  it('should match `*RPF)`', function() {
    const term = 'Natuzzi (Hockey RPF)';
    const miss = 'not RPF';
    const pattern = '*RPF)';
    const matched = matchTermsWithWildCard(term, pattern);
    const unmatched = matchTermsWithWildCard(miss, pattern);

    assert(matched);
    assert(!unmatched);
  });
});
