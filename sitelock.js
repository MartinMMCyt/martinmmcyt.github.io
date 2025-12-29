/* Made by Martin_MMC */
(() => {
    "use strict";

    /* =========================
       BLOCKED DOMAINS → REDIRECTS
    ========================== */
    const BLOCKED_DOMAINS = {
        "geometrylite.io": "dashmetry.github.io",
        "geometrylitegame.io": "dashmetry.github.io",
        "geometrydashlite.io": "dashmetry.github.io",
        "geometrydashlite.online": "dashmetry.github.io",
        "geometrydashsubzero.io": "dashmetry.github.io",
        "geometrydashmeltdown.io": "dashmetry.github.io",
        "geometrydashbloodbath.io": "dashmetry.github.io",
        "geometrydashs.io": "dashmetry.github.io",
        "dashmetry.io": "dashmetry.github.io",

        "1games.io": "dashmetry.github.io",
        "poki.com": "dashmetry.github.io",
        "hillclimb-racing.com": "dashmetry.github.io",
        "hacker-114.github.io": "dashmetry.github.io",
        "evergreenps.github.io": "dashmetry.github.io",
        "orson-sanders.github.io": "dashmetry.github.io",

        "2playergames.gitlab.io": "dc.gg/martin",
        "ubg6.gitlab.io": "dc.gg/martin",
        "ubg98.github.io": "dc.gg/martin",
        "dressupgames.gitlab.io": "dc.gg/martin",
        "dc.gg": "dc.gg/martin",
        "discord.com": "dc.gg/martin",
        "discord.gg": "dc.gg/martin"
    };

    /* =========================
       URL CHECK HELPER
    ========================== */
    function checkRedirect(url) {
        if (typeof url !== "string") return null;
        try {
            const hostname = new URL(url, location.href).hostname;
            return BLOCKED_DOMAINS[hostname] || null;
        } catch {
            return null;
        }
    }

    /* =========================
       IFRAME POPUP BYPASS BLOCK
    ========================== */
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = function(tagName, ...args) {
        const element = originalCreateElement(tagName, ...args);

        if (String(tagName).toLowerCase() === "iframe") {
            try {
                const originalOpen = element.contentWindow?.open;
                if (originalOpen) {
                    element.contentWindow.open = function() {
                        console.warn("Blocked iframe-based popup.");
                        return null;
                    };
                }
            } catch {}
        }

        return element;
    };

    /* =========================
       window.open PROTECTION
    ========================== */
    const originalWindowOpen = window.open.bind(window);

    window.open = function(url, ...args) {
        const redirect = checkRedirect(url);

        if (window.frameElement) {
            console.warn("Blocked popup from iframe context.");
            return null;
        }

        return originalWindowOpen(redirect || url, ...args);
    };

    /* =========================
       Unity Application.OpenURL
    ========================== */
    if (window.Application && typeof window.Application.OpenURL === "function") {
        const originalAppOpen = window.Application.OpenURL.bind(window.Application);

        window.Application.OpenURL = function(url) {
            const redirect = checkRedirect(url);
            return originalAppOpen(redirect || url);
        };
    }

    /* =========================
       location.assign / replace
    ========================== */
    const originalAssign = window.location.assign.bind(window.location);
    const originalReplace = window.location.replace.bind(window.location);

    window.location.assign = function(url) {
        const redirect = checkRedirect(url);
        return originalAssign(redirect || url);
    };

    window.location.replace = function(url) {
        const redirect = checkRedirect(url);
        return originalReplace(redirect || url);
    };

    /* =========================
       location.href SETTER (SAFE)
    ========================== */
    try {
        const proto = Object.getPrototypeOf(window.location);
        const desc = Object.getOwnPropertyDescriptor(proto, "href");

        if (desc && desc.configurable) {
            Object.defineProperty(proto, "href", {
                get: desc.get,
                set(url) {
                    const redirect = checkRedirect(url);
                    originalAssign(redirect || url);
                }
            });
        }
    } catch {}

    /* =========================
       <a> CLICK INTERCEPTION
    ========================== */
    document.addEventListener("click", (event) => {
        const link = event.target.closest?.("a[href]");
        if (!link) return;

        const redirect = checkRedirect(link.href);
        if (!redirect) return;

        event.preventDefault();
        window.location.assign(redirect);
    });

    /* =========================
       META REFRESH BLOCKING
    ========================== */
    document
        .querySelectorAll('meta[http-equiv="refresh"]')
        .forEach((meta) => {
            const content = meta.getAttribute("content") || "";
            const match = content.match(/url\s*=\s*([^;]+)/i);
            if (!match) return;

            const redirect = checkRedirect(match[1].trim());
            if (redirect) {
                meta.setAttribute("content", `0; url=${redirect}`);
            }
        });

    /* =========================
       window.navigate BLOCKER
    ========================== */
    if (typeof window.navigate === "function") {
        const originalNavigate = window.navigate.bind(window);

        window.navigate = function(url) {
            const redirect = checkRedirect(url);
            return originalNavigate(redirect || url);
        };
    }
})();
