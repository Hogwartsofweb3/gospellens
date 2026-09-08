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
    console.log("Fetching blog HTML...");
    const html = await fetchUrl('https://www.monergism.com/blog');
    console.log("HTML length:", html.length);
    
    // Find pagination links
    console.log("\nSearching for pagination links...");
    const pagerRegex = /href="([^"]*?page[^"]*?)"/gi;
    let match;
    const links = new Set();
    while ((match = pagerRegex.exec(html)) && links.size < 10) {
      links.add(match[1]);
    }
    console.log("Pagination/page links found:", Array.from(links));

    // Also look for post titles/links
    console.log("\nSearching for post links...");
    const postRegex = /href="([^"]*?)"[^>]*>([^<]+)<\/a>/gi;
    const posts = [];
    while ((match = postRegex.exec(html)) && posts.length < 20) {
      if (match[1].includes('/theology') || match[1].includes('/blog/')) {
        posts.push({ url: match[1], title: match[2].trim() });
      }
    }
    console.log("Sample post links:", posts);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
