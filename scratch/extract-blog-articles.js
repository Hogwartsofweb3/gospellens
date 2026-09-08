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
    const html = await fetchUrl('https://www.monergism.com/blog');
    
    // Look for all <div class="views-row... or <div class="node...
    console.log("HTML length:", html.length);
    
    // Let's count occurrences of some classes
    const classes = ['views-row', 'node-teaser', 'node-', 'field-content', 'teaser', 'views-field'];
    for (const cls of classes) {
      const count = (html.match(new RegExp(cls, 'g')) || []).length;
      console.log(`Count of '${cls}':`, count);
    }

    // Let's print out the content between <div class="view-content"> and </div>
    const teaserIdx = html.indexOf('node-teaser');
    if (teaserIdx !== -1) {
      console.log("\nFound node-teaser at:", teaserIdx);
      console.log(html.substring(teaserIdx - 200, teaserIdx + 1800));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
