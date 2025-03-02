import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
	server: {
		PORT: z.string(),
		TWOCAPTCHA_API_KEY: z.string(),
		AI_STUDIO_API_KEY: z.string(),
		FINGERPRINT_KEY: z.string(),
		ADMIN_API_KEY: z.string(),
	},
	runtimeEnv: {
		PORT: process.env.PORT,
		TWOCAPTCHA_API_KEY: process.env.TWOCAPTCHA_API_KEY,
		AI_STUDIO_API_KEY: process.env.AI_STUDIO_API_KEY,
		FINGERPRINT_KEY: process.env.FINGERPRINT_KEY,
		ADMIN_API_KEY: process.env.ADMIN_API_KEY,
	},
});
