# DC Intel — Deployment Guide

A mobile-first AI data center news + deals + Claude chat app.
Built by Manisha Sharma.

---

## Project Structure

```
dc-intel/
  index.html        ← the app
  api/
    news.js         ← serverless function: fetches live RSS news
    ask.js          ← serverless function: proxies Claude API (optional)
  vercel.json       ← Vercel routing config
  README.md         ← this file
```

---

## Step 1 — Get your Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **API Keys** in the left menu
4. Click **Create Key** → copy it (starts with `sk-ant-...`)
5. Keep it safe — you'll need it in Step 3

---

## Step 2 — Deploy to Vercel (free, 5 minutes)

### Option A — Drag and Drop (easiest)

1. Go to https://vercel.com and sign up free (use GitHub login)
2. Click **Add New → Project**
3. Click **"Deploy from a folder"** or drag the entire `dc-intel` folder
4. Click **Deploy**
5. Wait ~60 seconds → you get a live URL like `dc-intel.vercel.app`

### Option B — GitHub + Vercel (recommended for portfolio)

1. Create a new GitHub repo called `dc-intel`
2. Upload all files (keep the folder structure)
3. Go to https://vercel.com → **Add New → Project**
4. Import your GitHub repo
5. Click **Deploy**
6. Every time you push to GitHub, Vercel auto-redeploys

---

## Step 3 — Add your API Key to Vercel

This keeps your key private — never exposed in the code.

1. In your Vercel project dashboard, go to **Settings → Environment Variables**
2. Click **Add New**
3. Name: `ANTHROPIC_API_KEY`
4. Value: paste your `sk-ant-...` key
5. Click **Save**
6. Go to **Deployments** → click the three dots → **Redeploy**

Done. Your app is now live with real AI features.

---

## Step 4 — Install on your phone

### iPhone (Safari):
1. Open your Vercel URL in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **Add**
5. App appears on your home screen like a native app

### Android (Chrome):
1. Open your Vercel URL in Chrome
2. Tap the three dots menu
3. Tap **"Add to Home Screen"**
4. Tap **Add**

---

## Step 5 — Share the link

Once deployed, you have:
- **Live URL**: `your-project.vercel.app` — share in LinkedIn comments
- **GitHub repo**: shows the code — share for credibility
- **Home screen app**: use it daily, demo it on video

---

## How the app works

**News tab**
- Fetches live RSS from DC industry sources via `/api/news`
- Falls back to curated dataset if feeds are unavailable
- "AI Summary" button calls Claude on tap (uses your API key)

**Deals tab**
- Curated dataset of 14 major deals ($1.28T tracked)
- Filterable by type: Capex, Compute, M&A, JV, Infra
- Updated manually as new deals are announced

**Ask AI tab**
- Full Claude chat with DC-specific system prompt
- Knows all major deals, APAC markets, neocloud operators, modular DC economics
- Quick-tap chips for common questions
- Chat history maintained per session

---

## Updating the app

**To add a new deal:**
Open `index.html`, find the `DEALS` array, add a new entry at the top:
```javascript
{date:'2026-06', buyer:'Company', counterparty:'Other party', valueB:10, valueTxt:'$10B', type:'compute', detail:'Description of the deal.'},
```

**To add new RSS sources:**
Open `api/news.js`, find the `FEEDS` array, add:
```javascript
{ url: 'https://yoursource.com/feed', source: 'Source Name' },
```

---

## Cost

- Vercel hosting: **free** (hobby tier)
- Anthropic API: ~$0.003 per message. 100 messages/day = ~$9/month
- For personal use: easily under $5/month

---

## Questions?

Built with Claude. Deployed on Vercel. Data from APDCA 2025, CBRE, Structure Research.
