# cf_ai_city 🏙️

> **A walkable 3D cyberpunk city where each building teaches an AI concept via live Llama 3.3 conversations.**

Walk through six towering skyscrapers — LLM Tower, Neural Net Lab, Transformer Hub, Vision Center, RL Arena, and Diffusion District. Enter a building and a robot outside acts out the entire AI pipeline step-by-step while you chat with an AI guide powered by **Llama 3.3 70B on Cloudflare Workers AI**. Your conversation is remembered across visits using **Durable Objects**.

---

## 🎮 Live Demo

> [Deploy it yourself — see instructions below]

---

## 🧠 What's Inside Each Building

| Building | AI Concept | Pipeline Stages |
|---|---|---|
| 🏛 LLM Tower | Large Language Models | Tokenization → Embedding → Attention → Transformer Layers → Next Token Prediction |
| 🧠 Neural Net Lab | Deep Learning | Input Layer → Forward Pass → Activation (ReLU) → Loss → Backpropagation |
| 🔁 Transformer Hub | Attention Mechanism | Query → Key → Value → Attention Scores → Softmax → Multi-Head |
| 👁 Vision Center | Computer Vision | Edge Detection → Feature Maps → Max Pooling → Deep Features → Classification |
| 🎯 RL Arena | Reinforcement Learning | Agent Spawns → Random Action → Environment Reacts → Reward → Policy Update |
| 🌊 Diffusion District | Generative AI | Prompt Encoded → Pure Noise → Denoising Steps × 3 → Latent Decode |

---

## 🏗️ Architecture

```
cf_ai_city/
├── public/
│   └── index.html          # 3D city frontend (Three.js r128)
├── src/
│   ├── index.js            # Cloudflare Worker — routing + Workers AI
│   └── ChatSession.js      # Durable Object — persistent conversation memory
├── wrangler.toml           # Cloudflare config (AI binding + DO)
├── package.json
├── README.md
└── PROMPTS.md
```

### Stack

| Component | Technology |
|---|---|
| **3D City** | Three.js r128 (WebGL) |
| **LLM** | Llama 3.3 70B Instruct via Cloudflare Workers AI |
| **API / Routing** | Cloudflare Workers |
| **Memory / State** | Cloudflare Durable Objects (per-user, per-building history) |
| **Static Hosting** | Cloudflare Pages (serves `./public`) |
| **Fallback AI** | Anthropic Claude Haiku (direct browser API, no key needed locally) |

### Request Flow

```
User types question
        │
        ▼
POST /api/chat  (Worker)
        │
        ├─► Durable Object: load stored conversation history
        │         (keyed by sessionId + buildingId)
        │
        ├─► Workers AI: Llama 3.3 70B
        │         system prompt = building's AI topic
        │         messages = history + new question
        │
        ├─► Durable Object: save updated history (capped at 40 msgs)
        │
        └─► Response → Frontend → Robot animation + chat bubble
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- Wrangler CLI

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/cf_ai_city
cd cf_ai_city

# 2. Install Wrangler
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Run locally (Workers AI + Durable Objects work in local dev!)
npm run dev

# 5. Open http://localhost:8787
```

> **Tip:** Without the Worker running, the frontend automatically falls back to the Anthropic Claude Haiku API. Just open `public/index.html` directly in your browser — no server needed to demo the 3D city.

---

## ☁️ Deploying to Cloudflare

```bash
# Deploy the Worker + static assets in one command
npm run deploy
```

Cloudflare will output a URL like `https://cf-ai-city.YOUR_SUBDOMAIN.workers.dev`.

---

## 🎮 Controls

| Key | Action |
|---|---|
| `W A S D` | Move through the city |
| `Shift` | Sprint |
| `E` | Enter nearby building (open chat) |
| `Click` | Lock mouse pointer for free-look |
| `ESC` | Exit building / release mouse |

Walk close to a building → press **E** → watch the robot act out the AI pipeline → ask questions in the chat panel!

---

## 🔑 Key Technical Decisions

### No PointLights on Buildings
WebGL (Three.js r128) has a hard limit of ~4-8 PointLights before the vertex shader overflows with `too many uniforms`. We replaced all 6 building tip lights with pulsing `TorusGeometry` halo rings + animated `SphereGeometry` beacons — same visual effect, zero extra uniforms.

### MeshBasicMaterial Throughout
All geometry uses `MeshBasicMaterial` (unlit, no uniform cost) instead of `MeshLambertMaterial` / `MeshPhongMaterial`. This keeps the total uniform count well within WebGL limits while the scene stays visually rich via emissive colors and transparency.

### Durable Objects for Memory
Each user session gets a Durable Object instance keyed by `sessionId + buildingId`. This means:
- Returning visitors continue their conversation from where they left off
- Each building has independent memory (context stays on-topic)
- History is capped at 40 messages to prevent unbounded storage

### Dual API Strategy
1. **Primary**: Cloudflare Worker → Workers AI (Llama 3.3) with full memory
2. **Fallback**: Direct Anthropic API call from the browser (demo without deploying)
3. **Offline fallback**: Keyword-matching local answers (6 unique answers per building topic)

---

## 📄 License

MIT
