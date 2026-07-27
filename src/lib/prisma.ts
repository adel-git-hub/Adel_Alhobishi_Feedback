import { PrismaClient } from "@prisma/client";

const DATABASE_URL = process.env.DATABASE_URL || "";

const globalForPrisma = global as unknown as { prisma_new: PrismaClient };

function createPrismaClient() {
  if (DATABASE_URL.includes("neon.tech")) {
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const adapter = new PrismaNeon({ connectionString: DATABASE_URL });
    return new PrismaClient({
      // @ts-ignore — Prisma v7 adapter API
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error"] : [],
    });
  }

  const { Pool } = require("pg");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    // @ts-ignore
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const prisma = globalForPrisma.prisma_new ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma_new = prisma;
}
