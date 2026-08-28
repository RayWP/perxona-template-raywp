import { z } from "zod";

export const conversationMessageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4_000) });
export const chatRequestSchema = z.object({ message: z.string().trim().min(1, "Message is required.").max(4_000), history: z.array(conversationMessageSchema).max(20).default([]) });
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = { answer: string; sources: Array<{ documentName: string; score: number }> };
