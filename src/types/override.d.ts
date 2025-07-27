// src/types/env.d.ts (or override.d.ts)
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    // Add more required env vars here
  }
}
