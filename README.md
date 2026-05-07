# n8n-nodes-wakit

[n8n](https://n8n.io) community node for [wakit](https://wakit.ai) — open-source WhatsApp Business API platform.

## Resources & Operations

| Resource | Operations |
|----------|-----------|
| **Message** | Send Text, Send Template, Send Media, Get Context, Get Many, Mark as Read |
| **Contact** | Create, Get Many, Search, Update |
| **Conversation** | Get Many, Get, Update Status |
| **Template** | Get Many, Create, Delete |
| **Quick Reply** | Create, Get Many, Update, Delete |
| **Webhook** | Create, Get Many, Delete |

## Credentials

You need:
- **Base URL** — your wakit instance URL. For wakit Cloud: `https://api.wakit.ai`
- **API Key** — create one in the wakit dashboard under Settings > API Keys

## Installation

In your n8n instance, go to **Settings > Community Nodes** and install:

```
n8n-nodes-wakit
```

## Self-hosted wakit

wakit is open-source. Deploy your own instance: [github.com/matiasbattocchia/wakit-api](https://github.com/matiasbattocchia/wakit-api)

## License

MIT
