import type { LLMRequest, LLMResponse } from "./llm.types";

export interface LLMProvider { generate(request: LLMRequest): Promise<LLMResponse>; }
