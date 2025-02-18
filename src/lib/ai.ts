import type { ChatMessage } from '../types'

export async function chat(messageList: ChatMessage[], apiKey: string) {
  const result = await fetch('', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      message: messageList,
    }),
  })
  return await result.json()
}
