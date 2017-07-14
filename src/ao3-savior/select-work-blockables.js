const getText = element => element.textContent.replace(/^\s*|\s*$/g, '');
const selectTextsIn = (root, selector) => Array.from(root.querySelectorAll(selector)).map(getText);

export default function selectWorkBlockables(workContainerElement) {
  return {
    authors: selectTextsIn(workContainerElement, 'a[rel=author]'),
    tags: [].concat(
        selectTextsIn(workContainerElement, 'a.tag'),
        selectTextsIn(workContainerElement, '.required-tags .text'),
      ),
    title: selectTextsIn(workContainerElement, '.header .heading a:first-child')[0],
    summary: selectTextsIn(workContainerElement, 'blockquote.summary')[0],
  };
}