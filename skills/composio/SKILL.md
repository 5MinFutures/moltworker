---
name: composio
description: Interact with external apps and tools via Composio. Use this skill to perform actions in GitHub, Gmail, Calendar, and over 100+ other SaaS tools.
---

# Composio Integration

This skill allows you to execute actions using Composio tools.

## Prerequisites

- `COMPOSIO_API_KEY` environment variable must be set.

## Usage

To use a Composio tool, you should first identify the required action and parameters.

### Execute an Action

Run the generic execution script with the app name, action, and parameters (JSON string).

```bash
node /root/clawd/skills/composio/scripts/execute.js <APP_NAME> <ACTION_NAME> '<PARAMETERS_JSON>'
```

Example: Star a GitHub repository
```bash
node /root/clawd/skills/composio/scripts/execute.js github STAR_REPO '{"owner":"cloudflare","repo":"moltworker"}'
```

Example: Send an Email
```bash
node /root/clawd/skills/composio/scripts/execute.js gmail SEND_EMAIL '{"recipient":"user@example.com","subject":"Hello","body":"Sent from Moltbot"}'
```

## Available Tools

Common tools you can use:
- `github`: MANAGE_REPO, STAR_REPO, CREATE_ISSUE
- `gmail`: SEND_EMAIL, READ_EMAIL
- `google-calendar`: CREATE_EVENT
- `slack`: SEND_MESSAGE

(Refer to Composio documentation or ask the user if you need specific parameter schemas).
