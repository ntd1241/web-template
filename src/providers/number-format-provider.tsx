import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { loadCurrentTenantSettings } from '@/project/api/tenant-settings.api';
import {
  DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY,
  DEFAULT_NUMBER_FORMAT_CURRENCY_CODE,
  DEFAULT_NUMBER_FORMAT_LOCALE,
  getCompactDisplay,
  getCurrencyCode,
  getNumberLocale,
} from '@/project/model/tenant-settings';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import {
  createNumberFormatters,
  type NumberFormatSettings,
  type NumberFormatters,
} from '@/lib/format';

export interface NumberFormatContextValue extends NumberFormatters {
  isLoading: boolean;
  isError: boolean;
}

interface NumberFormatProviderProps {
  children: ReactNode;
  settings?: NumberFormatSettings;
}

const NumberFormatContext = createContext<NumberFormatContextValue | null>(
  null,
);

const fallbackFormatters = createNumberFormatters();

export function NumberFormatProvider({
  children,
  settings: settingsOverride,
}: NumberFormatProviderProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const tenantSettingsQuery = useQuery({
    queryKey: ['project', 'tenant-settings', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadCurrentTenantSettings(userId);
    },
    enabled: Boolean(userId && !settingsOverride),
    staleTime: 5 * 60 * 1000,
  });

  const settings = useMemo<NumberFormatSettings>(() => {
    if (settingsOverride) return settingsOverride;

    const rawSettings = tenantSettingsQuery.data?.settings;
    return {
      locale: getNumberLocale(rawSettings) ?? DEFAULT_NUMBER_FORMAT_LOCALE,
      currencyCode:
        getCurrencyCode(rawSettings) ?? DEFAULT_NUMBER_FORMAT_CURRENCY_CODE,
      compactDisplay:
        getCompactDisplay(rawSettings) ?? DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY,
    };
  }, [settingsOverride, tenantSettingsQuery.data?.settings]);

  const formatters = useMemo(
    () => createNumberFormatters(settings),
    [settings],
  );

  const value = useMemo<NumberFormatContextValue>(
    () => ({
      ...formatters,
      isLoading: !settingsOverride && tenantSettingsQuery.isPending,
      isError: !settingsOverride && tenantSettingsQuery.isError,
    }),
    [
      formatters,
      settingsOverride,
      tenantSettingsQuery.isError,
      tenantSettingsQuery.isPending,
    ],
  );

  return (
    <NumberFormatContext.Provider value={value}>
      {children}
    </NumberFormatContext.Provider>
  );
}

export function useNumberFormat(): NumberFormatContextValue {
  const context = useContext(NumberFormatContext);
  if (context) return context;

  return {
    ...fallbackFormatters,
    isLoading: false,
    isError: false,
  };
}
