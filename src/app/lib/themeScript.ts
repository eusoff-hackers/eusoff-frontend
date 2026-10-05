export const THEME_KEY = "eusoff-theme";

/**
 * Inlined into <head> so data-theme is set before first paint (no flash).
 * Light is the default for everyone; only an explicit choice switches to dark.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.dataset.theme=t==="dark"?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`;
