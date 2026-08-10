import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  APP_SETTINGS_STORAGE_KEY,
  AppSettingsProvider,
  useAppSettings,
} from './app-settings-provider';

function SettingsProbe() {
  const { appearance, saveAppearance } = useAppSettings();

  return (
    <button
      type="button"
      onClick={() =>
        saveAppearance({
          theme: 'dark',
          density: 'medium',
          sidebarCollapsed: false,
        })
      }
    >
      {appearance.density}
    </button>
  );
}

describe('AppSettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--app-root-font-size');
  });

  it('loads and applies the persisted density', async () => {
    localStorage.setItem(
      APP_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        theme: 'dark',
        density: 'small',
        sidebarCollapsed: false,
      }),
    );

    render(
      <AppSettingsProvider>
        <SettingsProbe />
      </AppSettingsProvider>,
    );

    expect(screen.getByRole('button')).toHaveTextContent('small');
    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue('--app-root-font-size'),
      ).toBe('14.4px');
    });
  });

  it('persists and applies a new density when appearance is saved', async () => {
    render(
      <AppSettingsProvider>
        <SettingsProbe />
      </AppSettingsProvider>,
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(
        JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ''),
      ).toEqual({
        theme: 'dark',
        density: 'medium',
        sidebarCollapsed: false,
      });
      expect(
        document.documentElement.style.getPropertyValue('--app-root-font-size'),
      ).toBe('15.2px');
    });
  });
});
