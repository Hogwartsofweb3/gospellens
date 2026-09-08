const https = require('https');
const sanitizeHtml = require('sanitize-html');

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
    console.log("Fetching page 0 of Monergism blog...");
    const html = await fetchUrl('https://www.monergism.com/blog?page=0');
    
    const articleRegex = /<article[^>]*class="[^"]*node-teaser[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    const titleRegex = /<h2 class="node-title"><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h2>/i;
    const imgRegex = /<img[^>]*src="([^"]+)"/i;
    
    let match;
    const articles = [];
    
    while ((match = articleRegex.exec(html))) {
      const articleContent = match[1];
      
      const titleMatch = titleRegex.exec(articleContent);
      if (!titleMatch) continue;
      
      const path = titleMatch[1];
      const title = titleMatch[2].replace(/&amp;/g, '&').replace(/&#039;/g, "'").trim();
      const url = path.startsWith('http') ? path : `https://www.monergism.com${path}`;
      
      const imgMatch = imgRegex.exec(articleContent);
      let thumbnailUrl = null;
      if (imgMatch) {
        const imgSrc = imgMatch[1];
        thumbnailUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.monergism.com${imgSrc}`;
      }
      
      // Extract body content
      let rawBody = '';
      const bodyIdx = articleContent.indexOf('<div class="field-item even">');
      if (bodyIdx !== -1) {
        const bodyContent = articleContent.substring(bodyIdx + '<div class="field-item even">'.length);
        // Find closing tag of this div
        // A simple fallback is to take everything up to the next closing section
        const endIdx = bodyContent.indexOf('</div>');
        rawBody = bodyContent.substring(0, endIdx);
      } else {
        rawBody = articleContent;
      }
      
      // Sanitize body HTML
      const cleanDescription = sanitizeHtml(rawBody, { 
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3' ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          'img': ['src', 'alt', 'width', 'height']
        }
      });
      
      articles.push({
        title,
        url,
        thumbnailUrl,
        descriptionLength: cleanDescription.length,
        descriptionPreview: cleanDescription.substring(0, 100) + '...'
      });
    }
    
    console.log("Parsed articles count:", articles.length);
    console.log("Parsed articles sample:", articles.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}

run();
