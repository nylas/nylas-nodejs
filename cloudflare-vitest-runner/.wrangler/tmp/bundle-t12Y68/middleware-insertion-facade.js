				import worker, * as OTHER_EXPORTS from "/workspace/cloudflare-vitest-runner/simple-test.mjs";
				import * as __MIDDLEWARE_0__ from "/home/ubuntu/.nvm/versions/node/v22.16.0/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts";
import * as __MIDDLEWARE_1__ from "/home/ubuntu/.nvm/versions/node/v22.16.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";

				export * from "/workspace/cloudflare-vitest-runner/simple-test.mjs";
				const MIDDLEWARE_TEST_INJECT = "__INJECT_FOR_TESTING_WRANGLER_MIDDLEWARE__";
				export const __INTERNAL_WRANGLER_MIDDLEWARE__ = [
					
					__MIDDLEWARE_0__.default,__MIDDLEWARE_1__.default
				]
				export default worker;