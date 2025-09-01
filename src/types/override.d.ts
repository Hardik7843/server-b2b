// src/types/env.d.ts (or override.d.ts)
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    PORT: string;
    BLOB_READ_WRITE_TOKEN: string;
    CLIENT_URL: string;
    ENVIRONMENT: string;
    // Add more required env vars here
  }
}
