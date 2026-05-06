import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";

const client = new MultiServerMCPClient({
  mcpServers: {
    browserless: {
      transport: "http",
      url: "https://mcp.browserless.io/mcp",
      headers: { Authorization: `Bearer ${process.env.BROWSERLESS_TOKEN}` },
    },
  },
});

const tools = await client.getTools();
console.log(`Loaded ${tools.length} tools:`);
for (const t of tools) console.log(`  - ${t.name}`);

const smartscraper = tools.find((t) => t.name === "browserless_smartscraper")!;
const scraped = await smartscraper.invoke({
  url: "https://example.com",
  formats: ["markdown"],
});
console.log("\n--- direct smartscraper call ---\n");
console.log(scraped);

const statelessTools = tools.filter(
  (t) => !["browserless_agent", "browserless_skill"].includes(t.name),
);

const agent = createReactAgent({
  llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
  tools: statelessTools,
});

console.log("\n--- ReAct agent: top 5 HN headlines ---\n");
const out = await agent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Scrape https://news.ycombinator.com and list the top 5 headlines as a markdown bullet list.",
    },
  ],
});
console.log(out.messages.at(-1)?.content);

await client.close();
