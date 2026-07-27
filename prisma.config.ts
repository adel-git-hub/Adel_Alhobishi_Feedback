import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_cqtBCl53WMmU@ep-snowy-dust-asegelc9.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node --project tsconfig.seed.json prisma/seed.ts",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
