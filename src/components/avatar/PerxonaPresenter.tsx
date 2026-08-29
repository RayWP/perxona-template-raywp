"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { PresentationTarget, PresenterElement } from "@/lib/perxona/presenter.types";
import { browserPerxonaConfig } from "@/lib/config/env.client";

export type PresenterStatus = "not-configured" | "initializing" | "ready" | "speaking" | "error";
export type PerxonaPresenterHandle = { initialize(): Promise<void>; present(text: string): Promise<void>; playMotion(id: string): Promise<void>; interrupt(): Promise<void> };

type Props = { presenterUrl: string; target: PresentationTarget | null; useServerKey: boolean; onStatus: (status: PresenterStatus, message?: string) => void };
let scriptPromise: Promise<void> | undefined;

function loadPresenter(url: string) {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => { const script = document.createElement("script"); script.type = "module"; script.src = url; script.onload = () => resolve(); script.onerror = () => reject(new Error("Could not load the Perxona Presenter SDK.")); document.head.appendChild(script); });
  return scriptPromise;
}

function publishableKeyRejectedMessage() {
  const origin = typeof window === "undefined" ? "this page" : window.location.origin;
  return `Perxona rejected the publishable key for ${origin}. In Perxona Console, use a Publishable Connect API key that allows this origin and includes the asset, voice, tts_token, and presentation scopes, then restart Next after replacing the key.`;
}

export const PerxonaPresenter = forwardRef<PerxonaPresenterHandle, Props>(function PerxonaPresenter({ presenterUrl, target, useServerKey, onStatus }, ref) {
  const elementRef = useRef<PresenterElement | null>(null);
  useEffect(() => { const element = elementRef.current; if (!element) return; const status = (event: Event) => { const detail = (event as CustomEvent<{ status?: string }>).detail; if (detail?.status?.toLowerCase().includes("ready")) onStatus("ready"); }; const rejected = () => onStatus("error", publishableKeyRejectedMessage()); element.addEventListener("PRESENTER_STATUS", status); element.addEventListener("CONNECT_KEY_REJECTED", rejected); return () => { element.removeEventListener("PRESENTER_STATUS", status); element.removeEventListener("CONNECT_KEY_REJECTED", rejected); }; }, [onStatus]);
  useEffect(() => { if (presenterUrl) void loadPresenter(presenterUrl).catch((error: unknown) => onStatus("error", error instanceof Error ? error.message : "Could not load the Perxona Presenter SDK.")); }, [onStatus, presenterUrl]);
  useImperativeHandle(ref, () => ({
    async initialize() { if (!target) { onStatus("not-configured", "Choose or configure an avatar and scene first."); return; } onStatus("initializing"); try { await loadPresenter(presenterUrl); const element = elementRef.current; if (!element) throw new Error("Presenter element is not available."); await element.resumeAudioPlayback(); let connectKey = browserPerxonaConfig.connectKey; if (useServerKey) { const response = await fetch("/api/perxona/connect-key", { cache: "no-store" }); const body = await response.json() as { connect_key?: string; error?: string }; if (!response.ok || !body.connect_key) throw new Error(body.error || "Perxona publishable key is unavailable."); connectKey = body.connect_key; } if (!connectKey) throw new Error("Perxona publishable key is unavailable. Set NEXT_PUBLIC_PERXONA_CONNECT_PUBLISHABLE_KEY for browser-only testing."); await element.initializeWithConnectKey(connectKey, target); onStatus("ready"); } catch (error) { onStatus("error", error instanceof Error ? error.message : "Perxona initialization failed."); } },
    async present(text) { const element = elementRef.current; if (!element) throw new Error("Presenter is not initialized."); onStatus("speaking"); const result = await element.present(text); if (!result.success) { const message = result.message || result.code || "Perxona could not present this answer."; onStatus("error", message); throw new Error(message); } onStatus("ready"); },
    async playMotion(id) { const element = elementRef.current; if (!element) throw new Error("Presenter is not initialized."); const result = await element.playMotion(id); if (!result.success) throw new Error(result.message || result.code || "Perxona could not play that motion."); },
    async interrupt() { await elementRef.current?.interruptPresentation(); },
  }), [onStatus, presenterUrl, target, useServerKey]);
  return <sv-presenter ref={elementRef} className="block h-full min-h-56 w-full" aria-label="Perxona avatar presenter" />;
});
