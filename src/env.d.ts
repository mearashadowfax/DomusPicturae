/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Endpoint the newsletter form posts to; demo mode when unset. */
  readonly PUBLIC_FORM_NEWSLETTER?: string;
  /** Endpoint the workshop registration form posts to; demo mode when unset. */
  readonly PUBLIC_FORM_WORKSHOP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
