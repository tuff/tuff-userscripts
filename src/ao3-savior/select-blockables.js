const getText = element => element.textContent.replace(/^\s*|\s*$/g, '');
const selectTextsIn = (root, selector) => Array.from(root.querySelectorAll(selector)).map(getText);

export function selectFromWork(container) {
  return {
    ...selectFromBlurb(container),
    title: selectTextsIn(container, '.title')[0],
    summary: selectTextsIn(container, '.summary .userstuff')[0],
  }
}

export function selectFromBlurb(blurb) {
  return {
    authors: selectTextsIn(blurb, 'a[rel=author]'),
    tags: [].concat(
        selectTextsIn(blurb, 'a.tag'),
        selectTextsIn(blurb, '.required-tags .text'),
      ),
    title: selectTextsIn(blurb, '.header .heading a:first-child')[0],
    summary: selectTextsIn(blurb, 'blockquote.summary')[0],
  };
}