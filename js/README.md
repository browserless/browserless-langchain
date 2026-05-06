# Browserless × LangChain (JS / TypeScript)

Runnable JS examples for the Browserless MCP server, using `@langchain/mcp-adapters` + `@langchain/langgraph`.

## Setup

```bash
npm install
export BROWSERLESS_TOKEN=<your-token>
export ANTHROPIC_API_KEY=<your-key>
```

Get a Browserless token at [account.browserless.io](https://account.browserless.io).

## Scripts

| Script | What it shows | Tier |
|---|---|---|
| `quickstart.ts` | Connect, list tools, call `browserless_smartscraper` directly, run a stateless ReAct agent | 1 (stateless) |
| `research_agent.ts` | Multi-step search → scrape → summarize using stateless tools | 1 (stateless) |
| `browser_agent.ts` | Multi-turn browser agent: navigate → snapshot → click → re-snapshot → extract | 2 (stateful) |

**Tier 2** requires the stateful HTTP fix in the Browserless MCP server (PR #49 / load-balancer PR #59). Until those merge and deploy, point `browser_agent.ts` at `dev-mcp.browserless.io` to verify, or skip it.

## Run

```bash
npm run quickstart
npm run research
npm run browser   # tier 2 — see note above
```
