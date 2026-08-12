import type { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/i18n-provider';
import { useAuthStore } from '@/stores/auth.store';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { configureApiAuth } from '@/lib/axios';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { AppSettingsProvider } from './app-settings-provider';

const { BASE_URL } = import.meta.env;

// Cấu hình trước khi render để request đầu tiên đã có thể đọc token.
configureApiAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});

/**
 * Gom toàn bộ provider của app vào một nơi. Thứ tự (ngoài → trong):
 * Error → Theme → AppSettings → i18n → Helmet → QueryClient → LoadingBar → Router → Toaster.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        storageKey="vite-theme"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <AppSettingsProvider>
          <I18nProvider>
            <HelmetProvider>
              <QueryClientProvider client={queryClient}>
                <LoadingBarContainer>
                  <BrowserRouter basename={BASE_URL}>
                    <Toaster />
                    {children}
                  </BrowserRouter>
                </LoadingBarContainer>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </HelmetProvider>
          </I18nProvider>
        </AppSettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
