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


function scrapeHostas(url) {
  const xhr = new XMLHttpRequest();

  const makeRequest = (resolve, reject) => {
    const timeout = window.setTimeout(reject, 3000);

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
        .map( line => line.replace(/^\W*|\W*$/gi, '') );

      return list.concat( _.compact(names) );
    }, []);

    return hostas;
  };

  return new Promise(makeRequest)
    .then(scrape);
}


scrapeHostas('http://www.hostalists.org/hosta_list_blh.php')
  .then(result => window.RESULT = result)
  .catch(console.log);
