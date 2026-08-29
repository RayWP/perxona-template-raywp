"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { browserPerxonaConfig } from "@/lib/config/env.client";
import type { PresentationTarget } from "@/lib/perxona/presenter.types";
import { PerxonaPresenter, type PerxonaPresenterHandle, type PresenterStatus } from "./PerxonaPresenter";

type CatalogItem = { id: string; name?: string };
type CatalogResponse = { items?: CatalogItem[]; error?: string };
const labels: Record<PresenterStatus, string> = { "not-configured": "Not configured", initializing: "Initializing", ready: "Ready", speaking: "Speaking", error: "Error" };

async function loadCatalog(path: string): Promise<CatalogItem[]> {
  const response = await fetch(path);
  const body = await response.json() as CatalogResponse;
  if (!response.ok) throw new Error(body.error || `Could not load ${path}.`);
  return body.items || [];
}

export function AvatarPanel({ onPresenterReady }: { onPresenterReady: (presenter: PerxonaPresenterHandle | null) => void }) {
  const presenterRef = useRef<PerxonaPresenterHandle>(null);
  const [presenterUrl, setPresenterUrl] = useState("");
  const [avatars, setAvatars] = useState<CatalogItem[]>([]);
  const [scenes, setScenes] = useState<CatalogItem[]>([]);
  const [voices, setVoices] = useState<CatalogItem[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [motionCatalog, setMotionCatalog] = useState<{ avatarId: string; items: CatalogItem[] }>({ avatarId: "", items: [] });
  const [motionId, setMotionId] = useState("");
  const [testText, setTestText] = useState("Hello from the Perxona avatar test.");
  const [status, setStatus] = useState<PresenterStatus>("not-configured");
  const [message, setMessage] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(false);

  const statusChanged = useCallback((next: PresenterStatus, detail?: string) => { setStatus(next); setMessage(detail || ""); }, []);
  const target: PresentationTarget | null = selectedAvatarId && selectedSceneId
    ? { avatarId: selectedAvatarId, sceneId: selectedSceneId, ...(selectedVoiceId ? { voiceId: selectedVoiceId } : {}) }
    : null;
  const targetKey = target ? `${target.avatarId}:${target.sceneId}:${target.voiceId || ""}` : "empty";
  const motions = motionCatalog.avatarId === selectedAvatarId ? motionCatalog.items : [];

  useEffect(() => {
    let active = true;
    async function loadConfiguration() {
      setCatalogLoading(true);
      try {
        const response = await fetch("/api/perxona/config");
        const config = await response.json() as { presenterUrl: string; target: PresentationTarget | null; configured: boolean };
        if (!active) return;
        if (config.configured) {
          const [avatarItems, sceneItems, voiceItems] = await Promise.all([
            loadCatalog("/api/perxona/avatars"),
            loadCatalog("/api/perxona/scenes"),
            loadCatalog("/api/perxona/voices"),
          ]);
          if (!active) return;
          setPresenterUrl(config.presenterUrl);
          setAvatars(avatarItems);
          setScenes(sceneItems);
          setVoices(voiceItems);
          setSelectedAvatarId(config.target?.avatarId || avatarItems[0]?.id || "");
          setSelectedSceneId(config.target?.sceneId || sceneItems[0]?.id || "");
          setSelectedVoiceId(config.target?.voiceId || voiceItems[0]?.id || "");
          setMessage("Choose an avatar to load its matching motion catalog.");
        } else if (browserPerxonaConfig.configured && browserPerxonaConfig.target) {
          setPresenterUrl(browserPerxonaConfig.presenterUrl);
          setSelectedAvatarId(browserPerxonaConfig.target.avatarId);
          setSelectedSceneId(browserPerxonaConfig.target.sceneId);
          setSelectedVoiceId(browserPerxonaConfig.target.voiceId || "");
          setMessage("Browser-only avatar mode: chat, LLM, and RAG are not required.");
        } else {
          setPresenterUrl(config.presenterUrl);
          setMessage("Set Perxona keys to enable the avatar.");
        }
      } catch (error) {
        if (!active) return;
        if (browserPerxonaConfig.configured && browserPerxonaConfig.target) {
          setPresenterUrl(browserPerxonaConfig.presenterUrl);
          setSelectedAvatarId(browserPerxonaConfig.target.avatarId);
          setSelectedSceneId(browserPerxonaConfig.target.sceneId);
          setSelectedVoiceId(browserPerxonaConfig.target.voiceId || "");
          setMessage("Browser-only avatar mode: Perxona proxy unavailable.");
        } else statusChanged("error", error instanceof Error ? error.message : "Could not load Perxona configuration.");
      } finally {
        if (active) setCatalogLoading(false);
      }
    }
    void loadConfiguration();
    return () => { active = false; };
  }, [statusChanged]);

  useEffect(() => {
    let active = true;
    if (!selectedAvatarId) return () => { active = false; };
    const browserMotion = browserPerxonaConfig.target?.avatarId === selectedAvatarId && browserPerxonaConfig.motionId
      ? [{ id: browserPerxonaConfig.motionId }]
      : [];
    void loadCatalog(`/api/perxona/avatars/${encodeURIComponent(selectedAvatarId)}/motions`)
      .then((items) => { if (active) setMotionCatalog({ avatarId: selectedAvatarId, items: items.length ? items : browserMotion }); })
      .catch(() => { if (active) setMotionCatalog({ avatarId: selectedAvatarId, items: browserMotion }); });
    return () => { active = false; };
  }, [selectedAvatarId]);

  useEffect(() => {
    onPresenterReady(presenterRef.current);
    return () => onPresenterReady(null);
  }, [onPresenterReady, targetKey]);

  function selectionChanged(kind: "avatar" | "scene" | "voice", value: string) {
    if (kind === "avatar") setSelectedAvatarId(value);
    if (kind === "scene") setSelectedSceneId(value);
    if (kind === "voice") setSelectedVoiceId(value);
    setMotionId("");
    statusChanged("not-configured", "Selection changed. Click Initialize / load avatar.");
  }

  return <section className="rounded-2xl bg-ink p-5 text-white shadow-sm">
    <div className="mb-4 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-300">Perxona avatar</p><h2 className="text-xl font-semibold">Presenter</h2></div><span className={`rounded-full px-3 py-1 text-xs ${status === "error" ? "bg-red-400/20 text-red-200" : "bg-white/10 text-slate-200"}`}>{labels[status]}</span></div>
    <div className="mb-4 flex min-h-56 items-center justify-center rounded-xl bg-slate-900/70"><PerxonaPresenter key={targetKey} ref={presenterRef} presenterUrl={presenterUrl} target={target} onStatus={statusChanged} /></div>
    {message && <p className="mb-3 text-sm text-slate-300">{message}</p>}
    <div className="mb-3 grid gap-2 sm:grid-cols-3">
      <label className="text-xs text-slate-300">Avatar<select className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50" value={selectedAvatarId} disabled={catalogLoading || !avatars.length} onChange={(event) => selectionChanged("avatar", event.target.value)}><option value="" className="text-ink">{catalogLoading ? "Loading..." : "Configured avatar"}</option>{avatars.map((item) => <option className="text-ink" key={item.id} value={item.id}>{item.name || item.id}</option>)}</select></label>
      <label className="text-xs text-slate-300">Scene<select className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50" value={selectedSceneId} disabled={catalogLoading || !scenes.length} onChange={(event) => selectionChanged("scene", event.target.value)}><option value="" className="text-ink">{catalogLoading ? "Loading..." : "Configured scene"}</option>{scenes.map((item) => <option className="text-ink" key={item.id} value={item.id}>{item.name || item.id}</option>)}</select></label>
      <label className="text-xs text-slate-300">Voice<select className="mt-1 w-full rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50" value={selectedVoiceId} disabled={catalogLoading || (!voices.length && !selectedVoiceId)} onChange={(event) => selectionChanged("voice", event.target.value)}><option value="" className="text-ink">No voice / BYO audio</option>{voices.map((item) => <option className="text-ink" key={item.id} value={item.id}>{item.name || item.id}</option>)}</select></label>
    </div>
    <button className="w-full rounded-lg bg-mint px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!target || !presenterUrl} onClick={() => void presenterRef.current?.initialize()}>Initialize / load avatar</button>
    <div className="mt-3 flex gap-2"><input className="min-w-0 flex-1 rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400" value={testText} maxLength={4000} onChange={(event) => setTestText(event.target.value)} /><button className="rounded-lg bg-white/10 px-3 py-2 text-sm disabled:opacity-40" disabled={!testText.trim() || status !== "ready"} onClick={() => presenterRef.current?.present(testText.trim()).catch((error: Error) => statusChanged("error", error.message))}>Speak test</button></div>
    <div className="mt-4 grid grid-cols-[1fr_auto] gap-2"><label className="sr-only" htmlFor="motion-select">Motion</label><select id="motion-select" className="rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50" value={motionId} disabled={!motions.length} onChange={(event) => setMotionId(event.target.value)}><option value="" className="text-ink">{motions.length ? "Choose motion for selected avatar" : "No motions available for selected avatar"}</option>{motions.map((motion) => <option className="text-ink" key={motion.id} value={motion.id}>{motion.name || motion.id}</option>)}</select><button className="rounded-lg bg-white/10 px-3 py-2 text-sm disabled:opacity-40" disabled={!motionId || status !== "ready"} onClick={() => presenterRef.current?.playMotion(motionId).catch((error: Error) => statusChanged("error", error.message))}>Play</button></div>
  </section>;
}
