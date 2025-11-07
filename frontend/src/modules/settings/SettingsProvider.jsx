import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'clinica-preferences-v1';

const THEME_PRESETS = [
  {
    id: 'neon-night',
    name: 'Noite Neon',
    description: 'Visual original com contraste alto e destaque em ciano.',
    cssVars: {
      '--app-bg': 'linear-gradient(135deg, #171821 0%, #0A0B10 100%)',
      '--app-bg-solid': '#0A0B10',
      '--text-color': '#E5E7EB',
      '--text-muted': '#9CA3AF',
      '--texture-line': 'rgba(255, 255, 255, 0.03)',
      '--texture-mask': 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 30%, transparent 70%)',
      '--sidebar-bg': '#171821',
      '--sidebar-text': '#C7CDD5',
      '--sidebar-hover-bg': 'rgba(125, 237, 222, 0.08)',
      '--sidebar-hover-text': '#FFFFFF',
      '--sidebar-active-bg': '#7DEDDE',
      '--sidebar-active-text': '#10121b',
      '--sidebar-border': 'rgba(192, 192, 192, 0.25)',
      '--logo-filter': 'brightness(1)',
      '--card-bg': '#21222d',
      '--card-border': 'rgba(192, 192, 192, 0.2)',
      '--card-border-strong': '#7DEDDE',
      '--card-shadow': '0 20px 45px rgba(0, 0, 0, 0.35)',
      '--card-shadow-hover': '0 28px 65px rgba(0, 0, 0, 0.45)',
      '--input-bg': 'rgba(31, 33, 48, 0.6)',
      '--input-bg-hover': 'rgba(31, 33, 48, 0.75)',
      '--input-bg-focus': 'rgba(31, 33, 48, 0.8)',
      '--input-border': '#4B5563',
      '--input-border-hover': '#6B7280',
      '--input-border-focus': '#3B82F6',
      '--input-ring': 'rgba(59, 130, 246, 0.45)',
      '--accent': '#7DEDDE',
      '--accent-strong': '#22D3EE',
      '--accent-contrast': '#081019',
      '--surface-tile': 'rgba(17, 18, 28, 0.82)',
      '--surface-tile-border': 'rgba(125, 237, 222, 0.25)',
      '--surface-press': 'rgba(125, 237, 222, 0.08)',
    },
  },
  {
    id: 'nude-glow',
    name: 'Nude Suave',
    description: 'Paleta clara em tons terrosos suaves e destaques rosé.',
    cssVars: {
      '--app-bg': 'linear-gradient(135deg, #F7E9DC 0%, #F3D8C2 100%)',
      '--app-bg-solid': '#F5E6D6',
      '--text-color': '#3D2B1F',
      '--text-muted': '#876F5A',
      '--texture-line': 'rgba(61, 43, 31, 0.05)',
      '--texture-mask': 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.7) 45%, transparent 80%)',
      '--sidebar-bg': 'rgba(255, 255, 255, 0.85)',
      '--sidebar-text': '#5A4434',
      '--sidebar-hover-bg': 'rgba(208, 132, 106, 0.14)',
      '--sidebar-hover-text': '#3D2B1F',
      '--sidebar-active-bg': 'rgba(221, 153, 125, 0.9)',
      '--sidebar-active-text': '#FFFFFF',
      '--sidebar-border': 'rgba(199, 162, 138, 0.5)',
      '--logo-filter': 'brightness(0.85)',
      '--card-bg': 'rgba(255, 255, 255, 0.78)',
      '--card-border': 'rgba(210, 180, 140, 0.45)',
      '--card-border-strong': '#D79573',
      '--card-shadow': '0 24px 42px rgba(140, 95, 70, 0.18)',
      '--card-shadow-hover': '0 30px 65px rgba(140, 95, 70, 0.26)',
      '--input-bg': 'rgba(255, 255, 255, 0.85)',
      '--input-bg-hover': 'rgba(255, 255, 255, 0.92)',
      '--input-bg-focus': '#FFFFFF',
      '--input-border': 'rgba(199, 162, 138, 0.6)',
      '--input-border-hover': 'rgba(199, 162, 138, 0.8)',
      '--input-border-focus': '#D79573',
      '--input-ring': 'rgba(215, 149, 115, 0.35)',
      '--accent': '#D79573',
      '--accent-strong': '#BC6B56',
      '--accent-contrast': '#3D2B1F',
      '--surface-tile': 'rgba(255, 255, 255, 0.86)',
      '--surface-tile-border': 'rgba(199, 162, 138, 0.55)',
      '--surface-press': 'rgba(221, 153, 125, 0.18)',
    },
  },
  {
    id: 'aurum',
    name: 'Preto & Dourado',
    description: 'Tema sofisticado com ouro queimado e base grafite.',
    cssVars: {
      '--app-bg': 'linear-gradient(135deg, #0B0B0E 0%, #1A1310 100%)',
      '--app-bg-solid': '#121015',
      '--text-color': '#F5E6C8',
      '--text-muted': '#C9B289',
      '--texture-line': 'rgba(255, 215, 0, 0.06)',
      '--texture-mask': 'radial-gradient(circle at center, rgba(0, 0, 0, 0.75) 40%, transparent 85%)',
      '--sidebar-bg': 'rgba(12, 11, 14, 0.85)',
      '--sidebar-text': '#E5D2A5',
      '--sidebar-hover-bg': 'rgba(201, 178, 137, 0.2)',
      '--sidebar-hover-text': '#F8EFD0',
      '--sidebar-active-bg': 'linear-gradient(135deg, #B8892D 0%, #F2D06B 100%)',
      '--sidebar-active-text': '#0C0B0E',
      '--sidebar-border': 'rgba(201, 178, 137, 0.35)',
      '--logo-filter': 'brightness(1.3)',
      '--card-bg': 'rgba(18, 16, 21, 0.82)',
      '--card-border': 'rgba(220, 180, 90, 0.35)',
      '--card-border-strong': '#F2D06B',
      '--card-shadow': '0 26px 55px rgba(0, 0, 0, 0.55)',
      '--card-shadow-hover': '0 35px 75px rgba(0, 0, 0, 0.65)',
      '--input-bg': 'rgba(28, 24, 31, 0.82)',
      '--input-bg-hover': 'rgba(28, 24, 31, 0.9)',
      '--input-bg-focus': 'rgba(28, 24, 31, 0.95)',
      '--input-border': 'rgba(201, 178, 137, 0.45)',
      '--input-border-hover': 'rgba(201, 178, 137, 0.7)',
      '--input-border-focus': '#F2D06B',
      '--input-ring': 'rgba(242, 208, 107, 0.45)',
      '--accent': '#F2D06B',
      '--accent-strong': '#F2B84B',
      '--accent-contrast': '#0C0B0E',
      '--surface-tile': 'rgba(22, 18, 24, 0.88)',
      '--surface-tile-border': 'rgba(201, 178, 137, 0.45)',
      '--surface-press': 'rgba(201, 178, 137, 0.22)',
    },
  },
  {
    id: 'mint-fresh',
    name: 'Branco & Verde Mint',
    description: 'Tema claro com branco luminoso e detalhes em verde menta.',
    cssVars: {
      '--app-bg': 'linear-gradient(135deg, #F8FFFD 0%, #E4F8F2 100%)',
      '--app-bg-solid': '#EFFBF6',
      '--text-color': '#1D3B36',
      '--text-muted': '#5A7A72',
      '--texture-line': 'rgba(32, 77, 68, 0.05)',
      '--texture-mask': 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.75) 50%, transparent 85%)',
      '--sidebar-bg': 'rgba(255, 255, 255, 0.88)',
      '--sidebar-text': '#285045',
      '--sidebar-hover-bg': 'rgba(75, 190, 160, 0.14)',
      '--sidebar-hover-text': '#1D3B36',
      '--sidebar-active-bg': 'linear-gradient(135deg, #B4F0D4 0%, #78D7B6 100%)',
      '--sidebar-active-text': '#104036',
      '--sidebar-border': 'rgba(120, 215, 182, 0.4)',
      '--logo-filter': 'brightness(0.9)',
      '--card-bg': 'rgba(255, 255, 255, 0.82)',
      '--card-border': 'rgba(120, 215, 182, 0.45)',
      '--card-border-strong': '#4BBEA0',
      '--card-shadow': '0 20px 40px rgba(70, 140, 120, 0.18)',
      '--card-shadow-hover': '0 30px 65px rgba(70, 140, 120, 0.26)',
      '--input-bg': 'rgba(255, 255, 255, 0.9)',
      '--input-bg-hover': '#FFFFFF',
      '--input-bg-focus': '#FFFFFF',
      '--input-border': 'rgba(120, 215, 182, 0.55)',
      '--input-border-hover': 'rgba(120, 215, 182, 0.75)',
      '--input-border-focus': '#4BBEA0',
      '--input-ring': 'rgba(75, 190, 160, 0.35)',
      '--accent': '#4BBEA0',
      '--accent-strong': '#1BA17A',
      '--accent-contrast': '#0B2F26',
      '--surface-tile': 'rgba(255, 255, 255, 0.88)',
      '--surface-tile-border': 'rgba(120, 215, 182, 0.45)',
      '--surface-press': 'rgba(120, 215, 182, 0.18)',
    },
  },
];

const THEME_LOOKUP = THEME_PRESETS.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

const FONT_OPTIONS = [
  {
    id: 'inter',
    name: 'Inter',
    stack: "'Inter', 'Segoe UI', Roboto, sans-serif",
    preview: 'Alta legibilidade para telas.',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    stack: "'Montserrat', 'Segoe UI', Roboto, sans-serif",
    preview: 'Títulos marcantes e modernos.',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    stack: "'Poppins', 'Segoe UI', Roboto, sans-serif",
    preview: 'Curvas suaves, sensação leve.',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    stack: "'Playfair Display', 'Georgia', serif",
    preview: 'Toque editorial com serifas elegantes.',
  },
];

const FONT_LOOKUP = FONT_OPTIONS.reduce((acc, font) => {
  acc[font.id] = font;
  return acc;
}, {});

const DEFAULT_PREFERENCES = {
  theme: 'neon-night',
  font: 'inter',
  showTexture: true,
  animations: true,
  compactSpacing: false,
};

const SettingsContext = createContext(undefined);

const readStoredPreferences = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.warn('[settings] Falha ao ler preferências salvas:', error);
    return DEFAULT_PREFERENCES;
  }
};

const applyTheme = (themeId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const definition = THEME_LOOKUP[themeId] ?? THEME_LOOKUP[DEFAULT_PREFERENCES.theme];
  document.documentElement.setAttribute('data-theme', definition.id);
  Object.entries(definition.cssVars).forEach(([token, value]) => {
    document.documentElement.style.setProperty(token, value);
  });
};

const applyFont = (fontId) => {
  if (typeof document === 'undefined') {
    return;
  }

  const font = FONT_LOOKUP[fontId] ?? FONT_LOOKUP[DEFAULT_PREFERENCES.font];
  document.documentElement.style.setProperty('--font-family', font.stack);
  document.documentElement.style.setProperty('--heading-font', font.stack);
};

const applyStructuralPreferences = (prefs) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('animations-off', !prefs.animations);
  document.documentElement.classList.toggle('compact-mode', prefs.compactSpacing);
};

export function SettingsProvider({ children }) {
  const [preferences, setPreferences] = useState(() => readStoredPreferences());

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    applyFont(preferences.font);
  }, [preferences.font]);

  useEffect(() => {
    applyStructuralPreferences(preferences);
  }, [preferences.animations, preferences.compactSpacing]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const resetPreferences = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES });
  }, []);

  const value = useMemo(
    () => ({
      preferences,
      themeOptions: THEME_PRESETS,
      fontOptions: FONT_OPTIONS,
      setTheme: (themeId) => updatePreference('theme', themeId),
      setFont: (fontId) => updatePreference('font', fontId),
      setShowTexture: (enabled) => updatePreference('showTexture', enabled),
      setAnimations: (enabled) => updatePreference('animations', enabled),
      setCompactSpacing: (enabled) => updatePreference('compactSpacing', enabled),
      resetPreferences,
    }),
    [preferences, resetPreferences],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider');
  }

  return context;
};

export const settingsCatalog = {
  themes: THEME_PRESETS,
  fonts: FONT_OPTIONS,
};
