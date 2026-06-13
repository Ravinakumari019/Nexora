import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  // Optional: log queries for debugging
  // log: ["query", "info", "warn", "error"],
});

// Graceful shutdown in serverless environments
if (process.env.NODE_ENV === "development") {
  if (typeof globalThis !== "undefined") {
    // @ts-ignore – allow attaching to global in dev
    (globalThis as any).prisma = prisma;
  }
}
