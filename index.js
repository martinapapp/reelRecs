import { geminiClient, sql } from './config.js'

const form = document.querySelector('form')
const input = document.querySelector('input')
const reply = document.querySelector('.reply')

form.addEventListener('submit', function(e) {
    e.preventDefault()
    main(input.value)
    input.value = ''
})

async function main(input) {
  try {
    reply.innerHTML = "Thinking..."
    const embedding = await createEmbedding(input)
    const match = await findNearestMatch(embedding)
    await getChatCompletion(match, input)
  } catch (error) {
     console.error('Error in main function.', error.message)
     reply.innerHTML = "Sorry, something went wrong. Please try again."
  }
}

// Create an embedding vector using Gemini's embedding model
async function createEmbedding(input) {
  const model = geminiClient.getGenerativeModel({ model: "gemini-embedding-001" })
  const result = await model.embedContent(input)
  return result.embedding.values
}

// Query Neon and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  const vectorStr = `[${embedding.join(',')}]`

  const rows = await sql`
    select content, 1 - (embedding <=> ${vectorStr}::vector) as similarity
    from movies
    where 1 - (embedding <=> ${vectorStr}::vector) > 0.5
    order by similarity desc
    limit 4
  `

  if (!rows.length) return "No matching movies found."
  return rows.map(r => r.content).join('\n')
}

// Use Gemini to make the response conversational
const chatHistory = []

const systemPrompt = `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If the answer is not given in the context, find the answer in the conversation history if possible. If you are unsure and cannot find the answer, say, "Sorry, I don't know the answer." Please do not make up the answer. Always speak as if you were chatting to a friend.`

async function getChatCompletion(text, query) {
  const model = geminiClient.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.65,
    }
  })

  const chat = model.startChat({ history: chatHistory })

  const message = `Context: ${text} Question: ${query}`
  const result = await chat.sendMessage(message)
  const responseText = result.response.text()

  chatHistory.push({ role: "user", parts: [{ text: message }] })
  chatHistory.push({ role: "model", parts: [{ text: responseText }] })

  reply.innerHTML = responseText
}