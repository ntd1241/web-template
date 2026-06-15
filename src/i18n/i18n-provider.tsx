import { useState, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { env } from '@/config/env';
import { DEFAULT_LOCALE, messagesByLocale, type Locale } from './config';

/**
 * Bọc app bằng react-intl. Hiện chỉ giữ locale ở state cục bộ; khi cần đổi
 * ngôn ngữ runtime, nâng `locale` lên ui.store và đọc từ đó.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale] = useState<Locale>(env.defaultLocale ?? DEFAULT_LOCALE);

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messagesByLocale[locale]}
    >
      {children}
    </IntlProvider>
  );
}
