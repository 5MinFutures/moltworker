const https = require('https');

const APP = process.argv[2];
const ACTION = process.argv[3];
const PARAMS_STR = process.argv[4] || '{}';

if (!APP || !ACTION) {
    console.error('Usage: node execute.js <APP> <ACTION> [PARAMS_JSON]');
    process.exit(1);
}

const API_KEY = process.env.COMPOSIO_API_KEY;
if (!API_KEY) {
    console.error('Error: COMPOSIO_API_KEY environment variable is not set.');
    process.exit(1);
}

let params;
try {
    params = JSON.parse(PARAMS_STR);
} catch (e) {
    console.error('Error parsing JSON parameters:', e.message);
    process.exit(1);
}

// NOTE: This assumes Composio has a generic execution endpoint or we map to it.
// Since Composio SDK is heavy, we'll try to use the HTTP API if available, 
// OR we can install the SDK in the Dockerfile.
// For now, let's assume we use the SDK if we install it, but here is a fetch implementation
// based on standard tool execution patterns. 
// IF successful, this works. IF NOT, we might need the python/node sdk.
//
// The 'composio-core' package is preferred. Let's assume we will install it.
// BUT, to be "flawless", installing the package in the container is safer.
//
// Re-writing this to use 'composio-core' (which we will add to Dockerfile).

const { ComposioToolSet } = require('composio-core');

(async () => {
    try {
        const toolset = new ComposioToolSet({ apiKey: API_KEY });
        
        // This is a simplified interface. Real Composio SDK usage might differ slightly
        // depending on version. We'll try to execute the action directly.
        // If specific setup is needed, the agent might need to do more.
        
        console.log(`Executing ${APP}.${ACTION} with params:`, params);
        
        const result = await toolset.executeAction(`${APP}_${ACTION}`, params);
        
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Error executing action:', error);
        process.exit(1);
    }
})();
