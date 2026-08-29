# HINTS.md — Notes for Future Coding Agents

Keep this file short and update it when the implementation changes.

## Read first

1. `AGENTS.md`
2. `STRUCTURE.md`
3. this file
4. `README.md`

## Perxona

Current official reference:
- https://github.com/XRSPACE-Inc/perxona-connect-kit
- https://docs.perxona.ai/

At the time this template specification was created, Connect Kit's official sample uses the `<sv-presenter>` Web Component and separate secret/publishable Connect keys.

Important browser behavior:
- audio playback generally requires a direct user gesture before speech can start
- initialize the Presenter and wait for Ready before `present()`
- do not guess motion IDs; query/use motions actually available for the selected avatar
- a `CONNECT_KEY_REJECTED` error means the publishable key is revoked/expired, its allowed domain does not match the page origin, or a required scope is missing; reissue it with `asset`, `voice`, `tts_token`, and `presentation` as needed
- keep the Presenter CDN region aligned with `PERXONA_API_BASE_URL`; the server derives `/asia` or `/eu` automatically unless `PERXONA_PRESENTER_URL` overrides it

The SDK is in preview. Verify current contracts before making large Perxona changes.

## LLM

The app is designed around an OpenAI-compatible provider.

OpenRouter example:

```env
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=...
LLM_MODEL=...
```

Do not scatter vendor-specific calls across application code.

## RAG

The vector store is intentionally in memory.

A restart means all ingested knowledge disappears.

Do not "fix" this by adding Postgres or a hosted vector database unless the actual project requires persistence.

## Hackathon modifications

Good places to change:
- system prompt / conversation config
- project-specific components
- `src/features/<project>/`
- tool registry

Avoid rewriting:
- provider boundary
- RAG internals
- Perxona secret/publishable trust boundary

## Deployment

Expected runtime:
- Node 22+
- pnpm
- Linux
- systemd
- service user `deploy`
- app path `/srv/perxona-template`

Runtime secrets should live outside Git.

For Next development through Tailscale, set `CORS_ALLOWED_ORIGINS` to the full HTTPS origin. `next.config.ts` converts it to the hostname form required by Next 16's `allowedDevOrigins`.
