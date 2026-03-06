import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { neon } from '@neondatabase/serverless'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env') })

const app = express()
app.use(cors())
app.use(express.json())

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const sql = neon(process.env.NEON_URL)

const systemPrompt = `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If the answer is not given in the context, find the answer in the conversation history if possible. If you are unsure and cannot find the answer, say, "Sorry, I don't know the answer." Please do not make up the answer. Always speak as if you were chatting to a friend.`

// Store chat history in memory (per server session)
const chatHistory = []

//check what's in the db 
app.get('/api/debug', async (req, res) => {
    const rows = await sql`select count(*) from movies`
    const sample = await sql`select content from movies limit 1`
    res.json({ count: rows[0].count, sample })
})

app.post('/api/chat', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message is required.' })

  try {
    // 1. Create embedding (your createEmbedding function)
    const embeddingModel = geminiClient.getGenerativeModel({ model: 'gemini-embedding-001' })
    const result = await embeddingModel.embedContent({
        content: { parts: [{ text: message }], role: 'user' },
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768
    })
    const embedding = result.embedding.values

    // 2. Find nearest match
    const vectorStr = `[${embedding.join(',')}]`
    const rows = await sql`
      select content, 1 - (embedding <=> ${vectorStr}::vector) as similarity
      from movies
      where 1 - (embedding <=> ${vectorStr}::vector) > 0.5
      order by similarity desc
      limit 4
    `
    const match = rows.length ? rows.map(r => r.content).join('\n') : 'No matching movies found.'

    // 3. Get chat completion
    const chatModel = geminiClient.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.65 }
    })

    const chat = chatModel.startChat({ history: chatHistory })
    const prompt = `Context: ${match} Question: ${message}`
    const chatResult = await chat.sendMessage(prompt)
    const responseText = chatResult.response.text()

    chatHistory.push({ role: 'user', parts: [{ text: prompt }] })
    chatHistory.push({ role: 'model', parts: [{ text: responseText }] })

    res.json({ reply: responseText })

  } catch (err) {
    console.error('Error in /api/chat:', err.message)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

//connect to frontend
app.use(express.static(join(__dirname, '../dist')))

//catch all routes so the server always returns index.html and lets the frontend handle the routing for the future
app.get('/{*splat}', (req, res) => {
  res.sendFile(join(__dirname, '../dist', 'index.html'))
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
