# Interactive World Currency Explorer

A modern, interactive web app to explore global currencies. It now includes an AI Insights panel that answers any question with a minimum of 10 well‑explained bullet points, a refreshed Tailwind aesthetic, and an optional local proxy server for secure OpenAI access.

## What’s New in This Update

- AI insights: Ask questions and get 10+ structured, explanatory bullets.
- Tailwind redesign: Aurora/blossom/mint palette, dark mode, glow effects.
- Modular structure: Separate HTML, CSS, and JS with clear responsibilities.
- Local server: Express server that serves the UI and proxies OpenAI calls.
- Demo mode: Generate example bullets without any API key.

## Quick Start

Choose one of the two flows below.

1) Instant demo (no server)
- Open `curr/index.html` directly in a browser.
- Click “Demo” to render 10+ sample points.
- To use real AI without the server, open “Settings” and paste your OpenAI API key (stored in your browser’s localStorage). For production, prefer the server proxy below.

2) Full demo with local server (recommended)
- Prerequisites: Node 18+.
- Setup and run:
  ```bash
  cd server
  cp .env.example .env
  # edit .env and set OPENAI_API_KEY
  npm install
  npm start
  ```
- Open http://localhost:8787/
- Health check: http://localhost:8787/api/health should return `{ "ok": true }`.

## Usage Guide

- Theme: Use the “Toggle Theme” button to switch light/dark (persisted).
- AI Insights:
  - Type a question, set “Min bullets” (>= 10), choose Style and Detail.
  - Click “Generate Insights” for AI output.
  - Actions: Stop, Clear, Copy (Markdown), Download (JSON), Speak (TTS).
- Currency explorer:
  - Real‑time search across country, currency, and code.
  - Stats cards show total countries, unique currencies, and most‑used currency.
  - Chart displays the top 10 most common currencies.

## Project Structure

```
global_currencies/
├── README.md
├── curr/
│   ├── index.html           # New modular UI (AI + explorer)
│   ├── c.html               # Original single‑file page (legacy)
│   ├── css/
│   │   └── theme.css        # Small custom CSS (chart sizing, font)
│   └── js/
│       ├── tw-config.js     # Tailwind CDN config (theme + dark mode)
│       ├── data.js          # Currency dataset
│       ├── app.js           # Theme, stats, chart, search, cards
│       └── ai.js            # AI interactions, actions, settings, demo
└── server/
    ├── server.js            # Express static server + /api/chat proxy
    ├── package.json         # Server dependencies and scripts
    └── .env.example         # Env template (OPENAI_API_KEY, PORT, STATIC_DIR)
```

## Configuration

- `OPENAI_API_KEY`: Set in `server/.env` for the proxy, or in the UI “Settings” (localStorage) when not using the server.
- `PORT`: Defaults to `8787`.
- `STATIC_DIR`: Defaults to `../curr` from the server directory.

## Technology Stack

- Tailwind CSS (CDN config via `curr/js/tw-config.js`)
- Chart.js for charts
- Vanilla JavaScript (no framework)
- Express server (proxying OpenAI)

## Logging & Troubleshooting

- Server logs:
  - Startup: `server/server.js` logs the port and static dir.
  - Errors: `server/server.js` logs failures with `console.error` and returns JSON errors.
- UI status messages:
  - `curr/js/ai.js` uses `flashStatus` and `setLoading` to show success or failure.
- Common issues:
  - “localhost refused to connect”: Start the server (`npm start`) and open `http://localhost:8787/`.
  - 401/429 errors from OpenAI: Check `OPENAI_API_KEY`, usage limits, or model name.
  - No API key and no server: Use the “Demo” button.

## Notes

- Security: Keep your API key server‑side for production (via the proxy). The client‑side key option is for local testing only.
- Compatibility: Modern browsers (Chrome/Edge/Safari/Firefox). Tailwind and Chart.js are loaded via CDN.

## License

MIT
