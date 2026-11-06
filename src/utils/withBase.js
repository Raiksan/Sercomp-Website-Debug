// Prefixa caminhos internos com a base configurada no Vite.
// No GitHub Pages a base é "/Sercomp-Website-Debug/"; em desenvolvimento é "/".
const BASE_URL = import.meta.env.BASE_URL || "/";
const BASE = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

/** Base do deploy sem barra final (ex.: "/Sercomp-Website-Debug"); vazia em dev. */
export const BASE_PATH = BASE;

/**
 * Converte um caminho interno ("/contato") na URL correta considerando a base
 * do deploy. Links externos, âncoras e caminhos relativos passam sem alteração.
 */
export function withBase(path) {
  if (typeof path !== "string" || path.length === 0) return path;
  // Externo (https:, mailto:, //cdn...) ou âncora (#secao)
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  if (!BASE) return path;
  return path === "/" ? `${BASE}/` : `${BASE}${path}`;
}

export default withBase;
