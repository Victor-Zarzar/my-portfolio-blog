import { defineConfig } from "drizzle-kit";
import { env } from "@/env/server";

export default defineConfig({
  schema: "./src/lib/db/schemas",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.POSTGRES_URL,
  },
});
