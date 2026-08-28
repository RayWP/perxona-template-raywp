# AGENTS.md — Perxona Hackathon Reusable Template Builder

## Mission

Build a **generic, reusable, production-minded hackathon starter** for projects that MUST use **Perxona Connect Kit**, while keeping the project independent of any specific hackathon idea.

This repository is a **template**, not a product.

The finished template must let a future developer clone it, configure environment variables, run it locally, and immediately have:

1. A working Next.js + TypeScript frontend.
2. A working Perxona Connect Kit avatar interaction.
3. A generic `/api/chat` path backed by an OpenAI-compatible LLM provider.
4. First-class OpenRouter BYOK support.
5. A minimal in-memory RAG pipeline.
6. Clean boundaries between UI, application logic, LLM logic, RAG, and Perxona integration.
7. GitHub Actions deployment to a self-hosted Linux server over SSH.
8. A systemd service suitable for running the app as a dedicated `deploy` user.
9. Documentation that explains the architecture to future Codex sessions.

Do NOT implement a hackathon idea, domain workflow, scoring system, medical logic, manufacturing logic, travel logic, or any other product-specific behavior.

---

# 1. Operating Principles

Prioritize, in order:

1. **Working vertical slice**
2. **Clean, obvious code**
3. **Fast modification during a hackathon**
4. **Security of secrets**
5. **Small number of dependencies**
6. **Extensibility only where a near-term hackathon use is obvious**

Do not create abstractions merely because they might be useful someday.

Do not over-engineer.

The main branch must remain runnable throughout implementation.

When a subsystem works, avoid unnecessary rewrites.

---

# 2. Required Stack

Use:

- Node.js 22+
- Next.js current stable
- React
- TypeScript with strict mode
- Tailwind CSS
- pnpm
- Zod for runtime validation
- Vitest for focused unit tests
- ESLint
- Prettier if it can be added without fighting the framework defaults

No Docker.

No database.

No Redis.

No external vector database.

No Python.

No separate backend server.

Use Next.js server-side code and Route Handlers for backend functionality.

---

# 3. Required Architecture

Keep approximately this structure:

```text
.
├── AGENTS.md
├── README.md
├── STRUCTURE.md
├── HINTS.md
├── DEPLOYMENT.md
├── .env.example
├── .nvmrc
├── package.json
├── pnpm-lock.yaml
├── next.config.*
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── rag/
│   │   │   │   ├── ingest/route.ts
│   │   │   │   └── clear/route.ts
│   │   │   └── perxona/
│   │   │       ├── config/route.ts
│   │   │       ├── connect-key/route.ts
│   │   │       ├── avatars/route.ts
│   │   │       ├── scenes/route.ts
│   │   │       └── voices/route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── avatar/
│   │   │   ├── PerxonaPresenter.tsx
│   │   │   └── AvatarPanel.tsx
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx
│   │   │   └── MessageList.tsx
│   │   └── rag/
│   │       └── KnowledgePanel.tsx
│   ├── features/
│   │   └── conversation/
│   │       ├── conversation.service.ts
│   │       └── conversation.types.ts
│   ├── lib/
│   │   ├── config/
│   │   │   ├── env.server.ts
│   │   │   └── env.client.ts
│   │   ├── llm/
│   │   │   ├── llm.types.ts
│   │   │   ├── llm-provider.ts
│   │   │   ├── openai-compatible.provider.ts
│   │   │   └── index.ts
│   │   ├── rag/
│   │   │   ├── chunker.ts
│   │   │   ├── embeddings.ts
│   │   │   ├── memory-store.ts
│   │   │   ├── retriever.ts
│   │   │   ├── rag.service.ts
│   │   │   └── rag.types.ts
│   │   ├── perxona/
│   │   │   ├── perxona.server.ts
│   │   │   ├── perxona.types.ts
│   │   │   └── presenter.types.ts
│   │   ├── tools/
│   │   │   ├── tool.types.ts
│   │   │   └── registry.ts
│   │   └── http/
│   │       └── errors.ts
│   └── types/
│       └── custom-elements.d.ts
├── tests/
│   ├── rag/
│   ├── llm/
│   └── api/
├── deploy/
│   └── perxona-template.service
└── .github/
    └── workflows/
        └── deploy.yml
```

This is a guideline, not a requirement to create empty folders.

Never create placeholder abstractions with no implementation.

---

# 4. Perxona Connect Kit Is Mandatory

This template MUST contain a genuinely working generic Perxona Connect Kit interaction.

Use the **current official Perxona Connect Kit / Presenter SDK approach**, not an invented wrapper and not an obsolete integration if official docs show a newer flow.

Official reference sources to consult while implementing:

- https://github.com/XRSPACE-Inc/perxona-connect-kit
- https://docs.perxona.ai/

At the time this instruction was written, the official Connect Kit sample uses:

- the `<sv-presenter>` Web Component
- a server-side **secret Connect key**
- a browser-safe **publishable Connect key**
- `presenter.initializeWithConnectKey(connectKey, target)`
- `presenter.resumeAudioPlayback()`
- `presenter.present(content)`
- `presenter.presentWithAudio(audio, content)` when appropriate
- `presenter.playMotion(motionId)`
- `presenter.interruptPresentation()`
- Presenter status events such as `PRESENTER_STATUS`

Before coding against Perxona, verify these contracts against the official repository/docs because the SDK is in preview and may change.

## Perxona security boundary

The following MUST remain server-only:

```env
PERXONA_CONNECT_SECRET_KEY
```

The browser may receive only:

```env
PERXONA_CONNECT_PUBLISHABLE_KEY
```

or a value derived according to the current official SDK contract.

Never bundle the secret key into client JavaScript.

Do not prefix the secret with `NEXT_PUBLIC_`.

The template should provide server routes that proxy any Connect API operations requiring the secret key.

## Expected environment variables

Support at least:

```env
PERXONA_API_BASE_URL=https://console.perxona.ai/asia
PERXONA_CONNECT_SECRET_KEY=
PERXONA_CONNECT_PUBLISHABLE_KEY=

PERXONA_AVATAR_ID=
PERXONA_SCENE_ID=
PERXONA_VOICE_ID=

# Optional override if Perxona requires a region-specific presenter URL.
PERXONA_PRESENTER_URL=
```

Do not hardcode IDs.

If avatar/scene/voice IDs are missing, the template may offer a small development picker by querying the Perxona catalogs server-side.

Prefer fixed configured IDs for the simple default demo once values are supplied.

## Required generic working interaction

The default home page must demonstrate this complete flow:

```text
User types message
    ↓
POST /api/chat
    ↓
RAG retrieval (if knowledge exists)
    ↓
OpenAI-compatible/OpenRouter LLM
    ↓
assistant text returned
    ↓
<sv-presenter>.present(assistant text)
    ↓
Perxona avatar speaks the answer
```

The UI should also include one safe way to test a known available avatar motion.

Do not assume an arbitrary motion ID exists.

If practical, fetch the avatar's motion catalog and allow the developer to choose one.

If no motion is available, the chat flow must still work.

The avatar integration must gracefully show:

- not configured
- initializing
- ready
- speaking
- error

Do not let a Perxona failure crash the rest of the app.

---

# 5. LLM Provider Requirements

Use one concrete provider implementation named around the protocol, not the vendor:

```ts
interface LLMProvider {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
```

Streaming is optional for the initial template.

The first implementation MUST support **OpenAI-compatible Chat Completions** and therefore work with:

- OpenRouter
- OpenAI
- another OpenAI-compatible provider with a configurable base URL

Configuration:

```env
LLM_API_KEY=
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=
LLM_SITE_URL=
LLM_APP_NAME=Perxona Hackathon Template
```

`LLM_SITE_URL` and `LLM_APP_NAME` may be used for OpenRouter attribution headers when configured.

Do not hardcode OpenRouter-only behavior in application logic.

Application code talks only to `LLMProvider`.

## Validation

Validate all LLM environment variables with Zod on the server.

The template must fail with a helpful configuration error instead of a mysterious `401`.

Never log API keys.

Never return raw provider secrets to clients.

Runtime-only secret validation must not make `pnpm build` fail in CI merely because
production credentials are absent there. Validate provider-specific runtime secrets
when the relevant server service/route is initialized or invoked, while still failing
fast with an actionable error at runtime.

---

# 6. RAG Requirements

RAG is intentionally minimal and in-memory.

The goal is **hackathon usefulness**, not production durability.

## Required pipeline

```text
text/document input
    ↓
text extraction if supported
    ↓
chunking
    ↓
embedding
    ↓
in-memory vector storage
    ↓
cosine-similarity retrieval
    ↓
top-k context supplied to the LLM
```

## In-memory behavior

The store may be a process-level singleton.

It MUST be documented clearly that:

- data disappears on restart
- data is not shared across multiple server processes
- it is suitable only for demos/hackathons

Provide a `clear` operation.

Avoid hidden global mutation scattered through the code; encapsulate store ownership.

## Document support

Keep ingestion deliberately small.

Minimum:

- plain text pasted into the UI
- `.txt`
- `.md`

PDF support is OPTIONAL.

Do not add a heavyweight document-processing framework merely for PDFs.

## Embeddings

Embedding configuration MUST be independent from chat configuration:

```env
EMBEDDING_API_KEY=
EMBEDDING_BASE_URL=
EMBEDDING_MODEL=
```

If embedding variables are omitted, allow a sensible fallback to the LLM credentials only when the configured endpoint actually supports embeddings.

Do not pretend OpenRouter or another provider supports a model/endpoint that has not been verified.

Use an OpenAI-compatible embeddings request where supported.

Return clear configuration errors when embeddings are unavailable.

## RAG contract

Retrieval should return metadata internally:

```ts
type RetrievedChunk = {
  id: string;
  documentId: string;
  documentName: string;
  text: string;
  score: number;
};
```

The chat API may return sources:

```json
{
  "answer": "...",
  "sources": [
    {
      "documentName": "example.md",
      "score": 0.84
    }
  ]
}
```

Do not expose entire private documents unnecessarily.

## Chunking

Implement a boring deterministic chunker.

Do not introduce LangChain unless there is a compelling implementation reason.

Avoid framework lock-in.

---

# 7. Conversation Orchestration

Business logic does not belong in React components.

The conversation service should perform roughly:

```text
validate input
→ retrieve relevant RAG chunks
→ construct messages
→ call LLM provider
→ normalize answer + sources
→ return response
```

Keep the default system prompt intentionally generic.

Example intent:

"You are a concise, helpful assistant. Use supplied knowledge when relevant. If the supplied knowledge does not answer the question, say that rather than inventing facts."

Do NOT insert domain-specific personality.

Future hackathon projects should be able to replace the system prompt in one obvious place.

---

# 8. Tool / Function Calling Preparation

Provide a small tool registry contract that future Codex sessions can extend.

For example:

```ts
export interface AgentTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: ZodType<TInput>;
  execute(input: TInput): Promise<TOutput>;
}
```

Do not implement a complicated autonomous agent loop.

One or two sample no-op/demo tools are unnecessary.

The registry and types are enough if they are used or clearly ready for use.

Prefer deletion over dead sample code.

---

# 9. API Contracts

At minimum:

## `GET /api/health`

Returns:

```json
{
  "ok": true,
  "services": {
    "llmConfigured": true,
    "embeddingsConfigured": true,
    "perxonaConfigured": true
  }
}
```

Never include secrets.

## `POST /api/chat`

Input:

```json
{
  "message": "Hello",
  "history": []
}
```

Output:

```json
{
  "answer": "Hello!",
  "sources": []
}
```

Validate request bodies.

Set sane maximum lengths.

Do not accept unlimited history.

## RAG ingestion

Provide a simple route that accepts small hackathon-sized inputs.

Enforce a reasonable payload limit.

Never add arbitrary server-side URL fetching in the starter.

---

# 10. Frontend Requirements

The initial UI is a developer-friendly demo, not a polished product.

Desktop-first is acceptable, but it should remain usable on a laptop-sized browser.

Suggested layout:

```text
┌─────────────────────────────────────────────────────┐
│ Template status / health                            │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│ Perxona Avatar           │ Chat                     │
│                          │                          │
│ status: Ready            │ messages                 │
│ optional motion picker   │ input                    │
│                          │                          │
├──────────────────────────┴──────────────────────────┤
│ In-memory knowledge panel                           │
└─────────────────────────────────────────────────────┘
```

The template must make it obvious whether a failure is:

- Perxona configuration
- LLM configuration
- embedding configuration
- RAG empty
- API/network error

Avoid giant toast libraries if inline status text is enough.

---

# 11. React / TypeScript Rules

Do not:

- put server secrets in client components
- put business logic inside components
- create 800-line components
- scatter direct `fetch()` calls everywhere
- use `any` as an escape hatch
- create giant `utils.ts`
- duplicate request/response types
- suppress TypeScript errors without explanation
- rely on untyped DOM access to `<sv-presenter>`

Create or import the correct Presenter types where available.

If Perxona publishes `@perxona/presenter-types`, prefer the official types and add the minimal custom-element declaration needed for JSX.

Client components should be client components only when they need browser state/DOM interaction.

---

# 12. Error Handling

Errors exposed to users should be concise and actionable.

Server logs may contain:

- endpoint
- provider
- status code
- sanitized error message

They must never contain:

- API keys
- Authorization headers
- full secret environment dumps

Normalize expected external-provider failures.

Do not swallow exceptions silently.

---

# 13. Testing Philosophy

Do not chase coverage percentages.

Write focused tests around the places most likely to break during a hackathon:

1. chunker
2. cosine similarity / retrieval ordering
3. LLM request normalization
4. request validation for `/api/chat`
5. configuration validation

Perxona SDK interaction may use a thin mocked boundary for tests.

Do not attempt browser-level 3D rendering tests unless trivial.

Required commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All must pass before declaring the template complete.

---

# 14. Developer Experience

A new developer should be able to do:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The README must explain what is still required from:

- Perxona Console
- OpenRouter/OpenAI-compatible provider
- embedding provider

Add `.nvmrc` for Node 22.

Provide `.env.example` with blank secrets and explanatory comments.

Never commit `.env.local`.

---

# 15. Documentation for Future Codex Sessions

Create and maintain:

## `STRUCTURE.md`

Explain:

- architecture
- directory ownership
- request flow
- Perxona trust boundary
- LLM provider boundary
- RAG lifecycle
- how to add a hackathon feature without destroying the template

This file is intended to be read by future coding agents first.

## `HINTS.md`

Keep short operational notes:

- current Perxona SDK assumptions
- known browser autoplay requirement
- which config variables are required
- in-memory RAG limitations
- where to change the system prompt
- where to add tools
- deployment assumptions
- any SDK gotchas discovered during implementation

Do not use `HINTS.md` as a dumping ground.

## `README.md`

Human-facing quick start only.

---

# 16. GitHub Actions Deployment

No Docker.

Deployment target:

- Linux server
- app owned/run by user `deploy`
- systemd
- repository deployed under `/srv/perxona-template`
- app listens on `127.0.0.1:3000` by default
- nginx/Caddy is expected to proxy externally, but configuring the reverse proxy is outside the template's required implementation

The GitHub Actions workflow must:

1. run lint/typecheck/tests/build in CI
2. connect to the server over SSH only after checks succeed
3. deploy from the selected branch
4. install dependencies with `pnpm install --frozen-lockfile`
5. build on the server OR upload a build artifact — choose the simpler robust approach
6. restart `perxona-template.service`
7. verify `/api/health`
8. fail visibly when the health check fails

Never put secrets directly in the workflow file.

Use GitHub repository/environment secrets:

```text
DEPLOY_HOST
DEPLOY_PORT
DEPLOY_USER
DEPLOY_SSH_KEY
DEPLOY_PATH
APP_BASE_URL
```

Assume:

```text
DEPLOY_USER=deploy
DEPLOY_PATH=/srv/perxona-template
```

Application runtime secrets such as LLM and Perxona keys should live on the server in a protected env file, NOT in the Git repository and preferably NOT copied on every deploy.

Recommended:

```text
/etc/perxona-template/perxona-template.env
```

owned by root, readable by the service as appropriate.

If a safer systemd `EnvironmentFile` arrangement requires group permissions, document the exact commands.

---

# 17. systemd Service

Create:

```text
deploy/perxona-template.service
```

Requirements:

- User=deploy
- Group=deploy
- WorkingDirectory=/srv/perxona-template
- EnvironmentFile=/etc/perxona-template/perxona-template.env
- production mode
- `pnpm start`
- restart on failure
- sensible restart delay
- bind the app to localhost when practical
- no root execution

Prefer an explicit absolute pnpm path only if needed; otherwise use a predictable PATH declaration.

Document how to discover the actual `pnpm` path with:

```bash
command -v pnpm
```

and adjust the service if the server setup differs.

---

# 18. Security Rules

Absolute requirements:

- No Perxona secret key in client code.
- No LLM key in client code.
- No embedding key in client code.
- No secret values in logs.
- No environment dump endpoints.
- No arbitrary command execution endpoints.
- No arbitrary file-path reads.
- No SSRF helper that fetches arbitrary URLs.
- Validate uploads/input.
- Keep upload limits small.
- Keep dependency count reasonable.

The publishable Perxona key may be sent to the browser only because that is part of the official Connect Kit trust model.

---

# 19. Hackathon Optimization Rules

This template exists to make tomorrow fast.

Therefore:

- Prefer a working implementation over theoretical flexibility.
- Keep APIs easy to understand by opening one file.
- A future developer should be able to replace the system prompt in under a minute.
- A future developer should be able to add one API-backed tool in under 15 minutes.
- A future developer should be able to add project-specific UI without editing LLM or RAG internals.
- Do not create multi-tenant auth.
- Do not create user accounts.
- Do not create an admin dashboard.
- Do not create persistent chat storage.
- Do not build a CMS.
- Do not add queues.
- Do not add observability SaaS.
- Do not add a database "just in case."

If a feature is not required for the generic working demo, omit it.

---

# 20. Completion Criteria

Do not claim completion until all of these are true:

- [ ] `pnpm install` succeeds on Node 22+
- [ ] `pnpm dev` starts the app
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] `.env.example` exists and contains no credentials
- [ ] `/api/health` works
- [ ] OpenAI-compatible/OpenRouter chat path works when configured
- [ ] text can be ingested into the in-memory RAG store
- [ ] retrieval is used by `/api/chat`
- [ ] sources can be returned by `/api/chat`
- [ ] Perxona Presenter initializes when configured
- [ ] user text can produce an LLM response
- [ ] the Perxona avatar speaks that response
- [ ] Perxona secret key never reaches browser code
- [ ] `STRUCTURE.md` describes the final actual architecture
- [ ] `HINTS.md` contains current implementation gotchas
- [ ] deployment workflow exists
- [ ] systemd service file exists
- [ ] `DEPLOYMENT.md` gives exact setup commands
- [ ] README gives a clean quick start

---

# 21. How to Work

Implement in small vertical slices:

1. initialize Next.js project and quality tooling
2. configuration validation
3. LLM provider + `/api/chat`
4. in-memory RAG
5. Perxona server-side catalog/config routes
6. Presenter SDK component
7. end-to-end chat → avatar speech
8. knowledge panel
9. tests
10. deployment files
11. documentation
12. final lint/typecheck/test/build

Do not ask for routine implementation approval.

If the official Perxona SDK differs from the assumptions in this file, use the **current official SDK** and record the difference in `HINTS.md`.

If a choice would introduce a paid dependency or meaningfully alter this architecture, choose the simpler free/local option unless impossible.

At the end, print:

1. what was implemented
2. commands executed
3. test/build status
4. configuration still required from the developer
5. exact files a future Codex session should read first

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
