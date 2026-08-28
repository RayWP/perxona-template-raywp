import type { AgentTool } from "./tool.types";

export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool>();
  register(tool: AgentTool) { if (this.tools.has(tool.name)) throw new Error(`A tool named ${tool.name} is already registered.`); this.tools.set(tool.name, tool); }
  get(name: string) { return this.tools.get(name); }
  list() { return [...this.tools.values()]; }
}

export const toolRegistry = new ToolRegistry();
