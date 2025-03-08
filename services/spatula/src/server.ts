import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { actionLogger, responseLogger } from "@/lib/log";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import { join } from "path";
import { Worker } from "worker_threads";

const resolverPoolSize = env.RESOLVER_POOL_SIZE;

// set with object containing worker and id to later find the worker by id
const resolverWorkers = new Set<{ worker: ResolverWorker; id?: string }>();

export const googleGenAI = new GoogleGenerativeAI(env.AI_STUDIO_API_KEY);

export const app = express();

// @ts-expect-error todo: fix
app.use(responseLogger);

export const log = actionLogger();

async function createResolver(id?: string) {
	log.info("Creating resolver");
	// even though isAvailable variable is defaulted to false, prisma requires to input data because
	// otherwise we get null contraint violation error
	const resolver = await db.resolver.create({
		data: {
			id,
			isAvailable: false,
		},
	});
	const resolverWorker = new Worker(join(process.cwd(), "dist", "resolver.js"), {
		workerData: {
			id: resolver.id,
		},
	});
	resolverWorker.on("error", async (err) => {
		// on error delete worker and create a new one
		resolverWorkers.delete({ worker: resolverWorker, id: resolver.id });
		log.error(`Worker ${resolver.id} critical error ${err}`);
		await db.resolver.delete({
			where: {
				id: resolver.id,
			},
		});
		if (resolverWorkers.size < resolverPoolSize) {
			resolverWorkers.add(await createResolver(id));
		}
	});

	return { worker: resolverWorker, id: resolver.id };
}
// function to distribute messages to workers and wait for response
function sendToWorker(worker: ResolverWorker, data: { url: string }, timeout = 30000) {
	return new Promise((resolve, reject) => {
		// Create a unique ID for this request
		const requestId = Date.now() + Math.random().toString(36).substring(2, 10);

		// Set a timeout to prevent hanging requests
		const timeoutId = setTimeout(() => {
			cleanup();
			reject(new Error("Worker response timeout"));
		}, timeout);

		// Message handler
		const messageHandler = (message: { requestId: string }) => {
			// Only process messages with matching requestId
			if (message.requestId === requestId) {
				cleanup();
				resolve(message);
			}
		};

		// Error handler
		const errorHandler = (error: string) => {
			cleanup();
			reject(error);
		};

		// Cleanup function to remove listeners and clear timeout
		const cleanup = () => {
			clearTimeout(timeoutId);
			worker.removeListener("message", messageHandler);
			worker.removeListener("error", errorHandler);
		};

		// Attach the listeners
		worker.on("message", messageHandler);
		worker.on("error", errorHandler);

		// Send the message with the requestId
		worker.postMessage({ ...data, requestId });
	});
}
// do not use async function main() as this will cause to prevent express from running
await db.resolver.deleteMany({});

for (let i = 0; i < resolverPoolSize; i++) {
	resolverWorkers.add(await createResolver());
}

type ResolverWorker = Worker;

// @ts-expect-error todo: fix
app.get("/item", auth, async (req: AuthRequest, res) => {
	if (!req.query.url) {
		return res.status(400).json({ status: "error", message: "No URL provided" });
	}

	const url = decodeURIComponent(req.query.url as string);
	// prevention of prompt injection
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		return res.status(400).json({ status: "error", message: "URL must not contain http or https" });
	}

	try {
		const resolver = await db.resolver.findFirst({
			where: {
				isAvailable: true,
				requestsInQueue: {
					lte: env.MAX_REQUESTS_PER_RESOLVER,
				},
			},
		});
		if (resolver === null) {
			return res
				.status(500)
				.json({ status: "error", message: "Internal server error, please try later" });
		}

		// we need to transform Set into array to use find method
		const resolverWorker = [...resolverWorkers].find((worker) => worker.id === resolver.id);
		if (!resolverWorker) {
			log.error(`Worker ${resolver.id} found in DB but not in workers set`);
			return res.status(500).json({
				status: "error",
				message: "Internal server error, worker not found",
			});
		}

		// awaiting worker <-> parentPort message with item response
		const response = await sendToWorker(resolverWorker.worker, { url });

		// @ts-expect-error todo: fix
		return res.json({ status: "success", item: response.item });
	} catch (error) {
		log.error(`Request failed ${JSON.stringify(error)}`);
		return res
			.status(500)
			.json({ status: "error", message: "Internal server error, please try later" });
	}
});

app.listen(env.PORT, () => {
	log.info(`Server is running on port ${env.PORT}`);
});
