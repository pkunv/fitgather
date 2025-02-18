import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
	return new PrismaClient({
		log: ["error"],
	});
};

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
