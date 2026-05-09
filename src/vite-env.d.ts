/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOLF_COURSE_API_KEY: string;
  readonly VITE_GOLF_COURSE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
