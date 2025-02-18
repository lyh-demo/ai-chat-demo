import type { ChatMessage } from '../types'

export async function chat(messageList: ChatMessage[], apiKey: string) {
  const result = await fetch('https://api.302.ai/v1/chat/completions', {
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
  if (!result.ok) {
    console.error('获取数据失败')
    return null
  }
  const data = await result.json() as any
  return data.choices[0].message.content as string
}
