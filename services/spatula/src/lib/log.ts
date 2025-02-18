import type { AuthRequest } from "@/lib/auth";
import type { NextFunction, Response } from "express";

export function getLocalISOString() {
	return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString();
}

export function getDurationInMiliseconds(start: [number, number]) {
	const NS_PER_SEC = 1e9;
	const NS_TO_MS = 1e6;
	const diff = process.hrtime(start);
	return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
}

export const responseLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
	const start = process.hrtime();
	res.on("finish", function () {
		if (req.method === "OPTIONS") return;
		console.log(
			`[FITGATHER-SPATULA] [${getLocalISOString()}] [RESPONSE] [${req.admin ? "ADMIN" : req.userId ? req.userId : "UNKNOWN"}] [${req.method}] [${decodeURI(req.url)}] - ${res.statusCode} ${res.statusMessage} ${getDurationInMiliseconds(start)}ms`
		);
	});
	next();
};

export function actionLogger() {
	return {
		info: (message: string) => {
			return console.log(`[FITGATHER-SPATULA] [${getLocalISOString()}] [INFO] - ${message}`);
		},
		error: (message: string) => {
			const errorString = `[FITGATHER-SPATULA] [${getLocalISOString()}] [ERROR] - ${message}`;
			console.error(errorString);
			return {
				throwError: () => {
					throw new Error(errorString);
				},
			};
		},
	};
}
