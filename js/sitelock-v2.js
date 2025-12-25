(() => {
      const originalWindowOpen = window.open;
      const blockedDomainsMap = {
        'geometrylite.io': 'https://sites.google.com/view/geometry-dash-games/explore',
        'geometrydashlite.io': 'https://sites.google.com/view/geometry-dash-games/explore',
        '1games.io': 'https://sites.google.com/view/geometry-dash-games/explore',
        'dashmetry.io': 'https://sites.google.com/view/geometry-dash-games/explore',
        'geometrydashlite.online': 'https://sites.google.com/view/geometry-dash-games/explore',
        'discord.gg': 'https://dc.gg/martin'
      };

      window.open = function (url, ...args) {
        try {
          const domain = new URL(url).hostname;
          if (blockedDomainsMap[domain]) {
            return originalWindowOpen.call(window, blockedDomainsMap[domain], ...args);
          }
        } catch {}
        return originalWindowOpen.call(window, url, ...args);
      };

      if (window.Application?.OpenURL) {
        const originalOpenURL = window.Application.OpenURL;
        window.Application.OpenURL = function (url) {
          try {
            const domain = new URL(url).hostname;
            if (blockedDomainsMap[domain]) {
              return originalOpenURL.call(window.Application, blockedDomainsMap[domain]);
            }
          } catch {}
          return originalOpenURL.call(window.Application, url);
        };
      }
    })();
