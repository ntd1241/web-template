import type { FormSpec } from '@/builders/form';

const spec = {
  entity: 'Login',
  schemaImport: './login-form.schema',
  schemaName: 'loginFormSchema',
  valuesType: 'LoginFormValues',
  title: 'Đăng nhập',
  specPath: 'src/features/auth/forms/login.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'identifier',
      label: 'Tài khoản hoặc email',
      width: 'full',
      required: true,
      placeholder: 'admin hoặc email của bạn',
      inputType: 'text',
    },
    {
      kind: 'text',
      name: 'password',
      label: 'Mật khẩu',
      width: 'full',
      required: true,
      placeholder: 'Nhập mật khẩu',
      inputType: 'password',
    },
  ],
} satisfies FormSpec;

export default spec;
