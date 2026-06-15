import { describe, expect, it } from 'vitest';
import { buildPath, ROUTES } from './routes';

describe('buildPath', () => {
  it('thay thế một param', () => {
    expect(buildPath(ROUTES.EXAMPLE.EMPLOYEE_DETAIL, { id: '42' })).toBe(
      '/example/employees/42',
    );
  });

  it('giữ nguyên path không có param', () => {
    expect(buildPath(ROUTES.EXAMPLE.EMPLOYEES, {})).toBe('/example/employees');
  });
});
