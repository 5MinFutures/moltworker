import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    const result = buildEnvVars(env);
    expect(result).toEqual({});
  });

  it('includes ANTHROPIC_API_KEY when set directly', () => {
    const env = createMockEnv({ ANTHROPIC_API_KEY: 'sk-test-key' });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-test-key');
  });

  it('maps AI_GATEWAY_API_KEY to ANTHROPIC_API_KEY for Anthropic gateway', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-gateway-key');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic');
    expect(result.OPENAI_API_KEY).toBeUndefined();
  });

  it('maps AI_GATEWAY_API_KEY to OPENAI_API_KEY for OpenAI gateway', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/openai',
    });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-gateway-key');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/openai');
    expect(result.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it('passes AI_GATEWAY_BASE_URL directly', () => {
    const env = createMockEnv({
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic');
  });

  it('AI_GATEWAY_* takes precedence over direct provider keys for Anthropic', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/anthropic',
      ANTHROPIC_API_KEY: 'direct-key',
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('gateway-key');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/anthropic');
  });

  it('AI_GATEWAY_* takes precedence over direct provider keys for OpenAI', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/openai',
      OPENAI_API_KEY: 'direct-key',
    });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('gateway-key');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/openai');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.example.com/openai');
  });

  it('falls back to ANTHROPIC_* when AI_GATEWAY_* not set', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'direct-key',
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('direct-key');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://api.anthropic.com');
  });

  it('includes OPENAI_API_KEY when set directly (no gateway)', () => {
    const env = createMockEnv({ OPENAI_API_KEY: 'sk-openai-key' });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-openai-key');
  });

  it('maps MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN for container', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('my-token');
  });

  it('includes all channel tokens when set', () => {
    const env = createMockEnv({
      TELEGRAM_BOT_TOKEN: 'tg-token',
      TELEGRAM_DM_POLICY: 'pairing',
      DISCORD_BOT_TOKEN: 'discord-token',
      DISCORD_DM_POLICY: 'open',
      SLACK_BOT_TOKEN: 'slack-bot',
      SLACK_APP_TOKEN: 'slack-app',
    });
    const result = buildEnvVars(env);
    
    expect(result.TELEGRAM_BOT_TOKEN).toBe('tg-token');
    expect(result.TELEGRAM_DM_POLICY).toBe('pairing');
    expect(result.DISCORD_BOT_TOKEN).toBe('discord-token');
    expect(result.DISCORD_DM_POLICY).toBe('open');
    expect(result.SLACK_BOT_TOKEN).toBe('slack-bot');
    expect(result.SLACK_APP_TOKEN).toBe('slack-app');
  });

  it('maps DEV_MODE to CLAWDBOT_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      CLAWDBOT_BIND_MODE: 'lan',
    });
    const result = buildEnvVars(env);
    
    expect(result.CLAWDBOT_DEV_MODE).toBe('true');
    expect(result.CLAWDBOT_BIND_MODE).toBe('lan');
  });

  it('combines all env vars correctly', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-key',
      MOLTBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
    const result = buildEnvVars(env);
    
    expect(result).toEqual({
      ANTHROPIC_API_KEY: 'sk-key',
      CLAWDBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });

  it('handles trailing slash in AI_GATEWAY_BASE_URL for OpenAI', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/openai/',
    });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-gateway-key');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/openai');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/openai');
    expect(result.ANTHROPIC_API_KEY).toBeUndefined();
  });

  it('handles trailing slash in AI_GATEWAY_BASE_URL for Anthropic', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic/',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-gateway-key');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic');
    expect(result.OPENAI_API_KEY).toBeUndefined();
  });

  it('handles multiple trailing slashes in AI_GATEWAY_BASE_URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/openai///',
    });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-gateway-key');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/openai');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/openai');
  });

  // ElevenLabs TTS tests
  describe('ElevenLabs TTS', () => {
    it('includes ELEVENLABS_API_KEY when set directly', () => {
      const env = createMockEnv({ ELEVENLABS_API_KEY: 'sk-eleven-key' });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_API_KEY).toBe('sk-eleven-key');
    });

    it('includes ELEVENLABS_BASE_URL when set', () => {
      const env = createMockEnv({
        ELEVENLABS_API_KEY: 'sk-eleven-key',
        ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_BASE_URL).toBe('https://api.elevenlabs.io');
    });

    it('includes ELEVENLABS_VOICE_ID when set', () => {
      const env = createMockEnv({
        ELEVENLABS_API_KEY: 'sk-eleven-key',
        ELEVENLABS_VOICE_ID: 'custom-voice-id',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_VOICE_ID).toBe('custom-voice-id');
    });

    it('maps AI_GATEWAY_API_KEY to ELEVENLABS_API_KEY when using ElevenLabs gateway URL', () => {
      const env = createMockEnv({
        AI_GATEWAY_API_KEY: 'sk-gateway-key',
        ELEVENLABS_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/elevenlabs',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_API_KEY).toBe('sk-gateway-key');
      expect(result.ELEVENLABS_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/elevenlabs');
    });

    it('prefers direct ELEVENLABS_API_KEY over gateway key even when gateway URL ends with /elevenlabs', () => {
      const env = createMockEnv({
        AI_GATEWAY_API_KEY: 'sk-gateway-key',
        ELEVENLABS_API_KEY: 'sk-eleven-direct',
        ELEVENLABS_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/elevenlabs',
      });
      const result = buildEnvVars(env);
      // Direct key always takes priority
      expect(result.ELEVENLABS_API_KEY).toBe('sk-eleven-direct');
    });

    it('prefers direct ELEVENLABS_API_KEY when gateway URL is not for ElevenLabs', () => {
      const env = createMockEnv({
        AI_GATEWAY_API_KEY: 'sk-gateway-key',
        ELEVENLABS_API_KEY: 'sk-eleven-direct',
        ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_API_KEY).toBe('sk-eleven-direct');
    });

    it('handles trailing slash in ELEVENLABS_BASE_URL', () => {
      const env = createMockEnv({
        AI_GATEWAY_API_KEY: 'sk-gateway-key',
        ELEVENLABS_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/elevenlabs/',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_API_KEY).toBe('sk-gateway-key');
      expect(result.ELEVENLABS_BASE_URL).toBe('https://gateway.ai.cloudflare.com/v1/123/my-gw/elevenlabs');
    });

    it('does not set ELEVENLABS_API_KEY when neither direct key nor gateway is configured', () => {
      const env = createMockEnv({
        ELEVENLABS_BASE_URL: 'https://api.elevenlabs.io',
      });
      const result = buildEnvVars(env);
      expect(result.ELEVENLABS_API_KEY).toBeUndefined();
      expect(result.ELEVENLABS_BASE_URL).toBe('https://api.elevenlabs.io');
    });
  });
});
