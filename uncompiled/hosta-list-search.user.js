// ==UserScript==
// @name          hosta-list-search
// @description   Search for www.hostalists.org
// @namespace     hosta-list-search
// @include       http*://www.hostalists.org/*
// @grant         none
// @require       https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js
// @version       0.1
// ==/UserScript==


// inject lodash
var tag = document.createElement('script');
tag.src = 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js';
document.head.appendChild(tag);


const NAMESPACE = 'HLS-script';
const SCRAPE_BATCH_SIZE = 10;
const SCRAPE_BATCH_DELAY = 500;
const REQUEST_TIMEOUT = 30000;


function scrapeNames(url) {
  const xhr = new XMLHttpRequest();

  const makeRequest = (resolve, reject) => {
    const timeout = window.setTimeout(reject, REQUEST_TIMEOUT);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        window.clearTimeout(timeout);
        resolve(xhr.responseText);
      } else if (xhr.status >= 400) {
        reject();
      }
    };

    xhr.open('GET', url, true);
    xhr.send(null);
  }

  const scrape = text => {
    const content = text.replace(/^[\s\S]*?<table.*?>|<\/table>[\s\S]*$/gi, '');
    const table = document.createElement('table');

    table.innerHTML = content;

    const tds = [ ...table.querySelectorAll('td') ];

    const hostas = tds.reduce((list, td) => {
      const names = td.innerHTML
        .split(/<br\/?>/ig)
        .map( line => line.replace(/^\W+|\W+$/gi, '') )
        .filter(name => !!name);

      return list.concat(names);
    }, []);

    return hostas;
  };

  return new Promise(makeRequest)
    .then(scrape);
}

function getListLinks() {
  return [ ...document.querySelectorAll('table a') ]
    .filter(a =>
      a.href.indexOf('//www.hostalists.org') > -1 &&
      a.href.indexOf('hosta_list') > -1 &&
      a.textContent.toLowerCase().indexOf(' hostas') > 0
    );
}

function loadStorage() {
  const storageString = window.localStorage[NAMESPACE];

  try {
    window[NAMESPACE] = storageString && JSON.parse(storageString);
  } catch (ex) {
    console.warn(`${NAMESPACE}: bad string in localStorage`);
  }
}

function saveStorage() {
  window.localStorage[NAMESPACE] = JSON.stringify(window[NAMESPACE]);
}

function buildStore(rebuild) {
  loadStorage();

  if (window[NAMESPACE] && !rebuild) return;

  const links = getListLinks();
  const lists = {};

  const scrapeLink = link => {
    const listName = link.textContent.replace(/^\W+|\W+$| Hostas/gi, '');

    return scrapeNames(link.href)
      .then(list => {
        if (!list.length) {
          console.warn(`${NAMESPACE}: found 0 hostas at [${listName}](${link.href})`);
        }
        lists[listName] = list;
      })
      .catch(() => console.warn(
        `${NAMESPACE}: couldn't load hostas from [${listName}](${link.href})`));
  };

  (new Promise((resolve, reject) => {
    const interval = window.setInterval(() => {
      const batch = links.splice(0, SCRAPE_BATCH_SIZE);
      const promises = [];

      if (!batch.length) {
        window.clearInterval(interval);
        resolve(promises);
      }

      promises.push( ...batch.map(scrapeLink) );
    }, SCRAPE_BATCH_DELAY);
  }))
  .then(requests => Promise.all(requests))
  .then(() => {
    window[NAMESPACE] = lists;
    saveStorage();
  });
}


buildStore(true);




// scrapeNames('http://www.hostalists.org/hosta_list_lut.php')
//   .then(result => window.RESULT = result)
//   .catch(console.log);
