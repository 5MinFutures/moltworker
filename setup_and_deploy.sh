#!/bin/bash
set -e

echo "============================================="
echo "    Moltbot Setup & Deployment Helper"
echo "============================================="
echo ""

# Cloudflare Authentication
echo "--- Cloudflare Authentication ---"
echo "You provided these earlier, please paste them to authenticate the deployment."
read -sp "Enter your Cloudflare API Token: " CF_TOKEN
echo ""
# Export variables for wrangler
export CLOUDFLARE_API_TOKEN=$CF_TOKEN
export CLOUDFLARE_ACCOUNT_ID=$CF_ACCOUNT

# Verify Authentication
echo ""
echo "--- Verifying Credentials ---"
npx wrangler whoami || echo "WARNING: wrangler whoami failed. Credentials might be invalid."

# Bootstrap Deployment
echo ""
echo "============================================="
echo "    Bootstrapping Deployment..."
echo "    (This creates the Worker so we can set secrets)"
echo "============================================="
# We allow this to "fail" because the worker might crash without secrets, 
# but the upload should succeed, creating the resource.
npm run deploy || echo "Bootstrap deploy had issues, proceeding to set secrets..."

# Function to set secret
set_secret() {
    local KEY=$1
    local PROMPT=$2
    
    echo ""
    echo "--- Configure $KEY ---"
    read -sp "$PROMPT (Input will be hidden): " VALUE
    echo ""
    
    if [ -n "$VALUE" ]; then
        echo "Setting $KEY..."
        echo "$VALUE" | npx wrangler secret put "$KEY"
    else
        echo "Skipping $KEY (empty input)"
    fi
}

# Required Secrets
echo "Please enter your API keys when prompted."

set_secret "GOOGLE_API_KEY" "Enter your Google AI Studio API Key"
set_secret "COMPOSIO_API_KEY" "Enter your Composio API Key"
set_secret "TELEGRAM_BOT_TOKEN" "Enter your Telegram Bot Token"

# Moltbot Gateway Token
echo ""
echo "--- Configure MOLTBOT_GATEWAY_TOKEN ---"
GEN_TOKEN=$(openssl rand -hex 32)
echo "Generated a secure token: $GEN_TOKEN"
read -p "Press Enter to use this token, or type your own: " USER_TOKEN
FINAL_TOKEN=${USER_TOKEN:-$GEN_TOKEN}
echo "$FINAL_TOKEN" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
echo "MEMORIZE THIS TOKEN. You will need it to access the UI: ?token=$FINAL_TOKEN"

# Cloudflare Access
echo ""
echo "--- Configure Cloudflare Access ---"
read -p "Enter your Cloudflare Access Team Domain (my-team.cloudflareaccess.com): " TEAM_DOMAIN
if [ -n "$TEAM_DOMAIN" ]; then
    echo "$TEAM_DOMAIN" | npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
fi

read -p "Enter the Access Application AUD tag: " ACCESS_AUD
if [ -n "$ACCESS_AUD" ]; then
    echo "$ACCESS_AUD" | npx wrangler secret put CF_ACCESS_AUD
fi

# Final Deploy
echo ""
echo "============================================="
echo "    Finalizing Deployment..."
echo "============================================="
npm run deploy

echo ""
echo "Deployment complete!"
echo "Access your agent at your worker URL with ?token=$FINAL_TOKEN"
