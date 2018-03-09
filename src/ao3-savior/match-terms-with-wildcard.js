export default function matchTermsWithWildCard(term0, pattern0) {
  const term = term0.toLowerCase();
  const pattern = pattern0.toLowerCase();

  if (term === pattern) return true;
  if (pattern.indexOf('*') === -1) return false;

  const lastMatchedIndex = pattern.split('*')
    .filter(Boolean)
    .reduce((prevIndex, chunk) => {
      const matchedIndex = term.indexOf(chunk);
      return (prevIndex >= 0 && prevIndex <= matchedIndex) ? matchedIndex : -1
    }, 0);

  return lastMatchedIndex >= 0;
}
