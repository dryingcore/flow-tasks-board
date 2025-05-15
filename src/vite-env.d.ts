
/// <reference types="vite/client" />

// Garantindo que as propriedades de environment sejam reconhecidas
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
