import { db } from "@/lib/db";
import { env } from "@/lib/env";
import type { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
	auth?: boolean;
	userId?: string;
	admin: boolean;
	id?: string;
}

export async function auth(req: AuthRequest, res: Response, next: NextFunction) {
	const key = req.headers.authorization?.split(" ")[1];

	if (key === undefined) return res.status(401).json({ status: "error", message: "Unauthorized" });

	if (key === env.ADMIN_API_KEY) {
		req.auth = true;
		req.userId = undefined;
		req.admin = true;
		req.id = undefined;
		next();
		return;
	}

	const apiKey = await db.apiKey.findFirst({
		where: {
			secret: key,
		},
	});

	if (apiKey === null) return res.status(401).json({ status: "error", message: "Unauthorized" });

	req.auth = true;
	req.userId = apiKey.userId;
	req.admin = false;
	req.id = apiKey.id;

	next();

	return;
}
