const html = await fetch('https://www.bangkokhospital.com/', {
  headers: {'User-Agent': 'Mozilla/5.0'}
}).then(r => r.text());

console.log('HTML length:', html.length);
console.log('\nSearching for doctor elements...');
console.log('  [class*=doctor]:', (html.match(/class="[^"]*doctor[^"]*"/gi) || []).length);
console.log('  [class*=physician]:', (html.match(/class="[^"]*physician[^"]*"/gi) || []).length);
console.log('  Dr. mentions:', (html.match(/Dr\./g) || []).length);
console.log('  MD mentions:', (html.match(/\bMD\b/g) || []).length);

console.log('\nSearching for price patterns...');
console.log('  $ signs:', (html.match(/\$/g) || []).length);
console.log('  Baht:', (html.match(/Baht|฿/g) || []).length);
console.log('  USD:', (html.match(/USD/g) || []).length);

console.log('\nFirst occurrence with Dr.:');
const drIndex = html.indexOf('Dr.');
if (drIndex !== -1) {
  console.log(html.substring(drIndex, drIndex + 300));
}

console.log('\n\nSample HTML structure (first 2000 chars):');
console.log(html.substring(0, 2000));
