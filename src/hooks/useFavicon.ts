import { useEffect } from 'react';

// Import default favicons
import faviconLight from '@/design-system/assets/favicons/favicon.svg';
import faviconDark from '@/design-system/assets/favicons/favicon-dark.svg';

// Import tool icons - light mode
import abpLight from '@/design-system/assets/png/tool-icons/airline-business-planner-light.png';
import airlineSimulatorLight from '@/design-system/assets/png/tool-icons/airline-simulator-light.png';
import maintenanceLight from '@/design-system/assets/png/tool-icons/maintenance-light.png';
import economicsLight from '@/design-system/assets/png/tool-icons/economics-light.png';
import trajoptLight from '@/design-system/assets/png/tool-icons/trajopt-light.png';
import networkFamLight from '@/design-system/assets/png/tool-icons/network-fam-light.png';

// Import tool icons - dark mode
import abpDark from '@/design-system/assets/png/tool-icons/airline-business-planner-dark.png';
import airlineSimulatorDark from '@/design-system/assets/png/tool-icons/airline-simulator-dark.png';
import maintenanceDark from '@/design-system/assets/png/tool-icons/maintenance-dark.png';
import economicsDark from '@/design-system/assets/png/tool-icons/economics-dark.png';
import trajoptDark from '@/design-system/assets/png/tool-icons/trajopt-dark.png';
import networkFamDark from '@/design-system/assets/png/tool-icons/network-fam-dark.png';

type ToolIconName =
  | 'default'
  | 'airline-business-planner'
  | 'airline-simulator'
  | 'maintenance'
  | 'economics'
  | 'trajopt'
  | 'network-fam';

const TOOL_ICONS: Record<ToolIconName, { light: string; dark: string }> = {
  'default': { light: faviconLight, dark: faviconDark },
  'airline-business-planner': { light: abpLight, dark: abpDark },
  'airline-simulator': { light: airlineSimulatorLight, dark: airlineSimulatorDark },
  'maintenance': { light: maintenanceLight, dark: maintenanceDark },
  'economics': { light: economicsLight, dark: economicsDark },
  'trajopt': { light: trajoptLight, dark: trajoptDark },
  'network-fam': { light: networkFamLight, dark: networkFamDark },
};

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Hook to set favicon dynamically with light/dark mode support
 * @param tool - Tool name or 'default' for the platform favicon
 */
export function useFavicon(tool: ToolIconName = 'default') {
  useEffect(() => {
    const icons = TOOL_ICONS[tool] || TOOL_ICONS['default'];

    // Get initial color scheme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateFavicon = (isDark: boolean) => {
      setFavicon(isDark ? icons.dark : icons.light);
    };

    // Set initial favicon
    updateFavicon(mediaQuery.matches);

    // Listen for color scheme changes
    const handler = (e: MediaQueryListEvent) => updateFavicon(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [tool]);
}

export default useFavicon;
