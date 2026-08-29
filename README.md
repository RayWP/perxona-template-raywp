# Perxona Hackathon Template

## Normal local run

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set the server-side Perxona, LLM, and optional embedding variables in `.env.local` for the complete chat → RAG → avatar flow.

When server-side Perxona credentials are configured, the avatar panel loads the avatar, scene, and voice catalogs. The IDs in `.env.local` remain the initial default selection, but you can choose another avatar at runtime. Its motion dropdown is then reloaded from that avatar's own motion catalog, so motions are not mixed between avatars. Click **Initialize / load avatar** after changing the selection.

## Tailscale development URL

To expose the local app through your Tailscale HTTPS hostname:

```bash
pnpm dev
tailscale serve localhost:3000
```

Set the exact origin in `.env.local` and restart Next after changing it:

```env
CORS_ALLOWED_ORIGINS=https://your-machine.your-tailnet.ts.net
```

The app allows localhost automatically in development. `CORS_ALLOWED_ORIGINS` is an exact-origin allowlist for `/api` requests; do not use `*`. If the frontend is opened directly at the Tailscale URL, its same-origin API requests do not require CORS, but the allowlist is useful when the frontend and API origins differ.

Also add `https://your-machine.your-tailnet.ts.net` to the publishable Perxona Connect key's allowed-domain list in Perxona Console. This is separate from the app's CORS setting and is required because the Presenter SDK makes browser calls to Perxona using the page's origin.

## Frontend-only avatar test

Yes. The avatar can be tested without the LLM, RAG, or Perxona proxy routes. The Next dev server still serves the frontend, while the Presenter SDK connects directly from the browser using the publishable Connect key. No secret Connect key is needed for this mode.

In `.env.local`, set only these browser-safe values:

```env
NEXT_PUBLIC_PERXONA_CONNECT_PUBLISHABLE_KEY=your_publishable_connect_key
NEXT_PUBLIC_PERXONA_AVATAR_ID=your_avatar_id
NEXT_PUBLIC_PERXONA_SCENE_ID=your_scene_id
NEXT_PUBLIC_PERXONA_VOICE_ID=your_voice_id
NEXT_PUBLIC_PERXONA_PRESENTER_URL=https://cdn.perxona.ai/prod/latest/widget/entry/presenter.js
```

Then run:

```bash
pnpm dev
```

Open `http://localhost:3000`, click **Initialize / unlock audio**, then click **Speak test**. The first button click is required by browser autoplay policy. The test utterance calls `presenter.present()` directly, so `/api/chat`, an LLM key, embeddings, and RAG data are not involved.

You may optionally set `NEXT_PUBLIC_PERXONA_MOTION_ID` after verifying that the motion belongs to the selected avatar; it enables the motion test button without catalog proxy routes.

Never set `PERXONA_CONNECT_SECRET_KEY` or any LLM/embedding key with a `NEXT_PUBLIC_` prefix. The publishable key is intentionally browser-visible; the secret key remains server-only.
