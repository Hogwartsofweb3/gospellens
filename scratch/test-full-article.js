const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log("Fetching full article HTML...");
    const html = await fetchUrl('https://www.monergism.com/reformation-theology/blog/repentance-coming-christ-we-might-forsake-sin');
    console.log("HTML length:", html.length);
    
    // Look for standard body classes or wrappers like 'field-name-body' or 'node-content'
    const matchIdx = html.indexOf('field-name-body');
    if (matchIdx !== -1) {
      console.log("\nFound 'field-name-body' at:", matchIdx);
      console.log(html.substring(matchIdx - 200, matchIdx + 1800));
    } else {
      console.log("Could not find 'field-name-body' class.");
      // Search for some paragraph tags
      const pIdx = html.indexOf('<p>');
      if (pIdx !== -1) {
        console.log("Found first paragraph at:", pIdx);
        console.log(html.substring(pIdx - 100, pIdx + 1000));
      }
    }
  } catch (err) {
    console.error(err);
  }
}

run();
