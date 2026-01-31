#!/bin/bash
set -e

echo "============================================="
echo "    Run Moltbot Locally (Docker)"
echo "============================================="
echo "Note: Since we are running locally, we need to provide your API keys again."
echo ""

# cleanup previous run
docker rm -f moltbot-sandbox 2>/dev/null || true

# Prompt for secrets
read -sp "Enter your Google AI Studio API Key: " GOOGLE_KEY
echo ""
read -sp "Enter your Composio API Key: " COMPOSIO_KEY
echo ""
read -sp "Enter your Telegram Bot Token: " TELEGRAM_TOKEN
echo ""

echo "Starting container..."

docker run -d \
  --platform linux/amd64 \
  --name moltbot-sandbox \
  --restart always \
  -p 18789:18789 \
  -e PORT=18789 \
  -e GOOGLE_API_KEY="$GOOGLE_KEY" \
  -e COMPOSIO_API_KEY="$COMPOSIO_KEY" \
  -e TELEGRAM_BOT_TOKEN="$TELEGRAM_TOKEN" \
  -e DEV_MODE=true \
  cloudflare/moltworker:latest

echo ""
echo "Container started! Access the UI at: http://localhost:18789"
echo "To view logs: docker logs -f moltbot-sandbox"
