import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDebug } from "./DebugContext";
import {
  allRoutes,
  contentToggles,
  hiddenRoutes,
  orphanRoutes,
  routeStatusLabels,
} from "./debugRoutes";
import { withBase } from "../utils/withBase";
import styles from "./DebugPanel.module.css";

const TABS = [
  { id: "paginas", label: "Páginas" },
  { id: "conteudo", label: "Conteúdo oculto" },
  { id: "dom", label: "DOM" },
  { id: "info", label: "Info" },
];

const SKIPPED_TAGS = new Set([
  "script",
  "style",
  "link",
  "meta",
  "option",
  "optgroup",
  "source",
  "track",
  "template",
  "noscript",
  "br",
  "hr",
  "head",
  "html",
  "body",
]);

function isOwnUi(element) {
  return Boolean(element.closest?.("[data-debug-ui]"));
}

function hiddenReason(element) {
  if (element.hasAttribute("hidden")) return 'atributo hidden="true"';
  const computed = window.getComputedStyle(element);
  if (computed.display === "none") return "display: none";
  if (computed.visibility === "hidden") return "visibility: hidden";
  if (Number.parseFloat(computed.opacity) === 0) return "opacity: 0";
  if (element.getClientRects().length === 0) return "sem dimensões na tela";
  return null;
}

function elementLabel(element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classNames =
    typeof element.className === "string"
      ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 2)
      : [];
  const classes = classNames.length ? `.${classNames.join(".")}` : "";
  return `${tag}${id}${classes}`;
}

function elementPreview(element) {
  const ownText = (element.innerText || "").replace(/\s+/g, " ").trim();
  const fallback =
    element.getAttribute("alt") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("placeholder") ||
    element.getAttribute("src") ||
    "";
  return (ownText || fallback).slice(0, 110);
}

function elementPath(element) {
  const parts = [];
  let current = element;
  let depth = 0;
  while (current && current !== document.body && depth < 4) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === current.tagName
      );
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
    }
    parts.unshift(part);
    current = parent;
    depth += 1;
  }
  return parts.join(" > ");
}

function shouldInspect(element) {
  const tag = element.tagName.toLowerCase();
  if (SKIPPED_TAGS.has(tag)) return false;
  if (isOwnUi(element)) return false;
  if (element.id === "root") return false;

  // Só lista elementos que carregam algo visível: texto, imagem, mídia ou controle.
  const hasText = Boolean((element.innerText || "").trim());
  const hasVisual = Boolean(
    element.querySelector("img, svg, video, canvas, picture, input, select, textarea, button")
  );
  const isVisualItself = [
    "img",
    "svg",
    "video",
    "canvas",
    "picture",
    "input",
    "select",
    "textarea",
    "button",
    "a",
  ].includes(tag);
  return hasText || hasVisual || isVisualItself;
}

function DebugPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    settings,
    toggleSetting,
    revealAll,
    hideAll,
    resetSettings,
    revealedCount,
  } = useDebug();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("paginas");
  const [query, setQuery] = useState("");
  const [hiddenElements, setHiddenElements] = useState([]);
  const [scanNote, setScanNote] = useState("Abra a aba DOM para escanear a página atual.");
  const [copied, setCopied] = useState("");
  const originalStyles = useRef(new Map());

  const scanHiddenElements = useCallback(() => {
    const root = document.getElementById("root");
    if (!root) return [];
    const found = [];
    root.querySelectorAll("*").forEach((element) => {
      if (!shouldInspect(element)) return;
      const reason = hiddenReason(element);
      if (!reason) return;
      found.push({
        element,
        reason,
        label: elementLabel(element),
        path: elementPath(element),
        preview: elementPreview(element),
      });
    });
    setHiddenElements(found);
    setScanNote(
      found.length === 0
        ? "Nenhum elemento escondido por CSS/DOM foi encontrado nesta página. Use a aba Conteúdo oculto para os blocos comentados no código."
        : `${found.length} elemento(s) escondido(s) por CSS/DOM encontrados nesta página.`
    );
    return found;
  }, []);

  const revealElement = useCallback((element) => {
    if (!originalStyles.current.has(element)) {
      originalStyles.current.set(element, element.getAttribute("style"));
    }
    element.removeAttribute("hidden");
    element.style.setProperty("display", "block", "important");
    element.style.setProperty("visibility", "visible", "important");
    element.style.setProperty("opacity", "1", "important");
    element.style.setProperty("min-height", "1px", "important");
    element.style.setProperty("outline", "2px dashed #39ff14", "important");
    element.style.setProperty("outline-offset", "3px", "important");
    element.dataset.debugRevealed = "true";
  }, []);

  const revealOne = useCallback(
    (item) => {
      revealElement(item.element);
      scanHiddenElements();
    },
    [revealElement, scanHiddenElements]
  );

  const revealAllHidden = useCallback(() => {
    hiddenElements.forEach((item) => revealElement(item.element));
    setHiddenElements([]);
    setScanNote("Todos os elementos escaneados foram forçados a aparecer. Use “Restaurar” para voltar ao original.");
  }, [hiddenElements, revealElement]);

  const restoreAllHidden = useCallback(() => {
    originalStyles.current.forEach((style, element) => {
      if (style === null) {
        element.removeAttribute("style");
      } else {
        element.setAttribute("style", style);
      }
      delete element.dataset.debugRevealed;
    });
    originalStyles.current.clear();
    scanHiddenElements();
  }, [scanHiddenElements]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1" || window.location.hash === "#debug") {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open && tab === "dom") scanHiddenElements();
  }, [open, tab, location.pathname, scanHiddenElements]);

  const goToRoute = (path) => {
    setOpen(false);
    navigate(path);
  };

  const copyRoute = async (path) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(path);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("erro");
      window.setTimeout(() => setCopied(""), 1500);
    }
  };

  const filteredRoutes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return allRoutes;
    return allRoutes.filter(
      (route) =>
        route.path.toLowerCase().includes(normalized) ||
        route.title.toLowerCase().includes(normalized) ||
        routeStatusLabels[route.status].toLowerCase().includes(normalized)
    );
  }, [query]);

  const groupedToggles = useMemo(() => {
    return contentToggles.reduce((groups, toggle) => {
      if (!groups[toggle.group]) groups[toggle.group] = [];
      groups[toggle.group].push(toggle);
      return groups;
    }, {});
  }, []);

  const currentRouteHidden = [...hiddenRoutes, ...orphanRoutes].find(
    (route) => route.path === location.pathname
  );

  const renderStatus = (status) => (
    <span className={`${styles.status} ${styles[`status_${status}`]}`}>
      {routeStatusLabels[status]}
    </span>
  );

  return (
    <>
      <button
        type="button"
        data-debug-ui="true"
        className={`${styles.launcher} ${open ? styles.launcherActive : ""}`}
        onClick={() => setOpen((current) => !current)}
        title="Abrir painel de debug (Ctrl+Shift+D)"
      >
        <span className={styles.launcherBug} aria-hidden="true">
          🐞
        </span>
        DEBUG
        <span className={styles.launcherCount}>{revealedCount}</span>
      </button>

      {open && (
        <div
          data-debug-ui="true"
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Painel de debug do SERCOMP">
            <header className={styles.header}>
              <div>
                <p className={styles.kicker}>SERCOMP · MODO DEBUG</p>
                <h2 className={styles.title}>Todas as partes escondidas do site</h2>
                <p className={styles.subtitle}>
                  Rota atual: <code>{location.pathname}</code>
                  {currentRouteHidden ? (
                    <span className={styles.currentHint}> · página oculta/órfã</span>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Fechar painel de debug"
              >
                ✕
              </button>
            </header>

            <nav className={styles.tabs} aria-label="Seções do painel de debug">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.tab} ${tab === item.id ? styles.tabActive : ""}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  {item.id === "paginas" && (
                    <span className={styles.tabBadge}>{hiddenRoutes.length + orphanRoutes.length}</span>
                  )}
                  {item.id === "dom" && hiddenElements.length > 0 && (
                    <span className={styles.tabBadge}>{hiddenElements.length}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className={styles.body}>
              {tab === "paginas" && (
                <div className={styles.panel}>
                  <div className={styles.actionBar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Rotas escondidas, com aviso ou sem rota</h3>
                      <p className={styles.sectionText}>
                        Abra qualquer página diretamente. Rotas com etiqueta “Rota debug” só existem nesta cópia.
                      </p>
                    </div>
                    <a className={styles.ghostButton} href={`${withBase(location.pathname)}?debug=1`} target="_blank" rel="noreferrer">
                      Abrir com ?debug=1
                    </a>
                  </div>

                  <div className={styles.routeGrid}>
                    {[...hiddenRoutes, ...orphanRoutes].map((route) => (
                      <article key={route.path} className={styles.routeCard}>
                        <div className={styles.routeCardTop}>
                          <code className={styles.routePath}>{route.path}</code>
                          {renderStatus(route.status)}
                        </div>
                        <h4 className={styles.routeTitle}>{route.title}</h4>
                        <p className={styles.routeDescription}>{route.description}</p>
                        {route.original && (
                          <p className={styles.routeOrigin}>
                            Arquivo: <code>{route.original}</code>
                          </p>
                        )}
                        <div className={styles.routeActions}>
                          <button type="button" className={styles.primaryButton} onClick={() => goToRoute(route.path)}>
                            Abrir página
                          </button>
                          <button type="button" className={styles.copyButton} onClick={() => copyRoute(route.path)}>
                            {copied === route.path ? "Copiado!" : "Copiar rota"}
                          </button>
                          {route.revealKey && (
                            <button
                              type="button"
                              className={styles.revealButton}
                              onClick={() => toggleSetting(route.revealKey)}
                            >
                              {settings[route.revealKey] ? "Ocultar conteúdo" : "Revelar conteúdo"}
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.actionBar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Mapa completo de rotas</h3>
                      <p className={styles.sectionText}>
                        {allRoutes.length} rotas mapeadas — inclusive as internas e a 404.
                      </p>
                    </div>
                    <input
                      className={styles.search}
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Filtrar por rota, nome ou status…"
                    />
                  </div>

                  <div className={styles.routeTable}>
                    {filteredRoutes.map((route) => (
                      <div key={route.path} className={styles.routeRow}>
                        <code className={styles.routeRowPath}>{route.path}</code>
                        <span className={styles.routeRowTitle}>{route.title}</span>
                        {renderStatus(route.status)}
                        {!route.path.includes(":") && route.path !== "*" ? (
                          <button type="button" className={styles.rowOpen} onClick={() => goToRoute(route.path)}>
                            Abrir →
                          </button>
                        ) : (
                          <span className={styles.rowMuted}>sem link direto</span>
                        )}
                      </div>
                    ))}
                    {filteredRoutes.length === 0 && (
                      <p className={styles.empty}>Nenhuma rota encontrada para “{query}”.</p>
                    )}
                  </div>
                </div>
              )}

              {tab === "conteudo" && (
                <div className={styles.panel}>
                  <div className={styles.actionBar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Blocos comentados / removidos do código</h3>
                      <p className={styles.sectionText}>
                        Ative um interruptor e navegue até a página indicada. O conteúdo é renderizado como no código original.
                      </p>
                    </div>
                    <div className={styles.actionBarButtons}>
                      <button type="button" className={styles.primaryButton} onClick={revealAll}>
                        Revelar tudo
                      </button>
                      <button type="button" className={styles.ghostButton} onClick={hideAll}>
                        Ocultar tudo
                      </button>
                    </div>
                  </div>

                  <div className={styles.toggleGroups}>
                    {Object.entries(groupedToggles).map(([group, toggles]) => (
                      <section key={group} className={styles.toggleGroup}>
                        <h4 className={styles.groupTitle}>{group}</h4>
                        {toggles.map((toggle) => {
                          const enabled = Boolean(settings[toggle.key]);
                          return (
                            <div key={toggle.key} className={`${styles.toggleRow} ${enabled ? styles.toggleRowOn : ""}`}>
                              <div className={styles.toggleText}>
                                <div className={styles.toggleLabelRow}>
                                  <strong>{toggle.label}</strong>
                                  <code className={styles.toggleWhere}>{toggle.where}</code>
                                </div>
                                <p>{toggle.description}</p>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                aria-label={toggle.label}
                                className={`${styles.switch} ${enabled ? styles.switchOn : ""}`}
                                onClick={() => toggleSetting(toggle.key)}
                              >
                                <span className={styles.switchKnob} />
                              </button>
                            </div>
                          );
                        })}
                      </section>
                    ))}
                  </div>

                  <div className={styles.noteBox}>
                    <strong>Dica:</strong> os blocos revelados ficam com contorno verde tracejado quando
                    “Destacar tudo que foi revelado” está ligado. As preferências são salvas no localStorage.
                  </div>
                </div>
              )}

              {tab === "dom" && (
                <div className={styles.panel}>
                  <div className={styles.actionBar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Elementos escondidos no DOM</h3>
                      <p className={styles.sectionText}>
                        Procura elementos com <code>display:none</code>, <code>visibility:hidden</code>,{" "}
                        <code>opacity:0</code>, atributo <code>hidden</code> ou sem dimensões.
                      </p>
                    </div>
                    <div className={styles.actionBarButtons}>
                      <button type="button" className={styles.primaryButton} onClick={scanHiddenElements}>
                        Escanear página
                      </button>
                      <button
                        type="button"
                        className={styles.revealButton}
                        onClick={revealAllHidden}
                        disabled={hiddenElements.length === 0}
                      >
                        Revelar todos
                      </button>
                      <button type="button" className={styles.ghostButton} onClick={restoreAllHidden}>
                        Restaurar
                      </button>
                    </div>
                  </div>

                  <p className={styles.scanNote}>{scanNote}</p>

                  <div className={styles.domList}>
                    {hiddenElements.map((item, index) => (
                      <article key={`${item.path}-${index}`} className={styles.domItem}>
                        <div className={styles.domTop}>
                          <code className={styles.domLabel}>{item.label}</code>
                          <span className={styles.reason}>{item.reason}</span>
                          <button type="button" className={styles.rowOpen} onClick={() => revealOne(item)}>
                            Revelar
                          </button>
                        </div>
                        {item.preview && <p className={styles.domPreview}>“{item.preview}”</p>}
                        <p className={styles.domPath}>{item.path}</p>
                      </article>
                    ))}
                    {hiddenElements.length === 0 && (
                      <p className={styles.empty}>
                        Nada escondido por CSS/DOM nesta página. Experimente navegar para outra rota ou usar a aba
                        Conteúdo oculto.
                      </p>
                    )}
                  </div>

                  <div className={styles.noteBox}>
                    <strong>Atenção:</strong> revelar aqui força estilos inline e pode ser desfeito pelo React na
                    próxima renderização. Blocos removidos no código (comentados) não existem no DOM — use a aba
                    Conteúdo oculto para eles.
                  </div>
                </div>
              )}

              {tab === "info" && (
                <div className={styles.panel}>
                  <h3 className={styles.sectionTitle}>Ambiente e diagnóstico</h3>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <h4>Build</h4>
                      <dl className={styles.infoList}>
                        <div><dt>Modo</dt><dd>{import.meta.env.MODE}</dd></div>
                        <div><dt>Dev</dt><dd>{String(import.meta.env.DEV)}</dd></div>
                        <div><dt>VITE_API_URL</dt><dd>{import.meta.env.VITE_API_URL ? "definida" : "ausente"}</dd></div>
                        <div><dt>VITE_EVENTO_UUID</dt><dd>{import.meta.env.VITE_EVENTO_UUID ? "definida" : "ausente"}</dd></div>
                        <div><dt>Título</dt><dd>{document.title}</dd></div>
                      </dl>
                    </div>

                    <div className={styles.infoCard}>
                      <h4>Navegador</h4>
                      <dl className={styles.infoList}>
                        <div><dt>Viewport</dt><dd>{window.innerWidth} × {window.innerHeight}</dd></div>
                        <div><dt>DPR</dt><dd>{window.devicePixelRatio}</dd></div>
                        <div><dt>Idioma</dt><dd>{navigator.language}</dd></div>
                        <div><dt>Fuso</dt><dd>{Intl.DateTimeFormat().resolvedOptions().timeZone}</dd></div>
                        <div><dt>Agora</dt><dd>{new Date().toLocaleString("pt-BR")}</dd></div>
                      </dl>
                    </div>

                    <div className={styles.infoCard}>
                      <h4>Estado local</h4>
                      <dl className={styles.infoList}>
                        <div><dt>Rota</dt><dd><code>{location.pathname}</code></dd></div>
                        <div><dt>Carrinho</dt><dd>{countCartItems()} item(ns) em localStorage</dd></div>
                        <div><dt>Preferências</dt><dd>{revealedCount} bloco(s) revelado(s)</dd></div>
                        <div><dt>Elementos DOM ocultos</dt><dd>{hiddenElements.length}</dd></div>
                      </dl>
                    </div>

                    <div className={styles.infoCard}>
                      <h4>Atalhos e ações</h4>
                      <ul className={styles.shortcuts}>
                        <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> abre/fecha este painel</li>
                        <li><kbd>Esc</kbd> fecha o painel</li>
                        <li><code>?debug=1</code> abre automaticamente</li>
                        <li><code>#debug</code> também abre automaticamente</li>
                      </ul>
                      <div className={styles.infoActions}>
                        <button type="button" className={styles.ghostButton} onClick={resetSettings}>
                          Limpar preferências debug
                        </button>
                        <button type="button" className={styles.ghostButton} onClick={resetCart}>
                          Resetar carrinho
                        </button>
                        <button type="button" className={styles.ghostButton} onClick={() => window.location.reload()}>
                          Recarregar página
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.noteBox}>
                    Esta é uma <strong>cópia de debug</strong> do site do SERCOMP. Nenhuma alteração foi feita no
                    projeto original em <code>Sercomp-Website</code>. Compare os dois lado a lado para validar o que
                    estava escondido.
                  </div>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <span className={styles.footerDot} />
              <span>Debug build · {revealedCount} bloco(s) revelado(s)</span>
              <span className={styles.footerSpacer} />
              <span className={styles.footerHint}>Ctrl+Shift+D para abrir/fechar</span>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function countCartItems() {
  try {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    if (!Array.isArray(products)) return 0;
    return products.reduce((total, product) => total + (product.quantity || 0), 0);
  } catch {
    return 0;
  }
}

function resetCart() {
  try {
    localStorage.removeItem("products");
    window.location.reload();
  } catch {
    window.location.reload();
  }
}

export default DebugPanel;
