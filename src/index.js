export { ChatSession } from './ChatSession.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return corsResponse('', 204);
    }

    if (url.pathname === '/api/health') {
      return corsResponse(JSON.stringify({ ok: true, ts: Date.now() }), 200);
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env, ctx);
    }

    return new Response('Not found', { status: 404 });
  }
};

async function handleChat(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400);
  }

  const { buildingId, systemPrompt, messages, sessionId } = body;

  if (!buildingId || !messages || !Array.isArray(messages)) {
    return corsResponse(JSON.stringify({ error: 'Missing fields' }), 400);
  }

  const sessionKey = `${sessionId || 'anon'}_${buildingId}`;
  const doId = env.CHAT_SESSION.idFromName(sessionKey);
  const doStub = env.CHAT_SESSION.get(doId);

  let storedHistory = [];
  try {
    const histResp = await doStub.fetch(new Request('https://do/history', { method: 'GET' }));
    storedHistory = await histResp.json();
  } catch { /* first visit */ }

  const memoryMessages = storedHistory.slice(-20);
  const freshMessages = messages.slice(memoryMessages.length);
  const allMessages = [...memoryMessages, ...freshMessages].filter(m => m && m.role && m.content);

  let aiResponse;
  try {
    const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      system: systemPrompt || 'You are a helpful AI guide in an interactive 3D city. Be concise and vivid. Under 130 words.',
      messages: allMessages,
      max_tokens: 256,
      temperature: 0.75,
    });
    aiResponse = result.response;
  } catch (err) {
    console.error('Workers AI error:', err);
    return corsResponse(JSON.stringify({ error: 'AI unavailable', details: err.message }), 502);
  }

  const updatedHistory = [...allMessages, { role: 'assistant', content: aiResponse }];
  ctx.waitUntil(
    doStub.fetch(new Request('https://do/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedHistory)
    }))
  );

  return corsResponse(JSON.stringify({ response: aiResponse }), 200);
}

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
