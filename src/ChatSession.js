/**
 * ChatSession — Durable Object
 *
 * Stores conversation history per (sessionId × buildingId).
 * This gives the city "memory": returning visitors pick up where they left off.
 *
 * Storage key: "history"
 * Value: JSON array of { role, content } message objects
 */
export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    // GET /history — return stored conversation
    if (request.method === 'GET' && url.pathname === '/history') {
      const history = await this.state.storage.get('history') || [];
      return new Response(JSON.stringify(history), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /history — overwrite stored conversation
    if (request.method === 'POST' && url.pathname === '/history') {
      const messages = await request.json();
      // Cap at 40 messages to prevent unbounded storage growth
      const trimmed = Array.isArray(messages) ? messages.slice(-40) : [];
      await this.state.storage.put('history', trimmed);
      return new Response(JSON.stringify({ ok: true, stored: trimmed.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DELETE /history — reset conversation (e.g. "forget me" feature)
    if (request.method === 'DELETE' && url.pathname === '/history') {
      await this.state.storage.delete('history');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
