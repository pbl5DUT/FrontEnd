export async function sendMessageToGemini(messages: { role: string; content: string }[]) {
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .slice(-1)[0];

  const response = await fetch('http://127.0.0.1:8000/api/chat-ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: lastUserMessage.content }),
  });

  if (!response.ok) {
    throw new Error('API Error');
  }

  const data = await response.json();
  return { reply: data.query_result };
}
