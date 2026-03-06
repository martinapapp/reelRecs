# ReelRecs

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-blue)
![Neon](https://img.shields.io/badge/database-Neon-teal)
![Express](https://img.shields.io/badge/backend-Express-black)

A conversational movie recommendation chatbot powered by semantic search and AI.
*[link here](https://reelrecs.onrender.com/)*

## Index

- [About](#about)
- [Usage](#usage)
- [Development](#development)
- [Changes](#changes)
- [Contribution](#contribution)
- [License](#license)

---

## About

ReelRecs lets users ask natural language questions to get personalized movie recommendations. The main goal was to learn how to:

- Use **vector embeddings** to represent text as numerical data
- Perform **semantic search** — finding results by meaning, not just keywords
- Store and query **vector data** in a PostgreSQL database using `pgvector`
- Use **Retrieval-Augmented Generation (RAG)** to ground AI responses in real data
- Integrate the **Gemini API** for both embeddings and chat completions
- Work with **Neon** as a serverless PostgreSQL + vector database
- Build a **secure fullstack app** — keeping API keys server-side with Express
- Deploy a **fullstack app** as a single service on Render

---

## Usage

### Installation

1. Clone the repository
2. Run `npm install` to install root dependencies
3. Run `cd server && npm install` to install backend dependencies
4. Create a `.env` file in the root with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key
NEON_URL=your_neon_connection_string
```

5. Seed the database by running `node --env-file=.env seed.js`
6. Start the app with `npm run dev`

### Commands

```
npm run dev      // Starts both the Vite frontend and Express backend concurrently
npm run build    // Builds the frontend into dist/ for production
npm start        // Starts the Express server (serves the built frontend + API)
```

---

## Development

### Pre-Requisites

- A code editor
- Node.js v18 or higher
- A Google AI Studio account for the Gemini API key
- A Neon account for the database
- Basic knowledge of JavaScript and async/await

### File Structure

| No | Path | What it does |
|----|------|--------------|
| 1 | `index.html` | Main HTML structure of the app |
| 2 | `src/index.js` | Frontend logic — handles form submission and fetch calls to the backend |
| 3 | `src/index.css` | Styles for the app |
| 4 | `src/config.js` | Exports the backend API URL (switches between dev and production) |
| 5 | `server/index.js` | Express server — handles embeddings, vector search, and Gemini chat |
| 6 | `seed.js` | One-time script to embed and insert movie data into the database |
| 7 | `package.json` | Root dependencies and npm scripts |
| 8 | `server/package.json` | Backend dependencies |

### Build

The app is split into a Vite frontend and an Express backend. In development, both run concurrently — Vite on port `5173` and Express on port `3000`. In production, Express serves the built Vite `dist/` folder directly, so the whole app runs as a single service.

When a user submits a question, the frontend sends it to the Express `/api/chat` endpoint. The server creates a vector embedding using Gemini, runs a cosine similarity search against the Neon database to find matching movies, then passes those results as context to Gemini's chat model, which formulates a conversational response. This pattern is known as RAG (Retrieval-Augmented Generation).
Another route was added to for debugging purpose the `/api/debug` to see a sample database in json.

---

## Changes

### From OpenAI & Supabase to Gemini & Neon

*The original project was built using OpenAI and Supabase*

1. **OpenAI → Gemini** — both the chat model (`gemini-2.5-flash`) and the embedding model (`gemini-embedding-001`) now run on Google's Gemini API
2. **Supabase → Neon** — the vector database was migrated from Supabase to Neon, with the similarity search query moved directly into the JS code using Neon's serverless client
3. **@supabase/supabase-js → @neondatabase/serverless** — the client library was swapped accordingly
4. **Environment variables** — `VITE_OPENAI_API_KEY`, `VITE_SUPABASE_API_KEY` and `VITE_SUPABASE_URL` were replaced with `GEMINI_API_KEY` and `NEON_URL` (no longer `VITE_` prefixed since keys are now server-side only)
5. **Embedding dimensions** — changed from 1536 (OpenAI ada-002) to 768 (Gemini embedding-001), so the database schema and vector column were updated to match

### From Frontend to Fullstack

*The original project was only Frontend*

1. **Express backend added** — all API calls now go through a `server/` folder running Express
2. **API keys secured** — removed `VITE_` prefix so keys are never bundled into the frontend
3. **Frontend restructured** — source files moved into `src/` following standard Vite conventions
4. **Single service deploy** — Express serves both the API and the built frontend, so only one deployment is needed

---

## Contribution

1. Found a bug? Open an issue and I'll try to fix it.
2. Advice? If you have ideas for improving the recommendations or adding more movies, let me know!

---

## License

Feel free to use this for your own practice!

**MIT** License.