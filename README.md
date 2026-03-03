# ReelRecs 🎬

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-blue)
![Neon](https://img.shields.io/badge/database-Neon-teal)

A conversational movie recommendation chatbot powered by semantic search and AI.

## Index

- [About](#about)
- [Usage](#usage)
- [Development](#development)
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
- Build a full AI-powered app with **Vite** as the frontend tooling

---

## Usage

### Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file in the root with the following variables:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_NEON_URL=your_neon_connection_string
```
4. Seed the database by running `node --env-file=.env seed.js`
5. Start the app with `npm run dev`

### Commands

I'm using Vite to make development faster. Here are the main scripts I use:

```
npm run dev      // Starts the project so I can see changes live.
npm run build    // Prepares the project for the real world (deployment).
npm run preview  // Lets me check the build version locally.
```

---

## Development

### Pre-Requisites

- A code editor 
- Node.js v18 or higher
- A [Google AI Studio] account for the Gemini API key
- A [Neon] account for the database
- Basic knowledge of JavaScript and async/await

### File Structure

| No | File Name | What it does |
|----|-----------|--------------|
| 1 | `index.html` | Main HTML structure of the app |
| 2 | `index.js` | Core app logic — handles embeddings, search, and chat |
| 3 | `index.css` | Styles for the app |
| 4 | `config.js` | Initializes the Gemini and Neon clients from env variables |
| 5 | `seed.js` | One-time script to embed and insert movie data into the database |
| 6 | `package.json` | Project dependencies and npm scripts |
| 7 | `.env` | Local environment variables (not committed to git) |

### Build

When a user submits a question, the app creates a vector embedding of it using Gemini. That embedding is then compared against pre-stored movie embeddings in the Neon database using cosine similarity. The closest matches are retrieved and passed as context to Gemini's chat model, which formulates a conversational response. This pattern is known as RAG (Retrieval-Augmented Generation).

### From OpenAi & Supabase to Gemini & Neon

*The original project was built using OpenAI and Supabase*

1. OpenAI → Gemini — both the chat model (gemini-2.5-flash) and the embedding model (gemini-embedding-001) now run on Google's Gemini API instead of OpenAI's gpt-4 and text-embedding-ada-002
2. Supabase → Neon — the vector database was migrated from Supabase (Postgres + pgvector) to Neon (also Postgres + pgvector), with the similarity search query moved directly into the JS code using Neon's serverless client instead of a Supabase RPC function
3. @supabase/supabase-js → @neondatabase/serverless — the client library was swapped accordingly
4. Environment variables — VITE_OPENAI_API_KEY, VITE_SUPABASE_API_KEY and VITE_SUPABASE_URL were replaced with VITE_GEMINI_API_KEY and VITE_DATABASE_URL
5. Embedding dimensions — changed from 1536 (OpenAI ada-002) to 768 (Gemini embedding-001), so the database schema and vector column were updated to match

---

## Contribution

1. Found a bug? Open an issue and I'll try to fix it.
2. Advice? If you have ideas for improving the recommendations or adding more movies, let me know!

### Guideline

Keep it simple — this is a learning project. If you open a PR, make sure it's focused on one change at a time and include a short description of what you changed and why.

---

## License

Feel free to use this for your own practice!

**MIT** License.