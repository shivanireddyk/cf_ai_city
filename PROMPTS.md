# PROMPTS.md

This file documents AI prompts used during development of cf_ai_city, as required by the assignment guidelines.

---

## Prompt 1

**Context:** Planning the Durable Objects memory architecture before writing any code.

**Prompt:**
> I'm building a Cloudflare Worker that handles chat sessions. Each user can be in one of several "buildings" and I want their conversation history to persist across page refreshes. I'm thinking Durable Objects keyed by sessionId + buildingId. Is that the right approach, or is there a better pattern? What are the tradeoffs vs KV?

**How it was used:** Confirmed the DO-per-session pattern and helped me understand why KV would cause race conditions under concurrent writes. I implemented the actual `ChatSession.js` logic myself based on the Cloudflare docs.

---

## Prompt 2

**Context:** Debugging a WebGL crash after adding the sixth building.

**Prompt:**
> My Three.js scene crashes with "too many uniforms" after I added a 6th PointLight to my scene (one per building rooftop). I'm using r128. Is this a known WebGL limit? What's the standard workaround — I don't want to switch to a deferred renderer just for ambient glow effects.

**How it was used:** Identified the per-object uniform limit in WebGL1. I ended up replacing PointLights with animated `TorusGeometry` halo rings using `MeshBasicMaterial`, which was my own design decision — the AI just confirmed the root cause.

---

## Prompt 3

**Context:** Workers AI was returning a 400 on the first message in a new session.

**Prompt:**
> Getting a 400 from the Cloudflare Workers AI `/run` endpoint. It only happens on the first message in a new session — subsequent messages in the same session work fine. My messages array looks like this on first call: `[{ role: "user", content: "..." }]`. Is there a minimum message structure Workers AI expects, or a known issue with cold DO instances?

**How it was used:** Narrowed it down to the system prompt being passed as an empty string on session init. I fixed the conditional in `index.js` to only include the system prompt field when it had content.

---

## Prompt 4

**Context:** Designing the quiz system after the core city was already working.

**Prompt:**
> I have a working 3D city with 9 buildings and live AI chat per building. I want to add a quiz feature — one quiz per building, shown after the user finishes chatting. What's a clean way to structure this in vanilla JS without adding a framework? I want quiz state to be local to the session, not persisted server-side.

**How it was used:** Got a structural outline. I wrote all the quiz questions and the actual DOM/state logic myself, using the outline as a reference for how to gate the quiz behind chat completion.

---

## Prompt 5

**Context:** The PDF export wasn't capturing the building name or quiz score correctly.

**Prompt:**
> I'm using the browser's `window.print()` with a print stylesheet to export a notes PDF. The exported PDF is missing dynamic content — specifically a `<span>` updated via `innerText` and a progress bar set via inline style. Is this a known timing issue with print() and DOM updates, or is there something about how browsers snapshot the DOM for print?

**How it was used:** Confirmed it was a render timing issue. Wrapping the `window.print()` call in a `requestAnimationFrame` inside a `setTimeout` resolved it. One-line fix I applied directly.

---

## Prompt 6

**Context:** Reviewing the fallback strategy before submission.

**Prompt:**
> My app has three API tiers: Cloudflare Workers AI (primary), a direct Anthropic browser call (secondary), and a local keyword-match (offline). The secondary tier requires an API key in the browser which is obviously insecure. What's the standard way to document this kind of dev-only fallback so reviewers understand it's intentional and not a security oversight?

**How it was used:** Informed the wording in README under "API Fallback Strategy" and the inline comment in `index.html` explaining the secondary fallback is for local demo purposes only.

---

## Prompt 7

**Context:** Performance pass before deploying the final version.

**Prompt:**
> My Three.js scene has 9 buildings, each with ~8 meshes, plus a ground plane, skybox, street lights, and a player capsule. On mobile the framerate tanks below 30fps. I'm not doing any frustum culling manually — does Three.js handle that automatically in r128, or do I need to set it up? Also is there a fast way to profile draw calls in WebGL without installing anything?

**How it was used:** Confirmed Three.js handles frustum culling automatically but that it only works if object bounding spheres are set correctly. I added `geometry.computeBoundingSphere()` calls on the larger meshes and that resolved the mobile performance issue.
