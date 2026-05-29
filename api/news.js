const https = require('https');
const http = require('http');

const FEEDS = [
  { url: 'https://www.datacenterknowledge.com/feed', source: 'DC Knowledge' },
  { url: 'https://datacenternews.asia/feed', source: 'DC News Asia' },
  { url: 'https://news.google.com/rss/search?q=data+center+AI+infrastructure&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=hyperscaler+data+center+deal&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=AI+compute+deal+billion&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 DC-Intel-App/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseRSS(xml, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/) || [])[1] || '';
    const link = (item.match(/<link>([^<]+)<\/link>/) || item.match(/<link\s[^>]*href="([^"]+)"/) || [])[1] || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1] || '';
    const description = (item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/) || [])[1] || '';
    const cleanDesc = description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim().slice(0, 200);
    const cleanTitle = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, '').trim();
    if (cleanTitle && cleanTitle.length > 10) {
      items.push({ title: cleanTitle, link, pubDate, snippet: cleanDesc, source: sourceName });
    }
  }
  return items;
}

function tagArticle(title) {
  const t = title.toLowerCase();
  if (t.includes('deal') || t.includes('acqui') || t.includes('invest') || t.includes('billion') || t.includes('contract')) return 'deal';
  if (t.includes('power') || t.includes('grid') || t.includes('energy') || t.includes('nuclear') || t.includes('solar') || t.includes('pue')) return 'power';
  if (t.includes('policy') || t.includes('regul') || t.includes('govern') || t.includes('law') || t.includes('mandate')) return 'policy';
  if (t.includes('market') || t.includes('vacancy') || t.includes('demand') || t.includes('pricing') || t.includes('growth')) return 'market';
  return 'infra';
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');

  const results = await Promise.allSettled(
    FEEDS.map(f => fetchUrl(f.url).then(xml => parseRSS(xml, f.source)))
  );

  let allItems = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') allItems = allItems.concat(r.value);
  });

  // Deduplicate by title similarity
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.slice(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by date, newest first
  unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const formatted = unique.slice(0, 30).map(item => ({
    ...item,
    tag: tagArticle(item.title),
    pubDate: formatDate(item.pubDate)
  }));

  res.json({ items: formatted, fetchedAt: new Date().toISOString(), count: formatted.length });
};
