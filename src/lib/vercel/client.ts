import "server-only";

import { captureServerError } from "@/app/shared/helpers/capture-server-error";
import env from "@/env";

const VERCEL_API_URL = "https://api.vercel.com";

type QueryValue = string | number | boolean | undefined;

export async function vercelFetch<T>(
  pathname: string,
  query: Record<string, QueryValue> = {},
): Promise<T> {
  try {
    const token = env.VERCEL_TOKEN;
    const projectId = env.VERCEL_PROJECT_ID;
    const teamId = env.VERCEL_TEAM_ID;
    if (!token) {
      throw new Error("Missing VERCEL_TOKEN");
    }
    if (!projectId) {
      throw new Error("Missing VERCEL_PROJECT_ID");
    }
    const url = new URL(pathname, VERCEL_API_URL);
    url.searchParams.set("projectId", projectId);
    if (teamId) {
      url.searchParams.set("teamId", teamId);
    }
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Vercel API error: ${response.status} ${response.statusText} - ${body}`,
      );
    }
    return response.json() as Promise<T>;
  } catch (error) {
    captureServerError("Error fetching Vercel API:", error);
    throw error;
  }
}
