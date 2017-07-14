export default function isDebug(location) {
  return location.hostname === 'localhost' || /\ba3sv-debug\b/.test(location.search);
}
