# STRUCTURE.md — Target Template Architecture

> This is a seed document for the Codex session that builds the template.
> Codex should update it so it describes the implementation that actually exists.

## Purpose

This repository should remain a **generic Perxona-enabled AI application starter**.

It deliberately does not know what the final hackathon idea is.

The intended flow is:

```text
Browser
├─ Project-specific UI added later
├─ Generic chat UI
└─ Perxona <sv-presenter>
          │
          ├── publishable Connect key
          │
          └── avatar rendering / speech / motions

Next.js server
├─ /api/chat
├─ Conversation service
├─ RAG service
│   └─ in-memory vectors
├─ OpenAI-compatible LLM provider
│   └─ OpenRouter supported by configuration
└─ Perxona server integration
    └─ secret Connect key
```

## Trust Boundaries

### Browser-safe

- Perxona publishable Connect key
- avatar / scene / voice identifiers
- normal chat request/response data

### Server-only

- `PERXONA_CONNECT_SECRET_KEY`
- `LLM_API_KEY`
- `EMBEDDING_API_KEY`

Never move these boundaries for convenience.

## How a future hackathon project should extend this

Prefer creating:

```text
src/features/<idea-name>/
```

for domain logic.

Keep:

```text
src/lib/llm/
src/lib/rag/
src/lib/perxona/
```

generic.

If a project needs a new external action, add it as a tool or service rather than putting API calls directly into React components.

If a project needs a different system prompt, change the designated conversation configuration rather than forking the provider layer.

## RAG lifecycle

The default RAG store is intentionally ephemeral.

```text
ingest
→ chunk
→ embed
→ keep vectors in memory
→ retrieve top-k
→ include context in LLM request
```

Restarting the process deletes the knowledge.

That is expected.

## Perxona lifecycle

The current official Connect Kit sample uses a Presenter Web Component.

Typical flow:

```text
user gesture
→ resumeAudioPlayback()
→ obtain publishable key
→ initializeWithConnectKey()
→ wait until Ready
→ present(text)
```

Motion playback can be triggered with `playMotion(motionId)` when a valid motion ID for the selected avatar is known.

The server uses the Perxona secret key for privileged Connect API calls and must never expose it to the browser.

## Deployment

Production target:

```text
GitHub
  ↓ GitHub Actions / SSH
/srv/perxona-template
  ↓
systemd: perxona-template.service
  ↓
Next.js on 127.0.0.1:3000
  ↓
reverse proxy (configured separately)
```

Runtime secrets live outside the repo in:

```text
/etc/perxona-template/perxona-template.env
```
