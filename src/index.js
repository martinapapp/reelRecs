import { API_URL } from './config.js'

const form = document.querySelector('form')
const input = document.querySelector('input')
const reply = document.querySelector('.reply')

form.addEventListener('submit', function(e) {
  e.preventDefault()
  main(input.value)
  input.value = ''
})

async function main(message) {
  try {
    reply.innerHTML = 'Thinking...'

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.error)
    reply.innerHTML = data.reply

  } catch (error) {
    console.error('Error:', error.message)
    reply.innerHTML = 'Sorry, something went wrong. Please try again.'
  }
}