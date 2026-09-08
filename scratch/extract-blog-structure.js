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
    
    // Let's print out a snippet of the HTML containing the first post
    // Search for the first occurrence of '/reformation-theology/blog/'
    const idx = html.indexOf('/reformation-theology/blog/');
    if (idx !== -1) {
      console.log("Found post link at index:", idx);
      // Print 2000 characters before and after to see the post wrapper structure
      const start = Math.max(0, idx - 300);
      const end = Math.min(html.length, idx + 1200);
      console.log("HTML Around Post:\n", html.substring(start, end));
    } else {
      console.log("Could not find post link index.");
    }
  } catch (err) {
    console.error(err);
  }
}

run();
