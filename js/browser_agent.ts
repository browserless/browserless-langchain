/**
 * Tier 2 — multi-turn browser agent. Requires Phase 1 deploy:
 *   - browserless-mcp PR #49 (stateful HTTP)
 *   - load-balancer PR #59 (sticky LB by Mcp-Session-Id)
 *   - LangChain JS adapter propagating Mcp-Session-Id between calls
 *
 * Until those land, set BROWSERLESS_MCP_URL=https://dev-mcp.browserless.io/mcp to
 * verify against the dev environment, or skip this script.
 */
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";

const MCP_URL =
  process.env.BROWSERLESS_MCP_URL ?? "https://mcp.browserless.io/mcp";

const client = new MultiServerMCPClient({
  mcpServers: {
    browserless: {
      transport: "http",
      url: MCP_URL,
      headers: { Authorization: `Bearer ${process.env.BROWSERLESS_TOKEN}` },
    },
  },
});

const tools = await client.getTools();
console.log(tools.map((t) => t.name));

// --- direct multi-turn proof: state must survive across calls ---
const agentTool = tools.find((t) => t.name === "browserless_agent")!;

await agentTool.invoke({ method: "goto", params: { url: "https://example.com" } });
await agentTool.invoke({ method: "snapshot" });
const result = await agentTool.invoke({
  method: "text",
  params: { selector: "h1" },
});
console.log("h1 text:", result);
if (!String(result).includes("Example Domain")) {
  throw new Error("Session state was not preserved between calls");
}

// --- full ReAct loop with all 10 tools ---
const agent = createReactAgent({
  llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
  tools,
});

const prompt =
  "Use browserless_agent to navigate to https://news.ycombinator.com, click the first story link, " +
  "and report the title and first paragraph of that page. Use snapshot/click/text methods step by step.";

const out = await agent.invoke({
  messages: [{ role: "user", content: prompt }],
});

console.log(out.messages.at(-1)?.content);

await client.close();
