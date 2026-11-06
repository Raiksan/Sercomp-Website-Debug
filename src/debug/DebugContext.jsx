import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "sercomp-debug-settings";

/**
 * Cada chave liga/desliga uma parte do site que está escondida no código
 * (comentada, removida do menu ou substituída por um aviso).
 */
export const defaultDebugSettings = {
  revealHiddenNav: false,
  revealOrganization: false,
  revealPartnerLogos: false,
  revealCommitteeInfo: false,
  revealIdeathonCard: false,
  reveal2024RoundTable: false,
  reveal2024Articles: false,
  highlightRevealed: true,
};

const DebugContext = createContext(null);

function readStoredSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDebugSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultDebugSettings, ...parsed };
  } catch {
    return defaultDebugSettings;
  }
}

export function DebugProvider({ children }) {
  const [settings, setSettings] = useState(readStoredSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem persistir.
    }
  }, [settings]);

  const setSetting = useCallback((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const revealAll = useCallback(() => {
    setSettings((current) => {
      const next = { ...current };
      Object.keys(defaultDebugSettings).forEach((key) => {
        next[key] = true;
      });
      return next;
    });
  }, []);

  const hideAll = useCallback(() => {
    setSettings((current) => {
      const next = { ...current };
      Object.keys(defaultDebugSettings).forEach((key) => {
        next[key] = false;
      });
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultDebugSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, []);

  const revealedCount = useMemo(
    () => Object.entries(settings).filter(([key, value]) => key !== "highlightRevealed" && value).length,
    [settings]
  );

  const value = useMemo(
    () => ({
      settings,
      setSetting,
      toggleSetting,
      revealAll,
      hideAll,
      resetSettings,
      revealedCount,
    }),
    [settings, setSetting, toggleSetting, revealAll, hideAll, resetSettings, revealedCount]
  );

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

DebugProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebug deve ser usado dentro de <DebugProvider>");
  }
  return context;
}

export { STORAGE_KEY };
export default DebugContext;
