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

## News Sources (MVP)

| Source | Feed URL | Images |
|--------|----------|--------|
| Optimist Daily | https://www.optimistdaily.com/feed/ | From RSS content |
| Good News Network | https://www.goodnewsnetwork.org/feed/ | Scraped from og:image |
| Positive News | https://www.positive.news/feed/ | Scraped from og:image |

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
- **Source filtering**: Tabs to filter by All / Optimist Daily / Good News / Positive News
- **Dark mode**: Toggle in header, respects system preference, persists to localStorage
- **Pull-to-refresh**: On mobile, pull down to reload articles
- **Responsive**: Mobile-first design with sticky header and tabs

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
- Fetch news from 3 sources (RSS + page scraping for images)
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
