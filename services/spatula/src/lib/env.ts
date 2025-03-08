import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		PORT: z.coerce.number(),
		TWOCAPTCHA_API_KEY: z.string(),
		AI_STUDIO_API_KEY: z.string(),
		FINGERPRINT_KEY: z.string(),
		ADMIN_API_KEY: z.string(),
		RESOLVER_POOL_SIZE: z.coerce.number(),
		MAX_REQUESTS_PER_RESOLVER: z.coerce.number(),
	},
	runtimeEnv: {
		PORT: process.env.PORT,
		TWOCAPTCHA_API_KEY: process.env.TWOCAPTCHA_API_KEY,
		AI_STUDIO_API_KEY: process.env.AI_STUDIO_API_KEY,
		FINGERPRINT_KEY: process.env.FINGERPRINT_KEY,
		ADMIN_API_KEY: process.env.ADMIN_API_KEY,
		RESOLVER_POOL_SIZE: process.env.RESOLVER_POOL_SIZE,
		MAX_REQUESTS_PER_RESOLVER: process.env.MAX_REQUESTS_PER_RESOLVER,
	},
});
