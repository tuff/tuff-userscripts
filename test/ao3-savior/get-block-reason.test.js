import getBlockReason from '../../src/ao3-savior/get-block-reason';

let expect = require('chai').expect;

describe('getBlockReasons', () => {
  it('should support tag blacklisting', () => {
    const unwanted = 'creepy *';
    const hit = {
      tags: ['slugs', 'bugs', 'creepy crawlies']
    };
    const miss = {
      tags: ['slugs', 'bugs']
    };
    const blacklists = {
      tagBlacklist: [unwanted],
    };

    expect( getBlockReason(hit, blacklists).tag ).to.equal(unwanted);
    expect( getBlockReason(miss, blacklists) ).to.equal(null);
  });

  it('should support author blacklisting', () => {
    const unwanted = 'smeyer';
    const hit = {
      authors: ['Hated Author 1', 'smeyer']
    };
    const miss = {
      authors: ['Roald Dahl', 'Dr. Seuss']
    };
    const blacklists = {
      authorBlacklist: [unwanted],
    };

    expect( getBlockReason(hit, blacklists).author ).to.equal(unwanted);
    expect( getBlockReason(miss, blacklists) ).to.equal(null);
  });

  it('should support tag whitelisting', () => {
    const miss = {
      title: 'Pygmalion',
      tags: ['slugs', 'bugs', 'creepy crawlies']
    };
    const blacklists = {
      tagBlacklist: ['bugs'],
      tagWhitelist: ['slugs'],
      titleBlacklist: ['Pygmalion', 'OK Computer'],
    };

    expect( getBlockReason(miss, blacklists) ).to.equal(null);
  });

  it('should support title blacklisting', () => {
    const unwanted = 'The Catcher in the Rye';
    const hit = {
      title: unwanted
    };
    const miss = {
      title: 'The Last Unicorn'
    };
    const blacklists = {
      titleBlacklist: [unwanted, 'Sylvester And The Magic Pebble']
    };

    expect( getBlockReason(hit, blacklists).title ).to.equal(unwanted);
    expect( getBlockReason(miss, blacklists) ).to.equal(null);
  });

  it('should support summary blacklisting', () => {
    const unwanted = 'mouldy bread';
    const hit = {
      summary: `This is a story about ${unwanted}.`
    };
    const miss = {
      summary: 'This is a story about stinky cheese.'
    };
    const blacklists = {
      summaryBlacklist: [unwanted, 'soggy kale']
    };

    expect( getBlockReason(hit, blacklists).summary ).to.equal(unwanted);
    expect( getBlockReason(miss, blacklists) ).to.equal(null);
  });

});