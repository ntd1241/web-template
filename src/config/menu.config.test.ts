import { ROUTES } from '@/constants/routes';
import { describe, expect, it } from 'vitest';
import { MENU_GROUPS, resolveMenuTarget } from './menu.config';

function visibleMenuPaths(): string[] {
  return MENU_GROUPS.flatMap((group) =>
    group.items
      .map((item) => resolveMenuTarget(item, false)?.to)
      .filter((path): path is string => Boolean(path)),
  );
}

describe('MENU_GROUPS', () => {
  it('hiển thị các trang quản lý material catalog trong sidebar', () => {
    expect(visibleMenuPaths()).toEqual(
      expect.arrayContaining([
        ROUTES.EXAMPLE.MATERIALS,
        ROUTES.EXAMPLE.MATERIAL_GROUPS,
        ROUTES.EXAMPLE.MATERIAL_SPECS,
        ROUTES.EXAMPLE.MATERIAL_MODELS,
      ]),
    );
  });
});
