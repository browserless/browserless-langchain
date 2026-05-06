# Browserless × LangChain (Python)

Runnable Python examples for the Browserless MCP server, using `langchain-mcp-adapters` + `langgraph`.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .
pip freeze > requirements.txt
export BROWSERLESS_TOKEN=<your-token>
export ANTHROPIC_API_KEY=<your-key>
```

Get a Browserless token at [account.browserless.io](https://account.browserless.io).

## Notebooks

| Notebook | What it shows | Tier |
|---|---|---|
| `quickstart.ipynb` | Connect, list tools, call `browserless_smartscraper` directly, run a stateless ReAct agent | 1 (stateless) |
| `research_agent.ipynb` | Multi-step search → scrape → summarize using stateless tools | 1 (stateless) |
| `browser_agent.ipynb` | Multi-turn browser agent: navigate → snapshot → click → re-snapshot → extract | 2 (stateful) |

### Note on Python session handling

`langchain-mcp-adapters` opens a **fresh** MCP `ClientSession` per `tool.ainvoke()` call by default — see the [adapter README](https://github.com/langchain-ai/langchain-mcp-adapters#streamable-http). That works for stateless tools, but for multi-turn `browserless_agent` flows you need to bind tools to a long-lived session:

```python
async with client.session("browserless") as session:
    tools = await load_mcp_tools(session)
    # ... all agent calls go inside this block
```

Without it, each `ainvoke()` opens a fresh `Mcp-Session-Id`, the load balancer routes to a different browser, and state is lost between steps. `browser_agent.ipynb` shows the correct pattern.

The JS adapter does not have this requirement — see `../js/browser_agent.ts`.

## Run

```bash
jupyter nbconvert --to notebook --execute quickstart.ipynb --output quickstart.executed.ipynb
jupyter nbconvert --to notebook --execute research_agent.ipynb --output research_agent.executed.ipynb
jupyter nbconvert --to notebook --execute browser_agent.ipynb --output browser_agent.executed.ipynb
```
