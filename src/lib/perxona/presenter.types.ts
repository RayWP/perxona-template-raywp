import type { IPresentationWidget } from "@perxona/presenter-types";

export type { PresentationResult, PresentationTarget } from "@perxona/presenter-types";

export interface PresenterElement extends HTMLElement, IPresentationWidget {}
