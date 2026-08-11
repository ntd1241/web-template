import { describe, expect, it } from 'vitest';
import { buildAccountMenuModule } from './account-menu-builder';
import {
  accountMenuSpecSchema,
  type AccountMenuSpec,
} from './account-menu-spec';

const baseSpec = {
  componentName: 'GeneratedAccountMenuItems',
  groups: [
    {
      key: 'account',
      label: 'Tài khoản',
      items: [
        {
          kind: 'item',
          key: 'profile',
          label: 'Tài khoản',
          icon: 'UserRound',
          description: 'Thông tin cá nhân',
          badge: {
            text: '!',
            tooltip: 'Cần cập nhật thông tin tài khoản',
            variant: 'destructive',
          },
        },
        {
          kind: 'switch',
          key: 'notifications',
          label: 'Thông báo trên màn hình',
          icon: 'Bell',
          defaultChecked: true,
        },
        {
          kind: 'submenu',
          key: 'language',
          label: 'Ngôn ngữ',
          icon: 'Languages',
          valueMode: 'asset',
          defaultValue: 'vi',
          options: [
            {
              value: 'vi',
              label: 'Tiếng Việt',
              asset: '/media/flags/vietnam.svg',
            },
            { value: 'en', label: 'English' },
          ],
        },
        {
          kind: 'item',
          key: 'logout',
          label: 'Đăng xuất',
          icon: 'LogOut',
          destructive: true,
        },
      ],
    },
  ],
} satisfies AccountMenuSpec;

describe('account-menu-builder', () => {
  it('emits groups and the supported account-menu item variants', () => {
    const source = buildAccountMenuModule(baseSpec);

    expect(source).toContain('DropdownMenuGroup');
    expect(source).toContain('DropdownMenuLabel');
    expect(source).toContain('DropdownMenuItem');
    expect(source).toContain('DropdownMenuSub');
    expect(source).toContain('DropdownMenuRadioGroup');
    expect(source).toContain('DropdownMenuRadioItem');
    expect(source).toContain('Switch');
    expect(source).toContain('TooltipContent variant="destructive"');
    expect(source).toContain('variant="destructive"');
    expect(source).toContain('onSwitchChange');
    expect(source).toContain('onSubmenuChange');
    expect(source).toContain('toAbsoluteUrl');
  });

  it('rejects duplicate item keys', () => {
    expect(() =>
      accountMenuSpecSchema.parse({
        ...baseSpec,
        groups: [
          {
            ...baseSpec.groups[0],
            items: [baseSpec.groups[0].items[0], baseSpec.groups[0].items[0]],
          },
        ],
      }),
    ).toThrow(/item key bị trùng/);
  });

  it('rejects a submenu default that is not one of its options', () => {
    expect(() =>
      accountMenuSpecSchema.parse({
        ...baseSpec,
        groups: [
          {
            ...baseSpec.groups[0],
            items: [
              {
                ...baseSpec.groups[0].items[2],
                defaultValue: 'fr',
              },
            ],
          },
        ],
      }),
    ).toThrow(/defaultValue phải trùng/);
  });
});
