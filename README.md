# Browserless × LangChain

Runnable Python and JS examples for the [Browserless](https://browserless.io) MCP server. Browserless is a **stateful** MCP server: a multi-turn browser agent works in a real ReAct loop over HTTP, not just batched single-call mode.

The hosted endpoint at `https://mcp.browserless.io/mcp` exposes 10 tools auto-importable via `langchain-mcp-adapters` — no partner package needed.

| | Stateless tools (8) | Stateful tools (2) |
|---|---|---|
| | `smartscraper`, `search`, `map`, `crawl`, `export`, `performance`, `function`, `download` | `agent`, `skill` |
| Use case | Single-shot scraping, research, data extraction | Multi-turn browser automation, ReAct loops with persistent browser state |

> **Multi-turn agent in Python**: bind tools inside `async with client.session(...)` to keep the same MCP session across calls — see [`python/README.md`](./python/README.md#note-on-python-session-handling). The JS adapter does this automatically.

## Python

```python
import os
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "browserless": {
        "transport": "http",
        "url": "https://mcp.browserless.io/mcp",
        "headers": {"Authorization": f"Bearer {os.environ['BROWSERLESS_TOKEN']}"},
    }
})
tools = await client.get_tools()
print([t.name for t in tools])  # 10 tools
```

See [`python/`](./python/) for full notebooks: `quickstart.ipynb`, `research_agent.ipynb`, `browser_agent.ipynb`.

## JS / TypeScript

```ts
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

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
console.log(tools.map((t) => t.name)); // 10 tools
```

See [`js/`](./js/) for full scripts: `quickstart.ts`, `research_agent.ts`, `browser_agent.ts`.

## Get a token

[account.browserless.io](https://account.browserless.io)

## Links

- Hosted MCP server: [mcp.browserless.io](https://mcp.browserless.io)
- Python adapter: [`langchain-mcp-adapters`](https://github.com/langchain-ai/langchain-mcp-adapters)
- JS adapter: [`@langchain/mcp-adapters`](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters)
