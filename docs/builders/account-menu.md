# Account menu builder

The account-menu builder scaffolds the content inside a user/account
`DropdownMenuContent`. It covers the menu patterns used by the main layout:

- groups with optional labels;
- regular and destructive items;
- items with a secondary description or badge tooltip;
- switch items;
- submenus with a selected value, language flag, or radio options.

```bash
npm run gen:account-menu -- <spec.ts> <out.tsx>
```

The generated component intentionally does not contain business logic or data
binding. It exposes callback and controlled-state props so the screen can wire
navigation, persistence, theme/language state, and permissions later:

```ts
onItemSelect?: (key: string) => void;
switchValues?: Record<string, boolean>;
onSwitchChange?: (key: string, checked: boolean) => void;
submenuValues?: Record<string, string>;
onSubmenuChange?: (key: string, value: string) => void;
```

The output is scaffold-and-own. Keep the spec as the menu blueprint, generate
to a scratch path when changing the structure, and reconcile changes into the
owned component instead of overwriting screen-specific logic.

## Spec example

```ts
export default {
  componentName: 'GeneratedAccountMenuItems',
  groups: [
    {
      key: 'account',
      label: 'Tài khoản',
      items: [
        { kind: 'item', key: 'profile', label: 'Tài khoản', icon: 'UserRound' },
        {
          kind: 'item',
          key: 'organization',
          label: 'Tổ chức',
          icon: 'Building2',
          description: 'Công ty TNHH Vacom',
        },
      ],
    },
    {
      key: 'preferences',
      label: 'Tùy chọn',
      items: [
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
              assetAlt: 'Tiếng Việt',
            },
          ],
        },
        {
          kind: 'switch',
          key: 'desktopNotifications',
          label: 'Thông báo trên màn hình',
          icon: 'Bell',
        },
      ],
    },
  ],
} satisfies import('@/builders/account-menu').AccountMenuSpec;
```
