# Said Different 🔮

> *What they said. What they meant. They're rarely the same.*

AI-powered conversation decoder. Paste any text conversation and instantly get:
- The brutal truth headline
- 3 layered meanings (most likely / alternative / worst case)
- A confidence score + emotional vibe word
- Red flag detection
- Exactly what to reply — and what NOT to say
- Shareable card for TikTok / Instagram Stories

---

## Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Framework | Next.js 14 (Pages Router)     |
| AI        | Anthropic Claude (server-side)|
| Hosting   | Vercel (zero-config deploy)   |
| Styling   | Inline styles + injected CSS  |
| Storage   | localStorage (client-side)    |

---

## Local Setup

```bash
# 1. Clone / unzip the project
cd said-different

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# → Edit .env.local and add your Anthropic API key

# 4. Run dev server
npm run dev
# → Open http://localhost:3000
```

---

## Deploy to Vercel (3 steps, ~2 minutes)

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel
# Follow the prompts. When asked for environment variables, add ANTHROPIC_API_KEY.
```

### Option B — Vercel Dashboard
1. Push this folder to a GitHub repo (public or private)
2. Go to https://vercel.com/new → Import the repo
3. In **Environment Variables**, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key from console.anthropic.com)
4. Click **Deploy**

That's it. Vercel auto-detects Next.js and handles everything.

---

## Environment Variables

| Variable            | Required | Description                        |
|---------------------|----------|------------------------------------|
| `ANTHROPIC_API_KEY` | ✅ Yes   | From https://console.anthropic.com |

**Never commit `.env.local` to git.** It's already in `.gitignore`.

---

## Project Structure

```
said-different/
├── pages/
│   ├── _app.js          ← Global CSS import
│   ├── _document.js     ← HTML head (meta, fonts, OG tags)
│   ├── index.js         ← Main app (full UI)
│   └── api/
│       └── decode.js    ← Secure Anthropic API route
├── styles/
│   └── globals.css      ← Animations, resets, utility classes
├── public/
│   ├── og.svg           ← Open Graph image
│   └── robots.txt
├── .env.example         ← Copy to .env.local
├── .gitignore
├── next.config.js
└── package.json
```

---

## Rate Limiting

The `/api/decode` route limits each IP to **15 decodes per day**.

This uses in-memory storage which resets on serverless cold starts.
For production scale, replace with [Upstash Redis](https://upstash.com/):

```bash
npm install @upstash/redis
```

Then in `pages/api/decode.js`, swap the `ipMap` logic for Redis `INCR` + `EXPIRE`.

---

## Monetisation (when you're ready)

1. Add Stripe or Razorpay for a Pro tier
2. Store subscription status in a DB (PlanetScale / Supabase)
3. Check subscription in the API route instead of the flat 15-limit
4. Suggested pricing: ₹299/month or $4.99/month for unlimited decodes

---

## License

MIT — do whatever you want with it.
