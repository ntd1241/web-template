import { Building2, Folder, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { getTagGroupIcon } from './tag-group-icon';

describe('getTagGroupIcon', () => {
  it('uses module icons for system groups', () => {
    expect(getTagGroupIcon('organization', true)).toBe(Building2);
    expect(getTagGroupIcon('organization', true, 'employees')).toBe(Users);
  });

  it('keeps folder icon for custom groups', () => {
    expect(getTagGroupIcon(null, false)).toBe(Folder);
  });
});
