import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  MultiSelect,
  type MultiSelectOption,
} from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUSES,
} from '../model/employee';
import {
  EMPLOYEE_DEPARTMENT_LABELS,
  EMPLOYEE_DEPARTMENTS,
  type CreateEmployeeFormValues,
} from '../schemas/employee-create.schema';
import { CreateEmployeeStartDateField } from './create-employee-start-date-field';
import { EmployeeAvatarDropzone } from './employee-avatar-dropzone';
import { EmployeeSkillsField } from './employee-skills-field';

const roleOptions: MultiSelectOption[] = EMPLOYEE_ROLES.map((role) => ({
  value: role,
  label: EMPLOYEE_ROLE_LABELS[role],
  searchableText: EMPLOYEE_ROLE_LABELS[role],
  group: 'Vai trò',
}));

/** Dấu sao đỏ cho trường bắt buộc. */
function RequiredMark() {
  return <span className="text-destructive"> *</span>;
}

interface CreateEmployeeFieldsProps {
  avatar: File | null;
  onAvatarChange: (file: File | null) => void;
}

/** Toàn bộ các trường của form tạo nhân viên (thân cuộn của dialog). */
export function CreateEmployeeFields({
  avatar,
  onAvatarChange,
}: CreateEmployeeFieldsProps) {
  const form = useFormContext<CreateEmployeeFormValues>();

  return (
    <div className="space-y-5 px-6 py-5">
      <EmployeeAvatarDropzone file={avatar} onChange={onAvatarChange} />

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Họ và tên
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ và tên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên đăng nhập
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input placeholder="vd: nguyen_van_a" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="ten@congty.vn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="vd: 0901234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phòng ban
                <RequiredMark />
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMPLOYEE_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {EMPLOYEE_DEPARTMENT_LABELS[dept]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <CreateEmployeeStartDateField />
      </div>

      <FormField
        control={form.control}
        name="roles"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Vai trò
              <RequiredMark />
            </FormLabel>
            <FormControl>
              <MultiSelect
                value={field.value}
                onChange={field.onChange}
                options={roleOptions}
                maxChips={roleOptions.length}
                placeholder="Chọn vai trò"
                searchPlaceholder="Tìm vai trò..."
                emptyMessage="Không có vai trò phù hợp"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái ban đầu</FormLabel>
            <FormControl>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-x-6 gap-y-2"
              >
                {EMPLOYEE_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <RadioGroupItem value={status} />
                    {EMPLOYEE_STATUS_LABELS[status]}
                  </label>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giới thiệu</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Mô tả ngắn về vị trí, kinh nghiệm..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kỹ năng</FormLabel>
            <FormControl>
              <EmployeeSkillsField
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <FormLabel className="text-foreground">
          Tùy chọn cấp tài khoản
        </FormLabel>

        <FormField
          control={form.control}
          name="sendInvite"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal text-foreground">
                Gửi email mời kích hoạt tài khoản
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canLoginNow"
          render={({ field }) => (
            <FormItem className="flex-row items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal text-foreground">
                Cho phép đăng nhập ngay sau khi tạo
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
