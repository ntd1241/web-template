import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { loadCurrentTenantSettings } from '@/project/api/tenant-settings.api';
import {
  DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY,
  DEFAULT_NUMBER_FORMAT_CURRENCY_CODE,
  DEFAULT_NUMBER_FORMAT_LOCALE,
  getCompactDisplay,
  getNumberLocale,
} from '@/project/model/tenant-settings';
import { useQuery } from '@tanstack/react-query';
import {
  createNumberFormatters,
  type NumberFormatSettings,
  type NumberFormatters,
} from '@/lib/format';
import { useTenant } from './tenant-provider';
import { useUser } from './user-provider';

export interface NumberFormatContextValue extends NumberFormatters {
  currencyCode: string;
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
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const tenantSettingsQuery = useQuery({
    queryKey: ['project', 'tenant-settings', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadCurrentTenantSettings(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId && !settingsOverride),
    staleTime: 5 * 60 * 1000,
  });

  const settings = useMemo<NumberFormatSettings>(() => {
    if (settingsOverride) return settingsOverride;

    const rawSettings = tenantSettingsQuery.data?.settings;
    return {
      locale: getNumberLocale(rawSettings) ?? DEFAULT_NUMBER_FORMAT_LOCALE,
      currencyCode:
        tenantSettingsQuery.data?.values.currencyCode ??
        DEFAULT_NUMBER_FORMAT_CURRENCY_CODE,
      compactDisplay:
        getCompactDisplay(rawSettings) ?? DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY,
    };
  }, [
    settingsOverride,
    tenantSettingsQuery.data?.settings,
    tenantSettingsQuery.data?.values.currencyCode,
  ]);

  const formatters = useMemo(
    () => createNumberFormatters(settings),
    [settings],
  );

  const value = useMemo<NumberFormatContextValue>(
    () => ({
      ...formatters,
      currencyCode: settings.currencyCode,
      isLoading: !settingsOverride && tenantSettingsQuery.isPending,
      isError: !settingsOverride && tenantSettingsQuery.isError,
    }),
    [
      formatters,
      settings.currencyCode,
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
    currencyCode: fallbackFormatters.settings.currencyCode,
    isLoading: false,
    isError: false,
  };
}
