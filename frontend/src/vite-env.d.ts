/// <reference types="vite/client" />

// Types for the environment variables that the app reads.
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
