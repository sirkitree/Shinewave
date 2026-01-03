# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shinewave** is a multi-outlet positive news application that:
- Aggregates positive and uplifting news from around the world
- Filters content by positivity score using AI sentiment analysis
- Provides a Google Discover-style card-based web interface
- Supports dark mode with system preference detection
- Supports localization for different regions/languages (post-MVP)

## Tech Stack (MVP)

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify 5.x
- **Database**: SQLite (via better-sqlite3)
- **Sentiment Analysis**: Claude API (Haiku model)
- **Scheduler**: node-cron
- **Frontend**: Vanilla HTML/CSS/JS (Google Discover-style)

## News Sources

| Source | Feed URL | Notes |
|--------|----------|-------|
| Optimist Daily | https://www.optimistdaily.com/feed/ | Original source |
| Good News Network | https://www.goodnewsnetwork.org/feed/ | Original source |
| Positive News | https://www.positive.news/feed/ | Original source |
| Sunny Skyz | https://feeds.feedburner.com/SunnySkyz | Uplifting stories |
| Upworthy | https://www.upworthy.com/feeds/feed.rss | High-engagement content |
| Reasons to be Cheerful | https://reasonstobecheerful.world/feed/ | Solutions journalism |
| Good News EU | https://goodnews.eu/feed/ | European focus |
| The Better India | https://www.thebetterindia.com/feed/ | Indian focus |
| Good Good Good | https://www.goodgoodgood.co/articles/rss.xml | Hopeful stories |
| Quanta Magazine | https://www.quantamagazine.org/feed/ | Science journalism |

## Architecture

```
├── src/
│   ├── index.ts              # Entry point, Fastify server setup
│   ├── config/               # Configuration and environment
│   ├── routes/               # API route handlers
│   ├── services/
│   │   ├── aggregator/       # RSS fetching + image scraping
│   │   ├── sentiment/        # Claude API positivity scoring
│   │   └── scheduler/        # Cron job management
│   ├── db/                   # SQLite setup and queries
│   ├── types/                # TypeScript type definitions
│   └── scripts/
│       └── fetch.ts          # Manual fetch CLI script
├── web/                      # Static frontend
│   ├── index.html            # Main HTML with source tabs + theme toggle
│   ├── styles.css            # CSS with dark mode variables
│   └── app.js                # JS with filtering + theme management
└── shinewave.db              # SQLite database (gitignored)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Web frontend |
| GET | `/api/news` | List positive news (paginated) |
| GET | `/api/news?limit=20&page=2` | Pagination params |
| GET | `/api/news?source=Good%20News%20Network` | Filter by source |
| GET | `/api/news/:id` | Single article by ID |
| GET | `/health` | Health check |

## Frontend Features

- **Card-based feed**: Google Discover-style article cards with images
- **Source sidebar**: Vertical sidebar with checkboxes to toggle sources on/off
  - Select/Deselect All button for quick toggling
  - Client-side filtering for instant updates
  - Collapsible on mobile (slides in from left)
- **Dark mode**: Toggle in header, respects system preference, persists to localStorage
- **Pull-to-refresh**: On mobile, pull down to reload articles
- **Responsive**: Desktop sidebar (240px), mobile slide-out panel

## Build Commands

```bash
npm install              # Install dependencies
npm run dev              # Run development server with hot reload
npm run build            # Compile TypeScript
npm run start            # Run production build
npm run fetch            # Fetch from all sources
npm run fetch -- --limit=10  # Fetch limited articles (for testing)
```

## Testing

```bash
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
```

## Environment Variables

```bash
CLAUDE_API_KEY=           # Required: Anthropic API key for sentiment analysis
PORT=3000                 # Optional: Server port (default: 3000)
POSITIVITY_THRESHOLD=0.7  # Optional: Minimum score to include (0-1, default: 0.7)
```

## How It Works

1. **RSS Fetching**: Pulls articles from configured news sources via RSS
2. **Image Extraction**:
   - First tries RSS fields (enclosure, media:content, content:encoded)
   - Falls back to scraping og:image from article page
3. **Sentiment Analysis**: Sends title + description to Claude Haiku for 0-1 positivity score
4. **Storage**: Articles scoring above threshold stored in SQLite
5. **Scheduling**: Cron job fetches new articles hourly
6. **Frontend**: Card-based responsive UI pulls from REST API

## MVP Scope

**Included:**
- Fetch news from 9 sources (RSS + page scraping for images)
- Score articles for positivity via Claude API (Haiku)
- Store qualifying articles in SQLite with images
- Serve via REST API with pagination and filtering
- Google Discover-style responsive web frontend
- Source filter tabs
- Dark mode with system preference + localStorage persistence
- Hourly scheduled fetches

**Deferred (post-MVP):**
- Localization/i18n
- User accounts
- Push notifications
- Mobile apps
- Admin dashboard
- Content deduplication
