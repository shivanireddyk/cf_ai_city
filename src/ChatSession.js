export class ChatSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/history') {
      const history = await this.state.storage.get('history') || [];
      return new Response(JSON.stringify(history), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'POST' && url.pathname === '/history') {
      const messages = await request.json();
      const trimmed = Array.isArray(messages) ? messages.slice(-40) : [];
      await this.state.storage.put('history', trimmed);
      return new Response(JSON.stringify({ ok: true, stored: trimmed.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (request.method === 'DELETE' && url.pathname === '/history') {
      await this.state.storage.delete('history');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
}
