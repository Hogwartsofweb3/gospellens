const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractDivContent(html, startIndex) {
  let openDivs = 1;
  let currentIndex = startIndex;
  
  while (openDivs > 0 && currentIndex < html.length) {
    const nextOpen = html.indexOf('<div', currentIndex);
    const nextClose = html.indexOf('</div>', currentIndex);
    
    if (nextClose === -1) break;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      openDivs++;
      currentIndex = nextOpen + 4;
    } else {
      openDivs--;
      currentIndex = nextClose + 6;
    }
  }
  
  return html.substring(startIndex, currentIndex - 6);
}

async function run() {
  try {
    const url = 'https://www.monergism.com/reformation-theology/blog/repentance-coming-christ-we-might-forsake-sin';
    const html = await fetchUrl(url);
    
    let bodyIdx = html.indexOf('class="field-name-body"');
    if (bodyIdx === -1) {
      bodyIdx = html.indexOf('class="field-name-field-body"');
    }
    
    if (bodyIdx !== -1) {
      const itemIdx = html.indexOf('<div class="field-item even">', bodyIdx);
      if (itemIdx !== -1) {
        const start = itemIdx + '<div class="field-item even">'.length;
        const fullContent = extractDivContent(html, start);
        console.log("Extracted full content length:", fullContent.length);
        console.log("Extracted Preview (Last 300 chars):\n", fullContent.substring(fullContent.length - 300));
      } else {
        console.log("Could not find field-item even container.");
      }
    } else {
      console.log("Could not find field-name-body class.");
      console.log("Fetched HTML length:", html.length);
      console.log("Fetched HTML preview (first 1000 chars):\n", html.substring(0, 1000));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
