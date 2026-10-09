import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import env from "@/env";
import * as schema from "./schemas";

const sql = neon(env.POSTGRES_URL);

export const db = drizzle(sql, { schema });
