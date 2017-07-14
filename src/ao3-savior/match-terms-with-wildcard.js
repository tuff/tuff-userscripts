export default function matchTermsWithWildCard(term, pattern) {
  if (term.toLowerCase() === pattern.toLowerCase()) return true;
  if (pattern.indexOf('*') === -1) return false;

  const regexified = pattern.replace(/\*/g, '.*?');
  const regex = new RegExp(`^${regexified}$`, 'i');

  return regex.test(term);
}