# Shinewave

A multi-outlet positive news aggregator that curates uplifting stories from around the world using AI-powered sentiment analysis.

## Features

- **9 Curated Sources** - Aggregates from Good News Network, Positive News, Optimist Daily, and more
- **AI Sentiment Filtering** - Uses Claude Haiku to score articles and surface only positive content
- **Google Discover-style UI** - Card-based responsive feed with large images
- **Source Filtering** - Toggle sources on/off via sidebar
- **Dark Mode** - System preference detection with manual toggle
- **Automatic Updates** - Hourly scheduled fetches for fresh content

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
