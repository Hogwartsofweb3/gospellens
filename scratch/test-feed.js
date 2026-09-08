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
    console.log("Fetching default blog feed...");
    const blogXml = await fetchUrl('https://www.monergism.com/blog/feed');
    console.log("Blog feed length:", blogXml.length);
    
    // Check if it contains some titles
    const titles = [];
    const regex = /<title>([\s\S]*?)<\/title>/g;
    let match;
    while ((match = regex.exec(blogXml)) && titles.length < 5) {
      titles.push(match[1]);
    }
    console.log("Blog titles:", titles);

    console.log("\nFetching blog feed page 2 with pretty URL...");
    const blogXml2 = await fetchUrl('https://www.monergism.com/blog/page/2/feed/');
    const titles2 = [];
    regex.lastIndex = 0;
    while ((match = regex.exec(blogXml2)) && titles2.length < 5) {
      titles2.push(match[1]);
    }
    console.log("Blog page 2 pretty URL titles:", titles2);

    console.log("\nFetching blog feed page 3 with pretty URL...");
    const blogXml3 = await fetchUrl('https://www.monergism.com/blog/page/3/feed/');
    const titles3 = [];
    regex.lastIndex = 0;
    while ((match = regex.exec(blogXml3)) && titles3.length < 5) {
      titles3.push(match[1]);
    }
    console.log("Blog page 3 pretty URL titles:", titles3);

    console.log("\nFetching directory theology feed...");
    const dirXml = await fetchUrl('https://www.monergism.com/directory-theology/feed');
    console.log("Dir feed length:", dirXml.length);
    const dirTitles = [];
    regex.lastIndex = 0;
    while ((match = regex.exec(dirXml)) && dirTitles.length < 5) {
      dirTitles.push(match[1]);
    }
    console.log("Dir titles:", dirTitles);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
