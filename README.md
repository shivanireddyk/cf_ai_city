# cf_ai_city

A walkable 3D cyberpunk city where each building teaches a core AI/ML concept through live conversations, interactive quizzes, and progress tracking — powered by Llama 3.3 on Cloudflare Workers AI.

Walk through nine skyscrapers, each dedicated to a different AI topic. Enter a building to trigger a step-by-step robot pipeline demonstration, chat with a live AI guide, test your knowledge with a quiz, and export your notes as a PDF.

**Live Demo:** [https://cf-ai-city.shivanireddybbh.workers.dev](https://cf-ai-city.shivanireddybbh.workers.dev)

---

## Buildings and AI Concepts

| Building | AI Concept | Pipeline Stages |
|---|---|---|
| LLM Tower | Large Language Models | Tokenization → Embedding → Attention → Transformer Layers → Next Token Prediction |
| Neural Net Lab | Deep Learning | Input Layer → Forward Pass → Activation (ReLU) → Loss → Backpropagation |
| Transformer Hub | Attention Mechanism | Query → Key → Value → Attention Scores → Softmax → Multi-Head |
| Vision Center | Computer Vision | Edge Detection → Feature Maps → Max Pooling → Deep Features → Classification |
| RL Arena | Reinforcement Learning | Agent Spawns → Random Action → Environment Reacts → Reward → Policy Update |
| Diffusion District | Generative AI | Prompt Encoded → Pure Noise → Denoising Steps x3 → Latent Decode |
| RAG Tower | Retrieval-Augmented Generation | Query → Vector Search → Context Retrieval → Augmented Prompt → LLM Response |
| Finetune Studio | Model Fine-Tuning | Base Model → Dataset Prep → LoRA Adapters → Training Loop → Evaluation |
| Embedding Lab | Vector Embeddings | Text Input → Tokenization → Encoder → Dense Vector → Similarity Search |

---

## Features

- **Live AI Chat** — Each building has a context-aware AI guide powered by Llama 3.3 70B, with conversation history persisted via Cloudflare Durable Objects
- **Robot Pipeline Visualizer** — An animated robot acts out each AI concept's pipeline stages when you enter a building
- **Knowledge Quizzes** — Per-building quizzes to test understanding; results contribute to a developer progress score
- **Progress Tracking** — Completion percentage tracked across all nine buildings
- **PDF Export** — Export your session notes and quiz results as a PDF

---

## Architecture

```
cf_ai_city/
├── public/
│   └── index.html          # 3D city frontend (Three.js r128)
├── src/
│   ├── index.js            # Cloudflare Worker — routing + Workers AI
│   └── ChatSession.js      # Durable Object — persistent conversation memory
├── wrangler.toml           # Cloudflare config (AI binding + Durable Objects)
├── package.json
├── README.md
└── PROMPTS.md
```

### Technology Stack

| Component | Technology |
|---|---|
| 3D Rendering | Three.js r128 (WebGL) |
| LLM | Llama 3.3 70B Instruct via Cloudflare Workers AI |
| API and Routing | Cloudflare Workers |
| Memory and State | Cloudflare Durable Objects (per-user, per-building history) |
| Static Hosting | Cloudflare Pages (serves `./public`) |
| Fallback AI | Anthropic Claude Haiku (direct browser API, no key required locally) |

### Request Flow

```
User submits a question
        |
        v
POST /api/chat  (Worker)
        |
        |-- Durable Object: load stored conversation history
        |       (keyed by sessionId + buildingId)
        |
        |-- Workers AI: Llama 3.3 70B
        |       system prompt = building's AI topic
        |       messages = history + new question
        |
        |-- Durable Object: save updated history (capped at 40 messages)
        |
        --> Response → Frontend → Robot animation + chat bubble
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
- Wrangler CLI

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/shivanireddyk/cf_ai_city
cd cf_ai_city

# 2. Install dependencies
npm install

# 3. Authenticate with Cloudflare
npx wrangler login

# 4. Start the local development server
# (Workers AI and Durable Objects are fully supported in local dev)
npm run dev

# 5. Open http://localhost:8787
```

**Note:** Without the Worker running, the frontend automatically falls back to the Anthropic Claude Haiku API. You can open `public/index.html` directly in a browser to demo the 3D city without any server.

---

## Deploying to Cloudflare

```bash
npm run deploy
```

Cloudflare will output a URL in the format `https://cf-ai-city.YOUR_SUBDOMAIN.workers.dev`.

---

## Controls

| Key | Action |
|---|---|
| `W A S D` | Move through the city |
| `Shift` | Sprint |
| `E` | Enter a nearby building and open the chat panel |
| `Click` | Lock mouse pointer for free-look |
| `ESC` | Exit building or release mouse pointer |

Walk close to a building, press **E**, watch the robot demonstrate the AI pipeline, then ask questions in the chat panel.

---

## Key Technical Decisions

### WebGL Uniform Budget

Three.js r128 enforces a hard limit of approximately 4–8 PointLights before the vertex shader exceeds the `too many uniforms` threshold. All building-tip lights were replaced with pulsing `TorusGeometry` halo rings and animated `SphereGeometry` beacons, preserving the visual effect without consuming additional uniforms.

### MeshBasicMaterial

All geometry uses `MeshBasicMaterial` (unlit, no uniform cost) rather than `MeshLambertMaterial` or `MeshPhongMaterial`. This keeps the total uniform count within WebGL limits while maintaining visual richness through emissive colors and transparency.

### Durable Objects for Conversation Memory

Each user session is assigned a Durable Object instance keyed by `sessionId + buildingId`, which provides:

- Continuity for returning visitors — conversations resume where they left off
- Independent memory per building — context remains on-topic
- Bounded storage — history is capped at 40 messages per session

### API Fallback Strategy

1. **Primary:** Cloudflare Worker → Workers AI (Llama 3.3) with full persistent memory
2. **Secondary:** Direct Anthropic API call from the browser (allows demo without deployment)
3. **Offline:** Keyword-matching local responses (unique answers per building topic)

---

## License

MIT
