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
const statelessTools = tools.filter(
  (t) => !["browserless_agent", "browserless_skill"].includes(t.name),
);

const agent = createReactAgent({
  llm: new ChatAnthropic({ model: "claude-sonnet-4-6" }),
  tools: statelessTools,
});

const prompt =
  "Research the current state of WebAssembly outside the browser. " +
  "Use browserless_search to find 3 recent authoritative articles, then use browserless_smartscraper " +
  "to read the most relevant one and summarize the key takeaways in 5 bullet points. " +
  "Cite the URL for each takeaway.";

const out = await agent.invoke({
  messages: [{ role: "user", content: prompt }],
});

console.log(out.messages.at(-1)?.content);

await client.close();
