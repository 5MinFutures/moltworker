import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 * 
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  console.log('[env.ts] ALL ENV KEYS:', Object.keys(env));
  console.log('[env.ts] ELEVENLABS_API_KEY type:', typeof env.ELEVENLABS_API_KEY, '| truthy:', !!env.ELEVENLABS_API_KEY);
  console.log('[env.ts] TELEGRAM_BOT_TOKEN type:', typeof env.TELEGRAM_BOT_TOKEN, '| truthy:', !!env.TELEGRAM_BOT_TOKEN);
  const envVars: Record<string, string> = {};

  // Normalize the base URL by removing trailing slashes
  const normalizedBaseUrl = env.AI_GATEWAY_BASE_URL?.replace(/\/+$/, '');
  const isOpenAIGateway = normalizedBaseUrl?.endsWith('/openai');
  const isGoogleGateway = normalizedBaseUrl?.endsWith('/google-ai-studio');

  // AI Gateway vars take precedence
  // Map to the appropriate provider env var based on the gateway endpoint
  if (env.AI_GATEWAY_API_KEY) {
    if (isGoogleGateway) {
      envVars.GOOGLE_API_KEY = env.AI_GATEWAY_API_KEY;
    } else if (isOpenAIGateway) {
      envVars.OPENAI_API_KEY = env.AI_GATEWAY_API_KEY;
    } else {
      envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
    }
  }

  // Fall back to direct provider keys
  if (!envVars.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
    envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }
  if (!envVars.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }
  if (!envVars.GOOGLE_API_KEY && env.GOOGLE_API_KEY) {
    envVars.GOOGLE_API_KEY = env.GOOGLE_API_KEY;
  }

  // Pass base URL (used by start-moltbot.sh to determine provider)
  if (normalizedBaseUrl) {
    envVars.AI_GATEWAY_BASE_URL = normalizedBaseUrl;
  }
  if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }
  // Map MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.CLAWDBOT_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE; // Pass DEV_MODE as CLAWDBOT_DEV_MODE to container
  if (env.CLAWDBOT_BIND_MODE) envVars.CLAWDBOT_BIND_MODE = env.CLAWDBOT_BIND_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  // ElevenLabs TTS - pass directly (same pattern as channel tokens)
  if (env.ELEVENLABS_API_KEY) envVars.ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY;
  if (env.ELEVENLABS_VOICE_ID) envVars.ELEVENLABS_VOICE_ID = env.ELEVENLABS_VOICE_ID;
  if (env.ELEVENLABS_BASE_URL) envVars.ELEVENLABS_BASE_URL = env.ELEVENLABS_BASE_URL.replace(/\/+$/, '');

  // R2 Credentials for mounting
  if (env.R2_ACCESS_KEY_ID) envVars.R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
  if (env.R2_SECRET_ACCESS_KEY) envVars.R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
  if (env.CF_ACCOUNT_ID) envVars.CF_ACCOUNT_ID = env.CF_ACCOUNT_ID;

  // Composio API key for tool integrations
  if (env.COMPOSIO_API_KEY) envVars.COMPOSIO_API_KEY = env.COMPOSIO_API_KEY;

  // ElevenLabs Gateway fallback (only if direct key not set above)
  // If ELEVENLABS_BASE_URL points to AI Gateway, use AI_GATEWAY_API_KEY
  if (!envVars.ELEVENLABS_API_KEY) {
    const elevenLabsBaseUrl = env.ELEVENLABS_BASE_URL?.replace(/\/+$/, '');
    const isElevenLabsGateway = elevenLabsBaseUrl?.endsWith('/elevenlabs');
    if (isElevenLabsGateway && env.AI_GATEWAY_API_KEY) {
      envVars.ELEVENLABS_API_KEY = env.AI_GATEWAY_API_KEY;
      console.log('[env.ts] Using AI_GATEWAY_API_KEY for ElevenLabs (gateway mode)');
    }
  }

  // Log final ElevenLabs state for debugging
  console.log('[env.ts] ElevenLabs env:', {
    hasKey: !!envVars.ELEVENLABS_API_KEY,
    keyLength: envVars.ELEVENLABS_API_KEY?.length || 0,
    hasVoiceId: !!envVars.ELEVENLABS_VOICE_ID,
    hasBaseUrl: !!envVars.ELEVENLABS_BASE_URL,
  });

  return envVars;
}
