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

  it('thay thế param cho trang sửa vật tư', () => {
    expect(buildPath(ROUTES.EXAMPLE.MATERIAL_EDIT, { id: 'mat-1' })).toBe(
      '/example/materials/mat-1/edit',
    );
  });

  it('thay thế param cho trang sửa mẫu vật tư', () => {
    expect(
      buildPath(ROUTES.EXAMPLE.MATERIAL_MODEL_EDIT, { id: 'model-1' }),
    ).toBe('/example/materials/models/model-1/edit');
  });
});
