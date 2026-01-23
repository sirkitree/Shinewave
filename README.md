# Shinewave

A multi-outlet positive news aggregator that curates uplifting stories from around the world using AI-powered sentiment analysis.

## Features

- **13 Curated Sources** - Aggregates from Good News Network, Positive News, Optimist Daily, and more
- **AI Sentiment Filtering** - Uses Claude Haiku to score articles and surface only positive content
- **Google Discover-style UI** - Card-based responsive feed with large images
- **Source Filtering** - Toggle sources on/off via sidebar
- **Dark Mode** - System preference detection with manual toggle
- **Automatic Updates** - Hourly scheduled fetches for fresh content

## News Sources

| Source | Description |
|--------|-------------|
| [Optimist Daily](https://www.optimistdaily.com/) | Solutions-focused journalism |
| [Good News Network](https://www.goodnewsnetwork.org/) | Good news since 1997 |
| [Positive News](https://www.positive.news/) | Constructive journalism |
| [Sunny Skyz](https://www.sunnyskyz.com/) | Uplifting stories |
| [Upworthy](https://www.upworthy.com/) | High-engagement positive content |
| [Reasons to be Cheerful](https://reasonstobecheerful.world/) | Solutions journalism |
| [Good News EU](https://goodnews.eu/) | European positive news |
| [Good Good Good](https://www.goodgoodgood.co/) | Hopeful stories |
| [Quanta Magazine](https://www.quantamagazine.org/) | Science journalism |
| [NPR Health](https://www.npr.org/sections/health/) | Health breakthroughs |
| [Not All News Is Bad](https://notallnewsisbad.com/) | Curated positive news |
| [Hacker News](https://news.ycombinator.com/) | Tech news aggregator |
| [Sam Bentley](https://www.youtube.com/@itsSamBentley) | Monthly good news aggregations (YouTube) |

Want to suggest a source? [Open an issue](https://github.com/sirkitree/Shinewave/issues/new?template=source-request.md)!

## Quick Setup

```bash
# Install dependencies
npm install

# Set your Anthropic API key
export CLAUDE_API_KEY=your_key_here

# Fetch initial articles
npm run fetch

# Start the server
npm run dev
```

Visit `http://localhost:3000` to view the app.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run fetch` | Fetch articles from all sources |
| `npm test` | Run test suite |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_API_KEY` | required | Anthropic API key |
| `PORT` | 3000 | Server port |
| `POSITIVITY_THRESHOLD` | 0.7 | Minimum positivity score (0-1) |

## Tech Stack

- **Backend**: Node.js, Fastify 5, TypeScript
- **Database**: SQLite (better-sqlite3)
- **AI**: Claude API (Haiku model)
- **Frontend**: Vanilla HTML/CSS/JS

## License

MIT
