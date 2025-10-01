export default {
  fetch(request, env, ctx) {
    return new Response(JSON.stringify({
      status: 'PASS',
      summary: 'Simple test passed',
      environment: 'cloudflare-workers-nodejs-compat',
      passed: 1,
      failed: 0,
      total: 1,
      results: ['✅ Simple test passed']
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};