export type PublicPerxonaConfig = {
  presenterUrl: string;
  target: { avatarId: string; sceneId: string; voiceId?: string } | null;
  configured: boolean;
  connectKey?: string;
  motionId?: string;
};

export const browserPerxonaConfig: PublicPerxonaConfig = {
  presenterUrl: process.env.NEXT_PUBLIC_PERXONA_PRESENTER_URL || "https://cdn.perxona.ai/prod/latest/widget/entry/presenter.js",
  target: process.env.NEXT_PUBLIC_PERXONA_AVATAR_ID && process.env.NEXT_PUBLIC_PERXONA_SCENE_ID
    ? {
        avatarId: process.env.NEXT_PUBLIC_PERXONA_AVATAR_ID,
        sceneId: process.env.NEXT_PUBLIC_PERXONA_SCENE_ID,
        ...(process.env.NEXT_PUBLIC_PERXONA_VOICE_ID ? { voiceId: process.env.NEXT_PUBLIC_PERXONA_VOICE_ID } : {}),
      }
    : null,
  configured: Boolean(process.env.NEXT_PUBLIC_PERXONA_CONNECT_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_PERXONA_AVATAR_ID && process.env.NEXT_PUBLIC_PERXONA_SCENE_ID),
  connectKey: process.env.NEXT_PUBLIC_PERXONA_CONNECT_PUBLISHABLE_KEY,
  motionId: process.env.NEXT_PUBLIC_PERXONA_MOTION_ID,
};
