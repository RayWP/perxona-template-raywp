export type PublicPerxonaConfig = {
  presenterUrl: string;
  target: { avatarId: string; sceneId: string; voiceId?: string } | null;
  configured: boolean;
};
