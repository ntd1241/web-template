import { describe, expect, it } from 'vitest';
import {
  countPermissions,
  getTagSummary,
  type PermissionModule,
} from './role-permission';

const module: PermissionModule = {
  code: 'system',
  name: 'Hệ thống',
  description: 'Quyền hệ thống',
  groups: [
    {
      name: 'Vai trò',
      permissions: [
        {
          code: 'roles:view',
          name: 'Xem vai trò',
          selected: true,
          tags: ['Xem'],
        },
        {
          code: 'roles:edit',
          name: 'Chỉnh sửa vai trò',
          selected: true,
          tags: ['Chỉnh sửa'],
        },
        {
          code: 'roles:permission-edit',
          name: 'Chỉnh sửa quyền của vai trò',
          selected: false,
          tags: ['Chỉnh sửa', 'Duyệt'],
          sensitive: true,
        },
      ],
    },
  ],
};

describe('role permission summary', () => {
  it('returns all when every permission for a tag is enabled', () => {
    expect(getTagSummary(module, 'Xem')).toBe('all');
  });

  it('returns partial when only some permissions for a tag are enabled', () => {
    expect(getTagSummary(module, 'Chỉnh sửa')).toBe('partial');
  });

  it('returns none when permissions exist for a tag but none are enabled', () => {
    expect(getTagSummary(module, 'Duyệt')).toBe('none');
  });

  it('returns na when the module has no permissions for a tag', () => {
    expect(getTagSummary(module, 'Xóa')).toBe('na');
  });

  it('counts selected, total, and sensitive permissions', () => {
    expect(countPermissions(module)).toEqual({
      selected: 2,
      total: 3,
      sensitiveSelected: 0,
      sensitiveTotal: 1,
    });
  });
});
