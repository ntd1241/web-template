import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getStorageItem, setStorageItem } from '@/lib/storage';

export const APP_SETTINGS_STORAGE_KEY = 'app-settings';

export const APP_DENSITY_SCALES = {
  small: 0.9,
  medium: 0.95,
  large: 1,
} as const;

export type AppTheme = 'system' | 'light' | 'dark';
export type AppDensity = keyof typeof APP_DENSITY_SCALES;

export type AppAppearanceSettings = {
  theme: AppTheme;
  density: AppDensity;
  sidebarCollapsed: boolean;
  autoCollapseSidebarOnDetail: boolean;
};

type AppSettingsContextValue = {
  appearance: AppAppearanceSettings;
  saveAppearance: (appearance: AppAppearanceSettings) => void;
};

const defaultAppearance: AppAppearanceSettings = {
  theme: 'system',
  density: 'large',
  sidebarCollapsed: false,
  autoCollapseSidebarOnDetail: true,
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function isAppTheme(value: unknown): value is AppTheme {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isAppDensity(value: unknown): value is AppDensity {
  return value === 'small' || value === 'medium' || value === 'large';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function readAppearanceSettings(): AppAppearanceSettings {
  const stored = getStorageItem<Partial<AppAppearanceSettings>>(
    APP_SETTINGS_STORAGE_KEY,
  );

  return {
    theme: isAppTheme(stored?.theme) ? stored.theme : defaultAppearance.theme,
    density: isAppDensity(stored?.density)
      ? stored.density
      : defaultAppearance.density,
    sidebarCollapsed: isBoolean(stored?.sidebarCollapsed)
      ? stored.sidebarCollapsed
      : defaultAppearance.sidebarCollapsed,
    autoCollapseSidebarOnDetail: isBoolean(stored?.autoCollapseSidebarOnDetail)
      ? stored.autoCollapseSidebarOnDetail
      : defaultAppearance.autoCollapseSidebarOnDetail,
  };
}

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState(readAppearanceSettings);

  useEffect(() => {
    const root = document.documentElement;
    const rootFontSize = 16 * APP_DENSITY_SCALES[appearance.density];

    root.style.setProperty('--app-root-font-size', `${rootFontSize}px`);
  }, [appearance.density]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      appearance,
      saveAppearance: (nextAppearance) => {
        setAppearance(nextAppearance);
        setStorageItem(APP_SETTINGS_STORAGE_KEY, nextAppearance);
      },
    }),
    [appearance],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }

  return context;
}
