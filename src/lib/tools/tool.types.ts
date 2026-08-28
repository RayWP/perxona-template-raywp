import type { ZodType } from "zod";

export interface AgentTool<TInput = unknown, TOutput = unknown> { name: string; description: string; inputSchema: ZodType<TInput>; execute(input: TInput): Promise<TOutput>; }
